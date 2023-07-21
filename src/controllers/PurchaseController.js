const Product = require('../models/ProductModel')
const Purchase = require('../models/PurchaseModel')
const { STATUS_PURCHASE } = require('../constants/purchase')
const { PAYMENT_TYPE } = require('../constants/payment')
const { sendMail } = require('../utils/mailer')
const moment = require('moment')
const UserService = require('../services/UserService')

const addToCart = async (req, res) => {
  const { product_id, buy_count } = req.body
  const userPurchase = req.params.id
  const product = await Product.findById(product_id).lean()
  if (product) {
    if (buy_count > product.countInStock) {
      return res.status(404).json({ message: 'Số lượng vượt quá số lượng sản phẩm' })
    }
    const purchaseInDb = await Purchase.findOne({
      user: userPurchase,
      status: STATUS_PURCHASE.IN_CART,
      product: {
        _id: product_id
      }
    })
      .populate({
        path: 'product',
        populate: {
          path: 'category'
        }
      })
      .populate({
        path: 'user'
      })

    let data
    if (purchaseInDb) {
      data = await Purchase.findOneAndUpdate(
        {
          user: userPurchase,
          status: STATUS_PURCHASE.IN_CART,
          product: {
            _id: product_id
          }
        },
        {
          buy_count: purchaseInDb.buy_count + buy_count
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
    } else {
      const purchase = {
        user: userPurchase,
        product: product._id,
        buy_count: buy_count,
        price: product.price,
        discount: product.discount,
        price_before_discount: product.price_after_discount,
        status: STATUS_PURCHASE.IN_CART
      }
      const addedPurchase = await new Purchase(purchase).save()
      data = await Purchase.findById(addedPurchase._id)
        .populate({
          path: 'product',
          populate: {
            path: 'category'
          }
        })
        .populate({
          path: 'user'
        })
    }
    const response = {
      message: 'Thêm sản phẩm vào giỏ hàng thành công',
      data
    }
    return res.status(200).json(response)
  } else {
    return res.status(400).json({ message: 'Không tìm thấy sản phẩm' })
  }
}
const getPurchasesPaymentOnline = async (req, res) => {
  const user_id = req.params.id
  let condition = {
    user: user_id,
    paymentMethods: PAYMENT_TYPE.ONLINE,
    isPaid: false
  }
  let purchases = await Purchase.find(condition)
    .populate({
      path: 'product',
      populate: {
        path: 'category'
      }
    })
    .populate({
      path: 'user'
    })
    .sort({
      createdAt: -1
    })
    .lean()
  const response = {
    message: 'Lấy đơn mua thành công',
    data: purchases
  }
  return res.status(200).json(response)
}
const getPurchases = async (req, res) => {
  const { status = STATUS_PURCHASE.ALL } = req.body
  const user_id = req.params.id
  let condition = {
    user: user_id,
    status: {
      $ne: STATUS_PURCHASE.IN_CART
    }
  }
  if (Number(status) !== STATUS_PURCHASE.ALL) {
    condition.status = status
  }

  let purchases = await Purchase.find(condition)
    .populate({
      path: 'product',
      populate: {
        path: 'category'
      }
    })
    .populate({
      path: 'user'
    })
    .sort({
      createdAt: -1
    })
    .lean()
  const response = {
    message: 'Lấy đơn mua thành công',
    data: purchases
  }
  return res.status(200).json(response)
}
const updatePurchase = async (req, res) => {
  const { product_id, buy_count } = req.body
  const userId = req.params.id
  const purchaseInDb = await Purchase.findOne({
    user: userId,
    status: STATUS_PURCHASE.IN_CART,
    product: {
      _id: product_id
    }
  })
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
  if (purchaseInDb) {
    if (buy_count > purchaseInDb.product.countInStock) {
      return res.status(404).json({ message: 'Số lượng vượt quá số lượng sản phẩm' })
    }
    const data = await Purchase.findOneAndUpdate(
      {
        user: userId,
        status: STATUS_PURCHASE.IN_CART,
        product: {
          _id: product_id
        }
      },
      {
        buy_count
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
    const response = {
      message: 'Cập nhật đơn thành công',
      data
    }
    return res.status(200).json(response)
  } else {
    return res.status(404).json({ message: 'Không tìm thấy đơn' })
  }
}
const buyProducts = async (req, res) => {
  const { shippingAddress } = req.body
  const purchases = []
  const userId = req.params.id
  const paymentMethodss = req.body.paymentMethods
  for (const item of req.body.body) {
    let product = await Product.findById(item.product_id).lean()
    if (product) {
      if (item.buy_count > product.countInStock) {
        return res.status(404).json({ message: 'Số lượng mua vượt quá số lượng sản phẩm' })
      } else {
        await Product.findByIdAndUpdate(
          product._id,
          {
            countInStock: Number(product.countInStock) - Number(item.buy_count),
            selled: Number(product.selled) + Number(item.buy_count)
          },
          {
            new: true
          }
        )

        let data = await Purchase.findOneAndUpdate(
          {
            user: userId,
            status: STATUS_PURCHASE.IN_CART,
            product: {
              _id: item.product_id
            }
          },
          {
            buy_count: item.buy_count,
            status: STATUS_PURCHASE.WAIT_FOR_CONFIRMATION,
            isPaid: paymentMethodss === 1 ? true : false,
            shippingAddress: {
              fullName: shippingAddress.fullName,
              address: shippingAddress.address,
              city: shippingAddress.city,
              phone: shippingAddress.phone
            }
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
        if (!data) {
          const purchase = {
            user: userId,
            product: item.product_id,
            buy_count: item.buy_count,
            price: product.price,
            price_before_discount: product.price_after_discount,
            shippingAddress: {
              fullName: shippingAddress.fullName,
              address: shippingAddress.address,
              city: shippingAddress.city,
              phone: Number(shippingAddress.phone)
            },
            status: STATUS_PURCHASE.WAIT_FOR_CONFIRMATION,
            isPaid: paymentMethodss === 1 ? true : false
          }
          const addedPurchase = await new Purchase(purchase).save()
          data = await Purchase.findById(addedPurchase._id)
            .populate({
              path: 'product',
              populate: {
                path: 'category'
              }
            })
            .populate({
              path: 'user'
            })
        }
        purchases.push(data)
      }
    } else {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm' })
    }
  }
  const response = {
    message: 'Mua thành công',
    data: purchases
  }
  return res.status(200).json(response)
}
const changeStatusPurchase = async (req, res) => {
  const { product_id, purchase_id, status, on_done } = req.body
  const purchaseInDb = await Purchase.findOne({
    purchase_id: purchase_id,
    product: {
      _id: product_id
    }
  })
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

  if (purchaseInDb) {
    const updatedProduct = await Purchase.findByIdAndUpdate(
      purchase_id,
      {
        status: status,
        isPaid: on_done
      },
      { new: true }
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
    if (status === STATUS_PURCHASE.WAIT_FOR_GETTING) {
      const FormatNumber = (number) => {
        const newNumber = new Intl.NumberFormat('de-DE').format(number)
        return newNumber
      }
      const description = `${purchaseInDb.buy_count} chiếc ${purchaseInDb.product.name}, tổng số tiền là ${FormatNumber(
        purchaseInDb.product.price_after_discount * purchaseInDb.buy_count
      )}đ.`
      const text = 'Đã gửi đơn hàng:'
      const subject = 'Thông báo gửi hàng'
      const email = purchaseInDb.user.email.replace('google', '')
      sendMail(description, email, subject, text)
    }
    const response = {
      data: updatedProduct
    }
    return res.status(200).json(response)
  } else {
    return res.status(404).json({ message: 'Không tìm thấy đơn' })
  }
}
const cancelBuyProduct = async (req, res) => {
  const { reason, purchase_id } = req.body
  if (!reason) {
    return res.status(404).json({ message: 'Chưa chọn lý do!' })
  }
  const purchaseInDb = await Purchase.findOne({
    _id: purchase_id
  }).lean()

  if (!purchaseInDb) {
    return res.status(404).json({ message: 'Đơn hàng chưa được xác định!' })
  }
  if (purchaseInDb.status === 1) {
    const updatedProduct = await Purchase.findByIdAndUpdate(
      purchase_id,
      {
        status: 5,
        reasonCancel: reason
      },
      { new: true }
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
    const response = {
      data: updatedProduct
    }
    return res.status(200).json(response)
  } else {
    return res.status(404).json({ message: 'Đơn hàng đang gửi không thể hoàn tác.' })
  }
}
const deletePurchases = async (req, res) => {
  const purchase_ids = req.body
  const user_id = req.params.id
  const deletedData = await Purchase.deleteMany({
    user: user_id,
    status: STATUS_PURCHASE.IN_CART,
    _id: { $in: purchase_ids }
  })
  const response = {
    message: `Xoá ${deletedData.deletedCount} đơn thành công`,
    data: { deleted_count: deletedData.deletedCount }
  }
  return res.status(200).json(response)
}

const getAllPurchases = async (req, res) => {
  const allPurchase = await Purchase.find({})
    .populate({
      path: 'product',
      populate: {
        path: 'category'
      }
    })
    .populate({
      path: 'user'
    })
  const response = {
    message: 'Lấy tất cả đơn thành công!',
    data: allPurchase
  }
  return res.status(200).json(response)
}

const getUserSupend = async (req, res) => {
  let condition = {
    status: {
      $ne: STATUS_PURCHASE.IN_CART
    }
  }
  let purchases = await Purchase.find(condition)
    .populate({
      path: 'user'
    })
    .sort({
      createdAt: -1
    })
    .lean()

  const data = purchases.map((item) => {
    return {
      name: item.user.name,
      isPaid: item.isPaid,
      price: item.price_before_discount,
      buy_count: item.buy_count
    }
  })

  const filteredArr = data.filter((item) => item.isPaid === true)

  const reducedArr = filteredArr.reduce((acc, item) => {
    if (!acc[item.name]) {
      acc[item.name] = { name: item.name, price: item.price, buy_count: item.buy_count }
    } else {
      acc[item.name].price += item.price
      acc[item.name].buy_count += item.buy_count
    }
    return acc
  }, {})

  const resultArr = Object.values(reducedArr)
    .map((item) => {
      return {
        name: item.name,
        price: item.price,
        buy_count: item.buy_count
      }
    })
    .sort(function (a, b) {
      return b.price - a.price
    })
  res.status(200).json(resultArr)
}

const getMoneyWeek = async (req, res) => {
  const today = new Date()
  const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)

  const weekDays = []
  for (let i = 0; i < 7; i++) {
    const date = new Date(lastWeek.getTime() + i * 24 * 60 * 60 * 1000)
    const dateString = date.toISOString().slice(0, 10)
    weekDays.push(dateString)
  }

  const sales = await Purchase.aggregate([
    {
      $match: {
        createdAt: { $gte: lastWeek, $lte: today },
        isPaid: true
      }
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        price: {
          $sum: {
            $multiply: ['$price_before_discount', '$buy_count']
          }
        }
      }
    }
  ])

  const salesByDay = {}
  sales.forEach((sale) => {
    salesByDay[sale._id] = sale.price
  })

  const result = weekDays.map((day) => ({
    _id: day,
    price: salesByDay[day] || 0
  }))
  return res.status(200).json({ message: 'Thành công!', data: result })
}

module.exports = {
  addToCart,
  getPurchases,
  updatePurchase,
  buyProducts,
  changeStatusPurchase,
  deletePurchases,
  getAllPurchases,
  getPurchasesPaymentOnline,
  cancelBuyProduct,
  getUserSupend,
  getMoneyWeek
}
