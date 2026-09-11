import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'EDU TECH Learning Platform',
  description: 'EDU TECH is a modern learning platform for Artificial Intelligence, Deep Learning, Machine Learning, Full Stack Development, SQL, and more.',
  applicationName: 'EDU TECH',
  keywords: ['EDU TECH', 'learning platform', 'Artificial Intelligence', 'Deep Learning', 'Machine Learning', 'Full Stack Development', 'SQL'],
  openGraph: {
    title: 'EDU TECH Learning Platform',
    description: 'Learn AI, Deep Learning, Machine Learning, Full Stack Development, SQL, and more with EDU TECH.',
    siteName: 'EDU TECH',
    type: 'website',
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
