'use client';

import React, { useState } from 'react';
import { Assignment } from '@/lib/api';
import { ChevronDown, ChevronRight, Edit } from 'lucide-react';

interface QuestionListProps {
  questions: Assignment[];
  title: string;
  emptyMessage: string;
  emptyIcon: React.ReactNode;
  onQuestionClick?: (question: Assignment, index: number) => void;
  showStatus?: boolean;
}

const QuestionList: React.FC<QuestionListProps> = ({
  questions,
  title,
  emptyMessage,
  emptyIcon,
  onQuestionClick,
  showStatus = false,
}) => {
  const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(new Set());

  const toggleExpanded = (index: number) => {
    const newExpanded = new Set(expandedQuestions);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedQuestions(newExpanded);
  };
  const truncateText = (text: string, maxLength: number = 150) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const formatCategories = (categories: string[]) => {
    return categories.map(cat => cat.replace(/_/g, ' ')).join(', ');
  };

  if (questions.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="flex justify-center mb-4 text-gray-400">
          {emptyIcon}
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
        <span>{title}</span>
        <span className="bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded-full">
          {questions.length}
        </span>
      </h2>
      
      <div className="grid gap-4">
        {questions.map((question, index) => {
          const isExpanded = expandedQuestions.has(index);
          const isReviewed = question.review && showStatus;
          
          return (
            <div
              key={question.assignment_id}
              className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Header - Always visible */}
              <div 
                className="p-4 cursor-pointer hover:bg-gray-50"
                onClick={() => isReviewed ? toggleExpanded(index) : toggleExpanded(index)}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center space-x-2">
                    <button className="text-gray-400 hover:text-gray-600">
                      {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </button>
                    <h3 className="font-medium text-gray-900">
                      Question {index + 1}
                      {isReviewed && (
                        <span className="ml-2 text-sm text-green-600">(Reviewed)</span>
                      )}
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {question.qna.categories.slice(0, 2).map((category, catIndex) => (
                      <span
                        key={catIndex}
                        className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                      >
                        {category.replace(/_/g, ' ')}
                      </span>
                    ))}
                    {question.qna.categories.length > 2 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                        +{question.qna.categories.length - 2}
                      </span>
                    )}
                  </div>
                </div>
                
                {!isExpanded && (
                  <div className="mb-3">
                    <p className="text-gray-700 text-sm">
                      {truncateText(question.qna.question)}
                    </p>
                  </div>
                )}
                
                {question.review && (
                  <div className="flex items-center justify-between text-sm text-gray-500 border-t pt-2 mt-2">
                    <span>
                      <strong>Rating:</strong> {question.review.answer_rating || 'N/A'}
                    </span>
                    <span>
                      <strong>Updated:</strong>{' '}
                      {question.review.updated_at 
                        ? new Date(question.review.updated_at).toLocaleDateString()
                        : 'N/A'
                      }
                    </span>
                  </div>
                )}
              </div>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="border-t border-gray-200 bg-gray-50 p-4">
                  <div className="space-y-4">
                    {/* Full Question */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Question:</h4>
                      <p className="text-gray-700 bg-white p-3 rounded border">
                        {question.qna.question}
                      </p>
                    </div>

                    {/* Full Answer */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Answer:</h4>
                      <p className="text-gray-700 bg-white p-3 rounded border">
                        {question.qna.answer}
                      </p>
                    </div>

                    {/* Action Button for pending questions */}
                    {!isReviewed && (
                      <div className="flex justify-end">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onQuestionClick?.(question, index);
                          }}
                          className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                        >
                          <Edit className="h-4 w-4" />
                          <span>Start Review</span>
                        </button>
                      </div>
                    )}

                    {/* Review Details - Only for reviewed questions */}
                    {isReviewed && question.review && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Review Details:</h4>
                        <div className="bg-white p-3 rounded border space-y-2 text-sm">
                          <div><strong className="text-blue-600">Expertise:</strong> <span className="text-gray-700">{question.review?.has_expertise ? 'Yes' : 'No'}</span></div>
                          {question.review?.question_reasonable !== undefined && (
                            <div><strong className="text-blue-600">Question Reasonable:</strong> <span className="text-gray-700">{question.review.question_reasonable ? 'Yes' : 'No'}</span></div>
                          )}
                          {question.review?.question_properly_phrased !== undefined && (
                            <div><strong className="text-blue-600">Question Properly Phrased:</strong> <span className="text-gray-700">{question.review.question_properly_phrased ? 'Yes' : 'No'}</span></div>
                          )}
                          {question.review?.answer_issues && question.review.answer_issues.length > 0 && (
                            <div><strong className="text-blue-600">Issues:</strong> <span className="text-gray-700">{question.review.answer_issues.join(', ')}</span></div>
                          )}
                          {question.review?.other_weakness_explanation && (
                            <div><strong className="text-blue-600">Other Issues:</strong> <span className="text-gray-700">{question.review.other_weakness_explanation}</span></div>
                          )}
                        </div>
                        
                        {/* Edit Button for reviewed questions - after review details */}
                        <div className="flex justify-end mt-4">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onQuestionClick?.(question, index);
                            }}
                            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                          >
                            <Edit className="h-4 w-4" />
                            <span>Edit Review</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default QuestionList; 