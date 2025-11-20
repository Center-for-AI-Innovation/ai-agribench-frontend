'use client';

import React, { useState, useEffect } from 'react';
import { getAllResponses, updateQnA, AllResponses } from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';
import { ChevronDown, ChevronRight, Search, Users, Save, X, Edit2 } from 'lucide-react';
import toast from 'react-hot-toast';

// Helper function to normalize ratings
const normalizeRating = (rating: string | undefined | null): string => {
  return rating || 'NOT GOOD';
};

// Helper function to check if QnA matches editor criteria
const matchesEditorCriteria = (questionGroup: {
  qna_id: string;
  question: string;
  answer: string;
  categories: string[];
  document_id?: string;
  reason?: string;
  reviews: Array<{
    reviewer_name: string;
    reviewer_email: string;
    has_expertise: boolean;
    question_reasonable?: boolean;
    question_properly_phrased?: boolean;
    answer_rating?: string;
    answer_issues?: string[];
    other_weakness_explanation?: string;
    review_created_at: string;
    review_updated_at: string;
  }>;
}): boolean => {
  const reviewsWithExpertise = questionGroup.reviews.filter(review => review.has_expertise === true);
  if (reviewsWithExpertise.length === 0) return false;
  
  const ratings = reviewsWithExpertise.map(review => normalizeRating(review.answer_rating));
  const goodCount = ratings.filter(r => r === 'GOOD').length;
  const cbfCount = ratings.filter(r => r === 'CLOSE-BUT-FIXABLE').length;
  const notGoodCount = ratings.filter(r => r === 'NOT GOOD').length;
  
  // Exclude if there's even 1 NOT GOOD rating
  if (notGoodCount > 0) return false;
  
  return goodCount >= 1 && goodCount <= 3 && cbfCount === 1;
};

// Calculate how many reviews per reviewer have CLOSE-BUT-FIXABLE rating
// Only for QA pairs displayed in the editor panel
const calculateCloseButFixableStats = (questionGroups: Array<{
  qna_id: string;
  question: string;
  answer: string;
  categories: string[];
  document_id?: string;
  reason?: string;
  reviews: Array<{
    reviewer_name: string;
    reviewer_email: string;
    has_expertise: boolean;
    question_reasonable?: boolean;
    question_properly_phrased?: boolean;
    answer_rating?: string;
    answer_issues?: string[];
    other_weakness_explanation?: string;
    review_created_at: string;
    review_updated_at: string;
  }>;
}>) => {
  const reviewerStats: Record<string, {
    name: string;
    email: string;
    closeButFixableCount: number;
    totalReviews: number;
  }> = {};

  // Only process reviews from displayed QA pairs
  questionGroups.forEach((questionGroup) => {
    questionGroup.reviews.forEach((review) => {
      const reviewerKey = review.reviewer_email;
      
      if (!reviewerStats[reviewerKey]) {
        reviewerStats[reviewerKey] = {
          name: review.reviewer_name,
          email: review.reviewer_email,
          closeButFixableCount: 0,
          totalReviews: 0,
        };
      }

      reviewerStats[reviewerKey].totalReviews++;

      // Only count if reviewer has expertise and rating is CLOSE-BUT-FIXABLE
      if (review.has_expertise && normalizeRating(review.answer_rating) === 'CLOSE-BUT-FIXABLE') {
        reviewerStats[reviewerKey].closeButFixableCount++;
      }
    });
  });

  // Log the statistics
  console.log('=== CLOSE-BUT-FIXABLE Reviews per Reviewer (Editor Panel Only) ===');
  console.log(`Calculated from ${questionGroups.length} displayed QA pairs`);
  const sortedReviewers = Object.values(reviewerStats).sort(
    (a, b) => b.closeButFixableCount - a.closeButFixableCount
  );
  
  if (sortedReviewers.length === 0) {
    console.log('No reviewers found in displayed QA pairs.');
  } else {
    sortedReviewers.forEach((reviewer) => {
      console.log(
        `${reviewer.name} (${reviewer.email}): ${reviewer.closeButFixableCount} CLOSE-BUT-FIXABLE reviews out of ${reviewer.totalReviews} total reviews`
      );
    });
    
    const totalCloseButFixable = sortedReviewers.reduce((sum, r) => sum + r.closeButFixableCount, 0);
    console.log(`\nTotal CLOSE-BUT-FIXABLE reviews: ${totalCloseButFixable}`);
  }
  console.log('==========================================\n');
};

