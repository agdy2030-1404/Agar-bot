// controllers/activity.controller.js
import { Activity } from "./activity.model.js";

// Log a new activity
export const logActivity = async (userId, activityData) => {
  try {
    const activity = new Activity({
      userId,
      ...activityData
    });
    await activity.save();
    return activity;
  } catch (error) {
    console.error("Failed to log activity:", error);
  }
};

// Get user activities with pagination
export const getUserActivities = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, type } = req.query;
    
    const skip = (page - 1) * limit;
    
    const query = { userId };
    if (type) query.type = type;
    
    const [activities, total] = await Promise.all([
      Activity.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Activity.countDocuments(query)
    ]);
    
    const totalPages = Math.ceil(total / limit);
    
    res.status(200).json({
      success: true,
      activities,
      pagination: {
        currentPage: Number(page),
        totalPages,
        totalActivities: total,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get recent activities (for dashboard widget)
export const getRecentActivities = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 6;
    
    const activities = await Activity.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit);
    
    res.status(200).json({
      success: true,
      activities
    });
  } catch (error) {
    next(error);
  }
};

// Helper function to format activity time
export const formatActivityTime = (date) => {
  const now = new Date();
  const activityDate = new Date(date);
  const diffSeconds = Math.floor((now - activityDate) / 1000);
  
  if (diffSeconds < 60) {
    return `منذ ${diffSeconds} ثانية`;
  } else if (diffSeconds < 3600) {
    const diffMinutes = Math.floor(diffSeconds / 60);
    return `منذ ${diffMinutes} دقيقة`;
  } else if (diffSeconds < 86400) {
    const diffHours = Math.floor(diffSeconds / 3600);
    return `منذ ${diffHours} ساعة`;
  } else {
    const diffDays = Math.floor(diffSeconds / 86400);
    return `منذ ${diffDays} يوم`;
  }
};