const express = require('express');
const router = express.Router();
const stockController = require('../controllers/stockController');
const { authenticateToken, checkAuth } = require('../middleware/auth');

// Web routes
router.get('/dashboard', checkAuth, stockController.getAllStock);
router.get('/stock/low-stock', checkAuth, (req, res) => {
  res.render('dashboard', { items: [], page: 'low-stock' });
});

// API routes
router.get('/api/stock', authenticateToken, stockController.getStockApiAll);
router.get('/api/stock/:id', authenticateToken, stockController.getStockById);
router.post('/api/stock', authenticateToken, stockController.createStock);
router.put('/api/stock/:id', authenticateToken, stockController.updateStock);
router.delete('/api/stock/:id', authenticateToken, stockController.deleteStock);
router.get('/api/stock/low-stock/list', authenticateToken, stockController.getLowStock);

module.exports = router;
