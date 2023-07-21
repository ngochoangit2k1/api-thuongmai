const Product = require('../models/ProductModel')
const { SORT_BY, ORDER } = require('../constants/product')

const createProduct = (newProduct, images) => {
  return new Promise(async (resolve, reject) => {
    const { name, selled, rating, countInStock, price, description, discount, category } = newProduct
    const price_after_discount = Math.ceil((price - (price * discount) / 100) / 1000) * 1000
    try {
      const product = {
        name,
        image: images,
        selled,
        rating,
        countInStock,
        price,
        price_after_discount,
        description,
        discount,
        category
      }
      const ProductAdd = await new Product(product).save()
      if (ProductAdd) {
        resolve({
          status: 'OK',
          message: 'SUCCESS',
          data: ProductAdd
        })
      }
    } catch (e) {
      reject(e)
    }
  })
}

const updateProduct = (id, data, images) => {
  return new Promise(async (resolve, reject) => {
    try {
      const checkProduct = await Product.findOne({
        _id: id
      })
      if (checkProduct === null) {
        resolve({
          status: 'ERR',
          message: 'Sản phẩm không được xác định!'
        })
      }
      const price_after_discount =
        Math.ceil((checkProduct.price - (checkProduct.price * checkProduct.discount) / 100) / 1000) * 1000
      let newData
      if (!data.image) {
        newData = { ...data, price_after_discount: price_after_discount, image: images }
      } else {
        const newImage = data.image.split(',')
        newData = { ...data, price_after_discount: price_after_discount, image: newImage }
      }
      const updatedProduct = await Product.findByIdAndUpdate(id, newData, { new: true })
      resolve({
        status: 'OK',
        message: 'SUCCESS',
        data: updatedProduct
      })
    } catch (e) {
      reject(e)
    }
  })
}
const changeCountInStock = (id, buy_count) => {
  try {
    const checkProduct = Product.findOne({
      _id: id
    })
    Product.findByIdAndUpdate(
      id,
      {
        countInStock: checkProduct.countInStock - buy_count,
        selled: checkProduct.selled + buy_count
      },
      { new: true }
    )
  } catch (e) {
    console.log(e)
  }
}

const deleteProduct = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const checkProduct = await Product.findOne({
        _id: id
      })
      if (checkProduct === null) {
        resolve({
          status: 'ERR',
          message: 'The product is not defined'
        })
      }

      await Product.findByIdAndDelete(id)
      resolve({
        status: 'OK',
        message: 'Delete product success'
      })
    } catch (e) {
      reject(e)
    }
  })
}

const deleteManyProduct = (ids) => {
  return new Promise(async (resolve, reject) => {
    try {
      await Product.deleteMany({ _id: ids })
      resolve({
        status: 'OK',
        message: 'Delete product success'
      })
    } catch (e) {
      reject(e)
    }
  })
}

const getDetailsProduct = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const product = await Product.findOne({
        _id: id
      })
      if (product === null) {
        resolve({
          status: 'ERR',
          message: 'The product is not defined'
        })
      }

      resolve({
        status: 'OK',
        message: 'SUCESS',
        data: product
      })
    } catch (e) {
      reject(e)
    }
  })
}

const getAllProduct = (limit, page, category, sort_by, order, rating_filter, name, price_max, price_min) => {
  return new Promise(async (resolve, reject) => {
    try {
      let condition = {}
      if (category) {
        condition.category = category
      }
      if (rating_filter) {
        condition.rating = { $gte: rating_filter }
      }
      if (price_max) {
        condition.price_after_discount = {
          $lte: price_max
        }
      }
      if (price_min) {
        condition.price_after_discount = condition.price_after_discount
          ? { ...condition.price_after_discount, $gte: price_min }
          : { $gte: price_min }
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
          .populate({ path: 'category' })
          .skip(page * limit - limit)
          .limit(limit)
          .sort({ [sort_by]: order === 'desc' ? -1 : 1 })
          .select({ __v: 0, description: 0 })
          .lean(),
        Product.find(condition).countDocuments().lean()
      ])
      const totalPage = Math.ceil(totalProducts / limit) || 1
      resolve({
        status: 'OK',
        message: 'Success',
        data: products,
        total: totalProduct,
        pageCurrent: page,
        totalPage: totalPage
      })
    } catch (e) {
      reject(e)
    }
  })
}

module.exports = {
  createProduct,
  updateProduct,
  getDetailsProduct,
  deleteProduct,
  getAllProduct,
  deleteManyProduct,
  changeCountInStock
}
