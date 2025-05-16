"use client"
import React, { useEffect, useRef, useState } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { CMYK, cmyk, PDFDocument, PDFFont, PDFImage, PDFPage, RGB, rgb, StandardFonts } from 'pdf-lib';
import { useTranslationContext } from '@/hooks/app-hook';

interface clientInfo {
  id?: string;
  name:string;
  email:string;
  address:string;
  contractType: "service"|"maintenance"|"service_and_maintenance";
  contractStatus: 'signed' | 'unsigned' | 'pending';
  dateCreation: Date;
  clientNumber:number;
  biilCount?:number;
}

interface invoiceInfo {
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
  clientInfo: clientInfo;
  invoiceInfo: invoiceInfo;
  features: features[];
  taxEnabled: boolean;
  taxRate: number;
  discount: number;
  invoiceItemDescription:string
};

interface InvoiceFormProps {
  locale:string
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
  start:{x:number,y:number},
  end:{x:number,y:number},
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

const InvoiceForm:React.FC<InvoiceFormProps> = ({locale}) =>{
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const t:any = useTranslationContext();
  const [clientInfo, setClientInfo] = useState<clientInfo>({
    name: '',
    email: '',
    address: '',
    clientNumber:1000,
    contractType: 'service',
    contractStatus: 'signed',
    dateCreation: new Date(),
  });

  const [invoiceInfo, setInvoiceInfo] = useState<invoiceInfo>({
    number: '',
    date: new Date().toISOString().split('T')[0],
    dueDate: '',
  });

  const [features, setFeatures] = useState<features[]>([]);

  const [taxEnabled, setTaxEnabled] = useState(false);
  const [taxRate, setTaxRate] = useState(20);
  const [discount, setDiscount] = useState(0);

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
        return Array.isArray(item) && item.length === 9 || item.length === 11;
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
    page.drawLine({
      start: start,
      end: end,
      thickness: thickness,
      color: color,
    });
    ref.current = end.y - afterMargin
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


  const generatePdf = async (data : FormValues,logoUrl:string ) => {
    if (!process.env.NEXT_PUBLIC_COMPANY_NAME || !process.env.NEXT_PUBLIC_COMPANY_STREET || !process.env.NEXT_PUBLIC_COMPANY_POSTAL_CODE || !process.env.NEXT_PUBLIC_COMPANY_CITY || !process.env.NEXT_PUBLIC_COMPANY_COUNTRY || !process.env.NEXT_PUBLIC_WEB_LINK) return 
    // Import necessary functions from pdf-lib
  
    // Création d'un nouveau document PDF
    const pdfDoc = await PDFDocument.create();
    let page = pdfDoc.addPage([595, 842]); // Standard A4 size, adjust if needed
  
    // Chargement des polices
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
    // Définition des couleurs (basé sur le PDF, supposant du bleu et du gris)
    // Ces couleurs sont des suppositions. Ajustez-les pour correspondre exactement au PDF.
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
    /*page.drawImage(logoImage, {
      x: margin,
      y: yPosition.current - 100, // Ajuster la position et la taille
      width: 100,
      height: 100,
    });*/
    
    let labelX = width - margin - 257.5;
    // Textes du logo si pas d'image
    let invoiceInfoX = width - margin - 257.5;
    const yPositionLeft = yPosition;
    const yPositionRigth = yPosition;
    const yClientInfoBox = (height - margin - 75 - 30) - 120 - margin;
    const clientInfoBoxY = {current : yClientInfoBox}
    // === Lignes de produits/services (Tableau) ===
    const tableTopY = yPosition.current;
    const tableWidth = width - margin * 2;
    const colX = tableWidth / 4
    const col1X = margin; //Description
    const col2X = col1X + colX; // Quantité
    const col3X = col2X + colX; // Prix unitaire
    const col4X = col3X + colX; // Prix Total
    const totalsXKey = width - margin - 150;
    const totalsXValue = width - margin - 70;
    const yColR = 50
    const yColT = 50
    const pdfContent:pdfContent = {
      1:{
        isConditional:false,
        params:[[margin,100,100,100,page,null,0,yPosition]]
      },
      2:{
        isConditional:false,
        params:[[labelX,45,20,helveticaBoldFont,process.env.NEXT_PUBLIC_COMPANY_NAME,page,greyColor,120,yPosition],[margin,0,11,helveticaBoldFont,t.invoice.Adress,page,blackColor,0,yPosition],[margin + calculateAccurateTextWidth(t.invoice.Adress, helveticaBoldFont, 11),0,10,helveticaFont,process.env.NEXT_PUBLIC_COMPANY_STREET,page,blackColor,18,yPosition],[margin,0,11,helveticaBoldFont,t.invoice.postalCode,page,blackColor,0,yPosition],[margin + calculateAccurateTextWidth(t.invoice.postalCode, helveticaBoldFont, 11),0,10,helveticaFont,process.env.NEXT_PUBLIC_COMPANY_POSTAL_CODE,page,blackColor,18,yPosition],[margin,0,11,helveticaBoldFont,t.invoice.city,page,blackColor,0,yPosition],[margin + calculateAccurateTextWidth(t.invoice.city, helveticaBoldFont, 11),0,10,helveticaFont,process.env.NEXT_PUBLIC_COMPANY_CITY,page,blackColor,18,yPosition],[margin,0,11,helveticaBoldFont,t.invoice.country,page,blackColor,0,yPosition],[margin + calculateAccurateTextWidth(t.invoice.country, helveticaBoldFont, 11),0,10,helveticaFont,process.env.NEXT_PUBLIC_COMPANY_COUNTRY,page,blackColor,18,yPosition],[margin,0,11,helveticaBoldFont,t.invoice.wsite,page,blackColor,0,yPosition],[margin + calculateAccurateTextWidth(t.invoice.wsite, helveticaBoldFont, 11),0,10,helveticaFont,process.env.NEXT_PUBLIC_WEB_LINK.replace("{locale}",locale),page,primaryColor,18,yPosition]]
      },
      3:{
        isConditional:false,
        params:[[invoiceInfoX,0,width / 2 - margin,100,primaryColor,page,0,yPositionLeft]]
      },
      4:{
        isConditional:false,
        params:[[invoiceInfoX + 20,-15,18,helveticaBoldFont,`${t.invoice.billNr} ${data.clientInfo.biilCount ? data.clientInfo.biilCount + 1 : 1}`,page,whiteColor,50,yPositionLeft],[invoiceInfoX,20,11,helveticaBoldFont,t.invoice.billDate,page,blackColor,0,yPositionLeft],[invoiceInfoX + calculateAccurateTextWidth(t.invoice.billDate, helveticaBoldFont, 11),20,10,helveticaFont,` ${data.invoiceInfo.date}`,page,blackColor,18,yPositionLeft],[invoiceInfoX,20,11,helveticaBoldFont,t.invoice.customerNr,page,blackColor,0,yPositionLeft],[invoiceInfoX + calculateAccurateTextWidth(t.invoice.customerNr, helveticaBoldFont, 11),20,10,helveticaFont,` ${data.clientInfo.clientNumber}`,page,blackColor,18,yPositionLeft]]
      },
      5:{
        isConditional:true,
        params:[[invoiceInfoX,20,11,helveticaBoldFont,t.invoice.dueDate,page,blackColor,0,yPositionLeft],[invoiceInfoX + calculateAccurateTextWidth(t.invoice.dueDate, helveticaBoldFont, 11),20,10,helveticaFont,` ${data.invoiceInfo.dueDate}`,page,blackColor,18,yPositionLeft]]
      },
      6:{
        isConditional:false,
        params:[[margin,0,14,helveticaBoldFont,t.invoice.billTo,page,blackColor,20,clientInfoBoxY],[margin,0,10,helveticaFont,`${data.clientInfo.name}`,page,blackColor,18,clientInfoBoxY],[margin,0,10,helveticaFont,data.clientInfo.address,page,blackColor,18,clientInfoBoxY],[margin,0,10,helveticaFont,data.clientInfo.email,page,blackColor,60,clientInfoBoxY]]
      },
      7:{
        isConditional:true,
        params:[[margin,0,10,helveticaFont,data.invoiceItemDescription ?? '',page,blackColor,30,yPosition,width - margin * 2,12,width,margin]]
      },
      8:{
        isConditional:false,
        params:[[margin,15,width - margin * 2,20,primaryColor,page,60,yPosition]]
      },
      9:{
        isConditional:false,
        params:[[col1X + 5,-50,10,helveticaBoldFont,t.invoice.features.description,page,whiteColor,0,yPosition],[col2X + 5,-50,10,helveticaBoldFont,t.invoice.features.quantity,page,whiteColor,0,yPosition],[col3X + 5,-50,10,helveticaBoldFont,t.invoice.features.singlePriceWithoutTax,page,whiteColor,0,yPosition],[col4X + 5,-50,10,helveticaBoldFont,t.invoice.features.totalPriceWithoutTax,page,whiteColor,30,yPosition]] 
      },
      10:{
        isConditional:true,
        params:[[margin,-yColR,width - margin * 2,20,cmyk(0,0,0,0.03),page,0,yPosition]]
      },
      11:{
        isConditional:true,
        params:[[margin,-yColR,width - margin * 2,20,whiteColor,page,0,yPosition]]
      },
      12:{
        isConditional:false,
        params:[[col1X + 5,-(yColT + 5),9,helveticaFont,"{description}",page,blackColor,0,yPosition],[col1X + colX + 5,-(yColT + 5),9,helveticaFont,"{quantity}",page,blackColor,0,yPosition],[col2X + colX + 5,-(yColT + 5),9,helveticaFont,"{price}",page,blackColor,0,yPosition],[col3X + colX + 5,-(yColT + 5),9,helveticaFont,"{lineTotal}",page,blackColor,38,yPosition]]
      },
      13:{
        isConditional:false,
        params:[[{ x: margin + (width - margin * 2) * 0.6, y: yPosition.current },{ x: width - margin, y: yPosition.current },0.5,greyColor,page,15,yPosition]]
      },
      14:{
        isConditional:true,
        params:[[totalsXKey,0,10,helveticaFont,t.invoice.subtotal,page,blackColor,0,yPosition],[totalsXValue,0,10,helveticaFont,'{subtotal}',page,blackColor,data.taxEnabled !== false && data.taxRate > 0 ? 20:25,yPosition]]
      },
      15:{
        isConditional:true,
        params:[[totalsXKey,0,10,helveticaFont,t.invoice.tax.replace("{tax}", data.taxRate.toString()),page,blackColor,0,yPosition],[totalsXValue,0,10,helveticaFont,'{tax}',page,blackColor,25,yPosition]]
      },
      16:{
        isConditional:true,
        params:[[totalsXKey,0,10,helveticaFont,t.invoice.discount.replace("{discount}", data.taxRate.toString()),page,blackColor,0,yPosition],[totalsXValue,0,10,helveticaFont,'{discount}',page,blackColor,18,yPosition]]
      },
      17:{
        isConditional:false,
        params:[[totalsXKey - 10,5,(width - margin) - (totalsXKey -10) ,22,primaryColor,page,0,yPosition]]
      },
      18:{
        isConditional:false,
        params:[[totalsXKey,0,11,helveticaBoldFont,t.invoice.totalWithTax,page,whiteColor,0,yPosition],[totalsXValue,0,11,helveticaBoldFont,'{total}',page,whiteColor,30,yPosition],[margin,0,13,helveticaFont,t.invoice.end1,page,blackColor,20,yPosition],[margin,0,13,helveticaFont,t.invoice.end2,page,blackColor,25,yPosition],[margin,0,8,helveticaFont,t.invoice.footer,page,blackColor,0,yPosition,width - margin * 2,12,width,margin]]
      }
    };

    const functionListAndRang = [
      {name:"addImg",count:1,id:1},
      {name:"addText",count:11,id:2},
      {name:"addRectangle",count:1,id:3},
      {name:"addText",count:5,id:4,changeRef:true},
      {name:"addText",count:2,id:5,isConditional:true,changeRef:true},
      {name:"addText",count:4,id:6,changeRef:true},
      {name:"addText",count:1,id:7,isConditional:true},
      {name:"addRectangle",count:1,id:8},
      {name:"addText",count:4,id:9},
      {name:"addRectangle",call:1,id:10,isConditional:true},
      {name:"addRectangle",call:1,id:11,isConditional:true},
      {name:"addText",call:4,id:12,isLoop:true},
      {name:"addLine",count:1,id:13},
      {name:"addText",call:2,id:14},
      {name:"addText",call:2,id:15,isConditional:true},
      /*{name:"addText",call:2,id:16,isConditional:true},
      {name:"addRectangle",count:1,id:17},
      {name:"addText",call:5,id:18}*/
    ];
    
    functionListAndRang.forEach((item,index)=>{
      if (item.count) {
        for (let index = 0; index < item.count; index++) {
          const params = pdfContent[item.id].params[index];
          switch (item.name) {
            case "addText":
              if (isDataAddText(params)) {
                if (item.isConditional && ((item.id === 5 && !data.invoiceInfo.dueDate) || (item.id === 7 && !data.invoiceItemDescription) || (item.id === 15 && !data.taxEnabled) || (item.id === 16 && !data.discount))) {

                }else{
                  if (item.id === 4 || item.id === 5) {
                    yPositionLeft.current = addNewText(params)
                  }else if(item.id === 6){
                    clientInfoBoxY.current = addNewText(params)
                    yPosition.current = clientInfoBoxY.current
                  }else{
                    yPosition.current = addNewText(params)
                    console.log("after added",yPosition.current)
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
              console.log("new param",params,"feature",feature)
              if (isDataAddText(params)) {
                yPosition.current = addNewText(params)
              }
            }
          })
        }else{
          if (item.isConditional) {
            if (data.discount > 0 && item.id === 16) {
              discountAmount = (subtotal + taxAmount) * (data.discount / 100);
              for (let index = 0; index < item.call; index++){
                const params = pdfContent[item.id].params[index];
                if (isDataAddText(params)) {
                  if (index === 1) {
                    params[4] = `${discountAmount.toFixed(2)} €`;
                  }
                  yPosition.current = addNewText(params)
                }
              }
            }
            if (data.taxEnabled !== false && data.taxRate > 0 && item.id === 15) {
              taxAmount = subtotal * (data.taxRate / 100);
              for (let index = 0; index < item.call; index++){
                const params = pdfContent[item.id].params[index];
                if (isDataAddText(params)) {
                  if (index === 1) {
                    params[4] = `${taxAmount.toFixed(2)} €`;
                  }
                  yPosition.current = addNewText(params)
                }
              }
            }
          }else{
            for (let index = 0; index < item.call; index++) {
              const params = pdfContent[item.id].params[index];
              if (isDataAddText(params)) {
                if (index === 1) {
                  const total = subtotal + taxAmount - discountAmount;
                  params[4] = `${total.toFixed(2)} €`;
                }
                yPosition.current = addNewText(params)
              }
            }
          }
        }
      }
    })

    /*page.drawText(process.env.NEXT_PUBLIC_COMPANY_NAME, {
      x: labelX,
      y: yPosition.current - 45,
      size: 20,
      font: helveticaBoldFont,
      color: greyColor, // Couleur exemple
    });
    yPosition.current -= 120; // Ajuster en fonction de la hauteur du logo
  
  
    // Informations de l'entreprise (colonne de gauche)
    let companyInfoX = margin;
    page.drawText(t.invoice.Adress, {
      x: companyInfoX,
      y: yPosition.current,
      size: 11,
      font: helveticaBoldFont,
      color: blackColor,
    });
    page.drawText(" " +process.env.NEXT_PUBLIC_COMPANY_STREET, {
      x: companyInfoX + calculateAccurateTextWidth(t.invoice.Adress, helveticaBoldFont, 11),
      y: yPosition.current,
      size: 10,
      font: helveticaFont,
      color: blackColor,
    });
    yPosition.current -= 18;
    page.drawText(t.invoice.postalCode, {
      x: companyInfoX,
      y: yPosition.current,
      size: 11,
      font: helveticaBoldFont,
      color: blackColor,
    });
    page.drawText(" "+process.env.NEXT_PUBLIC_COMPANY_POSTAL_CODE, {
      x: companyInfoX + calculateAccurateTextWidth(t.invoice.postalCode, helveticaBoldFont, 11),
      y: yPosition.current,
      size: 10,
      font: helveticaFont,
      color: blackColor,
    });
    yPosition.current -= 18;
    page.drawText(t.invoice.city, {
      x: companyInfoX,
      y: yPosition.current,
      size: 11,
      font: helveticaBoldFont,
      color: blackColor,
    });
    page.drawText(" "+process.env.NEXT_PUBLIC_COMPANY_CITY, {
      x: companyInfoX + calculateAccurateTextWidth(t.invoice.city, helveticaBoldFont, 11),
      y: yPosition.current,
      size: 10,
      font: helveticaFont,
      color: blackColor,
    });
    yPosition.current -= 18;
    page.drawText(t.invoice.country, {
      x: companyInfoX,
      y: yPosition.current,
      size: 11,
      font: helveticaBoldFont,
      color: blackColor,
    });
    page.drawText(" " +process.env.NEXT_PUBLIC_COMPANY_COUNTRY, {
      x: companyInfoX + calculateAccurateTextWidth(t.invoice.country, helveticaBoldFont, 11),
      y: yPosition.current,
      size: 10,
      font: helveticaFont,
      color: blackColor,
    });
    yPosition.current -= 18;
    page.drawText(t.invoice.wsite, {
      x: companyInfoX,
      y: yPosition.current,
      size: 11,
      font: helveticaBoldFont,
      color: blackColor, // Lien souvent en couleur
    });
    page.drawText(process.env.NEXT_PUBLIC_WEB_LINK.replace("{locale}",locale), {
      x: companyInfoX + calculateAccurateTextWidth(t.invoice.wsite, helveticaBoldFont, 11),
      y: yPosition.current,
      size: 10,
      font: helveticaFont,
      color: primaryColor, // Lien souvent en couleur
    });
    
    page.drawRectangle({
      x: invoiceInfoX,
      y: yPositionLeft.current - 15,
      width: width / 2 - margin,
      height: 100,
      color: primaryColor, // Couleur de fond pour l'en-tête
    });
  
    page.drawText(`${t.invoice.billNr} ${data.clientInfo.biilCount ? data.clientInfo.biilCount + 1 : 1}`, { // Traduit de "RECHNUNG"
      x: invoiceInfoX + 20,
      y: yPositionLeft.current, // Un peu plus haut
      size: 18,
      font: helveticaBoldFont,
      color: whiteColor,
    });
    yPositionLeft.current -= 30;
  
    yPositionLeft.current = clientInfoBoxY.current - 20;

    page.drawText(t.invoice.billDate, {
      x: invoiceInfoX,
      y: yPositionLeft.current,
      size: 11,
      font: helveticaBoldFont,
    });
    page.drawText(` ${data.invoiceInfo.date}`, {
      x: invoiceInfoX + calculateAccurateTextWidth(t.invoice.billDate, helveticaBoldFont, 11),
      y: yPositionLeft.current,
      size: 10,
      font: helveticaFont,
    });
    yPositionLeft.current -= 18;
    page.drawText(t.invoice.customerNr, {
      x: invoiceInfoX,
      y: yPositionLeft.current,
      size: 11,
      font: helveticaBoldFont,
    });
    page.drawText(` ${data.clientInfo.clientNumber}`, {
      x: invoiceInfoX + calculateAccurateTextWidth(t.invoice.customerNr, helveticaBoldFont, 11),
      y: yPositionLeft.current,
      size: 10,
      font: helveticaFont,
    });
    yPositionLeft.current -= 18;
    if (data.invoiceInfo.dueDate) {
      page.drawText(t.invoice.dueDate, {
        x: invoiceInfoX,
        y: yPositionLeft.current,
        size: 11,
        font: helveticaBoldFont,
      });
      page.drawText(` ${data.invoiceInfo.dueDate}`, {
        x: invoiceInfoX + calculateAccurateTextWidth(t.invoice.dueDate, helveticaBoldFont, 11),
        y: yPositionLeft.current,
        size: 10,
        font: helveticaFont,
      });
      yPositionLeft.current -= 18;
    }
  
    page.drawText(t.invoice.billTo, { // Plus formel
      x: margin,
      y: clientInfoBoxY.current,
      size: 14,
      font: helveticaBoldFont,
      color: blackColor,
    });
    clientInfoBoxY.current -= 20;
  
    page.drawText(`${data.clientInfo.name}`, {
      x: margin,
      y: clientInfoBoxY.current,
      size: 10,
      font: helveticaFont,
    });
    clientInfoBoxY.current -= 18;
  
    page.drawText(data.clientInfo.address, {
      x: margin,
      y: clientInfoBoxY.current,
      size: 10,
      font: helveticaFont,
    });
    clientInfoBoxY.current -= 18;
  
    page.drawText(data.clientInfo.email, {
      x: margin,
      y: clientInfoBoxY.current,
      size: 10,
      font: helveticaFont,
    });
    yPosition.current = clientInfoBoxY.current - 60;
  
  
    // Description générale de l'article (si présente dans le PDF)
    if (data.invoiceItemDescription) {
      page.drawText(data.invoiceItemDescription, {
          x: margin,
          y: yPosition.current,
          size: 10,
          font: helveticaFont,
          color: blackColor,
          maxWidth: width - margin * 2,
          lineHeight: 12
      });
      yPosition.current -= 30;
    }
    
  
    // En-tête du tableau
    const tableHeaderY = yPosition.current;
    page.drawRectangle({
      x: margin,
      y: tableHeaderY - 15,
      width: width - margin * 2,
      height: 20,
      color: primaryColor, // Couleur de fond pour l'en-tête
    });
  
    page.drawText(t.invoice.features.description, { x: col1X + 5, y: tableHeaderY - 10, size: 10, font: helveticaBoldFont, color: whiteColor });
    page.drawText(t.invoice.features.quantity, { x: col2X + 5, y: tableHeaderY - 10, size: 10, font: helveticaBoldFont, color: whiteColor });
    page.drawText(t.invoice.features.singlePriceWithoutTax, { x: col3X + 5, y: tableHeaderY - 10, size: 10, font: helveticaBoldFont, color: whiteColor });
    page.drawText(t.invoice.features.totalPriceWithoutTax, { x: col4X + 5, y: tableHeaderY - 10, size: 10, font: helveticaBoldFont, color: whiteColor });
    yPosition.current -= 30; // Espace après l'en-tête
  
    // Lignes de produits
    let subtotal = 0;
    data.features.forEach((feature:features, index) => {
      const lineTotal = feature.quantity * feature.price;
      subtotal += lineTotal;
      const itemY = yPosition.current;
  
      // Alternating row colors (optional)
      if (index % 2 !== 0) {
        page.drawRectangle({
          x: margin,
          y: itemY - 20,
          width: width - margin * 2,
          height: 20,
          color: cmyk(0,0,0,0.03) // Very light grey
        });
      }else{
        page.drawRectangle({
          x: margin,
          y: itemY - 20,
          width: width - margin * 2,
          height: 20,
          color: whiteColor // Very light grey
        });
      }
  
      page.drawText(feature.description, {
        x: col1X + 5,
        y: itemY - 12,
        size: 9,
        font: helveticaFont
      });
      page.drawText(feature.quantity.toString(), {
        x: col1X + colX + 5,
        y: itemY - 12,
        size: 9,
        font: helveticaFont
      });
      page.drawText(feature.price.toFixed(2) + " €", {
        x: col2X + colX + 5,
        y: itemY - 12,
        size: 9,
        font: helveticaFont,
      });
      page.drawText(lineTotal.toFixed(2) + " €", {
        x: col3X + colX + 5,
        y: itemY - 12,
        size: 9,
        font: helveticaFont,
      });
      yPosition.current -= 18; // Hauteur de ligne
    });
    
    yPosition.current = yPosition.current - 20;

    // Ligne de séparation avant les totaux
    page.drawLine({
      start: { x: margin + (width - margin * 2) * 0.6, y: yPosition.current },
      end: { x: width - margin, y: yPosition.current },
      thickness: 0.5,
      color: greyColor,
    });
    yPosition.current -= 5;
  
  
    // === Totaux ===
    yPosition.current -= 10; // Espace avant les totaux
    //const totalsXKey = width - margin - 150;
    //const totalsXValue = width - margin - 70;
  
    page.drawText(t.invoice.subtotal, {
      x: totalsXKey,
      y: yPosition.current,
      size: 10,
      font: helveticaFont,
    });
    page.drawText(`${subtotal.toFixed(2)} €`, {
      x: totalsXValue,
      y: yPosition.current,
      size: 10,
      font: helveticaFont,
    });
  
    let taxAmount = 0;
    if (data.taxEnabled !== false && data.taxRate > 0) { // default to tax enabled if not specified
      yPosition.current -= 20;
      taxAmount = subtotal * (data.taxRate / 100);
      page.drawText(t.invoice.tax.replace("{tax}", data.taxRate.toString()), {
        x: totalsXKey,
        y: yPosition.current,
        size: 10,
        font: helveticaFont,
      });
      page.drawText(`${taxAmount.toFixed(2)} €`, {
        x: totalsXValue,
        y: yPosition.current,
        size: 10,
        font: helveticaFont,
      });
      yPosition.current -= 25;
    }else{
      yPosition.current -= 25;
    }
  
    let discountAmount = 0;
    if (data.discount > 0) {
      discountAmount = (subtotal + taxAmount) * (data.discount / 100); // Discount on total with tax
      page.drawText(t.invoice.discount.replace("{discount}", data.discount.toString()), {
        x: totalsXKey,
        y: yPosition.current,
        size: 10,
        font: helveticaFont,
      });
      page.drawText(`-${discountAmount.toFixed(2)} €`, {
        x: totalsXValue,
        y: yPosition.current,
        size: 10,
        font: helveticaFont,
      });
      yPosition.current -= 18;
    }
  
    const total = subtotal + taxAmount - discountAmount;
    page.drawRectangle({
      x: totalsXKey - 10,
      y: yPosition.current -5,
      width: (width - margin) - (totalsXKey -10) ,
      height: 22,
      color: primaryColor,
    });
    page.drawText(t.invoice.totalWithTax, {
      x: totalsXKey,
      y: yPosition.current,
      size: 11,
      font: helveticaBoldFont,
      color: whiteColor
    });
    page.drawText(`${total.toFixed(2)} €`, {
      x: totalsXValue,
      y: yPosition.current,
      size: 11,
      font: helveticaBoldFont,
      color: whiteColor
    });
    yPosition.current -= 30;
  
    page.drawText(t.invoice.end1, { // Traduit de "Guter Empfang"
      x: margin,
      y: yPosition.current,
      size: 13,
      font: helveticaFont,
    });
    yPosition.current -= 20;
    page.drawText(t.invoice.end2, { // Traduit de "Mit freundlichen Grüßen"
      x: margin,
      y: yPosition.current,
      size: 13,
      font: helveticaFont,
    });
    yPosition.current -= 25;*/
    
    if (yPosition.current < margin + 30) { // Add new page if not enough space
      page = pdfDoc.addPage([595, 842]);
      yPosition.current = height - margin;
    }

    /*const footY = margin + 30;
    

    page.drawText(t.invoice.footer, { // Traduit de "Mit freundlichen Grüßen"
      x: margin,
      y: footY,
      size: 8,
      font: helveticaFont,
      color: rgb(0.3, 0.3, 0.3),
      maxWidth: width - margin * 2,
      lineHeight: 12
    });*/
  
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
    return URL.createObjectURL(blob);
    // saveAs(blob, `facture-${data.invoiceInfo.number || 'sample'}.pdf`); // Consider using file-saver library if in browser
  };
  
  // Définition d'un exemple de structure FormValues pour correspondre au PDF et à la fonction
  // Vous devrez adapter cela à la façon dont vous récupérez réellement vos données.
  /*
  const exampleFormValues = {
    companyInfo: {
      name: "Lov Sid", // Optionnel, car codé en dur aussi
      tagline: "LOVE BY MY SIDE", // Optionnel
      address: "123 rue Saint Sébastien",
      postalCode: "78300",
      city: "Poissy",
      country: "France",
      phone: "+33751025598",
      website: "https//:lovsid.com/de/home"
    },
    invoiceInfo: {
      number: "7",
      date: "28/11/2024",
      dueDate: "12/12/2024", // Exemple de date d'échéance
      customerNumber: "_LdNM4i_8n5Z3K8V"
    },
    clientInfo: {
      firstName: "Ellie",
      lastName: "Ostervald",
      email: "Suzon_Gonzalez@hotmail.fr",
      address: "456 Avenue des Champs, 75008 Paris" // Exemple d'adresse client
    },
    invoiceItemDescription: "Abonnement Premium à la plateforme LovSid valable du 28/11/2024 au 28/12/2024.", // Traduit
    features: [
      { description: "Abonnement mensuel (période du 28/11/2024 au 28/12/2024)", quantity: 1, price: 22.00 }
      // Ajoutez d'autres articles ici si nécessaire
    ],
    taxEnabled: true, // Activer la TVA
    taxRate: 20, // Taux de TVA standard en France (exemple)
    discount: 0, // Pas de remise dans cet exemple
    paymentInfo: {
      transactionNumber: "ch_3QQ65sCTVwiSYkOa0WMEETJ7",
      paymentChannel: "Stripe"
    }
  };
  
  // Pour tester (dans un environnement navigateur avec la librairie pdf-lib chargée)
  // generatePdf(exampleFormValues).then(url => {
  //   console.log("PDF généré:", url);
  //   const link = document.createElement('a');
  //   link.href = url;
  //   link.download = `facture-${exampleFormValues.invoiceInfo.number}.pdf`;
  //   document.body.appendChild(link);
  //   link.click();
  //   document.body.removeChild(link);
  //   URL.revokeObjectURL(url); // Libérer l'objet URL
  // }).catch(err => console.error("Erreur lors de la génération du PDF:", err));
  
  */
  const handleSubmit = async(e: React.FormEvent) => {
    e.preventDefault();
    // Ici vous pourriez envoyer les données à une API ou générer un PDF
    const data = {clientInfo,invoiceInfo,features,taxEnabled,taxRate,discount} as FormValues
    const logoUrl = `${process.env.NEXT_PUBLIC_ROOT_LINK}/assets/images/logo.png`
    const pdfUrl = await generatePdf(data,logoUrl)
    if (pdfUrl) {
      window.open(pdfUrl, '_blank')
        //setPdfUrl(pdfUrl)
    }
    console.log({
      clientInfo,
      invoiceInfo,
      features,
      taxEnabled,
      taxRate,
      discount,
      total: calculateTotal(),
    });
  };
  
  const canSendBill = () => {
    return (
      clientInfo.name &&
      clientInfo.email &&
      clientInfo.address &&
      invoiceInfo.number &&
      invoiceInfo.date &&
      invoiceInfo.dueDate &&
      features.length > 0
    );
  };

  if(!Cookies.get('logged')){
    router.push('/'+locale+'/login')
  }
  if (loading) return <div className="text-center py-8 mt-[110px] h-[200px] flex justify-center items-center w-[85%] mx-auto">Chargement...</div>;
  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md mt-[110px] w-[85%]">
      <h1 className="text-2xl font-bold text-primary mb-6">Facturation pour le client ...</h1>
      
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
                  value={clientInfo.name}
                  onChange={(e) =>
                    setClientInfo({ ...clientInfo, name: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  className="mt-1 block px-[.95rem] py-[.525rem] text-[.775rem] w-full rounded-[.4rem] bg-gray-100 focus:outline-gray-200"
                  value={clientInfo.email}
                  onChange={(e) =>
                    setClientInfo({ ...clientInfo, email: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Adresse</label>
                <textarea
                  className="mt-1 block px-[.95rem] py-[.525rem] text-[.775rem] w-full rounded-[.4rem] bg-gray-100 focus:outline-gray-200"
                  rows={3}
                  value={clientInfo.address}
                  onChange={(e) =>
                    setClientInfo({ ...clientInfo, address: e.target.value })
                  }
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
                  onChange={(e) =>
                    setInvoiceInfo({ ...invoiceInfo, number: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Date</label>
                <input
                  type="date"
                  className="mt-1 block px-[.95rem] py-[.525rem] text-[.775rem] w-full rounded-[.4rem] bg-gray-100 focus:outline-gray-200"
                  value={invoiceInfo.date}
                  onChange={(e) =>
                    setInvoiceInfo({ ...invoiceInfo, date: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Date d'échéance</label>
                <input
                  type="date"
                  className="mt-1 block px-[.95rem] py-[.525rem] text-[.775rem] w-full rounded-[.4rem] bg-gray-100 focus:outline-gray-200"
                  value={invoiceInfo.dueDate}
                  onChange={(e) =>
                    setInvoiceInfo({ ...invoiceInfo, dueDate: e.target.value })
                  }
                  required
                />
              </div>
            </div>
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
                        type="number"
                        min="1"
                        className="block px-[.95rem] py-[.525rem] text-[.775rem] w-full rounded-[.4rem] bg-gray-100 focus:outline-gray-200"
                        value={feature.quantity}
                        onChange={(e) =>
                          updateFeature(feature.id, 'quantity', parseInt(e.target.value) || 0)
                        }
                        required
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        className="block px-[.95rem] py-[.525rem] text-[.775rem] w-full rounded-[.4rem] bg-gray-100 focus:outline-gray-200"
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
                onChange={(e) => setTaxEnabled(e.target.checked)}
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
          <button disabled={!canSendBill()}
            type="submit"
            className={`inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
              loading || !canSendBill() ? 'cursor-not-allowed opacity-50' : 'cursor-pointer opacity-1'
            }`}
          >
            Générer la facture
          </button>
        </div>
      </form>
    </div>
  );
}

export default InvoiceForm;