"use client"
import { useTranslationContext } from '@/hooks/app-hook';
import React, { useEffect } from 'react';
import { PDFDocument, PDFFont, PDFPage, RGB, rgb, StandardFonts } from "pdf-lib";

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
    name: string;
    contractType: "service"|"maintenance"|"service_and_maintenance";
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
    freelancerName:string;
    freelancerSirets?:string;
    freelanceAddress:string;
    projectTitle:string;
    projectDescription:string;
    projectFonctionList:string[];
    startDate:string;
    endDate?:string;
    contractType: "service"|"maintenance"|"service_and_maintenance";
    maintenanceType:"app"|"saas"|"web"|null;
    maintenaceOptionPayment?:"perYear"|"perHour"
    totalPrice:number;
    paymentSchedule:string;
    contractLanguage:string;
}


interface GeneredContractProps {
  client:Client|null;
  data:Contract|null;
  signingLink:string|null;
  locale:string
}


const GeneratePdfContract:React.FC<GeneredContractProps> = ({client,data,signingLink,locale}) => {
    if (client === null || data === null || signingLink === null) return
    const t:any = useTranslationContext();
    const [pdfUrl,setPdfUrl] = React.useState<string>('');
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
        {name:"addText",count:11,id:29},
        {name:"addHorizontalText",count:1,id:30},
        {name:"addText",count:43,id:31},
        {name:"signatureBloc",count:2,id:32}
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
        return Array.isArray(item) && item.length === 15;
    };

    const formatDate = (date:string)=>{
        const fdate = new Date(date)
        const day = fdate.getDate();
        const month = fdate.getMonth() + 1; // Les mois commencent à 0
        const year = fdate.getFullYear();
        if (locale === "en") {
            return `${year}/${String(month).padStart(2, '0')}/${String(day).padStart(2, '0')}`;
        }
        return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
    }

    const handlePdf = async(client:Client,data:Contract)=>{
        //if(!signingLink) return
        console.log("client info",client)
        const content = {
            title: data.contractType === 'service' ? t.contract.header.tittleService + data.projectTitle : data.contractType === 'maintenance' ? t.contract.header.tittleMaintenance + data.projectTitle : t.contract.header.tittleServiceMaintenance + data.projectTitle,
            sousTitle: t.contract.header.subTitle,
            clientName: `${data.name}`,
            freelanceName: `${data.freelancerName}`,
            preambleAdresseClient:`${t.contract.header.home} ${data.clientAddress} ${t.contract.header.designation}`,
            from:t.contract.header.from,
            preambleAdresseFreelance:`${t.contract.header.home} ${data.freelanceAddress} ${t.contract.header.designation}`,
            to:t.contract.header.to,
            and:t.contract.header.and
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
                    param:[[t.contract.header.parties, margin, yRef.current,margin,40, {...addTextOption,fontBold:fontBoldItalic,isBold:true,size:9},...lastParam],[t.contract.sections["1"].title, margin, yRef.current,margin,15,{...addTextOption,isBold:true,size:16},...lastParam]]
                },
                6:{
                    id:6,
                    param:[[[{text:t.contract.sections["1"].paraDef,size:12,isBold:true,color:rgb(0, 0, 0)},{text:t.contract.sections["1"].para1,size:11,isBold:false,color:rgb(0, 0, 0)}],margin,yRef.current,false,margin,10,fontRegular,fontBold,textHorizontalOption,...lastParam],[[{text:t.contract.sections["1"].paraDef,size:12,isBold:true,color:rgb(0, 0, 0)},{text:t.contract.sections["1"].para2,size:11,isBold:false,color:rgb(0, 0, 0)}],margin,yRef.current,false,margin,10,fontRegular,fontBold,textHorizontalOption,...lastParam],[[{text:t.contract.sections["1"].paraDef,size:12,isBold:true,color:rgb(0, 0, 0)},{text:t.contract.sections["1"].para3,size:11,isBold:false,color:rgb(0, 0, 0)}],margin,yRef.current,false,margin,10,fontRegular,fontBold,textHorizontalOption,...lastParam]]
                },
                7:{
                    id:7,
                    param:[[t.contract.sections["1"].para, margin, yRef.current,margin,40, {...addTextOption,size:12,isBold:true},...lastParam],[t.contract.sections["2"].title, margin, yRef.current,margin,15, {...addTextOption,size:16,isBold:true},...lastParam],[t.contract.sections["2"].sec1.title, margin, yRef.current,margin,10, {...addTextOption,size:13},...lastParam],[t.contract.sections["2"].sec1.para, margin, yRef.current,margin,15, addTextOption,...lastParam],[t.contract.sections["2"].sec2.title, margin, yRef.current,margin,15, {...addTextOption,size:13},...lastParam],[t.contract.sections["2"].sec2.para, margin, yRef.current,margin,40, addTextOption,...lastParam],[t.contract.sections["3"].title, margin, yRef.current,margin,15, {...addTextOption,size:16,isBold:true},...lastParam],[t.contract.sections["3"].sec1.title, margin, yRef.current,margin,10, {...addTextOption,size:13},...lastParam],[data.projectDescription, margin, yRef.current,margin,15, addTextOption,...lastParam],[t.contract.sections["3"].sec2.title, margin, yRef.current,margin,10, {...addTextOption,size:13},...lastParam]]
                },
                8:{
                    id:8,
                    param:[['{item}', margin+30, yRef.current,margin,8, {...addTextOption,isListItem:true},...lastParam]]
                },
                9:{
                    id:9,
                    param:[[t.contract.sections["3"].sec3.title, margin, yRef.current,margin,10, {...addTextOption,size:13},...lastParam],[data.contractType === 'service' ? t.contract.sections["3"].sec3.paraService : data.contractType === 'maintenance' ? t.contract.sections["3"].sec3.serviceMaintenance : t.contract.sections["3"].sec3.paraServiceMaintenance, margin, yRef.current,margin,15, addTextOption,...lastParam],[data.contractType === 'service' ? t.contract.sections["3"].sec4.titleService : data.contractType === 'maintenance' ? t.contract.sections["3"].sec4.titleMaintenance : t.contract.sections["3"].sec4.titleServiceMaintenance, margin, yRef.current,margin,10, {...addTextOption,size:13},...lastParam],[data.contractType === 'service' ? t.contract.sections["3"].sec4.paraService : data.contractType === 'maintenance' ? data.maintenaceOptionPayment === 'perHour' ? t.contract.sections["3"].sec4.paraMaintenance.peerHour : t.contract.sections["3"].sec4.paraMaintenance.perYear : `${t.contract.sections["3"].sec4.paraServiceMaintenance.para} ${
                    data.maintenaceOptionPayment === 'perHour' ? t.contract.sections["3"].sec4.paraServiceMaintenance.peerHour : t.contract.sections["3"].sec4.paraServiceMaintenance.perYear} ${t.contract.sections["3"].sec4.paraServiceMaintenance.para1}`
                    ,margin, yRef.current,margin,40, addTextOption,...lastParam],[t.contract.sections["4"].title, margin, yRef.current,margin,15, {...addTextOption,size:16,isBold:true},...lastParam],[t.contract.sections["4"].sec1.title, margin, yRef.current,margin,10, {...addTextOption,size:13},...lastParam],[t.contract.sections["4"].sec1.para, margin, yRef.current,margin,15, addTextOption,...lastParam],[t.contract.sections["4"].sec2.title, margin, yRef.current,margin,10, {...addTextOption,size:13},...lastParam],[t.contract.sections["4"].sec2.para, margin, yRef.current,margin,10, addTextOption,...lastParam],[t.contract.sections["4"].sec2.paraClose, margin, yRef.current,margin,40, {...addTextOption,size:9,isBold:true},...lastParam],[t.contract.sections["5"].title, margin, yRef.current,margin,15, {...addTextOption,size:16,isBold:true},...lastParam],[t.contract.sections["5"].sec1.title, margin, yRef.current,margin,10, {...addTextOption,size:13},...lastParam],[t.contract.sections["5"].sec1.para, margin, yRef.current,margin,15, addTextOption,...lastParam],[t.contract.sections["5"].sec2.title, margin, yRef.current,margin,10, {...addTextOption,size:13},...lastParam],[t.contract.sections["5"].sec2.para1, margin, yRef.current,margin,10, addTextOption,...lastParam],[t.contract.sections["5"].sec2.para2, margin, yRef.current,margin,15, addTextOption,...lastParam],[t.contract.sections["5"].sec3.title, margin, yRef.current,margin,10, {...addTextOption,size:13},...lastParam],[t.contract.sections["5"].sec3.para, margin, yRef.current,margin,20, addTextOption,...lastParam],[t.contract.sections["5"].sec3.paraA, margin, yRef.current,margin,8, addTextOption,...lastParam]]
                },
                10:{
                    id:10,
                    param:[[[{text:t.contract.sections["5"].sec3.paraB1,size:11,isBold:false},{text:t.contract.sections["5"].sec3.paraB2,size:11,isBold:true}],margin,yRef.current,false,margin,8,fontRegular,fontBold,
                    textHorizontalOption,...lastParam]]
                },
                11:{
                    id:11,
                    param:[[t.contract.sections["5"].sec3.paraC, margin, yRef.current,margin,8, addTextOption,...lastParam],[t.contract.sections["5"].sec3.paraD, margin, yRef.current,margin,8, addTextOption,...lastParam],[t.contract.sections["5"].sec3.paraE, margin, yRef.current,margin,8, addTextOption,...lastParam],[t.contract.sections["5"].sec3.paraF, margin, yRef.current,margin,8, addTextOption,...lastParam],[t.contract.sections["5"].sec3.paraG, margin, yRef.current,margin,8, {...addTextOption,size:11,isBold:true},...lastParam]]
                },
                12:{
                    id:12,
                    param:[[[{text:t.contract.sections["5"].sec3.paraH1,size:11,isBold:false},{text:t.contract.sections["5"].sec3.paraH2,size:11,isBold:true}],margin,yRef.current,false,margin,8,fontRegular,fontBold,textHorizontalOption,...lastParam]]
                },
                13:{
                    id:13,
                    param:[[t.contract.sections["5"].sec3.paraI, margin, yRef.current,margin,8, addTextOption,...lastParam],[t.contract.sections["5"].sec3.paraJ, margin, yRef.current,margin,15, addTextOption,...lastParam],[t.contract.sections["5"].sec4.title, margin, yRef.current,margin,10, {...addTextOption,size:13},...lastParam],[t.contract.sections["5"].sec4.para, margin, yRef.current,margin,20, {...addTextOption,size:13},...lastParam],[t.contract.sections["5"].sec4.paraA, margin, yRef.current,margin,8, addTextOption,...lastParam]]
                },
                14:{
                    id:14,
                    param:[[[{text:t.contract.sections["5"].sec4.paraB1,size:11,isBold:false},{text:t.contract.sections["5"].sec4.paraB2,size:11,isBold:true}],margin,yRef.current,false,margin,8,fontRegular,fontBold,textHorizontalOption,...lastParam]]
                },
                15:{
                    id:15,
                    param:[[t.contract.sections["5"].sec4.paraC, margin, yRef.current,margin,15, addTextOption,...lastParam],[t.contract.sections["5"].sec5.title, margin, yRef.current,margin,10, {...addTextOption,size:13},...lastParam],[t.contract.sections["5"].sec5.para, margin, yRef.current,margin,15, addTextOption,...lastParam],[t.contract.sections["5"].sec6.title, margin, yRef.current,margin,10, {...addTextOption,size:13},...lastParam]]
                },
                16:{
                    id:16,
                    param:[[[{text:t.contract.sections["5"].sec6.para11,size:11,isBold:false},{text:t.contract.sections["5"].sec6.para12,size:11,isBold:true},{text:t.contract.sections["5"].sec6.para13,size:11,isBold:false}],margin,yRef.current,false,margin,15,fontRegular,fontBold,textHorizontalOption,...lastParam]]
                },
                17:{
                    id:17,
                    param:[[t.contract.sections["5"].sec7.title, margin, yRef.current,margin,10, {...addTextOption,size:13},...lastParam],[t.contract.sections["5"].sec7.para, margin, yRef.current,margin,15, addTextOption,...lastParam],[t.contract.sections["5"].sec8.title, margin, yRef.current,margin,10, {...addTextOption,size:13},...lastParam]]
                },
                18:{
                    id:18,
                    param:[[[{text:t.contract.sections["5"].sec8.para11,size:11,isBold:false},{text:t.contract.sections["5"].sec8.para12,size:11,isBold:true},{text:t.contract.sections["5"].sec8.para13,size:11,isBold:false}],margin,yRef.current,false,margin,15,fontRegular,fontBold,textHorizontalOption,...lastParam]]
                },
                19:{
                    id:19,
                    param:[[t.contract.sections["5"].sec9.title, margin, yRef.current,margin,10, {...addTextOption,size:13},...lastParam],[t.contract.sections["5"].sec9.para1, margin, yRef.current,margin,10, addTextOption,...lastParam],[t.contract.sections["5"].sec9.para2, margin, yRef.current,margin,10, addTextOption,...lastParam],[t.contract.sections["5"].sec9.para3, margin, yRef.current,margin,15, addTextOption,...lastParam],[t.contract.sections["5"].sec10.title, margin, yRef.current,margin,10, {...addTextOption,size:13},...lastParam],[t.contract.sections["5"].sec10.para1, margin, yRef.current,margin,20, addTextOption,...lastParam],[t.contract.sections["5"].sec10.paraA, margin, yRef.current,margin,8, addTextOption,...lastParam],[t.contract.sections["5"].sec10.paraB, margin, yRef.current,margin,8, addTextOption,...lastParam],[t.contract.sections["5"].sec10.paraC, margin, yRef.current,margin,15, addTextOption,...lastParam]]
                },
                20:{
                    id:20,
                    param:[[[{text:t.contract.sections["5"].sec10.para21,size:11,isBold:true},{text:t.contract.sections["5"].sec10.para22,size:11,isBold:false}],margin,yRef.current,false,margin,10,fontRegular,fontBold,textHorizontalOption,...lastParam]]
                },
                21:{
                    id:21,
                    param:[[t.contract.sections["5"].sec10.paraClose, margin, yRef.current,margin,15,{...addTextOption,isBold:true},...lastParam],[t.contract.sections["5"].sec11.title, margin, yRef.current,margin,10, {...addTextOption,size:13},...lastParam],[t.contract.sections["5"].sec11.para1, margin, yRef.current,margin,10, addTextOption,...lastParam],[t.contract.sections["5"].sec11.para2, margin, yRef.current,margin,10, addTextOption,...lastParam],[t.contract.sections["5"].sec11.para3, margin, yRef.current,margin,15, addTextOption,...lastParam],[t.contract.sections["5"].sec12.title, margin, yRef.current,margin,10, {...addTextOption,size:13},...lastParam],[t.contract.sections["5"].sec12.para, margin, yRef.current,margin,15, addTextOption,...lastParam],[t.contract.sections["5"].sec12.paraA, margin, yRef.current,margin,8, addTextOption,...lastParam],[t.contract.sections["5"].sec12.paraB, margin, yRef.current,margin,8, addTextOption,...lastParam],[t.contract.sections["5"].sec12.paraC, margin, yRef.current,margin,8, addTextOption,...lastParam],[t.contract.sections["5"].sec12.paraD, margin, yRef.current,margin,8, addTextOption,...lastParam],[t.contract.sections["5"].sec12.paraE, margin, yRef.current,margin,8, addTextOption,...lastParam],[t.contract.sections["5"].sec12.paraF, margin, yRef.current,margin,8, addTextOption,...lastParam],[t.contract.sections["5"].sec12.paraG, margin, yRef.current,margin,8, addTextOption,...lastParam],[t.contract.sections["5"].sec12.paraH, margin, yRef.current,margin,15, addTextOption,...lastParam],[t.contract.sections["5"].sec13.title, margin, yRef.current,margin,10, {...addTextOption,size:13},...lastParam],[t.contract.sections["5"].sec13.para, margin, yRef.current,margin,15, addTextOption,...lastParam],[t.contract.sections["5"].sec13.paraA, margin, yRef.current,margin,8, addTextOption,...lastParam],[t.contract.sections["5"].sec13.paraB, margin, yRef.current,margin,15, addTextOption,...lastParam],[t.contract.sections["5"].sec13.paraClose, margin, yRef.current,margin,10, {...addTextOption,lineHeight:lineHeight+3,size:11},...lastParam],[t.contract.sections["5"].sec14.title, margin, yRef.current,margin,10, {...addTextOption,size:13},...lastParam],[t.contract.sections["5"].sec14.para, margin, yRef.current,margin,15, addTextOption,...lastParam],[t.contract.sections["5"].sec14.paraA, margin, yRef.current,margin,8, addTextOption,...lastParam],[t.contract.sections["5"].sec14.paraB, margin, yRef.current,margin,8, addTextOption,...lastParam],[t.contract.sections["5"].sec14.paraC, margin, yRef.current,margin,8, addTextOption,...lastParam],[t.contract.sections["5"].sec14.paraD, margin, yRef.current,margin,8, addTextOption,...lastParam],[t.contract.sections["5"].sec14.paraE, margin, yRef.current,margin,15, addTextOption,...lastParam],[t.contract.sections["5"].sec14.paraClose, margin, yRef.current,margin,15, {...addTextOption,lineHeight:lineHeight+3,size:11},...lastParam],[t.contract.sections["5"].sec15.title, margin, yRef.current,margin,10, {...addTextOption,size:13},...lastParam]]
                },
                22:{
                    id:22,
                    param:[[[{text:t.contract.sections["5"].sec15.para11,size:11,isBold:false},{text:t.contract.sections["5"].sec15.para12,size:11,isBold:true},{text:t.contract.sections["5"].sec15.para13,size:11,isBold:false}],margin,yRef.current,false,margin,10,fontRegular,fontBold,textHorizontalOption,...lastParam]]
                },
                23:{
                    id:23,
                    param:[[t.contract.sections["5"].sec15.para4, margin, yRef.current,margin,15, addTextOption,...lastParam]]
                },
                24:{
                    id:24,
                    param:[[[{text:t.contract.sections["5"].sec15.item,size:11,isBold:true,color:rgb(0,0,0)},{text:"item",size:11,isBold:false,color:rgb(0,0,0)}],margin+30,yRef.current,true,margin,8,fontRegular,fontBold,textHorizontalOption,...lastParam]]
                },
                25:{
                    id:25,
                    param:[[t.contract.sections["5"].sec16.title, margin, yRef.current,margin,10, {...addTextOption,size:13},...lastParam]]
                },
                26:{
                    id:26,
                    param:[[[{text:t.contract.sections["5"].sec16.para11,size:11,isBold:false,color:rgb(0,0,0)},{text:t.contract.sections["5"].sec16.para12,size:11,isBold:true,color:rgb(0,0,0)},{text:t.contract.sections["5"].sec16.para13,size:11,isBold:false,color:rgb(0,0,0)}],margin,yRef.current,false,margin,15,fontRegular,fontBold,textHorizontalOption,...lastParam]]
                },
                27:{
                    id:27,
                    param:[[t.contract.sections["5"].sec17.title, margin, yRef.current,margin,10, {...addTextOption,size:13},...lastParam],[t.contract.sections["5"].sec17.para1, margin, yRef.current,margin,15, addTextOption,...lastParam],[t.contract.sections["5"].sec17.paraA, margin, yRef.current,margin,8, addTextOption,...lastParam],[t.contract.sections["5"].sec17.paraB, margin, yRef.current,margin,8, addTextOption,...lastParam],[t.contract.sections["5"].sec17.paraC, margin, yRef.current,margin,15, addTextOption,...lastParam],[t.contract.sections["5"].sec17.para2, margin, yRef.current,margin,10, addTextOption,...lastParam],[t.contract.sections["5"].sec17.paraClose, margin, yRef.current,margin,10, addTextOption,...lastParam],[t.contract.sections["5"].sec18.title, margin, yRef.current,margin,10, {...addTextOption,size:13},...lastParam],[t.contract.sections["5"].sec18.para1, margin, yRef.current,margin,8, addTextOption,...lastParam],[t.contract.sections["5"].sec18.para2, margin, yRef.current,margin,8, addTextOption,...lastParam]]
                },
                28:{
                    id:28,
                    param:[[[{text:`3)`,size:11,isBold:false,color:rgb(0,0,0)},{text:t.contract.sections["5"].sec18.para3,size:11,isBold:true,color:rgb(0,0,0)}],margin,yRef.current,false,margin,10,fontRegular,fontBold,textHorizontalOption,...lastParam]]
                },
                29:{
                    id:29,
                    param:[[t.contract.sections["5"].sec18.paraClose, margin, yRef.current,margin,15, addTextOption,...lastParam],[t.contract.sections["5"].sec19.title, margin, yRef.current,margin,10, {...addTextOption,size:13},...lastParam],[t.contract.sections["5"].sec19.para1, margin, yRef.current,margin,10, addTextOption,...lastParam],[t.contract.sections["5"].sec19.para2, margin, yRef.current,margin,10, addTextOption,...lastParam],[t.contract.sections["5"].sec19.para3, margin, yRef.current,margin,10, addTextOption,...lastParam],[t.contract.sections["5"].sec19.para4, margin, yRef.current,margin,40, addTextOption,...lastParam],[t.contract.sections["6"].title, margin, yRef.current,margin,15, {...addTextOption,isBold:true,size:16},...lastParam],[t.contract.sections["6"].para, margin, yRef.current,margin,20, addTextOption,...lastParam],[t.contract.sections["6"].sec1.title, margin, yRef.current,margin,10, {...addTextOption,size:13},...lastParam],[t.contract.sections["6"].sec1.para, margin, yRef.current,margin,15, addTextOption,...lastParam],[t.contract.sections["6"].sec2.title, margin, yRef.current,margin,10, {...addTextOption,size:13},...lastParam]]
                },
                30:{
                    id:30,
                    param:[[[{text:t.contract.sections["6"].sec2.para11,size:11,isBold:false,color:rgb(0,0,0)},{text:t.contract.sections["6"].sec2.para12,size:11,isBold:true,color:rgb(0,0,0)},{text:t.contract.sections["6"].sec2.para13,size:11,isBold:false,color:rgb(0,0,0)}],margin,yRef.current,false,margin,15,fontRegular,fontBold,textHorizontalOption,...lastParam]]
                },
                31:{
                    id:31,
                    param:[[t.contract.sections["6"].sec3.title, margin, yRef.current,margin,10, {...addTextOption,size:13},...lastParam],[t.contract.sections["6"].sec3.para, margin, yRef.current,margin,15, addTextOption,...lastParam],[t.contract.sections["6"].sec4.title, margin, yRef.current,margin,10, {...addTextOption,size:13},...lastParam],[t.contract.sections["6"].sec4.para, margin, yRef.current,margin,15, addTextOption,...lastParam],[t.contract.sections["6"].sec5.title, margin, yRef.current,margin,10, {...addTextOption,size:13},...lastParam],[t.contract.sections["6"].sec5.para, margin, yRef.current,margin,15, addTextOption,...lastParam],[t.contract.sections["6"].sec6.title, margin, yRef.current,margin,10, {...addTextOption,size:13},...lastParam],[t.contract.sections["6"].sec6.para, margin, yRef.current,margin,15, addTextOption,...lastParam],[t.contract.sections["6"].sec7.title, margin, yRef.current,margin,10, {...addTextOption,size:13},...lastParam],[t.contract.sections["6"].sec7.para, margin, yRef.current,margin,15, addTextOption,...lastParam],[t.contract.sections["6"].sec8.title, margin, yRef.current,margin,10, {...addTextOption,size:13},...lastParam],[t.contract.sections["6"].sec8.para, margin, yRef.current,margin,15, addTextOption,...lastParam],[t.contract.sections["6"].sec9.title, margin, yRef.current,margin,10, {...addTextOption,size:13},...lastParam],[t.contract.sections["6"].sec9.para, margin, yRef.current,margin,15, addTextOption,...lastParam],[t.contract.sections["6"].sec10.title, margin, yRef.current,margin,10, {...addTextOption,size:13},...lastParam],[t.contract.sections["6"].sec10.para, margin, yRef.current,margin,15, addTextOption,...lastParam],[t.contract.sections["6"].sec11.title, margin, yRef.current,margin,10, {...addTextOption,size:13},...lastParam],[t.contract.sections["6"].sec11.para, margin, yRef.current,margin,15, addTextOption,...lastParam],[t.contract.sections["6"].sec12.title, margin, yRef.current,margin,10, {...addTextOption,size:13},...lastParam],[t.contract.sections["6"].sec12.para, margin, yRef.current,margin,15, addTextOption,...lastParam],[t.contract.sections["6"].sec13.title, margin, yRef.current,margin,10, {...addTextOption,size:13},...lastParam],[t.contract.sections["6"].sec13.para, margin, yRef.current,margin,15, addTextOption,...lastParam],[t.contract.sections["6"].sec14.title, margin, yRef.current,margin,10, {...addTextOption,size:13},...lastParam],[t.contract.sections["6"].sec14.para, margin, yRef.current,margin,15, addTextOption,...lastParam],[t.contract.sections["6"].sec15.title, margin, yRef.current,margin,10, {...addTextOption,size:13},...lastParam],[t.contract.sections["6"].sec15.para, margin, yRef.current,margin,40, addTextOption,...lastParam],[t.contract.sections["7"].title, margin, yRef.current,margin,15, {...addTextOption,isBold:true,size:16},...lastParam],[t.contract.sections["7"].para, margin, yRef.current,margin,40, addTextOption,...lastParam],[t.contract.sections["8"].title, margin, yRef.current,margin,15, {...addTextOption,isBold:true,size:16},...lastParam],[t.contract.sections["8"].para, margin, yRef.current,margin,20, addTextOption,...lastParam],[t.contract.sections["8"].paraA, margin, yRef.current,margin,8, addTextOption,...lastParam],[t.contract.sections["8"].paraB, margin, yRef.current,margin,8, addTextOption,...lastParam],[t.contract.sections["8"].paraC, margin, yRef.current,margin,8, addTextOption,...lastParam],[t.contract.sections["8"].paraD, margin, yRef.current,margin,8, addTextOption,...lastParam],[t.contract.sections["8"].paraE, margin, yRef.current,margin,8, addTextOption,...lastParam],[t.contract.sections["8"].paraF, margin, yRef.current,margin,10, addTextOption,...lastParam],[t.contract.sections["8"].paraClose, margin, yRef.current,margin,40, addTextOption,...lastParam],[t.contract.sections["9"].title, margin, yRef.current,margin,15, {...addTextOption,isBold:true,size:16},...lastParam],[t.contract.sections["9"].para, margin, yRef.current,margin,15, addTextOption,...lastParam],[t.contract.sections["9"].paraA, margin, yRef.current,margin,8,
                    {...addTextOption,lineHeight:lineHeight+2,isBold:true},...lastParam],[t.contract.sections["9"].paraB, margin, yRef.current,margin,8, {...addTextOption,isBold:true,lineHeight:lineHeight+2},...lastParam],[t.contract.sections["9"].paraC, margin, yRef.current,margin,40, {...addTextOption,isBold:true,lineHeight:lineHeight+2},...lastParam],[t.contract.sections["10"].title, margin, yRef.current,margin,15, {...addTextOption,isBold:true,size:16},...lastParam]]
                },
                32:{
                    id:32,
                    param:[[[t.contract.sections["10"].sprestataire,t.contract.sections["10"].sclient],yRef.current,margin,20,margin,marginTop,marginBottom,lineHeight,11,true,fontRegular,fontBold,...lastParam],[["",t.contract.sections["10"].do+' '+formatDate(data.startDate)],yRef.current,margin,20,margin,marginTop,marginBottom,lineHeight,10,false,fontRegular,fontBold,...lastParam]]
                }
            }

            functionListAndRang.forEach((item,i)=>{
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
                                yRef.current = signatureBloc(params)  
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
                                data.projectFonctionList.forEach((item,index)=>{
                                    if (isDataStructureSingleText(params)) {
                                        params[0] = item
                                        yRef.current = addText(params)
                                        if (index === data.projectFonctionList.length - 1) {
                                            params[4] = 15
                                            yRef.current = addText(params)
                                        }
                                    }
                                })
                            }
                            break;
                        case 'addHorizontalText':
                            if (item.id === 24) {
                                const params = fonctionParam[item.id].param[0]
                                data.paymentSchedule.split(',').forEach((item,index)=>{
                                    if (isDataStructureHorizontalText(params)) {
                                    params[0][1].text = item
                                    params[8].bulletSymbol = `${index + 1} - `
                                        if (index === 0) {
                                            params[0][0].text = t.contract.sections["5"].sec15.item
                                            const final = addHorizontalText(params)
                                            yRef.current = final.finalY;
                                        }else if(index === data.paymentSchedule.split(',').length - 1){
                                            params[0][0].text = t.contract.sections["5"].sec15.itemEnd
                                            params[5] = 15
                                            const final = addHorizontalText(params)
                                            yRef.current = final.finalY;
                                        }else{
                                            params[0][0].text = `${t.contract.sections["5"].sec15.item1} ${index + 1} : `
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
            return URL.createObjectURL(blob);
            //return await pdfDoc.save();
        } catch (error) {
            console.error('Erreur lors de la génération du PDF:', error);
            alert('Une erreur est survenue.');
        }
    }
    // Fonction utilitaire pour ajouter du texte multiligne
    const addText = ([text,x,y,rightMargin,marginAfter,options,pdfDoc,pageRef,yRef,]: [text: string,x: number,y: number,rightMargin: number,marginAfter: number,
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
        yRef: { current: number },
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

    const signatureBloc = ([items,initialY,marginLeft,marginRight,marginAfter,topMargin,bottomMargin,lineHeight,size,isBold,font,fontBold,pdfDoc,pageRef,yRef]: [items: string[],initialY: number,marginLeft: number,marginRight: number,marginAfter: number,topMargin: number,bottomMargin: number,lineHeight: number,size: number,isBold: boolean,font: PDFFont,fontBold: PDFFont,pdfDoc: PDFDocument,pageRef: { current: PDFPage },yRef: { current: number }]) => {
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
            const pdfUrl = await handlePdf(client,{name:"Test Name",freelancerName:"ROD TECH SOLUTIONS",freelanceAddress:'123 Rue Saint-Sébastien, Poissy 78300, France',freelancerSirets:"SIRET",clientEmail:"test@mail.com",clientAddress:"123 rue Saint-Sébastien, Poissy 78300, France",clientSIRET:"",clientPhone:"7845 454 12",projectTitle:"SIte Web",projectDescription:"Test du site",startDate:new Date().toISOString(),endDate:new Date().toISOString(),totalPrice:700,paymentSchedule:"25%,25%,50%",projectFonctionList:["Fonction1","Fonction2","Fonction4","Fonction4"],contractType:"service_and_maintenance",maintenaceOptionPayment:"perHour",maintenanceType:"web",contractLanguage:"fr"})
            if (pdfUrl) {
                setPdfUrl(pdfUrl)
            }
        }
        generedPdf()    
    },[])
    return (
        <>
        {
           pdfUrl !== '' && window.open(pdfUrl, '_blank')
        }
        </>
    )
};

export default GeneratePdfContract;
