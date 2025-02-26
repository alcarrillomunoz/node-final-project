const express = require("express");
const router = express.Router();
const {
  login,
  register,
  getUserById,
  getUserByEmail,
  getAllUsers,
} = require("../controllers/auth");

router.post("/register", register);
router.post("/login", login);
router.post("/", getUserByEmail);
router.get("/:id", getUserById);
router.get("/", getAllUsers);

module.exports = router;
