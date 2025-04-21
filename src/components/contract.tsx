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
            to:"Prestataire.",
            and:"et"
            // Ajoutez toutes les autres sections ici...
        };
        try {
            console.log("try fontion")
            // Création d'un nouveau document PDF
            const pdfDoc = await PDFDocument.create();
            const page = pdfDoc.addPage([595, 842]); // Format A4
            
            // Chargement des polices
            const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
            const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      
            // Dimensions utiles
            const { width, height } = page.getSize();
            const margin = 50;
            const lineHeight = 14;
      
            //const signatureImage = await pdfDoc.embedPng(signingLink);
            //page.drawImage(signatureImage, { x: 50, y: 250, width: 200, height: 80 });
      
            // Position initiale
            let yPosition = height - margin;


            // Titre
            addText(content.title, margin, yPosition,margin, {size:16, isBold:true,font:font,fontBold:fontBold,page:page,lineHeight:lineHeight});
            yPosition -= lineHeight * 2;

            // Sous Titre
            addText(content.sousTitle, margin, yPosition, margin, {size:9, isBold:true,font:font,fontBold:fontBold,page:page,lineHeight:lineHeight});
            yPosition -= lineHeight * 2;

            // Préambule
            const final1 = addHorizontalText([{text:content.clientName,size:11,isBold:true,color:rgb(0, 0, 0)},{text:content.preambleAdresseClient,size:11,isBold:false,color:rgb(0, 0, 0)},{text:content.from,size:11,isBold:true,color:rgb(0, 0, 0)}],margin+30,yPosition,true,margin,{font,fontBold,page,defaultSpacing:5,lineHeight})
            yPosition = final1.finalY - lineHeight;
            
            addText(content.and, margin, yPosition,margin, {size:11, isBold:true,font:font,fontBold:fontBold,page:page,lineHeight:lineHeight});
            yPosition -= lineHeight * 2;

            const final2 = addHorizontalText([{text:content.freelanceName,size:11,isBold:true,color:rgb(0, 0, 0)},{text:content.preambleAdresseFreelance,size:11,isBold:false,color:rgb(0, 0, 0)},{text:content.to,size:11,isBold:true,color:rgb(0, 0, 0)}],margin+30,yPosition,true,margin,{font,fontBold,page,defaultSpacing:5,lineHeight})
            yPosition = final2.finalY - (lineHeight * 3.5);
            // Sections du contrat (ajoutez toutes les sections nécessaires)
            addText('1 - PRÉAMBULE', margin, yPosition,margin, {size:14, isBold:true,font:font,fontBold:fontBold,page:page,lineHeight:lineHeight});
            yPosition -= lineHeight * 2;
            
            // ... Ajoutez toutes les autres sections du contrat ici

            // Signatures
            yPosition -= lineHeight * 3;
            addText('Signature du client : ___________________________', margin, yPosition,margin, {size:12, isBold:false,font:font,fontBold:fontBold,page:page,lineHeight:lineHeight});
            addText(`Date: ${data.effectiveDate}`, width - 150, yPosition,margin, {size:12, isBold:false,font:font,fontBold:fontBold,page:page,lineHeight:lineHeight});
            yPosition -= lineHeight * 2;
            addText('Signature du prestataire : ___________________________', margin, yPosition,margin, {size:12, isBold:false,font:font,fontBold:fontBold,page:page,lineHeight:lineHeight});
            addText(`Date: ${data.effectiveDate}`, width - 150, yPosition,margin, {size:12, isBold:false,font:font,fontBold:fontBold,page:page,lineHeight:lineHeight,isListItem:true});

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
        context: {
            font: PDFFont;
            fontBold: PDFFont;
            page: PDFPage;
            defaultSpacing?: number;
            maxWidth?: number;
            bulletSymbol?: string;
            lineHeight: number;
        }
        ) => {
        const {
            font,
            fontBold,
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
            const pdfUrl = await handlePdf({name:"Test Name",freelancerName:"ROD TECH SOLUTIONS",freelanceAdresse:'123 Rue Saint-Sébastien, Poissy 78300, France',freelancerSirets:"SIRET",freelancerVAT:"",clientEmail:"test@mail.com",clientAddress:"123 rue Saint-Sébastien, Poissy 78300, France",clientSIRET:"",clientPhone:"7845 454 12",confidentiality:true,projectTitle:"SIte Web",projectDescription:"Test du site",startDate:new Date().toISOString(),endDate:new Date().toISOString(),effectiveDate:new Date().toISOString(),deliverables:"50%",totalPrice:700,paymentMethod:"Bank Transfer",paymentSchedule:"50",terminationTerms:"50",governingLaw:"French Law"})
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
