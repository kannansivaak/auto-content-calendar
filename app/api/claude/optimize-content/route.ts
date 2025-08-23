import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, optimizationType, brandVoice, audience } = body;

    const systemPrompt = `You are an expert Instagram content optimizer with deep knowledge of algorithm preferences and audience psychology.`;

    const userPrompt = `
    Optimize this Instagram content for ${optimizationType}:

    **Original Content:**
    ${content}

    **Brand Context:**
    - Brand Voice: ${brandVoice}
    - Target Audience: ${audience}
    - Optimization Goal: ${optimizationType}

    Please provide:
    1. **Optimized Content**: Improved version with better hooks, structure, and CTAs
    2. **Key Improvements**: List of specific changes made and why
    3. **Suggested Hashtags**: Optimized hashtag strategy for ${optimizationType}

    Format as JSON:
    {
      "optimizedContent": "improved content here",
      "improvements": ["improvement 1", "improvement 2", ...],
      "suggestedHashtags": ["hashtag1", "hashtag2", ...]
    }`;

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022', // Updated to latest Claude 3.5 Sonnet
      max_tokens: 2000,
      messages: [
        { role: 'user', content: userPrompt }
      ],
      system: systemPrompt,
    });

    const responseText = message.content[0]?.type === 'text'
      ? message.content[0].text
      : '';

    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found in Claude response');
    }

    const optimizedResult = JSON.parse(jsonMatch[0]);

    return NextResponse.json({
      success: true,
      data: optimizedResult
    });

  } catch (error) {
    console.error('Claude Optimize API Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to optimize content'
      },
      { status: 500 }
    );
  }
}
