"use client"
import { useState, useContext, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslationContext } from '@/hooks/app-hook';
import { AppContext } from '@/app/context/app-context';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Icon from './Icon';
import { getCookie } from '@/server/services';

interface CreateClientProps {
    locale:string
}

interface Client {
    id?: string;
    taxId?:string;
    name:string;
    email?:string;
    modifDate:string;
    clientNumber:number;
    invoiceCount?:number;
    clientLang:string;
    status:"actived"|"desactived"
}

interface Services {
    clientId:string;
    name:string;
    serviceType: "service"|"maintenance"|"service_and_maintenance";
    contractStatus: 'signed' | 'unsigned' | 'pending';
}


const CreateClient: React.FC<CreateClientProps> = ({locale}) => {
    const t:any = useTranslationContext();
    const [isPopUp,setIsPopUp] = useState<boolean>(false)
    const {contextData} = useContext(AppContext)
    const [lastClient,setLastClient] = useState<Client|null>(null)
    const [loader, setLoader] = useState(false);
    
    const router = useRouter();
    const {
        register,
        handleSubmit,
        formState: { errors,isValid },
    } = useForm({ mode: 'onChange'});

    const onSubmit = async(data: any) => {
        console.log("data",data)
        if(!data) return
        setLoader(true);
        try {
            const client:Client = {name:data.clientName,modifDate:new Date().toLocaleDateString(`${locale === 'fr' ? 'fr-FR' : locale === 'de' ? 'de-DE' : 'en-US'}`),clientNumber:lastClient?.clientNumber ? lastClient.clientNumber + 1 : 1000,email:data.clientEmail,clientLang:data.clientLang,taxId:data.taxId ? data.taxId : '',status:"actived"}
            //console.log('Client Data:', data);
            const result = await fetch(`/api/add-client/`,{
                method: 'POST', // Garde votre méthode GET pour l'exemple
                headers: {
                'Content-Type': 'application/json',
                },
                body:JSON.stringify({client})
            })
            if (!result.ok) {
                throw new Error('Erreur lors de la requête');
            }
            const response = await result.json();
            if (!response.success && response.result) {
                const result = await fetch(`/api/add-client/`,{
                    method: 'POST', // Garde votre méthode GET pour l'exemple
                    headers: {
                    'Content-Type': 'application/json',
                    },
                    body:JSON.stringify({id:response.result,serviceName:data.serviceType,serviceType:data.serviceType})
                })
                if (!result.ok) {
                    throw new Error('Erreur lors de la requête');
                }
                const response1 = await result.json();
                
                if (!response1.success && response1.result) {
                    router.push('/'+data.clientLang+'/clients-list')
                }else{
                    alert(response1.message)
                }
            }else{
                alert(response.message)
            }
        } catch (error) {
            console.error("Error adding document: ", error);
        } finally {
            setLoader(false);
        }
    };
    console.log("main",contextData)
    useEffect(()=>{
        if (contextData && (contextData.state === "hide" || contextData.state === "show")) {
            console.log("inside contextData",contextData)
            setIsPopUp(contextData.value)
        }
    },[contextData])

    useEffect(()=>{
        const handleLastClient = async()=>{
            const result = await fetch(`/api/get-last-client/`,{
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
                setLastClient(response.result)
            } else {
                alert(response.message)
            }
        }
        handleLastClient()
    },[])

    useEffect(()=>{
        const checkCookie = async ()=>{
            const cookie = await getCookie('userAuth')
            if(!cookie){
                router.push('/'+locale+'/login')
            }
        }
        checkCookie()
    },[])
  return (
    <main className={`transition-transform duration-700 delay-300 ease-in-out ${isPopUp ? 'translate-x-[-25vw]' : 'translate-x-0'} w-[85%] mt-[6.875rem] mx-auto`}>
        <h1 className="text-center text-thirty uppercase">Ajouter un nouveau client</h1>
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Création du client</h1>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                <label htmlFor="clientName" className="block text-sm font-medium text-gray-700">
                    Nom complet du client
                </label>
                <input
                    type="text"
                    id="clientName"
                    {...register('clientName', { required: 'Client name is required' })}
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2" placeholder='Nom complet du client'
                />
                {errors.clientName && (
                    <p className="text-red-500 text-sm mt-1">{errors.clientName.message as string}</p>
                )}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">{t.email} <em className="text-red-700">*</em></label>
                    <input
                        type="email"
                        id="clientEmail"
                        placeholder="Email du client"
                        {...register("clientEmail", {
                            required: t.errorEmail,
                            pattern: {
                                value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/i,
                                message: t.invalidEmail,
                            },
                        })}
                        className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                    />
                    {errors.clientEmail && (
                        <p className="text-red-500 text-sm mt-1">{errors.clientEmail.message as string}</p>
                    )}
                </div>
                <div className="min-w-[14rem] w-max max-w-1/3">
                    <label className="block text-sm font-medium text-gray-700">
                    {t.taxNumberText.replace("{tax}", 'VAT')} <em className="text-red-700">*</em>
                    </label>
                    <input
                    {...register("taxId")}
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                    />
                </div>
                <div className='my-3'>
                    <label htmlFor="serviceType" className="block text-sm font-medium text-gray-700">
                        Choisir le type de contrat
                    </label>
                    <select id="serviceType" {...register("serviceType", { required: "The selection is required" })}
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2">
                        <option value="service">Service</option>
                        <option value="maintenance">Maintenance</option>
                        <option value="service_and_maintenance">Service plus Maintenance</option>
                    </select>
                    {errors.serviceType && (
                        <p className="text-red-500 text-sm mt-1">{errors.serviceType?.message as string}</p>
                    )}
                </div>
                <section className="border-b pb-6">
                    <label htmlFor="clientLang" className="block text-sm font-medium text-gray-700">
                        Choisir la langue du client
                    </label>
                    <select id="clientLang" {...register("clientLang", { required: "The selection is required" })}
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2">
                        <option value="fr">{t.contractLanguage.french}</option>
                        <option value="en">{t.contractLanguage.english}</option>
                        <option value="de">{t.contractLanguage.germany}</option>
                    </select>
                    {errors.clientLang && (
                        <p className="text-red-500 text-sm mt-1">{errors.clientLang?.message as string}</p>
                    )}
                </section>
                <div className='flex justify-start items-center gap-5'>
                    <Link className='text-primary py-2 px-4 bg-[#ccc] rounded-[.2em]' href={'/'+locale+'/clients-list'}>Liste de clients</Link>
                    <button
                        type="submit"
                        className={`px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex justify-center items-center gap-2 ${!isValid && loader ? 'cursor-not-allowed opacity-45' : 'cursor-pointer opacity-100'}`} disabled={!isValid && loader}>
                        {loader && <Icon name='bx bx-loader-alt bx-spin bx-rotate-180' color='#fff' size='1em'/>} Créer le client
                    </button>
                </div>
            </form>
        </div>
    </main>
  );
};

export default CreateClient;
