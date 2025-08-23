'use client';

import { CalendarView } from '@/components/CalendarView';
import { ContentSuggestionCard } from '@/components/ContentSuggestionCard';
import { PostModal } from '@/components/PostModal';
import { ClaudeContentGenerator } from '@/components/ClaudeContentGenerator';
import { Button } from '@/components/ui/Button';
import { useContentSuggestions } from '@/hooks/useContentSuggestions';
import { useScheduledPosts } from '@/hooks/useScheduledPosts';
import { useClaudeContent } from '@/hooks/useClaudeContent';
import { AnalyticsService } from '@/lib/analytics';
import { ContentSuggestion, ScheduledPost, UserProfile } from '@/types';
import { GeneratedContent } from '@/lib/claude';
import {
  BarChart3,
  Calendar,
  TrendingUp,
  Sparkles,
  Brain,
  User,
  LogOut,
  UserPlus,
  LogIn,
  Menu,
  X
} from 'lucide-react';
import { useEffect, useState } from 'react';

export default function HomePage() {
  const [currentView, setCurrentView] = useState<
    'calendar' | 'suggestions' | 'analytics'
  >('calendar');
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Replace with actual auth state
  const [user, setUser] = useState<{ name: string; email: string } | null>(null); // Replace with actual user data

  const [userProfile] = useState<UserProfile>({
    id: '1',
    niche: 'Fitness & Wellness',
    audience: 'Young Adults (18-35)',
    postingFrequency: 'Daily',
    brandVoice: 'Motivational & Friendly',
    instagramHandle: '@fitnessjourney',
    timezone: 'America/New_York',
  });

  // Original content suggestions hook (keep for fallback)
  const {
    suggestions: originalSuggestions,
    loading: suggestionsLoading,
    generateSuggestions,
  } = useContentSuggestions();

  // Claude AI integration
  const { analyzePerformance } = useClaudeContent();

  // Combined suggestions state (Claude + original)
  const [suggestions, setSuggestions] = useState<ContentSuggestion[]>([]);
  const [aiInsights, setAiInsights] = useState<any>(null);

  const {
    posts,
    loading: postsLoading,
    createPost,
    updatePost,
    deletePost,
  } = useScheduledPosts();

  useEffect(() => {
    // Load original suggestions as fallback
    generateSuggestions(userProfile, 5);
  }, [generateSuggestions, userProfile]);

  useEffect(() => {
    // Update suggestions when original suggestions change
    setSuggestions(originalSuggestions);
  }, [originalSuggestions]);

  useEffect(() => {
    // Generate AI insights when posts change
    if (posts.length > 0) {
      generateAIInsights();
    }
  }, [posts]);

  const generateAIInsights = async () => {
    if (posts.length === 0) return;

    try {
      // Transform posts for Claude analysis
      const postsForAnalysis = posts
        .filter(post => post.status === 'published') // Only analyze published posts
        .map(post => ({
          content: post.script || post.topic,
          engagement: Math.random() * 10, // Replace with real engagement data
          impressions: Math.random() * 1000, // Replace with real impressions data
          type: post.type,
          hashtags: post.hashtags || [],
        }));

      if (postsForAnalysis.length > 0) {
        const insights = await analyzePerformance(postsForAnalysis);
        setAiInsights(insights);
      }
    } catch (error) {
      console.error('Error generating AI insights:', error);
    }
  };

  // Authentication handlers (replace with your actual auth logic)
  const handleSignIn = () => {
    // Implement your sign-in logic here
    setIsAuthenticated(true);
    setUser({ name: 'John Doe', email: 'john@example.com' });
    console.log('Sign in clicked');
  };

  const handleSignUp = () => {
    // Implement your sign-up logic here
    console.log('Sign up clicked');
  };

  const handleLogout = () => {
    // Implement your logout logic here
    setIsAuthenticated(false);
    setUser(null);
    console.log('Logout clicked');
  };

  const handleClaudeContentGenerated = (claudeContent: GeneratedContent[]) => {
    // Transform Claude content to match your existing ContentSuggestion format
    const transformedSuggestions: ContentSuggestion[] = claudeContent.map((item) => {
      // Generate random engagement and difficulty levels with correct types
      const engagementLevels = ["Low", "Medium", "High", "Very High"] as const;
      const difficultyLevels = ["Easy", "Medium", "Hard"] as const;

      // Ensure we always get a valid value (not undefined)
      const randomEngagement = engagementLevels[Math.floor(Math.random() * engagementLevels.length)] || "Medium";
      const randomDifficulty = difficultyLevels[Math.floor(Math.random() * difficultyLevels.length)] || "Medium";

      return {
        id: item.id,
        type: 'post' as const, // You might want to make this dynamic based on Claude response
        format: 'image' as const, // You might want to make this dynamic based on Claude response
        topic: item.contentPillars[0] || 'AI Generated',
        script: item.script,
        hashtags: item.hashtags,
        suggestedTime: item.suggestedTime,
        // Properties with correct types matching ContentSuggestion interface
        expectedEngagement: randomEngagement, // Guaranteed to be a valid enum value
        callToAction: item.callToAction || 'Engage with this post!',
        category: userProfile.niche.split(' ')[0]?.toLowerCase() || 'general',
        difficulty: randomDifficulty, // Guaranteed to be a valid enum value
        estimatedReach: Math.floor(Math.random() * 5000) + 1000, // This stays as number
      };
    });

    // Replace current suggestions with Claude-generated ones
    setSuggestions(transformedSuggestions);
  };

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
        await createPost(
          postData as Omit<ScheduledPost, 'id' | 'createdAt' | 'updatedAt'>
        );
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
          <div className='space-y-6'>
            {/* Claude AI Content Generator */}
            <ClaudeContentGenerator
              userProfile={userProfile}
              onContentGenerated={handleClaudeContentGenerated}
            />

            {/* Traditional Content Suggestions */}
            <div className='flex items-center justify-between'>
              <h2 className='text-xl font-semibold text-white'>
                Content Suggestions
              </h2>
              <div className="flex space-x-2">
                <Button
                  onClick={() => generateSuggestions(userProfile, 5)}
                  disabled={suggestionsLoading}
                  variant="outline"
                  className='flex items-center space-x-2'
                >
                  <TrendingUp size={16} />
                  <span>
                    {suggestionsLoading ? 'Generating...' : 'Generate Traditional'}
                  </span>
                </Button>
              </div>
            </div>

            <div className='grid gap-4'>
              {suggestions.map((suggestion) => (
                <ContentSuggestionCard
                  key={suggestion.id}
                  suggestion={suggestion}
                  onSchedule={handleScheduleSuggestion}
                  loading={postsLoading}
                />
              ))}
            </div>

            {suggestions.length === 0 && !suggestionsLoading && (
              <div className="text-center py-8 text-gray-400">
                <Sparkles size={48} className="mx-auto mb-4 opacity-50" />
                <p>Generate AI-powered content ideas using the Claude generator above!</p>
              </div>
            )}
          </div>
        );

      case 'analytics':
        return (
          <div className='space-y-6'>
            <h2 className='text-xl font-semibold text-white'>
              Performance Analytics
            </h2>

            {/* AI Insights Section */}
            {aiInsights && (
              <div className='rounded-lg border bg-white/5 p-6 shadow-sm'>
                <div className="flex items-center space-x-2 mb-4">
                  <Brain className="text-purple-400" size={20} />
                  <h3 className='font-medium text-white'>Claude AI Insights</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Key Insights */}
                  <div>
                    <h4 className="text-sm font-medium text-purple-300 mb-2">Key Insights</h4>
                    <ul className="space-y-1 text-sm text-gray-300">
                      {aiInsights.insights?.slice(0, 3).map((insight: string, index: number) => (
                        <li key={index} className="flex items-start space-x-2">
                          <span className="text-purple-400 mt-1">•</span>
                          <span>{insight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Recommendations */}
                  <div>
                    <h4 className="text-sm font-medium text-green-300 mb-2">Recommendations</h4>
                    <ul className="space-y-1 text-sm text-gray-300">
                      {aiInsights.recommendations?.slice(0, 3).map((rec: string, index: number) => (
                        <li key={index} className="flex items-start space-x-2">
                          <span className="text-green-400 mt-1">•</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Traditional Analytics */}
            <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
              <div className='rounded-lg border bg-transparent p-4 shadow-sm'>
                <div className='mb-2 flex items-center justify-between'>
                  <h3 className='font-medium'>Posts This Week</h3>
                  <Calendar className='text-purple-500' size={20} />
                </div>
                <p className='text-2xl font-bold text-purple-600'>
                  {analytics.postsThisWeek}
                </p>
                <p className='text-sm text-gray-600'>Scheduled & Published</p>
              </div>

              <div className='rounded-lg border bg-transparent p-4 shadow-sm'>
                <div className='mb-2 flex items-center justify-between'>
                  <h3 className='font-medium'>Avg. Engagement</h3>
                  <TrendingUp className='text-green-500' size={20} />
                </div>
                <p className='text-2xl font-bold text-green-600'>
                  {analytics.avgEngagement}%
                </p>
                <p className='text-sm text-gray-600'>Based on recent posts</p>
              </div>

              <div className='rounded-lg border bg-transparent p-4 shadow-sm'>
                <div className='mb-2 flex items-center justify-between'>
                  <h3 className='font-medium'>Best Posting Time</h3>
                  <BarChart3 className='text-purple-500' size={20} />
                </div>
                <p className='text-2xl font-bold text-purple-600'>
                  {analytics.bestPostingTime}
                </p>
                <p className='text-sm text-gray-600'>Peak audience activity</p>
              </div>
            </div>

            <div className='rounded-lg border bg-transparent p-6 shadow-sm'>
              <h3 className='mb-4 font-medium'>Optimal Posting Times</h3>
              <div className='space-y-2'>
                {Object.entries(optimalTimes).map(([day, times]) => (
                  <div
                    key={day}
                    className='flex items-center justify-between border-b py-2 last:border-b-0'
                  >
                    <span className='font-medium capitalize'>{day}</span>
                    <div className='flex space-x-2'>
                      {times.map((time) => (
                        <span
                          key={time}
                          className='rounded bg-purple-100 px-2 py-1 text-sm text-purple-800'
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
    <div className='gradient min-h-screen text-white flex'>
      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:relative lg:translate-x-0 z-50 h-screen w-64 bg-white/10 backdrop-blur-sm border-r border-white/20 transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Sidebar Header */}
        <div className='p-6 border-b border-white/20'>
          <div className="flex items-center justify-between">
            <h1 className='text-lg font-bold text-white'>
              Instagram AI
            </h1>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden p-1 hover:bg-white/10 rounded"
            >
              <X size={20} />
            </button>
          </div>
          <p className='mt-1 text-xs text-white/70'>
            {userProfile.instagramHandle}
          </p>
        </div>

        {/* Navigation Items */}
        <div className='p-4 space-y-2'>
          <button
            onClick={() => {
              setCurrentView('calendar');
              setIsSidebarOpen(false);
            }}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-colors ${
              currentView === 'calendar'
                ? 'bg-purple-600 text-white'
                : 'text-white/80 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Calendar size={20} />
            <span>Calendar</span>
          </button>

          <button
            onClick={() => {
              setCurrentView('suggestions');
              setIsSidebarOpen(false);
            }}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-colors ${
              currentView === 'suggestions'
                ? 'bg-purple-600 text-white'
                : 'text-white/80 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Sparkles size={20} />
            <span>AI Suggestions</span>
          </button>

          <button
            onClick={() => {
              setCurrentView('analytics');
              setIsSidebarOpen(false);
            }}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-colors ${
              currentView === 'analytics'
                ? 'bg-purple-600 text-white'
                : 'text-white/80 hover:bg-white/10 hover:text-white'
            }`}
          >
            <BarChart3 size={20} />
            <span>Analytics</span>
          </button>
        </div>

        {/* User Section */}
        <div className='absolute bottom-0 left-0 right-0 p-4 border-t border-white/20'>
          {isAuthenticated && user ? (
            <div className='space-y-3'>
              <div className='flex items-center space-x-3 px-3 py-2 bg-white/5 rounded-lg'>
                <User size={20} className='text-white/70' />
                <div className='flex-1 min-w-0'>
                  <p className='text-sm font-medium text-white truncate'>{user.name}</p>
                  <p className='text-xs text-white/60 truncate'>{user.email}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className='w-full flex items-center space-x-3 px-4 py-2 text-red-300 hover:bg-red-500/10 hover:text-red-200 rounded-lg transition-colors'
              >
                <LogOut size={16} />
                <span className='text-sm'>Logout</span>
              </button>
            </div>
          ) : (
            <div className='space-y-2'>
              <button
                onClick={handleSignIn}
                className='w-full flex items-center justify-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors'
              >
                <LogIn size={16} />
                <span className='text-sm'>Sign In</span>
              </button>
              <button
                onClick={handleSignUp}
                className='w-full flex items-center justify-center space-x-2 px-4 py-2 border border-white/20 hover:bg-white/10 text-white rounded-lg transition-colors'
              >
                <UserPlus size={16} />
                <span className='text-sm'>Sign Up</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className='flex-1 flex flex-col min-h-screen'>
        {/* Mobile Header */}
        <div className='lg:hidden flex items-center justify-between p-4 border-b border-white/20 bg-white/5'>
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 hover:bg-white/10 rounded-lg"
          >
            <Menu size={20} />
          </button>
          <h1 className='text-lg font-bold text-white'>Instagram AI</h1>
          <div className='w-10' /> {/* Spacer for balance */}
        </div>

        {/* Main Content Area */}
        <div className='flex-1 p-6'>
          {/* Header */}
          <div className='mb-6 rounded-lg border bg-transparent text-white shadow-sm'>
            <div className='p-6'>
              <h1 className='text-2xl font-bold text-white'>
                Instagram Content Calendar AI
              </h1>
              <p className='mt-2 text-white/80'>
                AI-powered content planning and scheduling for{' '}
                {userProfile.instagramHandle}
              </p>
            </div>
          </div>

          {/* Current View Content */}
          {renderCurrentView()}

          {/* Post Modal */}
          <PostModal
            isOpen={modalState.isOpen}
            onClose={() =>
              setModalState({ isOpen: false, mode: 'create', post: null })
            }
            onSave={handleSavePost}
            post={modalState.post}
            mode={modalState.mode}
            selectedDate={selectedDate}
          />
        </div>
      </div>
    </div>
  );
}
