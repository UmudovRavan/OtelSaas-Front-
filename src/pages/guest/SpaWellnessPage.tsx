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
import { useGuestDocumentMeta } from '../../utils/documentHead';
import { useLanguage } from '../../context/LanguageContext';
import { tr, SupportedLang } from '../../utils/i18n';
import { GuestLangPill } from './components/GuestLangPill';
import { HubType } from '../../types/api';

export const SpaWellnessPage: React.FC = () => {
  const { slug, code } = useParams<{ slug?: string; code?: string }>();
  const hotelSlug = slug || 'altensor';
  const isDemoHotel = hotelSlug === 'altensor' || hotelSlug === 'skyhill';
  const navigate = useNavigate();
  const location = useLocation();

  const { currentLang } = useLanguage();
  const selectedLang = (currentLang as Language) || 'az';
  const [liveHotel, setLiveHotel] = useState<PublicHotelProfile | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    const saved = localStorage.getItem('fs_guest_dark');
    document.documentElement.classList.toggle('fs-dark', saved === '1');
  }, []);

  const isHubRoute = location.pathname.includes('/g/');

  // Lookup portal to find dynamic hub code if not given in URL
  const { data: portalData } = useHotelPortal(hotelSlug);
  const matchingSpaHub = portalData?.hubs?.find((h) => h.hubType === HubType.SpaAndWellness);
  const hubCodeOrId = isHubRoute
    ? code || matchingSpaHub?.code || matchingSpaHub?.externalId || '193'
    : matchingSpaHub?.code || matchingSpaHub?.externalId || '193';

  // Dynamic Live Hub (Spa & Wellness)
  const { data: hubData } = useHub(hotelSlug, hubCodeOrId);

  const hubTitle = tr(
    hubData?.titleTr,
    hubData?.title || (selectedLang === 'ru' ? 'Спа и велнес' : selectedLang === 'en' ? 'Spa & Wellness' : 'Spa və sağlamlıq'),
    selectedLang as SupportedLang
  );
  const hubSubtitle = tr(hubData?.subtitleTr, hubData?.subtitle || '', selectedLang as SupportedLang);
  const hubCover = resolveMediaUrl(hubData?.coverImageUrl, '/media/guest/pool-indoor.webp');

  const liveCategories: SpaCategory[] = React.useMemo(() => {
    if (hubData?.categories && hubData.categories.length > 0) {
      return hubData.categories.map((c) => ({
        id: c.id,
        code: String(c.externalId || c.id),
        title: tr(c.titleTr, c.title, selectedLang as SupportedLang),
        subtitle: tr(c.subtitleTr, c.subtitle || '', selectedLang as SupportedLang),
        cover: resolveMediaUrl(c.imageUrl, hubCover),
        hours: c.workingHours || '08:00–22:00',
        type: 'category' as const,
        items: [],
      }));
    }
    return isDemoHotel
      ? spaCategories.map((c) => ({
          ...c,
          title:
            selectedLang === 'en' && c.titleEn
              ? c.titleEn
              : selectedLang === 'ru' && c.titleRu
              ? c.titleRu
              : c.title,
        }))
      : [];
  }, [hubData, hotelSlug, hubCover, isDemoHotel, selectedLang]);

  // Active subpage/category
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
        title: tr(it.titleTr, it.title, selectedLang as SupportedLang),
        name: tr(it.titleTr, it.title, selectedLang as SupportedLang),
        nameEn: it.titleTr?.en || it.title,
        nameRu: it.titleTr?.ru || it.title,
        duration: it.portionOrDuration || '',
        price: `${it.price} ₼`,
        priceNum: it.price,
        badge: tr(it.badgeTr, it.badge || '', selectedLang as SupportedLang) || undefined,
        image: it.imageUrl ? resolveMediaUrl(it.imageUrl) : undefined,
        desc: tr(it.descriptionTr, it.description || it.subtitle || '', selectedLang as SupportedLang) || undefined,
      }));
    }
    return (activeCategory?.items || []).map((it) => ({
      ...it,
      title:
        selectedLang === 'en' && it.titleEn
          ? it.titleEn
          : selectedLang === 'ru' && it.titleRu
          ? it.titleRu
          : it.title,
    }));
  }, [catDetail, activeCategory, selectedLang]);

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
  const displayPhone = liveHotel?.phone || (isDemoHotel ? hotel.phone : '');
  const displayWhatsapp = (liveHotel?.whatsApp || (isDemoHotel ? hotel.whatsapp : '')).replace(/[^0-9]/g, '');

  const hotelTitleName = liveHotel?.name || portalData?.name || (isDemoHotel ? hotel.name : '');
  const pageTabTitle = activeCategory ? activeCategory.title : hubTitle;
  useGuestDocumentMeta(
    hotelTitleName ? `${pageTabTitle} | ${hotelTitleName}` : pageTabTitle,
    liveHotel?.logoUrl || portalData?.logoUrl || (isDemoHotel ? hotel.logo : undefined)
  );

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

  const getCategoryIcon = (id: string) => {
    switch (id) {
      case 'about':
        return (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 5a3 3 0 1 1 3 3m-3-3a3 3 0 1 0-3 3m3-3v1M9 8a3 3 0 1 0 3 3M9 8h1m5 0a3 3 0 1 1-3 3m3-3h-1m-2 3v-1" />
            <circle cx="12" cy="8" r="2" />
            <path d="M12 10v12" />
            <path d="M12 22c4.2 0 7-1.667 7-5-4.2 0-7 1.667-7 5Z" />
            <path d="M12 22c-4.2 0-7-1.667-7-5 4.2 0 7 1.667 7 5Z" />
          </svg>
        );
      case 'facilities':
        return (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M2 12q2.5 2 5 0t5 0 5 0 5 0" />
            <path d="M2 19q2.5 2 5 0t5 0 5 0 5 0" />
            <path d="M2 5q2.5 2 5 0t5 0 5 0 5 0" />
          </svg>
        );
      case 'massages':
        return (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M18 11V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2" />
            <path d="M14 10V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v2" />
            <path d="M10 10.5V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2v8" />
            <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
          </svg>
        );
      case 'facial':
        return (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z" />
            <path d="M20 2v4" />
            <path d="M22 4h-4" />
            <circle cx="4" cy="20" r="2" />
          </svg>
        );
      case 'rituals':
        return (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />
          </svg>
        );
      case 'phytotherapy':
        return (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5" />
          </svg>
        );
      case 'packages':
        return (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 7v14" />
            <path d="M20 11v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8" />
            <path d="M7.5 7a1 1 0 0 1 0-5A4.8 8 0 0 1 12 7a4.8 8 0 0 1 4.5-5 1 1 0 0 1 0 5" />
            <rect x="3" y="7" width="18" height="4" rx="1" />
          </svg>
        );
      case 'etiquette':
      default:
        return (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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
    <div className="fs-portal min-h-screen flex flex-col selection:bg-black selection:text-white pb-16">
      {/* ===================== 1. FULL-BLEED ARCHITECTURAL HERO ===================== */}
      <header className="relative w-full h-[240px] sm:h-[320px] lg:h-[380px] overflow-hidden bg-[#0F0F0F] flex-none">
        <img
          src={resolveMediaUrl(activeCategory?.cover || hubCover, '/media/guest/pool-indoor.webp')}
          alt={activeCategory ? activeCategory.title : hubTitle}
          onError={(e) => {
            const fallback = resolveMediaUrl('/media/guest/pool-indoor.webp');
            if (!e.currentTarget.dataset.fbApplied && e.currentTarget.src !== fallback) {
              e.currentTarget.dataset.fbApplied = '1';
              e.currentTarget.src = fallback;
            }
          }}
          className="absolute inset-0 w-full h-full object-cover transition-all duration-500"
        />

        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(180deg, rgba(0,0,0,0.52) 0%, rgba(0,0,0,0.16) 45%, rgba(0,0,0,0.78) 100%)',
          }}
        />

        <div className="relative z-20 max-w-[1280px] mx-auto px-4 sm:px-8 pt-4 flex items-center justify-between">
          <button
            type="button"
            onClick={activeCategory ? handleBackToSpaList : () => navigate(homePath)}
            aria-label="Geri"
            className="w-10 h-10 bg-black/40 border border-white/35 backdrop-blur-sm text-white flex items-center justify-center hover:bg-white hover:text-black transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>

          <div className="flex items-center gap-2">
            <GuestLangPill />
            <button
              type="button"
              onClick={() => navigate(homePath)}
              aria-label="Ana səhifə"
              className="w-10 h-10 bg-black/40 border border-white/35 backdrop-blur-sm text-white flex items-center justify-center hover:bg-white hover:text-black transition-colors"
            >
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" />
                <path d="M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              </svg>
            </button>
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-0 z-20 max-w-[1140px] mx-auto px-4 sm:px-8 pb-6 sm:pb-9">
          <p className="fs-eyebrow text-[16px] sm:text-[18px] text-white/85 mb-1">
            {activeCategory ? activeCategory.hours || 'Wellness & Spa' : 'Sanctuary & Rituals'}
          </p>
          <h1 className="font-fs-sans font-extralight text-[26px] sm:text-[34px] lg:text-[40px] leading-[1.2] tracking-[0.18em] uppercase text-white">
            {activeCategory ? activeCategory.title : hubTitle}
          </h1>
          {!activeCategory && hubSubtitle && (
            <p className="font-fs-serif text-[15px] sm:text-[17px] text-white/85 mt-1.5 max-w-2xl leading-snug">
              {hubSubtitle}
            </p>
          )}
        </div>
      </header>

      {/* ===================== 2. MAIN RESPONSIVE CONTENT ===================== */}
      <main className="flex-1 w-full max-w-[1140px] mx-auto px-4 sm:px-8 py-8 sm:py-12 space-y-10">
        {/* VIEW A: SPA CATEGORIES DIRECTORY */}
        {!activeCategory &&
          (liveCategories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-[var(--fs-border)] border border-[var(--fs-border)]">
              {liveCategories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleCategoryClick(cat)}
                  className="w-full py-5 px-5 sm:px-7 bg-[var(--fs-card)] hover:bg-[var(--fs-surface-subtle)] flex items-center justify-between gap-4 text-left transition-colors group"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <span className="text-[var(--fs-text)] flex-none">{getCategoryIcon(cat.id)}</span>
                    <div className="min-w-0">
                      <span className="font-fs-serif text-[19px] sm:text-[20px] text-[var(--fs-text)] block truncate">
                        {cat.title}
                      </span>
                      {cat.hours && (
                        <span className="text-xs text-[var(--fs-text-muted)] block truncate mt-0.5">
                          {cat.hours}
                        </span>
                      )}
                    </div>
                  </div>

                  <span className="text-[var(--fs-text-muted)] group-hover:text-[var(--fs-text)] group-hover:translate-x-1 transition-all flex-none">
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="m9 18 6-6-6-6" />
                    </svg>
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="py-16 px-6 bg-[var(--fs-surface-subtle)] border border-[var(--fs-border)] flex flex-col items-center justify-center text-center space-y-3">
              <h3 className="font-fs-sans font-extralight text-[20px] tracking-[0.18em] uppercase text-[var(--fs-text)]">
                {selectedLang === 'az' ? 'Spa kateqoriyası əlavə edilməyib' : 'No spa categories added'}
              </h3>
              <p className="font-fs-serif text-[15.5px] text-[var(--fs-text-muted)] max-w-sm">
                {selectedLang === 'az'
                  ? 'Bu bölmədə hələlik heç bir spa xidməti kateqoriyası əlavə edilməyib.'
                  : 'No spa service categories added yet.'}
              </p>
            </div>
          ))}

        {/* VIEW B: ARTICLE DETAIL */}
        {activeCategory && activeCategory.type === 'page' && (
          <div className="space-y-6 max-w-[820px] mx-auto">
            <div className="flex items-center justify-between pb-4 border-b border-[var(--fs-border)]">
              <span className="fs-kicker text-[var(--fs-text-muted)]">
                {selectedLang === 'ru' ? 'Информация' : selectedLang === 'en' ? 'Information' : 'Məlumat vərəqi'}
              </span>
              <button
                type="button"
                onClick={handleBackToSpaList}
                className="fs-link-underlined text-[var(--fs-text)]"
              >
                {selectedLang === 'ru'
                  ? '← Все разделы СПА'
                  : selectedLang === 'en'
                  ? '← All SPA sections'
                  : '← Bütün SPA bölmələri'}
              </button>
            </div>

            <div className="bg-[var(--fs-surface-subtle)] border border-[var(--fs-border)] p-7 sm:p-12 space-y-6">
              <p className="font-fs-serif text-[16.5px] sm:text-[18px] text-[var(--fs-text-body)] leading-[1.75] whitespace-pre-line">
                {activeCategory.articleContent}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-5 border-t border-[var(--fs-border)]">
                <a
                  href={`https://wa.me/${displayWhatsapp}?text=${encodeURIComponent(
                    `Salam, ${activeCategory.title} ilə bağlı məlumat almaq və ya rezervasiya etmək istəyirəm.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="fs-btn-primary w-full"
                >
                  {selectedLang === 'ru' ? 'Бронь в WhatsApp' : selectedLang === 'en' ? 'WhatsApp Booking' : 'WhatsApp Rezervasiya'}
                </a>
                <a href={`tel:${displayPhone}`} className="fs-btn-outline w-full">
                  {selectedLang === 'ru' ? 'Позвонить на ресепшн' : selectedLang === 'en' ? 'Call Reception' : 'Resepşna Zəng'}
                </a>
              </div>
            </div>
          </div>
        )}

        {/* VIEW C: TREATMENT / PROCEDURE GALLERY */}
        {activeCategory && activeCategory.type === 'category' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[var(--fs-border)]">
              <span className="fs-kicker text-[var(--fs-text-muted)]">
                {displayTreatments.length}{' '}
                {selectedLang === 'ru' ? 'процедур' : selectedLang === 'en' ? 'treatments' : 'xidmət təklif olunur'}
              </span>
              <button
                type="button"
                onClick={handleBackToSpaList}
                className="fs-link-underlined text-[var(--fs-text)]"
              >
                {selectedLang === 'ru'
                  ? '← Все разделы СПА'
                  : selectedLang === 'en'
                  ? '← All SPA sections'
                  : '← Bütün SPA bölmələri'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-[30px]">
              {displayTreatments.map((it) => (
                <div
                  key={it.id}
                  onClick={() => setActiveTreatment(it)}
                  className="w-full rounded-none bg-[var(--fs-card)] border border-[var(--fs-border)] hover:border-[var(--fs-border-strong)] flex flex-col cursor-pointer transition-colors group"
                >
                  {it.image && (
                    <div className="w-full aspect-[16/10] overflow-hidden bg-[var(--fs-surface-subtle)]">
                      <img
                        src={resolveMediaUrl(it.image, '/media/guest/massage.webp')}
                        alt={it.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                        loading="lazy"
                      />
                    </div>
                  )}

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <h4 className="font-fs-serif text-[20px] sm:text-[21px] text-[var(--fs-text)] leading-snug">
                        {it.title}
                      </h4>
                      {it.desc && (
                        <p className="font-fs-serif text-[15px] text-[var(--fs-text-muted)] line-clamp-3 leading-relaxed">
                          {it.desc}
                        </p>
                      )}
                    </div>

                    <div className="pt-2 flex items-center justify-between border-t border-[var(--fs-border)]">
                      {it.price ? (
                        <span className="font-fs-sans text-[14px] font-bold tracking-[0.06em] text-[var(--fs-text)]">
                          {it.price}
                        </span>
                      ) : (
                        <span />
                      )}
                      <span className="fs-link-underlined text-[var(--fs-text)]">
                        {selectedLang === 'ru' ? 'Подробнее →' : selectedLang === 'en' ? 'Details →' : 'Bax →'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Spa Concierge Strip */}
        <div className="p-6 sm:p-8 bg-[var(--fs-surface-subtle)] border border-[var(--fs-border)] flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="space-y-1">
            <span className="fs-kicker text-[var(--fs-text-muted)] block">Spa Reception</span>
            <h4 className="font-fs-serif text-[21px] text-[var(--fs-text)]">
              {selectedLang === 'ru'
                ? 'Бронирование СПА'
                : selectedLang === 'en'
                ? 'Spa Reservations'
                : 'MARAL Spa Rezervasiya'}
            </h4>
            <p className="font-fs-serif text-[15px] text-[var(--fs-text-muted)]">
              {selectedLang === 'ru'
                ? '09:00 – 22:00 · Внутренний номер: 5'
                : selectedLang === 'en'
                ? '09:00 – 22:00 · Internal ext: 5'
                : '09:00 – 22:00 · Daxili xətt: 5'}
            </p>
          </div>
          <a
            href={`https://wa.me/${displayWhatsapp}?text=${encodeURIComponent(
              'Salam, MARAL Spa xidmətləri üçün rezervasiya etmək istəyirəm.'
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="fs-btn-outline shrink-0"
          >
            {selectedLang === 'ru' ? 'Бронь в WhatsApp' : selectedLang === 'en' ? 'WhatsApp Booking' : 'WhatsApp Rezervasiya'}
          </a>
        </div>
      </main>

      {/* ===================== 3. TREATMENT DETAIL MODAL ===================== */}
      <AnimatePresence>
        {activeTreatment && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[var(--fs-backdrop)] backdrop-blur-[2px]"
              onClick={() => setActiveTreatment(null)}
            />

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              className="relative z-10 w-full max-w-[500px] max-h-[88vh] overflow-y-auto rounded-none bg-[var(--fs-card)] border-t sm:border border-[var(--fs-border)] text-[var(--fs-text)] shadow-2xl"
            >
              {activeTreatment.image && (
                <div className="w-full h-[220px] overflow-hidden bg-[var(--fs-surface-subtle)]">
                  <img
                    src={resolveMediaUrl(activeTreatment.image, '/media/guest/massage.webp')}
                    alt={activeTreatment.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="p-6 sm:p-8 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-fs-sans font-extralight text-[21px] uppercase tracking-[0.15em] text-[var(--fs-text)]">
                      {activeTreatment.title}
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveTreatment(null)}
                    className="w-8 h-8 border border-[var(--fs-border)] hover:border-[var(--fs-border-strong)] flex items-center justify-center text-[var(--fs-text-muted)] hover:text-[var(--fs-text)] shrink-0"
                  >
                    ✕
                  </button>
                </div>

                {activeTreatment.desc && (
                  <p className="font-fs-serif text-[16px] text-[var(--fs-text-muted)] leading-relaxed">
                    {activeTreatment.desc}
                  </p>
                )}

                {activeTreatment.price && (
                  <div className="font-fs-sans text-[18px] font-bold tracking-[0.06em] text-[var(--fs-text)] pt-1">
                    {activeTreatment.price}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-[var(--fs-border)]">
                  <a
                    href={`https://wa.me/${displayWhatsapp}?text=${encodeURIComponent(
                      `Salam, MARAL Spa üzrə [${activeTreatment.title}${
                        activeTreatment.price ? ` - ${activeTreatment.price}` : ''
                      }] rezervasiya etmək istəyirəm.\nOtaq nömrəsi: `
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="fs-btn-primary w-full"
                  >
                    WhatsApp Rezervasiya
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      setIsInquiryOpen(true);
                      setActiveTreatment(null);
                    }}
                    className="fs-btn-outline w-full"
                  >
                    Sifariş Formu
                  </button>
                </div>
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
  );
};
