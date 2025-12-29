import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ScrollToTop from './components/ScrollToTop';
import HomePage from './pages/HomePage';
import PageView from './pages/PageView';
import CategoryPage from './pages/CategoryPage';
import VehicleDetailPage from './pages/VehicleDetailPage';
import SearchPage from './pages/SearchPage';
import FavoritesPage from './pages/FavoritesPage';
import ContactPage from './pages/ContactPage';
import KaitoriPage from './pages/KaitoriPage';
import LoginPage from './pages/cms/LoginPage';
import CMSLayout from './components/CMSLayout';
import DashboardPage from './pages/cms/DashboardPage';
import VehiclesPage from './pages/cms/VehiclesPage';
import VehicleFormPage from './pages/cms/VehicleFormPage';
import VehicleImagesPage from './pages/cms/VehicleImagesPage';
import CategoriesPage from './pages/cms/CategoriesPage';
import PagesPage from './pages/cms/PagesPage';
import PageFormPage from './pages/cms/PageFormPage';
import InquiriesPage from './pages/cms/InquiriesPage';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <ScrollToTop />
      <Routes>
        {/* Customer-facing routes */}
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="/page/:slug" element={<PageView />} />
          <Route path="/category/:categorySlug" element={<CategoryPage />} />
          <Route path="/vehicle/:id" element={<VehicleDetailPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/kaitori" element={<KaitoriPage />} />
        </Route>

        {/* CMS routes */}
        <Route path="/cms/login" element={<LoginPage />} />
        <Route
          path="/cms"
          element={
            <ProtectedRoute>
              <CMSLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/cms/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="vehicles" element={<VehiclesPage />} />
          <Route path="vehicles/new" element={<VehicleFormPage />} />
          <Route path="vehicles/:id/edit" element={<VehicleFormPage />} />
          <Route path="vehicles/:id/images" element={<VehicleImagesPage />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="pages" element={<PagesPage />} />
          <Route path="pages/new" element={<PageFormPage />} />
          <Route path="pages/:id/edit" element={<PageFormPage />} />
          <Route path="inquiries" element={<InquiriesPage />} />
        </Route>
      </Routes>
    </ErrorBoundary>
  );
};

export default App;
