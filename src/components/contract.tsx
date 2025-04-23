"use client"
import { AppContext } from "@/app/context/app-context";
import { useTranslationContext } from "@/hooks/app-hook";
import { getDoc, doc, updateDoc } from 'firebase/firestore';
import { useState, useContext, useEffect } from "react";
import { useForm } from "react-hook-form";
import InitCanvaSignature from "./initCanvaSignature";
import firebase from '@/utils/firebase'; // Importez votre configuration Firebase
import { useParams } from "next/navigation";
import { PDFDocument, PDFFont, PDFPage, RGB, rgb, StandardFonts } from "pdf-lib";
import Icon from "./Icon";

interface Client {
    id: string;
    name: string;
    contractStatus: 'signed' | 'unsigned' | 'pending';
    lastContact: Date;
}

interface Contract {
    name:string;
    clientAddress:string;
    clientBillingAddress?:string;
    clientEmail:string;
    clientPhone:string;
    clientSIRET?:string;
    clientVAT?:string;
    freelancerName:string;
    freelancerSirets?:string;
    freelancerVAT?:string;
    freelanceAdresse:string;
    projectTitle:string;
    projectDescription:string;
    projectFonctionList:string[];
    deliverables:string;
    startDate:string;
    endDate?:string;
    totalPrice:number;
    paymentMethod:string;
    paymentSchedule:string;
    confidentiality:boolean;
    terminationTerms:string;
    governingLaw:string;
    effectiveDate:string;
}

interface ContractProps{
    locale:string
}

