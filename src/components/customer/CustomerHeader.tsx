import React from 'react';
import { LogOut, User, Bell } from 'lucide-react';
import LanguageSelector from '../LanguageSelector';

interface CustomerHeaderProps {
  customerName: string;
  onLogout: () => void;
}

const CustomerHeader: React.FC<CustomerHeaderProps> = ({ customerName, onLogout }) => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-shrink-0">
            <img 
              src="/SLTMobitel_Logo.svg.png" 
              alt="SLT Mobitel" 
              className="h-8 sm:h-10 w-auto flex-shrink-0"
            />
            <div className="hidden sm:block min-w-0">
              <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate">ConsentHub</h1>
              <p className="text-xs sm:text-sm text-gray-500">Customer Portal</p>
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Language Selector - Hidden on mobile to save space */}
            <div className="hidden sm:flex items-center">
              <LanguageSelector />
            </div>

            {/* Notifications */}
            <div className="flex items-center">
              <button className="relative p-2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg transition-colors">
                <Bell className="w-5 h-5 sm:w-6 sm:h-6" />
                <span className="absolute -top-1 -right-1 block h-3 w-3 rounded-full bg-red-400 ring-2 ring-white"></span>
              </button>
            </div>

            {/* User Profile */}
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex flex-col text-right min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate max-w-[8rem] lg:max-w-[12rem]">{customerName}</p>
                <p className="text-xs text-gray-500">Customer</p>
              </div>
              <div className="w-8 h-8 sm:w-9 sm:h-9 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              </div>
            </div>

            {/* Logout Button */}
            <div className="flex items-center">
              <button
                onClick={onLogout}
                className="flex items-center gap-1 sm:gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile Language Selector */}
        <div className="sm:hidden pb-3 border-t border-gray-100 pt-3">
          <div className="flex items-center justify-center">
            <LanguageSelector />
          </div>
        </div>
      </div>
    </header>
  );
};

export default CustomerHeader;
