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
import { HubType } from '../../types/api';

export const EntertainmentPage: React.FC = () => {
  const { slug, code } = useParams<{ slug?: string; code?: string }>();
  const hotelSlug = slug || 'skyhill';
  const navigate = useNavigate();
  const location = useLocation();

  const [selectedLang] = useState<Language>('az');
  const [liveHotel, setLiveHotel] = useState<PublicHotelProfile | null>(null);

  const isHubRoute = location.pathname.includes('/g/');

  // Lookup portal to find dynamic entertainment hub code
  const { data: portalData } = useHotelPortal(hotelSlug);
  const matchingEntertainmentHub = portalData?.hubs?.find((h) => h.hubType === HubType.Entertainment);
  const hubCodeOrId = isHubRoute
    ? (code || matchingEntertainmentHub?.code || matchingEntertainmentHub?.externalId || '194')
    : (matchingEntertainmentHub?.code || matchingEntertainmentHub?.externalId || '194');

  // Dynamic Live Hub (Entertainment)
  const { data: hubData } = useHub(hotelSlug, hubCodeOrId);

  const hubTitle = hubData?.title || hubData?.titleTr?.az || (selectedLang === 'az' ? 'Əyləncə' : 'Entertainment');
  const hubSubtitle = hubData?.subtitle || hubData?.subtitleTr?.az || (selectedLang === 'az' ? 'Aktiv istirahət, turlar və axşam proqramları' : 'Activities, tours & evening programs');
  const hubCover = resolveMediaUrl(hubData?.coverImageUrl, '/media/guest/entertainment-bg.webp');

  // Live category 4596 (Entertainment items)
  const { data: catDetail } = useCatalogCategory(hotelSlug, '4596');

  const displayItems: EntertainmentItem[] = React.useMemo(() => {
    // 1. Items from dynamic hub
    if (hubData?.directItems && hubData.directItems.length > 0) {
      return hubData.directItems.map((it) => ({
        id: it.id,
        code: String(it.externalId || it.id),
        title: it.title,
        titleEn: it.titleTr?.en || it.title,
        titleRu: it.titleTr?.ru || it.title,
        subtitle: it.subtitle || it.description || '',
        price: it.price ? `${it.price} ₼` : 'Ödənişsiz',
        priceNum: it.price || 0,
        badge: it.badge || it.badgeTr?.az || undefined,
        image: it.imageUrl ? resolveMediaUrl(it.imageUrl) : hubCover,
        description: it.description || it.subtitle || '',
        schedule: it.portionOrDuration || '10:00–23:00',
      }));
    }
    // 2. Items from catalog category detail
    if (catDetail?.items && catDetail.items.length > 0) {
      return catDetail.items.map((it) => ({
        id: it.id,
        code: String(it.externalId || it.id),
        title: it.title,
        titleEn: it.titleTr?.en || it.title,
        titleRu: it.titleTr?.ru || it.title,
        subtitle: it.subtitle || it.description || '',
        price: it.price ? `${it.price} ₼` : 'Ödənişsiz',
        priceNum: it.price || 0,
        badge: it.badge || it.badgeTr?.az || undefined,
        image: it.imageUrl ? resolveMediaUrl(it.imageUrl) : hubCover,
        description: it.description || it.subtitle || '',
        schedule: it.portionOrDuration || '10:00–23:00',
      }));
    }
    return hotelSlug === 'skyhill' ? entertainmentItems : [];
  }, [hubData, catDetail, hotelSlug, hubCover]);

  // Active item detail modal
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
  const displayPhone = liveHotel?.phone || (hotelSlug === 'skyhill' ? hotel.phone : '');
  const displayWhatsapp = (liveHotel?.whatsApp || (hotelSlug === 'skyhill' ? hotel.whatsapp : '')).replace(/[^0-9]/g, '');

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] font-hotel-sans flex justify-center selection:bg-[#A78BFA] selection:text-black transition-colors duration-200">
      {/* Main Responsive Column */}
      <div className="w-full max-w-[540px] min-h-screen bg-[var(--bg-main)] flex flex-col relative pb-10 border-x border-[var(--border-color)] overflow-x-hidden shadow-2xl">
        
        {/* ===================== 1. HERO HEADER (1:1 with Reference) ===================== */}
        <header className="relative w-full h-[178px] overflow-hidden bg-[#181424] flex-none">
          <img
            src={hubCover}
            alt={hubTitle}
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
              onClick={() => navigate(homePath)}
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
              {hubTitle}
            </h1>
            {hubSubtitle && (
              <p
                className="text-[12px] text-white/85 font-hotel-sans mt-1 leading-snug"
                style={{ filter: 'drop-shadow(0 1px 4px rgba(0,0,0,0.8))' }}
              >
                {hubSubtitle}
              </p>
            )}
          </div>
        </header>

        {/* ===================== 2. SHEET BODY (11 Items from Reference) ===================== */}
        <div className="relative z-10 -mt-2.5 rounded-t-[22px] bg-[var(--bg-main)] pt-3 px-3.5 flex-1 flex flex-col">
          <div className="space-y-2.5 pt-1">
            {displayItems.length > 0 ? (
              displayItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setActiveItem(item)}
                  className="w-full rounded-[14px] bg-[var(--bg-card)] border border-[var(--border-color)] p-2.5 flex items-center justify-between gap-3 cursor-pointer shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:border-[#a87b51]/40 dark:hover:border-[#A78BFA]/40 active:scale-[0.99] transition-all group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Thumbnail 84x64px */}
                    <div className="w-[84px] h-[64px] sm:w-[92px] sm:h-[68px] flex-none rounded-[10px] overflow-hidden bg-black/10 dark:bg-black/30">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    </div>

                    {/* Title, Badge, Subtitle & Price */}
                    <div className="min-w-0 pr-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="font-semibold text-xs sm:text-[13.5px] text-[var(--text-main)] group-hover:text-[#a87b51] dark:group-hover:text-[#A78BFA] transition-colors leading-tight">
                          {item.title}
                        </h4>
                        {item.badge && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-[#a87b51]/15 dark:bg-[#A78BFA]/20 text-[#a87b51] dark:text-[#A78BFA] border border-[#a87b51]/30 dark:border-[#A78BFA]/30 whitespace-nowrap">
                            {item.badge}
                          </span>
                        )}
                      </div>

                      <p className="text-[11.5px] text-[var(--text-muted)] font-hotel-sans mt-0.5 truncate">
                        {item.subtitle}
                      </p>

                      {item.price && (
                        <span className="text-xs font-bold text-[#a87b51] dark:text-[#A78BFA] block mt-1">
                          {item.price}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right Chevron > */}
                  <span className="text-[var(--text-muted)] group-hover:text-[var(--text-main)] group-hover:translate-x-0.5 transition-all pr-1 flex-none">
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
                </div>
              ))
            ) : (
              <div className="py-16 px-6 flex flex-col items-center justify-center text-center">
                <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-3 text-[#A78BFA]">
                  <span className="text-2xl">🎮</span>
                </div>
                <h3 className="font-hotel-serif text-[18px] font-semibold text-[var(--text-main)] mb-1">
                  {selectedLang === 'az' ? 'Fəaliyyət əlavə edilməyib' : 'No activities added'}
                </h3>
                <p className="text-[12.5px] text-[var(--text-muted)] max-w-[280px]">
                  {selectedLang === 'az' ? 'Bu bölmədə hələlik heç bir əyləncə fəaliyyəti əlavə edilməyib.' : 'No entertainment activities added yet.'}
                </p>
              </div>
            )}
          </div>

          {/* Quick Concierge / Reception Contact Box */}
          <div className="pt-4 pb-2">
            <div className="p-3 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] flex items-center justify-between gap-3 shadow-sm">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-xl bg-[#a87b51]/15 dark:bg-[#A78BFA]/15 text-[#a87b51] dark:text-[#A78BFA] flex items-center justify-center text-sm font-bold">
                  🎯
                </span>
                <div>
                  <span className="text-xs font-bold text-[var(--text-main)] block">
                    Əyləncə və Tur Rezervasiyası
                  </span>
                  <span className="text-[11px] text-[var(--text-muted)] block">
                    Daxili xətt: 4 və ya Resepşn
                  </span>
                </div>
              </div>
              <a
                href={`https://wa.me/${displayWhatsapp}?text=${encodeURIComponent(
                  'Salam, oteldəki əyləncə tədbirləri və turlar üçün rezervasiya etmək istəyirəm.'
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

        {/* ===================== 3. DETAIL MODAL WHEN AN ITEM IS CLICKED ===================== */}
        <AnimatePresence>
          {activeItem && (
            <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/75 backdrop-blur-sm"
                onClick={() => setActiveItem(null)}
              />

              <motion.div
                initial={{ opacity: 0, y: 60 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 60 }}
                transition={{ type: 'spring', damping: 26, stiffness: 320 }}
                className="relative z-10 w-full max-w-[480px] max-h-[85vh] overflow-y-auto rounded-t-[26px] sm:rounded-[26px] bg-[var(--bg-card)] border border-[var(--border-color)] p-5 text-[var(--text-main)] shadow-2xl space-y-4"
              >
                <div className="w-12 h-1.5 rounded-full bg-white/20 mx-auto mb-1" />

                {activeItem.image && (
                  <div className="w-full h-[180px] rounded-2xl overflow-hidden bg-black/30">
                    <img
                      src={activeItem.image}
                      alt={activeItem.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-hotel-serif text-xl font-bold uppercase tracking-wide text-[var(--text-main)]">
                      {activeItem.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-[var(--text-muted)] font-medium">
                        📍 {activeItem.subtitle}
                      </span>
                      {activeItem.badge && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#a87b51]/15 dark:bg-[#A78BFA]/20 text-[#a87b51] dark:text-[#A78BFA] border border-[#a87b51]/30 dark:border-[#A78BFA]/30">
                          {activeItem.badge}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveItem(null)}
                    className="w-8 h-8 rounded-full bg-[var(--bg-subcard)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-main)]"
                  >
                    ✕
                  </button>
                </div>

                <p className="text-xs sm:text-[13px] text-[var(--text-main)]/90 leading-relaxed font-hotel-sans whitespace-pre-line">
                  {activeItem.description}
                </p>

                {activeItem.schedule && (
                  <div className="p-3 rounded-xl bg-[var(--bg-subcard)] border border-[var(--border-color)] text-xs text-[var(--text-muted)] flex items-center gap-2">
                    <span>🕒</span>
                    <span>{activeItem.schedule}</span>
                  </div>
                )}

                {activeItem.price && (
                  <div className="text-lg font-bold text-[#a87b51] dark:text-[#A78BFA]">
                    {activeItem.price}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[var(--border-color)]">
                  <a
                    href={`https://wa.me/${displayWhatsapp}?text=${encodeURIComponent(
                      `Salam, [${activeItem.title}${
                        activeItem.price ? ` - ${activeItem.price}` : ''
                      }] ilə bağlı rezervasiya etmək istəyirəm.\nOtaq nömrəsi: `
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
                      setActiveItem(null);
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

