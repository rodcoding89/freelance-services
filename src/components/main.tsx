"use client"
import { useState, useContext, useEffect } from "react"
import About from "./about"
import Contact from "./contact"
import Home from "./home"
import Price from "./price"
import Reference from "./reference"
import Services from "./services"
import { AppContext } from "@/app/context/app-context"

interface MainProps{
 locale:string
}

const Main:React.FC<MainProps> = ({locale})=>{
    const [isPopUp,setIsPopUp] = useState<boolean>(false)
    const {contextData} = useContext(AppContext)

    //console.log("main",contextData)
    //console.log("Composant rendu avec :", contextData.toast);

    useEffect(()=>{
        //alert('call')
        if (contextData && (contextData.state === "hide" || contextData.state === "show")) {
            //console.log("inside contextData",contextData)
            setIsPopUp(contextData.value)
        }else if(contextData && contextData.toast){
            //alert('toast')
        }
    },[contextData,contextData?.toast?.time])

    //console.log("isPopUp",isPopUp)
    return (
        <>
        <main className={`transition-transform duration-700 delay-300 ease-in-out ${isPopUp ? 'translate-x-[-25vw]' : 'translate-x-0'}`}>
            <Home locale={locale}/>
            <About locale={locale}/>
            <Services locale={locale}/>
            <Reference locale={locale}/>
            <Price locale={locale}/>
            <Contact locale={locale}/>
        </main>
        </>
    )
}

export default Main