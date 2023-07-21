const UserService = require('../services/UserService')
const JwtService = require('../services/JwtService')
const Otp = require('../models/OtpModel')
const User = require('../models/UserModel')
const { sendMail } = require('../utils/mailer')
const bcrypt = require('bcrypt')
const { STATUS } = require('../constants/status')
const { google } = require('googleapis')
const { OAuth2 } = google.auth
const client = new OAuth2(process.env.CLIENT_ID)

const sendOtp = async (req, res) => {
  try {
    const { email } = req.body
    const OTP = Math.floor(1000 + Math.random() * 9000)
    if (!email) {
      return res.status(400).json({
        status: 'ERR',
        message: 'The input is required'
      })
    }
    const existEmail = await Otp.findOne({ email: email })
    const subject = 'Sending Eamil For Otp Validation'
    const text = 'OTP:-'
    if (existEmail) {
      const response = await Otp.findByIdAndUpdate(
        { _id: existEmail._id },
        {
          otp: OTP
        },
        { new: true }
      )

      sendMail(OTP, email, subject, text)
      return res.status(200).json(response)
    } else if (!existEmail) {
      const newOtp = {
        email,
        otp: OTP
      }
      const response = await new Otp(newOtp).save()
      setTimeout(() => {
        Otp.deleteMany({ expiresAt: { $lt: new Date() } }).exec()
      }, 60000)
      sendMail(OTP, email, subject, text)
      return res.status(200).json(response)
    }
  } catch (error) {
    return res.status(404).json({
      message: error
    })
  }
}

const getUserOtpTimer = async (req, res) => {
  const { user_email } = req.body
  const otpData = await Otp.findOne({ email: user_email })
  let priviceTime = 61
  if (otpData !== null) {
    const tempTime = (new Date() - otpData.expiresAt) / 1000
    const elseTime = priviceTime - tempTime

    priviceTime = elseTime
    if (elseTime <= 0) {
      return res.status(400).json({ timer: 0 })
    }
    return res.status(200).json({ timer: priviceTime })
  }
  return res.status(200).json({ timer: 0 })
}

const deleteOtp = async (req, res) => {
  const otp = await Otp.findOneAndDelete({ email: req.params.id })
  return res.status(400).json({ message: 'Đã xoá!' })
}

const userResetPassword = async (req, res) => {
  const { email, otp, password } = req.body
  const checkUser = await User.findOne({
    email: email
  })
  if (checkUser === null) {
    return res.status(400).json({ message: 'Email chưa được đăng kí!' })
  }
  const checkOtp = await Otp.findOne({
    email: email,
    otp: otp
  })
  if (checkOtp === null) {
    return res.status(400).json({ message: 'OTP không chính xác hoặc đã hết hạn!' })
  }
  if (checkUser !== null && checkOtp !== null) {
    const response = await UserService.userResetPassword(email, password)
    return res.status(200).json(response)
  }
}

const changePassword = async (req, res) => {
  const { email, password, new_password } = req.body
  if (password === new_password) {
    return res.status(404).json({ message: 'Mật khẩu mới không được trùng với mật khẩu cũ!' })
  }
  const checkUser = await User.findOne({
    email: email
  })
  if (checkUser === null) {
    return res.status(STATUS.BAD_REQUEST).json({ message: 'Người dùng không đúng!' })
  }
  const comparePassword = bcrypt.compareSync(password, checkUser.password)
  if (!comparePassword) {
    return res.status(STATUS.BAD_REQUEST).json({ message: 'Xác nhận mật khẩu chưa chính xác!' })
  }
  if (checkUser !== null && comparePassword) {
    const hash = bcrypt.hashSync(new_password, 10)
    const updatedUser = await User.findOneAndUpdate(
      { email: email },
      {
        password: hash
      },
      { new: true }
    )
    return res.status(STATUS.OK).json({
      message: 'Đổi mật khẩu thành công!',
      data: updatedUser
    })
  }
}

const createUser = async (req, res) => {
  try {
    const { email, password, confirmPassword } = req.body
    const reg = /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/
    const isCheckEmail = reg.test(email)
    if (!email || !password || !confirmPassword) {
      return res.status(200).json({
        status: 'ERR',
        message: 'Chưa đúng định dạng email!'
      })
    } else if (!isCheckEmail) {
      return res.status(200).json({
        status: 'ERR',
        message: 'Chưa đúng định dạng email!'
      })
    } else if (password !== confirmPassword) {
      return res.status(200).json({
        status: 'ERR',
        message: 'Nhập lại mật khẩu không khớp!'
      })
    }
    const response = await UserService.createUser(req.body)
    return res.status(200).json(response)
  } catch (e) {
    return res.status(404).json({
      message: e
    })
  }
}

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body
    const reg = /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/
    const isCheckEmail = reg.test(email)
    if (!password || password.length === 0) {
      return res.status(200).json({
        status: 'ERR',
        message: 'Chưa nhập mật khẩu!'
      })
    }
    if (!email || !password) {
      return res.status(200).json({
        status: 'ERR',
        message: 'Chưa nhập email!'
      })
    } else if (!isCheckEmail) {
      return res.status(200).json({
        status: 'ERR',
        message: 'Chưa đúng định dạng email!'
      })
    }
    const response = await UserService.loginUser(req.body)

    res.cookie('refresh_token', response.refresh_token, {
      maxAge: 60 * 60 * 24,
      secure: true,
      sameSite: 'strict',
      path: 'http://localhost:5000/api'
    })
    return res.status(200).json(response)
  } catch (e) {
    return res.status(404).json({
      message: 'Something wrong'
    })
  }
}

