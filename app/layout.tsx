import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Form Builder',
  description: 'Typeform-inspired form builder',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full bg-[#080808] text-white antialiased">{children}</body>
    </html>
  )
}
