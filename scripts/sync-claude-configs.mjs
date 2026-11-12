#!/usr/bin/env node
// =============================================================
// sync-claude-configs.mjs
//
// configs/sync.json에 적힌 ~/.claude 설정만 configs/<category>/로 복사한다.
// 원본(~/.claude, 실체는 iCloud dotfiles 백업)은 건드리지 않는 한 방향 파생본이다.
// 복사본을 레포에서 직접 고치지 않는다 — 다음 동기화 때 원본으로 덮인다.
//
// - 내용이 같으면 건너뛴다 (Stop hook마다 돌아도 가볍다)
// - 복사 전 scripts/public-scan.sh로 검사, 걸리면 복사하지 않고 로그만 남긴다
// - 목록에서 뺀 항목만 configs/의 복사본을 지운다. 원본이 안 보여도 지우지 않는다
//   (configs/.sync-manifest.json으로 추적,
//   레포에서 직접 만든 config는 매니페스트에 없으므로 건드리지 않는다)
// - 원본이 이미 configs/를 가리키는 링크면(예: capture 스킬) 건너뛴다
//
// 실행: node scripts/sync-claude-configs.mjs         (Stop hook으로 등록됨)
//       node scripts/sync-claude-configs.mjs --dry   (무엇을 할지 출력만)
// 로그: ~/.claude/learning-capture/config-sync.log
// =============================================================

import fs from 'fs'
import path from 'path'
import os from 'os'
import { execFileSync } from 'child_process'
import { fileURLToPath } from 'url'

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const CONFIGS = path.join(REPO, 'configs')
const SOURCE = process.env.CLAUDE_CONFIG_SOURCE || path.join(os.homedir(), '.claude')
const MANIFEST = path.join(CONFIGS, '.sync-manifest.json')
const LOG = path.join(os.homedir(), '.claude', 'learning-capture', 'config-sync.log')
const DRY = process.argv.includes('--dry')

// 카테고리별 원본 위치 규칙 — skills만 폴더 단위
const LAYOUT = {
  rules:    name => `${name}.md`,
  agents:   name => `${name}.md`,
  commands: name => `${name}.md`,
  hooks:    name => `${name}.sh`,
  skills:   name => name,
}

const log = msg => {
  if (DRY) return console.log(msg)
  fs.mkdirSync(path.dirname(LOG), { recursive: true })
  fs.appendFileSync(LOG, `[${new Date().toISOString()}] ${msg}\n`)
}

// 깨진 심볼릭 링크 등 stat이 안 되는 항목은 건너뛴다 (예외로 hook 전체가 멈추지 않게)
const isFile = f => { try { return fs.statSync(f).isFile() } catch { return false } }
const filesUnder = p => fs.statSync(p).isDirectory()
  ? fs.readdirSync(p, { recursive: true }).map(f => path.join(p, f)).filter(isFile)
  : [p]

// configs/ 밖을 가리키는 경로(sync.json·매니페스트에 `..` 등)는 거부
const insideConfigs = p => {
  const rel = path.relative(CONFIGS, p)
  return rel && !rel.startsWith('..') && !path.isAbsolute(rel)
}

// 경로 하나(파일 또는 폴더)의 내용을 비교용 문자열로
const snapshot = p => fs.existsSync(p)
  ? filesUnder(p).map(f => path.relative(p, f) + '\0' + fs.readFileSync(f, 'utf-8')).sort().join('\0\0')
  : null

function publicScan(p) {
  try {
    execFileSync('bash', [path.join(REPO, 'scripts/public-scan.sh'), ...filesUnder(p)], { encoding: 'utf-8' })
    return null
  } catch (e) {
    return (e.stdout || e.message).trim()
  }
}

const allow = JSON.parse(fs.readFileSync(path.join(CONFIGS, 'sync.json'), 'utf-8'))
const prev = fs.existsSync(MANIFEST) ? JSON.parse(fs.readFileSync(MANIFEST, 'utf-8')) : []
const next = []
let changed = 0

