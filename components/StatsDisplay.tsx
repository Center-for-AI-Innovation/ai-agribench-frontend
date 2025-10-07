'use client';

import React from 'react';
import { ReviewerStats } from '@/lib/api';

interface StatsDisplayProps {
  stats: ReviewerStats | null;
  isLoading: boolean;
}

const StatsDisplay: React.FC<StatsDisplayProps> = ({ stats, isLoading }) => {

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-2 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No statistics available</p>
      </div>
    );
  }

  const overallPercentage = stats.total_assigned > 0 
    ? Math.round((stats.total_reviewed / stats.total_assigned) * 100) 
    : 0;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Review Statistics</h2>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* Overall Progress */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Overall Progress</h3>
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">
              {overallPercentage}%
            </div>
            <p className="text-gray-600">
              {stats.total_reviewed} of {stats.total_assigned} questions reviewed
            </p>
            <div className="mt-4 bg-gray-200 rounded-full h-3">
              <div 
                className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${overallPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>

               {/* Categories Progress */}
               <div className="bg-white rounded-lg shadow p-6">
                 <h3 className="text-lg font-semibold text-gray-900 mb-4">Categories Progress</h3>
                 <div className="space-y-4">
                   {stats.categories && Object.keys(stats.categories).length > 0 ? (
                     Object.entries(stats.categories).map(([category, data]) => {
                       // Handle different data structures
                       const total = typeof data === 'object' && data !== null ? data.total || 0 : 0;
                       const reviewed = typeof data === 'object' && data !== null ? data.reviewed || 0 : 0;

                       const categoryPercentage = total > 0
                         ? Math.round((reviewed / total) * 100)
                         : 0;

                       return (
                         <div key={category}>
                           <div className="flex justify-between items-center mb-1">
                             <span className="text-sm font-medium text-gray-700">
                               {category.replace(/_/g, ' ')}
                             </span>
                             <span className="text-sm text-gray-600">
                               {reviewed} / {total}
                             </span>
                           </div>
                           <div className="bg-gray-200 rounded-full h-2">
                             <div
                               className="bg-green-500 h-2 rounded-full transition-all duration-300"
                               style={{ width: `${categoryPercentage}%` }}
                             ></div>
                           </div>
                           <div className="text-xs text-gray-500 mt-1">
                             {categoryPercentage}% complete
                           </div>
                         </div>
                       );
                     })
                   ) : (
                     <div className="text-center py-6">
                       <div className="text-gray-400 mb-2">
                         <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                         </svg>
                       </div>
                       <p className="text-gray-500 text-sm font-medium">No category data available</p>
                       <p className="text-gray-400 text-xs mt-1">
                         The backend API is not returning category statistics yet.
                       </p>
                       <p className="text-gray-400 text-xs mt-1">
                         This feature requires backend support for category tracking.
                       </p>
                     </div>
                   )}
                 </div>
               </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-2xl font-bold text-green-600">
            {stats.total_reviewed}
          </div>
          <div className="text-sm text-gray-600">Completed</div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-2xl font-bold text-orange-600">
            {stats.remaining}
          </div>
          <div className="text-sm text-gray-600">Remaining</div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">
            {stats.total_assigned}
          </div>
          <div className="text-sm text-gray-600">Total Assigned</div>
        </div>
      </div>
    </div>
  );
};

export default StatsDisplay; 