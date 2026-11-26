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
        <div className="fs-portal fixed inset-0 z-50 flex items-center justify-center p-4 bg-transparent">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-[var(--fs-backdrop)] backdrop-blur-[2px]"
            onClick={onClose}
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.25 }}
            className="relative w-full max-w-[420px] rounded-none bg-[var(--fs-card)] border border-[var(--fs-border)] p-7 sm:p-8 shadow-2xl z-10 text-center text-[var(--fs-text)]"
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Bağla"
              className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center border border-[var(--fs-border)] text-[var(--fs-text-muted)] hover:border-[var(--fs-border-strong)] hover:text-[var(--fs-text)] transition-colors"
            >
              <IOSIcon name="Close" size={15} />
            </button>

            {/* Monochrome Wi-Fi Emblem */}
            <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center border border-[var(--fs-border-strong)] text-[var(--fs-text)]">
              <IOSIcon name="Wifi" size={22} />
            </div>

            <h3 className="font-fs-sans font-extralight text-[22px] tracking-[0.18em] uppercase text-[var(--fs-text)]">
              {t.title}
            </h3>
            <p className="mt-2 font-fs-serif text-[15px] text-[var(--fs-text-muted)] leading-relaxed">
              {t.desc}
            </p>

            <div className="mt-6 space-y-3 text-left">
              <div className="bg-[var(--fs-surface-subtle)] p-4 border border-[var(--fs-border)]">
                <span className="block fs-kicker text-[var(--fs-text-muted)] mb-1">{t.ssidLabel}</span>
                <span className="text-sm font-medium text-[var(--fs-text)] tracking-wide">{ssid}</span>
              </div>

              <div className="bg-[var(--fs-surface-subtle)] p-4 border border-[var(--fs-border)] flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <span className="block fs-kicker text-[var(--fs-text-muted)] mb-1">{t.passLabel}</span>
                  <span className="text-sm font-mono font-semibold text-[var(--fs-text)] tracking-wider break-all">
                    {pass}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="fs-btn-primary shrink-0 !min-h-[36px] !px-4 !py-2"
                >
                  {copied ? (
                    <>
                      <IOSIcon name="Check" size={13} />
                      <span>{t.copied}</span>
                    </>
                  ) : (
                    <>
                      <IOSIcon name="Copy" size={13} />
                      <span>{t.copy}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="fs-btn-outline mt-5 w-full"
            >
              {t.close}
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
