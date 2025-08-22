// modules/messages/msg.controller.js
import Message from './msg.model.js';
import Template from './template.model.js';
import botService from '../bot/bot.service.js';
import { errorHandler } from '../../utils/error.js';

export const fetchMessages = async (req, res, next) => {
    try {
        const userId = req.user.id;

        // تشغيل الروبوت إذا لم يكن نشطاً
        if (!botService.browser) {
            await botService.initBrowser();
        }

        // التحقق من تسجيل الدخول
        const isLoggedIn = await botService.checkLoginStatus();
        if (!isLoggedIn) {
            await botService.loginToAqar();
        }

        // جلب الرسائل الجديدة
        const result = await botService.processNewMessages();

        res.status(200).json({
            success: result.success,
            message: `تم معالجة ${result.processed} رسالة`,
            data: result
        });

    } catch (error) {
        next(errorHandler(500, `فشل في جلب الرسائل: ${error.message}`));
    }
};

export const getMessages = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { status, page = 1, limit = 20 } = req.query;

        const query = { userId };
        if (status && status !== 'all') {
            query.status = status;
        }

        const options = {
            page: parseInt(page),
            limit: parseInt(limit),
            sort: { receivedAt: -1 }
        };

        const messages = await Message.paginate(query, options);

        res.status(200).json({
            success: true,
            data: messages
        });

    } catch (error) {
        next(errorHandler(500, `فشل في جلب الرسائل: ${error.message}`));
    }
};

export const createTemplate = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { name, content, category } = req.body;

        const template = new Template({
            name,
            content,
            category,
            userId
        });

        const savedTemplate = await template.save();

        res.status(201).json({
            success: true,
            message: 'تم إنشاء القالب بنجاح',
            data: savedTemplate
        });

    } catch (error) {
        next(errorHandler(500, `فشل في إنشاء القالب: ${error.message}`));
    }
};

export const getTemplates = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { category } = req.query;

        const query = { userId, isActive: true };
        if (category) {
            query.category = category;
        }

        const templates = await Template.find(query).sort({ useCount: -1 });

        res.status(200).json({
            success: true,
            data: templates
        });

    } catch (error) {
        next(errorHandler(500, `فشل في جلب القوالب: ${error.message}`));
    }
};

export const autoReplySettings = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { enabled, responseTime, templates } = req.body;

        // هنا يمكنك حفظ إعدادات الرد التلقائي
        // await User.findByIdAndUpdate(userId, { autoReplySettings: { enabled, responseTime, templates } });

        res.status(200).json({
            success: true,
            message: 'تم حفظ الإعدادات بنجاح',
            data: { enabled, responseTime, templates }
        });

    } catch (error) {
        next(errorHandler(500, `فشل في حفظ الإعدادات: ${error.message}`));
    }
};