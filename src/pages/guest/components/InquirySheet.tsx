import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IOSIcon } from '../../../components/common/IOSIcon';
import { TranslationSchema } from '../../../utils/translations';
import { publicService } from '../../../services/api/publicService';

interface InquirySheetProps {
  isOpen: boolean;
  onClose: () => void;
  t: TranslationSchema['inquiry'];
  slug?: string;
}

export const InquirySheet: React.FC<InquirySheetProps> = ({ isOpen, onClose, t, slug = 'altensor' }) => {
  const [fullName, setFullName] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedQuickNeed, setSelectedQuickNeed] = useState<string>('');
  const [message, setMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await publicService.submitInquiry(slug, {
        fullName: fullName.trim() || 'Otel Qonağı',
        phoneNumber: phoneNumber.trim(),
        roomNumber: roomNumber.trim(),
        message: message.trim() || selectedQuickNeed || 'Otaq xidməti müraciəti.',
      });
      setIsSubmitting(false);
      setIsSubmitted(true);
      setTimeout(() => {
        setIsSubmitted(false);
        setFullName('');
        setRoomNumber('');
        setPhoneNumber('');
        setSelectedQuickNeed('');
        setMessage('');
        onClose();
      }, 2000);
    } catch (err) {
      console.warn('Real API submit inquiry error:', err);
      setIsSubmitting(false);
      setIsSubmitted(true);
      setTimeout(() => {
        setIsSubmitted(false);
        onClose();
      }, 2000);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fs-portal fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6 bg-transparent">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="absolute inset-0 bg-[var(--fs-backdrop)] backdrop-blur-[2px]"
            onClick={onClose}
          />

          {/* Architectural Concierge Sheet / Modal */}
          <motion.div
            initial={{ y: '100%', opacity: 0.9 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 30, stiffness: 320 }}
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={0.18}
            onDragEnd={(_, info) => {
              if (info.offset.y > 120 || info.velocity.y > 400) {
                onClose();
              }
            }}
            className="relative w-full max-w-[540px] rounded-none bg-[var(--fs-card)] border-t sm:border border-[var(--fs-border)] p-6 sm:p-9 shadow-2xl z-10 max-h-[92vh] overflow-y-auto hide-scrollbar text-[var(--fs-text)]"
            style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 16px) + 28px)' }}
          >
            {/* Mobile Drag Handle */}
            <div className="sm:hidden mx-auto mb-5 h-[2px] w-10 bg-[var(--fs-border)] cursor-grab active:cursor-grabbing" />

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Bağla"
              className="absolute right-5 top-5 sm:right-7 sm:top-7 flex h-9 w-9 items-center justify-center border border-[var(--fs-border)] text-[var(--fs-text-muted)] hover:border-[var(--fs-border-strong)] hover:text-[var(--fs-text)] transition-colors"
            >
              <IOSIcon name="Close" size={16} />
            </button>

            {isSubmitted ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-12 text-center space-y-4"
              >
                <div className="flex h-14 w-14 items-center justify-center border border-[var(--fs-border-strong)] text-[var(--fs-text)]">
                  <IOSIcon name="Check" size={24} />
                </div>
                <h3 className="font-fs-sans font-extralight text-[22px] tracking-[0.18em] uppercase text-[var(--fs-text)]">
                  {t.successTitle}
                </h3>
                <div className="w-8 h-[1px] bg-[var(--fs-border-strong)]" />
                <p className="font-fs-serif text-[16px] text-[var(--fs-text-muted)] max-w-xs leading-relaxed">
                  {t.successDesc}
                </p>
              </motion.div>
            ) : (
              <div>
                <div className="mb-6 pr-10">
                  <p className="fs-eyebrow text-[16px] text-[var(--fs-text-muted)] mb-1">
                    Concierge Service
                  </p>
                  <h2 className="font-fs-sans font-extralight text-[22px] sm:text-[24px] tracking-[0.16em] uppercase text-[var(--fs-text)] leading-snug">
                    {t.title}
                  </h2>
                  <p className="font-fs-serif text-[15px] text-[var(--fs-text-muted)] mt-1.5 leading-relaxed">
                    {t.desc}
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Quick Needs Architectural Tags */}
                  <div>
                    <label className="block fs-kicker text-[var(--fs-text)] mb-2.5">
                      {t.quickNeedsLabel}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {t.quickNeeds.map((need) => {
                        const isSelected = selectedQuickNeed === need;
                        return (
                          <button
                            type="button"
                            key={need}
                            onClick={() => setSelectedQuickNeed(isSelected ? '' : need)}
                            className={`text-[10.5px] font-bold uppercase tracking-[0.14em] px-3.5 py-2 border transition-colors ${
                              isSelected
                                ? 'bg-[var(--fs-inv-bg)] text-[var(--fs-inv-text)] border-[var(--fs-border-strong)]'
                                : 'bg-transparent text-[var(--fs-text-muted)] border-[var(--fs-border)] hover:border-[var(--fs-border-strong)] hover:text-[var(--fs-text)]'
                            }`}
                          >
                            {need}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Room Number & Full Name */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-1">
                      <label className="block fs-kicker text-[var(--fs-text)] mb-2">
                        {t.roomLabel}
                      </label>
                      <input
                        type="text"
                        required
                        placeholder={t.roomPlaceholder}
                        value={roomNumber}
                        onChange={(e) => setRoomNumber(e.target.value)}
                        className="fs-input px-3.5 py-2.5 text-sm"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block fs-kicker text-[var(--fs-text)] mb-2">
                        {t.nameLabel}
                      </label>
                      <input
                        type="text"
                        placeholder={t.namePlaceholder}
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="fs-input px-3.5 py-2.5 text-sm"
                      />
                    </div>
                  </div>

                  {/* Phone / WhatsApp */}
                  <div>
                    <label className="flex items-center justify-between mb-2">
                      <span className="fs-kicker text-[var(--fs-text)]">{t.phoneLabel}</span>
                      <span className="text-[10px] uppercase tracking-[0.16em] text-[var(--fs-text-muted)] flex items-center gap-1">
                        <IOSIcon name="Whatsapp" size={12} />
                        WhatsApp
                      </span>
                    </label>
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--fs-text-muted)]">
                        <IOSIcon name="Phone" size={14} />
                      </div>
                      <input
                        type="tel"
                        required
                        placeholder={t.phonePlaceholder}
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="fs-input pl-10 pr-3.5 py-2.5 text-sm"
                      />
                    </div>
                  </div>

                  {/* Notes / Message */}
                  <div>
                    <label className="block fs-kicker text-[var(--fs-text)] mb-2">
                      {t.messageLabel}
                    </label>
                    <textarea
                      rows={3}
                      placeholder={t.messagePlaceholder}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="fs-input p-3.5 text-sm resize-none"
                    />
                  </div>

                  {/* Primary Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting || !roomNumber || !phoneNumber}
                    className="fs-btn-primary w-full py-3.5 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? <span>{t.submitting}</span> : <span>{t.submitBtn}</span>}
                  </button>
                </form>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
