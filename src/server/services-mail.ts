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
    to:string;
    name:string;
    attach:string;
    subject:string;
}

interface Contrat{
    to:string;
    name:string; 
    subject:string;
    base64Contrat:string;
    base64Payement:string;
}


const sendEmail = async(data:Email,locale:string)=>{
    try {
        const body = `<p>Vous nous avez transmis une demande d'information le ${new Date().toLocaleDateString(`${locale === 'fr' ? 'fr-FR' : locale === 'de' ? 'de-DE' : 'en-US'}`)} comportant les informations suivantes :</p><ul><li>Nom: ${data.name}</li><li>Email: ${data.from}</li>${data.budget ? `<li>Budget : ${data.budget}</li>` : ''}</li></ul><p style="border-bottom:1px dashed #000;padding-bottom:10px;">Voici le contenu de votre message :</p><p style="border-bottom:1px dashed #000;padding-bottom:10px;">Objet: ${data.subject}</p><p style="border-bottom:1px dashed #000;padding-bottom:10px;">${data.content}</p><p>Nous confirmons par cet email la reception de votre message et nous vous repondrons dans les plus bref délais.</p><p>Cordialement</p>`
        const mailOptionsToRodFreelance = {
            from: {name:data.name,address:data.from},
            to: process.env.NEXT_PUBLIC_FREELANCE_EMAIL,
            subject: data.subject,
            html : htmlSquelette(`<div><h3>Salut,</h3><p>Je suis ${data.name} et voila mon besoin</p><p>${data.content}</p><p>Budget : ${data.budget}</p></div>`,data.subject,'fr')
        };
        const mailOptionsToSender = {
            from: {name:process.env.NEXT_PUBLIC_COMPANY_NAME ?? '',address:process.env.NEXT_PUBLIC_FREELANCE_EMAIL ?? ''},
            to: data.from,
            subject: 'Copie de votre message envoyé depuis www.rodcoding.com',
            html : htmlSquelette(body,data.subject,'fr')
        };
        const allRequest = [transporter.sendMail(mailOptionsToRodFreelance),transporter.sendMail(mailOptionsToSender)];
        const [res1,res2] = await Promise.all(allRequest);
        if (res1 && res2) {
            return 'success'
        }
        return 'error'  
    } catch (error) {
        console.error(error);
        return 'error'
    }
}

const sendInvoice = async(data:Invoice,locale:string)=>{
    try {
        const attachement = {
            filename: "invoice_"+data.name+".pdf",
            content: data.attach, // truncated
            encoding: "base64",
        }
        const body = `<body><div><h3>${locale === 'fr' ? 'Bonjour Chers '+data.name : locale === 'de' ? 'Hallo Lieber '+data.name : 'Hello Dear '+data.name},</h3><p>${locale === 'fr' ? 'Vous recevez cet email suite à la prestation de service/maintenance réalisé par "<strong>ROD TECH SOLUTIONS</strong>".' : locale === 'de' ? '' : ''}</p><p>${locale === 'fr' ? 'Nous vous transmettons par cet email et en pièce jointe votre facture.' : locale === 'de' ? '' : ''}</p><p>${locale === 'fr' ? 'Nous vous remercions pour la confiance et esperons vous revoire prochainement pour une nouvelle prestation.' : locale === 'de' ? '' : ''}</p><p>${locale === 'fr' ? 'Cordialement.' : locale === 'de' ? '' : ''}</p></div></body>`;
        const mailOptions = {
            from: {name:"ROD TECH SOLUTIONS",address:process.env.FREELANCE_EMAIL ?? ''},
            to: data.to,
            subject: data.subject,
            attachments:[attachement],
            html : htmlSquelette(body,data.subject,locale)
        };
        const response = await transporter.sendMail(mailOptions);
        console.log("send mail",response);
        if (response) {
            return 'success'
        }
        return 'error'
    } catch (error) {
        console.error(error);
        return 'error'
    }
}

const sendContract = async(data:Contrat,locale:string)=>{
    try {
        const body = `<body><div><h3>${locale === 'fr' ? 'Bonjour Chers '+data.name : locale === 'de' ? 'Hallo Lieber '+data.name : 'Hello Dear '+data.name},</h3><p>${locale === 'fr' ? 'Vous recevez cet email parce que vous venez de signer un contrat avec la société "<strong>ROD TECH SOLUTIONS</strong>" pour une prestation de service ou de maintenance. Pour cela nous vous remercions.' : locale === 'de' ? '' : ''}</p><p>${locale === 'fr' ? 'Vous trouverez en piece jointe votre contrat signé par les deux parties.' : locale === 'de' ? '' : ''}</p><p>${locale === 'fr' ? 'Nous vous remercions pour la confiance et nous nous atelerons a satisfaire vos exigeances.' : locale === 'de' ? '' : ''}</p><p>${locale === 'fr' ? 'Cordialement.' : locale === 'de' ? '' : ''}</p></div></body>`
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
            html : htmlSquelette(body,data.subject,locale)
        };
        const response = await transporter.sendMail(mailOptions);
        console.log("send mail",response);
        if (response) {
            return 'success'
        }
        return 'error' 
    } catch (error) {
        console.error(error);
        return 'error'
    }
}

function htmlSquelette(body:string,title:string,lang:string){
    return `<!DOCTYPE html>
    <html lang="${lang}">
    <head>
      <meta charset="UTF-8">
      <title>${title}</title>
    </head>
    <body>
      ${body}
      <p style="text-align:right;">L'équipe Rod Coding</p>
    </body>
    </html>`
}

export {sendEmail,sendInvoice,sendContract};