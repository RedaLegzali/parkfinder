// Initialize dependencies
const path = require("path")
const randomstring = require("randomstring")

const validImage = file => {
  let max_size = 3 * 1000000
  let valid_image = /^image.+/i
  return valid_image.test(file.mimetype) && file.size < max_size
}

// Upload image
const storeImage = async (req, res) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).json({ message: "No image uploaded" })
  }
  let input = req.files.image
  if (!validImage(input)) {
    return res.status(400).json({ message: "Wrong image format" })
  }
  let extension = path.extname(input.name)
  let image =
    randomstring.generate({ length: 20, charset: "alphabetic" }) + extension
  let output = path.resolve(__dirname, "../assets/images/", image)

  input.mv(output, err => {
    if (err) {
      return res.status(400).json({ message: "Error uploading image" })
    }
    return res
      .status(200)
      .json({ message: "Image uploaded successfully", image })
  })
}

module.exports = { storeImage }
