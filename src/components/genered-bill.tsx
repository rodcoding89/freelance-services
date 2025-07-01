"use client"
import React, { useEffect, useRef, useState } from 'react';
import { getDoc, doc, updateDoc } from 'firebase/firestore';
import firebase from '@/utils/firebase';
import { useParams, useRouter } from 'next/navigation';
import { CMYK, cmyk, PDFDocument, PDFFont, PDFImage, PDFPage, RGB, rgb, StandardFonts } from 'pdf-lib';
import { useTranslationContext } from '@/hooks/app-hook';
import { saveClientInvoice } from '@/server/services-save-doc';
import { sendInvoice } from '@/server/services-mail';
import Icon from './Icon';
import { getCookie } from '@/server/services';

interface clientInfo {
  id: string;
  name:string;
  taxId?:string;
  email?:string;
  modifDate?:string
  dateCreation?: string;
  clientNumber:number;
  invoiceCount?:number;
}

interface Services {
  serviceId:string;
  clientId:string;
  name:string;
  serviceType: "service"|"maintenance"|"service_and_maintenance";
  contractStatus: 'signed' | 'unsigned' | 'pending';
  invoice?:FormValues;
  contract?:Contract;
}

interface invoiceInfo {
  adresse:string;
  name:string;
  email:string;
  number: string;
  date: string;
  dueDate: string;
}

interface features {
  id: number;
  description: string;
  quantity: number;
  price: number;
};

type FormValues = {
  invoiceInfo: invoiceInfo;
  features: features[];
  taxEnabled: boolean;
  taxRate: number;
  discount: number;
  invoiceDescription:string;
  locale:string
};
interface InvoiceFormProps {
  locale:string;
  clientId:string;
  clientServiceId:string
}
type drawImage = [
  x:number,
  y:number,
  width:number,
  height:number,
  page:PDFPage,
  logoImage:any,
  afterMargin:number,
  ref:{current:number}
]
type drawRectangle = [
  x:number,
  y:number,
  width:number,
  height:number,
  color:RGB|CMYK,
  page:PDFPage,
  afterMargin:number,
  ref:{current:number}
]

type drawLine = [
  start:{x:number,y:any},
  end:{x:number,y:any},
  thickness:number,
  color:RGB|CMYK,
  page:PDFPage,
  afterMargin:number,
  ref:{current:number}
]

type drawText = [
  x:number,
  y:number,
  size:number,
  font:PDFFont,
  text:string,
  page:PDFPage,
  color:RGB|CMYK,
  afterMargin:number,
  ref:{current:number},
  maxWidth?:number,
  lineHeight?:number,
  width?:number,
  margin?:number,
]

