// Initialize dependencies
const User = require("../models/User")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const { isEmail, isDate } = require("validator")
const { sendMail } = require("../utils")
const handlebars = require('handlebars')
const path = require("path")
const fs = require('fs')

const registerUser = async (req, res) => {
  let {
    username,
    email,
    birthDate,
    password,
    passwordConfirm,
    isAdmin,
    image
  } = req.body
  let errors = {}
  let isValid = true
  if (password !== passwordConfirm) {
    errors.password = "password must be equal to passwordConfirm"
    isValid = false
  }
  if (!isEmail(email)) {
    errors.email = "email must be of type email"
    isValid = false
  }
  if (!isDate(birthDate)) {
    errors.birthDate = "birthDate must be of type date"
    isValid = false
  }
  let user = await User.findOne({ email: email })
  if (user) {
    errors.email = "email must be unique"
    isValid = false
  }
  if (isValid) {
    // Register user in database
    let hash = await bcrypt.hash(password, 10)
    image = image ? image : "user.png"
    let user = new User({
      username,
      email,
      image,
      birthDate,
      password: hash
    })
    user.isAdmin = isAdmin == true ? true : false
    await user.save()
    // Send email verification
    let from = `${process.env.SMTP_USER} <Parkfinder>`
    let file = path.resolve(__dirname, "../assets/email/verify.html")
    const html = fs.readFileSync(file, 'utf8')
    let template = handlebars.compile(html)
    let data = { link: `http://${req.host}/profile/activate/${user._id}` }
    let message = template(data)
    let attachments = [{
        filename: 'parkfinder.png',
        path: path.resolve(__dirname, "../assets/images/parkfinder.png"),
        cid: 'parkfinder@logo.com' //same cid value as in the html img src
    }]
    sendMail(from, email, "Parkfinder - Activate Account", message, attachments)
    return res
      .status(200)
      .json({ message: "User created successfully. Please verify your email" })
  }
  return res.status(400).json(errors)
}

const loginUser = async (req, res) => {
  let { email, password } = req.body
  let errors = {}
  let isValid = true
  // Validate email format
  if (!isEmail(email)) {
    errors.email = "email must be of type email"
    isValid = false
  }
  let user = await User.findOne({ email: email })
  if (!user) {
    errors.message = "Invalid credentials"
    isValid = false
  } else {
    let match = await bcrypt.compare(password, user.password)
    if (!match) {
      errors.message = "Invalid credentials"
      isValid = false
    } else {
      if (user.isBlocked) {
        errors.message = "Your account is locked"
        isValid = false
      } 
    }
  }
  if (isValid) {
    // Create a JWT Token
    let loggedUser = { id: user._id, email, isAdmin: user.isAdmin }
    let token = jwt.sign(loggedUser, process.env.SECRET, { expiresIn: "1d" })
    return res.status(200).json({
      message: "You have logged in successfully",
      isAdmin: user.isAdmin,
      token
    })
  }
  return res.status(403).json(errors)
}

module.exports = { registerUser, loginUser }
