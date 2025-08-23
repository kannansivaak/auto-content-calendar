import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { niche, audience } = body;
    const currentMonth = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    const systemPrompt = `You are a trend forecaster specializing in social media and Instagram content trends.`;

    const userPrompt = `
    Generate 10 trending topic ideas for Instagram content in ${currentMonth}:

    **Context:**
    - Niche: ${niche}
    - Target Audience: ${audience}
    - Month: ${currentMonth}

    Focus on:
    - Current cultural moments and conversations
    - Seasonal relevance
    - Niche-specific trends
    - Audience interests and pain points

    Return as a JSON array of trending topics:
    ["topic 1", "topic 2", "topic 3", ...]`;

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022', // Updated to latest Claude 3.5 Sonnet
      max_tokens: 1000,
      messages: [
        { role: 'user', content: userPrompt }
      ],
      system: systemPrompt,
    });

    const responseText = message.content[0]?.type === 'text'
      ? message.content[0].text
      : '';

    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found in Claude response');
    }

    const trendingTopics = JSON.parse(jsonMatch[0]);

    return NextResponse.json({
      success: true,
      data: trendingTopics
    });

  } catch (error) {
    console.error('Claude Trending Topics API Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get trending topics'
      },
      { status: 500 }
    );
  }
}
