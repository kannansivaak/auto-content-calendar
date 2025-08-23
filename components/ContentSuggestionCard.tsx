// File: components/ContentSuggestionCard.tsx
'use client';

import { ContentSuggestion } from '@/types';
import {
  Camera,
  Clock,
  MessageSquare,
  Save,
  TrendingUp,
  Video,
} from 'lucide-react';
import React from 'react';
import { Button } from './ui/Button';

interface ContentSuggestionCardProps {
  suggestion: ContentSuggestion;
  onSchedule: (suggestion: ContentSuggestion) => void;
  loading?: boolean;
}

export const ContentSuggestionCard: React.FC<ContentSuggestionCardProps> = ({
  suggestion,
  onSchedule,
  loading = false,
}) => {
  const getTypeIcon = () => {
    switch (suggestion.type) {
      case 'post':
        return <Camera className='text-purple-500' size={20} />;
      case 'story':
        return <MessageSquare className='text-green-500' size={20} />;
      case 'reel':
        return <Video className='text-purple-500' size={20} />;
    }
  };

  const getEngagementColor = () => {
    switch (suggestion.expectedEngagement) {
      case 'Very High':
        return 'text-green-600';
      case 'High':
        return 'text-purple-600';
      case 'Medium':
        return 'text-yellow-600';
      case 'Low':
        return 'text-gray-600';
    }
  };

  return (
    <div className='gradient rounded-lg border p-6 text-white shadow-sm transition-shadow hover:shadow-md'>
      <div className='mb-4 flex items-start justify-between'>
        <div className='flex items-center space-x-3'>
          {getTypeIcon()}
          <div>
            <h3 className='font-semibold text-white'>{suggestion.topic}</h3>
            <p className='text-sm capitalize text-white'>
              {suggestion.format} • {suggestion.type}
            </p>
          </div>
        </div>
        <div className='text-right'>
          <div className='mb-1 flex items-center space-x-1 text-sm text-gray-600'>
            <Clock size={14} />
            <span>{suggestion.suggestedTime}</span>
          </div>
          <div className='flex items-center space-x-1 text-sm'>
            <TrendingUp size={14} />
            <span className={getEngagementColor()}>
              {suggestion.expectedEngagement}
            </span>
          </div>
        </div>
      </div>

      <div className='gradient mb-4 rounded-lg p-4'>
        <p className='whitespace-pre-line text-sm text-white'>
          {suggestion.script}
        </p>
      </div>

      <div className='flex items-center justify-between'>
        <div className='flex flex-wrap gap-1'>
          {suggestion.hashtags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className='rounded bg-purple-100 px-2 py-1 text-xs text-purple-800'
            >
              {tag}
            </span>
          ))}
          {suggestion.hashtags.length > 3 && (
            <span className='text-xs text-gray-500'>
              +{suggestion.hashtags.length - 3} more
            </span>
          )}
        </div>
        <Button
          onClick={() => onSchedule(suggestion)}
          disabled={loading}
          className='flex items-center space-x-2'
        >
          <Save size={16} />
          <span>Schedule</span>
        </Button>
      </div>
    </div>
  );
};
