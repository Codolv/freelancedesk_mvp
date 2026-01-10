'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-100 px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-md mx-auto"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-red-500 to-orange-600 rounded-full flex items-center justify-center text-white text-4xl font-bold"
        >
          500
        </motion.div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Etwas ist schiefgelaufen</h1>
        <p className="text-gray-60 mb-6">
          Es tut uns leid, aber auf unserer Seite ist etwas schiefgelaufen. Bitte versuchen Sie es erneut.
        </p>
        
        {error.message && (
          <details className="text-left bg-gray-100 p-4 rounded-lg mb-6 text-sm text-gray-700">
            <summary className="cursor-pointer font-medium">Fehlerdetails</summary>
            <pre className="mt-2 whitespace-pre-wrap break-words">{error.message}</pre>
            {error.digest && <div className="mt-2"><strong>Digest:</strong> {error.digest}</div>}
          </details>
        )}
        
        <div className="space-y-4">
          <div className="flex gap-3 justify-center">
            <Button 
              onClick={() => reset()} 
              size="lg"
              className="bg-blue-600 hover:bg-blue-700"
            >
              Erneut versuchen
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/">
                Zur Startseite
              </Link>
            </Button>
          </div>
          
          <div className="flex justify-center">
            <Button variant="outline" asChild>
              <Link href="/help">
                Support kontaktieren
              </Link>
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
