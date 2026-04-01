import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'QUATERNULI',
  description: 'A seed notebook for half-formed thoughts',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
