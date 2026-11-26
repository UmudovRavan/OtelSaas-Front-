import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { defaultHotelData } from './guestData';
import { translations, Language } from '../../utils/translations';
import { publicService, PublicHotelProfile } from '../../services/api/publicService';
import { InquirySheet } from './components/InquirySheet';
import { useHub, useHotelPortal } from '../../hooks/useHotelData';
import { resolveMediaUrl } from '../../utils/media';
import { useGuestDocumentMeta } from '../../utils/documentHead';
import { useLanguage } from '../../context/LanguageContext';
import { tr, SupportedLang } from '../../utils/i18n';
import { GuestLangPill } from './components/GuestLangPill';
import { HubType } from '../../types/api';

export const ContactPage: React.FC = () => {
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

  const { data: portalData } = useHotelPortal(hotelSlug);
  const matchingContactHub = portalData?.hubs?.find((h) => h.hubType === HubType.Contacts);
  const hubCodeOrId = isHubRoute
    ? code || matchingContactHub?.code || matchingContactHub?.externalId || '195'
    : matchingContactHub?.code || matchingContactHub?.externalId || '195';

  const { data: hubData } = useHub(hotelSlug, hubCodeOrId);

  const hubTitle = tr(
    hubData?.titleTr,
    hubData?.title || (selectedLang === 'ru' ? 'Контакты' : selectedLang === 'en' ? 'Contact' : 'Əlaqə'),
    selectedLang as SupportedLang
  );
  const hubSubtitle = tr(
    hubData?.subtitleTr,
    hubData?.subtitle ||
      (selectedLang === 'ru'
        ? 'Ресепшн, отделы и прямая связь'
        : selectedLang === 'en'
        ? 'Reception, departments and direct contacts'
        : 'Qəbul, şöbələr və birbaşa əlaqə'),
    selectedLang as SupportedLang
  );
  const hubCover = resolveMediaUrl(hubData?.coverImageUrl, '/media/guest/tile-contacts.webp');

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

  const hotelTitleName = liveHotel?.name || portalData?.name || (isDemoHotel ? hotel.name : '');
  useGuestDocumentMeta(
    hotelTitleName ? `${hubTitle} | ${hotelTitleName}` : hubTitle,
    liveHotel?.logoUrl || portalData?.logoUrl || (isDemoHotel ? hotel.logo : undefined)
  );

  const displayPhone = liveHotel?.phone || (isDemoHotel ? '+994 25 255 12 34' : '');
  const rawPhone = displayPhone.replace(/[^0-9+]/g, '');
  const displayWhatsapp = (liveHotel?.whatsApp || (isDemoHotel ? '+994 50 555 12 34' : '')).replace(/[^0-9]/g, '');
  const displayEmail = liveHotel?.email || (isDemoHotel ? 'info@altensor.az' : '');
  const displayAddress = liveHotel?.address || (isDemoHotel ? 'Lənkəran, Azərbaycan' : '');
  const displayMapUrl =
    liveHotel?.mapUrl ||
    (isDemoHotel ? 'https://www.google.com/maps/search/?api=1&query=Lankaran%2C+Azerbaijan' : '');

  const contactItems: Array<{
    id: string;
    title: string;
    titleEn: string;
    titleRu: string;
    subtitle: string;
    href: string;
    isExternal: boolean;
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
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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
      iconSvg: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <path d="M16 3.128a4 4 0 0 1 0 7.744" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <circle cx="9" cy="7" r="4" />
        </svg>
      ),
    });
  }

  return (
    <div className="fs-portal min-h-screen flex flex-col selection:bg-black selection:text-white pb-16">
      {/* ===================== 1. FULL-BLEED ARCHITECTURAL HERO ===================== */}
      <header className="relative w-full h-[240px] sm:h-[320px] lg:h-[380px] overflow-hidden bg-[#0F0F0F] flex-none">
        <img
          src={hubCover}
          alt={hubTitle}
          onError={(e) => {
            const fallback = resolveMediaUrl('/media/guest/tile-contacts.webp');
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
            onClick={() => navigate(homePath)}
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
            Front Desk & Concierge
          </p>
          <h1 className="font-fs-sans font-extralight text-[26px] sm:text-[34px] lg:text-[40px] leading-[1.2] tracking-[0.18em] uppercase text-white">
            {hubTitle}
          </h1>
          {hubSubtitle && (
            <p className="font-fs-serif text-[15px] sm:text-[17px] text-white/85 mt-1.5 max-w-2xl leading-snug">
              {hubSubtitle}
            </p>
          )}
        </div>
      </header>

      {/* ===================== 2. CONTACT DIRECTORY GRID ===================== */}
      <main className="flex-1 w-full max-w-[1140px] mx-auto px-4 sm:px-8 py-8 sm:py-14 space-y-10">
        {contactItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-[var(--fs-border)] border border-[var(--fs-border)]">
            {contactItems.map((item) => {
              const content = (
                <div className="w-full py-5 px-5 sm:px-7 bg-[var(--fs-card)] hover:bg-[var(--fs-surface-subtle)] flex items-center justify-between gap-4 text-left transition-colors group cursor-pointer h-full">
                  <div className="flex items-center gap-4 min-w-0">
                    <span className="flex-none text-[var(--fs-text)]">{item.iconSvg}</span>
                    <div className="min-w-0">
                      <span className="font-fs-serif text-[19px] sm:text-[20px] text-[var(--fs-text)] block leading-snug">
                        {selectedLang === 'en' ? item.titleEn : selectedLang === 'ru' ? item.titleRu : item.title}
                      </span>
                      <span className="font-fs-sans text-[12.5px] tracking-[0.04em] text-[var(--fs-text-muted)] mt-0.5 block truncate">
                        {item.subtitle}
                      </span>
                    </div>
                  </div>
                  <span className="text-[var(--fs-text-muted)] group-hover:text-[var(--fs-text)] group-hover:translate-x-1 transition-all flex-none">
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
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
                <a
                  key={item.id}
                  href={item.href}
                  target={item.isExternal ? '_blank' : undefined}
                  rel={item.isExternal ? 'noopener noreferrer' : undefined}
                  className="block focus:outline-none"
                >
                  {content}
                </a>
              );
            })}
          </div>
        ) : (
          <div className="py-16 px-6 bg-[var(--fs-surface-subtle)] border border-[var(--fs-border)] flex flex-col items-center justify-center text-center space-y-3">
            <h3 className="font-fs-sans font-extralight text-[20px] tracking-[0.18em] uppercase text-[var(--fs-text)]">
              Əlaqə vasitəsi yoxdur
            </h3>
            <p className="font-fs-serif text-[15.5px] text-[var(--fs-text-muted)] max-w-sm">
              Bu otel üçün hələlik heç bir əlaqə məlumatı daxil edilməyib.
            </p>
          </div>
        )}

        {/* Online Concierge Request Box */}
        <div className="p-6 sm:p-8 bg-[var(--fs-surface-subtle)] border border-[var(--fs-border)] flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="space-y-1">
            <span className="fs-kicker text-[var(--fs-text-muted)] block">24/7 Guest Request</span>
            <h3 className="font-fs-serif text-[21px] text-[var(--fs-text)]">
              {selectedLang === 'ru'
                ? 'Онлайн-запрос на ресепшн'
                : selectedLang === 'en'
                ? 'Online Concierge Request'
                : 'Onlayn Müraciət və Tələb Formu'}
            </h3>
            <p className="font-fs-serif text-[15px] text-[var(--fs-text-muted)]">
              {selectedLang === 'ru'
                ? 'Укажите номер комнаты, и ресепшн сразу поможет вам'
                : selectedLang === 'en'
                ? 'Enter your room number and our reception will assist promptly'
                : 'Otaq nömrənizi qeyd edin, resepşn dərhal təmin etsin'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsInquiryOpen(true)}
            className="fs-btn-primary shrink-0"
          >
            {selectedLang === 'ru' ? 'Отправить запрос →' : selectedLang === 'en' ? 'Send Request →' : 'Müraciət et →'}
          </button>
        </div>
      </main>

      {/* ===================== 3. DEPARTMENT CONTACTS MODAL ===================== */}
      <AnimatePresence>
        {isDepartmentModalOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[var(--fs-backdrop)] backdrop-blur-[2px]"
              onClick={() => setIsDepartmentModalOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              className="relative z-10 w-full max-w-[540px] max-h-[88vh] overflow-y-auto rounded-none bg-[var(--fs-card)] border-t sm:border border-[var(--fs-border)] p-6 sm:p-8 text-[var(--fs-text)] shadow-2xl space-y-5"
            >
              <div className="flex items-start justify-between gap-4 border-b border-[var(--fs-border)] pb-4">
                <div>
                  <h3 className="font-fs-sans font-extralight text-[20px] uppercase tracking-[0.16em] text-[var(--fs-text)]">
                    Şöbə əlaqələri
                  </h3>
                  <p className="font-fs-serif text-[15px] text-[var(--fs-text-muted)] mt-0.5">
                    Qəbul, F&B, SPA və digər daxili xətlər
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsDepartmentModalOpen(false)}
                  className="w-8 h-8 border border-[var(--fs-border)] hover:border-[var(--fs-border-strong)] flex items-center justify-center text-[var(--fs-text-muted)] hover:text-[var(--fs-text)] shrink-0"
                >
                  ✕
                </button>
              </div>

              <div className="divide-y divide-[var(--fs-border)] border border-[var(--fs-border)]">
                {hubData?.departmentContacts && hubData.departmentContacts.length > 0 ? (
                  hubData.departmentContacts.map((dep) => (
                    <div
                      key={dep.id}
                      className="p-4 bg-[var(--fs-card)] flex items-center justify-between gap-3"
                    >
                      <div>
                        <span className="font-fs-serif text-[17px] text-[var(--fs-text)] block">
                          {dep.title}
                        </span>
                        <span className="text-xs text-[var(--fs-text-muted)]">
                          {dep.subtitle || dep.workingHours || dep.email || displayPhone}
                        </span>
                      </div>
                      <span className="fs-kicker px-2.5 py-1 border border-[var(--fs-border-strong)] text-[var(--fs-text)] shrink-0">
                        {dep.internalExtension ? `daxili ${dep.internalExtension}` : '24/7'}
                      </span>
                    </div>
                  ))
                ) : isDemoHotel ? (
                  <>
                    <div className="p-4 bg-[var(--fs-card)] flex items-center justify-between gap-3">
                      <div>
                        <span className="font-fs-serif text-[17px] text-[var(--fs-text)] block">Resepsiyon & Qəbul</span>
                        <span className="text-xs text-[var(--fs-text-muted)]">{displayPhone}</span>
                      </div>
                      <span className="fs-kicker px-2.5 py-1 border border-[var(--fs-border-strong)]">daxili 0</span>
                    </div>
                    <div className="p-4 bg-[var(--fs-card)] flex items-center justify-between gap-3">
                      <div>
                        <span className="font-fs-serif text-[17px] text-[var(--fs-text)] block">Konsyerj Xidməti</span>
                        <span className="text-xs text-[var(--fs-text-muted)]">24 saat xidmətinizdədir</span>
                      </div>
                      <span className="fs-kicker px-2.5 py-1 border border-[var(--fs-border-strong)]">daxili 1</span>
                    </div>
                    <div className="p-4 bg-[var(--fs-card)] flex items-center justify-between gap-3">
                      <div>
                        <span className="font-fs-serif text-[17px] text-[var(--fs-text)] block">Otaq Xidməti (Room Service)</span>
                        <span className="text-xs text-[var(--fs-text-muted)]">Yemək və içki sifarişi</span>
                      </div>
                      <span className="fs-kicker px-2.5 py-1 border border-[var(--fs-border-strong)]">daxili 3</span>
                    </div>
                    <div className="p-4 bg-[var(--fs-card)] flex items-center justify-between gap-3">
                      <div>
                        <span className="font-fs-serif text-[17px] text-[var(--fs-text)] block">SHIRVAN Restoranı</span>
                        <span className="text-xs text-[var(--fs-text-muted)]">Masa rezervasiyası</span>
                      </div>
                      <span className="fs-kicker px-2.5 py-1 border border-[var(--fs-border-strong)]">daxili 4</span>
                    </div>
                    <div className="p-4 bg-[var(--fs-card)] flex items-center justify-between gap-3">
                      <div>
                        <span className="font-fs-serif text-[17px] text-[var(--fs-text)] block">MARAL Spa</span>
                        <span className="text-xs text-[var(--fs-text-muted)]">Masaj və sağlamlıq ritualları</span>
                      </div>
                      <span className="fs-kicker px-2.5 py-1 border border-[var(--fs-border-strong)]">daxili 5</span>
                    </div>
                    <div className="p-4 bg-[var(--fs-card)] flex items-center justify-between gap-3">
                      <div>
                        <span className="font-fs-serif text-[17px] text-[var(--fs-text)] block">STRIKE Boulinq və Əyləncə</span>
                        <span className="text-xs text-[var(--fs-text-muted)]">Boulinq zolaq sifarişi</span>
                      </div>
                      <span className="fs-kicker px-2.5 py-1 border border-[var(--fs-border-strong)]">daxili 6</span>
                    </div>
                    <div className="p-4 bg-[var(--fs-card)] flex items-center justify-between gap-3">
                      <div>
                        <span className="font-fs-serif text-[17px] text-[var(--fs-text)] block">Tədbirlər və Konfrans (ZIRVE, TUSI)</span>
                        <span className="text-xs text-[var(--fs-text-muted)]">events@altensor.az</span>
                      </div>
                      <span className="fs-kicker px-2.5 py-1 border border-[var(--fs-border-strong)]">Sifarişlə</span>
                    </div>
                  </>
                ) : (
                  <div className="py-8 text-center font-fs-serif text-[15px] text-[var(--fs-text-muted)]">
                    Hələlik şöbə əlaqəsi əlavə edilməyib.
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <a href={`tel:${rawPhone}`} className="fs-btn-primary w-full">
                  Resepşna Zəng
                </a>
                <a
                  href={`https://wa.me/${displayWhatsapp}?text=${encodeURIComponent(
                    'Salam, şöbələr ilə əlaqə saxlamaq istəyirəm.'
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="fs-btn-outline w-full"
                >
                  WhatsApp
                </a>
              </div>
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
