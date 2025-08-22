// modules/messages/msg.route.js
import express from 'express';
import * as msgController from './msg.controller.js';
import { verifyToken } from '../../utils/verifyUser.js';

const router = express.Router();

// جلب الرسائل ومعالجتها
router.get('/fetch', verifyToken, msgController.fetchMessages);

// الحصول على الرسائل
router.get('/', verifyToken, msgController.getMessages);

// إنشاء قالب رد
router.post('/templates', verifyToken, msgController.createTemplate);

// الحصول على قوالب الردود
router.get('/templates', verifyToken, msgController.getTemplates);

// إعدادات الرد التلقائي
router.post('/settings', verifyToken, msgController.autoReplySettings);

export default router;