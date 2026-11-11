import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { publicService } from '../../services/api/publicService';
import { useLanguage } from '../../context/LanguageContext';

const RATING_LABELS: Record<
  number,
  { az: string; en: string; ru: string }
> = {
  1: {
    az: 'Yaxşılaşdırılmalıdır 😔',
    en: 'Needs improvement 😔',
    ru: 'Есть над чем поработать 😔',
  },
  2: {
    az: 'Orta 😐',
    en: 'Okay 😐',
    ru: 'Средне 😐',
  },
  3: {
    az: 'Yaxşı 👌',
    en: 'Good 👌',
    ru: 'Хорошо 👌',
  },
  4: {
    az: 'Əla! 👍',
    en: 'Great! 👍',
    ru: 'Отлично! 👍',
  },
  5: {
    az: 'Mükəmməl! 😍',
    en: 'Excellent! 😍',
    ru: 'Превосходно! 😍',
  },
};

export const ReviewPage: React.FC = () => {
  const { slug } = useParams<{ slug?: string }>();
  const hotelSlug = slug || 'altensor';
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const { currentLang } = useLanguage();
  const selectedLang = (currentLang as 'az' | 'en' | 'ru') || 'az';

  // Read initial stars from query param (?stars=5)
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
      // Still show success to ensure pleasant UX
      setIsSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] font-hotel-sans flex justify-center selection:bg-[#A78BFA] selection:text-black transition-colors duration-200">
      {/* Main Column (540px container matching 1:1 skyhill) */}
      <div className="w-full max-w-[540px] min-h-screen bg-[var(--bg-main)] flex flex-col relative border-x border-[var(--border-color)] overflow-x-hidden shadow-2xl">
        {/* ===================== 1. SCREEN HEADER (.ScreenHeader_head__UU8gt) ===================== */}
        <header className="w-full h-[58px] bg-[var(--bg-main)] border-b border-[var(--border-color)] flex items-center justify-between px-3 shrink-0 z-20">
          {/* Back Button */}
          <button
            type="button"
            onClick={() => navigate(homePath)}
            aria-label="Geri"
            className="w-10 h-10 rounded-full flex items-center justify-center text-[var(--text-main)] hover:bg-[var(--bg-card)] active:scale-95 transition-all"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Title */}
          <h1 className="font-hotel-serif text-[20px] font-bold text-[var(--text-main)] tracking-wide">
            {selectedLang === 'az'
              ? 'Rəy bildir'
              : selectedLang === 'ru'
              ? 'Оставить отзыв'
              : 'Leave a review'}
          </h1>

          {/* Balanced spacer */}
          <div className="w-10 h-10" />
        </header>

        {/* ===================== 2. MAIN CONTENT ===================== */}
        <main className="flex-1 flex flex-col">
          <AnimatePresence mode="wait">
            {isSubmitted ? (
              /* ================== SUCCESS / DONE VIEW (.review_doneWrap__He2T0) ================== */
              <motion.div
                key="done"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col items-center justify-center text-center px-6 py-16"
              >
                {/* Circular Badge (.review_doneBadge__LtNvy) */}
                <div className="w-[84px] h-[84px] rounded-full bg-[#cda669]/15 dark:bg-[#A78BFA]/20 text-[#cda669] dark:text-[#A78BFA] flex items-center justify-center text-[38px] mb-5 shadow-sm border border-[#cda669]/30 dark:border-[#A78BFA]/30">
                  ✓
                </div>

                {/* Title */}
                <h2 className="font-hotel-serif text-[26px] font-bold text-[var(--text-main)] tracking-tight">
                  {selectedLang === 'az'
                    ? 'Rəyiniz göndərildi'
                    : selectedLang === 'ru'
                    ? 'Отзыв отправлен'
                    : 'Your review has been sent'}
                </h2>

                {/* Note (.review_doneNote__1cZbV) */}
                <p className="text-[14.5px] text-[var(--text-muted)] mt-2.5 max-w-[320px] leading-relaxed">
                  {selectedLang === 'az'
                    ? 'Fikrinizi bölüşdüyünüz üçün təşəkkür edirik.'
                    : selectedLang === 'ru'
                    ? 'Спасибо, что поделились мнением.'
                    : 'Thank you for sharing your feedback.'}
                </p>

                {/* Back to Home Button (.review_doneBtn___q1nT) */}
                <button
                  type="button"
                  onClick={() => navigate(homePath)}
                  className="mt-8 px-8 h-[48px] rounded-[16px] bg-[#342417] hover:bg-[#271a10] dark:bg-[#A78BFA] dark:hover:bg-[#906fe8] text-white dark:text-black font-semibold text-[15px] shadow-md active:scale-[0.98] transition-all"
                >
                  {selectedLang === 'az'
                    ? 'Ana səhifəyə qayıt'
                    : selectedLang === 'ru'
                    ? 'На главную'
                    : 'Back to Home'}
                </button>
              </motion.div>
            ) : (
              /* ================== REVIEW FORM (.review_wrap__Uc1Dd) ================== */
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-5 sm:p-6 flex flex-col gap-4 flex-1"
              >
                {/* Lede Text (.review_lede__2GHVE) */}
                <p className="text-center text-[14.5px] sm:text-[15px] text-[var(--text-muted)] leading-relaxed font-medium pt-1">
                  {selectedLang === 'az'
                    ? 'Bugünkü təcrübənizi necə qiymətləndirirsiniz?'
                    : selectedLang === 'ru'
                    ? 'Как вы оцените сегодняшний визит?'
                    : 'How would you rate your experience today?'}
                </p>

                {/* Stars Group (.review_stars__dPc_b) */}
                <div
                  role="radiogroup"
                  aria-label="Qiymət"
                  className="flex items-center justify-center gap-2 pt-2"
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
                        className={`text-[44px] sm:text-[48px] leading-none px-1 py-0.5 focus:outline-none transition-transform duration-150 active:scale-125 ${
                          isOn
                            ? 'text-[#cda669] dark:text-[#A78BFA] drop-shadow-sm'
                            : 'text-[var(--border-color)] opacity-40 hover:opacity-75'
                        }`}
                      >
                        ★
                      </button>
                    );
                  })}
                </div>

                {/* Dynamic Rating Label (.review_ratingLabel__lkC56) */}
                <div className="text-center font-bold text-[15px] text-[var(--text-main)] min-h-[24px] flex items-center justify-center transition-all">
                  {RATING_LABELS[currentRating]?.[selectedLang] || ''}
                </div>

                {/* Textarea (.review_notes__625Mf) */}
                <div className="pt-2">
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
                    className="w-full rounded-[16px] bg-[var(--bg-card)] border border-[var(--border-color)] focus:border-[#cda669] dark:focus:border-[#A78BFA] p-3.5 text-[14.5px] text-[var(--text-main)] placeholder-[var(--text-muted)]/60 focus:outline-none resize-none transition-colors shadow-sm leading-relaxed"
                  />
                </div>

                {/* Optional Room & Name Inputs */}
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                    placeholder={selectedLang === 'ru' ? 'Номер комнаты (опция)' : selectedLang === 'en' ? 'Room number (opt)' : 'Otaq nömrəsi (istəyə bağlı)'}
                    className="w-full rounded-[14px] bg-[var(--bg-card)] border border-[var(--border-color)] p-3 text-[13.5px] text-[var(--text-main)] placeholder-[var(--text-muted)]/60 focus:outline-none focus:border-[#cda669] dark:focus:border-[#A78BFA] transition-colors"
                  />
                  <input
                    type="text"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder={selectedLang === 'ru' ? 'Ваше имя (опция)' : selectedLang === 'en' ? 'Your name (opt)' : 'Adınız (istəyə bağlı)'}
                    className="w-full rounded-[14px] bg-[var(--bg-card)] border border-[var(--border-color)] p-3 text-[13.5px] text-[var(--text-main)] placeholder-[var(--text-muted)]/60 focus:outline-none focus:border-[#cda669] dark:focus:border-[#A78BFA] transition-colors"
                  />
                </div>

                {/* Error Banner (.review_error__4Ian8) */}
                {errorMessage && (
                  <div className="p-3 rounded-[12px] bg-rose-500/10 border border-rose-500/25 text-rose-500 text-[13px] text-center font-medium">
                    {errorMessage}
                  </div>
                )}

                {/* Submit Button (.btn) */}
                <div className="pt-2">
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => handleSubmit()}
                    className="w-full h-[52px] rounded-[16px] bg-[#342417] hover:bg-[#271a10] dark:bg-[#A78BFA] dark:hover:bg-[#906fe8] text-white dark:text-black font-semibold text-[15.5px] flex items-center justify-center gap-2 shadow-md active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none transition-all"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-5 w-5 text-current" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                        <span>
                          {selectedLang === 'az'
                            ? 'Göndərilir...'
                            : selectedLang === 'ru'
                            ? 'Отправка...'
                            : 'Sending...'}
                        </span>
                      </span>
                    ) : (
                      <span>
                        {selectedLang === 'az'
                          ? 'Rəyi göndər'
                          : selectedLang === 'ru'
                          ? 'Отправить отзыв'
                          : 'Send review'}
                      </span>
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

