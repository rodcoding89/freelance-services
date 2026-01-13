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
    base64NotFrContract:string|null;
}

const sendEmailForFillingContract = async(to:string,name:string,link:string,clientLang:string)=>{
    try {
        const body = `<body>
            <div>
                <h3>${clientLang === 'fr' ? 'Bonjour Chers ' + name : clientLang === 'de' ? 'Hallo Lieber ' + name : 'Hello Dear ' + name},</h3>
                <p>${clientLang === 'fr' ? 'Vous recevez cet email suite à votre demande de prestation de service ou maintenance auprès de <strong>ROD TECH SOLUTIONS</strong>.' : clientLang === 'de' ? 'Sie erhalten diese E-Mail aufgrund Ihrer Anfrage für Dienstleistungen oder Wartungsarbeiten bei <strong>ROD TECH SOLUTIONS</strong>.' : 'You are receiving this email following your request for service or maintenance from <strong>ROD TECH SOLUTIONS</strong>.'}</p>
                <p>${clientLang === 'fr' ? 'Nous vous informons par cet email que le formulaire de création de votre contrat est disponible.' : clientLang === 'de' ? 'Wir informieren Sie hiermit, dass das Formular zur Erstellung Ihres Vertrags verfügbar ist.' : 'We are informing you by this email that the form to create your contract is now available.'}</p>
                <p>${clientLang === 'fr' ? 'Par conséquent, nous vous invitons à cliquer sur le lien ci-dessous. Une fois sur le lien, suivez les instructions, signez le contrat et téléchargez-le après la signature.' : clientLang === 'de' ? 'Daher laden wir Sie ein, auf den untenstehenden Link zu klicken. Sobald Sie auf der Seite sind, folgen Sie den Anweisungen, unterschreiben Sie den Vertrag und laden Sie ihn nach der Unterzeichnung herunter.' : 'Therefore, we invite you to click on the link below. Once on the link, follow the instructions, sign the contract, and download it after signing.'}</p>
                <p><a href="${link}" target="_blank">${clientLang === 'fr' ? 'Cliquez ici' : clientLang === 'de' ? 'Klicken Sie hier' : 'Click here'}</a> ${clientLang === 'fr' ? 'pour accéder au formulaire.' : clientLang === 'de' ? 'um auf das Formular zuzugreifen.' : 'to access the form.'}</p>
                <p>${clientLang === 'fr' ? 'Cordialement,' : clientLang === 'de' ? 'Mit freundlichen Grüßen,' : 'Best regards,'}</p>
            </div>
        </body>
        `;
        const mailOptions = {
            from: {name:process.env.NEXT_PUBLIC_COMPANY_NAME ?? '',address:process.env.NEXT_PUBLIC_FREELANCE_EMAIL_CLIENT ?? ''},
            to: to,
            subject: `${clientLang === 'fr' ? "Formulaire de signature de contrat disponible" : clientLang === 'de' ? "Vertragsunterzeichnungsformular verfügbar" : "Contract signature form available"}`,
            html : htmlSquelette(body,`${clientLang === 'fr' ? "Formulaire de signature de contrat disponible" : clientLang === 'de' ? "Vertragsunterzeichnungsformular verfügbar" : "Contract signature form available"}
            `,clientLang)
        };
        const response = await transporter.sendMail(mailOptions);
        //console.log("send mail",response);
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
        <p>Cordialement</p>` : locale === 'de' ? `<p>Sie haben uns am ${new Date().toLocaleDateString(`de-DE`)} eine Informationsanfrage mit den folgenden Informationen übermittelt:</p>
        <ul>
            <li>Name: ${data.name}</li>
            <li>E-Mail: ${data.from}</li>
            ${data.budget ? `<li>Budget: ${data.budget}</li>` : ''}
        </ul>
        <p style="border-bottom:0.0625rem dashed #000;padding-bottom:10px;">Hier ist der Inhalt Ihrer Nachricht:</p>
        <p style="border-bottom:0.0625rem dashed #000;padding-bottom:10px;">Betreff: ${data.subject}</p>
        <p style="border-bottom:0.0625rem dashed #000;padding-bottom:10px;">${data.content}</p>
        <p>Wir bestätigen mit dieser E-Mail den Erhalt Ihrer Nachricht und werden Ihnen so schnell wie möglich antworten.</p>
        <p>Mit freundlichen Grüßen</p>
        ` : `<p>You sent us an information request on ${new Date().toLocaleDateString(`en-US`)} containing the following information:</p>
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
            subject: data.subject,
            html : htmlSquelette(`<div><h3>Salut,</h3><p>Je suis ${data.name} et voila mon besoin</p><p>${data.content}</p><p>Budget : ${data.budget}</p></div>`,data.subject,'fr')
        };
        const mailOptionsToSender = {
            from: {name:process.env.NEXT_PUBLIC_COMPANY_NAME ?? '',address:process.env.NEXT_PUBLIC_FREELANCE_EMAIL_CONTACT ?? ''},
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
            from: {name:process.env.NEXT_PUBLIC_COMPANY_NAME ?? '',address:process.env.NEXT_PUBLIC_FREELANCE_EMAIL_CONTACT_SUPPORT ?? ''},
            to: data.to,
            subject: data.subject,
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
        const body = `<body>
        <div>
            <h3>${locale === 'fr' ? 'Bonjour Cher ' + data.name : locale === 'de' ? 'Hallo Lieber ' + data.name : 'Hello Dear ' + data.name},</h3>
            <p>
            ${locale === 'fr' ? "Vous recevez cet email car vous venez de signer un contrat avec la société <strong>ROD TECH SOLUTIONS</strong> pour une prestation de service ou de maintenance informatique <strong>(Développement Web)</strong>. Nous vous en remercions chaleureusement." :
            locale === 'de' ? "Sie erhalten diese E-Mail, weil Sie gerade einen Vertrag mit der Firma <strong>ROD TECH SOLUTIONS</strong> für eine Dienstleistung oder Wartung im Bereich der Informationstechnologie <strong>(Webentwicklung)</strong> unterzeichnet haben. Wir danken Ihnen herzlich dafür." :
            "You are receiving this email because you have just signed a contract with the company <strong>ROD TECH SOLUTIONS</strong> for an IT service or maintenance <strong>(Web Development)</strong>. We warmly thank you for this."}
            </p>
            <p>
            ${locale === 'fr' ? "Vous trouverez en pièce jointe votre contrat signé (version traduite et version originale) par les deux parties et un document contenant les instructions de paiement." :
            locale === 'de' ? "Im Anhang finden Sie Ihren von beiden Parteien unterzeichneten Vertrag (übersetzte Version und Originalversion) sowie ein Dokument mit Zahlungsanweisungen." :
            "You will find attached your contract signed by both parties and a document containing the payment instructions."}
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
            subject: data.subject,
            attachments: attachementNotFRContract ? [attachementContrat,attachementPayment,attachementNotFRContract] : [attachementContrat,attachementPayment],
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
      <p style="text-align:right;">${lang === 'fr' ? 'L\'équipe Rod Coding' : lang === 'de' ? 'Die Rod Coding-Team' : 'The Rod Coding Team'}</p>
    </body>
    </html>`
}

export {sendEmailContact,sendInvoice,sendContract,sendEmailForFillingContract};