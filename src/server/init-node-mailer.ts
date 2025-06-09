
const user = process.env.USER_EMAIL;
const pw = process.env.USER_PASSWORD;

import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
      user: user,
      pass: pw
  }
});

export default transporter;