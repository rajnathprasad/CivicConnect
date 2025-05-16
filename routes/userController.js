// userController.js

const renderProfilePage = (req, res) => {
    if (!req.session.user) {
      return res.redirect('/login'); // Redirect to login if not authenticated
    }
  
    // Assuming user info is stored in the session
    const user = req.session.user;
  
    res.render('profile', { user }); // Render profile page and pass user data
  };
  
  module.exports = { renderProfilePage };
  