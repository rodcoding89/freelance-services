"use client"
import { useTranslationContext } from '@/hooks/app-hook';
import React, { useEffect, useRef, useState } from 'react';
import { PDFDocument, PDFFont, PDFImage, PDFPage, RGB, rgb, StandardFonts } from "pdf-lib";
import { sendContract } from '@/server/services-mail';
import { saveContractDoc } from '@/server/services-save-doc';
import { useParams } from 'next/navigation';
import { loadEnTranslation } from '@/utils/fonction';
import SalesTax from 'sales-tax';


type SingleTextLayourt = {
    size: number;
    isBold: boolean;
    font: PDFFont;
    fontBold: PDFFont;
    lineHeight: number;
    topMargin: number;
    bottomMarginThreshold: number;
    isListItem:boolean;
};
  
type HorizontalLayout = {
    horizontalSpacing: number;
    lineHeight: number;
    topMargin: number;
    bottomMargin: number;
    bulletSymbol:string;
};

type ContractSignaturData = [
    Array<any>,
    Array<any>,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    boolean,
    PDFFont,
    PDFFont,
    PDFDocument,
    any,
    any
]

type DataStructureSingleText = [
    string,
    number,
    number,
    number,
    number,
    SingleTextLayourt,
    PDFDocument,
    any,
    any
];
  
type DataStructureHorizontalText = [
    Array<any>,
    number,
    number,
    boolean,
    number,
    number,
    PDFFont,
    PDFFont,
    HorizontalLayout,
    PDFDocument,
    any,
    any
];
type FunctionParams = {
    [key: number]: {
      id: number;
      param: DataStructureSingleText[] | DataStructureHorizontalText[] | ContractSignaturData[];
    };
};

interface Client {
    id: string;
    name:string;
    taxId?:string;
    email?:string;
    modifDate:string
    clientNumber:number;
    invoiceCount?:number;
    clientLang:string;
}

interface contractFormPrestataire{
    freelancerName:string;
    freelancerTaxId?:string;
    freelanceAddress:string;
    projectTitle:string;
    projectDescription:string;
    startDate:string;
    endDate:string;
    totalPrice:number;
    paymentSchedule:string;
    maintenanceCategory:"app"|"saas"|"web"|null;
}
interface clientCountry {
    id:number,
    name:string,
    taxB2C:string,
    taxB2B:string,groupe:string,
    currency:string,
    isoCode:string,threshold_before_tax:number,
    specficTo:"state"|"country",
    vat?:string,
    state:{name:string,tax:number,vat:string,stateCode:string,threshold:number}|null
}

interface contractFormClient{
    name:string;
    adresse:{
        street:string;
        postalCode:string;
        city:string;
        country:clientCountry;
    }
    typeClient:"company"|"particular"|null;
    clientBillingAddress?:string;
    clientEmail:string;
    clientPhone:string;
    clientVatNumber?:string;
    typeMaintenance?:"perYear"|"perHour"|"";
}

interface Contract {
    clientGivingData:contractFormClient|null,
    prestataireGivingData:contractFormPrestataire|null,
    contractType: "service"|"maintenance"|"service_and_maintenance";
    maintenanceCategory:"app"|"saas"|"web"|null;
    mprice?:number;
    tax:number;
    projectFonctionList:{title:string,description:string,quantity:number,price:number}[];
    contractLanguage:string;
    saleTermeConditionValided?:boolean;
    electronicContractSignatureAccepted?:boolean;
    rigthRetractionLostAfterServiceBegin?:boolean;
}
interface Services {
    clientId:string;
    name:string;
    serviceType: "service"|"maintenance"|"service_and_maintenance";
    contractStatus: 'signed' | 'unsigned' | 'pending';
    contract:Contract
}


interface GeneredContractProps {
  client:Client|null;
  clientSignatureLink:string|null;
  freelanceSignatureLink:string|null;
  locale:string;
  service:Services|null;
  onEmit:(data:{translatedOrOriginalContractLink:string,notEnContractLink:string,paymentLink:string,status:"success"|"error"})=>void;
}

const supportCountryWithPlugins = ["US","CA","DE","FR","IT","ES","AT","BE","NL","CH","GB","AU","ZA","NG"]
const enableCountryForThresholdBeforTax = ["CA","US","CH","AU","ZA"]

const enableCountryforLostRetraction = ['GB','CH','FR','IT','ES','NL','DE','AT','BE','ZA','AU','CA']

