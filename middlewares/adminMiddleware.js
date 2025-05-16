exports.requireAdmin = (req, res, next) => {
  if (req.session.user && req.session.user.isAdmin) {
    return next();
  } else {
    return res.redirect("/dashboard");  // redirect non-admins
  }
};
