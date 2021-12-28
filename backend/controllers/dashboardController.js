const Reservation = require("../models/Reservation")
const Parking = require("../models/Parking")
const User = require("../models/User")
const Duration = require('duration')
const ObjectId = require('mongoose').Types.ObjectId

const adminDashboard = async (req, res) => {
  let data = []
  let parkings = await Parking.find({admin: ObjectId(req.user.id)})
  let income = 0
  let pie = { labels: [], data: [] }
  let area = { labels: [], data: [] }
  let bar = { labels: [], data: [] }
  
  area.labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  for (let i=0; i < area.labels.length; i++) {
    area.data.push(0)
  }
  for (parking of parkings) {
    let parking_income = 0
    pie.labels.push(parking.name)
    pie.data.push(parking.reserved)
    let reservations = await Reservation.find({parking: ObjectId(parking._id)})
    reservations.forEach(reservation => { 
      let index = new Date(reservation.arrival).getMonth()
      area.data[index] += 1
      parking_income += reservation.total
      income += reservation.total 
    })
    bar.labels.push(parking.name)
    bar.data.push(parking_income)
  }
  return res.status(200).json({income: parseFloat(income.toFixed(2)), area, pie, bar})
}

const userDashboard = async (req, res) => {
  let reservations = await Reservation.find({ "user": req.user.id })
  let user = await User.findById(req.user.id)
  let count = reservations.length
  let total = 0
  let balance = user.balance
  let hours = 0
  let minutes = 0
  reservations.forEach(reservation => {
    if (reservation.arrival && reservation.departure) {
      let duration = Duration(new Date(reservation.arrival), new Date(reservation.departure))
      hours += duration.hour
      minutes += duration.minute
    }
    total += reservation.total
  })
  let data = [
    { id: 1, title: 'Total Reservations', value: `${parseFloat(total.toFixed(2))} DH`, icon: 'shopping-bag' },
    { id: 2, title: 'Number Reservations', value: count, icon: 'list' },
    { id: 3, title: 'Parkings Time', value: `${hours} hours ${minutes} minutes`, icon: 'clock' },
    { id: 4, title: 'Current Balance', value: `${parseFloat(balance.toFixed(2))} DH`, icon: 'dollar-sign' },
  ]
  return res.status(200).json(data)
}

module.exports = { adminDashboard, userDashboard }
