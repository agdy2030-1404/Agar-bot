import express from 'express';
import * as adsController from './ads.controller.js';
import { verifyToken } from '../../utils/verifyUser.js';

const router = express.Router();

router.get('/fetch', verifyToken, adsController.fetchUserAds);
router.get('/', verifyToken, adsController.getUserAds);
router.get('/:adId', verifyToken, adsController.getAdDetails);
router.put('/:adId/update', verifyToken, adsController.updateAd);
router.post('/:adId/schedule', verifyToken, adsController.scheduleAdUpdate);

export default router;