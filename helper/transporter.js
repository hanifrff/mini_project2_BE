const nodemailer = require("nodemailer");
require("dotenv").config();

// create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "mamunbelajar@gmail.com",
    pass: process.env.SECRET_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

module.exports = transporter;