
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: `${process.env.ZOHO_SMTP_SERVER}`,
  port: parseInt(process.env.ZOHO_SMTP_PORT ?? "465"),
  secure: true, // Use true for port 465, false for port 587
  auth: {
    user: `${process.env.ZOHO_SMTP_CONSUMER}`,
    pass: `${process.env.ZOHO_SMTP_PASSWORD}`,
  },
});

export default transporter;