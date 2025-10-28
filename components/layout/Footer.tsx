"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full border-t border-border/40 bg-background/80 backdrop-blur-sm text-sm text-muted-foreground mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center py-4 px-6 gap-2">
        <p className="text-center sm:text-left">
          © {new Date().getFullYear()} FreelanceDesk. Alle Rechte vorbehalten.
        </p>

        <div className="flex items-center gap-4">
          <Link
            href="/impressum"
            className="hover:text-foreground transition-colors underline-offset-2 hover:underline"
          >
            Impressum
          </Link>
          <Link
            href="/datenschutz"
            className="hover:text-foreground transition-colors underline-offset-2 hover:underline"
          >
            Datenschutz
          </Link>
        </div>
      </div>
    </footer>
  );
}
