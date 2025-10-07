'use client';

import React, { useState, useEffect } from 'react';
import { BarChart3, Users, CheckCircle, AlertTriangle, TrendingUp, FileText, Download, Database } from 'lucide-react';
import { 
  getAdminOverview, 
  getAllReviewersStats, 
  getCategoryAnalytics, 
  getQualityInsights,
  getAllResponses,
  AdminOverview,
  AdminReviewerStats,
  CategoryAnalytics,
  QualityInsights,
  AllResponses
} from '@/lib/api';
import toast from 'react-hot-toast';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [reviewers, setReviewers] = useState<AdminReviewerStats[]>([]);
  const [categories, setCategories] = useState<CategoryAnalytics[]>([]);
  const [qualityInsights, setQualityInsights] = useState<QualityInsights | null>(null);
  const [allResponses, setAllResponses] = useState<AllResponses | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadedTabs, setLoadedTabs] = useState<Set<string>>(new Set());

  // Load data only for the active tab
  useEffect(() => {
    loadTabData(activeTab);
  }, [activeTab]);

  const loadTabData = async (tab: string) => {
    // Skip if already loaded
    if (loadedTabs.has(tab)) return;

    setIsLoading(true);
    try {
      switch (tab) {
        case 'overview':
          const overviewRes = await getAdminOverview();
          setOverview(overviewRes);
          break;
        case 'reviewers':
          const reviewersRes = await getAllReviewersStats();
          setReviewers(reviewersRes.reviewers);
          break;
        case 'categories':
          const categoriesRes = await getCategoryAnalytics();
          setCategories(categoriesRes.categories);
          break;
        case 'quality':
          const qualityRes = await getQualityInsights();
          setQualityInsights(qualityRes);
          break;
        case 'responses':
          const responsesRes = await getAllResponses();
          setAllResponses(responsesRes);
          break;
      }
      
      setLoadedTabs(prev => new Set(prev).add(tab));
    } catch (error: any) {
      console.error(`Failed to load ${tab} data:`, error);
      console.error('Error details:', error.response?.data || error.message);
      toast.error(`Failed to load ${tab} data: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'reviewers', label: 'Reviewers', icon: Users },
    { id: 'categories', label: 'Categories', icon: FileText },
    { id: 'quality', label: 'Quality Insights', icon: TrendingUp },
    { id: 'responses', label: 'All Responses', icon: Database },
  ];

  // Loading component for tab content
  const LoadingTab = () => (
    <div className="flex items-center justify-center py-20">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading data...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">AI Agribench Admin Dashboard</h1>
            <p className="text-gray-600">Comprehensive overview of the AI Agribench Review System</p>
          </div>
          <button
            onClick={() => {
              setLoadedTabs(new Set());
              loadTabData(activeTab);
            }}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <svg className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Refresh Data</span>
          </button>
        </div>

        {/* Navigation */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    isActive
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        {isLoading ? (
          <LoadingTab />
        ) : (
          <>
            {activeTab === 'overview' && <OverviewTab overview={overview} />}
            {activeTab === 'reviewers' && <ReviewersTab reviewers={reviewers} />}
            {activeTab === 'categories' && <CategoriesTab categories={categories} />}
            {activeTab === 'quality' && <QualityTab qualityInsights={qualityInsights} />}
            {activeTab === 'responses' && <ResponsesTab allResponses={allResponses} />}
          </>
        )}
      </div>
    </div>
  );
};

// Overview Tab Component
const OverviewTab: React.FC<{ overview: AdminOverview | null }> = ({ overview }) => {
  if (!overview) return null;

  const { overview: stats, rating_distribution, recent_activity } = overview;

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Reviewers</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total_reviewers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <FileText className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Q&A Pairs</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total_qnas.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Reviews Completed</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total_reviews}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completion Rate</p>
              <p className="text-2xl font-bold text-gray-900">{stats.completion_rate}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Rating Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Answer Quality Distribution</h3>
          <div className="space-y-3">
            {Object.entries(rating_distribution).map(([rating, count]) => {
              const percentage = (count / stats.total_reviews * 100);
              const color = rating === 'GOOD' ? 'bg-green-500' : 
                           rating === 'CLOSE-BUT-FIXABLE' ? 'bg-yellow-500' : 'bg-red-500';
              
              return (
                <div key={rating} className="flex items-center">
                  <div className="w-24 text-sm text-gray-600">{rating}</div>
                  <div className="flex-1 bg-gray-200 rounded-full h-4 mr-4">
                    <div 
                      className={`h-4 rounded-full ${color}`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <div className="w-16 text-sm text-gray-900">{count} ({percentage.toFixed(1)}%)</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {recent_activity.map((activity, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{activity.reviewer_name}</p>
                  <p className="text-sm text-gray-600 truncate">{activity.question_preview}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`text-xs px-2 py-1 rounded ${
                      activity.rating === 'GOOD' ? 'bg-green-100 text-green-800' :
                      activity.rating === 'CLOSE-BUT-FIXABLE' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {activity.rating}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(activity.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Reviewers Tab Component
const ReviewersTab: React.FC<{ reviewers: AdminReviewerStats[] }> = ({ reviewers }) => {
  const [sortField, setSortField] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      // Default to descending for numerical fields, ascending for text fields
      const isNumericalField = ['progress', 'expertise'].includes(field);
      setSortDirection(isNumericalField ? 'desc' : 'asc');
    }
    setCurrentPage(1); // Reset to first page when sorting changes
  };

  const sortedReviewers = [...reviewers].sort((a, b) => {
    if (!sortField) return 0;
    
    let aValue: any;
    let bValue: any;
    
    switch (sortField) {
      case 'name':
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      case 'progress':
        aValue = a.completion_rate;
        bValue = b.completion_rate;
        break;
      case 'expertise':
        aValue = a.expertise_rate;
        bValue = b.expertise_rate;
        break;
      case 'joined':
        aValue = new Date(a.joined_at).getTime();
        bValue = new Date(b.joined_at).getTime();
        break;
      default:
        return 0;
    }
    
    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  // Pagination
  const totalPages = Math.ceil(sortedReviewers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedReviewers = sortedReviewers.slice(startIndex, endIndex);

  const getSortIcon = (field: string) => {
    if (sortField !== field) {
      return <span className="text-gray-400">↕</span>;
    }
    return sortDirection === 'asc' ? <span className="text-blue-600">↑</span> : <span className="text-blue-600">↓</span>;
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Reviewer Performance</h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center space-x-1">
                  <span>Reviewer</span>
                  {getSortIcon('name')}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('progress')}
              >
                <div className="flex items-center space-x-1">
                  <span>Progress</span>
                  {getSortIcon('progress')}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('expertise')}
              >
                <div className="flex items-center space-x-1">
                  <span>Expertise Rate</span>
                  {getSortIcon('expertise')}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('joined')}
              >
                <div className="flex items-center space-x-1">
                  <span>Joined</span>
                  {getSortIcon('joined')}
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedReviewers.map((reviewer) => (
              <tr key={reviewer.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{reviewer.name}</div>
                    <div className="text-sm text-gray-500">{reviewer.email}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-1 bg-gray-200 rounded-full h-2 mr-3">
                      <div 
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${reviewer.completion_rate}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-900">
                      {reviewer.total_reviewed}/{reviewer.total_assigned} ({reviewer.completion_rate}%)
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-900">{reviewer.expertise_rate}%</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(reviewer.joined_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Pagination Controls */}
      <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-700">
            Showing {startIndex + 1} to {Math.min(endIndex, sortedReviewers.length)} of {sortedReviewers.length} reviewers
          </span>
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm"
          >
            <option value={10}>10 per page</option>
            <option value={20}>20 per page</option>
            <option value={50}>50 per page</option>
            <option value={100}>100 per page</option>
          </select>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded-md border border-gray-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            First
          </button>
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded-md border border-gray-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Previous
          </button>
          <span className="px-3 py-1 text-sm text-gray-700">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 rounded-md border border-gray-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Next
          </button>
          <button
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 rounded-md border border-gray-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Last
          </button>
        </div>
      </div>
    </div>
  );
};

// Categories Tab Component
const CategoriesTab: React.FC<{ categories: CategoryAnalytics[] }> = ({ categories }) => {
  const [sortField, setSortField] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      // Default to descending for numerical fields, ascending for text fields
      const isNumericalField = ['completion', 'expertise', 'reviews'].includes(field);
      setSortDirection(isNumericalField ? 'desc' : 'asc');
    }
    setCurrentPage(1);
  };

  const sortedCategories = [...categories].sort((a, b) => {
    if (!sortField) return 0;
    
    let aValue: any;
    let bValue: any;
    
    switch (sortField) {
      case 'name':
        aValue = a.category.toLowerCase();
        bValue = b.category.toLowerCase();
        break;
      case 'completion':
        aValue = a.completion_rate;
        bValue = b.completion_rate;
        break;
      case 'expertise':
        aValue = a.expertise_rate;
        bValue = b.expertise_rate;
        break;
      case 'reviews':
        aValue = a.total_reviewed;
        bValue = b.total_reviewed;
        break;
      default:
        return 0;
    }
    
    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  // Pagination
  const totalPages = Math.ceil(sortedCategories.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCategories = sortedCategories.slice(startIndex, endIndex);

  const getSortIcon = (field: string) => {
    if (sortField !== field) {
      return <span className="text-gray-400">↕</span>;
    }
    return sortDirection === 'asc' ? <span className="text-blue-600">↑</span> : <span className="text-blue-600">↓</span>;
  };

  return (
    <div className="space-y-6">
      {/* Sort Controls */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-gray-700">Sort by:</span>
          <button
            onClick={() => handleSort('name')}
            className="flex items-center space-x-1 px-3 py-1 text-sm border rounded hover:bg-gray-50 transition-colors text-gray-700 hover:text-gray-900"
          >
            <span>Name</span>
            {getSortIcon('name')}
          </button>
          <button
            onClick={() => handleSort('completion')}
            className="flex items-center space-x-1 px-3 py-1 text-sm border rounded hover:bg-gray-50 transition-colors text-gray-700 hover:text-gray-900"
          >
            <span>Completion Rate</span>
            {getSortIcon('completion')}
          </button>
          <button
            onClick={() => handleSort('expertise')}
            className="flex items-center space-x-1 px-3 py-1 text-sm border rounded hover:bg-gray-50 transition-colors text-gray-700 hover:text-gray-900"
          >
            <span>Expertise Rate</span>
            {getSortIcon('expertise')}
          </button>
          <button
            onClick={() => handleSort('reviews')}
            className="flex items-center space-x-1 px-3 py-1 text-sm border rounded hover:bg-gray-50 transition-colors text-gray-700 hover:text-gray-900"
          >
            <span>Total Reviews</span>
            {getSortIcon('reviews')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {paginatedCategories.map((category) => (
        <div key={category.category_id} className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{category.category}</h3>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{category.completion_rate}%</div>
              <div className="text-sm text-gray-600">Completion Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{category.expertise_rate}%</div>
              <div className="text-sm text-gray-600">Expertise Rate</div>
            </div>
          </div>

          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Reviews: <span className="text-gray-900">{category.total_reviewed}/{category.total_assigned}</span></span>
              <span className="text-gray-600">QNAs: <span className="text-gray-900">{category.total_qnas}</span></span>
            </div>
          </div>

          {Object.keys(category.common_issues).length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Common Issues</h4>
              <div className="space-y-1">
                {Object.entries(category.common_issues).slice(0, 3).map(([issue, count]) => (
                  <div key={issue} className="text-sm text-gray-600">
                    • {issue}: {count} times
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
      </div>

      {/* Pagination Controls */}
      <div className="mt-6 bg-white rounded-lg shadow px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-700">
            Showing {startIndex + 1} to {Math.min(endIndex, sortedCategories.length)} of {sortedCategories.length} categories
          </span>
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm"
          >
            <option value={10}>10 per page</option>
            <option value={20}>20 per page</option>
            <option value={50}>50 per page</option>
          </select>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded-md border border-gray-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            First
          </button>
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded-md border border-gray-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Previous
          </button>
          <span className="px-3 py-1 text-sm text-gray-700">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 rounded-md border border-gray-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Next
          </button>
          <button
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 rounded-md border border-gray-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Last
          </button>
        </div>
      </div>
    </div>
  );
};

// Quality Tab Component
const QualityTab: React.FC<{ qualityInsights: QualityInsights | null }> = ({ qualityInsights }) => {
  if (!qualityInsights) return null;

  return (
    <div className="space-y-6">
      {/* Issue Frequency */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Most Common Issues</h3>
        <div className="space-y-3">
          {Object.entries(qualityInsights.issue_frequency).slice(0, 10).map(([issue, count]) => {
            const percentage = (count / qualityInsights.total_quality_reviews * 100);
            
            return (
              <div key={issue} className="flex items-center">
                <div className="w-48 text-sm text-gray-700">{issue}</div>
                <div className="flex-1 bg-gray-200 rounded-full h-3 mr-4">
                  <div 
                    className="bg-red-500 h-3 rounded-full"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <div className="w-20 text-sm text-gray-900">{count} ({percentage.toFixed(1)}%)</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Problematic Questions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Most Problematic Questions</h3>
        <div className="space-y-4">
          {qualityInsights.problematic_questions.length > 0 ? (
            qualityInsights.problematic_questions.map((question, index) => (
              <div key={question.qna_id} className="border-l-4 border-red-400 pl-4 py-2">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm font-medium text-gray-900">#{index + 1} - {question.qna_id}</span>
                  <div className="flex space-x-2">
                    <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
                      Avg: {question.avg_rating}/3
                    </span>
                    <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                      {question.review_count} reviews
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-2">{question.question}</p>
                <div className="flex flex-wrap gap-1">
                  {question.categories.map((cat, idx) => (
                    <span key={idx} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                      {cat.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No problematic questions found yet.</p>
              <p className="text-sm">Questions need at least 3 reviews to appear here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Responses Tab Component
const ResponsesTab: React.FC<{ allResponses: AllResponses | null }> = ({ allResponses }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  if (!allResponses) return (
    <div className="flex items-center justify-center py-12">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading responses...</p>
      </div>
    </div>
  );

  // Pagination
  const totalPages = Math.ceil(allResponses.responses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedResponses = allResponses.responses.slice(startIndex, endIndex);

  const downloadJSON = () => {
    const dataStr = JSON.stringify(allResponses.responses, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `expert-responses-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('JSON file downloaded successfully!');
  };

  const downloadCSV = () => {
    const headers = [
      'QNA ID', 'Question', 'Answer', 'Categories', 'Document ID', 'Reason',
      'Reviewer Name', 'Reviewer Email', 'Has Expertise', 'Question Reasonable',
      'Question Properly Phrased', 'Answer Rating', 'Answer Issues', 'Other Weakness Explanation',
      'Review Created At', 'Review Updated At'
    ];

    const csvContent = [
      headers.join(','),
      ...allResponses.responses.map(response => [
        `"${response.qna_id}"`,
        `"${response.question.replace(/"/g, '""')}"`,
        `"${response.answer.replace(/"/g, '""')}"`,
        `"${response.categories.join('; ')}"`,
        `"${response.document_id || ''}"`,
        `"${response.reason || ''}"`,
        `"${response.reviewer_name}"`,
        `"${response.reviewer_email}"`,
        response.has_expertise ? 'Yes' : 'No',
        response.question_reasonable ? 'Yes' : 'No',
        response.question_properly_phrased ? 'Yes' : 'No',
        `"${response.answer_rating || ''}"`,
        `"${response.answer_issues ? response.answer_issues.join('; ') : ''}"`,
        `"${response.other_weakness_explanation || ''}"`,
        `"${response.review_created_at}"`,
        `"${response.review_updated_at}"`
      ].join(','))
    ].join('\n');

    const dataBlob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `expert-responses-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('CSV file downloaded successfully!');
  };

  const downloadExcel = () => {
    // For Excel, we'll create a CSV with proper encoding that Excel can read
    const headers = [
      'QNA ID', 'Question', 'Answer', 'Categories', 'Document ID', 'Reason',
      'Reviewer Name', 'Reviewer Email', 'Has Expertise', 'Question Reasonable',
      'Question Properly Phrased', 'Answer Rating', 'Answer Issues', 'Other Weakness Explanation',
      'Review Created At', 'Review Updated At'
    ];

    const csvContent = [
      headers.join('\t'),
      ...allResponses.responses.map(response => [
        response.qna_id,
        response.question.replace(/\t/g, ' '),
        response.answer.replace(/\t/g, ' '),
        response.categories.join('; '),
        response.document_id || '',
        response.reason || '',
        response.reviewer_name,
        response.reviewer_email,
        response.has_expertise ? 'Yes' : 'No',
        response.question_reasonable ? 'Yes' : 'No',
        response.question_properly_phrased ? 'Yes' : 'No',
        response.answer_rating || '',
        response.answer_issues ? response.answer_issues.join('; ') : '',
        response.other_weakness_explanation || '',
        response.review_created_at,
        response.review_updated_at
      ].join('\t'))
    ].join('\n');

    const dataBlob = new Blob([csvContent], { type: 'text/tab-separated-values;charset=utf-8;' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `expert-responses-${new Date().toISOString().split('T')[0]}.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Excel file downloaded successfully!');
  };

  return (
    <div className="space-y-6">
      {/* Header with download buttons */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">All Expert Responses</h3>
            <p className="text-sm text-gray-600">
              Total responses: {allResponses.total_responses}
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={downloadJSON}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Download JSON</span>
            </button>
            <button
              onClick={downloadCSV}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Download CSV</span>
            </button>
            <button
              onClick={downloadExcel}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Download Excel</span>
            </button>
          </div>
        </div>
      </div>

      {/* Responses Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  QNA ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Question Preview
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reviewer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expertise
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rating
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Updated
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedResponses.map((response, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {response.qna_id}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div className="max-w-xs truncate" title={response.question}>
                      {response.question}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{response.reviewer_name}</div>
                      <div className="text-sm text-gray-500">{response.reviewer_email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      response.has_expertise 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {response.has_expertise ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {response.answer_rating ? (
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        response.answer_rating === 'GOOD' ? 'bg-green-100 text-green-800' :
                        response.answer_rating === 'CLOSE-BUT-FIXABLE' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {response.answer_rating}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-500">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(response.review_updated_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-700">
              Showing {startIndex + 1} to {Math.min(endIndex, allResponses.responses.length)} of {allResponses.responses.length} responses
            </span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm"
            >
              <option value={10}>10 per page</option>
              <option value={20}>20 per page</option>
              <option value={50}>50 per page</option>
              <option value={100}>100 per page</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded-md border border-gray-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              First
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded-md border border-gray-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            <span className="px-3 py-1 text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded-md border border-gray-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded-md border border-gray-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Last
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 