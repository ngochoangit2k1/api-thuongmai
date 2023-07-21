const express = require('express')
const router = express.Router()
const bodyParser = require('body-parser')

const paymentController = require('../controllers/PaymentController')

router.put('/:id', bodyParser.json(), paymentController.MomoControllerPayment)
router.get('/config', paymentController.PaypalController)

module.exports = router
