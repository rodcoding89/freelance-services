"use client"
import { useContext, useEffect, useState } from "react";

import { useTranslationContext } from "@/hooks/app-hook";
import { AppContext } from "@/app/context/app-context";

interface TermsOfServicesProps{
    locale:string
}
const TermsOfServices:React.FC<TermsOfServicesProps> = ({locale})=>{
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
            <h1 className="text-center text-thirty uppercase">{t["termsOfUse"]}</h1>
        </main>
    )
}

export default TermsOfServices
