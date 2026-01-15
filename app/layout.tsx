import type { Metadata } from "next";
import { Geist, Geist_Mono, Poppins } from "next/font/google";
import { AuthProvider } from "@/lib/auth-context";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL('https://www.aeon-academy.com'),
  title: {
    default: 'AEON - Premier English Learning Platform',
    template: '%s | AEON Academy',
  },
  description: 'Connect with expert English teachers for personalized one-on-one lessons. AEON Academy offers comprehensive learning resources, flexible scheduling, and verified professional tutors.',
  keywords: ['English learning', 'online tutoring', 'ESL', 'language learning', 'English teachers', 'one-on-one lessons', 'AEON Academy'],
  authors: [{ name: 'AEON Academy' }],
  creator: 'AEON Academy',
  publisher: 'AEON Academy',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.aeon-academy.com',
    title: 'AEON - Premier English Learning Platform',
    description: 'Master English with verified experts. Personalized lessons, flexible scheduling, and a supportive community.',
    siteName: 'AEON Academy',
    images: [
      {
        url: '/og-image.png', // We should ensure this exists or use a default
        width: 1200,
        height: 630,
        alt: 'AEON Academy Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AEON - Premier English Learning Platform',
    description: 'Master English with verified experts. Personalized lessons, flexible scheduling.',
    images: ['/og-image.png'],
    creator: '@aeonacademy',
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${poppins.variable} antialiased bg-[#f5ebe3] text-[black]`}
        suppressHydrationWarning
      >
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
