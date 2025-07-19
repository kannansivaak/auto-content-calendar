// File: app/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, TrendingUp, BarChart3 } from 'lucide-react';
import { UserProfile, ScheduledPost, ContentSuggestion } from '@/types';
import { useContentSuggestions } from '@/hooks/useContentSuggestions';
import { useScheduledPosts } from '@/hooks/useScheduledPosts';
import { CalendarView } from '@/components/CalendarView';
import { ContentSuggestionCard } from '@/components/ContentSuggestionCard';
import { PostModal } from '@/components/PostModal';
import { Button } from '@/components/ui/Button';
import { AnalyticsService } from '@/lib/analytics';

export default function HomePage() {
  const [currentView, setCurrentView] = useState<'calendar' | 'suggestions' | 'analytics'>('calendar');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    mode: 'create' | 'edit' | 'view';
    post: ScheduledPost | null;
  }>({
    isOpen: false,
    mode: 'create',
    post: null,
  });

  const [userProfile] = useState<UserProfile>({
    id: '1',
    niche: 'Fitness & Wellness',
    audience: 'Young Adults (18-35)',
    postingFrequency: 'Daily',
    brandVoice: 'Motivational & Friendly',
    instagramHandle: '@fitnessjourney',
    timezone: 'America/New_York',
  });

  const { suggestions, loading: suggestionsLoading, generateSuggestions } = useContentSuggestions();
  const { posts, loading: postsLoading, createPost, updatePost, deletePost } = useScheduledPosts();

  useEffect(() => {
    generateSuggestions(userProfile, 5);
  }, [generateSuggestions, userProfile]);

  const handleScheduleSuggestion = async (suggestion: ContentSuggestion) => {
    try {
      // Ensure we have a valid date string
      const dateString = selectedDate.toISOString().split('T')[0];
      if (!dateString) {
        throw new Error('Invalid date selected');
      }

      const newPost: Omit<ScheduledPost, 'id' | 'createdAt' | 'updatedAt'> = {
        date: dateString,
        time: suggestion.suggestedTime,
        type: suggestion.type,
        format: suggestion.format,
        topic: suggestion.topic,
        script: suggestion.script,
        hashtags: suggestion.hashtags,
        status: 'scheduled',
      };

      await createPost(newPost);
    } catch (error) {
      console.error('Error scheduling post:', error);
    }
  };

  const handleCreatePost = () => {
    setModalState({
      isOpen: true,
      mode: 'create',
      post: null,
    });
  };

  const handleEditPost = (post: ScheduledPost) => {
    setModalState({
      isOpen: true,
      mode: 'edit',
      post,
    });
  };

  const handleViewPost = (post: ScheduledPost) => {
    setModalState({
      isOpen: true,
      mode: 'view',
      post,
    });
  };

  const handleSavePost = async (postData: Partial<ScheduledPost>) => {
    try {
      if (modalState.mode === 'create') {
        // Type assertion is safe here since we know we're providing the required fields
        await createPost(postData as Omit<ScheduledPost, 'id' | 'createdAt' | 'updatedAt'>);
      } else if (modalState.mode === 'edit' && modalState.post) {
        await updatePost(modalState.post.id, postData);
      }
      setModalState({ isOpen: false, mode: 'create', post: null });
    } catch (error) {
      console.error('Error saving post:', error);
    }
  };

  const analytics = AnalyticsService.calculateAnalytics(posts);
  const optimalTimes = AnalyticsService.getOptimalTimes();

  const renderCurrentView = () => {
    switch (currentView) {
      case 'calendar':
        return (
          <CalendarView
            posts={posts}
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
            onCreatePost={handleCreatePost}
            onEditPost={handleEditPost}
            onDeletePost={deletePost}
            onViewPost={handleViewPost}
          />
        );

      case 'suggestions':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-white">AI Content Suggestions</h2>
              <Button
                onClick={() => generateSuggestions(userProfile, 5)}
                disabled={suggestionsLoading}
                className="flex items-center space-x-2"
              >
                <TrendingUp size={16} />
                <span>{suggestionsLoading ? 'Generating...' : 'Generate New'}</span>
              </Button>
            </div>

            <div className="grid gap-4">
              {suggestions.map(suggestion => (
                <ContentSuggestionCard
                  key={suggestion.id}
                  suggestion={suggestion}
                  onSchedule={handleScheduleSuggestion}
                  loading={postsLoading}
                />
              ))}
            </div>
          </div>
        );

      case 'analytics':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-white">Performance Analytics</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg shadow-sm border p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">Posts This Week</h3>
                  <Calendar className="text-blue-500" size={20} />
                </div>
                <p className="text-2xl font-bold text-blue-600">{analytics.postsThisWeek}</p>
                <p className="text-sm text-gray-600">Scheduled & Published</p>
              </div>

              <div className="bg-white rounded-lg shadow-sm border p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">Avg. Engagement</h3>
                  <TrendingUp className="text-green-500" size={20} />
                </div>
                <p className="text-2xl font-bold text-green-600">{analytics.avgEngagement}%</p>
                <p className="text-sm text-gray-600">Based on recent posts</p>
              </div>

              <div className="bg-white rounded-lg shadow-sm border p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">Best Posting Time</h3>
                  <BarChart3 className="text-purple-500" size={20} />
                </div>
                <p className="text-2xl font-bold text-purple-600">{analytics.bestPostingTime}</p>
                <p className="text-sm text-gray-600">Peak audience activity</p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="font-medium mb-4">Optimal Posting Times</h3>
              <div className="space-y-2">
                {Object.entries(optimalTimes).map(([day, times]) => (
                  <div key={day} className="flex items-center justify-between py-2 border-b last:border-b-0">
                    <span className="font-medium capitalize">{day}</span>
                    <div className="flex space-x-2">
                      {times.map(time => (
                        <span
                          key={time}
                          className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded"
                        >
                          {time}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen gradient text-white">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="bg-transparent rounded-lg shadow-sm border mb-6 text-white">
          <div className="p-6 border-b">
            <h1 className="text-2xl font-bold text-white">
              Instagram Content Calendar AI
            </h1>
            <p className="text-white mt-2">
              AI-powered content planning and scheduling for {userProfile.instagramHandle}
            </p>
          </div>

          {/* Navigation */}
          <div className="flex border-b">
            <button
              onClick={() => setCurrentView('calendar')}
              className={`px-6 py-3 font-medium transition-colors ${
                currentView === 'calendar'
                  ? 'text-white border-b-2 border-blue-600 bg-transparent'
                  : 'text-white hover:text-purple-800 hover:bg-white'
              }`}
            >
              <Calendar size={16} className="inline mr-2" />
              Calendar
            </button>
            <button
              onClick={() => setCurrentView('suggestions')}
              className={`px-6 py-3 font-medium transition-colors ${
                currentView === 'suggestions'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <TrendingUp size={16} className="inline mr-2" />
              AI Suggestions
            </button>
            <button
              onClick={() => setCurrentView('analytics')}
              className={`px-6 py-3 font-medium transition-colors ${
                currentView === 'analytics'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <BarChart3 size={16} className="inline mr-2" />
              Analytics
            </button>
          </div>
        </div>

        {/* Main Content */}
        {renderCurrentView()}

        {/* Post Modal */}
        <PostModal
          isOpen={modalState.isOpen}
          onClose={() => setModalState({ isOpen: false, mode: 'create', post: null })}
          onSave={handleSavePost}
          post={modalState.post}
          mode={modalState.mode}
          selectedDate={selectedDate}
        />
      </div>
    </div>
  );
}
