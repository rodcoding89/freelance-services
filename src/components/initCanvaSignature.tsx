import React, { useEffect, useRef, useState } from 'react';
import SignaturePad from 'signature_pad';
import CloseButton from './close-btn';
import { useTranslationContext } from '@/hooks/app-hook';

interface InitCanvaSignatureProps {
    locale:string;
    emit:(data:any)=>void;
    enable:boolean;
}

const InitCanvaSignature:React.FC<InitCanvaSignatureProps> = ({locale,emit,enable}) => {
    const t:any = useTranslationContext();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const canvasRef1 = useRef<HTMLCanvasElement>(null);
    const [signatureLink, setSignatureLink] = useState<string | null>(null)
    const signaturePadRef = useRef<SignaturePad | null>(null);
    const signaturePadRef1 = useRef<SignaturePad | null>(null);
    const disablePad = true;
    const [isSigned, setIsSigned] = useState(false);
    const freelanceSigningLink = `${process.env.NEXT_PUBLIC_ROOT_LINK}/assets/images/freelance_signature.png`;
    console.log("root link",process.env.ROOT_LINK)
    const loadDefaultSignature = async(imageUrl:string) =>{
        const img = new Image();
        img.crossOrigin = 'Anonymous'; // Nécessaire pour les URLs externes
        img.src = imageUrl;
        await new Promise((resolve) => img.onload = resolve);
        return img;
    }

    useEffect(() => {
        if (!canvasRef.current || !canvasRef1.current) return;
        
        const canvas = canvasRef.current;
        const signaturePad = new SignaturePad(canvas,{
            minWidth: 1,
            maxWidth: 3,
            penColor: '#000'
        });
        signaturePadRef.current = signaturePad;
      
        // Système de détection ultra-fiable
        const checkSignature = () => {
            const isEmpty = signaturePad.isEmpty();
            console.log('Signature check:', isEmpty);
            setIsSigned(!isEmpty);
        };
      
        // 1. Écouteurs natifs du canvas (plus fiables que endStroke)
        const events = ['mouseup', 'touchend', 'pointerup'];
        events.forEach(event => {
            canvas.addEventListener(event, checkSignature);
        });

        // 2. Vérification périodique (fallback)
        const intervalId = setInterval(checkSignature, 300);
      
        // Redimensionnement
        const resizeCanvas = () => {
          const ratio = Math.max(window.devicePixelRatio || 1, 1);
          canvas.width = canvas.offsetWidth * ratio;
          canvas.height = canvas.offsetHeight * ratio;
          canvas.getContext("2d")?.scale(ratio, ratio);
        };
        const drawImageOnCanvas = async(canvas:HTMLCanvasElement,url:string)=>{
            const ctx = canvas.getContext('2d');
            const defaultSignature = await loadDefaultSignature(url);
            canvas.width = defaultSignature.naturalWidth; // Largeur originale
            canvas.height = defaultSignature.naturalHeight;
            ctx?.drawImage(defaultSignature, 0, 0, canvas.width, canvas.height);
        }
        drawImageOnCanvas(canvasRef1.current,freelanceSigningLink)
        const signaturePad1 = new SignaturePad(canvasRef1.current);
        signaturePadRef1.current = signaturePad1;
        // Initialisation
        window.addEventListener("resize", resizeCanvas);
        resizeCanvas();
        checkSignature(); // Vérification initiale
      
        return () => {
          window.removeEventListener("resize", resizeCanvas);
          clearInterval(intervalId);
          events.forEach(event => {
            canvas.removeEventListener(event, checkSignature);
          });
          signaturePad.off(); // Détache tous les événements de SignaturePad
        };
    }, []);

    const saveSignature = () => {
        console.log("saveSignature")
        const clientSignatureLink = signaturePadRef.current?.toDataURL('image/png');
        const freelanceSignature = signaturePadRef1.current?.toDataURL('image/png');
        if (clientSignatureLink && freelanceSignature) {
            emit({clientSignatureLink,freelanceSignature})
            setSignatureLink("contract_signature.png");
        }
    };

    const clearSignature = () => {
        signaturePadRef.current?.clear();
        setIsSigned(false);
    };
    const clearAll = ()=>{
        signaturePadRef.current?.clear();
        setSignatureLink(null);
        setIsSigned(false);
        emit({clientSignatureLink:null,freelanceSignature:null})
    }
    async function downloadImage(imageUrl:string, fileName:string) {
        try {
          const response = await fetch(imageUrl);
          const blob = await response.blob();
          const link = document.createElement('a');
      
          // Créez une URL d'objet pour le blob
          const url = window.URL.createObjectURL(blob);
          link.href = url;
          link.download = fileName;
      
          // Ajoutez le lien au document et cliquez dessus pour déclencher le téléchargement
          document.body.appendChild(link);
          link.click();
      
          // Nettoyez en supprimant le lien et en révoquant l'URL d'objet
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        } catch (error) {
          console.error('Erreur lors du téléchargement de l\'image:', error);
        }
    }
    return (
        <div className="border rounded p-2">
            <h5 className='my-3'>{t.signing} <em>*</em></h5>
            <canvas 
                ref={canvasRef}
                className={`w-full h-60 bg-gray-100 border`} style={{touchAction: "none"}}
            />
           <canvas
                ref={canvasRef1}
                className="hidden w-full h-60 bg-gray-100 border"
            />
            
            <div className='flex justify-between items-center gap-3 w-full'>
                <div className={`flex justify-start items-center gap-3 w-full`}>
                    <button
                    type="button"
                    onClick={clearSignature}
                    className="mt-2 px-4 py-1 bg-gray-200 rounded"
                    >
                    {t.clear}
                    </button>
                    <button onClick={saveSignature} className={`mt-2 px-4 py-1 text-white bg-blue-600 rounded ${!isSigned ? 'opacity-50 cursor-not-allowed':'opacity-1 cursor-pointer'}`} disabled={!isSigned}>
                    {t.save}
                    </button>
                </div>
                {signatureLink !== null && <p className='flex-1 flex justify-start items-center gap-2'>{signatureLink} <em className='flex justify-center items-center cursor-pointer h-8 w-8 rounded-full bg-primary text-white'><CloseButton onClose={clearAll} size='medium' color='!text-white' className=''/></em></p>}
            </div>
        </div>
    );
};

export default InitCanvaSignature;