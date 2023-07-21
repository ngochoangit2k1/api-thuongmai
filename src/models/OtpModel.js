const mongoose = require('mongoose')
const otpSchema = new mongoose.Schema(
  {
    email: { type: String, require: true, unique: true },
    otp: {
      type: String,
      required: true
    },
    expiresAt: { type: Date, default: Date.now, expires: '1m' }
  },
  {
    timestamps: true
  }
)
const Otp = mongoose.model('Otp', otpSchema)

module.exports = Otp
