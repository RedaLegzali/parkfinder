// Initialize dependencies
const router = require("express").Router()
const { contact } = require("../controllers/contactController")
const { validateData } = require("../middleware/validation")

router.post("/", validateData, contact)

module.exports = router
