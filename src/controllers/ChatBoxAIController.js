const { STATUS } = require('../constants/status')
const { slugVietnamese } = require('../utils/utils')
const Product = require('../models/ProductModel')
const ChatBoxAI = require('../models/ChatBoxAIModel')

const question = async (req, res) => {
  const question = slugVietnamese(req.body.question)
  let response
  if (question.includes('dang hot') || question.includes('hot nhat')) {
    const limit = 3
    const sort_by = 'selled'
    const order = 'desc'
    let [products] = await Promise.all([
      Product.find({})
        .populate({ path: 'category' })
        .limit(limit)
        .sort({ [sort_by]: order === 'desc' ? -1 : 1 })
        .select({ __v: 0, description: 0 })
        .lean(),
      Product.find({}).countDocuments().lean()
    ])
    response = {
      message: 'Hiện tại đây là 3 sản phẩm bán chạy nhất trong shop:',
      dataProduct: products
    }
  } else if (question.includes('chao shop') || question.includes('chao ban')) {
    response = { message: 'Shop xin chào bạn, bạn cần hỗ trợ gì?' }
  } else if (question.includes('cach') || question.includes('lam sao') || question.includes('nhu the nao')) {
    if (question.includes('mua hang')) {
      if (question.includes('onl')) {
        response = {
          message: 'Để mình chỉ cho cách mua hàng online nhé:',
          dataText: [
            '1. Đầu tiên phải có sản phẩm trong giỏ hàng.',
            '2. Tiếp đến bấm chọn mua sản phẩm bạn muốn.',
            '3. Nhấn thanh toán.',
            '4. Ở phần thanh toán online lựa chọn phương thức bạn muốn, thanh toán xong như vậy là đã thành công rồi.',
            '5. Lưu ý hãy điền địa chỉ trước khi thanh toán nhé.'
          ]
        }
      } else {
        response = { message: 'để mình chỉ cho cách mua hàng nhé?' }
      }
    }
    if (question.includes('them hang')) {
      response = { message: 'Để mình chỉ cho cách thêm vào giỏ nhé?' }
    }
  } else if (question.includes('tra gop')) {
    response = { message: 'Hiện tại shop chưa hỗ trợ trả góp ạ!' }
  } else if (question.includes('cam on')) {
    response = { message: 'Không có gì đâu, đây là trách nhiệm của mình mà!' }
  } else {
    response = { message: 'Hiện tại mình chưa được lập trình để trả lời câu hỏi này!' }
  }
  return res.status(STATUS.OK).json(response)
}

const createResult = async (req, res) => {
  const { question, result } = req.body

  if ((question.length === 0, result === '')) {
    return res.status(400).json({ message: 'Chưa điền đủ thông tin!' })
  }

  const resultChat = await new ChatBoxAI({ result, includes: question }).save()
  const response = {
    message: 'Tạo mẫu câu trả lời thành công!',
    data: resultChat.toObject({
      transform: (doc, ret, option) => {
        delete ret.__v
        return ret
      }
    })
  }
  return res.status(200).json(response)
}

const getResults = async (req, res) => {
  try {
    const results = await ChatBoxAI.find({})
      .select({ __v: 0 })
      .sort({
        createdAt: -1
      })
      .lean()
    const response = {
      message: 'Lấy danh sách mẫu câu thành công!',
      data: results
    }
    return res.status(STATUS.OK).json(response)
  } catch (e) {
    return res.status(404).json({
      message: e
    })
  }
}

const getResult = async (req, res) => {
  const question = slugVietnamese(req.body.question)
  if (question.includes('dang hot') || question.includes('hot nhat')) {
    const limit = 3
    const sort_by = 'selled'
    const order = 'desc'
    let [products] = await Promise.all([
      Product.find({})
        .populate({ path: 'category' })
        .limit(limit)
        .sort({ [sort_by]: order === 'desc' ? -1 : 1 })
        .select({ __v: 0, description: 0 })
        .lean(),
      Product.find({}).countDocuments().lean()
    ])
    const response = {
      result: 'Hiện tại đây là 3 sản phẩm bán chạy nhất trong shop:',
      dataProduct: products
    }
    return res.status(STATUS.OK).json(response)
  }
  const result = await ChatBoxAI.findOne({ includes: question })
  if (result === null) {
    await new ChatBoxAI({ includes: [question] }).save()
    return res.status(STATUS.OK).json({
      result: 'Xin lỗi tôi chưa được lập trình để trả lời câu hỏi này!'
    })
  } else {
    const response = {
      result: result.result
    }
    return res.status(STATUS.OK).json(response)
  }
}

const updateResult = async (req, res) => {
  const id = req.params.id
  const data = req.body
  const checked = await ChatBoxAI.findOne({ _id: id })
  if (checked === null) {
    return res.status(404).json({
      message: 'Không tìm thấy kết quả!'
    })
  }
  const updatedResult = await ChatBoxAI.findByIdAndUpdate(id, data, { new: true })
  return res.status(200).json({
    message: 'Cập nhật thành công!',
    data: updatedResult
  })
}

const deleteResult = async (req, res) => {
  try {
    const id = req.params.id
    if (!id) {
      return res.status(404).json({
        message: 'Không tìm thấy kết quả!'
      })
    }
    await ChatBoxAI.findByIdAndDelete(id)
    return res.status(200).json({
      message: 'Đã xoá thành công!'
    })
  } catch (e) {
    return res.status(404).json({
      message: e
    })
  }
}

module.exports = {
  question,
  createResult,
  getResults,
  getResult,
  updateResult,
  deleteResult
}
