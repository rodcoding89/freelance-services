"use client"
import { getCookie } from "@/server/services";

import { useRouter } from 'next/navigation';

import { useEffect, useState } from "react";

interface WebConfigProps {
    locale:string
}

const WebConfig: React.FC<WebConfigProps> = ({locale})=> {
    const [config,setConfig] = useState<string|null>(null);
    const [updateDate,setUpdateDate] = useState<string>('');
    const [lastUpdateConfig,setLastUpdateConfig] = useState<{date:string,type:string,id?:string}[]>([]);
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
        const item = lastUpdateConfig.find(item => item.type === type);
        if (item) {
            return `Dernier mise a jour : ${new Date(item.date).toLocaleDateString()}`;
        }
        return 'Aucune mise a jour enregistré';
    }
    const parseInputDate = ()=>{
        return `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`
    }
    const saveUpdateDate = async()=>{
        if(updateDate === '' || config === null) return;
        setLoading(true);
        const configIndex = lastUpdateConfig.findIndex(item => item.type === config);
        const newconfig = {type:config,date:updateDate}
        if (configIndex > -1) {
            const curentConf = [...lastUpdateConfig];
            curentConf.splice(configIndex,configIndex,newconfig);
            const result = await fetch(`/api/save-update-web-config/`,{
                method: 'POST', // Garde votre méthode GET pour l'exemple
                headers: {
                'Content-Type': 'application/json',
                },
                body: JSON.stringify({type:"update",config:newconfig,id:lastUpdateConfig[configIndex].id})
            })
            if (!result.ok) {
                throw new Error('Erreur lors de la requête');
            }
            const response = await result.json();
            if (response.success) {
                setLastUpdateConfig(curentConf);
                alert(response.message)
                router.push('/'+locale)
            } else {
                alert(response.message)
                setLoading(false);
            }
        }else{
            const result = await fetch(`/api/save-update-web-config/`,{
                method: 'POST', // Garde votre méthode GET pour l'exemple
                headers: {
                'Content-Type': 'application/json',
                },
                body: JSON.stringify({type:"add",config:newconfig,id:""})
            })
            if (!result.ok) {
                throw new Error('Erreur lors de la requête');
            }
            const response = await result.json();
            if (!response.success) {
                alert(response.message)
                setLoading(false);
            }else{
                alert(response.message)
                router.push('/'+locale)
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
                    throw new Error('Erreur lors de la requête');
                }
                const response = await result.json();
                if (!response.success && response.result) {
                    setLastUpdateConfig(response.result);
                    setLoading(false);
                    sessionStorage.setItem("webConfig",JSON.stringify(response.result))
                } else {
                    alert(response.message);
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
                    <input type="date" className="mt-1 block w-full border border-gray-300 rounded-md p-2 flex-1" id="updateDate" min={parseInputDate()}
                   value={updateDate} onChange={(e)=>setUpdateDate(e.target.value)}/>
                </div>
            </div>)
            }
            <button className={`mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md min-w-[14rem]  hover:bg-indigo-700 ${updateDate ? 'opacity-1 cursor-pointer' : 'opacity-50 cursor-not-allowed'}`} disabled={!updateDate} onClick={saveUpdateDate}>Mettre a jour</button>
        </div>
    )
};

export default WebConfig;
