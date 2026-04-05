'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, X, Crown } from 'lucide-react';
import { useCollection } from '../context/CollectionContext';

export default function PasswordModal() {
  const { showPasswordModal, setShowPasswordModal, enterPassword } = useCollection();
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (showPasswordModal) {
      setPassword('');
      setError(false);
      setAttempts(0);
      setIsSuccess(false);
    }
  }, [showPasswordModal]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (enterPassword(password)) {
      setIsSuccess(true);
      setTimeout(() => {
        setShowPasswordModal(false);
      }, 1500);
    } else {
      setError(true);
      setAttempts(prev => prev + 1);
      setTimeout(() => setError(false), 500);

      if (attempts + 1 >= 3) {
        setTimeout(() => setShowPasswordModal(false), 500);
      }
    }
  };

  return (
    <AnimatePresence>
      {showPasswordModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowPasswordModal(false)}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Success Flash */}
          <AnimatePresence>
            {isSuccess && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 1.5 }}
                className="absolute inset-0 z-10 bg-yellow-400/30 pointer-events-none"
              />
            )}
          </AnimatePresence>

          {/* Modal Content */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{
              scale: 1,
              opacity: 1,
              y: 0,
              x: error ? [0, -10, 10, -10, 10, 0] : 0
            }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{
                x: { duration: 0.4, ease: "easeInOut" },
                default: { type: "spring", damping: 25, stiffness: 300 }
            }}
            className="relative w-full max-w-md bg-slate-900 border-2 border-yellow-500/30 rounded-3xl p-8 shadow-2xl overflow-hidden"
          >
            {/* Decorative Gold Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-yellow-500 blur-sm shadow-[0_0_20px_rgba(234,179,8,0.5)]" />

            <button
              onClick={() => setShowPasswordModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="flex flex-col items-center text-center space-y-6">
              <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center border border-yellow-500/20">
                {isSuccess ? (
                  <Crown className="w-8 h-8 text-yellow-400" />
                ) : (
                  <Lock className="w-8 h-8 text-yellow-400" />
                )}
              </div>

              <div>
                <h2 className="text-2xl font-bold text-white tracking-wider">SECRET CODE</h2>
                <p className="text-slate-400 mt-2">
                  Enter the secret code to unlock unlimited mode
                </p>
              </div>

              <form onSubmit={handleSubmit} className="w-full space-y-4">
                <div className="relative">
                  <input
                    type="password"
                    maxLength={4}
                    value={password}
                    onChange={(e) => setPassword(e.target.value.replace(/\D/g, ''))}
                    placeholder="••••"
                    autoFocus
                    className={`w-full bg-black/50 border-2 rounded-xl py-4 text-center text-3xl tracking-[1em] font-mono text-yellow-400 focus:outline-none transition-colors ${
                      error ? 'border-red-500' : 'border-yellow-500/20 focus:border-yellow-500/50'
                    }`}
                  />
                  {error && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-400 text-sm mt-2 font-medium"
                    >
                      Wrong code. Try again. ({3 - attempts} attempts left)
                    </motion.p>
                  )}
                  {isSuccess && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-yellow-400 text-sm mt-2 font-bold"
                    >
                      UNLIMITED MODE ACTIVATED!
                    </motion.p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={password.length !== 4 || isSuccess}
                  className="w-full bg-yellow-500 hover:bg-yellow-400 disabled:opacity-50 disabled:hover:bg-yellow-500 text-black font-bold py-4 rounded-xl transition-all shadow-lg shadow-yellow-500/20 active:scale-95"
                >
                  {isSuccess ? 'ACCESS GRANTED' : 'UNLOCK'}
                </button>
              </form>

              <p className="text-xs text-slate-500 uppercase tracking-widest">
                Confidential Authorization Required
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
