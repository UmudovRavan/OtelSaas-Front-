import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { GuestPortalPage } from './pages/guest/GuestPortalPage';
import { HotelInfoPage } from './pages/guest/HotelInfoPage';
import { FoodBeveragePage } from './pages/guest/FoodBeveragePage';
import { SpaWellnessPage } from './pages/guest/SpaWellnessPage';
import { EntertainmentPage } from './pages/guest/EntertainmentPage';
import { ContactPage } from './pages/guest/ContactPage';
import { DailyOffersPage } from './pages/guest/DailyOffersPage';
import { ReviewPage } from './pages/guest/ReviewPage';
import { CartPage } from './pages/guest/CartPage';
import { HubDispatcher } from './pages/guest/HubDispatcher';
import { GuestCartProvider } from './context/GuestCartContext';
import { LoginPage } from './pages/auth/LoginPage';
import { ReceptionPage } from './pages/reception/ReceptionPage';
import { AdminPage } from './pages/admin/AdminPage';
import { SuperAdminPage } from './pages/super-admin/SuperAdminPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <AuthProvider>
          <GuestCartProvider>
            <BrowserRouter>
              <Routes>
                {/* 1. Root and Direct Slugs */}
                <Route path="/" element={<GuestPortalPage />} />
                <Route path="/hotel/:slug" element={<GuestPortalPage />} />

                {/* 2. UniPOS 1:1 format: /skyhill/hotel/g/:code, /skyhill/hotel/c/:code, /skyhill/hotel/p/:code */}
                <Route path="/:slug/hotel/g/:code" element={<HubDispatcher />} />
                <Route path="/:slug/hotel/c/:code" element={<FoodBeveragePage />} />
                <Route path="/:slug/hotel/p/:code" element={<SpaWellnessPage />} />
                <Route path="/:slug/hotel/info" element={<HotelInfoPage />} />
                <Route path="/:slug/hotel/food-beverage" element={<FoodBeveragePage />} />
                <Route path="/:slug/hotel/spa-wellness" element={<SpaWellnessPage />} />
                <Route path="/:slug/hotel/entertainment" element={<EntertainmentPage />} />
                <Route path="/:slug/hotel/contact" element={<ContactPage />} />
                <Route path="/:slug/hotel/offers" element={<DailyOffersPage />} />
                <Route path="/:slug/hotel/offers/:code" element={<DailyOffersPage />} />
                <Route path="/:slug/hotel/review" element={<ReviewPage />} />
                <Route path="/:slug/hotel/cart" element={<CartPage />} />

                {/* 3. Legacy / Alternate slug prefixes: /hotel/:slug/g/:code etc */}
                <Route path="/hotel/:slug/g/:code" element={<HubDispatcher />} />
                <Route path="/hotel/:slug/c/:code" element={<FoodBeveragePage />} />
                <Route path="/hotel/:slug/p/:code" element={<SpaWellnessPage />} />
                <Route path="/hotel/:slug/info" element={<HotelInfoPage />} />
                <Route path="/hotel/:slug/food-beverage" element={<FoodBeveragePage />} />
                <Route path="/hotel/:slug/spa-wellness" element={<SpaWellnessPage />} />
                <Route path="/hotel/:slug/entertainment" element={<EntertainmentPage />} />
                <Route path="/hotel/:slug/contact" element={<ContactPage />} />
                <Route path="/hotel/:slug/offers" element={<DailyOffersPage />} />
                <Route path="/hotel/:slug/offers/:code" element={<DailyOffersPage />} />
                <Route path="/hotel/:slug/review" element={<ReviewPage />} />
                <Route path="/hotel/:slug/cart" element={<CartPage />} />

                {/* 4. Short slug routes: /:slug/g/:code etc */}
                <Route path="/:slug/g/:code" element={<HubDispatcher />} />
                <Route path="/:slug/c/:code" element={<FoodBeveragePage />} />
                <Route path="/:slug/p/:code" element={<SpaWellnessPage />} />
                <Route path="/:slug/info" element={<HotelInfoPage />} />
                <Route path="/:slug/food-beverage" element={<FoodBeveragePage />} />
                <Route path="/:slug/spa-wellness" element={<SpaWellnessPage />} />
                <Route path="/:slug/entertainment" element={<EntertainmentPage />} />
                <Route path="/:slug/contact" element={<ContactPage />} />
                <Route path="/:slug/offers" element={<DailyOffersPage />} />
                <Route path="/:slug/offers/:code" element={<DailyOffersPage />} />
                <Route path="/:slug/review" element={<ReviewPage />} />
                <Route path="/:slug/cart" element={<CartPage />} />

                {/* 5. Flat fallback routes without slug: /g/192, /c/4578, etc */}
                <Route path="/hotel-info" element={<HotelInfoPage />} />
                <Route path="/food-beverage" element={<FoodBeveragePage />} />
                <Route path="/spa-wellness" element={<SpaWellnessPage />} />
                <Route path="/entertainment" element={<EntertainmentPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/offers" element={<DailyOffersPage />} />
                <Route path="/review" element={<ReviewPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/g/:code" element={<HubDispatcher />} />
                <Route path="/c/:code" element={<FoodBeveragePage />} />
                <Route path="/p/:code" element={<SpaWellnessPage />} />
                <Route path="/offers/:code" element={<DailyOffersPage />} />

                {/* 6. Staff Login Page */}
                <Route path="/login" element={<LoginPage />} />

                {/* 7. Role-Based Protected Routes:
                    - Reception Desk: Receptionist, HotelAdmin, SuperAdmin
                    - Hotel Admin: HotelAdmin, SuperAdmin
                    - Super Admin: SuperAdmin
                */}
                <Route
                  path="/reception"
                  element={
                    <ProtectedRoute allowedRoles={['Receptionist', 'HotelAdmin', 'SuperAdmin']}>
                      <ReceptionPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute allowedRoles={['HotelAdmin', 'SuperAdmin']}>
                      <AdminPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/super-admin"
                  element={
                    <ProtectedRoute allowedRoles={['SuperAdmin']}>
                      <SuperAdminPage />
                    </ProtectedRoute>
                  }
                />

                {/* 8. Direct slug route for root qr scan (e.g. /skyhill) */}
                <Route path="/:slug" element={<GuestPortalPage />} />

                {/* Fallback to Guest Portal */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </BrowserRouter>
          </GuestCartProvider>
        </AuthProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
};

export default App;
