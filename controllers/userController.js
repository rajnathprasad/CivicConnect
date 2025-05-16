const User = require('../models/User');

exports.renderProfilePage = (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    res.render('profile', { user: req.session.user });
};

exports.updateProfile = async (req, res) => {
    try {
        const userId = req.session.user._id; // ✅ Fixed here
        const { name, email, phone, aadhaar } = req.body;

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { name, email, phone, aadhaar },
            { new: true }
        );

        // ✅ Update session user object
        req.session.user = updatedUser;

        res.redirect('/dashboard');
    } catch (err) {
        console.error("Error updating profile:", err);
        res.status(500).send('Server Error');
    }
};
