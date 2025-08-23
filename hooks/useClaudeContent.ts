import { useState, useCallback } from 'react';
import { ContentGenerationPrompt, GeneratedContent } from '@/lib/claude';

export function useClaudeContent() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateContent = useCallback(async (
    prompt: ContentGenerationPrompt,
    count: number = 5
  ): Promise<GeneratedContent[]> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/claude/generate-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt, count }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to generate content');
      }

      return result.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate content';
      setError(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const optimizeContent = useCallback(async (
    content: string,
    optimizationType: 'engagement' | 'reach' | 'conversions',
    brandVoice: string,
    audience: string
  ) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/claude/optimize-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content, optimizationType, brandVoice, audience }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to optimize content');
      }

      return result.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to optimize content';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getTrendingTopics = useCallback(async (
    niche: string,
    audience: string
  ): Promise<string[]> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/claude/trending-topics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ niche, audience }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to get trending topics');
      }

      return result.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get trending topics';
      setError(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const analyzePerformance = useCallback(async (
    posts: Array<{
      content: string;
      engagement: number;
      impressions: number;
      type: string;
      hashtags: string[];
    }>
  ) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/claude/analyze-performance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ posts }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to analyze performance');
      }

      return result.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to analyze performance';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    generateContent,
    optimizeContent,
    getTrendingTopics,
    analyzePerformance,
    loading,
    error
  };
}
