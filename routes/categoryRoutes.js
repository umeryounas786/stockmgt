const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { authenticateToken, checkAuth } = require('../middleware/auth');

// Web route
router.get('/categories', checkAuth, categoryController.getCategoriesPage);

// API routes
router.get('/api/categories', authenticateToken, categoryController.getAllCategories);
router.get('/api/categories/:id', authenticateToken, categoryController.getCategoryById);
router.post('/api/categories', authenticateToken, categoryController.createCategory);
router.put('/api/categories/:id', authenticateToken, categoryController.updateCategory);
router.delete('/api/categories/:id', authenticateToken, categoryController.deleteCategory);

module.exports = router;
