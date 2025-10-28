import "./globals.css";
import Footer from "@/components/layout/Footer"

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body className="flex flex-col min-h-screen bg-background text-foreground">
        <main className="flex-1 w-full max-w-7xl mx-auto px-6">
          {children}
        </main>
        <Footer />
      </body>
      
    </html>
  );
}
