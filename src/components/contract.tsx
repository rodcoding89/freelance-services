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
    contractType: "service"|"maintenance";
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
    const handlePdf = async(client:Client,data:Contract)=>{
        //if(!signingLink) return
        console.log("client info",client)
        const content = {
            title: client.contractType === 'service' ? "CONTRAT DE PRESTATION DE SERVICE - "+ data.projectTitle : "CONTRAT DE MAINTENANCE - "+ data.projectTitle,
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
            let page = pdfDoc.addPage([595, 842]); // Format A4
            
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
            const marginBottom = 50;
            const marginTop = 50;
            const lineHeight = 14;
      
            //const signatureImage = await pdfDoc.embedPng(signingLink);
            //page.drawImage(signatureImage, { x: 50, y: 250, width: 200, height: 80 });
      
            // Position initiale
            let yPosition = height - margin;
            const pageRef = { current: page };
            const yRef = { current: yPosition };

            // Titre
            yRef.current = addText(content.title, margin, yRef.current,margin,20, {size:18, isBold:true,font:fontRegular,fontBold:fontBold,lineHeight:lineHeight,topMargin:marginTop,bottomMarginThreshold:marginBottom},pdfDoc,pageRef,yRef);
           // yRef.current -= lineHeight + 3;

            // Sous Titre
            yRef.current = addText(content.sousTitle, margin, yRef.current, margin,10, {size:9, isBold:true,font:fontRegular,fontBold:fontBold,lineHeight:lineHeight,topMargin:marginTop,bottomMarginThreshold:marginBottom},pdfDoc,pageRef,yRef);
           // yRef.current -= lineHeight + 2;

            // Préambule
            const final1 = addHorizontalText([{text:content.clientName,size:11,isBold:true,color:rgb(0, 0, 0)},{text:content.preambleAdresseClient,size:11,isBold:false,color:rgb(0, 0, 0)},{text:content.from,size:11,isBold:true,color:rgb(0, 0, 0)}],margin+30,yRef.current,true,margin,10,fontRegular,fontBold,{horizontalSpacing:5,lineHeight,topMargin:marginTop,bottomMargin:marginBottom},pdfDoc,pageRef,yRef)
            yRef.current = final1.finalY;
            yRef.current = addText(content.and, margin, yRef.current,margin,10, {size:11, isBold:true,font:fontRegular,fontBold:fontBold,lineHeight:lineHeight,topMargin:marginTop,bottomMarginThreshold:marginBottom},pdfDoc,pageRef,yRef);
           // yRef.current -= lineHeight + 2;

            const final2 = addHorizontalText([{text:content.freelanceName,size:11,isBold:true,color:rgb(0, 0, 0)},{text:content.preambleAdresseFreelance,size:11,isBold:false,color:rgb(0, 0, 0)},{text:content.to,size:11,isBold:true,color:rgb(0, 0, 0)}],margin+30,yRef.current,true,margin,10,fontRegular,fontBold,{horizontalSpacing:5,lineHeight,topMargin:marginTop,bottomMargin:marginBottom},pdfDoc,pageRef,yRef)
            yRef.current = final2.finalY;
            yRef.current = addText('(le client et le prestataire de services ci-après collectivement appelés "les parties")', margin, yRef.current,margin,40, {size:9, isBold:true,font:fontRegular,fontBold:fontBoldItalic,lineHeight:lineHeight,topMargin:marginTop,bottomMarginThreshold:marginBottom},pdfDoc,pageRef,yRef);
           // yRef.current -= lineHeight + 8;
            // Sections du contrat (ajoutez toutes les sections nécessaires)
            yRef.current = addText('1 - PRÉAMBULE', margin, yRef.current,margin,15, {size:16, isBold:true,font:fontRegular,fontBold:fontBold,lineHeight:lineHeight,topMargin:marginTop,bottomMarginThreshold:marginBottom},pdfDoc,pageRef,yRef);
           // yRef.current -= lineHeight + 2;
            const final3 = addHorizontalText([{text:'CONSIDÉRANT QUE',size:12,isBold:true,color:rgb(0, 0, 0)},{text:'le client désire obtenir divers services informatiques de la part du prestataire de services;',size:11,isBold:false,color:rgb(0, 0, 0)}],margin,yRef.current,false,margin,10,fontRegular,fontBold,{horizontalSpacing:5,lineHeight,topMargin:marginTop,bottomMargin:marginBottom},pdfDoc,pageRef,yRef)
            yRef.current = final3.finalY;
            const final4 = addHorizontalText([{text:'CONSIDÉRANT QUE',size:12,isBold:true,color:rgb(0, 0, 0)},{text:'les parties désirent confirmer leur entente par écrit;',size:11,isBold:false,color:rgb(0, 0, 0)}],margin,yRef.current,false,margin,10,fontRegular,fontBold,{horizontalSpacing:5,lineHeight,topMargin:marginTop,bottomMargin:marginBottom},pdfDoc,pageRef,yRef)
            yRef.current = final4.finalY;
            const final5 = addHorizontalText([{text:'CONSIDÉRANT QUE',size:12,isBold:true,color:rgb(0, 0, 0)},{text:"les parties ont la capacité et la qualité d'exercer tous les droits requis pour la conclusion et l'exécution de l'entente constatée dans le présent contrat;",size:11,isBold:false,color:rgb(0, 0, 0)}],margin,yRef.current,false,margin,10,fontRegular,fontBold,{horizontalSpacing:5,lineHeight,topMargin:marginTop,bottomMargin:marginBottom},pdfDoc,pageRef,yRef)
            yRef.current = final5.finalY;
            yRef.current = addText('EN CONSÉQUENCE DE CE QUI PRÉCÈDE, LES PARTIES CONVIENNENT DE CE QUI SUIT:', margin, yRef.current,margin,40, {size:12, isBold:true,font:fontRegular,fontBold:fontBold,lineHeight:lineHeight,topMargin:marginTop,bottomMarginThreshold:marginBottom},pdfDoc,pageRef,yRef);
           // yRef.current -= lineHeight + 4
            // ... Ajoutez toutes les autres sections du contrat ici
            //OBJET DU CONTRAT
            yRef.current = addText('2 - OBJET', margin, yRef.current,margin,15, {size:16, isBold:true,font:fontRegular,fontBold:fontBold,lineHeight:lineHeight,topMargin:marginTop,bottomMarginThreshold:marginBottom},pdfDoc,pageRef,yRef);
           // yRef.current -= lineHeight + 2;
            yRef.current = addText('2.1 - Services', margin, yRef.current,margin,10, {size:13, isBold:false,font:fontRegular,fontBold:fontBold,lineHeight:lineHeight,topMargin:marginTop,bottomMarginThreshold:marginBottom},pdfDoc,pageRef,yRef);
           // yRef.current -= lineHeight + 1;
            //SERVICE PROPOSE
            yRef.current = addText("Le prestataire de services s'engage envers le client à fournir les services informatiques (ci-après appelés 'les services') décrits dans les spécifications qui figurent dans la séction 'Déscription et Fonctionnalités clés du projet', ou, à défaut, dans le devis.", margin, yRef.current,margin,15, {size:11, isBold:false,font:fontRegular,fontBold:fontBold,lineHeight:lineHeight,topMargin:marginTop,bottomMarginThreshold:marginBottom},pdfDoc,pageRef,yRef);
           // yRef.current -= lineHeight
            yRef.current = addText('2.2 - Délai de fourniture des services', margin, yRef.current,margin,15, {size:13, isBold:false,font:fontRegular,fontBold:fontBold,lineHeight:lineHeight,topMargin:marginTop,bottomMarginThreshold:marginBottom},pdfDoc,pageRef,yRef);
           // yRef.current -= lineHeight + 1;
            yRef.current = addText("À compter du moment où le client a fourni au prestataire de services les éléments d'information et sous réserve de tout service additionnel requis par le client après la signature du présent contrat, le délai de fourniture des services par le prestataire de services est celui indiqué dans les spécifications.", margin, yRef.current,margin,40, {size:11, isBold:false,font:fontRegular,fontBold:fontBold,lineHeight:lineHeight,topMargin:marginTop,bottomMarginThreshold:marginBottom},pdfDoc,pageRef,yRef);
           // yRef.current -= lineHeight + 4
            //DESCRIPTION DU PROJET PLUS FONCTIONNALITE
            yRef.current = addText('3 - DESCRPTION ET FONCTIONNALITÉS CLES DU PROJET', margin, yRef.current,margin,15, {size:16, isBold:true,font:fontRegular,fontBold:fontBold,lineHeight:lineHeight,topMargin:marginTop,bottomMarginThreshold:marginBottom},pdfDoc,pageRef,yRef);
           // yRef.current -= lineHeight + 2;
            yRef.current = addText('3.1 - Déscription', margin, yRef.current,margin,10, {size:13, isBold:false,font:fontRegular,fontBold:fontBold,lineHeight:lineHeight,topMargin:marginTop,bottomMarginThreshold:marginBottom},pdfDoc,pageRef,yRef);
           // yRef.current -= lineHeight + 1;
            //AJOUT DESCRIPTION DU PROJET
            yRef.current = addText(data.projectDescription, margin, yRef.current,margin,15, {size:11, isBold:false,font:fontRegular,fontBold:fontBold,lineHeight:lineHeight,topMargin:marginTop,bottomMarginThreshold:marginBottom},pdfDoc,pageRef,yRef);
           // yRef.current -= lineHeight + 2;
            yRef.current = addText('3.2 - Fonctionnalités', margin, yRef.current,margin,10, {size:13, isBold:false,font:fontRegular,fontBold:fontBold,lineHeight:lineHeight,topMargin:marginTop,bottomMarginThreshold:marginBottom},pdfDoc,pageRef,yRef);
           // yRef.current -= lineHeight + 1;
            //AJOUT FONCTIONNALITE
            data.projectFonctionList.forEach((item,index)=>{
                yRef.current = addText(item, margin+30, yRef.current,margin,8, {size:11,isBold:false,font:fontRegular,fontBold:fontBold,lineHeight:lineHeight,isListItem:true},pdfDoc,pageRef,yRef);
                if (index === data.projectFonctionList.length - 1) {
                    yRef.current = addText(item, margin+30, yRef.current,margin,40, {size:11,isBold:false,font:fontRegular,fontBold:fontBold,lineHeight:lineHeight,isListItem:true},pdfDoc,pageRef,yRef);
                }
            })
            //PRIX
            yRef.current = addText('4 - CONSIDÉRATION', margin, yRef.current,margin,15, {size:16, isBold:true,font:fontRegular,fontBold:fontBold,lineHeight:lineHeight,topMargin:marginTop,bottomMarginThreshold:marginBottom},pdfDoc,pageRef,yRef);
           // yRef.current -= lineHeight + 2;
            yRef.current = addText('4.1 - Prix des services', margin, yRef.current,margin,10, {size:13, isBold:false,font:fontRegular,fontBold:fontBold,lineHeight:lineHeight,topMargin:marginTop,bottomMarginThreshold:marginBottom},pdfDoc,pageRef,yRef);
           // yRef.current -= lineHeight + 1;
            yRef.current = addText("En considération de la fourniture des services, le client doit payer au prestataire de services le prix indiqué dans les spécifications, ainsi que toutes les taxes applicables.", margin, yRef.current,margin,15, {size:11, isBold:false,font:fontRegular,fontBold:fontBold,lineHeight:lineHeight,topMargin:marginTop,bottomMarginThreshold:marginBottom},pdfDoc,pageRef,yRef);
           // yRef.current -= lineHeight
            yRef.current = addText('4.2 - Termes et conditions de paiement', margin, yRef.current,margin,10, {size:13, isBold:false,font:fontRegular,fontBold:fontBold,lineHeight:lineHeight,topMargin:marginTop,bottomMarginThreshold:marginBottom},pdfDoc,pageRef,yRef);
           // yRef.current -= lineHeight + 1;
            yRef.current = addText("Le prix est payable par le client au prestataire de services selon les termes et conditions de paiement indiqués dans les spécifications.", margin, yRef.current,margin,10, {size:11, isBold:false,font:fontRegular,fontBold:fontBold,lineHeight:lineHeight,topMargin:marginTop,bottomMarginThreshold:marginBottom},pdfDoc,pageRef,yRef);
           // yRef.current -= lineHeight + 1
            yRef.current = addText('(Les modalités et coordonnées de paiement sont indiqués en annexe de ce contrat")', margin, yRef.current,margin,40, {size:9, isBold:true,font:fontRegular,fontBold:fontBoldItalic,lineHeight:lineHeight,topMargin:marginTop,bottomMarginThreshold:marginBottom},pdfDoc,pageRef,yRef);
           // yRef.current -= lineHeight + 4;
            //DISPOSITION PARTICULIER
            yRef.current = addText('5 - DISPOSITIONS PARTICULIÈRES', margin, yRef.current,margin,15, {size:16, isBold:true,font:fontRegular,fontBold:fontBold,lineHeight:lineHeight,topMargin:marginTop,bottomMarginThreshold:marginBottom},pdfDoc,pageRef,yRef);
           // yRef.current -= lineHeight + 2;
            yRef.current = addText('5.1 - Représentants des parties', margin, yRef.current,margin,10, {size:13, isBold:false,font:fontRegular,fontBold:fontBold,lineHeight:lineHeight,topMargin:marginTop,bottomMarginThreshold:marginBottom},pdfDoc,pageRef,yRef);
           // yRef.current -= lineHeight + 1;
            yRef.current = addText("Chacune des parties reconnaît que la personne qu'elle désigne dans les spécifications (ou toute personne remplaçant la personne désignée, après avis en ce sens donné à l'autre partie) la représente et a toute autorité pour poser les actes, prendre les décisions et donner les autorisations requises relativement à l'exécution du présent contrat.", margin, yRef.current,margin,15, {size:11, isBold:false,font:fontRegular,fontBold:fontBold,lineHeight:lineHeight,topMargin:marginTop,bottomMarginThreshold:marginBottom},pdfDoc,pageRef,yRef);
           // yRef.current -= lineHeight + 2
            yRef.current = addText('5.2 - Communications électroniques', margin, yRef.current,margin,10, {size:13, isBold:false,font:fontRegular,fontBold:fontBold,lineHeight:lineHeight,topMargin:marginTop,bottomMarginThreshold:marginBottom},pdfDoc,pageRef,yRef);
           // yRef.current -= lineHeight + 1;
            yRef.current = addText("Les représentants des parties peuvent communiquer entre eux par voie électronique. Dans un tel cas, les présomptions suivantes s'appliquent:", margin, yRef.current,margin,10, {size:11, isBold:false,font:fontRegular,fontBold:fontBold,lineHeight:lineHeight,topMargin:marginTop,bottomMarginThreshold:marginBottom},pdfDoc,pageRef,yRef);
           // yRef.current -= lineHeight + 1
            yRef.current = addText("la présence d'un code d'identification dans un document électronique est suffisante pour identifier la personne émettrice et pour établir l'authenticité dudit document; un document électronique contenant un code d'identification constitue un écrit signé par la personne émettrice; un document électronique ou toute sortie imprimée d'un tel document, conservée conformément aux pratiques commerciales habituelles, est considéré comme un original.", margin, yRef.current,margin,15, {size:11, isBold:false,font:fontRegular,fontBold:fontBold,lineHeight:lineHeight,topMargin:marginTop,bottomMarginThreshold:marginBottom},pdfDoc,pageRef,yRef);
           // yRef.current -= lineHeight + 2
            yRef.current = addText('5.3 - Obligations du client', margin, yRef.current,margin,10, {size:13, isBold:false,font:fontRegular,fontBold:fontBold,lineHeight:lineHeight,topMargin:marginTop,bottomMarginThreshold:marginBottom},pdfDoc,pageRef,yRef);
           // yRef.current -= lineHeight + 1;
            yRef.current = addText("Le client s'engage et s'oblige envers le prestataire de services à ce qui suit:", margin, yRef.current,margin,20, {size:11, isBold:false,font:fontRegular,fontBold:fontBold,lineHeight:lineHeight,topMargin:marginTop,bottomMarginThreshold:marginBottom},pdfDoc,pageRef,yRef);
           // yRef.current -= lineHeight + 2;
            yRef.current = addText("a) Le client doit fournir au prestataire de services les éléments d'information dans la forme et à l'intérieur des délais prévus dans les spécifications;", margin, yRef.current,margin,8, {size:11, isBold:false,font:fontRegular,fontBold:fontBold,lineHeight:lineHeight,topMargin:marginTop,bottomMarginThreshold:marginBottom},pdfDoc,pageRef,yRef);
            yRef.current = addText("b) Les éléments d'information doivent respecter toutes les lois et tous les règlements applicables, notamment la RGPD et autres directives pour le respect de la vie privée;", margin, yRef.current,margin,8, {size:11, isBold:true,font:fontRegular,fontBold:fontBold,lineHeight:lineHeight,topMargin:marginTop,bottomMarginThreshold:marginBottom},pdfDoc,pageRef,yRef);
            yRef.current = addText("c) La fourniture des éléments d'information par le client ne doit violer aucune obligation de confidentialité ou de non-divulgation et doit permettre au prestataire de services de les utiliser librement et sans contrainte dans le cadre de la fourniture des services;", margin, yRef.current,margin,8, {size:11, isBold:false,font:fontRegular,fontBold:fontBold,lineHeight:lineHeight,topMargin:marginTop,bottomMarginThreshold:marginBottom},pdfDoc,pageRef,yRef);
           // yRef.current -= lineHeight + 1
            yRef.current = addText("d) Le client doit fournir au prestataire de services, sur demande de celui-ci, la preuve de son droit, titre ou intérêt de propriété intellectuelle dans tout élément d'information;", margin, yRef.current,margin,8, {size:11, isBold:false,font:fontRegular,fontBold:fontBold,lineHeight:lineHeight,topMargin:marginTop,bottomMarginThreshold:marginBottom},pdfDoc,pageRef,yRef);
           // yRef.current -= lineHeight + 1
            yRef.current = addText("e) Le client doit apporter au prestataire de services toute sa collaboration et lui fournir toute l'information requise pour assurer l'exécution fidèle et complète des services à être rendus;", margin, yRef.current,margin,8, {size:11, isBold:false,font:fontRegular,fontBold:fontBold,lineHeight:lineHeight,topMargin:marginTop,bottomMarginThreshold:marginBottom},pdfDoc,pageRef,yRef);
           // yRef.current -= lineHeight + 1
            yRef.current = addText("f) À moins d'un motif sérieux, le client doit donner au prestataire de services, sur demande de celui-ci, son approbation du travail effectué au terme de chacune des phases de prestation de services indiquées dans les spécifications;", margin, yRef.current,margin,8, {size:11, isBold:false,font:fontRegular,fontBold:fontBold,lineHeight:lineHeight,topMargin:marginTop,bottomMarginThreshold:marginBottom},pdfDoc,pageRef,yRef);
           // yRef.current -= lineHeight + 1
            yRef.current = addText("g) Le client est seul responsable du contenu des équipements informatiques et des dommages pouvant découler de leur utilisation;", margin, yRef.current,margin,8, {size:11, isBold:true,font:fontRegular,fontBold:fontBold,lineHeight:lineHeight,topMargin:marginTop,bottomMarginThreshold:marginBottom},pdfDoc,pageRef,yRef);
            yRef.current = addText("h) Le client doit prendre fait et cause du prestataire de services si ce dernier est mis en cause ou porté partie dans une procédure judiciaire intentée par une tierce personne et alléguant une faute du prestataire de services découlant de l'utilisation des équipements informatiques ou des informations qui y sont contenues, et indemniser le prestataire de services de toute condamnation monétaire en capital et intérêts ainsi que de tous les frais judiciaires et extrajudiciaires que le prestataire de services peut encourir en conséquence;", margin, yRef.current,margin,8, {size:11, isBold:true,font:fontRegular,fontBold:fontBold,lineHeight:lineHeight,topMargin:marginTop,bottomMarginThreshold:marginBottom},pdfDoc,pageRef,yRef);
            yRef.current = addText("i) Le client doit payer le prix des services du prestataire de services, payer le prix de tout service additionnel qu'il pourrait requérir ultérieurement à la signature du présent contrat ainsi que rembourser les dépenses encourues, conformément aux termes et conditions de paiement prévus dans les spécifications;", margin, yRef.current,margin,8, {size:11, isBold:false,font:fontRegular,fontBold:fontBold,lineHeight:lineHeight,topMargin:marginTop,bottomMarginThreshold:marginBottom},pdfDoc,pageRef,yRef);
           // yRef.current -= lineHeight + 1;
            yRef.current = addText("j) Le client doit aviser le prestataire de services sans délai si son représentant indiqué dans les spécifications est remplacé en cours d'exécution du contrat par une autre personne.", margin, yRef.current,margin,15, {size:11, isBold:false,font:fontRegular,fontBold:fontBold,lineHeight:lineHeight,topMargin:marginTop,bottomMarginThreshold:marginBottom},pdfDoc,pageRef,yRef);
           // yRef.current -= lineHeight + 1;
            yRef.current = addText('5.4 - Obligations du prestataire de services', margin, yRef.current,margin,10, {size:13, isBold:false,font:fontRegular,fontBold:fontBold,lineHeight:lineHeight,topMargin:marginTop,bottomMarginThreshold:marginBottom},pdfDoc,pageRef,yRef);
            yRef.current = addText("Le prestataire de services s'engage et s'oblige envers le client à ce qui suit:", margin, yRef.current,margin,20, {size:13, isBold:false,font:fontRegular,fontBold:fontBold,lineHeight:lineHeight,topMargin:marginTop,bottomMarginThreshold:marginBottom},pdfDoc,pageRef,yRef);
            yRef.current = addText("a) Les services doivent être rendus de façon professionnelle, selon les règles généralement reconnues par l'industrie, et en fonction des spécifications;", margin, yRef.current,margin,8, {size:11, isBold:false,font:fontRegular,fontBold:fontBold,lineHeight:lineHeight,topMargin:marginTop,bottomMarginThreshold:marginBottom},pdfDoc,pageRef,yRef);
            yRef.current = addText("b) Le prestataire de services doit s'assurer que ses employés, fournisseurs, collaborateurs et sous-traitants, s'il y a lieu, respectent intégralement les dispositions du présent contrat, notamment en ce qui concerne la propriété intellectuelle et la confidentialité;", margin, yRef.current,margin,8, {size:11, isBold:true,font:fontRegular,fontBold:fontBold,lineHeight:lineHeight,topMargin:marginTop,bottomMarginThreshold:marginBottom},pdfDoc,pageRef,yRef);
            yRef.current = addText("c) Le prestataire de services doit aviser le client sans délai si son représentant indiqué dans les spécifications est remplacé en cours d'exécution du contrat par une autre personne.", margin, yRef.current,margin,15, {size:11, isBold:false,font:fontRegular,fontBold:fontBold,lineHeight:lineHeight,topMargin:marginTop,bottomMarginThreshold:marginBottom},pdfDoc,pageRef,yRef);
            yRef.current = addText('5.5 - Information utile', margin, yRef.current,margin,10, {size:13, isBold:false,font:fontRegular,fontBold:fontBold,lineHeight:lineHeight,topMargin:marginTop,bottomMarginThreshold:marginBottom},pdfDoc,pageRef,yRef);
            yRef.current = addText("Le client reconnaît que le prestataire de services lui a fourni, avant la signature du présent contrat, toute l’information utile relativement aux services qu'il s'engage à fournir. Remarque : Toutes autres informations pour la réalisation du service nécessitant des coups supplémentaires sont a la charge du prestataire de services.", margin, yRef.current,margin,15, {size:11, isBold:true,font:fontRegular,fontBold:fontBold,lineHeight:lineHeight,topMargin:marginTop,bottomMarginThreshold:marginBottom},pdfDoc,pageRef,yRef);
            yRef.current = addText("5.6 - Moyens d'exécution", margin, yRef.current,margin,10, {size:13, isBold:false,font:fontRegular,fontBold:fontBold,lineHeight:lineHeight,topMargin:marginTop,bottomMarginThreshold:marginBottom},pdfDoc,pageRef,yRef);
            yRef.current = addText("Sauf quant au respect des spécifications, le prestataire de services a le libre choix des moyens d'exécution du présent contrat et il n'existe entre lui et le client aucun lien de subordination quant à son exécution.", margin, yRef.current,margin,15, {size:11, isBold:true,font:fontRegular,fontBold:fontBold,lineHeight:lineHeight,topMargin:marginTop,bottomMarginThreshold:marginBottom},pdfDoc,pageRef,yRef);
            yRef.current = addText("5.7 - Relation entre les parties", margin, yRef.current,margin,10, {size:13, isBold:false,font:fontRegular,fontBold:fontBold,lineHeight:lineHeight,topMargin:marginTop,bottomMarginThreshold:marginBottom},pdfDoc,pageRef,yRef);
            yRef.current = addText("Les parties étant des entrepreneurs indépendants, le présent contrat ne les lie entre elles qu'aux fins qui y sont mentionnées. Par conséquent, les dispositions du présent contrat ne peuvent nullement être interprétées comme créant une quelconque association ou société entre les parties ou comme confiant un quelconque mandat de l'une à l'autre. De plus, aucune des parties ne peut lier l'autre, de quelque façon que ce soit et envers qui que ce soit, autrement qu'en conformité avec les dispositions du présent contrat.", margin, yRef.current,margin,15, {size:11, isBold:false,font:fontRegular,fontBold:fontBold,lineHeight:lineHeight,topMargin:marginTop,bottomMarginThreshold:marginBottom},pdfDoc,pageRef,yRef);
            yRef.current = addText("5.8 - Sous-traitance", margin, yRef.current,margin,10, {size:13, isBold:false,font:fontRegular,fontBold:fontBold,lineHeight:lineHeight,topMargin:marginTop,bottomMarginThreshold:marginBottom},pdfDoc,pageRef,yRef);
            yRef.current = addText("À moins d'une disposition à l'effet contraire dans le présent contrat et à condition d'avoir obtenu préalablement le consentement du client, le prestataire de services peut s'adjoindre tout tiers pour exécuter ce contrat. Il conserve néanmoins la direction et la responsabilité de l'exécution.", margin, yRef.current,margin,15, {size:11, isBold:true,font:fontRegular,fontBold:fontBold,lineHeight:lineHeight,topMargin:marginTop,bottomMarginThreshold:marginBottom},pdfDoc,pageRef,yRef);
            yRef.current = addText("5.9 - Processus de vérification, de test et d'approbation", margin, yRef.current,margin,10, {size:13, isBold:false,font:fontRegular,fontBold:fontBold,lineHeight:lineHeight,topMargin:marginTop,bottomMarginThreshold:marginBottom},pdfDoc,pageRef,yRef);
            yRef.current = addText("Sur demande formulée par le prestataire de services au terme de chacune des phases de prestation de services indiquées dans les spécifications, le client doit vérifier, réviser, tester ou autrement apprécier le résultat des services rendus jusqu'à ce moment par le prestataire de services.", margin, yRef.current,margin,10, {size:11, isBold:false,font:fontRegular,fontBold:fontBold,lineHeight:lineHeight,topMargin:marginTop,bottomMarginThreshold:marginBottom},pdfDoc,pageRef,yRef);
            yRef.current = addText("Dans un délai maximal de …...... jours suivant la demande du prestataire de services, le client doit approuver ou refuser le travail effectué par le prestataire de services. Si le client approuve le travail effectué ou omet de manifester son approbation ou son refus à l'intérieur dudit délai, le travail effectué est réputé approuvé et fait conformément aux spécifications, et le prestataire de services peut continuer son travail, s'il y a lieu. Si le client refuse le travail effectué, en tout ou en partie, il doit aviser le prestataire de services à l'intérieur dudit délai et par écrit de toute erreur, omission, non-conformité aux spécifications ou autre motif de refus, en donnant les indications utiles et précisions nécessaires à une bonne compréhension des points reprochés.", margin, yRef.current,margin,10, {size:11, isBold:false,font:fontRegular,fontBold:fontBold,lineHeight:lineHeight,topMargin:marginTop,bottomMarginThreshold:marginBottom},pdfDoc,pageRef,yRef);
            yRef.current = addText("Le prestataire de services dispose alors d'un délai identique à celui ci-haut mentionné afin de procéder à la correction des points reprochés et de soumettre de nouveau au client le résultat de son travail. Si le prestataire de services est en désaccord avec le client sur un ou plusieurs des points soulevés dans l'avis de refus, il doit faire part de sa position par écrit au client dans un délai maximal de …...... jours suivant la réception dudit avis de refus.", margin, yRef.current,margin,15, {size:11, isBold:false,font:fontRegular,fontBold:fontBold,lineHeight:lineHeight,topMargin:marginTop,bottomMarginThreshold:marginBottom},pdfDoc,pageRef,yRef);
            yRef.current = addText("5.10 - Modifications demandées en cours de contrat", margin, yRef.current,margin,10, {size:13, isBold:false,font:fontRegular,fontBold:fontBold,lineHeight:lineHeight,topMargin:marginTop,bottomMarginThreshold:marginBottom},pdfDoc,pageRef,yRef);
            yRef.current = addText("Si, en cours d'exécution du présent contrat et avant l'approbation finale des services rendus par le prestataire de services, le client requiert une révision, correction, addition, substitution ou autre modification aux spécifications:", margin, yRef.current,margin,20, {size:11, isBold:false,font:fontRegular,fontBold:fontBold,lineHeight:lineHeight,topMargin:marginTop,bottomMarginThreshold:marginBottom},pdfDoc,pageRef,yRef);
            yRef.current = addText("a) afin que le résultat recherché soit conforme aux éléments d'information fournis par le client à l'origine;", margin, yRef.current,margin,8, {size:11, isBold:false,font:fontRegular,fontBold:fontBold,lineHeight:lineHeight,topMargin:marginTop,bottomMarginThreshold:marginBottom},pdfDoc,pageRef,yRef);
            yRef.current = addText("b) suite à une erreur ou omission du prestataire de services; ou", margin, yRef.current,margin,8, {size:11, isBold:false,font:fontRegular,fontBold:fontBold,lineHeight:lineHeight,topMargin:marginTop,bottomMarginThreshold:marginBottom},pdfDoc,pageRef,yRef);
            yRef.current = addText("c) qui n'entraîne pas un surcroît de travail de la part du prestataire de services;", margin, yRef.current,margin,15, {size:11, isBold:false,font:fontRegular,fontBold:fontBold,lineHeight:lineHeight,topMargin:marginTop,bottomMarginThreshold:marginBottom},pdfDoc,pageRef,yRef);
            yRef.current = addText("alors ladite demande de modification n'est pas considérée comme une demande de services additionnels et n'entraîne donc aucun coût supplémentaire pour le client. Toute telle demande de modification de la part du client doit être formulée par écrit.", margin, yRef.current,margin,10, {size:11, isBold:true,font:fontRegular,fontBold:fontBold,lineHeight:lineHeight,topMargin:marginTop,bottomMarginThreshold:marginBottom},pdfDoc,pageRef,yRef);
            yRef.current = addText("Toute autre demande de modification de la part du client est considérée comme étant une demande de services additionnels.", margin, yRef.current,margin,15, {size:11, isBold:true,font:fontRegular,fontBold:fontBold,lineHeight:lineHeight,topMargin:marginTop,bottomMarginThreshold:marginBottom},pdfDoc,pageRef,yRef);
            yRef.current = addText("5.11 - Services additionnels", margin, yRef.current,margin,10, {size:13, isBold:false,font:fontRegular,fontBold:fontBold,lineHeight:lineHeight,topMargin:marginTop,bottomMarginThreshold:marginBottom},pdfDoc,pageRef,yRef);
            yRef.current = addText("Si le client requiert des services additionnels, il doit le formuler par écrit et le faire par au prestatrice de services.", margin, yRef.current,margin,10, {size:11, isBold:false,font:fontRegular,fontBold:fontBold,lineHeight:lineHeight,topMargin:marginTop,bottomMarginThreshold:marginBottom},pdfDoc,pageRef,yRef);
            yRef.current = addText("Si le prestataire de services accepte de rendre ceux-ci, le client en est informé par écrit.", margin, yRef.current,margin,10, {size:11, isBold:false,font:fontRegular,fontBold:fontBold,lineHeight:lineHeight,topMargin:marginTop,bottomMarginThreshold:marginBottom},pdfDoc,pageRef,yRef);
            yRef.current = addText("Tout service additionnel est donc soumis aux dispositions du présent contrat, notamment en matière de propriété intellectuelle et de confidentialité, en faisant les adaptations qui s'imposent s'il y a lieu.", margin, yRef.current,margin,15, {size:11, isBold:false,font:fontRegular,fontBold:fontBold,lineHeight:lineHeight,topMargin:marginTop,bottomMarginThreshold:marginBottom},pdfDoc,pageRef,yRef);
            yRef.current = addText("5.12 - Représentations et garanties du prestataire de services", margin, yRef.current,margin,10, {size:13, isBold:false,font:fontRegular,fontBold:fontBold,lineHeight:lineHeight,topMargin:marginTop,bottomMarginThreshold:marginBottom},pdfDoc,pageRef,yRef);
            yRef.current = addText("Le prestataire de services représente et garantit au client que:", margin, yRef.current,margin,15, {size:11, isBold:false,font:fontRegular,fontBold:fontBold,lineHeight:lineHeight,topMargin:marginTop,bottomMarginThreshold:marginBottom},pdfDoc,pageRef,yRef);
            yRef.current = addText("a) il possède la capacité requise afin de s'engager en vertu du présent contrat, telle capacité n'étant nullement limitée par un quelconque engagement envers une tierce personne;", margin, yRef.current,margin,8, {size:11, isBold:false,font:fontRegular,fontBold:fontBold,lineHeight:lineHeight,topMargin:marginTop,bottomMarginThreshold:marginBottom},pdfDoc,pageRef,yRef);
            yRef.current = addText("b) il possède l'expertise et l'expérience requises afin d'exécuter et de mener à terme les obligations qui lui incombent en vertu du présent contrat;", margin, yRef.current,margin,8, {size:11, isBold:false,font:fontRegular,fontBold:fontBold,lineHeight:lineHeight,topMargin:marginTop,bottomMarginThreshold:marginBottom},pdfDoc,pageRef,yRef);
            yRef.current = addText("c) il va rendre les services de façon professionnelle et efficace, selon les règles généralement reconnues par l'industrie et à l'aide de la technologie d'arrière-plan et des outils de développement les plus récents;", margin, yRef.current,margin,8, {size:11, isBold:false,font:fontRegular,fontBold:fontBold,lineHeight:lineHeight,topMargin:marginTop,bottomMarginThreshold:marginBottom},pdfDoc,pageRef,yRef);
            yRef.current = addText("d) il va respecter toutes et chacune des spécifications relatives aux services qu'il doit rendre;", margin, yRef.current,margin,8, {size:11, isBold:false,font:fontRegular,fontBold:fontBold,lineHeight:lineHeight,topMargin:marginTop,bottomMarginThreshold:marginBottom},pdfDoc,pageRef,yRef);
            yRef.current = addText("e) il va respecter tout droit, titre ou intérêt de propriété intellectuelle appartenant à tout tiers dans tout outil de développement qu'il va utiliser et dans tout composant qu'il va concevoir à l'aide de tout tel outil;", margin, yRef.current,margin,8, {size:11, isBold:false,font:fontRegular,fontBold:fontBold,lineHeight:lineHeight,topMargin:marginTop,bottomMarginThreshold:marginBottom},pdfDoc,pageRef,yRef);
            yRef.current = addText("f) il ne va utiliser aucune information confidentielle ou secret de commerce appartenant à toute tierce personne, à moins d'avoir reçu l'autorisation de cette dernière;", margin, yRef.current,margin,8, {size:11, isBold:false,font:fontRegular,fontBold:fontBold,lineHeight:lineHeight,topMargin:marginTop,bottomMarginThreshold:marginBottom},pdfDoc,pageRef,yRef);
            yRef.current = addText("g) le client va posséder un bon et valable droit, titre ou intérêt de propriété intellectuelle dans tout contenu créé par le prestataire de services, conformément à ce qui est prévu dans le présent contrat;", margin, yRef.current,margin,8, {size:11, isBold:false,font:fontRegular,fontBold:fontBold,lineHeight:lineHeight,topMargin:marginTop,bottomMarginThreshold:marginBottom},pdfDoc,pageRef,yRef);
            yRef.current = addText("h) tout tel contenu ne violera aucun droit, titre ou intérêt de propriété intellectuelle appartenant à un tiers.", margin, yRef.current,margin,15, {size:11, isBold:false,font:fontRegular,fontBold:fontBold,lineHeight:lineHeight,topMargin:marginTop,bottomMarginThreshold:marginBottom},pdfDoc,pageRef,yRef);
            yRef.current = addText("5.13 - Limitation de garantie", margin, yRef.current,margin,10, {size:13, isBold:false,font:fontRegular,fontBold:fontBold,lineHeight:lineHeight,topMargin:marginTop,bottomMarginThreshold:marginBottom},pdfDoc,pageRef,yRef);
            yRef.current = addText("Sauf si autrement prévu dans le présent contrat, le prestataire de services ne donne aucune garantie, expresse ou implicite, au client relativement:", margin, yRef.current,margin,15, {size:11, isBold:false,font:fontRegular,fontBold:fontBold,lineHeight:lineHeight,topMargin:marginTop,bottomMarginThreshold:marginBottom},pdfDoc,pageRef,yRef);
            yRef.current = addText("a) aux équipements informatiques du client, à leur fonctionnement, et à leurs composants matériels et logiciels;", margin, yRef.current,margin,8, {size:11, isBold:false,font:fontRegular,fontBold:fontBold,lineHeight:lineHeight,topMargin:marginTop,bottomMarginThreshold:marginBottom},pdfDoc,pageRef,yRef);
            yRef.current = addText("b) aux retombées, financières ou non, réelles ou appréhendées, positives ou non, résultant ou pouvant résulter de la fourniture des services.", margin, yRef.current,margin,15, {size:11, isBold:false,font:fontRegular,fontBold:fontBold,lineHeight:lineHeight,topMargin:marginTop,bottomMarginThreshold:marginBottom},pdfDoc,pageRef,yRef);
            yRef.current = addText("LES GARANTIES CONTENUES DANS LE PRÉSENT CONTRAT SONT LES SEULES GARANTIES FOURNIES EN RELATION AVEC L'OBJET DU PRÉSENT CONTRAT ET ELLES CONSTITUENT UNE GARANTIE LIMITÉE.", margin, yRef.current,margin,10, {size:11, isBold:false,font:fontRegular,fontBold:fontBold,lineHeight:lineHeight+3,topMargin:marginTop,bottomMarginThreshold:marginBottom},pdfDoc,pageRef,yRef);
            yRef.current = addText("5.14 - Limitation de responsabilité", margin, yRef.current,margin,10, {size:13, isBold:false,font:fontRegular,fontBold:fontBold,lineHeight:lineHeight,topMargin:marginTop,bottomMarginThreshold:marginBottom},pdfDoc,pageRef,yRef);
            yRef.current = addText("Sauf en cas de faute grave de sa part, le prestataire de services ne peut être tenu responsable envers le client de toute faute et de tout dommage, direct ou indirect, pouvant en découler, et le client tient le prestataire de services quitte et indemne de toute réclamation, y compris de toute réclamation sur garantie, dans l'un ou l'autre des cas suivants:", margin, yRef.current,margin,15, {size:11, isBold:false,font:fontRegular,fontBold:fontBold,lineHeight:lineHeight,topMargin:marginTop,bottomMarginThreshold:marginBottom},pdfDoc,pageRef,yRef);
            yRef.current = addText("a) modifications apportées au contenu par une personne autre que le prestataire de services ou relevant de ce dernier;", margin, yRef.current,margin,8, {size:11, isBold:false,font:fontRegular,fontBold:fontBold,lineHeight:lineHeight,topMargin:marginTop,bottomMarginThreshold:marginBottom},pdfDoc,pageRef,yRef);
            yRef.current = addText("b) modifications ou ajouts, matériels ou logiciels, aux équipements informatiques du client, ayant un effet sur le bon fonctionnement des produits logiciels;", margin, yRef.current,margin,8, {size:11, isBold:false,font:fontRegular,fontBold:fontBold,lineHeight:lineHeight,topMargin:marginTop,bottomMarginThreshold:marginBottom},pdfDoc,pageRef,yRef);
            yRef.current = addText("c) introduction d'un virus informatique dans les équipements informatiques du client, ayant un effet sur le bon fonctionnement des produits logiciels;", margin, yRef.current,margin,8, {size:11, isBold:false,font:fontRegular,fontBold:fontBold,lineHeight:lineHeight,topMargin:marginTop,bottomMarginThreshold:marginBottom},pdfDoc,pageRef,yRef);
            yRef.current = addText("d) migration des produits logiciels dans un environnement matériel ou logiciel différent; perte d'occasions ou de revenus d'affaires reliés au fonctionnement ou à l'absence de fonctionnement, ou à l'utilisation ou à l'absence d'utilisation des produits logiciels;", margin, yRef.current,margin,8, {size:11, isBold:false,font:fontRegular,fontBold:fontBold,lineHeight:lineHeight,topMargin:marginTop,bottomMarginThreshold:marginBottom},pdfDoc,pageRef,yRef);
            yRef.current = addText("e) intrusion illégale ou non-autorisée de tout tiers dans les équipements informatiques du client.", margin, yRef.current,margin,15, {size:11, isBold:false,font:fontRegular,fontBold:fontBold,lineHeight:lineHeight,topMargin:marginTop,bottomMarginThreshold:marginBottom},pdfDoc,pageRef,yRef);
            yRef.current = addText("SAUF SI AUTREMENT PRÉVU DANS LE PRÉSENT CONTRAT, EN AUCUN CAS LE PRESTATAIRE DE SERVICES (Y COMPRIS, S'IL Y A LIEU, SES FILIALES ET SA MAISON-MÈRE AINSI QUE SES ACTIONNAIRES, DIRIGEANTS, CADRES, EMPLOYÉS, COLLABORATEURS ET SOUS-TRAITANTS) NE PEUT ÊTRE TENU RESPONSABLE ENVERS LE CLIENT OU ENVERS DES TIERS DE TOUT DOMMAGE INDIRECT, INCIDENT, SPÉCIAL, PUNITIF OU EXEMPLAIRE, Y COMPRIS DE FAÇON NON LIMITATIVE DE TOUTE PERTE DE PROFIT OU AUTRE PERTE ÉCONOMIQUE (DÉCOULANT D'UNE FAUTE CONTRACTUELLE, D'UNE FAUTE DÉLICTUELLE OU D'UNE NÉGLIGENCE) MÊME SI LE PRESTATAIRE DE SERVICES A ÉTÉ AVERTI DE LA POSSIBILITÉ QUE SURVIENNE UN TEL DOMMAGE.", margin, yRef.current,margin,15, {size:11, isBold:false,font:fontRegular,fontBold:fontBold,lineHeight:lineHeight+3,topMargin:marginTop,bottomMarginThreshold:marginBottom},pdfDoc,pageRef,yRef);
            yRef.current = addText("5.15 - Dépôt de garantie et paiements échelonnés", margin, yRef.current,margin,10, {size:13, isBold:false,font:fontRegular,fontBold:fontBold,lineHeight:lineHeight,topMargin:marginTop,bottomMarginThreshold:marginBottom},pdfDoc,pageRef,yRef);
            yRef.current = addText("Lors de la signature du présent contrat, le client doit verser au prestataire de services le dépôt de garantie indiqué dans le devis. Ce dépôt de garantie est nécessaire pour garantir le début des travaux comme convenu.", margin, yRef.current,margin,10, {size:11, isBold:false,font:fontRegular,fontBold:fontBold,lineHeight:lineHeight,topMargin:marginTop,bottomMarginThreshold:marginBottom},pdfDoc,pageRef,yRef);
            yRef.current = addText("En outre, le paiement total des services sera effectué par échelonnement selon le calendrier suivant :", margin, yRef.current,margin,15, {size:11, isBold:false,font:fontRegular,fontBold:fontBold,lineHeight:lineHeight,topMargin:marginTop,bottomMarginThreshold:marginBottom},pdfDoc,pageRef,yRef);
            data.paymentSchedule.split(',').forEach((item,index)=>{
                if (index === 0) {
                    const final6 = addHorizontalText([{text:"Dépôt de garantie :",size:11,isBold:true,color:rgb(0,0,0)},{text:item,size:11,isBold:false,color:rgb(0,0,0)}],margin+30,yRef.current,true,margin,10,fontRegular,fontBold,{horizontalSpacing:5,bulletSymbol:`${index + 1}`,lineHeight:lineHeight,topMargin:marginTop,bottomMargin:marginBottom},pdfDoc,pageRef,yRef)
                    yRef.current = final6.finalY   
                }else if(index === data.paymentSchedule.split(',').length - 1){
                    const final6 = addHorizontalText([{text:"Solde final :",size:11,isBold:true,color:rgb(0,0,0)},{text:item,size:11,isBold:false,color:rgb(0,0,0)}],margin+30,yRef.current,true,margin,15,fontRegular,fontBold,{horizontalSpacing:5,bulletSymbol:`${index + 1}`,lineHeight:lineHeight,topMargin:marginTop,bottomMargin:marginBottom},pdfDoc,pageRef,yRef)
                    yRef.current = final6.finalY
                }else{
                    const final6 = addHorizontalText([{text:`Echelon ${index} : `,size:11,isBold:true,color:rgb(0,0,0)},{text:item,size:11,isBold:false,color:rgb(0,0,0)}],margin+30,yRef.current,true,margin,10,fontRegular,fontBold,{horizontalSpacing:5,bulletSymbol:`${index + 1}`,lineHeight:lineHeight,topMargin:marginTop,bottomMargin:marginBottom},pdfDoc,pageRef,yRef)
                    yRef.current = final6.finalY
                }
            })
            yRef.current = addText("5.16 - Suspension des services en cas de non-paiement", margin, yRef.current,margin,10, {size:13, isBold:false,font:fontRegular,fontBold:fontBold,lineHeight:lineHeight,topMargin:marginTop,bottomMarginThreshold:marginBottom},pdfDoc,pageRef,yRef);
            yRef.current = addText("En outre, le paiement total des services sera effectué par échelonnement selon le calendrier suivant :", margin, yRef.current,margin,15, {size:11, isBold:false,font:fontRegular,fontBold:fontBold,lineHeight:lineHeight,topMargin:marginTop,bottomMarginThreshold:marginBottom},pdfDoc,pageRef,yRef);
            const final7 = addHorizontalText([{text:`Si le client refuse sans droit de verser au prestataire de services les sommes qui sont payables ou remboursables, selon le cas, en vertu du présent contrat conformément aux termes et conditions de paiement indiqués dans les spécifications, malgré une mise en demeure du prestataire de services,`,size:11,isBold:false,color:rgb(0,0,0)},{text:"ce dernier est en droit de suspendre la prestation des services concernés,",size:11,isBold:true,color:rgb(0,0,0)},{text:"sans autre avis ni délai, sous réserve de tout autre droit que peut avoir le prestataire de services en vertu du présent contrat.",size:11,isBold:false,color:rgb(0,0,0)}],margin,yRef.current,false,margin,15,fontRegular,fontBold,{horizontalSpacing:5,lineHeight:lineHeight,topMargin:marginTop,bottomMargin:marginBottom},pdfDoc,pageRef,yRef)
            yRef.current = final7.finalY
            yRef.current = addText("5.17 - Résiliation du contrat (par le client)", margin, yRef.current,margin,10, {size:13, isBold:false,font:fontRegular,fontBold:fontBold,lineHeight:lineHeight,topMargin:marginTop,bottomMarginThreshold:marginBottom},pdfDoc,pageRef,yRef);
            yRef.current = addText("Le client peut résilier le présent contrat en tout temps, sur avis envoyé au prestataire de services. Toutefois, le client demeure responsable:", margin, yRef.current,margin,15, {size:11, isBold:false,font:fontRegular,fontBold:fontBold,lineHeight:lineHeight,topMargin:marginTop,bottomMarginThreshold:marginBottom},pdfDoc,pageRef,yRef);
            yRef.current = addText("a) du paiement du prix des services rendus;", margin, yRef.current,margin,8, {size:11, isBold:false,font:fontRegular,fontBold:fontBold,lineHeight:lineHeight,topMargin:marginTop,bottomMarginThreshold:marginBottom},pdfDoc,pageRef,yRef);
            yRef.current = addText("b) du paiement du prix des services additionnels rendus; et", margin, yRef.current,margin,8, {size:11, isBold:false,font:fontRegular,fontBold:fontBold,lineHeight:lineHeight,topMargin:marginTop,bottomMarginThreshold:marginBottom},pdfDoc,pageRef,yRef);
            yRef.current = addText("c) du remboursement des dépenses encourues;", margin, yRef.current,margin,15, {size:11, isBold:false,font:fontRegular,fontBold:fontBold,lineHeight:lineHeight,topMargin:marginTop,bottomMarginThreshold:marginBottom},pdfDoc,pageRef,yRef);
            yRef.current = addText("sans aucune réduction ou remise.", margin, yRef.current,margin,10, {size:11, isBold:false,font:fontRegular,fontBold:fontBold,lineHeight:lineHeight,topMargin:marginTop,bottomMarginThreshold:marginBottom},pdfDoc,pageRef,yRef);
            yRef.current = addText("De plus, si le prestataire de services a respecté ses obligations en vertu du présent contrat jusqu'à la résiliation de ce dernier, le client doit verser au prestataire de services un montant équivalent à quatre-vingt pour cent (80%) du solde du prix du contrat, à titre de perte de profit anticipé.", margin, yRef.current,margin,10, {size:11, isBold:false,font:fontRegular,fontBold:fontBold,lineHeight:lineHeight,topMargin:marginTop,bottomMarginThreshold:marginBottom},pdfDoc,pageRef,yRef);
            yRef.current = addText("5.18 - Résiliation du contrat (par le prestataire de services)", margin, yRef.current,margin,10, {size:13, isBold:false,font:fontRegular,fontBold:fontBold,lineHeight:lineHeight,topMargin:marginTop,bottomMarginThreshold:marginBottom},pdfDoc,pageRef,yRef);
            yRef.current = addText("1) Si le client ne respecte pas l'une ou l'autre de ses obligations en vertu du présent contrat,", margin, yRef.current,margin,8, {size:11, isBold:false,font:fontRegular,fontBold:fontBold,lineHeight:lineHeight,topMargin:marginTop,bottomMarginThreshold:marginBottom},pdfDoc,pageRef,yRef);
            yRef.current = addText("2) si le client cesse ses opérations de quelque façon que ce soit, y compris en raison de la faillite, liquidation ou cession de ses biens, ou", margin, yRef.current,margin,8, {size:11, isBold:false,font:fontRegular,fontBold:fontBold,lineHeight:lineHeight,topMargin:marginTop,bottomMarginThreshold:marginBottom},pdfDoc,pageRef,yRef);
            yRef.current = addText("3) si le client lui a présenté des renseignements faux ou trompeurs ou lui a fait de fausses représentations,", margin, yRef.current,margin,15, {size:11, isBold:true,font:fontRegular,fontBold:fontBold,lineHeight:lineHeight,topMargin:marginTop,bottomMarginThreshold:marginBottom},pdfDoc,pageRef,yRef);
            yRef.current = addText("Le prestataire de services peut résilier le présent contrat par l’envoi d’un avis écrit de résiliation énonçant le motif de résiliation. S’il s’agit d’un motif de résiliation prévu au paragraphe 1, le client devra remédier au défaut énoncé dans le délai prescrit dans l’avis, à défaut de quoi le contrat sera automatiquement résilié. Le prestataire de services n'est alors tenu que de rembourser au client toute avance (ou tout solde de celle-ci) ou tout montant excédentaire reçu, sous réserve de tous ses droits et recours contre le client.", margin, yRef.current,margin,15, {size:11, isBold:true,font:fontRegular,fontBold:fontBold,lineHeight:lineHeight,topMargin:marginTop,bottomMarginThreshold:marginBottom},pdfDoc,pageRef,yRef);
            yRef.current = addText("5.19 - Droits d’auteur et propriété intellectuelle", margin, yRef.current,margin,10, {size:13, isBold:false,font:fontRegular,fontBold:fontBold,lineHeight:lineHeight,topMargin:marginTop,bottomMarginThreshold:marginBottom},pdfDoc,pageRef,yRef);
            yRef.current = addText("1) Tous les contenus (textes, images, vidéos, logos, etc.) fournis par la Cliente restent la propriété exclusive de celle-ci.", margin, yRef.current,margin,10, {size:11, isBold:false,font:fontRegular,fontBold:fontBold,lineHeight:lineHeight,isListItem:true,topMargin:marginTop,bottomMarginThreshold:marginBottom},pdfDoc,pageRef,yRef);
            yRef.current = addText("2) Le Prestataire ne peut, en aucun cas, utiliser ou reproduire ces contenus pour ses propres besoins ou ceux d’autres clients sans une autorisation écrite du/de la Client(e).", margin, yRef.current,margin,10, {size:11, isBold:false,font:fontRegular,fontBold:fontBold,lineHeight:lineHeight,topMargin:marginTop,bottomMarginThreshold:marginBottom},pdfDoc,pageRef,yRef);
            yRef.current = addText("3) À la livraison du site internet, la Cliente sera l’unique propriétaire du design, du code source et des contenus du site, à l’exception des éléments appartenant à des tiers (plugins, logiciels, etc.) dont les droits seront spécifiés.", margin, yRef.current,margin,10, {size:11, isBold:false,font:fontRegular,fontBold:fontBold,lineHeight:lineHeight,topMargin:marginTop,bottomMarginThreshold:marginBottom},pdfDoc,pageRef,yRef);
            yRef.current = addText("4) Le Prestataire pourra conserver une copie du site dans un serveur sécurisé(Controlle de version GIT EX: GitHub,GitLab) uniquement pour les besoins futurs de modification du site internet après la livraison. Le Prestation reconnait que cette copie reste la propriété de la Cliente et les contenus y figurant peuvent être utilisés ou reproduits sans l’accord de celle-ci.", margin, yRef.current,margin,40, {size:11, isBold:false,font:fontRegular,fontBold:fontBold,lineHeight:lineHeight,topMargin:marginTop,bottomMarginThreshold:marginBottom},pdfDoc,pageRef,yRef);
            yRef.current = addText('6 - DISPOSITIONS GÉNÉRALES', margin, yRef.current,margin,15, {size:16, isBold:true,font:fontRegular,fontBold:fontBold,lineHeight:lineHeight,topMargin:marginTop,bottomMarginThreshold:marginBottom},pdfDoc,pageRef,yRef);
            yRef.current = addText("Le Prestataire pourra conserver une copie du site dans un serveur sécurisé(Controlle de version GIT EX: GitHub,GitLab).", margin, yRef.current,margin+30,40, {size:11, isBold:false,font:fontRegular,fontBold:fontBold,lineHeight:lineHeight,topMargin:marginTop,bottomMarginThreshold:marginBottom},pdfDoc,pageRef,yRef);
            yRef.current = addText('7 - ENTRÉE EN VIGUEUR DU CONTRAT', margin, yRef.current,margin,15, {size:16, isBold:true,font:fontRegular,fontBold:fontBold,lineHeight:lineHeight,topMargin:marginTop,bottomMarginThreshold:marginBottom},pdfDoc,pageRef,yRef);
            yRef.current = addText("Le présent contrat entre en vigueur à la signature du présent contrat.", margin, yRef.current,margin,40, {size:11, isBold:false,font:fontRegular,fontBold:fontBold,lineHeight:lineHeight,topMargin:marginTop,bottomMarginThreshold:marginBottom},pdfDoc,pageRef,yRef);
            yRef.current = addText('8 - FIN DU CONTRAT', margin, yRef.current,margin,15, {size:16, isBold:true,font:fontRegular,fontBold:fontBold,lineHeight:lineHeight,topMargin:marginTop,bottomMarginThreshold:marginBottom},pdfDoc,pageRef,yRef);
            yRef.current = addText("Le présent contrat prend fin dans l'un ou l'autre des cas suivants:", margin, yRef.current,margin,40, {size:11, isBold:false,font:fontRegular,fontBold:fontBold,lineHeight:lineHeight,topMargin:marginTop,bottomMarginThreshold:marginBottom},pdfDoc,pageRef,yRef);
            yRef.current = addText('9 - RECONNAISSANCE DES PARTIES', margin, yRef.current,margin,15, {size:16, isBold:true,font:fontRegular,fontBold:fontBold,lineHeight:lineHeight,topMargin:marginTop,bottomMarginThreshold:marginBottom},pdfDoc,pageRef,yRef);
            yRef.current = addText("LES PARTIES RECONNAISSENT QUE:", margin, yRef.current,margin,15, {size:11, isBold:false,font:fontRegular,fontBold:fontBold,lineHeight:lineHeight,topMargin:marginTop,bottomMarginThreshold:marginBottom},pdfDoc,pageRef,yRef);
            yRef.current = addText("A) LE PRÉSENT CONTRAT A FAIT L'OBJET DE NÉGOCIATIONS PRÉALABLES ENTRE ELLES;", margin, yRef.current,margin,8, {size:11, isBold:true,font:fontRegular,fontBold:fontBold,lineHeight:lineHeight+2,topMargin:marginTop,bottomMarginThreshold:marginBottom},pdfDoc,pageRef,yRef);
            yRef.current = addText("B) LE PRÉSENT CONTRAT REFLÈTE VÉRITABLEMENT ET COMPLÈTEMENT L'ENTENTE INTERVENUE ENTRE ELLES;", margin, yRef.current,margin,8, {size:11, isBold:true,font:fontRegular,fontBold:fontBold,lineHeight:lineHeight+2,topMargin:marginTop,bottomMarginThreshold:marginBottom},pdfDoc,pageRef,yRef);
            yRef.current = addText("C) TOUTES ET CHACUNE DES CLAUSES DU PRÉSENT CONTRAT SONT LISIBLES ET COMPREHENSIBLES;", margin, yRef.current,margin,40, {size:11, isBold:true,font:fontRegular,fontBold:fontBold,lineHeight:lineHeight+2,topMargin:marginTop,bottomMarginThreshold:marginBottom},pdfDoc,pageRef,yRef);
            yRef.current = addText('10 - SIGNATURES', margin, yRef.current,margin,15, {size:16, isBold:true,font:fontRegular,fontBold:fontBold,lineHeight:lineHeight,topMargin:marginTop,bottomMarginThreshold:marginBottom},pdfDoc,pageRef,yRef);
            yRef.current = signatureBloc(['Signature du prestataire','Signature du client'],yRef.current,margin,20,margin,marginTop,marginBottom,lineHeight,11,true,fontRegular,fontBold,pdfDoc,pageRef,yRef)
           // yRef.current -= lineHeight * 4;
           yRef.current = signatureBloc([formatDate(data.effectiveDate)+':___________________________',formatDate(data.effectiveDate)+':___________________________'],yRef.current,margin,20,margin,marginTop,marginBottom,lineHeight,10,false,fontRegular,fontBold,pdfDoc,pageRef,yRef)

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
    const addText = (text: string,x: number,y: number,rightMargin: number,marginAfter: number,options: {size?: number;isBold?: boolean;font: PDFFont;fontBold: PDFFont;lineHeight: number;isListItem?: boolean,bulletSymbol?: string,maxWidth?:number,topMargin?: number,bottomMarginThreshold?: number},pdfDoc:PDFDocument,pageRef: { current: PDFPage },
        yRef: { current: number }
      ) => {
        const {
          size = 12,
          isBold = false,
          font,
          fontBold,
          lineHeight,
          isListItem = false,
          bulletSymbol = "• ",
          maxWidth = Infinity,
          topMargin = 50,
          bottomMarginThreshold = 50,
        } = options;
        
        const currentFont = isBold ? fontBold : font;
        const pageWidth = pageRef.current.getSize().width;
        const height = pageRef.current.getSize().height;
        const effectiveMaxWidth = Math.min(
          maxWidth,
          pageWidth - x - rightMargin
        );
        // Gestion des puces
        const prefix = isListItem ? bulletSymbol : "";
        const prefixWidth = isListItem 
          ? currentFont.widthOfTextAtSize(prefix, size)
          : 0;
        let currentY = yRef.current;
        let canAddPageNumber:boolean = true;
        const processLine = (line: string, isFirstLine: boolean) => {
            if (currentY < bottomMarginThreshold) {
                const page = pdfDoc.addPage([595, 842]); // A4 - Considérer de ne pas hardcoder
                pageRef.current = page; // Mettre à jour la référence de la page
                // *** CORRECTION PRINCIPALE : Réinitialisation de Y basée sur la marge haute ***
                currentY = height - topMargin; // Réinitialiser `y` en haut de la nouvelle page
                yRef.current = currentY; // Mettre à jour la référence globale de Y
                canAddPageNumber = true;
            }
            let currentX = x + (isFirstLine ? 0 : prefixWidth);
            const words = line.split(" ");
            let currentLine = isFirstLine ? prefix + words[0] : words[0];

            for (let i = 1; i < words.length; i++) {
                const testLine = `${currentLine} ${words[i]}`;
                const testWidth = currentFont.widthOfTextAtSize(testLine, size);

                if (testWidth > effectiveMaxWidth) {
                    // Vérifier à nouveau le débordement avant de dessiner
                    if (currentY < bottomMarginThreshold) {
                        const page = pdfDoc.addPage([595, 842]);
                        pageRef.current = page;
                        currentY = height - topMargin;
                        yRef.current = currentY;
                        // Sur une nouvelle page suite à un wrap, X doit revenir à la position de la marge gauche + marge puce
                        currentX = x + prefixWidth; // Sur une ligne wrappée (pas la première du paragraphe), on ajoute la marge puce
                    } else {
                         // Si pas de nouvelle page, le X reste le même pour la ligne actuelle
                        currentX = x + (isFirstLine && !isListItem ? 0 : prefixWidth); // Ajuster X si c'est la première ligne du paragraphe non listée
                    }

                    pageRef.current.drawText(currentLine, {
                        x: currentX,
                        y: currentY,
                        size,
                        font: currentFont,
                        color: rgb(0, 0, 0),
                    });
                    currentY -= lineHeight;
                    yRef.current = currentY;
                    currentX = x + prefixWidth;
                    currentLine = words[i];
                } else {
                    currentLine = testLine;
                }
                if (canAddPageNumber) {
                    getPdfXCenter(50,50,pdfDoc,10,font,pageRef.current)
                    canAddPageNumber = false;
                }
            }

            if (currentLine) {
                if (currentY < bottomMarginThreshold) {
                    const page = pdfDoc.addPage([595, 842]);
                    pageRef.current = page;
                    currentY = height - topMargin;
                    yRef.current = currentY;
                    // Sur une nouvelle page, X doit revenir à la position correcte
                    currentX = x + (isFirstLine && !isListItem ? 0 : prefixWidth); // Utiliser le X correct pour la première ligne du paragraphe ou une ligne wrappée
                    canAddPageNumber = true;
                } else {
                    currentX = x + (isFirstLine && !isListItem ? 0 : prefixWidth);
                }

                pageRef.current.drawText(currentLine, {
                    x: currentX,
                    y: currentY,
                    size,
                    font: currentFont,
                    color: rgb(0, 0, 0),
                });
                currentY -= lineHeight;
                yRef.current = currentY;
                if (canAddPageNumber) {
                    getPdfXCenter(50,50,pdfDoc,10,font,pageRef.current)
                    canAddPageNumber = false;
                }
            }
        };
      
        // Traitement des sauts de ligne manuels (\n)
        const paragraphs = text.split('\n');
        paragraphs.forEach((paragraph, i) => {
            // Si ce n'est pas le premier paragraphe, ajouter un espace entre les paragraphes
             if (i > 0) {
                // *** CORRECTION PRINCIPALE : Vérification de débordement AVANT d'ajouter l'espace entre paragraphes ***
                // Si l'espace nécessaire pour le saut de ligne plus la première ligne du nouveau paragraphe
                // dépasse la marge basse, on change de page MAINTENANT.
                const nextY = currentY - lineHeight; // Position après le saut de ligne entre paragraphes
                if (nextY < bottomMarginThreshold) {
                    const page = pdfDoc.addPage([595, 842]);
                    pageRef.current = page;
                    currentY = height - topMargin; // Position de départ sur la nouvelle page
                    yRef.current = currentY;
                    canAddPageNumber = true;
                } else {
                    currentY = nextY; // Appliquer le saut de ligne si ça ne dépasse pas
                    yRef.current = currentY;
                }
            }
            processLine(paragraph, true); // Le second paramètre indique si c'est la première ligne du paragraphe
        });
        yRef.current = currentY - marginAfter;
        return yRef.current;
    };

    const signatureBloc = (
        items: string[],
        initialY: number, // Position Y initiale pour ce bloc
        marginLeft: number,
        marginRight: number,
        marginAfter: number,
        topMargin: number,
        bottomMargin: number,
        lineHeight: number,
        size: number = 12,
        isBold: boolean = false,
        font: PDFFont,
        fontBold: PDFFont,
        pdfDoc: PDFDocument,
        pageRef: { current: PDFPage },
        yRef: { current: number } // Référence pour suivre la position Y actuelle
    ) => {
        const pageWidth = pageRef.current.getWidth();
        let pageHeight = pageRef.current.getHeight();
        const availableWidth = pageWidth - marginLeft - marginRight;
        const currentFont = isBold ? fontBold : font;
        let canAddPageNumber:boolean = false;
        // Utiliser la position Y actuelle ou la position initiale si non définie
        let currentY = yRef.current !== undefined ? yRef.current : initialY;
        const height = pageRef.current.getSize().height
        const drawItem = (item: string, x: number, y: number, width: number) => {
            pageRef.current.drawText(item, {
                x,
                y,
                size,
                font: currentFont,
                color: rgb(0, 0, 0),
                maxWidth: width, // Limite la largeur du texte
            });
            if (canAddPageNumber) {
                getPdfXCenter(50,50,pdfDoc,10,font,pageRef.current)
                canAddPageNumber = false;
            }
        };
    
        // Vérifier qu'il y a exactement 2 items
        if (items.length !== 2) {
            throw new Error("Cette fonction ne supporte que exactement 2 items");
        }
    
        // Hauteur totale requise pour le bloc (une seule ligne dans ce cas)
        const totalBlockHeight = lineHeight;
    
        // Vérifier si le bloc tient sur la page actuelle
        if (currentY - totalBlockHeight < bottomMargin) {
            // Ajouter une nouvelle page si nécessaire
            const newPage = pdfDoc.addPage([595, 842]);
            pageRef.current = newPage;
            pageHeight = newPage.getHeight();
            currentY = pageHeight - topMargin;
            yRef.current = currentY;
            canAddPageNumber = true;
        }
    
        // Largeur disponible pour chaque item (moitié de la largeur totale)
        const itemWidth = availableWidth / 2;
    
        // Dessiner le premier item (aligné à gauche)
        drawItem(items[0], marginLeft, currentY, itemWidth);
    
        // Dessiner le deuxième item (juste après le premier)
        drawItem(items[1], marginLeft + itemWidth, currentY, itemWidth);
    
        // Mettre à jour la position Y pour les prochains dessins
        currentY -= lineHeight;
        yRef.current = currentY - marginAfter;
        return yRef.current
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
        marginAfter: number,
        font: PDFFont,
        fontBold: PDFFont,
        context: {
            horizontalSpacing?: number;
            maxWidth?: number;
            bulletSymbol?: string;
            lineHeight: number;
            topMargin: number;
            bottomMargin: number;
        },
        pdfDoc: PDFDocument,
        pageRef: { current: PDFPage },
        yRef: { current: number }
    ) => {
        const {
            horizontalSpacing = 2,
            lineHeight,
            maxWidth = Infinity,
            bulletSymbol = "• ",
            topMargin,
            bottomMargin
        } = context;
    
        const height = pageRef.current.getSize().height;
        const pageWidth = pageRef.current.getSize().width;
        const effectiveRightMargin = pageWidth - rightMargin;
    
        // Initialize positions
        let currentX = startX;
        let currentY = yRef.current !== undefined ? yRef.current : startY;
        let lowestYInBlock = currentY; // Track the lowest Y position in this block
        let canAddPageNumber:boolean = false;
        // Helper function to handle page breaks
        const checkPageBreak = (neededHeight: number) => {
            if (currentY - neededHeight < bottomMargin) {
                const newPage = pdfDoc.addPage([595, 842]);
                pageRef.current = newPage;
                currentY = newPage.getHeight() - topMargin;
                currentX = startX;
                lowestYInBlock = currentY;
                canAddPageNumber = true;
                return true;
            }
            return false;
        };
    
        // Handle bullet point if it's a list item
        if (isListItem) {
            const bulletSize = textEntries[0]?.size || 12;
            
            // Check if we need a new page before drawing bullet
            checkPageBreak(lineHeight);
    
            pageRef.current.drawText(bulletSymbol, {
                x: currentX,
                y: currentY,
                size: bulletSize,
                font,
                color: rgb(0, 0, 0),
            });
    
            currentX += font.widthOfTextAtSize(bulletSymbol, bulletSize) + horizontalSpacing;
            if (canAddPageNumber) {
                getPdfXCenter(50,50,pdfDoc,10,font,pageRef.current)
                canAddPageNumber = false;
            }
        }
    
        // Process each text entry
        textEntries.forEach((entry) => {
            const { text, size = 12, isBold = false, color = rgb(0, 0, 0) } = entry;
            const currentFont = isBold ? fontBold : font;
            const words = text.split(' ');
            let currentLine = '';
    
            // Split text into lines that fit within available width
            words.forEach((word) => {
                const testLine = currentLine ? `${currentLine} ${word}` : word;
                const testWidth = currentFont.widthOfTextAtSize(testLine, size);
                const availableWidth = Math.min(effectiveRightMargin - currentX, maxWidth);
    
                if (testWidth > availableWidth) {
                    // Draw the current line if it's not empty
                    if (currentLine) {
                        // Check if we need a new page before drawing this line
                        checkPageBreak(lineHeight);
    
                        pageRef.current.drawText(currentLine, {
                            x: currentX,
                            y: currentY,
                            size,
                            font: currentFont,
                            color,
                        });
    
                        // Update lowest Y position
                        if (currentY < lowestYInBlock) {
                            lowestYInBlock = currentY;
                        }
                        if (canAddPageNumber) {
                            getPdfXCenter(50,50,pdfDoc,10,font,pageRef.current)
                            canAddPageNumber = false;
                        }
                    }
    
                    // Move to next line
                    currentY -= lineHeight;
                    currentX = isListItem 
                        ? startX + font.widthOfTextAtSize(bulletSymbol, size) + horizontalSpacing 
                        : startX;
    
                    // Reset current line with the new word
                    currentLine = word;
    
                    // Check page break again after moving to new line
                    checkPageBreak(lineHeight);
                } else {
                    currentLine = testLine;
                }
            });
    
            // Draw the remaining text in currentLine
            if (currentLine) {
                const lineWidth = currentFont.widthOfTextAtSize(currentLine, size);
                const availableWidth = Math.min(effectiveRightMargin - currentX, maxWidth);
    
                // If line doesn't fit, move to next line
                if (lineWidth > availableWidth) {
                    currentY -= lineHeight;
                    currentX = isListItem 
                        ? startX + font.widthOfTextAtSize(bulletSymbol, size) + horizontalSpacing 
                        : startX;
                    checkPageBreak(lineHeight);
                }
    
                // Draw the line
                pageRef.current.drawText(currentLine, {
                    x: currentX,
                    y: currentY,
                    size,
                    font: currentFont,
                    color,
                });
                if (canAddPageNumber) {
                    getPdfXCenter(50,50,pdfDoc,10,font,pageRef.current)
                    canAddPageNumber = false;
                }
                // Update positions
                if (currentY < lowestYInBlock) {
                    lowestYInBlock = currentY;
                }
                currentX += currentFont.widthOfTextAtSize(currentLine, size) + horizontalSpacing;
            }
        });
    
        // Update yRef to the lowest position in this block minus lineHeight
        yRef.current = lowestYInBlock - lineHeight;
        yRef.current = yRef.current - marginAfter;
        return { finalX: currentX, finalY: yRef.current };
    };
    const getTextWidth = (text:string, font: PDFFont, fontSize:number) => {
        const width = font.widthOfTextAtSize(text, fontSize);
        return width;
    }
    const getPdfXCenter = (ml:number,mr:number,pdfDoc:PDFDocument,fontSize:number,font:PDFFont,page:PDFPage)=>{
        const pageWidth = 595;
        const currentPage = pdfDoc.getPageCount();
        const pageNumberText = `${currentPage}`;
        const textWidth = getTextWidth(pageNumberText, font, fontSize);
        const usableWidth = pageWidth - ml - mr;
        const centerX = ml + usableWidth / 2;
        const textX = centerX - textWidth / 2;
        page.drawText(pageNumberText, {
            x: textX,
            y: 25, // 30pt depuis le bas
            size: fontSize,
            font,
            color: rgb(0, 0, 0),
        });
    }
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
                const pdfUrl = await handlePdf(client,{name:"Test Name",freelancerName:"ROD TECH SOLUTIONS",freelanceAdresse:'123 Rue Saint-Sébastien, Poissy 78300, France',freelancerSirets:"SIRET",freelancerVAT:"",clientEmail:"test@mail.com",clientAddress:"123 rue Saint-Sébastien, Poissy 78300, France",clientSIRET:"",clientPhone:"7845 454 12",confidentiality:true,projectTitle:"SIte Web",projectDescription:"Test du site",startDate:new Date().toISOString(),endDate:new Date().toISOString(),effectiveDate:new Date().toISOString(),deliverables:"50",totalPrice:700,paymentMethod:"Bank Transfer",paymentSchedule:"25%,25%,50%",terminationTerms:"50",governingLaw:"French Law",projectFonctionList:["Fonction1","Fonction2","Fonction4","Fonction4"]})
                window.open(pdfUrl, '_blank');
            } else {
              console.log("Document non trouvé !");
              return null;
            }
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
