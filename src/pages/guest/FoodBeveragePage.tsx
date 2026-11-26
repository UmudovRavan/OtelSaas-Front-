import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useGuestCart } from '../../context/GuestCartContext';
import { defaultHotelData } from './guestData';
import { translations, Language } from '../../utils/translations';
import { publicService, PublicHotelProfile } from '../../services/api/publicService';
import {
  foodBeverageVenues,
  getVenueByCodeOrId,
  VenueCategory,
  FoodBeverageItem,
} from '../../data/foodBeverageData';
import { InquirySheet } from './components/InquirySheet';
import { useHub, useCatalogCategory, useHotelPortal } from '../../hooks/useHotelData';
import { resolveMediaUrl } from '../../utils/media';
import { useGuestDocumentMeta } from '../../utils/documentHead';
import { useLanguage } from '../../context/LanguageContext';
import { tr, SupportedLang } from '../../utils/i18n';
import { GuestLangPill } from './components/GuestLangPill';
import { HubType } from '../../types/api';

export const FoodBeveragePage: React.FC = () => {
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
  const isCategoryRoute = location.pathname.includes('/c/');

  // Lookup portal to find dynamic hub code if not given in URL
  const { data: portalData } = useHotelPortal(hotelSlug);
  const matchingFoodHub = portalData?.hubs?.find((h) => h.hubType === HubType.FoodAndBeverage);
  const hubCodeOrId = isHubRoute
    ? code || matchingFoodHub?.code || matchingFoodHub?.externalId || '192'
    : matchingFoodHub?.code || matchingFoodHub?.externalId || '192';

  // Dynamic Live Hub (Food & Beverage / Dining)
  const { data: hubData } = useHub(hotelSlug, hubCodeOrId);

  const hubTitle = tr(
    hubData?.titleTr,
    hubData?.title || (selectedLang === 'ru' ? 'Еда и напитки' : selectedLang === 'en' ? 'Food & Beverage' : 'Qida və içki'),
    selectedLang as SupportedLang
  );
  const hubSubtitle = tr(hubData?.subtitleTr, hubData?.subtitle || '', selectedLang as SupportedLang);
  const hubCover = resolveMediaUrl(hubData?.coverImageUrl, '/media/guest/restaurant-table.webp');

  const liveVenues: VenueCategory[] = React.useMemo(() => {
    if (hubData?.categories && hubData.categories.length > 0) {
      return hubData.categories.map((c) => ({
        id: c.id,
        code: String(c.externalId || c.id),
        title: tr(c.titleTr, c.title, selectedLang as SupportedLang),
        subtitle: tr(c.subtitleTr, c.subtitle || '', selectedLang as SupportedLang),
        cover: resolveMediaUrl(c.imageUrl, hubCover),
        hours: c.workingHours || '08:00–23:00',
        type: 'restaurant',
        items: [],
      }));
    }
    return isDemoHotel ? foodBeverageVenues : [];
  }, [hubData, hotelSlug, hubCover, isDemoHotel, selectedLang]);

  // Active venue selection (only if in category view /c/:code)
  const [activeVenue, setActiveVenue] = useState<VenueCategory | null>(() => {
    if (isCategoryRoute && code) {
      return getVenueByCodeOrId(code) || null;
    }
    const match = location.pathname.match(/\/c\/([0-9a-zA-Z_\-]+)/);
    if (match) {
      return getVenueByCodeOrId(match[1]) || null;
    }
    return null;
  });

  // Query live category detail when activeVenue is selected
  const activeCategoryCode = activeVenue?.code || activeVenue?.id;
  const { data: catDetail } = useCatalogCategory(hotelSlug, activeCategoryCode);

  // Sync activeVenue if opened via /c/:code with dynamic data
  useEffect(() => {
    if (isCategoryRoute) {
      const catCode = code || location.pathname.match(/\/c\/([0-9a-zA-Z_\-]+)/)?.[1];
      if (catCode) {
        const found = liveVenues.find((v) => v.code === catCode || v.id === catCode) || getVenueByCodeOrId(catCode);
        if (found) {
          setActiveVenue(found);
        } else if (catDetail) {
          setActiveVenue({
            id: catDetail.id,
            code: String(catDetail.externalId || catDetail.id),
            title: catDetail.title,
            subtitle: catDetail.subtitle || '',
            cover: resolveMediaUrl(catDetail.imageUrl, hubCover),
            hours: catDetail.workingHours || '08:00–23:00',
            type: 'restaurant',
            items: [],
          });
        }
      }
    } else {
      setActiveVenue(null);
    }
  }, [isCategoryRoute, code, location.pathname, liveVenues, catDetail, hubCover]);

  const displayItems: FoodBeverageItem[] = React.useMemo(() => {
    if (catDetail?.items && catDetail.items.length > 0) {
      return catDetail.items.map((it) => ({
        id: it.id,
        name: tr(it.titleTr, it.title, selectedLang as SupportedLang),
        nameEn: it.titleTr?.en || it.title,
        nameRu: it.titleTr?.ru || it.title,
        price: `${it.price} ₼`,
        priceNum: it.price,
        badge: tr(it.badgeTr, it.badge || '', selectedLang as SupportedLang) || undefined,
        image: it.imageUrl ? resolveMediaUrl(it.imageUrl) : undefined,
        desc: tr(it.descriptionTr, it.description || it.subtitle || '', selectedLang as SupportedLang) || undefined,
      }));
    }
    return (activeVenue?.items || []).map((it) => ({
      ...it,
      name:
        selectedLang === 'en' && it.nameEn
          ? it.nameEn
          : selectedLang === 'ru' && it.nameRu
          ? it.nameRu
          : it.name,
    }));
  }, [catDetail, activeVenue, selectedLang]);

  // Active item detail modal
  const [activeItem, setActiveItem] = useState<FoodBeverageItem | null>(null);

  // Shared Cart State from Context
  const { cart, addItem, removeItem, totalCount, totalPrice } = useGuestCart();
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
        console.warn('Hotel fetch error in FoodBeveragePage:', err);
      });
  }, [hotelSlug, selectedLang]);

  const homePath = slug ? `/hotel/${slug}` : '/';
  const displayWhatsapp = (liveHotel?.whatsApp || (isDemoHotel ? hotel.whatsapp : '')).replace(/[^0-9]/g, '');

  const hotelTitleName = liveHotel?.name || portalData?.name || (isDemoHotel ? hotel.name : '');
  const pageTabTitle = activeVenue ? activeVenue.title : hubTitle;
  useGuestDocumentMeta(
    hotelTitleName ? `${pageTabTitle} | ${hotelTitleName}` : pageTabTitle,
    liveHotel?.logoUrl || portalData?.logoUrl || (isDemoHotel ? hotel.logo : undefined)
  );

  const handleVenueClick = (venue: VenueCategory) => {
    setActiveVenue(venue);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (slug) {
      navigate(`/${hotelSlug}/hotel/c/${venue.code}`, { replace: false });
    } else {
      navigate(`/c/${venue.code}`, { replace: false });
    }
  };

  const handleBackFromVenue = () => {
    setActiveVenue(null);
    if (slug) {
      navigate(`/${hotelSlug}/hotel/g/${hubCodeOrId}`, { replace: true });
    } else {
      navigate(`/g/${hubCodeOrId}`, { replace: true });
    }
  };

  return (
    <div className="fs-portal min-h-screen flex flex-col selection:bg-black selection:text-white pb-24">
      {/* ===================== 1. FULL-BLEED ARCHITECTURAL HERO ===================== */}
      <header className="relative w-full h-[240px] sm:h-[320px] lg:h-[380px] overflow-hidden bg-[#0F0F0F] flex-none">
        <img
          src={resolveMediaUrl(activeVenue ? activeVenue.cover : hubCover, '/media/guest/restaurant-table.webp')}
          alt={activeVenue ? activeVenue.title : hubTitle}
          onError={(e) => {
            const fallback = resolveMediaUrl('/media/guest/restaurant-table.webp');
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

        {/* Top Navigation Controls */}
        <div className="relative z-20 max-w-[1280px] mx-auto px-4 sm:px-8 pt-4 flex items-center justify-between">
          <button
            type="button"
            onClick={activeVenue ? handleBackFromVenue : () => navigate(homePath)}
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

        {/* Bottom-Aligned Editorial Heading */}
        <div className="absolute inset-x-0 bottom-0 z-20 max-w-[1140px] mx-auto px-4 sm:px-8 pb-6 sm:pb-9">
          <p className="fs-eyebrow text-[16px] sm:text-[18px] text-white/85 mb-1">
            {activeVenue ? activeVenue.hours || 'Culinary Experience' : 'Restaurants & Bars'}
          </p>
          <h1 className="font-fs-sans font-extralight text-[26px] sm:text-[34px] lg:text-[40px] leading-[1.2] tracking-[0.18em] uppercase text-white">
            {activeVenue ? activeVenue.title : hubTitle}
          </h1>
          {(activeVenue?.subtitle || (!activeVenue && hubSubtitle)) && (
            <p className="font-fs-serif text-[15px] sm:text-[17px] text-white/85 mt-1.5 max-w-2xl leading-snug">
              {activeVenue ? activeVenue.subtitle : hubSubtitle}
            </p>
          )}
        </div>
      </header>

      {/* ===================== 2. MAIN RESPONSIVE CONTENT ===================== */}
      <main className="flex-1 w-full max-w-[1140px] mx-auto px-4 sm:px-8 py-8 sm:py-12">
        {/* VIEW A: RESTAURANT / BAR CATEGORIES GALLERY */}
        {!activeVenue && (
          <div className="space-y-10">
            {liveVenues.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-[30px]">
                {liveVenues.map((venue) => (
                  <button
                    key={venue.id}
                    type="button"
                    onClick={() => handleVenueClick(venue)}
                    className="w-full rounded-none bg-[var(--fs-card)] border border-[var(--fs-border)] hover:border-[var(--fs-border-strong)] flex flex-col text-left transition-colors group focus:outline-none"
                  >
                    <div className="relative w-full aspect-[16/10] overflow-hidden bg-[var(--fs-surface-subtle)]">
                      <img
                        src={resolveMediaUrl(venue.cover, '/media/guest/restaurant-table.webp')}
                        alt={venue.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                        loading="lazy"
                      />
                    </div>

                    <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4 w-full">
                      <div className="space-y-2">
                        {venue.hours && (
                          <span className="fs-kicker text-[var(--fs-text-muted)] block">
                            {venue.hours}
                          </span>
                        )}
                        <h3 className="font-fs-sans font-bold text-[14px] sm:text-[15px] tracking-[0.20em] uppercase text-[var(--fs-text)]">
                          {venue.title}
                        </h3>
                        {venue.subtitle && (
                          <p className="font-fs-serif text-[15.5px] text-[var(--fs-text-muted)] leading-relaxed line-clamp-2">
                            {venue.subtitle}
                          </p>
                        )}
                      </div>

                      <div className="pt-2">
                        <span className="fs-link-underlined text-[var(--fs-text)]">
                          <span>
                            {selectedLang === 'ru'
                              ? 'Открыть меню'
                              : selectedLang === 'en'
                              ? 'View Menu'
                              : 'Menyuya Bax'}
                          </span>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="m9 18 6-6-6-6" />
                          </svg>
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="py-16 px-6 bg-[var(--fs-surface-subtle)] border border-[var(--fs-border)] flex flex-col items-center justify-center text-center space-y-3">
                <h3 className="font-fs-sans font-extralight text-[20px] tracking-[0.18em] uppercase text-[var(--fs-text)]">
                  {selectedLang === 'az' ? 'Məkan əlavə edilməyib' : selectedLang === 'ru' ? 'Заведения не добавлены' : 'No venues added'}
                </h3>
                <p className="font-fs-serif text-[15.5px] text-[var(--fs-text-muted)] max-w-sm">
                  {selectedLang === 'az' ? 'Bu bölmədə hələlik heç bir restoran və ya kafe əlavə edilməyib.' : 'No restaurant or cafe added yet.'}
                </p>
              </div>
            )}

            {/* Concierge Room Service Strip */}
            <div className="p-6 sm:p-8 bg-[var(--fs-surface-subtle)] border border-[var(--fs-border)] flex flex-col sm:flex-row sm:items-center justify-between gap-5">
              <div className="space-y-1">
                <span className="fs-kicker text-[var(--fs-text-muted)] block">In-Room Dining</span>
                <h4 className="font-fs-serif text-[21px] text-[var(--fs-text)]">
                  {selectedLang === 'ru'
                    ? 'Обслуживание номеров и бронирование'
                    : selectedLang === 'en'
                    ? 'Room Service & Reservations'
                    : 'Otaq Xidməti & Rezervasiya'}
                </h4>
                <p className="font-fs-serif text-[15px] text-[var(--fs-text-muted)]">
                  {selectedLang === 'ru'
                    ? 'Круглосуточно · внутренний номер: 3'
                    : selectedLang === 'en'
                    ? '24/7 service · internal ext: 3'
                    : '24 saat fasiləsiz daxili zəng: 3'}
                </p>
              </div>
              <a
                href={`https://wa.me/${displayWhatsapp}?text=${encodeURIComponent(
                  'Salam, otaq xidməti və ya restoran rezervasiyası ilə bağlı müraciət etmək istəyirəm.'
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="fs-btn-outline shrink-0"
              >
                {selectedLang === 'ru'
                  ? 'Бронь в WhatsApp'
                  : selectedLang === 'en'
                  ? 'WhatsApp Booking'
                  : 'WhatsApp Rezervasiya'}
              </a>
            </div>
          </div>
        )}

        {/* VIEW B: VENUE DETAIL / MENU ITEMS LIST */}
        {activeVenue && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[var(--fs-border)]">
              <span className="fs-kicker text-[var(--fs-text-muted)]">
                {displayItems.length}{' '}
                {selectedLang === 'ru' ? 'позиций' : selectedLang === 'en' ? 'items' : 'təklif mövcuddur'}
              </span>
              <button
                type="button"
                onClick={handleBackFromVenue}
                className="fs-link-underlined text-[var(--fs-text)]"
              >
                {selectedLang === 'ru'
                  ? '← Все рестораны'
                  : selectedLang === 'en'
                  ? '← All restaurants'
                  : '← Bütün restoranlar'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {displayItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setActiveItem(item)}
                  className="w-full rounded-none bg-[var(--fs-card)] border border-[var(--fs-border)] hover:border-[var(--fs-border-strong)] p-3.5 sm:p-4 flex items-center justify-between gap-4 cursor-pointer transition-colors group"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    {item.image && (
                      <div className="w-[88px] h-[76px] sm:w-[100px] sm:h-[84px] flex-none rounded-none overflow-hidden bg-[var(--fs-surface-subtle)]">
                        <img
                          src={resolveMediaUrl(item.image, '/media/guest/plate.webp')}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                      </div>
                    )}

                    <div className="min-w-0 pr-1 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-fs-serif text-[18px] sm:text-[19px] font-medium text-[var(--fs-text)] leading-snug">
                          {item.name}
                        </h4>
                        {item.badge && (
                          <span className="text-[9.5px] font-bold uppercase tracking-[0.16em] px-2 py-0.5 border border-[var(--fs-border-strong)] text-[var(--fs-text)] whitespace-nowrap">
                            {item.badge}
                          </span>
                        )}
                      </div>

                      {item.desc && (
                        <p className="font-fs-serif text-[14px] text-[var(--fs-text-muted)] line-clamp-2 leading-relaxed">
                          {item.desc}
                        </p>
                      )}

                      {item.price && (
                        <span className="font-fs-sans text-[13px] font-bold tracking-[0.08em] text-[var(--fs-text)] block pt-0.5">
                          {item.price}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Stepper or Add Button */}
                  <div className="flex items-center flex-none">
                    {(cart[item.id] || 0) > 0 ? (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="w-[34px] flex flex-col items-center justify-between bg-[var(--fs-inv-bg)] text-[var(--fs-inv-text)] border border-[var(--fs-border-strong)] py-1 select-none"
                      >
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          aria-label="Azalt"
                          className="w-full h-[24px] flex items-center justify-center font-bold text-sm leading-none hover:opacity-75"
                        >
                          –
                        </button>
                        <span className="font-fs-sans font-bold text-[12px] leading-none py-1 tabular-nums">
                          {cart[item.id]}
                        </span>
                        <button
                          type="button"
                          onClick={() => addItem(item.id)}
                          aria-label="Artır"
                          className="w-full h-[24px] flex items-center justify-center font-bold text-sm leading-none hover:opacity-75"
                        >
                          +
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          addItem(item.id);
                        }}
                        aria-label="Səbətə əlavə et"
                        className="w-9 h-9 border border-[var(--fs-border-strong)] text-[var(--fs-text)] hover:bg-[var(--fs-inv-bg)] hover:text-[var(--fs-inv-text)] flex items-center justify-center text-lg font-light transition-colors"
                      >
                        +
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* ===================== 3. ARCHITECTURAL FLOATING CART BAR ===================== */}
      <AnimatePresence>
        {totalCount > 0 && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            className="fixed bottom-4 inset-x-0 z-40 flex justify-center px-4 pointer-events-none"
          >
            <button
              type="button"
              onClick={() => navigate(slug ? `/hotel/${slug}/cart` : '/cart')}
              className="pointer-events-auto w-full max-w-[560px] min-h-[60px] flex items-center justify-between gap-4 px-5 py-3 rounded-none bg-[#000000] border border-white/25 shadow-[0_12px_32px_rgba(0,0,0,0.35)] text-white text-left group"
            >
              <div className="flex items-center gap-4">
                <div className="relative w-10 h-10 border border-white/30 flex items-center justify-center text-white shrink-0">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M16 10a4 4 0 0 1-8 0" />
                    <path d="M3.103 6.034h17.794" />
                    <path d="M3.4 5.467a2 2 0 0 0-.4 1.2V20a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6.667a2 2 0 0 0-.4-1.2l-2-2.667A2 2 0 0 0 17 2H7a2 2 0 0 0-1.6.8z" />
                  </svg>
                  <span className="absolute -top-2 -right-2 min-w-[20px] h-[20px] px-1 bg-white text-black font-fs-sans font-bold text-[11px] flex items-center justify-center tabular-nums">
                    {totalCount}
                  </span>
                </div>

                <div>
                  <span className="font-fs-sans text-[11px] font-bold tracking-[0.22em] uppercase text-white block">
                    {selectedLang === 'ru' ? 'Корзина' : selectedLang === 'en' ? 'View Cart' : 'Səbətə bax'}
                  </span>
                  <span className="font-fs-serif text-[14px] text-white/75 block mt-0.5 tabular-nums">
                    {totalCount} {selectedLang === 'ru' ? 'шт.' : selectedLang === 'en' ? 'items' : 'məhsul'} · {totalPrice.toFixed(2)} ₼
                  </span>
                </div>
              </div>

              <span className="text-white/80 group-hover:translate-x-1 transition-transform">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===================== 4. ITEM DETAIL MODAL ===================== */}
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
              className="relative z-10 w-full max-w-[500px] max-h-[88vh] overflow-y-auto rounded-none bg-[var(--fs-card)] border-t sm:border border-[var(--fs-border)] text-[var(--fs-text)] shadow-2xl"
            >
              {activeItem.image && (
                <div className="w-full h-[220px] overflow-hidden bg-[var(--fs-surface-subtle)]">
                  <img
                    src={resolveMediaUrl(activeItem.image, '/media/guest/plate.webp')}
                    alt={activeItem.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="p-6 sm:p-8 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1.5">
                    {activeItem.badge && (
                      <span className="inline-block text-[9.5px] font-bold uppercase tracking-[0.18em] px-2.5 py-0.5 border border-[var(--fs-border-strong)] text-[var(--fs-text)]">
                        {activeItem.badge}
                      </span>
                    )}
                    <h3 className="font-fs-sans font-extralight text-[21px] uppercase tracking-[0.15em] text-[var(--fs-text)]">
                      {activeItem.name}
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveItem(null)}
                    className="w-8 h-8 border border-[var(--fs-border)] hover:border-[var(--fs-border-strong)] flex items-center justify-center text-[var(--fs-text-muted)] hover:text-[var(--fs-text)] shrink-0"
                  >
                    ✕
                  </button>
                </div>

                {activeItem.desc && (
                  <p className="font-fs-serif text-[16px] text-[var(--fs-text-muted)] leading-relaxed">
                    {activeItem.desc}
                  </p>
                )}

                {activeItem.price && (
                  <div className="font-fs-sans text-[18px] font-bold tracking-[0.06em] text-[var(--fs-text)] pt-1">
                    {activeItem.price}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-[var(--fs-border)]">
                  <button
                    type="button"
                    onClick={() => {
                      addItem(activeItem.id);
                      setActiveItem(null);
                    }}
                    className="fs-btn-primary w-full"
                  >
                    {selectedLang === 'ru'
                      ? 'В корзину'
                      : selectedLang === 'en'
                      ? 'Add to Cart'
                      : 'Səbətə Əlavə Et'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsInquiryOpen(true);
                      setActiveItem(null);
                    }}
                    className="fs-btn-outline w-full"
                  >
                    {selectedLang === 'ru'
                      ? 'Прямой заказ'
                      : selectedLang === 'en'
                      ? 'Direct Order'
                      : 'Birbaşa Sifariş'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ===================== 5. INQUIRY MODAL ===================== */}
      <InquirySheet
        isOpen={isInquiryOpen}
        onClose={() => setIsInquiryOpen(false)}
        t={t.inquiry}
        slug={hotelSlug}
      />
    </div>
  );
};
