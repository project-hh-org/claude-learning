/** @type {import('next').NextConfig} */
const nextConfig = {
  // S3 정적 호스팅용 — next build 시 out/ 폴더에 정적 파일 생성
  output: 'export',
  // S3에서 trailing slash 없이도 동작하게
  trailingSlash: true,
  // Image optimization은 서버가 필요해서 SSG에서 비활성화
  images: { unoptimized: true },
}

export default nextConfig
