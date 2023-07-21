const User = require('../models/UserModel')
const bcrypt = require('bcrypt')
const { genneralAccessToken, genneralRefreshToken } = require('./JwtService')
const Otp = require('../models/OtpModel')
const createUser = (newUser) => {
  return new Promise(async (resolve, reject) => {
    const { name, email, password, phone, otp } = newUser
    try {
      const checkUser = await User.findOne({
        email: email
      })
      if (checkUser !== null) {
        resolve({
          status: 'ERR',
          message: 'Email đã tồn tại!'
        })
      }

      const checkOtp = await Otp.findOne({
        otp: otp,
        email: email
      })
      // const compareOtp = bcrypt.compareSync(otp, checkOtp.otp)
      if (checkOtp === null) {
        reject({ message: 'OTP Không chính xác hoặc đã quá hạn!' })
      } else {
        const hash = bcrypt.hashSync(password, 10)
        const createdUser = await User.create({
          name,
          email,
          password: hash,
          phone
        })
        if (createdUser) {
          resolve({
            status: 'OK',
            message: 'SUCCESS',
            data: createdUser
          })
        }
      }
    } catch (e) {
      reject(e)
    }
  })
}

const loginUser = (userLogin) => {
  return new Promise(async (resolve, reject) => {
    const { email, password } = userLogin
    try {
      const checkUser = await User.findOne({
        email: email
      })
      if (checkUser === null) {
        resolve({
          status: 'ERR',
          message: 'Người dùng không được xác định!'
        })
      }
      const comparePassword = bcrypt.compareSync(password, checkUser.password)
      if (!comparePassword) {
        resolve({
          status: 'ERR',
          message: 'Mật khẩu hoặc người dùng không chính xác!'
        })
      }
      const access_token = await genneralAccessToken({
        id: checkUser._id,
        role: checkUser.role
      })

      const refresh_token = await genneralRefreshToken({
        id: checkUser._id,
        role: checkUser.role
      })

      if (checkUser !== null && comparePassword) {
        resolve({
          status: 'OK',
          message: 'SUCCESS',
          access_token,
          refresh_token,
          data: checkUser
        })
      }
    } catch (e) {
      reject(e)
    }
  })
}

const userResetPassword = (email, password) => {
  return new Promise(async (resolve, reject) => {
    try {
      const checkUser = await User.findOne({
        email: email
      })
      if (checkUser === null) {
        resolve({
          status: 'ERR',
          message: 'Người dùng không được xác định!'
        })
      }

      const hash = bcrypt.hashSync(password, 10)

      const updatedUser = await User.findOneAndUpdate(
        { email: email },
        {
          password: hash
        },
        { new: true }
      )
      resolve({
        status: 'OK',
        message: 'SUCCESS',
        data: updatedUser
      })
    } catch (e) {
      reject(e)
    }
  })
}

const updateUser = (id, data) => {
  return new Promise(async (resolve, reject) => {
    try {
      const checkUser = await User.findOne({
        _id: id
      })
      if (checkUser === null) {
        resolve({
          status: 'ERR',
          message: 'Người dùng không được xác định!'
        })
      }
      const { password, newPassword } = data
      if (password && newPassword) {
        const comparePassword = bcrypt.compareSync(password, checkUser.password)
        if (!comparePassword) {
          resolve({
            status: 'ERR',
            message: 'Mật khẩu cũ không chính xác!'
          })
        }
        const hash = bcrypt.hashSync(newPassword, 10)
        const updatedUser = await User.findByIdAndUpdate(id, { password: hash }, { new: true })
        resolve({
          status: 'OK',
          message: 'SUCCESS',
          data: updatedUser
        })
      }
      const updatedUser = await User.findByIdAndUpdate(id, data, { new: true })
      resolve({
        status: 'OK',
        message: 'SUCCESS',
        data: updatedUser
      })
    } catch (e) {
      reject(e)
    }
  })
}

const deleteUser = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const checkUser = await User.findOne({
        _id: id
      })
      if (checkUser === null) {
        resolve({
          status: 'ERR',
          message: 'Người dùng không được xác định!'
        })
      }

      await User.findByIdAndDelete(id)
      resolve({
        status: 'OK',
        message: 'Xoá tài khoản thành công!'
      })
    } catch (e) {
      reject(e)
    }
  })
}

const getAllUser = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const allUser = await User.find()
      resolve({
        status: 'OK',
        message: 'Success',
        data: allUser
      })
    } catch (e) {
      reject(e)
    }
  })
}
const getDetailsUser = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const user = await User.findOne({
        _id: id
      })
      if (user === null) {
        resolve({
          status: 'ERR',
          message: 'Người dùng không được xác định!'
        })
      }
      resolve({
        status: 'OK',
        message: 'SUCESS',
        data: user
      })
    } catch (e) {
      reject(e)
    }
  })
}
module.exports = {
  createUser,
  loginUser,
  updateUser,
  deleteUser,
  getAllUser,
  getDetailsUser,
  userResetPassword
}
