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
        const body = locale === 'fr' ? `<p>Vous nous avez transmis une demande d'information le ${new Date().toLocaleDateString(`fr-FR`)} comportant les informations suivantes :</p>
        <ul>
            <li>Nom: ${data.name}</li>
            <li>Email: ${data.from}</li>
            ${data.budget ? `<li>Budget : ${data.budget}</li>` : ''}
        </ul>
        <p style="border-bottom:1px dashed #000;padding-bottom:10px;">Voici le contenu de votre message :</p>
        <p style="border-bottom:1px dashed #000;padding-bottom:10px;">Objet: ${data.subject}</p>
        <p style="border-bottom:1px dashed #000;padding-bottom:10px;">${data.content}</p>
        <p>Nous confirmons par cet email la réception de votre message et nous vous répondrons dans les plus brefs délais.</p>
        <p>Cordialement</p>` : locale === 'de' ? `<p>Sie haben uns am ${new Date().toLocaleDateString(`de-DE`)} eine Informationsanfrage mit den folgenden Informationen übermittelt:</p>
        <ul>
            <li>Name: ${data.name}</li>
            <li>E-Mail: ${data.from}</li>
            ${data.budget ? `<li>Budget: ${data.budget}</li>` : ''}
        </ul>
        <p style="border-bottom:1px dashed #000;padding-bottom:10px;">Hier ist der Inhalt Ihrer Nachricht:</p>
        <p style="border-bottom:1px dashed #000;padding-bottom:10px;">Betreff: ${data.subject}</p>
        <p style="border-bottom:1px dashed #000;padding-bottom:10px;">${data.content}</p>
        <p>Wir bestätigen mit dieser E-Mail den Erhalt Ihrer Nachricht und werden Ihnen so schnell wie möglich antworten.</p>
        <p>Mit freundlichen Grüßen</p>
        ` : `<p>You sent us an information request on ${new Date().toLocaleDateString(`en-US`)} containing the following information:</p>
        <ul>
            <li>Name: ${data.name}</li>
            <li>Email: ${data.from}</li>
            ${data.budget ? `<li>Budget: ${data.budget}</li>` : ''}
        </ul>
        <p style="border-bottom:1px dashed #000;padding-bottom:10px;">Here is the content of your message:</p>
        <p style="border-bottom:1px dashed #000;padding-bottom:10px;">Subject: ${data.subject}</p>
        <p style="border-bottom:1px dashed #000;padding-bottom:10px;">${data.content}</p>
        <p>We confirm by this email the receipt of your message and will respond as soon as possible.</p>
        <p>Best regards</p>`;
        const mailOptionsToRodFreelance = {
            from: {name:data.name,address:data.from},
            to: process.env.NEXT_PUBLIC_FREELANCE_EMAIL,
            subject: data.subject,
            html : htmlSquelette(`<div><h3>Salut,</h3><p>Je suis ${data.name} et voila mon besoin</p><p>${data.content}</p><p>Budget : ${data.budget}</p></div>`,data.subject,'fr')
        };
        const mailOptionsToSender = {
            from: {name:process.env.NEXT_PUBLIC_COMPANY_NAME ?? '',address:process.env.NEXT_PUBLIC_FREELANCE_EMAIL ?? ''},
            to: data.from,
            subject: locale === 'fr' ?'Copie de votre message envoyé depuis www.rodcoding.com/'+locale : locale === 'de' ? 'Kopie Ihrer Nachricht von www.rodcoding.com/'+locale : 'Copy of your message sent from www.rodcoding.com/'+locale,
            html : htmlSquelette(body,data.subject,locale)
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
        const body = `<body>
        <div>
            <h3>${locale === 'fr' ? 'Bonjour Chers ' + data.name : locale === 'de' ? 'Hallo Lieber ' + data.name : 'Hello Dear ' + data.name},</h3>
            <p>${locale === 'fr' ? 'Vous recevez cet email suite à la prestation de service/maintenance réalisée par <strong>ROD TECH SOLUTIONS</strong>.' : locale === 'de' ? 'Sie erhalten diese E-Mail nach der Durchführung des Service/Wartung durch <strong>ROD TECH SOLUTIONS</strong>.' : 'You are receiving this email following the service/maintenance carried out by <strong>ROD TECH SOLUTIONS</strong>.'}</p>
            <p>${locale === 'fr' ? 'Nous vous transmettons par cet email, en pièce jointe, votre facture.' : locale === 'de' ? 'Wir senden Ihnen mit dieser E-Mail Ihre Rechnung als Anhang zu.' : 'We are sending you your invoice as an attachment with this email.'}</p>
            <p>${locale === 'fr' ? 'Nous vous remercions pour votre confiance et espérons vous revoir prochainement pour une nouvelle prestation.' : locale === 'de' ? 'Wir danken Ihnen für Ihr Vertrauen und hoffen, Sie bald wieder für einen neuen Service begrüßen zu dürfen.' : 'We thank you for your trust and hope to see you again soon for a new service.'}</p>
            <p>${locale === 'fr' ? 'Cordialement,' : locale === 'de' ? 'Mit freundlichen Grüßen,' : 'Best regards,'}</p>
            <p><strong>ROD TECH SOLUTIONS</strong></p>
        </div></body>`;
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
        const body = `<body>
        <div>
            <h3>${locale === 'fr' ? 'Bonjour Cher ' + data.name : locale === 'de' ? 'Hallo Lieber ' + data.name : 'Hello Dear ' + data.name},</h3>
            <p>
            ${locale === 'fr' ? "Vous recevez cet email car vous venez de signer un contrat avec la société <strong>ROD TECH SOLUTIONS</strong> pour une prestation de service ou de maintenance. Nous vous en remercions chaleureusement." :
            locale === 'de' ? "Sie erhalten diese E-Mail, weil Sie gerade einen Vertrag mit der Firma <strong>ROD TECH SOLUTIONS</strong> für eine Dienstleistung oder Wartung unterzeichnet haben. Dafür danken wir Ihnen herzlich." :
            "You are receiving this email because you have just signed a contract with <strong>ROD TECH SOLUTIONS</strong> for a service or maintenance. We thank you for that."}
            </p>
            <p>
            ${locale === 'fr' ? "Vous trouverez en pièce jointe votre contrat signé par les deux parties." :
            locale === 'de' ? "Anbei finden Sie Ihren von beiden Parteien unterzeichneten Vertrag." :
            "You will find attached your contract signed by both parties."}
            </p>
            <p>
            ${locale === 'fr' ? "Nous vous remercions pour votre confiance et nous nous attacherons à satisfaire vos exigences." :
            locale === 'de' ? "Wir danken Ihnen für Ihr Vertrauen und werden uns bemühen, Ihre Anforderungen zu erfüllen." :
            "We thank you for your trust and will strive to meet your requirements."}
            </p>
            <p>
            ${locale === 'fr' ? "Cordialement," :
            locale === 'de' ? "Mit freundlichen Grüßen," :
            "Best regards,"}
            </p>
        </div></body>`
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