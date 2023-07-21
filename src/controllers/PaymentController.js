const https = require('https')
const Purchase = require('../models/PurchaseModel')
const { STATUS_PURCHASE } = require('../constants/purchase')
const { PAYMENT_TYPE } = require('../constants/payment')
const { momoPayment } = require('../utils/payment')

const MomoControllerPayment = async (req, res) => {
  const orderInfo = req.body.id
  const data = req.body.data
  const { options, requestBody } = await momoPayment(req)
  const reqs = https.request(options, (res) => {
    res.setEncoding('utf8')
    res.on('data', (body) => {
      return handleReturn(JSON.parse(body).payUrl)
    })
  })
  reqs.on('error', (e) => {
    console.log(`problem with request: ${e.message}`)
  })
  reqs.write(requestBody)
  reqs.end()
  var handleReturn = async (link) => {
    const purchases = []
    for (const item of data) {
      let purchase = await Purchase.findById(item._id).lean()
      if (!purchase) {
        return res.status(404).json({ message: 'Sản phẩm không tồn tại!' })
      }
      let data = await Purchase.findOneAndUpdate(
        {
          user: orderInfo,
          status: STATUS_PURCHASE.IN_CART,
          _id: item._id
        },
        {
          paymentMethods: PAYMENT_TYPE.ONLINE
        },
        {
          new: true
        }
      )
        .populate({
          path: 'product',
          populate: {
            path: 'category'
          }
        })
        .populate({
          path: 'user'
        })
        .lean()
      purchases.push(data)
    }
    const newData = { ...purchases, link }
    return res.status(200).json(newData)
  }
}

const PaypalController = async (req, res) => {
  return
}

module.exports = {
  MomoControllerPayment,
  PaypalController
}
