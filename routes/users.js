const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const User = require("../models/User");
const Post = require("../models/Post");
const { auth, optionalAuth } = require("../middleware/auth");

// @route   GET /api/users
// @desc    Get all users with pagination
// @access  Public
router.get("/", optionalAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search;
    const skip = (page - 1) * limit;

    let query = { isActive: true };

    if (search) {
      query.$or = [
        { username: { $regex: search, $options: "i" } },
        { bio: { $regex: search, $options: "i" } },
      ];
    }

    const users = await User.find(query)
      .select(
        "username profilePicture bio followerCount followingCount postCount"
      )
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalUsers: total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1,
        },
      },
    });
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching users",
    });
  }
});

// @route   GET /api/users/:id
// @desc    Get user profile by ID
// @access  Public
router.get("/:id", optionalAuth, async (req, res) => {
  try {
    const userId = req.params.id;

    // Validate ObjectId format
    if (
      !userId ||
      userId === "undefined" ||
      !mongoose.Types.ObjectId.isValid(userId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const user = await User.findById(userId)
      .select(
        "username profilePicture bio followerCount followingCount postCount createdAt"
      )
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Get user's posts
    const posts = await Post.find({ user: userId, isActive: true })
      .select("image caption likeCount shareCount commentCount createdAt")
      .sort({ createdAt: -1 })
      .limit(12)
      .lean();

    // Check if current user follows this user
    let isFollowing = false;
    if (req.user) {
      const currentUser = await User.findById(req.user._id);
      isFollowing = currentUser.following.some(
        (id) => id.toString() === req.params.id
      );
    }

    res.json({
      success: true,
      data: {
        user,
        posts,
        isFollowing,
      },
    });
  } catch (error) {
    console.error("Get user profile error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching user profile",
    });
  }
});

// @route   GET /api/users/:id/posts
// @desc    Get user's posts with pagination
// @access  Public
router.get("/:id/posts", optionalAuth, async (req, res) => {
  try {
    const userId = req.params.id;

    // Validate ObjectId format
    if (
      !userId ||
      userId === "undefined" ||
      !mongoose.Types.ObjectId.isValid(userId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;

    const result = await Post.getPostsWithPagination(page, limit, userId);

    // Add user interaction data if authenticated
    if (req.user) {
      result.posts = result.posts.map((post) => ({
        ...post,
        isLiked: post.likes.some(
          (like) => like.user.toString() === req.user._id.toString()
        ),
        isShared: post.shares.some(
          (share) => share.user.toString() === req.user._id.toString()
        ),
      }));
    }

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Get user posts error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching user posts",
    });
  }
});

// @route   POST /api/users/:id/follow
// @desc    Follow/Unfollow a user
// @access  Private
router.post("/:id/follow", auth, async (req, res) => {
  try {
    const targetUserId = req.params.id;

    // Validate ObjectId format
    if (
      !targetUserId ||
      targetUserId === "undefined" ||
      !mongoose.Types.ObjectId.isValid(targetUserId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    if (targetUserId === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "Cannot follow yourself",
      });
    }

    const targetUser = await User.findById(targetUserId);
    const currentUser = await User.findById(req.user._id);

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const isFollowing = currentUser.following.some(
      (id) => id.toString() === targetUserId
    );

    if (isFollowing) {
      // Unfollow
      await User.findByIdAndUpdate(req.user._id, {
        $pull: { following: targetUserId },
      });
      await User.findByIdAndUpdate(targetUserId, {
        $pull: { followers: req.user._id },
      });
    } else {
      // Follow
      await User.findByIdAndUpdate(req.user._id, {
        $addToSet: { following: targetUserId },
      });
      await User.findByIdAndUpdate(targetUserId, {
        $addToSet: { followers: req.user._id },
      });
    }

    // Get updated follower count
    const updatedTargetUser = await User.findById(targetUserId).select(
      "followerCount followingCount"
    );

    res.json({
      success: true,
      data: {
        isFollowing: !isFollowing,
        followerCount: updatedTargetUser.followerCount,
      },
      message: isFollowing ? "User unfollowed" : "User followed",
    });
  } catch (error) {
    console.error("Follow user error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating follow status",
    });
  }
});

// @route   GET /api/users/:id/followers
// @desc    Get user's followers
// @access  Public
router.get("/:id/followers", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const user = await User.findById(req.params.id)
      .populate({
        path: "followers",
        select: "username profilePicture bio followerCount followingCount",
        options: { skip, limit },
      })
      .select("followers")
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const total = user.followers.length;

    res.json({
      success: true,
      data: {
        followers: user.followers,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalFollowers: total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1,
        },
      },
    });
  } catch (error) {
    console.error("Get followers error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching followers",
    });
  }
});

// @route   GET /api/users/:id/following
// @desc    Get user's following
// @access  Public
router.get("/:id/following", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const user = await User.findById(req.params.id)
      .populate({
        path: "following",
        select: "username profilePicture bio followerCount followingCount",
        options: { skip, limit },
      })
      .select("following")
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const total = user.following.length;

    res.json({
      success: true,
      data: {
        following: user.following,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalFollowing: total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1,
        },
      },
    });
  } catch (error) {
    console.error("Get following error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching following",
    });
  }
});

module.exports = router;
