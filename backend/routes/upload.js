// Initialize dependencies
const router = require("express").Router()
const { storeImage } = require("../controllers/uploadController")

router.post("/", storeImage)

module.exports = router
