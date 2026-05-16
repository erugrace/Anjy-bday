import type { Metadata } from 'next'
import { Syne, Outfit, Libre_Baskerville } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const syne = Syne({ 
  subsets: ["latin"],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-syne'
});

const outfit = Outfit({ 
  subsets: ["latin"],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-outfit'
});

const libreBaskerville = Libre_Baskerville({
  subsets: ["latin"],
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  variable: '--font-libre'
});

export const metadata: Metadata = {
  title: "Anjola's 19th Birthday",
  description: 'A celebration for Anjolaoluwa turning 19',
  generator: 'v0.app',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="bg-background">
      <body className={`${syne.variable} ${outfit.variable} ${libreBaskerville.variable} font-sans antialiased`}>
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