for (const [category, toPath] of Object.entries(LAYOUT)) {
  for (const name of allow[category] || []) {
    const rel = path.join(category, toPath(name))
    const src = path.join(SOURCE, rel)
    const dst = path.join(CONFIGS, rel)

    if (!insideConfigs(dst)) { log(`configs/ 밖 경로 — 거부: ${rel}`); continue }
    if (!fs.existsSync(src)) {
      // iCloud가 잠시 안 보이는 경우 등 — 복사본은 지우지 않는다 (삭제는 목록에서 뺄 때만)
      if (prev.includes(rel)) next.push(rel)
      log(`원본 없음 — skip, 복사본 유지: ${rel}`)
      continue
    }
    if (fs.realpathSync(src).startsWith(fs.realpathSync(CONFIGS) + path.sep)) {
      // 원본이 configs를 가리키는 링크다. 레포 소유(capture 스킬 등)면 대상이 아니고,
      // 예전에 복사한 항목이면 원본이 링크로 바뀐 이상 상태 — 복사본을 지우지 않고 알린다.
      if (prev.includes(rel)) {
        next.push(rel)
        log(`⚠️ 원본이 configs를 가리키는 링크로 바뀜 — 동기화 중단, 복사본 유지: ${rel}`)
      }
      continue
    }

    next.push(rel)
    if (snapshot(src) === snapshot(dst)) continue

    const hits = publicScan(src)
    if (hits) { log(`공개 검사에 걸려 복사 안 함: ${rel}\n${hits}`); continue }

    log(`복사: ${rel}`)
    changed++
    if (DRY) continue
    // 임시 경로에 다 복사한 뒤 바꿔치기 — 중간에 죽어도 복사본이 사라진 채로 남지 않게
    const tmp = path.join(path.dirname(dst), `.sync-tmp-${path.basename(dst)}`)
    fs.rmSync(tmp, { recursive: true, force: true })
    fs.mkdirSync(path.dirname(dst), { recursive: true })
    fs.cpSync(src, tmp, { recursive: true, dereference: true })
    fs.rmSync(dst, { recursive: true, force: true })
    fs.renameSync(tmp, dst)
  }
}

// 목록에서 빠진 복사본 정리
for (const rel of prev) {
  if (next.includes(rel)) continue
  const dst = path.join(CONFIGS, rel)
  if (!insideConfigs(dst)) { log(`configs/ 밖 경로 — 삭제 거부: ${rel}`); continue }
  log(`목록에서 빠짐 — 삭제: ${rel}`)
  changed++
  if (!DRY) fs.rmSync(dst, { recursive: true, force: true })
}

if (!DRY && JSON.stringify(prev) !== JSON.stringify(next)) {
  fs.writeFileSync(MANIFEST, JSON.stringify(next, null, 2) + '\n')
}

// 공개 검사 차단어 목록을 iCloud 백업에 사본으로 둔다 (새 기기 bootstrap이 여기서 가져감).
// 원본은 로컬 실파일이어야 한다 — launchd 워처는 iCloud 경로를 읽지 못한다.
const DENY_LOCAL = path.join(os.homedir(), '.claude', 'learning-capture', 'public-denylist.txt')
const ICLOUD_BACKUP = path.join(os.homedir(), 'Library/Mobile Documents/com~apple~CloudDocs/claude/claude-code-home-backup')
const DENY_BACKUP = path.join(ICLOUD_BACKUP, 'learning-capture', 'public-denylist.txt')
// 내용(주석·빈 줄 제외)이 없는 로컬 목록은 올리지 않는다 — 새 기기의 빈 양식이 실제 백업을 덮어쓰지 않게
const hasEntries = buf => buf.toString('utf-8').split('\n').some(l => l.replace(/#.*/, '').trim())
try {
  const localIsFile = fs.existsSync(DENY_LOCAL) && fs.lstatSync(DENY_LOCAL).isFile()
  if (!DRY && localIsFile && fs.existsSync(ICLOUD_BACKUP)) {
    const local = fs.readFileSync(DENY_LOCAL)
    const backup = fs.existsSync(DENY_BACKUP) ? fs.readFileSync(DENY_BACKUP) : null
    if (hasEntries(local) && (!backup || !local.equals(backup))) {
      fs.mkdirSync(path.dirname(DENY_BACKUP), { recursive: true })
      fs.writeFileSync(DENY_BACKUP, local)
      log('차단어 목록 iCloud 백업 갱신')
    }
  }
} catch (e) {
  log(`차단어 목록 백업 실패: ${e.message}`)
}
if (DRY) console.log(`변경 ${changed}건`)
