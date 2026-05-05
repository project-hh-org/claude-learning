// Server Component — 개별 포스트 페이지 (SSG)
import { getAllSlugs, getPostBySlug } from '@/lib/posts'
import PostDetail from '@/components/PostDetail'
import { notFound } from 'next/navigation'

// SSG: 빌드 시 모든 슬러그에 대한 정적 페이지 생성
export async function generateStaticParams() {
  return getAllSlugs()
}

export async function generateMetadata({ params }) {
  const post = await getPostBySlug(params.slug)
  if (!post) return {}
  return {
    title: `${post.title} | 다희의 Learning Log`,
    description: post.summary,
  }
}

export default async function PostPage({ params }) {
  const post = await getPostBySlug(params.slug)
  if (!post) notFound()
  return <PostDetail post={post} />
}
