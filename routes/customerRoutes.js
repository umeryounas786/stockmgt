const express = require('express');
const router = express.Router();
const controller = require('../controllers/customerController');
const { authenticateToken, checkAuth } = require('../middleware/auth');

router.get('/customers', checkAuth, controller.getCustomersPage);

router.get('/api/customers', authenticateToken, controller.getAll);
router.get('/api/customers/:id', authenticateToken, controller.getById);
router.post('/api/customers', authenticateToken, controller.create);
router.put('/api/customers/:id', authenticateToken, controller.update);
router.delete('/api/customers/:id', authenticateToken, controller.delete);

module.exports = router;
