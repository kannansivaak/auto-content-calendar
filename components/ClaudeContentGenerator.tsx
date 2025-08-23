// File: components/ClaudeContentGenerator.tsx
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { useClaudeContent } from '@/hooks/useClaudeContent';
import { ContentGenerationPrompt } from '@/lib/claude';
import { UserProfile } from '@/types';
import { Sparkles, RefreshCw, TrendingUp } from 'lucide-react';

interface ClaudeContentGeneratorProps {
  userProfile: UserProfile;
  onContentGenerated: (content: any[]) => void;
}

export function ClaudeContentGenerator({
  userProfile,
  onContentGenerated
}: ClaudeContentGeneratorProps) {
  const { generateContent, getTrendingTopics, loading, error } = useClaudeContent();
  const [contentCount, setContentCount] = useState(5);
  const [specificTopic, setSpecificTopic] = useState('');
  const [postType, setPostType] = useState<'post' | 'reel' | 'story'>('post');
  const [format, setFormat] = useState<'image' | 'video' | 'carousel'>('image');
  const [trendingTopics, setTrendingTopics] = useState<string[]>([]);

  const handleGenerateContent = async () => {
    // Build prompt object conditionally to satisfy exactOptionalPropertyTypes
    const basePrompt = {
      niche: userProfile.niche,
      audience: userProfile.audience,
      brandVoice: userProfile.brandVoice,
      postType,
      format,
    };

    // Only add optional properties if they have actual values
    const prompt: ContentGenerationPrompt = {
      ...basePrompt,
      ...(specificTopic.trim() ? { topic: specificTopic.trim() } : {}),
      ...(trendingTopics.length > 0 ? { trendingHashtags: trendingTopics } : {}),
    };

    const content = await generateContent(prompt, contentCount);
    if (content.length > 0) {
      onContentGenerated(content);
    }
  };

  const handleGetTrendingTopics = async () => {
    const topics = await getTrendingTopics(userProfile.niche, userProfile.audience);
    setTrendingTopics(topics);
  };

  return (
    <div className="space-y-6 p-6 bg-white/5 rounded-lg border border-white/10">
      <div className="flex items-center space-x-2">
        <Sparkles className="text-purple-400" size={20} />
        <h3 className="text-lg font-semibold text-white">Claude AI Content Generator</h3>
      </div>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Content Settings */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Number of Ideas
            </label>
            <select
              value={contentCount}
              onChange={(e) => setContentCount(Number(e.target.value))}
              className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white"
            >
              <option value={3}>3 Ideas</option>
              <option value={5}>5 Ideas</option>
              <option value={7}>7 Ideas</option>
              <option value={10}>10 Ideas</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Post Type
            </label>
            <select
              value={postType}
              onChange={(e) => setPostType(e.target.value as 'post' | 'reel' | 'story')}
              className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white"
            >
              <option value="post">Regular Post</option>
              <option value="reel">Instagram Reel</option>
              <option value="story">Story</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Content Format
            </label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value as 'image' | 'video' | 'carousel')}
              className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white"
            >
              <option value="image">Single Image</option>
              <option value="video">Video</option>
              <option value="carousel">Carousel</option>
            </select>
          </div>
        </div>

        {/* Topic Input */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Specific Topic (Optional)
            </label>
            <input
              type="text"
              value={specificTopic}
              onChange={(e) => setSpecificTopic(e.target.value)}
              placeholder="e.g., Morning routines, Healthy recipes..."
              className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-white">
                Trending Topics
              </label>
              <Button
                onClick={handleGetTrendingTopics}
                disabled={loading}
                size="sm"
                variant="outline"
                className="flex items-center space-x-1"
              >
                <TrendingUp size={14} />
                <span>Get Trends</span>
              </Button>
            </div>
            {trendingTopics.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {trendingTopics.slice(0, 5).map((topic, index) => (
                  <button
                    key={index}
                    onClick={() => setSpecificTopic(topic)}
                    className="px-2 py-1 bg-purple-500/20 border border-purple-500/30 rounded text-xs text-purple-300 hover:bg-purple-500/30 transition-colors"
                  >
                    {topic}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Button
        onClick={handleGenerateContent}
        disabled={loading}
        className="w-full flex items-center justify-center space-x-2"
      >
        {loading ? (
          <RefreshCw size={16} className="animate-spin" />
        ) : (
          <Sparkles size={16} />
        )}
        <span>
          {loading ? 'Generating with Claude AI...' : 'Generate Content Ideas'}
        </span>
      </Button>
    </div>
  );
}
