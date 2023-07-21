const express = require('express')
const router = express.Router()
const ProductController = require('../controllers/ProductController')
const { authMiddleWare } = require('../middleware/authMiddleware')
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

router.post('/create', upload.array('images'), ProductController.createProduct)
router.put('/update/:id', upload.array('images'), ProductController.updateProduct)
router.put('/evaluate', ProductController.evaluateProduct)
router.get('/get-details/:id', ProductController.getProduct)
router.delete('/delete/:id', authMiddleWare, ProductController.deleteProduct)
router.get('/get-all', ProductController.getAllProduct)
// router.post('/delete-many', authMiddleWare, ProductController.deleteMany)

module.exports = router
