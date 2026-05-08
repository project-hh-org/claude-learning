// Server Component — 빌드 시 entries/*.md 직접 읽음
import { getAllPosts } from '@/lib/posts'
import PostList from '@/components/PostList'

export default function HomePage() {
  const posts = getAllPosts()
  return <PostList posts={posts} />
}
