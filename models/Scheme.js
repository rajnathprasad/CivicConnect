const mongoose = require("mongoose");

const schemeSchema = new mongoose.Schema({
  schemeName: { type: String, required: true },
  schemeDescription: { type: String },
  gender: { type: String, enum: ["male", "female", "all"] },
  maritalStatus: { type: String },
  income: { type: String },
  occupation: { type: String },
  educationLevel: { type: String },
  state: { type: String },
  ruralOrUrban: { type: String, enum: ["rural", "urban", "both"] },
  videoLink: { type: String },
  hasGirlChild: { type: Boolean },
  isFarmer: { type: Boolean },
  isPregnantOrMother: { type: Boolean },
  isDisabled: { type: Boolean },
  image: { type: String },

  // Add this:
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }]
});

module.exports = mongoose.model("Scheme", schemeSchema);
