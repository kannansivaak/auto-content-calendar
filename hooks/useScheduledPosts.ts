// File: hooks/useScheduledPosts.ts
import { useState, useEffect, useCallback } from 'react';
import { ScheduledPost, APIResponse } from '@/types';

export const useScheduledPosts = () => {
  const [posts, setPosts] = useState<ScheduledPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/posts');
      const result: APIResponse<ScheduledPost[]> = await response.json();

      if (result.success && result.data) {
        setPosts(result.data);
      } else {
        setError(result.error || 'Failed to fetch posts');
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Error fetching posts:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createPost = useCallback(async (post: Omit<ScheduledPost, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(post),
      });

      const result: APIResponse<ScheduledPost> = await response.json();

      if (result.success && result.data) {
        setPosts(prev => [...prev, result.data!]);
        return result.data;
      } else {
        throw new Error(result.error || 'Failed to create post');
      }
    } catch (err) {
      console.error('Error creating post:', err);
      throw err;
    }
  }, []);

  const updatePost = useCallback(async (id: string, updates: Partial<ScheduledPost>) => {
    try {
      const response = await fetch('/api/posts', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, ...updates }),
      });

      const result: APIResponse<ScheduledPost> = await response.json();

      if (result.success && result.data) {
        setPosts(prev => prev.map(post =>
          post.id === id ? result.data! : post
        ));
        return result.data;
      } else {
        throw new Error(result.error || 'Failed to update post');
      }
    } catch (err) {
      console.error('Error updating post:', err);
      throw err;
    }
  }, []);

  const deletePost = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/posts?id=${id}`, {
        method: 'DELETE',
      });

      const result: APIResponse<null> = await response.json();

      if (result.success) {
        setPosts(prev => prev.filter(post => post.id !== id));
      } else {
        throw new Error(result.error || 'Failed to delete post');
      }
    } catch (err) {
      console.error('Error deleting post:', err);
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return {
    posts,
    loading,
    error,
    createPost,
    updatePost,
    deletePost,
    refetch: fetchPosts,
  };
};
