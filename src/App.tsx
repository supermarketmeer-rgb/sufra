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
      return p.includes('login') || p.includes('portal') || s.includes('portal') || s.includes('login') || s.includes('activate');
    }
    return false;
  });
  const [showRegister, setShowRegister] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const p = window.location.pathname.toLowerCase();
      const s = window.location.search.toLowerCase();
      return p.includes('signup') || p.includes('register') || s.includes('signup') || s.includes('register') || s.includes('plan=free');
    }
    return false;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-cairo">
      {/* Top Bar with Role Switcher & Code Studio */}
      <Navbar
        onOpenExplorer={() => setShowExplorer(true)}
        onOpenRegister={() => setShowRegister(true)}
        onOpenPortal={() => setShowPortal(true)}
      />

      {/* Main Workspace Frame */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {showPortal ? (
          <WelcomePortal onClose={() => setShowPortal(false)} />
        ) : showRegister ? (
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
