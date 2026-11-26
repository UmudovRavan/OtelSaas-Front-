import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { defaultHotelData } from './guestData';
import { translations, Language } from '../../utils/translations';
import { publicService, PublicHotelProfile } from '../../services/api/publicService';
import {
  entertainmentItems,
  getEntertainmentItemByCodeOrId,
  EntertainmentItem,
} from '../../data/entertainmentData';
import { InquirySheet } from './components/InquirySheet';
import { useCatalogCategory, useHub, useHotelPortal } from '../../hooks/useHotelData';
import { resolveMediaUrl } from '../../utils/media';
import { useGuestDocumentMeta } from '../../utils/documentHead';
import { useLanguage } from '../../context/LanguageContext';
import { tr, SupportedLang } from '../../utils/i18n';
import { GuestLangPill } from './components/GuestLangPill';
import { HubType } from '../../types/api';

export const EntertainmentPage: React.FC = () => {
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

  // Lookup portal to find dynamic entertainment hub code
  const { data: portalData } = useHotelPortal(hotelSlug);
  const matchingEntertainmentHub = portalData?.hubs?.find((h) => h.hubType === HubType.Entertainment);
  const hubCodeOrId = isHubRoute
    ? code || matchingEntertainmentHub?.code || matchingEntertainmentHub?.externalId || '194'
    : matchingEntertainmentHub?.code || matchingEntertainmentHub?.externalId || '194';

  // Dynamic Live Hub (Entertainment)
  const { data: hubData } = useHub(hotelSlug, hubCodeOrId);

  const hubTitle = tr(
    hubData?.titleTr,
    hubData?.title || (selectedLang === 'ru' ? 'Развлечения' : selectedLang === 'en' ? 'Entertainment' : 'Əyləncə'),
    selectedLang as SupportedLang
  );
  const hubSubtitle = tr(
    hubData?.subtitleTr,
    hubData?.subtitle ||
      (selectedLang === 'ru'
        ? 'Активный отдых, туры и вечерние программы'
        : selectedLang === 'en'
        ? 'Activities, tours & evening programs'
        : 'Aktiv istirahət, turlar və axşam proqramları'),
    selectedLang as SupportedLang
  );
  const hubCover = resolveMediaUrl(hubData?.coverImageUrl, '/media/guest/tile-entertainment.webp');

  // Live category 4596 (Entertainment items)
  const { data: catDetail } = useCatalogCategory(hotelSlug, '4596');

  const displayItems: EntertainmentItem[] = React.useMemo(() => {
    if (hubData?.directItems && hubData.directItems.length > 0) {
      return hubData.directItems.map((it) => ({
        id: it.id,
        code: String(it.externalId || it.id),
        title: tr(it.titleTr, it.title, selectedLang as SupportedLang),
        titleEn: it.titleTr?.en || it.title,
        titleRu: it.titleTr?.ru || it.title,
        subtitle: tr(it.subtitleTr, it.subtitle || it.description || '', selectedLang as SupportedLang),
        price: it.price ? `${it.price} ₼` : selectedLang === 'ru' ? 'Бесплатно' : selectedLang === 'en' ? 'Free' : 'Ödənişsiz',
        priceNum: it.price || 0,
        badge: tr(it.badgeTr, it.badge || '', selectedLang as SupportedLang) || undefined,
        image: it.imageUrl ? resolveMediaUrl(it.imageUrl) : hubCover,
        description: tr(it.descriptionTr, it.description || it.subtitle || '', selectedLang as SupportedLang),
        schedule: it.portionOrDuration || '10:00–23:00',
      }));
    }
    if (catDetail?.items && catDetail.items.length > 0) {
      return catDetail.items.map((it) => ({
        id: it.id,
        code: String(it.externalId || it.id),
        title: tr(it.titleTr, it.title, selectedLang as SupportedLang),
        titleEn: it.titleTr?.en || it.title,
        titleRu: it.titleTr?.ru || it.title,
        subtitle: tr(it.subtitleTr, it.subtitle || it.description || '', selectedLang as SupportedLang),
        price: it.price ? `${it.price} ₼` : selectedLang === 'ru' ? 'Бесплатно' : selectedLang === 'en' ? 'Free' : 'Ödənişsiz',
        priceNum: it.price || 0,
        badge: tr(it.badgeTr, it.badge || '', selectedLang as SupportedLang) || undefined,
        image: it.imageUrl ? resolveMediaUrl(it.imageUrl) : hubCover,
        description: tr(it.descriptionTr, it.description || it.subtitle || '', selectedLang as SupportedLang),
        schedule: it.portionOrDuration || '10:00–23:00',
      }));
    }
    return isDemoHotel
      ? entertainmentItems.map((it) => ({
          ...it,
          title:
            selectedLang === 'en' && it.titleEn
              ? it.titleEn
              : selectedLang === 'ru' && it.titleRu
              ? it.titleRu
              : it.title,
        }))
      : [];
  }, [hubData, catDetail, hotelSlug, hubCover, isDemoHotel, selectedLang]);

  const [activeItem, setActiveItem] = useState<EntertainmentItem | null>(() => {
    if (code) {
      return getEntertainmentItemByCodeOrId(code) || null;
    }
    const match = location.pathname.match(/\/p\/([0-9a-zA-Z_\-]+)/);
    if (match) {
      return getEntertainmentItemByCodeOrId(match[1]) || null;
    }
    return null;
  });

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
        console.warn('Hotel fetch error in EntertainmentPage:', err);
      });
  }, [hotelSlug, selectedLang]);

  useEffect(() => {
    if (code) {
      const found = getEntertainmentItemByCodeOrId(code);
      if (found) setActiveItem(found);
    } else {
      const match = location.pathname.match(/\/p\/([0-9a-zA-Z_\-]+)/);
      if (match) {
        const found = getEntertainmentItemByCodeOrId(match[1]);
        if (found) setActiveItem(found);
      }
    }
  }, [code, location.pathname]);

  const homePath = slug ? `/hotel/${slug}` : '/';
  const displayWhatsapp = (liveHotel?.whatsApp || (isDemoHotel ? hotel.whatsapp : '')).replace(/[^0-9]/g, '');

  const hotelTitleName = liveHotel?.name || portalData?.name || (isDemoHotel ? hotel.name : '');
  useGuestDocumentMeta(
    hotelTitleName ? `${hubTitle} | ${hotelTitleName}` : hubTitle,
    liveHotel?.logoUrl || portalData?.logoUrl || (isDemoHotel ? hotel.logo : undefined)
  );

  return (
    <div className="fs-portal min-h-screen flex flex-col selection:bg-black selection:text-white pb-16">
      {/* ===================== 1. FULL-BLEED ARCHITECTURAL HERO ===================== */}
      <header className="relative w-full h-[240px] sm:h-[320px] lg:h-[380px] overflow-hidden bg-[#0F0F0F] flex-none">
        <img
          src={resolveMediaUrl(hubCover, '/media/guest/tile-entertainment.webp')}
          alt={hubTitle}
          onError={(e) => {
            const fallback = resolveMediaUrl('/media/guest/tile-entertainment.webp');
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
            onClick={() => navigate(homePath)}
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
            Curated Experiences
          </p>
          <h1 className="font-fs-sans font-extralight text-[26px] sm:text-[34px] lg:text-[40px] leading-[1.2] tracking-[0.18em] uppercase text-white">
            {hubTitle}
          </h1>
          {hubSubtitle && (
            <p className="font-fs-serif text-[15px] sm:text-[17px] text-white/85 mt-1.5 max-w-2xl leading-snug">
              {hubSubtitle}
            </p>
          )}
        </div>
      </header>

      {/* ===================== 2. DISCOVER EXPERIENCES GALLERY (.TallImageCard) ===================== */}
      <main className="flex-1 w-full max-w-[1140px] mx-auto px-4 sm:px-8 py-8 sm:py-14 space-y-12">
        {displayItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-[30px]">
            {displayItems.map((item) => (
              <div
                key={item.id}
                onClick={() => setActiveItem(item)}
                className="w-full flex flex-col cursor-pointer group"
              >
                {/* 4:5 Portrait Experience Image */}
                <div className="relative w-full aspect-[4/4.6] overflow-hidden bg-[var(--fs-surface-subtle)] border border-[var(--fs-border)]">
                  <img
                    src={resolveMediaUrl(item.image, '/media/guest/tile-entertainment.webp')}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    loading="lazy"
                  />
                  {item.badge && (
                    <span className="absolute top-3 left-3 px-2.5 py-1 bg-black/85 text-white font-fs-sans text-[9.5px] font-bold uppercase tracking-[0.18em]">
                      {item.badge}
                    </span>
                  )}
                </div>

                {/* Left-Aligned Editorial Stack Below Image */}
                <div className="pt-4 space-y-2">
                  <h4 className="font-fs-serif text-[21px] sm:text-[22px] text-[var(--fs-text)] leading-snug group-hover:opacity-75 transition-opacity">
                    {item.title}
                  </h4>

                  {item.schedule && (
                    <div className="flex items-center gap-2 font-fs-sans text-[12.5px] tracking-[0.08em] text-[var(--fs-text-muted)]">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                      <span>{item.schedule}</span>
                    </div>
                  )}

                  {item.subtitle && (
                    <p className="font-fs-serif text-[15px] text-[var(--fs-text-muted)] line-clamp-3 leading-relaxed">
                      {item.subtitle}
                    </p>
                  )}

                  {item.price && (
                    <div className="pt-1 font-fs-sans text-[14px] font-bold tracking-[0.06em] text-[var(--fs-text)]">
                      {item.price}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-16 px-6 bg-[var(--fs-surface-subtle)] border border-[var(--fs-border)] flex flex-col items-center justify-center text-center space-y-3">
            <h3 className="font-fs-sans font-extralight text-[20px] tracking-[0.18em] uppercase text-[var(--fs-text)]">
              {selectedLang === 'az' ? 'Fəaliyyət əlavə edilməyib' : 'No activities added'}
            </h3>
            <p className="font-fs-serif text-[15.5px] text-[var(--fs-text-muted)] max-w-sm">
              {selectedLang === 'az'
                ? 'Bu bölmədə hələlik heç bir əyləncə fəaliyyəti əlavə edilməyib.'
                : 'No entertainment activities added yet.'}
            </p>
          </div>
        )}

        {/* Concierge Tours & Activities Strip */}
        <div className="p-6 sm:p-8 bg-[var(--fs-surface-subtle)] border border-[var(--fs-border)] flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="space-y-1">
            <span className="fs-kicker text-[var(--fs-text-muted)] block">Concierge Desk</span>
            <h4 className="font-fs-serif text-[21px] text-[var(--fs-text)]">
              {selectedLang === 'ru'
                ? 'Бронирование развлечений и туров'
                : selectedLang === 'en'
                ? 'Activities & Tour Reservations'
                : 'Əyləncə və Tur Rezervasiyası'}
            </h4>
            <p className="font-fs-serif text-[15px] text-[var(--fs-text-muted)]">
              {selectedLang === 'ru'
                ? 'Внутренний номер: 4 или Ресепшн'
                : selectedLang === 'en'
                ? 'Internal ext: 4 or Reception'
                : 'Daxili xətt: 4 və ya Resepşn'}
            </p>
          </div>
          <a
            href={`https://wa.me/${displayWhatsapp}?text=${encodeURIComponent(
              'Salam, oteldəki əyləncə tədbirləri və turlar üçün rezervasiya etmək istəyirəm.'
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="fs-btn-outline shrink-0"
          >
            {selectedLang === 'ru' ? 'Бронь в WhatsApp' : selectedLang === 'en' ? 'WhatsApp Booking' : 'WhatsApp Rezervasiya'}
          </a>
        </div>
      </main>

      {/* ===================== 3. DETAIL MODAL ===================== */}
      <AnimatePresence>
        {activeItem && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[var(--fs-backdrop)] backdrop-blur-[2px]"
              onClick={() => setActiveItem(null)}
            />

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              className="relative z-10 w-full max-w-[520px] max-h-[88vh] overflow-y-auto rounded-none bg-[var(--fs-card)] border-t sm:border border-[var(--fs-border)] text-[var(--fs-text)] shadow-2xl"
            >
              {activeItem.image && (
                <div className="w-full h-[220px] overflow-hidden bg-[var(--fs-surface-subtle)]">
                  <img
                    src={resolveMediaUrl(activeItem.image, '/media/guest/tile-entertainment.webp')}
                    alt={activeItem.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="p-6 sm:p-8 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    {activeItem.badge && (
                      <span className="inline-block text-[9.5px] font-bold uppercase tracking-[0.18em] px-2.5 py-0.5 border border-[var(--fs-border-strong)]">
                        {activeItem.badge}
                      </span>
                    )}
                    <h3 className="font-fs-sans font-extralight text-[21px] uppercase tracking-[0.15em] text-[var(--fs-text)]">
                      {activeItem.title}
                    </h3>
                    {activeItem.subtitle && (
                      <span className="fs-eyebrow text-[15px] text-[var(--fs-text-muted)] block">
                        {activeItem.subtitle}
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveItem(null)}
                    className="w-8 h-8 border border-[var(--fs-border)] hover:border-[var(--fs-border-strong)] flex items-center justify-center text-[var(--fs-text-muted)] hover:text-[var(--fs-text)] shrink-0"
                  >
                    ✕
                  </button>
                </div>

                <p className="font-fs-serif text-[16px] text-[var(--fs-text-body)] leading-relaxed whitespace-pre-line">
                  {activeItem.description}
                </p>

                {activeItem.schedule && (
                  <div className="p-3.5 bg-[var(--fs-surface-subtle)] border border-[var(--fs-border)] text-xs tracking-[0.06em] text-[var(--fs-text-muted)] flex items-center gap-2.5">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    <span>{activeItem.schedule}</span>
                  </div>
                )}

                {activeItem.price && (
                  <div className="font-fs-sans text-[18px] font-bold tracking-[0.06em] text-[var(--fs-text)] pt-1">
                    {activeItem.price}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-[var(--fs-border)]">
                  <a
                    href={`https://wa.me/${displayWhatsapp}?text=${encodeURIComponent(
                      `Salam, [${activeItem.title}${
                        activeItem.price ? ` - ${activeItem.price}` : ''
                      }] ilə bağlı rezervasiya etmək istəyirəm.\nOtaq nömrəsi: `
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
                      setActiveItem(null);
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
