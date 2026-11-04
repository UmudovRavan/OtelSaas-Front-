import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IOSIcon } from '../../../components/common/IOSIcon';
import { TranslationSchema } from '../../../utils/translations';

interface WifiModalProps {
  isOpen: boolean;
  onClose: () => void;
  ssid: string;
  pass: string;
  t: TranslationSchema['wifiModal'];
}

export const WifiModal: React.FC<WifiModalProps> = ({ isOpen, onClose, ssid, pass, t }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(pass);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop with Blur Fade */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/75 backdrop-blur-md"
            onClick={onClose}
          />

          {/* Modal Content with iOS Spring Pop */}
          <motion.div
            initial={{ opacity: 0, scale: 0.88, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 16 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="relative w-full max-w-sm rounded-[32px] bg-[var(--bg-card)] border border-[var(--border-color)] p-6 shadow-2xl z-10 text-center text-[var(--text-main)] overflow-hidden"
          >
            {/* Close Button */}
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.88 }}
              onClick={onClose}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-black/5 dark:bg-white/10 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
            >
              <IOSIcon name="Close" size={16} />
            </motion.button>

            {/* Wifi Icon with Spring Bounce */}
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', damping: 18, stiffness: 300, delay: 0.05 }}
              className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#A78BFA]/20 text-[#A78BFA] shadow-lg shadow-[#A78BFA]/10"
            >
              <IOSIcon name="Wifi" size={28} />
            </motion.div>

            <h3 className="text-xl font-bold tracking-tight text-[var(--text-main)]">{t.title}</h3>
            <p className="mt-1 text-xs text-[var(--text-muted)] leading-relaxed">
              {t.desc}
            </p>

            <div className="mt-5 space-y-2.5 text-left">
              <motion.div
                whileHover={{ scale: 1.01 }}
                className="rounded-2xl bg-[var(--bg-subcard)] p-3.5 border border-[var(--border-color)] transition-colors"
              >
                <span className="block text-[11px] font-medium text-[var(--text-muted)]">{t.ssidLabel}</span>
                <span className="text-sm font-semibold text-[var(--text-main)] tracking-wide">{ssid}</span>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.01 }}
                className="rounded-2xl bg-[var(--bg-subcard)] p-3.5 border border-[var(--border-color)] flex items-center justify-between transition-colors"
              >
                <div>
                  <span className="block text-[11px] font-medium text-[var(--text-muted)]">{t.passLabel}</span>
                  <span className="text-sm font-mono font-bold text-[var(--text-main)] tracking-wider">{pass}</span>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                  onClick={handleCopy}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
                    copied
                      ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30'
                      : 'bg-[#A78BFA] text-black shadow-[#A78BFA]/25'
                  }`}
                >
                  {copied ? (
                    <>
                      <IOSIcon name="Check" size={14} />
                      <span>{t.copied}</span>
                    </>
                  ) : (
                    <>
                      <IOSIcon name="Copy" size={14} />
                      <span>{t.copy}</span>
                    </>
                  )}
                </motion.button>
              </motion.div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="mt-5 w-full rounded-2xl bg-[var(--bg-subcard)] py-3 text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors border border-[var(--border-color)]"
            >
              {t.close}
            </motion.button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
