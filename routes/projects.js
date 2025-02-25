const express = require("express");
const router = express.Router();
const {
  getAllProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  assignProject,
} = require("../controllers/projects");

router.route("/").post(createProject).get(getAllProjects);
router.route("/:id").get(getProject).delete(deleteProject).patch(updateProject);
router.route("/assign/:id").patch(assignProject);

module.exports = router;
