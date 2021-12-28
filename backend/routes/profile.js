// Initialize dependencies
const router = require("express").Router()
const { validateData } = require("../middleware/validation")
const { verifyToken } = require("../middleware/authorization")
const {
  getUser,
  editUser,
  deleteUser,
  validateUser,
  addPack,
  readNotifications
} = require("../controllers/profileController")

router.get("/", verifyToken, getUser)
router.get("/notifications", verifyToken, readNotifications)
router.get("/activate/:id", validateUser)
router.post("/balance", verifyToken, validateData, addPack)
router.put("/", verifyToken, validateData, editUser)
router.delete("/", verifyToken, deleteUser)

module.exports = router