const QnAEditor: React.FC = () => {
  const { user } = useAuth();
  const [allResponses, setAllResponses] = useState<AllResponses | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [editingQnaId, setEditingQnaId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{ question: string; answer: string } | null>(null);
  const [savingQnaId, setSavingQnaId] = useState<string | null>(null);
  const [selectedReviewer, setSelectedReviewer] = useState<string | null>(null);

  useEffect(() => {
    loadQnAs();
  }, []);

  // Calculate stats for displayed QA pairs whenever data, search query, or selected reviewer changes
  useEffect(() => {
    if (!allResponses || isLoading) return;

    // Group responses by qna_id (same logic as in render)
    const groupedByQna = allResponses.responses.reduce((acc, response) => {
      if (!acc[response.qna_id]) {
        acc[response.qna_id] = {
          qna_id: response.qna_id,
          question: response.question,
          answer: response.answer,
          categories: response.categories,
          document_id: response.document_id,
          reason: response.reason,
          reviews: []
        };
      }
      acc[response.qna_id].reviews.push({
        reviewer_name: response.reviewer_name,
        reviewer_email: response.reviewer_email,
        has_expertise: response.has_expertise,
        question_reasonable: response.question_reasonable,
        question_properly_phrased: response.question_properly_phrased,
        answer_rating: response.answer_rating,
        answer_issues: response.answer_issues,
        other_weakness_explanation: response.other_weakness_explanation,
        review_created_at: response.review_created_at,
        review_updated_at: response.review_updated_at
      });
      return acc;
    }, {} as Record<string, {
      qna_id: string;
      question: string;
      answer: string;
      categories: string[];
      document_id?: string;
      reason?: string;
      reviews: Array<{
        reviewer_name: string;
        reviewer_email: string;
        has_expertise: boolean;
        question_reasonable?: boolean;
        question_properly_phrased?: boolean;
        answer_rating?: string;
        answer_issues?: string[];
        other_weakness_explanation?: string;
        review_created_at: string;
        review_updated_at: string;
      }>;
    }>);

    // Filter by editor criteria
    const questionGroups = Object.values(groupedByQna).filter(matchesEditorCriteria);

    // Apply search filter
    const searchFiltered = questionGroups.filter(questionGroup => {
      if (!searchQuery.trim()) return true;
      
      const query = searchQuery.toLowerCase().trim();
      const searchableText = [
        questionGroup.qna_id.toLowerCase(),
        questionGroup.question.toLowerCase(),
        questionGroup.answer.toLowerCase(),
        ...questionGroup.categories.map(cat => cat.replace(/_/g, ' ').toLowerCase())
      ].join(' ');
      
      return searchableText.includes(query);
    });

    // Apply reviewer filter if selected
    const finalFiltered = selectedReviewer
      ? searchFiltered.filter((questionGroup) => {
          return questionGroup.reviews.some(
            (review) =>
              review.reviewer_email === selectedReviewer &&
              review.has_expertise &&
              normalizeRating(review.answer_rating) === 'CLOSE-BUT-FIXABLE'
          );
        })
      : searchFiltered;

    // Calculate and log stats for displayed QA pairs (only if a reviewer is selected)
    if (selectedReviewer) {
      calculateCloseButFixableStats(finalFiltered);
    } else {
      calculateCloseButFixableStats(searchFiltered);
    }
  }, [allResponses, searchQuery, selectedReviewer, isLoading]);

  const loadQnAs = async () => {
    setIsLoading(true);
    try {
      const data = await getAllResponses();
      setAllResponses(data);
    } catch (error: any) {
      console.error('Failed to load QnAs:', error);
      toast.error('Failed to load QnAs. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading QnAs...</p>
        </div>
      </div>
    );
  }

  if (!allResponses) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center text-gray-500">
          <p>No QnAs available.</p>
        </div>
      </div>
    );
  }

  // Group responses by qna_id
  const groupedByQna = allResponses.responses.reduce((acc, response) => {
    if (!acc[response.qna_id]) {
      acc[response.qna_id] = {
        qna_id: response.qna_id,
        question: response.question,
        answer: response.answer,
        categories: response.categories,
        document_id: response.document_id,
        reason: response.reason,
        reviews: []
      };
    }
    acc[response.qna_id].reviews.push({
      reviewer_name: response.reviewer_name,
      reviewer_email: response.reviewer_email,
      has_expertise: response.has_expertise,
      question_reasonable: response.question_reasonable,
      question_properly_phrased: response.question_properly_phrased,
      answer_rating: response.answer_rating,
      answer_issues: response.answer_issues,
      other_weakness_explanation: response.other_weakness_explanation,
      review_created_at: response.review_created_at,
      review_updated_at: response.review_updated_at
    });
    return acc;
  }, {} as Record<string, {
    qna_id: string;
    question: string;
    answer: string;
    categories: string[];
    document_id?: string;
    reason?: string;
    reviews: Array<{
      reviewer_name: string;
      reviewer_email: string;
      has_expertise: boolean;
      question_reasonable?: boolean;
      question_properly_phrased?: boolean;
      answer_rating?: string;
      answer_issues?: string[];
      other_weakness_explanation?: string;
      review_created_at: string;
      review_updated_at: string;
    }>;
  }>);

  // Convert to array and filter by editor criteria
  const questionGroups = Object.values(groupedByQna).filter(matchesEditorCriteria);

  // Sort: first by reviewer count (3, 2, 1), then by qna_id
  const sortedQuestions = [...questionGroups].sort((a, b) => {
    if (b.reviews.length !== a.reviews.length) {
      return b.reviews.length - a.reviews.length;
    }
    return a.qna_id.localeCompare(b.qna_id, undefined, { numeric: true, sensitivity: 'base' });
  });

  // Apply search filter
  const searchFilteredQuestions = sortedQuestions.filter(questionGroup => {
    if (!searchQuery.trim()) return true;
    
    const query = searchQuery.toLowerCase().trim();
    const searchableText = [
      questionGroup.qna_id.toLowerCase(),
      questionGroup.question.toLowerCase(),
      questionGroup.answer.toLowerCase(),
      ...questionGroup.categories.map(cat => cat.replace(/_/g, ' ').toLowerCase())
    ].join(' ');
    
    return searchableText.includes(query);
  });

  // Get all reviewers who have marked questions as CLOSE-BUT-FIXABLE
  const reviewersWithCBF = new Map<string, { name: string; email: string; count: number }>();
  searchFilteredQuestions.forEach((questionGroup) => {
    questionGroup.reviews.forEach((review) => {
      if (review.has_expertise && normalizeRating(review.answer_rating) === 'CLOSE-BUT-FIXABLE') {
        const reviewerKey = review.reviewer_email;
        if (!reviewersWithCBF.has(reviewerKey)) {
          reviewersWithCBF.set(reviewerKey, {
            name: review.reviewer_name,
            email: review.reviewer_email,
            count: 0
          });
        }
        reviewersWithCBF.get(reviewerKey)!.count++;
      }
    });
  });

  // Sort reviewers by name
  const sortedReviewers = Array.from(reviewersWithCBF.values()).sort((a, b) => 
    a.name.localeCompare(b.name)
  );

  // Get QAs for each reviewer
  const getQAsForReviewer = (reviewerEmail: string) => {
    return searchFilteredQuestions.filter((questionGroup) => {
      return questionGroup.reviews.some(
        (review) =>
          review.reviewer_email === reviewerEmail &&
          review.has_expertise &&
          normalizeRating(review.answer_rating) === 'CLOSE-BUT-FIXABLE'
      );
    });
  };

  // Calculate statistics (based on search-filtered questions)
  const stats = {
    with3Reviewers: searchFilteredQuestions.filter(q => q.reviews.length === 3).length,
    with2Reviewers: searchFilteredQuestions.filter(q => q.reviews.length === 2).length,
    with1Reviewer: searchFilteredQuestions.filter(q => q.reviews.length === 1).length
  };

  const toggleExpanded = (qnaId: string) => {
    const newExpanded = new Set(expandedQuestions);
    if (newExpanded.has(qnaId)) {
      newExpanded.delete(qnaId);
      // Cancel editing if collapsing
      if (editingQnaId === qnaId) {
        setEditingQnaId(null);
        setEditValues(null);
      }
    } else {
      newExpanded.add(qnaId);
    }
    setExpandedQuestions(newExpanded);
  };

  const startEditing = (qnaId: string, question: string, answer: string) => {
    setEditingQnaId(qnaId);
    setEditValues({ question, answer });
  };

  const cancelEditing = () => {
    setEditingQnaId(null);
    setEditValues(null);
  };

  const handleSave = async (qnaId: string) => {
    if (!editValues) return;

    setSavingQnaId(qnaId);
    try {
      const response = await updateQnA(qnaId, editValues.question, editValues.answer);
      if (response.success) {
        toast.success('QnA updated successfully');
        // Update allResponses state
        setAllResponses(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            responses: prev.responses.map(r => {
              if (r.qna_id === qnaId) {
                return {
                  ...r,
                  question: editValues.question,
                  answer: editValues.answer
                };
              }
              return r;
            })
          };
        });
        setEditingQnaId(null);
        setEditValues(null);
      } else {
        toast.error(response.message || 'Failed to update QnA');
      }
    } catch (error: any) {
      console.error('Failed to update QnA:', error);
      toast.error('Failed to update QnA. Please try again.');
    } finally {
      setSavingQnaId(null);
    }
  };

  const truncateText = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="space-y-6">
        {/* Statistics Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Questions with 3 Reviewers</p>
                <p className="text-2xl font-bold text-gray-900">{stats.with3Reviewers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Questions with 2 Reviewers</p>
                <p className="text-2xl font-bold text-gray-900">{stats.with2Reviewers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Questions with 1 Reviewer</p>
                <p className="text-2xl font-bold text-gray-900">{stats.with1Reviewer}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Header with search */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">QnA Editor</h3>
            <p className="text-sm text-gray-600">
              {selectedReviewer ? (
                <>
                  Showing: {getQAsForReviewer(selectedReviewer).length} question{getQAsForReviewer(selectedReviewer).length !== 1 ? 's' : ''} marked as CLOSE-BUT-FIXABLE by {reviewersWithCBF.get(selectedReviewer)?.name || 'selected reviewer'}
                  {searchQuery && ' (also filtered by search)'}
                </>
              ) : (
                <>
                  Showing: {searchFilteredQuestions.length} of {sortedQuestions.length} questions
                  {searchQuery && ` (filtered by search)`}
                </>
              )}
              {' | '}Total responses: {allResponses.total_responses}
            </p>
          </div>
          
          {/* Search Bar */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by QA ID, question, answer, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <span className="text-gray-400 hover:text-gray-600 text-sm">Clear</span>
              </button>
            )}
          </div>
        </div>

        {/* Reviewers List with QAs displayed below */}
        {sortedReviewers.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Reviewers</h3>
            <div className="space-y-4">
              {sortedReviewers.map((reviewer) => {
                const isSelected = selectedReviewer === reviewer.email;
                const reviewerQAs = getQAsForReviewer(reviewer.email);
                
                return (
                  <div key={reviewer.email} className="border border-gray-200 rounded-lg overflow-hidden">
                    <button
                      onClick={() => {
                        if (isSelected) {
                          setSelectedReviewer(null);
                        } else {
                          setSelectedReviewer(reviewer.email);
                        }
                        // Clear expanded questions when switching reviewers
                        setExpandedQuestions(new Set());
                      }}
                      className={`w-full text-left p-4 transition-all ${
                        isSelected
                          ? 'bg-blue-50 border-b border-blue-200'
                          : 'bg-white hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium text-gray-900">{reviewer.name}</div>
                          <div className="text-sm text-gray-500">{reviewer.email}</div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-semibold rounded-full">
                            {reviewer.count} CLOSE-BUT-FIXABLE
                          </span>
                          {isSelected ? (
                            <ChevronDown className="h-5 w-5 text-blue-600" />
                          ) : (
                            <ChevronRight className="h-5 w-5 text-gray-400" />
                          )}
                        </div>
                      </div>
                    </button>
                    
                    {/* QAs displayed below reviewer when selected */}
                    {isSelected && (
                      <div className="bg-gray-50 p-4 space-y-4">
                        {reviewerQAs.length === 0 ? (
                          <div className="text-center text-gray-500 py-4">
                            <p>No QAs found for this reviewer.</p>
                          </div>
                        ) : (
                          reviewerQAs.map((questionGroup) => {
                            const isExpanded = expandedQuestions.has(questionGroup.qna_id);
                            const isEditing = editingQnaId === questionGroup.qna_id;
                            const isSaving = savingQnaId === questionGroup.qna_id;
                            const reviewerCount = questionGroup.reviews.length;
                            const reviewerCountColor = 
                              reviewerCount === 3 ? 'bg-blue-100 text-blue-800' :
                              reviewerCount === 2 ? 'bg-green-100 text-green-800' :
                              'bg-orange-100 text-orange-800';

                            return (
                              <div
                                key={questionGroup.qna_id}
                                className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                              >
                  {/* Question Header */}
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center space-x-2 flex-1 min-w-0">
                        <button 
                          onClick={() => toggleExpanded(questionGroup.qna_id)}
                          className="text-gray-400 hover:text-gray-600 flex-shrink-0"
                        >
                          {isExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                        </button>
                        <h3 className="font-medium text-gray-900 text-base">
                          QA ID: {questionGroup.qna_id}
                        </h3>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${reviewerCountColor}`}>
                          {reviewerCount} {reviewerCount === 1 ? 'Reviewer' : 'Reviewers'}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1 ml-2">
                        {questionGroup.categories.slice(0, 3).map((category, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                          >
                            {category.replace(/_/g, ' ')}
                          </span>
                        ))}
                        {questionGroup.categories.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                            +{questionGroup.categories.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {!isExpanded && (
                      <div>
                        <p className="text-gray-700 text-sm">
                          {truncateText(questionGroup.question)}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="border-t border-gray-200 bg-gray-50 p-4">
                      <div className="space-y-4">
                        {/* Question - Editable */}
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-medium text-gray-900">Question:</h4>
                            {!isEditing && (
                              <button
                                onClick={() => startEditing(questionGroup.qna_id, questionGroup.question, questionGroup.answer)}
                                className="flex items-center space-x-1 px-3 py-1 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                              >
                                <Edit2 className="h-4 w-4" />
                                <span>Edit</span>
                              </button>
                            )}
                          </div>
                          {isEditing ? (
                            <div className="space-y-2">
                              <textarea
                                value={editValues?.question || ''}
                                onChange={(e) => setEditValues(prev => prev ? { ...prev, question: e.target.value } : null)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                rows={4}
                                disabled={isSaving}
                              />
                            </div>
                          ) : (
                            <p className="text-gray-700 bg-white p-3 rounded border text-sm">
                              {questionGroup.question}
                            </p>
                          )}
                        </div>

                        {/* Answer - Editable */}
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-medium text-gray-900">Answer:</h4>
                          </div>
                          {isEditing ? (
                            <div className="space-y-2">
                              <textarea
                                value={editValues?.answer || ''}
                                onChange={(e) => setEditValues(prev => prev ? { ...prev, answer: e.target.value } : null)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                rows={6}
                                disabled={isSaving}
                              />
                              <div className="flex justify-end space-x-2">
                                <button
                                  onClick={cancelEditing}
                                  disabled={isSaving}
                                  className="flex items-center space-x-1 px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                                >
                                  <X className="h-4 w-4" />
                                  <span>Cancel</span>
                                </button>
                                <button
                                  onClick={() => handleSave(questionGroup.qna_id)}
                                  disabled={isSaving || !editValues}
                                  className="flex items-center space-x-1 px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
                                >
                                  {isSaving ? (
                                    <>
                                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                      <span>Saving...</span>
                                    </>
                                  ) : (
                                    <>
                                      <Save className="h-4 w-4" />
                                      <span>Save</span>
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-gray-700 bg-white p-3 rounded border text-sm">
                              {questionGroup.answer}
                            </p>
                          )}
                        </div>

                        {/* Reviews */}
                        <div>
                          <h4 className="font-medium text-gray-900 mb-3">Reviews ({reviewerCount}):</h4>
                          <div className="space-y-3">
                            {questionGroup.reviews.map((review, index) => (
                              <div key={index} className="bg-white p-4 rounded border space-y-3">
                                <div className="flex justify-between items-start border-b pb-2">
                                  <div>
                                    <div className="font-medium text-gray-900">{review.reviewer_name}</div>
                                    <div className="text-sm text-gray-500">{review.reviewer_email}</div>
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    Updated: {new Date(review.review_updated_at).toLocaleDateString()}
                                  </div>
                                </div>

                                <div className="space-y-3 text-sm">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div>
                                      <span className="font-medium text-gray-700">Expertise: </span>
                                      <span className={review.has_expertise ? 'text-green-600' : 'text-red-600'}>
                                        {review.has_expertise ? 'Yes' : 'No'}
                                      </span>
                                    </div>

                                    {review.has_expertise && review.question_reasonable !== undefined && (
                                      <div>
                                        <span className="font-medium text-gray-700">Question Reasonable: </span>
                                        <span className={review.question_reasonable ? 'text-green-600' : 'text-red-600'}>
                                          {review.question_reasonable ? 'Yes' : 'No'}
                                        </span>
                                      </div>
                                    )}
                                  </div>

                                  {review.has_expertise && review.question_reasonable && review.question_properly_phrased !== undefined && (
                                    <div>
                                      <span className="font-medium text-gray-700">Question Properly Phrased: </span>
                                      <span className={review.question_properly_phrased ? 'text-green-600' : 'text-red-600'}>
                                        {review.question_properly_phrased ? 'Yes' : 'No'}
                                      </span>
                                    </div>
                                  )}

                                  {review.has_expertise && (
                                    <div>
                                      <span className="font-medium text-gray-700">Answer Rating: </span>
                                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                        normalizeRating(review.answer_rating) === 'GOOD' ? 'bg-green-100 text-green-800' :
                                        normalizeRating(review.answer_rating) === 'CLOSE-BUT-FIXABLE' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-red-100 text-red-800'
                                      }`}>
                                        {normalizeRating(review.answer_rating)}
                                      </span>
                                    </div>
                                  )}

                                  {review.has_expertise && review.answer_issues && review.answer_issues.length > 0 && (
                                    <div>
                                      <span className="font-medium text-gray-700">Answer Issues: </span>
                                      <div className="mt-1 flex flex-wrap gap-2">
                                        {review.answer_issues.map((issue, issueIndex) => (
                                          <span
                                            key={issueIndex}
                                            className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full"
                                          >
                                            {issue.replace(/_/g, ' ')}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {review.has_expertise && review.other_weakness_explanation && (
                                    <div>
                                      <span className="font-medium text-gray-700">Other Weakness Explanation: </span>
                                      <p className="mt-1 text-gray-700 bg-gray-50 p-2 rounded border text-sm">
                                        {review.other_weakness_explanation}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                              )}
                              </div>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QnAEditor;

