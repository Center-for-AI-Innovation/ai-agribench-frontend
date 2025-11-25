import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log('API Request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      fullURL: `${config.baseURL}${config.url}`,
      data: config.data,
      headers: config.headers
    });
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for logging
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', {
      status: response.status,
      statusText: response.statusText,
      url: response.config.url,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('API Response Error:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      data: error.response?.data,
      headers: error.response?.headers
    });
    return Promise.reject(error);
  }
);

export interface Reviewer {
  id: number;
  name: string;
  email: string;
}

export interface Admin {
  id: number;
  name: string;
  email: string;
  type: 'admin';
}

export interface User {
  id: number;
  name: string;
  email: string;
  type: 'reviewer' | 'admin' | 'qna_editor';
}

export interface QNA {
  id: number;
  qna_id: string;
  question: string;
  answer: string;
  categories: string[];
}

export interface Review {
  id?: number;
  has_expertise: boolean;
  question_reasonable?: boolean;
  question_properly_phrased?: boolean;
  answer_rating?: string;
  answer_issues?: string[];
  other_weakness_explanation?: string;
  updated_at?: string;
}

export interface Assignment {
  assignment_id: number;
  qna: QNA;
  review?: Review;
}

export interface ReviewerStats {
  total_assigned: number;
  total_reviewed: number;
  remaining: number;
  categories: Record<string, { total: number; reviewed: number }>;
}

export interface LoginResponse {
  success: boolean;
  user_type?: 'reviewer' | 'admin' | 'qna_editor';
  user?: User;
  message?: string;
}

export interface QuestionsResponse {
  questions: Assignment[];
}

export interface ReviewSubmission {
  assignment_id: number;
  has_expertise: boolean;
  question_reasonable?: boolean;
  question_properly_phrased?: boolean;
  answer_rating?: string;
  answer_issues?: string[];
  other_weakness_explanation?: string;
}

// Admin-specific interfaces
export interface AdminOverview {
  overview: {
    total_reviewers: number;
    total_qnas: number;
    total_assignments: number;
    total_reviews: number;
    completion_rate: number;
  };
  rating_distribution: Record<string, number>;
  recent_activity: Array<{
    reviewer_name: string;
    question_preview: string;
    rating: string;
    has_expertise: boolean;
    updated_at: string;
  }>;
}

export interface AdminReviewerStats {
  id: number;
  name: string;
  email: string;
  total_assigned: number;
  total_reviewed: number;
  remaining: number;
  completion_rate: number;
  expertise_rate: number;
  categories: Record<string, { total: number; reviewed: number }>;
  joined_at: string;
}

export interface CategoryAnalytics {
  category: string;
  category_id: string;
  total_qnas: number;
  total_assigned: number;
  total_reviewed: number;
  completion_rate: number;
  expertise_rate: number;
  reasonable_rate: number;
  well_phrased_rate: number;
  rating_distribution: Record<string, number>;
  common_issues: Record<string, number>;
}

export interface QualityInsights {
  total_quality_reviews: number;
  quality_trends: Array<{
    date: string;
    rating: string;
    count: number;
  }>;
  problematic_questions: Array<{
    qna_id: string;
    question: string;
    categories: string[];
    avg_rating: number;
    review_count: number;
  }>;
  issue_frequency: Record<string, number>;
}

// Regular API functions
export const login = async (email: string): Promise<LoginResponse> => {
  const response = await api.post('/api/login', { email });
  return response.data;
};

export const getReviewerStats = async (reviewerId: number): Promise<ReviewerStats> => {
  const response = await api.get(`/api/reviewer/${reviewerId}/stats`);
  return response.data;
};

export const getPendingQuestions = async (reviewerId: number): Promise<QuestionsResponse> => {
  const response = await api.get(`/api/reviewer/${reviewerId}/questions/pending`);
  return response.data;
};

export const getReviewedQuestions = async (reviewerId: number): Promise<QuestionsResponse> => {
  const response = await api.get(`/api/reviewer/${reviewerId}/questions/reviewed`);
  return response.data;
};

export const submitReview = async (reviewData: ReviewSubmission): Promise<{ success: boolean; message: string }> => {
  const response = await api.post('/api/reviews', reviewData);
  return response.data;
};

// Admin API functions
export const getAdminOverview = async (): Promise<AdminOverview> => {
  const response = await api.get('/api/admin/overview');
  return response.data;
};

export const getAllReviewersStats = async (): Promise<{ reviewers: AdminReviewerStats[] }> => {
  const response = await api.get('/api/admin/reviewers');
  return response.data;
};

export const getCategoryAnalytics = async (): Promise<{ categories: CategoryAnalytics[] }> => {
  const response = await api.get('/api/admin/categories');
  return response.data;
};

export const getQualityInsights = async (): Promise<QualityInsights> => {
  const response = await api.get('/api/admin/quality-insights');
  return response.data;
};

// Export interfaces
export interface AllResponses {
  total_responses: number;
  responses: Array<{
    qna_id: string;
    question: string;
    answer: string;
    categories: string[];
    document_id?: string;
    reason?: string;
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
}

export const getAllResponses = async (): Promise<AllResponses> => {
  const response = await api.get('/api/admin/all-responses');
  return response.data;
};

// Editor API functions
export interface QnAUpdateRequest {
  question: string;
  answer: string;
}

export interface QnAUpdateResponse {
  success: boolean;
  message?: string;
  qna?: {
    qna_id: string;
    question: string;
    answer: string;
    updated_at: string;
  };
}

export interface EditedQnaIdsResponse {
  edited_qna_ids: string[];
}

export const getEditedQnaIds = async (): Promise<EditedQnaIdsResponse> => {
  const response = await api.get('/api/admin/qnas/edit-history');
  return response.data;
};

export const updateQnA = async (qnaId: string, question: string, answer: string): Promise<QnAUpdateResponse> => {
  try {
    console.log('updateQnA called with:', { qnaId, questionLength: question.length, answerLength: answer.length });
    // Use the endpoint that accepts string qna_id
    const response = await api.put(`/api/admin/qnas/by-qna-id/${qnaId}`, { question, answer });
    console.log('updateQnA response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('updateQnA error details:', {
      qnaId,
      error,
      message: error?.message,
      response: error?.response,
      status: error?.response?.status,
      data: error?.response?.data,
      request: error?.request
    });
    throw error; // Re-throw to let the caller handle it
  }
};

export default api; 