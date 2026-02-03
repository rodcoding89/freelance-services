"use server"

import { cookies } from "next/headers";
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
    base64NotFrContract:string|null;
}

const sendEmailForFillingContract = async(to:string,name:string,link:string,clientLang:string)=>{
    console.log("LINK",link)
    try {
        const body = `
            <div>
                <h3>${clientLang === 'fr' ? 'Bonjour Chers ' + name : 'Hello Dear ' + name},</h3>
                <p>${clientLang === 'fr' ? 'Vous recevez cet email suite à votre demande de prestation de service ou maintenance auprès de <strong>ROD TECH SOLUTIONS</strong>.' : 'You are receiving this email following your request for service or maintenance from <strong>ROD TECH SOLUTIONS</strong>.'}</p>
                <p>${clientLang === 'fr' ? 'Nous vous informons par cet email que le formulaire de création de votre contrat est disponible.' : 'We are informing you by this email that the form to create your contract is now available.'}</p>
                <p>${clientLang === 'fr' ? 'Par conséquent, nous vous invitons à cliquer sur le lien ci-dessous. Une fois sur le lien, suivez les instructions, signez le contrat et téléchargez-le après la signature.' : 'Therefore, we invite you to click on the link below. Once on the link, follow the instructions, sign the contract, and download it after signing.'}</p>
                <p><a href="${link}" target="_blank">${clientLang === 'fr' ? 'Cliquez ici' : 'Click here'}</a> ${clientLang === "fr" ? "ou " : "or "} <a href="${link}" target="_blank">${link}</a> ${clientLang === 'fr' ? 'pour accéder au formulaire.' : 'to access the form.'}</p>
                <p>${clientLang === 'fr' ? 'Cordialement,' : 'Best regards,'}</p>
            </div>
        
        `;
        const mailOptions = {
            from: {name:process.env.NEXT_PUBLIC_COMPANY_NAME ?? '',address:process.env.NEXT_PUBLIC_FREELANCE_EMAIL_CLIENT ?? ''},
            to: to,
            replyTo:process.env.NEXT_PUBLIC_FREELANCE_EMAIL_SUPPORT,
            subject: `${clientLang === 'fr' ? "Formulaire de signature de contrat disponible" : "Contract signature form available"}`,
            html : htmlSquelette(body,`${clientLang === 'fr' ? "Formulaire de signature de contrat disponible" : "Contract signature form available"}
            `,clientLang)
        };
        const response = await transporter.sendMail(mailOptions);
        
        if (response) {
            return 'success'
        }
        return 'error'
    } catch (error) {
        console.error(error);
    }
}

