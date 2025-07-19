// File: components/PostCard.tsx
'use client';

import React from 'react';
import { Camera, MessageSquare, Video, Clock, Edit3, Trash2, Eye } from 'lucide-react';
import { ScheduledPost } from '@/types';
import { Button } from './ui/Button';

interface PostCardProps {
  post: ScheduledPost;
  onEdit: (post: ScheduledPost) => void;
  onDelete: (id: string) => void;
  onView: (post: ScheduledPost) => void;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  onEdit,
  onDelete,
  onView,
}) => {
  const getTypeIcon = () => {
    switch (post.type) {
      case 'post':
        return <Camera className="text-blue-500" size={16} />;
      case 'story':
        return <MessageSquare className="text-green-500" size={16} />;
      case 'reel':
        return <Video className="text-purple-500" size={16} />;
    }
  };

  const getStatusColor = () => {
    switch (post.status) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
    }
  };

  return (
    <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center space-x-2">
          {getTypeIcon()}
          <span className="font-medium">{post.topic}</span>
          <span className={`text-xs px-2 py-1 rounded ${getStatusColor()}`}>
            {post.status}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <Clock size={14} className="text-gray-400" />
          <span className="text-sm text-white">{post.time}</span>
        </div>
      </div>

      <p className="text-sm text-white mb-2 line-clamp-2">
        {post.script}
      </p>

      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-1">
          {post.hashtags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-xs bg-gray-100 px-2 py-1 rounded"
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onView(post)}
          >
            <Eye size={14} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(post)}
          >
            <Edit3 size={14} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(post.id)}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 size={14} />
          </Button>
        </div>
      </div>
    </div>
  );
};
