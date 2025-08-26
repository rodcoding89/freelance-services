"use client";

import { AppContext } from "@/app/context/app-context";
import { useTranslationContext } from "@/hooks/app-hook";
import { getCookie } from "@/server/services";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import Icon from "./Icon";
import CloseButton from "./close-btn";

interface UpdateClientProps {
 locale: string;
 clientId: string;
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
    status:"actived"|"desactived";
    services?:Services[];
}

interface Services {
    clientId:string;
    serviceId?:string;
    name:string;
    serviceType: "service"|"maintenance"|"service_and_maintenance";
    contractStatus: 'signed' | 'unsigned' | 'pending';
}


const UpdateClient: React.FC<UpdateClientProps> = ({locale,clientId})=> {
    const t:any = useTranslationContext();
    const [isPopUp,setIsPopUp] = useState<boolean>(false)
    const {contextData} = useContext(AppContext)
    const [client,setClient] = useState<Client|null>(null)
    const [serviceAdding,setServiceAdding] = useState<boolean>(false)
    const [loading, setLoading] = useState(true);
    
    const [loader, setLoader] = useState(false);
    const router = useRouter();
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors,isValid },
    } = useForm({ mode: 'onChange'});

    const onSubmit = async(data: any) => {
        console.log("data",data)
        if(!data) return
        setLoader(true);
        try {
            const clientData = {name:data.clientName,modifDate:new Date().toLocaleDateString(`${locale === 'fr' ? 'fr-FR' : locale === 'de' ? 'de-DE' : 'en-US'}`),clientNumber:client?.clientNumber ? client?.clientNumber + 1 : 1000,email:data.clientEmail,clientLang:data.clientLang,taxId:data.taxId ? data.taxId : '',invoiceCount:client?.invoiceCount,status:data.status}
            //console.log('Client Data:', data);*/
            const result = await fetch(`/api/update-client/`,{
                method: 'PUT', // Garde votre méthode GET pour l'exemple
                headers: {
                'Content-Type': 'application/json',
                },
                body:JSON.stringify({clientData:clientData,clientId:clientId})
            })
            if (!result.ok) {
                throw new Error('Erreur lors de la requête');
            }
            const response = await result.json();
            if (response.success && data.serviceType && data.serviveType !== 'default' && serviceAdding) {
                const result = await fetch(`/api/add-service/`,{
                    method: 'POST', // Garde votre méthode GET pour l'exemple
                    headers: {
                    'Content-Type': 'application/json',
                    },
                    body:JSON.stringify({id:clientId,serviceName:data.serviceType,serviceType:data.serviceType})
                })
                if (!result.ok) {
                    throw new Error('Erreur lors de la requête');
                }
                const response1 = await result.json();
                
                if (!response1.success && response1.result) {}else{
                    throw new Error('Erreur lors de la requête');
                }
                sessionStorage.removeItem("clientData")
                sessionStorage.removeItem("updateClient_"+clientId)
                router.push('/'+data.clientLang+'/clients-list')
            }
        } catch (error) {
            console.error("Error adding document: ", error);
        } finally {
            setLoader(false);
        }
    };
    const deleteServiceData = async(serviceId:string)=>{
        if(serviceId === "") return
        try {
            if (window.confirm('Êtes-vous sûr de vouloir supprimer ce service ?')) {
                const result = await fetch(`/api/delete-service/?serviceId=${serviceId}`,{
                    method: 'DELETE', // Garde votre méthode GET pour l'exemple
                    headers: {
                    'Content-Type': 'application/json',
                    }
                })
                if (!result.ok) {
                    throw new Error('Erreur lors de la requête');
                }
                const response = await result.json();
               if (response.success) {
                    setClient((prev)=>{
                        if(prev === null) return null
                        const updateService = prev?.services?.filter((item)=>item.serviceId !== serviceId)
                        const updateClient = {...prev,services:updateService}
                        sessionStorage.setItem("updateClient_"+clientId,JSON.stringify(updateClient))
                        sessionStorage.removeItem("clientData")
                        return updateClient
                    })
                    alert(response.message)
               } else {
                    alert(response.message);
               } 
            }
        } catch (error) {
            alert('Erreur lors de la suppression du service');
            console.error('Erreur lors de la suppression du service:', error);
        }
    }
    useEffect(() => {
        const fetchClients = async () => {
            const result = await fetch(`/api/get-client-with-service/?clientId=${clientId}`,{
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
                setLoading(false);
                
                const clientsData = {
                    id: response.result.client.id,
                    modifDate: response.result.client.modifDate,
                    name: response.result.client.name,
                    clientLang: response.result.client.clientLang,
                    email: response.result.client.email,
                    taxId: response.result.client.taxId,
                    status:response.result.client.status,
                    clientNumber: response.result.client.clientNumber,
                    invoiceCount: response.result.client.invoiceCount,
                    services: response.result.service
                };
                handleCLientService(response.result);
                setClient(clientsData);
                sessionStorage.setItem("updateClient_"+clientId,JSON.stringify(clientsData))
            } else {
                setLoading(false);
                alert("Erreur lors du chargement des données");
            }
        };
        const handleCLientService = async (response:{client:any,service:any}) => {
            reset({
                clientName:response.client.name,
                clientEmail:response.client.email,
                status:response.client.status,
                taxId:response.client.taxId,
                clientLang:response.client.clientLang
            })
            setLoading(false);
        }
        
        const clientDataSession = sessionStorage.getItem("updateClient_"+clientId)
        if (clientDataSession) {
            const clientData = JSON.parse(clientDataSession);
            reset({
                clientName:clientData.name,
                clientEmail:clientData.email,
                taxId:clientData.taxId,
                status:clientData.status,
                clientLang:clientData.clientLang
            })
            setClient(clientData);
        } else {
            fetchClients();
        }
    }, []);
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
    if (loading) return <div className="text-center py-8 mt-[6.875rem] h-[12.5rem] flex justify-center items-center w-[85%] mx-auto">{t.loading}</div>;
    return (
        <main className={`transition-transform duration-700 delay-300 ease-in-out ${isPopUp ? 'translate-x-[-25vw]' : 'translate-x-0'} w-[85%] mt-[6.875rem] mx-auto`}>
            <div className="container mx-auto p-4">
                <h1 className="text-2xl font-bold mb-4">Mettre a jours les données clients</h1>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                    <label htmlFor="clientName" className="block text-sm font-medium text-gray-700">
                        Modifier le nom du client
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
                        <label className="block text-sm font-medium text-gray-700">Modifier l'email du client <em className="text-red-700">*</em></label>
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
                    <div className="flex justify-start items-center gap-5 flex-wrap">
                        <div className="min-w-[14rem] w-full max-w-[calc(50%-1.25rem)]">
                            <label className="block text-sm font-medium text-gray-700">
                            Modifier le numéro de Tax du client <em className="text-red-700">*</em>
                            </label>
                            <input
                            {...register("taxId")}
                            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                            />
                        </div>
                        <div className="min-w-[14rem] w-full max-w-[calc(50%-1.25rem)]">
                            <label htmlFor="clientLang" className="block text-sm font-medium text-gray-700">
                                Modifier la langue du client
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
                        </div>
                    </div>
                    <div className="flex justify-start items-center gap-5 flex-wrap">
                        <div className="min-w-[14rem] w-full max-w-[calc(50%-1.25rem)]">
                            <label htmlFor="clientLang" className="block text-sm font-medium text-gray-700">
                                Modifier le statut du client
                            </label>
                            <select id="clientLang" {...register("status", { required: "The selection is required" })}
                            className="mt-1 block w-full border border-gray-300 rounded-md p-2">
                                <option value="actived">activé</option>
                                <option value="desactived">desactivé</option>
                            </select>
                            {errors.clientLang && (
                                <p className="text-red-500 text-sm mt-1">{errors.clientLang?.message as string}</p>
                            )}
                        </div>
                        <div className="min-w-[14rem] w-full max-w-[calc(50%-1.25rem)]" onClick={()=>setServiceAdding(!serviceAdding)}>
                            <label className="block text-sm font-medium text-gray-700 pb-1" htmlFor="">Ajouter un nouveau service</label>
                            <span className="bg-secondary text-white px-3 py-2 rounded-[.5rem] cursor-pointer flex justify-center items-center gap-1"><Icon name="bx-plus" size="1.2rem" color="#fff"/>Nouveau service</span>
                        </div>
                    </div>
                    {
                        serviceAdding && <div className="min-w-[14rem] w-full max-w-1/2">
                            <select id="serviceType" {...register("serviceType", { required: "The selection is required" })}
                            className="mt-1 block w-full border border-gray-300 rounded-md p-2">
                                <option value="default">---Choisir un service---</option>
                                <option value="service">Service</option>
                                <option value="maintenance">Maintenance</option>
                                <option value="service_and_maintenance">Service plus Maintenance</option>
                            </select>
                        </div>
                    }
                    <div className="w-full">
                        <label htmlFor="">Supprimer les services</label>
                        <div className="flex justify-start items-center flex-wrap gap-1 my-4">
                        {
                            client?.services?.map((service:Services,index) => {
                                return (
                                    <span className="bg-secondary py-1 px-2 flex justify-start items-center gap-2 rounded-[.5rem] text-white" key={service.serviceId+'_'+index} title="Supprimer ce service">
                                        {service.name}
                                        <CloseButton onClose={() =>deleteServiceData(service.serviceId ?? "")} size="small" color="text-white" className="text-white-500 cursor-pointer"/>
                                    </span>
                                )
                            })
                        }
                        </div>
                    </div>
                    <div className='flex justify-start items-center gap-5'>
                        <Link className='text-primary py-2 px-4 bg-[#ccc] rounded-[.2em]' href={'/'+locale+'/clients-list'}>Liste de clients</Link>
                        <button
                            type="submit"
                            className={`px-4 py-2 bg-thirty text-white rounded-md hover:bg-secondary flex justify-center items-center gap-2 ${!isValid && loader ? 'cursor-not-allowed opacity-45' : 'cursor-pointer opacity-100'}`} disabled={!isValid && loader}>
                            {loader && <Icon name='bx bx-loader-alt bx-spin bx-rotate-180' color='#fff' size='1em'/>} Mettre à jour
                        </button>
                    </div>
                </form>
            </div>
        </main>
    )
}

export default UpdateClient;

//