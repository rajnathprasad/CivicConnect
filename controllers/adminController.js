// controllers/adminController.js
const Scheme = require("../models/Scheme");
const { cloudinary } = require("../config/cloudinary");

// Robust boolean sanitizer (returns a real boolean)
// Also tolerant to arrays (takes last element), numbers, 'on', 'true', etc.
const toBoolean = (val) => {
  if (Array.isArray(val)) {
    if (val.length === 0) return false;
    // take the last sent value (hidden input usually comes first, checkbox last)
    val = val[val.length - 1];
  }
  if (val === true || val === 'true' || val === '1' || val === 1) return true;
  if (val === 'on') return true;
  // sometimes libs use 'yes'/'y'
  if (typeof val === 'string' && ['yes', 'y'].includes(val.toLowerCase())) return true;
  return false;
};

// Helper to safely read boolean fields from an object (req.body or a DB doc)
const getBooleanField = (obj, fieldName) => {
  if (!obj) return false;
  return toBoolean(obj[fieldName]);
};

// Render Admin Dashboard
exports.renderAdminDashboard = async (req, res) => {
  if (!req.session.user || !req.session.user.isAdmin) {
    return res.redirect("/user/dashboard");
  }

  try {
    const schemes = await Scheme.find();
    res.render("adminDashboard", { user: req.session.user, schemes });
  } catch (err) {
    console.error("Error loading admin dashboard:", err);
    res.status(500).send("Internal Server Error");
  }
};

// Render Add Scheme Form
exports.renderAddSchemeForm = (req, res) => {
  res.render("addScheme");
};

// Add New Scheme
exports.addNewScheme = async (req, res) => {
  try {
    const {
      schemeName,
      schemeDescription,
      gender,
      maritalStatus,
      income,
      occupation,
      educationLevel,
      state,
      ruralOrUrban,
      videoLink
    } = req.body;

    // Determine Cloudinary values from req.file (multer-storage-cloudinary)
    let imageUrl, imagePublicId;
    if (req.file) {
      imageUrl = req.file.path || req.file.secure_url || req.file.url || req.file.location;
      imagePublicId = req.file.filename || req.file.public_id || req.file.key;
    }

    const newScheme = new Scheme({
      schemeName,
      schemeDescription,
      gender: gender || undefined,
      maritalStatus: maritalStatus || undefined,
      income: income || undefined,
      occupation: occupation || undefined,
      educationLevel: educationLevel || undefined,
      state: state || undefined,
      ruralOrUrban: ruralOrUrban || undefined,
      videoLink: videoLink || undefined,
      // store real booleans (handles array and string inputs)
      hasGirlChild: getBooleanField(req.body, 'hasGirlChild'),
      isFarmer: getBooleanField(req.body, 'isFarmer'),
      isPregnantOrMother: getBooleanField(req.body, 'isPregnantOrMother'),
      isDisabled: getBooleanField(req.body, 'isDisabled'),
      imageUrl,
      imagePublicId
    });

    await newScheme.save();
    res.redirect("/admin/dashboard");
  } catch (error) {
    console.error("Error adding scheme:", error);
    res.status(400).send("Error adding scheme");
  }
};

// Render Edit Scheme Form
exports.renderEditSchemeForm = async (req, res) => {
  try {
    const scheme = await Scheme.findById(req.params.id);
    if (!scheme) {
      return res.status(404).send("Scheme not found");
    }

    // Coerce stored values to real booleans so EJS 'checked' works reliably
    // Handles both boolean and string storage shapes
    scheme.hasGirlChild = getBooleanField(scheme, 'hasGirlChild');
    scheme.isFarmer = getBooleanField(scheme, 'isFarmer');
    scheme.isPregnantOrMother = getBooleanField(scheme, 'isPregnantOrMother');
    scheme.isDisabled = getBooleanField(scheme, 'isDisabled');

    res.render("editScheme", { scheme });
  } catch (err) {
    console.error("Error loading scheme for editing:", err);
    res.status(500).send("Internal Server Error");
  }
};

// Update Scheme
exports.updateScheme = async (req, res) => {
  try {
    // DEBUG: inspect incoming body to understand shape (remove later)
    console.log('updateScheme - req.body sample:', req.body);

    const {
      schemeName,
      schemeDescription,
      gender,
      maritalStatus,
      income,
      occupation,
      educationLevel,
      state,
      ruralOrUrban,
      videoLink
    } = req.body;

    const updateData = {
      schemeName,
      schemeDescription,
      gender: gender || undefined,
      maritalStatus: maritalStatus || undefined,
      income: income || undefined,
      occupation: occupation || undefined,
      educationLevel: educationLevel || undefined,
      state: state || undefined,
      ruralOrUrban: ruralOrUrban || undefined,
      videoLink: videoLink || undefined,
      // store real booleans (handles arrays and strings)
      hasGirlChild: getBooleanField(req.body, 'hasGirlChild'),
      isFarmer: getBooleanField(req.body, 'isFarmer'),
      isPregnantOrMother: getBooleanField(req.body, 'isPregnantOrMother'),
      isDisabled: getBooleanField(req.body, 'isDisabled')
    };

    // If new file uploaded: remove old asset (if exists) then store new Cloudinary info
    if (req.file) {
      const imageUrl = req.file.path || req.file.secure_url || req.file.url || req.file.location;
      const imagePublicId = req.file.filename || req.file.public_id || req.file.key;

      // fetch current scheme to get previous public id
      const existing = await Scheme.findById(req.params.id);
      if (existing && existing.imagePublicId) {
        try {
          await cloudinary.uploader.destroy(existing.imagePublicId);
        } catch (err) {
          console.warn("Cloudinary: failed to destroy previous image", err);
        }
      }

      updateData.imageUrl = imageUrl;
      updateData.imagePublicId = imagePublicId;
    }

    await Scheme.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.redirect("/admin/dashboard");
  } catch (err) {
    console.error("Error updating scheme:", err);
    res.status(500).send("Error updating scheme");
  }
};

// Delete Scheme
exports.deleteScheme = async (req, res) => {
  try {
    const scheme = await Scheme.findById(req.params.id);
    if (!scheme) return res.redirect("/admin/dashboard");

    // delete image from Cloudinary if present
    if (scheme.imagePublicId) {
      try {
        await cloudinary.uploader.destroy(scheme.imagePublicId);
      } catch (err) {
        console.warn("Cloudinary: failed to destroy image on delete", err);
      }
    }

    await Scheme.findByIdAndDelete(req.params.id);
    res.redirect("/admin/dashboard");
  } catch (err) {
    console.error("Error deleting scheme:", err);
    res.status(500).send("Server error");
  }
};
