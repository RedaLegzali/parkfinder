const Reservation = require("../models/Reservation")
const Parking = require("../models/Parking")
const { isLatLong, isLicensePlate } = require("validator")
const ObjectId = require("mongoose").Types.ObjectId

const getAdminParkings = async (req, res) => {
  let admin = ObjectId(req.user.id)
  const page = parseInt(req.query.page)
  const limit = parseInt(req.query.limit)
  const startIndex = (page - 1) * limit
  const endIndex = page * limit
  let size = await Parking.countDocuments({admin: admin})
  let next = endIndex < size ? { page: page + 1, limit: limit } : null
  let previous = startIndex > 0 ? { page: page - 1, limit: limit } : null
  let parkings = await Parking.find({admin: admin}).limit(limit).skip(startIndex)
  return res.status(200).json({ parkings, next, previous, max: size })
}

const getParkings = async (req, res) => {
  let parkings = await Parking.find()
  return res.status(200).json(parkings)
}

const addParking = async (req, res) => {
  let admin = ObjectId(req.user.id)
  let { name, description, longitude, latitude, image, capacity, price } = req.body
  let errors = {}
  let isValid = true
  if (!isLatLong(`${latitude}, ${longitude}`)) {
    errors.latitude = "latitude and longitude must be of type gps coordinate"
    isValid = false
  }
  if (isValid) {
    image = image ? image : "parking.png"
    let parking = new Parking({
      name,
      description,
      longitude,
      latitude,
      image,
      capacity,
      price,
      admin
    })
    try {
      await parking.save()
    } catch (err) {
      errors.name = "name must be unique"
      return res.status(400).json(errors)
    }
    return res
      .status(200)
      .json({ message: "Parking added succesfully", parking })
  }
  return res.status(400).json(errors)
}

const editParking = async (req, res) => {
  let admin = ObjectId(req.user.id)
  let id = req.params.id
  let { name, description, longitude, latitude, image, capacity, price } = req.body
  let errors = {}
  let isValid = true
  if (!isLatLong(`${latitude}, ${longitude}`)) {
    errors.latitude = "latitude and longitude must be of type gps coordinate"
    isValid = false
  }
  if (isValid) {
    image = image ? image : "parking.png"
    let parking = {
      name,
      description,
      longitude,
      latitude,
      image,
      capacity,
      price,
      admin
    }
    await Parking.findByIdAndUpdate(id, parking, {
      useFindAndModify: false
    })
    return res.status(200).json({ message: "Parking edited succesfully" })
  }
  return res.status(400).json(errors)
}

const deleteParking = async (req, res) => {
  let id = req.params.id
  await Reservation.deleteMany({parking: ObjectId(id)})
  await Parking.findByIdAndDelete(id)
  return res.status(200).json({ message: "Parking deleted succesfully" })
}

module.exports = { getAdminParkings, getParkings, addParking, editParking, deleteParking }
