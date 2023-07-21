const express = require('express')
const router = express.Router()
const CategoryController = require('../controllers/CategoryController')
const { authMiddleWare } = require('../middleware/authMiddleware')

router.post('/create', CategoryController.createCategory)
// router.post('/test-create', CategoryController.createCategory)
router.put('/update/:id', authMiddleWare, CategoryController.updateCategory)
router.get('/get-details/:id', CategoryController.getCategory)
router.delete('/delete/:id', CategoryController.deleteCategory)
router.get('/get-all', CategoryController.getCategories)
router.get('/get-all-category', CategoryController.getCategoriesAll)

module.exports = router
