import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { publicService } from '../../services/api/publicService';
import { useLanguage } from '../../context/LanguageContext';
import { useHotelPortal } from '../../hooks/useHotelData';
import { useGuestDocumentMeta } from '../../utils/documentHead';
import { GuestLangPill } from './components/GuestLangPill';

const RATING_LABELS: Record<number, { az: string; en: string; ru: string }> = {
  1: {
    az: 'Yaxşılaşdırılmalıdır',
    en: 'Needs improvement',
    ru: 'Есть над чем поработать',
  },
  2: {
    az: 'Orta',
    en: 'Okay',
    ru: 'Средне',
  },
  3: {
    az: 'Yaxşı',
    en: 'Good',
    ru: 'Хорошо',
  },
  4: {
    az: 'Əla',
    en: 'Great',
    ru: 'Отлично',
  },
  5: {
    az: 'Mükəmməl',
    en: 'Excellent',
    ru: 'Превосходно',
  },
};

export const ReviewPage: React.FC = () => {
  const { slug } = useParams<{ slug?: string }>();
  const hotelSlug = slug || 'altensor';
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const { currentLang } = useLanguage();
  const selectedLang = (currentLang as 'az' | 'en' | 'ru') || 'az';

  useEffect(() => {
    window.scrollTo(0, 0);
    const saved = localStorage.getItem('fs_guest_dark');
    document.documentElement.classList.toggle('fs-dark', saved === '1');
  }, []);

  const initialStarsParam = searchParams.get('stars');
  const initialRating = initialStarsParam ? Math.min(5, Math.max(1, parseInt(initialStarsParam, 10))) : 5;

  const [rating, setRating] = useState<number>(initialRating);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [guestName, setGuestName] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const homePath = slug ? `/hotel/${slug}` : '/';
  const currentRating = hoverRating || rating;
  const { data: portalData } = useHotelPortal(hotelSlug);
  const reviewTabLabel =
    selectedLang === 'az' ? 'Rəy bildir' : selectedLang === 'ru' ? 'Оставить отзыв' : 'Leave a review';
  useGuestDocumentMeta(
    portalData?.name ? `${reviewTabLabel} | ${portalData.name}` : reviewTabLabel,
    portalData?.logoUrl
  );

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!rating || rating < 1) {
      setErrorMessage(
        selectedLang === 'az'
          ? 'Zəhmət olmasa qiymətləndirməni seçin.'
          : selectedLang === 'ru'
          ? 'Пожалуйста, выберите оценку.'
          : 'Please choose a rating.'
      );
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      await publicService.submitReview(hotelSlug, {
        rating,
        guestName: guestName.trim() || undefined,
        roomNumber: roomNumber.trim() || undefined,
        comment: comment.trim() || undefined,
      });
      setIsSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Review submit error:', err);
      setIsSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fs-portal min-h-screen flex flex-col selection:bg-black selection:text-white">
      {/* ===================== 1. ARCHITECTURAL TOP BAR ===================== */}
      <header className="w-full h-[64px] bg-[var(--fs-card)] border-b border-[var(--fs-border)] shrink-0 z-20">
        <div className="max-w-[1140px] mx-auto h-full px-4 sm:px-8 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate(homePath)}
            aria-label="Geri"
            className="w-9 h-9 border border-[var(--fs-border)] hover:border-[var(--fs-border-strong)] flex items-center justify-center text-[var(--fs-text)] transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <h1 className="font-fs-sans font-extralight text-[15px] sm:text-[17px] tracking-[0.20em] uppercase text-[var(--fs-text)]">
            {selectedLang === 'az'
              ? 'Rəy bildir'
              : selectedLang === 'ru'
              ? 'Оставить отзыв'
              : 'Leave a review'}
          </h1>

          <GuestLangPill variant="surface" />
        </div>
      </header>

      {/* ===================== 2. MAIN EDITORIAL REVIEW CONTAINER ===================== */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-8 py-10 sm:py-16">
        <div className="w-full max-w-[660px] bg-[var(--fs-surface-subtle)] border border-[var(--fs-border)] p-6 sm:p-12">
          <AnimatePresence mode="wait">
            {isSubmitted ? (
              <motion.div
                key="done"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center text-center py-8 space-y-5"
              >
                <div className="w-14 h-14 border border-[var(--fs-border-strong)] text-[var(--fs-text)] flex items-center justify-center text-2xl">
                  ✓
                </div>

                <h2 className="font-fs-sans font-extralight text-[24px] tracking-[0.18em] uppercase text-[var(--fs-text)]">
                  {selectedLang === 'az'
                    ? 'Rəyiniz göndərildi'
                    : selectedLang === 'ru'
                    ? 'Отзыв отправлен'
                    : 'Your review has been sent'}
                </h2>

                <div className="w-8 h-[1px] bg-[var(--fs-border-strong)]" />

                <p className="font-fs-serif text-[16.5px] text-[var(--fs-text-muted)] max-w-sm leading-relaxed">
                  {selectedLang === 'az'
                    ? 'Fikrinizi bölüşdüyünüz üçün təşəkkür edirik.'
                    : selectedLang === 'ru'
                    ? 'Спасибо, что поделились мнением.'
                    : 'Thank you for sharing your feedback.'}
                </p>

                <div className="pt-4">
                  <button
                    type="button"
                    onClick={() => navigate(homePath)}
                    className="fs-btn-primary"
                  >
                    {selectedLang === 'az'
                      ? 'Ana səhifəyə qayıt'
                      : selectedLang === 'ru'
                      ? 'На главную'
                      : 'Back to Home'}
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <div className="text-center space-y-2">
                  <p className="fs-eyebrow text-[17px] text-[var(--fs-text-muted)]">
                    Guest Impressions
                  </p>
                  <p className="font-fs-serif text-[18px] sm:text-[20px] text-[var(--fs-text)] leading-relaxed">
                    {selectedLang === 'az'
                      ? 'Bugünkü təcrübənizi necə qiymətləndirirsiniz?'
                      : selectedLang === 'ru'
                      ? 'Как вы оцените сегодняшний визит?'
                      : 'How would you rate your experience today?'}
                  </p>
                </div>

                {/* Monochrome Architectural Stars */}
                <div
                  role="radiogroup"
                  aria-label="Qiymət"
                  className="flex items-center justify-center gap-3 pt-1"
                >
                  {[1, 2, 3, 4, 5].map((star) => {
                    const isOn = star <= currentRating;
                    return (
                      <button
                        key={star}
                        type="button"
                        role="radio"
                        aria-checked={star === rating}
                        aria-label={`${star} ulduz`}
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(null)}
                        className={`text-[38px] sm:text-[42px] leading-none px-1 focus:outline-none transition-all duration-150 ${
                          isOn
                            ? 'text-[var(--fs-text)]'
                            : 'text-[var(--fs-border)] hover:text-[var(--fs-text-subtle)]'
                        }`}
                      >
                        ★
                      </button>
                    );
                  })}
                </div>

                <div className="text-center fs-kicker text-[var(--fs-text-muted)] min-h-[18px]">
                  {RATING_LABELS[currentRating]?.[selectedLang] || ''}
                </div>

                <div className="space-y-4 pt-2">
                  <div>
                    <textarea
                      rows={5}
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder={
                        selectedLang === 'az'
                          ? 'Nə bəyəndiniz, nə çatışmadı? (istəyə bağlı)'
                          : selectedLang === 'ru'
                          ? 'Что понравилось, чего не хватило? (необязательно)'
                          : 'What did you like? What was missing? (optional)'
                      }
                      className="fs-input p-4 text-[14.5px] resize-none leading-relaxed bg-[var(--fs-card)]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <input
                      type="text"
                      value={roomNumber}
                      onChange={(e) => setRoomNumber(e.target.value)}
                      placeholder={
                        selectedLang === 'ru'
                          ? 'Номер комнаты (опция)'
                          : selectedLang === 'en'
                          ? 'Room number (opt)'
                          : 'Otaq nömrəsi (istəyə bağlı)'
                      }
                      className="fs-input px-3.5 py-3 text-sm bg-[var(--fs-card)]"
                    />
                    <input
                      type="text"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      placeholder={
                        selectedLang === 'ru'
                          ? 'Ваше имя (опция)'
                          : selectedLang === 'en'
                          ? 'Your name (opt)'
                          : 'Adınız (istəyə bağlı)'
                      }
                      className="fs-input px-3.5 py-3 text-sm bg-[var(--fs-card)]"
                    />
                  </div>
                </div>

                {errorMessage && (
                  <div className="p-3.5 bg-[#fef0f0] border border-[#fa8f8f] text-[#310202] text-xs text-center font-medium">
                    {errorMessage}
                  </div>
                )}

                <div className="pt-2">
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => handleSubmit()}
                    className="fs-btn-primary w-full py-4 disabled:opacity-50"
                  >
                    {isSubmitting
                      ? selectedLang === 'az'
                        ? 'Göndərilir...'
                        : selectedLang === 'ru'
                        ? 'Отправка...'
                        : 'Sending...'
                      : selectedLang === 'az'
                      ? 'Rəyi göndər'
                      : selectedLang === 'ru'
                      ? 'Отправить отзыв'
                      : 'Send review'}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};
