// File: app/api/suggestions/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { AIContentGenerator } from '@/lib/ai-content-generator';
import { UserProfile, APIResponse, ContentSuggestion } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userProfile, count = 5 }: { userProfile: UserProfile; count?: number } = body;

    if (!userProfile) {
      return NextResponse.json<APIResponse<null>>({
        success: false,
        error: 'User profile is required',
      }, { status: 400 });
    }

    const aiGenerator = AIContentGenerator.getInstance();
    const suggestions = await aiGenerator.generateContentSuggestions(userProfile, count);

    return NextResponse.json<APIResponse<ContentSuggestion[]>>({
      success: true,
      data: suggestions,
    });
  } catch (error) {
    console.error('Error generating suggestions:', error);
    return NextResponse.json<APIResponse<null>>({
      success: false,
      error: 'Failed to generate content suggestions',
    }, { status: 500 });
  }
}
