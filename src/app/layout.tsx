import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Graph Generator | Create Beautiful Diagrams with AI",
  description: "Create stunning diagrams and flowcharts with AI assistance. Generate, edit, and export high-quality graphs effortlessly.",
  keywords: "graph generator, AI diagrams, flowcharts, mermaid syntax, data visualization",
  authors: [{ name: "Ali Hamza Kamboh", url: "https://alihamzakamboh.com/" }],
  creator: "Ali Hamza Kamboh",
  publisher: "Ali Hamza Kamboh",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://text-to-graph.vercel.app",
    title: "Graph Generator | Create Beautiful Diagrams with AI",
    description: "Create stunning diagrams and flowcharts with AI assistance. Generate, edit, and export high-quality graphs effortlessly.",
    siteName: "Graph Generator",
    images: [
      {
        url: "https://avatars.githubusercontent.com/u/123060177?v=4",
        width: 1200,
        height: 630,
        alt: "Graph Generator Preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Graph Generator | Create Beautiful Diagrams with AI",
    description: "Create stunning diagrams and flowcharts with AI assistance. Generate, edit, and export high-quality graphs effortlessly.",
    creator: "@your_twitter_handle",
    images: ["https://avatars.githubusercontent.com/u/123060177?v=4"],
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
