const express = require('express');
const router = express.Router();
const controller = require('../controllers/productController');
const { authenticateToken, checkAuth } = require('../middleware/auth');

// Web route
router.get('/dashboard', checkAuth, controller.getProductsPage);

// API routes
router.get('/api/products', authenticateToken, controller.getAll);
router.get('/api/products/next-code/:supplierId', authenticateToken, controller.getNextProductCode);
router.get('/api/products/:id', authenticateToken, controller.getById);
router.put('/api/products/:id', authenticateToken, controller.update);
router.delete('/api/products/:id', authenticateToken, controller.delete);

module.exports = router;
