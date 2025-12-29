import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import QuickContact from './QuickContact';

const Layout: React.FC = () => {
  const location = useLocation();
  
  // Hide QuickContact on vehicle detail pages
  const isVehicleDetailPage = location.pathname.startsWith('/vehicle/');

  return (
    <div className="layout">
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
      {!isVehicleDetailPage && <QuickContact />}
    </div>
  );
};

export default Layout;
