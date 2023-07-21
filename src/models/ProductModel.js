const mongoose = require('mongoose')

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    image: { type: [String] },
    images: { type: Array, default: [] },
    price: { type: Number, required: true },
    price_after_discount: { type: Number, required: true },
    countInStock: { type: Number, required: true },
    rating: { type: Number, default: 4.5 },
    rating_count: { type: Number, default: 0 },
    description: { type: String },
    discount: { type: Number },
    selled: { type: Number, default: 0 },
    category: { type: mongoose.SchemaTypes.ObjectId, ref: 'Category' }
  },
  {
    timestamps: true
  }
)
const Product = mongoose.model('Product', productSchema)

module.exports = Product
