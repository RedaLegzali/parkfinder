const { Schema, model } = require("mongoose")

const ParkingSchema = new Schema({
  name: {
    type: String,
    unique: true
  },
  description: String,
  longitude: Number,
  latitude: Number,
  image: {
    type: String,
    default: "parking.png"
  },
  capacity: Number,
  reserved: {
    type: Number,
    default: 0
  },
  price: Number,
  admin: {
    type: Schema.Types.ObjectId,
    ref: "parkings"
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
})

const Parking = model("parkings", ParkingSchema)

module.exports = Parking
