import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { Toaster } from 'sonner'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'DateOnBase | Mint Your Special Day on Base',
  description: 'Own your special dates as NFTs on Base. Mint birthdays, anniversaries, and memorable moments as unique digital collectibles on the blockchain.',
  keywords: ['NFT', 'Base', 'Blockchain', 'Date NFT', 'Digital Collectibles', 'Web3'],
  authors: [{ name: 'DateOnBase' }],
  openGraph: {
    title: 'DateOnBase | Mint Your Special Day on Base',
    description: 'Own your special dates as NFTs on Base. Mint birthdays, anniversaries, and memorable moments as unique digital collectibles on the blockchain.',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'DateOnBase - Own Your Special Day on the Blockchain',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DateOnBase | Mint Your Special Day on Base',
    description: 'Own your special dates as NFTs on Base. Mint birthdays, anniversaries, and memorable moments as unique digital collectibles on the blockchain.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
  verification: {
    google: 'your-google-site-verification', // We'll add this later
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          {children}
          <Toaster position="top-center" />
        </Providers>
      </body>
    </html>
  )
} 