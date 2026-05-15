const express = require('express');
const router = express.Router();
const controller = require('../controllers/stockPurchaseController');
const { authenticateToken, checkAuth } = require('../middleware/auth');

// Web route
router.get('/stock-purchases', checkAuth, controller.getStockPurchasesPage);

// API routes
router.get('/api/stock-purchases', authenticateToken, controller.getAll);
router.get('/api/stock-purchases/:id', authenticateToken, controller.getById);
router.post('/api/stock-purchases', authenticateToken, controller.create);
router.put('/api/stock-purchases/:id', authenticateToken, controller.update);
router.delete('/api/stock-purchases/:id', authenticateToken, controller.delete);

module.exports = router;
