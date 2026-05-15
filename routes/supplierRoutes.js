const express = require('express');
const router = express.Router();
const controller = require('../controllers/supplierController');
const { authenticateToken, checkAuth } = require('../middleware/auth');

// Web route
router.get('/suppliers', checkAuth, controller.getSuppliersPage);

// API routes
router.get('/api/suppliers', authenticateToken, controller.getAll);
router.get('/api/suppliers/:id', authenticateToken, controller.getById);
router.post('/api/suppliers', authenticateToken, controller.create);
router.put('/api/suppliers/:id', authenticateToken, controller.update);
router.delete('/api/suppliers/:id', authenticateToken, controller.delete);

module.exports = router;
