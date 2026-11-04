import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { defaultHotelData } from './guestData';
import { IOSIcon } from '../../components/common/IOSIcon';
import { InquirySheet } from './components/InquirySheet';
import { WifiModal } from './components/WifiModal';
import { translations, Language, ServiceItemTranslation } from '../../utils/translations';
import { publicService, PublicHotelProfile } from '../../services/api/publicService';
import { resolveBackendMediaUrl } from '../../services/api/hotelAdminService';
import { fetchHotelQrSvg } from '../../utils/qrIntegration';

// Animation variants for staggered cascading entry
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.02,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 350,
      damping: 24,
    },
  },
};

export const GuestPortalPage: React.FC = () => {
  const { slug } = useParams<{ slug?: string }>();
  const hotelSlug = slug || 'hotel-resort';

  const [selectedLang, setSelectedLang] = useState<Language>('az');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [isInquiryOpen, setIsInquiryOpen] = useState(false);
  const [isWifiOpen, setIsWifiOpen] = useState(false);
  const [isQrShareOpen, setIsQrShareOpen] = useState(false);
  const [guestQrSvg, setGuestQrSvg] = useState<string>('');
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
      .getHotelBySlug(hotelSlug, selectedLang)
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
  }, [hotelSlug, selectedLang]);

  const displayHotelName = liveHotel?.name || t.hotelName;
  const displayHotelBio = liveHotel?.bio || t.hotelDescription;
  const displayCoverImage = liveHotel?.coverImageUrl
    ? resolveBackendMediaUrl(liveHotel.coverImageUrl)
    : hotel.coverImage;
  const displayLogo = liveHotel?.logoUrl
    ? resolveBackendMediaUrl(liveHotel.logoUrl)
    : hotel.logo;
  const displayPhone = liveHotel?.phone || hotel.phone;
  const displayWhatsapp = (liveHotel?.whatsApp || hotel.whatsapp).replace(/[^0-9]/g, '');

  const displayCategories =
    liveHotel?.categories && liveHotel.categories.length > 0 && liveHotel.categories.some((c) => c.links && c.links.length > 0)
      ? liveHotel.categories
          .filter((c) => c.links && c.links.length > 0)
          .map((c) => ({
            id: c.id,
            title: c.title,
            items: c.links.map((l) => ({
              id: l.id,
              title: l.title,
              subtitle: '',
              iconName: l.iconKey || 'Sparkles',
              actionUrl: l.actionUrl ? resolveBackendMediaUrl(l.actionUrl) : '#',
            })),
          }))
      : t.categories;

  const displayActivities =
    liveHotel?.activities && liveHotel.activities.length > 0
      ? liveHotel.activities.map((a) => ({
          id: a.id,
          title: a.title,
          time: a.endTime ? `${a.startTime} - ${a.endTime}` : a.startTime,
          location: a.location || displayHotelName,
          category: a.category || 'Tədbir',
        }))
      : t.activities;

  // Theme Sync with HTML document class
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
    }
  }, [isDarkMode]);

  const handleLinkClick = (item: ServiceItemTranslation) => {
    if (item.actionUrl?.startsWith('http')) {
      window.open(item.actionUrl, '_blank', 'noopener,noreferrer');
      return;
    }
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
  const airbnbUrl = resolveLinkUrl('airbnb', 'https://www.airbnb.com');
  const instagramUrl = resolveLinkUrl('instagram', 'https://instagram.com');
  const facebookUrl = resolveLinkUrl('facebook', 'https://facebook.com');
  const tiktokUrl = resolveLinkUrl('tiktok', 'https://tiktok.com');
  const youtubeUrl = resolveLinkUrl('youtube', 'https://youtube.com');
  const telegramUrl = resolveLinkUrl('telegram', liveHotel?.telegram ? `https://t.me/${liveHotel.telegram.replace('@', '')}` : 'https://t.me/hotelresort_bot');

  if (isSuspended) {
    return (
      <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] flex items-center justify-center p-6 selection:bg-[#A78BFA]">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="w-full max-w-sm rounded-[32px] bg-[var(--bg-card)] border border-rose-500/30 p-8 text-center shadow-2xl space-y-4"
        >
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
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] flex justify-center selection:bg-[#A78BFA] selection:text-black transition-colors duration-200">
      {/* Mobile Container */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-[430px] min-h-screen bg-[var(--bg-main)] flex flex-col relative pb-12 border-x border-[var(--border-color)] overflow-x-hidden"
      >
        {/* Top Bar: Status + Theme Toggle + Fluid Segmented Language Control */}
        <header className="sticky top-0 z-40 bg-[var(--header-bg)] backdrop-blur-md border-b border-[var(--border-color)] px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse inline-block shadow-sm shadow-emerald-500/50" />
            <span className="text-xs font-semibold text-[var(--text-muted)]">
              {t.statusActive}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* iOS Theme Switcher with Rotation Micro-Interaction */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ rotate: 180, scale: 0.85 }}
              transition={{ type: 'spring', stiffness: 400, damping: 15 }}
              onClick={() => setIsDarkMode(!isDarkMode)}
              title={isDarkMode ? "Light Mode" : "Dark Mode"}
              className="w-8 h-8 rounded-full bg-[var(--bg-card)] border border-[var(--border-color)] flex items-center justify-center text-[#A78BFA] shadow-sm"
            >
              {isDarkMode ? <IOSIcon name="Sun" size={16} /> : <IOSIcon name="Moon" size={15} />}
            </motion.button>

            {/* Apple iOS Fluid Segmented Language Slider */}
            <div className="relative flex items-center bg-[var(--bg-card)] rounded-full p-1 border border-[var(--border-color)]">
              {(['az', 'en', 'ru'] as const).map((lang) => {
                const isActive = selectedLang === lang;
                return (
                  <motion.button
                    key={lang}
                    whileTap={{ scale: 0.92 }}
                    onClick={() => setSelectedLang(lang)}
                    className={`relative z-10 px-2.5 py-1 text-[11px] font-bold uppercase transition-colors duration-150 ${
                      isActive ? 'text-black' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                    }`}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="activeLangBubble"
                        transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                        className="absolute inset-0 bg-[#A78BFA] rounded-full shadow-sm"
                        style={{ zIndex: -1 }}
                      />
                    )}
                    {lang}
                  </motion.button>
                );
              })}
            </div>
          </div>
        </header>

        {/* Hero Cover Image with Smooth Cinematic Parallax */}
        <motion.div variants={itemVariants} className="relative w-full h-48 overflow-hidden bg-slate-900">
          <motion.img 
            initial={{ scale: 1.06 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
            src={displayCoverImage} 
            alt={displayHotelName}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-main)] via-[var(--bg-main)]/40 to-transparent" />
          
          {/* Share / Show QR Button with Spring Tap */}
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.88 }}
            transition={{ type: 'spring', stiffness: 450, damping: 17 }}
            onClick={() => {
              setIsQrShareOpen(true);
              if (!guestQrSvg) {
                fetchHotelQrSvg(hotelSlug)
                  .then((svg) => {
                    if (svg) setGuestQrSvg(svg);
                  })
                  .catch(() => {});
              }
            }}
            title="QR Kodu Göstər & Bölüş"
            className="absolute top-3 right-3 px-3 h-9 rounded-full bg-black/50 backdrop-blur-md flex items-center gap-1.5 text-white border border-white/20 shadow-lg text-[11px] font-bold"
          >
            <IOSIcon name="Share" size={14} />
            <span>QR</span>
          </motion.button>
        </motion.div>

        {/* Hotel Profile & Info */}
        <div className="px-4 -mt-12 relative z-10">
          <motion.div variants={itemVariants} className="flex items-end gap-3.5 mb-3">
            <motion.div
              whileHover={{ scale: 1.05, rotate: -2 }}
              transition={{ type: 'spring', stiffness: 350, damping: 20 }}
              className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-[var(--border-color)] shadow-xl bg-[var(--bg-card)] flex-shrink-0"
            >
              <img 
                src={displayLogo} 
                alt="Logo" 
                className="w-full h-full object-cover"
              />
            </motion.div>
            <div className="pb-1 min-w-0 flex-1">
              <div className="flex items-center gap-1 text-amber-400 text-xs mb-1">
                {[...Array(hotel.stars)].map((_, i) => (
                  <span key={i}>★</span>
                ))}
                <span className="text-[11px] text-[var(--text-muted)] ml-1 font-medium">{t.starsLabel}</span>
              </div>
              <h1 className="text-xl font-bold tracking-tight text-[var(--text-main)] truncate">
                {displayHotelName}
              </h1>
            </div>
          </motion.div>

          <motion.p variants={itemVariants} className="text-xs text-[var(--text-muted)] leading-relaxed mb-5">
            {displayHotelBio}
          </motion.p>

          {/* 4 Quick Action Buttons with Floating Spring Micro-Interactions */}
          <motion.div variants={itemVariants} className="grid grid-cols-4 gap-2 mb-6">
            {/* Otaq Servisi */}
            <motion.button
              whileHover={{ y: -3, scale: 1.03 }}
              whileTap={{ scale: 0.91 }}
              transition={{ type: 'spring', stiffness: 450, damping: 18 }}
              onClick={() => setIsInquiryOpen(true)}
              className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-[var(--bg-card)] border border-[#A78BFA]/30 shadow-sm hover:border-[#A78BFA] transition-colors group"
            >
              <div className="w-10 h-10 rounded-xl bg-[#A78BFA] text-black flex items-center justify-center mb-1.5 shadow-md shadow-[#A78BFA]/30 group-hover:scale-105 transition-transform">
                <IOSIcon name="Bell" size={19} />
              </div>
              <span className="text-[11px] font-bold text-[var(--text-main)] truncate max-w-full px-1">
                {t.quickActions.roomService}
              </span>
            </motion.button>

            {/* Wi-Fi */}
            <motion.button
              whileHover={{ y: -3, scale: 1.03 }}
              whileTap={{ scale: 0.91 }}
              transition={{ type: 'spring', stiffness: 450, damping: 18 }}
              onClick={() => setIsWifiOpen(true)}
              className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm hover:border-[#A78BFA]/50 transition-colors group"
            >
              <div className="w-10 h-10 rounded-xl bg-[var(--bg-subcard)] text-[#A78BFA] flex items-center justify-center mb-1.5 border border-[var(--border-color)] group-hover:scale-105 transition-transform">
                <IOSIcon name="Wifi" size={19} />
              </div>
              <span className="text-[11px] font-semibold text-[var(--text-muted)] truncate max-w-full px-1">
                {t.quickActions.wifi}
              </span>
            </motion.button>

            {/* WhatsApp */}
            <motion.a
              whileHover={{ y: -3, scale: 1.03 }}
              whileTap={{ scale: 0.91 }}
              transition={{ type: 'spring', stiffness: 450, damping: 18 }}
              href={`https://wa.me/${displayWhatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm hover:border-emerald-500/50 transition-colors group"
            >
              <div className="w-10 h-10 rounded-xl bg-[var(--bg-subcard)] text-emerald-400 flex items-center justify-center mb-1.5 border border-[var(--border-color)] group-hover:scale-105 transition-transform">
                <IOSIcon name="Whatsapp" size={19} />
              </div>
              <span className="text-[11px] font-semibold text-[var(--text-muted)] truncate max-w-full px-1">
                {t.quickActions.whatsapp}
              </span>
            </motion.a>

            {/* Zəng Et - Pure iOS Phone Call Icon */}
            <motion.a
              whileHover={{ y: -3, scale: 1.03 }}
              whileTap={{ scale: 0.91 }}
              transition={{ type: 'spring', stiffness: 450, damping: 18 }}
              href={`tel:${displayPhone}`}
              className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm hover:border-[#A78BFA]/50 transition-colors group"
            >
              <div className="w-10 h-10 rounded-xl bg-[var(--bg-subcard)] text-[#A78BFA] flex items-center justify-center mb-1.5 border border-[var(--border-color)] group-hover:scale-105 transition-transform">
                <IOSIcon name="Phone" size={18} />
              </div>
              <span className="text-[11px] font-semibold text-[var(--text-muted)] truncate max-w-full px-1">
                {t.quickActions.call}
              </span>
            </motion.a>
          </motion.div>

          {/* Fluid Sliding Tabs: Services vs Activities */}
          <motion.div variants={itemVariants} className="relative bg-[var(--bg-card)] p-1 rounded-2xl flex gap-1 mb-6 border border-[var(--border-color)] shadow-sm">
            <button
              onClick={() => setActiveTab('services')}
              className={`relative z-10 flex-1 py-2.5 px-3 text-xs font-bold rounded-xl transition-colors duration-150 flex items-center justify-center gap-1.5 ${
                activeTab === 'services' ? 'text-black' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
            >
              {activeTab === 'services' && (
                <motion.span
                  layoutId="activeTabCapsule"
                  transition={{ type: 'spring', stiffness: 420, damping: 30 }}
                  className="absolute inset-0 bg-[#A78BFA] rounded-xl shadow-sm"
                  style={{ zIndex: -1 }}
                />
              )}
              <IOSIcon name="Sparkles" size={15} />
              <span>{t.tabs.services}</span>
            </button>

            <button
              onClick={() => setActiveTab('activities')}
              className={`relative z-10 flex-1 py-2.5 px-3 text-xs font-bold rounded-xl transition-colors duration-150 flex items-center justify-center gap-1.5 ${
                activeTab === 'activities' ? 'text-black' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
            >
              {activeTab === 'activities' && (
                <motion.span
                  layoutId="activeTabCapsule"
                  transition={{ type: 'spring', stiffness: 420, damping: 30 }}
                  className="absolute inset-0 bg-[#A78BFA] rounded-xl shadow-sm"
                  style={{ zIndex: -1 }}
                />
              )}
              <IOSIcon name="Calendar" size={15} />
              <span>{t.tabs.activities}</span>
            </button>
          </motion.div>

          {/* Tab Content: Categories & Menu vs Activities */}
          <AnimatePresence mode="wait">
            {activeTab === 'services' ? (
              <motion.div
                key="tab-services"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
                className="space-y-6"
              >
                {displayCategories.map((category, catIdx) => (
                  <motion.div
                    key={category.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.22, delay: catIdx * 0.04 }}
                  >
                    <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] px-1 mb-2.5">
                      {category.title}
                    </h2>

                    <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] divide-y divide-[var(--border-color)] overflow-hidden shadow-sm">
                      {category.items.map((item) => (
                        <motion.div
                          key={item.id}
                          whileHover={{ x: 4, backgroundColor: 'rgba(167, 139, 250, 0.06)' }}
                          whileTap={{ scale: 0.98, backgroundColor: 'rgba(167, 139, 250, 0.12)' }}
                          transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                          onClick={() => handleLinkClick(item)}
                          className="p-3.5 flex items-center justify-between cursor-pointer transition-colors group"
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className="w-10 h-10 rounded-xl bg-[var(--bg-subcard)] text-[#A78BFA] flex items-center justify-center flex-shrink-0 border border-[var(--border-color)] group-hover:scale-105 group-hover:border-[#A78BFA]/50 transition-all">
                              <IOSIcon name={item.iconName} size={19} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-[var(--text-main)] tracking-tight truncate group-hover:text-[#A78BFA] transition-colors">
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

                          <div className="text-[var(--text-muted)]/50 flex-shrink-0 ml-2 group-hover:text-[#A78BFA] group-hover:translate-x-1 transition-all">
                            <IOSIcon name="ChevronRight" size={15} />
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="tab-activities"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
                className="space-y-3"
              >
                <div className="flex items-center justify-between px-1 mb-2">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                    {t.todaySchedule}
                  </h2>
                  <span className="text-[11px] text-[#A78BFA] font-bold">{t.allResort}</span>
                </div>

                {displayActivities.map((act, actIdx) => (
                  <motion.div
                    key={act.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.22, delay: actIdx * 0.04 }}
                    whileHover={{ scale: 1.015, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] flex items-start justify-between shadow-sm hover:border-[#A78BFA]/40 transition-colors"
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
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Wi-Fi Quick Card & Save Contact (.vcf vCard) with Tactile Press Feedback */}
          <motion.div variants={itemVariants} className="mt-6 space-y-2.5">
            <motion.div 
              whileHover={{ scale: 1.015, y: -1 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 450, damping: 20 }}
              onClick={() => setIsWifiOpen(true)}
              className="p-3.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] flex items-center justify-between cursor-pointer shadow-sm hover:border-[#A78BFA]/50 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#A78BFA]/20 text-[#A78BFA] flex items-center justify-center group-hover:scale-105 transition-transform">
                  <IOSIcon name="Wifi" size={19} />
                </div>
                <div>
                  <span className="text-xs font-bold text-[var(--text-main)] block">{t.wifiBanner.title}</span>
                  <span className="text-[11px] text-[var(--text-muted)] block">
                    {hotel.wifi.ssid} • {t.wifiBanner.action}
                  </span>
                </div>
              </div>
              <motion.button 
                whileTap={{ scale: 0.88 }}
                className="text-xs font-bold text-black bg-[#A78BFA] px-3.5 py-1.5 rounded-xl shadow-md shadow-[#A78BFA]/20"
              >
                {t.wifiBanner.connectBtn}
              </motion.button>
            </motion.div>

            {/* vCard: Otelin Nömrəsini və Ünvanını Telefona Yaz (.vcf) */}
            <motion.a
              whileHover={{ scale: 1.015, y: -1 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 450, damping: 20 }}
              href={publicService.getVCardUrl(hotelSlug)}
              className="p-3.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] flex items-center justify-between cursor-pointer shadow-sm hover:border-[#A78BFA]/50 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <IOSIcon name="Phone" size={18} />
                </div>
                <div>
                  <span className="text-xs font-bold text-[var(--text-main)] block">
                    {selectedLang === 'az'
                      ? '📇 Kontaktı Yadda Saxla (.vcf)'
                      : selectedLang === 'ru'
                      ? '📇 Сохранить Контакт Отеля (.vcf)'
                      : '📇 Save Hotel Contact (.vcf)'}
                  </span>
                  <span className="text-[11px] text-[var(--text-muted)] block">
                    {selectedLang === 'az'
                      ? 'Otelin nömrə və ünvanını bir kliklə telefona yazın'
                      : selectedLang === 'ru'
                      ? 'Добавьте номер и адрес отеля в телефонную книгу'
                      : 'Add hotel phone & address to your contacts'}
                  </span>
                </div>
              </div>
              <div className="text-[var(--text-muted)]/60 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all">
                <IOSIcon name="ChevronRight" size={16} />
              </div>
            </motion.a>
          </motion.div>

          {/* Hotel External Booking & Review Platforms with Official High-Res Tiles */}
          <motion.div variants={itemVariants} className="mt-6 space-y-2.5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] px-1">
              {selectedLang === 'az' ? 'Onlayn Rezervasiya & Rəylər' : selectedLang === 'ru' ? 'Онлайн Бронирование и Отзывы' : 'Online Booking & Reviews'}
            </h2>

            <div className="rounded-[24px] bg-[var(--bg-card)] border border-[var(--border-color)] divide-y divide-[var(--border-color)] overflow-hidden shadow-sm">
              {/* Booking.com */}
              <motion.a
                whileHover={{ x: 3, backgroundColor: 'rgba(0, 53, 128, 0.08)' }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                href={bookingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3.5 flex items-center justify-between transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#003580] text-white flex items-center justify-center shadow-md shadow-[#003580]/20 flex-shrink-0 group-hover:scale-110 transition-transform">
                    <IOSIcon name="Booking" size={22} />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[var(--text-main)] block group-hover:text-[#5b95ea] transition-colors">Booking.com</span>
                    <span className="text-[11px] text-[var(--text-muted)] block">
                      {selectedLang === 'az' ? 'Otaq rezervasiyası və xüsusi təkliflər' : selectedLang === 'ru' ? 'Бронирование номеров и спецпредложения' : 'Room reservation & special deals'}
                    </span>
                  </div>
                </div>
                <div className="text-[var(--text-muted)]/50 group-hover:text-[#5b95ea] group-hover:translate-x-1 transition-all">
                  <IOSIcon name="ChevronRight" size={16} />
                </div>
              </motion.a>

              {/* TripAdvisor */}
              <motion.a
                whileHover={{ x: 3, backgroundColor: 'rgba(0, 175, 135, 0.08)' }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                href={tripAdvisorUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3.5 flex items-center justify-between transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#00AF87] text-white flex items-center justify-center shadow-md shadow-[#00AF87]/20 flex-shrink-0 group-hover:scale-110 transition-transform">
                    <IOSIcon name="TripAdvisor" size={22} />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[var(--text-main)] block group-hover:text-[#00AF87] transition-colors">TripAdvisor</span>
                    <span className="text-[11px] text-[var(--text-muted)] block">
                      {selectedLang === 'az' ? 'Qonaq rəyləri və səyahətçi tövsiyələri' : selectedLang === 'ru' ? 'Отзывы гостей и рекомендации' : 'Guest reviews and traveler ratings'}
                    </span>
                  </div>
                </div>
                <div className="text-[var(--text-muted)]/50 group-hover:text-[#00AF87] group-hover:translate-x-1 transition-all">
                  <IOSIcon name="ChevronRight" size={16} />
                </div>
              </motion.a>

              {/* Google Reviews & Maps */}
              <motion.a
                whileHover={{ x: 3, backgroundColor: 'rgba(234, 67, 53, 0.08)' }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                href={googleReviewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3.5 flex items-center justify-between transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#EA4335] text-white flex items-center justify-center shadow-md shadow-[#EA4335]/20 flex-shrink-0 group-hover:scale-110 transition-transform">
                    <IOSIcon name="GoogleMaps" size={22} />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[var(--text-main)] block group-hover:text-[#EA4335] transition-colors">Google Maps & Rəylər</span>
                    <span className="text-[11px] text-[var(--text-muted)] block">
                      {selectedLang === 'az' ? 'Dəqiq xəritə naviqasiyası və rəy yaz' : selectedLang === 'ru' ? 'Навигация по карте и отзывы' : 'Map directions & rate us on Google'}
                    </span>
                  </div>
                </div>
                <div className="text-[var(--text-muted)]/50 group-hover:text-[#EA4335] group-hover:translate-x-1 transition-all">
                  <IOSIcon name="ChevronRight" size={16} />
                </div>
              </motion.a>

              {/* Airbnb */}
              <motion.a
                whileHover={{ x: 3, backgroundColor: 'rgba(255, 56, 92, 0.08)' }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                href={airbnbUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3.5 flex items-center justify-between transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#FF385C] text-white flex items-center justify-center shadow-md shadow-[#FF385C]/20 flex-shrink-0 group-hover:scale-110 transition-transform">
                    <IOSIcon name="Airbnb" size={22} />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[var(--text-main)] block group-hover:text-[#FF385C] transition-colors">Airbnb</span>
                    <span className="text-[11px] text-[var(--text-muted)] block">
                      {selectedLang === 'az' ? 'Xüsusi suitlər və qonaqlama seçimləri' : selectedLang === 'ru' ? 'Специальные люксы и апартаменты' : 'Special suites & luxury stays'}
                    </span>
                  </div>
                </div>
                <div className="text-[var(--text-muted)]/50 group-hover:text-[#FF385C] group-hover:translate-x-1 transition-all">
                  <IOSIcon name="ChevronRight" size={16} />
                </div>
              </motion.a>
            </div>
          </motion.div>

          {/* Social Media Channels with 3D Spring Lift Feedback */}
          <motion.div variants={itemVariants} className="mt-6 space-y-2.5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] px-1">
              {selectedLang === 'az' ? 'Sosial Şəbəkələrdə Biz' : selectedLang === 'ru' ? 'Мы в Социальных Сетях' : 'Follow Us on Social Media'}
            </h2>

            <div className="grid grid-cols-5 gap-2">
              {/* Instagram */}
              <motion.a
                whileHover={{ y: -5, scale: 1.08 }}
                whileTap={{ scale: 0.88 }}
                transition={{ type: 'spring', stiffness: 450, damping: 14 }}
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] flex flex-col items-center justify-center gap-1.5 shadow-sm hover:border-pink-500/50 transition-colors group"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white flex items-center justify-center shadow-md shadow-pink-500/25 group-hover:shadow-pink-500/40 transition-shadow">
                  <IOSIcon name="Instagram" size={20} />
                </div>
                <span className="text-[10px] font-semibold text-[var(--text-main)] truncate max-w-full">Instagram</span>
              </motion.a>

              {/* TikTok */}
              <motion.a
                whileHover={{ y: -5, scale: 1.08 }}
                whileTap={{ scale: 0.88 }}
                transition={{ type: 'spring', stiffness: 450, damping: 14 }}
                href={tiktokUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] flex flex-col items-center justify-center gap-1.5 shadow-sm hover:border-neutral-500/50 transition-colors group"
              >
                <div className="w-10 h-10 rounded-xl bg-black border border-neutral-700 text-white flex items-center justify-center shadow-md shadow-black/40 group-hover:shadow-black/70 transition-shadow">
                  <IOSIcon name="TikTok" size={19} />
                </div>
                <span className="text-[10px] font-semibold text-[var(--text-main)] truncate max-w-full">TikTok</span>
              </motion.a>

              {/* Facebook */}
              <motion.a
                whileHover={{ y: -5, scale: 1.08 }}
                whileTap={{ scale: 0.88 }}
                transition={{ type: 'spring', stiffness: 450, damping: 14 }}
                href={facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] flex flex-col items-center justify-center gap-1.5 shadow-sm hover:border-blue-500/50 transition-colors group"
              >
                <div className="w-10 h-10 rounded-xl bg-[#1877F2] text-white flex items-center justify-center shadow-md shadow-[#1877F2]/25 group-hover:shadow-[#1877F2]/40 transition-shadow">
                  <IOSIcon name="Facebook" size={20} />
                </div>
                <span className="text-[10px] font-semibold text-[var(--text-main)] truncate max-w-full">Facebook</span>
              </motion.a>

              {/* YouTube */}
              <motion.a
                whileHover={{ y: -5, scale: 1.08 }}
                whileTap={{ scale: 0.88 }}
                transition={{ type: 'spring', stiffness: 450, damping: 14 }}
                href={youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] flex flex-col items-center justify-center gap-1.5 shadow-sm hover:border-red-500/50 transition-colors group"
              >
                <div className="w-10 h-10 rounded-xl bg-[#FF0000] text-white flex items-center justify-center shadow-md shadow-red-500/25 group-hover:shadow-red-500/40 transition-shadow">
                  <IOSIcon name="YouTube" size={20} />
                </div>
                <span className="text-[10px] font-semibold text-[var(--text-main)] truncate max-w-full">YouTube</span>
              </motion.a>

              {/* Telegram */}
              <motion.a
                whileHover={{ y: -5, scale: 1.08 }}
                whileTap={{ scale: 0.88 }}
                transition={{ type: 'spring', stiffness: 450, damping: 14 }}
                href={telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] flex flex-col items-center justify-center gap-1.5 shadow-sm hover:border-sky-500/50 transition-colors group"
              >
                <div className="w-10 h-10 rounded-xl bg-[#229ED9] text-white flex items-center justify-center shadow-md shadow-sky-500/25 group-hover:shadow-sky-500/40 transition-shadow">
                  <IOSIcon name="Telegram" size={20} />
                </div>
                <span className="text-[10px] font-semibold text-[var(--text-main)] truncate max-w-full">Telegram</span>
              </motion.a>
            </div>
          </motion.div>

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

        {/* QR Bölüş Modal (Share QR for Other Room Guests) */}
        <AnimatePresence>
          {isQrShareOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 bg-black/75 backdrop-blur-md"
                onClick={() => setIsQrShareOpen(false)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.88, y: 24 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 16 }}
                transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                className="relative w-full max-w-sm rounded-[32px] bg-[var(--bg-card)] border border-[var(--border-color)] p-6 shadow-2xl z-10 text-center text-[var(--text-main)] space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-[var(--text-main)]">{displayHotelName} — QR Kod</h3>
                  <button
                    onClick={() => setIsQrShareOpen(false)}
                    className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-[var(--text-muted)]"
                  >
                    <IOSIcon name="Close" size={16} />
                  </button>
                </div>

                <p className="text-xs text-[var(--text-muted)]">
                  {selectedLang === 'az'
                    ? 'Otaqdakı digər qonaqlar bu QR kodu öz telefon kamerası ilə oxudaraq menyunu aça bilərlər.'
                    : selectedLang === 'ru'
                    ? 'Другие гости могут отсканировать этот QR-код камерой телефона.'
                    : 'Other guests in your room can scan this QR code to open the digital concierge.'}
                </p>

                <div className="bg-white p-5 rounded-[28px] inline-block shadow-xl border-2 border-[var(--border-color)]">
                  {guestQrSvg ? (
                    <div
                      className="w-56 h-56 flex items-center justify-center mx-auto [&>svg]:w-full [&>svg]:h-full"
                      dangerouslySetInnerHTML={{ __html: guestQrSvg }}
                    />
                  ) : (
                    <img
                      src={publicService.getQrSvgUrl(hotelSlug)}
                      alt="Hotel QR Code"
                      className="w-56 h-56 object-contain mx-auto"
                    />
                  )}
                </div>

                <div className="flex gap-2 pt-1">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({ title: displayHotelName, url: window.location.href });
                      } else {
                        navigator.clipboard.writeText(window.location.href);
                      }
                    }}
                    className="flex-1 py-3 rounded-2xl bg-[#A78BFA] text-black text-xs font-bold shadow-md shadow-[#A78BFA]/20 flex items-center justify-center gap-1.5"
                  >
                    <IOSIcon name="Share" size={14} />
                    <span>{selectedLang === 'az' ? 'Paylaş' : selectedLang === 'ru' ? 'Поделиться' : 'Share'}</span>
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsQrShareOpen(false)}
                    className="px-5 py-3 rounded-2xl bg-[var(--bg-subcard)] border border-[var(--border-color)] text-xs font-semibold"
                  >
                    {t.serviceModal.closeBtn}
                  </motion.button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Service Quick Detail Modal with iOS Spring Pop-up */}
        <AnimatePresence>
          {selectedService && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 bg-black/75 backdrop-blur-md"
                onClick={() => setSelectedService(null)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.88, y: 24 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 16 }}
                transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                className="relative w-full max-w-sm rounded-[32px] bg-[var(--bg-card)] border border-[var(--border-color)] p-6 shadow-2xl z-10 text-center text-[var(--text-main)] overflow-hidden"
              >
                <motion.div
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', damping: 18, stiffness: 300, delay: 0.05 }}
                  className="mx-auto mb-3 w-14 h-14 rounded-2xl bg-[#A78BFA]/20 text-[#A78BFA] flex items-center justify-center shadow-lg shadow-[#A78BFA]/10"
                >
                  <IOSIcon name={selectedService.iconName} size={26} />
                </motion.div>
                <h3 className="text-lg font-bold text-[var(--text-main)]">{selectedService.title}</h3>
                <p className="text-xs text-[var(--text-muted)] mt-1.5 leading-relaxed">{selectedService.subtitle}</p>
                
                <div className="mt-6 space-y-2.5">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: 'spring', stiffness: 450, damping: 18 }}
                    onClick={() => {
                      setSelectedService(null);
                      setIsInquiryOpen(true);
                    }}
                    className="w-full py-3.5 rounded-2xl bg-[#A78BFA] text-black text-xs font-bold shadow-lg shadow-[#A78BFA]/25"
                  >
                    {t.serviceModal.orderBtn}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedService(null)}
                    className="w-full py-2.5 rounded-2xl bg-[var(--bg-subcard)] text-[var(--text-muted)] hover:text-[var(--text-main)] text-xs font-semibold border border-[var(--border-color)] transition-colors"
                  >
                    {t.serviceModal.closeBtn}
                  </motion.button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </motion.div>
    </div>
  );
};
