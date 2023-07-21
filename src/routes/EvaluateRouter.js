const EvaluateController = require('../controllers/EvaluateController')
const express = require('express')
const router = express.Router()

router.put('/:id', EvaluateController.createEvaluate)
router.put('/update-comment/:id', EvaluateController.updateEvaluate)
router.get('/:id', EvaluateController.getEvaluateByProduct)

module.exports = router
