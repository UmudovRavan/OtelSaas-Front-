import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useGuestCart } from '../../context/GuestCartContext';
import { defaultHotelData } from './guestData';
import { translations, Language } from '../../utils/translations';
import { publicService } from '../../services/api/publicService';
import { useLanguage } from '../../context/LanguageContext';
import { useHotelPortal } from '../../hooks/useHotelData';
import { OrderType, SubmitOrderRequestDto, GuestOrderDto } from '../../types/api';
import { InquirySheet } from './components/InquirySheet';
import { resolveMediaUrl } from '../../utils/media';
import { useGuestDocumentMeta } from '../../utils/documentHead';
import { GuestLangPill } from './components/GuestLangPill';

export const CartPage: React.FC = () => {
  const { slug } = useParams<{ slug?: string }>();
  const hotelSlug = slug || 'altensor';
  const isDemoHotel = hotelSlug === 'altensor' || hotelSlug === 'skyhill';
  const navigate = useNavigate();

  const { currentLang } = useLanguage();
  const selectedLang = (currentLang as Language) || 'az';
  const { data: portalData } = useHotelPortal(hotelSlug);

  useEffect(() => {
    window.scrollTo(0, 0);
    const saved = localStorage.getItem('fs_guest_dark');
    document.documentElement.classList.toggle('fs-dark', saved === '1');
  }, []);

  const [isInquiryOpen, setIsInquiryOpen] = useState(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  const [orderType, setOrderType] = useState<OrderType>(OrderType.RoomService);
  const [roomOrTableNumber, setRoomOrTableNumber] = useState('');
  const [guestName, setGuestName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [completedOrder, setCompletedOrder] = useState<GuestOrderDto | null>(null);

  const {
    cartItemsDetailed,
    addItem,
    removeItem,
    clearCart,
    totalCount,
    totalPrice,
  } = useGuestCart();

  const hotel = defaultHotelData;
  const t = translations[selectedLang] || translations.az;

  const homePath = `/${hotelSlug}`;
  const menuPath = `/${hotelSlug}/hotel/g/192`;
  const displayPhone = portalData?.phone || (isDemoHotel ? hotel.phone : '');
  const displayWhatsapp = (portalData?.whatsApp || (isDemoHotel ? hotel.whatsapp : '')).replace(/[^0-9]/g, '');

  const hotelTitleName = portalData?.name || (isDemoHotel ? hotel.name : '');
  useGuestDocumentMeta(
    hotelTitleName ? `Səbət | ${hotelTitleName}` : 'Səbət',
    portalData?.logoUrl || (isDemoHotel ? hotel.logo : undefined)
  );

  const serviceFeePercent = portalData?.serviceFeePercent || 0;
  const serviceFeeAmount = (totalPrice * serviceFeePercent) / 100;
  const grandTotal = totalPrice + serviceFeeAmount;

  const cartSummaryText = cartItemsDetailed
    .map((it) => `${it.quantity}x ${it.item.name} (${it.item.price || `${it.item.priceNum} ₼`})`)
    .join('\n');

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOrderError(null);

    if (!roomOrTableNumber.trim()) {
      setOrderError(
        orderType === OrderType.RoomService
          ? 'Xahiş edirik, otaq nömrənizi daxil edin (məs: 304).'
          : 'Xahiş edirik, masa nömrənizi daxil edin (məs: Masa 12).'
      );
      return;
    }

    if (cartItemsDetailed.length === 0) {
      setOrderError('Səbətiniz boşdur.');
      return;
    }

    setIsSubmitting(true);
    try {
      const request: SubmitOrderRequestDto = {
        orderType,
        roomOrTableNumber: roomOrTableNumber.trim(),
        guestName: guestName.trim() || undefined,
        phoneNumber: phoneNumber.trim() || undefined,
        notes: notes.trim() || undefined,
        items: cartItemsDetailed.map((it) => ({
          catalogItemId: it.item.id,
          itemTitle: it.item.name,
          quantity: it.quantity,
          unitPrice: it.item.priceNum,
        })),
      };

      const res = await publicService.submitOrder(hotelSlug, request);
      if (res.success && res.data) {
        setCompletedOrder(res.data);
        clearCart();
      } else {
        setOrderError(res.message || 'Sifariş göndərilərkən xəta baş verdi.');
      }
    } catch (err: any) {
      console.error('Order submission error:', err);
      const msg = err?.response?.data?.message || err?.message || 'Sifariş göndərilərkən şəbəkə xətası baş verdi.';
      setOrderError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseOrderModal = () => {
    setIsOrderModalOpen(false);
    if (completedOrder) {
      setCompletedOrder(null);
      navigate(homePath);
    }
  };

  return (
    <div className="fs-portal min-h-screen flex flex-col selection:bg-black selection:text-white pb-16">
      {/* ===================== 1. ARCHITECTURAL MONOCHROME HEADER ===================== */}
      <header className="relative w-full bg-[#0F0F0F] text-white border-b border-white/15 py-6 sm:py-9 flex-none">
        <div className="max-w-[1140px] mx-auto px-4 sm:px-8 space-y-6">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => navigate(-1)}
              aria-label="Geri"
              className="w-10 h-10 border border-white/30 hover:bg-white hover:text-black flex items-center justify-center transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>

            <div className="flex items-center gap-2.5">
              <GuestLangPill />
              {totalCount > 0 && (
                <button
                  type="button"
                  onClick={clearCart}
                  className="h-10 px-4 border border-white/30 hover:bg-white hover:text-black text-[10px] font-bold tracking-[0.22em] uppercase transition-colors"
                >
                  Təmizlə
                </button>
              )}

              <button
                type="button"
                onClick={() => navigate(homePath)}
                aria-label="Ana Səhifə"
                className="w-10 h-10 border border-white/30 hover:bg-white hover:text-black flex items-center justify-center transition-colors"
              >
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              </button>
            </div>
          </div>

          <div>
            <p className="fs-eyebrow text-[16px] text-white/75 mb-1">In-Room & Dining Folio</p>
            <div className="flex items-center gap-3">
              <h1 className="font-fs-sans font-extralight text-[26px] sm:text-[34px] tracking-[0.18em] uppercase text-white">
                Səbət
              </h1>
              {totalCount > 0 && (
                <span className="px-2.5 py-0.5 bg-white text-black font-fs-sans text-[11px] font-bold tabular-nums">
                  {totalCount}
                </span>
              )}
            </div>
            <p className="font-fs-serif text-[15px] text-white/75 mt-1">
              Seçilmiş xidmətlər və yeməklər
            </p>
          </div>
        </div>
      </header>

      {/* ===================== 2. RESPONSIVE CART CONTENT ===================== */}
      <main className="flex-1 w-full max-w-[1140px] mx-auto px-4 sm:px-8 py-8 sm:py-14">
        {cartItemsDetailed.length === 0 ? (
          <div className="max-w-lg mx-auto bg-[var(--fs-surface-subtle)] border border-[var(--fs-border)] p-10 sm:p-14 text-center space-y-5">
            <div className="w-14 h-14 mx-auto border border-[var(--fs-border-strong)] flex items-center justify-center text-[var(--fs-text)]">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
                <path d="M16 10a4 4 0 0 1-8 0" />
                <path d="M3.103 6.034h17.794" />
                <path d="M3.4 5.467a2 2 0 0 0-.4 1.2V20a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6.667a2 2 0 0 0-.4-1.2l-2-2.667A2 2 0 0 0 17 2H7a2 2 0 0 0-1.6.8z" />
              </svg>
            </div>
            <h3 className="font-fs-sans font-extralight text-[21px] tracking-[0.18em] uppercase text-[var(--fs-text)]">
              Səbətiniz boşdur
            </h3>
            <p className="font-fs-serif text-[16px] text-[var(--fs-text-muted)] max-w-xs mx-auto leading-relaxed">
              Restoran, spa və ya digər xidmətlərdən seçim edərək səbətə əlavə edə bilərsiniz.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => navigate(menuPath)}
                className="fs-btn-primary"
              >
                Menyuya Keçid
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
            {/* Left 7 Cols: Item Rows */}
            <div className="lg:col-span-7 divide-y divide-[var(--fs-border)] border border-[var(--fs-border)] bg-[var(--fs-card)]">
              {cartItemsDetailed.map(({ item, venue, quantity }) => (
                <div
                  key={item.id}
                  className="p-4 sm:p-5 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-[68px] h-[68px] sm:w-[76px] sm:h-[76px] overflow-hidden bg-[var(--fs-surface-subtle)] flex-none">
                      <img
                        src={resolveMediaUrl(item.image, '/media/guest/plate.webp')}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const fallback = resolveMediaUrl('/media/guest/plate.webp');
                          if (!e.currentTarget.dataset.fbApplied && e.currentTarget.src !== fallback) {
                            e.currentTarget.dataset.fbApplied = '1';
                            e.currentTarget.src = fallback;
                          }
                        }}
                      />
                    </div>

                    <div className="min-w-0 pr-1 space-y-1">
                      <h4 className="font-fs-serif text-[18px] sm:text-[19px] text-[var(--fs-text)] leading-snug line-clamp-1">
                        {item.name}
                      </h4>
                      <span className="fs-kicker text-[var(--fs-text-muted)] block">
                        {venue.title}
                      </span>
                      <span className="font-fs-sans text-[13.5px] font-bold tracking-[0.06em] text-[var(--fs-text)] block pt-0.5">
                        {item.price || `${item.priceNum.toFixed(2)} ₼`}
                      </span>
                    </div>
                  </div>

                  {/* Rectangular Architectural Stepper */}
                  <div className="flex items-center border border-[var(--fs-border-strong)] bg-[var(--fs-card)] h-9 px-1 flex-none">
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="w-7 h-full flex items-center justify-center text-sm font-bold text-[var(--fs-text)] hover:opacity-65"
                      aria-label="Azalt"
                    >
                      –
                    </button>
                    <span className="font-fs-sans text-[13px] font-bold text-[var(--fs-text)] min-w-[22px] text-center tabular-nums">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => addItem(item.id)}
                      className="w-7 h-full flex items-center justify-center text-sm font-bold text-[var(--fs-text)] hover:opacity-65"
                      aria-label="Artır"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Right 5 Cols: Order Folio Summary */}
            <div className="lg:col-span-5 bg-[var(--fs-surface-subtle)] border border-[var(--fs-border)] p-6 sm:p-8 space-y-6 lg:sticky lg:top-8">
              <div className="space-y-1 border-b border-[var(--fs-border)] pb-4">
                <span className="fs-kicker text-[var(--fs-text-muted)] block">Order Summary</span>
                <h2 className="font-fs-sans font-extralight text-[20px] tracking-[0.16em] uppercase text-[var(--fs-text)]">
                  Hesab Xülasəsi
                </h2>
              </div>

              <div className="space-y-3 font-fs-serif text-[16px]">
                <div className="flex items-center justify-between text-[var(--fs-text-muted)]">
                  <span>Məhsulların cəmi</span>
                  <span className="font-fs-sans text-[14px] tabular-nums font-medium text-[var(--fs-text)]">
                    {totalPrice.toFixed(2)} ₼
                  </span>
                </div>

                {serviceFeePercent > 0 && (
                  <div className="flex items-center justify-between text-[var(--fs-text-muted)]">
                    <span>Xidmət haqqı ({serviceFeePercent}%)</span>
                    <span className="font-fs-sans text-[14px] tabular-nums font-medium text-[var(--fs-text)]">
                      +{serviceFeeAmount.toFixed(2)} ₼
                    </span>
                  </div>
                )}

                <div className="border-t border-[var(--fs-border)] pt-3 flex items-center justify-between">
                  <span className="font-fs-sans text-[12px] font-bold uppercase tracking-[0.18em] text-[var(--fs-text)]">
                    Yekun Ödəniləcək
                  </span>
                  <span className="font-fs-sans text-[19px] font-bold tabular-nums text-[var(--fs-text)]">
                    {grandTotal.toFixed(2)} ₼
                  </span>
                </div>
              </div>

              <p className="font-fs-serif text-[14.5px] text-[var(--fs-text-muted)] leading-relaxed border-t border-[var(--fs-border)] pt-4">
                Sifarişiniz təsdiqləndikdən sonra dərhal otel sisteminə və mətbəxə ötürülür.
              </p>

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => setIsOrderModalOpen(true)}
                  className="fs-btn-primary w-full py-4"
                >
                  Sifarişi Təsdiqlə ({grandTotal.toFixed(2)} ₼)
                </button>

                <a
                  href={`https://wa.me/${displayWhatsapp}?text=${encodeURIComponent(
                    `Salam, otaq servisi üzrə sifarişim:\n\n${cartSummaryText}\n\nCəmi: ${grandTotal.toFixed(
                      2
                    )} ₼\nOtaq nömrəsi: `
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="fs-btn-outline w-full"
                >
                  WhatsApp ilə Sifariş Göndər
                </a>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsInquiryOpen(true)}
                    className="fs-btn-outline w-full !px-2"
                  >
                    Xüsusi İstək
                  </button>
                  <a href={`tel:${displayPhone}`} className="fs-btn-outline w-full !px-2">
                    Resepşna Zəng
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ===================== 3. DIRECT ORDER SUBMISSION MODAL ===================== */}
      <AnimatePresence>
        {isOrderModalOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[var(--fs-backdrop)] backdrop-blur-[2px]"
              onClick={handleCloseOrderModal}
            />

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              className="relative z-10 w-full max-w-[500px] bg-[var(--fs-card)] border-t sm:border border-[var(--fs-border)] rounded-none p-6 sm:p-8 shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto text-[var(--fs-text)]"
            >
              {completedOrder ? (
                <div className="text-center py-4 space-y-5">
                  <div className="w-14 h-14 mx-auto border border-[var(--fs-border-strong)] text-[var(--fs-text)] flex items-center justify-center text-2xl">
                    ✓
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="font-fs-sans font-extralight text-[22px] tracking-[0.16em] uppercase text-[var(--fs-text)]">
                      Sifarişiniz Qəbul Edildi
                    </h3>
                    <p className="font-fs-serif text-[15px] text-[var(--fs-text-muted)]">
                      Sifariş dərhal otel resepsiyonuna və mətbəxə çatdırıldı.
                    </p>
                  </div>

                  <div className="p-5 bg-[var(--fs-surface-subtle)] border border-[var(--fs-border)] text-left space-y-2.5 text-xs">
                    <div className="flex justify-between">
                      <span className="fs-kicker text-[var(--fs-text-muted)]">Sifariş №</span>
                      <span className="font-mono font-bold text-[var(--fs-text)]">
                        #{completedOrder.orderNumber}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="fs-kicker text-[var(--fs-text-muted)]">Otaq / Masa</span>
                      <span className="font-semibold text-[var(--fs-text)]">
                        {completedOrder.roomOrTableNumber}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="fs-kicker text-[var(--fs-text-muted)]">Məbləğ</span>
                      <span className="font-bold text-[var(--fs-text)]">
                        {completedOrder.totalAmount.toFixed(2)} ₼
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-1 border-t border-[var(--fs-border)]">
                      <span className="fs-kicker text-[var(--fs-text-muted)]">Status</span>
                      <span className="fs-kicker px-2 py-0.5 border border-[var(--fs-border-strong)]">
                        Yeni (Gözləmədə)
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleCloseOrderModal}
                    className="fs-btn-primary w-full"
                  >
                    Tamam və Menyuya Qayıt
                  </button>
                </div>
              ) : (
                <form onSubmit={handleOrderSubmit} className="space-y-5">
                  <div className="flex items-start justify-between pb-4 border-b border-[var(--fs-border)]">
                    <div>
                      <h3 className="font-fs-sans font-extralight text-[20px] tracking-[0.16em] uppercase text-[var(--fs-text)]">
                        Sifarişi Təsdiqləyin
                      </h3>
                      <p className="font-fs-serif text-[15px] text-[var(--fs-text-muted)] mt-0.5">
                        {totalCount} məhsul · Cəmi: {grandTotal.toFixed(2)} ₼
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsOrderModalOpen(false)}
                      className="w-8 h-8 border border-[var(--fs-border)] hover:border-[var(--fs-border-strong)] flex items-center justify-center text-sm text-[var(--fs-text-muted)] hover:text-[var(--fs-text)]"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Architectural Segmented Order Type */}
                  <div className="grid grid-cols-2 border border-[var(--fs-border-strong)]">
                    <button
                      type="button"
                      onClick={() => setOrderType(OrderType.RoomService)}
                      className={`py-2.5 text-[10.5px] font-bold uppercase tracking-[0.18em] transition-colors ${
                        orderType === OrderType.RoomService
                          ? 'bg-[var(--fs-inv-bg)] text-[var(--fs-inv-text)]'
                          : 'bg-transparent text-[var(--fs-text-muted)] hover:text-[var(--fs-text)]'
                      }`}
                    >
                      Otaq Xidməti
                    </button>
                    <button
                      type="button"
                      onClick={() => setOrderType(OrderType.RestaurantTable)}
                      className={`py-2.5 text-[10.5px] font-bold uppercase tracking-[0.18em] transition-colors ${
                        orderType === OrderType.RestaurantTable
                          ? 'bg-[var(--fs-inv-bg)] text-[var(--fs-inv-text)]'
                          : 'bg-transparent text-[var(--fs-text-muted)] hover:text-[var(--fs-text)]'
                      }`}
                    >
                      Restoran Masası
                    </button>
                  </div>

                  <div>
                    <label className="block fs-kicker text-[var(--fs-text)] mb-2">
                      {orderType === OrderType.RoomService ? 'Otaq Nömrəniz *' : 'Masa Nömrəniz *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={roomOrTableNumber}
                      onChange={(e) => setRoomOrTableNumber(e.target.value)}
                      placeholder={orderType === OrderType.RoomService ? 'Məsələn: 304' : 'Məsələn: Masa 14'}
                      className="fs-input px-3.5 py-2.5 text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block fs-kicker text-[var(--fs-text-muted)] mb-2">
                        Adınız (İxtiyari)
                      </label>
                      <input
                        type="text"
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        placeholder="Məs: Rəvan"
                        className="fs-input px-3.5 py-2.5 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block fs-kicker text-[var(--fs-text-muted)] mb-2">
                        Əlaqə Telefonu
                      </label>
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="+994 50 ..."
                        className="fs-input px-3.5 py-2.5 text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block fs-kicker text-[var(--fs-text-muted)] mb-2">
                      Xüsusi Qeydlər və İstəklər
                    </label>
                    <textarea
                      rows={2}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Məsələn: Çəngəl-bıçaq əlavə edin, sous ayrıca qoyulsun..."
                      className="fs-input p-3.5 text-sm resize-none"
                    />
                  </div>

                  {orderError && (
                    <div className="p-3.5 bg-[#fef0f0] border border-[#fa8f8f] text-[#310202] text-xs">
                      {orderError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="fs-btn-primary w-full py-3.5 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <div className="w-4 h-4 border border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <span>Sifarişi Göndər ({grandTotal.toFixed(2)} ₼)</span>
                    )}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <InquirySheet
        isOpen={isInquiryOpen}
        onClose={() => setIsInquiryOpen(false)}
        t={t.inquiry}
        slug={hotelSlug}
      />
    </div>
  );
};
