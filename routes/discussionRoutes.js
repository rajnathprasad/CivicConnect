const express = require('express');
const router = express.Router();
const discussionController = require('../controllers/discussionController');
const { isAuthenticated } = require('../middlewares/authMiddleware');

// View scheme details
router.get('/scheme/:id', isAuthenticated, discussionController.viewScheme);

// Post a comment on a scheme
router.post('/scheme/:id/comment', isAuthenticated, discussionController.postComment);

module.exports = router;
