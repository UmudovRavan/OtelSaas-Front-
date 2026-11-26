import React, { Suspense, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useHub } from '../../hooks/useHotelData';
import { HubType } from '../../types/api';
import { PageLoader } from '../../components/common/PageLoader';
import { lazyWithRetry } from '../../utils/lazyWithRetry';

const HotelInfoPage = lazyWithRetry(() =>
  import('./HotelInfoPage').then((m) => ({ default: m.HotelInfoPage }))
);
const FoodBeveragePage = lazyWithRetry(() =>
  import('./FoodBeveragePage').then((m) => ({ default: m.FoodBeveragePage }))
);
const SpaWellnessPage = lazyWithRetry(() =>
  import('./SpaWellnessPage').then((m) => ({ default: m.SpaWellnessPage }))
);
const EntertainmentPage = lazyWithRetry(() =>
  import('./EntertainmentPage').then((m) => ({ default: m.EntertainmentPage }))
);
const ContactPage = lazyWithRetry(() =>
  import('./ContactPage').then((m) => ({ default: m.ContactPage }))
);
const DailyOffersPage = lazyWithRetry(() =>
  import('./DailyOffersPage').then((m) => ({ default: m.DailyOffersPage }))
);

export const HubDispatcher: React.FC = () => {
  const { slug = 'altensor', code = '191' } = useParams<{ slug?: string; code?: string }>();
  const navigate = useNavigate();
  const normalizedCode = code.toLowerCase();

  useEffect(() => {
    const saved = localStorage.getItem('fs_guest_dark');
    if (saved === '1') {
      document.documentElement.classList.add('fs-dark');
    } else {
      document.documentElement.classList.remove('fs-dark');
    }
  }, []);

  // Fast-path known static hub codes for altensor / skyhill reference
  if (slug === 'altensor' || slug === 'skyhill') {
    let target: React.ReactNode = null;
    if (normalizedCode === '191' || normalizedCode === 'info') {
      target = <HotelInfoPage />;
    } else if (normalizedCode === '192' || normalizedCode === 'food') {
      target = <FoodBeveragePage />;
    } else if (normalizedCode === '193' || normalizedCode === 'spa') {
      target = <SpaWellnessPage />;
    } else if (normalizedCode === '194' || normalizedCode === 'entertainment') {
      target = <EntertainmentPage />;
    } else if (normalizedCode === '195' || normalizedCode === 'contacts' || normalizedCode === 'contact') {
      target = <ContactPage />;
    } else if (normalizedCode === '196' || normalizedCode === 'specials' || normalizedCode === 'offers') {
      target = <DailyOffersPage />;
    }
    if (target) {
      return <Suspense fallback={<PageLoader />}>{target}</Suspense>;
    }
  }

  // Dynamic hub query for newly created hubs from Hotel Admin
  const { data: hub, isLoading } = useHub(slug, code);

  if (isLoading) {
    return <PageLoader />;
  }

  if (hub) {
    let hubComponent: React.ReactNode;
    switch (hub.hubType) {
      case HubType.HotelInfo:
        hubComponent = <HotelInfoPage />;
        break;
      case HubType.FoodAndBeverage:
        hubComponent = <FoodBeveragePage />;
        break;
      case HubType.SpaAndWellness:
        hubComponent = <SpaWellnessPage />;
        break;
      case HubType.Entertainment:
        hubComponent = <EntertainmentPage />;
        break;
      case HubType.Contacts:
        hubComponent = <ContactPage />;
        break;
      case HubType.DailySpecials:
        hubComponent = <DailyOffersPage />;
        break;
      default:
        hubComponent = <FoodBeveragePage />;
        break;
    }
    return <Suspense fallback={<PageLoader />}>{hubComponent}</Suspense>;
  }

  // If hub is not found for this hotel, render clean Four Seasons empty message
  return (
    <div className="fs-portal min-h-screen flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="max-w-md w-full bg-[var(--fs-surface-subtle)] border border-[var(--fs-border)] p-10 sm:p-12 space-y-5">
        <p className="fs-eyebrow text-[17px] text-[var(--fs-text-muted)]">Digital Concierge</p>
        <h2 className="font-fs-sans font-extralight text-[24px] tracking-[0.18em] uppercase text-[var(--fs-text)]">
          Bölmə tapılmadı
        </h2>
        <div className="w-10 h-[1px] bg-[var(--fs-border-strong)] mx-auto" />
        <p className="font-fs-serif text-[16px] leading-relaxed text-[var(--fs-text-muted)]">
          Axtardığınız bölmə mövcud deyil və ya bu otel tərəfindən hələlik aktiv edilməyib.
        </p>
        <div className="pt-2">
          <button
            type="button"
            onClick={() => navigate(slug ? `/hotel/${slug}` : '/')}
            className="fs-btn-primary w-full sm:w-auto"
          >
            Ana səhifəyə qayıt
          </button>
        </div>
      </div>
    </div>
  );
};
