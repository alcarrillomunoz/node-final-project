const mongoose = require("mongoose");

const ProjectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please provide project title"],
      maxLength: 50,
    },
    description: {
      type: String,
      required: [true, "Please provide a project description"],
    },
    status: {
      type: String,
      enum: [
        "New",
        "Assigned",
        "In Review",
        "Edits Made",
        "Edits Requested",
        "Approved",
        "Complete",
      ],
      default: "new",
    },
    createdBy: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: [true, "Please provide a user"],
    },
    assignedToDesigner: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Project", ProjectSchema);
