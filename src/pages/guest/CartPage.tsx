import React, { useState } from 'react';
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

export const CartPage: React.FC = () => {
  const { slug } = useParams<{ slug?: string }>();
  const hotelSlug = slug || 'altensor';
  const isDemoHotel = hotelSlug === 'altensor' || hotelSlug === 'skyhill';
  const navigate = useNavigate();

  const { currentLang } = useLanguage();
  const selectedLang = (currentLang as Language) || 'az';
  const { data: portalData } = useHotelPortal(hotelSlug);

  const [isInquiryOpen, setIsInquiryOpen] = useState(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  // Order Submission Form State
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
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] font-hotel-sans flex justify-center selection:bg-[#A78BFA] selection:text-black transition-colors duration-200">
      {/* Main Responsive Column */}
      <div className="w-full max-w-[540px] min-h-screen bg-[var(--bg-main)] flex flex-col relative pb-10 border-x border-[var(--border-color)] overflow-x-hidden shadow-2xl">
        
        {/* ===================== 1. HEADER ===================== */}
        <header className="relative w-full h-[140px] overflow-hidden bg-gradient-to-br from-[#3e2c20] via-[#2d2017] to-[#1c130d] dark:from-[#231b2e] dark:via-[#191322] dark:to-[#0f0b15] flex-none">
          {/* Subtle Right Watermark Shopping Bag Outline */}
          <span className="absolute right-3 -bottom-2 text-[#dfc08a]/15 dark:text-[#A78BFA]/15 pointer-events-none select-none">
            <svg
              width="130"
              height="130"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.75"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M16 10a4 4 0 0 1-8 0" />
              <path d="M3.103 6.034h17.794" />
              <path d="M3.4 5.467a2 2 0 0 0-.4 1.2V20a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6.667a2 2 0 0 0-.4-1.2l-2-2.667A2 2 0 0 0 17 2H7a2 2 0 0 0-1.6.8z" />
            </svg>
          </span>

          {/* Top Bar with Back & Home Buttons */}
          <div className="absolute top-[14px] left-[14px] right-[14px] z-20 flex items-center justify-between pointer-events-auto">
            {/* Back button */}
            <button
              type="button"
              onClick={() => navigate(-1)}
              aria-label="Geri"
              className="w-[36px] h-[36px] rounded-full bg-[#101826]/70 border border-white/20 backdrop-blur-md text-white flex items-center justify-center hover:bg-white/20 active:scale-95 transition-all shadow-sm"
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

            {/* Clear Cart Button */}
            {totalCount > 0 && (
              <button
                type="button"
                onClick={clearCart}
                className="px-3 py-1.5 rounded-full bg-red-500/20 border border-red-400/30 text-red-300 text-xs font-semibold hover:bg-red-500/30 active:scale-95 transition-all shadow-sm flex items-center gap-1.5 backdrop-blur-md"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
                <span>Təmizlə</span>
              </button>
            )}

            {/* Home button */}
            <button
              type="button"
              onClick={() => navigate(homePath)}
              aria-label="Ana Səhifə"
              className="w-[36px] h-[36px] rounded-full bg-[#101826]/70 border border-white/20 backdrop-blur-md text-white flex items-center justify-center hover:bg-white/20 active:scale-95 transition-all shadow-sm"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </button>
          </div>

          {/* Title and Subtitle Block */}
          <div className="absolute bottom-[16px] left-[18px] right-[18px] z-10 pointer-events-none">
            <h1 className="font-hotel-serif text-[28px] sm:text-[30px] font-bold text-white tracking-[0.04em] leading-tight flex items-center gap-2">
              <span>Səbət</span>
              {totalCount > 0 && (
                <span className="text-xs font-sans font-bold px-2 py-0.5 rounded-full bg-[#dfc08a] dark:bg-[#A78BFA] text-black">
                  {totalCount}
                </span>
              )}
            </h1>
            <p className="text-[12px] text-white/70 font-medium tracking-[0.06em] mt-0.5">
              Seçilmiş xidmətlər və yeməklər
            </p>
          </div>
        </header>

        {/* ===================== 2. CART CONTENT ===================== */}
        <div className="flex-1 px-4 py-4 space-y-4">
          {cartItemsDetailed.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-16 h-16 mx-auto rounded-full bg-[var(--bg-subcard)] flex items-center justify-center text-3xl">
                🛒
              </div>
              <h3 className="font-bold text-lg text-[var(--text-main)]">Səbətiniz boşdur</h3>
              <p className="text-xs text-[var(--text-muted)] max-w-xs mx-auto">
                Restoran, spa və ya digər xidmətlərdən seçim edərək səbətə əlavə edə bilərsiniz.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => navigate(menuPath)}
                  className="px-6 py-2.5 rounded-xl bg-[#a87b51] dark:bg-[#A78BFA] text-white dark:text-black text-xs font-bold shadow-md active:scale-95 transition-transform"
                >
                  Menyuya Keçid
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Item List */}
              <div className="space-y-2">
                {cartItemsDetailed.map(({ item, venue, quantity }) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] flex items-center justify-between gap-3 shadow-sm"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Image Thumbnail */}
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-[var(--bg-subcard)] flex-none">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = '/media/guest/dish-placeholder.webp';
                          }}
                        />
                      </div>

                      {/* Title & Price */}
                      <div className="min-w-0 pr-1">
                        <h4 className="font-semibold text-[13.5px] text-[var(--text-main)] leading-snug line-clamp-1">
                          {item.name}
                        </h4>
                        <span className="text-[11px] text-[var(--text-muted)] block">
                          {venue.title}
                        </span>
                        <span className="text-[13px] font-bold text-[#a87b51] dark:text-[#A78BFA] block mt-0.5">
                          {item.price || `${item.priceNum.toFixed(2)} ₼`}
                        </span>
                      </div>
                    </div>

                    {/* Stepper Pill: - qty + */}
                    <div className="flex items-center gap-2 bg-[var(--bg-subcard)] border border-[var(--border-color)] rounded-full px-1.5 py-0.5 flex-none shadow-sm">
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold text-[var(--text-muted)] hover:text-[var(--text-main)] active:scale-90 transition-transform"
                        aria-label="Azalt"
                      >
                        –
                      </button>
                      <span className="text-[13px] font-bold text-[var(--text-main)] min-w-[16px] text-center tabular-nums">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => addItem(item.id)}
                        className="w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold text-[var(--text-muted)] hover:text-[var(--text-main)] active:scale-90 transition-transform"
                        aria-label="Artır"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary Card */}
              <div className="rounded-[16px] bg-[var(--bg-card)] border border-[var(--border-color)] p-4 space-y-2.5 shadow-sm">
                <div className="flex items-center justify-between text-[13px] text-[var(--text-muted)]">
                  <span>Məhsulların cəmi</span>
                  <span className="tabular-nums font-semibold">{totalPrice.toFixed(2)} ₼</span>
                </div>

                {serviceFeePercent > 0 && (
                  <div className="flex items-center justify-between text-[13px] text-[var(--text-muted)]">
                    <span>Xidmət haqqı ({serviceFeePercent}%)</span>
                    <span className="tabular-nums font-semibold">+{serviceFeeAmount.toFixed(2)} ₼</span>
                  </div>
                )}

                <div className="border-t border-[var(--border-color)] my-1" />

                <div className="flex items-center justify-between text-[15px] font-bold text-[var(--text-main)]">
                  <span>Yekun Ödəniləcək</span>
                  <span className="tabular-nums font-bold text-[#a87b51] dark:text-[#A78BFA] text-lg">
                    {grandTotal.toFixed(2)} ₼
                  </span>
                </div>
              </div>

              {/* Notice Box */}
              <div className="rounded-[14px] bg-[var(--bg-subcard)]/70 border border-[var(--border-color)] p-3 text-xs text-[var(--text-muted)] leading-relaxed shadow-sm">
                ℹ️ Sifarişiniz təsdiqləndikdən sonra dərhal otel sisteminə və mətbəxə ötürülür.
              </div>

              {/* Primary Direct Order Button */}
              <div className="pt-1 space-y-2.5">
                <button
                  type="button"
                  onClick={() => setIsOrderModalOpen(true)}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#2A1D14] to-[#453123] dark:from-[#A78BFA] dark:to-[#8B5CF6] text-[#F6F1E8] dark:text-black text-sm font-extrabold shadow-xl shadow-[#2A1D14]/20 dark:shadow-[#A78BFA]/20 flex items-center justify-center gap-2 active:scale-95 transition-all"
                >
                  <span>🛎️ Sifarişi Təsdiqlə ({grandTotal.toFixed(2)} ₼)</span>
                </button>

                {/* Secondary Alternative Action: WhatsApp */}
                <a
                  href={`https://wa.me/${displayWhatsapp}?text=${encodeURIComponent(
                    `Salam, otaq servisi üzrə sifarişim:\n\n${cartSummaryText}\n\nCəmi: ${grandTotal.toFixed(
                      2
                    )} ₼\nOtaq nömrəsi: `
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] text-xs font-semibold flex items-center justify-center gap-2 hover:border-[#25D366] active:scale-95 transition-all"
                >
                  <span className="text-[#25D366]">💬</span>
                  <span>WhatsApp ilə Sifariş Göndər</span>
                </a>

                {/* Bottom Row Actions */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setIsInquiryOpen(true)}
                    className="py-2.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] text-xs font-medium flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
                  >
                    📝 Xüsusi İstək
                  </button>
                  <a
                    href={`tel:${displayPhone}`}
                    className="py-2.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] text-xs font-medium flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
                  >
                    📞 Resepşna Zəng
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ===================== 3. DIRECT ORDER SUBMISSION MODAL ===================== */}
        <AnimatePresence>
          {isOrderModalOpen && (
            <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-0 sm:p-4">
              <motion.div
                initial={{ opacity: 0, y: 60 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 60 }}
                className="w-full max-w-[480px] bg-[var(--bg-main)] border border-[var(--border-color)] rounded-t-[28px] sm:rounded-[28px] p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
              >
                {completedOrder ? (
                  // Receipt View on Success
                  <div className="text-center py-4 space-y-4">
                    <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center text-3xl font-bold">
                      ✓
                    </div>
                    <div>
                      <h3 className="text-xl font-bold font-hotel-serif text-[var(--text-main)]">
                        Sifarişiniz Qəbul Edildi!
                      </h3>
                      <p className="text-xs text-[var(--text-muted)] mt-1">
                        Sifariş dərhal otel resepsiyonuna və mətbəxə çatdırıldı.
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] text-left space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-[var(--text-muted)]">Sifariş №:</span>
                        <span className="font-mono font-bold text-[#a87b51] dark:text-[#A78BFA]">
                          #{completedOrder.orderNumber}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[var(--text-muted)]">Otaq / Masa:</span>
                        <span className="font-semibold text-[var(--text-main)]">
                          {completedOrder.roomOrTableNumber}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[var(--text-muted)]">Məbləğ:</span>
                        <span className="font-bold text-[var(--text-main)]">
                          {completedOrder.totalAmount.toFixed(2)} ₼
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[var(--text-muted)]">Status:</span>
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-500 font-bold text-[10px]">
                          Yeni (Gözləmədə)
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleCloseOrderModal}
                      className="w-full py-3.5 rounded-2xl bg-[#a87b51] dark:bg-[#A78BFA] text-white dark:text-black font-bold text-xs shadow-md active:scale-95 transition-transform"
                    >
                      Tamam və Menyuya Qayıt
                    </button>
                  </div>
                ) : (
                  // Form View
                  <form onSubmit={handleOrderSubmit} className="space-y-4">
                    {/* Header */}
                    <div className="flex items-center justify-between pb-2 border-b border-[var(--border-color)]">
                      <div>
                        <h3 className="text-base font-bold text-[var(--text-main)] font-hotel-serif">
                          Sifarişi Təsdiqləyin
                        </h3>
                        <p className="text-[11px] text-[var(--text-muted)]">
                          {totalCount} məhsul · Cəmi: {grandTotal.toFixed(2)} ₼
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsOrderModalOpen(false)}
                        className="w-8 h-8 rounded-full bg-[var(--bg-subcard)] flex items-center justify-center text-sm text-[var(--text-muted)] hover:text-[var(--text-main)]"
                      >
                        ✕
                      </button>
                    </div>

                    {/* Order Type Tabs */}
                    <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-[var(--bg-subcard)] border border-[var(--border-color)]">
                      <button
                        type="button"
                        onClick={() => setOrderType(OrderType.RoomService)}
                        className={`py-2 text-xs font-bold rounded-lg transition-all ${
                          orderType === OrderType.RoomService
                            ? 'bg-[var(--bg-main)] text-[var(--text-main)] shadow-sm'
                            : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                        }`}
                      >
                        🛎️ Otaq Xidməti
                      </button>
                      <button
                        type="button"
                        onClick={() => setOrderType(OrderType.RestaurantTable)}
                        className={`py-2 text-xs font-bold rounded-lg transition-all ${
                          orderType === OrderType.RestaurantTable
                            ? 'bg-[var(--bg-main)] text-[var(--text-main)] shadow-sm'
                            : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                        }`}
                      >
                        🍽️ Restoran Masası
                      </button>
                    </div>

                    {/* Room or Table Input (Required) */}
                    <div>
                      <label className="block text-[11px] font-bold text-[var(--text-main)] uppercase tracking-wider mb-1.5">
                        {orderType === OrderType.RoomService ? 'Otaq Nömrəniz *' : 'Masa Nömrəniz *'}
                      </label>
                      <input
                        type="text"
                        required
                        value={roomOrTableNumber}
                        onChange={(e) => setRoomOrTableNumber(e.target.value)}
                        placeholder={orderType === OrderType.RoomService ? 'Məsələn: 304' : 'Məsələn: Masa 14'}
                        className="w-full px-3.5 py-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-sm text-[var(--text-main)] focus:outline-none focus:border-[#a87b51] dark:focus:border-[#A78BFA]"
                      />
                    </div>

                    {/* Guest Name & Phone */}
                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[11px] font-medium text-[var(--text-muted)] mb-1">
                          Adınız (İxtiyari)
                        </label>
                        <input
                          type="text"
                          value={guestName}
                          onChange={(e) => setGuestName(e.target.value)}
                          placeholder="Məs: Rəvan"
                          className="w-full px-3 py-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-xs text-[var(--text-main)] focus:outline-none focus:border-[#a87b51] dark:focus:border-[#A78BFA]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-[var(--text-muted)] mb-1">
                          Əlaqə Telefonu
                        </label>
                        <input
                          type="tel"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          placeholder="+994 50 ..."
                          className="w-full px-3 py-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-xs text-[var(--text-main)] focus:outline-none focus:border-[#a87b51] dark:focus:border-[#A78BFA]"
                        />
                      </div>
                    </div>

                    {/* Notes / Special Instructions */}
                    <div>
                      <label className="block text-[11px] font-medium text-[var(--text-muted)] mb-1">
                        Xüsusi Qeydlər və İstəklər
                      </label>
                      <textarea
                        rows={2}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Məsələn: Çəngəl-bıçaq əlavə edin, sous ayrıca qoyulsun..."
                        className="w-full px-3 py-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-xs text-[var(--text-main)] focus:outline-none focus:border-[#a87b51] dark:focus:border-[#A78BFA] resize-none"
                      />
                    </div>

                    {/* Error Notice */}
                    {orderError && (
                      <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-500 text-xs">
                        {orderError}
                      </div>
                    )}

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3.5 rounded-2xl bg-[#a87b51] dark:bg-[#A78BFA] text-white dark:text-black font-extrabold text-xs shadow-lg shadow-[#a87b51]/25 dark:shadow-[#A78BFA]/25 flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <span>✓ Sifarişi Göndər ({grandTotal.toFixed(2)} ₼)</span>
                      )}
                    </button>
                  </form>
                )}
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
