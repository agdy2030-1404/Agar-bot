import Message from "./msg.model.js";
import Template from "./template.model.js";
import { errorHandler } from "../../utils/error.js";
import botService from "../bot/bot.service.js";

export const getMessages = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { status, page = 1, limit = 20 } = req.query;

    const query = { userId };
    if (status) query.status = status;

    const messages = await Message.find(query)
      .sort({ receivedDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Message.countDocuments(query);

    res.status(200).json({
      success: true,
      data: messages,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(errorHandler(500, `فشل في جلب الرسائل: ${error.message}`));
  }
};

export const processMessages = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const adId = req.params.adId || null;

    // معالجة الرسائل مع التحقق من ملكية الإعلان
    const result = await botService.processNewMessages(adId, userId);

    // حفظ النتائج في قاعدة البيانات
    for (const detail of result.details) {
      if (detail.success) {
        await Message.findOneAndUpdate(
          { messageId: detail.messageId, userId },
          {
            senderName: detail.senderName,
            adId: detail.adId || result.adId, // استخدام adId من النتيجة
            status: "replied",
            replyContent: detail.replyText,
            repliedAt: new Date(),
            replyMethod: "whatsapp",
          },
          { upsert: true, new: true }
        );
      }
    }

    res.status(200).json({
      success: true,
      message: `تم معالجة ${result.processed} رسالة للإعلان ${result.adId}`,
      data: result,
    });
  } catch (error) {
    next(errorHandler(500, `فشل في معالجة الرسائل: ${error.message}`));
  }
};

// معالجة جميع الإعلانات
export const processAllMessages = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // استخدام الدالة الجديدة من botService
    const result = await botService.processAllAdsMessages();

    res.status(200).json({
      success: true,
      message: `تم معالجة ${result.length} إعلان`,
      data: result,
    });
  } catch (error) {
    next(errorHandler(500, `فشل في معالجة جميع الإعلانات: ${error.message}`));
  }
};

// أضف هذا الدالة الجديدة
export const getUserAds = async (req, res, next) => {
  try {
    const ads = await botService.getMyAds();

    res.status(200).json({ success: true, data: ads });
  } catch (error) {
    next(errorHandler(500, `فشل في جلب الإعلانات: ${error.message}`));
  }
};

export const getTemplates = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const templates = await Template.find({ userId, isActive: true });

    res.status(200).json({
      success: true,
      data: templates,
    });
  } catch (error) {
    next(errorHandler(500, `فشل في جلب القوالب: ${error.message}`));
  }
};

export const createTemplate = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { name, content, category } = req.body;

    const template = await Template.create({
      name,
      content,
      category,
      userId,
    });

    res.status(201).json({
      success: true,
      message: "تم إنشاء القالب بنجاح",
      data: template,
    });
  } catch (error) {
    next(errorHandler(500, `فشل في إنشاء القالب: ${error.message}`));
  }
};

export const updateTemplate = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const templateId = req.params.id;
    const { name, content, category, isActive } = req.body;

    const template = await Template.findOne({ _id: templateId, userId });

    if (!template) {
      return next(errorHandler(404, "القالب غير موجود"));
    }

    // تحديث الحقول المطلوبة فقط
    if (name !== undefined) template.name = name;
    if (content !== undefined) template.content = content;
    if (category !== undefined) template.category = category;
    if (isActive !== undefined) template.isActive = isActive;

    await template.save();

    res.status(200).json({
      success: true,
      message: "تم تحديث القالب بنجاح",
      data: template,
    });
  } catch (error) {
    next(errorHandler(500, `فشل في تحديث القالب: ${error.message}`));
  }
};

export const deleteTemplate = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const templateId = req.params.id;

    const template = await Template.findOne({ _id: templateId, userId });

    if (!template) {
      return next(errorHandler(404, "القالب غير موجود"));
    }

    await Template.findByIdAndDelete(templateId);

    res.status(200).json({
      success: true,
      message: "تم حذف القالب بنجاح",
      data: { id: templateId },
    });
  } catch (error) {
    next(errorHandler(500, `فشل في حذف القالب: ${error.message}`));
  }
};
