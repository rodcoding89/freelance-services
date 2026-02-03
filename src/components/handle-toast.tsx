"use client"
import { useContext, useEffect, useState } from "react"
import Toast from "./toast"
import { AppContext } from "@/app/context/app-context"

interface HandleToastProps {
  locale:string
}

const HandleToast:React.FC<HandleToastProps> = ()=>{
  const {contextData} = useContext(AppContext)
  const [toast,setToast] = useState<{show:boolean,variant:"info"|"error"|"success",message:string}|null>()
  
  useEffect(()=>{
    if (contextData && contextData.toast) {
      const toastData = {show:contextData.toast.showToast,variant:contextData.toast.toastVariant,message:contextData.toast.toastMessage}
      setToast(toastData)
      console.log("toastData",toastData)
    }
  },[contextData])
  console.log("toast",toast)
  return (
    <>
    {
      toast ? <Toast duration={9000} show={toast.show} variant={toast.variant} onClose={()=>{setToast(null)}} message={toast.message}/> : ''
    }
    </>
  )
}

export default HandleToast