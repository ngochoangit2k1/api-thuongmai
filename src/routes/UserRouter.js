const express = require('express')
const router = express.Router()
const userController = require('../controllers/UserController')
const { authMiddleWare, authUserMiddleWare } = require('../middleware/authMiddleware')
const dotenv = require('dotenv')
dotenv.config()
const multer = require('multer')
const cloudinary = require('cloudinary').v2
const { CloudinaryStorage } = require('multer-storage-cloudinary')
cloudinary.config({
  cloud_name: 'nguyen-thanh-binh',
  api_key: '318967141365768',
  api_secret: 'KnqWhCehiN4oQ00-0-kw2poeRyQ'
})

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'shop-app',
    allowed_formats: ['png', 'jpeg', 'jpg', 'gif', 'jpeg']
  }
})

const upload = multer({
  storage: storage,
  limits: { fileSize: 1000000 },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now())
  },
  dest: 'uploads/'
})

router.post('/sign-up', userController.createUser)
router.post('/send-otp', userController.sendOtp)
router.delete('/delete-otp/:id', userController.deleteOtp)
router.put('/reset-password', userController.userResetPassword)
router.put('/change-password', userController.changePassword)
router.post('/sign-in', userController.loginUser)
router.post('/google-login', userController.googleLogin)
router.post('/log-out', userController.logoutUser)
router.put('/update-user/:id', authUserMiddleWare, userController.updateUser)
router.delete('/delete-user/:id', authMiddleWare, userController.deleteUser)
router.get('/getAll', authMiddleWare, userController.getAllUser)
router.get('/get-details/:id', authUserMiddleWare, userController.getDetailsUser)
router.post('/refresh-token', userController.refreshToken)
router.post('/get-otp-timer', userController.getUserOtpTimer)

module.exports = router
