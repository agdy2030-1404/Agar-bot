import Activity from "./activity.model.js";

export const getActivities = async (req, res) => {
  try {
    const activities = await Activity.find({ user: req.user._id })
      .sort({ timestamp: -1 })
      .limit(50);
    
    res.status(200).json({ success: true, activities });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "خطأ في استرجاع السجلات" 
    });
  }
};