import React, { useState } from 'react';
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

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(pass);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative w-full max-w-sm rounded-[28px] bg-[var(--bg-card)] border border-[var(--border-color)] p-6 shadow-2xl z-10 text-center animate-slide-up text-[var(--text-main)]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-black/5 dark:bg-white/10 text-[var(--text-muted)] hover:text-[var(--text-main)]"
        >
          <IOSIcon name="Close" size={16} />
        </button>

        {/* Wifi Icon */}
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#A78BFA]/20 text-[#A78BFA]">
          <IOSIcon name="Wifi" size={26} />
        </div>

        <h3 className="text-lg font-bold text-[var(--text-main)]">{t.title}</h3>
        <p className="mt-1 text-xs text-[var(--text-muted)]">
          {t.desc}
        </p>

        <div className="mt-5 space-y-2.5 text-left">
          <div className="rounded-2xl bg-[var(--bg-subcard)] p-3.5 border border-[var(--border-color)]">
            <span className="block text-[11px] font-medium text-[var(--text-muted)]">{t.ssidLabel}</span>
            <span className="text-sm font-semibold text-[var(--text-main)] tracking-wide">{ssid}</span>
          </div>

          <div className="rounded-2xl bg-[var(--bg-subcard)] p-3.5 border border-[var(--border-color)] flex items-center justify-between">
            <div>
              <span className="block text-[11px] font-medium text-[var(--text-muted)]">{t.passLabel}</span>
              <span className="text-sm font-mono font-bold text-[var(--text-main)] tracking-wider">{pass}</span>
            </div>
            <button
              onClick={handleCopy}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                copied
                  ? 'bg-emerald-500/20 text-emerald-500'
                  : 'bg-[#A78BFA] text-black active:scale-95 shadow-sm'
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
            </button>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-5 w-full rounded-2xl bg-[var(--bg-subcard)] py-3 text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
        >
          {t.close}
        </button>
      </div>
    </div>
  );
};
