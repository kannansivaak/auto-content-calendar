import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import connectDB from '@/lib/mongodb';
import Post from '@/models/Posts';
import { jwtDecode } from 'jwt-decode';
import mongoose from 'mongoose';

interface JWTPayload {
  userId: string;
  type: 'access';
  exp: number;
}

interface GeneratedContent {
  id: string;
  title: string;
  script: string;
  caption: string;
  hashtags: string[];
  suggestedTime: string;
  contentPillars: string[];
  callToAction: string;
  visualDescription: string;
}

interface RequestBody {
  prompt: {
    niche: string;
    audience: string;
    brandVoice: string;
    postType: string;
    format: string;
    topic?: string;
    specificRequirements?: string;
    recentPosts?: string[];
    trendingHashtags?: string[];
  };
  count?: number;
  saveToDatabase?: boolean;
}

// Helper function to get user ID from request (try multiple methods)
const getUserIdFromRequest = (request: NextRequest): string | null => {
  // First try to get from middleware header
  const userIdFromHeader = request.headers.get('x-user-id');
  if (userIdFromHeader) {
    return userIdFromHeader;
  }

  // Fallback: decode JWT token directly
  try {
    let token: string | null = null;

    // Try to get token from Authorization header
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.replace('Bearer ', '');
    }

    // If no authorization header, try to get token from cookies
    if (!token) {
      const cookies = request.headers.get('cookie');
      if (cookies) {
        const tokenMatch = cookies.match(/token=([^;]+)/);
        if (tokenMatch && tokenMatch[1]) {
          token = tokenMatch[1];
        }
      }
    }

    if (token) {
      const decoded = jwtDecode<JWTPayload>(token);

      // Check if token is valid and not expired
      if (decoded.exp * 1000 > Date.now() && decoded.type === 'access') {
        return decoded.userId;
      }
    }
  } catch (error) {
    console.error('Error decoding JWT token:', error);
  }

  return null;
};

