// app/layout.tsx
import './globals.css';
import { ReactNode } from 'react';
import Providers from './providers';

export const metadata = {
  title: 'chatGPT-Clone!',
  description: 'A AI Model which bases on LLMs',
};    

export default function RootLayout({ children }:any) {
  return (
    <html lang="en">
      <head>
        {/* Font Awesome */}
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
          integrity="sha512-yXzj+rJ6s3F6l1qV0Wm3xMjvq1Qg+bW1EczKEy2Hg5sD0uQwRdpn9Q6BLGb3xA4OJ0q+JTx1j/zUV8N2XxSA=="
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
        {/* Devicon */}
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/devicon@2.14.0/devicon.min.css"
        />
      </head>
      <body className="bg-gray-50 text-gray-900">
         <Providers>{children}</Providers>
       
      </body>
    </html>
  );
}
