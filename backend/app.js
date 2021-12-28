// Load all env variables
require("dotenv").config()

// Initialize dependencies
const port = process.env.PORT || 5000
const express = require("express")
const app = express()
const mongoose = require("mongoose")
const logger = require("morgan")
const cors = require("cors")
const fileUpload = require("express-fileupload")

// Middlewares
// CORS
app.use(cors())
// Logger
app.use(logger("dev"))
// JSON Parser
app.use(express.json())
// File Upload
app.use(fileUpload())

// Public Images Folder
app.use(express.static("./assets/images"))

// Routes
app.use("/auth", require("./routes/auth"))
app.use("/profile", require("./routes/profile"))
app.use("/parkings", require("./routes/parkings"))
app.use("/reservations", require("./routes/reservations"))
app.use("/users", require("./routes/users"))
app.use("/dashboard", require("./routes/dashboard"))
app.use("/upload", require("./routes/upload"))
app.use("/contact", require("./routes/contact"))
app.use("*", (req, res) => res.status(404).json({ message: "Not Found" }))

// Database + Server Start
let database =
  process.env.ENV === "TEST" ? process.env.DATABASE_TEST : process.env.DATABASE
mongoose
  .connect(database, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
  })
  .then(() => console.log("Mongoose => Connected"))
  .catch(() => console.log("Mongoose => Error"))
const server = app.listen(port, () => console.log(`Listening on port ${port}`))

module.exports = server