export async function POST(request: NextRequest) {
  try {
    // Get user ID from middleware
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if API key exists
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      console.error('ANTHROPIC_API_KEY not found in environment variables');
      console.log('Available env vars:', Object.keys(process.env).filter(key =>
        key.toLowerCase().includes('anthropic') || key.toLowerCase().includes('claude')
      ));

      return NextResponse.json(
        {
          success: false,
          error: 'API key not configured. Check ANTHROPIC_API_KEY environment variable.'
        },
        { status: 500 }
      );
    }

    // Initialize Anthropic with explicit error handling
    const anthropic = new Anthropic({
      apiKey: apiKey,
    });

    const body: RequestBody = await request.json();
    const { prompt, count = 5, saveToDatabase = true } = body;

    // Debug logging
    console.log('📨 Received request body:', {
      prompt: {
        ...prompt,
        postType: prompt.postType,
        format: prompt.format
      },
      count,
      saveToDatabase
    });

    if (!prompt) {
      return NextResponse.json(
        { success: false, error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Validate required prompt fields (format and postType are optional with defaults)
    const requiredFields = ['niche', 'audience', 'brandVoice'];
    for (const field of requiredFields) {
      if (!prompt[field as keyof typeof prompt]) {
        return NextResponse.json(
          { success: false, error: `${field} is required in prompt` },
          { status: 400 }
        );
      }
    }

    // Default values if not provided - let normalization handle validation
    const postType = prompt.postType || 'Regular Post';
    const format = prompt.format || 'Single Image';

    console.log('🔄 Received values:', {
      originalPostType: prompt.postType,
      originalFormat: prompt.format,
      normalizedPostType: postType,
      normalizedFormat: format
    });

    const systemPrompt = `You are an expert Instagram content creator and social media strategist with deep knowledge of:
    - Current Instagram algorithm preferences and engagement patterns
    - Psychology of social media engagement and user behavior
    - Content trends and viral mechanics
    - Brand storytelling and authentic voice development
    - Visual content strategy and composition principles

    Generate creative, engaging Instagram content that drives authentic engagement, builds community, and aligns with brand goals.
    Focus on providing genuine value to the audience while maintaining the specified brand voice and personality.

    Always ensure content is:
    - Authentic and relatable to the target audience
    - Optimized for Instagram's current algorithm preferences
    - Visually engaging and shareable
    - Action-oriented with clear calls to engagement
    - Consistent with the brand's voice and values`;

    const userPrompt = `
    Generate ${count} highly engaging Instagram content ideas for the following brand profile:

    **Brand Details:**
    - Niche: ${prompt.niche}
    - Target Audience: ${prompt.audience}
    - Brand Voice: ${prompt.brandVoice}
    - Post Type: ${postType}
    - Content Format: ${format}
    ${prompt.topic ? `- Topic Focus: ${prompt.topic}` : ''}
    ${prompt.specificRequirements ? `- Special Requirements: ${prompt.specificRequirements}` : ''}

    ${prompt.recentPosts?.length ? `**Recent Posts (avoid repetition):**\n${prompt.recentPosts.join('\n')}\n` : ''}

    ${prompt.trendingHashtags?.length ? `**Trending Hashtags to Consider:**\n${prompt.trendingHashtags.join(', ')}\n` : ''}

    For each content idea, provide:
    1. **Script/Caption**: Hook-driven opening, valuable content body, engaging CTA
    2. **Hashtags**: Strategic mix of trending, niche-specific, and branded hashtags (25-30 total)
    3. **Best Posting Time**: Optimal timing based on audience behavior and content type
    4. **Content Pillars**: Which brand content pillars this supports
    5. **Visual Description**: Detailed, actionable description for content creation
    6. **Call to Action**: Specific, measurable engagement driver

    **IMPORTANT:** Return your response as a valid JSON array only, with this exact structure:
    [
      {
        "id": "post_${Date.now()}_1",
        "title": "Compelling post title",
        "script": "Full engaging caption with hooks, value, and CTA",
        "caption": "Shorter preview version (first 2-3 sentences)",
        "hashtags": ["hashtag1", "hashtag2", "hashtag3"],
        "suggestedTime": "14:30",
        "contentPillars": ["pillar1", "pillar2"],
        "callToAction": "Specific engagement action",
        "visualDescription": "Detailed visual concept and composition"
      }
    ]

    Make each post unique, valuable, and optimized for maximum engagement!`;

    console.log('Making request to Claude API...');

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022', // Using latest Claude 3.5 Sonnet
      max_tokens: 8000, // Increased for more detailed content
      temperature: 0.7, // Balanced creativity
      messages: [
        { role: 'user', content: userPrompt }
      ],
      system: systemPrompt,
    });

    const responseText = message.content[0]?.type === 'text'
      ? message.content[0].text
      : '';

    if (!responseText) {
      throw new Error('Empty response from Claude API');
    }

    // Extract JSON from the response with better error handling
    let generatedContent: GeneratedContent[];
    try {
      // Try to find JSON array in the response
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        console.error('No JSON array found in Claude response:', responseText);
        throw new Error('No valid JSON array found in Claude response');
      }

      generatedContent = JSON.parse(jsonMatch[0]);

      // Validate the structure
      if (!Array.isArray(generatedContent) || generatedContent.length === 0) {
        throw new Error('Invalid response structure from Claude');
      }

      // Ensure each content item has required fields
      generatedContent.forEach((content, index) => {
        if (!content.title || !content.script) {
          throw new Error(`Invalid content structure at index ${index}`);
        }
        // Generate ID if missing
        if (!content.id) {
          content.id = `post_${Date.now()}_${index + 1}`;
        }
      });

    } catch (jsonError) {
      console.error('JSON parsing error:', jsonError);
      console.error('Raw response:', responseText);
      throw new Error('Failed to parse generated content as JSON');
    }

    // Save to database if requested
    let savedPosts = null;
    if (saveToDatabase) {
      try {
        await connectDB();

        console.log('💾 Saving generated content to database...');

        // Helper function to validate and normalize enum values
        const normalizePostType = (type: string): string => {
          if (!type) return 'image';

          const typeMap: { [key: string]: string } = {
            'regular post': 'image',
            'regularpost': 'image',
            'post': 'image',
            'image': 'image',
            'instagram reel': 'reel',
            'instagramreel': 'reel',
            'reel': 'reel',
            'reels': 'reel',
            'story': 'story',
            'stories': 'story',
            'video': 'video',
            'carousel': 'carousel'
          };

          const normalized = type.toLowerCase().trim();
          return typeMap[normalized] || 'image';
        };

        const normalizeFormat = (format: string): string => {
          if (!format) return 'educational';

          const formatMap: { [key: string]: string } = {
            'single image': 'educational',
            'singleimage': 'educational',
            'image': 'educational',
            'video': 'entertainment',
            'carousel': 'educational',
            'educational': 'educational',
            'entertainment': 'entertainment',
            'promotional': 'promotional',
            'inspirational': 'inspirational',
            'behind-the-scenes': 'behind-the-scenes',
            'behind the scenes': 'behind-the-scenes',
            'behindthescenes': 'behind-the-scenes',
            'user-generated': 'user-generated',
            'user generated': 'user-generated',
            'usergenerated': 'user-generated'
          };

          const normalized = format.toLowerCase().trim();
          return formatMap[normalized] || 'educational';
        };

        // Helper function to truncate text to fit field limits
        const truncateText = (text: string, maxLength: number): string => {
          if (!text) return '';
          return text.length > maxLength ? text.substring(0, maxLength - 3) + '...' : text;
        };

        // Helper function to clean and validate hashtags
        const cleanHashtags = (hashtags: string[]): string[] => {
          if (!hashtags || !Array.isArray(hashtags)) return [];
          return hashtags
            .map(tag => tag.trim().toLowerCase().replace(/^#/, ''))
            .filter(tag => tag.length > 0)
            .slice(0, 30); // MongoDB schema limit
        };

        // Transform generated content to match Post model with proper validation
        const postsToSave = generatedContent.map((content: GeneratedContent) => ({
          title: truncateText(content.title, 97), // 100 char limit - 3 for ellipsis
          content: truncateText(content.script, 2197), // 2200 char limit - 3 for ellipsis
          caption: content.caption
            ? truncateText(content.caption, 147) // 150 char limit - 3 for ellipsis
            : truncateText(content.script, 147),
          hashtags: cleanHashtags(content.hashtags),
          suggestedTime: content.suggestedTime && /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(content.suggestedTime)
            ? content.suggestedTime
            : '12:00',
          contentPillars: Array.isArray(content.contentPillars) ? content.contentPillars : [],
          callToAction: truncateText(content.callToAction, 197), // 200 char limit
          visualDescription: truncateText(content.visualDescription, 997), // 1000 char limit
          postType: normalizePostType(postType),
          format: normalizeFormat(format),
          niche: truncateText(prompt.niche, 97), // 100 char limit
          audience: truncateText(prompt.audience, 197), // 200 char limit
          brandVoice: truncateText(prompt.brandVoice, 97), // 100 char limit
          status: 'draft', // Save as draft by default
          userId, // Associate with the authenticated user
        }));

        // Save all posts to database using insertMany for better performance
        const createdPosts = await Post.insertMany(
          postsToSave.map(postData => ({
            ...postData,
            userId: new mongoose.Types.ObjectId(userId), // Ensure proper ObjectId
            createdAt: new Date(),
            updatedAt: new Date(),
          }))
        );

        savedPosts = createdPosts;
        console.log(`✅ Successfully saved ${createdPosts.length} posts to database for user: ${userId}`);

      } catch (dbError) {
        console.error('❌ Database save error:', dbError);
        // Log the error but don't fail the entire request
        // The user still gets their generated content even if DB save fails
        console.warn('Content generated successfully but database save failed');
      }
    }

    // Return success response
    return NextResponse.json({
      success: true,
      data: {
        generatedContent,
        savedPosts: savedPosts || [],
        totalGenerated: generatedContent.length,
        totalSaved: savedPosts ? savedPosts.length : 0,
        userId,
      },
      message: savedPosts
        ? `Successfully generated ${generatedContent.length} posts and saved ${savedPosts.length} to database`
        : `Successfully generated ${generatedContent.length} posts (database save ${saveToDatabase ? 'failed' : 'skipped'})`
    });

  } catch (error) {
    console.error('❌ API Error Details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    });

    // Return detailed error response
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate content',
        details: error instanceof Error ? error.name : 'Unknown error type',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
