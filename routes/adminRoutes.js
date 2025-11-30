// routes/adminRoutes.js
const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { upload } = require("../config/cloudinary"); // new

// Middleware to check if the user is admin
const isAdmin = (req, res, next) => {
  console.log("Session User:", req.session.user);
  if (!req.session.user || !req.session.user.isAdmin) {
    console.log("User is not admin or not logged in");
    return res.redirect("/user/dashboard");
  }
  next();
};

// Admin Dashboard Route
router.get("/dashboard", isAdmin, adminController.renderAdminDashboard);

// Render Add Scheme Form
router.get("/add-scheme", isAdmin, adminController.renderAddSchemeForm);

// Add New Scheme (POST with Cloudinary upload)
router.post("/add-scheme", isAdmin, upload.single("image"), adminController.addNewScheme);

// Render Edit Scheme Form
router.get("/edit-scheme/:id", isAdmin, adminController.renderEditSchemeForm);

// Update Scheme (POST with Cloudinary upload)
router.post("/edit-scheme/:id", isAdmin, upload.single("image"), adminController.updateScheme);

// Delete Scheme
router.post("/schemes/delete/:id", isAdmin, adminController.deleteScheme);

module.exports = router;
