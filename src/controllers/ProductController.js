const { SORT_BY, ORDER } = require('../constants/product')
const Product = require('../models/ProductModel')
const ProductService = require('../services/ProductService')

const createProduct = async (req, res) => {
  try {
    const { name, countInStock, price } = req.body
    const images = req.files.map((file) => file.path)
    if (!name || !countInStock || !price) {
      return res.status(200).json({
        status: 'ERR',
        message: 'The input is required'
      })
    }
    const response = await ProductService.createProduct(req.body, images)
    return res.status(200).json(response)
  } catch (e) {
    return res.status(404).json({
      message: e
    })
  }
}

const updateProduct = async (req, res) => {
  try {
    const productId = req.params.id
    const images = req.files.map((file) => file.path)
    const data = req.body
    // console.log(req.body.image)
    if (!productId) {
      return res.status(200).json({
        status: 'ERR',
        message: 'Không tìm thấy sản phẩm!'
      })
    }
    const response = await ProductService.updateProduct(productId, data, images)
    return res.status(200).json(response)
  } catch (e) {
    return res.status(404).json({
      message: e
    })
  }
}

const getDetailsProduct = async (req, res) => {
  try {
    const productId = req.params.id
    if (!productId) {
      return res.status(200).json({
        status: 'ERR',
        message: 'The productId is required'
      })
    }
    const response = await ProductService.getDetailsProduct(productId)
    return res.status(200).json(response)
  } catch (e) {
    return res.status(404).json({
      message: e
    })
  }
}

const getProduct = async (req, res) => {
  let condition = { _id: req.params.id }
  const productDB = await Product.findOneAndUpdate(condition, { $inc: { view: 1 } }, { new: true })
    .populate('category')
    .select({ __v: 0 })
    .lean()
  if (productDB) {
    const response = {
      message: 'Lấy sản phẩm thành công',
      data: productDB
    }
    return res.status(200).json(response)
  } else {
    return res.status(200).json({ message: 'Không tìm thấy sản phẩm' })
  }
}

const deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id
    if (!productId) {
      return res.status(200).json({
        status: 'ERR',
        message: 'The productId is required'
      })
    }
    const response = await ProductService.deleteProduct(productId)
    return res.status(200).json(response)
  } catch (e) {
    return res.status(404).json({
      message: e
    })
  }
}

const deleteMany = async (req, res) => {
  try {
    const ids = req.body.ids
    if (!ids) {
      return res.status(200).json({
        status: 'ERR',
        message: 'The ids is required'
      })
    }
    const response = await ProductService.deleteManyProduct(ids)
    return res.status(200).json(response)
  } catch (e) {
    return res.status(404).json({
      message: e
    })
  }
}

const getAllProduct = async (req, res) => {
  try {
    let { page = 1, limit = 30, category, sort_by, order, rating_filter, name, price_max, price_min } = req.query
    page = Number(page)
    limit = Number(limit)
    const response = await ProductService.getAllProduct(
      Number(limit) || 8,
      Number(page) || 1,
      category,
      sort_by,
      order,
      rating_filter,
      name,
      price_max,
      price_min
    )
    return res.status(200).json(response)
  } catch (e) {
    return res.status(404).json({
      message: e
    })
  }
}

const getProducts = async (req, res) => {
  let { page = 1, limit = 30, sort_by, order, rating_filter, name, price_max, price_min } = req.query
  page = Number(page)
  limit = Number(limit)
  let condition = {}
  if (rating_filter) {
    condition.rating = { $gte: rating_filter }
  }
  if (price_max) {
    condition.price = {
      $lte: price_max
    }
  }
  if (price_min) {
    condition.price = condition.price ? { ...condition.price, $gte: price_min } : { $gte: price_min }
  }
  if (!ORDER.includes(order)) {
    order = ORDER[0]
  }
  if (!SORT_BY.includes(sort_by)) {
    sort_by = SORT_BY[0]
  }

  if (name) {
    condition.name = {
      $regex: name,
      $options: 'i'
    }
  }
  const totalProduct = await Product.count()
  let [products, totalProducts] = await Promise.all([
    Product.find(condition)
      .sort({ [sort_by]: order === 'desc' ? -1 : 1 })
      .skip(page * limit - limit)
      .limit(limit)
      .select({ __v: 0, description: 0 })
      .lean(),
    Product.find(condition).countDocuments().lean()
  ])
  const page_size = Math.ceil(totalProducts / limit) || 1
  const response = {
    status: 'OK',
    message: 'Success',
    data: products,
    total: totalProduct,
    pageCurrent: page,
    totalPage: page_size
  }
  return res.status(200).json(response)
}

const evaluateProduct = async (req, res) => {
  const { product_id, rating } = req.body
  const productDb = await Product.findOne({
    _id: product_id
  }).lean()
  if (productDb) {
    if (rating > 5 || rating < 1) {
      return res.status(404).json({ message: 'Đánh giá không hợp lệ!' })
    }

    const dataDb = await Product.findByIdAndUpdate(
      product_id,
      {
        rating: (productDb.rating === 0 ? rating : (productDb.rating + rating) / 2).toFixed(0),
        rating_count: productDb.rating_count + 1
      },
      {
        new: true
      }
    ).lean()
    const response = {
      message: 'Đánh giá sản phẩm thành công!',
      data: dataDb
    }
    return res.status(200).json(response)
  } else {
    return res.status(404).json({ message: 'Không tìm thấy sản phẩm!' })
  }
}

module.exports = {
  createProduct,
  updateProduct,
  getDetailsProduct,
  deleteProduct,
  getAllProduct,
  deleteMany,
  getProducts,
  getProduct,
  evaluateProduct
}
