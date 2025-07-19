// File: hooks/useContentSuggestions.ts
import { useState, useCallback } from 'react';
import { ContentSuggestion, UserProfile, APIResponse } from '@/types';

export const useContentSuggestions = () => {
  const [suggestions, setSuggestions] = useState<ContentSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateSuggestions = useCallback(async (userProfile: UserProfile, count = 5) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userProfile, count }),
      });

      const result: APIResponse<ContentSuggestion[]> = await response.json();

      if (result.success && result.data) {
        setSuggestions(result.data);
      } else {
        setError(result.error || 'Failed to generate suggestions');
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Error generating suggestions:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    suggestions,
    loading,
    error,
    generateSuggestions,
  };
};
