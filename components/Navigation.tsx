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
        <div className="flex justify-between items-center">
          <div className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`relative flex items-center space-x-2 px-3 py-4 text-sm font-medium transition-colors border-b-2 ${
                  isActive
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
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
              className="flex items-center space-x-2 px-3 py-4 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
            >
              <BookOpen className="h-4 w-4" />
              <span>Instructions</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation; 