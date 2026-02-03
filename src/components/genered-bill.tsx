"use client"
import React, { useContext, useEffect, useRef, useState } from 'react';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { CMYK, cmyk, PDFDocument, PDFFont, PDFImage, PDFPage, RGB, rgb, StandardFonts } from 'pdf-lib';
import { useTranslationContext } from '@/hooks/app-hook';

import { sendInvoice } from '@/server/services-mail';
import Icon from './Icon';
import { getCookie } from '@/server/services';
import { clientAddress, clientServiceContractDB, Contract, ContractDb, contractFormClient, features, invoiceSendData, serviceDb, Services } from '@/interfaces';
import { saveClientInvoice } from '@/server/handle-database';
import { decodeClientServiceContract, parseDate } from '@/utils/fonction';
import { saveInvoiceDoc } from '@/server/services-save-doc';
import { AppContext } from '@/app/context/app-context';

interface invoiceInfo {
  adresse:string;
  name:string;
  email:string;
  invoiceCount: number;
  date: number|string;
  dueDate: number|string;
}

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
  clientUid:string;
  serviceUid:string
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

const enableCountryForThresholdBeforTax = ["CA","US","CH","AU","ZA"]

const InvoiceForm:React.FC<InvoiceFormProps> = ({locale,clientUid,serviceUid}) =>{
  const [loading, setLoading] = useState(false);
  const [loader, setLoader] = useState(true);
  const router = useRouter();
  const t:any = useTranslationContext();
  const [contract, setContract] = useState<clientServiceContractDB|null>(null)
  
  const [taxPrice,setTaxPrice] = useState<number>(0);
  const [totalPrice,setTotalPrice] = useState<number>(0);
  const [subTotalPrice,setSubTotalPrice] = useState<number>(0);
  const [contractLanguage, setContractLanguage] = useState<string>(locale)
  const [clientInfo, setClientInfo] = useState<contractFormClient>();
  const [service, setService] = useState<serviceDb|null>(null)
  const [invoiceId,setInvoiceId] = useState<number>(0)
  const searchParams = useSearchParams();
  const [invoiceInfo, setInvoiceInfo] = useState<invoiceInfo>({
    invoiceCount: 0,
    adresse: '',
    name: '',
    email: '',
    date: new Date().toISOString().split('T')[0],
    dueDate: '',
  });

  const [clientId,setClientId] = useState<number>(0)
  const [serviceId,setServiceId] = useState<number>(0)
   
  const [features, setFeatures] = useState<features[]>([]);
  const [currency,setCurrency] = useState<string>("")
  const [taxEnabled, setTaxEnabled] = useState(true);
  const [taxRate, setTaxRate] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [invoiceDescription, setInvoiceDescription] = useState('');
  const {setContextData} = useContext(AppContext)
  const companyName = process.env.NEXT_PUBLIC_COMPANY_NAME
  const companyStreetAddress = process.env.NEXT_PUBLIC_COMPANY_ADRESS_STREET
  const companyAddressPostalCode = process.env.NEXT_PUBLIC_COMPANY_ADRESS_POSTAL_CODE
  const companyAddressCity = process.env.NEXT_PUBLIC_COMPANY_ADRESS_CITY
  const companyAddressCOuntry = process.env.NEXT_PUBLIC_COMPANY_ADRESS_COUNTRY
  const webLink = process.env.NEXT_PUBLIC_WEB_LINK
  const taxId = process.env.NEXT_PUBLIC_TAX_ID 
  const rootLink = process.env.NEXT_PUBLIC_ROOT_LINK

  const addFeature = () => {
    setFeatures([
      ...features,
      {
        id: 1,
        title:'',
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
    return subTotalPrice
  };

  const calculateTax = () => {
    return taxPrice
  };

  const calculateDiscountAmount = () => {
    if (discount > 0) return 0;
    return (calculateSubtotal() + calculateTax()) * (discount / 100);
  };

  const calculateTotal = () => {
    return totalPrice - calculateDiscountAmount();
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
    //console.log("currentY",currentY,"aftermargin",afterMargin,"diff",ref.current,text)
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
    //console.log("drawline","aftermargin",afterMargin,"currentY",currentY,"diff",ref.current)
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
    //console.log("currentY rectancle adding",currentY,"ref.current",ref.current)
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
    //console.log("currentY image adding",currentY,"ref.current",ref.current)
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
  
  const parseToInt = (data:number|string)=>{
    if (typeof(data) === "string") {
        return parseInt(data)
    }
    return data
  }

  const parseToFloat = (data:number|string)=>{
    if (typeof(data) === "string") {
        return parseFloat(data)
    }
    return data
  }

  //console.log("invoice description",invoiceDescription)

  const generatePdf = async (data : FormValues,logoUrl:string ) => {
    //alert(companyName+" "+companyStreetAddress+" "+companyAddressPostalCode+" "+companyAddressCity+" "+companyAddressCOuntry+" "+webLink+" "+taxId+" "+rootLink+" "+clientNumber)
    if (!companyName|| !companyStreetAddress || !companyAddressPostalCode || !companyAddressCity || !companyAddressCOuntry || !webLink || !taxId || !rootLink || !clientInfo?.clientId || !service?.contract?.contractId) return 
    
    try {
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
          params:[[labelX,45,20,helveticaBoldFont,companyName,page,greyColor,120,yPosition],[margin,0,11,helveticaBoldFont,t.invoice.Adress,page,blackColor,0,yPosition],[margin + calculateAccurateTextWidth(t.invoice.Adress, helveticaBoldFont, 11),0,10,helveticaFont,companyStreetAddress,page,blackColor,18,yPosition],[margin,0,11,helveticaBoldFont,t.invoice.postalCode,page,blackColor,0,yPosition],[margin + calculateAccurateTextWidth(t.invoice.postalCode, helveticaBoldFont, 11),0,10,helveticaFont,companyAddressPostalCode,page,blackColor,18,yPosition],[margin,0,11,helveticaBoldFont,t.invoice.city,page,blackColor,0,yPosition],[margin + calculateAccurateTextWidth(t.invoice.city, helveticaBoldFont, 11),0,10,helveticaFont,companyAddressCity,page,blackColor,18,yPosition],[margin,0,11,helveticaBoldFont,t.invoice.country,page,blackColor,0,yPosition],[margin + calculateAccurateTextWidth(t.invoice.country, helveticaBoldFont, 11),0,10,helveticaFont,companyAddressCOuntry,page,blackColor,18,yPosition],[margin,0,11,helveticaBoldFont,t.invoice.wsite,page,blackColor,0,yPosition],[margin + calculateAccurateTextWidth(t.invoice.wsite, helveticaBoldFont, 11),0,10,helveticaFont,webLink.replace("{locale}",locale),page,primaryColor,18,yPosition],[margin,0,11,helveticaBoldFont,t.invoice.identificationNumber,page,blackColor,0,yPosition],[margin + calculateAccurateTextWidth(t.invoice.identificationNumber, helveticaBoldFont, 11),0,10,helveticaFont,taxId,page,primaryColor,18,yPosition]]
        },
        3:{
          isConditional:false,
          params:[[invoiceInfoX,0,width / 2 - margin,100,primaryColor,page,0,yPositionLeft]]
        },
        4:{
          isConditional:false,
          params:[[invoiceInfoX + 20,-15,18,helveticaBoldFont,`${t.invoice.billNr} ${data.invoiceInfo.invoiceCount}`,page,whiteColor,50,yPositionLeft],[invoiceInfoX,20,11,helveticaBoldFont,t.invoice.billDate,page,blackColor,0,yPositionLeft],[invoiceInfoX + calculateAccurateTextWidth(t.invoice.billDate, helveticaBoldFont, 11),20,10,helveticaFont,` ${parseDate(data.invoiceInfo.date,data.locale)}`,page,blackColor,18,yPositionLeft],[invoiceInfoX,20,11,helveticaBoldFont,t.invoice.customerNr,page,blackColor,0,yPositionLeft],[invoiceInfoX + calculateAccurateTextWidth(t.invoice.customerNr, helveticaBoldFont, 11),20,10,helveticaFont,` ${clientInfo.clientNumber}`,page,blackColor,18,yPositionLeft]]
        },
        5:{
          isConditional:true,
          params:[[invoiceInfoX,20,11,helveticaBoldFont,t.invoice.dueDate,page,blackColor,0,yPositionLeft],[invoiceInfoX + calculateAccurateTextWidth(t.invoice.dueDate, helveticaBoldFont, 11),20,10,helveticaFont,` ${parseDate(data.invoiceInfo.dueDate,data.locale)}`,page,blackColor,18,yPositionLeft]]
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
                const lineTotal = parseToInt(feature.quantity) * parseToInt(feature.price);
                subtotal += lineTotal;
                if (index === 0) {
                  params[4] = feature.description 
                }else if(index === 1){
                  params[4] = feature.quantity.toString();
                }else if(index === 2){
                  params[4] = `${parseToInt(feature.price).toFixed(2)} ${currency}`;
                }else{
                  params[4] = `${lineTotal.toFixed(2)} ${currency}`;
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
                  params[4] = `${params[4].replace("{discountPrice}",discountAmount.toFixed(2))} ${currency}`;
                  yPosition.current = addNewText(params)
                }
              }
              if (data.taxEnabled !== false && item.id === 15) {
                taxAmount = calculateTax();
                const params = pdfContent[item.id].params[0];
                if (isDataAddText(params)) {
                  params[4] = `${params[4].replace("{taxPrice}",taxAmount.toFixed(2))} ${currency}`;
                  yPosition.current = addNewText(params)
                }
              }
            }else{
              if (item.id === 14) {
                subtotal = calculateSubtotal();
                const params = pdfContent[item.id].params[0];
                if (isDataAddText(params)) {
                  params[4] = `${params[4].replace("{subtotal}",subtotal.toFixed(2))} ${currency}`;
                  yPosition.current = addNewText(params)
                }
              }else{
                const total = calculateTotal()
                for (let index = 0; index < item.call; index++) {
                  const params = pdfContent[item.id].params[index];
                  if (isDataAddText(params)) {
                    if (index === 0) {
                      params[4] = `${params[4].replace("{totalPrice}",total.toFixed(2))} ${currency}`;
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
    
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
      console.log("blob data",blob)
      return blob
    } catch (error) {
      console.log("Erreur",error)
      return null
    }
    //return blob;
  };

  const calculInvoiceId = ()=>{
    console.log("clientInfo invoiceCount",clientInfo?.invoiceCount)
    return clientInfo?.invoiceCount ?? 0 + 1
  }
  
  const handleSubmit = async(e: React.FormEvent) => {
    e.preventDefault();
    //alert()
    if(!clientId) return
    // Ici vous pourriez envoyer les données à une API ou générer un PDF
    
    try {

      setLoading(true)

      const data = {invoiceInfo,features,taxEnabled,taxRate,discount,invoiceDescription} as FormValues
      const invoiceName = `invoice_${new Date().getFullYear()}-${new Date().getMonth() + 1}-${new Date().getDate()}-${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()}_${((clientInfo?.fname ?? "")+(clientInfo?.lname ?? "")).replaceAll(" ","-")}`;

      const logoUrl = `${process.env.NEXT_PUBLIC_ROOT_LINK}/assets/images/logo.png`
      const blob = await generatePdf(data,logoUrl)
      
      if(blob){

        const fileName = `invoice_${new Date().getFullYear()}-${new Date().getMonth() + 1}-${new Date().getDate()}-${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()}_${((clientInfo?.fname ?? "")+(clientInfo?.lname ?? "")).replaceAll(" ","-")}`;
        
        const attach = await blobToBase64(blob) as string;
        const invoiceData = {invoiceId:invoiceId,invoiceCount:invoiceInfo?.invoiceCount ?? 1,clientId:clientId,invoiceDate:invoiceInfo.date,invoiceDescription:invoiceDescription,ivoiceDueDate:invoiceInfo.dueDate,taxEnabled:taxEnabled,taxRate:taxRate,discount:discount,contractId:service?.contract?.contractId,blobInvoice:attach,invoiceName:invoiceName} as invoiceSendData
        const amountNoTax = features.reduce((total, feature) => total + parseToInt(feature.quantity) * parseToInt(feature.price), 0);
        
        let userTax = null;
        
        if (enableCountryForThresholdBeforTax.includes(clientInfo?.addressClient?.clientCountry?.isoCode ?? '')) {
          userTax = {stateIsoCode: clientInfo?.addressClient && clientInfo?.addressClient.clientCountry?.clientState?.stateCode ? clientInfo?.addressClient.clientCountry?.clientState?.stateCode : clientInfo?.addressClient?.clientCountry?.isoCode,saleTax:{amount:amountNoTax,taxThreshold:clientInfo?.addressClient?.clientCountry?.clientState?.stateCode ? clientInfo?.addressClient.clientCountry?.clientState?.threshold : clientInfo?.addressClient?.clientCountry?.clientState?.threshold} }
        }
        
        const result = await saveInvoiceDoc(invoiceData)
        
        if (result) {
          const response = await sendInvoice({to:invoiceInfo.email ?? '',attach:attach,subject:`${contractLanguage === 'fr' ? 'Facture' : 'Invoice'}`,name:invoiceInfo.name},contractLanguage)
          if (response === "success") {
            sessionStorage.clear()
            setContextData({toast:{toastVariant:"success",toastMessage:clientInfo?.clientLang ?? locale ? "Facture envoyée avec succès" : "Invoice sent successfully.",showToast:true,time:new Date().getTime()}})
            router.push('/'+locale+'/clients-list')
          } else {
            setContextData({toast:{toastVariant:"error",toastMessage:clientInfo?.clientLang ?? locale ? "Erreur lors de l’envoi de la facture." : "Error while sending the invoice.",showToast:true,time:new Date().getTime()}})
          }
        }
      }else{
        setContextData({toast:{toastVariant:"error",toastMessage:clientInfo?.clientLang ?? locale ? "Erreur lors de la génération du PDF." : "Error while generating the PDF.",showToast:true,time:new Date().getTime()}})
      }
    } catch (error) {
      console.log("Erreur",error)
      setContextData({toast:{toastVariant:"error",toastMessage:clientInfo?.clientLang ?? locale ? "Erreur lors de la génération du PDF." : "Error while generating the PDF.",showToast:true,time:new Date().getTime()}})
    } finally{
      setLoading(false)
    }
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
    const check = (
      (invoiceInfo.name &&
      invoiceInfo.email &&
      invoiceInfo.adresse &&
      invoiceInfo.invoiceCount &&
      invoiceInfo.date && invoiceDescription &&
      features.length > 0) ? true : false
    )
    return check;
  };

  //console.log("canSendBill",canSendBill())
 
  useEffect(() => {
    let clientId = 0;
    let serviceId = 0;

    const handleDataParam = async()=>{
      const search = window.location.search
      const data = search.split("=");
      const clientIdParam = data[1].split("")[0]
      const serviceIdParam = data[1].split("")[1]
      clientId = parseInt(clientIdParam ?? "0")
      serviceId = parseInt(serviceIdParam ?? "0")
      setClientId(clientId)
      setServiceId(serviceId)
      const cookie = await getCookie("userAuth")
      if(!clientId || !serviceId) {cookie ? router.push(`/${locale}/clients-list`) : router.push(`/${locale}`)}
    }
    handleDataParam()
  
    const fetchContractClientService = async (clientId: number,serviceId:number) =>{
      
      const result = await fetch(`/api/get-client-service-contract/?serviceId=${serviceId}&clientId=${clientId}&prestataireId=${1}`,{
        method: 'GET', // Garde votre méthode GET pour l'exemple
        headers: {
          'Content-Type': 'application/json',
        }
      })

      try {
        if (!result.ok) {
          setContextData({toast:{toastVariant:"error",toastMessage:result.statusText,showToast:true,time:new Date().getTime()}})
        }

        const response = await result.json();
        
        if (response.success && response.result) {
          handleResponse(response.result as clientServiceContractDB)
          sessionStorage.setItem('clientServiceContract_'+clientId+'-'+serviceId, JSON.stringify(response.result));
        } else {
          setContextData({toast:{toastVariant:"error",toastMessage:clientInfo?.clientLang ?? locale ? "Une erreur est survenue lors de la requête." : "An Error occurred during the request",showToast:true,time:new Date().getTime()}})
        }
      } catch (error) {
        console.log("Erreur",error)
      } finally{
        setLoader(false)
      }
    }

    const handleResponse = async(clientData:clientServiceContractDB)=>{
      
      //alert()
      const client = decodeClientServiceContract(clientData) as clientServiceContractDB
      //console.log("Client",client)           
      if(!client) return

      setInvoiceId(client.invoiceId)

      const addressCLient = client ? typeof(client.addressClient) === "string"  ? JSON.parse(client.addressClient) : client.addressClient : null
      setClientInfo({addressClient:addressCLient,invoiceCount:(client.invoiceCount ?? 0 + 1),clientUid:client.clientUid,clientLang:client.clientLang,clientNumber:client.clientNumber,clientStatus:client.clientStatus,clientType:client.clientType,clientId:client.clientId,fname:client.fname,lname:client.lname,saveDate:client.saveDate,modifDate:new Date(client.modifDate).getTime()})
      
      const serviceList = client?.services as serviceDb[];

      if (serviceList.length > 0) {
        
        const service = serviceList[0]
        
        const contractData = service.contract
        //console.log("contractData",service.contract)
        const clientAddress = typeof(client.addressClient) === "string" ? JSON.parse(client.addressClient) as clientAddress : client.addressClient ? client.addressClient : undefined
        
        setService(service);
        setSubTotalPrice(parseToFloat(contractData?.subTotalPrice ?? 0))
        setTaxPrice(parseToFloat(contractData?.taxPrice ?? 0))
        setTotalPrice(parseToFloat(contractData?.totalPrice ?? 0))
        setCurrency(clientAddress?.clientCountry?.currency ?? "USD")
        setLoader(false);

        setTaxRate(parseToInt(contractData?.taxPercent ?? 0))

        setInvoiceInfo({name:`${client?.fname} ${client?.lname}`,email:client?.email ?? "",date:new Date().getTime(),dueDate:new Date().getTime(),adresse:`${clientAddress?.street} ${clientAddress?.postalCode}, ${contractData?.addressClient?.city} ${clientAddress?.clientCountry?.name}`,invoiceCount:((client.invoiceCount ?? 0) + 1)})
        console.log("invoiceInfo",invoiceInfo,client.invoiceCount)
        if (contractData?.projectFonctionList) {
          setFeatures(Array.isArray(contractData.projectFonctionList) ? contractData.projectFonctionList : JSON.parse(contractData.projectFonctionList))
        }
      }
    }

    const handleData = async()=>{
      const cookie = await getCookie('userAuth')
      if(!clientId) {cookie ? router.push(`/${locale}/clients-list`) : router.push(`/${locale}`)}
      if(!clientId) return

      setServiceId(serviceId)

      const sessionloadedContractData = sessionStorage.getItem('clientServiceContract_'+clientId+'-'+serviceId);
      
      if (sessionloadedContractData) {
        const clientParsed = JSON.parse(sessionloadedContractData) as clientServiceContractDB;
        handleResponse(clientParsed)
        setLoader(false)
      }else{
        fetchContractClientService(clientId,serviceId);
      }
    }
    handleData()
  }, [clientId,serviceId]);

  useEffect(()=>{
    const checkCookie = async ()=>{
      const cookie = await getCookie('userAuth')
      if(!cookie){
        router.push('/'+locale+'/login')
      }
    }
    checkCookie()
  },[locale])

  if (loader) return <div className="text-center py-8 mt-[6.875rem] h-[12.5rem] flex justify-center items-center w-[85%] mx-auto">Chargement...</div>;
  
  //console.log("loader",loader)

  if(!service) {router.push(`/${locale}/clients-list`)}

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
                  value={invoiceInfo.invoiceCount}
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
                    Prix Unitaire ({currency})
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total ({currency})
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {features.map((feature,index) => (
                  <tr key={feature.id+""+index}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="text"
                        className="block px-[.95rem] py-[.525rem] text-[.775rem] w-full rounded-[.4rem] bg-gray-100 focus:outline-gray-200"
                        value={feature.description}
                        onChange={(e) =>
                          updateFeature(index, 'description', e.target.value)
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
                          updateFeature(index, 'quantity', parseInt(e.target.value) || 0)
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
                          updateFeature(index, 'price', parseFloat(e.target.value) || 0)
                        }
                        required
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {(parseToInt(feature.quantity) * parseToInt(feature.price)).toFixed(2)} {currency}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => removeFeature(index)}
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

        <div className="flex justify-start items-start gap-3 mb-8 flex-wrap">
          <div className='w-full'>
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

          <div className='w-full'>
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
            <span>{subTotalPrice} {currency}</span>
          </div>
          {taxEnabled && (
            <div className="flex justify-between mb-2">
              <span className="font-medium">TVA ({taxRate}%):</span>
              <span>{taxPrice} {currency}</span>
            </div>
          )}
          {discount > 0 && (
            <div className="flex justify-between mb-2">
              <span className="font-medium">Remise ({discount}%):</span>
              <span>-{(taxPrice * (discount / 100)).toFixed(2)} ${currency}</span>
            </div>
          )}
          <div className="flex justify-between text-lg font-bold">
            <span>Total:</span>
            <span>{totalPrice} {currency}</span>
          </div>
        </div>
        <div className="flex items-center justify-end gap-4">
          <a href={'/'+locale+'/clients-list'} className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Liste client</a>
          <button disabled={!canSendBill() || loading ? true : false}
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