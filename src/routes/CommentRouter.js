const CommentController = require('../controllers/CommentController')
const express = require('express')
const router = express.Router()
const { authUserMiddleWare } = require('../middleware/authMiddleware')

router.post('/:id', authUserMiddleWare, CommentController.createComment)
router.get('/get-comment/:id', CommentController.getCommentProduct)
router.post('/reply-comment/:id', CommentController.replyComment)
router.delete('/:id/delete-reply/:idReply', CommentController.deleteReply)
router.put('/update-comment/:id', authUserMiddleWare, CommentController.updateComment)
router.delete('/:id', CommentController.deleteComment)

module.exports = router
