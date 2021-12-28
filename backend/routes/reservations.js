const router = require("express").Router()
const { validateData } = require("../middleware/validation")
const { verifyToken, verifyAdmin } = require("../middleware/authorization")
const {
  getAdminReservations,
  getReservations,
  addReservation,
  deleteReservation,
  scanReservation
} = require("../controllers/reservationsController")

router.get("/admin", verifyToken, verifyAdmin, getAdminReservations)
router.get("/", verifyToken, getReservations)
router.get("/scan/:id", scanReservation)
router.post("/", verifyToken, validateData, addReservation)
router.delete("/:id", verifyToken, deleteReservation)

module.exports = router
