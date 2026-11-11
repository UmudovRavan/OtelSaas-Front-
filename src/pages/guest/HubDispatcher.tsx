import React, { Suspense } from 'react';
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

  // If hub is not found for this hotel, render clean empty message
  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-3xl mb-4 text-[#A78BFA]">
        🔍
      </div>
      <h2 className="font-hotel-serif text-2xl font-bold mb-2">Bölmə tapılmadı</h2>
      <p className="text-sm text-[var(--text-muted)] max-w-xs mb-6">
        Axtardığınız bölmə mövcud deyil və ya bu otel tərəfindən hələlik aktiv edilməyib.
      </p>
      <button
        type="button"
        onClick={() => navigate(slug ? `/hotel/${slug}` : '/')}
        className="px-6 py-2.5 rounded-xl bg-[#A78BFA] text-black text-sm font-semibold hover:bg-[#906fe8] active:scale-95 transition-all"
      >
        Ana səhifəyə qayıt
      </button>
    </div>
  );
};

