"use client"
import { useState, useContext, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslationContext } from '@/hooks/app-hook';
import { AppContext } from '@/app/context/app-context';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Icon from './Icon';
import { getCookie } from '@/server/services';
import { Client, Services } from '@/interfaces';

interface CreateClientProps {
    locale:string
}

const CreateClient: React.FC<CreateClientProps> = ({locale}) => {
    const t:any = useTranslationContext();
    const [isPopUp,setIsPopUp] = useState<boolean>(false)
    const {contextData,setContextData} = useContext(AppContext)
   
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
            const client:Client = {phone: data.phone !== '' ? data.phone : null,clientUid:"",clientType:data.typeClient,fname:data.clientfName,lname:data.clientlName,modifDate:new Date().getTime(),clientNumber:0,email:data.clientEmail,clientLang:data.clientLang,taxId:data.taxId ? data.taxId : '',clientStatus:"actived"}
            const service:Services = {serviceType:data.serviceType,serviceUid:"",contractStatus:"unsigned",clientId:0}
            
            const result = await fetch(`/api/add-client/`,{
                method: 'POST', // Garde votre méthode GET pour l'exemple
                headers: {
                'Content-Type': 'application/json',
                },
                body:JSON.stringify({clientData:client,service:service})
            })

            if (!result.ok) {
                setContextData({toast:{toastVariant:"error",toastMessage:"Erreur survenue lors de la requête",showToast:true,time:new Date().getTime()}}) 
            }

            const response = await result.json();
            console.log("response",response)
            if (response.success && response.result) {
                sessionStorage.removeItem("clientData")
                router.push('/'+data.clientLang+'/clients-list')
            }else{
                setContextData({toast:{toastVariant:"error",toastMessage:"Une erreur inattendu c'est produit",showToast:true,time:new Date().getTime()}})
            }
        } catch (error) {
            console.error("Error adding document: ", error);
        } finally {
            setLoader(false);
        }
    };

    //console.log("main",contextData)

    useEffect(()=>{
        if (contextData && (contextData.state === "hide" || contextData.state === "show")) {
            console.log("inside contextData",contextData)
            setIsPopUp(contextData.value)
        }
    },[contextData])

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
                <div className='flex items-start justify-start gap-4'>
                    <div className='w-1/2'>
                        <label htmlFor="clientlName" className="block text-sm font-medium text-gray-700">
                            Nom
                        </label>
                        <input
                            type="text"
                            id="clientlName"
                            {...register('clientlName', { required: 'Client last name is required' })}
                            className="mt-1 block w-full border border-gray-300 rounded-md p-2" placeholder='Nom du client'
                        />
                        {errors.clientlName && (
                            <p className="text-red-500 text-sm mt-1">{errors.clientlName.message as string}</p>
                        )}
                    </div>
                    <div className='w-1/2'>
                        <label htmlFor="clientfName" className="block text-sm font-medium text-gray-700">
                            Prénom
                        </label>
                        <input
                            type="text"
                            id="clientfName"
                            {...register('clientfName', { required: 'Client first name is required' })}
                            className="mt-1 block w-full border border-gray-300 rounded-md p-2" placeholder='Prénom du client'
                        />
                        {errors.clientfName && (
                            <p className="text-red-500 text-sm mt-1">{errors.clientfName.message as string}</p>
                        )}
                    </div>
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
                <div className="w-full flex justify-start items-start gap-4">
                    <div className='w-1/2'>
                        <label className="block text-sm font-medium text-gray-700">{t.tel} <em className="text-red-700">*</em></label>
                        <input
                            type="tel"
                            {...register("phone")}
                            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                        />
                    </div>
                    <div className="min-w-[14rem] w-1/2">
                        <label className="block text-sm font-medium text-gray-700">
                        {t.taxNumberText.replace("{tax}", 'VAT')}
                        </label>
                        <input
                        {...register("taxId")}
                        className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                        />
                    </div>
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
                <section className="border-b pb-6">
                    <label htmlFor="typeClient" className="block text-sm font-medium text-gray-700">
                        Choisir le type de client
                    </label>
                    <select id="typeClient" {...register("typeClient", { required: "The selection is required" })}
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2">
                        <option value="company">Company</option>
                        <option value="particular">Particulié</option>
                    </select>
                    {errors.clientLang && (
                        <p className="text-red-500 text-sm mt-1">{errors.typeClient?.message as string}</p>
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
