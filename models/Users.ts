import mongoose, { Document, Model, Schema } from 'mongoose';

// Interface for User document
export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  mobileNumber: string;
  password: string; // Hashed password
  originalPassword?: string; // Plain text password (encrypted)
  instagramUrl?: string | null;
  isVerified: boolean;
  verificationToken?: string | null;
  lastLogin?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// Interface for User model with static methods
export interface IUserModel extends Model<IUser> {
  findByEmail(email: string): Promise<IUser | null>;
  findByMobileNumber(mobileNumber: string): Promise<IUser | null>;
  findByVerificationToken(token: string): Promise<IUser | null>;
}

// User Schema
const UserSchema: Schema<IUser> = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name must be less than 50 characters'],
      match: [/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please enter a valid email',
      ],
    },
    mobileNumber: {
      type: String,
      required: [true, 'Mobile number is required'],
      unique: true,
      match: [/^[0-9]{10}$/, 'Mobile number must be exactly 10 digits'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
    },
    originalPassword: {
      type: String,
      default: null,
      select: false, // Don't include in queries by default for security
    },
    instagramUrl: {
      type: String,
      match: [
        /^https:\/\/(www\.)?instagram\.com\/[a-zA-Z0-9._]+\/?$/,
        'Please enter a valid Instagram URL (e.g., https://instagram.com/username)'
      ],
      default: null,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
      default: null,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
    toJSON: {
      transform: function(doc, ret) {
        // Remove sensitive fields from JSON output
        const { password, verificationToken, originalPassword, ...safeUser } = ret;
        return safeUser;
      }
    }
  }
);

// Indexes for better query performance
UserSchema.index({ email: 1 });
UserSchema.index({ mobileNumber: 1 });
UserSchema.index({ verificationToken: 1 });
UserSchema.index({ createdAt: -1 });

// Pre-save middleware for additional validation
UserSchema.pre('save', function (next) {
  // Convert email to lowercase
  if (this.email) {
    this.email = this.email.toLowerCase().trim();
  }

  // Trim name
  if (this.name) {
    this.name = this.name.trim();
  }

  // Format Instagram URL - ensure it starts with https://
  if (this.instagramUrl) {
    let url = this.instagramUrl.trim();
    if (url && !url.startsWith('http')) {
      // If user enters just the username or @username
      if (url.startsWith('@')) {
        url = url.substring(1);
      }
      // If user enters instagram.com/username without protocol
      if (url.startsWith('instagram.com/')) {
        url = 'https://' + url;
      }
      // If user enters just the username
      else if (!url.includes('instagram.com')) {
        url = `https://instagram.com/${url}`;
      }
    }
    this.instagramUrl = url;
  }

  next();
});

// Instance methods
UserSchema.methods.toSafeObject = function () {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.verificationToken;
  delete userObject.originalPassword; // Also remove original password from safe object
  return userObject;
};

// Static methods
UserSchema.statics.findByEmail = function (email: string) {
  return this.findOne({ email: email.toLowerCase().trim() });
};

UserSchema.statics.findByMobileNumber = function (mobileNumber: string) {
  return this.findOne({ mobileNumber });
};

UserSchema.statics.findByVerificationToken = function (token: string) {
  return this.findOne({ verificationToken: token });
};

// Create and export the model with proper typing
const User: IUserModel = (mongoose.models.User || mongoose.model<IUser, IUserModel>('User', UserSchema)) as IUserModel;

export default User;
