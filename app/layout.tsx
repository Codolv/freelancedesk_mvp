import "./globals.css";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body className="flex flex-col min-h-screen bg-background text-foreground">
        <main className="flex flex-1 items-center justify-center px6">
          {children}
        </main>
      </body>
    </html>
  );
}
