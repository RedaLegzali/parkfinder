const { validateFields } = require("../utils")

const validateData = (req, res, next) => {
  let required
  let url = req.originalUrl
  switch (true) {
    case /^\/auth\/register$/.test(url):
      required = [
        "username",
        "email",
        "birthDate",
        "password",
        "passwordConfirm"
      ]
      break
    case /^\/auth\/login$/.test(url):
      required = ["email", "password"]
      break
    case /^\/parkings/.test(url):
      required = ["name", "description", "longitude", "latitude", "capacity", "price"]
      break
    case /^\/reservations/.test(url):
      required = ["parking", "licensePlate"]
      break
    case /^\/profile$/.test(url):
      required = ["username", "email", "birthDate"]
      break
    case /^\/profile\/balance$/.test(url):
      required = ["pack"]
      break
    case /^\/contact$/.test(url):
      required = ["username", "sender", "subject", "body"]
      break
  }
  let { errors, isValid } = validateFields(required, req.body)
  if (!isValid) {
    return res.status(400).json(errors)
  }
  next()
}

module.exports = { validateData }
