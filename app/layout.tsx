import type { Metadata } from "next";
import "./globals.css";
import NextTopLoader from 'nextjs-toploader';

export const metadata: Metadata = {
  title: "Scipo - Science Exploration Through Creative Coding",
  description: "Scipo - Science Exploration Through Creative Coding",
  icons: {
    icon: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <NextTopLoader showSpinner={false} />
        {children}
      </body>
    </html>
  );
}
