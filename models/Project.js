const mongoose = require("mongoose");

const ProjectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide project name"],
      maxLength: 50,
    },
    description: {
      type: String,
      required: [true, "Please provide a project description"],
    },
    status: {
      type: String,
      enum: [
        "new",
        "submitted",
        "edits made",
        "pending review",
        "edits requested",
        "complete",
      ],
      default: "new",
    },
    createdBy: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: [true, "Please provide a user"],
    },
    // assignedTo: {
    //   type: mongoose.Types.ObjectId,
    //   ref: "User",
    //   required: [true, "Please provided a user"],
    // },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Project", ProjectSchema);
