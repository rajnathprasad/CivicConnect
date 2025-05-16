const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Routes
router.route('/signup')
    .get(authController.renderSignupPage)
    .post(authController.handleUserSignup);

router.route('/login')
    .get(authController.renderLoginPage)
    .post(authController.handleUserLogin);

// router.get('/logout', authController.handleLogout);
router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.log('Logout error:', err);
        }
        res.redirect('/login');
    });
});
router.post('/logout', authController.handleLogout);
module.exports = router;