const googleLogin = async (req, res) => {
  const { tokenId } = req.body

  const verify = await client.verifyIdToken({
    idToken: tokenId,
    audience: process.env.CLIENT_ID
  })
  const { family_name, given_name, email, picture } = verify.payload

  const password = email + process.env.CLIENT_ID
  const passwordHash = bcrypt.hashSync(password, 10)

  const user = await User.findOne({
    email: email + 'google',
    type: 'google'
  })
  if (user === null) {
    const createdUser = await User.create({
      name: family_name + ' ' + given_name,
      email: email + 'google',
      type: 'google',
      avatar: picture,
      password: passwordHash
    })
    const access_token = await JwtService.genneralAccessToken({
      id: createdUser._id,
      role: createdUser.role
    })
    const refresh_token = await JwtService.genneralRefreshToken({
      id: createdUser._id,
      role: createdUser.role
    })
    const newUser = {
      _id: createdUser._id,
      name: createdUser.name,
      email: createdUser.email.replace('google', ''),
      avatar: createdUser.avatar,
      role: createdUser.role,
      type: createdUser.type
    }
    return res.status(200).json({
      message: 'Đăng nhập thành công!',
      access_token,
      refresh_token,
      status: 'OK',
      data: newUser
    })
  } else {
    const isMatch = bcrypt.compareSync(password, user.password)
    if (!isMatch) {
      return res.status(400).json({ msg: 'Mật khẩu chưa đúng' })
    }
    const access_token = await JwtService.genneralAccessToken({
      id: user._id,
      role: user.role
    })
    const refresh_token = await JwtService.genneralRefreshToken({
      id: user._id,
      role: user.role
    })
    const newUser = {
      _id: user._id,
      name: user.name,
      email: user.email.replace('google', ''),
      avatar: user.avatar,
      role: user.role,
      type: user.type
    }

    return res.status(200).json({
      message: 'Đăng nhập thành công!',
      access_token,
      refresh_token,
      status: 'OK',
      data: newUser
    })
  }
}

const updateUser = async (req, res) => {
  try {
    const userId = req.params.id
    const data = req.body
    if (!userId) {
      return res.status(200).json({
        status: 'ERR',
        message: 'The userId is required'
      })
    }
    const response = await UserService.updateUser(userId, data)
    return res.status(200).json(response)
  } catch (e) {
    return res.status(404).json({
      message: e
    })
  }
}

const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id
    if (!userId) {
      return res.status(200).json({
        status: 'ERR',
        message: 'The userId is required'
      })
    }
    const response = await UserService.deleteUser(userId)
    return res.status(200).json(response)
  } catch (e) {
    return res.status(404).json({
      message: e
    })
  }
}

const getAllUser = async (req, res) => {
  try {
    const response = await UserService.getAllUser()
    return res.status(200).json(response)
  } catch (e) {
    return res.status(404).json({
      message: e
    })
  }
}

const getDetailsUser = async (req, res) => {
  try {
    const userId = req.params.id
    if (!userId) {
      return res.status(200).json({
        status: 'ERR',
        message: 'The userId is required'
      })
    }
    const response = await UserService.getDetailsUser(userId)
    return res.status(200).json(response)
  } catch (e) {
    return res.status(404).json({
      message: e
    })
  }
}

const refreshToken = async (req, res) => {
  try {
    const token = req.body.refresh_token
    if (!token) {
      return res.status(200).json({
        status: 'ERR',
        message: 'The token is required'
      })
    }
    const response = await JwtService.refreshTokenJwtService(token)
    return res.status(200).json(response)
  } catch (e) {
    return res.status(404).json({
      message: e
    })
  }
}

const logoutUser = async (req, res) => {
  try {
    res.clearCookie('refresh_token')
    return res.status(200).json({
      status: 'OK',
      message: 'Logout successfully'
    })
  } catch (e) {
    return res.status(404).json({
      message: e
    })
  }
}
module.exports = {
  createUser,
  loginUser,
  updateUser,
  deleteUser,
  getAllUser,
  getDetailsUser,
  refreshToken,
  logoutUser,
  sendOtp,
  userResetPassword,
  changePassword,
  deleteOtp,
  getUserOtpTimer,
  googleLogin
}
