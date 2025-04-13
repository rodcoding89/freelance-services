"use client"
import { useState, useContext, useEffect } from "react";

import { useTranslationContext } from "@/hooks/app-hook";
import { AppContext } from "@/app/context/app-context";

interface LegalNoticeProps{
    locale:string
}

const LegalNotice:React.FC<LegalNoticeProps> = ({locale})=>{
    const t:any = useTranslationContext();
    const [isPopUp,setIsPopUp] = useState<boolean>(false)
    const {contextData} = useContext(AppContext)
    console.log("main",contextData)
    useEffect(()=>{
        if (contextData && (contextData.state === "hide" || contextData.state === "show")) {
            console.log("inside contextData",contextData)
            setIsPopUp(contextData.value)
        }
    },[contextData])
    return (
        <main className={`transition-transform duration-700 delay-300 ease-in-out ${isPopUp ? 'translate-x-[-25vw]' : 'translate-x-0'} w-[85%] mt-[110px] mx-auto`}>
            <h1 className="text-center text-thirty uppercase">{t["legalNotice"]}</h1>
        </main>
    )
}

export default LegalNotice