const sendEmailContact = async(data:Email,locale:string)=>{
    try {
        const body = locale === 'fr' ? `<p>Vous nous avez transmis une demande d'information le ${new Date().toLocaleDateString(`fr-FR`)} comportant les informations suivantes :</p>
        <ul>
            <li>Nom: ${data.name}</li>
            <li>Email: ${data.from}</li>
            ${data.budget ? `<li>Budget : ${data.budget}</li>` : ''}
        </ul>
        <p style="border-bottom:0.0625rem dashed #000;padding-bottom:10px;">Voici le contenu de votre message :</p>
        <p style="border-bottom:0.0625rem dashed #000;padding-bottom:10px;">Objet: ${data.subject}</p>
        <p style="border-bottom:0.0625rem dashed #000;padding-bottom:10px;">${data.content}</p>
        <p>Nous confirmons par cet email la réception de votre message et nous vous répondrons dans les plus brefs délais.</p>
        <p>Cordialement</p>` : `<p>You sent us an information request on ${new Date().toLocaleDateString(`en-US`)} containing the following information:</p>
        <ul>
            <li>Name: ${data.name}</li>
            <li>Email: ${data.from}</li>
            ${data.budget ? `<li>Budget: ${data.budget}</li>` : ''}
        </ul>
        <p style="border-bottom:0.0625rem dashed #000;padding-bottom:10px;">Here is the content of your message:</p>
        <p style="border-bottom:0.0625rem dashed #000;padding-bottom:10px;">Subject: ${data.subject}</p>
        <p style="border-bottom:0.0625rem dashed #000;padding-bottom:10px;">${data.content}</p>
        <p>We confirm by this email the receipt of your message and will respond as soon as possible.</p>
        <p>Best regards</p>`;
        const mailOptionsToRodFreelance = {
            from: {name:data.name,address:process.env.NEXT_PUBLIC_FREELANCE_EMAIL_CONTACT ?? ""},
            to: process.env.NEXT_PUBLIC_FREELANCE_EMAIL_CONTACT,
            replyTo:data.from,
            subject: data.subject,
            html : htmlSquelette(`<div><h3>Salut,</h3><p>Je suis ${data.name} et voila mon besoin</p><p>${data.content}</p><p>Budget : ${data.budget}</p></div>`,data.subject,'fr')
        };
        const mailOptionsToSender = {
            from: {name:process.env.NEXT_PUBLIC_COMPANY_NAME ?? '',address:process.env.NEXT_PUBLIC_FREELANCE_EMAIL_CONTACT ?? ''},
            to: data.from,
            subject: locale === 'fr' ?'Copie de votre message envoyé depuis www.rodcoding.com/'+locale : 'Copy of your message sent from www.rodcoding.com/'+locale,
            html : htmlSquelette(body,data.subject,locale)
        };
        const allRequest = [transporter.sendMail(mailOptionsToRodFreelance),transporter.sendMail(mailOptionsToSender)];
        const [res1,res2] = await Promise.all(allRequest);
        if (res1 && res2) {
            const cookieStore = await cookies()
            cookieStore.delete("captcha")
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
        const body = `
        <div>
            <h3>${locale === 'fr' ? 'Bonjour Chers ' + data.name : 'Hello Dear ' + data.name},</h3>
            <p>${locale === 'fr' ? 'Vous recevez cet email suite à la prestation de service/maintenance réalisée par <strong>ROD TECH SOLUTIONS</strong>.' : 'You are receiving this email following the service/maintenance carried out by <strong>ROD TECH SOLUTIONS</strong>.'}</p>
            <p>${locale === 'fr' ? 'Nous vous transmettons par cet email, en pièce jointe, votre facture.' : 'We are sending you your invoice as an attachment with this email.'}</p>
            <p>${locale === 'fr' ? 'Nous vous remercions pour votre confiance et espérons vous revoir prochainement pour une nouvelle prestation.' : 'We thank you for your trust and hope to see you again soon for a new service.'}</p>
            <p>${locale === 'fr' ? 'Cordialement,' : 'Best regards,'}</p>
            <p><strong>ROD TECH SOLUTIONS</strong></p>
        </div>`;
        const mailOptions = {
            from: {name:process.env.NEXT_PUBLIC_COMPANY_NAME ?? '',address:process.env.NEXT_PUBLIC_FREELANCE_EMAIL_CONTACT_SUPPORT ?? ''},
            to: data.to,
            subject: data.subject,
            replyTo:process.env.NEXT_PUBLIC_FREELANCE_EMAIL_SUPPORT,
            attachments:[attachement],
            html : htmlSquelette(body,data.subject,locale)
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

const sendContract = async(data:Contrat,locale:string)=>{
    try {
        const body = `
        <div>
            <h3>${locale === 'fr' ? 'Bonjour Cher ' + data.name : 'Hello Dear ' + data.name},</h3>
            <p>
            ${locale === 'fr' ? "Vous recevez cet email car vous venez de signer un contrat avec la société <strong>ROD TECH SOLUTIONS</strong> pour une prestation de service ou de maintenance informatique <strong>(Développement Web)</strong>. Nous vous en remercions chaleureusement." :
            "You are receiving this email because you have just signed a contract with the company <strong>ROD TECH SOLUTIONS</strong> for an IT service or maintenance <strong>(Web Development)</strong>. We warmly thank you for this."}
            </p>
            <p>
            ${locale === 'fr' ? "Vous trouverez en pièce jointe votre contrat signé (version originale) par les deux parties et un document contenant les instructions de paiement." :
            "You will find attached your contract signed (original and translated version) by both parties and a document containing the payment instructions."}
            </p>
            <p>
            ${locale === 'fr' ? "Nous vous remercions pour votre confiance et nous nous attacherons à satisfaire vos exigences." :
            "We thank you for your trust and will strive to meet your requirements."}
            </p>
            <p>
            ${locale === 'fr' ? "Cordialement," :
            "Best regards,"}
            </p>
        </div>`
        const attachementContrat = {
            filename: locale !== 'fr' ? "translated-contrat_"+data.name+".pdf":"original_contrat_"+data.name+".pdf",
            content: data.base64Contrat, // truncated
            encoding: "base64",
        }
        const attachementPayment = {
            filename: "payment_intruction.pdf",
            content: data.base64Payement, // truncated
            encoding: "base64",
        }
        const attachementNotFRContract = data.base64NotFrContract ? {
            filename: "original_contrat_"+data.name+".pdf",
            content: data.base64NotFrContract, // truncated
            encoding: "base64",
        } : null
        const mailOptions = {
            from: {name:process.env.NEXT_PUBLIC_COMPANY_NAME ?? '',address:process.env.NEXT_PUBLIC_FREELANCE_EMAIL_CLIENT ?? ''},
            to: data.to,
            replyTo:process.env.NEXT_PUBLIC_FREELANCE_EMAIL_SUPPORT,
            subject: data.subject,
            attachments: attachementNotFRContract ? [attachementContrat,attachementPayment,attachementNotFRContract] : [attachementContrat,attachementPayment],
            html : htmlSquelette(body,data.subject,locale)
        };

        const bodyMailFreelancer = `
            <div><h2>Signature contract ${data.name}</h2><p>Document de signature contrat de ${data.name} à sauvegarder dans le drive.</p></div>
        </div>`

        const mailOptionsForFreelancerAboutContract = {
            from: {name:process.env.NEXT_PUBLIC_COMPANY_NAME ?? '',address:process.env.NEXT_PUBLIC_FREELANCE_EMAIL_CLIENT ?? ""},
            to: process.env.NEXT_PUBLIC_FREELANCE_EMAIL_CLIENT ?? '',
            replyTo:data.to,
            subject: 'Signature contrat',
            attachments: attachementNotFRContract ? [attachementContrat,attachementNotFRContract] : [attachementContrat],
            html : htmlSquelette(bodyMailFreelancer,data.subject,locale)
        };

        const allRequest = [
            await transporter.sendMail(mailOptions),
            await transporter.sendMail(mailOptionsForFreelancerAboutContract)
        ]
        
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

function htmlSquelette(body:string,title:string,lang:string){
    return `<!DOCTYPE html>
    <html lang="${lang}">
    <head>
      <meta charset="UTF-8">
      <title>${title}</title>
    </head>
    <body>
      ${body}
      <p style="text-align:right;">${lang === 'fr' ? 'L\'équipe Rod Coding' : 'The Rod Coding Team'}</p>
    </body>
    </html>`
}

export {sendEmailContact,sendInvoice,sendContract,sendEmailForFillingContract};