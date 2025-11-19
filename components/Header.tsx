'use client';

import React from 'react';
import { LogOut, Shield, User, Edit2 } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import toast from 'react-hot-toast';
import Image from 'next/image';

const Header: React.FC = () => {
  const { user, userType, logout } = useAuth();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
  };

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-3 sm:py-0 sm:h-16 gap-3 sm:gap-0">
          <div className="flex items-center space-x-2 sm:space-x-4 min-w-0 flex-1">
            <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
              <Image 
                src="/logo.jpg" 
                alt="AIFARMS Logo" 
                width={120} 
                height={36}
                className="h-7 sm:h-9 w-auto rounded flex-shrink-0"
              />
              <div className="h-6 sm:h-8 w-px bg-gray-300 hidden sm:block"></div>
              <h1 className="text-base sm:text-xl font-bold text-gray-900 truncate">
                AI Agribench Review Form
              </h1>
            </div>
          </div>
          
          <div className="flex items-center justify-between sm:justify-end space-x-2 sm:space-x-4">
            <div className="flex items-center space-x-2 min-w-0">
              {userType === 'admin' ? (
                <Shield className="h-4 w-4 text-purple-600 flex-shrink-0" />
              ) : userType === 'qna_editor' ? (
                <Edit2 className="h-4 w-4 text-green-600 flex-shrink-0" />
              ) : (
                <User className="h-4 w-4 text-blue-600 flex-shrink-0" />
              )}
              <div className="text-right min-w-0">
                <div className="text-xs sm:text-sm font-medium text-gray-900 truncate max-w-[120px] sm:max-w-none">
                  {user?.name}
                </div>
                <div className="text-xs text-gray-500 capitalize hidden sm:block">
                  {userType === 'admin' ? 'Administrator' : userType === 'qna_editor' ? 'QnA Editor' : 'Reviewer'}
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-100 min-h-[44px] min-w-[44px] sm:min-w-0 justify-center sm:justify-start"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 