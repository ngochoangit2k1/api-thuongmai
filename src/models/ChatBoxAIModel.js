const mongoose = require('mongoose')
const chatboxAISchema = new mongoose.Schema(
  {
    result: { type: String, default: '' },
    includes: { type: [String], require: true }
  },
  {
    timestamps: true
  }
)
const ChatBoxAI = mongoose.model('Chat', chatboxAISchema)
module.exports = ChatBoxAI
