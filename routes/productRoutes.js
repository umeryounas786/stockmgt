const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authenticateToken, checkAuth } = require('../middleware/auth');

// Web route
router.get('/dashboard', checkAuth, productController.getProductsPage);

// API routes
router.get('/api/products', authenticateToken, productController.getAllProducts);
router.get('/api/products/next-code/:companyId', authenticateToken, productController.getNextProductCode);
router.get('/api/products/:id', authenticateToken, productController.getProductById);
router.post('/api/products', authenticateToken, productController.createProduct);
router.put('/api/products/:id', authenticateToken, productController.updateProduct);
router.delete('/api/products/:id', authenticateToken, productController.deleteProduct);

module.exports = router;
