'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { motion } from 'framer-motion';

export default function Navbar() {
  const { school, isAuthenticated, logout } = useAuth();

  return (
    <nav className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white p-4 shadow-md border-b border-gray-800 sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-600 flex items-center">
          <motion.div
            className="mr-2"
            initial={{ rotate: 0 }}
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </motion.div>
          WastEd
        </Link>
        <div className="space-x-4">
          {isAuthenticated ? (
            <>
              <motion.span 
                className="mr-4 text-gray-300 border-l-2 border-emerald-500 pl-2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                {school?.username}
              </motion.span>
              <Link href={`/dashboard/school/${school?.id}`} className="text-emerald-400 hover:underline">
                Dashboard
              </Link>
              <motion.button
                onClick={logout}
                className="bg-gray-800 text-emerald-500 px-4 py-2 rounded-md hover:bg-gray-700 border border-gray-700"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Logout
              </motion.button>
            </>
          ) : (
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link 
                href="/auth/register" 
                className="bg-gradient-to-r from-emerald-700 to-green-600 text-white px-4 py-2 rounded-md hover:from-emerald-600 hover:to-green-500"
              >
                Register School
              </Link>
            </motion.div>
          )}
        </div>
      </div>
    </nav>
  );
} 