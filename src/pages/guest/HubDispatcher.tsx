import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useHub } from '../../hooks/useHotelData';
import { HubType } from '../../types/api';
import { HotelInfoPage } from './HotelInfoPage';
import { FoodBeveragePage } from './FoodBeveragePage';
import { SpaWellnessPage } from './SpaWellnessPage';
import { EntertainmentPage } from './EntertainmentPage';
import { ContactPage } from './ContactPage';
import { DailyOffersPage } from './DailyOffersPage';

export const HubDispatcher: React.FC = () => {
  const { slug = 'skyhill', code = '191' } = useParams<{ slug?: string; code?: string }>();
  const navigate = useNavigate();
  const normalizedCode = code.toLowerCase();

  // Fast-path known static hub codes for skyhill reference
  if (slug === 'skyhill') {
    if (normalizedCode === '191' || normalizedCode === 'info') {
      return <HotelInfoPage />;
    }
    if (normalizedCode === '192' || normalizedCode === 'food') {
      return <FoodBeveragePage />;
    }
    if (normalizedCode === '193' || normalizedCode === 'spa') {
      return <SpaWellnessPage />;
    }
    if (normalizedCode === '194' || normalizedCode === 'entertainment') {
      return <EntertainmentPage />;
    }
    if (normalizedCode === '195' || normalizedCode === 'contacts' || normalizedCode === 'contact') {
      return <ContactPage />;
    }
    if (normalizedCode === '196' || normalizedCode === 'specials' || normalizedCode === 'offers') {
      return <DailyOffersPage />;
    }
  }

  // Dynamic hub query for newly created hubs from Hotel Admin
  const { data: hub, isLoading } = useHub(slug, code);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--bg-main)] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#A78BFA] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (hub) {
    switch (hub.hubType) {
      case HubType.HotelInfo:
        return <HotelInfoPage />;
      case HubType.FoodAndBeverage:
        return <FoodBeveragePage />;
      case HubType.SpaAndWellness:
        return <SpaWellnessPage />;
      case HubType.Entertainment:
        return <EntertainmentPage />;
      case HubType.Contacts:
        return <ContactPage />;
      case HubType.DailySpecials:
        return <DailyOffersPage />;
      default:
        return <FoodBeveragePage />;
    }
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

