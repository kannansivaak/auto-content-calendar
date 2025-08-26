// app/api/posts/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Post from '@/models/Posts';
import { z } from 'zod';

// Validation schema for creating/updating posts
const postSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  content: z.string().min(1, 'Content is required').max(2200, 'Content must be less than 2200 characters'),
  caption: z.string().max(150, 'Caption must be less than 150 characters').optional(),
  image: z.string().url('Invalid image URL').optional().or(z.literal('')),
  hashtags: z.array(z.string()).max(30, 'Maximum 30 hashtags allowed').default([]),
  suggestedTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)').optional(),
  contentPillars: z.array(z.string()).default([]),
  callToAction: z.string().max(200, 'Call to action must be less than 200 characters').optional(),
  visualDescription: z.string().max(1000, 'Visual description must be less than 1000 characters').optional(),
  postType: z.enum(['image', 'video', 'carousel', 'reel', 'story']).default('image'),
  format: z.enum(['educational', 'entertainment', 'promotional', 'inspirational', 'behind-the-scenes', 'user-generated']).default('educational'),
  niche: z.string().max(100, 'Niche must be less than 100 characters').optional(),
  audience: z.string().max(200, 'Audience must be less than 200 characters').optional(),
  brandVoice: z.string().max(100, 'Brand voice must be less than 100 characters').optional(),
  status: z.enum(['draft', 'scheduled', 'published', 'archived']).default('draft'),
  scheduledDate: z.string().datetime().optional(),
});

// Bulk save schema for multiple posts
const bulkPostSchema = z.object({
  posts: z.array(postSchema).min(1, 'At least one post is required').max(10, 'Maximum 10 posts per request'),
});

// Helper function to get user ID from request headers (set by middleware)
const getUserIdFromRequest = (request: NextRequest): string | null => {
  return request.headers.get('x-user-id');
};

// Response helpers
const errorResponse = (message: string, status: number = 400) => {
  return NextResponse.json(
    { success: false, message, error: message },
    { status }
  );
};

const successResponse = (data: any, message: string = 'Success') => {
  return NextResponse.json({
    success: true,
    message,
    data,
  });
};

// GET - Fetch user's posts
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return errorResponse('Authentication required', 401);
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '20');
    const page = parseInt(searchParams.get('page') || '1');
    const skip = (page - 1) * limit;

    let query: any = { userId };
    if (status && ['draft', 'scheduled', 'published', 'archived'].includes(status)) {
      query.status = status;
    }

    const [posts, total] = await Promise.all([
      Post.find(query)
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip)
        .populate('userId', 'name email'),
      Post.countDocuments(query)
    ]);

    return successResponse({
      posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      }
    }, 'Posts retrieved successfully');

  } catch (error) {
    console.error('Error fetching posts:', error);
    return errorResponse('Failed to fetch posts', 500);
  }
}

// POST - Create new post(s)
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return errorResponse('Authentication required', 401);
    }

    const body = await request.json();
    console.log('📝 Creating new post(s) for user:', userId);

    // Check if it's a bulk operation (array of posts) or single post
    const isBulkOperation = Array.isArray(body.posts);

    if (isBulkOperation) {
      // Validate bulk posts
      const validationResult = bulkPostSchema.safeParse(body);
      if (!validationResult.success) {
        const errors = validationResult.error.issues.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
        return errorResponse(`Validation error: ${errors}`, 400);
      }

      const { posts: postsData } = validationResult.data;

      // Create multiple posts
      const createdPosts = [];
      for (const postData of postsData) {
        const newPost = new Post({
          ...postData,
          userId,
          scheduledDate: postData.scheduledDate ? new Date(postData.scheduledDate) : undefined,
        });

        const savedPost = await newPost.save();
        createdPosts.push(savedPost);
      }

      console.log(`✅ Created ${createdPosts.length} posts for user:`, userId);

      return successResponse(
        { posts: createdPosts },
        `${createdPosts.length} posts created successfully`
      );

    } else {
      // Single post creation
      const validationResult = postSchema.safeParse(body);
      if (!validationResult.success) {
        const errors = validationResult.error.issues.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
        return errorResponse(`Validation error: ${errors}`, 400);
      }

      const postData = validationResult.data;

      const newPost = new Post({
        ...postData,
        userId,
        scheduledDate: postData.scheduledDate ? new Date(postData.scheduledDate) : undefined,
      });

      const savedPost = await newPost.save();

      console.log('✅ Post created successfully:', savedPost._id);

      return successResponse(
        { post: savedPost },
        'Post created successfully'
      );
    }

  } catch (error) {
    console.error('Error creating post:', error);

    if (error instanceof Error) {
      if (error.name === 'ValidationError') {
        return errorResponse(`Validation error: ${error.message}`, 400);
      }
      if (error.message.includes('E11000')) {
        return errorResponse('Duplicate post detected', 409);
      }
    }

    return errorResponse('Failed to create post', 500);
  }
}

// PUT - Update existing post
export async function PUT(request: NextRequest) {
  try {
    await connectDB();

    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return errorResponse('Authentication required', 401);
    }

    const body = await request.json();
    const { postId, ...updateData } = body;

    if (!postId) {
      return errorResponse('Post ID is required', 400);
    }

    // Validate update data
    const validationResult = postSchema.partial().safeParse(updateData);
    if (!validationResult.success) {
      const errors = validationResult.error.issues.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
      return errorResponse(`Validation error: ${errors}`, 400);
    }

    const validatedData = validationResult.data;

    // Find and update the post (ensure user owns the post)
    const updatedPost = await Post.findOneAndUpdate(
      { _id: postId, userId },
      {
        ...validatedData,
        scheduledDate: validatedData.scheduledDate ? new Date(validatedData.scheduledDate) : undefined,
      },
      { new: true, runValidators: true }
    );

    if (!updatedPost) {
      return errorResponse('Post not found', 404);
    }

    console.log('✅ Post updated successfully:', updatedPost._id);

    return successResponse(
      { post: updatedPost },
      'Post updated successfully'
    );

  } catch (error) {
    console.error('Error updating post:', error);
    return errorResponse('Failed to update post', 500);
  }
}

// DELETE - Delete post
export async function DELETE(request: NextRequest) {
  try {
    await connectDB();

    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return errorResponse('Authentication required', 401);
    }

    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('postId');

    if (!postId) {
      return errorResponse('Post ID is required', 400);
    }

    // Find and delete the post (ensure user owns the post)
    const deletedPost = await Post.findOneAndDelete({ _id: postId, userId });

    if (!deletedPost) {
      return errorResponse('Post not found', 404);
    }

    console.log('✅ Post deleted successfully:', deletedPost._id);

    return successResponse(
      { postId: deletedPost._id },
      'Post deleted successfully'
    );

  } catch (error) {
    console.error('Error deleting post:', error);
    return errorResponse('Failed to delete post', 500);
  }
}
