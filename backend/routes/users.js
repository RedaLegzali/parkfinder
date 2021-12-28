const router = require("express").Router()
const { validateData } = require("../middleware/validation")
const { verifyToken, verifyAdmin } = require("../middleware/authorization")
const {
  getUsers,
  blockUser,
  unblockUser,
  addAdmin,
  removeAdmin,
  deleteUser
} = require("../controllers/usersController")

router.get("/", verifyToken, verifyAdmin, getUsers)
router.delete("/:id", verifyToken, verifyAdmin, deleteUser)

router.get("/block/:id", verifyToken, verifyAdmin, blockUser)
router.get("/unblock/:id", verifyToken, verifyAdmin, unblockUser)

router.get("/admin/:id", verifyToken, verifyAdmin, addAdmin)
router.get("/unadmin/:id", verifyToken, verifyAdmin, removeAdmin)

module.exports = router
