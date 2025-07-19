// File: components/ContentSuggestionCard.tsx
'use client';

import React from 'react';
import { Camera, MessageSquare, Video, Clock, TrendingUp, Save } from 'lucide-react';
import { ContentSuggestion } from '@/types';
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
        return <Camera className="text-blue-500" size={20} />;
      case 'story':
        return <MessageSquare className="text-green-500" size={20} />;
      case 'reel':
        return <Video className="text-purple-500" size={20} />;
    }
  };

  const getEngagementColor = () => {
    switch (suggestion.expectedEngagement) {
      case 'Very High':
        return 'text-green-600';
      case 'High':
        return 'text-blue-600';
      case 'Medium':
        return 'text-yellow-600';
      case 'Low':
        return 'text-gray-600';
    }
  };

  return (
    <div className="gradient text-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-3">
          {getTypeIcon()}
          <div>
            <h3 className="font-semibold text-white">{suggestion.topic}</h3>
            <p className="text-sm text-white capitalize">
              {suggestion.format} • {suggestion.type}
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center space-x-1 text-sm text-gray-600 mb-1">
            <Clock size={14} />
            <span>{suggestion.suggestedTime}</span>
          </div>
          <div className="flex items-center space-x-1 text-sm">
            <TrendingUp size={14} />
            <span className={getEngagementColor()}>
              {suggestion.expectedEngagement}
            </span>
          </div>
        </div>
      </div>

      <div className="gradient rounded-lg p-4 mb-4">
        <p className="text-sm whitespace-pre-line text-white">
          {suggestion.script}
        </p>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-1">
          {suggestion.hashtags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-xs bg-blue-100 text-white px-2 py-1 rounded"
            >
              {tag}
            </span>
          ))}
          {suggestion.hashtags.length > 3 && (
            <span className="text-xs text-gray-500">
              +{suggestion.hashtags.length - 3} more
            </span>
          )}
        </div>
        <Button
          onClick={() => onSchedule(suggestion)}
          disabled={loading}
          className="flex items-center space-x-2"
        >
          <Save size={16} />
          <span>Schedule</span>
        </Button>
      </div>
    </div>
  );
};
