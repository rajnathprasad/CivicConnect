const Scheme = require("../models/Scheme");

// Sanitize boolean string values
const sanitizeBoolean = (val) => val === 'true';

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
  console.log("Uploaded Image:", req.file);

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
      hasGirlChild: sanitizeBoolean(req.body.hasGirlChild),
      isFarmer: sanitizeBoolean(req.body.isFarmer),
      isPregnantOrMother: sanitizeBoolean(req.body.isPregnantOrMother),
      isDisabled: sanitizeBoolean(req.body.isDisabled),
      image: req.file ? "/uploads/" + req.file.filename : undefined
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
    res.render("editScheme", { scheme });
  } catch (err) {
    console.error("Error loading scheme for editing:", err);
    res.status(500).send("Internal Server Error");
  }
};

// Update Scheme
exports.updateScheme = async (req, res) => {
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
      hasGirlChild: sanitizeBoolean(req.body.hasGirlChild),
      isFarmer: sanitizeBoolean(req.body.isFarmer),
      isPregnantOrMother: sanitizeBoolean(req.body.isPregnantOrMother),
      isDisabled: sanitizeBoolean(req.body.isDisabled)
    };

    if (req.file) {
      updateData.image = "/uploads/" + req.file.filename;
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
    await Scheme.findByIdAndDelete(req.params.id);
    res.redirect("/admin/dashboard");
  } catch (err) {
    console.error("Error deleting scheme:", err);
    res.status(500).send("Server error");
  }
};
