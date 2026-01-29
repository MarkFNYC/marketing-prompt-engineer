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
    <html lang="en">
      <body className={`${inter.className} bg-[#0D0D0D] text-white min-h-screen`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
