const mongoose = require('mongoose')
const userSchema = new mongoose.Schema(
  {
    name: { type: String },
    email: { type: String, required: true },
    password: { type: String },
    phone: { type: String },
    address: { type: String },
    city: { type: String },
    avatar: { type: String },
    role: { type: String, default: 'user' },
    type: { type: String }
  },
  {
    timestamps: true
  }
)
const User = mongoose.model('User', userSchema)
module.exports = User
