const express = require('express');
const router = express.Router();
const settingController = require('../controllers/settingController');
// If there's an auth middleware, it should ideally be added here.
// e.g., const authMiddleware = require('../middleware/auth');
// router.get('/settings', authMiddleware, settingController.getSettings);

router.get('/settings', settingController.getSettings);
router.put('/settings', settingController.updateSettings);

module.exports = router;
