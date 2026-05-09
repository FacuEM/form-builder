import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Form Builder',
  description: 'Create and share beautiful forms',
}

export default function RootPage() {
  redirect('/dashboard')
}
