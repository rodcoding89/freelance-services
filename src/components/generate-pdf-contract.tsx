"use client"
import { useTranslationContext } from '@/hooks/app-hook';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { PDFDocument, PDFFont, PDFImage, PDFPage, RGB, rgb, StandardFonts } from "pdf-lib";
import { sendContract } from '@/server/services-mail';
import { saveContractDoc } from '@/server/services-save-doc';
import { useParams, useSearchParams } from 'next/navigation';
import { loadTranslation, parseDate, parseInputDate } from '@/utils/fonction';
import SalesTax from 'sales-tax';
import { Client, clientAddress, Contract, contractFormClient, contractFormPrestataire, features, Services } from '@/interfaces';
import { AppContext } from '@/app/context/app-context';


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

interface GeneredContractProps {
  contract:Contract|null
  clientSignatureLink:string|null;
  freelanceSignatureLink:string|null;
  locale:string;
  service:Services|null;
  clientId:number,
  serviceId:number
  onEmit:(data:{translatedOrOriginalContractLink:string,notFrContractLink:string,paymentLink:string,status:"success"|"error"})=>void;
}

const enableCountryforLostRetraction = ['GB','CH','FR','IT','ES','NL','DE','AT','BE','ZA','AU','CA']

const GeneratePdfContract:React.FC<GeneredContractProps> = ({contract,clientId,serviceId,freelanceSignatureLink,clientSignatureLink,locale,onEmit,service}) => {
    if (contract === null || clientSignatureLink === null || freelanceSignatureLink === null || service === null) return
    console.log("contract passé",contract)
    SalesTax.setTaxOriginCountry('US');
    const t:any = useTranslationContext();
    const {setContextData} = useContext(AppContext)
    const [currency,setCurrency] = useState<string>(contract.clientGivingData?.addressClient?.clientCountry?.currency ?? "USD")
    
    const lang = `${locale === 'fr' ? 'French' : 'English'}`
    
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

    const parseProjectFonctionList = (features:features[]|string)=>{
        if (typeof(features) === "string") {
            return JSON.parse(features)
        }
        return features
    }

    const calculPrice = (totalPrice:number,rate:number)=>{
        return (totalPrice * rate / 100).toFixed(2)
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
            const echelonement = contract.prestataireGivingData!.paymentSchedule.split(";");
            let pageEchelonement;
            const bayingSchedule = [beforeStart];
            const priceSchedule:string[] = [];
            const currency = contract.clientGivingData?.addressClient?.clientCountry?.currency ?? "USD";
            
            const {taxPrice,totalePrice,taxValue,subTotalPrice} = {taxPrice:contract.prestataireGivingData?.taxPrice ?? 0,totalePrice:contract.prestataireGivingData?.totalPrice ?? 0,taxValue:contract.prestataireGivingData?.taxPercent ?? 0,subTotalPrice:contract.prestataireGivingData?.subTotalPrice ?? 0};
            
            if (echelonement.length === 0) {
                pageEchelonement = t.payment.singleEchelon;
                const final = addHorizontalText([[{text:pageEchelonement,size:11,isBold:false},{text:totalePrice.toString() + " "+currency,size:14,isBold:true},{text:currency,size:11,isBold:false},{text:t.payment.ttc,size:9,isBold:true}],margin,yRef.current,false,margin,30,fontRegular,fontBold,textHorizontalOption,...lastParam])
                yRef.current = final.finalY
            } else {
                pageEchelonement = t.payment.multipleEchelon;
                yRef.current = addText([pageEchelonement,margin,margin,margin,20,{...addTextOption,size:11,isBold:false},...lastParam])
                echelonement.forEach((item,index)=>{
                    const nitem = item.split('%');
                    const rate = parseInt(nitem[0])
                    const nprice = calculPrice(typeof(totalePrice) === "number" ? totalePrice : parseFloat(totalePrice) ,rate);
                    priceSchedule.push(nprice)
                    if (index === echelonement.length - 1) {
                        bayingSchedule.push(afterDelively);
                    }else if(index !== 0){
                        bayingSchedule.push(intermediare.replace("{nr}",String(index+1)))
                    }
                    if (index === 0) {
                        const final = addHorizontalText([[{text:bayingSchedule[index],size:11,isBold:false},{text:priceSchedule[index].toString(),size:14,isBold:true},{text:currency,size:11,isBold:false},{text:t.payment.ttc,size:9,isBold:true},{text:`${t.payment.bySigning}`,size:11,isBold:false}],margin,yRef.current,true,margin,index === echelonement.length - 1 ? 30 : 10,fontRegular,fontBold,{...textHorizontalOption,bulletSymbol:`${index+1}`},...lastParam])
                        yRef.current = final.finalY
                    }else{
                        const final = addHorizontalText([[{text:bayingSchedule[index],size:11,isBold:false},{text:priceSchedule[index].toString(),size:14,isBold:true},{text:currency,size:11,isBold:false},{text:t.payment.ttc,size:9,isBold:true}],margin,yRef.current,true,margin,index === echelonement.length - 1 ? 30 : 10,fontRegular,fontBold,{...textHorizontalOption,bulletSymbol:`${index+1}`},...lastParam])
                        yRef.current = final.finalY
                    }
                })
            }

            const totalPriceText = t.payment.totalPrice;

            const final = addHorizontalText([[{text:totalPriceText,size:16,isBold:true},{text:totalePrice.toString() + " "+currency,size:14,isBold:true},{text:currency ?? "USD",size:11,isBold:false},{text:t.payment.ttc,size:9,isBold:true}],margin,yRef.current,true,margin,30,fontRegular,fontBold,{...textHorizontalOption},...lastParam])
            yRef.current = final.finalY
            
            const pagePara3 = t.payment.pagePara3
            //console.log("bayingSchedule",bayingSchedule,"priceSchedule",priceSchedule)
            yRef.current = addText([pagePara3,margin,margin,margin,20,{...addTextOption,size:11,isBold:false},...lastParam]);
            const payingHolder = process.env.NEXT_PUBLIC_COMPANY_AUTHOR ?? '';
            const final1 = addHorizontalText([[{text:t.payment.holder+" :",size:13,isBold:false},{text:payingHolder,size:16,isBold:true}],margin,yRef.current,true,margin,30,fontRegular,fontBold,{...textHorizontalOption},...lastParam])
            yRef.current = final1.finalY
            const payingIban = process.env.NEXT_PUBLIC_PAYMENT_IBAN ?? '';
            const final2 = addHorizontalText([[{text:t.payment.iban+" :",size:13,isBold:false},{text:payingIban,size:16,isBold:true}],margin,yRef.current,true,margin,30,fontRegular,fontBold,{...textHorizontalOption},...lastParam])
            yRef.current = final2.finalY
            const payingBic = process.env.NEXT_PUBLIC_PAYMENT_BIC ?? '';
            const final3 = addHorizontalText([[{text:t.payment.bic+" :",size:13,isBold:false},{text:payingBic,size:16,isBold:true}],margin,yRef.current,true,margin,30,fontRegular,fontBold,{...textHorizontalOption},...lastParam])
            yRef.current = final3.finalY
            yRef.current = addText([payingBic,margin,margin,margin,20,{...addTextOption,size:11,isBold:false},...lastParam,rgb(0, 0, 0.55)])
            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
            return {blob:blob,taxValue:taxValue,taxPrice:taxPrice,totalPrice:totalePrice,subTotalPrice:subTotalPrice};
        } catch (error) {
            console.error(error)
            return null;
        }
    }

    const featurePrise = (price:string|number,quantity:string|number)=>{
        const parseedPrice = typeof(price) === "string" ? parseFloat(price) : price
        const parsedQuantity = typeof(quantity) === "string" ? parseInt(quantity) : quantity
        return parseedPrice*parsedQuantity
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

    const returnAddressClient = (data:clientAddress|string|undefined)=>{
        if(typeof(data) === "undefined"){
            return data;
        }else if(typeof(data) === "string"){
            return JSON.parse(data)
        }
        return data
    }

    const generedFrContractVersion = async()=>{
        try {
            const translation = await loadTranslation("fr");
            const data = await handlePdf(translation)
            //console.log("translation",translation)
            return data;
        } catch (error) {
            console.error(error)
            return null;
        }
        
    }
    const generedNotFrContractVersion = async(clientLang:"fr"|"de"|"en")=>{
        try {
            const translation = await loadTranslation(clientLang);
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
            title: service.serviceType === 'service' ? t.header.titleService + contract.prestataireGivingData!.projectTitle : service.serviceType === 'maintenance' ? t.header.titleMaintenance + contract.prestataireGivingData!.projectTitle : t.header.titleServiceMaintenance + contract.prestataireGivingData!.projectTitle,
            sousTitle: t.header.subTitle,
            clientName: `${contract.clientGivingData?.fname +' '+ contract.clientGivingData?.lname}`,
            freelanceName: `${contract.prestataireGivingData!.freelancerName}`,
            preambleaddressClient:`${t.header.home} ${contract.clientGivingData?.addressClient?.street} ${contract.clientGivingData?.addressClient?.postalCode} ${contract.clientGivingData?.addressClient?.city} ${contract.clientGivingData?.addressClient?.clientCountry?.name} ${t.header.designation}`,
            from:t.header.from,
            preambleAdresseFreelance:`${t.header.home} ${contract.prestataireGivingData!.freelancerAddress} ${t.header.designation}`,
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
                    param:[[[{text:content.clientName,size:11,isBold:true,color:rgb(0, 0, 0)},{text:content.preambleaddressClient,size:11,isBold:false,color:rgb(0, 0, 0)},{text:content.from,size:11,isBold:true,color:rgb(0, 0, 0)}],margin+30,yRef.current,true,margin,10,fontRegular,fontBold,textHorizontalOption,...lastParam]]
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
                    param:[[t.sections["3"].sec3.title, margin, yRef.current,margin,10, {...addTextOption,size:13},...lastParam],[service.serviceType === 'service' ? t.sections["3"].sec3.paraService.replace("{startDate}",parseDate(contract.prestataireGivingData?.startDate ?? new Date(),locale)).replace("{endDate}",parseDate(contract.prestataireGivingData?.endDate ?? new Date(),locale)) : service.serviceType === 'maintenance' ? t.sections["3"].sec3.paraMaintenance : t.sections["3"].sec3.paraServiceMaintenance.replace("{endDate}",parseDate(contract.prestataireGivingData?.endDate ?? new Date(),locale)), margin, yRef.current,margin,15, addTextOption,...lastParam],[service.serviceType === 'service' ? t.sections["3"].sec4.titleService : service.serviceType === 'maintenance' ? t.sections["3"].sec4.titleMaintenance : t.sections["3"].sec4.titleServiceMaintenance, margin, yRef.current,margin,10, {...addTextOption,size:13},...lastParam],[service.serviceType === 'service' ? t.sections["3"].sec4.paraService.replace("{price}",contract.prestataireGivingData?.totalPrice) + " "+currency : service.serviceType === 'maintenance' ? service.maintenanceType === 'perHour' ? t.sections["3"].sec4.paraMaintenance.perHour.replace("{mprice}",process.env.NEXT_PUBLIC_MAINTENACE_COST_PER_HOUR + " "+currency) : t.sections["3"].sec4.paraMaintenance.perYear.replace("{mprice}",process.env.NEXT_PUBLIC_MAINTENACE_COST_PER_YEAR + " "+currency) : `${t.sections["3"].sec4.paraServiceMaintenance.para.replace("{price}",contract.prestataireGivingData!.totalPrice + " "+currency)} ${
                    service.maintenanceType === 'perHour' ? t.sections["3"].sec4.paraServiceMaintenance.perHour.replace("{mprice}",process.env.NEXT_PUBLIC_MAINTENACE_COST_PER_HOUR + " "+currency) : t.sections["3"].sec4.paraServiceMaintenance.perYear.replace("{mprice}",process.env.NEXT_PUBLIC_MAINTENACE_COST_PER_YEAR + " "+currency)} ${t.sections["3"].sec4.paraServiceMaintenance.para1}`
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
                    param:[[t.sections["6"].sec13.title, margin, yRef.current,margin,10, {...addTextOption,size:13},...lastParam],[t.sections["6"].sec13.para, margin, yRef.current,margin,15, addTextOption,...lastParam],[t.sections["6"].sec14.title, margin, yRef.current,margin,10, {...addTextOption,size:13},...lastParam],[t.sections["6"].sec14.para, margin, yRef.current,margin,15, addTextOption,...lastParam],[t.sections["6"].sec15.title, margin, yRef.current,margin,10, {...addTextOption,size:13},...lastParam],[t.sections["6"].sec15.para, margin, yRef.current,margin,15, addTextOption,...lastParam],[t.sections["6"].sec16.title, margin, yRef.current,margin,10, {...addTextOption,size:13},...lastParam],[t.sections["6"].sec16.para, margin, yRef.current,margin,40, addTextOption,...lastParam],[t.sections["7"].title, margin, yRef.current,margin,15, {...addTextOption,isBold:true,size:16},...lastParam],[t.sections["7"].para, margin, yRef.current,margin,40, addTextOption,...lastParam],[t.sections["8"].title, margin, yRef.current,margin,15, {...addTextOption,isBold:true,size:16},...lastParam],[t.sections["8"].para, margin, yRef.current,margin,20, addTextOption,...lastParam],[t.sections["8"].paraA, margin, yRef.current,margin,8, addTextOption,...lastParam],[t.sections["8"].paraB, margin, yRef.current,margin,8, addTextOption,...lastParam],[t.sections["8"].paraC, margin, yRef.current,margin,8, addTextOption,...lastParam],[t.sections["8"].paraD.replace("{day}",7), margin, yRef.current,margin,8, addTextOption,...lastParam],[t.sections["8"].paraE, margin, yRef.current,margin,8, addTextOption,...lastParam],[t.sections["8"].paraClose, margin, yRef.current,margin,40, addTextOption,...lastParam],[t.sections["9"].title, margin, yRef.current,margin,15, {...addTextOption,isBold:true,size:16},...lastParam],[t.sections["9"].para, margin, yRef.current,margin,15, addTextOption,...lastParam],[t.sections["9"].paraA, margin, yRef.current,margin,8,
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
                                        
                                        params[1] = [{img:await pdfDoc.embedPng(freelanceSignatureLink),width:90,height:80},{img:await pdfDoc.embedPng(clientSignatureLink),width:250,height:80}]
                                           
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
                                parseProjectFonctionList(contract.prestataireGivingData?.projectFonctionList ?? []).forEach((item:features,index:number)=>{
                                    if (isDataStructureSingleText(params)) {
                                        params[0] = `${item.title} - ${item.description} - ${featurePrise(item.price,item.quantity)} ${currency}`
                                        yRef.current = addText(params)
                                        if (index === parseProjectFonctionList(contract.prestataireGivingData?.projectFonctionList ?? []).length - 1) {
                                            params[4] = 15
                                        }
                                    }
                                })
                            }
                            break;
                        case 'addHorizontalText':
                            if (item.id === 24) {
                                const params = fonctionParam[item.id].param[0]
                                contract.prestataireGivingData!.paymentSchedule.split(';').forEach((item,index)=>{
                                    if (isDataStructureHorizontalText(params)) {
                                    params[0][1].text = item
                                    params[8].bulletSymbol = `${index + 1} - `
                                        if (index === 0) {
                                            params[0][0].text = t.sections["5"].sec15.item
                                            const final = addHorizontalText(params)
                                            yRef.current = final.finalY;
                                        }else if(index === contract.prestataireGivingData!.paymentSchedule.split(';').length - 1){
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
            const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
            return {blob:blob,taxValue:0,taxPrice:0,totalPrice:0,subTotalPrice:0};
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
            drawImgItem(imgBloc[0].img,marginLeft,currentY - 25,imgBloc[0].width,imgBloc[0].height)
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
                const testWidth = currentFont.widthOfTextAtSize(testLine.replace(/\n/g,' '), size);
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
            
            if(!service || !contract) return

            if(!clientId || !serviceId) return
            
            const allRequest = [
                generedFrContractVersion(),
                generePaiementDoc(contract)
            ]

            let notFrContract = null;
            
            if (contract.clientGivingData?.clientLang !== 'fr') {
                notFrContract = await generedNotFrContractVersion(contract.clientGivingData?.clientLang ?? "en")
            }
            
            const [blobContract,payment] = await Promise.all(allRequest)
            
            if (blobContract && payment) {
                console.log("payment",payment)
                const contractLink = URL.createObjectURL(blobContract.blob)
                const paymentLink = URL.createObjectURL(payment.blob)
                const notFrContractLink = notFrContract ? URL.createObjectURL(notFrContract.blob) : ''
                
                /*window.open(contractLink, '_blank')

                if (notFrContractLink) {
                    window.open(notFrContractLink, '_blank')
                }

                window.open(paymentLink, '_blank')*/
                //console.log("paymentLink",paymentLink)
                const contractBase64 = await blobToBase64(blobContract.blob) as string;
                const base64NotFrContract = notFrContract ? await blobToBase64(notFrContract.blob) as string : null;
                const paymentBase64 = await blobToBase64(payment.blob) as string;

                const filenameTranslatedOrOriginal = `${contract.clientGivingData?.clientLang !== 'fr' ? 'translated-' : 'original-'}signed-contract_${new Date().getFullYear()}-${new Date().getMonth() + 1}-${new Date().getDate()}-${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()}_${((contract.clientGivingData?.fname ?? "")+(contract.clientGivingData?.lname ?? "")).replaceAll(" ","-")}`;
                const filenameContract = `original-signed-contract_${new Date().getFullYear()}-${new Date().getMonth() + 1}-${new Date().getDate()}-${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()}_${((contract.clientGivingData?.fname ?? "")+(contract.clientGivingData?.lname ?? "")).replaceAll(" ","-")}`;
                
                const prestataireGivingData:contractFormPrestataire = {subTotalPrice:typeof(payment.subTotalPrice) === "string" ? parseFloat(payment.subTotalPrice) : 0 ,taxPercent:payment.taxValue,totalPrice:typeof(payment.totalPrice) === "string" ? parseFloat(payment.totalPrice) : payment.totalPrice,taxPrice:typeof(payment.taxPrice) === "string" ? parseFloat(payment.taxPrice) : payment.taxPrice,maintenanceCategory:contract?.prestataireGivingData?.maintenanceCategory,paymentSchedule:contract?.prestataireGivingData?.paymentSchedule ?? "",startDate:contract?.prestataireGivingData?.startDate ?? new Date().getTime(),endDate:contract.prestataireGivingData?.endDate ?? new Date().getTime(),projectTitle:contract.prestataireGivingData?.projectTitle ?? "",
                    contractStatus:"signed",projectDescription:contract.prestataireGivingData?.projectDescription ?? "",freelancerTaxId:contract.prestataireGivingData?.freelancerTaxId ?? "",freelancerName:contract.prestataireGivingData?.freelancerName ?? "",freelancerAddress:contract.prestataireGivingData?.freelancerAddress ?? "",
                    projectFonctionList:parseProjectFonctionList(contract.prestataireGivingData?.projectFonctionList ?? [])}

                const clientGivingData:contractFormClient = {clientUid:contract.clientGivingData?.clientUid ?? "",saveDate:contract.clientGivingData?.saveDate ?? new Date().getTime(),clientNumber:contract.clientGivingData?.clientNumber ?? 100,clientLang:contract.clientGivingData?.clientLang ?? "en",clientStatus:contract.clientGivingData?.clientStatus ?? "actived",modifDate: contract.clientGivingData && contract.clientGivingData.modifDate ? new Date(contract.clientGivingData?.modifDate).getTime() : new Date().getTime(),email:contract.clientGivingData?.email,address:contract.clientGivingData?.address,addressClient:returnAddressClient(contract.clientGivingData?.addressClient),fname:contract.clientGivingData?.fname ?? "",lname:contract.clientGivingData?.lname ?? "",taxId:contract.clientGivingData?.taxId ?? '',phone:contract.clientGivingData?.phone,clientType:contract.clientGivingData?.clientType ?? "particular"}
                
                const contractItem:Contract = enableCountryforLostRetraction.includes(contract.clientGivingData?.addressClient?.clientCountry?.isoCode ?? '') ? {clientGivingData:clientGivingData,prestataireGivingData:prestataireGivingData,saleTermeConditionValided:true,electronicContractSignatureAccepted:true,rigthRetractionLostAfterServiceBegin:true,contractId:contract.contractId,maintenancePrice:contract.maintenancePrice,contractStatus:contract.contractStatus} : {
                    clientGivingData:clientGivingData,prestataireGivingData:prestataireGivingData,saleTermeConditionValided:true,electronicContractSignatureAccepted:true,contractId:contract.contractId,maintenancePrice:contract.maintenancePrice,contractStatus:contract.contractStatus
                }

                //console.log("contractItem",contractItem)

                const sendData:{serviceId:number,addressId:number,clientId:number,contractStatus:"pending"|"unsigned"|"signed",contract:Contract} = {serviceId:serviceId,addressId:contract.clientGivingData?.address ?? 0,clientId:clientId,contractStatus:"signed",contract:contractItem}
                const contractData = {data:sendData,payment:{file:paymentBase64,name:'payment.pdf'},translatedOrOriginalFilePdf:{file:base64NotFrContract,name:filenameTranslatedOrOriginal},originalByDiffNotFrLangFilePdf:{file:contractBase64,name:filenameContract}}
                const locale = contract.clientGivingData?.clientLang ?? 'fr';
                
                const result = await saveContractDoc(contractData,locale,blobContract.blob.type || "application/pdf")
                //console.log("result",result)
                const email = {
                    to:contract.clientGivingData?.email ?? "",
                    name:contract.clientGivingData?.fname +" "+contract.clientGivingData?.lname,
                    subject:`${locale === 'fr' ? 'Contrat de prestation de services ou de maintenance' : 'Service or Maintenance Agreement'}`,
                    base64Contrat:contractBase64,
                    base64Payement:paymentBase64,
                    base64NotFrContract:base64NotFrContract
                }

                if (result) {
                    try {
                        await sendContract(email,locale);
                        const emitData:{translatedOrOriginalContractLink:string,
                            paymentLink:string,notFrContractLink:string,status:"success" | "error"} = {
                            translatedOrOriginalContractLink:contractLink ?? 'test',
                            paymentLink:paymentLink ?? 'test',
                            notFrContractLink:notFrContractLink ?? 'test',
                            status:"success"
                        }
                        onEmit(emitData)
                        sessionStorage.clear()
                    } catch (error) {
                        console.log("Erreur",error)
                        setContextData({toast:{toastVariant:"error",toastMessage: contract?.clientGivingData?.clientLang ?? locale ? "Une erreur s’est produite lors de l’opération. Veuillez nous contacter via le formulaire de contact ou patienter quelques instants avant de réessayer." : "An error occurred during the operation. Please contact us via the contact form or wait a few moments before trying again.",showToast:true,time:new Date().getTime()}})
                    }
                } else {
                    const emitData:{translatedOrOriginalContractLink:string,
                        paymentLink:string,notFrContractLink:string,status:"success" | "error"} = {
                        translatedOrOriginalContractLink:'',
                        paymentLink:'',
                        notFrContractLink:'',
                        status:"error"
                    }
                    onEmit(emitData)
                }
            }
        }
        generedPdf() 
    },[contract,clientId,clientSignatureLink,freelanceSignatureLink,locale])
      
    return null
};

export default GeneratePdfContract;
