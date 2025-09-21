const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Post must belong to a user"],
    },
    image: {
      type: String,
      required: [true, "Post must have an image"],
    },
    caption: {
      type: String,
      required: [true, "Caption is required"],
      maxlength: [2200, "Caption cannot exceed 2200 characters"],
      trim: true,
    },
    location: {
      name: {
        type: String,
        trim: true,
      },
      coordinates: {
        type: {
          type: String,
          enum: ["Point"],
          default: "Point",
        },
        coordinates: {
          type: [Number],
          default: [0, 0],
        },
      },
    },
    likes: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        likedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    shares: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        sharedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    comments: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        text: {
          type: String,
          required: true,
          maxlength: [500, "Comment cannot exceed 500 characters"],
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for like count
postSchema.virtual("likeCount").get(function () {
  return this.likes.length;
});

// Virtual for share count
postSchema.virtual("shareCount").get(function () {
  return this.shares.length;
});

// Virtual for comment count
postSchema.virtual("commentCount").get(function () {
  return this.comments.length;
});

// Index for geospatial queries
postSchema.index({ "location.coordinates": "2dsphere" });

// Index for text search
postSchema.index({ caption: "text", tags: "text" });

// Index for sorting by creation date
postSchema.index({ createdAt: -1 });

// Index for user posts
postSchema.index({ user: 1, createdAt: -1 });

// Pre-save middleware to extract hashtags
postSchema.pre("save", function (next) {
  if (this.isModified("caption")) {
    const hashtagRegex = /#[\w\u0590-\u05ff]+/g;
    const matches = this.caption.match(hashtagRegex);
    this.tags = matches ? matches.map((tag) => tag.slice(1)) : [];
  }
  next();
});

// Method to check if user liked the post
postSchema.methods.isLikedBy = function (userId) {
  return this.likes.some((like) => like.user.toString() === userId.toString());
};

// Method to check if user shared the post
postSchema.methods.isSharedBy = function (userId) {
  return this.shares.some(
    (share) => share.user.toString() === userId.toString()
  );
};

// Static method to get posts with pagination
postSchema.statics.getPostsWithPagination = async function (
  page = 1,
  limit = 10,
  userId = null,
  userIds = null
) {
  const skip = (page - 1) * limit;

  let query = { isActive: true };
  if (userId) {
    query.user = userId;
  } else if (userIds && userIds.length > 0) {
    query.user = { $in: userIds };
  }

  const posts = await this.find(query)
    .populate("user", "username profilePicture")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const total = await this.countDocuments(query);

  return {
    posts,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalPosts: total,
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1,
    },
  };
};

module.exports = mongoose.model("Post", postSchema);
