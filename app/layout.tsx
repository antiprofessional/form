import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Coinbase – Apply your Coinbase Cards',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
