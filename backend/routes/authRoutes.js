const { Router } = require('express');
const authController = require('../controllers/authController');
const { checkAuth } = require('../middlewares/checkAuth');

const router = Router();

// הגדרת מסלולים של בקר authController
router.post('/contact/sendmail', authController.sendMailContact_post);
router.post('/send/wareport', authController.sendMessageToEmail);
router.post('/register', authController.createUser);
router.get('/user/verify/:id', authController.verifyUser);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password/:token', checkAuth, authController.resetPassword);
router.post('/login', authController.loginUser);
router.get('/users', checkAuth, authController.getAllUsers);
router.put('/users/:id/edit', checkAuth, authController.updateUser);
router.get('/users/:id', checkAuth, authController.getUserProfile);
router.get('/user/profile', checkAuth, authController.getUserProfileGoogle);

// מסלולי Google OAuth2
router.get('/auth/google', authController.googleAuth);
router.get('/auth/google/callback', authController.googleCallback);

// מסלול לקבלת פרטי המשתמש המחובר
router.get('/auth/user', authController.getAuthenticatedUser);
router.post('/verify-token', authController.verifyTokenUser);

module.exports = router;
