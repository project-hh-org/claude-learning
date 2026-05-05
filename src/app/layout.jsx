import './globals.css'

export const metadata = {
  title: '다희의 Learning Log',
  description: '개발하면서 배운 것들 — Claude, TypeScript, 생산성 도구',
  openGraph: {
    title: '다희의 Learning Log',
    description: '개발하면서 배운 것들',
    locale: 'ko_KR',
    type: 'website',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Pretendard+Variable:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.10.0/styles/github-dark.min.css"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
