import { getAllConceptSlugs, getConceptBySlug } from '@/lib/concepts'
import ConceptDetail from '@/components/detail/ConceptDetail'
import { notFound } from 'next/navigation'

const SITE_URL = 'https://claude-learning.project-hh.com'

export async function generateStaticParams() {
  return getAllConceptSlugs()
}

export async function generateMetadata({ params }) {
  const concept = await getConceptBySlug(params.slug)
  if (!concept) return {}
  return {
    title: concept.title,
    description: `개념 노트: ${concept.title}`,
    keywords: concept.tags,
  }
}

export default async function ConceptPage({ params }) {
  const concept = await getConceptBySlug(params.slug)
  if (!concept) notFound()

  return <ConceptDetail concept={concept} />
}
