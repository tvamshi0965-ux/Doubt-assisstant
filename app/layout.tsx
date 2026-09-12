import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'EDUTECH Learning Platform',
  description: 'EDUTECH Learning Platform helps students learn Artificial Intelligence, Deep Learning, Machine Learning, Full Stack Development, SQL, and more.',
  applicationName: 'EDUTECH Learning Platform',
  keywords: ['EDUTECH Learning Platform', 'EDUTECH', 'learning platform', 'online courses', 'Artificial Intelligence', 'Deep Learning', 'Machine Learning', 'Full Stack Development', 'SQL'],
  openGraph: {
    title: 'EDUTECH Learning Platform',
    description: 'Learn Artificial Intelligence, Deep Learning, Machine Learning, Full Stack Development, SQL, and more with EDUTECH.',
    siteName: 'EDUTECH Learning Platform',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'EDUTECH Learning Platform',
    description: 'A modern learning platform for students and lifelong learners.',
  },
  generator: 'v0.app',
  icons: {
    icon: [{ url: '/edu-tech-icon.svg', type: 'image/svg+xml' }],
    shortcut: '/edu-tech-icon.svg',
    apple: '/edu-tech-icon.svg',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
