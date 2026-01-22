import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Amplify — AI-powered marketing',
  description: 'Your AI marketing team in a browser — from strategy to send. 90 expert prompts across 9 disciplines, personalized to your brand.',
  keywords: ['AI marketing', 'marketing prompts', 'content generation', 'SEO', 'social media', 'email marketing'],
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
      <body className={`${inter.className} bg-slate-900 text-white min-h-screen`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
