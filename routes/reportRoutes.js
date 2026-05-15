const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { checkAuth } = require('../middleware/auth');

router.get('/reports', checkAuth, reportController.getReportsPage);

module.exports = router;
