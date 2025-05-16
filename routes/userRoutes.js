const express = require('express');
const router = express.Router();
const Scheme = require('../models/Scheme');
const User = require('../models/User');  // Assuming you have a User model
const { renderProfilePage } = require('../controllers/userController'); // Import controller for profile page

// Dashboard route
router.get('/dashboard', async (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }

  try {
    const schemes = await Scheme.find();

    // Fix: Pass required variables for the dashboard view
    res.render('dashboard', {
      user: req.session.user,
      schemes,
      query: '',               // Ensure the query param exists
      currentView: 'all'       // Default to 'all' view
    });
  } catch (err) {
    console.error('Error fetching schemes:', err);
    res.status(500).send('Something went wrong');
  }
});

// Profile route (GET)
router.get('/profile', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }

  // Render the profile page, passing the user data from session
  res.render('profile', { user: req.session.user });
});

// Profile route (POST) - Handle profile update
router.post('/profile', async (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.session.user._id, 
      {
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        aadhaar: req.body.aadhaar,
        gender: req.body.gender,
        maritalStatus: req.body.maritalStatus,
        income: req.body.income,
        occupation: req.body.occupation,
        educationLevel: req.body.educationLevel,
        state: req.body.state,
        ruralOrUrban: req.body.ruralOrUrban,
        hasGirlChild: req.body.hasGirlChild === 'on',
        isFarmer: req.body.isFarmer === 'on',
        isPregnantOrMother: req.body.isPregnantOrMother === 'on',
        isDisabled: req.body.isDisabled === 'on',
      },
      { new: true }
    );

    req.session.user = updatedUser;
    res.redirect('/user/profile');
  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(500).send('Something went wrong');
  }
});

module.exports = router;
