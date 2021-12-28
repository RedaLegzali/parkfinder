const { Schema, model } = require("mongoose")

const UserSchema = new Schema({
  username: String,
  image: {
    type: String,
    default: "user.png"
  },
  email: {
    type: String,
    unique: true
  },
  birthDate: Date,
  password: String,
  reservations: [
    {
      type: Schema.Types.ObjectId,
      ref: "reservations"
    }
  ],
  balance: {
    type: Number,
    default: 0
  },
  notifications: [],
  isAdmin: {
    type: Boolean,
    default: false
  },
  isBlocked: {
    type: Boolean,
    default: true
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

const User = model("users", UserSchema)

module.exports = User
