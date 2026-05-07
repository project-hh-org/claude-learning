import { getAllConfigSlugs, getConfigBySlug } from '@/lib/configs'
import ConfigDetail from '@/components/ConfigDetail'
import { notFound } from 'next/navigation'

export async function generateStaticParams() {
  return getAllConfigSlugs()
}

export async function generateMetadata({ params }) {
  const config = await getConfigBySlug(params.category, params.slug)
  if (!config) return {}
  return {
    title: config.title,
    description: config.description,
  }
}

export default async function ConfigPage({ params }) {
  const config = await getConfigBySlug(params.category, params.slug)
  if (!config) notFound()
  return <ConfigDetail config={config} />
}
