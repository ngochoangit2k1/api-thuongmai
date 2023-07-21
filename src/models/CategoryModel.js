const mongoose = require('mongoose')
const categorySchema = new mongoose.Schema(
  {
    name: { type: String },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category'
    }
  },
  {
    timestamps: true
  }
)
const Category = mongoose.model('Category', categorySchema)
module.exports = Category
