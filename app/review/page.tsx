'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { AuthProvider } from '@/lib/AuthContext';
import LoginForm from '@/components/LoginForm';
import Header from '@/components/Header';
import Navigation from '@/components/Navigation';
import ReviewForm from '@/components/ReviewForm';
import QuestionList from '@/components/QuestionList';
import StatsDisplay from '@/components/StatsDisplay';
import AdminDashboard from '@/components/AdminDashboard';
import Instructions from '@/components/Instructions';
import { 
  getPendingQuestions, 
  getReviewedQuestions, 
  getReviewerStats,
  submitReview,
  ReviewSubmission 
} from '@/lib/api';
import toast from 'react-hot-toast';

function ReviewPageContent() {
  const { 
    user,
    userType,
    pendingQuestions, 
    reviewedQuestions, 
    stats,
    isLoading,
    isInitializing,
    setPendingQuestions, 
    setReviewedQuestions, 
    setStats,
    setLoading,
    moveQuestionToReviewed,
    moveQuestionToPending
  } = useAuth();

  const [activeTab, setActiveTab] = useState('review');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSeenInstructions, setHasSeenInstructions] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [isFirstTimeUser, setIsFirstTimeUser] = useState<boolean | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Check if user has seen instructions before
  useEffect(() => {
    if (user && userType === 'reviewer') {
      const storageKey = `instructions_seen_${user.email}`;
      const hasSeenBefore = localStorage.getItem(storageKey) === 'true';
      setIsFirstTimeUser(!hasSeenBefore);
      setHasSeenInstructions(hasSeenBefore);
      
      // Load data immediately for all users
      loadInitialData();
    }
  }, [user, userType]);

  const loadInitialData = async () => {
    if (!user || userType !== 'reviewer') return;
    
    setLoading(true);
    setIsLoadingData(true);
    try {
      const [pendingRes, reviewedRes, statsRes] = await Promise.all([
        getPendingQuestions(user.id),
        getReviewedQuestions(user.id),
        getReviewerStats(user.id),
      ]);

      
      setPendingQuestions(pendingRes.questions);
      setReviewedQuestions(reviewedRes.questions);
      setStats(statsRes);
    } catch (error) {
      console.error('Failed to load initial data:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url
      });
      toast.error('Failed to load data. Please refresh the page.');
    } finally {
      setLoading(false);
      setIsLoadingData(false);
    }
  };

  const handleSaveReview = async (reviewData: ReviewSubmission) => {
    setIsSubmitting(true);
    try {
      await submitReview(reviewData);
      
      // Move question from pending to reviewed in local state
      moveQuestionToReviewed(reviewData.assignment_id, reviewData);
      
      // Update current question index
      if (currentQuestionIndex >= pendingQuestions.length - 1) {
        setCurrentQuestionIndex(Math.max(0, pendingQuestions.length - 2));
      }
      
      // Refresh stats
      if (user && userType === 'reviewer') {
        try {
          const statsRes = await getReviewerStats(user.id);
          setStats(statsRes);
        } catch (error) {
          console.error('Failed to refresh stats:', error);
          console.error('Stats error details:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
            url: error.config?.url
          });
        }
      }
      
      toast.success('Review saved successfully!');
    } catch (error) {
      console.error('Failed to save review:', error);
      toast.error('Failed to save review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNextQuestion = () => {
    if (pendingQuestions.length > 1) {
      setCurrentQuestionIndex((prev) => 
        prev < pendingQuestions.length - 1 ? prev + 1 : 0
      );
    }
  };

  const handleQuestionClick = (question: any, index: number) => {
    if (activeTab === 'pending') {
      setCurrentQuestionIndex(index);
      setActiveTab('review');
    } else if (activeTab === 'reviewed') {
      // Move reviewed question back to pending for editing
      moveQuestionToPending(question.assignment_id);
      setCurrentQuestionIndex(0);
      setActiveTab('review');
      toast('Question moved to pending for editing', { icon: 'ℹ️' });
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const handleStartReview = () => {
    if (user) {
      const storageKey = `instructions_seen_${user.email}`;
      localStorage.setItem(storageKey, 'true');
    }
    setHasSeenInstructions(true);
    setIsFirstTimeUser(false);
  };

  const handleShowInstructions = () => {
    setShowInstructions(true);
  };

  const handleHideInstructions = () => {
    setShowInstructions(false);
  };

  // Show loading spinner while checking authentication
  if (isInitializing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If not logged in, show login form
  if (!user) {
    return <LoginForm />;
  }

  // If admin user, show admin dashboard
  if (userType === 'admin') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <AdminDashboard />
      </div>
    );
  }

  // For reviewers: handle loading states
  if (userType === 'reviewer') {
    // First-time users: show instructions immediately (data loads in background)
    if (isFirstTimeUser === true && !hasSeenInstructions) {
      return <Instructions onStart={handleStartReview} />;
    }

    // First-time users who clicked "Start": show loading if data not ready yet
    if (isFirstTimeUser === true && hasSeenInstructions && isLoadingData) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Almost Ready!</h2>
            <p className="text-gray-600">Setting up your review workspace...</p>
          </div>
        </div>
      );
    }

    // Returning users: show loading screen until data is ready
    if (isFirstTimeUser === false && isLoadingData) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Loading Your Questions</h2>
            <p className="text-gray-600">Please wait while we fetch your assigned reviews...</p>
          </div>
        </div>
      );
    }

    // Still determining if first-time user
    if (isFirstTimeUser === null) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
        </div>
      );
    }
  }

  // Regular reviewer interface (data loaded)
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Navigation 
        activeTab={activeTab}
        onTabChange={handleTabChange}
        pendingCount={pendingQuestions.length}
        reviewedCount={reviewedQuestions.length}
        onShowInstructions={handleShowInstructions}
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'review' && (
          <div>
            {pendingQuestions.length > 0 ? (
              <div className="space-y-6">
                {/* Progress indicator */}
                <div className="bg-white rounded-lg shadow p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      Progress: {reviewedQuestions.length} of {pendingQuestions.length + reviewedQuestions.length} questions reviewed
                    </span>
                    <span className="text-sm text-gray-500">
                      {Math.round((reviewedQuestions.length / (pendingQuestions.length + reviewedQuestions.length)) * 100)}%
                    </span>
                  </div>
                  <div className="bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${(reviewedQuestions.length / (pendingQuestions.length + reviewedQuestions.length)) * 100}%` 
                      }}
                    ></div>
                  </div>
                </div>

                <ReviewForm
                  question={pendingQuestions[currentQuestionIndex]}
                  onSave={handleSaveReview}
                  onNext={handleNextQuestion}
                  questionNumber={currentQuestionIndex + 1}
                  totalQuestions={pendingQuestions.length}
                  isSubmitting={isSubmitting}
                />
              </div>
            ) : (
              <div className="text-center py-12">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  All Questions Reviewed!
                </h3>
                <p className="text-gray-600">
                  You have completed all your assigned questions.
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'reviewed' && (
          <QuestionList
            questions={reviewedQuestions}
            title="Reviewed Questions"
            emptyMessage="Start reviewing questions to see them here."
            emptyIcon={<CheckCircle className="h-12 w-12" />}
            onQuestionClick={handleQuestionClick}
            showStatus={true}
          />
        )}

        {activeTab === 'pending' && (
          <QuestionList
            questions={pendingQuestions}
            title="Pending Questions"
            emptyMessage="All questions have been reviewed!"
            emptyIcon={<Clock className="h-12 w-12" />}
            onQuestionClick={handleQuestionClick}
          />
        )}

        {activeTab === 'stats' && (
          <StatsDisplay stats={stats} isLoading={isLoading} />
        )}
      </main>
      
      {/* Floating Instructions */}
      {showInstructions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Instructions</h2>
              <button
                onClick={handleHideInstructions}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
              <Instructions onStart={handleHideInstructions} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ReviewPage() {
  return (
    <AuthProvider>
      <ReviewPageContent />
    </AuthProvider>
  );
}
