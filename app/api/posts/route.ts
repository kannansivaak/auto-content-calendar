// File: app/api/posts/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { ScheduledPost, APIResponse } from '@/types';

// In-memory storage (replace with database in production)
let posts: ScheduledPost[] = [
  {
    id: '1',
    date: '2025-07-16',
    time: '7:00 AM',
    type: 'post',
    format: 'carousel',
    topic: 'Morning Routine Transformation',
    script: '🌅 Transform your mornings with these game-changing habits!\n\n✨ Here\'s what works:\n1. Hydrate immediately (500ml water)\n2. 5-minute mindfulness practice\n3. Write down your top 3 priorities\n4. Move your body for 10 minutes\n5. Fuel up with protein-rich breakfast',
    hashtags: ['#morningroutine', '#wellness', '#healthyhabits', '#productivity', '#selfcare'],
    status: 'scheduled',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Utility function to safely update a post with proper type handling
function updateScheduledPost(
  existingPost: ScheduledPost,
  updates: Partial<ScheduledPost>
): ScheduledPost {
  const result: ScheduledPost = {
    // Required properties - always from existing or updates
    id: existingPost.id,
    date: updates.date ?? existingPost.date,
    time: updates.time ?? existingPost.time,
    type: updates.type ?? existingPost.type,
    format: updates.format ?? existingPost.format,
    topic: updates.topic ?? existingPost.topic,
    script: updates.script ?? existingPost.script,
    hashtags: updates.hashtags ?? existingPost.hashtags,
    status: updates.status ?? existingPost.status,
    createdAt: existingPost.createdAt,
    updatedAt: new Date().toISOString(),
  };

  // Optional properties - only add if they exist in either existing or updates
  if (updates.imageUrl !== undefined) {
    result.imageUrl = updates.imageUrl;
  } else if (existingPost.imageUrl !== undefined) {
    result.imageUrl = existingPost.imageUrl;
  }

  if (updates.videoUrl !== undefined) {
    result.videoUrl = updates.videoUrl;
  } else if (existingPost.videoUrl !== undefined) {
    result.videoUrl = existingPost.videoUrl;
  }

  if (updates.engagementMetrics !== undefined) {
    result.engagementMetrics = updates.engagementMetrics;
  } else if (existingPost.engagementMetrics !== undefined) {
    result.engagementMetrics = existingPost.engagementMetrics;
  }

  return result;
}

export async function GET() {
  return NextResponse.json<APIResponse<ScheduledPost[]>>({
    success: true,
    data: posts,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const newPost: Omit<ScheduledPost, 'id' | 'createdAt' | 'updatedAt'> = body;

    const post: ScheduledPost = {
      ...newPost,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    posts.push(post);

    return NextResponse.json<APIResponse<ScheduledPost>>({
      success: true,
      data: post,
      message: 'Post scheduled successfully',
    });
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json<APIResponse<null>>({
      success: false,
      error: 'Failed to schedule post',
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates }: Partial<ScheduledPost> & { id: string } = body;

    const postIndex = posts.findIndex(post => post.id === id);
    if (postIndex === -1) {
      return NextResponse.json<APIResponse<null>>({
        success: false,
        error: 'Post not found',
      }, { status: 404 });
    }

    const existingPost = posts[postIndex];
    if (!existingPost) {
      return NextResponse.json<APIResponse<null>>({
        success: false,
        error: 'Post not found',
      }, { status: 404 });
    }

    const updatedPost = updateScheduledPost(existingPost, updates);
    posts[postIndex] = updatedPost;

    return NextResponse.json<APIResponse<ScheduledPost>>({
      success: true,
      data: updatedPost,
      message: 'Post updated successfully',
    });
  } catch (error) {
    console.error('Error updating post:', error);
    return NextResponse.json<APIResponse<null>>({
      success: false,
      error: 'Failed to update post',
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json<APIResponse<null>>({
        success: false,
        error: 'Post ID is required',
      }, { status: 400 });
    }

    const postIndex = posts.findIndex(post => post.id === id);
    if (postIndex === -1) {
      return NextResponse.json<APIResponse<null>>({
        success: false,
        error: 'Post not found',
      }, { status: 404 });
    }

    posts.splice(postIndex, 1);

    return NextResponse.json<APIResponse<null>>({
      success: true,
      message: 'Post deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json<APIResponse<null>>({
      success: false,
      error: 'Failed to delete post',
    }, { status: 500 });
  }
}
