const multer = require('multer')
const cloudinary = require('cloudinary').v2
const { CloudinaryStorage } = require('multer-storage-cloudinary')

// Configuration
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

const uploadAvatar = () => {
  const upload = multer({
    storage: storage,
    limits: { fileSize: 1000000 },
    filename: function (req, file, cb) {
      cb(null, file.fieldname + '-' + Date.now())
    },
    dest: 'uploads/'
  })

  return upload.single('avatar')
}

module.exports = {
  uploadAvatar
}
