import type { Metadata } from 'next';
import './globals.css';
import ReduxProvider from '../components/ReduxProvider';

export const metadata: Metadata = {
  title: 'Quantum Vault | Next-Gen Digital Banking',
  description: 'Experience secure, premium, real-time glassmorphic digital banking. Managed cards, automated transfers, utility payments, and spending analytics.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ReduxProvider>
          {children}
        </ReduxProvider>
      </body>
    </html>
  );
}
