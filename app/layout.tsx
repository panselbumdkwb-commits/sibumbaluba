import type { Metadata, ReactNode } from 'next'
import { ThemeProvider } from 'next-themes'
import { Toaster } from 'sonner'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'SIMBUBALADA – Kota Batu',
    template: '%s | SIMBUBALADA Kota Batu',
  },
  description:
    'Sistem Informasi Monitoring, Evaluasi, Pembinaan, Pengelolaan dan Seleksi BUMD-BLUD Kota Batu',
  keywords: ['BUMD', 'BLUD', 'Kota Batu', 'monitoring', 'evaluasi', 'seleksi'],
  authors: [{ name: 'Pemerintah Kota Batu' }],
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    title: 'SIMBUBALADA – Kota Batu',
    description:
      'Sistem Informasi Monitoring, Evaluasi, Pembinaan, Pengelolaan dan Seleksi BUMD-BLUD Kota Batu',
  },
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster position="top-right" richColors closeButton />
        </ThemeProvider>
      </body>
    </html>
  )
}
