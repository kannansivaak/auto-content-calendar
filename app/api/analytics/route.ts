// File: app/api/analytics/route.ts
import { NextResponse } from 'next/server';
import { AnalyticsService } from '@/lib/analytics';
import { APIResponse, AnalyticsData, ScheduledPost } from '@/types';

export async function GET() {
  try {
    // In production, fetch posts from database
    const posts: ScheduledPost[] = []; // Explicitly typed as ScheduledPost[]
    const analytics = AnalyticsService.calculateAnalytics(posts);

    return NextResponse.json<APIResponse<AnalyticsData>>({
      success: true,
      data: analytics,
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json<APIResponse<null>>({
      success: false,
      error: 'Failed to fetch analytics',
    }, { status: 500 });
  }
}
