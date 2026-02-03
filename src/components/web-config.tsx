"use client"
import { AppContext } from "@/app/context/app-context";
import { getCookie } from "@/server/services";
import { decodeResult, parseDate, parseInputDate } from "@/utils/fonction";

import { useRouter } from 'next/navigation';

import { useContext, useEffect, useState } from "react";

interface WebConfigProps {
    locale:string
}

const WebConfig: React.FC<WebConfigProps> = ({locale})=> {
    const [config,setConfig] = useState<string|null>(null);
    const [updateDate,setUpdateDate] = useState<string>('');
    const {setContextData} = useContext(AppContext)
    const [lastUpdateConfig,setLastUpdateConfig] = useState<{lastUpdate:number,webpage:string}[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const handleChange = (e:React.ChangeEvent<HTMLSelectElement>)=>{
        if (e.target.value === 'default') {
            setConfig(null);
        } else {
            setConfig(e.target.value);
        }
    }
    const lastUpdateDate = (type:string)=>{
        const item = lastUpdateConfig.find(item => item.webpage === type);
        if (item) {
            return `Dernier mise a jour : ${parseDate(item.lastUpdate,locale)}`;
        }
        return 'Aucune mise a jour enregistré';
    }
    
    const saveUpdateDate = async()=>{
        if(updateDate === '' || config === null) return;
        setLoading(true);
        const configIndex = lastUpdateConfig.findIndex(item => item.webpage === config);
        const newconfig = {webpage:config,lastUpdate:new Date(updateDate).getTime()}
        if (configIndex > -1) {
            const curentConf = [...lastUpdateConfig];
            curentConf.splice(configIndex,configIndex,newconfig);
            const result = await fetch(`/api/save-update-web-config/`,{
                method: 'POST', // Garde votre méthode GET pour l'exemple
                headers: {
                'Content-Type': 'application/json',
                },
                body: JSON.stringify({type:"update",config:newconfig,date:new Date(updateDate).getTime()})
            })
            if (!result.ok) {
                setContextData({toast:{toastVariant:"error",toastMessage:locale ? "Une erreur est survenue lors de la requête." : "An Error occurred during the request",showToast:true,time:new Date().getTime()}}) 
            }
            const response = await result.json();
            if (response.success) {
                setLastUpdateConfig(curentConf);
                sessionStorage.removeItem("webConfig")
                setContextData({toast:{toastVariant:"success",toastMessage:locale ? "Une erreur est survenue lors de la requête." : "An Error occurred during the request",showToast:true,time:new Date().getTime()}})
                router.push('/'+locale)
            } else {
                setContextData({toast:{toastVariant:"error",toastMessage:locale ? "Une erreur est survenue lors de la requête." : "An Error occurred during the request",showToast:true,time:new Date().getTime()}})
                setLoading(false);
            }
        }else{
            const result = await fetch(`/api/save-update-web-config/`,{
                method: 'POST', // Garde votre méthode GET pour l'exemple
                headers: {
                'Content-Type': 'application/json',
                },
                body: JSON.stringify({type:"add",config:newconfig,date:new Date(updateDate).getTime()})
            })
            if (!result.ok) {
                setContextData({toast:{toastVariant:"error",toastMessage:locale ? "Une erreur est survenue lors de la requête." : "An Error occurred during the request",showToast:true,time:new Date().getTime()}}) 
            }
            const response = await result.json();
            if (response.success) {
                sessionStorage.removeItem("webConfig")
                router.push('/'+locale)
            }else{
                setContextData({toast:{toastVariant:"error",toastMessage:locale ? "Une erreur est survenue lors de la requête." : "An Error occurred during the request",showToast:true,time:new Date().getTime()}})
                setLoading(false);
            }
        }
    }
    useEffect(()=>{
        const handleWebConfig = async () => {
            const sessionWebConfig = sessionStorage.getItem("webConfig")
            if(sessionWebConfig){
                const webConfig = JSON.parse(sessionWebConfig)
                setLastUpdateConfig(webConfig);
                setLoading(false);
            }else{
                const result = await fetch(`/api/fetch-web-config/`,{
                    method: 'GET', // Garde votre méthode GET pour l'exemple
                    headers: {
                    'Content-Type': 'application/json',
                    }
                })
                if (!result.ok) {
                    setContextData({toast:{toastVariant:"error",toastMessage:locale ? "Une erreur est survenue lors de la requête." : "An Error occurred during the request",showToast:true,time:new Date().getTime()}})     
                }
                const response = await result.json();
                if (response.success === true && response.result) {
                    const resultDecoded = decodeResult(response.result)
                    //console.log("resultDecoded",resultDecoded)
                    setLastUpdateConfig(resultDecoded);
                    setLoading(false);
                    sessionStorage.setItem("webConfig",JSON.stringify(resultDecoded))
                } else {
                    setContextData({toast:{toastVariant:"error",toastMessage:locale ? "Une erreur est survenue lors de la requête." : "An Error occurred during the request",showToast:true,time:new Date().getTime()}})
                    setLoading(false);
                }
            }
        };
        handleWebConfig();
    },[])
    useEffect(()=>{
        const checkCookie = async ()=>{
            const cookie = await getCookie('userAuth')
            if(!cookie){
                router.push('/'+locale+'/login')
            }
        }
        checkCookie()
    },[locale])
    if (loading) return <div className="text-center py-8 mt-[6.875rem] h-[12.5rem] flex justify-center items-center w-[85%] mx-auto">Chargement...</div>;
    return (
        <div className="container px-4 py-8 mt-[6.875rem] w-[85%] mx-auto">
            <h1 className="text-2xl font-bold mb-6">Ajouter la date de mise a jour des pages web (Réglementation)</h1>
            <section className="border-b pb-6">
                <div className="my-4">
                    <select className="mt-1 block w-full border border-gray-300 rounded-md p-2" name="" id="" onChange={handleChange}>
                        <option value="default">---Choisir dans la liste---</option>
                        <option value="cgv">Conditions Générales de Vente (CGV)</option>
                        <option value="legal-notices">Mentions Légales</option>
                        <option value="privacie-policies">Politiques de Confidentialités</option>
                    </select>
                </div>
            </section>
            {
                config !== null && (<div className="border-b pb-6 my-5">
                <h3 className="text-2xl font-bold mb-4">{config === 'cgv' ? 'Conditions Générales de Vente (CGV)' : config === 'legal-notices' ? 'Mentions Légales' : 'Politiques de Confidentialités'}</h3>
                <p className="my-3 p-2 px-4 bg-blue-500 text-white rounded-300">{lastUpdateDate(config)}</p>
                <div className="flex justify-start items-center gap-5 my-4">
                    <label htmlFor="updateDate">Choisir la date de mise a jour</label>
                    <input type="date" className="mt-1 block w-full border border-gray-300 rounded-md p-2 flex-1" id="updateDate" min={parseInputDate(new Date())}
                   value={updateDate} onChange={(e)=>setUpdateDate(e.target.value)}/>
                </div>
            </div>)
            }
            <button className={`mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md min-w-[14rem]  hover:bg-indigo-700 ${updateDate ? 'opacity-1 cursor-pointer' : 'opacity-50 cursor-not-allowed'}`} disabled={!updateDate} onClick={saveUpdateDate}>Mettre a jour</button>
        </div>
    )
};

export default WebConfig;