const GeneratePdfContract:React.FC<GeneredContractProps> = ({client,freelanceSignatureLink,clientSignatureLink,locale,onEmit,service}) => {
    if (client === null || clientSignatureLink === null || freelanceSignatureLink === null || service === null) return
    SalesTax.setTaxOriginCountry('US');
    const t:any = useTranslationContext();
    const contract = service.contract as Contract
    const {id,serviceId} = useParams()
    const clientServiceId = serviceId as string;
    const clientId = id as string;
    const lang = `${locale === 'fr' ? 'French' : locale === 'de' ? 'German' : 'English'}`
    const [tax,setTax] = useState<number>(0)
    const functionListAndRang = [
        {name:"addText",count:2,id:1},{name:"addHorizontalText",count:1,id:2},
        {name:"addText",count:1,id:3},
        {name:"addHorizontalText",count:1,id:4},
        {name:"addText",count:2,id:5},
        {name:"addHorizontalText",count:3,id:6},
        {name:"addText",count:10,id:7},
        {name:"foreach",fonc:"addText",id:8},
        {name:"addText",count:19,id:9},
        {name:"addHorizontalText",count:1,id:10},
        {name:"addText",count:5,id:11},
        {name:"addHorizontalText",count:1,id:12},
        {name:"addText",count:5,id:13},
        {name:"addHorizontalText",count:1,id:14},
        {name:"addText",count:4,id:15},
        {name:"addHorizontalText",count:1,id:16},
        {name:"addText",count:3,id:17},
        {name:"addHorizontalText",count:1,id:18},
        {name:"addText",count:9,id:19},
        {name:"addHorizontalText",count:1,id:20},
        {name:"addText",count:29,id:21},
        {name:"addHorizontalText",count:1,id:22},
        {name:"addText",count:1,id:23},
        {name:"foreach",fonc:"addHorizontalText",id:24},
        {name:"addText",count:1,id:25},
        {name:"addHorizontalText",count:1,id:26},
        {name:"addText",count:10,id:27},
        {name:"addHorizontalText",count:1,id:28},
        {name:"addText",count:6,id:29},
        {name:"addHorizontalText",count:1,id:30},
        {name:"addText",count:7,id:31},
        {name:"addText",count:1,id:32},
        {name:"addHorizontalText",count:1,id:33},
        {name:"addText",count:5,id:34},
        {name:"addHorizontalText",count:1,id:35},
        {name:"addText",count:19,id:36},
        {name:"addHorizontalText",count:1,id:37},
        {name:"addText",count:1,id:38},
        {name:"addHorizontalText",count:2,id:39},
        {name:"addText",count:25,id:40},
        {name:"signatureBloc",count:3,id:41}
    ]
    const isDataStructureSingleText = (
    item: DataStructureSingleText | DataStructureHorizontalText | ContractSignaturData): item is DataStructureSingleText => {
        return Array.isArray(item) && item.length === 9;
    };

    const isDataStructureHorizontalText = (
    item: DataStructureSingleText | DataStructureHorizontalText | ContractSignaturData): item is DataStructureHorizontalText => {
        return Array.isArray(item) && item.length === 12;
    };

    const isDataStructureSignatureText = (
    item: DataStructureSingleText | DataStructureHorizontalText | ContractSignaturData): item is ContractSignaturData => {
        return Array.isArray(item) && item.length === 16;
    };

    const formatDate = (date:string|Date)=>{
        const fdate = new Date(date)
        const day = fdate.getDate();
        const month = fdate.getMonth() + 1; // Les mois commencent à 0
        const year = fdate.getFullYear();
        if (locale === "en") {
            return `${year}/${String(month).padStart(2, '0')}/${String(day).padStart(2, '0')}`;
        }
        return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
    }

    const calculPrice = (totalPrice:number,rate:number)=>{
        return (totalPrice * rate / 100).toFixed(2)
    }

    const calculTaxPrice = (price:number,rate:number)=>{
        return (price * rate).toFixed(2)
    }

    const getCA = (currency:string)=>{
        return 0
    }

    const handleClientTaxability = async(juridiction:string)=>{
        const result = await fetch(`/api/check-client-taxability/`,{
            method: 'POST', // Garde votre méthode GET pour l'exemple
            headers: {
            'Content-Type': 'application/json',
            },
            body: JSON.stringify({juridiction})
        })
        if (!result.ok) {
            throw new Error('Erreur lors de la requête');
        }
        const response = await result.json();
        return response.success
    }

    const checkCLientIsExemptFromTax = async(isoCode:string,stateCode:string|null,taxNumber:string|undefined)=>{
        const data = await SalesTax.getTaxExchangeStatus (isoCode, stateCode,taxNumber)
        return data;
    }

    const calculTotalPriceWithTva = async(price:string,limitBeforeTax:number,currency:string,isoCode:string,stateCode:string|null,taxNumber:string|undefined,specficTo:"state"|"country",tax:number)=>{
        const clientTaxInfo = await getClientTaxInfo(isoCode,specficTo,stateCode,taxNumber,tax) as {rate:number}|null
        setTax(clientTaxInfo ? clientTaxInfo.rate * 100 : 0)
        console.log("clientTaxInfo",clientTaxInfo)
        if (clientTaxInfo === null) {
            return {taxPrice:'0',totalePrice:parseInt(price).toFixed(2),taxValue:0}
        } else{
            const taxPrice = calculTaxPrice(parseInt(price),clientTaxInfo.rate)
            const totalePrice = (parseInt(price) + parseInt(taxPrice)).toFixed(2)
            return {taxPrice,totalePrice,taxValue:clientTaxInfo.rate*100}
        }
    }

    const getClientTaxInfo = async(isoCode:string,specficTo:"state"|"country",stateCode:string|null,taxNumber:string|undefined,tax:number) =>{
        console.log("tax",tax)
        const isCountryTaxable  =  SalesTax.hasSalesTax (isoCode);
        const isStateTaxable = SalesTax.hasStateSalesTax ( isoCode ,  stateCode ?? '' )
        const canPayTax = await checkCLientIsExemptFromTax(isoCode,stateCode,taxNumber)
        console.log("isCountryTaxable",isCountryTaxable,"isStateTaxable",isStateTaxable,"canPayTax",canPayTax)
        console.log("isocode",isoCode,"stateCode",stateCode,"taxNumber",taxNumber)
        const getTaxData = async()=>{
            if (isCountryTaxable || isStateTaxable) {
                if (!canPayTax.exempt) {
                    const saleTax = await SalesTax. getSalesTax(isoCode,stateCode,  taxNumber)
                    console.log("saleTax",saleTax)
                    return {rate:saleTax.rate}
                }
                return null
            }
            return null
        }
        if(supportCountryWithPlugins.includes(isoCode)){
            if (enableCountryForThresholdBeforTax.includes(isoCode)) {
                const canTaxClient = await handleClientTaxability(isoCode)
                console.log("canTaxClient",canTaxClient)
                if (!canTaxClient) {
                    return getTaxData()
                }
                return null
            }else{
                return getTaxData()
            }
        }else{
            return new Promise((resolve,reject)=>{
                resolve({rate:tax/100})})
        }
    }
    const getTotalPrice = async(para:string)=>{
        const {taxPrice,totalePrice} = await calculTotalPriceWithTva(contract.prestataireGivingData!.totalPrice.toString(),contract.clientGivingData!.adresse.country.threshold_before_tax,contract.clientGivingData!.adresse.country.currency,contract.clientGivingData!.adresse.country.isoCode,contract.clientGivingData!.adresse.country.state?.stateCode ?? '',contract.clientGivingData!.clientVatNumber ?? undefined,contract.clientGivingData!.adresse.country.specficTo,contract.clientGivingData?.typeClient === 'company' ? parseInt(contract.clientGivingData.adresse.country.taxB2B ?? '0') : parseInt(contract.clientGivingData?.adresse.country.taxB2C ?? '0') )
        return para.replace("{price}",totalePrice)
    }
    const generePaiementDoc = async(data:Contract) =>{
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
        const marginBottom = 50+10;
        const marginTop = 50;
        const lineHeight = 14;

        //const signatureImage = await pdfDoc.embedPng(signingLink);
        //page.drawImage(signatureImage, { x: 50, y: 250, width: 200, height: 80 });

        // Position initiale
        let yPosition = height - margin;
        const pageRef = { current: page };
        const yRef = { current: yPosition };
        const lastParam:[PDFDocument,any,any] = [pdfDoc,pageRef,yRef]
            
        const textHorizontalOption:HorizontalLayout = {horizontalSpacing:5,lineHeight,topMargin:marginTop,bottomMargin:marginBottom,bulletSymbol:''}
        const addTextOption:SingleTextLayourt = {size:11, isBold:false,font:fontRegular,fontBold:fontBold,lineHeight:lineHeight,topMargin:marginTop,bottomMarginThreshold:marginBottom,isListItem:false}
        try {
            const pageTitel = t.payment.title;
            yRef.current = addText([pageTitel,margin,margin,margin,40,{...addTextOption,size:18,isBold:true},...lastParam])

            const pagePara = `${t.payment.pagePara11.replace("{title}",`"${contract.prestataireGivingData!.projectTitle}"`)} ${t.payment.pagePara12} ${contract.prestataireGivingData!.paymentSchedule.split(",").length > 0 ? t.payment.pagePara13 : ''}`
            yRef.current = addText([pagePara,margin,margin,margin,10,{...addTextOption,size:11,isBold:false},...lastParam])
            const pagePara2 = t.payment.pagePara2;
            yRef.current = addText([pagePara2,margin,margin,margin,30,{...addTextOption,size:11,isBold:false},...lastParam])
            let price;
            let beforeStart = t.payment.beforeStart;
            let afterDelively = t.payment.afterDelively;
            let intermediare = t.payment.intermediarePaiement;
            const echelonement = contract.prestataireGivingData!.paymentSchedule.split(",");
            let pageEchelonement;
            const bayingSchedule = [beforeStart];
            const priceSchedule:string[] = [];
            const currency = contract.clientGivingData!.adresse.country.currency;
            const limitBeforeTax = contract.clientGivingData!.adresse.country.threshold_before_tax;
            const {taxPrice,totalePrice,taxValue} = await calculTotalPriceWithTva(contract.prestataireGivingData?.totalPrice.toString() ?? '0',limitBeforeTax,currency,contract.clientGivingData?.adresse.country.isoCode ?? '',contract.clientGivingData?.adresse.country.state?.stateCode ?? null,contract.clientGivingData?.clientVatNumber ?? undefined,contract.clientGivingData!.adresse.country.specficTo,contract.clientGivingData?.typeClient === 'company' ? parseInt(contract.clientGivingData.adresse.country.taxB2B ?? '0') : parseInt(contract.clientGivingData?.adresse.country.taxB2C ?? '0'));
            if (echelonement.length === 0) {
                pageEchelonement = t.payment.singleEchelon;
                const final = addHorizontalText([[{text:pageEchelonement,size:11,isBold:false},{text:totalePrice.toString(),size:14,isBold:true},{text:'EUR',size:11,isBold:false},{text:t.payment.ttc,size:9,isBold:true}],margin,yRef.current,false,margin,30,fontRegular,fontBold,textHorizontalOption,...lastParam])
                yRef.current = final.finalY
            } else {
                pageEchelonement = t.payment.multipleEchelon;
                yRef.current = addText([pageEchelonement,margin,margin,margin,20,{...addTextOption,size:11,isBold:false},...lastParam])
                echelonement.forEach((item,index)=>{
                    const nitem = item.split('%');
                    const rate = parseInt(nitem[0])
                    const nprice = calculPrice(parseFloat(totalePrice),rate);
                    priceSchedule.push(nprice)
                    if (index === echelonement.length - 1) {
                        bayingSchedule.push(afterDelively);
                    }else if(index !== 0){
                        bayingSchedule.push(intermediare.replace("{nr}",String(index+1)))
                    }
                    if (index === 0) {
                        const final = addHorizontalText([[{text:bayingSchedule[index],size:11,isBold:false},{text:priceSchedule[index].toString(),size:14,isBold:true},{text:`EUR`,size:11,isBold:false},{text:t.payment.ttc,size:9,isBold:true},{text:`${t.payment.bySigning}`,size:11,isBold:false}],margin,yRef.current,true,margin,index === echelonement.length - 1 ? 30 : 10,fontRegular,fontBold,{...textHorizontalOption,bulletSymbol:`${index+1}`},...lastParam])
                        yRef.current = final.finalY
                    }else{
                        const final = addHorizontalText([[{text:bayingSchedule[index],size:11,isBold:false},{text:priceSchedule[index].toString(),size:14,isBold:true},{text:'EUR',size:11,isBold:false},{text:t.payment.ttc,size:9,isBold:true}],margin,yRef.current,true,margin,index === echelonement.length - 1 ? 30 : 10,fontRegular,fontBold,{...textHorizontalOption,bulletSymbol:`${index+1}`},...lastParam])
                        yRef.current = final.finalY
                    }
                })
            }

            const totalPrice = t.payment.totalPrice;

            const final = addHorizontalText([[{text:totalPrice,size:16,isBold:true},{text:totalePrice.toString(),size:14,isBold:true},{text:'EUR',size:11,isBold:false},{text:t.payment.ttc,size:9,isBold:true}],margin,yRef.current,true,margin,30,fontRegular,fontBold,{...textHorizontalOption},...lastParam])
            yRef.current = final.finalY
            
            const pagePara3 = t.payment.pagePara3
            //console.log("bayingSchedule",bayingSchedule,"priceSchedule",priceSchedule)
            yRef.current = addText([pagePara3,margin,margin,margin,20,{...addTextOption,size:11,isBold:false},...lastParam]);
            const payingLink = process.env.NEXT_PUBLIC_PAYMENT_LINK ?? '';
            yRef.current = addText([payingLink,margin,margin,margin,20,{...addTextOption,size:11,isBold:false},...lastParam,rgb(0, 0, 0.55)])
            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            return {blob:blob,taxValue:taxValue};
        } catch (error) {
            console.error(error)
            return null;
        }
    }

    async function blobToBase64(blob:Blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                // Ensure the result is a string (from readAsDataURL)
                if (typeof reader.result === 'string') {
                    // Extract just the Base64 part (after the comma)
                    const base64Data = reader.result.split(',')[1];
                    resolve(base64Data);
                } else {
                    reject(new Error('Failed to convert blob to base64.'));
                }
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }

    const generedEnContractVersion = async()=>{
        try {
            const translation = await loadEnTranslation("en");
            const data = await handlePdf(translation)
            //console.log("translation",translation)
            return data;
        } catch (error) {
            console.error(error)
            return null;
        }
        
    }
    const generedNotEnContractVersion = async(clientLang:string)=>{
        try {
            const translation = await loadEnTranslation(clientLang);
            const data = await handlePdf(translation)
            //console.log("translation",translation)
            return data;
        } catch (error) {
            console.error(error)
            return null;
        }
    }

    const handlePdf = async(translated:any)=>{
        //if(!signingLink) return
        const t = translated;
        const content = {
            para: t.header.para,
            title: contract.contractType === 'service' ? t.header.titleService + contract.prestataireGivingData!.projectTitle : contract.contractType === 'maintenance' ? t.header.titleMaintenance + contract.prestataireGivingData!.projectTitle : t.header.titleServiceMaintenance + contract.prestataireGivingData!.projectTitle,
            sousTitle: t.header.subTitle,
            clientName: `${contract.clientGivingData!.name}`,
            freelanceName: `${contract.prestataireGivingData!.freelancerName}`,
            preambleAdresseClient:`${t.header.home} ${contract.clientGivingData!.adresse.street} ${contract.clientGivingData!.adresse.postalCode} ${contract.clientGivingData!.adresse.city} ${contract.clientGivingData!.adresse.country.name} ${t.header.designation}`,
            from:t.header.from,
            preambleAdresseFreelance:`${t.header.home} ${contract.prestataireGivingData!.freelanceAddress} ${t.header.designation}`,
            to:t.header.to,
            and:t.header.and
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
            const marginBottom = 50+10;
            const marginTop = 50;
            const lineHeight = 14;
    
            //const signatureImage = await pdfDoc.embedPng(signingLink);
            //page.drawImage(signatureImage, { x: 50, y: 250, width: 200, height: 80 });
    
            // Position initiale
            let yPosition = height - margin;
            const pageRef = { current: page };
            const yRef = { current: yPosition };
            const lastParam:[PDFDocument,any,any] = [pdfDoc,pageRef,yRef]
            
            const textHorizontalOption:HorizontalLayout = {horizontalSpacing:5,lineHeight,topMargin:marginTop,bottomMargin:marginBottom,bulletSymbol:''}
            const addTextOption:SingleTextLayourt = {size:11, isBold:false,font:fontRegular,fontBold:fontBold,lineHeight:lineHeight,topMargin:marginTop,bottomMarginThreshold:marginBottom,isListItem:false}
              
            const fonctionParam:FunctionParams = {
                1:{
                    id:1,
                    param:[
                        [content.title, margin, yRef.current,margin,20,{...addTextOption,lineHeight:lineHeight+6,size:18,isBold:true},...lastParam
                        ],
                        [content.sousTitle, margin, yRef.current, margin,10,{...addTextOption,lineHeight:lineHeight,size:9,isBold:true},...lastParam]
                    ]
                },
                2:{
                    id:2,
                    param:[[[{text:content.clientName,size:11,isBold:true,color:rgb(0, 0, 0)},{text:content.preambleAdresseClient,size:11,isBold:false,color:rgb(0, 0, 0)},{text:content.from,size:11,isBold:true,color:rgb(0, 0, 0)}],margin+30,yRef.current,true,margin,10,fontRegular,fontBold,textHorizontalOption,...lastParam]]
                },
                3:{
                    id:3,
                    param:[[content.and, margin, yRef.current,margin,10,{...addTextOption,isBold:true},...lastParam]]
                },
                4:{
                    id:4,
                    param:[[[{text:content.freelanceName,size:11,isBold:true,color:rgb(0, 0, 0)},{text:content.preambleAdresseFreelance,size:11,isBold:false,color:rgb(0, 0, 0)},{text:content.to,size:11,isBold:true,color:rgb(0, 0, 0)}],margin+30,yRef.current,true,margin,10,fontRegular,fontBold,textHorizontalOption,...lastParam]]
                },
                5:{
                    id:5,
                    param:[[t.header.parties, margin, yRef.current,margin,40, {...addTextOption,fontBold:fontBoldItalic,isBold:true,size:9},...lastParam],[t.sections["1"].title, margin, yRef.current,margin,15,{...addTextOption,isBold:true,size:16},...lastParam]]
                },
                6:{
                    id:6,
                    param:[[[{text:t.sections["1"].paraDef,size:12,isBold:true,color:rgb(0, 0, 0)},{text:t.sections["1"].para1,size:11,isBold:false,color:rgb(0, 0, 0)}],margin,yRef.current,false,margin,10,fontRegular,fontBold,textHorizontalOption,...lastParam],[[{text:t.sections["1"].paraDef,size:12,isBold:true,color:rgb(0, 0, 0)},{text:t.sections["1"].para2,size:11,isBold:false,color:rgb(0, 0, 0)}],margin,yRef.current,false,margin,10,fontRegular,fontBold,textHorizontalOption,...lastParam],[[{text:t.sections["1"].paraDef,size:12,isBold:true,color:rgb(0, 0, 0)},{text:t.sections["1"].para3,size:11,isBold:false,color:rgb(0, 0, 0)}],margin,yRef.current,false,margin,10,fontRegular,fontBold,textHorizontalOption,...lastParam]]
                },
                7:{
                    id:7,
                    param:[[t.sections["1"].para, margin, yRef.current,margin,40, {...addTextOption,size:12,isBold:true},...lastParam],[t.sections["2"].title, margin, yRef.current,margin,15, {...addTextOption,size:16,isBold:true},...lastParam],[t.sections["2"].sec1.title, margin, yRef.current,margin,10, {...addTextOption,size:13},...lastParam],[t.sections["2"].sec1.para, margin, yRef.current,margin,15, addTextOption,...lastParam],[t.sections["2"].sec2.title, margin, yRef.current,margin,15, {...addTextOption,size:13},...lastParam],[t.sections["2"].sec2.para, margin, yRef.current,margin,40, addTextOption,...lastParam],[t.sections["3"].title, margin, yRef.current,margin,15, {...addTextOption,size:16,isBold:true},...lastParam],[t.sections["3"].sec1.title, margin, yRef.current,margin,10, {...addTextOption,size:13},...lastParam],[contract.prestataireGivingData!.projectDescription, margin, yRef.current,margin,15, addTextOption,...lastParam],[t.sections["3"].sec2.title, margin, yRef.current,margin,10, {...addTextOption,size:13},...lastParam]]
                },
                8:{
                    id:8,
                    param:[['{item}', margin+30, yRef.current,margin,8, {...addTextOption,isListItem:true},...lastParam]]
                },
                9:{
                    id:9,
                    param:[[t.sections["3"].sec3.title, margin, yRef.current,margin,10, {...addTextOption,size:13},...lastParam],[contract.contractType === 'service' ? t.sections["3"].sec3.paraService.replace("{startDate}",formatDate(contract.prestataireGivingData!.startDate)).replace("{endDate}",formatDate(contract.prestataireGivingData!.endDate)) : contract.contractType === 'maintenance' ? t.sections["3"].sec3.paraMaintenance : t.sections["3"].sec3.paraServiceMaintenance.replace("{endDate}",formatDate(contract.prestataireGivingData!.endDate)), margin, yRef.current,margin,15, addTextOption,...lastParam],[contract.contractType === 'service' ? t.sections["3"].sec4.titleService : contract.contractType === 'maintenance' ? t.sections["3"].sec4.titleMaintenance : t.sections["3"].sec4.titleServiceMaintenance, margin, yRef.current,margin,10, {...addTextOption,size:13},...lastParam],[contract.contractType === 'service' ? await getTotalPrice(t.sections["3"].sec4.paraService) : contract.contractType === 'maintenance' ? contract.clientGivingData!.typeMaintenance === 'perHour' ? t.sections["3"].sec4.paraMaintenance.peerHour.replace("{mprice}",contract.mprice) : t.sections["3"].sec4.paraMaintenance.peerYear.replace("{mprice}",contract.mprice) : `${t.sections["3"].sec4.paraServiceMaintenance.para.replace("{price}",contract.prestataireGivingData!.totalPrice)} ${
                    contract.clientGivingData!.typeMaintenance === 'perHour' ? t.sections["3"].sec4.paraServiceMaintenance.peerHour.replace("{mprice}",contract.mprice) : t.sections["3"].sec4.paraServiceMaintenance.peerYear.replace("{mprice}",contract.mprice)} ${t.sections["3"].sec4.paraServiceMaintenance.para1}`
                    ,margin, yRef.current,margin,40, addTextOption,...lastParam],[t.sections["4"].title, margin, yRef.current,margin,15, {...addTextOption,size:16,isBold:true},...lastParam],[t.sections["4"].sec1.title, margin, yRef.current,margin,10, {...addTextOption,size:13},...lastParam],[t.sections["4"].sec1.para, margin, yRef.current,margin,15, addTextOption,...lastParam],[t.sections["4"].sec2.title, margin, yRef.current,margin,10, {...addTextOption,size:13},...lastParam],[t.sections["4"].sec2.para, margin, yRef.current,margin,10, addTextOption,...lastParam],[t.sections["4"].sec2.paraClose, margin, yRef.current,margin,40, {...addTextOption,size:9,isBold:true},...lastParam],[t.sections["5"].title, margin, yRef.current,margin,15, {...addTextOption,size:16,isBold:true},...lastParam],[t.sections["5"].sec1.title, margin, yRef.current,margin,10, {...addTextOption,size:13},...lastParam],[t.sections["5"].sec1.para, margin, yRef.current,margin,15, addTextOption,...lastParam],[t.sections["5"].sec2.title, margin, yRef.current,margin,10, {...addTextOption,size:13},...lastParam],[t.sections["5"].sec2.para1, margin, yRef.current,margin,10, addTextOption,...lastParam],[t.sections["5"].sec2.para2, margin, yRef.current,margin,15, addTextOption,...lastParam],[t.sections["5"].sec3.title, margin, yRef.current,margin,10, {...addTextOption,size:13},...lastParam],[t.sections["5"].sec3.para, margin, yRef.current,margin,20, addTextOption,...lastParam],[t.sections["5"].sec3.paraA, margin, yRef.current,margin,8, addTextOption,...lastParam]]
                },
                10:{
                    id:10,
                    param:[[[{text:t.sections["5"].sec3.paraB1,size:11,isBold:false}],margin,yRef.current,false,margin,8,fontRegular,fontBold,
                    textHorizontalOption,...lastParam]]
                },
                11:{
                    id:11,
                    param:[[t.sections["5"].sec3.paraC, margin, yRef.current,margin,8, addTextOption,...lastParam],[t.sections["5"].sec3.paraD, margin, yRef.current,margin,8, addTextOption,...lastParam],[t.sections["5"].sec3.paraE, margin, yRef.current,margin,8, addTextOption,...lastParam],[t.sections["5"].sec3.paraF, margin, yRef.current,margin,8, addTextOption,...lastParam],[t.sections["5"].sec3.paraG, margin, yRef.current,margin,8, {...addTextOption,size:11,isBold:true},...lastParam]]
                },
                12:{
                    id:12,
                    param:[[[{text:t.sections["5"].sec3.paraH1,size:11,isBold:false},{text:t.sections["5"].sec3.paraH2,size:11,isBold:true}],margin,yRef.current,false,margin,8,fontRegular,fontBold,textHorizontalOption,...lastParam]]
                },
                13:{
                    id:13,
                    param:[[t.sections["5"].sec3.paraI, margin, yRef.current,margin,8, addTextOption,...lastParam],[t.sections["5"].sec3.paraJ, margin, yRef.current,margin,15, addTextOption,...lastParam],[t.sections["5"].sec4.title, margin, yRef.current,margin,10, {...addTextOption,size:13},...lastParam],[t.sections["5"].sec4.para, margin, yRef.current,margin,20, {...addTextOption,size:13},...lastParam],[t.sections["5"].sec4.paraA, margin, yRef.current,margin,8, addTextOption,...lastParam]]
                },
                14:{
                    id:14,
                    param:[[[{text:t.sections["5"].sec4.paraB1,size:11,isBold:false},{text:t.sections["5"].sec4.paraB2,size:11,isBold:true}],margin,yRef.current,false,margin,8,fontRegular,fontBold,textHorizontalOption,...lastParam]]
                },
                15:{
                    id:15,
                    param:[[t.sections["5"].sec4.paraC, margin, yRef.current,margin,15, addTextOption,...lastParam],[t.sections["5"].sec5.title, margin, yRef.current,margin,10, {...addTextOption,size:13},...lastParam],[t.sections["5"].sec5.para, margin, yRef.current,margin,15, addTextOption,...lastParam],[t.sections["5"].sec6.title, margin, yRef.current,margin,10, {...addTextOption,size:13},...lastParam]]
                },
                16:{
                    id:16,
                    param:[[[{text:t.sections["5"].sec6.para11,size:11,isBold:false},{text:t.sections["5"].sec6.para12,size:11,isBold:true},{text:t.sections["5"].sec6.para13,size:11,isBold:false}],margin,yRef.current,false,margin,15,fontRegular,fontBold,textHorizontalOption,...lastParam]]
                },
                17:{
                    id:17,
                    param:[[t.sections["5"].sec7.title, margin, yRef.current,margin,10, {...addTextOption,size:13},...lastParam],[t.sections["5"].sec7.para, margin, yRef.current,margin,15, addTextOption,...lastParam],[t.sections["5"].sec8.title, margin, yRef.current,margin,10, {...addTextOption,size:13},...lastParam]]
                },
                18:{
                    id:18,
                    param:[[[{text:t.sections["5"].sec8.para11,size:11,isBold:false},{text:t.sections["5"].sec8.para12,size:11,isBold:true},{text:t.sections["5"].sec8.para13,size:11,isBold:false}],margin,yRef.current,false,margin,15,fontRegular,fontBold,textHorizontalOption,...lastParam]]
                },
                19:{
                    id:19,
                    param:[[t.sections["5"].sec9.title, margin, yRef.current,margin,10, {...addTextOption,size:13},...lastParam],[t.sections["5"].sec9.para1, margin, yRef.current,margin,10, addTextOption,...lastParam],[t.sections["5"].sec9.para2.replace("{sday}",3).replace("{day}",7), margin, yRef.current,margin,10, addTextOption,...lastParam],[t.sections["5"].sec9.para3.replace("{sday}",3).replace("{day}",7), margin, yRef.current,margin,15, addTextOption,...lastParam],[t.sections["5"].sec10.title, margin, yRef.current,margin,10, {...addTextOption,size:13},...lastParam],[t.sections["5"].sec10.para1, margin, yRef.current,margin,20, addTextOption,...lastParam],[t.sections["5"].sec10.paraA, margin, yRef.current,margin,8, addTextOption,...lastParam],[t.sections["5"].sec10.paraB, margin, yRef.current,margin,8, addTextOption,...lastParam],[t.sections["5"].sec10.paraC, margin, yRef.current,margin,15, addTextOption,...lastParam]]
                },
                20:{
                    id:20,
                    param:[[[{text:t.sections["5"].sec10.para21,size:11,isBold:true},{text:t.sections["5"].sec10.para22,size:11,isBold:false}],margin,yRef.current,false,margin,10,fontRegular,fontBold,textHorizontalOption,...lastParam]]
                },
                21:{
                    id:21,
                    param:[[t.sections["5"].sec10.paraClose, margin, yRef.current,margin,15,{...addTextOption,isBold:true},...lastParam],[t.sections["5"].sec11.title, margin, yRef.current,margin,10, {...addTextOption,size:13},...lastParam],[t.sections["5"].sec11.para1, margin, yRef.current,margin,10, addTextOption,...lastParam],[t.sections["5"].sec11.para2, margin, yRef.current,margin,10, addTextOption,...lastParam],[t.sections["5"].sec11.para3, margin, yRef.current,margin,15, addTextOption,...lastParam],[t.sections["5"].sec12.title, margin, yRef.current,margin,10, {...addTextOption,size:13},...lastParam],[t.sections["5"].sec12.para, margin, yRef.current,margin,15, addTextOption,...lastParam],[t.sections["5"].sec12.paraA, margin, yRef.current,margin,8, addTextOption,...lastParam],[t.sections["5"].sec12.paraB, margin, yRef.current,margin,8, addTextOption,...lastParam],[t.sections["5"].sec12.paraC, margin, yRef.current,margin,8, addTextOption,...lastParam],[t.sections["5"].sec12.paraD, margin, yRef.current,margin,8, addTextOption,...lastParam],[t.sections["5"].sec12.paraE, margin, yRef.current,margin,8, addTextOption,...lastParam],[t.sections["5"].sec12.paraF, margin, yRef.current,margin,8, addTextOption,...lastParam],[t.sections["5"].sec12.paraG, margin, yRef.current,margin,8, addTextOption,...lastParam],[t.sections["5"].sec12.paraH, margin, yRef.current,margin,15, addTextOption,...lastParam],[t.sections["5"].sec13.title, margin, yRef.current,margin,10, {...addTextOption,size:13},...lastParam],[t.sections["5"].sec13.para, margin, yRef.current,margin,15, addTextOption,...lastParam],[t.sections["5"].sec13.paraA, margin, yRef.current,margin,8, addTextOption,...lastParam],[t.sections["5"].sec13.paraB, margin, yRef.current,margin,15, addTextOption,...lastParam],[t.sections["5"].sec13.paraClose, margin, yRef.current,margin,10, {...addTextOption,lineHeight:lineHeight+3,size:11},...lastParam],[t.sections["5"].sec14.title, margin, yRef.current,margin,10, {...addTextOption,size:13},...lastParam],[t.sections["5"].sec14.para, margin, yRef.current,margin,15, addTextOption,...lastParam],[t.sections["5"].sec14.paraA, margin, yRef.current,margin,8, addTextOption,...lastParam],[t.sections["5"].sec14.paraB, margin, yRef.current,margin,8, addTextOption,...lastParam],[t.sections["5"].sec14.paraC, margin, yRef.current,margin,8, addTextOption,...lastParam],[t.sections["5"].sec14.paraD, margin, yRef.current,margin,8, addTextOption,...lastParam],[t.sections["5"].sec14.paraE, margin, yRef.current,margin,15, addTextOption,...lastParam],[t.sections["5"].sec14.paraClose, margin, yRef.current,margin,15, {...addTextOption,lineHeight:lineHeight+3,size:11},...lastParam],[t.sections["5"].sec15.title, margin, yRef.current,margin,10, {...addTextOption,size:13},...lastParam]]
                },
                22:{
                    id:22,
                    param:[[[{text:t.sections["5"].sec15.para11,size:11,isBold:false},{text:t.sections["5"].sec15.para12,size:11,isBold:true},{text:t.sections["5"].sec15.para13,size:11,isBold:false}],margin,yRef.current,false,margin,10,fontRegular,fontBold,textHorizontalOption,...lastParam]]
                },
                23:{
                    id:23,
                    param:[[t.sections["5"].sec15.para4, margin, yRef.current,margin,15, addTextOption,...lastParam]]
                },
                24:{
                    id:24,
                    param:[[[{text:t.sections["5"].sec15.item,size:11,isBold:true,color:rgb(0,0,0)},{text:"item",size:11,isBold:false,color:rgb(0,0,0)}],margin+30,yRef.current,true,margin,8,fontRegular,fontBold,textHorizontalOption,...lastParam]]
                },
                25:{
                    id:25,
                    param:[[t.sections["5"].sec16.title, margin, yRef.current,margin,10, {...addTextOption,size:13},...lastParam]]
                },
                26:{
                    id:26,
                    param:[[[{text:t.sections["5"].sec16.para11,size:11,isBold:false,color:rgb(0,0,0)},{text:t.sections["5"].sec16.para12,size:11,isBold:true,color:rgb(0,0,0)},{text:t.sections["5"].sec16.para13,size:11,isBold:false,color:rgb(0,0,0)}],margin,yRef.current,false,margin,15,fontRegular,fontBold,textHorizontalOption,...lastParam]]
                },
                27:{
                    id:27,
                    param:[[t.sections["5"].sec17.title, margin, yRef.current,margin,10, {...addTextOption,size:13},...lastParam],[t.sections["5"].sec17.para1, margin, yRef.current,margin,15, addTextOption,...lastParam],[t.sections["5"].sec17.paraA, margin, yRef.current,margin,8, addTextOption,...lastParam],[t.sections["5"].sec17.paraB, margin, yRef.current,margin,8, addTextOption,...lastParam],[t.sections["5"].sec17.paraC, margin, yRef.current,margin,15, addTextOption,...lastParam],[t.sections["5"].sec17.para2, margin, yRef.current,margin,10, addTextOption,...lastParam],[t.sections["5"].sec17.paraClose, margin, yRef.current,margin,10, addTextOption,...lastParam],[t.sections["5"].sec18.title, margin, yRef.current,margin,10, {...addTextOption,size:13},...lastParam],[t.sections["5"].sec18.para1, margin, yRef.current,margin,8, addTextOption,...lastParam],[t.sections["5"].sec18.para2, margin, yRef.current,margin,8, addTextOption,...lastParam]]
                },
                28:{
                    id:28,
                    param:[[[{text:`3)`,size:11,isBold:false,color:rgb(0,0,0)},{text:t.sections["5"].sec18.para3,size:11,isBold:true,color:rgb(0,0,0)}],margin,yRef.current,false,margin,10,fontRegular,fontBold,textHorizontalOption,...lastParam]]
                },
                29:{
                    id:29,
                    param:[[t.sections["5"].sec18.paraClose, margin, yRef.current,margin,15, addTextOption,...lastParam],[t.sections["5"].sec19.title, margin, yRef.current,margin,10, {...addTextOption,size:13},...lastParam],[t.sections["5"].sec19.para1, margin, yRef.current,margin,10, addTextOption,...lastParam],[t.sections["5"].sec19.para2, margin, yRef.current,margin,10, addTextOption,...lastParam],[t.sections["5"].sec19.para3, margin, yRef.current,margin,10, addTextOption,...lastParam],[t.sections["5"].sec20.title, margin, yRef.current,margin,10, {...addTextOption,size:13},...lastParam]]
                },
                30:{
                    id:30,
                    param:[[[{text:t.sections["5"].sec20.para11,size:11,isBold:false,color:rgb(0,0,0)},{text:t.sections["5"].sec20.para12,size:11,isBold:true,color:rgb(0,0,0)},{text:t.sections["5"].sec20.para13,size:11,isBold:false,color:rgb(0,0,0)},{text:t.sections["5"].sec20.para14,size:11,isBold:true,color:rgb(0,0,0)},{text:t.sections["5"].sec20.para15,size:11,isBold:false,color:rgb(0,0,0)}],margin,yRef.current,false,margin,15,fontRegular,fontBold,textHorizontalOption,...lastParam]]
                },
                31:{
                    id:31,
                    param:[[t.sections["5"].sec20.para2A, margin+30, yRef.current,margin,8, {...addTextOption,isListItem:true},...lastParam],[t.sections["5"].sec20.para2B, margin+30, yRef.current,margin,15, {...addTextOption,isListItem:true},...lastParam],[t.sections["5"].sec20.para3, margin, yRef.current,margin,20, addTextOption,...lastParam],[t.sections["5"].sec20.paraBold, margin, yRef.current,margin,20, {...addTextOption,isBold:true},...lastParam],[t.sections["5"].sec20.para3A, margin+30, yRef.current,margin,8, {...addTextOption,isListItem:true},...lastParam],[t.sections["5"].sec20.para3B, margin+30, yRef.current,margin,8, {...addTextOption,isListItem:true},...lastParam],[t.sections["5"].sec20.para3C, margin+30, yRef.current,margin,15, {...addTextOption,isListItem:true},...lastParam]]
                },
                32:{
                    id:32,
                    param:[[t.sections["5"].sec20.para4, margin, yRef.current,margin,20, addTextOption,...lastParam]]
                },
                33:{
                    id:33,
                    param:[[[{text:t.sections["5"].sec20.para51,size:11,isBold:false,color:rgb(0,0,0)},{text:t.sections["5"].sec20.para52,size:11,isBold:true,color:rgb(0,0,0)},{text:t.sections["5"].sec20.para53,size:11,isBold:false,color:rgb(0,0,0)}],margin,yRef.current,false,margin,15,fontRegular,fontBold,textHorizontalOption,...lastParam]]
                },
                34:{
                    id:34,
                    param:[[t.sections["6"].title, margin, yRef.current,margin,15, {...addTextOption,isBold:true,size:16},...lastParam],[t.sections["6"].para, margin, yRef.current,margin,20, addTextOption,...lastParam],[t.sections["6"].sec1.title, margin, yRef.current,margin,10, {...addTextOption,size:13},...lastParam],[t.sections["6"].sec1.para, margin, yRef.current,margin,15, addTextOption,...lastParam],[t.sections["6"].sec2.title, margin, yRef.current,margin,10, {...addTextOption,size:13},...lastParam]]
                },
                35:{
                    id:35,
                    param:[[[{text:t.sections["6"].sec2.para11,size:11,isBold:false,color:rgb(0,0,0)},{text:t.sections["6"].sec2.para12,size:11,isBold:true,color:rgb(0,0,0)},{text:t.sections["6"].sec2.para13,size:11,isBold:false,color:rgb(0,0,0)}],margin,yRef.current,false,margin,15,fontRegular,fontBold,textHorizontalOption,...lastParam]]
                },
                36:{
                    id:36,
                    param:[[t.sections["6"].sec3.title, margin, yRef.current,margin,10, {...addTextOption,size:13},...lastParam],[t.sections["6"].sec3.para, margin, yRef.current,margin,15, addTextOption,...lastParam],[t.sections["6"].sec4.title, margin, yRef.current,margin,10, {...addTextOption,size:13},...lastParam],[t.sections["6"].sec4.para, margin, yRef.current,margin,15, addTextOption,...lastParam],[t.sections["6"].sec5.title, margin, yRef.current,margin,10, {...addTextOption,size:13},...lastParam],[t.sections["6"].sec5.para, margin, yRef.current,margin,15, addTextOption,...lastParam],[t.sections["6"].sec6.title, margin, yRef.current,margin,10, {...addTextOption,size:13},...lastParam],[t.sections["6"].sec6.para, margin, yRef.current,margin,15, addTextOption,...lastParam],[t.sections["6"].sec7.title, margin, yRef.current,margin,10, {...addTextOption,size:13},...lastParam],[t.sections["6"].sec7.para, margin, yRef.current,margin,15, addTextOption,...lastParam],[t.sections["6"].sec8.title, margin, yRef.current,margin,10, {...addTextOption,size:13},...lastParam],[t.sections["6"].sec8.para, margin, yRef.current,margin,15, addTextOption,...lastParam],[t.sections["6"].sec9.title, margin, yRef.current,margin,10, {...addTextOption,size:13},...lastParam],[t.sections["6"].sec9.para, margin, yRef.current,margin,15, addTextOption,...lastParam],[t.sections["6"].sec10.title, margin, yRef.current,margin,10, {...addTextOption,size:13},...lastParam],[t.sections["6"].sec10.para, margin, yRef.current,margin,15, addTextOption,...lastParam],[t.sections["6"].sec11.title, margin, yRef.current,margin,10, {...addTextOption,size:13},...lastParam],[t.sections["6"].sec11.para, margin, yRef.current,margin,15, addTextOption,...lastParam],[t.sections["6"].sec12.title, margin, yRef.current,margin,10, {...addTextOption,size:13},...lastParam]]
                },
                37:{
                    id:37,
                    param:[[[{text:t.sections["6"].sec12.para11,size:11,isBold:false,color:rgb(0,0,0)},{text:t.sections["6"].sec12.para12 !== '' ? t.sections["6"].sec12.para12 : '',size:11,isBold:true,color:rgb(0,0,0)}],margin,yRef.current,false,margin,10,fontRegular,fontBold,textHorizontalOption,...lastParam]]
                },
                38:{
                    id:38,
                    param:[[t.sections["6"].sec12.para2 !== '' ? t.sections["6"].sec12.para2 : '', margin, yRef.current,margin,t.sections["6"].sec12.para2 !== '' ? 0 : 0, addTextOption,...lastParam]]
                },
                39:{
                    id:39,
                    param:[[[{text:t.sections["6"].sec12.para31 !== '' && locale !== 'en' ? t.sections["6"].sec12.para31.replace('{lang}',lang) : '',size:11,isBold:false,color:rgb(0,0,0)},{text:t.sections["6"].sec12.para32 !== '' && locale !== 'en' ? t.sections["6"].sec12.para32 : '',size:11,isBold:true,color:rgb(0,0,0)}],margin,yRef.current,false,margin,t.sections["6"].sec12.para31 !== '' && locale !== 'en' ? 15 : 0,fontRegular,fontBold,textHorizontalOption,...lastParam],[[{text:t.sections["6"].sec12.para41 !== '' && locale !== 'en' ? t.sections["6"].sec12.para41 : '',size:11,isBold:false,color:rgb(0,0,0)},{text:t.sections["6"].sec12.para42 !== '' && locale !== 'en' ? t.sections["6"].sec12.para42 : '',size:11,isBold:true,color:rgb(0,0,0)},{text:t.sections["6"].sec12.para43 !== '' && locale !== 'en' ? t.sections["6"].sec12.para43.replace("{lang}",lang) : '',size:11,isBold:false,color:rgb(0,0,0)}],margin,yRef.current,false,margin,t.sections["6"].sec12.para41 !== '' && locale !== 'en' ? 15 : 0,fontRegular,fontBold,textHorizontalOption,...lastParam]]
                },
                40:{
                    id:40,
                    param:[[t.sections["6"].sec13.title, margin, yRef.current,margin,10, {...addTextOption,size:13},...lastParam],[t.sections["6"].sec13.para, margin, yRef.current,margin,15, addTextOption,...lastParam],[t.sections["6"].sec14.title, margin, yRef.current,margin,10, {...addTextOption,size:13},...lastParam],[t.sections["6"].sec14.para, margin, yRef.current,margin,15, addTextOption,...lastParam],[t.sections["6"].sec15.title, margin, yRef.current,margin,10, {...addTextOption,size:13},...lastParam],[t.sections["6"].sec15.para, margin, yRef.current,margin,15, addTextOption,...lastParam],[t.sections["6"].sec16.title, margin, yRef.current,margin,10, {...addTextOption,size:13},...lastParam],[t.sections["6"].sec16.para, margin, yRef.current,margin,40, addTextOption,...lastParam],[t.sections["7"].title, margin, yRef.current,margin,15, {...addTextOption,isBold:true,size:16},...lastParam],[t.sections["7"].para, margin, yRef.current,margin,40, addTextOption,...lastParam],[t.sections["8"].title, margin, yRef.current,margin,15, {...addTextOption,isBold:true,size:16},...lastParam],[t.sections["8"].para, margin, yRef.current,margin,20, addTextOption,...lastParam],[t.sections["8"].paraA, margin, yRef.current,margin,8, addTextOption,...lastParam],[t.sections["8"].paraB, margin, yRef.current,margin,8, addTextOption,...lastParam],[t.sections["8"].paraC, margin, yRef.current,margin,8, addTextOption,...lastParam],[t.sections["8"].paraD, margin, yRef.current,margin,8, addTextOption,...lastParam],[t.sections["8"].paraE.replace("{day}",7), margin, yRef.current,margin,8, addTextOption,...lastParam],[t.sections["8"].paraF, margin, yRef.current,margin,10, addTextOption,...lastParam],[t.sections["8"].paraClose, margin, yRef.current,margin,40, addTextOption,...lastParam],[t.sections["9"].title, margin, yRef.current,margin,15, {...addTextOption,isBold:true,size:16},...lastParam],[t.sections["9"].para, margin, yRef.current,margin,15, addTextOption,...lastParam],[t.sections["9"].paraA, margin, yRef.current,margin,8,
                    {...addTextOption,lineHeight:lineHeight+2,isBold:true},...lastParam],[t.sections["9"].paraB, margin, yRef.current,margin,8, {...addTextOption,isBold:true,lineHeight:lineHeight+2},...lastParam],[t.sections["9"].paraC, margin, yRef.current,margin,40, {...addTextOption,isBold:true,lineHeight:lineHeight+2},...lastParam],[t.sections["10"].title, margin, yRef.current,margin,15, {...addTextOption,isBold:true,size:16},...lastParam]]
                },
                41:{
                    id:41,
                    param:[[[t.sections["10"].sprestataire,t.sections["10"].sclient],[],yRef.current,margin,15,margin,marginTop,marginBottom,lineHeight,11,true,fontRegular,fontBold,...lastParam],[[],[],yRef.current,margin,10,margin,marginTop,marginBottom,lineHeight,10,false,fontRegular,fontBold,...lastParam],[["",t.sections["10"].do.replace("{city}",process.env.NEXT_PUBLIC_MAKE_CONTRACT_CITY as string)+' '+formatDate(new Date())],[],yRef.current,margin,20,margin,marginTop,marginBottom,lineHeight,10,false,fontRegular,fontBold,...lastParam]]
                }
            }
            //console.log("fonctionParam",fonctionParam)
            functionListAndRang.forEach(async(item,i)=>{
                if (item.count) {
                    for (let index = 0; index < item.count; index++) {
                        const params = fonctionParam[item.id].param[index];
                        switch (item.name) {
                            case 'addText':
                                if (isDataStructureSingleText(params)) {
                                    yRef.current = addText(params)
                                }
                                break;
                            case 'addHorizontalText':
                                if (isDataStructureHorizontalText(params)) {
                                    const final = addHorizontalText(params)
                                    yRef.current = final.finalY;
                                }
                                break;
                            case 'signatureBloc':
                                if (isDataStructureSignatureText(params)) {
                                    if (index === 1) {
                                        
                                        params[1] = [{img:await pdfDoc.embedPng(freelanceSignatureLink),width:250,height:80},{img:await pdfDoc.embedPng(clientSignatureLink),width:250,height:80}]
                                           
                                    }
                                    yRef.current = signatureBloc(params);
                                }
                                break;
                            default:
                                break;
                        }
                        
                    }
                }else{
                    switch (item.fonc) {
                        case 'addText':
                            if (item.id === 8) {
                                const params = fonctionParam[item.id].param[0]
                                contract.projectFonctionList.forEach((item,index)=>{
                                    if (isDataStructureSingleText(params)) {
                                        params[0] = `${item.title} - ${item.description} - ${item.price}`
                                        yRef.current = addText(params)
                                        if (index === contract.projectFonctionList.length - 1) {
                                            params[4] = 15
                                        }
                                    }
                                })
                            }
                            break;
                        case 'addHorizontalText':
                            if (item.id === 24) {
                                const params = fonctionParam[item.id].param[0]
                                contract.prestataireGivingData!.paymentSchedule.split(',').forEach((item,index)=>{
                                    if (isDataStructureHorizontalText(params)) {
                                    params[0][1].text = item
                                    params[8].bulletSymbol = `${index + 1} - `
                                        if (index === 0) {
                                            params[0][0].text = t.sections["5"].sec15.item
                                            const final = addHorizontalText(params)
                                            yRef.current = final.finalY;
                                        }else if(index === contract.prestataireGivingData!.paymentSchedule.split(',').length - 1){
                                            params[0][0].text = t.sections["5"].sec15.itemEnd
                                            params[5] = 15
                                            const final = addHorizontalText(params)
                                            yRef.current = final.finalY;
                                        }else{
                                            params[0][0].text = `${t.sections["5"].sec15.item1} ${index + 1} : `
                                            const final = addHorizontalText(params)
                                            yRef.current = final.finalY;
                                        }
                                    }
                                })
                            }
                            break;
                        default:
                            break;
                    }
                }
            })

            // Génération du PDF final
            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            return {blob:blob,taxValue:0};
            //return await pdfDoc.save();
        } catch (error) {
            console.error('Erreur lors de la génération du PDF:', error);
            return null;
        }
    }
    
    // Fonction utilitaire pour ajouter du texte multiligne
    const addText = ([text,x,y,rightMargin,marginAfter,options,pdfDoc,pageRef,yRef,color]: [text: string,x: number,y: number,rightMargin: number,marginAfter: number,
        options: {
            size?: number;
            isBold?: boolean;
            font: PDFFont;
            fontBold: PDFFont;
            lineHeight: number;
            isListItem?: boolean;
            bulletSymbol?: string;
            maxWidth?: number;
            topMargin?: number;
            bottomMarginThreshold?: number;
        },
        pdfDoc: PDFDocument,
        pageRef: { current: PDFPage },
        yRef: { current: number },color?:RGB
        ]) => {
        const {
            size = 11,
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
        console.log("color",color)
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
                        color: color ? color : rgb(0, 0, 0),
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
                    color: color ? color : rgb(0, 0, 0),
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
             if (i > 0) {
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
            processLine(paragraph, true);
        });
        yRef.current = currentY - marginAfter;
        return yRef.current;
    };

    const signatureBloc = ([items,imgBloc,initialY,marginLeft,marginRight,marginAfter,topMargin,bottomMargin,lineHeight,size,isBold,font,fontBold,pdfDoc,pageRef,yRef]: [items: string[],imgBloc: {img:PDFImage,width:number,height:number}[],initialY: number,marginLeft: number,marginRight: number,marginAfter: number,topMargin: number,bottomMargin: number,lineHeight: number,size: number,isBold: boolean,font: PDFFont,fontBold: PDFFont,pdfDoc: PDFDocument,pageRef: { current: PDFPage },yRef: { current: number }]) => {
        const pageWidth = pageRef.current.getWidth();
        let pageHeight = pageRef.current.getHeight();
        const availableWidth = pageWidth - marginLeft - marginRight;
        const currentFont = isBold ? fontBold : font;
        let canAddPageNumber:boolean = false;
        // Utiliser la position Y actuelle ou la position initiale si non définie
        let currentY = yRef.current !== undefined ? yRef.current : initialY;
        const height = pageRef.current.getSize().height
        const drawImgItem = (signatureImage: PDFImage, x: number, y: number, width: number, height: number) => {
            pageRef.current.drawImage(signatureImage, { x: x, y: y, width: width, height: height });
            if (canAddPageNumber) {
                getPdfXCenter(50,50,pdfDoc,10,font,pageRef.current)
                canAddPageNumber = false;
            }
        };
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
        
        if (items.length > 0) {
            // Dessiner le premier item (aligné à gauche)
            drawItem(items[0], marginLeft, currentY, itemWidth);
        
            // Dessiner le deuxième item (juste après le premier)
            drawItem(items[1], marginLeft + itemWidth, currentY, itemWidth);
        }

        if (imgBloc.length > 0) {
            drawImgItem(imgBloc[0].img,marginLeft - 80,currentY - 25,imgBloc[0].width,imgBloc[0].height)
            drawImgItem(imgBloc[1].img,marginLeft + itemWidth - 80 ,currentY - 25,imgBloc[1].width,imgBloc[1].height)
        }
    
        // Mettre à jour la position Y pour les prochains dessins
        currentY -= lineHeight;
        yRef.current = currentY - marginAfter;
        return yRef.current
    };

    const addHorizontalText = ([textEntries,startX,startY,isListItem,rightMargin,marginAfter,font,fontBold,context,pdfDoc,pageRef,yRef]: [
        textEntries: {
            text: string;
            size?: number;
            isBold?: boolean;
            color?: RGB;
        }[],startX: number,startY: number,isListItem: boolean,rightMargin: number,marginAfter: number,font: PDFFont,fontBold: PDFFont,
        context: {
            horizontalSpacing?: number;
            maxWidth?: number;
            bulletSymbol?: string;
            lineHeight: number;
            topMargin: number;
            bottomMargin: number;
        },pdfDoc: PDFDocument,pageRef: { current: PDFPage },yRef: { current: number }]) => {
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
    useEffect(()=>{
        const generedPdf = async()=>{
            if(!service || !client) return
            const allRequest = [
                generedNotEnContractVersion(contract.contractLanguage),
                generePaiementDoc(contract)
            ]
            let notEnContract = null;
            if (locale !== 'en') {
                notEnContract = await generedEnContractVersion()
            }
            
            const [blobContract,payment] = await Promise.all(allRequest)
            
            if (blobContract && payment) {
                const contractLink = URL.createObjectURL(blobContract.blob)
                const paymentLink = URL.createObjectURL(payment.blob)
                const notEnContractLink = notEnContract ? URL.createObjectURL(notEnContract.blob) : ''
                /*window.open(contractLink, '_blank')
                if (notEnContractLink) {
                    window.open(notEnContractLink, '_blank')
                }
                window.open(paymentLink, '_blank')*/
                const contractBase64 = await blobToBase64(blobContract.blob) as string;
                const base64NotEnContract = notEnContract ? await blobToBase64(notEnContract.blob) as string : null;
                const paymentBase64 = await blobToBase64(payment.blob) as string;
                const contractItem = enableCountryforLostRetraction.includes(contract.clientGivingData?.adresse.country.isoCode ?? '') ? {...contract,tax:payment.taxValue,saleTermeConditionValided:true,electronicContractSignatureAccepted:true,rigthRetractionLostAfterServiceBegin:true} : {
                    ...contract,tax:payment.taxValue,saleTermeConditionValided:true,electronicContractSignatureAccepted:true
                }
                //console.log("contratc item",contractItem)
                const parsedService = {...service,contractStatus:"signed",contract:contractItem}
                const contractData = {service:parsedService,translatedOrOriginalBlobPdf:blobContract.blob,originalByDiffNotEnLangBlobPdf:notEnContract?.blob ?? null}
                const locale = client.clientLang;
                const updateClient = {...client,modifDate:new Date().toLocaleDateString(`${locale === 'fr' ? 'fr-FR' : locale === 'de' ? 'de-DE' : 'en-US'}`)}
                const result = await saveContractDoc(contractData,updateClient,clientServiceId,locale)
                const email = {
                    to:contract.clientGivingData!.clientEmail,
                    name:contract.clientGivingData!.name,
                    subject:`${locale === 'fr' ? 'Contrat de prestation de services ou de maintenance' : locale === 'de' ? "Dienstleistungs- oder Wartungsvertrag" : 'Service or Maintenance Agreement'}`,
                    base64Contrat:contractBase64,
                    base64Payement:paymentBase64,
                    base64NotEnContract:base64NotEnContract
                }
                if (result === 'success') {
                    sessionStorage.clear()
                    await sendContract(email,locale);
                    const emitData:{translatedOrOriginalContractLink:string,
                        paymentLink:string,notEnContractLink:string,status:"success" | "error"} = {
                        translatedOrOriginalContractLink:contractLink ?? 'test',
                        paymentLink:paymentLink ?? 'test',
                        notEnContractLink:notEnContractLink ?? 'test',
                        status:"success"
                    }
                    onEmit(emitData)
                } else {
                    const emitData:{translatedOrOriginalContractLink:string,
                        paymentLink:string,notEnContractLink:string,status:"success" | "error"} = {
                        translatedOrOriginalContractLink:'',
                        paymentLink:'',
                        notEnContractLink:'',
                        status:"error"
                    }
                    onEmit(emitData)
                }
            }
        }
        generedPdf() 
    },[contract,client,clientSignatureLink,freelanceSignatureLink,locale])
      
    return null
};

export default GeneratePdfContract;
