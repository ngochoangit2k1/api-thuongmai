const mongoose = require('mongoose')
const evaluateModel = new mongoose.Schema(
  {
    comment: { type: String, require: true },
    image: { type: [String] },
    rating: { type: Number, default: 0 },
    user: { type: mongoose.SchemaTypes.ObjectId, ref: 'User' },
    product: { type: mongoose.SchemaTypes.ObjectId, ref: 'Product' }
  },
  {
    timestamps: true
  }
)
const Evaluate = mongoose.model('Evaluate', evaluateModel)
module.exports = Evaluate
