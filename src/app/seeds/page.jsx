import { getAllSeeds } from '@/lib/seeds'
import SeedList from '@/components/SeedList'

export const metadata = {
  title: 'Seeds',
  description: '새 프로젝트로 발전시킬 만한 씨앗 아이디어 모음',
}

export default function SeedsPage() {
  const seeds = getAllSeeds()
  return <SeedList seeds={seeds} />
}
