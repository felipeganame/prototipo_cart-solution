import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Analytics } from '@vercel/analytics/next'
import { WhatsAppFloat } from '@/components/whatsapp-float'
import './globals.css'

export const metadata: Metadata = {
  title: 'Pedi Solutions - Digitaliza tu negocio con códigos QR',
  description: 'Transforma tu negocio con nuestra plataforma de pedidos digitales. Códigos QR personalizados, integración WhatsApp y reportes en tiempo real. ¡Prueba gratis por un mes!',
  generator: 'v0.app',
  keywords: ['pedidos digitales', 'código QR', 'WhatsApp Business', 'digitalización', 'negocios', 'restaurantes', 'tiendas'],
  authors: [{ name: 'Pedi Solutions' }],
  creator: 'Pedi Solutions',
  publisher: 'Pedi Solutions',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-16.svg', sizes: '16x16', type: 'image/svg+xml' },
    ],
    shortcut: '/favicon.svg',
    apple: [
      { url: '/favicon.svg', sizes: '180x180', type: 'image/svg+xml' },
    ],
  },
  manifest: '/manifest.json',
  openGraph: {
    title: 'Pedi Solutions - Digitaliza tu negocio',
    description: 'Plataforma de pedidos digitales con códigos QR e integración WhatsApp',
    url: 'https://pedisolutions.com',
    siteName: 'Pedi Solutions',
    locale: 'es_AR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pedi Solutions - Digitaliza tu negocio',
    description: 'Plataforma de pedidos digitales con códigos QR e integración WhatsApp',
    creator: '@pedisolutions',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        {children}
        <WhatsAppFloat />
        <Analytics />
      </body>
    </html>
  )
}
