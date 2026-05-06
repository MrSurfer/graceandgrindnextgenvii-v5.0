import type { Metadata } from "next";
import { Inter, Fira_Code } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const firaCode = Fira_Code({ subsets: ["latin"], variable: "--font-fira" });

export const metadata: Metadata = {
  title: {
    default: "GraceAndGrind | raising the next generation",
    template: "%s | GraceAndGrind"
  },
  description: "High-quality courses and resources to help you master the art of intentional parenting.",
  keywords: ["Parenting", "Childcare", "Family", "Education", "raising children"],
  authors: [{ name: "GraceAndGrind Team" }],
  creator: "GraceAndGrind",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://graceandgrind.com",
    title: "GraceAndGrind | raising the next generation",
    description: "High-quality courses and resources to help you master the art of intentional parenting.",
    siteName: "GraceAndGrind",
  },
  twitter: {
    card: "summary_large_image",
    title: "GraceAndGrind | raising the next generation",
    description: "High-quality courses and resources to help you master the art of intentional parenting.",
    creator: "@graceandgrind",
  },
  metadataBase: new URL("https://graceandgrind.com"),
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${firaCode.variable}`} suppressHydrationWarning>
      <body className="min-h-screen bg-gray-950 text-gray-100 font-sans antialiased flex flex-col">
        <Providers>
          <Navbar />
          <main className="flex-grow pt-16">
            {children}
          </main>
          <footer className="bg-gray-950 border-t border-gray-800/50 py-12">
            <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col md:flex-row justify-between items-center gap-6">
              <p className="text-gray-500 text-sm">© 2025 GraceAndGrind. All rights reserved.</p>
              <div className="flex gap-6 text-sm text-gray-500">
                <a href="/terms" className="hover:text-white transition-colors">Terms</a>
                <a href="/privacy" className="hover:text-white transition-colors">Privacy</a>
                <a href="/about" className="hover:text-white transition-colors">About</a>
              </div>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
