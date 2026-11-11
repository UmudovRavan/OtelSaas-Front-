import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { defaultHotelData } from './guestData';
import { IOSIcon } from '../../components/common/IOSIcon';
import { InquirySheet } from './components/InquirySheet';
import { WifiModal } from './components/WifiModal';
import { translations, Language, ServiceItemTranslation } from '../../utils/translations';
import { useLanguage } from '../../context/LanguageContext';
import { useHotelPortal } from '../../hooks/useHotelData';
import { resolveMediaUrl } from '../../utils/media';
import { mapActionUrlToRoute } from '../../utils/routes';
import { tr, SupportedLang } from '../../utils/i18n';
import { publicService } from '../../services/api/publicService';
import { fetchHotelQrSvg } from '../../utils/qrIntegration';

type MainCardSectionId =
  | 'hotel-info'
  | 'food-drink'
  | 'spa-wellness'
  | 'entertainment'
  | 'contact'
  | 'daily-offer'
  | 'reviews';

interface StoryItem {
  id: string;
  title: string;
  subtitle: string;
  badge?: string;
  hasPlayBadge?: boolean;
  image: string;
  bannerImageUrl?: string;
  videoUrl?: string;
  actionUrl?: string;
  ctaLabel: string;
  targetSection?: MainCardSectionId;
}

