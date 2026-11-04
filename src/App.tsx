import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { GuestPortalPage } from './pages/guest/GuestPortalPage';
import { LoginPage } from './pages/auth/LoginPage';
import { ReceptionPage } from './pages/reception/ReceptionPage';
import { AdminPage } from './pages/admin/AdminPage';
import { SuperAdminPage } from './pages/super-admin/SuperAdminPage';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Guest Portal (QR scan) - Qonaqlar üçün yalnız mobil görünüş */}
          <Route path="/" element={<GuestPortalPage />} />
          <Route path="/hotel/:slug" element={<GuestPortalPage />} />

          {/* Secure Staff Login Page */}
          <Route path="/login" element={<LoginPage />} />

          {/* 
            Role-Based Protected Routes:
            1. Reception Desk: Receptionist, HotelAdmin and SuperAdmin can view
            2. Hotel Admin: HotelAdmin and SuperAdmin can view (Receptionist cannot access)
            3. Super Admin: Only SuperAdmin can view (HotelAdmin and Receptionist cannot access)
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

          {/* Direct slug route for backend /q/{slug} 302 redirect (${frontendBaseUrl}/{slug}) */}
          <Route path="/:slug" element={<GuestPortalPage />} />

          {/* Fallback to Guest Portal */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
