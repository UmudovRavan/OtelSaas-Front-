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
import { HubType } from '../../types/api';

export const FoodBeveragePage: React.FC = () => {
  const { slug, code } = useParams<{ slug?: string; code?: string }>();
  const hotelSlug = slug || 'skyhill';
  const navigate = useNavigate();
  const location = useLocation();

  const [selectedLang] = useState<Language>('az');
  const [liveHotel, setLiveHotel] = useState<PublicHotelProfile | null>(null);

  const isHubRoute = location.pathname.includes('/g/');
  const isCategoryRoute = location.pathname.includes('/c/');

  // Lookup portal to find dynamic hub code if not given in URL
  const { data: portalData } = useHotelPortal(hotelSlug);
  const matchingFoodHub = portalData?.hubs?.find((h) => h.hubType === HubType.FoodAndBeverage);
  const hubCodeOrId = isHubRoute
    ? (code || matchingFoodHub?.code || matchingFoodHub?.externalId || '192')
    : (matchingFoodHub?.code || matchingFoodHub?.externalId || '192');

  // Dynamic Live Hub (Food & Beverage / Dining)
  const { data: hubData } = useHub(hotelSlug, hubCodeOrId);

  const hubTitle = hubData?.title || hubData?.titleTr?.az || (selectedLang === 'az' ? 'Qida və içki' : 'Dining');
  const hubSubtitle = hubData?.subtitle || hubData?.subtitleTr?.az || '';
  const hubCover = resolveMediaUrl(hubData?.coverImageUrl, '/media/guest/restaurant-table.webp');

  const liveVenues: VenueCategory[] = React.useMemo(() => {
    if (hubData?.categories && hubData.categories.length > 0) {
      return hubData.categories.map((c) => ({
        id: c.id,
        code: String(c.externalId || c.id),
        title: c.title,
        subtitle: c.subtitle || '',
        cover: resolveMediaUrl(c.imageUrl, hubCover),
        hours: c.workingHours || '08:00–23:00',
        type: 'restaurant',
        items: [],
      }));
    }
    return hotelSlug === 'skyhill' ? foodBeverageVenues : [];
  }, [hubData, hotelSlug, hubCover]);

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
        name: it.title,
        nameEn: it.titleTr?.en || it.title,
        nameRu: it.titleTr?.ru || it.title,
        price: `${it.price} ₼`,
        priceNum: it.price,
        badge: it.badge || it.badgeTr?.az || undefined,
        image: it.imageUrl ? resolveMediaUrl(it.imageUrl) : undefined,
        desc: it.description || it.subtitle || undefined,
      }));
    }
    return activeVenue?.items || [];
  }, [catDetail, activeVenue]);

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
  const displayPhone = liveHotel?.phone || (hotelSlug === 'skyhill' ? hotel.phone : '');
  const displayWhatsapp = (liveHotel?.whatsApp || (hotelSlug === 'skyhill' ? hotel.whatsapp : '')).replace(/[^0-9]/g, '');

  const handleVenueClick = (venue: VenueCategory) => {
    setActiveVenue(venue);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // update URL gracefully
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
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] font-hotel-sans flex justify-center selection:bg-[#A78BFA] selection:text-black transition-colors duration-200">
      {/* Main Responsive Column */}
      <div className="w-full max-w-[540px] min-h-screen bg-[var(--bg-main)] flex flex-col relative pb-10 border-x border-[var(--border-color)] overflow-x-hidden shadow-2xl">
        
        {/* ===================== 1. HERO HEADER (1:1 with Reference) ===================== */}
        <header className="relative w-full h-[178px] overflow-hidden bg-[#181424] flex-none">
          {/* Cover image: Restaurant Table cover for main list, or Venue specific cover */}
          <img
            src={activeVenue ? activeVenue.cover : hubCover}
            alt={activeVenue ? activeVenue.title : hubTitle}
            className="absolute inset-0 w-full h-full object-cover transition-all duration-300"
          />

          {/* Dark luxury gradient shade matching .hotel_headShade__OttbO */}
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
              onClick={activeVenue ? handleBackFromVenue : () => navigate(homePath)}
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

          {/* Page Title at bottom-left in Cormorant Garamond Serif */}
          <div className="absolute bottom-[16px] left-[18px] right-[18px] z-20">
            <h1
              className="font-hotel-serif text-[28px] sm:text-[32px] leading-none font-semibold text-white tracking-wide"
              style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.7))' }}
            >
              {activeVenue ? activeVenue.title : hubTitle}
            </h1>
            {(activeVenue?.subtitle || (!activeVenue && hubSubtitle)) && (
              <p
                className="text-[12px] sm:text-[13px] text-white/85 font-hotel-sans mt-1 leading-snug"
                style={{ filter: 'drop-shadow(0 1px 4px rgba(0,0,0,0.8))' }}
              >
                {activeVenue ? activeVenue.subtitle : hubSubtitle}
              </p>
            )}
          </div>
        </header>

        {/* ===================== 2. SHEET BODY ===================== */}
        <div className="relative z-10 -mt-2.5 rounded-t-[22px] bg-[var(--bg-main)] pt-3 px-3.5 flex-1 flex flex-col">

          {/* VIEW A: RESTAURANT / BAR CATEGORIES LIST */}
          {!activeVenue && (
            <div className="space-y-2.5 pt-1">
              {liveVenues.length > 0 ? (
                liveVenues.map((venue) => (
                  <button
                    key={venue.id}
                    type="button"
                    onClick={() => handleVenueClick(venue)}
                    className="w-full rounded-[14px] bg-[var(--bg-card)] border border-[var(--border-color)] p-2 sm:p-2.5 flex items-center justify-between gap-3 text-left shadow-[0_2px_8px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.18)] hover:border-[#A78BFA]/50 active:scale-[0.99] transition-all group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Thumbnail Image 104x70px */}
                      <div className="w-[104px] h-[70px] sm:w-[110px] sm:h-[72px] flex-none rounded-[10px] overflow-hidden bg-black/10 dark:bg-black/40">
                        <img
                          src={venue.cover}
                          alt={venue.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      </div>

                      {/* Venue Title & Subtitle */}
                      <div className="min-w-0 pr-1">
                        <h3 className="font-hotel-serif text-[17px] sm:text-[18px] font-bold tracking-[0.035em] uppercase text-[var(--text-main)] truncate">
                          {venue.title}
                        </h3>
                        <p className="text-[12px] text-[var(--text-muted)] font-hotel-sans mt-0.5 leading-snug line-clamp-1">
                          {venue.subtitle}
                        </p>
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
                  </button>
                ))
              ) : (
                <div className="py-16 px-6 flex flex-col items-center justify-center text-center">
                  <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-3 text-[#A78BFA]">
                    <span className="text-2xl">🍽️</span>
                  </div>
                  <h3 className="font-hotel-serif text-[18px] font-semibold text-[var(--text-main)] mb-1">
                    {selectedLang === 'az' ? 'Məkan əlavə edilməyib' : selectedLang === 'ru' ? 'Заведения не добавлены' : 'No venues added'}
                  </h3>
                  <p className="text-[12.5px] text-[var(--text-muted)] max-w-[280px]">
                    {selectedLang === 'az' ? 'Bu bölmədə hələlik heç bir restoran və ya kafe əlavə edilməyib.' : 'No restaurant or cafe added yet.'}
                  </p>
                </div>
              )}

              {/* Quick WhatsApp / Reception Contact Box */}
              <div className="pt-3 pb-2">
                <div className="p-3 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-xl bg-[#A78BFA]/15 text-[#A78BFA] flex items-center justify-center text-sm font-bold">
                      🛎️
                    </span>
                    <div>
                      <span className="text-xs font-bold text-[var(--text-main)] block">
                        Otaq Xidməti & Rezervasiya
                      </span>
                      <span className="text-[11px] text-[var(--text-muted)] block">
                        24 saat fasiləsiz daxili zəng: 3
                      </span>
                    </div>
                  </div>
                  <a
                    href={`https://wa.me/${displayWhatsapp}?text=${encodeURIComponent(
                      'Salam, otaq xidməti və ya restoran rezervasiyası ilə bağlı müraciət etmək istəyirəm.'
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
          )}

          {/* VIEW B: VENUE DETAIL / MENU ITEMS LIST (Shirvan, SAQI, Elixir, Strike, etc.) */}
          {activeVenue && (
            <div className="space-y-2.5 pt-1">
              {/* Venue Sub-bar: category switch or back notice */}
              <div className="flex items-center justify-between pb-1 text-xs text-[var(--text-muted)]">
                <span className="font-medium">
                  {displayItems.length} təklif mövcuddur
                </span>
                <button
                  type="button"
                  onClick={handleBackFromVenue}
                  className="text-[#A78BFA] hover:underline font-semibold flex items-center gap-1"
                >
                  ← Bütün restoranlar
                </button>
              </div>

              {/* Venue Items List */}
              <div className="space-y-2">
                {displayItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setActiveItem(item)}
                    className="w-full rounded-[14px] bg-[var(--bg-card)] border border-[var(--border-color)] p-2.5 flex items-center justify-between gap-3 cursor-pointer shadow-[0_2px_6px_rgba(0,0,0,0.03)] hover:border-[#A78BFA]/40 active:scale-[0.99] transition-all group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Product Thumbnail (if image exists) */}
                      {item.image && (
                        <div className="w-[84px] h-[64px] sm:w-[92px] sm:h-[68px] flex-none rounded-[10px] overflow-hidden bg-black/10 dark:bg-black/30">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />
                        </div>
                      )}

                      {/* Title, Description, Badge & Price */}
                      <div className="min-w-0 pr-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="font-semibold text-xs sm:text-[13px] text-[var(--text-main)] group-hover:text-[#A78BFA] transition-colors leading-tight">
                            {item.name}
                          </h4>
                          {item.badge && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-[#A78BFA]/20 text-[#A78BFA] border border-[#A78BFA]/30 whitespace-nowrap">
                              {item.badge}
                            </span>
                          )}
                        </div>

                        {item.desc && (
                          <p className="text-[11px] text-[var(--text-muted)] font-hotel-sans mt-0.5 line-clamp-2 leading-relaxed">
                            {item.desc}
                          </p>
                        )}

                        {item.price && (
                          <span className="text-xs font-bold text-[#A78BFA] block mt-1">
                            {item.price}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Stepper Pill or Plus Button (Exact 1:1 with Screenshot 1) */}
                    <div className="flex items-center gap-1.5 flex-none">
                      {(cart[item.id] || 0) > 0 ? (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="w-[34px] flex flex-col items-center justify-between rounded-full bg-[#a87b51] dark:bg-[#A78BFA] text-white dark:text-black py-1 px-0.5 shadow-[0_4px_12px_rgba(168,123,81,0.35)] select-none flex-none"
                        >
                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            aria-label="Azalt"
                            className="w-full h-[24px] flex items-center justify-center font-bold text-base leading-none active:scale-90 hover:opacity-85 transition-transform"
                          >
                            –
                          </button>
                          <span className="font-hotel-sans font-extrabold text-[13px] leading-none py-1 tabular-nums">
                            {cart[item.id]}
                          </span>
                          <button
                            type="button"
                            onClick={() => addItem(item.id)}
                            aria-label="Artır"
                            className="w-full h-[24px] flex items-center justify-center font-bold text-base leading-none active:scale-90 hover:opacity-85 transition-transform"
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
                          className="w-8 h-8 rounded-full bg-[#f4ece1] dark:bg-[#2c2638] text-[#a87b51] dark:text-[#A78BFA] flex items-center justify-center font-bold text-lg hover:scale-105 active:scale-95 transition-transform shadow-sm"
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
        </div>

        {/* ===================== 3. FLOATING CART BAR (1:1 with Screenshot 1) ===================== */}
        <AnimatePresence>
          {totalCount > 0 && (
            <motion.div
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 80, opacity: 0 }}
              className="fixed bottom-3 left-0 right-0 z-40 flex justify-center px-3.5 pointer-events-none"
            >
              <button
                type="button"
                onClick={() => navigate(slug ? `/hotel/${slug}/cart` : '/cart')}
                className="pointer-events-auto w-full max-w-[512px] min-h-[58px] flex items-center justify-between gap-3 px-3 py-2 rounded-[20px] bg-gradient-to-r from-[#3e2c20] to-[#241a13] dark:from-[#261f33] dark:to-[#171322] border border-[#dfc08a]/30 dark:border-[#A78BFA]/30 shadow-[0_12px_32px_rgba(0,0,0,0.45)] text-white text-left active:scale-[0.985] transition-all group"
              >
                <div className="flex items-center gap-3">
                  {/* Shopping Bag Icon with Badge on Top-Right */}
                  <div className="relative w-[42px] h-[42px] flex-none rounded-[12px] bg-[#dfc08a]/15 text-[#dfc08a] dark:text-[#A78BFA] flex items-center justify-center">
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M16 10a4 4 0 0 1-8 0" />
                      <path d="M3.103 6.034h17.794" />
                      <path d="M3.4 5.467a2 2 0 0 0-.4 1.2V20a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6.667a2 2 0 0 0-.4-1.2l-2-2.667A2 2 0 0 0 17 2H7a2 2 0 0 0-1.6.8z" />
                    </svg>

                    <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-[20px] px-1 rounded-full bg-[#dfc08a] dark:bg-[#A78BFA] text-[#241a13] font-black text-[11.5px] flex items-center justify-center tabular-nums shadow-sm">
                      {totalCount}
                    </span>
                  </div>

                  {/* Text: Səbətə bax / X məhsul */}
                  <div>
                    <h4 className="font-hotel-serif text-[18px] font-bold leading-tight tracking-wide text-white">
                      Səbətə bax
                    </h4>
                    <span className="text-[12px] text-white/70 font-hotel-sans block mt-0.5">
                      {totalCount} məhsul
                    </span>
                  </div>
                </div>

                {/* Right Chevron > */}
                <span className="text-white/80 group-hover:text-white group-hover:translate-x-0.5 transition-all pr-2">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
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

                {/* Big image if present */}
                {activeItem.image && (
                  <div className="w-full h-[180px] rounded-2xl overflow-hidden bg-black/30">
                    <img
                      src={activeItem.image}
                      alt={activeItem.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-hotel-serif text-xl font-bold uppercase tracking-wide text-[var(--text-main)]">
                      {activeItem.name}
                    </h3>
                    {activeItem.badge && (
                      <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#A78BFA]/20 text-[#A78BFA] border border-[#A78BFA]/30">
                        {activeItem.badge}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => setActiveItem(null)}
                    className="w-8 h-8 rounded-full bg-[var(--bg-subcard)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-main)]"
                  >
                    ✕
                  </button>
                </div>

                {activeItem.desc && (
                  <p className="text-xs sm:text-[13px] text-[var(--text-main)]/85 leading-relaxed font-hotel-sans">
                    {activeItem.desc}
                  </p>
                )}

                {activeItem.price && (
                  <div className="text-lg font-bold text-[#A78BFA]">
                    {activeItem.price}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[var(--border-color)]">
                  <button
                    type="button"
                    onClick={() => {
                      addItem(activeItem.id);
                      setActiveItem(null);
                    }}
                    className="py-3 rounded-2xl bg-[#a87b51] dark:bg-[#A78BFA] text-white dark:text-black text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
                  >
                    ➕ Səbətə Əlavə Et
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsInquiryOpen(true);
                      setActiveItem(null);
                    }}
                    className="py-3 rounded-2xl bg-[var(--bg-subcard)] border border-[var(--border-color)] text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
                  >
                    🛎️ Birbaşa Sifariş
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ===================== 5. INQUIRY / ORDER MODAL ===================== */}
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
