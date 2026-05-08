import { getAllSeedSlugs, getSeedBySlug } from '@/lib/seeds'
import SeedDetail from '@/components/detail/SeedDetail'
import { notFound } from 'next/navigation'

export async function generateStaticParams() {
  return getAllSeedSlugs()
}

export async function generateMetadata({ params }) {
  const seed = await getSeedBySlug(params.slug)
  if (!seed) return {}
  return {
    title: seed.title,
    description: seed.pitch || `새 프로젝트 씨앗: ${seed.title}`,
    keywords: seed.tags,
  }
}

export default async function SeedPage({ params }) {
  const seed = await getSeedBySlug(params.slug)
  if (!seed) notFound()
  return <SeedDetail seed={seed} />
}
