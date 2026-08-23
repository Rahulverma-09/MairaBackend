const express = require('express');
const router = express.Router();
const {
    register,
    login,
    adminLogin,
    getMe,
    getProfile,
    updateProfile,
    changePassword,
    logout
} = require('../controllers/auth.controller');
const { protect } = require('../middlewares/auth.middleware');

router.post('/register', register);
router.post('/login', login);
router.post('/admin-login', adminLogin);

router.get('/me', protect, getMe);

router.route('/profile')
    .get(protect, getProfile)
    .put(protect, updateProfile)
    .post(protect, updateProfile);

router.route('/change-password')
    .put(protect, changePassword)
    .post(protect, changePassword);

router.route('/logout')
    .get(logout)
    .post(logout);

module.exports = router;

