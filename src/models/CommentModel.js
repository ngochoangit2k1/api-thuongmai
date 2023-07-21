const mongoose = require('mongoose')
const commentSchema = new mongoose.Schema(
  {
    title: { type: String, require: true },
    image: { type: [String] },
    replyComment: [
      {
        message: { type: String, require: true },
        user: { name: String, avatar: String, _id: mongoose.SchemaTypes.ObjectId },
        image: { type: [String] },
        date: { type: Date, default: Date.now }
      }
    ],
    user: { type: mongoose.SchemaTypes.ObjectId, ref: 'User' },
    product: { type: mongoose.SchemaTypes.ObjectId, ref: 'Product' }
  },
  {
    timestamps: true
  }
)
const Comment = mongoose.model('Comment', commentSchema)
module.exports = Comment
