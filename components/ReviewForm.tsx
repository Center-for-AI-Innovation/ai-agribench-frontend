'use client';

import React, { useState, useEffect } from 'react';
import { Save, ArrowRight } from 'lucide-react';
import { Assignment, ReviewSubmission } from '@/lib/api';

interface ReviewFormProps {
  question: Assignment;
  onSave: (reviewData: ReviewSubmission) => Promise<void>;
  onNext: () => void;
  questionNumber: number;
  totalQuestions: number;
  isSubmitting: boolean;
}

const ReviewForm: React.FC<ReviewFormProps> = ({
  question,
  onSave,
  onNext,
  questionNumber,
  totalQuestions,
  isSubmitting,
}) => {
  const [formData, setFormData] = useState({
    has_expertise: null as boolean | null,
    question_reasonable: null as boolean | null,
    question_properly_phrased: null as boolean | null,
    answer_rating: '',
    answer_issues: [] as string[],
    other_weakness_explanation: '',
  });

  // Reset form when question changes
  useEffect(() => {
    if (question.review) {
      setFormData({
        has_expertise: question.review.has_expertise,
        question_reasonable: question.review.question_reasonable ?? null,
        question_properly_phrased: question.review.question_properly_phrased ?? null,
        answer_rating: question.review.answer_rating || '',
        answer_issues: question.review.answer_issues || [],
        other_weakness_explanation: question.review.other_weakness_explanation || '',
      });
    } else {
      setFormData({
        has_expertise: null,
        question_reasonable: null,
        question_properly_phrased: null,
        answer_rating: '',
        answer_issues: [],
        other_weakness_explanation: '',
      });
    }
  }, [question]);

  const formatCategories = (categories: string[]) => {
    return categories.map(cat => cat.replace(/_/g, ' ')).join(', ');
  };

  const handleExpertiseChange = (value: boolean) => {
    setFormData(prev => ({
      ...prev,
      has_expertise: value,
      // Reset dependent fields when expertise changes
      question_reasonable: value ? prev.question_reasonable : null,
      question_properly_phrased: value ? prev.question_properly_phrased : null,
      answer_rating: value ? prev.answer_rating : '',
      answer_issues: value ? prev.answer_issues : [],
      other_weakness_explanation: value ? prev.other_weakness_explanation : '',
    }));
  };

  const handleReasonableChange = (value: boolean) => {
    setFormData(prev => ({
      ...prev,
      question_reasonable: value,
      // Reset dependent fields when reasonableness changes
      question_properly_phrased: value ? prev.question_properly_phrased : null,
      answer_rating: value ? prev.answer_rating : '',
      answer_issues: value ? prev.answer_issues : [],
      other_weakness_explanation: value ? prev.other_weakness_explanation : '',
    }));
  };

  const handleIssueChange = (issue: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      answer_issues: checked
        ? [...prev.answer_issues, issue]
        : prev.answer_issues.filter(i => i !== issue),
    }));
  };

  const isFormValid = () => {
    if (formData.has_expertise === null) return false;
    if (!formData.has_expertise) return true; // Only expertise required if no expertise
    
    if (formData.question_reasonable === null) return false;
    if (!formData.question_reasonable) return true; // Only expertise and reasonable required if not reasonable
    
    return formData.question_properly_phrased !== null && formData.answer_rating !== '';
  };

  const handleSave = async () => {
    if (!isFormValid()) return;
    
    const reviewData: ReviewSubmission = {
      assignment_id: question.assignment_id,
      has_expertise: formData.has_expertise!,
      question_reasonable: formData.question_reasonable ?? undefined,
      question_properly_phrased: formData.question_properly_phrased ?? undefined,
      answer_rating: formData.answer_rating || undefined,
      answer_issues: formData.answer_issues.length > 0 ? formData.answer_issues : undefined,
      other_weakness_explanation: formData.other_weakness_explanation || undefined,
    };
    
    await onSave(reviewData);
  };

  const showQuestionsSection = formData.has_expertise === true;
  const showLaterQuestions = showQuestionsSection && formData.question_reasonable === true;
  const showIssuesSection = showLaterQuestions && 
    (formData.answer_rating === 'CLOSE-BUT-FIXABLE' || formData.answer_rating === 'NOT GOOD');

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">
              QA ID: {question.qna.qna_id}
            </h2>
            <div className="flex flex-wrap gap-2">
              {question.qna.categories.map((category, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                >
                  {category.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Question and Answer */}
        <div className="px-6 py-6 space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Question:</h3>
            <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
              {question.qna.question}
            </p>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Answer:</h3>
            <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
              {question.qna.answer}
            </p>
          </div>
        </div>

        {/* Review Questions */}
        <div className="px-6 pb-6 space-y-8">
          {/* Question 1: Expertise */}
          <div className="space-y-3">
            <h4 className="text-lg font-medium text-gray-900">
              1. Do you have the expertise to evaluate this QA pair?
            </h4>
            <div className="space-y-2">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="has_expertise"
                  checked={formData.has_expertise === true}
                  onChange={() => handleExpertiseChange(true)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-gray-700">YES</span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="has_expertise"
                  checked={formData.has_expertise === false}
                  onChange={() => handleExpertiseChange(false)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-gray-700">NO (Skip questions #2 – #5 for this QA pair)</span>
              </label>
            </div>
          </div>

          {/* Questions 2-5 (conditional) */}
          {showQuestionsSection && (
            <>
              {/* Question 2: Reasonable */}
              <div className="space-y-3">
                <h4 className="text-lg font-medium text-gray-900">
                  2. Is the question in the QA pair reasonable to ask from an Ag advisory service?
                </h4>
                <div className="space-y-2">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="question_reasonable"
                      checked={formData.question_reasonable === true}
                      onChange={() => handleReasonableChange(true)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-gray-700">YES</span>
                  </label>
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="question_reasonable"
                      checked={formData.question_reasonable === false}
                      onChange={() => handleReasonableChange(false)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-gray-700">NO (Skip questions #3 – #5 for this QA pair)</span>
                  </label>
                </div>
              </div>

              {showLaterQuestions && (
                <>
                  {/* Question 3: Properly Phrased */}
                  <div className="space-y-3">
                    <h4 className="text-lg font-medium text-gray-900">
                      3. Is the question in the QA pair properly phrased like an "average user" would ask?
                    </h4>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="radio"
                          name="question_properly_phrased"
                          checked={formData.question_properly_phrased === true}
                          onChange={() => setFormData(prev => ({ ...prev, question_properly_phrased: true }))}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-gray-700">YES</span>
                      </label>
                      <label className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="radio"
                          name="question_properly_phrased"
                          checked={formData.question_properly_phrased === false}
                          onChange={() => setFormData(prev => ({ ...prev, question_properly_phrased: false }))}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-gray-700">NO</span>
                      </label>
                    </div>
                  </div>

                  {/* Question 4: Answer Rating */}
                  <div className="space-y-3">
                    <h4 className="text-lg font-medium text-gray-900">
                      4. How would you rate the Answer?
                    </h4>
                    <div className="space-y-2">
                      {['GOOD', 'CLOSE-BUT-FIXABLE', 'NOT GOOD'].map((rating) => (
                        <label key={rating} className="flex items-center space-x-3 cursor-pointer">
                          <input
                            type="radio"
                            name="answer_rating"
                            value={rating}
                            checked={formData.answer_rating === rating}
                            onChange={(e) => setFormData(prev => ({ ...prev, answer_rating: e.target.value }))}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-gray-700">{rating}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Question 5: Answer Issues */}
                  {showIssuesSection && (
                    <div className="space-y-3">
                      <h4 className="text-lg font-medium text-gray-900">
                        5. If the answer is CLOSE-BUT-FIXABLE or NOT-GOOD, why is that?
                      </h4>
                      <div className="space-y-2">
                        {[
                          'FACTUAL INACCURACIES',
                          'INCOMPLETE or INADEQUATE',
                          'MISLEADING',
                          'UNCLEAR OR CONFUSING',
                          'OTHER WEAKNESSES',
                        ].map((issue) => (
                          <label key={issue} className="flex items-center space-x-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.answer_issues.includes(issue)}
                              onChange={(e) => handleIssueChange(issue, e.target.checked)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 rounded"
                            />
                            <span className="text-gray-700">{issue}</span>
                          </label>
                        ))}
                      </div>
                      
                      {formData.answer_issues.includes('OTHER WEAKNESSES') && (
                        <div className="mt-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            If "OTHER WEAKNESSES", please explain:
                          </label>
                          <textarea
                            value={formData.other_weakness_explanation}
                            onChange={(e) => setFormData(prev => ({ ...prev, other_weakness_explanation: e.target.value }))}
                            placeholder="Briefly explain the other weaknesses..."
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>

        {/* Actions */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-center">
          <button
            onClick={async () => {
              if (isFormValid()) {
                await handleSave();
                onNext();
              }
            }}
            disabled={!isFormValid() || isSubmitting}
            className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors font-medium"
          >
            <Save className="h-4 w-4" />
            <span>{isSubmitting ? 'Saving...' : 'Save & Next Question'}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewForm; 