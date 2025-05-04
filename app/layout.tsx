// Update the head section of your layout file to include favicon references

import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AI Alpha SUI',
  description: 'AI Crypto Agents Web3 Platform',
  // icons: {
  //   icon: [
  //     { url: '/favicon.ico', sizes: 'any' },
  //     { url: '/favicon-16x16.png', type: 'image/png', sizes: '16x16' },
  //     { url: '/favicon-32x32.png', type: 'image/png', sizes: '32x32' }
  //   ],
  //   apple: { url: '/apple-touch-icon.png', type: 'image/png', sizes: '180x180' },
  //   other: [
  //     { url: '/android-chrome-192x192.png', type: 'image/png', sizes: '192x192' },
  //     { url: '/android-chrome-512x512.png', type: 'image/png', sizes: '512x512' }
  //   ]
  // },
  icons: {
    icon: '/logo.png', // Use your logo directly as the icon
  },
  manifest: '/site.webmanifest',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}