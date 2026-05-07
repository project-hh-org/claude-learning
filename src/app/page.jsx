// Server Component — 빌드 시 entries/*.md 직접 읽음
import { getAllPosts } from '@/lib/posts'
import { getAllConfigs } from '@/lib/configs'
import PostList from '@/components/PostList'

export default function HomePage() {
  const posts = getAllPosts()
  const configs = getAllConfigs()
  return <PostList posts={posts} configs={configs} />
}
