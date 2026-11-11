import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useGuestCart } from '../../context/GuestCartContext';
import { defaultHotelData } from './guestData';
import { translations, Language } from '../../utils/translations';
import { publicService, PublicHotelProfile } from '../../services/api/publicService';
import { dailyOffers, getOfferByIdOrCode, DailyOfferItem } from '../../data/dailyOffersData';
import { InquirySheet } from './components/InquirySheet';
import { useHub, useHotelPortal } from '../../hooks/useHotelData';
import { resolveMediaUrl } from '../../utils/media';
import { HubType } from '../../types/api';

export const DailyOffersPage: React.FC = () => {
  const { slug, code } = useParams<{ slug?: string; code?: string }>();
  const hotelSlug = slug || 'altensor';
  const isDemoHotel = hotelSlug === 'altensor' || hotelSlug === 'skyhill';
  const navigate = useNavigate();
  const location = useLocation();

  const [selectedLang] = useState<Language>('az');
  const [liveHotel, setLiveHotel] = useState<PublicHotelProfile | null>(null);

  const isHubRoute = location.pathname.includes('/g/');

  // Lookup portal to find dynamic specials hub code
  const { data: portalData } = useHotelPortal(hotelSlug);
  const matchingOfferHub = portalData?.hubs?.find((h) => h.hubType === HubType.DailySpecials);
  const hubCodeOrId = isHubRoute
    ? (code || matchingOfferHub?.code || matchingOfferHub?.externalId || '196')
    : (matchingOfferHub?.code || matchingOfferHub?.externalId || '196');

  // Dynamic Live Hub (Daily Specials)
  const { data: hubData } = useHub(hotelSlug, hubCodeOrId);

  const hubTitle = hubData?.title || hubData?.titleTr?.az || (selectedLang === 'az' ? 'Günün təklifi' : 'Daily Specials');
  const hubSubtitle = hubData?.subtitle || hubData?.subtitleTr?.az || '';
  const hubCover = resolveMediaUrl(hubData?.coverImageUrl, '/media/guest/chef-special.webp');

  const liveOffers: DailyOfferItem[] = React.useMemo(() => {
    if (hubData?.directItems && hubData.directItems.length > 0) {
      return hubData.directItems.map((it) => ({
        id: it.id,
        code: String(it.externalId || it.id),
        name: it.title,
        nameEn: it.titleTr?.en || it.title,
        nameRu: it.titleTr?.ru || it.title,
        subtitle: it.subtitle || it.description || '',
        price: it.price ? `${it.price} ₼` : '',
        priceNum: it.price || 0,
        badge: it.badge || it.badgeTr?.az || undefined,
        image: it.imageUrl ? resolveMediaUrl(it.imageUrl) : hubCover,
        ingredients: it.description || it.subtitle || '',
        isInfoOnly: !it.isOrderable,
        categoryName: it.subtitle || 'Günün təklifi',
        ordering: 1,
      }));
    }
    return isDemoHotel ? dailyOffers : [];
  }, [hubData, hotelSlug, hubCover, isDemoHotel]);

  // Active offer item (if URL /p/:code is one of the offers, or when user clicks an offer)
  const [activeItem, setActiveItem] = useState<DailyOfferItem | null>(() => {
    if (code) {
      return getOfferByIdOrCode(code) || null;
    }
    const match = location.pathname.match(/\/(?:p|offers)\/([0-9a-zA-Z_\-]+)/);
    if (match) {
      return getOfferByIdOrCode(match[1]) || null;
    }
    return null;
  });

  // Modal quantity stepper
  const [itemQty, setItemQty] = useState(1);
  const [isInquiryOpen, setIsInquiryOpen] = useState(false);

  // Cart Context
  const { cart, addItem, totalCount } = useGuestCart();

  const hotel = defaultHotelData;
  const t = translations[selectedLang];

  useEffect(() => {
    publicService
      .getHotelBySlug(hotelSlug, selectedLang)
      .then((data) => {
        setLiveHotel(data);
      })
      .catch((err) => {
        console.warn('Hotel fetch error in DailyOffersPage:', err);
      });
  }, [hotelSlug, selectedLang]);

  // Sync if URL param changes
  useEffect(() => {
    const rawCode = code || location.pathname.match(/\/(?:p|offers)\/([0-9a-zA-Z_\-]+)/)?.[1];
    if (rawCode) {
      const found = getOfferByIdOrCode(rawCode);
      if (found) {
        setActiveItem(found);
        setItemQty(1);
      }
    }
  }, [code, location.pathname]);

  const homePath = slug ? `/hotel/${slug}` : '/';
  const displayPhone = liveHotel?.phone || (isDemoHotel ? hotel.phone : '');
  const displayWhatsapp = (liveHotel?.whatsApp || (isDemoHotel ? hotel.whatsapp : '')).replace(/[^0-9]/g, '');

  const handleItemClick = (item: DailyOfferItem) => {
    setActiveItem(item);
    setItemQty(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (slug) {
      navigate(`/hotel/${slug}/p/${item.code}`, { replace: false });
    } else {
      navigate(`/p/${item.code}`, { replace: false });
    }
  };

  const handleBackToList = () => {
    setActiveItem(null);
    if (slug) {
      navigate(`/hotel/${slug}/offers`, { replace: true });
    } else {
      navigate(`/offers`, { replace: true });
    }
  };

  const handleAddToCart = (item: DailyOfferItem, qty: number) => {
    for (let i = 0; i < qty; i++) {
      addItem(item.id);
    }
  };

  const handleWhatsAppBooking = (item: DailyOfferItem) => {
    const text = encodeURIComponent(
      `Salam! "${item.name}" (${item.price || 'Günün təklifi'}) haqqında məlumat almaq və sifariş etmək istəyirəm.`
    );
    window.open(`https://wa.me/${displayWhatsapp}?text=${text}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] font-hotel-sans flex justify-center selection:bg-[#A78BFA] selection:text-black transition-colors duration-200">
      {/* Main Column (540px container matching 1:1 skyhill) */}
      <div className="w-full max-w-[540px] min-h-screen bg-[var(--bg-main)] flex flex-col relative pb-28 border-x border-[var(--border-color)] overflow-x-hidden shadow-2xl">
        {/* ===================== 1. HERO COVER HEADER (178px) ===================== */}
        <header className="relative w-full h-[178px] overflow-hidden bg-[#241a13] flex-none">
          <img
            src={activeItem?.image || hubCover}
            alt={activeItem?.name || hubTitle}
            className="absolute inset-0 w-full h-full object-cover transition-all duration-300"
          />
          {/* Exact Shade Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/30 pointer-events-none" />

          {/* Top Bar Actions: Back (<) & Home (⌂) */}
          <div className="absolute inset-x-0 top-0 pt-3 px-3 flex items-center justify-between z-10 pointer-events-auto">
            {/* Back Button */}
            <button
              type="button"
              onClick={() => {
                if (activeItem) {
                  handleBackToList();
                } else {
                  navigate(homePath);
                }
              }}
              aria-label="Geri"
              className="w-10 h-10 rounded-full flex items-center justify-center text-white/90 hover:text-white bg-black/35 hover:bg-black/55 backdrop-blur-md border border-white/15 transition-all active:scale-95 shadow-md"
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
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>

            {/* Home Button */}
            <button
              type="button"
              onClick={() => navigate(homePath)}
              aria-label="Ana səhifə"
              className="w-10 h-10 rounded-full flex items-center justify-center text-white/90 hover:text-white bg-black/35 hover:bg-black/55 backdrop-blur-md border border-white/15 transition-all active:scale-95 shadow-md"
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" />
                <path d="M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              </svg>
            </button>
          </div>

          {/* Header Title (.hotel_headTitle__CllxS) */}
          <div className="absolute inset-x-0 bottom-0 pb-3 px-4 z-10 pointer-events-none">
            <h1
              className="font-hotel-serif text-[28px] sm:text-[32px] font-bold text-white tracking-wide drop-shadow-md leading-tight line-clamp-1"
              style={{ textShadow: '0 2px 10px rgba(0,0,0,0.7)' }}
            >
              {activeItem ? activeItem.name : hubTitle}
            </h1>
            {!activeItem && hubSubtitle && (
              <p className="text-[12px] text-white/85 font-hotel-sans mt-0.5 leading-snug">
                {hubSubtitle}
              </p>
            )}
          </div>
        </header>

        {/* ===================== 2. MAIN CONTENT SHEET ===================== */}
        <div className="relative z-10 -mt-[14px] bg-[var(--bg-main)] rounded-t-[18px] pt-3 px-3 sm:px-4 flex flex-col gap-2.5 flex-1">
          {activeItem ? (
            /* ================== 2A. ACTIVE ITEM DETAIL VIEW (1:1 with p/43230) ================== */
            <div className="flex flex-col gap-4 pt-1 animate-fadeIn">
              {/* Price & Badge Meta (.hotel_detailMeta__6_vdx) */}
              <div className="flex items-center justify-between gap-3">
                {activeItem.price ? (
                  <span className="font-hotel-serif text-[26px] font-bold text-[#dfc08a] dark:text-[#A78BFA] tracking-tight tabular-nums">
                    {activeItem.price}
                  </span>
                ) : (
                  <span />
                )}

                {activeItem.badge && (
                  <span className="px-3 py-1 rounded-full text-[12px] font-semibold bg-[#8B6E45]/15 dark:bg-[#A78BFA]/20 text-[#8B6E45] dark:text-[#A78BFA] border border-[#8B6E45]/25 dark:border-[#A78BFA]/30 tracking-wide">
                    {activeItem.badge}
                  </span>
                )}
              </div>

              {/* Composition / Description Block (.hotel_detailBlock__x1T6C) */}
              <div className="p-4 rounded-[16px] bg-[var(--bg-card)] border border-[var(--border-color)] space-y-2 shadow-sm">
                <h2 className="font-hotel-serif text-[18px] font-bold text-[var(--text-main)] uppercase tracking-wider">
                  {activeItem.isInfoOnly ? 'Fəaliyyət Haqqında' : 'Tərkib'}
                </h2>
                <p className="text-[14px] sm:text-[15px] text-[var(--text-main)]/90 leading-relaxed font-hotel-sans whitespace-pre-line">
                  {activeItem.ingredients}
                </p>
              </div>

              {/* Subtitle / Venue Info */}
              <div className="flex items-center gap-2 px-1 text-[13px] text-[var(--text-muted)] font-medium">
                <span className="w-2 h-2 rounded-full bg-[#dfc08a] dark:bg-[#A78BFA]" />
                <span>Bölmə: <strong className="text-[var(--text-main)]">{activeItem.subtitle}</strong></span>
              </div>

              {/* Action Buttons */}
              {!activeItem.isInfoOnly ? (
                <div className="pt-2 flex flex-col gap-3">
                  {/* Stepper + Səbətə əlavə et */}
                  <div className="flex items-center gap-3">
                    {/* Stepper (– QTY +) */}
                    <div className="flex items-center rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] p-1 shrink-0 shadow-sm">
                      <button
                        type="button"
                        disabled={itemQty <= 1}
                        onClick={() => setItemQty((q) => Math.max(1, q - 1))}
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-[var(--text-main)] hover:bg-[var(--bg-subcard)] disabled:opacity-30 disabled:pointer-events-none transition-colors"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                          <path d="M5 12h14" />
                        </svg>
                      </button>

                      <span className="w-10 text-center font-bold text-[16px] tabular-nums text-[var(--text-main)]">
                        {itemQty}
                      </span>

                      <button
                        type="button"
                        onClick={() => setItemQty((q) => q + 1)}
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-[var(--text-main)] hover:bg-[var(--bg-subcard)] transition-colors"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                          <path d="M12 5v14M5 12h14" />
                        </svg>
                      </button>
                    </div>

                    {/* Səbətə əlavə et Button */}
                    <button
                      type="button"
                      onClick={() => handleAddToCart(activeItem, itemQty)}
                      className="flex-1 h-12 rounded-xl bg-[#4a3525] hover:bg-[#3d2c1f] dark:bg-[#A78BFA] dark:hover:bg-[#906fe8] text-white dark:text-black font-semibold text-[15px] flex items-center justify-center gap-2.5 transition-all shadow-md active:scale-[0.98]"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M16 10a4 4 0 0 1-8 0" />
                        <path d="M3.103 6.034h17.794" />
                        <path d="M3.4 5.467a2 2 0 0 0-.4 1.2V20a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6.667a2 2 0 0 0-.4-1.2l-2-2.667A2 2 0 0 0 17 2H7a2 2 0 0 0-1.6.8z" />
                      </svg>
                      <span>Səbətə əlavə et</span>
                      <span className="opacity-90 font-bold tabular-nums">
                        · {(itemQty * activeItem.priceNum).toFixed(2)} ₼
                      </span>
                    </button>
                  </div>

                  {/* Direct WhatsApp Order */}
                  <button
                    type="button"
                    onClick={() => handleWhatsAppBooking(activeItem)}
                    className="w-full h-11 rounded-xl bg-emerald-600/15 hover:bg-emerald-600/25 text-emerald-700 dark:text-emerald-400 border border-emerald-600/30 text-[14px] font-semibold flex items-center justify-center gap-2 transition-all"
                  >
                    <span>💬</span>
                    <span>WhatsApp ilə dərhal rezerv / sifariş et</span>
                  </button>
                </div>
              ) : (
                /* Info Only Inquiry Button */
                <div className="pt-2 flex flex-col gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleWhatsAppBooking(activeItem)}
                    className="w-full h-12 rounded-xl bg-[#4a3525] hover:bg-[#3d2c1f] dark:bg-[#A78BFA] dark:hover:bg-[#906fe8] text-white dark:text-black font-semibold text-[15px] flex items-center justify-center gap-2 transition-all shadow-md"
                  >
                    <span>💬</span>
                    <span>WhatsApp ilə qeydiyyat / məlumat</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsInquiryOpen(true)}
                    className="w-full h-11 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-main)] text-[14px] font-medium flex items-center justify-center gap-2 hover:bg-[var(--bg-subcard)] transition-colors"
                  >
                    <span>Konsyerj sorğusu göndər</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* ================== 2B. OFFERS LIST VIEW ================== */
            <div className="flex flex-col gap-2.5">
              {liveOffers.length > 0 ? (
                liveOffers.map((offer) => {
                  const isItemInCart = Boolean(cart[offer.id]);

                  return (
                    <button
                      key={offer.id}
                      type="button"
                      onClick={() => handleItemClick(offer)}
                      className="w-full p-2.5 rounded-[14px] bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-[#dfc08a]/50 dark:hover:border-[#A78BFA]/50 active:scale-[0.99] transition-all flex items-center gap-3.5 text-left group shadow-sm focus:outline-none"
                    >
                      {/* Thumbnail Image (72x72) */}
                      <div className="w-[72px] h-[72px] rounded-[10px] overflow-hidden bg-[var(--bg-subcard)] shrink-0 relative">
                        <img
                          src={offer.image}
                          alt={offer.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {isItemInCart && (
                          <div className="absolute top-1 left-1 w-4 h-4 rounded-full bg-[#dfc08a] dark:bg-[#A78BFA] text-[#241a13] text-[9px] font-bold flex items-center justify-center shadow-sm">
                            ✓
                          </div>
                        )}
                      </div>

                      {/* Content Column */}
                      <div className="flex-1 min-w-0 pr-1">
                        {/* Title */}
                        <h3 className="font-hotel-serif text-[17px] font-bold text-[var(--text-main)] group-hover:text-[#dfc08a] dark:group-hover:text-[#A78BFA] leading-snug line-clamp-1 transition-colors">
                          {offer.name}
                        </h3>

                        {/* Subtitle / Venue */}
                        <p className="text-[12px] text-[var(--text-muted)] font-medium leading-tight mt-0.5 line-clamp-1">
                          {offer.subtitle}
                        </p>

                        {/* Badge capsule */}
                        {offer.badge && (
                          <span className="inline-block mt-1.5 text-[11px] font-semibold text-[#8B6E45] dark:text-[#dfc08a] tracking-tight">
                            {offer.badge}
                          </span>
                        )}
                      </div>

                      {/* Price or Chevron */}
                      {offer.price ? (
                        <span className="font-hotel-serif text-[16px] font-bold text-[var(--text-main)] tracking-tight shrink-0 tabular-nums ml-auto">
                          {offer.price}
                        </span>
                      ) : (
                        <span className="text-[var(--text-muted)] shrink-0 ml-auto group-hover:translate-x-0.5 transition-transform">
                          <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="m9 18 6-6-6-6" />
                          </svg>
                        </span>
                      )}
                    </button>
                  );
                })
              ) : (
                <div className="py-16 px-6 flex flex-col items-center justify-center text-center">
                  <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-3 text-[#A78BFA]">
                    <span className="text-2xl">🎁</span>
                  </div>
                  <h3 className="font-hotel-serif text-[18px] font-semibold text-[var(--text-main)] mb-1">
                    {selectedLang === 'az' ? 'Təklif yoxdur' : 'No specials available'}
                  </h3>
                  <p className="text-[12.5px] text-[var(--text-muted)] max-w-[280px]">
                    {selectedLang === 'az' ? 'Hal-hazırda aktiv günün təklifi mövcud deyil.' : 'No active daily specials available at this time.'}
                  </p>
                </div>
              )}
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
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-4 inset-x-0 z-40 flex justify-center px-4 pointer-events-none"
            >
              <button
                type="button"
                onClick={() => navigate(slug ? `/hotel/${slug}/cart` : '/cart')}
                className="w-full max-w-[480px] h-[64px] rounded-[20px] bg-[#342417] dark:bg-[#201826] text-white px-4 flex items-center justify-between shadow-[0_12px_32px_rgba(0,0,0,0.45)] border border-[#dfc08a]/20 dark:border-[#A78BFA]/30 pointer-events-auto active:scale-[0.98] transition-transform group"
              >
                {/* Left: Bag Icon with badge */}
                <div className="flex items-center gap-3">
                  <div className="relative w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center text-white">
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

        {/* Concierge Inquiry Sheet */}
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
