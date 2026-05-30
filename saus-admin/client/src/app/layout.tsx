import type { Metadata } from 'next';
import { Toaster } from 'react-hot-toast';
import './globals.css';

export const metadata: Metadata = {
  title: 'SAUS CMS — Admin Dashboard',
  description: 'South African Union of Students — Content Management System',
  robots: 'noindex, nofollow',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
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
