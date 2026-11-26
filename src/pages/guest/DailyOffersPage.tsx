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
import { useGuestDocumentMeta } from '../../utils/documentHead';
import { useLanguage } from '../../context/LanguageContext';
import { tr, SupportedLang } from '../../utils/i18n';
import { GuestLangPill } from './components/GuestLangPill';
import { HubType } from '../../types/api';

export const DailyOffersPage: React.FC = () => {
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

  // Lookup portal to find dynamic specials hub code
  const { data: portalData } = useHotelPortal(hotelSlug);
  const matchingOfferHub = portalData?.hubs?.find((h) => h.hubType === HubType.DailySpecials);
  const hubCodeOrId = isHubRoute
    ? code || matchingOfferHub?.code || matchingOfferHub?.externalId || '196'
    : matchingOfferHub?.code || matchingOfferHub?.externalId || '196';

  // Dynamic Live Hub (Daily Specials)
  const { data: hubData } = useHub(hotelSlug, hubCodeOrId);

  const hubTitle = tr(
    hubData?.titleTr,
    hubData?.title || (selectedLang === 'ru' ? 'Предложение дня' : selectedLang === 'en' ? 'Daily Specials' : 'Günün təklifi'),
    selectedLang as SupportedLang
  );
  const hubSubtitle = tr(hubData?.subtitleTr, hubData?.subtitle || '', selectedLang as SupportedLang);
  const hubCover = resolveMediaUrl(hubData?.coverImageUrl, '/media/guest/chef-special.webp');

  const liveOffers: DailyOfferItem[] = React.useMemo(() => {
    if (hubData?.directItems && hubData.directItems.length > 0) {
      return hubData.directItems.map((it) => ({
        id: it.id,
        code: String(it.externalId || it.id),
        name: tr(it.titleTr, it.title, selectedLang as SupportedLang),
        nameEn: it.titleTr?.en || it.title,
        nameRu: it.titleTr?.ru || it.title,
        subtitle: tr(it.subtitleTr, it.subtitle || it.description || '', selectedLang as SupportedLang),
        price: it.price ? `${it.price} ₼` : '',
        priceNum: it.price || 0,
        badge: tr(it.badgeTr, it.badge || '', selectedLang as SupportedLang) || undefined,
        image: it.imageUrl ? resolveMediaUrl(it.imageUrl) : hubCover,
        ingredients: tr(it.descriptionTr, it.description || it.subtitle || '', selectedLang as SupportedLang),
        isInfoOnly: !it.isOrderable,
        categoryName: tr(it.subtitleTr, it.subtitle || 'Günün təklifi', selectedLang as SupportedLang),
        ordering: 1,
      }));
    }
    return isDemoHotel
      ? dailyOffers.map((it) => ({
          ...it,
          name:
            selectedLang === 'en' && it.nameEn
              ? it.nameEn
              : selectedLang === 'ru' && it.nameRu
              ? it.nameRu
              : it.name,
        }))
      : [];
  }, [hubData, hotelSlug, hubCover, isDemoHotel, selectedLang]);

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

  const [itemQty, setItemQty] = useState(1);
  const [isInquiryOpen, setIsInquiryOpen] = useState(false);

  const { cart, addItem, totalCount, totalPrice } = useGuestCart();

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
  const displayWhatsapp = (liveHotel?.whatsApp || (isDemoHotel ? hotel.whatsapp : '')).replace(/[^0-9]/g, '');

  const hotelTitleName = liveHotel?.name || portalData?.name || (isDemoHotel ? hotel.name : '');
  const pageTabTitle = activeItem ? activeItem.name : hubTitle;
  useGuestDocumentMeta(
    hotelTitleName ? `${pageTabTitle} | ${hotelTitleName}` : pageTabTitle,
    liveHotel?.logoUrl || portalData?.logoUrl || (isDemoHotel ? hotel.logo : undefined)
  );

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
    <div className="fs-portal min-h-screen flex flex-col selection:bg-black selection:text-white pb-24">
      {/* ===================== 1. FULL-BLEED ARCHITECTURAL HERO ===================== */}
      <header className="relative w-full h-[240px] sm:h-[320px] lg:h-[380px] overflow-hidden bg-[#0F0F0F] flex-none">
        <img
          src={resolveMediaUrl(activeItem?.image || hubCover, '/media/guest/chef-special.webp')}
          alt={activeItem?.name || hubTitle}
          onError={(e) => {
            const fallback = resolveMediaUrl('/media/guest/chef-special.webp');
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
            onClick={() => {
              if (activeItem) {
                handleBackToList();
              } else {
                navigate(homePath);
              }
            }}
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
            {activeItem ? activeItem.subtitle || 'Featured Offer' : 'Featured Offers'}
          </p>
          <h1 className="font-fs-sans font-extralight text-[26px] sm:text-[34px] lg:text-[40px] leading-[1.2] tracking-[0.18em] uppercase text-white">
            {activeItem ? activeItem.name : hubTitle}
          </h1>
          {!activeItem && hubSubtitle && (
            <p className="font-fs-serif text-[15px] sm:text-[17px] text-white/85 mt-1.5 max-w-2xl leading-snug">
              {hubSubtitle}
            </p>
          )}
        </div>
      </header>

      {/* ===================== 2. MAIN CONTENT ===================== */}
      <main className="flex-1 w-full max-w-[1140px] mx-auto px-4 sm:px-8 py-8 sm:py-14">
        {activeItem ? (
          /* ================== 2A. EDITORIAL 50/50 SPLIT DETAIL VIEW ================== */
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[var(--fs-border)]">
              <span className="fs-kicker text-[var(--fs-text-muted)]">Təklif Təfərrüatı</span>
              <button
                type="button"
                onClick={handleBackToList}
                className="fs-link-underlined text-[var(--fs-text)]"
              >
                ← Bütün təkliflər
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 border border-[var(--fs-border)] bg-[var(--fs-surface-subtle)]">
              <div className="lg:col-span-6 min-h-[260px] sm:min-h-[360px] relative overflow-hidden bg-[#141414]">
                <img
                  src={resolveMediaUrl(activeItem.image, '/media/guest/chef-special.webp')}
                  alt={activeItem.name}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>

              <div className="lg:col-span-6 p-6 sm:p-10 lg:p-12 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    {activeItem.badge && (
                      <span className="text-[10px] font-bold uppercase tracking-[0.18em] px-3 py-1 border border-[var(--fs-border-strong)] text-[var(--fs-text)]">
                        {activeItem.badge}
                      </span>
                    )}
                    {activeItem.price && (
                      <span className="font-fs-sans text-[22px] font-bold tracking-[0.04em] text-[var(--fs-text)] tabular-nums">
                        {activeItem.price}
                      </span>
                    )}
                  </div>

                  <h2 className="font-fs-sans font-extralight text-[22px] sm:text-[26px] uppercase tracking-[0.16em] text-[var(--fs-text)] leading-snug">
                    {activeItem.name}
                  </h2>

                  <div className="w-10 h-[1px] bg-[var(--fs-border-strong)]" />

                  <div className="space-y-2">
                    <span className="fs-kicker text-[var(--fs-text-muted)] block">
                      {activeItem.isInfoOnly ? 'Fəaliyyət Haqqında' : 'Tərkib'}
                    </span>
                    <p className="font-fs-serif text-[16.5px] text-[var(--fs-text-body)] leading-[1.7] whitespace-pre-line">
                      {activeItem.ingredients}
                    </p>
                  </div>

                  {activeItem.subtitle && (
                    <p className="font-fs-sans text-[11px] uppercase tracking-[0.18em] text-[var(--fs-text-muted)] pt-1">
                      Bölmə: <strong className="text-[var(--fs-text)]">{activeItem.subtitle}</strong>
                    </p>
                  )}
                </div>

                {!activeItem.isInfoOnly ? (
                  <div className="pt-4 border-t border-[var(--fs-border)] space-y-3">
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                      <div className="flex items-center justify-between bg-[var(--fs-card)] border border-[var(--fs-border-strong)] h-[44px] px-1 shrink-0">
                        <button
                          type="button"
                          disabled={itemQty <= 1}
                          onClick={() => setItemQty((q) => Math.max(1, q - 1))}
                          className="w-10 h-full flex items-center justify-center text-[var(--fs-text)] disabled:opacity-30"
                        >
                          –
                        </button>
                        <span className="w-10 text-center font-fs-sans font-bold text-[14px] tabular-nums text-[var(--fs-text)]">
                          {itemQty}
                        </span>
                        <button
                          type="button"
                          onClick={() => setItemQty((q) => q + 1)}
                          className="w-10 h-full flex items-center justify-center text-[var(--fs-text)]"
                        >
                          +
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleAddToCart(activeItem, itemQty)}
                        className="fs-btn-primary flex-1 !min-h-[44px]"
                      >
                        <span>Səbətə əlavə et</span>
                        <span className="tabular-nums">· {(itemQty * activeItem.priceNum).toFixed(2)} ₼</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleWhatsAppBooking(activeItem)}
                      className="fs-btn-outline w-full"
                    >
                      WhatsApp ilə dərhal rezerv / sifariş et
                    </button>
                  </div>
                ) : (
                  <div className="pt-4 border-t border-[var(--fs-border)] space-y-3">
                    <button
                      type="button"
                      onClick={() => handleWhatsAppBooking(activeItem)}
                      className="fs-btn-primary w-full"
                    >
                      WhatsApp ilə qeydiyyat / məlumat
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsInquiryOpen(true)}
                      className="fs-btn-outline w-full"
                    >
                      Konsyerj sorğusu göndər
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* ================== 2B. FEATURED OFFERS GALLERY ================== */
          <div>
            {liveOffers.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-[30px]">
                {liveOffers.map((offer) => {
                  const isItemInCart = Boolean(cart[offer.id]);

                  return (
                    <button
                      key={offer.id}
                      type="button"
                      onClick={() => handleItemClick(offer)}
                      className="w-full rounded-none bg-[var(--fs-card)] border border-[var(--fs-border)] hover:border-[var(--fs-border-strong)] flex flex-col text-left transition-colors group focus:outline-none"
                    >
                      <div className="relative w-full aspect-[4/4.3] overflow-hidden bg-[#141414]">
                        <img
                          src={resolveMediaUrl(offer.image, '/media/guest/chef-special.webp')}
                          alt={offer.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                        />
                        <div
                          className="absolute inset-0 pointer-events-none"
                          style={{
                            background: 'linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,0.72) 100%)',
                          }}
                        />

                        {offer.badge && (
                          <span className="absolute top-3 left-3 px-2.5 py-1 bg-white text-black font-fs-sans text-[9.5px] font-bold uppercase tracking-[0.18em]">
                            {offer.badge}
                          </span>
                        )}

                        {isItemInCart && (
                          <span className="absolute top-3 right-3 w-6 h-6 bg-black text-white border border-white text-[11px] font-bold flex items-center justify-center">
                            ✓
                          </span>
                        )}

                        <div className="absolute inset-x-0 bottom-0 p-5 text-white space-y-1.5">
                          <h3 className="font-fs-serif text-[21px] leading-snug text-white">
                            {offer.name}
                          </h3>
                          {offer.subtitle && (
                            <p className="font-fs-sans text-[11px] tracking-[0.14em] uppercase text-white/80 line-clamp-1">
                              {offer.subtitle}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="p-4 sm:p-5 flex items-center justify-between w-full bg-[var(--fs-card)]">
                        {offer.price ? (
                          <span className="font-fs-sans text-[14px] font-bold tracking-[0.06em] text-[var(--fs-text)] tabular-nums">
                            {offer.price}
                          </span>
                        ) : (
                          <span className="fs-kicker text-[var(--fs-text-muted)]">Təklif</span>
                        )}

                        <span className="fs-link-underlined text-[var(--fs-text)]">
                          Ətraflı →
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="py-16 px-6 bg-[var(--fs-surface-subtle)] border border-[var(--fs-border)] flex flex-col items-center justify-center text-center space-y-3">
                <h3 className="font-fs-sans font-extralight text-[20px] tracking-[0.18em] uppercase text-[var(--fs-text)]">
                  {selectedLang === 'az' ? 'Təklif yoxdur' : 'No specials available'}
                </h3>
                <p className="font-fs-serif text-[15.5px] text-[var(--fs-text-muted)] max-w-sm">
                  {selectedLang === 'az'
                    ? 'Hal-hazırda aktiv günün təklifi mövcud deyil.'
                    : 'No active daily specials available at this time.'}
                </p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ===================== 3. FLOATING CART BAR ===================== */}
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

      {/* Concierge Inquiry Sheet */}
      <InquirySheet
        isOpen={isInquiryOpen}
        onClose={() => setIsInquiryOpen(false)}
        t={t.inquiry}
        slug={hotelSlug}
      />
    </div>
  );
};
