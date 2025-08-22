// modules/bot/bot.route.js
import express from 'express';
import * as botController from './bot.controller.js';
import { verifyToken } from '../../utils/verifyUser.js';

const router = express.Router();

router.post('/start', verifyToken, botController.startBot);
router.post('/stop', verifyToken, botController.stopBot);
router.get('/ads', verifyToken, botController.getAds);
router.put('/ads/:adId', verifyToken, botController.updateAd);
router.get('/status', verifyToken, botController.getBotStatus);

export default router;