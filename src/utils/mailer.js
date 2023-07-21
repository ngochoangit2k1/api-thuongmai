const nodemailer = require('nodemailer')
const dotenv = require('dotenv')
dotenv.config()

const sendMail = (keyWord, to, subject, text) => {
  const transport = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.USER,
      pass: process.env.PASS
    }
  })
  const mailOptions = {
    from: process.env.USER,
    to: to,
    subject: subject,
    html: `<div>
            <div>${text}</div>
            <div>${keyWord}</div>
          </div>`
  }
  transport.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log('error', error)
      res.status(400).json({ error: 'email not send' })
    } else {
      console.log('Email sent', info.response)
      res.status(200).json({ message: 'Email sent Successfully' })
    }
  })
}

module.exports = { sendMail }
