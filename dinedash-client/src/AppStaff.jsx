import React from 'react';
import StaffDashboardFinal from '../../staff-dashboard/StaffDashboardFinal';
import { ToastProvider } from './components/ui/Toast';

function AppStaff() {
  return (
    <ToastProvider>
      <div className="min-h-screen bg-gray-50">
        <StaffDashboardFinal />
      </div>
    </ToastProvider>
  );
}

export default AppStaff;
