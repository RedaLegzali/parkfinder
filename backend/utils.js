const nodemailer = require("nodemailer")

const PENALTY = 10

function validateFields(fields, data) {
  let errors = {}
  let isValid = true
  const password_size = 6
  fields.forEach(field => {
    if (
      !data.hasOwnProperty(field) ||
      !data[field] ||
      data[field].length == 0
    ) {
      errors[field] = `${field} is required`
      isValid = false
    } else if ( (field == 'password' || field == 'passwordConfirm') && data[field].length < password_size) {
      errors.password = `Password size must be greater than ${password_size}`
      isValid = false
    }
  })
  return { errors, isValid }
}

const sendMail = async (from, to, subject, message, attachments) => {
  // Email config
  let transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    attachDataUrls: true,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  })
  // Send Email
  attachments = attachments ? attachments : []
  await transporter.sendMail({ from, to, subject, html: message, attachments })
}

const isLicensePlate = licensePlate => {
  let pattern = /^[0-9]{5}-[0-9]{2}$/
  return pattern.test(licensePlate)
}

module.exports = { validateFields, sendMail, isLicensePlate, PENALTY }
