import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY, // In production, use server-side API key
});

export interface ContentGenerationPrompt {
  niche: string;
  audience: string;
  brandVoice: string;
  postType: 'post' | 'reel' | 'story';
  format: 'image' | 'video' | 'carousel';
  topic?: string;
  specificRequirements?: string;
  recentPosts?: string[];
  trendingHashtags?: string[];
}

export interface GeneratedContent {
  id: string;
  script: string;
  caption: string;
  hashtags: string[];
  suggestedTime: string;
  contentPillars: string[];
  callToAction: string;
  visualDescription: string;
}

export class ClaudeAIService {
  /**
   * Generate Instagram content suggestions using Claude AI
   */
  static async generateContentSuggestions(
    prompt: ContentGenerationPrompt,
    count: number = 5
  ): Promise<GeneratedContent[]> {
    try {
      const systemPrompt = `You are an expert Instagram content creator and social media strategist.
      You understand engagement patterns, audience psychology, and platform best practices.

      Generate creative, engaging Instagram content that drives authentic engagement and aligns with brand goals.
      Focus on providing value to the audience while maintaining the specified brand voice.`;

      const userPrompt = `
      Generate ${count} Instagram content ideas for:

      **Brand Profile:**
      - Niche: ${prompt.niche}
      - Target Audience: ${prompt.audience}
      - Brand Voice: ${prompt.brandVoice}
      - Post Type: ${prompt.postType}
      - Format: ${prompt.format}
      ${prompt.topic ? `- Topic Focus: ${prompt.topic}` : ''}
      ${prompt.specificRequirements ? `- Special Requirements: ${prompt.specificRequirements}` : ''}

      ${prompt.recentPosts?.length ? `**Recent Posts to Avoid Repetition:**\n${prompt.recentPosts.join('\n')}` : ''}

      ${prompt.trendingHashtags?.length ? `**Trending Hashtags to Consider:**\n${prompt.trendingHashtags.join(', ')}` : ''}

      For each content idea, provide:
      1. **Script/Caption**: Engaging hook, value-driven content, clear CTA
      2. **Hashtags**: Mix of popular, niche, and branded hashtags (20-30)
      3. **Best Posting Time**: Based on audience and content type
      4. **Content Pillars**: Which brand pillar this supports
      5. **Visual Description**: Detailed description for content creation
      6. **Call to Action**: Specific engagement driver

      Format your response as a JSON array with this structure:
      [
        {
          "id": "unique_id",
          "script": "Full caption with hooks and CTAs",
          "caption": "Shorter version for preview",
          "hashtags": ["hashtag1", "hashtag2", ...],
          "suggestedTime": "HH:MM",
          "contentPillars": ["pillar1", "pillar2"],
          "callToAction": "Specific CTA",
          "visualDescription": "Detailed visual concept"
        }
      ]

      Make it authentic, valuable, and engaging!`;

      const message = await anthropic.messages.create({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 4000,
        messages: [{ role: 'user', content: userPrompt }],
        system: systemPrompt,
      });

      const responseText =
        message?.content[0]?.type === 'text' ? message?.content[0].text : '';

      // Extract JSON from the response
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in Claude response');
      }

      const generatedContent = JSON.parse(jsonMatch[0]);
      return generatedContent;
    } catch (error) {
      console.error('Error generating content with Claude:', error);
      // Fallback to mock data if Claude fails
      return this.generateFallbackContent(prompt, count);
    }
  }

  /**
   * Optimize existing content using Claude AI
   */
  static async optimizeContent(
    content: string,
    optimizationType: 'engagement' | 'reach' | 'conversions',
    brandVoice: string,
    audience: string
  ): Promise<{
    optimizedContent: string;
    improvements: string[];
    suggestedHashtags: string[];
  }> {
    try {
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
        model: 'claude-3-sonnet-20240229',
        max_tokens: 2000,
        messages: [{ role: 'user', content: userPrompt }],
        system: systemPrompt,
      });

      const responseText =
        message?.content[0]?.type === 'text' ? message.content[0].text : '';

      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in Claude response');
      }

      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error('Error optimizing content with Claude:', error);
      return {
        optimizedContent: content,
        improvements: ['Optimization failed - using original content'],
        suggestedHashtags: [],
      };
    }
  }

  /**
   * Analyze content performance and get AI insights
   */
  static async analyzeContentPerformance(
    posts: Array<{
      content: string;
      engagement: number;
      impressions: number;
      type: string;
      hashtags: string[];
    }>
  ): Promise<{
    insights: string[];
    recommendations: string[];
    topPerformingElements: string[];
    contentGaps: string[];
  }> {
    try {
      const systemPrompt = `You are a data-driven social media analyst with expertise in Instagram performance optimization.`;

      const userPrompt = `
      Analyze these Instagram posts and provide strategic insights:

      **Posts Data:**
      ${posts
        .map(
          (post, i) => `
      Post ${i + 1}:
      - Content: ${post.content.substring(0, 200)}...
      - Engagement Rate: ${post.engagement}%
      - Impressions: ${post.impressions}
      - Type: ${post.type}
      - Hashtags: ${post.hashtags.join(', ')}
      `
        )
        .join('\n')}

      Please provide:
      1. **Key Insights**: What patterns drive the best performance?
      2. **Strategic Recommendations**: Actionable advice for improvement
      3. **Top Performing Elements**: Hooks, formats, timing that work best
      4. **Content Gaps**: Missing content types or topics to explore

      Format as JSON:
      {
        "insights": ["insight 1", "insight 2", ...],
        "recommendations": ["recommendation 1", "recommendation 2", ...],
        "topPerformingElements": ["element 1", "element 2", ...],
        "contentGaps": ["gap 1", "gap 2", ...]
      }`;

      const message = await anthropic.messages.create({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 2000,
        messages: [{ role: 'user', content: userPrompt }],
        system: systemPrompt,
      });

      const responseText =
        message?.content[0]?.type === 'text' ? message.content[0].text : '';

      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in Claude response');
      }

      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error('Error analyzing content with Claude:', error);
      return {
        insights: ['Analysis failed - check your content data'],
        recommendations: ['Unable to provide recommendations'],
        topPerformingElements: [],
        contentGaps: [],
      };
    }
  }

  /**
   * Generate trending topic suggestions based on niche
   */
  static async getTrendingTopics(
    niche: string,
    audience: string,
    currentMonth: string
  ): Promise<string[]> {
    try {
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
        model: 'claude-3-sonnet-20240229',
        max_tokens: 1000,
        messages: [{ role: 'user', content: userPrompt }],
        system: systemPrompt,
      });

      const responseText =
        message?.content[0]?.type === 'text' ? message.content[0].text : '';

      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in Claude response');
      }

      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error('Error getting trending topics with Claude:', error);
      return [
        'Industry news and updates',
        'Behind-the-scenes content',
        'User-generated content',
        'Educational tips and tricks',
        'Trending challenges and formats',
      ];
    }
  }

  /**
   * Fallback content generation when Claude API fails
   */
  private static generateFallbackContent(
    prompt: ContentGenerationPrompt,
    count: number
  ): GeneratedContent[] {
    const fallbackContent: GeneratedContent[] = [];

    for (let i = 0; i < count; i++) {
      fallbackContent.push({
        id: `fallback_${i + 1}`,
        script: `🌟 ${prompt.niche} content coming your way! Share your thoughts in the comments below. #${prompt.niche.replace(/\s+/g, '').toLowerCase()}`,
        caption: `Engaging ${prompt.niche} content`,
        hashtags: [
          `#${prompt.niche.replace(/\s+/g, '').toLowerCase()}`,
          '#instagram',
          '#content',
          '#engagement',
        ],
        suggestedTime: '12:00',
        contentPillars: ['Education', 'Engagement'],
        callToAction: 'Share your thoughts in the comments!',
        visualDescription: `${prompt.format} showcasing ${prompt.niche} content`,
      });
    }

    return fallbackContent;
  }
}
