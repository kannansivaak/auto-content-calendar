// File: types/index.ts
export interface UserProfile {
  id: string;
  niche: string;
  audience: string;
  postingFrequency: string;
  brandVoice: string;
  instagramHandle: string;
  timezone: string;
}

export interface ContentSuggestion {
  id: string;
  type: 'post' | 'story' | 'reel';
  format: 'image' | 'video' | 'carousel';
  topic: string;
  script: string;
  suggestedTime: string;
  expectedEngagement: 'Low' | 'Medium' | 'High' | 'Very High';
  hashtags: string[];
  callToAction: string;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  estimatedReach: number;
}

export interface ScheduledPost {
  id: string;
  date: string;
  time: string;
  type: 'post' | 'story' | 'reel';
  format: 'image' | 'video' | 'carousel';
  topic: string;
  script: string;
  hashtags: string[];
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  imageUrl?: string;
  videoUrl?: string;
  engagementMetrics?: {
    likes: number;
    comments: number;
    shares: number;
    reach: number;
    impressions: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface OptimalTimes {
  [key: string]: string[];
}

export interface AnalyticsData {
  postsThisWeek: number;
  avgEngagement: number;
  bestPostingTime: string;
  totalReach: number;
  totalImpressions: number;
  followerGrowth: number;
  topPerformingPost: ScheduledPost | null;
}

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
