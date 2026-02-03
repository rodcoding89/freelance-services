
import { DecoderData, encodeSecretEnvVar } from '@/utils/fonction';
import nodemailer from 'nodemailer';

const HOST = `${process.env.NEXT_PUBLIC_ZOHO_SMTP_SERVER}`
const PORT = parseInt(process.env.NEXT_PUBLIC_ZOHO_SMTP_PORT ?? "465")
const USER = process.env.MODE ? DecoderData(`${process.env.ZOHO_SMTP_CONSUMER}`) : `${process.env.ZOHO_SMTP_CONSUMER}`
const PASS = process.env.MODE ? DecoderData(`${process.env.ZOHO_SMTP_PASSWORD}`) : `${process.env.ZOHO_SMTP_PASSWORD}`

console.log("host",HOST,"port",PORT,"user",USER,"pass",PASS)
//console.log("ENCODING",encodeSecretEnvVar())
const transporter = nodemailer.createTransport({
  host: HOST,
  port: PORT,
  secure: true, // Use true for port 465, false for port 587
  auth: {
    user: USER,
    pass: PASS,
  },
});

export default transporter;