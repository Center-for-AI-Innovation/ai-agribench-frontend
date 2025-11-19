'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Assignment, ReviewerStats } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  userType: 'reviewer' | 'admin' | 'qna_editor' | null;
  pendingQuestions: Assignment[];
  reviewedQuestions: Assignment[];
  stats: ReviewerStats | null;
  isLoading: boolean;
  isInitializing: boolean;
  error: string | null;
  login: (user: User, userType: 'reviewer' | 'admin' | 'qna_editor') => void;
  logout: () => void;
  setPendingQuestions: (questions: Assignment[]) => void;
  setReviewedQuestions: (questions: Assignment[]) => void;
  setStats: (stats: ReviewerStats) => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
  moveQuestionToReviewed: (assignmentId: number, review: any) => void;
  moveQuestionToPending: (assignmentId: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userType, setUserType] = useState<'reviewer' | 'admin' | 'qna_editor' | null>(null);
  const [pendingQuestions, setPendingQuestionsState] = useState<Assignment[]>([]);
  const [reviewedQuestions, setReviewedQuestionsState] = useState<Assignment[]>([]);
  const [stats, setStatsState] = useState<ReviewerStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Restore session from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('review_app_user');
    const storedUserType = localStorage.getItem('review_app_user_type');
    
    if (storedUser && storedUserType) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setUserType(storedUserType as 'reviewer' | 'admin' | 'qna_editor');
      } catch (error) {
        console.error('Failed to restore session:', error);
        // Clear invalid data
        localStorage.removeItem('review_app_user');
        localStorage.removeItem('review_app_user_type');
      }
    }
    
    // Mark initialization as complete
    setIsInitializing(false);
  }, []);

  const login = (userData: User, userTypeData: 'reviewer' | 'admin' | 'qna_editor') => {
    setUser(userData);
    setUserType(userTypeData);
    setError(null);
    
    // Persist to localStorage
    localStorage.setItem('review_app_user', JSON.stringify(userData));
    localStorage.setItem('review_app_user_type', userTypeData);
  };

  const logout = () => {
    setUser(null);
    setUserType(null);
    setPendingQuestionsState([]);
    setReviewedQuestionsState([]);
    setStatsState(null);
    setError(null);
    
    // Clear localStorage
    localStorage.removeItem('review_app_user');
    localStorage.removeItem('review_app_user_type');
  };

  const setPendingQuestions = (questions: Assignment[]) => {
    setPendingQuestionsState(questions);
  };

  const setReviewedQuestions = (questions: Assignment[]) => {
    setReviewedQuestionsState(questions);
  };

  const setStats = (statsData: ReviewerStats) => {
    setStatsState(statsData);
  };

  const setLoading = (loading: boolean) => {
    setIsLoading(loading);
  };

  const moveQuestionToReviewed = (assignmentId: number, review: any) => {
    // Find and remove from pending
    const questionIndex = pendingQuestions.findIndex(q => q.assignment_id === assignmentId);
    if (questionIndex !== -1) {
      const question = { ...pendingQuestions[questionIndex] };
      question.review = { ...review, updated_at: new Date().toISOString() };
      
      // Update state
      setPendingQuestionsState(prev => prev.filter((_, index) => index !== questionIndex));
      setReviewedQuestionsState(prev => [question, ...prev]);
    }
  };

  const moveQuestionToPending = (assignmentId: number) => {
    // Find and remove from reviewed
    const questionIndex = reviewedQuestions.findIndex(q => q.assignment_id === assignmentId);
    if (questionIndex !== -1) {
      const question = { ...reviewedQuestions[questionIndex] };
      // Keep the review data so the form can be populated with existing answers
      
      // Update state
      setReviewedQuestionsState(prev => prev.filter((_, index) => index !== questionIndex));
      setPendingQuestionsState(prev => [question, ...prev]);
    }
  };

  const value: AuthContextType = {
    user,
    userType,
    pendingQuestions,
    reviewedQuestions,
    stats,
    isLoading,
    isInitializing,
    error,
    login,
    logout,
    setPendingQuestions,
    setReviewedQuestions,
    setStats,
    setError,
    setLoading,
    moveQuestionToReviewed,
    moveQuestionToPending,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 