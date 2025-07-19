// File: components/CalendarView.tsx
'use client';

import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { ScheduledPost } from '@/types';
import { Button } from './ui/Button';
import { PostCard } from './PostCard';

interface CalendarViewProps {
  posts: ScheduledPost[];
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  onCreatePost: () => void;
  onEditPost: (post: ScheduledPost) => void;
  onDeletePost: (id: string) => void;
  onViewPost: (post: ScheduledPost) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  posts,
  selectedDate,
  onDateSelect,
  onCreatePost,
  onEditPost,
  onDeletePost,
  onViewPost,
}) => {
  const [currentMonth, setCurrentMonth] = useState(selectedDate);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getPostsForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return posts.filter(post => post.date === dateStr);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    if (direction === 'prev') {
      newMonth.setMonth(newMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1);
    }
    setCurrentMonth(newMonth);
  };

  const selectedDatePosts = getPostsForDate(selectedDate);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-white">Content Calendar</h2>
        <Button onClick={onCreatePost} className="flex items-center space-x-2">
          <Plus size={16} />
          <span>New Post</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <div className="bg-transparent rounded-lg shadow-sm border text-white">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-medium">
                {format(currentMonth, 'MMMM yyyy')}
              </h3>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateMonth('prev')}
                >
                  <ChevronLeft size={16} />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateMonth('next')}
                >
                  <ChevronRight size={16} />
                </Button>
              </div>
            </div>

            <div className="p-4">
              <div className="grid grid-cols-7 gap-1 mb-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center text-sm font-medium text-white py-2">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {monthDays.map(day => {
                  const dayPosts = getPostsForDate(day);
                  const isSelected = isSameDay(day, selectedDate);
                  const isTodayDate = isToday(day);

                  return (
                    <button
                      key={day.toISOString()}
                      onClick={() => onDateSelect(day)}
                      className={`
                        aspect-square p-2 text-sm rounded-lg border transition-colors relative
                        ${isSelected
                          ? 'bg-blue-100 border-blue-300 text-blue-900'
                          : 'hover:bg-white hover:text-purple-800 border-gray-200'
                        }
                        ${isTodayDate ? 'font-bold text-blue-600' : ''}
                      `}
                    >
                      <span className="block">{format(day, 'd')}</span>
                      {dayPosts.length > 0 && (
                        <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Selected Date Posts */}
        <div className="lg:col-span-1">
          <div className="bg-transparent hover:bg-transparent text-white rounded-lg shadow-sm border p-4">
            <h3 className="font-medium mb-4">
              {format(selectedDate, 'EEEE, MMMM d, yyyy')}
            </h3>

            <div className="space-y-3">
              {selectedDatePosts.map(post => (
                <PostCard
                  key={post.id}
                  post={post}
                  onEdit={onEditPost}
                  onDelete={onDeletePost}
                  onView={onViewPost}
                />
              ))}
              {selectedDatePosts.length === 0 && (
                <div className="text-center py-8 text-white">
                  <p>No posts scheduled for this date</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onCreatePost}
                    className="mt-2"
                  >
                    <Plus size={14} className="mr-1" />
                    Add Post
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
