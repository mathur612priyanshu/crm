const express = require('express');
const router = express.Router();
const performanceController = require('../controllers/performanceController');

router.get('/performanceStats', performanceController.getPerformanceStats);

module.exports = router;
