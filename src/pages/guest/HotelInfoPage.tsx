import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { defaultHotelData } from './guestData';
import { translations, Language } from '../../utils/translations';
import { publicService, PublicHotelProfile } from '../../services/api/publicService';
import { resolveBackendMediaUrl } from '../../services/api/hotelAdminService';
import { useHub, useHotelPortal } from '../../hooks/useHotelData';
import { resolveMediaUrl } from '../../utils/media';
import { useGuestDocumentMeta } from '../../utils/documentHead';
import { useLanguage } from '../../context/LanguageContext';
import { tr, SupportedLang } from '../../utils/i18n';
import { GuestLangPill } from './components/GuestLangPill';
import { HubType } from '../../types/api';
import { InquirySheet } from './components/InquirySheet';
import { WifiModal } from './components/WifiModal';

interface InfoItemDetail {
  id: string;
  titleAz: string;
  titleEn: string;
  titleRu: string;
  iconSvg: React.ReactNode;
  contentAz: string;
  contentEn: string;
  contentRu: string;
  isTel?: boolean;
}

export const HotelInfoPage: React.FC = () => {
  const { slug, code } = useParams<{ slug?: string; code?: string }>();
  const hotelSlug = slug || 'altensor';
  const isDemoHotel = hotelSlug === 'altensor' || hotelSlug === 'skyhill' || hotelSlug === 'hotel-resort';
  const navigate = useNavigate();

  const { currentLang } = useLanguage();
  const selectedLang = (currentLang as Language) || 'az';
  const [liveHotel, setLiveHotel] = useState<PublicHotelProfile | null>(null);
  const [activeItem, setActiveItem] = useState<InfoItemDetail | null>(null);
  const [isWifiOpen, setIsWifiOpen] = useState(false);
  const [isInquiryOpen, setIsInquiryOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    const saved = localStorage.getItem('fs_guest_dark');
    document.documentElement.classList.toggle('fs-dark', saved === '1');
  }, []);

  const isHubRoute = window.location.pathname.includes('/g/');

  const { data: portalData } = useHotelPortal(hotelSlug);
  const matchingInfoHub = portalData?.hubs?.find((h) => h.hubType === HubType.HotelInfo);
  const hubCodeOrId = isHubRoute
    ? code || matchingInfoHub?.code || matchingInfoHub?.externalId || '191'
    : matchingInfoHub?.code || matchingInfoHub?.externalId || '191';

  // Dynamic Live Hub (Hotel Info)
  const { data: hubData } = useHub(hotelSlug, hubCodeOrId);

  const hotel = defaultHotelData;
  const t = translations[selectedLang];

  useEffect(() => {
    publicService
      .getHotelBySlug(hotelSlug, selectedLang)
      .then((data) => {
        setLiveHotel(data);
      })
      .catch((err) => {
        console.warn('Hotel fetch error in HotelInfoPage:', err);
      });
  }, [hotelSlug, selectedLang]);

  const displayHotelName =
    tr(hubData?.titleTr, hubData?.title || '', selectedLang as SupportedLang) ||
    liveHotel?.name ||
    (isDemoHotel ? t.hotelName : 'Otel');
  const displayHotelBio =
    tr(hubData?.subtitleTr, hubData?.subtitle || '', selectedLang as SupportedLang) ||
    tr(liveHotel?.bioTr, liveHotel?.bio || '', selectedLang as SupportedLang) ||
    (isDemoHotel ? t.hotelDescription : '');
  const displayCoverImage = resolveMediaUrl(
    hubData?.coverImageUrl,
    liveHotel?.coverImageUrl ? resolveBackendMediaUrl(liveHotel.coverImageUrl) : '/media/guest/hero.webp'
  );
  const displayPhone = liveHotel?.phone || (isDemoHotel ? hotel.phone : '');
  const displayWhatsapp = (liveHotel?.whatsApp || (isDemoHotel ? hotel.whatsapp : '')).replace(/[^0-9]/g, '');

  const homePath = slug ? `/hotel/${slug}` : '/';

  const infoTabLabel =
    selectedLang === 'az' ? 'Otel məlumatı' : selectedLang === 'ru' ? 'Информация об отеле' : 'Hotel Information';
  useGuestDocumentMeta(
    `${infoTabLabel} | ${displayHotelName}`,
    liveHotel?.logoUrl || portalData?.logoUrl || (isDemoHotel ? hotel.logo : undefined)
  );

  const infoItems: InfoItemDetail[] = [
    {
      id: 'welcome',
      titleAz: `${displayHotelName}-a xoş gəlmisiniz`,
      titleEn: `Welcome to ${displayHotelName}`,
      titleRu: `Добро пожаловать в ${displayHotelName}`,
      iconSvg: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z" />
          <path d="M20 2v4" />
          <path d="M22 4h-4" />
          <circle cx="4" cy="20" r="2" />
        </svg>
      ),
      contentAz: `Təbiətin və müasir lüksün qovuşduğu ${displayHotelName}-a xoş gəlmisiniz!\n\nBiz hər bir qonağımıza fərdi yanaşma, unudulmaz istirahət və 24 saatlıq peşəkar konsyerj xidməti təqdim edirik. Bu rəqəmsal portaldan istifadə edərək otelin bütün xidmətlərini, menyularını və tədbirlərini rahatlıqla kəşf edə bilərsiniz.\n\nİstənilən sualınız və ya sifarişiniz olarsa, resepşn xidmətimiz həmişə yanınızdadır.`,
      contentEn: `Welcome to ${displayHotelName}, where luxury meets world-class hospitality.\n\nWe provide personalized attention, memorable stays, and 24-hour concierge services. Use this portal to explore all hotel amenities, dining menus, and daily activities.\n\nOur reception team is always at your service.`,
      contentRu: `Добро пожаловать в ${displayHotelName} — идеальное место для комфортного и роскошного отдыха.\n\nМы предлагаем индивидуальный подход к каждому гостю, первоклассный сервис и круглосуточную поддержку консьержа.`,
    },
    {
      id: 'about',
      titleAz: `${displayHotelName} 5★ haqqında`,
      titleEn: `About ${displayHotelName} 5★`,
      titleRu: `Об отеле ${displayHotelName} 5★`,
      iconSvg: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M10 22v-6.57" />
          <path d="M12 11h.01" />
          <path d="M12 7h.01" />
          <path d="M14 15.43V22" />
          <path d="M15 16a5 5 0 0 0-6 0" />
          <path d="M16 11h.01" />
          <path d="M16 7h.01" />
          <path d="M8 11h.01" />
          <path d="M8 7h.01" />
          <rect x="4" y="2" width="16" height="20" rx="2" />
        </svg>
      ),
      contentAz: `${displayHotelBio}\n\n• Ulduz kateqoriyası: 5 Ulduzlu Lüks Resort\n• Check-in (Giriş saatı): 14:00-dan etibarən\n• Check-out (Çıxış saatı): 12:00-dək\n• Resepşn və Mühafizə: 24/7 fasiləsiz\n• Otaq servisi: 24 saat fəaliyyət göstərir\n• Pulsuz yüksəksürətli Wi-Fi bütün ərazidə`,
      contentEn: `${displayHotelBio}\n\n• Category: 5-Star Luxury Resort\n• Check-in: from 14:00\n• Check-out: until 12:00\n• Reception & Security: 24/7\n• Room Service: 24 Hours\n• High-speed Wi-Fi throughout the property`,
      contentRu: `${displayHotelBio}\n\n• Категория: 5-звездочный курортный отель\n• Заезд (Check-in): с 14:00\n• Выезд (Check-out): до 12:00\n• Стойка регистрации: 24/7\n• Обслуживание номеров: круглосуточно`,
    },
    {
      id: 'rooms',
      titleAz: 'Otaqlar və suitlər',
      titleEn: 'Rooms & Suites',
      titleRu: 'Номера и люксы',
      iconSvg: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M2 20v-8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8" />
          <path d="M4 10V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4" />
          <path d="M12 4v6" />
          <path d="M2 18h20" />
        </svg>
      ),
      contentAz: `Otelin otaq fondu müasir interyer və premium rahatlıq standartlarına uyğun dizayn edilmişdir:\n\n1. Deluxe King / Twin Room — Dağ və park mənzərəsi, geniş eyvan, 38 m²\n2. Junior Suite — Ayrı istirahət zonası, xüsusi qəhvə maşını, 55 m²\n3. Executive Suite — Panoramik dəniz/təbiət görüntüsü, cakuzi, 75 m²\n4. Presidential Villa — Fərdi hovuz, terras, 3 yataq otağı və konsyerj xidməti, 180 m²\n\nBütün otaqlarda: Ağıllı iqlim nəzarəti, ortopedik çarpayılar, mini-bar, seyf və premium vanna ləvazimatları.`,
      contentEn: `Discover our luxury accommodation collection:\n\n1. Deluxe King / Twin Room — 38 m² with mountain/park views\n2. Junior Suite — 55 m² with seating lounge and espresso machine\n3. Executive Suite — 75 m² with panoramic views and jacuzzi\n4. Presidential Villa — 180 m² with private pool and dedicated butler`,
      contentRu: `Наш номерной фонд:\n\n1. Номера Deluxe (38 м²)\n2. Люксы Junior Suite (55 м²)\n3. Представительские люксы Executive Suite (75 м²)\n4. Президентская вилла с собственным бассейном (180 м²)`,
    },
    {
      id: 'facilities',
      titleAz: 'Otel imkanları',
      titleEn: 'Hotel Facilities',
      titleRu: 'Удобства отеля',
      iconSvg: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M10.268 21a2 2 0 0 0 3.464 0" />
          <path d="M22 8c0-2.3-.8-4.3-2-6" />
          <path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326" />
          <path d="M4 2C2.8 3.7 2 5.7 2 8" />
        </svg>
      ),
      contentAz: `Qonaqlarımızın ixtiyarında olan əsas obyektlər:\n\n• Qapalı və Açıq İstilikli Hovuzlar (07:00 – 22:00)\n• MARAL Spa, Türk Hamamı, Fin Saunası və Masaj Otaqları\n• Müasir Technogym Avadanlıqlı Fitness Zalı (24/7)\n• Əsas Restoran & Panorama Lounge & Cocktail Bar\n• Kids Club və Peşəkar Uşaq Animatorları\n• Konfrans və Tədbir Zalları\n• VIP Valet və Təhlükəsiz Qapalı Parkinq`,
      contentEn: `Facilities available for our guests:\n\n• Indoor & Outdoor Heated Pools\n• Luxury Spa, Turkish Hammam & Saunas\n• 24/7 Fitness Center with Technogym Equipment\n• Fine Dining Restaurants & Panorama Cocktail Bar\n• Kids Club & Family Entertainment\n• Conference & Event Spaces`,
      contentRu: `Инфраструктура отеля:\n\n• Крытый и открытый подогреваемые бассейны\n• СПА-комплекс, хаммам и сауна\n• Круглосуточный фитнес-центр\n• Рестораны авторской кухни и панорамный бар\n• Детский клуб с аниматорами`,
    },
    {
      id: 'directory',
      titleAz: 'Qonaq bələdçisi A–Z',
      titleEn: 'Guest Directory A–Z',
      titleRu: 'Справочник гостя A–Я',
      iconSvg: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 5v16" />
          <path d="M20.001 19A2 2 0 0022 17V5a2 2 0 00-1.999-2L16 3.002A5 5 0 0012 5a5 5 0 00-4-2H4a2 2 0 00-2 2v12a2 2 0 001.999 2H8a5 5 0 014 2 5 5 0 014-2z" />
        </svg>
      ),
      contentAz: `A — Avtomobil icarəsi & Transfer xidməti (Resepşna müraciət edin)\nB — Baqaj saxlama otağı (24/7 ödənişsiz)\nÇ — Çamaşırxana və Quru təmizləmə (Otaqdan təhvil götürülür)\nD — Dərman və tibbi yardım (24 saat ilkin tibbi kömək)\nE — Elektromobil şarj stansiyası (Parkinq zonasında)\nH — Hovuz dəsmalları (Hovuz kənarında təqdim olunur)\nO — Otaq təmizliyi (Gündəlik 09:00 – 17:00)\nS — Səhər yeməyi (07:30 – 11:00 Əsas restoranda)\nW — Wi-Fi internet (${hotel.wifi.ssid})`,
      contentEn: `A — Airport Transfer & Car Rental\nB — Baggage Storage (24/7 free of charge)\nC — Cleaning & Laundry Services\nE — EV Charging Stations\nP — Pool Towels at pool reception\nB — Breakfast: 07:30 – 11:00 at the Main Restaurant\nW — Wi-Fi network: ${hotel.wifi.ssid}`,
      contentRu: `Справочник услуг от А до Я:\n\n• Трансфер в аэропорт и аренда авто\n• Камера хранения багажа (бесплатно)\n• Прачечная и химчистка\n• Завтрак: 07:30 – 11:00 в Главном ресторане\n• Сеть Wi-Fi: ${hotel.wifi.ssid}`,
    },
    {
      id: 'policies',
      titleAz: 'Otel qaydaları',
      titleEn: 'Hotel Policies',
      titleRu: 'Правила отеля',
      iconSvg: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z" />
          <path d="M14 2v5a1 1 0 0 0 1 1h5" />
          <path d="M10 9H8" />
          <path d="M16 13H8" />
          <path d="M16 17H8" />
        </svg>
      ),
      contentAz: `Bütün qonaqlarımızın dinc və təhlükəsiz istirahəti üçün daxili qaydalar:\n\n1. Sakitlik saatları: 23:00 – 08:00 arası otaqlarda və dəhlizlərdə yüksək səs qadağandır.\n2. Siqaret çəkmə: Otaqların daxilində siqaret çəkmək qəti qadağandır (yalnız açıq eyvanlarda icazə verilir).\n3. Giriş & Çıxış: Vaxtından əvvəl giriş və ya gec çıxış resepşnla razılaşdırılmalıdır.\n4. Qonaq qəbulu: Qonaqların otaqlara dəvəti resepşnda qeydiyyat əsasında mümkündür.`,
      contentEn: `Hotel Rules & Policies:\n\n1. Quiet hours: 23:00 – 08:00\n2. Non-smoking policy: Smoking inside rooms is strictly prohibited.\n3. Check-in from 14:00, Check-out until 12:00.\n4. Outside visitors must be registered at the reception desk.`,
      contentRu: `Правила проживания:\n\n1. Часы тишины: с 23:00 до 08:00\n2. Курение в номерах строго запрещено\n3. Время заезда — 14:00, выезда — 12:00\n4. Гости, не проживающие в отеле, должны зарегистрироваться на ресепшн.`,
    },
    {
      id: 'location',
      titleAz: 'Ünvan və istiqamət',
      titleEn: 'Location & Directions',
      titleRu: 'Адрес и как добраться',
      iconSvg: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
          <circle cx="12" cy="10" r="3" />
        </svg>
      ),
      contentAz: `Otelin Dəqiq Ünvanı:\n${liveHotel?.address || hotel.address}\n\n• Lənkəran Beynəlxalq Hava Limanından məsafə: 15 dəqiqə\n• Şəhər mərkəzindən məsafə: 5 dəqiqə\n• Xəzər dənizi sahilinə: 10 dəqiqə\n• 24 saat VIP qarşılama və hava limanı transfer xidməti mövcuddur.\n\nİstiqamət və dəqiq GPS naviqasiyası üçün Google Maps xəritəsindən istifadə edin.`,
      contentEn: `Hotel Address:\n${liveHotel?.address || hotel.address}\n\n• Distance from Lankaran Airport: 15 minutes\n• Distance from City Center: 5 minutes\n• Caspian Sea Coast: 10 minutes\n• 24/7 VIP airport transfer available upon request.`,
      contentRu: `Точный адрес отеля:\n${liveHotel?.address || hotel.address}\n\n• 15 минут от Международного Аэропорта Ленкорани\n• 5 минут от центра города\n• 10 минут до побережья Каспийского моря\n• Круглосуточный трансфер доступен по запросу.`,
    },
    {
      id: 'contact',
      titleAz: 'Bizimlə əlaqə',
      titleEn: 'Contact Us',
      titleRu: 'Связаться с нами',
      isTel: true,
      iconSvg: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384" />
        </svg>
      ),
      contentAz: `Bizimlə 24 saat əlaqə saxlaya bilərsiniz:\n\n• Qəbul şöbəsi (Resepşn): ${displayPhone}\n• Daxili nömrə: 0 (otaq telefonundan)\n• WhatsApp Dəstək: +${displayWhatsapp}\n• E-poçt: ${liveHotel?.email || 'info@altensor.az'}`,
      contentEn: `Contact us 24/7:\n\n• Front Desk: ${displayPhone}\n• Room Phone: Dial 0\n• WhatsApp: +${displayWhatsapp}\n• Email: ${liveHotel?.email || 'info@altensor.az'}`,
      contentRu: `Свяжитесь с нами 24/7:\n\n• Ресепшн: ${displayPhone}\n• С номера отеля: наберите 0\n• WhatsApp: +${displayWhatsapp}`,
    },
    {
      id: 'offers',
      titleAz: 'Xüsusi təkliflər',
      titleEn: 'Special Offers',
      titleRu: 'Специальные предложения',
      iconSvg: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />
        </svg>
      ),
      contentAz: `Cari mövsümün qonaqlarımıza özəl endirim və təklifləri:\n\n1. MARAL Spa & Masaj Paketlərinə 20% Endirim (11:00 – 16:00 arası seanslar üçün)\n2. Restoran Şam Yeməyi: 2 nəfərlik şef menyusu sifarişində desert hədiyyə\n3. Gec Çıxış (Late Check-out): Boş yer olduqda saat 15:00-dək ödənişsiz çıxış imkanı\n4. Həftəsonu Canlı Caz Proqramı: Panorama Lounge Bar-da qonaqlar üçün pulsuz giriş`,
      contentEn: `Current Special Promotions for Hotel Guests:\n\n1. 20% Off All Spa Treatments between 11:00 – 16:00\n2. Complimentary Dessert with fine dining dinner sets\n3. Complimentary Late Check-out up to 15:00 (subject to availability)\n4. Free Admission to Weekend Live Jazz Nights`,
      contentRu: `Специальные предложения:\n\n1. Скидка 20% на СПА-процедуры с 11:00 до 16:00\n2. Десерт в подарок при заказе ужина от шеф-повара\n3. Поздний выезд до 15:00 при наличии свободных номеров`,
    },
  ];

  const handleRowClick = (item: InfoItemDetail) => {
    if (item.isTel) {
      window.location.href = `tel:${displayPhone}`;
      return;
    }
    setActiveItem(item);
  };

  return (
    <div className="fs-portal min-h-screen flex flex-col selection:bg-black selection:text-white pb-16">
      {/* ===================== 1. FULL-BLEED ARCHITECTURAL HERO ===================== */}
      <header className="relative w-full h-[240px] sm:h-[320px] lg:h-[380px] overflow-hidden bg-[#0F0F0F] flex-none">
        <img
          src={displayCoverImage}
          alt={displayHotelName}
          onError={(e) => {
            const fallback = resolveMediaUrl('/media/guest/tile-hotel.webp');
            if (!e.currentTarget.dataset.fbApplied && e.currentTarget.src !== fallback) {
              e.currentTarget.dataset.fbApplied = '1';
              e.currentTarget.src = fallback;
            }
          }}
          className="absolute inset-0 w-full h-full object-cover"
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
            aria-label="Geri"
            onClick={() => navigate(homePath)}
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
              aria-label="Əsas səhifə"
              onClick={() => navigate(homePath)}
              className="w-10 h-10 bg-black/40 border border-white/35 backdrop-blur-sm text-white flex items-center justify-center hover:bg-white hover:text-black transition-colors"
            >
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </button>
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-0 z-20 max-w-[1140px] mx-auto px-4 sm:px-8 pb-6 sm:pb-9">
          <p className="fs-eyebrow text-[16px] sm:text-[18px] text-white/85 mb-1">
            {displayHotelName}
          </p>
          <h1 className="font-fs-sans font-extralight text-[26px] sm:text-[34px] lg:text-[40px] leading-[1.2] tracking-[0.18em] uppercase text-white">
            {selectedLang === 'az'
              ? 'Otel məlumatı'
              : selectedLang === 'ru'
              ? 'Информация об отеле'
              : 'Hotel Information'}
          </h1>
        </div>
      </header>

      {/* ===================== 2. PROPERTY DIRECTORY GRID ===================== */}
      <main className="flex-1 w-full max-w-[1140px] mx-auto px-4 sm:px-8 py-8 sm:py-14 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-[var(--fs-border)] border border-[var(--fs-border)]">
          {infoItems.map((item) => {
            const title =
              selectedLang === 'az'
                ? item.titleAz
                : selectedLang === 'ru'
                ? item.titleRu
                : item.titleEn;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleRowClick(item)}
                className="w-full min-h-[72px] py-5 px-5 sm:px-7 bg-[var(--fs-card)] hover:bg-[var(--fs-surface-subtle)] flex items-center justify-between text-left text-[var(--fs-text)] transition-colors group focus:outline-none"
              >
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <span className="flex-none text-[var(--fs-text)] flex items-center justify-center">
                    {item.iconSvg}
                  </span>
                  <span className="font-fs-serif text-[19px] sm:text-[20px] leading-snug text-[var(--fs-text)] truncate">
                    {title}
                  </span>
                </div>

                <span className="flex-none text-[var(--fs-text-muted)] group-hover:text-[var(--fs-text)] group-hover:translate-x-1 transition-all ml-3">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </span>
              </button>
            );
          })}
        </div>

        {/* Complimentary Wi-Fi Strip */}
        <div className="p-6 sm:p-8 bg-[var(--fs-surface-subtle)] border border-[var(--fs-border)] flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="space-y-1">
            <span className="fs-kicker text-[var(--fs-text-muted)] block">Connectivity</span>
            <h3 className="font-fs-serif text-[21px] text-[var(--fs-text)]">{t.wifiBanner.title}</h3>
            <p className="font-fs-serif text-[15px] text-[var(--fs-text-muted)]">
              {hotel.wifi.ssid} • Şifrə: {hotel.wifi.pass}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsWifiOpen(true)}
            className="fs-btn-primary shrink-0"
          >
            {t.wifiBanner.connectBtn}
          </button>
        </div>
      </main>

      {/* ===================== 3. DETAIL MODAL ===================== */}
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
              className="relative z-10 w-full max-w-[540px] max-h-[88vh] overflow-y-auto rounded-none bg-[var(--fs-card)] border-t sm:border border-[var(--fs-border)] p-6 sm:p-9 text-[var(--fs-text)] shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between border-b border-[var(--fs-border)] pb-4">
                <div className="flex items-center gap-3 min-w-0 pr-3">
                  <span className="w-9 h-9 border border-[var(--fs-border-strong)] text-[var(--fs-text)] flex items-center justify-center shrink-0">
                    {activeItem.iconSvg}
                  </span>
                  <h3 className="font-fs-sans font-extralight text-[18px] sm:text-[20px] tracking-[0.15em] uppercase text-[var(--fs-text)] truncate">
                    {selectedLang === 'az'
                      ? activeItem.titleAz
                      : selectedLang === 'ru'
                      ? activeItem.titleRu
                      : activeItem.titleEn}
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

              <p className="font-fs-serif text-[16px] sm:text-[17px] text-[var(--fs-text-body)] leading-[1.7] whitespace-pre-line">
                {selectedLang === 'az'
                  ? activeItem.contentAz
                  : selectedLang === 'ru'
                  ? activeItem.contentRu
                  : activeItem.contentEn}
              </p>

              {activeItem.id === 'location' && (
                <div className="pt-2">
                  <a
                    href={liveHotel?.mapUrl || 'https://maps.google.com/?q=Baku'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="fs-btn-primary w-full"
                  >
                    Google Maps-də Naviqasiya Aç
                  </a>
                </div>
              )}

              {(activeItem.id === 'welcome' || activeItem.id === 'about' || activeItem.id === 'contact') && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-[var(--fs-border)]">
                  <a href={`tel:${displayPhone}`} className="fs-btn-primary w-full">
                    Resepşna Zəng
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveItem(null);
                      setIsInquiryOpen(true);
                    }}
                    className="fs-btn-outline w-full"
                  >
                    Xidmət İstəyi
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <WifiModal
        isOpen={isWifiOpen}
        onClose={() => setIsWifiOpen(false)}
        ssid={hotel.wifi.ssid}
        pass={hotel.wifi.pass}
        t={t.wifiModal}
      />

      <InquirySheet
        isOpen={isInquiryOpen}
        onClose={() => setIsInquiryOpen(false)}
        t={t.inquiry}
        slug={hotelSlug}
      />
    </div>
  );
};
