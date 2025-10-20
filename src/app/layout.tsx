import type { Metadata } from 'next'
import React from 'react'

export const metadata: Metadata = {
  title: 'Aurin CMS',
  description: 'Content Management System for Aurin',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
