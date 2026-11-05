import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { defaultHotelData } from './guestData';
import { translations, Language } from '../../utils/translations';
import { publicService, PublicHotelProfile } from '../../services/api/publicService';
import {
  spaCategories,
  getSpaCategoryByCodeOrId,
  SpaCategory,
  SpaTreatmentItem,
} from '../../data/spaData';
import { InquirySheet } from './components/InquirySheet';
import { useHub, useCatalogCategory, useHotelPortal } from '../../hooks/useHotelData';
import { resolveMediaUrl } from '../../utils/media';
import { HubType } from '../../types/api';

export const SpaWellnessPage: React.FC = () => {
  const { slug, code } = useParams<{ slug?: string; code?: string }>();
  const hotelSlug = slug || 'skyhill';
  const navigate = useNavigate();
  const location = useLocation();

  const [selectedLang] = useState<Language>('az');
  const [liveHotel, setLiveHotel] = useState<PublicHotelProfile | null>(null);

  const isHubRoute = location.pathname.includes('/g/');

  // Lookup portal to find dynamic hub code if not given in URL
  const { data: portalData } = useHotelPortal(hotelSlug);
  const matchingSpaHub = portalData?.hubs?.find((h) => h.hubType === HubType.SpaAndWellness);
  const hubCodeOrId = isHubRoute
    ? (code || matchingSpaHub?.code || matchingSpaHub?.externalId || '193')
    : (matchingSpaHub?.code || matchingSpaHub?.externalId || '193');

  // Dynamic Live Hub (Spa & Wellness)
  const { data: hubData } = useHub(hotelSlug, hubCodeOrId);

  const hubTitle = hubData?.title || hubData?.titleTr?.az || (selectedLang === 'az' ? 'Spa və sağlamlıq' : 'Spa & Wellness');
  const hubSubtitle = hubData?.subtitle || hubData?.subtitleTr?.az || '';
  const hubCover = resolveMediaUrl(hubData?.coverImageUrl, '/media/guest/pool-indoor.webp');

  const liveCategories: SpaCategory[] = React.useMemo(() => {
    if (hubData?.categories && hubData.categories.length > 0) {
      return hubData.categories.map((c) => ({
        id: c.id,
        code: String(c.externalId || c.id),
        title: c.title,
        subtitle: c.subtitle || '',
        cover: resolveMediaUrl(c.imageUrl, hubCover),
        hours: c.workingHours || '08:00–22:00',
        type: 'category' as const,
        items: [],
      }));
    }
    return hotelSlug === 'skyhill' ? spaCategories : [];
  }, [hubData, hotelSlug, hubCover]);

  // Active subpage/category (either from URL /c/:code or /p/:code, or state)
  const [activeCategory, setActiveCategory] = useState<SpaCategory | null>(() => {
    if (code) {
      return getSpaCategoryByCodeOrId(code) || null;
    }
    const match = location.pathname.match(/\/(?:c|p)\/([0-9a-zA-Z_\-]+)/);
    if (match) {
      return getSpaCategoryByCodeOrId(match[1]) || null;
    }
    return null;
  });

  const activeCategoryCode = activeCategory?.code || activeCategory?.id;
  const { data: catDetail } = useCatalogCategory(hotelSlug, activeCategoryCode);

  const displayTreatments: SpaTreatmentItem[] = React.useMemo(() => {
    if (catDetail?.items && catDetail.items.length > 0) {
      return catDetail.items.map((it) => ({
        id: it.id,
        title: it.title,
        name: it.title,
        nameEn: it.titleTr?.en || it.title,
        nameRu: it.titleTr?.ru || it.title,
        duration: it.portionOrDuration || '',
        price: `${it.price} ₼`,
        priceNum: it.price,
        badge: it.badge || it.badgeTr?.az || undefined,
        image: it.imageUrl ? resolveMediaUrl(it.imageUrl) : undefined,
        desc: it.description || it.subtitle || undefined,
      }));
    }
    return activeCategory?.items || [];
  }, [catDetail, activeCategory]);

  // Active treatment detail modal
  const [activeTreatment, setActiveTreatment] = useState<SpaTreatmentItem | null>(null);
  const [isInquiryOpen, setIsInquiryOpen] = useState(false);

  const hotel = defaultHotelData;
  const t = translations[selectedLang];

  useEffect(() => {
    publicService
      .getHotelBySlug(hotelSlug, selectedLang)
      .then((data) => {
        setLiveHotel(data);
      })
      .catch((err) => {
        console.warn('Hotel fetch error in SpaWellnessPage:', err);
      });
  }, [hotelSlug, selectedLang]);

  // Sync if URL param changes
  useEffect(() => {
    const rawCode = code || location.pathname.match(/\/(?:c|p)\/([0-9a-zA-Z_\-]+)/)?.[1];
    if (rawCode && ['43214', '43215', '43216', '43217', '43218', '43219', '43220', '43221', '43222', '43223', '43224'].includes(rawCode)) {
      navigate(slug ? `/hotel/${slug}/entertainment` : `/entertainment`, { replace: true });
      return;
    }
    if (rawCode && ['43230', '43231', '43232', '43233', '43234'].includes(rawCode)) {
      navigate(slug ? `/hotel/${slug}/offers/${rawCode}` : `/offers/${rawCode}`, { replace: true });
      return;
    }
    if (code) {
      const found = getSpaCategoryByCodeOrId(code);
      if (found) setActiveCategory(found);
    } else {
      const match = location.pathname.match(/\/(?:c|p)\/([0-9a-zA-Z_\-]+)/);
      if (match) {
        const found = getSpaCategoryByCodeOrId(match[1]);
        if (found) setActiveCategory(found);
      }
    }
  }, [code, location.pathname, slug, navigate]);

  const homePath = slug ? `/hotel/${slug}` : '/';
  const displayPhone = liveHotel?.phone || (hotelSlug === 'skyhill' ? hotel.phone : '');
  const displayWhatsapp = (liveHotel?.whatsApp || (hotelSlug === 'skyhill' ? hotel.whatsapp : '')).replace(/[^0-9]/g, '');

  const handleCategoryClick = (cat: SpaCategory) => {
    setActiveCategory(cat);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const routePrefix = cat.type === 'page' ? 'p' : 'c';
    if (slug) {
      navigate(`/hotel/${slug}/${routePrefix}/${cat.code}`, { replace: false });
    } else {
      navigate(`/${routePrefix}/${cat.code}`, { replace: false });
    }
  };

  const handleBackToSpaList = () => {
    setActiveCategory(null);
    if (slug) {
      navigate(`/${hotelSlug}/hotel/g/${hubCodeOrId}`, { replace: true });
    } else {
      navigate(`/g/${hubCodeOrId}`, { replace: true });
    }
  };

  // 8 Exact SVG icons matching qr.unipos.tech/skyhill/hotel/g/193
  const getCategoryIcon = (id: string) => {
    switch (id) {
      case 'about':
        // Lotus flower
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 5a3 3 0 1 1 3 3m-3-3a3 3 0 1 0-3 3m3-3v1M9 8a3 3 0 1 0 3 3M9 8h1m5 0a3 3 0 1 1-3 3m3-3h-1m-2 3v-1" />
            <circle cx="12" cy="8" r="2" />
            <path d="M12 10v12" />
            <path d="M12 22c4.2 0 7-1.667 7-5-4.2 0-7 1.667-7 5Z" />
            <path d="M12 22c-4.2 0-7-1.667-7-5 4.2 0 7 1.667 7 5Z" />
          </svg>
        );
      case 'facilities':
        // Pool waves
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M2 12q2.5 2 5 0t5 0 5 0 5 0" />
            <path d="M2 19q2.5 2 5 0t5 0 5 0 5 0" />
            <path d="M2 5q2.5 2 5 0t5 0 5 0 5 0" />
          </svg>
        );
      case 'massages':
        // Hand massage
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M18 11V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2" />
            <path d="M14 10V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v2" />
            <path d="M10 10.5V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2v8" />
            <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
          </svg>
        );
      case 'facial':
        // Sparkles facial
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z" />
            <path d="M20 2v4" />
            <path d="M22 4h-4" />
            <circle cx="4" cy="20" r="2" />
          </svg>
        );
      case 'rituals':
        // Star ritual
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />
          </svg>
        );
      case 'phytotherapy':
        // Heart / Plant
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5" />
          </svg>
        );
      case 'packages':
        // Gift box package
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 7v14" />
            <path d="M20 11v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8" />
            <path d="M7.5 7a1 1 0 0 1 0-5A4.8 8 0 0 1 12 7a4.8 8 0 0 1 4.5-5 1 1 0 0 1 0 5" />
            <rect x="3" y="7" width="18" height="4" rx="1" />
          </svg>
        );
      case 'etiquette':
      default:
        // Document
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z" />
            <path d="M14 2v5a1 1 0 0 0 1 1h5" />
            <path d="M10 9H8" />
            <path d="M16 13H8" />
            <path d="M16 17H8" />
          </svg>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] font-hotel-sans flex justify-center selection:bg-[#A78BFA] selection:text-black transition-colors duration-200">
      {/* Main Responsive Column */}
      <div className="w-full max-w-[540px] min-h-screen bg-[var(--bg-main)] flex flex-col relative pb-10 border-x border-[var(--border-color)] overflow-x-hidden shadow-2xl">
        
        {/* ===================== 1. HERO HEADER (1:1 with Reference) ===================== */}
        <header className="relative w-full h-[178px] overflow-hidden bg-[#181424] flex-none">
          <img
            src={activeCategory?.cover || hubCover}
            alt={activeCategory ? activeCategory.title : hubTitle}
            className="absolute inset-0 w-full h-full object-cover transition-all duration-300"
          />

          {/* Dark luxury gradient shade */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'linear-gradient(180deg, rgba(8,12,22,0.65) 0%, rgba(8,12,22,0.25) 45%, rgba(8,12,22,0.85) 100%)',
            }}
          />

          {/* Top Bar with Back & Home Buttons */}
          <div className="absolute top-[14px] left-[14px] right-[14px] z-20 flex items-center justify-between pointer-events-auto">
            {/* Back button */}
            <button
              type="button"
              onClick={activeCategory ? handleBackToSpaList : () => navigate(homePath)}
              aria-label="Geri"
              className="w-[36px] h-[36px] rounded-full bg-[#101826]/70 border border-white/25 backdrop-blur-md text-white flex items-center justify-center hover:bg-white/20 active:scale-95 transition-all shadow-sm"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>

            {/* Home button */}
            <button
              type="button"
              onClick={() => navigate(homePath)}
              aria-label="Ana səhifə"
              className="w-[36px] h-[36px] rounded-full bg-[#101826]/70 border border-white/25 backdrop-blur-md text-white flex items-center justify-center hover:bg-white/20 active:scale-95 transition-all shadow-sm"
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" />
                <path d="M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              </svg>
            </button>
          </div>

          {/* Title in Cormorant Garamond Serif */}
          <div className="absolute bottom-[16px] left-[18px] right-[18px] z-20">
            <h1
              className="font-hotel-serif text-[28px] sm:text-[32px] leading-none font-semibold text-white tracking-wide"
              style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.7))' }}
            >
              {activeCategory ? activeCategory.title : hubTitle}
            </h1>
            {(activeCategory?.hours || (!activeCategory && hubSubtitle)) && (
              <p
                className="text-[12px] text-white/85 font-hotel-sans mt-1 leading-snug"
                style={{ filter: 'drop-shadow(0 1px 4px rgba(0,0,0,0.8))' }}
              >
                {activeCategory ? activeCategory.hours : hubSubtitle}
              </p>
            )}
          </div>
        </header>

        {/* ===================== 2. SHEET BODY ===================== */}
        <div className="relative z-10 -mt-2.5 rounded-t-[22px] bg-[var(--bg-main)] pt-3 px-3.5 flex-1 flex flex-col">

          {/* VIEW A: SPA CATEGORIES / PAGES LIST */}
          {!activeCategory && (
            liveCategories.length > 0 ? (
              <div className="rounded-[16px] bg-[var(--bg-card)] border border-[var(--border-color)] overflow-hidden shadow-[0_4px_16px_rgba(0,0,0,0.04)] divide-y divide-[var(--border-color)]">
                {liveCategories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleCategoryClick(cat)}
                    className="w-full py-3.5 px-3.5 sm:px-4 flex items-center justify-between gap-3 text-left hover:bg-[var(--bg-subcard)]/50 active:bg-[var(--bg-subcard)] transition-colors group"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      {/* SVG Line Icon */}
                      <span className="text-[#a87b51] dark:text-[#A78BFA] flex-none group-hover:scale-110 transition-transform">
                        {getCategoryIcon(cat.id)}
                      </span>

                      {/* Title */}
                      <span className="font-hotel-sans font-medium text-[14px] text-[var(--text-main)] group-hover:text-[#a87b51] dark:group-hover:text-[#A78BFA] transition-colors truncate">
                        {cat.title}
                      </span>
                    </div>

                    {/* Right Chevron > */}
                    <span className="text-[var(--text-muted)] group-hover:text-[var(--text-main)] group-hover:translate-x-0.5 transition-all flex-none">
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="m9 18 6-6-6-6" />
                      </svg>
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="py-16 px-6 flex flex-col items-center justify-center text-center">
                <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-3 text-[#A78BFA]">
                  <span className="text-2xl">💆</span>
                </div>
                <h3 className="font-hotel-serif text-[18px] font-semibold text-[var(--text-main)] mb-1">
                  {selectedLang === 'az' ? 'Spa kateqoriyası əlavə edilməyib' : 'No spa categories added'}
                </h3>
                <p className="text-[12.5px] text-[var(--text-muted)] max-w-[280px]">
                  {selectedLang === 'az' ? 'Bu bölmədə hələlik heç bir spa xidməti kateqoriyası əlavə edilməyib.' : 'No spa service categories added yet.'}
                </p>
              </div>
            )
          )}

          {/* VIEW B: ARTICLE DETAIL (p/43188 MARAL Spa haqqında or p/43212 SPA etiketi) */}
          {activeCategory && activeCategory.type === 'page' && (
            <div className="space-y-4 pt-1">
              <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
                <span>Məlumat vərəqi</span>
                <button
                  type="button"
                  onClick={handleBackToSpaList}
                  className="text-[#a87b51] dark:text-[#A78BFA] hover:underline font-semibold flex items-center gap-1"
                >
                  ← Bütün SPA bölmələri
                </button>
              </div>

              <div className="rounded-[16px] bg-[var(--bg-card)] border border-[var(--border-color)] p-5 space-y-4 shadow-sm">
                <div className="space-y-3">
                  <p className="text-[13px] sm:text-[14px] text-[var(--text-main)] leading-relaxed whitespace-pre-line font-hotel-sans">
                    {activeCategory.articleContent}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-3 border-t border-[var(--border-color)]">
                  <a
                    href={`https://wa.me/${displayWhatsapp}?text=${encodeURIComponent(
                      `Salam, ${activeCategory.title} ilə bağlı məlumat almaq və ya rezervasiya etmək istəyirəm.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-3 rounded-xl bg-[#25D366] text-white text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-transform shadow-sm"
                  >
                    💬 WhatsApp
                  </a>
                  <a
                    href={`tel:${displayPhone}`}
                    className="py-3 rounded-xl bg-[#a87b51] dark:bg-[#A78BFA] text-white dark:text-black text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-transform shadow-sm"
                  >
                    📞 Resepşna Zəng
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* VIEW C: TREATMENT / PROCEDURE LIST (c/4586 - c/4591) */}
          {activeCategory && activeCategory.type === 'category' && (
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
                <span>{displayTreatments.length} xidmət təklif olunur</span>
                <button
                  type="button"
                  onClick={handleBackToSpaList}
                  className="text-[#a87b51] dark:text-[#A78BFA] hover:underline font-semibold flex items-center gap-1"
                >
                  ← Bütün SPA bölmələri
                </button>
              </div>

              {/* Items List */}
              <div className="space-y-2">
                {displayTreatments.map((it) => (
                  <div
                    key={it.id}
                    onClick={() => setActiveTreatment(it)}
                    className="w-full rounded-[14px] bg-[var(--bg-card)] border border-[var(--border-color)] p-2.5 flex items-center justify-between gap-3 cursor-pointer shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:border-[#a87b51]/40 dark:hover:border-[#A78BFA]/40 active:scale-[0.99] transition-all group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Image Thumbnail if available */}
                      {it.image && (
                        <div className="w-[84px] h-[64px] flex-none rounded-[10px] overflow-hidden bg-black/10 dark:bg-black/30">
                          <img
                            src={it.image}
                            alt={it.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />
                        </div>
                      )}

                      {/* Title & Description */}
                      <div className="min-w-0 pr-1">
                        <h4 className="font-semibold text-xs sm:text-[13.5px] text-[var(--text-main)] group-hover:text-[#a87b51] dark:group-hover:text-[#A78BFA] transition-colors leading-tight">
                          {it.title}
                        </h4>
                        {it.desc && (
                          <p className="text-[11px] text-[var(--text-muted)] font-hotel-sans mt-0.5 line-clamp-2 leading-relaxed">
                            {it.desc}
                          </p>
                        )}
                        {it.price && (
                          <span className="text-xs font-bold text-[#a87b51] dark:text-[#A78BFA] block mt-1">
                            {it.price}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Booking Chevron / Action */}
                    <div className="flex items-center gap-1.5 flex-none">
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[var(--bg-subcard)] border border-[var(--border-color)] text-[var(--text-main)] group-hover:bg-[#a87b51] group-hover:text-white dark:group-hover:bg-[#A78BFA] dark:group-hover:text-black transition-colors">
                        Bax →
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Reception Contact Box */}
          <div className="pt-4 pb-2">
            <div className="p-3 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] flex items-center justify-between gap-3 shadow-sm">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-xl bg-[#a87b51]/15 dark:bg-[#A78BFA]/15 text-[#a87b51] dark:text-[#A78BFA] flex items-center justify-center text-sm font-bold">
                  🌸
                </span>
                <div>
                  <span className="text-xs font-bold text-[var(--text-main)] block">
                    MARAL Spa Rezervasiya
                  </span>
                  <span className="text-[11px] text-[var(--text-muted)] block">
                    09:00 – 22:00 · Daxili xətt: 5
                  </span>
                </div>
              </div>
              <a
                href={`https://wa.me/${displayWhatsapp}?text=${encodeURIComponent(
                  'Salam, MARAL Spa xidmətləri üçün rezervasiya etmək istəyirəm.'
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-xl bg-[#25D366] text-white text-[11px] font-bold shadow-sm active:scale-95 transition-transform"
              >
                WhatsApp
              </a>
            </div>
          </div>
        </div>

        {/* ===================== 3. TREATMENT DETAIL MODAL ===================== */}
        <AnimatePresence>
          {activeTreatment && (
            <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/75 backdrop-blur-sm"
                onClick={() => setActiveTreatment(null)}
              />

              <motion.div
                initial={{ opacity: 0, y: 60 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 60 }}
                transition={{ type: 'spring', damping: 26, stiffness: 320 }}
                className="relative z-10 w-full max-w-[480px] max-h-[85vh] overflow-y-auto rounded-t-[26px] sm:rounded-[26px] bg-[var(--bg-card)] border border-[var(--border-color)] p-5 text-[var(--text-main)] shadow-2xl space-y-4"
              >
                <div className="w-12 h-1.5 rounded-full bg-white/20 mx-auto mb-1" />

                {activeTreatment.image && (
                  <div className="w-full h-[180px] rounded-2xl overflow-hidden bg-black/30">
                    <img
                      src={activeTreatment.image}
                      alt={activeTreatment.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-hotel-serif text-xl font-bold uppercase tracking-wide text-[var(--text-main)]">
                      {activeTreatment.title}
                    </h3>
                  </div>

                  <button
                    onClick={() => setActiveTreatment(null)}
                    className="w-8 h-8 rounded-full bg-[var(--bg-subcard)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-main)]"
                  >
                    ✕
                  </button>
                </div>

                {activeTreatment.desc && (
                  <p className="text-xs sm:text-[13px] text-[var(--text-main)]/85 leading-relaxed font-hotel-sans">
                    {activeTreatment.desc}
                  </p>
                )}

                {activeTreatment.price && (
                  <div className="text-lg font-bold text-[#a87b51] dark:text-[#A78BFA]">
                    {activeTreatment.price}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[var(--border-color)]">
                  <a
                    href={`https://wa.me/${displayWhatsapp}?text=${encodeURIComponent(
                      `Salam, MARAL Spa üzrə [${activeTreatment.title}${
                        activeTreatment.price ? ` - ${activeTreatment.price}` : ''
                      }] rezervasiya etmək istəyirəm.\nOtaq nömrəsi: `
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-3 rounded-2xl bg-[#25D366] text-white text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-transform shadow-md"
                  >
                    💬 WhatsApp Rezervasiya
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      setIsInquiryOpen(true);
                      setActiveTreatment(null);
                    }}
                    className="py-3 rounded-2xl bg-[var(--bg-subcard)] border border-[var(--border-color)] text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
                  >
                    📝 Sifariş Formu
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ===================== 4. INQUIRY MODAL ===================== */}
        <InquirySheet
          isOpen={isInquiryOpen}
          onClose={() => setIsInquiryOpen(false)}
          t={t.inquiry}
          slug={hotelSlug}
        />
      </div>
    </div>
  );
};

