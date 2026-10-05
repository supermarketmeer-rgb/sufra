/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { SuperAdminDashboard } from './components/superadmin/SuperAdminDashboard';
import { OwnerDashboard } from './components/owner/OwnerDashboard';
import { BranchDashboard } from './components/branch/BranchDashboard';
import { PosDashboard } from './components/pos/PosDashboard';
import { KdsDashboard } from './components/kds/KdsDashboard';
import { DriverDashboard } from './components/driver/DriverDashboard';
import { CustomerMenu } from './components/customer/CustomerMenu';
import { CodeExplorer } from './components/explorer/CodeExplorer';
import { RegisterRestaurant } from './components/auth/RegisterRestaurant';
import { WelcomePortal } from './components/auth/WelcomePortal';

const MainContent: React.FC = () => {
  const { currentRole } = useApp();
  const [showExplorer, setShowExplorer] = useState(false);
  const [showPortal, setShowPortal] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const p = window.location.pathname.toLowerCase();
      const s = window.location.search.toLowerCase();
      // If explicit role is specified or table/restaurant query, don't show portal
      if (s.includes('role=') || s.includes('table=') || s.includes('restaurant=') || s.includes('r=')) return false;
      if (p.includes('signup') || s.includes('signup')) return false;
      // Default to showing the Welcome Portal directly for mobile & new visitors!
      return true;
    }
    return true;
  });
  const [showRegister, setShowRegister] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const p = window.location.pathname.toLowerCase();
      const s = window.location.search.toLowerCase();
      return p.includes('signup') || p.includes('register') || s.includes('signup') || s.includes('register') || s.includes('plan=free');
    }
    return false;
  });

  if (showPortal && currentRole === 'customer') {
    return (
      <div className="min-h-screen bg-[#fbf9f4] text-stone-800 flex flex-col font-cairo" dir="rtl">
        <WelcomePortal onClose={() => setShowPortal(false)} />
        <div className="pb-6 text-center">
          <button
            onClick={() => setShowPortal(false)}
            className="text-xs text-stone-400 hover:text-stone-700 transition-colors cursor-pointer"
          >
            تخطي إلى لوحة النظام التجريبية / Super Admin
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-cairo">
      {/* Top Bar (Hidden for customer QR Menu so customers never see admin/staff controls) */}
      {currentRole !== 'customer' && (
        <Navbar
          onOpenExplorer={() => setShowExplorer(true)}
          onOpenRegister={() => setShowRegister(true)}
          onOpenPortal={() => setShowPortal(true)}
        />
      )}

      {/* Main Workspace Frame */}
      <main className={currentRole === 'customer' ? 'flex-1 w-full' : 'flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6'}>
        {showRegister ? (
          <RegisterRestaurant onClose={() => setShowRegister(false)} />
        ) : (
          <>
            {currentRole === 'super_admin' && <SuperAdminDashboard />}
            {currentRole === 'restaurant_owner' && <OwnerDashboard />}
            {currentRole === 'branch_manager' && <BranchDashboard />}
            {currentRole === 'cashier' && <PosDashboard />}
            {currentRole === 'kitchen' && <KdsDashboard />}
            {currentRole === 'driver' && <DriverDashboard />}
            {currentRole === 'customer' && <CustomerMenu />}
          </>
        )}
      </main>

      {/* Code & Architecture Explorer Modal */}
      {showExplorer && <CodeExplorer onClose={() => setShowExplorer(false)} />}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
