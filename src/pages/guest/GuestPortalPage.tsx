import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { defaultHotelData } from './guestData';
import { IOSIcon } from '../../components/common/IOSIcon';
import { InquirySheet } from './components/InquirySheet';
import { WifiModal } from './components/WifiModal';
import { translations, Language, ServiceItemTranslation } from '../../utils/translations';
import { publicService, PublicHotelProfile } from '../../services/api/publicService';

export const GuestPortalPage: React.FC = () => {
  const { slug } = useParams<{ slug?: string }>();
  const hotelSlug = slug || 'hotel-resort';

  const [selectedLang, setSelectedLang] = useState<Language>('az');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [isInquiryOpen, setIsInquiryOpen] = useState(false);
  const [isWifiOpen, setIsWifiOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'services' | 'activities'>('services');
  const [selectedService, setSelectedService] = useState<ServiceItemTranslation | null>(null);

  // Live Backend Data
  const [liveHotel, setLiveHotel] = useState<PublicHotelProfile | null>(null);
  const [isSuspended, setIsSuspended] = useState<boolean>(false);
  const [suspendReason, setSuspendReason] = useState<string>('');

  const hotel = defaultHotelData;
  const t = translations[selectedLang];

  useEffect(() => {
    publicService
      .getHotelBySlug(hotelSlug)
      .then((data) => {
        setLiveHotel(data);
        setIsSuspended(false);
      })
      .catch((err) => {
        if (err?.response?.status === 403) {
          setIsSuspended(true);
          setSuspendReason(err.response?.data?.message || 'Bu otelin SaaS konsyerj xidməti müvəqqəti dondurulub.');
        } else {
          console.warn('Real API public hotel fetch error, using local fallback:', err);
        }
      });
  }, [hotelSlug]);

  // Theme Sync with HTML document class
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
    }
  }, [isDarkMode]);

  const handleLinkClick = (item: ServiceItemTranslation) => {
    if (item.actionUrl?.startsWith('#')) {
      if (item.id === 'd2' || item.id === 's1') {
        setIsInquiryOpen(true);
        return;
      }
    }
    setSelectedService(item);
  };

  const resolveLinkUrl = (keyword: string, fallback: string) => {
    if (!liveHotel?.categories) return fallback;
    for (const cat of liveHotel.categories) {
      const match = cat.links?.find((l) =>
        l.title?.toLowerCase().includes(keyword.toLowerCase()) ||
        l.iconKey?.toLowerCase().includes(keyword.toLowerCase())
      );
      if (match) {
        if (match.actionUrl?.startsWith('http')) return match.actionUrl;
        return `http://31.57.77.199:5055${match.actionUrl}`;
      }
    }
    return fallback;
  };

  const bookingUrl = resolveLinkUrl('booking', 'https://www.booking.com');
  const tripAdvisorUrl = resolveLinkUrl('tripadvisor', 'https://www.tripadvisor.com');
  const googleReviewUrl = resolveLinkUrl('google', liveHotel?.mapUrl || 'https://maps.google.com/?q=Baku');
  const instagramUrl = resolveLinkUrl('instagram', 'https://instagram.com');
  const facebookUrl = resolveLinkUrl('facebook', 'https://facebook.com');
  const youtubeUrl = resolveLinkUrl('youtube', 'https://youtube.com');
  const telegramUrl = resolveLinkUrl('telegram', liveHotel?.telegram ? `https://t.me/${liveHotel.telegram.replace('@', '')}` : 'https://t.me/hotelresort_bot');

  if (isSuspended) {
    return (
      <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] flex items-center justify-center p-6 selection:bg-[#A78BFA]">
        <div className="w-full max-w-sm rounded-[32px] bg-[var(--bg-card)] border border-rose-500/30 p-8 text-center shadow-2xl space-y-4">
          <div className="w-16 h-16 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto text-3xl">
            ⚠️
          </div>
          <h2 className="text-xl font-bold text-rose-400">Xidmət Müvəqqəti Dayandırılıb</h2>
          <p className="text-xs text-[var(--text-muted)] leading-relaxed">
            {suspendReason || 'Bu otelin rəqəmsal konsyerj və QR SaaS xidməti abunəlik səbəbindən dondurulub.'}
          </p>
          <p className="text-[11px] text-[var(--text-muted)]/60 pt-2 border-t border-[var(--border-color)]">
            Zəhmət olmasa birbaşa otelin qəbul şöbəsi (Reception) ilə əlaqə saxlayın.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] flex justify-center selection:bg-[#A78BFA] selection:text-black transition-colors duration-200">
      {/* Mobile Container */}
      <div className="w-full max-w-[430px] min-h-screen bg-[var(--bg-main)] flex flex-col relative pb-12 border-x border-[var(--border-color)]">
        
        {/* Top Bar: Status + Theme Toggle + Language Segmented Control */}
        <header className="sticky top-0 z-40 bg-[var(--header-bg)] backdrop-blur-md border-b border-[var(--border-color)] px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
            <span className="text-xs font-semibold text-[var(--text-muted)]">
              {t.statusActive}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* iOS Theme Switcher (Dark / Light) */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              title={isDarkMode ? "Light Mode" : "Dark Mode"}
              className="w-8 h-8 rounded-full bg-[var(--bg-card)] border border-[var(--border-color)] flex items-center justify-center text-[#A78BFA] active:scale-95 transition-transform shadow-sm"
            >
              {isDarkMode ? <IOSIcon name="Sun" size={16} /> : <IOSIcon name="Moon" size={15} />}
            </button>

            {/* iOS Segmented Language Bar */}
            <div className="flex items-center gap-1 bg-[var(--bg-card)] rounded-full p-1 border border-[var(--border-color)]">
              {(['az', 'en', 'ru'] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setSelectedLang(lang)}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-full uppercase transition-all ${
                    selectedLang === lang
                      ? 'bg-[#A78BFA] text-black shadow-sm'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>
        </header>

        {/* Hero Cover Image */}
        <div className="relative w-full h-48 overflow-hidden bg-slate-900">
          <img 
            src={hotel.coverImage} 
            alt={t.hotelName}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-main)] via-[var(--bg-main)]/40 to-transparent" />
          
          {/* Share Button */}
          <button 
            onClick={() => {
              if (navigator.share) {
                navigator.share({ title: t.hotelName, url: window.location.href });
              }
            }}
            className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white border border-white/20 active:scale-95 transition-transform"
          >
            <IOSIcon name="Share" size={15} />
          </button>
        </div>

        {/* Hotel Profile & Info */}
        <div className="px-4 -mt-12 relative z-10">
          <div className="flex items-end gap-3.5 mb-3">
            <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-[var(--border-color)] shadow-xl bg-[var(--bg-card)] flex-shrink-0">
              <img 
                src={hotel.logo} 
                alt="Logo" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="pb-1 min-w-0 flex-1">
              <div className="flex items-center gap-1 text-amber-400 text-xs mb-1">
                {[...Array(hotel.stars)].map((_, i) => (
                  <span key={i}>★</span>
                ))}
                <span className="text-[11px] text-[var(--text-muted)] ml-1 font-medium">{t.starsLabel}</span>
              </div>
              <h1 className="text-xl font-bold tracking-tight text-[var(--text-main)] truncate">
                {t.hotelName}
              </h1>
            </div>
          </div>

          <p className="text-xs text-[var(--text-muted)] leading-relaxed mb-5">
            {t.hotelDescription}
          </p>

          {/* 4 Quick Action Buttons (Ionicons 5 iOS Pack) */}
          <div className="grid grid-cols-4 gap-2 mb-6">
            {/* Otaq Servisi */}
            <button
              onClick={() => setIsInquiryOpen(true)}
              className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-[var(--bg-card)] border border-[#A78BFA]/30 active:scale-95 transition-transform shadow-sm"
            >
              <div className="w-10 h-10 rounded-xl bg-[#A78BFA] text-black flex items-center justify-center mb-1.5 shadow">
                <IOSIcon name="Bell" size={19} />
              </div>
              <span className="text-[11px] font-bold text-[var(--text-main)] truncate max-w-full px-1">
                {t.quickActions.roomService}
              </span>
            </button>

            {/* Wi-Fi */}
            <button
              onClick={() => setIsWifiOpen(true)}
              className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] active:scale-95 transition-transform shadow-sm"
            >
              <div className="w-10 h-10 rounded-xl bg-[var(--bg-subcard)] text-[#A78BFA] flex items-center justify-center mb-1.5 border border-[var(--border-color)]">
                <IOSIcon name="Wifi" size={19} />
              </div>
              <span className="text-[11px] font-semibold text-[var(--text-muted)] truncate max-w-full px-1">
                {t.quickActions.wifi}
              </span>
            </button>

            {/* WhatsApp */}
            <a
              href={`https://wa.me/${hotel.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] active:scale-95 transition-transform shadow-sm"
            >
              <div className="w-10 h-10 rounded-xl bg-[var(--bg-subcard)] text-[#A78BFA] flex items-center justify-center mb-1.5 border border-[var(--border-color)]">
                <IOSIcon name="Whatsapp" size={19} />
              </div>
              <span className="text-[11px] font-semibold text-[var(--text-muted)] truncate max-w-full px-1">
                {t.quickActions.whatsapp}
              </span>
            </a>

            {/* Zəng Et - Pure iOS Phone Call Icon */}
            <a
              href={`tel:${hotel.phone}`}
              className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] active:scale-95 transition-transform shadow-sm"
            >
              <div className="w-10 h-10 rounded-xl bg-[var(--bg-subcard)] text-[#A78BFA] flex items-center justify-center mb-1.5 border border-[var(--border-color)]">
                <IOSIcon name="Phone" size={18} />
              </div>
              <span className="text-[11px] font-semibold text-[var(--text-muted)] truncate max-w-full px-1">
                {t.quickActions.call}
              </span>
            </a>
          </div>

          {/* Tabs: Services vs Activities */}
          <div className="bg-[var(--bg-card)] p-1 rounded-2xl flex gap-1 mb-6 border border-[var(--border-color)] shadow-sm">
            <button
              onClick={() => setActiveTab('services')}
              className={`flex-1 py-2.5 px-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'services'
                  ? 'bg-[#A78BFA] text-black shadow'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
            >
              <IOSIcon name="Sparkles" size={15} />
              <span>{t.tabs.services}</span>
            </button>
            <button
              onClick={() => setActiveTab('activities')}
              className={`flex-1 py-2.5 px-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'activities'
                  ? 'bg-[#A78BFA] text-black shadow'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
            >
              <IOSIcon name="Calendar" size={15} />
              <span>{t.tabs.activities}</span>
            </button>
          </div>

          {/* Tab Content 1: Categories & Menu */}
          {activeTab === 'services' && (
            <div className="space-y-6">
              {t.categories.map((category) => (
                <div key={category.id}>
                  <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] px-1 mb-2.5">
                    {category.title}
                  </h2>

                  <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] divide-y divide-[var(--border-color)] overflow-hidden shadow-sm">
                    {category.items.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handleLinkClick(item)}
                        className="p-3.5 flex items-center justify-between cursor-pointer active:bg-[#A78BFA]/5 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="w-10 h-10 rounded-xl bg-[var(--bg-subcard)] text-[#A78BFA] flex items-center justify-center flex-shrink-0 border border-[var(--border-color)]">
                            <IOSIcon name={item.iconName} size={19} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-[var(--text-main)] tracking-tight truncate">
                                {item.title}
                              </span>
                              {item.badge && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#A78BFA]/20 text-[#8B5CF6] dark:text-[#A78BFA]">
                                  {item.badge}
                                </span>
                              )}
                            </div>
                            {item.subtitle && (
                              <p className="text-[11px] text-[var(--text-muted)] truncate mt-0.5">
                                {item.subtitle}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="text-[var(--text-muted)]/50 flex-shrink-0 ml-2">
                          <IOSIcon name="ChevronRight" size={15} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tab Content 2: Activities */}
          {activeTab === 'activities' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1 mb-2">
                <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  {t.todaySchedule}
                </h2>
                <span className="text-[11px] text-[#A78BFA] font-bold">{t.allResort}</span>
              </div>

              {t.activities.map((act) => (
                <div 
                  key={act.id} 
                  className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] flex items-start justify-between shadow-sm"
                >
                  <div className="space-y-1">
                    <span className="inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#A78BFA]/20 text-[#8B5CF6] dark:text-[#A78BFA]">
                      {act.category}
                    </span>
                    <h3 className="text-sm font-bold text-[var(--text-main)]">{act.title}</h3>
                    <div className="flex items-center gap-3 text-[11px] text-[var(--text-muted)] pt-1">
                      <span className="flex items-center gap-1">
                        <span className="text-[#A78BFA]"><IOSIcon name="Clock" size={13} /></span>
                        {act.time}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="text-[#A78BFA]"><IOSIcon name="MapPin" size={13} /></span>
                        {act.location}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Wi-Fi Quick Card */}
          <div className="mt-6">
            <div 
              onClick={() => setIsWifiOpen(true)}
              className="p-3.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] flex items-center justify-between cursor-pointer active:scale-[0.98] transition-transform shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#A78BFA]/20 text-[#A78BFA] flex items-center justify-center">
                  <IOSIcon name="Wifi" size={19} />
                </div>
                <div>
                  <span className="text-xs font-bold text-[var(--text-main)] block">{t.wifiBanner.title}</span>
                  <span className="text-[11px] text-[var(--text-muted)] block">
                    {hotel.wifi.ssid} • {t.wifiBanner.action}
                  </span>
                </div>
              </div>
              <button className="text-xs font-bold text-black bg-[#A78BFA] px-3.5 py-1.5 rounded-xl shadow-sm">
                {t.wifiBanner.connectBtn}
              </button>
            </div>
          </div>

          {/* Hotel External Booking & Review Platforms */}
          <div className="mt-6 space-y-2.5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] px-1">
              {selectedLang === 'az' ? 'Onlayn Rezervasiya & Rəylər' : selectedLang === 'ru' ? 'Онлайн Бронирование и Отзывы' : 'Online Booking & Reviews'}
            </h2>

            <div className="rounded-[24px] bg-[var(--bg-card)] border border-[var(--border-color)] divide-y divide-[var(--border-color)] overflow-hidden shadow-sm">
              {/* Booking.com */}
              <a
                href={bookingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3.5 flex items-center justify-between hover:bg-[var(--bg-subcard)] transition-colors active:scale-[0.99]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#003580]/15 text-[#003580] dark:text-[#5b95ea] flex items-center justify-center">
                    <IOSIcon name="Booking" size={20} />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[var(--text-main)] block">Booking.com</span>
                    <span className="text-[11px] text-[var(--text-muted)] block">
                      {selectedLang === 'az' ? 'Otaq rezervasiyası və xüsusi təkliflər' : selectedLang === 'ru' ? 'Бронирование номеров и спецпредложения' : 'Room reservation & special deals'}
                    </span>
                  </div>
                </div>
                <div className="text-[var(--text-muted)]/50">
                  <IOSIcon name="ChevronRight" size={16} />
                </div>
              </a>

              {/* TripAdvisor */}
              <a
                href={tripAdvisorUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3.5 flex items-center justify-between hover:bg-[var(--bg-subcard)] transition-colors active:scale-[0.99]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#00AF87]/15 text-[#00AF87] flex items-center justify-center">
                    <IOSIcon name="TripAdvisor" size={20} />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[var(--text-main)] block">TripAdvisor</span>
                    <span className="text-[11px] text-[var(--text-muted)] block">
                      {selectedLang === 'az' ? 'Qonaq rəyləri və səyahətçi tövsiyələri' : selectedLang === 'ru' ? 'Отзывы гостей и рекомендации' : 'Guest reviews and traveler ratings'}
                    </span>
                  </div>
                </div>
                <div className="text-[var(--text-muted)]/50">
                  <IOSIcon name="ChevronRight" size={16} />
                </div>
              </a>

              {/* Google Reviews & Maps */}
              <a
                href={googleReviewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3.5 flex items-center justify-between hover:bg-[var(--bg-subcard)] transition-colors active:scale-[0.99]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#EA4335]/15 text-[#EA4335] flex items-center justify-center">
                    <IOSIcon name="GoogleMaps" size={20} />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[var(--text-main)] block">Google Maps & Rəylər</span>
                    <span className="text-[11px] text-[var(--text-muted)] block">
                      {selectedLang === 'az' ? 'Dəqiq xəritə naviqasiyası və rəy yaz' : selectedLang === 'ru' ? 'Навигация по карте и отзывы' : 'Map directions & rate us on Google'}
                    </span>
                  </div>
                </div>
                <div className="text-[var(--text-muted)]/50">
                  <IOSIcon name="ChevronRight" size={16} />
                </div>
              </a>
            </div>
          </div>

          {/* Social Media Channels */}
          <div className="mt-6 space-y-2.5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] px-1">
              {selectedLang === 'az' ? 'Sosial Şəbəkələrdə Biz' : selectedLang === 'ru' ? 'Мы в Социальных Сетях' : 'Follow Us on Social Media'}
            </h2>

            <div className="grid grid-cols-4 gap-2.5">
              {/* Instagram */}
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] flex flex-col items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-transform hover:border-pink-500/40"
              >
                <div className="w-9 h-9 rounded-xl bg-pink-500/15 text-pink-500 flex items-center justify-center">
                  <IOSIcon name="Instagram" size={20} />
                </div>
                <span className="text-[11px] font-semibold text-[var(--text-main)]">Instagram</span>
              </a>

              {/* Facebook */}
              <a
                href={facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] flex flex-col items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-transform hover:border-blue-500/40"
              >
                <div className="w-9 h-9 rounded-xl bg-blue-500/15 text-blue-500 flex items-center justify-center">
                  <IOSIcon name="Facebook" size={20} />
                </div>
                <span className="text-[11px] font-semibold text-[var(--text-main)]">Facebook</span>
              </a>

              {/* YouTube */}
              <a
                href={youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] flex flex-col items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-transform hover:border-red-500/40"
              >
                <div className="w-9 h-9 rounded-xl bg-red-500/15 text-red-500 flex items-center justify-center">
                  <IOSIcon name="YouTube" size={20} />
                </div>
                <span className="text-[11px] font-semibold text-[var(--text-main)]">YouTube</span>
              </a>

              {/* Telegram */}
              <a
                href={telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] flex flex-col items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-transform hover:border-sky-500/40"
              >
                <div className="w-9 h-9 rounded-xl bg-sky-500/15 text-sky-400 flex items-center justify-center">
                  <IOSIcon name="Telegram" size={20} />
                </div>
                <span className="text-[11px] font-semibold text-[var(--text-main)]">Telegram</span>
              </a>
            </div>
          </div>

          {/* Footer Info */}
          <footer className="mt-8 mb-4 text-center space-y-1">
            <p className="text-[11px] text-[var(--text-muted)]">
              {liveHotel?.address || t.footerAddress}
            </p>
            <p className="text-[10px] text-[var(--text-muted)]/60">
              {t.footerPowered}
            </p>
          </footer>

          {/* iOS Bottom Home Bar Indicator */}
          <div className="flex justify-center pt-2">
            <div className="w-28 h-1 rounded-full bg-black/20 dark:bg-white/20" />
          </div>

        </div>

        {/* Inquiry Bottom Sheet */}
        <InquirySheet
          isOpen={isInquiryOpen}
          onClose={() => setIsInquiryOpen(false)}
          t={t.inquiry}
          slug={hotelSlug}
        />

        {/* Wi-Fi Details Modal */}
        <WifiModal
          isOpen={isWifiOpen}
          onClose={() => setIsWifiOpen(false)}
          ssid={hotel.wifi.ssid}
          pass={hotel.wifi.pass}
          t={t.wifiModal}
        />

        {/* Service Quick Detail Modal */}
        {selectedService && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className="absolute inset-0" onClick={() => setSelectedService(null)} />
            <div className="relative w-full max-w-sm rounded-[24px] bg-[var(--bg-card)] border border-[var(--border-color)] p-5 shadow-2xl z-10 text-center animate-slide-up text-[var(--text-main)]">
              <div className="mx-auto mb-3 w-12 h-12 rounded-xl bg-[#A78BFA]/20 text-[#A78BFA] flex items-center justify-center">
                <IOSIcon name={selectedService.iconName} size={24} />
              </div>
              <h3 className="text-base font-bold text-[var(--text-main)]">{selectedService.title}</h3>
              <p className="text-xs text-[var(--text-muted)] mt-1">{selectedService.subtitle}</p>
              
              <div className="mt-5 space-y-2">
                <button
                  onClick={() => {
                    setSelectedService(null);
                    setIsInquiryOpen(true);
                  }}
                  className="w-full py-3 rounded-xl bg-[#A78BFA] text-black text-xs font-bold active:scale-95 transition-transform shadow-md"
                >
                  {t.serviceModal.orderBtn}
                </button>
                <button
                  onClick={() => setSelectedService(null)}
                  className="w-full py-2.5 rounded-xl bg-[var(--bg-subcard)] text-[var(--text-muted)] hover:text-[var(--text-main)] text-xs font-semibold"
                >
                  {t.serviceModal.closeBtn}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
