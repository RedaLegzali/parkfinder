const router = require("express").Router()
const {
  getAdminParkings,
  getParkings,
  addParking,
  editParking,
  deleteParking
} = require("../controllers/parkingsController")
const { verifyToken, verifyAdmin } = require("../middleware/authorization")
const { validateData } = require("../middleware/validation")

router.get("/", getParkings)
router.get("/admin", verifyToken, verifyAdmin, getAdminParkings)
router.post("/", verifyToken, verifyAdmin, validateData, addParking)
router.put("/:id", verifyToken, verifyAdmin, validateData, editParking)
router.delete("/:id", verifyToken, verifyAdmin, deleteParking)

module.exports = router
