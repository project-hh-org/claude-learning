import { getAllIdeas } from '@/lib/ideas'
import IdeaList from '@/components/IdeaList'

export const metadata = {
  title: 'Ideas',
  description: 'thinking 중에 떠오른 메모와 만들어볼만한 것들',
}

export default function IdeasPage() {
  const ideas = getAllIdeas()
  return <IdeaList ideas={ideas} />
}
