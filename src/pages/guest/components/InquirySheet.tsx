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
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          {/* Backdrop with Blur Fade */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="absolute inset-0 bg-black/75 backdrop-blur-md"
            onClick={onClose}
          />

          {/* iOS Bottom Sheet with Elastic Spring & Drag to Dismiss */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={0.2}
            onDragEnd={(_, info) => {
              if (info.offset.y > 120 || info.velocity.y > 400) {
                onClose();
              }
            }}
            className="relative w-full max-w-[430px] rounded-t-[36px] bg-[var(--bg-card)] border-t border-[var(--border-color)] p-6 shadow-2xl z-10 max-h-[90vh] overflow-y-auto hide-scrollbar text-[var(--text-main)]"
            style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 20px) + 24px)' }}
          >
            {/* iOS Grabber */}
            <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-black/20 dark:bg-white/20 cursor-grab active:cursor-grabbing" />

            {/* Close Button */}
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.88 }}
              onClick={onClose}
              className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full bg-black/5 dark:bg-white/10 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
            >
              <IOSIcon name="Close" size={18} />
            </motion.button>

            {isSubmitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-10 text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.2, 1] }}
                  transition={{ type: 'spring', damping: 15, stiffness: 300 }}
                  className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#A78BFA]/20 text-[#A78BFA] shadow-lg shadow-[#A78BFA]/20"
                >
                  <IOSIcon name="Check" size={32} />
                </motion.div>
                <h3 className="text-xl font-bold text-[var(--text-main)]">{t.successTitle}</h3>
                <p className="mt-2 text-sm text-[var(--text-muted)] max-w-xs">
                  {t.successDesc}
                </p>
              </motion.div>
            ) : (
              <div>
                <div className="mb-5">
                  <h2 className="text-xl font-bold tracking-tight text-[var(--text-main)] flex items-center gap-2">
                    {t.title}
                  </h2>
                  <p className="text-xs text-[var(--text-muted)] mt-1">
                    {t.desc}
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Sürətli Tələblər (Pills) with Spring Feedback */}
                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-main)] mb-2">
                      {t.quickNeedsLabel}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {t.quickNeeds.map((need) => {
                        const isSelected = selectedQuickNeed === need;
                        return (
                          <motion.button
                            type="button"
                            key={need}
                            whileHover={{ scale: 1.04 }}
                            whileTap={{ scale: 0.91 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                            onClick={() => setSelectedQuickNeed(isSelected ? '' : need)}
                            className={`text-xs px-3.5 py-1.5 rounded-full transition-all border ${
                              isSelected
                                ? 'bg-[#A78BFA] text-black font-bold border-[#A78BFA] shadow-sm shadow-[#A78BFA]/30'
                                : 'bg-[var(--bg-subcard)] text-[var(--text-muted)] border-[var(--border-color)] hover:border-[#A78BFA]/40'
                            }`}
                          >
                            {need}
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Otaq № və Ad */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-1">
                      <label className="block text-xs font-semibold text-[var(--text-main)] mb-1.5">
                        {t.roomLabel}
                      </label>
                      <input
                        type="text"
                        required
                        placeholder={t.roomPlaceholder}
                        value={roomNumber}
                        onChange={(e) => setRoomNumber(e.target.value)}
                        className="w-full rounded-2xl bg-[var(--bg-subcard)] border border-[var(--border-color)] px-3.5 py-3 text-sm text-[var(--text-main)] placeholder-[var(--text-muted)]/50 focus:border-[#A78BFA] focus:outline-none transition-colors"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-semibold text-[var(--text-main)] mb-1.5">
                        {t.nameLabel}
                      </label>
                      <input
                        type="text"
                        placeholder={t.namePlaceholder}
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full rounded-2xl bg-[var(--bg-subcard)] border border-[var(--border-color)] px-3.5 py-3 text-sm text-[var(--text-main)] placeholder-[var(--text-muted)]/50 focus:border-[#A78BFA] focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  {/* Telefon / WhatsApp Nömrəsi Sahəsi */}
                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-main)] mb-1.5 flex items-center justify-between">
                      <span>{t.phoneLabel}</span>
                      <span className="text-[10px] text-[#A78BFA] font-medium flex items-center gap-1">
                        <IOSIcon name="Whatsapp" size={12} />
                        WhatsApp dəstəyi
                      </span>
                    </label>
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
                        <IOSIcon name="Phone" size={15} />
                      </div>
                      <input
                        type="tel"
                        required
                        placeholder={t.phonePlaceholder}
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="w-full rounded-2xl bg-[var(--bg-subcard)] border border-[var(--border-color)] pl-10 pr-3.5 py-3 text-sm text-[var(--text-main)] placeholder-[var(--text-muted)]/50 focus:border-[#A78BFA] focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  {/* Qeyd / Mesaj */}
                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-main)] mb-1.5">
                      {t.messageLabel}
                    </label>
                    <textarea
                      rows={3}
                      placeholder={t.messagePlaceholder}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full rounded-2xl bg-[var(--bg-subcard)] border border-[var(--border-color)] p-3.5 text-sm text-[var(--text-main)] placeholder-[var(--text-muted)]/50 focus:border-[#A78BFA] focus:outline-none resize-none transition-colors"
                    />
                  </div>

                  {/* Submit Button with Magnetic Spring Feedback */}
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: 'spring', stiffness: 450, damping: 18 }}
                    disabled={isSubmitting || !roomNumber || !phoneNumber}
                    className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#A78BFA] py-3.5 text-sm font-bold text-black transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#A78BFA]/25"
                  >
                    {isSubmitting ? <span>{t.submitting}</span> : <span>{t.submitBtn}</span>}
                  </motion.button>
                </form>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
