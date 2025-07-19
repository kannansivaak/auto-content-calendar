import { AnalyticsData, ScheduledPost } from '@/types';

export class AnalyticsService {
  static calculateAnalytics(posts: ScheduledPost[]): AnalyticsData {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const recentPosts = posts.filter(post =>
      new Date(post.createdAt) >= weekAgo && post.status === 'published'
    );

    const totalEngagement = recentPosts.reduce((sum, post) => {
      if (post.engagementMetrics) {
        return sum + post.engagementMetrics.likes + post.engagementMetrics.comments + post.engagementMetrics.shares;
      }
      return sum;
    }, 0);

    const totalReach = recentPosts.reduce((sum, post) =>
      sum + (post.engagementMetrics?.reach || 0), 0
    );

    const avgEngagement = recentPosts.length > 0
      ? (totalEngagement / recentPosts.length) / (totalReach / recentPosts.length) * 100
      : 0;

    const topPerformingPost = recentPosts.reduce((best, current) => {
      const currentScore = current.engagementMetrics
        ? current.engagementMetrics.likes + current.engagementMetrics.comments * 2
        : 0;
      const bestScore = best?.engagementMetrics
        ? best.engagementMetrics.likes + best.engagementMetrics.comments * 2
        : 0;

      return currentScore > bestScore ? current : best;
    }, null as ScheduledPost | null);

    return {
      postsThisWeek: recentPosts.length,
      avgEngagement: Number(avgEngagement.toFixed(1)),
      bestPostingTime: '5:00 PM', // This would be calculated from actual data
      totalReach,
      totalImpressions: recentPosts.reduce((sum, post) =>
        sum + (post.engagementMetrics?.impressions || 0), 0
      ),
      followerGrowth: Math.floor(Math.random() * 100), // Mock data
      topPerformingPost,
    };
  }

  static getOptimalTimes(): { [key: string]: string[] } {
    return {
      monday: ['7:00 AM', '12:00 PM', '5:00 PM'],
      tuesday: ['7:00 AM', '12:00 PM', '6:00 PM'],
      wednesday: ['7:00 AM', '1:00 PM', '5:00 PM'],
      thursday: ['7:00 AM', '12:00 PM', '6:00 PM'],
      friday: ['7:00 AM', '1:00 PM', '4:00 PM'],
      saturday: ['9:00 AM', '2:00 PM', '6:00 PM'],
      sunday: ['10:00 AM', '3:00 PM', '7:00 PM'],
    };
  }
}
