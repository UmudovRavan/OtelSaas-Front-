import React, { useState } from 'react';
import { IOSIcon } from '../../../components/common/IOSIcon';
import { TranslationSchema } from '../../../utils/translations';
import { publicService } from '../../../services/api/publicService';

interface InquirySheetProps {
  isOpen: boolean;
  onClose: () => void;
  t: TranslationSchema['inquiry'];
  slug?: string;
}

export const InquirySheet: React.FC<InquirySheetProps> = ({ isOpen, onClose, t, slug = 'hotel-resort' }) => {
  const [fullName, setFullName] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedQuickNeed, setSelectedQuickNeed] = useState<string>('');
  const [message, setMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

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
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm transition-opacity">
      <div className="absolute inset-0" onClick={onClose} />

      {/* iOS Bottom Sheet */}
      <div 
        className="relative w-full max-w-[430px] rounded-t-[32px] bg-[var(--bg-card)] border-t border-[var(--border-color)] p-6 shadow-2xl animate-slide-up z-10 max-h-[90vh] overflow-y-auto hide-scrollbar text-[var(--text-main)]"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 20px) + 24px)' }}
      >
        {/* iOS Grabber */}
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-black/20 dark:bg-white/20" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full bg-black/5 dark:bg-white/10 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
        >
          <IOSIcon name="Close" size={18} />
        </button>

        {isSubmitted ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#A78BFA]/20 text-[#A78BFA]">
              <IOSIcon name="Check" size={32} />
            </div>
            <h3 className="text-xl font-bold text-[var(--text-main)]">{t.successTitle}</h3>
            <p className="mt-2 text-sm text-[var(--text-muted)] max-w-xs">
              {t.successDesc}
            </p>
          </div>
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
              {/* Sürətli Tələblər (Pills) */}
              <div>
                <label className="block text-xs font-semibold text-[var(--text-main)] mb-2">
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
                        className={`text-xs px-3.5 py-1.5 rounded-full transition-all border ${
                          isSelected
                            ? 'bg-[#A78BFA] text-black font-bold border-[#A78BFA] shadow-sm'
                            : 'bg-[var(--bg-subcard)] text-[var(--text-muted)] border-[var(--border-color)] hover:border-[#A78BFA]/40'
                        }`}
                      >
                        {need}
                      </button>
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
                    className="w-full rounded-2xl bg-[var(--bg-subcard)] border border-[var(--border-color)] px-3.5 py-3 text-sm text-[var(--text-main)] placeholder-[var(--text-muted)]/50 focus:border-[#A78BFA] focus:outline-none"
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
                    className="w-full rounded-2xl bg-[var(--bg-subcard)] border border-[var(--border-color)] px-3.5 py-3 text-sm text-[var(--text-main)] placeholder-[var(--text-muted)]/50 focus:border-[#A78BFA] focus:outline-none"
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
                    className="w-full rounded-2xl bg-[var(--bg-subcard)] border border-[var(--border-color)] pl-10 pr-3.5 py-3 text-sm text-[var(--text-main)] placeholder-[var(--text-muted)]/50 focus:border-[#A78BFA] focus:outline-none"
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
                  className="w-full rounded-2xl bg-[var(--bg-subcard)] border border-[var(--border-color)] p-3.5 text-sm text-[var(--text-main)] placeholder-[var(--text-muted)]/50 focus:border-[#A78BFA] focus:outline-none resize-none"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || !roomNumber || !phoneNumber}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#A78BFA] py-3.5 text-sm font-bold text-black transition-transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              >
                {isSubmitting ? <span>{t.submitting}</span> : <span>{t.submitBtn}</span>}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
