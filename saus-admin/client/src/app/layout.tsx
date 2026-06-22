import type { Metadata } from 'next';
import { EB_Garamond, Source_Sans_3, Source_Code_Pro } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import './globals.css';

const serif = EB_Garamond({ subsets: ['latin'], weight: ['500', '600', '700'], variable: '--font-serif', display: 'swap' });
const sans  = Source_Sans_3({ subsets: ['latin'], weight: ['400', '600', '700'], variable: '--font-sans', display: 'swap' });
const mono  = Source_Code_Pro({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-mono', display: 'swap' });

export const metadata: Metadata = {
  title: 'SAUS CMS — Admin Dashboard',
  description: 'South African Union of Students — Content Management System',
  robots: 'noindex, nofollow',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable} ${mono.variable}`}>
      <body>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#0A1628',
              color: '#fff',
              fontSize: '14px',
              borderRadius: '6px',
              border: '1px solid rgba(255,255,255,.1)',
            },
            success: { iconTheme: { primary: '#00692F', secondary: '#fff' } },
            error:   { iconTheme: { primary: '#A8200D', secondary: '#fff' } },
          }}
        />
      </body>
    </html>
  );
}
