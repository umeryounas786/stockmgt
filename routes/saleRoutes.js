const express = require('express');
const router = express.Router();
const saleController = require('../controllers/saleController');
const { authenticateToken, checkAuth } = require('../middleware/auth');

// Web route
router.get('/sales', checkAuth, saleController.getSalesPage);

// API routes
router.get('/api/sales', authenticateToken, saleController.getAllSales);
router.get('/api/sales/:id', authenticateToken, saleController.getSaleById);
router.post('/api/sales', authenticateToken, saleController.createSale);
router.put('/api/sales/:id', authenticateToken, saleController.updateSale);
router.delete('/api/sales/:id', authenticateToken, saleController.deleteSale);

module.exports = router;