export const GuestPortalPage: React.FC = () => {
  const { slug } = useParams<{ slug?: string }>();
  const hotelSlug = slug || 'altensor';
  const isDemoHotel = hotelSlug === 'altensor' || hotelSlug === 'skyhill';
  const navigate = useNavigate();

  const { currentLang: selectedLang, setLanguage: setSelectedLang } = useLanguage();
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [isInquiryOpen, setIsInquiryOpen] = useState(false);
  const [isWifiOpen, setIsWifiOpen] = useState(false);
  const [isQrShareOpen, setIsQrShareOpen] = useState(false);
  const [guestQrSvg, setGuestQrSvg] = useState<string>('');
  const [selectedService, setSelectedService] = useState<ServiceItemTranslation | null>(null);
  const [activeSectionModal, setActiveSectionModal] = useState<MainCardSectionId | null>(null);
  const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null);

  // Live Backend Data via React Query
  const { data: portalData, error: portalError } = useHotelPortal(hotelSlug);
  const [isSuspended, setIsSuspended] = useState<boolean>(false);
  const [suspendReason, setSuspendReason] = useState<string>('');

  const hotel = defaultHotelData;
  const t = translations[selectedLang as Language] || translations.az;

  useEffect(() => {
    if (portalError) {
      const status = (portalError as any)?.response?.status;
      if (status === 403) {
        setIsSuspended(true);
        setSuspendReason(
          (portalError as any)?.response?.data?.message || 'Bu otelin SaaS konsyerj xidməti müvəqqəti dondurulub.'
        );
      }
    } else {
      setIsSuspended(false);
    }
  }, [portalError]);

  // Theme Sync with HTML document class
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
    }
  }, [isDarkMode]);

  const displayHotelName = portalData?.name || (isDemoHotel ? t.hotelName : 'Otel');
  const displaySubtitle = tr(portalData?.subtitleTr, portalData?.subtitle || (isDemoHotel ? (selectedLang === 'ru' ? 'Ленкорань' : selectedLang === 'en' ? 'Lankaran' : 'Lənkəran') : ''), selectedLang as SupportedLang);
  const displayTagline = tr(portalData?.taglineTr, portalData?.tagline || (isDemoHotel ? 'Hotel & Resort' : ''), selectedLang as SupportedLang);
  const displayHotelBio = tr(portalData?.bioTr, portalData?.bio || (isDemoHotel ? t.hotelDescription : ''), selectedLang as SupportedLang);
  const displayCoverImage = resolveMediaUrl(portalData?.coverImageUrl, '/media/guest/hero.webp');
  const displayLogo = portalData?.logoUrl ? resolveMediaUrl(portalData.logoUrl, '') : (isDemoHotel ? hotel.logo : '');
  const displayPhone = portalData?.phone || (isDemoHotel ? hotel.phone : '');
  const displayWhatsapp = (portalData?.whatsApp || (isDemoHotel ? hotel.whatsapp : '')).replace(/[^0-9]/g, '');
  const starCount = portalData?.starRating || 5;
  const starString = '★'.repeat(Math.max(1, Math.min(5, starCount)));

  const resolveSmartIconName = (iconKey?: string, title?: string): string => {
    const rawKey = (iconKey || '').trim().toLowerCase();
    const rawTitle = (title || '').trim().toLowerCase();
    if (rawKey === 'menu') {
      if (rawTitle.includes('bar') || rawTitle.includes('drink') || rawTitle.includes('wine') || rawTitle.includes('içki')) {
        return 'Wine';
      }
      if (rawTitle.includes('food') || rawTitle.includes('yemək') || rawTitle.includes('restoran') || rawTitle.includes('dining')) {
        return 'Restaurant';
      }
      return 'Menu';
    }
    if (rawKey) return rawKey;
    if (rawTitle.includes('restoran') || rawTitle.includes('food') || rawTitle.includes('menyu')) return 'Restaurant';
    if (rawTitle.includes('bar') || rawTitle.includes('wine')) return 'Wine';
    if (rawTitle.includes('spa') || rawTitle.includes('wellness') || rawTitle.includes('masaj')) return 'Sparkles';
    if (rawTitle.includes('hovuz') || rawTitle.includes('pool') || rawTitle.includes('beach')) return 'Water';
    if (rawTitle.includes('otaq') || rawTitle.includes('room') || rawTitle.includes('bed')) return 'Bed';
    if (rawTitle.includes('transfer') || rawTitle.includes('taksi') || rawTitle.includes('car')) return 'Car';
    if (rawTitle.includes('mail') || rawTitle.includes('email')) return 'Mail';
    if (rawTitle.includes('phone') || rawTitle.includes('zəng')) return 'Phone';
    if (rawTitle.includes('whatsapp')) return 'Whatsapp';
    if (rawTitle.includes('telegram')) return 'Telegram';
    if (rawTitle.includes('instagram')) return 'Instagram';
    if (rawTitle.includes('facebook')) return 'Facebook';
    if (rawTitle.includes('youtube')) return 'YouTube';
    if (rawTitle.includes('tiktok')) return 'TikTok';
    if (rawTitle.includes('booking')) return 'Booking';
    if (rawTitle.includes('tripadvisor')) return 'TripAdvisor';
    if (rawTitle.includes('google') || rawTitle.includes('map')) return 'GoogleMaps';
    return 'Sparkles';
  };

  const displayCategories =
    portalData?.categories &&
    portalData.categories.length > 0 &&
    portalData.categories.some((c) => c.links && c.links.length > 0)
      ? portalData.categories
          .filter((c) => c.links && c.links.length > 0)
          .map((c) => ({
            id: c.id,
            title: c.title,
            items: c.links.map((l) => ({
              id: l.id,
              title: l.title,
              subtitle: '',
              iconName: resolveSmartIconName(l.iconKey, l.title),
              actionUrl: l.actionUrl ? resolveMediaUrl(l.actionUrl) : '#',
            })),
          }))
      : (isDemoHotel ? t.categories : []);

  const allLinksFlat: ServiceItemTranslation[] = displayCategories.flatMap((c) => c.items);

  const displayActivities =
    portalData?.activities && portalData.activities.length > 0
      ? portalData.activities.map((a) => ({
          id: a.id,
          title: a.title,
          time: a.endTime ? `${a.startTime} - ${a.endTime}` : a.startTime,
          location: a.location || displayHotelName,
          category: a.category || 'Tədbir',
        }))
      : (isDemoHotel ? t.activities : []);

  const handleLinkClick = (item: ServiceItemTranslation) => {
    if (item.actionUrl?.startsWith('http')) {
      window.open(item.actionUrl, '_blank', 'noopener,noreferrer');
      return;
    }
    if (item.actionUrl?.startsWith('#')) {
      if (item.id === 'd2' || item.id === 's1') {
        setActiveSectionModal(null);
        setIsInquiryOpen(true);
        return;
      }
    }
    setSelectedService(item);
  };

  const resolveLinkUrl = (keyword: string, fallback: string) => {
    if (!portalData?.categories) return fallback;
    for (const cat of portalData.categories) {
      const match = cat.links?.find(
        (l) =>
          l.title?.toLowerCase().includes(keyword.toLowerCase()) ||
          l.iconKey?.toLowerCase().includes(keyword.toLowerCase())
      );
      if (match) {
        if (match.actionUrl?.startsWith('http')) return match.actionUrl;
        return resolveMediaUrl(match.actionUrl);
      }
    }
    return fallback;
  };

  const bookingUrl = portalData?.bookingUrl || (isDemoHotel ? resolveLinkUrl('booking', 'https://www.booking.com') : undefined);
  const tripAdvisorUrl = portalData?.tripAdvisorUrl || (isDemoHotel ? resolveLinkUrl('tripadvisor', 'https://www.tripadvisor.com') : undefined);
  const googleReviewUrl = resolveLinkUrl('google', portalData?.mapUrl || (isDemoHotel ? 'https://maps.google.com/?q=Lankaran%2C+Azerbaijan' : ''));
  const instagramUrl = portalData?.instagramUrl || (isDemoHotel ? resolveLinkUrl('instagram', 'https://www.instagram.com/') : undefined);
  const facebookUrl = portalData?.facebookUrl || (isDemoHotel ? resolveLinkUrl('facebook', 'https://www.facebook.com/') : undefined);
  const tiktokUrl = portalData?.tikTokUrl || (isDemoHotel ? resolveLinkUrl('tiktok', 'https://www.tiktok.com/') : undefined);
  const youtubeUrl = portalData?.youtubeUrl || (isDemoHotel ? resolveLinkUrl('youtube', 'https://www.youtube.com/') : undefined);
  const telegramUrl = portalData?.telegram
    ? (portalData.telegram.startsWith('http') ? portalData.telegram : `https://t.me/${portalData.telegram.replace('@', '')}`)
    : (isDemoHotel ? resolveLinkUrl('telegram', 'https://t.me/altensor_bot') : undefined);

  // 6 Dairəvi Story Highlights (Fallback & Default)
  const defaultStories: StoryItem[] = [
    {
      id: 'welcome',
      title:
        selectedLang === 'az'
          ? 'Xoş gəlmisiniz'
          : selectedLang === 'ru'
          ? 'Добро пожаловать'
          : 'Welcome',
      subtitle: displayHotelBio,
      hasPlayBadge: true,
      image: '/media/guest/story-welcome-poster.webp',
      ctaLabel:
        selectedLang === 'az'
          ? 'Otel haqqında məlumat'
          : selectedLang === 'ru'
          ? 'Информация об отеле'
          : 'Hotel Information',
      targetSection: 'hotel-info',
    },
    {
      id: 'daily-menu',
      title:
        selectedLang === 'az'
          ? 'Günün menyusu'
          : selectedLang === 'ru'
          ? 'Меню дня'
          : "Today's menu",
      subtitle:
        selectedLang === 'az'
          ? 'Baş aşpazımızın hazırladığı xüsusi təamlar, ləzzətli steyklər və dəniz məhsulları.'
          : selectedLang === 'ru'
          ? 'Фирменные блюда от шеф-повара, стейки и свежие морепродукты.'
          : "Chef's signature dishes, premium steaks and fresh seafood.",
      image: '/media/guest/chef-special.webp',
      ctaLabel:
        selectedLang === 'az'
          ? 'Menyuya Bax & Sifariş Et'
          : selectedLang === 'ru'
          ? 'Открыть меню'
          : 'View Menu & Order',
      targetSection: 'food-drink',
    },
    {
      id: 'live-music',
      title:
        selectedLang === 'az'
          ? 'Canlı musiqi'
          : selectedLang === 'ru'
          ? 'Живая музыка'
          : 'Live music',
      subtitle:
        selectedLang === 'az'
          ? 'Hər axşam saat 20:30-dan etibarən Panorama Lounge Bar-da canlı musiqi və akustik gecə.'
          : selectedLang === 'ru'
          ? 'Каждый вечер с 20:30 живая музыка и акустическое шоу в лаундж-баре.'
          : 'Every evening from 20:30 live music and acoustic performance at the Lounge Bar.',
      hasPlayBadge: true,
      image: '/media/guest/story-live-music-poster.webp',
      ctaLabel:
        selectedLang === 'az'
          ? 'Gündəlik Proqrama Bax'
          : selectedLang === 'ru'
          ? 'Посмотреть расписание'
          : 'See Entertainment Schedule',
      targetSection: 'entertainment',
    },
    {
      id: 'spa-discount',
      title: selectedLang === 'ru' ? 'Спа −20%' : 'Spa −20%',
      subtitle:
        selectedLang === 'az'
          ? 'Otel qonaqlarımız üçün bütün masaj, Türk hamamı və aromaterapiya proqramlarına 20% endirim!'
          : selectedLang === 'ru'
          ? 'Скидка 20% для гостей отеля на все виды массажа, хаммам и спа-процедуры!'
          : '20% discount for hotel guests on all massage, hammam and aromatherapy treatments!',
      badge: '−20%',
      image: '/media/guest/massage.webp',
      ctaLabel:
        selectedLang === 'az'
          ? 'Spa Rezervasiyası Et'
          : selectedLang === 'ru'
          ? 'Забронировать СПА'
          : 'Book Spa Session',
      targetSection: 'spa-wellness',
    },
    {
      id: 'starry-night',
      title:
        selectedLang === 'az'
          ? 'Ulduzlu gecə'
          : selectedLang === 'ru'
          ? 'Звёздная ночь'
          : 'Starry night',
      subtitle:
        selectedLang === 'az'
          ? 'Açıq terrasda ulduzlar altında xüsusi kokteyl və istirahət saatları.'
          : selectedLang === 'ru'
          ? 'Вечерний отдых и авторские коктейли под открытым звездным небом.'
          : 'Signature cocktails and open-air terrace relaxation under the stars.',
      image: '/media/guest/stars.webp',
      ctaLabel:
        selectedLang === 'az'
          ? 'Tədbirlərə Keçid'
          : selectedLang === 'ru'
          ? 'Подробнее'
          : 'Explore Events',
      targetSection: 'entertainment',
    },
    {
      id: 'breakfast',
      title:
        selectedLang === 'az'
          ? 'Səhər yeməyi'
          : selectedLang === 'ru'
          ? 'Завтрак'
          : 'Breakfast',
      subtitle:
        selectedLang === 'az'
          ? 'Zəngin açıq bufet və ya otağa səhər yeməyi sifarişi: hər gün 07:30 – 11:00.'
          : selectedLang === 'ru'
          ? 'Шведский стол или завтрак в номер: ежедневно с 07:30 до 11:00.'
          : 'Rich open buffet or in-room breakfast delivery: daily 07:30 – 11:00.',
      image: '/media/guest/breakfast.webp',
      ctaLabel:
        selectedLang === 'az'
          ? 'Otağa Sifariş Ver'
          : selectedLang === 'ru'
          ? 'Заказать в номер'
          : 'Order to Room',
      targetSection: 'food-drink',
    },
  ];

  // 6 Əsas Vizual Kart (Fallback & Default)
  const defaultMainCards: Array<{
    id: MainCardSectionId;
    title: string;
    icon: string;
    image: string;
    externalId?: number;
    actionUrl?: string;
  }> = [
    {
      id: 'hotel-info',
      title:
        selectedLang === 'az'
          ? 'Otel məlumatı'
          : selectedLang === 'ru'
          ? 'Информация об отеле'
          : 'Hotel Information',
      icon: 'HotelBuilding',
      image: '/media/guest/tile-hotel.webp',
      externalId: 191,
    },
    {
      id: 'food-drink',
      title:
        selectedLang === 'az'
          ? 'Qida və içki'
          : selectedLang === 'ru'
          ? 'Еда и напитки'
          : 'Food & Beverage',
      icon: 'ClocheBell',
      image: '/media/guest/restaurant-table.webp',
      externalId: 192,
    },
    {
      id: 'spa-wellness',
      title:
        selectedLang === 'az'
          ? 'Spa və sağlamlıq'
          : selectedLang === 'ru'
          ? 'Спа и велнес'
          : 'Spa & Wellness',
      icon: 'SpaFlower',
      image: '/media/guest/pool-indoor.webp',
      externalId: 193,
    },
    {
      id: 'entertainment',
      title:
        selectedLang === 'az'
          ? 'Əyləncə'
          : selectedLang === 'ru'
          ? 'Развлечения'
          : 'Entertainment',
      icon: 'Gamepad',
      image: '/media/guest/tile-entertainment.webp',
      externalId: 194,
    },
    {
      id: 'contact',
      title:
        selectedLang === 'az'
          ? 'Əlaqə'
          : selectedLang === 'ru'
          ? 'Контакты'
          : 'Contacts',
      icon: 'PeopleContact',
      image: '/media/guest/tile-contacts.webp',
      externalId: 195,
    },
    {
      id: 'daily-offer',
      title:
        selectedLang === 'az'
          ? 'Günün təklifi'
          : selectedLang === 'ru'
          ? 'Предложение дня'
          : "Today's Special",
      icon: 'GiftBox',
      image: '/media/guest/chef-special.webp',
      externalId: 196,
    },
  ];

  // Dynamic Stories from backend or fallback
  const stories: StoryItem[] =
    portalData?.stories && portalData.stories.length > 0
      ? portalData.stories.map((s) => ({
          id: s.id,
          title: tr(s.titleTr, s.title, selectedLang as SupportedLang),
          subtitle: tr(s.captionTr, s.description || displayHotelBio, selectedLang as SupportedLang),
          badge: s.badgeText || undefined,
          hasPlayBadge: !!s.videoUrl,
          image: resolveMediaUrl(s.imageUrl || s.bannerImageUrl, '/media/guest/story-welcome-poster.webp'),
          bannerImageUrl: resolveMediaUrl(s.bannerImageUrl, undefined),
          videoUrl: s.videoUrl ? resolveMediaUrl(s.videoUrl, undefined) : undefined,
          actionUrl: s.actionUrl || undefined,
          ctaLabel: tr(
            s.buttonTr,
            s.buttonText || (selectedLang === 'ru' ? 'Подробнее' : selectedLang === 'en' ? 'Learn more' : 'Ətraflı'),
            selectedLang as SupportedLang
          ),
          targetSection: 'hotel-info' as MainCardSectionId,
        }))
      : (isDemoHotel ? defaultStories : []);

  // Dynamic Hubs from backend or fallback
  const mainCards =
    portalData?.hubs && portalData.hubs.length > 0
      ? portalData.hubs.map((hub) => ({
          id: (hub.code || `hub-${hub.externalId}`) as MainCardSectionId,
          externalId: hub.externalId,
          title: tr(hub.titleTr, hub.title, selectedLang as SupportedLang),
          subtitle: tr(hub.subtitleTr, hub.subtitle || '', selectedLang as SupportedLang),
          icon: hub.iconKey || 'HotelBuilding',
          image: resolveMediaUrl(hub.coverImageUrl, '/media/guest/tile-hotel.webp'),
          actionUrl: `/${hotelSlug}/hotel/g/${hub.externalId || hub.code}`,
        }))
      : (isDemoHotel ? defaultMainCards : []);

  // Filter links for specific modals
  const foodAndDrinkLinks = allLinksFlat.filter((l) => {
    const k = `${l.title} ${l.iconName}`.toLowerCase();
    return (
      k.includes('menu') ||
      k.includes('menyu') ||
      k.includes('food') ||
      k.includes('bar') ||
      k.includes('restoran') ||
      k.includes('restaurant') ||
      k.includes('wine') ||
      k.includes('utensils') ||
      k.includes('room service') ||
      k.includes('otağa')
    );
  });

  const spaAndWellnessLinks = allLinksFlat.filter((l) => {
    const k = `${l.title} ${l.iconName}`.toLowerCase();
    return (
      k.includes('spa') ||
      k.includes('wellness') ||
      k.includes('hovuz') ||
      k.includes('pool') ||
      k.includes('water') ||
      k.includes('waves') ||
      k.includes('fitness') ||
      k.includes('dumbbell') ||
      k.includes('masaj')
    );
  });

  const hotelInfoLinks = allLinksFlat.filter((l) => {
    const k = `${l.title} ${l.iconName}`.toLowerCase();
    return (
      k.includes('otaq') ||
      k.includes('room') ||
      k.includes('bed') ||
      k.includes('təmizlik') ||
      k.includes('paltar') ||
      k.includes('shirt') ||
      k.includes('transfer') ||
      k.includes('car')
    );
  });

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

  const activeStory = activeStoryIndex !== null ? stories[activeStoryIndex] : null;

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] font-hotel-sans flex justify-center selection:bg-[#A78BFA] selection:text-black transition-colors duration-200">
      {/* Main Column (max-width: 560px matching .hotel_col__9JDHm) */}
      <div className="w-full max-w-[540px] min-h-screen bg-[var(--bg-main)] flex flex-col relative pb-7 border-x border-[var(--border-color)] overflow-x-hidden shadow-2xl">
        {/* ===================== 1. HERO COVER & CENTERED BRANDING (.hotel_hero__Tc4b3) ===================== */}
        <header className="relative w-full h-[292px] overflow-hidden bg-[#1a1829] flex-none">
          {/* DB Cover Image */}
          <img
            src={displayCoverImage}
            alt={displayHotelName}
            onError={(e) => {
              if (e.currentTarget.src !== '/media/guest/hero.webp') {
                e.currentTarget.src = '/media/guest/hero.webp';
              }
            }}
            className="absolute inset-0 w-full h-full object-cover"
          />

          {/* Exact Shade from .hotel_heroShade__6L_DM */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(90% 60% at 50% 34%, rgba(8,12,22,.42) 0, rgba(8,12,22,0) 70%), linear-gradient(180deg, rgba(8,12,22,.5), rgba(8,12,22,.12) 46%, rgba(8,12,22,.05) 70%, rgba(8,12,22,.28))',
            }}
          />

          {/* Top Bar (.hotel_heroBar__I3MlE) */}
          <div className="absolute top-[12px] left-[12px] right-[12px] z-20 flex items-center justify-between gap-2">
            {/* Language Pill (.LangSwitch_pill__0aLLD) */}
            <div
              role="group"
              aria-label="Dil / Language / Язык"
              className="inline-flex items-center h-[36px] pl-[9px] pr-[6px] rounded-full bg-[#101826]/65 border border-white/25 backdrop-blur-md text-white"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                className="text-[#C4B5FD] flex-none mr-1"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
                <path d="M2 12h20" />
              </svg>

              {(['az', 'en', 'ru'] as const).map((lang, idx) => {
                const isActive = selectedLang === lang;
                return (
                  <span key={lang} className="inline-flex items-center">
                    {idx > 0 && <span className="w-[1px] h-[14px] bg-white/45" aria-hidden="true" />}
                    <button
                      type="button"
                      onClick={() => setSelectedLang(lang)}
                      className={`w-[30px] h-[26px] mx-[3px] rounded-full text-[11.5px] font-semibold tracking-[0.06em] uppercase inline-flex items-center justify-center transition-colors ${
                        isActive
                          ? 'border border-white/85 text-white'
                          : 'border border-transparent text-white/85 hover:text-white'
                      }`}
                    >
                      {lang}
                    </button>
                  </span>
                );
              })}
            </div>

            {/* Right Utility Pills: Theme & QR */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setIsDarkMode(!isDarkMode)}
                title={isDarkMode ? 'Light Mode' : 'Dark Mode'}
                className="w-[36px] h-[36px] rounded-full bg-[#101826]/65 border border-white/25 backdrop-blur-md flex items-center justify-center text-[#C4B5FD]"
              >
                {isDarkMode ? <IOSIcon name="Sun" size={16} /> : <IOSIcon name="Moon" size={15} />}
              </button>

              <button
                type="button"
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
                title="QR Kodu Göstər"
                className="h-[36px] px-3 rounded-full bg-[#101826]/65 border border-white/25 backdrop-blur-md flex items-center gap-1.5 text-white text-[11.5px] font-semibold"
              >
                <IOSIcon name="Share" size={13} />
                <span>QR</span>
              </button>
            </div>
          </div>

          {/* Centered Brand Block (.hotel_brand__XK59L) */}
          <div className="absolute top-[56px] left-[16px] right-[16px] z-10 flex flex-col items-center text-center text-white pointer-events-none">
            {/* DB Logo + Roof Line Emblem */}
            <div className="flex flex-col items-center mb-1">
              {displayLogo ? (
                <img
                  src={displayLogo}
                  alt={displayHotelName}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                  className="w-12 h-12 rounded-xl object-cover border border-white/25 shadow-lg mb-1"
                />
              ) : null}
              <svg
                width="96"
                height="22"
                viewBox="0 0 96 22"
                fill="none"
                className="text-[#C4B5FD] drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)]"
              >
                <path
                  d="M4 19L32 4L49 14M39 17L60 5L92 19"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            {/* Hotel Name (.hotel_brandName__dOzof) */}
            <h1
              className="font-hotel-serif font-semibold text-[32px] sm:text-[34px] leading-[1.02] tracking-[0.12em] pl-[0.12em] uppercase text-white"
              style={{ textShadow: '0 2px 14px rgba(0,0,0,.5)' }}
            >
              {displayHotelName}
            </h1>

            {/* Subtitle (.hotel_brandSubtitle__gRHAE) */}
            {displaySubtitle ? (
              <p
                className="mt-[5px] pl-[0.3em] text-[13px] font-semibold leading-[1.2] tracking-[0.3em] uppercase text-[#C4B5FD]"
                style={{ textShadow: '0 1px 2px rgba(0,0,0,.45), 0 1px 10px rgba(0,0,0,.55)' }}
              >
                {displaySubtitle}
              </p>
            ) : null}

            {/* Tagline (.hotel_brandTagline__URmP0) */}
            {displayTagline ? (
              <p
                className="mt-[4px] pl-[0.28em] text-[11px] font-semibold leading-[1.3] tracking-[0.28em] uppercase text-white/95"
                style={{ textShadow: '0 1px 2px rgba(0,0,0,.45), 0 1px 8px rgba(0,0,0,.55)' }}
              >
                {displayTagline}
              </p>
            ) : null}

            {/* Stars (.hotel_brandStars__kOBVm) */}
            <p
              className="mt-[6px] pl-[0.32em] text-[13px] tracking-[0.32em] text-white"
              style={{ textShadow: '0 1px 6px rgba(0,0,0,.45)' }}
              aria-label={`${starCount} ulduz`}
            >
              {starString}
            </p>
          </div>
        </header>

        {/* ===================== 2. ROUNDED SHEET (.hotel_sheet__qaTN9) ===================== */}
        <div className="relative z-10 -mt-[20px] pt-[12px] px-[12px] bg-[var(--bg-main)] rounded-t-[20px] flex flex-col gap-[9px]">
          {/* ---- 2A. STORY BUBBLES (ONLY IF STORIES EXIST) ---- */}
          {stories.length > 0 && (
            <div
              role="list"
              aria-label="Günün xəbərləri"
              className="grid grid-cols-6 gap-[6px] sm:gap-[10px] py-[2px] w-full overflow-hidden"
            >
              {stories.map((story, idx) => (
                <button
                  key={story.id}
                  type="button"
                  role="listitem"
                  onClick={() => setActiveStoryIndex(idx)}
                  className="flex flex-col items-center gap-[5px] text-[var(--text-main)] focus:outline-none group active:scale-95 transition-transform"
                >
                  <span
                    className="relative w-[62px] h-[62px] sm:w-[68px] sm:h-[68px] p-[2.5px] rounded-full flex transition-transform"
                    style={{
                      background:
                        'conic-gradient(from 210deg, #ede9fe, #A78BFA, #6d28d9, #A78BFA, #ede9fe)',
                    }}
                  >
                    <img
                      src={story.image}
                      alt={story.title}
                      className="w-full h-full rounded-full object-cover border-[2.5px] border-[var(--bg-main)] bg-[var(--bg-card)]"
                    />
                    {story.hasPlayBadge && (
                      <span
                        aria-hidden="true"
                        className="absolute -right-[1px] -bottom-[1px] w-[22px] h-[22px] rounded-full flex items-center justify-center pl-[1.5px] text-white border-2 border-[var(--bg-main)] shadow-md"
                        style={{
                          background: 'linear-gradient(160deg, #A78BFA, #6d28d9)',
                        }}
                      >
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M7 4.5v15a1 1 0 0 0 1.5.86l12.5-7.5a1 1 0 0 0 0-1.72L8.5 3.64A1 1 0 0 0 7 4.5z" />
                        </svg>
                      </span>
                    )}
                  </span>
                  <span className="max-w-full text-[11px] sm:text-[11.5px] font-medium leading-[1.22] text-center text-[var(--text-main)] line-clamp-2 break-words">
                    {story.title}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* ---- 2B. 2x3 VISUAL CATEGORY TILES (.hotel_tiles__lLfGa) ---- */}
          {mainCards.length > 0 ? (
            <nav aria-label="Bölmələr" className="grid grid-cols-2 gap-[9px]">
              {mainCards.map((card) => (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => {
                    if (card.actionUrl) {
                      navigate(card.actionUrl);
                      return;
                    }
                    const cid = String(card.id);
                    if (card.externalId === 191 || cid === 'hotel-info' || cid === 'info') {
                      navigate(`/${hotelSlug}/hotel/g/191`);
                      return;
                    }
                    if (card.externalId === 192 || cid === 'food-drink' || cid === 'food') {
                      navigate(`/${hotelSlug}/hotel/g/192`);
                      return;
                    }
                    if (card.externalId === 193 || cid === 'spa-wellness' || cid === 'spa') {
                      navigate(`/${hotelSlug}/hotel/g/193`);
                      return;
                    }
                    if (card.externalId === 194 || cid === 'entertainment') {
                      navigate(`/${hotelSlug}/hotel/g/194`);
                      return;
                    }
                    if (card.externalId === 195 || cid === 'contact' || cid === 'contacts') {
                      navigate(`/${hotelSlug}/hotel/g/195`);
                      return;
                    }
                    if (card.externalId === 196 || cid === 'daily-offer' || cid === 'specials' || cid === 'offers') {
                      navigate(`/${hotelSlug}/hotel/g/196`);
                      return;
                    }
                    setActiveSectionModal(card.id as MainCardSectionId);
                  }}
                  className="relative aspect-[4/3.05] sm:aspect-[16/9.5] rounded-[13px] overflow-hidden text-white bg-[#211E30] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.07),0_6px_16px_rgba(0,0,0,0.22)] active:scale-[0.98] transition-transform group focus:outline-none"
                >
                  <img
                    src={card.image}
                    alt={card.title}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Exact Overlay from .hotel_tile__VzlHJ:has(img):after */}
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background: 'linear-gradient(180deg, rgba(14,11,9,.42), rgba(14,11,9,.62))',
                    }}
                  />

                  {/* Tile Body (.hotel_tileBody___vEgz) */}
                  <span className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-[4px] pt-[10px] px-[8px] pb-[8px] text-center">
                    {/* Exact 48x48 Thin-Stroke Icon (.hotel_tileIcon__q0Btl) */}
                    <span
                      className="text-[#DDD6FE] flex mb-[3px]"
                      style={{ filter: 'drop-shadow(0 1px 4px rgba(0,0,0,.35))' }}
                    >
                      <IOSIcon name={card.icon} size={48} />
                    </span>

                    {/* Exact Cormorant Garamond Title (.hotel_tileTitle__wKOiz) */}
                    <span
                      className="font-hotel-serif font-bold text-[17px] leading-[1.1] tracking-[0.035em] uppercase text-white max-w-full"
                      style={{ textShadow: '0 1px 8px rgba(0,0,0,.45)', textWrap: 'balance' }}
                    >
                      {card.title}
                    </span>

                    {/* Exact Chevron (.hotel_tileChevron__JfUrC) */}
                    <span className="flex text-white/90">
                      <IOSIcon name="TileChevron" size={16} />
                    </span>
                  </span>
                </button>
              ))}
            </nav>
          ) : (
            <div className="py-12 px-6 flex flex-col items-center justify-center text-center bg-[#211E30]/60 backdrop-blur-sm rounded-[16px] border border-white/10 my-2">
              <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-3 text-[#A78BFA]">
                <IOSIcon name="HotelBuilding" size={28} />
              </div>
              <h3 className="font-hotel-serif text-[18px] font-semibold text-white tracking-wide uppercase mb-1">
                {selectedLang === 'az'
                  ? 'Bölmələr əlavə edilməyib'
                  : selectedLang === 'ru'
                  ? 'Разделы не добавлены'
                  : 'No sections added'}
              </h3>
              <p className="text-[12.5px] text-[var(--text-muted)] max-w-[280px] leading-relaxed">
                {selectedLang === 'az'
                  ? 'Bu otel üçün hələlik heç bir xidmət və ya menyu bölməsi aktiv edilməyib.'
                  : selectedLang === 'ru'
                  ? 'Для этого отеля пока не активированы услуги или разделы меню.'
                  : 'No service or menu hubs have been activated for this hotel yet.'}
              </p>
            </div>
          )}

          {/* ---- 2C. FULL-WIDTH FEEDBACK BANNER (.hotel_feedback__phy0z .hotel_feedbackPhoto__mhsdy) ---- */}
          <button
            type="button"
            onClick={() => navigate(slug ? `/hotel/${slug}/review` : '/review')}
            className="relative min-h-[108px] rounded-[14px] overflow-hidden text-white bg-[#211E30] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.07),0_6px_16px_rgba(0,0,0,0.22)] flex active:scale-[0.98] transition-transform group focus:outline-none"
          >
            <img
              src="/media/guest/review-banner.webp"
              alt="Rəy bildirin"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  'linear-gradient(180deg, rgba(18,16,28,.38), rgba(18,16,28,.55) 50%, rgba(18,16,28,.78))',
              }}
            />

            <span className="relative z-10 flex-1 flex flex-col items-center justify-center gap-[6px] py-[12px] px-[14px]">
              <span className="flex text-[#DDD6FE]">
                <IOSIcon name="ReviewBubble" size={38} />
              </span>
              <span
                className="inline-flex items-center gap-[8px] font-hotel-serif font-semibold text-[15.5px] tracking-[0.1em] uppercase text-white"
                style={{ textShadow: '0 1px 8px rgba(0,0,0,.4)' }}
              >
                <span>
                  {selectedLang === 'az'
                    ? 'Rəy bildirin'
                    : selectedLang === 'ru'
                    ? 'Оставить отзыв'
                    : 'Leave your feedback'}
                </span>
                <IOSIcon name="TileChevron" size={16} />
              </span>
            </span>
          </button>

          {/* ---- 2D. BOTTOM SOCIAL ICONS (ONLY RENDER CONFIGURED ONES) ---- */}
          {(instagramUrl || tripAdvisorUrl || facebookUrl || youtubeUrl || tiktokUrl) && (
            <nav aria-label="Sosial şəbəkələr" className="mt-[8px] py-[4px] flex justify-around">
              {/* 1. Instagram */}
              {instagramUrl && (
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 min-w-0 flex flex-col items-center gap-[7px] group"
                >
                  <svg
                    width="44"
                    height="44"
                    viewBox="0 0 44 44"
                    aria-hidden="true"
                    className="w-[42px] h-[42px] rounded-[11px] shadow-[0_4px_10px_rgba(0,0,0,0.2)] group-hover:scale-105 transition-transform"
                  >
                    <defs>
                      <radialGradient id="hb-ig" cx="0.3" cy="1.05" r="1.25">
                        <stop offset="0" stopColor="#FFD86E" />
                        <stop offset="0.28" stopColor="#FA7E1E" />
                        <stop offset="0.55" stopColor="#D62976" />
                        <stop offset="0.8" stopColor="#962FBF" />
                        <stop offset="1" stopColor="#4F5BD5" />
                      </radialGradient>
                    </defs>
                    <rect width="44" height="44" rx="11" fill="url(#hb-ig)" />
                    <rect x="11" y="11" width="22" height="22" rx="6.5" fill="none" stroke="#fff" strokeWidth="2.6" />
                    <circle cx="22" cy="22" r="5.4" fill="none" stroke="#fff" strokeWidth="2.6" />
                    <circle cx="28.4" cy="15.6" r="1.6" fill="#fff" />
                  </svg>
                  <span className="text-[8.5px] font-semibold tracking-[0.14em] uppercase text-[var(--text-muted)] whitespace-nowrap">
                    Instagram
                  </span>
                </a>
              )}

              {/* 2. TripAdvisor */}
              {tripAdvisorUrl && (
                <a
                  href={tripAdvisorUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 min-w-0 flex flex-col items-center gap-[7px] group"
                >
                  <svg
                    width="44"
                    height="44"
                    viewBox="0 0 44 44"
                    aria-hidden="true"
                    className="w-[42px] h-[42px] rounded-[11px] shadow-[0_4px_10px_rgba(0,0,0,0.2)] group-hover:scale-105 transition-transform"
                  >
                    <rect width="44" height="44" rx="11" fill="#34E0A1" />
                    <path
                      d="M8.5 17.5c3.6-3 8.2-4.3 13.5-4.3s9.9 1.3 13.5 4.3"
                      fill="none"
                      stroke="#000"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                    />
                    <circle cx="15.2" cy="24" r="6" fill="#fff" stroke="#000" strokeWidth="2.2" />
                    <circle cx="28.8" cy="24" r="6" fill="#fff" stroke="#000" strokeWidth="2.2" />
                    <circle cx="15.2" cy="24" r="2.3" fill="#000" />
                    <circle cx="28.8" cy="24" r="2.3" fill="#000" />
                    <path d="M19.6 29.4 22 32l2.4-2.6" fill="none" stroke="#000" strokeWidth="2" strokeLinejoin="round" />
                  </svg>
                  <span className="text-[8.5px] font-semibold tracking-[0.14em] uppercase text-[var(--text-muted)] whitespace-nowrap">
                    TripAdvisor
                  </span>
                </a>
              )}

              {/* 3. Facebook */}
              {facebookUrl && (
                <a
                  href={facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 min-w-0 flex flex-col items-center gap-[7px] group"
                >
                  <svg
                    width="44"
                    height="44"
                    viewBox="0 0 44 44"
                    aria-hidden="true"
                    className="w-[42px] h-[42px] rounded-[11px] shadow-[0_4px_10px_rgba(0,0,0,0.2)] group-hover:scale-105 transition-transform"
                  >
                    <rect width="44" height="44" rx="11" fill="#1877F2" />
                    <path
                      d="M24.4 38V25.2h4.3l.7-5h-5v-3.2c0-1.4.4-2.4 2.5-2.4h2.6v-4.5c-.5-.1-2-.2-3.8-.2-3.8 0-6.3 2.3-6.3 6.5v3.8h-4.3v5h4.3V38z"
                      fill="#fff"
                    />
                  </svg>
                  <span className="text-[8.5px] font-semibold tracking-[0.14em] uppercase text-[var(--text-muted)] whitespace-nowrap">
                    Facebook
                  </span>
                </a>
              )}

              {/* 4. YouTube */}
              {youtubeUrl && (
                <a
                  href={youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 min-w-0 flex flex-col items-center gap-[7px] group"
                >
                  <svg
                    width="44"
                    height="44"
                    viewBox="0 0 44 44"
                    aria-hidden="true"
                    className="w-[42px] h-[42px] rounded-[11px] shadow-[0_4px_10px_rgba(0,0,0,0.2)] group-hover:scale-105 transition-transform"
                  >
                    <rect width="44" height="44" rx="11" fill="#FF0000" />
                    <rect x="8.5" y="12.5" width="27" height="19" rx="5.5" fill="#fff" />
                    <path d="M19.2 17.4v9.2l7.8-4.6z" fill="#FF0000" />
                  </svg>
                  <span className="text-[8.5px] font-semibold tracking-[0.14em] uppercase text-[var(--text-muted)] whitespace-nowrap">
                    YouTube
                  </span>
                </a>
              )}

              {/* 5. TikTok */}
              {tiktokUrl && (
                <a
                  href={tiktokUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 min-w-0 flex flex-col items-center gap-[7px] group"
                >
                  <svg
                    width="44"
                    height="44"
                    viewBox="0 0 44 44"
                    aria-hidden="true"
                    className="w-[42px] h-[42px] rounded-[11px] shadow-[0_4px_10px_rgba(0,0,0,0.2)] group-hover:scale-105 transition-transform"
                  >
                    <rect width="44" height="44" rx="11" fill="#000" />
                    <path
                      d="M24.2 9.5h4.2c.3 2.9 2.3 5.1 5.3 5.4v4.3c-2 0-3.8-.6-5.3-1.7v8.9a7.4 7.4 0 1 1-7.4-7.4c.4 0 .8 0 1.2.1v4.4a3.1 3.1 0 1 0 2 2.9z"
                      fill="#25F4EE"
                      transform="translate(-1.1 -0.9)"
                    />
                    <path
                      d="M24.2 9.5h4.2c.3 2.9 2.3 5.1 5.3 5.4v4.3c-2 0-3.8-.6-5.3-1.7v8.9a7.4 7.4 0 1 1-7.4-7.4c.4 0 .8 0 1.2.1v4.4a3.1 3.1 0 1 0 2 2.9z"
                      fill="#FE2C55"
                      transform="translate(1.1 0.9)"
                    />
                    <path
                      d="M24.2 9.5h4.2c.3 2.9 2.3 5.1 5.3 5.4v4.3c-2 0-3.8-.6-5.3-1.7v8.9a7.4 7.4 0 1 1-7.4-7.4c.4 0 .8 0 1.2.1v4.4a3.1 3.1 0 1 0 2 2.9z"
                      fill="#fff"
                    />
                  </svg>
                  <span className="text-[8.5px] font-semibold tracking-[0.14em] uppercase text-[var(--text-muted)] whitespace-nowrap">
                    TikTok
                  </span>
                </a>
              )}
            </nav>
          )}
        </div>

        {/* ===================== 3. STORY VIEWER FULL-SCREEN MODAL ===================== */}
        <AnimatePresence>
          {activeStory && activeStoryIndex !== null && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-3">
              <motion.div
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.92 }}
                className="relative w-full max-w-[420px] h-[82vh] max-h-[680px] rounded-[28px] overflow-hidden border border-white/15 shadow-2xl bg-slate-950 flex flex-col justify-between"
              >
                {activeStory.videoUrl ? (
                  <video
                    src={activeStory.videoUrl}
                    autoPlay
                    playsInline
                    muted
                    loop
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <img
                    src={activeStory.bannerImageUrl || activeStory.image}
                    alt={activeStory.title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/25 to-black/90 pointer-events-none" />

                {/* Top Progress Bars & Header */}
                <div className="relative z-20 p-4 space-y-3">
                  <div className="grid grid-cols-6 gap-1">
                    {stories.map((st, idx) => (
                      <button
                        key={st.id}
                        onClick={() => setActiveStoryIndex(idx)}
                        className="h-1 rounded-full overflow-hidden bg-white/25"
                      >
                        <div
                          className={`h-full transition-all duration-300 ${
                            idx <= activeStoryIndex ? 'w-full bg-[#A78BFA]' : 'w-0'
                          }`}
                        />
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={displayLogo}
                        alt={displayHotelName}
                        onError={(e) => {
                          if (e.currentTarget.src !== hotel.logo) {
                            e.currentTarget.src = hotel.logo;
                          }
                        }}
                        className="w-9 h-9 rounded-full object-cover border border-[#A78BFA]"
                      />
                      <div>
                        <span className="text-xs font-bold text-white block">{displayHotelName}</span>
                        <span className="text-[10px] text-[#C4B5FD] font-medium block">{activeStory.title}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => setActiveStoryIndex(null)}
                      className="w-8 h-8 rounded-full bg-white/15 text-white flex items-center justify-center"
                    >
                      <IOSIcon name="Close" size={16} />
                    </button>
                  </div>
                </div>

                {/* Left / Right Tap Zones for Prev / Next Story */}
                <div className="relative z-10 flex-1 flex">
                  <div
                    className="w-1/3 h-full cursor-pointer"
                    onClick={() =>
                      setActiveStoryIndex(activeStoryIndex > 0 ? activeStoryIndex - 1 : stories.length - 1)
                    }
                  />
                  <div
                    className="w-2/3 h-full cursor-pointer"
                    onClick={() =>
                      setActiveStoryIndex(activeStoryIndex < stories.length - 1 ? activeStoryIndex + 1 : null)
                    }
                  />
                </div>

                {/* Story Bottom Caption & CTA */}
                <div className="relative z-20 p-6 space-y-4">
                  {activeStory.badge && (
                    <span className="inline-block px-3 py-1 rounded-full bg-[#A78BFA] text-black text-xs font-extrabold">
                      {activeStory.badge}
                    </span>
                  )}
                  <h3 className="font-hotel-serif text-2xl font-bold text-white tracking-wide uppercase">
                    {activeStory.title}
                  </h3>
                  <p className="text-xs text-white/85 leading-relaxed">{activeStory.subtitle}</p>

                  <button
                    onClick={() => {
                      const actionUrl = activeStory.actionUrl;
                      const target = activeStory.targetSection;
                      setActiveStoryIndex(null);
                      if (actionUrl) {
                        navigate(mapActionUrlToRoute(actionUrl, hotelSlug));
                        return;
                      }
                      if (target === 'hotel-info') {
                        navigate(`/${hotelSlug}/hotel/g/191`);
                        return;
                      }
                      if (target === 'food-drink') {
                        navigate(`/${hotelSlug}/hotel/g/192`);
                        return;
                      }
                      if (target === 'spa-wellness') {
                        navigate(`/${hotelSlug}/hotel/g/193`);
                        return;
                      }
                      if (target === 'entertainment') {
                        navigate(`/${hotelSlug}/hotel/g/194`);
                        return;
                      }
                      if (target) {
                        setActiveSectionModal(target);
                      }
                    }}
                    className="w-full py-3.5 rounded-2xl bg-[#A78BFA] text-black text-xs font-bold shadow-lg shadow-[#A78BFA]/30 active:scale-95 transition-transform"
                  >
                    {activeStory.ctaLabel}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ===================== 4. SECTION DETAIL SHEET MODAL (6 Cards + Review) ===================== */}
        <AnimatePresence>
          {activeSectionModal && (
            <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/75 backdrop-blur-sm"
                onClick={() => setActiveSectionModal(null)}
              />

              <motion.div
                initial={{ opacity: 0, y: 60 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 60 }}
                transition={{ type: 'spring', damping: 26, stiffness: 320 }}
                className="relative z-10 w-full max-w-[480px] max-h-[85vh] overflow-y-auto rounded-t-[28px] sm:rounded-[28px] bg-[var(--bg-card)] border border-[var(--border-color)] p-5 text-[var(--text-main)] shadow-2xl space-y-4"
              >
                <div className="w-12 h-1.5 rounded-full bg-white/20 mx-auto mb-1" />

                <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-[#A78BFA]/20 text-[#A78BFA] flex items-center justify-center">
                      <IOSIcon
                        name={
                          activeSectionModal === 'hotel-info'
                            ? 'HotelBuilding'
                            : activeSectionModal === 'food-drink'
                            ? 'ClocheBell'
                            : activeSectionModal === 'spa-wellness'
                            ? 'SpaFlower'
                            : activeSectionModal === 'entertainment'
                            ? 'Gamepad'
                            : activeSectionModal === 'contact'
                            ? 'PeopleContact'
                            : activeSectionModal === 'daily-offer'
                            ? 'GiftBox'
                            : 'ReviewBubble'
                        }
                        size={24}
                      />
                    </div>
                    <h3 className="font-hotel-serif text-lg font-bold tracking-wider uppercase text-[var(--text-main)]">
                      {activeSectionModal === 'hotel-info' &&
                        (selectedLang === 'az' ? 'Otel məlumatı' : selectedLang === 'ru' ? 'Информация об отеле' : 'Hotel Information')}
                      {activeSectionModal === 'food-drink' &&
                        (selectedLang === 'az' ? 'Qida və içki' : selectedLang === 'ru' ? 'Еда и напитки' : 'Food & Beverage')}
                      {activeSectionModal === 'spa-wellness' &&
                        (selectedLang === 'az' ? 'Spa və sağlamlıq' : selectedLang === 'ru' ? 'Спа и велнес' : 'Spa & Wellness')}
                      {activeSectionModal === 'entertainment' &&
                        (selectedLang === 'az' ? 'Əyləncə' : selectedLang === 'ru' ? 'Развлечения' : 'Entertainment')}
                      {activeSectionModal === 'contact' &&
                        (selectedLang === 'az' ? 'Əlaqə' : selectedLang === 'ru' ? 'Контакты' : 'Contacts')}
                      {activeSectionModal === 'daily-offer' &&
                        (selectedLang === 'az' ? 'Günün təklifi' : selectedLang === 'ru' ? 'Предложение дня' : "Today's Special")}
                      {activeSectionModal === 'reviews' &&
                        (selectedLang === 'az' ? 'Rəy bildirin' : selectedLang === 'ru' ? 'Оставить отзыв' : 'Leave your feedback')}
                    </h3>
                  </div>

                  <button
                    onClick={() => setActiveSectionModal(null)}
                    className="w-8 h-8 rounded-full bg-[var(--bg-subcard)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-main)]"
                  >
                    <IOSIcon name="Close" size={16} />
                  </button>
                </div>

                {/* ---- MODAL CONTENT 1: OTEL MƏLUMATI ---- */}
                {activeSectionModal === 'hotel-info' && (
                  <div className="space-y-4">
                    <p className="text-xs text-[var(--text-muted)] leading-relaxed">{displayHotelBio}</p>

                    <div
                      onClick={() => {
                        setActiveSectionModal(null);
                        setIsWifiOpen(true);
                      }}
                      className="p-3.5 rounded-2xl bg-[var(--bg-subcard)] border border-[var(--border-color)] flex items-center justify-between cursor-pointer hover:border-[#A78BFA]/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#A78BFA]/20 text-[#A78BFA] flex items-center justify-center">
                          <IOSIcon name="Wifi" size={19} />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-[var(--text-main)] block">{t.wifiBanner.title}</span>
                          <span className="text-[11px] text-[var(--text-muted)] block">
                            {hotel.wifi.ssid} • Şifrə: {hotel.wifi.pass}
                          </span>
                        </div>
                      </div>
                      <span className="text-[11px] font-bold bg-[#A78BFA] text-black px-3 py-1.5 rounded-xl">
                        {t.wifiBanner.connectBtn}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div className="p-3 rounded-2xl bg-[var(--bg-subcard)] border border-[var(--border-color)]">
                        <span className="text-[10px] text-[var(--text-muted)] uppercase font-bold block">Check-in</span>
                        <span className="text-sm font-bold text-[#A78BFA] mt-0.5 block">14:00</span>
                      </div>
                      <div className="p-3 rounded-2xl bg-[var(--bg-subcard)] border border-[var(--border-color)]">
                        <span className="text-[10px] text-[var(--text-muted)] uppercase font-bold block">Check-out</span>
                        <span className="text-sm font-bold text-[#A78BFA] mt-0.5 block">12:00</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {(hotelInfoLinks.length > 0 ? hotelInfoLinks : allLinksFlat).map((item) => (
                        <div
                          key={item.id}
                          onClick={() => handleLinkClick(item)}
                          className="p-3 rounded-2xl bg-[var(--bg-subcard)] border border-[var(--border-color)] flex items-center justify-between cursor-pointer hover:border-[#A78BFA]/40 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-[#A78BFA]/15 text-[#A78BFA] flex items-center justify-center">
                              <IOSIcon name={item.iconName} size={18} />
                            </div>
                            <span className="text-xs font-bold text-[var(--text-main)]">{item.title}</span>
                          </div>
                          <IOSIcon name="ChevronRight" size={14} className="text-[var(--text-muted)]" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ---- MODAL CONTENT 2: QİDA VƏ İÇKİ ---- */}
                {activeSectionModal === 'food-drink' && (
                  <div className="space-y-3">
                    <div className="space-y-2">
                      {(foodAndDrinkLinks.length > 0 ? foodAndDrinkLinks : allLinksFlat).map((item) => (
                        <div
                          key={item.id}
                          onClick={() => handleLinkClick(item)}
                          className="p-3.5 rounded-2xl bg-[var(--bg-subcard)] border border-[var(--border-color)] flex items-center justify-between cursor-pointer hover:border-[#A78BFA]/50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-[#A78BFA]/15 text-[#A78BFA] flex items-center justify-center">
                              <IOSIcon name={item.iconName} size={19} />
                            </div>
                            <div>
                              <span className="text-xs font-bold text-[var(--text-main)] block">{item.title}</span>
                              {item.subtitle && (
                                <span className="text-[11px] text-[var(--text-muted)] block">{item.subtitle}</span>
                              )}
                            </div>
                          </div>
                          <IOSIcon name="ChevronRight" size={15} className="text-[var(--text-muted)]" />
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => {
                        setActiveSectionModal(null);
                        setIsInquiryOpen(true);
                      }}
                      className="w-full py-3.5 rounded-2xl bg-[#A78BFA] text-black text-xs font-bold shadow-lg shadow-[#A78BFA]/25 flex items-center justify-center gap-2"
                    >
                      <IOSIcon name="Bell" size={16} />
                      <span>
                        {selectedLang === 'az'
                          ? 'Otağa Sifariş Ver (24/7 Room Service)'
                          : selectedLang === 'ru'
                          ? 'Заказать в номер (24/7)'
                          : 'Order Room Service (24/7)'}
                      </span>
                    </button>
                  </div>
                )}

                {/* ---- MODAL CONTENT 3: SPA VƏ SAĞLAMLIQ ---- */}
                {activeSectionModal === 'spa-wellness' && (
                  <div className="space-y-3">
                    <div className="p-3.5 rounded-2xl bg-[#A78BFA]/15 border border-[#A78BFA]/30 text-xs text-[var(--text-main)]">
                      <span className="font-bold text-[#A78BFA] block mb-0.5">✨ Qonaqlar üçün Özəl −20% Endirim</span>
                      <span className="text-[11px] text-[var(--text-muted)]">
                        Türk hamamı, sauna, qapalı hovuz və relaks masaj seansları hər gün 08:00 – 22:00.
                      </span>
                    </div>

                    <div className="space-y-2">
                      {(spaAndWellnessLinks.length > 0 ? spaAndWellnessLinks : t.categories[1]?.items || []).map(
                        (item) => (
                          <div
                            key={item.id}
                            onClick={() => handleLinkClick(item)}
                            className="p-3.5 rounded-2xl bg-[var(--bg-subcard)] border border-[var(--border-color)] flex items-center justify-between cursor-pointer hover:border-[#A78BFA]/50 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-[#A78BFA]/15 text-[#A78BFA] flex items-center justify-center">
                                <IOSIcon name={item.iconName} size={19} />
                              </div>
                              <div>
                                <span className="text-xs font-bold text-[var(--text-main)] block">{item.title}</span>
                                {item.subtitle && (
                                  <span className="text-[11px] text-[var(--text-muted)] block">{item.subtitle}</span>
                                )}
                              </div>
                            </div>
                            <IOSIcon name="ChevronRight" size={15} className="text-[var(--text-muted)]" />
                          </div>
                        )
                      )}
                    </div>

                    <button
                      onClick={() => {
                        setActiveSectionModal(null);
                        setIsInquiryOpen(true);
                      }}
                      className="w-full py-3.5 rounded-2xl bg-[#A78BFA] text-black text-xs font-bold shadow-lg shadow-[#A78BFA]/25"
                    >
                      {selectedLang === 'az'
                        ? 'Spa & Masaj Rezervasiya Et'
                        : selectedLang === 'ru'
                        ? 'Забронировать СПА'
                        : 'Book Spa & Massage'}
                    </button>
                  </div>
                )}

                {/* ---- MODAL CONTENT 4: ƏYLƏNCƏ ---- */}
                {activeSectionModal === 'entertainment' && (
                  <div className="space-y-3">
                    {displayActivities.map((act) => (
                      <div
                        key={act.id}
                        className="p-3.5 rounded-2xl bg-[var(--bg-subcard)] border border-[var(--border-color)] space-y-1"
                      >
                        <span className="inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#A78BFA]/20 text-[#A78BFA]">
                          {act.category}
                        </span>
                        <h4 className="text-sm font-bold text-[var(--text-main)]">{act.title}</h4>
                        <div className="flex items-center gap-3 text-[11px] text-[var(--text-muted)] pt-1">
                          <span className="flex items-center gap-1">
                            <IOSIcon name="Clock" size={13} className="text-[#A78BFA]" />
                            {act.time}
                          </span>
                          <span className="flex items-center gap-1">
                            <IOSIcon name="MapPin" size={13} className="text-[#A78BFA]" />
                            {act.location}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* ---- MODAL CONTENT 5: ƏLAQƏ ---- */}
                {activeSectionModal === 'contact' && (
                  <div className="space-y-2.5">
                    <a
                      href={`tel:${displayPhone}`}
                      className="p-3.5 rounded-2xl bg-[var(--bg-subcard)] border border-[var(--border-color)] flex items-center justify-between hover:border-[#A78BFA]/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#A78BFA]/20 text-[#A78BFA] flex items-center justify-center">
                          <IOSIcon name="Phone" size={18} />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-[var(--text-main)] block">Resepşn ilə Zəng</span>
                          <span className="text-[11px] text-[var(--text-muted)] block">{displayPhone}</span>
                        </div>
                      </div>
                      <IOSIcon name="ChevronRight" size={15} className="text-[var(--text-muted)]" />
                    </a>

                    <a
                      href={`https://wa.me/${displayWhatsapp}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3.5 rounded-2xl bg-[var(--bg-subcard)] border border-[var(--border-color)] flex items-center justify-between hover:border-emerald-500/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                          <IOSIcon name="Whatsapp" size={19} />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-[var(--text-main)] block">WhatsApp Konsyerj</span>
                          <span className="text-[11px] text-[var(--text-muted)] block">24/7 Sürətli Yazışma</span>
                        </div>
                      </div>
                      <IOSIcon name="ChevronRight" size={15} className="text-[var(--text-muted)]" />
                    </a>

                    <a
                      href={telegramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3.5 rounded-2xl bg-[var(--bg-subcard)] border border-[var(--border-color)] flex items-center justify-between hover:border-sky-500/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#229ED9]/20 text-[#229ED9] flex items-center justify-center">
                          <IOSIcon name="Telegram" size={19} />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-[var(--text-main)] block">Telegram Bot</span>
                          <span className="text-[11px] text-[var(--text-muted)] block">Avtomatik Sorğu & Dəstək</span>
                        </div>
                      </div>
                      <IOSIcon name="ChevronRight" size={15} className="text-[var(--text-muted)]" />
                    </a>

                    <a
                      href={publicService.getVCardUrl(hotelSlug)}
                      className="p-3.5 rounded-2xl bg-[var(--bg-subcard)] border border-[var(--border-color)] flex items-center justify-between hover:border-[#A78BFA]/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#A78BFA]/20 text-[#A78BFA] flex items-center justify-center">
                          <IOSIcon name="Book" size={18} />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-[var(--text-main)] block">
                            Kontaktı Telefona Yaz (.vcf)
                          </span>
                          <span className="text-[11px] text-[var(--text-muted)] block">
                            Otelin nömrə və ünvanını yadda saxla
                          </span>
                        </div>
                      </div>
                      <IOSIcon name="ChevronRight" size={15} className="text-[var(--text-muted)]" />
                    </a>

                    <button
                      onClick={() => {
                        setActiveSectionModal(null);
                        setIsInquiryOpen(true);
                      }}
                      className="w-full py-3.5 rounded-2xl bg-[#A78BFA] text-black text-xs font-bold shadow-lg shadow-[#A78BFA]/25 mt-2"
                    >
                      🛎️ Otaq Xidməti / Resepşna Sorğu Göndər
                    </button>
                  </div>
                )}

                {/* ---- MODAL CONTENT 6: GÜNÜN TƏKLİFİ ---- */}
                {activeSectionModal === 'daily-offer' && (
                  <div className="space-y-3">
                    <div className="rounded-2xl overflow-hidden border border-[var(--border-color)] bg-[var(--bg-subcard)]">
                      <img
                        src="/media/guest/chef-special.webp"
                        alt="Günün təklifi"
                        className="w-full h-36 object-cover"
                      />
                      <div className="p-4 space-y-1.5">
                        <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#A78BFA]/20 text-[#A78BFA]">
                          Şefin Özəl Seçimi
                        </span>
                        <h4 className="text-sm font-bold text-[var(--text-main)]">
                          Ribeye Steyk & Qırmızı Şərab Seti
                        </h4>
                        <p className="text-xs text-[var(--text-muted)]">
                          Bu gün otağa və ya restoranda sifariş zamanı desert hədiyyə olunur.
                        </p>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-[var(--bg-subcard)] border border-[var(--border-color)] flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-[#A78BFA] block">Spa & Masaj Paketi (−20%)</span>
                        <span className="text-[11px] text-[var(--text-muted)]">
                          Saat 16:00-dək edilən rezervasiyalara özəl endirim
                        </span>
                      </div>
                      <span className="text-xs font-extrabold px-2.5 py-1 rounded-xl bg-[#A78BFA]/20 text-[#A78BFA]">
                        −20%
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        setActiveSectionModal(null);
                        setIsInquiryOpen(true);
                      }}
                      className="w-full py-3.5 rounded-2xl bg-[#A78BFA] text-black text-xs font-bold shadow-lg shadow-[#A78BFA]/25"
                    >
                      Təklifdən Yararlan / Sifariş Et
                    </button>
                  </div>
                )}

                {/* ---- MODAL CONTENT 7: RƏY BİLDİRİN ---- */}
                {activeSectionModal === 'reviews' && (
                  <div className="space-y-2.5">
                    <p className="text-xs text-[var(--text-muted)]">
                      Xidmətimizdən məmnunsunuzsa, rəsmi platformalarda bizi qiymətləndirməyinizdən məmnun olarıq:
                    </p>

                    <a
                      href={googleReviewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3.5 rounded-2xl bg-[var(--bg-subcard)] border border-[var(--border-color)] flex items-center justify-between hover:border-[#EA4335]/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#EA4335] text-white flex items-center justify-center">
                          <IOSIcon name="GoogleMaps" size={20} />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-[var(--text-main)] block">Google Maps & Reviews</span>
                          <span className="text-[11px] text-[var(--text-muted)] block">★★★★★ 5 ulduzla qiymətləndirin</span>
                        </div>
                      </div>
                      <IOSIcon name="ChevronRight" size={15} className="text-[var(--text-muted)]" />
                    </a>

                    <a
                      href={tripAdvisorUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3.5 rounded-2xl bg-[var(--bg-subcard)] border border-[var(--border-color)] flex items-center justify-between hover:border-[#00AF87]/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#00AF87] text-white flex items-center justify-center">
                          <IOSIcon name="TripAdvisor" size={20} />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-[var(--text-main)] block">TripAdvisor</span>
                          <span className="text-[11px] text-[var(--text-muted)] block">Səyahət təəssüratınızı bölüşün</span>
                        </div>
                      </div>
                      <IOSIcon name="ChevronRight" size={15} className="text-[var(--text-muted)]" />
                    </a>

                    <a
                      href={bookingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3.5 rounded-2xl bg-[var(--bg-subcard)] border border-[var(--border-color)] flex items-center justify-between hover:border-[#003580]/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#003580] text-white flex items-center justify-center">
                          <IOSIcon name="Booking" size={20} />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-[var(--text-main)] block">Booking.com</span>
                          <span className="text-[11px] text-[var(--text-muted)] block">Qonaqlama rəyi yazın</span>
                        </div>
                      </div>
                      <IOSIcon name="ChevronRight" size={15} className="text-[var(--text-muted)]" />
                    </a>

                    <button
                      onClick={() => {
                        setActiveSectionModal(null);
                        setIsInquiryOpen(true);
                      }}
                      className="w-full py-3 rounded-2xl bg-[var(--bg-subcard)] border border-[#A78BFA]/40 text-[#A78BFA] text-xs font-bold mt-2"
                    >
                      Birbaşa Otel Rəhbərliyinə Təklif / Şikayət Yaz
                    </button>
                  </div>
                )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>

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

        {/* QR Bölüş Modal */}
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

        {/* Service Quick Detail Modal */}
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
                <div className="mx-auto mb-3 w-14 h-14 rounded-2xl bg-[#A78BFA]/20 text-[#A78BFA] flex items-center justify-center shadow-lg shadow-[#A78BFA]/10">
                  <IOSIcon name={selectedService.iconName} size={26} />
                </div>
                <h3 className="text-lg font-bold text-[var(--text-main)]">{selectedService.title}</h3>
                <p className="text-xs text-[var(--text-muted)] mt-1.5 leading-relaxed">{selectedService.subtitle}</p>

                <div className="mt-6 space-y-2.5">
                  <button
                    onClick={() => {
                      setSelectedService(null);
                      setIsInquiryOpen(true);
                    }}
                    className="w-full py-3.5 rounded-2xl bg-[#A78BFA] text-black text-xs font-bold shadow-lg shadow-[#A78BFA]/25"
                  >
                    {t.serviceModal.orderBtn}
                  </button>
                  <button
                    onClick={() => setSelectedService(null)}
                    className="w-full py-2.5 rounded-2xl bg-[var(--bg-subcard)] text-[var(--text-muted)] hover:text-[var(--text-main)] text-xs font-semibold border border-[var(--border-color)] transition-colors"
                  >
                    {t.serviceModal.closeBtn}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
