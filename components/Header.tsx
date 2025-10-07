'use client';

import React from 'react';
import { LogOut, Shield, User } from 'lucide-react';
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
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <Image 
                src="/logo.jpg" 
                alt="AIFARMS Logo" 
                width={120} 
                height={36}
                className="h-9 w-auto rounded"
              />
              <div className="h-8 w-px bg-gray-300"></div>
              <h1 className="text-xl font-bold text-gray-900">
                AI Agribench Review Form
              </h1>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              {userType === 'admin' ? (
                <Shield className="h-4 w-4 text-purple-600" />
              ) : (
                <User className="h-4 w-4 text-blue-600" />
              )}
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">
                  {user?.name}
                </div>
                <div className="text-xs text-gray-500 capitalize">
                  {userType === 'admin' ? 'Administrator' : 'Reviewer'}
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-100"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 