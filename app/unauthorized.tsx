'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
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
          className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-gray-500 to-gray-600 rounded-full flex items-center justify-center text-white text-4xl font-bold"
        >
          401
        </motion.div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Zugriff verweigert</h1>
        <p className="text-gray-60 mb-8">
          Sie haben keine Berechtigung, auf diese Seite zuzugreifen. Bitte melden Sie sich an oder wenden Sie sich an Ihren Administrator.
        </p>
        
        <div className="space-y-4">
          <Button asChild size="lg" className="w-full max-w-xs">
            <Link href="/signin">
              Anmelden
            </Link>
          </Button>
          
          <div className="flex justify-center gap-4">
            <Button variant="outline" asChild>
              <Link href="/">
                Zur Startseite
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/help">
                Hilfe
              </Link>
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
