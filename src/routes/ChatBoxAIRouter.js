const express = require('express')
const ChatBoxAIController = require('../controllers/ChatBoxAIController')
const router = express.Router()

router.post('/question', ChatBoxAIController.question)
router.post('/create', ChatBoxAIController.createResult)
router.get('/get-all', ChatBoxAIController.getResults)
router.post('/get-result', ChatBoxAIController.getResult)
router.put('/update-result/:id', ChatBoxAIController.updateResult)
router.delete('/delete-result/:id', ChatBoxAIController.deleteResult)

module.exports = router
