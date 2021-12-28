// Initialize dependencies
const nodemailer = require("nodemailer")
const { sendMail } = require("../utils")

// Get Cities function
const contact = async (req, res) => {
  let { username, sender, subject, body } = req.body
  let from = `${username} <${sender}>`
  let to = process.env.SMTP_USER
  let message = `
    <h1> New Contact </h1>
    <h3> Contact Details </h3>
    <ul>
        <li> Username: ${username} </li>
        <li> Email: ${sender} </li>
    </ul>
    <h3> Message </h3>
    <p> ${body} </p>
  `
  try {
    await sendMail(from, process.env.SMTP_USER, subject, message)
    return res.status(200).json({ message: "Message sent successfully" })
  } catch (err) {
    return res
      .status(400)
      .json({ message: "There was an error sending your message" })
  }
}

module.exports = { contact }
