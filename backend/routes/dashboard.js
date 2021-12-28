const router = require("express").Router()
const { verifyToken, verifyAdmin } = require("../middleware/authorization")
const { adminDashboard, userDashboard } = require("../controllers/dashboardController")

router.get("/admin", verifyToken, verifyAdmin, adminDashboard)
router.get("/user", verifyToken, userDashboard)

module.exports = router
