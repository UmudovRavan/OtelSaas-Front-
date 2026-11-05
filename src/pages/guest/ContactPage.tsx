import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { defaultHotelData } from './guestData';
import { translations, Language } from '../../utils/translations';
import { publicService, PublicHotelProfile } from '../../services/api/publicService';
import { InquirySheet } from './components/InquirySheet';
import { useHub, useHotelPortal } from '../../hooks/useHotelData';
import { resolveMediaUrl } from '../../utils/media';
import { HubType } from '../../types/api';

export const ContactPage: React.FC = () => {
  const { slug, code } = useParams<{ slug?: string; code?: string }>();
  const hotelSlug = slug || 'skyhill';
  const navigate = useNavigate();
  const location = useLocation();

  const [selectedLang] = useState<Language>('az');
  const [liveHotel, setLiveHotel] = useState<PublicHotelProfile | null>(null);

  const isHubRoute = location.pathname.includes('/g/');

  // Lookup portal to find dynamic contacts hub code
  const { data: portalData } = useHotelPortal(hotelSlug);
  const matchingContactHub = portalData?.hubs?.find((h) => h.hubType === HubType.Contacts);
  const hubCodeOrId = isHubRoute
    ? (code || matchingContactHub?.code || matchingContactHub?.externalId || '195')
    : (matchingContactHub?.code || matchingContactHub?.externalId || '195');

  // Dynamic Live Hub (Contacts & Department directory)
  const { data: hubData } = useHub(hotelSlug, hubCodeOrId);

  const hubTitle = hubData?.title || hubData?.titleTr?.az || (selectedLang === 'az' ? 'Əlaqə' : 'Contact');
  const hubSubtitle = hubData?.subtitle || hubData?.subtitleTr?.az || (selectedLang === 'az' ? 'Qəbul, şöbələr və birbaşa əlaqə' : 'Reception, departments and direct contacts');
  const hubCover = resolveMediaUrl(hubData?.coverImageUrl, '/media/guest/tile-contacts.webp');

  // Department modal state (for /p/43229 or clicking item 5)
  const [isDepartmentModalOpen, setIsDepartmentModalOpen] = useState<boolean>(() => {
    return code === '43229' || location.pathname.includes('/43229');
  });

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
        console.warn('Hotel fetch error in ContactPage:', err);
      });
  }, [hotelSlug, selectedLang]);

  useEffect(() => {
    if (code === '43229' || location.pathname.includes('/43229')) {
      setIsDepartmentModalOpen(true);
    }
  }, [code, location.pathname]);

  const homePath = slug ? `/hotel/${slug}` : '/';

  // Dynamic Hotel Info with Reference Fallback
  const displayPhone = liveHotel?.phone || (hotelSlug === 'skyhill' ? '+994 12 555 1234' : '');
  const rawPhone = displayPhone.replace(/[^0-9+]/g, '');
  const displayWhatsapp = (liveHotel?.whatsApp || (hotelSlug === 'skyhill' ? '+994 50 555 1234' : '')).replace(/[^0-9]/g, '');
  const displayEmail = liveHotel?.email || (hotelSlug === 'skyhill' ? 'info@skyhill.az' : '');
  const displayAddress = liveHotel?.address || (hotelSlug === 'skyhill' ? 'Pirqulu, Azərbaycan' : '');
  const displayMapUrl =
    liveHotel?.mapUrl ||
    (hotelSlug === 'skyhill' ? 'https://www.google.com/maps/search/?api=1&query=Pirqulu%2C+%C5%9Eamax%C4%B1' : '');

  // Exact Contact Items matching real data
  const contactItems: Array<{
    id: string;
    title: string;
    titleEn: string;
    titleRu: string;
    subtitle: string;
    href: string;
    isExternal: boolean;
    iconColorClass?: string;
    iconSvg: React.ReactNode;
    onClick?: () => void;
  }> = [];

  if (displayPhone) {
    contactItems.push({
      id: 'phone',
      title: 'Zəng edin',
      titleEn: 'Call Us',
      titleRu: 'Позвоните нам',
      subtitle: displayPhone,
      href: `tel:${rawPhone}`,
      isExternal: true,
      iconSvg: (
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384" />
        </svg>
      ),
    });
  }

  if (displayWhatsapp) {
    contactItems.push({
      id: 'whatsapp',
      title: 'WhatsApp',
      titleEn: 'WhatsApp',
      titleRu: 'WhatsApp',
      subtitle: `+${displayWhatsapp}`,
      href: `https://wa.me/${displayWhatsapp}?text=${encodeURIComponent(
        'Salam, otel xidmətləri və ya rezervasiya ilə bağlı müraciət etmək istəyirəm.'
      )}`,
      isExternal: true,
      iconColorClass: 'text-[#25D366]',
      iconSvg: (
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719" />
          <path d="M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384" transform="translate(7.4 7.4) scale(0.4)" vectorEffect="non-scaling-stroke" />
        </svg>
      ),
    });
  }

  if (displayEmail) {
    contactItems.push({
      id: 'email',
      title: 'E-poçt',
      titleEn: 'Email',
      titleRu: 'Эл. почта',
      subtitle: displayEmail,
      href: `mailto:${displayEmail}`,
      isExternal: true,
      iconSvg: (
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7" />
          <rect x="2" y="4" width="20" height="16" rx="2" />
        </svg>
      ),
    });
  }

  if (displayAddress && displayMapUrl) {
    contactItems.push({
      id: 'address',
      title: 'Ünvan',
      titleEn: 'Address',
      titleRu: 'Адрес',
      subtitle: displayAddress,
      href: displayMapUrl,
      isExternal: true,
      iconSvg: (
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
          <circle cx="12" cy="10" r="3" />
        </svg>
      ),
    });
  }

  if (hubData?.departmentContacts && hubData.departmentContacts.length > 0) {
    contactItems.push({
      id: 'departments',
      title: 'Şöbə əlaqələri',
      titleEn: 'Department Contacts',
      titleRu: 'Контакты отделов',
      subtitle: 'Qəbul, F&B, SPA və s.',
      href: '#',
      isExternal: false,
      onClick: () => setIsDepartmentModalOpen(true),
      iconSvg: (
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <path d="M16 3.128a4 4 0 0 1 0 7.744" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <circle cx="9" cy="7" r="4" />
        </svg>
      ),
    });
  }

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] font-hotel-sans flex justify-center selection:bg-[#A78BFA] selection:text-black transition-colors duration-200">
      {/* Main Responsive Column */}
      <div className="w-full max-w-[540px] min-h-screen bg-[var(--bg-main)] flex flex-col relative pb-10 border-x border-[var(--border-color)] overflow-x-hidden shadow-2xl">
        
        {/* ===================== 1. HERO HEADER (1:1 with Reference) ===================== */}
        <header className="relative w-full h-[178px] overflow-hidden bg-[#181424] flex-none">
          <img
            src={hubCover}
            alt={hubTitle}
            className="absolute inset-0 w-full h-full object-cover transition-all duration-300"
          />

          {/* Dark luxury gradient shade */}
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
              onClick={() => navigate(homePath)}
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

          {/* Title in Cormorant Garamond Serif */}
          <div className="absolute bottom-[16px] left-[18px] right-[18px] z-20">
            <h1
              className="font-hotel-serif text-[28px] sm:text-[32px] leading-none font-semibold text-white tracking-wide"
              style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.7))' }}
            >
              {hubTitle}
            </h1>
            {hubSubtitle && (
              <p
                className="text-[12px] text-white/85 font-hotel-sans mt-1 leading-snug"
                style={{ filter: 'drop-shadow(0 1px 4px rgba(0,0,0,0.8))' }}
              >
                {hubSubtitle}
              </p>
            )}
          </div>
        </header>

        {/* ===================== 2. SHEET BODY (5 Contact Items from Reference) ===================== */}
        <div className="relative z-10 -mt-2.5 rounded-t-[22px] bg-[var(--bg-main)] pt-3 px-3.5 flex-1 flex flex-col">
          {contactItems.length > 0 ? (
            <div className="rounded-[16px] bg-[var(--bg-card)] border border-[var(--border-color)] overflow-hidden shadow-[0_4px_16px_rgba(0,0,0,0.04)] divide-y divide-[var(--border-color)]">
              {contactItems.map((item) => {
                const content = (
                  <div className="w-full py-3.5 px-3.5 sm:px-4 flex items-center justify-between gap-3 text-left hover:bg-[var(--bg-subcard)]/50 active:bg-[var(--bg-subcard)] transition-colors group cursor-pointer">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <span
                        className={`flex-none ${
                          item.iconColorClass || 'text-[#a87b51] dark:text-[#A78BFA]'
                        } group-hover:scale-110 transition-transform`}
                      >
                        {item.iconSvg}
                      </span>
                      <div className="min-w-0">
                        <span className="font-hotel-sans font-semibold text-[14px] text-[var(--text-main)] group-hover:text-[#a87b51] dark:group-hover:text-[#A78BFA] transition-colors block leading-tight">
                          {item.title}
                        </span>
                        <span className="text-[12px] text-[var(--text-muted)] font-hotel-sans mt-0.5 block truncate">
                          {item.subtitle}
                        </span>
                      </div>
                    </div>
                    <span className="text-[var(--text-muted)] group-hover:text-[var(--text-main)] group-hover:translate-x-0.5 transition-all flex-none">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="m9 18 6-6-6-6" />
                      </svg>
                    </span>
                  </div>
                );

                if (item.onClick) {
                  return (
                    <button key={item.id} type="button" onClick={item.onClick} className="w-full text-left focus:outline-none">
                      {content}
                    </button>
                  );
                }

                return (
                  <a key={item.id} href={item.href} target={item.isExternal ? '_blank' : undefined} rel={item.isExternal ? 'noopener noreferrer' : undefined} className="block focus:outline-none">
                    {content}
                  </a>
                );
              })}
            </div>
          ) : (
            <div className="py-16 px-6 flex flex-col items-center justify-center text-center">
              <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-3 text-[#A78BFA]">
                <span className="text-2xl">📞</span>
              </div>
              <h3 className="font-hotel-serif text-[18px] font-semibold text-[var(--text-main)] mb-1">
                Əlaqə vasitəsi yoxdur
              </h3>
              <p className="text-[12.5px] text-[var(--text-muted)] max-w-[280px]">
                Bu otel üçün hələlik heç bir əlaqə məlumatı daxil edilməyib.
              </p>
            </div>
          )}

          {/* Quick Inquiry / Sifariş Formu Pill */}
          <div className="pt-4 pb-2">
            <button
              type="button"
              onClick={() => setIsInquiryOpen(true)}
              className="w-full p-3.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] flex items-center justify-between gap-3 shadow-sm hover:border-[#a87b51]/40 dark:hover:border-[#A78BFA]/40 active:scale-[0.99] transition-all"
            >
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-[#a87b51]/15 dark:bg-[#A78BFA]/15 text-[#a87b51] dark:text-[#A78BFA] flex items-center justify-center text-sm font-bold">
                  🛎️
                </span>
                <div className="text-left">
                  <span className="text-xs font-bold text-[var(--text-main)] block">
                    Onlayn Müraciət və Tələb Formu
                  </span>
                  <span className="text-[11px] text-[var(--text-muted)] block">
                    Otaq nömrənizi qeyd edin, resepşn təmin etsin
                  </span>
                </div>
              </div>
              <span className="text-xs font-bold bg-[#a87b51] dark:bg-[#A78BFA] text-white dark:text-black px-3 py-1.5 rounded-xl flex-none">
                Müraciət et →
              </span>
            </button>
          </div>
        </div>

        {/* ===================== 3. MODAL FOR ŞÖBƏ ƏLAQƏLƏRİ (p/43229) ===================== */}
        <AnimatePresence>
          {isDepartmentModalOpen && (
            <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/75 backdrop-blur-sm"
                onClick={() => setIsDepartmentModalOpen(false)}
              />

              <motion.div
                initial={{ opacity: 0, y: 60 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 60 }}
                transition={{ type: 'spring', damping: 26, stiffness: 320 }}
                className="relative z-10 w-full max-w-[480px] max-h-[85vh] overflow-y-auto rounded-t-[26px] sm:rounded-[26px] bg-[var(--bg-card)] border border-[var(--border-color)] p-5 text-[var(--text-main)] shadow-2xl space-y-4"
              >
                <div className="w-12 h-1.5 rounded-full bg-white/20 mx-auto mb-1" />

                <div className="flex items-start justify-between gap-3 border-b border-[var(--border-color)] pb-3">
                  <div>
                    <h3 className="font-hotel-serif text-xl font-bold uppercase tracking-wide text-[var(--text-main)]">
                      Şöbə əlaqələri
                    </h3>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">
                      Qəbul, F&B, SPA və digər daxili xətlər
                    </p>
                  </div>

                  <button
                    onClick={() => setIsDepartmentModalOpen(false)}
                    className="w-8 h-8 rounded-full bg-[var(--bg-subcard)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-main)]"
                  >
                    ✕
                  </button>
                </div>

                {/* Exact Department Directory Lines */}
                <div className="space-y-2.5 text-xs sm:text-[13px] text-[var(--text-main)]">
                  {hubData?.departmentContacts && hubData.departmentContacts.length > 0 ? (
                    hubData.departmentContacts.map((dep) => (
                      <div
                        key={dep.id}
                        className="p-3 rounded-xl bg-[var(--bg-subcard)]/70 border border-[var(--border-color)] flex items-center justify-between"
                      >
                        <div>
                          <span className="font-bold block">{dep.title}</span>
                          <span className="text-[11px] text-[var(--text-muted)]">
                            {dep.subtitle || dep.workingHours || dep.email || displayPhone}
                          </span>
                        </div>
                        <span className="font-bold text-[#a87b51] dark:text-[#A78BFA] px-2.5 py-1 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)]">
                          {dep.internalExtension ? `daxili ${dep.internalExtension}` : '24/7'}
                        </span>
                      </div>
                    ))
                  ) : hotelSlug === 'skyhill' ? (
                    <>
                      <div className="p-3 rounded-xl bg-[var(--bg-subcard)]/70 border border-[var(--border-color)] flex items-center justify-between">
                        <div>
                          <span className="font-bold block">Resepsiyon & Qəbul</span>
                          <span className="text-[11px] text-[var(--text-muted)]">{displayPhone}</span>
                        </div>
                        <span className="font-bold text-[#a87b51] dark:text-[#A78BFA] px-2.5 py-1 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)]">
                          daxili 0
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-[var(--bg-subcard)]/70 border border-[var(--border-color)] flex items-center justify-between">
                        <div>
                          <span className="font-bold block">Konsyerj Xidməti</span>
                          <span className="text-[11px] text-[var(--text-muted)]">24 saat xidmətinizdədir</span>
                        </div>
                        <span className="font-bold text-[#a87b51] dark:text-[#A78BFA] px-2.5 py-1 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)]">
                          daxili 1
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-[var(--bg-subcard)]/70 border border-[var(--border-color)] flex items-center justify-between">
                        <div>
                          <span className="font-bold block">Otaq Xidməti (Room Service)</span>
                          <span className="text-[11px] text-[var(--text-muted)]">Yemək və içki sifarişi</span>
                        </div>
                        <span className="font-bold text-[#a87b51] dark:text-[#A78BFA] px-2.5 py-1 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)]">
                          daxili 3
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-[var(--bg-subcard)]/70 border border-[var(--border-color)] flex items-center justify-between">
                        <div>
                          <span className="font-bold block">SHIRVAN Restoranı</span>
                          <span className="text-[11px] text-[var(--text-muted)]">Masa rezervasiyası</span>
                        </div>
                        <span className="font-bold text-[#a87b51] dark:text-[#A78BFA] px-2.5 py-1 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)]">
                          daxili 4
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-[var(--bg-subcard)]/70 border border-[var(--border-color)] flex items-center justify-between">
                        <div>
                          <span className="font-bold block">MARAL Spa</span>
                          <span className="text-[11px] text-[var(--text-muted)]">Masaj və sağlamlıq ritualları</span>
                        </div>
                        <span className="font-bold text-[#a87b51] dark:text-[#A78BFA] px-2.5 py-1 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)]">
                          daxili 5
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-[var(--bg-subcard)]/70 border border-[var(--border-color)] flex items-center justify-between">
                        <div>
                          <span className="font-bold block">STRIKE Boulinq və Əyləncə</span>
                          <span className="text-[11px] text-[var(--text-muted)]">Boulinq zolaq sifarişi</span>
                        </div>
                        <span className="font-bold text-[#a87b51] dark:text-[#A78BFA] px-2.5 py-1 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)]">
                          daxili 6
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-[var(--bg-subcard)]/70 border border-[var(--border-color)] flex items-center justify-between">
                        <div>
                          <span className="font-bold block">Tədbirlər və Konfrans (ZIRVE, TUSI)</span>
                          <span className="text-[11px] text-[var(--text-muted)]">events@skyhill.az</span>
                        </div>
                        <span className="font-bold text-[#a87b51] dark:text-[#A78BFA] px-2.5 py-1 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-[11px]">
                          Sifarişlə
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="py-6 text-center text-xs text-[var(--text-muted)]">
                      Hələlik şöbə əlaqəsi əlavə edilməyib.
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[var(--border-color)]">
                  <a
                    href={`tel:${rawPhone}`}
                    className="py-3 rounded-2xl bg-[#a87b51] dark:bg-[#A78BFA] text-white dark:text-black text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-transform shadow-md"
                  >
                    📞 Resepşna Zəng
                  </a>
                  <a
                    href={`https://wa.me/${displayWhatsapp}?text=${encodeURIComponent(
                      'Salam, şöbələr ilə əlaqə saxlamaq istəyirəm.'
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-3 rounded-2xl bg-[#25D366] text-white text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-transform shadow-md"
                  >
                    💬 WhatsApp
                  </a>
                </div>
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

