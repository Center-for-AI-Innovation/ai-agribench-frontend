'use client';

import React, { useState } from 'react';
import { Mail, LogIn } from 'lucide-react';
import { login as apiLogin } from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';
import toast from 'react-hot-toast';
import Image from 'next/image';

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { login, setError } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Please enter your email address');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setErrorMessage(null);

    try {
      const emailLower = email.trim().toLowerCase();
      
      // ============================================================
      // TEMPORARY: Site down message for editor@qnareview.com
      // TO REMOVE: Delete this block and uncomment the original logic below
      // ============================================================
      if (emailLower === 'editor@qnareview.com') {
        const errorMsg = 'Site is currently down for maintenance. Please check back later.';
        toast.error(errorMsg);
        setError(errorMsg);
        setErrorMessage(errorMsg);
        setIsSubmitting(false);
        return;
      }
      
      // ============================================================
      // ORIGINAL LOGIC (currently disabled - uncomment to restore):
      // ============================================================
      // Handle editor email specially - create user object without backend call
      // if (emailLower === 'editor@qnareview.com') {
      //   const editorUser = {
      //     id: 0,
      //     name: 'QnA Editor',
      //     email: 'editor@qnareview.com',
      //     type: 'qna_editor' as const
      //   };
      //   
      //   login(editorUser, 'qna_editor');
      //   toast.success('Welcome, Editor!');
      //   window.location.href = '/review';
      //   return;
      // }
      
      // For other emails, call the API
      const response = await apiLogin(emailLower);
      if (response.success && response.user && response.user_type) {
        login(response.user, response.user_type);
        
        if (response.user_type === 'admin') {
          toast.success(`Welcome, Administrator ${response.user.name}!`);
        } else {
          toast.success(`Welcome, ${response.user.name}!`);
        }
      } else {
        const errorMsg = response.message || 'Login failed';
        toast.error(errorMsg);
        setError(errorMsg);
        setErrorMessage(errorMsg);
      }
    } catch (error: any) {
      // ============================================================
      // TEMPORARY: Site down message for editor@qnareview.com
      // TO REMOVE: Delete this block and uncomment the original logic below
      // ============================================================
      const emailLower = email.trim().toLowerCase();
      if (emailLower === 'editor@qnareview.com') {
        const errorMsg = 'Site is currently down for maintenance. Please check back later.';
        toast.error(errorMsg);
        setError(errorMsg);
        setErrorMessage(errorMsg);
        setIsSubmitting(false);
        return;
      }
      
      // ============================================================
      // ORIGINAL LOGIC (currently disabled - uncomment to restore):
      // ============================================================
      // If API call fails, check if it's the editor email (shouldn't happen, but just in case)
      // if (emailLower === 'editor@qnareview.com') {
      //   const editorUser = {
      //     id: 0,
      //     name: 'QnA Editor',
      //     email: 'editor@qnareview.com',
      //     type: 'qna_editor' as const
      //   };
      //   
      //   login(editorUser, 'qna_editor');
      //   toast.success('Welcome, Editor!');
      //   window.location.href = '/review';
      //   return;
      // }
      
      const errorMsg = error.response?.data?.message || 'Login failed. Please try again.';
      toast.error(errorMsg);
      setError(errorMsg);
      setErrorMessage(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-600 via-gray-700 to-gray-800 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Image 
              src="/logo.jpg" 
              alt="AIFARMS Logo" 
              width={200} 
              height={60}
              className="h-20 w-auto rounded-lg"
            />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            AI Agribench Review Form
          </h1>
          <p className="text-gray-600">
            Please enter your email to access your assigned questions
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label 
              htmlFor="email" 
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                required
                placeholder="your.email@example.com"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-gray-900"
                disabled={isSubmitting}
              />
            </div>
          </div>

          {errorMessage && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              <p className="text-sm font-medium">{errorMessage}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Logging in...</span>
              </>
            ) : (
              <>
                <LogIn className="h-5 w-5" />
                <span>Login</span>
              </>
            )}
          </button>
        </form>


      </div>
    </div>
  );
};

export default LoginForm; 