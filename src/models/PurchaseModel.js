const mongoose = require('mongoose')
const { STATUS_PURCHASE } = require('../constants/purchase')
const { PAYMENT_TYPE } = require('../constants/payment')
const PurchaseSchema = new mongoose.Schema(
  {
    user: { type: mongoose.SchemaTypes.ObjectId, ref: 'User' },
    product: { type: mongoose.SchemaTypes.ObjectId, ref: 'Product' },
    buy_count: { type: Number, default: 0 },
    price: { type: Number, default: 0 },
    price_before_discount: { type: Number, default: 0 }, // lỗi thì tìm chỗ này
    isEvaluate: { type: Boolean, default: false },
    isPaid: { type: Boolean, default: false },
    reasonCancel: { type: String },
    shippingAddress: {
      fullName: { type: String },
      address: { type: String },
      city: { type: String },
      phone: { type: String }
    },
    paymentMethods: { type: Number, default: PAYMENT_TYPE.OFFLINE },
    status: { type: Number, default: STATUS_PURCHASE.WAIT_FOR_CONFIRMATION }
  },
  {
    timestamps: true
  }
)
const Purchase = mongoose.model('Purchase', PurchaseSchema)

module.exports = Purchase
