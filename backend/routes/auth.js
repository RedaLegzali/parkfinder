// Initialize dependencies
const router = require("express").Router()
const { registerUser, loginUser } = require("../controllers/authController")
const { validateData } = require("../middleware/validation")

router.post("/register", validateData, registerUser)
router.post("/login", validateData, loginUser)

module.exports = router
