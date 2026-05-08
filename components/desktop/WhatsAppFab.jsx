'use client';

import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';

const WA_NUMBER = '34632459468';

export default function WhatsAppFab({ lang }) {
  const text = encodeURIComponent(
    lang === 'es' ? 'Hola Carlos, te escribo desde tu web TechOps.' : 'Hi Carlos, writing from your TechOps website.',
  );
  const label = lang === 'es' ? 'Escríbeme por WhatsApp' : 'Message me on WhatsApp';
  return (
    <motion.a
      href={`https://wa.me/${WA_NUMBER}?text=${text}`}
      target="_blank"
      rel="noreferrer"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, type: 'spring', stiffness: 240, damping: 22 }}
      className="fixed bottom-5 right-5 z-50 group flex items-center gap-2 pl-3 pr-4 py-3 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-sm shadow-[0_15px_40px_-10px_rgba(16,185,129,0.7)] border border-emerald-300/40"
      aria-label={label}
    >
      <span className="relative inline-flex items-center justify-center w-8 h-8 rounded-full bg-white/20">
        <MessageCircle className="w-5 h-5" />
        <span className="absolute inset-0 rounded-full animate-ping bg-emerald-300/40" />
      </span>
      <span className="max-w-0 overflow-hidden whitespace-nowrap transition-all duration-300 group-hover:max-w-[260px]">
        {label}
      </span>
    </motion.a>
  );
}
