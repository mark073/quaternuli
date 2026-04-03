import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'QUATERNULI',
  description: 'A seed notebook for half-formed thoughts',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
