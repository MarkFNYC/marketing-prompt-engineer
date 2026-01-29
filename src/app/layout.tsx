import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Amplify — AI-powered marketing',
  description: 'Your virtual agency room. Start with strategy, not channels. Planning → Creative → Results.',
  keywords: ['AI marketing', 'marketing strategy', 'creative brief', 'content generation', 'brand strategy', 'marketing planning'],
  authors: [{ name: 'Fabrica Collective', url: 'https://fabricacollective.com' }],
  openGraph: {
    title: 'Amplify — AI-powered marketing',
    description: 'Your AI marketing team in a browser — from strategy to send',
    url: 'https://amplify.fabricacollective.com',
    siteName: 'Amplify',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Amplify — AI-powered marketing',
    description: 'Your AI marketing team in a browser — from strategy to send',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      style={{
        backgroundColor: '#0D0D0D',
        backgroundImage: `
          url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E"),
          repeating-linear-gradient(-3deg, transparent, transparent 80px, rgba(255, 0, 102, 0.02) 80px, rgba(255, 0, 102, 0.02) 81px)
        `,
      }}
    >
      <body className={`${inter.className} text-white min-h-screen`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
