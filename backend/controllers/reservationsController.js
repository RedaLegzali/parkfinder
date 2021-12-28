const Reservation = require("../models/Reservation")
const Parking = require("../models/Parking")
const User = require("../models/User")
const ObjectId = require("mongoose").Types.ObjectId
const qrcode = require('qrcode')
const Duration = require('duration')
const { isLicensePlate, sendMail } = require('../utils.js')
const handlebars = require('handlebars')
const path = require("path")
const fs = require('fs')
const { PENALTY } = require('../utils')

const getAdminReservations = async (req, res) => {
  const page = parseInt(req.query.page)
  const limit = parseInt(req.query.limit)
  const parkingFilters = req.query.parkings
  const start = new Date(req.query.start)
  const end = new Date(req.query.end)
  end.setDate(end.getDate()+1)
  const startIndex = (page - 1) * limit
  const endIndex = page * limit
  let query = { admin: req.user.id }
  query = parkingFilters ? { ...query, name: { $in: parkingFilters.split(',') } } : query
  let parkings = await Parking.find(query)
  parkings = parkings.map(parking => parking._id)
  let size = await Reservation.countDocuments({ parking: { "$in": parkings }, arrival: { $gte: start, $lte: end } })
  let next = endIndex < size ? { page: page + 1, limit: limit } : null
  let previous = startIndex > 0 ? { page: page - 1, limit: limit } : null
  let reservations = await Reservation.find({ parking: { "$in": parkings }, arrival: { $gte: start, $lte: end } })
    .limit(limit)
    .skip(startIndex)
    .populate("parking")
    .populate("user")
  return res.status(200).json({ reservations, next, previous, max: size })
}

const getReservations = async (req, res) => {
  let reservations = await Reservation.find({ user: req.user.id }).populate({ path: "parking", select: "name" })
  return res.status(200).json(reservations)
}

const scanReservation = async (req, res) => {
  let id = req.params.id
  let departure = new Date()
  let reservation = await Reservation.findById(id).populate("user").populate("parking")
  if (reservation.departure) {
    let file = path.resolve(__dirname, "../assets/email/error.html")
    const html = fs.readFileSync(file, 'utf8')
    let template = handlebars.compile(html)
    let data = { message: "This reservation is no longer valid" }
    let message = template(data)
    return res.send(message)
  } else if (reservation.arrival) {
    let parking = await Parking.findById(reservation.parking._id)
    let user = await User.findById(reservation.user._id)
    let duration = new Duration(new Date(reservation.arrival), departure)
    let price = ( parking.price * duration.hour ) + ( parking.price * duration.minute / 60 )
    price = parseFloat(price.toFixed(2))
    user.balance -= price
    reservation.total = price
    reservation.departure = departure
    reservation.status = "Done"
    await user.save()
    await reservation.save()
    let file = path.resolve(__dirname, "../assets/email/success.html")
    const html = fs.readFileSync(file, 'utf8')
    let template = handlebars.compile(html)
    let data = { message: `Time Spent: ${duration.hour}:${duration.minute} Price: ${price} DH` }
    let message = template(data)
    return res.send(message)
  } else {
    reservation.arrival = new Date()
    reservation.status = "In Progress"
    await reservation.save()
    let file = path.resolve(__dirname, "../assets/email/success.html")
    const html = fs.readFileSync(file, 'utf8')
    let template = handlebars.compile(html)
    let data = { message: "Reservation activated successfully" }
    let message = template(data)
    return res.send(message)
  }
}

const addReservation = async (req, res) => {
  let { parking, licensePlate } = req.body
  errors = {}
  isValid = true
  if (!ObjectId.isValid(parking)) {
    errors.parking = "Invalid parking id"
    isValid = false
  }
  if (!isLicensePlate(licensePlate)) {
    errors.licensePlate = "licensePlate must be of format AAAAA-BB"
    isValid = false
  }
  if (isValid) {
    parking = await Parking.findById(parking)
    if (parking.reserved == parking.capacity) {
      return res.status(400).json({message: "There are no available places in this parking" })
    }
    let user = await User.findById(req.user.id)
    if (user.balance < parking.price) {
      return res.status(400).json({message: "Insufficient balance. Please subscribe to a pack" })
    }
    parking.reserved += 1
    parking.capacity -= 1
    await parking.save()
    let reservation = new Reservation({ 
      user: ObjectId(req.user.id), 
      parking: parking._id, 
      status: 'Created',
      licensePlate
    })
    await reservation.save()
    try {
      let image = await qrcode.toDataURL(`${process.env.URL}/reservations/scan/${reservation._id}`)
      let from = `${process.env.SMTP_USER} <Parkfinder>`
      let file = path.resolve(__dirname, "../assets/email/qrcode.html")
      const html = fs.readFileSync(file, 'utf8')
      let template = handlebars.compile(html)
      let data = { qrcode: `${image}` }
      let message = template(data)
      let attachments = [{
          filename: 'parkfinder.png',
          path: path.resolve(__dirname, "../assets/images/parkfinder.png"),
          cid: 'parkfinder@logo.com' //same cid value as in the html img src
      }]
      sendMail(from, user.email, "Parkfinder - Reservation QrCode", message, attachments)
    } catch(err) {
      console.log(err)
    }
    admin = await User.findById(parking.admin)
    admin.notifications.push({
      action: "created",
      username: user.username,
      image: user.image,
      date: new Date(),
      opened: false
    })
    await admin.save()
    return res.status(200).json({ message: "Reservation added succesfully", reservation })
  }
  return res.status(400).json(errors)
}

const deleteReservation = async (req, res) => {
  // Soft Deletion
  let id = req.params.id
  errors = {}
  isValid = true
  if (!ObjectId.isValid(id)) {
    errors.parking = "Invalid reservation id"
    isValid = false
  }
  let reservation = await Reservation.findById(id) 
  reservation.status = "Canceled"
  await reservation.save()
  let user = await User.findById(reservation.user)
  user.balance -= PENALTY
  await user.save()
  let parking = await Parking.findById(reservation.parking)
  admin = await User.findById(parking.admin)
  admin.notifications.push({
    action: "canceled",
    username: user.username,
    image: user.image,
    date: new Date(),
    opened: false
  })
  await admin.save()
  return res.status(200).json({ message: "Reservation deleted succesfully" })
}

module.exports = {
  getAdminReservations,
  getReservations,
  addReservation,
  deleteReservation,
  scanReservation
}
