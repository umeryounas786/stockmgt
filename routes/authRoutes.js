const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Web routes
router.get('/', (req, res) => {
  if (req.cookies.token) {
    return res.redirect('/dashboard');
  }
  res.redirect('/login');
});

router.get('/login', (req, res) => {
  if (req.cookies.token) {
    return res.redirect('/dashboard');
  }
  res.render('login', { message: null });
});

router.get('/register', (req, res) => {
  if (req.cookies.token) {
    return res.redirect('/dashboard');
  }
  res.render('register', { message: null });
});

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/logout', authController.logout);

// API routes
router.post('/api/login', authController.apiLogin);

module.exports = router;
