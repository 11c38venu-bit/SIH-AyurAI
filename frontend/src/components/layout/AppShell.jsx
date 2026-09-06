import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

export const AppShell = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col antialiased">
      {/* Sidebar Navigation */}
      <Sidebar isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />

      {/* Main App Container */}
      <div className="lg:pl-64 flex flex-col flex-1 min-h-screen">
        <TopBar onOpenMobileMenu={() => setIsMobileOpen(true)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>

        <footer className="py-4 px-6 border-t border-slate-200 bg-white text-center text-xs text-slate-400">
          <p>
            AYURAI Platform • SIH 2026 Innovation • Built for Classical Ayurvedic Precision & Digital Healthcare
          </p>
        </footer>
      </div>
    </div>
  );
};

export default AppShell;
