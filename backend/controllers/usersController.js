const User = require("../models/User")
const ObjectId = require("mongoose").Types.ObjectId

const getUsers = async (req, res) => {
  const page = parseInt(req.query.page)
  const limit = parseInt(req.query.limit)
  const search = req.query.search
  const startIndex = (page - 1) * limit
  const endIndex = page * limit
  let pattern = new RegExp(`.*${search}.*`, 'i')
  let size = await User.countDocuments({ isAdmin: false, username: { $regex: pattern } })
  let next = endIndex < size ? { page: page + 1, limit: limit } : null
  let previous = startIndex > 0 ? { page: page - 1, limit: limit } : null
  let users = await User.find({ isAdmin: false, username: { $regex: pattern } })
    .limit(limit)
    .skip(startIndex)
    .select("-password")
  return res.status(200).json({ users, next, previous, max: size })
}
const blockUser = async (req, res) => {
  let id = req.params.id
  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ message: "The id you passed is invalid" })
  }
  let user = await User.findById(id)
  if (!user) {
    return res.status(400).json({ message: "User not found" })
  }
  user.isBlocked = true
  await user.save()
  return res.status(200).json({ message: "User is now blocked" })
}
const unblockUser = async (req, res) => {
  let id = req.params.id
  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ message: "The id you passed is invalid" })
  }
  let user = await User.findById(id)
  if (!user) {
    return res.status(400).json({ message: "User not found" })
  }
  user.isBlocked = false
  await user.save()
  return res.status(200).json({ message: "User is now unblocked" })
}
const addAdmin = async (req, res) => {
  let id = req.params.id
  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ message: "The id you passed is invalid" })
  }
  let user = await User.findById(id)
  if (!user) {
    return res.status(400).json({ message: "User not found" })
  }
  user.isAdmin = true
  await user.save()
  return res.status(200).json({ message: "User is now admin" })
}
const removeAdmin = async (req, res) => {
  let id = req.params.id
  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ message: "The id you passed is invalid" })
  }
  let user = await User.findById(id)
  if (!user) {
    return res.status(400).json({ message: "User not found" })
  }
  user.isAdmin = false
  await user.save()
  return res.status(200).json({ message: "User is now a regular user" })
}
// Delete user
const deleteUser = async (req, res) => {
  let id = req.params.id
  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ message: "The id you passed is invalid" })
  }
  let user = await User.findByIdAndDelete(id)
  if (!user) {
    return res.status(400).json({ message: "User not found" })
  }
  return res.status(200).json({ message: "User deleted successfully" })
}

module.exports = {
  getUsers,
  blockUser,
  unblockUser,
  addAdmin,
  removeAdmin,
  deleteUser
}
