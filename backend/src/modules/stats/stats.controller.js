// controllers/stats.controller.js
import { Stats } from "./stats.model.js";
import { Ad } from "../ad/ads.model.js";
import { Activity } from "../activity/activity.model.js";

// Get user statistics
export const getUserStats = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    // Get or create stats record
    let stats = await Stats.findOne({ userId });
    
    if (!stats) {
      stats = new Stats({ userId });
      await stats.save();
    }
    
    // Calculate ad statistics
    const adStats = await Ad.aggregate([
      { $match: { userId } },
      { $group: {
        _id: "$status",
        count: { $sum: 1 }
      }}
    ]);
    
    // Update stats with ad counts
    adStats.forEach(stat => {
      stats.ads[stat._id] = stat.count;
    });
    stats.ads.total = adStats.reduce((sum, stat) => sum + stat.count, 0);
    stats.ads.lastUpdated = new Date();
    
    // Calculate message statistics
    const messageStats = await Activity.aggregate([
      { $match: { 
        userId,
        type: "message" 
      }},
      { $group: {
        _id: "$success",
        count: { $sum: 1 }
      }}
    ]);
    
    // Update message stats
    const totalMessages = messageStats.reduce((sum, stat) => sum + stat.count, 0);
    const repliedMessages = messageStats.find(stat => stat._id === true)?.count || 0;
    
    stats.messages = {
      total: totalMessages,
      replied: repliedMessages,
      pending: totalMessages - repliedMessages,
      lastUpdated: new Date()
    };
    
    // Calculate bot uptime (last 7 days)
    const botActivities = await Activity.find({
      userId,
      type: { $in: ["bot_start", "bot_stop"] }
    }).sort({ createdAt: -1 }).limit(100);
    
    let uptimeMinutes = 0;
    let lastStart = null;
    
    botActivities.forEach(activity => {
      if (activity.type === "bot_start") {
        lastStart = activity.createdAt;
      } else if (activity.type === "bot_stop" && lastStart) {
        uptimeMinutes += (activity.createdAt - lastStart) / (1000 * 60);
        lastStart = null;
      }
    });
    
    // If bot is currently running
    if (lastStart) {
      uptimeMinutes += (new Date() - lastStart) / (1000 * 60);
    }
    
    stats.bot.uptime = Math.round(uptimeMinutes);
    stats.bot.lastActivity = botActivities[0]?.createdAt || null;
    
    // Calculate success rate (last 30 activities)
    const recentActivities = await Activity.find({
      userId,
      type: { $in: ["renew", "message"] }
    }).sort({ createdAt: -1 }).limit(30);
    
    const successCount = recentActivities.filter(a => a.success).length;
    stats.bot.successRate = Math.round((successCount / recentActivities.length) * 100) || 100;
    
    // Calculate trends (compare last 7 days vs previous 7 days)
    const now = new Date();
    const lastWeekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgoStart = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    
    // Ad views trend
    const [currentWeekAds, previousWeekAds] = await Promise.all([
      Ad.aggregate([
        { $match: { 
          userId,
          lastRenewed: { $gte: lastWeekStart }
        }},
        { $group: {
          _id: null,
          totalViews: { $sum: "$views" },
          avgViews: { $avg: "$views" }
        }}
      ]),
      Ad.aggregate([
        { $match: { 
          userId,
          lastRenewed: { 
            $gte: twoWeeksAgoStart,
            $lt: lastWeekStart
          }
        }},
        { $group: {
          _id: null,
          totalViews: { $sum: "$views" },
          avgViews: { $avg: "$views" }
        }}
      ])
    ]);
    
    const currentAvg = currentWeekAds[0]?.avgViews || 0;
    const previousAvg = previousWeekAds[0]?.avgViews || 0;
    stats.trends.adViews = previousAvg > 0 
      ? Math.round(((currentAvg - previousAvg) / previousAvg) * 100)
      : 100;
    
    // Message response trend
    const [currentWeekMessages, previousWeekMessages] = await Promise.all([
      Activity.countDocuments({
        userId,
        type: "message",
        createdAt: { $gte: lastWeekStart },
        success: true
      }),
      Activity.countDocuments({
        userId,
        type: "message",
        createdAt: { 
          $gte: twoWeeksAgoStart,
          $lt: lastWeekStart
        },
        success: true
      })
    ]);
    
    stats.trends.messageResponse = previousWeekMessages > 0
      ? Math.round(((currentWeekMessages - previousWeekMessages) / previousWeekMessages) * 100)
      : 100;
    
    // Save updated stats
    await stats.save();
    
    // Format response
    const formattedStats = {
      ads: {
        total: stats.ads.total,
        active: stats.ads.active,
        expired: stats.ads.expired,
        pending: stats.ads.pending,
        lastUpdated: stats.ads.lastUpdated
      },
      messages: {
        total: stats.messages.total,
        replied: stats.messages.replied,
        pending: stats.messages.pending,
        lastUpdated: stats.messages.lastUpdated
      },
      bot: {
        uptime: formatUptime(stats.bot.uptime),
        status: stats.bot.lastActivity?.getTime() > new Date().getTime() - 5 * 60 * 1000 ? 'running' : 'stopped',
        nextRun: stats.bot.nextRun,
        successRate: stats.bot.successRate
      },
      trends: {
        adViews: stats.trends.adViews,
        messageResponse: stats.trends.messageResponse
      },
      lastUpdated: stats.updatedAt
    };
    
    res.status(200).json({
      success: true,
      stats: formattedStats
    });
    
  } catch (error) {
    next(error);
  }
};

// Helper function to format uptime
function formatUptime(minutes) {
  if (minutes < 60) {
    return `${minutes} دقيقة`;
  } else if (minutes < 24 * 60) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours} ساعة ${mins} دقيقة`;
  } else {
    const days = Math.floor(minutes / (24 * 60));
    const hours = Math.floor((minutes % (24 * 60)) / 60);
    return `${days} يوم ${hours} ساعة`;
  }
}