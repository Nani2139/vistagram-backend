const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const User = require("../models/User");
const { auth, optionalAuth } = require("../middleware/auth");
const {
  upload,
  processImage,
  handleUploadError,
} = require("../middleware/upload");

// @route   GET /api/posts/feed
// @desc    Get personalized feed (posts from followed users + own posts + popular posts)
// @access  Private
router.get("/feed", auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    // Get current user's following list
    const currentUser = await User.findById(req.user._id).select("following");
    const followingIds = currentUser.following.map((id) => id.toString());

    // Include current user's own posts in the feed
    followingIds.push(req.user._id.toString());

    // For better user experience, show all posts in the feed
    // This ensures users always see content when they login
    let result = await Post.getPostsWithPagination(page, limit);

    // Add virtual fields and user interaction data
    result.posts = result.posts.map((post) => {
      const postWithVirtuals = {
        ...post,
        likeCount: post.likes ? post.likes.length : 0,
        shareCount: post.shares ? post.shares.length : 0,
        commentCount: post.comments ? post.comments.length : 0,
      };

      // Add user interaction data
      postWithVirtuals.isLiked = post.likes.some(
        (like) => like.user.toString() === req.user._id.toString()
      );
      postWithVirtuals.isShared = post.shares.some(
        (share) => share.user.toString() === req.user._id.toString()
      );

      return postWithVirtuals;
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Get feed error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching feed",
    });
  }
});

// @route   GET /api/posts
// @desc    Get all posts with pagination (for explore/discovery)
// @access  Public
router.get("/", optionalAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await Post.getPostsWithPagination(page, limit);

    // Add virtual fields and user interaction data
    result.posts = result.posts.map((post) => {
      const postWithVirtuals = {
        ...post,
        likeCount: post.likes ? post.likes.length : 0,
        shareCount: post.shares ? post.shares.length : 0,
        commentCount: post.comments ? post.comments.length : 0,
      };

      // Add user interaction data if authenticated
      if (req.user) {
        postWithVirtuals.isLiked = post.likes.some(
          (like) => like.user.toString() === req.user._id.toString()
        );
        postWithVirtuals.isShared = post.shares.some(
          (share) => share.user.toString() === req.user._id.toString()
        );
      }

      return postWithVirtuals;
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Get posts error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching posts",
    });
  }
});

// @route   GET /api/posts/:id
// @desc    Get single post by ID
// @access  Public
router.get("/:id", optionalAuth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("user", "username profilePicture")
      .populate("comments.user", "username profilePicture")
      .lean();

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    // Add virtual fields and user interaction data
    const postWithVirtuals = {
      ...post,
      likeCount: post.likes ? post.likes.length : 0,
      shareCount: post.shares ? post.shares.length : 0,
      commentCount: post.comments ? post.comments.length : 0,
    };

    // Add user interaction data if authenticated
    if (req.user) {
      postWithVirtuals.isLiked = post.likes.some(
        (like) => like.user.toString() === req.user._id.toString()
      );
      postWithVirtuals.isShared = post.shares.some(
        (share) => share.user.toString() === req.user._id.toString()
      );
    }

    res.json({
      success: true,
      data: postWithVirtuals,
    });
  } catch (error) {
    console.error("Get post error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching post",
    });
  }
});

// @route   POST /api/posts
// @desc    Create a new post
// @access  Private
router.post(
  "/",
  auth,
  upload,
  processImage,
  handleUploadError,
  async (req, res) => {
    try {
      console.log("Creating post - User:", req.user._id);
      console.log("Request body:", req.body);
      console.log("File info:", req.file ? "File received" : "No file");

      const { caption, location } = req.body;

      if (!req.file) {
        console.log("No file provided");
        return res.status(400).json({
          success: false,
          message: "Image is required",
        });
      }

      console.log("Processing image...");
      const postData = {
        user: req.user._id,
        image: req.file.path,
        caption,
        location: location ? JSON.parse(location) : null,
      };

      console.log("Saving post to database...");
      const post = new Post(postData);
      await post.save();

      console.log("Populating user data...");
      // Populate user data
      await post.populate("user", "username profilePicture");

      console.log("Adding to user's posts array...");
      // Add to user's posts array
      await User.findByIdAndUpdate(req.user._id, {
        $push: { posts: post._id },
      });

      console.log("Post created successfully:", post._id);
      res.status(201).json({
        success: true,
        data: post,
        message: "Post created successfully",
      });
    } catch (error) {
      console.error("Create post error:", error);
      res.status(500).json({
        success: false,
        message: "Error creating post",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }
);

// @route   POST /api/posts/:id/like
// @desc    Like/Unlike a post
// @access  Private
router.post("/:id/like", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    const isLiked = post.isLikedBy(req.user._id);

    if (isLiked) {
      // Unlike
      post.likes = post.likes.filter(
        (like) => like.user.toString() !== req.user._id.toString()
      );
    } else {
      // Like
      post.likes.push({ user: req.user._id });
    }

    await post.save();

    res.json({
      success: true,
      data: {
        isLiked: !isLiked,
        likeCount: post.likeCount,
      },
      message: isLiked ? "Post unliked" : "Post liked",
    });
  } catch (error) {
    console.error("Like post error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating like",
    });
  }
});

// @route   POST /api/posts/:id/share
// @desc    Share a post
// @access  Private
router.post("/:id/share", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    const isShared = post.isSharedBy(req.user._id);

    if (!isShared) {
      post.shares.push({ user: req.user._id });
      await post.save();
    }

    res.json({
      success: true,
      data: {
        isShared: true,
        shareCount: post.shareCount,
      },
      message: "Post shared successfully",
    });
  } catch (error) {
    console.error("Share post error:", error);
    res.status(500).json({
      success: false,
      message: "Error sharing post",
    });
  }
});

// @route   POST /api/posts/:id/comment
// @desc    Add comment to a post
// @access  Private
router.post("/:id/comment", auth, async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Comment text is required",
      });
    }

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    const comment = {
      user: req.user._id,
      text: text.trim(),
    };

    post.comments.push(comment);
    await post.save();

    // Populate the new comment
    await post.populate("comments.user", "username profilePicture");

    const newComment = post.comments[post.comments.length - 1];

    res.status(201).json({
      success: true,
      data: newComment,
      message: "Comment added successfully",
    });
  } catch (error) {
    console.error("Add comment error:", error);
    res.status(500).json({
      success: false,
      message: "Error adding comment",
    });
  }
});

// @route   DELETE /api/posts/:id
// @desc    Delete a post
// @access  Private
router.delete("/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    // Check if user owns the post
    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this post",
      });
    }

    // Soft delete
    post.isActive = false;
    await post.save();

    // Remove from user's posts array
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { posts: post._id },
    });

    res.json({
      success: true,
      message: "Post deleted successfully",
    });
  } catch (error) {
    console.error("Delete post error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting post",
    });
  }
});

module.exports = router;
