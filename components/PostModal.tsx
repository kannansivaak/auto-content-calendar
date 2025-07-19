// File: components/PostModal.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { ScheduledPost } from '@/types';
import { Button } from './ui/Button';

interface PostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (post: Partial<ScheduledPost>) => void;
  post: ScheduledPost | null;
  mode: 'create' | 'edit' | 'view';
  selectedDate?: Date;
}

export const PostModal: React.FC<PostModalProps> = ({
  isOpen,
  onClose,
  onSave,
  post,
  mode,
  selectedDate,
}) => {
  const [formData, setFormData] = useState({
    topic: '',
    type: 'post' as 'post' | 'story' | 'reel',
    format: 'image' as 'image' | 'video' | 'carousel',
    script: '',
    time: '12:00',
    hashtags: [] as string[],
    date: selectedDate?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
    status: 'scheduled' as 'draft' | 'scheduled' | 'published' | 'failed',
  });

  const [hashtagInput, setHashtagInput] = useState('');

  useEffect(() => {
    if (post && mode !== 'create') {
      setFormData({
        topic: post.topic,
        type: post.type,
        format: post.format,
        script: post.script,
        time: post.time.replace(/\s?(AM|PM)/i, ''),
        hashtags: post.hashtags,
        date: post.date,
        status: post.status,
      });
      setHashtagInput(post.hashtags.join(', '));
    } else if (mode === 'create') {
      const currentDate = selectedDate?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0];
      setFormData({
        topic: '',
        type: 'post',
        format: 'image',
        script: '',
        time: '12:00',
        hashtags: [],
        date: currentDate,
        status: 'scheduled',
      });
      setHashtagInput('');
    }
  }, [post, mode, selectedDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const hashtags = hashtagInput
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0)
      .map(tag => tag.startsWith('#') ? tag : `#${tag}`);

    const timeFormatted = formatTime(formData.time);

    // Ensure we have a valid date - this will never be undefined
    const validDate = formData.date || new Date().toISOString().split('T')[0];
    if (!validDate) {
      console.error('Unable to get a valid date');
      return;
    }

    onSave({
      ...formData,
      hashtags,
      time: timeFormatted,
      date: validDate,
    });
  };

  const formatTime = (time: string): string => {
    const timeParts = time.split(':');
    const hours = timeParts[0] || '12';
    const minutes = timeParts[1] || '00';

    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">
            {mode === 'create' && 'Create New Post'}
            {mode === 'edit' && 'Edit Post'}
            {mode === 'view' && 'Post Details'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {mode === 'view' ? (
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Topic</h4>
              <p className="text-white">{post?.topic}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Type</h4>
                <p className="text-white capitalize">{post?.type}</p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Format</h4>
                <p className="text-white capitalize">{post?.format}</p>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">Scheduled Time</h4>
              <p className="text-white">{post?.date} at {post?.time}</p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Script</h4>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="whitespace-pre-line">{post?.script}</p>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">Hashtags</h4>
              <div className="flex flex-wrap gap-2">
                {post?.hashtags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Topic</label>
              <input
                type="text"
                value={formData.topic}
                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter post topic"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as 'post' | 'story' | 'reel' })}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="post">Post</option>
                  <option value="story">Story</option>
                  <option value="reel">Reel</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Format</label>
                <select
                  value={formData.format}
                  onChange={(e) => setFormData({ ...formData, format: e.target.value as 'image' | 'video' | 'carousel' })}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="image">Image</option>
                  <option value="video">Video</option>
                  <option value="carousel">Carousel</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Time</label>
                <input
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Script</label>
              <textarea
                value={formData.script}
                onChange={(e) => setFormData({ ...formData, script: e.target.value })}
                className="w-full p-2 border rounded-lg h-32 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Write your post script here..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Hashtags</label>
              <input
                type="text"
                value={hashtagInput}
                onChange={(e) => setHashtagInput(e.target.value)}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter hashtags separated by commas (e.g., fitness, wellness, motivation)"
              />
              <p className="text-xs text-gray-500 mt-1">
                Separate hashtags with commas. # will be added automatically.
              </p>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button type="submit">
                {mode === 'create' ? 'Schedule Post' : 'Update Post'}
              </Button>
            </div>
          </form>
        )}

        {mode === 'view' && (
          <div className="flex justify-end pt-4">
            <Button onClick={onClose}>Close</Button>
          </div>
        )}
      </div>
    </div>
  );
};
