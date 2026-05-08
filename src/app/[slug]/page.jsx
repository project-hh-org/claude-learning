// Server Component — 개별 포스트 페이지 (SSG)
import { getAllSlugs, getPostBySlug } from '@/lib/posts'
import PostDetail from '@/components/detail/PostDetail'
import { notFound } from 'next/navigation'

const SITE_URL = 'https://claude-learning.project-hh.com'

// SSG: 빌드 시 모든 슬러그에 대한 정적 페이지 생성
export async function generateStaticParams() {
  return getAllSlugs()
}

export async function generateMetadata({ params }) {
  const post = await getPostBySlug(params.slug)
  if (!post) return {}

  const url = `${SITE_URL}/${params.slug}/`

  return {
    title: post.title, // layout의 template: "%s | 다희의 Learning Log" 적용됨
    description: post.summary,
    keywords: post.tags,
    openGraph: {
      type: 'article',
      url,
      title: post.title,
      description: post.summary,
      publishedTime: post.date,
      tags: post.tags,
      locale: 'ko_KR',
      siteName: '다희의 Learning Log',
      images: [{ url: '/og-image.png', width: 1200, height: 630, alt: post.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.summary,
      images: ['/og-image.png'],
    },
    alternates: {
      canonical: url,
    },
  }
}

export default async function PostPage({ params }) {
  const post = await getPostBySlug(params.slug)
  if (!post) notFound()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.summary,
    datePublished: post.date,
    url: `${SITE_URL}/${params.slug}/`,
    author: { '@type': 'Person', name: '다희' },
    keywords: post.tags?.join(', '),
    inLanguage: 'ko',
    publisher: { '@type': 'Person', name: '다희' },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PostDetail post={post} />
    </>
  )
}
