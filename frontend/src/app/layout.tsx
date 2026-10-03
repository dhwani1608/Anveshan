import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FloatingAssistant } from "@/components/FloatingAssistant";

export const metadata: Metadata = {
  title: "Pandit Deendayal Energy University (PDEU) | Top University in Gujarat",
  description: "Official portal of Pandit Deendayal Energy University (PDEU, formerly PDPU), Gandhinagar. Featuring Anveshan connected organizational knowledge layer.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-800 min-h-screen flex flex-col font-sans selection:bg-[#e87722] selection:text-white antialiased">
        <AuthProvider>
          <Header />
          <main className="flex-1 flex flex-col">
            {children}
          </main>
          <Footer />
          <FloatingAssistant />
        </AuthProvider>
      </body>
    </html>
  );
}
