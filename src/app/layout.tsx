import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NavHeader } from "@/components/layout/NavHeader";
import { Toaster } from "@/components/common/Toaster";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "입찰 공고 분석기",
  description: "나라장터 입찰 공고문을 업로드해 핵심 정보를 정리하고 관리하는 도구",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-canvas-soft">
        <NavHeader />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
          {children}
        </main>
        <Toaster />
      </body>
    </html>
  );
}
