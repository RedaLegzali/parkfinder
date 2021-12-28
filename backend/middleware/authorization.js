// Initialize dependencies
const jwt = require("jsonwebtoken")
const User = require("../models/User")

// Verify the authorization token
const verifyToken = (req, res, next) => {
  // Load authorization header
  let bearerToken = req.headers["authorization"]
  // Check if bearer token exists
  if (bearerToken !== undefined) {
    // Get the token part of the bearer token
    let token = bearerToken.split(" ")[1]
    // Verify the token with the secret key
    jwt.verify(token, process.env.SECRET, (err, data) => {
      if (err) {
        return res.status(401).json({ message: "Access Unauthorized" })
      } else {
        // Save the decoded jwt data in req object
        req.user = data
        next()
      }
    })
  } else {
    return res.status(401).json({ message: "Access Unauthorized" })
  }
}

// Verify that the authorized user has admin privileges
const verifyAdmin = async (req, res, next) => {
  if (req.user) {
    let user = await User.findById(req.user.id)
    if (!user) {
      return res.status(401).json({ message: "User not found" })
    }
    if (!user.isAdmin) {
      return res
        .status(403)
        .json({ message: "Area restricted to administrators" })
    }
  } else {
    return res.status(401).json({ message: "Access Unauthorized" })
  }
  next()
}

module.exports = { verifyToken, verifyAdmin }