const Contrat:React.FC<ContractProps> = ({locale})=>{
    const t:any = useTranslationContext();
    const [isPopUp,setIsPopUp] = useState<boolean>(false)
    const [loading, setLoading] = useState(true);
    const {contextData} = useContext(AppContext)
    const [signingLink, setSigningLink] = useState<string | null>(null);
    const [fonctionalityList, setFonctionalityList] = useState<string[]>([])
    const [fonction, setFonction] = useState<string>('')
    const [client, setClient] = useState<Client|null>(null)
    // Contenu dynamique basé sur la langue
    
    const {id} = useParams()
    const clientId = id as string
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors,isValid },
    } = useForm();

    const onSubmit = (data:any) => {
        console.log("Contract Data:", data);
        // Generate PDF or send data to backend
    };
    
    const handleSignatureChange = (data:any)=>{
        console.log("data",data)
        setSigningLink(data)
    }
    const checkValidation = ()=>{
        return isValid && signingLink !== null
    }
    const getStatusText = (status: string) => {
        if(!status) return 'Statut inconnu';
        switch (status) {
        case 'signed': return 'Contrat signé';
        case 'pending': return 'En cours de signature';
        case 'unsigned': return 'Contrat non signé';
        default: return 'Statut inconnu';
        }
    };
    const getStatusClass = (status: string) => {
        if(!status) return 'bg-gray-100 text-gray-800';
        switch (status) {
        case 'signed': return 'bg-green-100 text-green-800';
        case 'pending': return 'bg-yellow-100 text-yellow-800';
        case 'unsigned': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
        }
    };
    // Obtenir l'icône en fonction du statut
    const getStatusIcon = (status: string) => {
        if(!status) return 'bx bx-question-mark';
        switch (status) {
        case 'signed': return 'bx bx-check-circle';
        case 'pending': return 'bx bx-time';
        case 'unsigned': return 'bx bx-error-circle';
        default: return 'bx bx-question-mark';
        }
    };
    const handlePdf = async(data:Contract)=>{
        //if(!signingLink) return
        console.log("start fontion")
        const content = {
            title: "CONTRAT DE PRESTATION DE SERVICE - WEB "+data.projectTitle,
            sousTitle: "Entre les soussignées :",
            clientName: `${data.name}`,
            freelanceName: `${data.freelancerName}`,
            preambleAdresseClient:`domicilié(e) à ${data.clientAddress} ci aprés désigné par le`,
            from:'Client,',
            preambleAdresseFreelance:`domicilié(e) à ${data.freelanceAdresse} ci aprés désigné par le`,
            to:"Prestataire de services.",
            and:"et"
            // Ajoutez toutes les autres sections ici...
        };
        try {
            console.log("try fontion")
            // Création d'un nouveau document PDF
            const pdfDoc = await PDFDocument.create();
            const page = pdfDoc.addPage([595, 842]); // Format A4
            
            // Chargement des polices
            const [fontRegular, fontBold, fontItalic, fontBoldItalic] = await Promise.all([
                pdfDoc.embedFont('Helvetica'),               // Normal
                pdfDoc.embedFont('Helvetica-Bold'),          // Gras
                pdfDoc.embedFont('Helvetica-Oblique'),       // Italique
                pdfDoc.embedFont('Helvetica-BoldOblique'),   // Gras + Italique
            ]);
      
            // Dimensions utiles
            const { width, height } = page.getSize();
            const margin = 50;
            const lineHeight = 14;
      
            //const signatureImage = await pdfDoc.embedPng(signingLink);
            //page.drawImage(signatureImage, { x: 50, y: 250, width: 200, height: 80 });
      
            // Position initiale
            let yPosition = height - margin;


            // Titre
            addText(content.title, margin, yPosition,margin, {size:18, isBold:true,font:fontRegular,fontBold:fontBold,page:page,lineHeight:lineHeight});
            yPosition -= lineHeight * 2;

            // Sous Titre
            addText(content.sousTitle, margin, yPosition, margin, {size:9, isBold:true,font:fontRegular,fontBold:fontBold,page:page,lineHeight:lineHeight});
            yPosition -= lineHeight * 2;

            // Préambule
            const final1 = addHorizontalText([{text:content.clientName,size:11,isBold:true,color:rgb(0, 0, 0)},{text:content.preambleAdresseClient,size:11,isBold:false,color:rgb(0, 0, 0)},{text:content.from,size:11,isBold:true,color:rgb(0, 0, 0)}],margin+30,yPosition,true,margin,fontRegular,fontBold,{page,defaultSpacing:5,lineHeight})
            yPosition = final1.finalY - lineHeight;
            
            addText(content.and, margin, yPosition,margin, {size:11, isBold:true,font:fontRegular,fontBold:fontBold,page:page,lineHeight:lineHeight});
            yPosition -= lineHeight * 2;

            const final2 = addHorizontalText([{text:content.freelanceName,size:11,isBold:true,color:rgb(0, 0, 0)},{text:content.preambleAdresseFreelance,size:11,isBold:false,color:rgb(0, 0, 0)},{text:content.to,size:11,isBold:true,color:rgb(0, 0, 0)}],margin+30,yPosition,true,margin,fontRegular,fontBold,{page,defaultSpacing:5,lineHeight})
            yPosition = final2.finalY - (lineHeight * 1.5);
            addText('(le client et le prestataire de services ci-après collectivement appelés "les parties")', margin, yPosition,margin, {size:9, isBold:true,font:fontRegular,fontBold:fontBoldItalic,page:page,lineHeight:lineHeight});
            yPosition -= lineHeight * 4;
            // Sections du contrat (ajoutez toutes les sections nécessaires)
            addText('1 - PRÉAMBULE', margin, yPosition,margin, {size:16, isBold:true,font:fontRegular,fontBold:fontBold,page:page,lineHeight:lineHeight});
            yPosition -= lineHeight * 2;
            const final3 = addHorizontalText([{text:'CONSIDÉRANT QUE',size:12,isBold:true,color:rgb(0, 0, 0)},{text:'le client désire obtenir divers services informatiques de la part du prestataire de services;',size:11,isBold:false,color:rgb(0, 0, 0)}],margin,yPosition,false,margin,fontRegular,fontBold,{page,defaultSpacing:5,lineHeight})
            yPosition = final3.finalY - (lineHeight * 2.5);
            const final4 = addHorizontalText([{text:'CONSIDÉRANT QUE',size:12,isBold:true,color:rgb(0, 0, 0)},{text:'les parties désirent confirmer leur entente par écrit;',size:11,isBold:false,color:rgb(0, 0, 0)}],margin,yPosition,false,margin,fontRegular,fontBold,{page,defaultSpacing:5,lineHeight})
            yPosition = final4.finalY - (lineHeight * 2.5);
            const final5 = addHorizontalText([{text:'CONSIDÉRANT QUE',size:12,isBold:true,color:rgb(0, 0, 0)},{text:"les parties ont la capacité et la qualité d'exercer tous les droits requis pour la conclusion et l'exécution de l'entente constatée dans le présent contrat;",size:11,isBold:false,color:rgb(0, 0, 0)}],margin,yPosition,false,margin,fontRegular,fontBold,{page,defaultSpacing:5,lineHeight})
            yPosition = final5.finalY - (lineHeight * 2.5);
            const spaceY = addText('EN CONSÉQUENCE DE CE QUI PRÉCÈDE, LES PARTIES CONVIENNENT DE CE QUI SUIT:', margin, yPosition,margin, {size:12, isBold:true,font:fontRegular,fontBold:fontBold,page:page,lineHeight:lineHeight});
            yPosition -= lineHeight * (spaceY + 4);
            // ... Ajoutez toutes les autres sections du contrat ici
            //OBJET DU CONTRAT
            addText('2 - OBJET', margin, yPosition,margin, {size:16, isBold:true,font:fontRegular,fontBold:fontBold,page:page,lineHeight:lineHeight});
            yPosition -= lineHeight * 2;
            addText('2.1 - Services', margin, yPosition,margin, {size:13, isBold:false,font:fontRegular,fontBold:fontBold,page:page,lineHeight:lineHeight});
            yPosition -= lineHeight * 2;
            //SERVICE PROPOSE
            const spaceY1 = addText("Le prestataire de services s'engage envers le client à fournir les services informatiques (ci-après appelés 'les services') décrits dans les spécifications qui figurent dans la séction 'Déscription et Fonctionnalités clés du projet', ou, à défaut, dans le devis.", margin, yPosition,margin, {size:11, isBold:false,font:fontRegular,fontBold:fontBold,page:page,lineHeight:lineHeight});
            yPosition -= lineHeight * (spaceY1 + 2);
            addText('2.2 - Délai de fourniture des services', margin, yPosition,margin, {size:13, isBold:false,font:fontRegular,fontBold:fontBold,page:page,lineHeight:lineHeight});
            yPosition -= lineHeight * 2;
            const spaceY2 = addText("À compter du moment où le client a fourni au prestataire de services les éléments d'information et sous réserve de tout service additionnel requis par le client après la signature du présent contrat, le délai de fourniture des services par le prestataire de services est celui indiqué dans les spécifications.", margin, yPosition,margin, {size:11, isBold:false,font:fontRegular,fontBold:fontBold,page:page,lineHeight:lineHeight});
            yPosition -= lineHeight * (spaceY2 + 4);
            //DESCRIPTION DU PROJET PLUS FONCTIONNALITE
            addText('3 - DESCRPTION ET FONCTIONNALITÉS CLES DU PROJET', margin, yPosition,margin, {size:16, isBold:true,font:fontRegular,fontBold:fontBold,page:page,lineHeight:lineHeight});
            yPosition -= lineHeight * 2;
            addText('3.1 - Déscription', margin, yPosition,margin, {size:13, isBold:false,font:fontRegular,fontBold:fontBold,page:page,lineHeight:lineHeight});
            yPosition -= lineHeight * 2;
            //AJOUT DESCRIPTION DU PROJET
            addText(data.projectDescription, margin, yPosition,margin, {size:11, isBold:false,font:fontRegular,fontBold:fontBold,page:page,lineHeight:lineHeight});
            yPosition -= lineHeight * 2;
            addText('3.2 - Fonctionnalités', margin, yPosition,margin, {size:13, isBold:false,font:fontRegular,fontBold:fontBold,page:page,lineHeight:lineHeight});
            yPosition -= lineHeight * 4;
            //AJOUT FONCTIONNALITE
            data.projectFonctionList.forEach((item)=>{
                addText(item, margin+30, yPosition,margin, {size:11,isBold:false,font:fontRegular,fontBold:fontBold,page:page,lineHeight:lineHeight,isListItem:true})
                yPosition -= lineHeight * 1.5;
            })
            //PRIX
            addText('4 - CONSIDÉRATION', margin, yPosition,margin, {size:16, isBold:true,font:fontRegular,fontBold:fontBold,page:page,lineHeight:lineHeight});
            yPosition -= lineHeight * 2;
            addText('4.1 - Prix des services', margin, yPosition,margin, {size:13, isBold:false,font:fontRegular,fontBold:fontBold,page:page,lineHeight:lineHeight});
            yPosition -= lineHeight * 2;
            const spaceY3 = addText("En considération de la fourniture des services, le client doit payer au prestataire de services le prix indiqué dans les spécifications, ainsi que toutes les taxes applicables.", margin, yPosition,margin, {size:11, isBold:false,font:fontRegular,fontBold:fontBold,page:page,lineHeight:lineHeight});
            yPosition -= lineHeight * (spaceY3 + 2);
            addText('4.2 - Termes et conditions de paiement', margin, yPosition,margin, {size:13, isBold:false,font:fontRegular,fontBold:fontBold,page:page,lineHeight:lineHeight});
            yPosition -= lineHeight * 2;
            const spaceY4 = addText("Le prix est payable par le client au prestataire de services selon les termes et conditions de paiement indiqués dans les spécifications.", margin, yPosition,margin, {size:11, isBold:false,font:fontRegular,fontBold:fontBold,page:page,lineHeight:lineHeight});
            yPosition -= lineHeight * (spaceY4 + 2);
            addText('(Les modalités et coordonnées de paiement sont indiqués en annexe de ce contrat")', margin, yPosition,margin, {size:9, isBold:true,font:fontRegular,fontBold:fontBoldItalic,page:page,lineHeight:lineHeight});
            yPosition -= lineHeight * 4;
            //DISPOSITION PARTICULIER
            addText('5 - DISPOSITIONS PARTICULIÈRES', margin, yPosition,margin, {size:16, isBold:true,font:fontRegular,fontBold:fontBold,page:page,lineHeight:lineHeight});
            yPosition -= lineHeight * 2;
            addText('5.1 - Représentants des parties', margin, yPosition,margin, {size:13, isBold:false,font:fontRegular,fontBold:fontBold,page:page,lineHeight:lineHeight});
            yPosition -= lineHeight * 2;
            const spaceY5 = addText("Chacune des parties reconnaît que la personne qu'elle désigne dans les spécifications (ou toute personne remplaçant la personne désignée, après avis en ce sens donné à l'autre partie) la représente et a toute autorité pour poser les actes, prendre les décisions et donner les autorisations requises relativement à l'exécution du présent contrat.", margin, yPosition,margin, {size:11, isBold:false,font:fontRegular,fontBold:fontBold,page:page,lineHeight:lineHeight});
            yPosition -= lineHeight * (spaceY5 + 2);
            addText('5.2 - Communications électroniques', margin, yPosition,margin, {size:13, isBold:false,font:fontRegular,fontBold:fontBold,page:page,lineHeight:lineHeight});
            yPosition -= lineHeight * 2;
            const spaceY6 = addText("Les représentants des parties peuvent communiquer entre eux par voie électronique. Dans un tel cas, les présomptions suivantes s'appliquent:", margin, yPosition,margin, {size:11, isBold:false,font:fontRegular,fontBold:fontBold,page:page,lineHeight:lineHeight});
            yPosition -= lineHeight * (spaceY6 + 2);
            const spaceY7 = addText("la présence d'un code d'identification dans un document électronique est suffisante pour identifier la personne émettrice et pour établir l'authenticité dudit document; un document électronique contenant un code d'identification constitue un écrit signé par la personne émettrice; un document électronique ou toute sortie imprimée d'un tel document, conservée conformément aux pratiques commerciales habituelles, est considéré comme un original.", margin, yPosition,margin, {size:11, isBold:false,font:fontRegular,fontBold:fontBold,page:page,lineHeight:lineHeight});
            yPosition -= lineHeight * (spaceY7 + 2);
            addText('5.3 - Obligations du client', margin, yPosition,margin, {size:13, isBold:false,font:fontRegular,fontBold:fontBold,page:page,lineHeight:lineHeight});
            yPosition -= lineHeight * 2;
            addText("Le client s'engage et s'oblige envers le prestataire de services à ce qui suit:", margin, yPosition,margin, {size:11, isBold:false,font:fontRegular,fontBold:fontBold,page:page,lineHeight:lineHeight});
            yPosition -= lineHeight * 4;
            addText("a) Le client doit fournir au prestataire de services les éléments d'information dans la forme et à l'intérieur des délais prévus dans les spécifications;", margin, yPosition,margin, {size:11, isBold:false,font:fontRegular,fontBold:fontBold,page:page,lineHeight:lineHeight});
            yPosition -= lineHeight * 1;
            const final6 = addHorizontalText([{text:"b) Les éléments d'information doivent respecter toutes les lois et tous les règlements applicables, notamment la",size:11, isBold:false}, {text:"RGPD et autres directives pour le respect de la vie privée;",size:11, isBold:true}],yPosition,margin, false,margin,fontRegular,fontBold,{page,defaultSpacing:5,lineHeight});
            yPosition = final6.finalY - (lineHeight * 1);
            const spaceY8 = addText("c) La fourniture des éléments d'information par le client ne doit violer aucune obligation de confidentialité ou de non-divulgation et doit permettre au prestataire de services de les utiliser librement et sans contrainte dans le cadre de la fourniture des services;", margin, yPosition,margin, {size:11, isBold:false,font:fontRegular,fontBold:fontBold,page:page,lineHeight:lineHeight});
            yPosition -= lineHeight * (spaceY8 + 1);
            const spaceY9 = addText("d) Le client doit fournir au prestataire de services, sur demande de celui-ci, la preuve de son droit, titre ou intérêt de propriété intellectuelle dans tout élément d'information;", margin, yPosition,margin, {size:11, isBold:false,font:fontRegular,fontBold:fontBold,page:page,lineHeight:lineHeight});
            yPosition -= lineHeight * (spaceY9 + 1);
            const spaceY10 = addText("e) Le client doit apporter au prestataire de services toute sa collaboration et lui fournir toute l'information requise pour assurer l'exécution fidèle et complète des services à être rendus;", margin, yPosition,margin, {size:11, isBold:false,font:fontRegular,fontBold:fontBold,page:page,lineHeight:lineHeight});
            yPosition -= lineHeight * (spaceY10 + 1);
            const spaceY11 = addText("f) À moins d'un motif sérieux, le client doit donner au prestataire de services, sur demande de celui-ci, son approbation du travail effectué au terme de chacune des phases de prestation de services indiquées dans les spécifications;", margin, yPosition,margin, {size:11, isBold:false,font:fontRegular,fontBold:fontBold,page:page,lineHeight:lineHeight});
            yPosition -= lineHeight * (spaceY11 + 1);
            const spaceY12 = addText("g) Le client est seul responsable du contenu des équipements informatiques et des dommages pouvant découler de leur utilisation;", margin, yPosition,margin, {size:11, isBold:true,font:fontRegular,fontBold:fontBold,page:page,lineHeight:lineHeight});
            yPosition -= lineHeight * (spaceY12 + 1);
            const final7 = addHorizontalText([{text:"h) Le client doit prendre fait et cause du prestataire de services si ce dernier est mis en cause ou porté partie dans une procédure judiciaire intentée par une tierce personne et alléguant une faute du prestataire de services découlant de l'utilisation des équipements informatiques ou des informations qui y sont contenues, et",size:11, isBold:false}, {text:"indemniser le prestataire de services de toute condamnation monétaire en capital et intérêts ainsi que de tous les frais judiciaires et extrajudiciaires que le prestataire de services peut encourir en conséquence;",size:11, isBold:true}],yPosition,margin, false,margin,fontRegular,fontBold,{page,defaultSpacing:5,lineHeight});
            yPosition = final7.finalY - (lineHeight * 1);
            const spaceY13 = addText("i) Le client doit payer le prix des services du prestataire de services, payer le prix de tout service additionnel qu'il pourrait requérir ultérieurement à la signature du présent contrat ainsi que rembourser les dépenses encourues, conformément aux termes et conditions de paiement prévus dans les spécifications;", margin, yPosition,margin, {size:11, isBold:false,font:fontRegular,fontBold:fontBold,page:page,lineHeight:lineHeight});
            yPosition -= lineHeight * (spaceY13 + 1);
            const spaceY14 = addText("j) Le client doit aviser le prestataire de services sans délai si son représentant indiqué dans les spécifications est remplacé en cours d'exécution du contrat par une autre personne.", margin, yPosition,margin, {size:11, isBold:false,font:fontRegular,fontBold:fontBold,page:page,lineHeight:lineHeight});
            yPosition -= lineHeight * (spaceY14 + 2);
            addText('5.4 - Obligations du prestataire de services', margin, yPosition,margin, {size:13, isBold:false,font:fontRegular,fontBold:fontBold,page:page,lineHeight:lineHeight});
            yPosition -= lineHeight * 2;
            yPosition -= lineHeight * 4;
            // Signatures
            yPosition -= lineHeight * 4;
            signatureBloc(['Signature du prestataire','Signature du client'],yPosition,page,margin,margin,11,true,fontRegular,fontBold)
            yPosition -= lineHeight * 4;
            signatureBloc([formatDate(data.effectiveDate)+':___________________________',formatDate(data.effectiveDate)+':___________________________'],yPosition,page,margin,margin,10,false,fontRegular,fontBold)

            // Génération du PDF final
            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            /*const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `document-signé-${data.name}.pdf`;
            link.innerText = 'Télécharger le document signé';
            setTimeout(() => {
                document.querySelector('body form')?.appendChild(link);
            }, 0);
            console.log("end fontion")*/
            return URL.createObjectURL(blob);
            //return await pdfDoc.save();
        } catch (error) {
            console.error('Erreur lors de la génération du PDF:', error);
            alert('Une erreur est survenue.');
        }
    }
    // Fonction utilitaire pour ajouter du texte multiligne
    const addText = (
        text: string,
        x: number,
        y: number,
        rightMargin: number,
        options: {
          size?: number;
          isBold?: boolean;
          font: PDFFont;
          fontBold: PDFFont;
          page: PDFPage;
          lineHeight: number;
          isListItem?: boolean; // Nouveau : élément de liste
          bulletSymbol?: string; // Symbole de puce (défaut: "•")
          maxWidth?: number; // Largeur maximale avant retour automatique
        }
      ) => {
        const {
          size = 12,
          isBold = false,
          font,
          fontBold,
          page,
          lineHeight,
          isListItem = false,
          bulletSymbol = "• ",
          maxWidth = Infinity
        } = options;
      
        const currentFont = isBold ? fontBold : font;
        const pageWidth = page.getSize().width;
        const effectiveMaxWidth = Math.min(
          maxWidth,
          pageWidth - x - rightMargin
        );
        let currentY = y;
        let totalLines = 0;
      
        // Gestion des puces
        const prefix = isListItem ? bulletSymbol : "";
        const prefixWidth = isListItem 
          ? currentFont.widthOfTextAtSize(prefix, size)
          : 0;
      
        const processLine = (line: string, isFirstLine: boolean) => {
          let currentX = x + (isFirstLine ? 0 : prefixWidth);
          const words = line.split(' ');
          let currentLine = isFirstLine ? prefix + words[0] : words[0];
      
          for (let i = 1; i < words.length; i++) {
            const testLine = `${currentLine} ${words[i]}`;
            const testWidth = currentFont.widthOfTextAtSize(testLine, size);
      
            if (testWidth > effectiveMaxWidth) {
              // Dessiner la ligne actuelle
              page.drawText(currentLine, {
                x: currentX,
                y: currentY,
                size,
                font: currentFont,
                color: rgb(0, 0, 0),
              });
              currentY -= lineHeight;
              totalLines++;
              currentX = x + prefixWidth;
              currentLine = words[i];
            } else {
              currentLine = testLine;
            }
          }
      
          // Dessiner le reste de la ligne
          if (currentLine) {
            page.drawText(currentLine, {
              x: currentX,
              y: currentY,
              size,
              font: currentFont,
              color: rgb(0, 0, 0),
            });
            totalLines++;
          }
        };
      
        // Traitement des sauts de ligne manuels (\n)
        text.split('\n').forEach((paragraph, i) => {
          if (i > 0) {
            currentY -= lineHeight;
            totalLines++;
          }
          processLine(paragraph, i === 0);
        });
      
        return totalLines;
    };

    const signatureBloc = (
        items: string[],
        y: number,
        page: PDFPage,
        marginLeft: number,
        marginRight: number,
        size: number = 12,
        isBold: boolean = false,
        font: PDFFont,
        fontBold: PDFFont
    ) => {
        const pageWidth = page.getWidth();
        const availableWidth = pageWidth - marginLeft - marginRight;
        
        // Gestion de la police
        const currentFont = isBold ? fontBold : font;
        
        // Cas particulier s'il n'y a qu'un seul élément
        if (items.length === 1) {
            const textWidth = currentFont.widthOfTextAtSize(items[0], size);
            const x = marginLeft + (availableWidth - textWidth) / 2;
            
            page.drawText(items[0], {
                x,
                y,
                size,
                font: currentFont,
                color: rgb(0, 0, 0),
            });
            return;
        }
        
        // Calcul des largeurs de chaque élément
        const textWidths = items.map(item => currentFont.widthOfTextAtSize(item, size));
        const totalWidth = textWidths.reduce((sum, width) => sum + width, 0);
        
        // Calcul de l'espacement seulement si on a assez de place
        if (availableWidth > totalWidth) {
            const gap = (availableWidth - totalWidth) / (items.length - 1);
            let currentX = marginLeft;
            
            items.forEach((item, index) => {
                page.drawText(item, {
                    x: currentX,
                    y,
                    size,
                    font: currentFont,
                    color: rgb(0, 0, 0),
                });
                currentX += textWidths[index] + gap;
            });
        } else {
            // Mode "compact" si l'espace est insuffisant
            let currentX = marginLeft;
            const gap = 10; // Espacement minimal
            
            items.forEach((item, index) => {
                page.drawText(item, {
                    x: currentX,
                    y,
                    size,
                    font: currentFont,
                    color: rgb(0, 0, 0),
                });
                currentX += textWidths[index] + gap;
            });
        }
    };
    const addHorizontalText = (
        textEntries: {
            text: string;
            size?: number;
            isBold?: boolean;
            color?: RGB;
        }[],
        startX: number,
        startY: number,
        isListItem: boolean,
        rightMargin: number,
        font: PDFFont,
        fontBold: PDFFont,
        context: {
            page: PDFPage;
            defaultSpacing?: number;
            maxWidth?: number;
            bulletSymbol?: string;
            lineHeight: number;
        }
        ) => {
        const {
            page,
            defaultSpacing = 2,
            lineHeight,
            maxWidth = Infinity,
            bulletSymbol = "• "
        } = context;

        let currentX = startX;
        let currentY = startY;
        const pageWidth = page.getSize().width;
        const effectiveRightMargin = pageWidth - rightMargin;

        // Gestion de la puce (une seule fois pour tout le bloc)
        if (isListItem) {
            const bulletSize = textEntries[0]?.size || 12;
            page.drawText(bulletSymbol, {
            x: currentX,
            y: currentY,
            size: bulletSize,
            font,
            color: rgb(0, 0, 0),
            });
            currentX += font.widthOfTextAtSize(bulletSymbol, bulletSize) + defaultSpacing;
        }

        // Nouveau : Calcul de la largeur disponible
        const getAvailableWidth = () => effectiveRightMargin - currentX;

        textEntries.forEach((entry) => {
            const { text, size = 12, isBold = false, color = rgb(0, 0, 0) } = entry;
            const currentFont = isBold ? fontBold : font;
            const words = text.split(' ');
            let currentLine = '';

            words.forEach((word) => {
            const testLine = currentLine ? `${currentLine} ${word}` : word;
            const testWidth = currentFont.widthOfTextAtSize(testLine, size);

            // Vérification contre la marge droite ET maxWidth
            if (testWidth > Math.min(getAvailableWidth(), maxWidth)) {
                // Dessiner la ligne actuelle
                page.drawText(currentLine, {
                x: currentX,
                y: currentY,
                size,
                font: currentFont,
                color,
                });

                // Nouvelle ligne avec gestion de l'indentation
                currentY -= lineHeight;
                currentX = isListItem 
                ? startX + font.widthOfTextAtSize(bulletSymbol, size) + defaultSpacing
                : startX;
                
                currentLine = word;
            } else {
                currentLine = testLine;
            }
            });

            // Dessiner le reste du texte
            if (currentLine) {
            // Vérification finale de la largeur
            const lineWidth = currentFont.widthOfTextAtSize(currentLine, size);
            if (currentX + lineWidth > effectiveRightMargin) {
                currentY -= lineHeight;
                currentX = isListItem 
                ? startX + font.widthOfTextAtSize(bulletSymbol, size) + defaultSpacing
                : startX;
            }

            page.drawText(currentLine, {
                x: currentX,
                y: currentY,
                size,
                font: currentFont,
                color,
            });
            currentX += currentFont.widthOfTextAtSize(currentLine, size) + defaultSpacing;
            }
        });

        return { finalX: currentX, finalY: currentY };
    };
    useEffect(() => {
        async function getDocumentById(collectionName: string, id: string) {
            if(!id) return
            const docRef = doc(firebase.db, collectionName, id);
            const docSnap = await getDoc(docRef);
          
            if (docSnap.exists()) {
              const client:any = { id: docSnap.id, ...docSnap.data() };
              setClient(client);
              reset(client);
              setLoading(false);
            } else {
              console.log("Document non trouvé !");
              return null;
            }
            const pdfUrl = await handlePdf({name:"Test Name",freelancerName:"ROD TECH SOLUTIONS",freelanceAdresse:'123 Rue Saint-Sébastien, Poissy 78300, France',freelancerSirets:"SIRET",freelancerVAT:"",clientEmail:"test@mail.com",clientAddress:"123 rue Saint-Sébastien, Poissy 78300, France",clientSIRET:"",clientPhone:"7845 454 12",confidentiality:true,projectTitle:"SIte Web",projectDescription:"Test du site",startDate:new Date().toISOString(),endDate:new Date().toISOString(),effectiveDate:new Date().toISOString(),deliverables:"50%",totalPrice:700,paymentMethod:"Bank Transfer",paymentSchedule:"50",terminationTerms:"50",governingLaw:"French Law",projectFonctionList:["Fonction1","Fonction2","Fonction4","Fonction4"]})
            window.open(pdfUrl, '_blank');
        }
        getDocumentById("clients",clientId);
    }, []);
    useEffect(()=>{
        if (contextData && (contextData.state === "hide" || contextData.state === "show")) {
            console.log("inside contextData",contextData)
            setIsPopUp(contextData.value)
        }
    },[contextData])

    const formatDate = (date:string)=>{
        const fdate = new Date(date)
        const day = fdate.getDate();
        const month = fdate.getMonth() + 1; // Les mois commencent à 0
        const year = fdate.getFullYear();
        if (locale === "en") {
            return `${year}/${String(month).padStart(2, '0')}/${day}`;
        }
        return `${day}/${String(month).padStart(2, '0')}/${year}`;
    }
    if (loading) return <div className="text-center py-8 mt-[110px] h-[200px] flex justify-center items-center w-[85%] mx-auto">Chargement...</div>;
    return (
        <main className={`transition-transform duration-700 delay-300 ease-in-out ${isPopUp ? 'translate-x-[-25vw]' : 'translate-x-0'} w-[85%] mt-[110px] mx-auto`}>
            <h1 className="text-center text-thirty uppercase">{t["contrat"]}</h1>
            <div className="max-w-3xl mx-auto p-6 bg-white shadow-md rounded-lg">
                <h1 className="text-2xl font-bold mb-6 flex justify-start items-center gap-2">Freelance Web Development Contract <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(client?.contractStatus ?? '')}`}><i className={`${getStatusIcon(client?.contractStatus ?? '')} mr-1`}></i>{getStatusText(client?.contractStatus ?? '')}</span></h1>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* === Client Information === */}
                    <section className="border-b pb-6">
                    <h2 className="text-xl font-semibold mb-4">Client Information</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Full Name / Business Name*
                        </label>
                        <input
                            {...register("name", { required: "This field is required" })}
                            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                        />
                        {errors.name && (
                            <p className="text-red-500 text-sm mt-1">{errors.name.message as string}</p>
                        )}
                        </div>

                        <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Postal Address*
                        </label>
                        <input
                            {...register("clientAddress", { required: "This field is required" })}
                            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                        />
                        {errors.clientAddress && (
                            <p className="text-red-500 text-sm mt-1">{errors.clientAddress.message as string}</p>
                        )}
                        </div>
                    </div>

                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700">
                        Billing Address (if different)
                        </label>
                        <input
                        {...register("clientBillingAddress")}
                        className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div>
                        <label className="block text-sm font-medium text-gray-700">Email*</label>
                        <input
                            type="email"
                            {...register("clientEmail", {
                            required: "Email is required",
                            pattern: {
                                value: /^\S+@\S+$/i,
                                message: "Invalid email format",
                            },
                            })}
                            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                        />
                        {errors.clientEmail && (
                            <p className="text-red-500 text-sm mt-1">{errors.clientEmail.message as string}</p>
                        )}
                        </div>

                        <div>
                        <label className="block text-sm font-medium text-gray-700">Phone*</label>
                        <input
                            type="tel"
                            {...register("clientPhone", { required: "Phone is required" })}
                            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                        />
                        {errors.clientPhone && (
                            <p className="text-red-500 text-sm mt-1">{errors.clientPhone.message as string}</p>
                        )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div>
                        <label className="block text-sm font-medium text-gray-700">
                            SIRET/SIREN (if applicable)
                        </label>
                        <input
                            {...register("clientSIRET")}
                            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                        />
                        </div>

                        <div>
                        <label className="block text-sm font-medium text-gray-700">
                            VAT Number (EU)
                        </label>
                        <input
                            {...register("clientVAT")}
                            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                        />
                        </div>
                    </div>
                    </section>

                    {/* === Freelancer Information === */}
                    <section className="border-b pb-6">
                    <h2 className="text-xl font-semibold mb-4">Freelancer Information</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                        <label className="block text-sm font-medium text-gray-700">Full Name*</label>
                        <input
                            {...register("freelancerName", { required: "This field is required" })}
                            className="mt-1 block w-full border border-gray-300 rounded-md p-2" value={'KWAYEP KOUENGA Rodrigue'}
                        />
                        </div>

                        <div>
                        <label className="block text-sm font-medium text-gray-700">Address*</label>
                        <input
                            {...register("freelancerAddress", { required: "This field is required" })}
                            className="mt-1 block w-full border border-gray-300 rounded-md p-2" value={'123 rue Saint-Sébastien, Poissy 78300, France'}
                        />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div>
                        <label className="block text-sm font-medium text-gray-700">SIRET*</label>
                        <input
                            {...register("freelancerSIRET", { required: "This field is required" })}
                            className="mt-1 block w-full border border-gray-300 rounded-md p-2" value={'SIRET'}
                        />
                        </div>

                        <div>
                        <label className="block text-sm font-medium text-gray-700">
                            VAT Number (if applicable)
                        </label>
                        <input
                            {...register("freelancerVAT")}
                            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                        />
                        </div>
                    </div>
                    </section>

                    {/* === Project Details === */}
                    <section className="border-b pb-6">
                    <h2 className="text-xl font-semibold mb-4">Project Details</h2>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Project Title*</label>
                        <input
                        {...register("projectTitle", { required: "This field is required" })}
                        className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                        />
                        {errors.projectTitle && (
                        <p className="text-red-500 text-sm mt-1">{errors.projectTitle.message as string}</p>
                        )}
                    </div>

                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700">Description*</label>
                        <textarea
                        {...register("projectDescription", { required: "This field is required" })}
                        rows={4}
                        className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                        />
                        {errors.projectDescription && (
                        <p className="text-red-500 text-sm mt-1">{errors.projectDescription.message as string}</p>
                        )}
                    </div>

                    <div className="mt-4 w-full">
                        <label className="block text-sm font-medium text-gray-700">Ajouter une fonctionnalité*</label>
                        <div className="flex items-center mt-2 justify-start gap-1 w-full"><input className="p-2 bg-gray-200 w-2/4 focus:outline-none" value={fonction} type="text" onChange={(e)=>setFonction(e.target.value)}/><span className="p-2 cursor-pointer flex justify-start items-center gap-1 w-1/4 bg-slate-800 text-white rounded-[.2em]" onClick={()=>{setFonctionalityList([...fonctionalityList,fonction]);setFonction('')}}><Icon name="bx-plus" size="1.5em" color="#fff"/>Ajouter</span><span className="p-2 cursor-pointer w-1/4 flex justify-start items-center gap-1 bg-slate-800 text-white rounded-[.2em]" onClick={()=>{setFonctionalityList([]);setFonction('')}}><Icon name="bx-trash" size="1.5em" color="#fff"/>Vider la liste</span></div>
                    </div>

                    {
                        fonctionalityList.length > 0 && (
                            <ul className="my-4 mx-4 list-disc">
                                {
                                    fonctionalityList.map((item, index) => (
                                        <li key={index} className={`${index === fonctionalityList.length - 1 ? 'mb-0' : 'mb-2'}`}>{item}</li>
                                    ))
                                }
                            </ul>
                        )
                    }

                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700">Deliverables*</label>
                        <textarea
                        {...register("deliverables", { required: "This field is required" })}
                        rows={3}
                        className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                        />
                        {errors.deliverables && (
                        <p className="text-red-500 text-sm mt-1">{errors.deliverables.message as string}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div>
                        <label className="block text-sm font-medium text-gray-700">Start Date*</label>
                        <input
                            type="date"
                            {...register("startDate", { required: "This field is required" })}
                            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                        />
                        {errors.startDate && (
                            <p className="text-red-500 text-sm mt-1">{errors.startDate.message as string}</p>
                        )}
                        </div>

                        <div>
                        <label className="block text-sm font-medium text-gray-700">
                            End Date (or estimated)
                        </label>
                        <input
                            type="date"
                            {...register("endDate")}
                            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                        />
                        </div>
                    </div>
                    </section>

                    {/* === Payment Terms === */}
                    <section className="border-b pb-6">
                    <h2 className="text-xl font-semibold mb-4">Payment Terms</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                        <label className="block text-sm font-medium text-gray-700">Total Price (€)*</label>
                        <input
                            type="number"
                            {...register("totalPrice", {
                            required: "Price is required",
                            min: { value: 0, message: "Price must be positive" },
                            })}
                            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                        />
                        {errors.totalPrice && (
                            <p className="text-red-500 text-sm mt-1">{errors.totalPrice.message as string}</p>
                        )}
                        </div>

                        <div>
                        <label className="block text-sm font-medium text-gray-700">Payment Method*</label>
                        <select
                            {...register("paymentMethod", { required: "This field is required" })}
                            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                        >
                            <option value="">Select...</option>
                            <option value="Bank Transfer">Bank Transfer</option>
                            <option value="PayPal">PayPal</option>
                            <option value="Check">Check</option>
                        </select>
                        {errors.paymentMethod && (
                            <p className="text-red-500 text-sm mt-1">{errors.paymentMethod.message as string}</p>
                        )}
                        </div>
                    </div>

                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700">Payment Schedule*</label>
                        <textarea
                        {...register("paymentSchedule", { required: "This field is required" })}
                        rows={2}
                        className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                        placeholder="50% au début, 50% a la livraison"
                        />
                        {errors.paymentSchedule && (
                        <p className="text-red-500 text-sm mt-1">{errors.paymentSchedule.message as string}</p>
                        )}
                    </div>
                    </section>

                    {/* === Legal Clauses === */}
                    <section className="pb-6">
                    <h2 className="text-xl font-semibold mb-4">Legal Clauses</h2>

                    <div className="flex items-start">
                        <div className="flex items-center h-5">
                        <input
                            type="checkbox"
                            {...register("confidentiality")}
                            defaultChecked
                            className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                        />
                        </div>
                        <div className="ml-3 text-sm">
                        <label className="font-medium text-gray-700">Confidentiality Agreement</label>
                        <p className="text-gray-500">
                            The freelancer agrees not to disclose any confidential information.
                        </p>
                        </div>
                    </div>

                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700">
                        Termination Terms*
                        </label>
                        <textarea
                        {...register("terminationTerms", { required: "This field is required" })}
                        rows={3}
                        className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                        placeholder="Example: Either party may terminate with 14 days' notice."
                        />
                        {errors.terminationTerms && (
                        <p className="text-red-500 text-sm mt-1">{errors.terminationTerms.message as string}</p>
                        )}
                    </div>

                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700">Governing Law*</label>
                        <select
                        {...register("governingLaw", { required: "This field is required" })}
                        className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                        >
                        <option value="French Law">French Law</option>
                        <option value="EU Law">EU Law</option>
                        <option value="Other">Other</option>
                        </select>
                    </div>
                    </section>
                    <section className="signing">
                        <InitCanvaSignature locale={locale} emit={handleSignatureChange}/>
                    </section>
                    {/* Submit Button */}
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            className={`px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 ${checkValidation() ? 'opacity-1' : 'opacity-50'}`} disabled={!checkValidation()}
                        >
                            Generate Contract
                        </button>
                    </div>
                </form>
            </div>
        </main>
    )
    
}

export default Contrat