type pdfContent = {
  [key: number]: {
    isConditional:boolean,
    params: drawText[] | drawImage[] | drawRectangle[] | drawLine[];
  };
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

const enableCountryForThresholdBeforTax = ["CA","US","CH","AU","ZA"]

const InvoiceForm:React.FC<InvoiceFormProps> = ({locale,clientId,clientServiceId}) =>{
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const t:any = useTranslationContext();
  const [contractLanguage, setContractLanguage] = useState<string>(locale)
  const [clientInfo, setClientInfo] = useState<clientInfo | null>(null);
  const [service, setService] = useState<Services|null>(null)
  const [invoiceInfo, setInvoiceInfo] = useState<invoiceInfo>({
    number: '',
    adresse: '',
    name: '',
    email: '',
    date: new Date().toISOString().split('T')[0],
    dueDate: '',
  });

  const [features, setFeatures] = useState<features[]>([]);

  const [taxEnabled, setTaxEnabled] = useState(true);
  const [taxRate, setTaxRate] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [invoiceDescription, setInvoiceDescription] = useState('');

  const addFeature = () => {
    setFeatures([
      ...features,
      {
        id: Date.now(),
        description: '',
        quantity: 1,
        price: 0,
      },
    ]);
  };

  const removeFeature = (id: number) => {
    setFeatures(features.filter((feature) => feature.id !== id));
  };

  const updateFeature = (id: number, field: string, value: string | number) => {
    setFeatures(
      features.map((feature) =>
        feature.id === id ? { ...feature, [field]: value } : feature
      )
    );
  };

  const calculateSubtotal = () => {
    return features.reduce(
      (sum, feature) => sum + feature.quantity * feature.price,
      0
    );
  };

  const calculateTax = () => {
    if (!taxEnabled) return 0;
    return calculateSubtotal() * (taxRate / 100);
  };

  const calculateDiscountAmount = () => {
    if (discount > 0) return 0;
    return (calculateSubtotal() + calculateTax()) * (discount / 100);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const tax = calculateTax();
    const discountAmount = subtotal * (discount / 100);
    return subtotal + tax - discountAmount;
  };

  const calculateAccurateTextWidth = (
    text: string,
    font: PDFFont,
    fontSize: number,
    options?: {
      letterSpacing?: number; // Espacement supplémentaire entre lettres
      padding?: number;       // Marge interne
    }
  ): number =>{
    // 1. Calcul de base (sans kerning)
    let width = font.widthOfTextAtSize(text, fontSize);
    
    // 2. Correction empirique pour le kerning (varie selon la police)
    const kerningAdjustment = text.length * fontSize * 0.025; // Ajustement typique
    
    // 3. Ajout des options
    const letterSpacing = options?.letterSpacing || 0;
    const spacingAdjustment = letterSpacing * Math.max(0, text.length - 1);
    
    // 4. Retourne la largeur totale
    return width + kerningAdjustment + spacingAdjustment;
  }
 
  const isDataAddText = (
    item: drawText | drawLine | drawRectangle | drawImage): item is drawText => {
        return Array.isArray(item) && item.length === 9 || item.length === 13;
  };

  const isDataAddImage = (
    item: drawText | drawLine | drawRectangle | drawImage): item is drawImage => {
    return Array.isArray(item) && item.length === 8;
  };

  const isDataAddRectangle = (
    item: drawText | drawLine | drawRectangle | drawImage): item is drawRectangle => {
    return Array.isArray(item) && item.length === 8;
  };

  const isDataAddLine = (
    item: drawText | drawLine | drawRectangle | drawImage): item is drawLine => {
    return Array.isArray(item) && item.length === 7;
  };

  const addNewText = ([x,y,size,font,text,page,color,afterMargin,ref,maxWidth,lineHeight,width,margin]:drawText)=>{
    const currentY = ref.current;
    if (maxWidth && width && margin) {
      page.drawText(text, {
        x: x,
        y: currentY - y,
        size: size,
        font: font,
        color: color,
        maxWidth: width - margin * 2,
        lineHeight: lineHeight ?? 12
      });
    } else {
      page.drawText(text, {
        x: x,
        y: currentY - y,
        size: size,
        font: font,
        color: color
      });
    }
    ref.current = currentY - afterMargin
    console.log("currentY",currentY,"aftermargin",afterMargin,"diff",ref.current,text)
    return ref.current
  }

  const addLine = ([start,end,thickness,color,page,afterMargin,ref]:drawLine)=>{
    const currentY = ref.current - start.y
    const currentStart = {...start,y:currentY};
    const currentEnd = {...end,y:currentY}
    page.drawLine({
      start: currentStart,
      end: currentEnd,
      thickness: thickness,
      color: color,
    });
    ref.current = currentY - afterMargin
    console.log("drawline","aftermargin",afterMargin,"currentY",currentY,"diff",ref.current)
    return ref.current
  }

  const addRectangle = ([x,y,width,height,color,page,afterMargin,ref]:drawRectangle)=>{
    const currentY = ref.current;
    page.drawRectangle({
      x: x,
      y: currentY - y,
      width: width,
      height: height,
      color: color,
    });
    ref.current = currentY - afterMargin
    console.log("currentY rectancle adding",currentY,"ref.current",ref.current)
    return ref.current
  }

  const addImage = ([x,y,width,height,page,logoImage,afterMargin,ref]:drawImage)=>{
    const currentY = ref.current;
    page.drawImage(logoImage, {
      x: x,
      y: currentY - y,
      width: width,
      height: height,
    });
    ref.current = currentY - afterMargin;
    console.log("currentY image adding",currentY,"ref.current",ref.current)
    return ref.current
  }
  const functionListAndRang = [
    {name:"addImg",count:1,id:1},
    {name:"addText",count:13,id:2},
    {name:"addRectangle",count:1,id:3},
    {name:"addText",count:5,id:4,changeRef:true},
    {name:"addText",count:2,id:5,isConditional:true,changeRef:true},
    {name:"addText",count:4,id:6,changeRef:true},
    {name:"addText",count:2,id:7,isConditional:true},
    {name:"addRectangle",count:1,id:8},
    {name:"addText",count:4,id:9},
    {name:"addRectangle",call:1,id:10,isConditional:true},
    {name:"addRectangle",call:1,id:11,isConditional:true},
    {name:"addText",call:4,id:12,isLoop:true},
    {name:"addLine",count:1,id:13},
    {name:"addText",call:1,id:14},
    {name:"addText",call:1,id:15,isConditional:true},
    {name:"addText",call:1,id:16,isConditional:true},
    {name:"addRectangle",count:1,id:17},
    {name:"addText",call:2,id:18}
  ];
  const formatDate = (date:string,locale:string)=>{
    const fdate = new Date(date)
    const day = fdate.getDate();
    const month = fdate.getMonth() + 1; // Les mois commencent à 0
    const year = fdate.getFullYear();
    if (locale === "en") {
        return `${year}/${String(month).padStart(2, '0')}/${String(day).padStart(2, '0')}`;
    }
    return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
  }
  console.log("invoice description",invoiceDescription)
  const generatePdf = async (data : FormValues,logoUrl:string ) => {
    if (!process.env.NEXT_PUBLIC_COMPANY_NAME || !process.env.NEXT_PUBLIC_COMPANY_ADRESS_STREET || !process.env.NEXT_PUBLIC_COMPANY_ADRESS_POSTAL_CODE || !process.env.NEXT_PUBLIC_COMPANY_ADRESS_CITY || !process.env.NEXT_PUBLIC_COMPANY_ADRESS_COUNTRY || !process.env.NEXT_PUBLIC_WEB_LINK || !process.env.NEXT_PUBLIC_TAX_ID || !process.env.NEXT_PUBLIC_ROOT_LINK || !clientInfo) return 
    // Import necessary functions from pdf-lib
  
    // Création d'un nouveau document PDF
    const pdfDoc = await PDFDocument.create();
    let page = pdfDoc.addPage([595, 842]); // Standard A4 size, adjust if needed
  
    // Chargement des polices
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
    const primaryColor = cmyk(1, 0.6, 0, 0.4); // Un bleu foncé
    const greyColor = cmyk(0, 0, 0, 0.2); // Un gris clair pour les lignes/bordures
    const blackColor = rgb(0, 0, 0);
    const whiteColor = rgb(1, 1, 1);
  
    const { width, height } = page.getSize();
    const margin = 40; // Increased margin slightly
    const yRef = height - margin;
    const yPosition = { current: yRef };
    console.log("yPosition",yPosition)
    // === En-tête ===
    const logoImageBytes = await fetch(logoUrl).then(res => res.arrayBuffer());
    const logoImage = await pdfDoc.embedPng(logoImageBytes);
    
    let labelX = width - margin - 257.5;
    let invoiceInfoX = width - margin - 257.5;
    const yPositionLeft = yPosition;
    
    const yClientInfoBox = (height - margin - 75 - 30) - 120 - margin;
    const clientInfoBoxY = {current : yClientInfoBox}
   
    const tableWidth = width - margin * 2;
    const colX = tableWidth / 7
    const col1X = margin; //Description
    const col2X = col1X + colX*1.8; // Quantité
    const col3X = col2X + colX; // Prix unitaire
    const col4X = col3X + colX*2; // Prix Total
    const totalsXKey = width - margin - 250;
    const totalsXValue = totalsXKey - 20;
    
    const pdfContent:pdfContent = {
      1:{
        isConditional:false,
        params:[[margin,100,100,100,page,null,0,yPosition]]
      },
      2:{
        isConditional:false,
        params:[[labelX,45,20,helveticaBoldFont,process.env.NEXT_PUBLIC_COMPANY_NAME,page,greyColor,120,yPosition],[margin,0,11,helveticaBoldFont,t.invoice.Adress,page,blackColor,0,yPosition],[margin + calculateAccurateTextWidth(t.invoice.Adress, helveticaBoldFont, 11),0,10,helveticaFont,process.env.NEXT_PUBLIC_COMPANY_ADRESS_STREET,page,blackColor,18,yPosition],[margin,0,11,helveticaBoldFont,t.invoice.postalCode,page,blackColor,0,yPosition],[margin + calculateAccurateTextWidth(t.invoice.postalCode, helveticaBoldFont, 11),0,10,helveticaFont,process.env.NEXT_PUBLIC_COMPANY_ADRESS_POSTAL_CODE,page,blackColor,18,yPosition],[margin,0,11,helveticaBoldFont,t.invoice.city,page,blackColor,0,yPosition],[margin + calculateAccurateTextWidth(t.invoice.city, helveticaBoldFont, 11),0,10,helveticaFont,process.env.NEXT_PUBLIC_COMPANY_ADRESS_CITY,page,blackColor,18,yPosition],[margin,0,11,helveticaBoldFont,t.invoice.country,page,blackColor,0,yPosition],[margin + calculateAccurateTextWidth(t.invoice.country, helveticaBoldFont, 11),0,10,helveticaFont,process.env.NEXT_PUBLIC_COMPANY_ADRESS_COUNTRY,page,blackColor,18,yPosition],[margin,0,11,helveticaBoldFont,t.invoice.wsite,page,blackColor,0,yPosition],[margin + calculateAccurateTextWidth(t.invoice.wsite, helveticaBoldFont, 11),0,10,helveticaFont,process.env.NEXT_PUBLIC_WEB_LINK.replace("{locale}",locale),page,primaryColor,18,yPosition],[margin,0,11,helveticaBoldFont,t.invoice.identificationNumber,page,blackColor,0,yPosition],[margin + calculateAccurateTextWidth(t.invoice.identificationNumber, helveticaBoldFont, 11),0,10,helveticaFont,process.env.NEXT_PUBLIC_TAX_ID,page,primaryColor,18,yPosition]]
      },
      3:{
        isConditional:false,
        params:[[invoiceInfoX,0,width / 2 - margin,100,primaryColor,page,0,yPositionLeft]]
      },
      4:{
        isConditional:false,
        params:[[invoiceInfoX + 20,-15,18,helveticaBoldFont,`${t.invoice.billNr} ${data.invoiceInfo.number}`,page,whiteColor,50,yPositionLeft],[invoiceInfoX,20,11,helveticaBoldFont,t.invoice.billDate,page,blackColor,0,yPositionLeft],[invoiceInfoX + calculateAccurateTextWidth(t.invoice.billDate, helveticaBoldFont, 11),20,10,helveticaFont,` ${formatDate(data.invoiceInfo.date,data.locale)}`,page,blackColor,18,yPositionLeft],[invoiceInfoX,20,11,helveticaBoldFont,t.invoice.customerNr,page,blackColor,0,yPositionLeft],[invoiceInfoX + calculateAccurateTextWidth(t.invoice.customerNr, helveticaBoldFont, 11),20,10,helveticaFont,` ${clientInfo.clientNumber}`,page,blackColor,18,yPositionLeft]]
      },
      5:{
        isConditional:true,
        params:[[invoiceInfoX,20,11,helveticaBoldFont,t.invoice.dueDate,page,blackColor,0,yPositionLeft],[invoiceInfoX + calculateAccurateTextWidth(t.invoice.dueDate, helveticaBoldFont, 11),20,10,helveticaFont,` ${formatDate(data.invoiceInfo.dueDate,data.locale)}`,page,blackColor,18,yPositionLeft]]
      },
      6:{
        isConditional:false,
        params:[[margin,0,14,helveticaBoldFont,t.invoice.billTo,page,blackColor,20,clientInfoBoxY],[margin,0,10,helveticaFont,`${invoiceInfo.name}`,page,blackColor,18,clientInfoBoxY],[margin,0,10,helveticaFont,invoiceInfo.adresse,page,blackColor,18,clientInfoBoxY],[margin,0,10,helveticaFont,invoiceInfo.email,page,blackColor,60,clientInfoBoxY]]
      },
      7:{
        isConditional:true,
        params:[[margin,0,12,helveticaBoldFont,t.invoice.prestation,page,blackColor,20,yPosition],[margin,0,10,helveticaFont,data.invoiceDescription,page,blackColor,30,yPosition,width - margin * 2,12,width,margin]]
      },
      8:{
        isConditional:false,
        params:[[margin,15,width - margin * 2,20,primaryColor,page,0,yPosition]]
      },
      9:{
        isConditional:false,
        params:[[col1X + 5,10,10,helveticaBoldFont,t.invoice.features.description,page,whiteColor,0,yPosition],[col2X + 5,10,10,helveticaBoldFont,t.invoice.features.quantity,page,whiteColor,0,yPosition],[col3X + 5,10,10,helveticaBoldFont,t.invoice.features.singlePriceWithoutTax,page,whiteColor,0,yPosition],[col4X + 5,10,10,helveticaBoldFont,t.invoice.features.totalPriceWithoutTax,page,whiteColor,30,yPosition]] 
      },
      10:{
        isConditional:true,
        params:[[margin,20,width - margin * 2,20,cmyk(0,0,0,0.03),page,0,yPosition]]
      },
      11:{
        isConditional:true,
        params:[[margin,20,width - margin * 2,20,whiteColor,page,0,yPosition]]
      },
      12:{
        isConditional:false,
        params:[[col1X + 5,12.5,9,helveticaFont,"{description}",page,blackColor,0,yPosition],[col2X + 5,12.5,9,helveticaFont,"{quantity}",page,blackColor,0,yPosition],[col3X + 5,12.5,9,helveticaFont,"{price}",page,blackColor,0,yPosition],[col4X + 5,12.5,9,helveticaFont,"{lineTotal}",page,blackColor,18,yPosition]]
      },
      13:{
        isConditional:false,
        params:[[{ x: margin + (width - margin * 2) * 0.5, y: 20 },{ x: width - margin, y: 20 },0.5,greyColor,page,15,yPosition]]
      },
      14:{
        isConditional:false,
        params:[[totalsXKey,0,10,helveticaFont,`${t.invoice.subtotal} {subtotal}`,page,blackColor,data.taxEnabled !== false ? 20:25,yPosition]]
      },
      15:{
        isConditional:true,
        params:[[totalsXKey,0,10,helveticaFont,`${t.invoice.tax.replace("{tax}", data.taxRate.toString())} {taxPrice}`,page,blackColor,25,yPosition]]
      },
      16:{
        isConditional:true,
        params:[[totalsXKey,0,10,helveticaFont,`${t.invoice.discount.replace("{discount}", data.taxRate.toString())} {discountPrice}`,page,blackColor,18,yPosition]]
      },
      17:{
        isConditional:false,
        params:[[totalsXKey - 10,5,(width - margin) - (totalsXKey -10) ,22,primaryColor,page,0,yPosition]]
      },
      18:{
        isConditional:false,
        params:[[totalsXKey,0,11,helveticaBoldFont,`${t.invoice.totalWithTax} {totalPrice}`,page,whiteColor,30,yPosition],[margin,0,8,helveticaFont,t.invoice.footer,page,blackColor,0,{current:margin+30},width - margin * 2,12,width,margin]]
      }
    };

    functionListAndRang.forEach((item,i)=>{
      if (item.count) {
        //console.log("interface fonction",item.id)
        for (let index = 0; index < item.count; index++) {
          //console.log("id",item.id,"param",pdfContent[item.id].params[index])
          const params = pdfContent[item.id].params[index];
          switch (item.name) {
            case "addText":
              if (isDataAddText(params)) {
                if (item.isConditional === true) {
                  //console.log("params",params,"id",item.id)
                  if (item.id === 5 && data.invoiceInfo.dueDate !== '') {
                    yPositionLeft.current = addNewText(params)
                  }else if(item.id === 7 && data.invoiceDescription !== ''){
                    yPosition.current = addNewText(params)
                  }
                }else{
                  if (item.id === 4) {
                    yPositionLeft.current = addNewText(params)
                  }else if(item.id === 6){
                    clientInfoBoxY.current = addNewText(params)
                    yPosition.current = clientInfoBoxY.current
                  }else{
                    yPosition.current = addNewText(params)
                    //console.log("params",params,"id",item.id)
                  }
                }
              }
              break;
            case "addImg":
              if (isDataAddImage(params)) {
                params[5] = logoImage
                yPosition.current = addImage(params)
              }
              break;
            case "addRectangle":
              if (isDataAddRectangle(params)) {
                yPosition.current = addRectangle(params)
              }
              break;
            case "addLine":
              if (isDataAddLine(params)) {
                yPosition.current = addLine(params)
              }
              break;
            default:
              break;
          }
        }
      }else if(item.call){
        let discountAmount = 0;
        let taxAmount = 0;
        let subtotal = 0;
        if (item.id === 12) {
          data.features.forEach((feature:features, index) => {
            if (index % 2 !== 0) {
              const params = pdfContent[10].params[0];
              if (isDataAddRectangle(params)) {
                yPosition.current = addRectangle(params)
              }
            }else{
              const params = pdfContent[11].params[0];
              if (isDataAddRectangle(params)) {
                yPosition.current = addRectangle(params)
              }
            }
            for (let index = 0; index < item.call; index++) {
              const params = pdfContent[item.id].params[index];
              const lineTotal = feature.quantity * feature.price;
              subtotal += lineTotal;
              if (index === 0) {
                params[4] = feature.description 
              }else if(index === 1){
                params[4] = feature.quantity.toString();
              }else if(index === 2){
                params[4] = feature.price.toFixed(2) + " €";
              }else{
                params[4] = lineTotal.toFixed(2) + " €";
              }
              if (isDataAddText(params)) {
                yPosition.current = addNewText(params)
              }
            }
            console.log("subtotal",subtotal)
          })
        }else{
          if (item.isConditional) {
            if (data.discount > 0 && item.id === 16) {
              discountAmount = calculateDiscountAmount();
              const params = pdfContent[item.id].params[0];
              if (isDataAddText(params)) {
                params[4] = `${params[4].replace("{discountPrice}",discountAmount.toFixed(2))} €`;
                yPosition.current = addNewText(params)
              }
            }
            if (data.taxEnabled !== false && item.id === 15) {
              taxAmount = calculateTax();
              const params = pdfContent[item.id].params[0];
              if (isDataAddText(params)) {
                params[4] = `${params[4].replace("{taxPrice}",taxAmount.toFixed(2))} €`;
                yPosition.current = addNewText(params)
              }
            }
          }else{
            if (item.id === 14) {
              subtotal = calculateSubtotal();
              const params = pdfContent[item.id].params[0];
              if (isDataAddText(params)) {
                params[4] = `${params[4].replace("{subtotal}",subtotal.toFixed(2))} €`;
                yPosition.current = addNewText(params)
              }
            }else{
              const total = calculateTotal()
              for (let index = 0; index < item.call; index++) {
                const params = pdfContent[item.id].params[index];
                if (isDataAddText(params)) {
                  if (index === 0) {
                    params[4] = `${params[4].replace("{totalPrice}",total.toFixed(2))} €`;
                  }
                  yPosition.current = addNewText(params)
                }
              }
            }
          }
        }
      }
    })

    if (yPosition.current < margin + 30) { // Add new page if not enough space
      page = pdfDoc.addPage([595, 842]);
      yPosition.current = height - margin;
    }
    // === Pied de page (numéro de page, etc.) ===
    const pageCount = pdfDoc.getPageCount();
    for (let i = 0; i < pageCount; i++) {
      const currentPage = pdfDoc.getPage(i);
      currentPage.drawText(
        t.invoice.page.replace("{page}", (i + 1).toString()).replace("{total}", pageCount.toString()),
        {
          x: currentPage.getWidth() / 2 - 30,
          y: margin / 2,
          size: 8,
          font: helveticaFont,
          color: rgb(0.5, 0.5, 0.5),
        }
      );
    }
  
    // Sauvegarde du PDF
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    //return URL.createObjectURL(blob);
    return blob;
  };
  
  const handleSubmit = async(e: React.FormEvent) => {
    e.preventDefault();
    if(invoiceInfo && !invoiceInfo.email || !invoiceInfo) return
    // Ici vous pourriez envoyer les données à une API ou générer un PDF
    
    try {
      setLoading(true)
      const data = {invoiceInfo,features,taxEnabled,taxRate,discount,invoiceDescription} as FormValues
      const logoUrl = `${process.env.NEXT_PUBLIC_ROOT_LINK}/assets/images/logo.png`
      const blob = await generatePdf(data,logoUrl)
      const parsedService = {...service,invoice:data};
      const parsedClient = {...clientInfo,invoiceCount:parseInt(invoiceInfo.number),modifDate:new Date().toLocaleDateString(`${contractLanguage === 'fr' ? 'fr-FR' : contractLanguage === 'de' ? 'de-DE' : 'en-US'}`)}
      
      if(blob){
        const invoiceData = {service:parsedService,blobInvoice:blob}
        const amountNoTax = features.reduce((total, feature) => total + feature.quantity * feature.price, 0);
        let userTax = null;
        if (enableCountryForThresholdBeforTax.includes(parsedService.contract?.clientGivingData?.adresse.country.isoCode ?? '')) {
          userTax = {stateIsoCode:parsedService.contract?.clientGivingData?.adresse.country.state?.stateCode ? parsedService.contract?.clientGivingData?.adresse.country.state?.stateCode : parsedService.contract?.clientGivingData?.adresse.country.isoCode,saleTax:{amount:amountNoTax,taxThreshold:parsedService.contract?.clientGivingData?.adresse.country.state?.stateCode ? parsedService.contract?.clientGivingData?.adresse.country.state.threshold : parsedService.contract?.clientGivingData?.adresse.country.threshold_before_tax} }
        }
        /*const pdfUrl = URL.createObjectURL(blob)
          if (pdfUrl) {
            window.open(pdfUrl, '_blank')
              //setPdfUrl(pdfUrl)
          }*/
        const result = await saveClientInvoice(invoiceData,parsedClient,clientServiceId,userTax)
        const attach = await blobToBase64(blob) as string;
        if (result === "success") {
          /*const pdfUrl = URL.createObjectURL(blob)
          if (pdfUrl) {
            window.open(pdfUrl, '_blank')
              //setPdfUrl(pdfUrl)
          }*/
          const response = await sendInvoice({to:invoiceInfo.email ?? '',attach:attach,subject:`${contractLanguage === 'fr' ? 'Facture' : contractLanguage === 'de' ? 'Rechnung' : 'Invoice'}`,name:invoiceInfo.name},contractLanguage)
          if (response === "success") {
            alert("Facture envoyée avec succès")
            router.push('/'+locale+'/clients-list')
          } else {
            alert("Erreur lors de l'envoi de la facture")
          }
        }
      }else{
        alert("Erreur lors de la génération du PDF")
      }
    } catch (error) {
      alert("Erreur lors de la génération du PDF")
    } finally{
      setLoading(false)
    }
    
    /*if (pdfUrl) {
      window.open(pdfUrl, '_blank')
        //setPdfUrl(pdfUrl)
    }*/
  };

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

  const parseInputDate = ()=>{
    return `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`
  }
  
  const canSendBill = () => {
    if(!clientInfo) return false
    return (
      invoiceInfo.name &&
      invoiceInfo.email &&
      invoiceInfo.adresse &&
      invoiceInfo.number &&
      invoiceInfo.date &&
      features.length > 0 && contractLanguage
    );
  };
 
  useEffect(() => {
    async function getDocumentById(collectionName: string, id: string,serviceId:string) {
      if(!id || !serviceId) return
      const docClientRef = doc(firebase.db, collectionName, id);
      const docServiceRef = doc(firebase.db, 'services', serviceId);
      const allRequest = [
        await getDoc(docClientRef),
        await getDoc(docServiceRef)
      ]

      const [clientSnap,serviceSnap] = await Promise.all(allRequest)
      
      if (clientSnap.exists() && serviceSnap.exists()) {
        const client = { id: clientSnap.id, ...clientSnap.data() } as clientInfo;
        const service = { ...serviceSnap.data() } as Services;
        sessionStorage.setItem("invoiceDoc",JSON.stringify({client,service}))
      }
    }
    const handleResponse = (data:{client:clientInfo,service:Services})=>{
      const contract = data.service.contract
      setService(service)
      if (contract) {
        setInvoiceInfo({...invoiceInfo,name: data.client.name,
          email: contract?.clientGivingData?.clientEmail ?? data.client.email ?? '',adresse:`${contract?.clientGivingData?.adresse.street} ${contract?.clientGivingData?.adresse.postalCode} ${contract?.clientGivingData?.adresse.city} ${contract?.clientGivingData?.adresse.country.name}`,number:(data.client.invoiceCount ?? 1).toString()
        })
        setContractLanguage(contract.contractLanguage);
        setInvoiceDescription(contract.prestataireGivingData?.projectDescription ?? '')
        setFeatures((prev)=>{
          return contract.projectFonctionList.map((feature,index)=>{
            return {...prev[index],description:feature.description ?? '',id:index+1,quantity:feature.quantity ?? 0,price:feature.price ?? 0}
          })
        })
        if (contract.contractLanguage !== locale) {
          router.push(`/${contract.contractLanguage}/bill/${data.client.id}`)
        }
        setTaxRate(contract?.tax ?? 0)
      }
      setClientInfo(data.client);
    }
    const sessionInvoiceDoc = sessionStorage.getItem("invoiceDoc")
    
    if (sessionInvoiceDoc) {
      const invoiceDocParsed = JSON.parse(sessionInvoiceDoc)
      handleResponse(invoiceDocParsed)
    } else {
      getDocumentById("clients",clientId,clientServiceId);
    }
  }, [clientId]);

  useEffect(()=>{
    const checkCookie = async ()=>{
      const cookie = await getCookie('userAuth')
      if(!cookie){
          router.push('/'+locale+'/login')
      }
    }
    checkCookie()
  },[locale])

  if (!service) return <div className="text-center py-8 mt-[6.875rem] h-[12.5rem] flex justify-center items-center w-[85%] mx-auto">Chargement...</div>;
  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md mt-[6.875rem] w-[85%]">
      <h1 className="text-2xl font-bold text-primary mb-6">Facturation pour le client {invoiceInfo.name}</h1>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <h2 className="text-lg font-semibold mb-4">Informations Client</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nom</label>
                <input
                  type="text"
                  className="mt-1 block px-[.95rem] py-[.525rem] text-[.775rem] w-full rounded-[.4rem] bg-gray-100 focus:outline-gray-200"
                  value={invoiceInfo.name}
                  disabled={true}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  className="mt-1 block px-[.95rem] py-[.525rem] text-[.775rem] w-full rounded-[.4rem] bg-gray-100 focus:outline-gray-200"
                  value={invoiceInfo.email}
                  disabled={true}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Adresse</label>
                <textarea
                  className="mt-1 block px-[.95rem] py-[.525rem] text-[.775rem] w-full rounded-[.4rem] bg-gray-100 focus:outline-gray-200"
                  rows={3}
                  value={invoiceInfo.adresse}
                  disabled={true}
                  required
                />
              </div>
            </div>
          </div>
          <div>
            <h2 className="text-lg font-semibold mb-4">Informations Facture</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Numéro</label>
                <input
                  type="text"
                  className="mt-1 block px-[.95rem] py-[.525rem] text-[.775rem] w-full rounded-[.4rem] bg-gray-100 focus:outline-gray-200"
                  value={invoiceInfo.number}
                  disabled={true}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Date</label>
                <input
                  type="date"
                  className="mt-1 block px-[.95rem] py-[.525rem] text-[.775rem] w-full rounded-[.4rem] bg-gray-100 focus:outline-gray-200" min={parseInputDate()}
                  value={parseInputDate()}
                  onChange={(e) =>
                    setInvoiceInfo({ ...invoiceInfo, date: e.target.value })
                  }
                  required
                />
              </div>
            </div>
          </div>
        </div>
        <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Descriptions du services</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              className="mt-1 block px-[.95rem] py-[.525rem] text-[.775rem] w-full rounded-[.4rem] bg-gray-100 focus:outline-gray-200"
              rows={3}
              value={invoiceDescription}
              onChange={(e) =>
                setInvoiceDescription(e.target.value)
              }
              required
            />
          </div>
        </div>         
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Fonctionnalités/Prestations</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantité
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prix Unitaire (€)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total (€)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {features.map((feature) => (
                  <tr key={feature.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="text"
                        className="block px-[.95rem] py-[.525rem] text-[.775rem] w-full rounded-[.4rem] bg-gray-100 focus:outline-gray-200"
                        value={feature.description}
                        onChange={(e) =>
                          updateFeature(feature.id, 'description', e.target.value)
                        }
                        required
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="text"
                        className="block px-[.95rem] py-[.525rem] text-[.775rem] w-full rounded-[.4rem] bg-gray-100 focus:outline-gray-200" placeholder='Quantité'
                        value={feature.quantity}
                        onChange={(e) =>
                          updateFeature(feature.id, 'quantity', parseInt(e.target.value) || 0)
                        }
                        required
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="text"
                        className="block px-[.95rem] py-[.525rem] text-[.775rem] w-full rounded-[.4rem] bg-gray-100 focus:outline-gray-200"
                        placeholder='Prix'
                        value={feature.price}
                        onChange={(e) =>
                          updateFeature(feature.id, 'price', parseFloat(e.target.value) || 0)
                        }
                        required
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {(feature.quantity * feature.price).toFixed(2)} €
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => removeFeature(feature.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button
            type="button"
            onClick={addFeature}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Ajouter une fonctionnalité
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                checked={taxEnabled}
                onChange={
                  (e) => setTaxEnabled(e.target.checked)}
                  disabled={true}
              />
              <span className="ml-2 text-sm text-gray-700">Ajouter TVA</span>
            </label>
            {taxEnabled && (
              <div className="mt-2">
                <label className="block text-sm font-medium text-gray-700">Taux TVA (%)</label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  className="mt-1 px-[.95rem] py-[.525rem] text-[.775rem] w-full rounded-[.4rem] bg-gray-100 focus:outline-gray-200"
                  value={taxRate}
                  onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Remise (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              className="mt-1 block px-[.95rem] py-[.525rem] text-[.775rem] w-full rounded-[.4rem] bg-gray-100 focus:outline-gray-200"
              value={discount}
              onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
            />
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <div className="flex justify-between mb-2">
            <span className="font-medium">Sous-total:</span>
            <span>{calculateSubtotal().toFixed(2)} €</span>
          </div>
          {taxEnabled && (
            <div className="flex justify-between mb-2">
              <span className="font-medium">TVA ({taxRate}%):</span>
              <span>{calculateTax().toFixed(2)} €</span>
            </div>
          )}
          {discount > 0 && (
            <div className="flex justify-between mb-2">
              <span className="font-medium">Remise ({discount}%):</span>
              <span>-{(calculateSubtotal() * (discount / 100)).toFixed(2)} €</span>
            </div>
          )}
          <div className="flex justify-between text-lg font-bold">
            <span>Total:</span>
            <span>{calculateTotal().toFixed(2)} €</span>
          </div>
        </div>
        <div className="flex items-center justify-end gap-4">
          <a href={'/'+locale+'/clients-list'} className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Liste client</a>
          <button disabled={!canSendBill() || loading}
            type="submit"
            className={`inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
              loading || !canSendBill() ? 'cursor-not-allowed opacity-50' : 'cursor-pointer opacity-1'
            } gap-2`}
          >
            {loading && <Icon name='bx bx-loader-alt bx-spin bx-rotate-180' color='#fff' size='1em'/>}Générer la facture
          </button>
        </div>
      </form>
    </div>
  );
}

export default InvoiceForm;