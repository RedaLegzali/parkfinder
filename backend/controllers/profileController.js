// Initialize dependencies
const User = require("../models/User")
const Parking = require("../models/Parking")
const Reservation = require("../models/Reservation")
const bcrypt = require("bcrypt")
const ObjectId = require("mongoose").Types.ObjectId
const { isEmail, isDate } = require("validator")
const path = require("path")
const fs = require('fs')
const handlebars = require('handlebars')

const validateUser = async (req, res) => {
  let id = req.params.id
  let isValid = true
  if (!ObjectId.isValid(id)) { isValid = false }
  let user = await User.findById(id)
  if (!user) { isValid = false }
  if (isValid) {
    user.isBlocked = false
    await user.save()
    let file = path.resolve(__dirname, "../assets/email/success.html")
    const html = fs.readFileSync(file, 'utf8')
    let template = handlebars.compile(html)
    let data = { message: "Your account has been activated successfully" }
    let message = template(data)
    return res.send(message)
  } else {
    let file = path.resolve(__dirname, "../assets/email/verify.html")
    const html = fs.readFileSync(file, 'utf8')
    let template = handlebars.compile(html)
    let data = { message: "There was an error activating your account" }
    let message = template(data)
    return res.send(message)
  }
}

const addPack = async (req, res) => {
  let { pack } = req.body
  let user = await User.findById(req.user.id)
  user.balance += parseInt(pack)
  await user.save()
  return res.status(200).json({message: `You have successfully bought a ${pack} DH pack`})
}

const getUser = async (req, res) => {
  // Get user by id loaded from JWT data
  let user = await User.findById(req.user.id).select("-password")
  if (!user) {
    return res.status(400).json({ message: "User not found" })
  }
  user.notifications = user.notifications ? user.notifications.sort((a, b) => new Date(b.date) - new Date(a.date)) : []
  return res.status(200).json(user)
}
// Edit user function
const editUser = async (req, res) => {
  let user = await User.findById(req.user.id)
  if (!user) {
    return res.status(400).json({ message: "User not found" })
  }
  let {
    username,
    email,
    image,
    birthDate,
    oldPassword,
    password,
    passwordConfirm
  } = req.body
  let errors = {}
  let isValid = true
  if (!isEmail(email)) {
    errors.email = "email must be of type email"
    isValid = false
  }
  // Validate birthDate format
  if (!isDate(birthDate)) {
    errors.birthDate = "birthDate must be of type date"
    isValid = false
  }
  // Initialize hashed password
  let hashedPassword
  // Check if any password data has been passed
  if (oldPassword || password || passwordConfirm) {
    // If all passwords are passed
    if (oldPassword && password && passwordConfirm) {
      // Verify old password
      let userPass = await User.findById(req.user.id).select("-_id password")
      let match = await bcrypt.compare(oldPassword, userPass.password)
      if (!match) {
        errors.password = "Invalid password"
        isValid = false
      }
      // Verify confirmation
      if (password === passwordConfirm) {
        hashedPassword = await bcrypt.hash(password, 10)
      } else {
        errors.password = "password must be equal to passwordConfirm"
        isValid = false
      }
    } else {
      errors.password = "All password fields must be filled"
      isValid = false
    }
  }
  if (isValid) {
    let userData = {
      username,
      email,
      birthDate,
      updatedAt: new Date().toISOString()
    }
    if (image) {
      userData.image = image
    }
    if (hashedPassword) {
      userData.password = hashedPassword
    }
    try {
      let user = await User.findByIdAndUpdate(req.user.id, userData, {
        new: true,
        useFindAndModify: false
      })
      return res.status(200).json({ message: "User edited successfully", user })
    } catch (err) {
      errors.email = "email must be unique"
    }
  }
  return res.status(401).json(errors)
}
// Delete user function
const deleteUser = async (req, res) => {
  // Find user by id and delete the record
  if (req.user.isAdmin) {
    let parkings = await Parking.find({ admin: req.user.id })
    for (parking of parkings) {
      await Reservation.deleteMany({parking: ObjectId(parking._id)})
      await Parking.findByIdAndDelete(parking._id)
    }
  }
  await Reservation.deleteMany({user: ObjectId(req.user.id)})
  await User.findByIdAndDelete(req.user.id)
  return res.status(200).json({ message: "User deleted successfully" })
}

const readNotifications = async (req, res) => {
  let user = await User.findById(req.user.id)
  user.notifications = user.notifications.map(notif => !notif.opened ? {...notif, opened: true} : {...notif})
  await user.save()
  return res.status(200).json({message: 'Notifications cleared'})
}

module.exports = { getUser, editUser, deleteUser, validateUser, addPack, readNotifications }
