const express = require("express");
const router = express.Router();
const {
  loginUser,
  registerUser,
  getAllUsers,
  updateUser,
  deleteUser,
} = require("../controllers/userController");

router.post("/login", loginUser);
router.post("/register", registerUser);
router.get("/", getAllUsers);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

module.exports = router;
