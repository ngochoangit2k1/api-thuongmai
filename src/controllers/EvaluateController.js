const { STATUS } = require('../constants/status')
const Evaluate = require('../models/EvaluateModel')
const Product = require('../models/ProductModel')
const Purchase = require('../models/PurchaseModel')

const createEvaluate = async (req, res) => {
  const { comment, image, product_id, rating } = req.body
  const user_id = req.params.id
  const evaluate = await new Evaluate({ comment, image, product: product_id, user: user_id, rating }).save()
  let product = await Product.findById(product_id).lean()
  if (product) {
    let dataPurchase = await Purchase.findOneAndUpdate(
      {
        product: product_id
      },
      {
        isEvaluate: true
      },
      {
        new: true
      }
    )
    let dataProduct = await Product.findByIdAndUpdate(
      product_id,
      {
        rating: product.rating === 0 ? rating : Math.ceil(product.rating + rating) / 2,
        rating_count: product.rating_count + 1
      },
      {
        new: true
      }
    )
      .populate({
        path: 'category'
      })

      .lean()
  } else {
    return res.status(404).json({
      message: 'Không tìm thấy sản phẩm'
    })
  }
  const response = {
    message: 'Tạo đánh giá thành công!',
    data: evaluate.toObject({
      transform: (doc, ret, option) => {
        delete ret.__v
        return ret
      }
    })
  }
  return res.status(STATUS.OK).json(response)
}
const updateEvaluate = async (req, res) => {
  const user_id = req.params.id
  const { product_id, comment, rating, image } = req.body
  let commentDb = await Evaluate.findOne({
    user: user_id,
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
  if (commentDb) {
    const data = await Evaluate.findOneAndUpdate(
      {
        user: user_id,
        product: {
          _id: product_id
        }
      },
      {
        comment,
        rating,
        image
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
      message: 'Sửa đánh giá thành công!',
      data
    }
    return res.status(200).json(response)
  } else {
    return res.status(404).json({ message: 'Không tìm thấy đánh giá!' })
  }
}
const getEvaluateByProduct = async (req, res) => {
  const product_id = req.params.id
  let evaluates = await Evaluate.find({ product: product_id })
    .populate({
      path: 'user'
    })
    .sort({
      createdAt: -1
    })
    .lean()
  const response = {
    message: 'Lấy bình luận thành công',
    data: evaluates
  }
  return res.status(200).json(response)
}
module.exports = {
  createEvaluate,
  updateEvaluate,
  getEvaluateByProduct
}
