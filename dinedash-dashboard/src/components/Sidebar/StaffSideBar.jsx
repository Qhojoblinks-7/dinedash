import React from 'react';
import SidebarItem from './SidebarItem';
import {
  Bars3Icon,
  TableCellsIcon,
  CalendarDaysIcon,
  TruckIcon,
  CalculatorIcon,
  Cog6ToothIcon,
  ArrowLeftOnRectangleIcon,
} from '@heroicons/react/24/outline';

const StaffSidebar = ({ activeTab, onTabChange }) => {
  const handleLinkClick = (label) => {
    onTabChange(label);
  };

  return (
    <div className="fixed top-0 left-0 h-screen w-64 bg-gray-50 p-4 flex flex-col justify-between rounded-r-3xl shadow-lg">
      {/* Top Section */}
      <div>
        {/* Logo */}
        <div className="flex items-center justify-center p-4 mb-8">
          <img src="/path/to/logo.png" alt="Chili POS" className="h-10" />
        </div>

        {/* Navigation Links */}
        <nav className="space-y-2">
          <SidebarItem
            icon={<Bars3Icon className="w-5 h-5" />}
            label="Menu"
            isActive={activeTab === 'Menu'}
            onClick={() => handleLinkClick('Menu')}
          />
          <SidebarItem
            icon={<TableCellsIcon className="w-5 h-5" />}
            label="Table Services"
            isActive={activeTab === 'Table Services'}
            onClick={() => handleLinkClick('Table Services')}
          />
          <SidebarItem
            icon={<CalendarDaysIcon className="w-5 h-5" />}
            label="Reservation"
            isActive={activeTab === 'Reservation'}
            onClick={() => handleLinkClick('Reservation')}
          />
          <SidebarItem
            icon={<TruckIcon className="w-5 h-5" />}
            label="Delivery"
            isActive={activeTab === 'Delivery'}
            onClick={() => handleLinkClick('Delivery')}
          />
          <SidebarItem
            icon={<CalculatorIcon className="w-5 h-5" />}
            label="Accounting"
            isActive={activeTab === 'Accounting'}
            onClick={() => handleLinkClick('Accounting')}
          />
          <SidebarItem
            icon={<Cog6ToothIcon className="w-5 h-5" />}
            label="Settings"
            isActive={activeTab === 'Settings'}
            onClick={() => handleLinkClick('Settings')}
          />
        </nav>
      </div>

      {/* Bottom Section */}
      <div className="space-y-4">
        {/* User Profiles */}
        <div className="p-4 bg-white rounded-lg shadow-sm">
          {/* Profile 1 */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center font-bold text-blue-800 text-sm">
              FM
            </div>
            <div>
              <h3 className="text-sm font-semibold">Floyd Miles</h3>
            </div>
          </div>
          {/* Profile 2 */}
          <div className="flex items-center gap-3 mt-2">
            <div className="w-8 h-8 rounded-full bg-green-200 flex items-center justify-center font-bold text-green-800 text-sm">
              AM
            </div>
            <div>
              <h3 className="text-sm font-semibold">Arlene McCoy</h3>
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <div className="p-3 bg-red-100 text-red-600 rounded-lg cursor-pointer flex items-center gap-4 hover:bg-red-200 transition-colors duration-200">
          <ArrowLeftOnRectangleIcon className="w-5 h-5" />
          <span className="text-sm font-semibold">Logout</span>
        </div>
      </div>
    </div>
  );
};

export default StaffSidebar;