import './globals.css'

export const metadata = {
  title: 'Cisraoupa — Drop Your Problem. Get Roasted. Get Fixed.',
  description: 'The AI that destroys your excuses and fixes your life in 3 savage rounds.',
  openGraph: {
    title: 'Cisraoupa roasted me 💀',
    description: 'I got a score and it was BRUTAL. Your turn.',
    url: 'https://cisraoupa.com',
    siteName: 'Cisraoupa',
    images: [{ url: '/og.png', width: 1200, height: 630 }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cisraoupa roasted me 💀',
    description: 'I got a score and it was BRUTAL. Your turn.',
    images: ['/og.png'],
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>{children}</body>
    </html>
  )
}
