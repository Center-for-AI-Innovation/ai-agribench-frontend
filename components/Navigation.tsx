'use client';

import React from 'react';
import { Edit, CheckCircle, Clock, BarChart3, BookOpen } from 'lucide-react';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  pendingCount: number;
  reviewedCount: number;
  onShowInstructions?: () => void;
}

const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onTabChange,
  pendingCount,
  reviewedCount,
  onShowInstructions,
}) => {
  const tabs = [
    {
      id: 'review',
      label: 'Review Questions',
      icon: Edit,
    },
    {
      id: 'reviewed',
      label: 'Reviewed',
      icon: CheckCircle,
      count: reviewedCount,
    },
    {
      id: 'pending',
      label: 'Pending',
      icon: Clock,
      count: pendingCount,
    },
    {
      id: 'stats',
      label: 'Statistics',
      icon: BarChart3,
    },
  ];

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
          <div className="flex overflow-x-auto scrollbar-hide -mx-4 sm:mx-0 sm:space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`relative flex items-center space-x-2 px-2 sm:px-3 py-3 sm:py-4 text-sm font-medium transition-colors border-b-2 whitespace-nowrap flex-shrink-0 min-h-[44px] ${
                    isActive
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden text-xs">{tab.label.split(' ')[0]}</span>
                  {tab.count !== undefined && (
                    <span className={`ml-1 sm:ml-2 px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs rounded-full flex-shrink-0 ${
                      isActive
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          
          {onShowInstructions && (
            <button
              onClick={onShowInstructions}
              className="flex items-center space-x-2 px-2 sm:px-3 py-3 sm:py-4 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors min-h-[44px] mt-2 sm:mt-0 border-t sm:border-t-0 border-gray-200 sm:border-0"
            >
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Instructions</span>
              <span className="sm:hidden">Help</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation; 