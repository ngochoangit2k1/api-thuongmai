const momoPayment = (req) => {
  const orderInfo = req.body.id
  const amount = req.body.price
  const accessKey = process.env.MOMO_KEY
  const secretKey = process.env.MOMO_SECRET
  const partnerCode = 'MOMO'
  const redirectUrl = `http://localhost:3000/payment-success`
  const ipnUrl = 'https://momo.vn'
  const requestType = 'payWithMethod'
  const orderId = partnerCode + new Date().getTime()
  const requestId = orderId
  const extraData = ''
  const orderGroupId = ''
  const autoCapture = true
  const lang = 'vi'
  const rawSignature =
    'accessKey=' +
    accessKey +
    '&amount=' +
    amount +
    '&extraData=' +
    extraData +
    '&ipnUrl=' +
    ipnUrl +
    '&orderId=' +
    orderId +
    '&orderInfo=' +
    orderInfo +
    '&partnerCode=' +
    partnerCode +
    '&redirectUrl=' +
    redirectUrl +
    '&requestId=' +
    requestId +
    '&requestType=' +
    requestType

  const crypto = require('crypto')
  const signature = crypto.createHmac('sha256', secretKey).update(rawSignature).digest('hex')

  //json object send to MoMo endpoint
  const requestBody = JSON.stringify({
    partnerCode: partnerCode,
    partnerName: 'Test',
    storeId: 'MomoTestStore',
    requestId: requestId,
    amount: amount,
    orderId: orderId,
    orderInfo: orderInfo,
    redirectUrl: redirectUrl,
    ipnUrl: ipnUrl,
    lang: lang,
    requestType: requestType,
    autoCapture: autoCapture,
    extraData: extraData,
    orderGroupId: orderGroupId,
    signature: signature
  })

  //Create the HTTPS objects
  const options = {
    hostname: 'test-payment.momo.vn',
    port: 443,
    path: '/v2/gateway/api/create',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(requestBody)
    }
  }

  return { options, requestBody }
}
module.exports = { momoPayment }
