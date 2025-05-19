import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';
import { AppProviders } from '@/providers/AppProviders';

const geistSans = GeistSans; // Direct usage as per new Geist examples
const geistMono = GeistMono;

export const metadata: Metadata = {
  title: 'TaskZen',
  description: 'Focus on what matters.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
        <AppProviders>
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
