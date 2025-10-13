'use client';

import React from 'react';
import { ArrowRight, CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface InstructionsProps {
  onStart: () => void;
}

const Instructions: React.FC<InstructionsProps> = ({ onStart }) => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-8 text-white">
            <h1 className="text-3xl font-bold mb-2">Thank you for volunteering!</h1>
            <p className="text-blue-100 text-lg">
              Welcome to the AI Agribench Review System. We appreciate your time and expertise in evaluating agricultural Q&A pairs.
            </p>
          </div>

          {/* Instructions Content */}
          <div className="px-6 py-8 space-y-8">
            {/* Overview */}
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Review Process Overview</h2>
              <p className="text-gray-700 mb-4">
                You will be evaluating Q&A pairs across various agricultural categories. Each review helps improve AI systems for agricultural advisory services.
              </p>
            </div>

            {/* Review Questions */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Review Questions You'll Answer:</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold text-sm">1</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Expertise</p>
                    <p className="text-gray-600">Do you have the expertise to evaluate this QA pair?</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold text-sm">2</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Question Reasonableness</p>
                    <p className="text-gray-600">Is the question reasonable to ask from an Ag advisory service?</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold text-sm">3</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Question Phrasing</p>
                    <p className="text-gray-600">Is the question properly phrased like an &quot;average user&quot; would ask?</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold text-sm">4</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Answer Rating</p>
                    <p className="text-gray-600">How would you rate the Answer? (GOOD / CLOSE-BUT-FIXABLE / NOT GOOD)</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold text-sm">5</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Answer Issues</p>
                    <p className="text-gray-600">If the answer needs improvement, identify specific issues like factual inaccuracies, incompleteness, misleading content, or unclear explanations</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Important Notes */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-yellow-800 mb-3 flex items-center">
                <AlertCircle className="h-5 w-5 mr-2" />
                Important Notes
              </h3>
              <ul className="space-y-2 text-yellow-700">
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Click <strong>Save and Next Question</strong> to move to the next Question.</span>
                </li>
                <li className="flex items-start">
                  <Clock className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                  <span>You can view your <strong>pending reviews</strong> anytime by clicking on them in the &quot;Pending&quot; tab.</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                  <span>You can <strong>edit your completed reviews</strong> anytime by clicking on them in the &quot;Reviewed&quot; tab.</span>
                </li>
                <li className="flex items-start">
                  <AlertCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                  <span>You can also track your <strong>progress and statistics</strong> across different categories.</span>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-800 mb-3">Need Help?</h3>
              <p className="text-blue-700 mb-3">
                Contact the administrators if you have any questions:
              </p>
              <div className="space-y-1">
                <a href="mailto:vadve@illinois.edu" className="text-blue-600 hover:text-blue-800 underline block">
                  vadve@illinois.edu
                </a>
                <a href="mailto:aankul2@illinois.edu" className="text-blue-600 hover:text-blue-800 underline block">
                  aankul2@illinois.edu
                </a>
              </div>
            </div>
          </div>

          {/* Start Button */}
          <div className="px-6 py-6 bg-gray-50 border-t border-gray-200">
            <button
              onClick={onStart}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              <span>Start Reviewing Questions</span>
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Instructions; 