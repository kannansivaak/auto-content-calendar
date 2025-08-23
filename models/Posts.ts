import mongoose, { Document, Model, Schema } from 'mongoose';

// Interface for Post document
export interface IPost extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  content: string; // Full script/caption
  caption?: string; // Shorter version for preview
  image?: string; // Image URL or path
  hashtags: string[];
  suggestedTime?: string;
  contentPillars?: string[];
  callToAction?: string;
  visualDescription?: string;
  postType: 'image' | 'video' | 'carousel' | 'reel' | 'story';
  format:
    | 'educational'
    | 'entertainment'
    | 'promotional'
    | 'inspirational'
    | 'behind-the-scenes'
    | 'user-generated';
  niche?: string;
  audience?: string;
  brandVoice?: string;
  status: 'draft' | 'scheduled' | 'published' | 'archived';
  scheduledDate?: Date;
  publishedDate?: Date;
  engagement?: {
    likes: number;
    comments: number;
    shares: number;
    saves: number;
    reach: number;
    impressions: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Interface for Post model with static methods
export interface IPostModel extends Model<IPost> {
  findByUserId(userId: string): Promise<IPost[]>;
  findByStatus(status: string): Promise<IPost[]>;
  findByUserIdAndStatus(userId: string, status: string): Promise<IPost[]>;
  findRecentByUserId(userId: string, limit?: number): Promise<IPost[]>;
}

// Post Schema
const PostSchema: Schema<IPost> = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [100, 'Title must be less than 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description must be less than 500 characters'],
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
      maxlength: [2200, 'Content must be less than 2200 characters'], // Instagram caption limit
    },
    caption: {
      type: String,
      trim: true,
      maxlength: [150, 'Caption preview must be less than 150 characters'],
    },
    image: {
      type: String,
      trim: true,
      validate: {
        validator: function (v: string) {
          if (!v) return true; // Optional field
          // Basic URL validation
          return /^(https?:\/\/)|(\/uploads\/)/.test(v);
        },
        message: 'Invalid image URL or path',
      },
    },
    hashtags: {
      type: [String],
      validate: {
        validator: function (hashtags: string[]) {
          return hashtags.length <= 30; // Instagram hashtag limit
        },
        message: 'Maximum 30 hashtags allowed',
      },
      default: [],
    },
    suggestedTime: {
      type: String,
      match: [
        /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
        'Invalid time format (HH:MM)',
      ],
    },
    contentPillars: {
      type: [String],
      default: [],
    },
    callToAction: {
      type: String,
      trim: true,
      maxlength: [200, 'Call to action must be less than 200 characters'],
    },
    visualDescription: {
      type: String,
      trim: true,
      maxlength: [1000, 'Visual description must be less than 1000 characters'],
    },
    postType: {
      type: String,
      enum: ['image', 'video', 'carousel', 'reel', 'story'],
      required: [true, 'Post type is required'],
      default: 'image',
    },
    format: {
      type: String,
      enum: [
        'educational',
        'entertainment',
        'promotional',
        'inspirational',
        'behind-the-scenes',
        'user-generated',
      ],
      required: [true, 'Post format is required'],
      default: 'educational',
    },
    niche: {
      type: String,
      trim: true,
      maxlength: [100, 'Niche must be less than 100 characters'],
    },
    audience: {
      type: String,
      trim: true,
      maxlength: [200, 'Audience description must be less than 200 characters'],
    },
    brandVoice: {
      type: String,
      trim: true,
      maxlength: [100, 'Brand voice must be less than 100 characters'],
    },
    status: {
      type: String,
      enum: ['draft', 'scheduled', 'published', 'archived'],
      default: 'draft',
      index: true,
    },
    scheduledDate: {
      type: Date,
      validate: {
        validator: function (date: Date) {
          if (!date) return true; // Optional field
          return date > new Date(); // Must be in the future
        },
        message: 'Scheduled date must be in the future',
      },
    },
    publishedDate: {
      type: Date,
    },
    engagement: {
      likes: { type: Number, default: 0, min: 0 },
      comments: { type: Number, default: 0, min: 0 },
      shares: { type: Number, default: 0, min: 0 },
      saves: { type: Number, default: 0, min: 0 },
      reach: { type: Number, default: 0, min: 0 },
      impressions: { type: Number, default: 0, min: 0 },
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
    // toJSON: {
    //   transform: function (doc, ret) {
    //     // Convert _id to id for easier frontend usage
    //     ret.id = ret._id;
    //     delete ret._id;
    //     delete ret.__v;
    //     return ret;
    //   },
    // },
  }
);

// Indexes for better query performance
PostSchema.index({ userId: 1, createdAt: -1 });
PostSchema.index({ userId: 1, status: 1 });
PostSchema.index({ status: 1, scheduledDate: 1 });
PostSchema.index({ createdAt: -1 });
PostSchema.index({ hashtags: 1 });
PostSchema.index({ niche: 1 });

// Pre-save middleware
PostSchema.pre('save', function (next) {
  // Trim and clean hashtags
  if (this.hashtags && this.hashtags.length > 0) {
    this.hashtags = this.hashtags
      .map((tag) => tag.trim().toLowerCase().replace(/^#/, '')) // Remove # prefix and normalize
      .filter((tag) => tag.length > 0) // Remove empty tags
      .slice(0, 30); // Limit to 30 hashtags
  }

  // Auto-generate caption from content if not provided
  if (!this.caption && this.content) {
    this.caption =
      this.content.length > 150
        ? this.content.substring(0, 147) + '...'
        : this.content;
  }

  // Set published date when status changes to published
  if (this.status === 'published' && !this.publishedDate) {
    this.publishedDate = new Date();
  }

  next();
});

// Instance methods
PostSchema.methods.getEngagementRate = function () {
  const total =
    this.engagement.likes +
    this.engagement.comments +
    this.engagement.shares +
    this.engagement.saves;
  return this.engagement.impressions > 0
    ? ((total / this.engagement.impressions) * 100).toFixed(2)
    : 0;
};

PostSchema.methods.publish = function () {
  this.status = 'published';
  this.publishedDate = new Date();
  return this.save();
};

PostSchema.methods.schedule = function (date: Date) {
  this.status = 'scheduled';
  this.scheduledDate = date;
  return this.save();
};

// Static methods
PostSchema.statics.findByUserId = function (userId: string) {
  return this.find({ userId }).sort({ createdAt: -1 });
};

PostSchema.statics.findByStatus = function (status: string) {
  return this.find({ status }).sort({ createdAt: -1 });
};

PostSchema.statics.findByUserIdAndStatus = function (
  userId: string,
  status: string
) {
  return this.find({ userId, status }).sort({ createdAt: -1 });
};

PostSchema.statics.findRecentByUserId = function (
  userId: string,
  limit: number = 10
) {
  return this.find({ userId }).sort({ createdAt: -1 }).limit(limit);
};

// Create and export the model
const Post: IPostModel = (mongoose.models.Post ||
  mongoose.model<IPost, IPostModel>('Post', PostSchema)) as IPostModel;

export default Post;
