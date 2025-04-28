"use client"

import { useTranslationContext } from "@/hooks/app-hook";

import { useEffect, useState } from "react";
import InitCanvaSignature from "./initCanvaSignature";

interface GeneredContractProps{
    locale:string
}

const GeneredContract:React.FC<GeneredContractProps> = ({locale})=>{
    const t:any = useTranslationContext();
    const [signingLink, setSigningLink] = useState<string | null>(null);
    const handleSignatureChange = (data:any)=>{
        console.log("data",data)
        setSigningLink(data)
    }
    useEffect(()=>{
        
    },[])
    return (
        <div>
            <section className="signing">
                <InitCanvaSignature locale={locale} emit={handleSignatureChange}/>
            </section>
        </div>
    )
}

export default GeneredContract