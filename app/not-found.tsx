'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
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
          className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-4xl font-bold"
        >
          404
        </motion.div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Seite nicht gefunden</h1>
        <p className="text-gray-60 mb-8">
          Entschuldigung, wir konnten die gesuchte Seite nicht finden. Sie wurde möglicherweise verschoben oder gelöscht.
        </p>
        
        <div className="space-y-4">
          <Button asChild size="lg" className="w-full max-w-xs">
            <Link href="/">
              Zur Startseite
            </Link>
          </Button>
          
          <div className="flex justify-center gap-4">
            <Button variant="outline" asChild>
              <Link href="/dashboard">
                Dashboard
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
