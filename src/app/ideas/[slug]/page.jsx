import { getAllIdeaSlugs, getIdeaBySlug } from '@/lib/ideas'
import IdeaDetail from '@/components/IdeaDetail'
import { notFound } from 'next/navigation'

export async function generateStaticParams() {
  return getAllIdeaSlugs()
}

export async function generateMetadata({ params }) {
  const idea = await getIdeaBySlug(params.slug)
  if (!idea) return {}
  return {
    title: idea.title,
    description: `아이디어 메모: ${idea.title}`,
    keywords: idea.tags,
  }
}

export default async function IdeaPage({ params }) {
  const idea = await getIdeaBySlug(params.slug)
  if (!idea) notFound()
  return <IdeaDetail idea={idea} />
}
