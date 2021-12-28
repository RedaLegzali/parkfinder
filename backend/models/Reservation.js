const { Schema, model } = require("mongoose")

const ReservationSchema = new Schema({
  parking: {
    type: Schema.Types.ObjectId,
    ref: "parkings"
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "users"
  },
  arrival: Date,
  departure: Date,
  licensePlate: String,
  status: String,
  total: {
    type: Number,
    default: 0
  }
})

const Reservation = model("reservations", ReservationSchema)

module.exports = Reservation
