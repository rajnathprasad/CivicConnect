const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Render Pages
exports.renderSignupPage = (req, res) => {
    res.render('auth/auth');
};

exports.renderLoginPage = (req, res) => {
    res.render('auth/auth');
};

// ✅ Signup Logic
exports.handleUserSignup = async (req, res) => {
    const { name, email, phone, aadhaar, password, confirmPassword } = req.body;

    try {
        // Check if the email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.send('Email already registered!');
        }

        // Ensure password and confirmPassword match
        if (password !== confirmPassword) {
            return res.send('Passwords do not match!');
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create and save the new user
        const newUser = new User({ 
            name, 
            email, 
            password: hashedPassword, 
            phone, 
            aadhaar 
        });

        await newUser.save();

        // ✅ Store user ID and object in session
        req.session.userId = newUser._id;
        req.session.user = newUser;

        // Redirect to the dashboard
        res.redirect('/dashboard');
    } catch (err) {
        console.error("Signup error:", err);
        res.send('Error during signup');
    }
};

// ✅ Login Logic
exports.handleUserLogin = async (req, res) => {
    const { email, password } = req.body;
  
    try {
      const user = await User.findOne({ email });
      if (!user) {
        return res.send('Invalid email or password');
      }
  
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return res.send('Invalid email or password');
      }
  
      // Store user ID and object in session
      req.session.userId = user._id;
      req.session.user = user;
  
      // Check if admin
      if (user.isAdmin) {
        return res.redirect('/admin/dashboard');
      } else {
        return res.redirect('/user/dashboard');
      }
    } catch (err) {
      console.error('Login error:', err);
      res.send('Error during login');
    }
  };
  

// Logout
exports.handleLogout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send('Error during logout');
        }
        res.redirect('/login');
    });
};
