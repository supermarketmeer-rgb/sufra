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

const MainContent: React.FC = () => {
  const { currentRole } = useApp();
  const [showExplorer, setShowExplorer] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-cairo">
      {/* Top Bar with Role Switcher & Code Studio */}
      <Navbar onOpenExplorer={() => setShowExplorer(true)} />

      {/* Main Workspace Frame */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {currentRole === 'super_admin' && <SuperAdminDashboard />}
        {currentRole === 'restaurant_owner' && <OwnerDashboard />}
        {currentRole === 'branch_manager' && <BranchDashboard />}
        {currentRole === 'cashier' && <PosDashboard />}
        {currentRole === 'kitchen' && <KdsDashboard />}
        {currentRole === 'driver' && <DriverDashboard />}
        {currentRole === 'customer' && <CustomerMenu />}
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
