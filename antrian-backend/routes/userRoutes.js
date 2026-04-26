const express = require("express");
const router = express.Router();
const {
  loginUser,
  registerUser,
  getAllUsers,
  updateUser,
  deleteUser,
} = require("../controllers/userController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

router.post("/login", loginUser);
router.post("/register", protect, adminOnly, registerUser);
router.get("/", protect, adminOnly, getAllUsers);
router.put("/:id", protect, adminOnly, updateUser);
router.delete("/:id", protect, adminOnly, deleteUser);

module.exports = router;
