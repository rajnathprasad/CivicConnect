const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const discussionController = require('../controllers/discussionController');
const { isAuthenticated } = require('../middlewares/authMiddleware');

// Dashboard with filtering, tabs, search
router.get('/', isAuthenticated, dashboardController.renderUserDashboard);

// Scheme view & comment routes
router.get('/scheme/:id', isAuthenticated, discussionController.viewScheme);
router.post('/scheme/:id/comment', isAuthenticated, discussionController.postComment);

module.exports = router;
