const express = require('express');
const router = express.Router();
const { login, register, forgotPassword, resetPassword, logout, checkSession } = require('../controllers/authController');
const { verifyToken } = require('../middleware/authMiddleware');

router.post('/login', login);
router.post('/register', register);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/logout', logout);
router.get('/check-session', verifyToken, checkSession);

module.exports = router;
