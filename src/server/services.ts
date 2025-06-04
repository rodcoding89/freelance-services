"use server"

import transporter from "./init-node-mailer";

interface Email{
    from:string;
    name:string;
    budget?:string;
    subject:string;
    content:string;
}

interface Invoice{
    from:string;
    name:string;
    attach:string;
    subject:string;
    content:string;
}

interface Contrat{
    to:string;
    name:string; 
    subject:string;
    base64Contrat:string;
    base64Payement:string;
}


const sendEmail = async(data:Email)=>{
    try {
        const mailOptions = {
            from: {name:data.name,address:data.from},
            to: process.env.FREELANCE_EMAIL,
            subject: data.subject,
            html : `<div><h3>Salut,</h3><p>Je suis ${data.name} et voila mon besoin</p><p>${data.content}</p><p>Budget : ${data.budget}</p></div>`
        };
        const response = await transporter.sendMail(mailOptions);
        if (response) {
            return 'success'
        }
        return 'error'  
    } catch (error) {
        console.error(error);
        return 'error'
    }
}

const sendInvoice = async(data:Email)=>{
}

const sendContract = async(data:Contrat,locale:string)=>{
    try {
        const attachementContrat = {
            filename: "contrat_"+data.name+".pdf",
            content: data.base64Contrat, // truncated
            encoding: "base64",
        }
        const attachementPayment = {
            filename: "payment_intruction.pdf",
            content: data.base64Payement, // truncated
            encoding: "base64",
        }
        const mailOptions = {
            from: {name:"ROD TECH SOLUTIONS",address:process.env.FREELANCE_EMAIL ?? ''},
            to: data.to,
            subject: data.subject,
            attachments:[attachementContrat,attachementPayment],
            html : `<html lang=${locale}>
            <head>
                <meta charset="utf-8">
            </head>
            <body><div><h3>${locale === 'fr' ? 'Bonjour Chers '+data.name : locale === 'de' ? 'Hallo Lieber '+data.name : 'Hello Dear '+data.name},</h3><p>${locale === 'fr' ? 'Vous recevez cet email parce que vous venez de signer un contrat avec la société "<strong>ROD TECH SOLUTIONS</strong>" pour une prestation de service ou de maintenance. Pour cela nous vous remercions.' : locale === 'de' ? '' : ''}</p><p>${locale === 'fr' ? 'Vous trouverez en piece jointe votre contrat signé par les deux parties.' : locale === 'de' ? '' : ''}</p><p>${locale === 'fr' ? 'Nous vous remercions pour la confiance et nous nous atelerons a satisfaire vos exigeances.' : locale === 'de' ? '' : ''}</p><p>${locale === 'fr' ? 'Cordialement.' : locale === 'de' ? '' : ''}</p></div></body>
            </html>`
        };
        const response = await transporter.sendMail(mailOptions);
        if (response) {
            return 'success'
        }
        return 'error' 
    } catch (error) {
        console.error(error);
        return 'error'
    }
}

export {sendEmail,sendInvoice,sendContract};