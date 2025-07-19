// File: lib/ai-content-generator.ts
import { ContentSuggestion, UserProfile } from '@/types';

interface ContentTemplate {
  type: 'post' | 'story' | 'reel';
  format: 'image' | 'video' | 'carousel';
  topic: string;
  category: string;
  expectedEngagement: 'Low' | 'Medium' | 'High' | 'Very High';
  callToAction: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export class AIContentGenerator {
  private static instance: AIContentGenerator;

  public static getInstance(): AIContentGenerator {
    if (!AIContentGenerator.instance) {
      AIContentGenerator.instance = new AIContentGenerator();
    }
    return AIContentGenerator.instance;
  }

  async generateContentSuggestions(
    userProfile: UserProfile,
    count: number = 5
  ): Promise<ContentSuggestion[]> {
    // Simulate AI content generation based on user profile
    const contentTemplates = this.getContentTemplates(userProfile.niche);
    const suggestions: ContentSuggestion[] = [];

    for (let i = 0; i < count; i++) {
      const template = contentTemplates[i % contentTemplates.length];
      if (!template) continue; // Safety check

      const suggestion: ContentSuggestion = {
        id: `suggestion_${Date.now()}_${i}`,
        type: template.type,
        format: template.format,
        topic: this.personalizeContent(template.topic, userProfile),
        script: this.generateScript(template, userProfile),
        suggestedTime: this.getOptimalTime(template.type),
        expectedEngagement: template.expectedEngagement,
        hashtags: this.generateHashtags(template.category, userProfile.niche),
        callToAction: template.callToAction,
        category: template.category,
        difficulty: template.difficulty,
        estimatedReach: Math.floor(Math.random() * 10000) + 1000,
      };
      suggestions.push(suggestion);
    }

    return suggestions;
  }

  private getContentTemplates(niche: string): ContentTemplate[] {
    const templates: Record<string, ContentTemplate[]> = {
      'Fitness & Wellness': [
        {
          type: 'post',
          format: 'carousel',
          topic: 'Morning Routine Transformation',
          category: 'wellness',
          expectedEngagement: 'High',
          callToAction: 'Share your morning routine',
          difficulty: 'Easy',
        },
        {
          type: 'reel',
          format: 'video',
          topic: 'Quick HIIT Workout',
          category: 'fitness',
          expectedEngagement: 'Very High',
          callToAction: 'Try this workout',
          difficulty: 'Medium',
        },
        {
          type: 'story',
          format: 'video',
          topic: 'Healthy Meal Prep',
          category: 'nutrition',
          expectedEngagement: 'Medium',
          callToAction: 'Poll: What\'s your favorite meal?',
          difficulty: 'Easy',
        },
      ],
      'Fashion & Style': [
        {
          type: 'post',
          format: 'carousel',
          topic: 'Seasonal Style Guide',
          category: 'fashion',
          expectedEngagement: 'High',
          callToAction: 'Which look is your favorite?',
          difficulty: 'Medium',
        },
        {
          type: 'reel',
          format: 'video',
          topic: 'Outfit Transformation',
          category: 'styling',
          expectedEngagement: 'Very High',
          callToAction: 'Save for outfit inspiration',
          difficulty: 'Hard',
        },
      ],
      'Food & Cooking': [
        {
          type: 'reel',
          format: 'video',
          topic: 'Quick Recipe Tutorial',
          category: 'cooking',
          expectedEngagement: 'Very High',
          callToAction: 'Try this recipe',
          difficulty: 'Medium',
        },
      ],
    };

    return templates[niche] || templates['Fitness & Wellness'] || [];
  }

  private personalizeContent(topic: string, profile: UserProfile): string {
    const personalizations: Record<string, (topic: string) => string> = {
      'Motivational & Friendly': (topic: string) => `${topic} - Your Journey Starts Today!`,
      'Professional & Expert': (topic: string) => `Expert Guide: ${topic}`,
      'Casual & Fun': (topic: string) => `Let's Talk ${topic} 🎉`,
    };

    const personalizer = personalizations[profile.brandVoice];
    return personalizer ? personalizer(topic) : topic;
  }

  private generateScript(template: ContentTemplate, profile: UserProfile): string {
    console.log("🚀 ~ AIContentGenerator ~ generateScript ~ profile:", profile)
    const scripts: Record<string, string> = {
      'Morning Routine Transformation': `🌅 Transform your mornings with these game-changing habits!\n\n✨ Here's what works:\n1. Hydrate immediately (500ml water)\n2. 5-minute mindfulness practice\n3. Write down your top 3 priorities\n4. Move your body for 10 minutes\n5. Fuel up with protein-rich breakfast\n\nConsistency beats perfection! Start with just ONE habit and build from there.\n\nWhich habit will you try first? Drop it in the comments! 👇`,

      'Quick HIIT Workout': `🔥 No gym? No problem! This 15-minute HIIT will get your heart pumping!\n\n⚡ The Circuit:\n• 45s Jumping Jacks\n• 45s Squats\n• 45s Push-ups\n• 45s Mountain Climbers\n• 15s Rest\n\nRepeat 3 rounds for maximum burn! 💪\n\nTag someone who needs this motivation! 🏃‍♀️`,

      'Healthy Meal Prep': `🥗 Sunday meal prep made simple!\n\nPrep these 3 components:\n✓ Protein (grilled chicken, tofu, eggs)\n✓ Complex carbs (quinoa, sweet potato, brown rice)\n✓ Veggies (roasted or fresh)\n\nMix and match throughout the week for endless variety!\n\nWhat's your go-to meal prep combo? 🤔`,

      'Seasonal Style Guide': `🍂 Your complete seasonal style guide is here!\n\n✨ Key pieces for this season:\n• Statement coat\n• Versatile boots\n• Cozy knits\n• Perfect jeans\n• Timeless accessories\n\nMix and match these essentials for endless looks!\n\nWhich piece is your wardrobe MVP? 👗`,

      'Outfit Transformation': `✨ Same pieces, totally different vibes!\n\n👗 Watch how I transformed this basic outfit:\nFrom casual day look → elevated evening style\n\nThe secret? It's all in the styling details!\n\nSave this for your next outfit dilemma! 💫`,

      'Quick Recipe Tutorial': `🍳 30-minute dinner that tastes like you spent hours cooking!\n\n📝 What you need:\n• Fresh ingredients (listed below)\n• One pan\n• 30 minutes\n\nPerfect for busy weeknights when you want something delicious but simple!\n\nTry it and let me know how it turns out! 👨‍🍳`,
    };

    return scripts[template.topic] || `Amazing content about ${template.topic}! Share your thoughts below 👇`;
  }

  private generateHashtags(category: string, niche: string): string[] {
    const hashtagMap: Record<string, string[]> = {
      wellness: ['#wellness', '#selfcare', '#mindfulness', '#healthylifestyle', '#morningroutine'],
      fitness: ['#fitness', '#workout', '#hiit', '#fitnessmotivation', '#homeworkout'],
      nutrition: ['#nutrition', '#healthyeating', '#mealprep', '#healthyfood', '#wellness'],
      fashion: ['#fashion', '#style', '#ootd', '#fashionista', '#styleinspo'],
      styling: ['#styling', '#outfitideas', '#fashiontips', '#styleadvice', '#lookbook'],
      cooking: ['#cooking', '#recipe', '#foodie', '#homecooking', '#easyrecipes'],
    };

    const categoryTags = hashtagMap[category] || [];
    const nicheTags = niche.toLowerCase().split(' & ').map(tag => `#${tag.replace(' ', '')}`);

    return [...categoryTags.slice(0, 3), ...nicheTags, '#contentcreator'].slice(0, 5);
  }

  private getOptimalTime(type: string): string {
    const timeSlots: Record<string, string[]> = {
      post: ['7:00 AM', '12:00 PM', '5:00 PM', '7:00 PM'],
      story: ['9:00 AM', '1:00 PM', '6:00 PM', '8:00 PM'],
      reel: ['11:00 AM', '3:00 PM', '5:00 PM', '9:00 PM'],
    };

    const slots = timeSlots[type] || timeSlots.post || ['12:00 PM'];
    const randomIndex = Math.floor(Math.random() * slots.length);
    return slots[randomIndex] || '12:00 PM'; // Extra safety fallback
  }
}
