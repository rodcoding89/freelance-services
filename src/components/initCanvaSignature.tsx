import React, { useEffect, useRef, useState } from 'react';
import SignaturePad from 'signature_pad';
import CloseButton from './close-btn';

interface InitCanvaSignatureProps {
    locale:string;
    emit:(data:any)=>void;
}

const InitCanvaSignature:React.FC<InitCanvaSignatureProps> = ({locale,emit}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [signatureLink, setSignatureLink] = useState<string | null>(null)
    const signaturePadRef = useRef<SignaturePad | null>(null);
    const [isSigned, setIsSigned] = useState(false);
    
    useEffect(() => {
        if (!canvasRef.current) return;
      
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
        const signatureDataUrl = signaturePadRef.current?.toDataURL('image/png');
        if (signatureDataUrl) {
            emit(signatureDataUrl)
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
        emit(null)
    }
    return (
        <div className="border rounded p-2">
            <h5 className='my-3'>Signature <em>*</em></h5>
            <canvas
                ref={canvasRef}
                className="w-full h-60 bg-gray-100 border" style={{touchAction: "none"}}
            />
            <div className='flex justify-between items-center gap-3 w-full'>
                <div className='flex justify-start items-center gap-3 w-full'>
                    <button
                    type="button"
                    onClick={clearSignature}
                    className="mt-2 px-4 py-1 bg-gray-200 rounded"
                    >
                    Effacer
                    </button>
                    <button onClick={saveSignature} className={`mt-2 px-4 py-1 text-white bg-blue-600 rounded ${!isSigned ? 'opacity-50 cursor-not-allowed':'opacity-1 cursor-pointer'}`} disabled={!isSigned}>
                        Enregistré
                    </button>
                </div>
                {signatureLink !== null && <p className='flex-1 flex justify-start items-center gap-2'>{signatureLink} <em className='flex justify-center items-center cursor-pointer h-8 w-8 rounded-full bg-primary text-white'><CloseButton onClose={clearAll} size='medium' color='text-[#fff]' className=''/></em></p>}
            </div>
        </div>
    );
};

export default InitCanvaSignature;