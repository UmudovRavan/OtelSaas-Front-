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
import { useGuestDocumentMeta } from '../../utils/documentHead';

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
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('fs_guest_dark') === '1';
    }
    return false;
  });
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
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

  // Scoped Guest Portal Theme Sync (does not modify Admin/Reception .light class)
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('fs-dark');
      localStorage.setItem('fs_guest_dark', '1');
    } else {
      document.documentElement.classList.remove('fs-dark');
      localStorage.setItem('fs_guest_dark', '0');
    }
  }, [isDarkMode]);

  useEffect(() => {
    const scrollKey = `fs_portal_scroll_${hotelSlug}`;
    const savedScroll = sessionStorage.getItem(scrollKey);
    if (savedScroll) {
      const y = parseInt(savedScroll, 10);
      if (!Number.isNaN(y) && y > 0) {
        requestAnimationFrame(() => {
          window.scrollTo({ top: y, behavior: 'instant' as ScrollBehavior });
        });
      }
    }

    let canSave = false;
    const timer = window.setTimeout(() => {
      canSave = true;
    }, 150);

    const onScroll = () => {
      setIsScrolled(window.scrollY > 36);
      if (canSave) {
        sessionStorage.setItem(scrollKey, String(window.scrollY));
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('scroll', onScroll);
    };
  }, [hotelSlug]);

  const displayHotelName = portalData?.name || (isDemoHotel ? t.hotelName : 'Otel');
  const displaySubtitle = tr(
    portalData?.subtitleTr,
    portalData?.subtitle || (isDemoHotel ? (selectedLang === 'ru' ? 'Ленкорань' : selectedLang === 'en' ? 'Lankaran' : 'Lənkəran') : ''),
    selectedLang as SupportedLang
  );
  const displayTagline = tr(
    portalData?.taglineTr,
    portalData?.tagline || (isDemoHotel ? 'Hotel & Resort' : ''),
    selectedLang as SupportedLang
  );
  const displayHotelBio = tr(
    portalData?.bioTr,
    portalData?.bio || (isDemoHotel ? t.hotelDescription : ''),
    selectedLang as SupportedLang
  );
  const displayCoverImage = resolveMediaUrl(portalData?.coverImageUrl, '/media/guest/hero.webp');
  const displayLogo = portalData?.logoUrl
    ? resolveMediaUrl(portalData.logoUrl, hotel.logo)
    : isDemoHotel
    ? resolveMediaUrl(hotel.logo)
    : '';
  const displayPhone = portalData?.phone || (isDemoHotel ? hotel.phone : '');
  const displayWhatsapp = (portalData?.whatsApp || (isDemoHotel ? hotel.whatsapp : '')).replace(/[^0-9]/g, '');
  const starCount = portalData?.starRating || 5;
  const starString = '★'.repeat(Math.max(1, Math.min(5, starCount)));

  useGuestDocumentMeta(displayHotelName, portalData?.logoUrl || (isDemoHotel ? hotel.logo : undefined));

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
      : isDemoHotel
      ? t.categories
      : [];

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
      : isDemoHotel
      ? t.activities
      : [];

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
    ? portalData.telegram.startsWith('http')
      ? portalData.telegram
      : `https://t.me/${portalData.telegram.replace('@', '')}`
    : isDemoHotel
    ? resolveLinkUrl('telegram', 'https://t.me/altensor_bot')
    : undefined;

  // 6 Story Highlights (Fallback & Default)
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

  // 6 Main Visual Cards (Fallback & Default)
  const defaultMainCards: Array<{
    id: MainCardSectionId;
    title: string;
    subtitle?: string;
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
      : isDemoHotel
      ? defaultStories
      : [];

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
      : isDemoHotel
      ? defaultMainCards
      : [];

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

  const handleMainCardNavigate = (card: (typeof mainCards)[number]) => {
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
  };

  if (isSuspended) {
    return (
      <div className="fs-portal min-h-screen flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-[var(--fs-surface-subtle)] border border-[var(--fs-border)] p-10 text-center space-y-5"
        >
          <p className="fs-eyebrow text-[17px] text-[var(--fs-text-muted)]">Concierge Notice</p>
          <h2 className="font-fs-sans font-extralight text-[22px] tracking-[0.16em] uppercase text-[var(--fs-text)]">
            Xidmət Müvəqqəti Dayandırılıb
          </h2>
          <div className="w-10 h-[1px] bg-[var(--fs-border-strong)] mx-auto" />
          <p className="font-fs-serif text-[16px] text-[var(--fs-text-muted)] leading-relaxed">
            {suspendReason || 'Bu otelin rəqəmsal konsyerj və QR SaaS xidməti abunəlik səbəbindən dondurulub.'}
          </p>
          <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--fs-text-subtle)] pt-4 border-t border-[var(--fs-border)]">
            Zəhmət olmasa birbaşa otelin qəbul şöbəsi (Reception) ilə əlaqə saxlayın.
          </p>
        </motion.div>
      </div>
    );
  }

  const activeStory = activeStoryIndex !== null ? stories[activeStoryIndex] : null;
  const discoverLabel =
    selectedLang === 'az' ? 'Ətraflı' : selectedLang === 'ru' ? 'Подробнее' : 'Discover';

  return (
    <div className="fs-portal min-h-screen flex flex-col selection:bg-black selection:text-white">
      {/* ===================== 1. STICKY ARCHITECTURAL NAVIGATION BAR ===================== */}
      <nav
        aria-label="Üst menyu"
        className={`fixed top-0 inset-x-0 z-30 transition-all duration-300 ${
          isScrolled
            ? 'bg-[#1A1A1A]/95 backdrop-blur-md border-b border-white/15 py-3 shadow-[0_5px_15px_rgba(3,3,3,0.16)]'
            : 'bg-gradient-to-b from-black/70 via-black/30 to-transparent py-4'
        }`}
      >
        <div className="max-w-[1280px] mx-auto px-4 sm:px-8 flex items-center justify-between gap-3">
          {/* Left Property Identity */}
          <div className="flex items-center gap-3 min-w-0">
            {displayLogo ? (
              <img
                src={displayLogo}
                alt={displayHotelName}
                onError={(e) => {
                  const fallback = resolveMediaUrl(hotel.logo);
                  if (!e.currentTarget.dataset.fbApplied && fallback && e.currentTarget.src !== fallback) {
                    e.currentTarget.dataset.fbApplied = '1';
                    e.currentTarget.src = fallback;
                  } else {
                    e.currentTarget.style.display = 'none';
                  }
                }}
                className="w-8 h-8 sm:w-9 sm:h-9 object-contain shrink-0"
              />
            ) : (
              <svg
                width="26"
                height="16"
                viewBox="0 0 96 22"
                fill="none"
                className="text-white shrink-0"
                aria-hidden="true"
              >
                <path
                  d="M4 19L32 4L49 14M39 17L60 5L92 19"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
            <span className="hidden sm:inline-block w-[1px] h-5 bg-white/30" aria-hidden="true" />
            <span className="hidden sm:block font-fs-sans font-extralight text-[14px] lg:text-[15px] tracking-[0.22em] uppercase text-white truncate max-w-[280px] lg:max-w-md">
              {displayHotelName}
            </span>
          </div>

          {/* Right Utility Controls: Language Switcher | Theme | QR */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div
              role="group"
              aria-label="Dil / Language / Язык"
              className="inline-flex items-center h-8 px-1"
            >
              {(['az', 'en', 'ru'] as const).map((lang, idx) => {
                const isActive = selectedLang === lang;
                return (
                  <span key={lang} className="inline-flex items-center">
                    {idx > 0 && <span className="w-[1px] h-3 bg-white/25 mx-1.5" aria-hidden="true" />}
                    <button
                      type="button"
                      onClick={() => setSelectedLang(lang)}
                      className={`px-1 py-0.5 text-[10.5px] font-bold tracking-[0.20em] uppercase transition-all ${
                        isActive
                          ? 'text-white border-b border-white'
                          : 'text-white/65 hover:text-white border-b border-transparent'
                      }`}
                    >
                      {lang}
                    </button>
                  </span>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setIsDarkMode(!isDarkMode)}
              title={isDarkMode ? 'Light Mode' : 'Dark Mode'}
              aria-label={isDarkMode ? 'Light Mode' : 'Dark Mode'}
              className="w-8 h-8 border border-white/30 hover:border-white flex items-center justify-center text-white transition-colors"
            >
              {isDarkMode ? <IOSIcon name="Sun" size={14} /> : <IOSIcon name="Moon" size={14} />}
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
              className="h-8 px-3 border border-white/35 hover:bg-white hover:text-black flex items-center gap-1.5 text-white text-[10px] font-bold tracking-[0.22em] uppercase transition-colors"
            >
              <IOSIcon name="Share" size={12} />
              <span>QR</span>
            </button>
          </div>
        </div>
      </nav>

      {/* ===================== 2. FULL-BLEED ARCHITECTURAL HERO ===================== */}
      <header className="relative w-full h-[460px] sm:h-[540px] lg:h-[76vh] lg:min-h-[580px] lg:max-h-[820px] overflow-hidden bg-[#0F0F0F]">
        <img
          src={displayCoverImage}
          alt={displayHotelName}
          onError={(e) => {
            const fallback = resolveMediaUrl('/media/guest/hero.webp');
            if (!e.currentTarget.dataset.fbApplied && e.currentTarget.src !== fallback) {
              e.currentTarget.dataset.fbApplied = '1';
              e.currentTarget.src = fallback;
            }
          }}
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Four Seasons Architectural Scrim */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(180deg, rgba(0,0,0,0.40) 0%, rgba(0,0,0,0.06) 42%, rgba(0,0,0,0.78) 100%)',
          }}
        />

        {/* Hero Typography Container: Centered on Mobile, Lower-Left on Desktop */}
        <div className="relative z-10 h-full max-w-[1280px] mx-auto px-5 sm:px-8 pb-10 sm:pb-14 lg:pb-16 pt-20 flex flex-col justify-end items-center text-center md:items-start md:text-left text-white">
          {/* Architectural Roofline Mark on Mobile */}
          <svg
            width="72"
            height="18"
            viewBox="0 0 96 22"
            fill="none"
            className="text-white/85 mb-2.5 md:hidden"
            aria-hidden="true"
          >
            <path
              d="M4 19L32 4L49 14M39 17L60 5L92 19"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          {/* Italic Garamond Eyebrow */}
          {displayTagline ? (
            <p className="fs-eyebrow text-[17px] sm:text-[19px] text-white/90 mb-1.5">
              {displayTagline}
            </p>
          ) : null}

          {/* Ultra-Light Tracked Display H1 */}
          <h1 className="font-fs-sans font-extralight text-[28px] sm:text-[36px] lg:text-[44px] leading-[1.25] tracking-[0.20em] md:tracking-[0.14em] uppercase text-white max-w-3xl">
            {displayHotelName}
          </h1>

          {/* Subtitle & Stars */}
          <div className="mt-3 flex flex-col md:flex-row items-center gap-2 md:gap-4">
            {displaySubtitle ? (
              <p className="font-fs-sans text-[11.5px] font-normal tracking-[0.26em] uppercase text-white/90">
                {displaySubtitle}
              </p>
            ) : null}

            {displaySubtitle && <span className="hidden md:inline-block w-1 h-1 rounded-full bg-white/60" />}

            <p
              className="text-[11.5px] tracking-[0.30em] text-white/90"
              aria-label={`${starCount} ulduz`}
            >
              {starString}
            </p>
          </div>
        </div>
      </header>

      {/* ===================== 3. MAIN EDITORIAL BODY ===================== */}
      <main className="flex-1 w-full">
        {/* ---- 3A. INTRO GRAYBOX (.Text-Box--GrayBox) ---- */}
        {displayHotelBio ? (
          <section className="max-w-[960px] mx-auto px-4 sm:px-8 pt-6 sm:pt-12">
            <div className="bg-[var(--fs-surface-subtle)] border border-[var(--fs-border)] px-6 py-7 sm:px-14 sm:py-11 text-center">
              <div className="w-8 h-[1px] bg-[var(--fs-border-strong)] mx-auto mb-4" />
              <p className="font-fs-serif text-[16px] sm:text-[18px] leading-[1.68] text-[var(--fs-text-body)] max-w-[640px] mx-auto">
                {displayHotelBio}
              </p>
            </div>
          </section>
        ) : null}

        {/* ---- 3B. STORY HIGHLIGHTS STRIP ---- */}
        {stories.length > 0 && (
          <section
            aria-label="Günün xəbərləri"
            className="max-w-[1140px] mx-auto px-4 sm:px-8 pt-7 sm:pt-12"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="fs-kicker text-[var(--fs-text-muted)]">
                {selectedLang === 'az'
                  ? 'Günün Xəbərləri'
                  : selectedLang === 'ru'
                  ? 'Актуальное'
                  : 'Highlights'}
              </span>
              <span className="hidden sm:block flex-1 h-[1px] bg-[var(--fs-border)] ml-6" />
            </div>

            <div
              role="list"
              className="grid grid-cols-3 sm:grid-cols-6 gap-3.5 sm:gap-6 py-1"
            >
              {stories.map((story, idx) => (
                <button
                  key={story.id}
                  type="button"
                  role="listitem"
                  onClick={() => setActiveStoryIndex(idx)}
                  className="flex flex-col items-center gap-2.5 text-[var(--fs-text)] focus:outline-none group"
                >
                  <span className="relative w-[72px] h-[72px] sm:w-[82px] sm:h-[82px] p-[3px] rounded-full border border-[var(--fs-border-strong)] group-hover:scale-[1.04] transition-transform duration-300 flex">
                    <img
                      src={resolveMediaUrl(story.image, '/media/guest/story-welcome-poster.webp')}
                      alt={story.title}
                      onError={(e) => {
                        const fallback = resolveMediaUrl('/media/guest/story-welcome-poster.webp');
                        if (!e.currentTarget.dataset.fbApplied) {
                          e.currentTarget.dataset.fbApplied = '1';
                          e.currentTarget.src = fallback;
                        }
                      }}
                      className="w-full h-full rounded-full object-cover bg-[var(--fs-surface-subtle)]"
                    />
                    {story.hasPlayBadge && (
                      <span
                        aria-hidden="true"
                        className="absolute right-0 bottom-0 w-5 h-5 rounded-full bg-black text-white border border-white flex items-center justify-center pl-[1px]"
                      >
                        <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M7 4.5v15a1 1 0 0 0 1.5.86l12.5-7.5a1 1 0 0 0 0-1.72L8.5 3.64A1 1 0 0 0 7 4.5z" />
                        </svg>
                      </span>
                    )}
                  </span>
                  <span className="max-w-full font-fs-sans text-[10.5px] sm:text-[11px] font-semibold tracking-[0.12em] uppercase leading-[1.3] text-center text-[var(--fs-text)] line-clamp-2">
                    {story.title}
                  </span>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* ---- 3C. ARCHITECTURAL CATEGORY GALLERY (2x3 Mobile -> 3-Col Desktop) ---- */}
        <section
          aria-label="Bölmələr"
          className="max-w-[1140px] mx-auto px-4 sm:px-8 py-8 sm:py-14"
        >
          <div className="text-center mb-6 sm:mb-10">
            <p className="fs-eyebrow text-[16px] sm:text-[18px] text-[var(--fs-text-muted)] mb-1">
              {selectedLang === 'az'
                ? 'Rəqəmsal Konsyerj'
                : selectedLang === 'ru'
                ? 'Цифровой Консьерж'
                : 'Digital Concierge'}
            </p>
            <h2 className="font-fs-sans font-extralight text-[20px] sm:text-[24px] tracking-[0.18em] uppercase text-[var(--fs-text)]">
              {selectedLang === 'az'
                ? 'Xidmətlər və İmkanlar'
                : selectedLang === 'ru'
                ? 'Услуги и Возможности'
                : 'Services & Experiences'}
            </h2>
          </div>

          {mainCards.length > 0 ? (
            <nav className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5 sm:gap-5">
              {mainCards.map((card) => (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => handleMainCardNavigate(card)}
                  className="relative aspect-[1/1.02] sm:aspect-square rounded-[5px] bg-[var(--fs-card)] border border-[var(--fs-border)] hover:border-[var(--fs-border-strong)] hover:bg-[var(--fs-surface-subtle)] px-3 py-5 flex flex-col items-center justify-center gap-3 text-center text-[var(--fs-text)] transition-all duration-200 group focus:outline-none"
                >
                  <span className="text-[var(--fs-text)] opacity-85 group-hover:opacity-100 group-hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center">
                    <IOSIcon name={card.icon} size={26} />
                  </span>

                  <span className="font-fs-sans font-bold text-[10px] sm:text-[10.5px] leading-[1.35] tracking-[0.18em] uppercase text-[var(--fs-text)] max-w-full">
                    {card.title}
                  </span>
                </button>
              ))}
            </nav>
          ) : (
            <div className="py-14 px-6 flex flex-col items-center justify-center text-center bg-[var(--fs-surface-subtle)] border border-[var(--fs-border)]">
              <div className="w-12 h-12 border border-[var(--fs-border-strong)] flex items-center justify-center mb-4 text-[var(--fs-text)]">
                <IOSIcon name="HotelBuilding" size={24} />
              </div>
              <h3 className="font-fs-sans font-extralight text-[18px] tracking-[0.18em] uppercase text-[var(--fs-text)] mb-2">
                {selectedLang === 'az'
                  ? 'Bölmələr əlavə edilməyib'
                  : selectedLang === 'ru'
                  ? 'Разделы не добавлены'
                  : 'No sections added'}
              </h3>
              <p className="font-fs-serif text-[15px] text-[var(--fs-text-muted)] max-w-sm leading-relaxed">
                {selectedLang === 'az'
                  ? 'Bu otel üçün hələlik heç bir xidmət və ya menyu bölməsi aktiv edilməyib.'
                  : selectedLang === 'ru'
                  ? 'Для этого отеля пока не активированы услуги или разделы меню.'
                  : 'No service or menu hubs have been activated for this hotel yet.'}
              </p>
            </div>
          )}
        </section>

        {/* ---- 3D. EDITORIAL 50/50 SPLIT FEEDBACK BANNER ---- */}
        <section className="max-w-[1140px] mx-auto px-4 sm:px-8 pb-12 sm:pb-20">
          <div className="grid grid-cols-1 md:grid-cols-2 border border-[var(--fs-border)] bg-[var(--fs-surface-subtle)] overflow-hidden">
            <div className="relative h-[200px] sm:h-[260px] md:h-auto md:min-h-[280px] overflow-hidden bg-[#141414]">
              <img
                src={resolveMediaUrl('/media/guest/review-banner.webp')}
                alt="Rəy bildirin"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/20 pointer-events-none" />
            </div>

            <div className="p-7 sm:p-10 lg:p-14 flex flex-col justify-center items-center md:items-start text-center md:text-left space-y-4">
              <p className="fs-eyebrow text-[17px] text-[var(--fs-text-muted)]">
                {selectedLang === 'az'
                  ? 'Qonaq Təəssüratı'
                  : selectedLang === 'ru'
                  ? 'Впечатления Гостей'
                  : 'Guest Impressions'}
              </p>
              <h2 className="font-fs-sans font-extralight text-[21px] sm:text-[24px] tracking-[0.17em] uppercase text-[var(--fs-text)] leading-snug">
                {selectedLang === 'az'
                  ? 'Rəy bildirin'
                  : selectedLang === 'ru'
                  ? 'Оставить отзыв'
                  : 'Leave your feedback'}
              </h2>
              <p className="font-fs-serif text-[15.5px] leading-relaxed text-[var(--fs-text-muted)] max-w-md">
                {selectedLang === 'az'
                  ? 'Sizin fikirləriniz xidmət keyfiyyətimizi daim ən yüksək səviyyədə saxlamağımıza kömək edir.'
                  : selectedLang === 'ru'
                  ? 'Ваше мнение помогает нам поддерживать безупречный уровень сервиса.'
                  : 'Your perspective helps us continually refine every detail of your stay.'}
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => navigate(slug ? `/hotel/${slug}/review` : '/review')}
                  className="fs-btn-primary"
                >
                  <span>
                    {selectedLang === 'az'
                      ? 'Qiymətləndirin'
                      : selectedLang === 'ru'
                      ? 'Оценить визит'
                      : 'Share Feedback'}
                  </span>
                  <IOSIcon name="TileChevron" size={14} />
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ===================== 4. FOUR SEASONS PITCH-BLACK FOOTER ===================== */}
      <footer className="w-full bg-[#000000] text-white border-t border-white/15 py-12 sm:py-16 px-4 sm:px-8">
        <div className="max-w-[1140px] mx-auto flex flex-col items-center text-center space-y-6">
          <div className="space-y-2">
            <svg
              width="64"
              height="16"
              viewBox="0 0 96 22"
              fill="none"
              className="text-white/80 mx-auto"
              aria-hidden="true"
            >
              <path
                d="M4 19L32 4L49 14M39 17L60 5L92 19"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <p className="font-fs-sans font-extralight text-[17px] sm:text-[20px] tracking-[0.22em] uppercase text-white">
              {displayHotelName}
            </p>
            {displaySubtitle ? (
              <p className="fs-eyebrow text-[15px] text-[#BABABA]">{displaySubtitle}</p>
            ) : null}
          </div>

          {(instagramUrl || tripAdvisorUrl || facebookUrl || youtubeUrl || tiktokUrl) && (
            <>
              <hr className="w-full max-w-md border-white/15" />
              <nav
                aria-label="Sosial şəbəkələr"
                className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 pt-1"
              >
                {instagramUrl && (
                  <a
                    href={instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center gap-2 text-white/80 hover:text-white transition-colors group"
                  >
                    <IOSIcon name="Instagram" size={20} />
                    <span className="font-fs-sans text-[9.5px] font-bold tracking-[0.22em] uppercase">
                      Instagram
                    </span>
                  </a>
                )}

                {tripAdvisorUrl && (
                  <a
                    href={tripAdvisorUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center gap-2 text-white/80 hover:text-white transition-colors group"
                  >
                    <IOSIcon name="TripAdvisor" size={20} />
                    <span className="font-fs-sans text-[9.5px] font-bold tracking-[0.22em] uppercase">
                      TripAdvisor
                    </span>
                  </a>
                )}

                {facebookUrl && (
                  <a
                    href={facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center gap-2 text-white/80 hover:text-white transition-colors group"
                  >
                    <IOSIcon name="Facebook" size={20} />
                    <span className="font-fs-sans text-[9.5px] font-bold tracking-[0.22em] uppercase">
                      Facebook
                    </span>
                  </a>
                )}

                {youtubeUrl && (
                  <a
                    href={youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center gap-2 text-white/80 hover:text-white transition-colors group"
                  >
                    <IOSIcon name="YouTube" size={20} />
                    <span className="font-fs-sans text-[9.5px] font-bold tracking-[0.22em] uppercase">
                      YouTube
                    </span>
                  </a>
                )}

                {tiktokUrl && (
                  <a
                    href={tiktokUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center gap-2 text-white/80 hover:text-white transition-colors group"
                  >
                    <IOSIcon name="TikTok" size={20} />
                    <span className="font-fs-sans text-[9.5px] font-bold tracking-[0.22em] uppercase">
                      TikTok
                    </span>
                  </a>
                )}
              </nav>
            </>
          )}
        </div>
      </footer>

      {/* ===================== 5. STORY VIEWER FULL-SCREEN MODAL ===================== */}
      <AnimatePresence>
        {activeStory && activeStoryIndex !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-3 sm:p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="relative w-full max-w-[420px] h-[84vh] max-h-[700px] rounded-none overflow-hidden border border-white/25 shadow-2xl bg-black flex flex-col justify-between"
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
                  src={resolveMediaUrl(
                    activeStory.bannerImageUrl || activeStory.image,
                    '/media/guest/story-welcome-poster.webp'
                  )}
                  alt={activeStory.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/20 to-black/90 pointer-events-none" />

              {/* Top Progress Bars & Header */}
              <div className="relative z-20 p-4 sm:p-5 space-y-3.5">
                <div
                  className="grid gap-1"
                  style={{ gridTemplateColumns: `repeat(${Math.max(1, stories.length)}, minmax(0, 1fr))` }}
                >
                  {stories.map((st, idx) => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => setActiveStoryIndex(idx)}
                      className="h-[2px] overflow-hidden bg-white/30"
                    >
                      <div
                        className={`h-full transition-all duration-300 ${
                          idx <= activeStoryIndex ? 'w-full bg-white' : 'w-0'
                        }`}
                      />
                    </button>
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {displayLogo ? (
                      <img
                        src={displayLogo}
                        alt={displayHotelName}
                        onError={(e) => {
                          const fallback = resolveMediaUrl(hotel.logo);
                          if (!e.currentTarget.dataset.fbApplied && e.currentTarget.src !== fallback) {
                            e.currentTarget.dataset.fbApplied = '1';
                            e.currentTarget.src = fallback;
                          }
                        }}
                        className="w-9 h-9 object-cover border border-white/40"
                      />
                    ) : null}
                    <div className="text-left">
                      <span className="font-fs-sans text-[10.5px] font-bold tracking-[0.18em] uppercase text-white block">
                        {displayHotelName}
                      </span>
                      <span className="fs-eyebrow text-[14px] text-white/80 block">
                        {activeStory.title}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveStoryIndex(null)}
                    className="w-8 h-8 border border-white/30 hover:border-white text-white flex items-center justify-center transition-colors"
                  >
                    <IOSIcon name="Close" size={15} />
                  </button>
                </div>
              </div>

              {/* Left / Right Tap Zones */}
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
              <div className="relative z-20 p-6 sm:p-7 space-y-4">
                {activeStory.badge && (
                  <span className="inline-block px-3 py-1 bg-white text-black font-fs-sans text-[10px] font-bold tracking-[0.2em] uppercase">
                    {activeStory.badge}
                  </span>
                )}
                <h3 className="font-fs-sans font-extralight text-[24px] text-white tracking-[0.16em] uppercase leading-snug">
                  {activeStory.title}
                </h3>
                <p className="font-fs-serif text-[15.5px] text-white/90 leading-relaxed">
                  {activeStory.subtitle}
                </p>

                <button
                  type="button"
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
                  className="fs-btn-light-outline w-full bg-white !text-black hover:!bg-transparent hover:!text-white"
                >
                  {activeStory.ctaLabel}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ===================== 6. SECTION DETAIL MODAL (Fallback Hub Modals) ===================== */}
      <AnimatePresence>
        {activeSectionModal && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[var(--fs-backdrop)] backdrop-blur-[2px]"
              onClick={() => setActiveSectionModal(null)}
            />

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              className="relative z-10 w-full max-w-[520px] max-h-[86vh] overflow-y-auto rounded-none bg-[var(--fs-card)] border-t sm:border border-[var(--fs-border)] p-6 sm:p-8 text-[var(--fs-text)] shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between border-b border-[var(--fs-border)] pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 border border-[var(--fs-border-strong)] flex items-center justify-center text-[var(--fs-text)]">
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
                      size={20}
                    />
                  </div>
                  <h3 className="font-fs-sans font-extralight text-[18px] tracking-[0.16em] uppercase text-[var(--fs-text)]">
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
                  type="button"
                  onClick={() => setActiveSectionModal(null)}
                  className="w-8 h-8 border border-[var(--fs-border)] hover:border-[var(--fs-border-strong)] flex items-center justify-center text-[var(--fs-text-muted)] hover:text-[var(--fs-text)] transition-colors"
                >
                  <IOSIcon name="Close" size={15} />
                </button>
              </div>

              {/* MODAL CONTENT 1: HOTEL INFO */}
              {activeSectionModal === 'hotel-info' && (
                <div className="space-y-4">
                  <p className="font-fs-serif text-[15.5px] text-[var(--fs-text-muted)] leading-relaxed">
                    {displayHotelBio}
                  </p>

                  <div
                    onClick={() => {
                      setActiveSectionModal(null);
                      setIsWifiOpen(true);
                    }}
                    className="p-4 bg-[var(--fs-surface-subtle)] border border-[var(--fs-border)] flex items-center justify-between cursor-pointer hover:border-[var(--fs-border-strong)] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <IOSIcon name="Wifi" size={18} />
                      <div>
                        <span className="fs-kicker text-[var(--fs-text)] block">{t.wifiBanner.title}</span>
                        <span className="font-fs-serif text-[14px] text-[var(--fs-text-muted)] block mt-0.5">
                          {hotel.wifi.ssid} • Şifrə: {hotel.wifi.pass}
                        </span>
                      </div>
                    </div>
                    <span className="fs-btn-primary !min-h-[34px] !px-3 !py-1.5">
                      {t.wifiBanner.connectBtn}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3.5 bg-[var(--fs-surface-subtle)] border border-[var(--fs-border)]">
                      <span className="fs-kicker text-[var(--fs-text-muted)] block">Check-in</span>
                      <span className="font-fs-serif text-[18px] font-semibold text-[var(--fs-text)] mt-1 block">
                        14:00
                      </span>
                    </div>
                    <div className="p-3.5 bg-[var(--fs-surface-subtle)] border border-[var(--fs-border)]">
                      <span className="fs-kicker text-[var(--fs-text-muted)] block">Check-out</span>
                      <span className="font-fs-serif text-[18px] font-semibold text-[var(--fs-text)] mt-1 block">
                        12:00
                      </span>
                    </div>
                  </div>

                  <div className="divide-y divide-[var(--fs-border)] border border-[var(--fs-border)]">
                    {(hotelInfoLinks.length > 0 ? hotelInfoLinks : allLinksFlat).map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handleLinkClick(item)}
                        className="p-3.5 bg-[var(--fs-card)] hover:bg-[var(--fs-surface-subtle)] flex items-center justify-between cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <IOSIcon name={item.iconName} size={18} />
                          <span className="font-fs-serif text-[16px] text-[var(--fs-text)]">{item.title}</span>
                        </div>
                        <IOSIcon name="ChevronRight" size={14} className="text-[var(--fs-text-muted)]" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* MODAL CONTENT 2: FOOD & DRINK */}
              {activeSectionModal === 'food-drink' && (
                <div className="space-y-4">
                  <div className="divide-y divide-[var(--fs-border)] border border-[var(--fs-border)]">
                    {(foodAndDrinkLinks.length > 0 ? foodAndDrinkLinks : allLinksFlat).map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handleLinkClick(item)}
                        className="p-3.5 bg-[var(--fs-card)] hover:bg-[var(--fs-surface-subtle)] flex items-center justify-between cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <IOSIcon name={item.iconName} size={18} />
                          <div>
                            <span className="font-fs-serif text-[16px] text-[var(--fs-text)] block">{item.title}</span>
                            {item.subtitle && (
                              <span className="text-xs text-[var(--fs-text-muted)] block">{item.subtitle}</span>
                            )}
                          </div>
                        </div>
                        <IOSIcon name="ChevronRight" size={15} className="text-[var(--fs-text-muted)]" />
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveSectionModal(null);
                      setIsInquiryOpen(true);
                    }}
                    className="fs-btn-primary w-full"
                  >
                    <IOSIcon name="Bell" size={15} />
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

              {/* MODAL CONTENT 3: SPA & WELLNESS */}
              {activeSectionModal === 'spa-wellness' && (
                <div className="space-y-4">
                  <div className="p-4 bg-[var(--fs-surface-subtle)] border border-[var(--fs-border)]">
                    <span className="fs-kicker text-[var(--fs-text)] block mb-1">
                      Qonaqlar üçün Özəl −20% Endirim
                    </span>
                    <span className="font-fs-serif text-[15px] text-[var(--fs-text-muted)]">
                      Türk hamamı, sauna, qapalı hovuz və relaks masaj seansları hər gün 08:00 – 22:00.
                    </span>
                  </div>

                  <div className="divide-y divide-[var(--fs-border)] border border-[var(--fs-border)]">
                    {(spaAndWellnessLinks.length > 0 ? spaAndWellnessLinks : t.categories[1]?.items || []).map(
                      (item) => (
                        <div
                          key={item.id}
                          onClick={() => handleLinkClick(item)}
                          className="p-3.5 bg-[var(--fs-card)] hover:bg-[var(--fs-surface-subtle)] flex items-center justify-between cursor-pointer transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <IOSIcon name={item.iconName} size={18} />
                            <div>
                              <span className="font-fs-serif text-[16px] text-[var(--fs-text)] block">{item.title}</span>
                              {item.subtitle && (
                                <span className="text-xs text-[var(--fs-text-muted)] block">{item.subtitle}</span>
                              )}
                            </div>
                          </div>
                          <IOSIcon name="ChevronRight" size={15} className="text-[var(--fs-text-muted)]" />
                        </div>
                      )
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveSectionModal(null);
                      setIsInquiryOpen(true);
                    }}
                    className="fs-btn-primary w-full"
                  >
                    {selectedLang === 'az'
                      ? 'Spa & Masaj Rezervasiya Et'
                      : selectedLang === 'ru'
                      ? 'Забронировать СПА'
                      : 'Book Spa & Massage'}
                  </button>
                </div>
              )}

              {/* MODAL CONTENT 4: ENTERTAINMENT */}
              {activeSectionModal === 'entertainment' && (
                <div className="space-y-3">
                  {displayActivities.map((act) => (
                    <div
                      key={act.id}
                      className="p-4 bg-[var(--fs-surface-subtle)] border border-[var(--fs-border)] space-y-1.5"
                    >
                      <span className="fs-kicker text-[var(--fs-text-muted)] block">{act.category}</span>
                      <h4 className="font-fs-serif text-[18px] text-[var(--fs-text)]">{act.title}</h4>
                      <div className="flex items-center gap-4 text-xs text-[var(--fs-text-muted)] pt-1">
                        <span className="flex items-center gap-1.5">
                          <IOSIcon name="Clock" size={13} />
                          {act.time}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <IOSIcon name="MapPin" size={13} />
                          {act.location}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* MODAL CONTENT 5: CONTACT */}
              {activeSectionModal === 'contact' && (
                <div className="space-y-3">
                  <div className="divide-y divide-[var(--fs-border)] border border-[var(--fs-border)]">
                    <a
                      href={`tel:${displayPhone}`}
                      className="p-4 bg-[var(--fs-card)] hover:bg-[var(--fs-surface-subtle)] flex items-center justify-between transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <IOSIcon name="Phone" size={18} />
                        <div>
                          <span className="font-fs-serif text-[16px] text-[var(--fs-text)] block">
                            Resepşn ilə Zəng
                          </span>
                          <span className="text-xs text-[var(--fs-text-muted)] block">{displayPhone}</span>
                        </div>
                      </div>
                      <IOSIcon name="ChevronRight" size={15} className="text-[var(--fs-text-muted)]" />
                    </a>

                    <a
                      href={`https://wa.me/${displayWhatsapp}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-4 bg-[var(--fs-card)] hover:bg-[var(--fs-surface-subtle)] flex items-center justify-between transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <IOSIcon name="Whatsapp" size={18} />
                        <div>
                          <span className="font-fs-serif text-[16px] text-[var(--fs-text)] block">
                            WhatsApp Konsyerj
                          </span>
                          <span className="text-xs text-[var(--fs-text-muted)] block">24/7 Sürətli Yazışma</span>
                        </div>
                      </div>
                      <IOSIcon name="ChevronRight" size={15} className="text-[var(--fs-text-muted)]" />
                    </a>

                    {telegramUrl && (
                      <a
                        href={telegramUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-4 bg-[var(--fs-card)] hover:bg-[var(--fs-surface-subtle)] flex items-center justify-between transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <IOSIcon name="Telegram" size={18} />
                          <div>
                            <span className="font-fs-serif text-[16px] text-[var(--fs-text)] block">Telegram Bot</span>
                            <span className="text-xs text-[var(--fs-text-muted)] block">Avtomatik Sorğu & Dəstək</span>
                          </div>
                        </div>
                        <IOSIcon name="ChevronRight" size={15} className="text-[var(--fs-text-muted)]" />
                      </a>
                    )}

                    <a
                      href={publicService.getVCardUrl(hotelSlug)}
                      className="p-4 bg-[var(--fs-card)] hover:bg-[var(--fs-surface-subtle)] flex items-center justify-between transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <IOSIcon name="Book" size={18} />
                        <div>
                          <span className="font-fs-serif text-[16px] text-[var(--fs-text)] block">
                            Kontaktı Telefona Yaz (.vcf)
                          </span>
                          <span className="text-xs text-[var(--fs-text-muted)] block">
                            Otelin nömrə və ünvanını yadda saxla
                          </span>
                        </div>
                      </div>
                      <IOSIcon name="ChevronRight" size={15} className="text-[var(--fs-text-muted)]" />
                    </a>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveSectionModal(null);
                      setIsInquiryOpen(true);
                    }}
                    className="fs-btn-primary w-full"
                  >
                    Otaq Xidməti / Resepşna Sorğu Göndər
                  </button>
                </div>
              )}

              {/* MODAL CONTENT 6: DAILY OFFER */}
              {activeSectionModal === 'daily-offer' && (
                <div className="space-y-4">
                  <div className="border border-[var(--fs-border)] bg-[var(--fs-surface-subtle)]">
                    <img
                      src={resolveMediaUrl('/media/guest/chef-special.webp')}
                      alt="Günün təklifi"
                      className="w-full h-44 object-cover"
                    />
                    <div className="p-5 space-y-2">
                      <span className="fs-kicker text-[var(--fs-text-muted)] block">Şefin Özəl Seçimi</span>
                      <h4 className="font-fs-serif text-[20px] text-[var(--fs-text)]">
                        Ribeye Steyk & Qırmızı Şərab Seti
                      </h4>
                      <p className="font-fs-serif text-[15px] text-[var(--fs-text-muted)]">
                        Bu gün otağa və ya restoranda sifariş zamanı desert hədiyyə olunur.
                      </p>
                    </div>
                  </div>

                  <div className="p-4 bg-[var(--fs-surface-subtle)] border border-[var(--fs-border)] flex items-center justify-between gap-3">
                    <div>
                      <span className="font-fs-serif text-[17px] text-[var(--fs-text)] block">
                        Spa & Masaj Paketi (−20%)
                      </span>
                      <span className="text-xs text-[var(--fs-text-muted)]">
                        Saat 16:00-dək edilən rezervasiyalara özəl endirim
                      </span>
                    </div>
                    <span className="fs-kicker px-2.5 py-1 border border-[var(--fs-border-strong)]">−20%</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveSectionModal(null);
                      setIsInquiryOpen(true);
                    }}
                    className="fs-btn-primary w-full"
                  >
                    Təklifdən Yararlan / Sifariş Et
                  </button>
                </div>
              )}

              {/* MODAL CONTENT 7: REVIEWS */}
              {activeSectionModal === 'reviews' && (
                <div className="space-y-4">
                  <p className="font-fs-serif text-[15.5px] text-[var(--fs-text-muted)]">
                    Xidmətimizdən məmnunsunuzsa, rəsmi platformalarda bizi qiymətləndirməyinizdən məmnun olarıq:
                  </p>

                  <div className="divide-y divide-[var(--fs-border)] border border-[var(--fs-border)]">
                    <a
                      href={googleReviewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-4 bg-[var(--fs-card)] hover:bg-[var(--fs-surface-subtle)] flex items-center justify-between transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <IOSIcon name="GoogleMaps" size={18} />
                        <div>
                          <span className="font-fs-serif text-[16px] text-[var(--fs-text)] block">
                            Google Maps & Reviews
                          </span>
                          <span className="text-xs text-[var(--fs-text-muted)] block">★★★★★ 5 ulduzla qiymətləndirin</span>
                        </div>
                      </div>
                      <IOSIcon name="ChevronRight" size={15} className="text-[var(--fs-text-muted)]" />
                    </a>

                    {tripAdvisorUrl && (
                      <a
                        href={tripAdvisorUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-4 bg-[var(--fs-card)] hover:bg-[var(--fs-surface-subtle)] flex items-center justify-between transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <IOSIcon name="TripAdvisor" size={18} />
                          <div>
                            <span className="font-fs-serif text-[16px] text-[var(--fs-text)] block">TripAdvisor</span>
                            <span className="text-xs text-[var(--fs-text-muted)] block">
                              Səyahət təəssüratınızı bölüşün
                            </span>
                          </div>
                        </div>
                        <IOSIcon name="ChevronRight" size={15} className="text-[var(--fs-text-muted)]" />
                      </a>
                    )}

                    {bookingUrl && (
                      <a
                        href={bookingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-4 bg-[var(--fs-card)] hover:bg-[var(--fs-surface-subtle)] flex items-center justify-between transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <IOSIcon name="Booking" size={18} />
                          <div>
                            <span className="font-fs-serif text-[16px] text-[var(--fs-text)] block">Booking.com</span>
                            <span className="text-xs text-[var(--fs-text-muted)] block">Qonaqlama rəyi yazın</span>
                          </div>
                        </div>
                        <IOSIcon name="ChevronRight" size={15} className="text-[var(--fs-text-muted)]" />
                      </a>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveSectionModal(null);
                      setIsInquiryOpen(true);
                    }}
                    className="fs-btn-outline w-full"
                  >
                    Birbaşa Otel Rəhbərliyinə Təklif / Şikayət Yaz
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Inquiry Bottom Sheet / Modal */}
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

      {/* QR Share Modal */}
      <AnimatePresence>
        {isQrShareOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-[var(--fs-backdrop)] backdrop-blur-[2px]"
              onClick={() => setIsQrShareOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              className="relative w-full max-w-[420px] rounded-none bg-[var(--fs-card)] border border-[var(--fs-border)] p-7 sm:p-8 shadow-2xl z-10 text-center text-[var(--fs-text)] space-y-5"
            >
              <div className="flex items-center justify-between border-b border-[var(--fs-border)] pb-4">
                <h3 className="font-fs-sans font-extralight text-[16px] tracking-[0.18em] uppercase text-[var(--fs-text)] truncate pr-4">
                  {displayHotelName} — QR
                </h3>
                <button
                  type="button"
                  onClick={() => setIsQrShareOpen(false)}
                  className="w-8 h-8 border border-[var(--fs-border)] hover:border-[var(--fs-border-strong)] flex items-center justify-center text-[var(--fs-text-muted)] hover:text-[var(--fs-text)] transition-colors shrink-0"
                >
                  <IOSIcon name="Close" size={15} />
                </button>
              </div>

              <p className="font-fs-serif text-[15px] text-[var(--fs-text-muted)] leading-relaxed">
                {selectedLang === 'az'
                  ? 'Otaqdakı digər qonaqlar bu QR kodu öz telefon kamerası ilə oxudaraq menyunu aça bilərlər.'
                  : selectedLang === 'ru'
                  ? 'Другие гости могут отсканировать этот QR-код камерой телефона.'
                  : 'Other guests in your room can scan this QR code to open the digital concierge.'}
              </p>

              <div className="bg-white p-5 inline-block border border-[#D8D8D8]">
                {guestQrSvg ? (
                  <div
                    className="w-52 h-52 flex items-center justify-center mx-auto [&>svg]:w-full [&>svg]:h-full"
                    dangerouslySetInnerHTML={{ __html: guestQrSvg }}
                  />
                ) : (
                  <img
                    src={publicService.getQrSvgUrl(hotelSlug)}
                    alt="Hotel QR Code"
                    className="w-52 h-52 object-contain mx-auto"
                  />
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({ title: displayHotelName, url: window.location.href });
                    } else {
                      navigator.clipboard.writeText(window.location.href);
                    }
                  }}
                  className="fs-btn-primary w-full"
                >
                  <IOSIcon name="Share" size={13} />
                  <span>{selectedLang === 'az' ? 'Paylaş' : selectedLang === 'ru' ? 'Поделиться' : 'Share'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsQrShareOpen(false)}
                  className="fs-btn-outline w-full"
                >
                  {t.serviceModal.closeBtn}
                </button>
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
              className="absolute inset-0 bg-[var(--fs-backdrop)] backdrop-blur-[2px]"
              onClick={() => setSelectedService(null)}
            />
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              className="relative w-full max-w-[420px] rounded-none bg-[var(--fs-card)] border border-[var(--fs-border)] p-7 sm:p-8 shadow-2xl z-10 text-center text-[var(--fs-text)] space-y-4"
            >
              <div className="mx-auto w-12 h-12 border border-[var(--fs-border-strong)] text-[var(--fs-text)] flex items-center justify-center">
                <IOSIcon name={selectedService.iconName} size={22} />
              </div>
              <h3 className="font-fs-sans font-extralight text-[20px] tracking-[0.16em] uppercase text-[var(--fs-text)]">
                {selectedService.title}
              </h3>
              {selectedService.subtitle && (
                <p className="font-fs-serif text-[15px] text-[var(--fs-text-muted)] leading-relaxed">
                  {selectedService.subtitle}
                </p>
              )}

              <div className="pt-3 space-y-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedService(null);
                    setIsInquiryOpen(true);
                  }}
                  className="fs-btn-primary w-full"
                >
                  {t.serviceModal.orderBtn}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedService(null)}
                  className="fs-btn-outline w-full"
                >
                  {t.serviceModal.closeBtn}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
