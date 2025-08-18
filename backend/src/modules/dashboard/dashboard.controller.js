// controllers/dashboard.controller.js
import { Stats } from "../stats/stats.model.js";
import { Ad } from "../ad/ads.model.js";
import { Activity } from "../activity/activity.model.js";
import { MessageTemplate } from "../messageTemplate/messageTemplate.model.js";

export const getDashboardData = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    // Get all data in parallel
    const [stats, ads, activities, templates] = await Promise.all([
      Stats.findOne({ userId }),
      Ad.find({ userId }).sort({ lastRenewed: -1 }).limit(5),
      Activity.find({ userId }).sort({ createdAt: -1 }).limit(6),
      MessageTemplate.find({ userId })
    ]);
    
    // Format the response
    const response = {
      stats: {
        totalAds: stats?.ads?.total || 0,
        activeAds: stats?.ads?.active || 0,
        repliedMessages: stats?.messages?.replied || 0,
        errors: (await Activity.countDocuments({ 
          userId, 
          success: false,
          createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        })) || 0,
        adViewsTrend: stats?.trends?.adViews || 0,
        messageTrend: stats?.trends?.messageResponse || 0
      },
      ads: ads.map(ad => ({
        id: ad._id,
        title: ad.title,
        views: ad.views,
        status: ad.status,
        lastRenewed: ad.lastRenewed
      })),
      activities: activities.map(activity => ({
        id: activity._id,
        type: activity.type,
        title: activity.title,
        description: activity.description,
        createdAt: activity.createdAt
      })),
      templates: templates.map(template => ({
        id: template._id,
        title: template.title,
        content: template.content
      })),
      botStatus: {
        isRunning: stats?.bot?.status === 'running',
        updateInterval: stats?.bot?.updateInterval || 24,
        uptime: stats?.bot?.uptime || '0 دقيقة',
        successRate: stats?.bot?.successRate || 100,
        nextRun: stats?.bot?.nextRun
      }
    };
    
    res.status(200).json({
      success: true,
      data: response
    });
    
  } catch (error) {
    next(error);
  }
};