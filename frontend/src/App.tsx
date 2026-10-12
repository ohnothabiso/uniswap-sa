import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { ProtectedRoute } from '@/components/guards/ProtectedRoute';
import { AdminRoute } from '@/components/guards/AdminRoute';

// Public Pages
import { LandingPage } from '@/pages/public/LandingPage';
import { CampusSafetyPage } from '@/pages/public/CampusSafetyPage';
import { TermsPage, PrivacyPage } from '@/pages/public/TermsPage';

// Auth Pages
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { ForgotPasswordPage, VerifyEmailPage } from '@/pages/auth/ForgotPasswordPage';

// Marketplace Pages
import { MarketplaceFeedPage } from '@/pages/marketplace/MarketplaceFeedPage';
import { ListingDetailPage } from '@/pages/marketplace/ListingDetailPage';
import { CreateListingPage } from '@/pages/marketplace/CreateListingPage';
import { EditListingPage } from '@/pages/marketplace/EditListingPage';

// Student Pages
import { FavouritesPage } from '@/pages/student/FavouritesPage';
import { MessagesPage } from '@/pages/student/MessagesPage';
import { NotificationsPage } from '@/pages/student/NotificationsPage';
import { MyListingsPage } from '@/pages/student/MyListingsPage';
import { ProfilePage } from '@/pages/student/ProfilePage';

// Admin Pages
import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage';
import { AdminModerationPage } from '@/pages/admin/AdminModerationPage';
import { AdminReportsPage } from '@/pages/admin/AdminReportsPage';

export const App: React.FC = () => {
  return (
    <AppShell>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/campus-safety" element={<CampusSafetyPage />} />
        <Route path="/safety" element={<Navigate to="/campus-safety" replace />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />

        {/* Authentication Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />

        {/* Marketplace Feed & Detail (Accessible to All, Action buttons prompt Auth) */}
        <Route path="/explore" element={<MarketplaceFeedPage />} />
        <Route path="/listings" element={<Navigate to="/explore" replace />} />
        <Route path="/listings/:id" element={<ListingDetailPage />} />

        {/* Authenticated Student Routes */}
        <Route
          path="/listings/create"
          element={
            <ProtectedRoute>
              <CreateListingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/listings/:id/edit"
          element={
            <ProtectedRoute>
              <EditListingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/favourites"
          element={
            <ProtectedRoute>
              <FavouritesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/messages"
          element={
            <ProtectedRoute>
              <MessagesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <NotificationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-listings"
          element={
            <ProtectedRoute>
              <MyListingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        {/* Staff Administration Routes */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboardPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/moderation"
          element={
            <AdminRoute>
              <AdminModerationPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <AdminRoute>
              <AdminReportsPage />
            </AdminRoute>
          }
        />

        {/* Fallback 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  );
};

export default App;
