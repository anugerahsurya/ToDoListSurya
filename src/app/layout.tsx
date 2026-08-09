import type { Metadata } from 'next';
import { Providers } from '@/components/Providers';
import '@/app/globals.css';

export const metadata: Metadata = {
  title: 'Aplikasi Manajemen Kegiatan',
  description: 'Kelola kegiatan dan progres pekerjaan Anda dengan mudah dan efisien.',
  keywords: ['to do list', 'manajemen kegiatan', 'produktivitas', 'task manager'],
  authors: [{ name: 'BPS' }],
  viewport: 'width=device-width, initial-scale=1, viewport-fit=cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#636B2F' },
    { media: '(prefers-color-scheme: dark)', color: '#3D4127' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
