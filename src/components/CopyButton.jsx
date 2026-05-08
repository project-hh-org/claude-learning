'use client'

import { useState } from 'react'

/**
 * CopyButton — 텍스트를 클립보드에 복사하는 버튼.
 *
 *   <CopyButton text={prompt} label="📋 프롬프트 복사" copiedLabel="✓ 복사됨" />
 *
 * navigator.clipboard 미지원 환경(http, 권한 거부)에서는 textarea fallback.
 *
 * @param text         복사할 텍스트
 * @param label        기본 라벨
 * @param copiedLabel  복사 직후 일시 표시 라벨 (기본 '✓ 복사됨')
 * @param className    추가 className (variant 적용용)
 * @param resetMs      복사 표시 유지 시간 ms (기본 1800)
 */
export default function CopyButton({
  text,
  label = '📋 복사',
  copiedLabel = '✓ 복사됨',
  className = '',
  resetMs = 1800,
}) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    if (!text) return
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = text
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), resetMs)
  }

  return (
    <button
      onClick={handleCopy}
      className={`copy-btn ${copied ? 'is-copied' : ''} ${className}`}
      type="button"
    >
      {copied ? copiedLabel : label}
    </button>
  )
}
