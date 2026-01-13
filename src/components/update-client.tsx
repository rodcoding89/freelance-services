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
import { Client, clientServiceDb, Services } from "@/interfaces";

interface UpdateClientProps {
 locale: string;
 clientId: string;
}

const UpdateClient: React.FC<UpdateClientProps> = ({locale,clientId})=> {
    const t:any = useTranslationContext();
    const [isPopUp,setIsPopUp] = useState<boolean>(false)
    const {contextData} = useContext(AppContext)
    const [client,setClient] = useState<Client|null>(null)
    const [serviceAdding,setServiceAdding] = useState<boolean>(false)
    const [services,setServices] = useState<Services[]>([])
    const [loading, setLoading] = useState(true);
    const [canAddService,setCanAddService] = useState<boolean>(true)
    
    const serviceData = [
        {value:"service",label:"Service",id:1},
        {value:"maintenance",label:"Maintenance",id:2},
        {value:"service_and_maintenance",label:"Service plus Maintenance",id:3}
    ]

    const [serviceType,setServiceType] = useState<{value:string,label:string,id:number}[]>(serviceData)

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
        if(!data || !clientId) return
        setLoader(true);
        try {
            const clientData:Client = {clientId:parseInt(clientId),clientType:data.typeClient,fname:data.clientfName,lname:data.clientlName,modifDate:new Date(),clientNumber:client?.clientNumber ?? 100,email:data.clientEmail,clientLang:data.clientLang,taxId:data.taxId !== '' ? data.taxId : null,phone:data?.phone,invoiceCount:client?.invoiceCount,clientStatus:data.status}
            //console.log('Client Data:', data);*/
            const result = await fetch(`/api/update-client/`,{
                method: 'PUT', // Garde votre méthode GET pour l'exemple
                headers: {
                'Content-Type': 'application/json',
                },
                body:JSON.stringify({clientData:clientData})
            })
            if (!result.ok) {
                alert(result.statusText)
                throw new Error('Erreur lors de la requête');
            }
            const response = await result.json();
            if (response.success) {
                if (data.serviceType && data.serviveType !== 'default' && serviceAdding) {
                    const service:Services = {clientId:parseInt(clientId),serviceType:data.serviceType,contractStatus:"unsigned"}
                    const result = await fetch(`/api/add-service/`,{
                        method: 'POST', // Garde votre méthode GET pour l'exemple
                        headers: {
                        'Content-Type': 'application/json',
                        },
                        body:JSON.stringify({service})
                    })
                    if (!result.ok) {
                        alert(result.statusText)
                        throw new Error('Erreur lors de la requête');
                    }
                    const response1 = await result.json();
                    
                    if (!response1.success) {
                        alert(response1.message)
                        throw new Error('Erreur lors de la requête');
                    }
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
                    alert(result.statusText)
                    throw new Error('Erreur lors de la requête');
                }
                const response = await result.json();
               if (response.success) {
                    sessionStorage.removeItem("clientData")
                    router.push(`/${client?.clientLang ?? "en"}/clients-list`)
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
                alert(result.statusText)
                throw new Error('Erreur lors de la requête');
            }
            const response = await result.json();
            if (response.success === true && response.result) {
                handleCLientService(response.result,"load");
            } else {
                setLoading(false);
                alert("Erreur lors du chargement des données");
            }
        };
        const handleCLientService = async (data:clientServiceDb,origin:"session"|"load") => {
            reset({
                clientfName:data.fname,
                clientlName:data.lname,
                clientEmail:data.email,
                status:data.clientStatus,
                taxId:data.taxId,
                clientLang:data.clientLang,
                typeClient:data.clientType,
                phone:data.phone
            })
            let serviceList:string[] = []
            if (data.services) {
                serviceList = parseService(data.services).map((item)=>item.serviceType)
            }
            
            if (serviceList.includes("service") && serviceList.includes("maintenance")) {
                setCanAddService(false)
            }else if(serviceList.includes("service_and_maintenance")){
                setCanAddService(false)
            }
            
            if (typeof(data.services) === "string") {
                const services = JSON.parse(data.services) as Services[]
                setServices(services)
            }else{
                setServices(data.services)
            }
            
            const clientData = {fname:data.fname,lname:data.lname,address:data.address,email:data.email,taxId:data.taxId,clientId:data.clientId,clientLang:data.clientLang,clientNumber:data.clientNumber,clientStatus:data.clientStatus,clientType:data.clientType,modifDate:data.modifDate} as Client
            setClient(clientData);
            setLoading(false);
            sessionStorage.setItem("updateClient_"+clientId,JSON.stringify(data))
        }
        
        const clientServiceDataSession = sessionStorage.getItem("updateClient_"+clientId)
        
        if (clientServiceDataSession) {
            const clientServiceData = JSON.parse(clientServiceDataSession) as clientServiceDb;
            handleCLientService(clientServiceData,"session")
        } else {
            fetchClients();
        }
    }, []);

    const parseService = (services:string|Services[]):Services[]=>{
        if (typeof(services) === "string") {
            return JSON.parse(services)
        }
        return services
    }

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
                    <div className="flex justify-start items-start gap-4">
                        <div className="w-1/2">
                            <label htmlFor="clientlName" className="block text-sm font-medium text-gray-700">
                                Modifier le nom du client
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
                        <div className="w-1/2">
                            <label htmlFor="clientfName" className="block text-sm font-medium text-gray-700">
                                Modifier le prénom du client
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
                    <div className="flex justify-start items-start gap-4">
                        <section className="border-b pb-6 w-1/2">
                            <label htmlFor="typeClient" className="block text-sm font-medium text-gray-700">
                                Choisir le type de client
                            </label>
                            <select id="typeClient" {...register("typeClient", { required: "The selection is required" })}
                            className="mt-1 block w-full border border-gray-300 rounded-md p-2">
                                <option value="company">Company</option>
                                <option value="particular">Particulié</option>
                            </select>
                            {errors.typeClient && (
                                <p className="text-red-500 text-sm mt-1">{errors.typeClient?.message as string}</p>
                            )}
                        </section>
                        <div className="w-1/2">
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
                    </div>
                    
                    <div className="flex justify-start items-center gap-4 w-full flex-wrap">
                        <div className='w-full max-w-[calc(50%-8px)]'>
                            <label className="block text-sm font-medium text-gray-700">{t.tel}</label>
                            <input
                                type="tel"
                                {...register("phone")}
                                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                            />
                        </div>
                        <div className="min-w-[14rem] w-full max-w-[calc(50%-8px)]">
                            <label className="block text-sm font-medium text-gray-700">
                            Modifier le numéro de Tax du client <em className="text-red-700">*</em>
                            </label>
                            <input
                            {...register("taxId")}
                            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                            />
                        </div>
                    </div>
                    <div className="flex justify-start items-center gap-4 flex-wrap">
                        <div className="min-w-[14rem] w-full max-w-[calc(50%-8px)]">
                            <label htmlFor="clientStatus" className="block text-sm font-medium text-gray-700">
                                Modifier le statut du client
                            </label>
                            <select id="clientStatus" {...register("status", { required: "The selection is required" })}
                            className="mt-1 block w-full border border-gray-300 rounded-md p-2">
                                <option value="actived">activé</option>
                                <option value="desactived">desactivé</option>
                            </select>
                            {errors.clientStatus && (
                                <p className="text-red-500 text-sm mt-1">{errors.clientStatus?.message as string}</p>
                            )}
                        </div>
                        <div className="min-w-[14rem] w-full max-w-[calc(50%-8px)]">
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
                    <div className="w-full flex justify-start items-start flex-wrap">
                        <div className={`min-w-[14rem] w-full max-w-[calc(50%-1.25rem)] ${!canAddService ? "opacity-50 pointer-events-none" : "opacity-100 pointer-events-auto"}`} onClick={()=>setServiceAdding(!serviceAdding)}>
                            <label className="block text-sm font-medium text-gray-700 pb-1" htmlFor="">Ajouter un nouveau service</label>
                            <span className="bg-secondary text-white px-3 py-2 rounded-[.5rem] cursor-pointer flex justify-center items-center gap-1"><Icon name="bx-plus" size="1.2rem" color="#fff"/>Nouveau service</span>
                        </div>
                        {
                            (serviceAdding && canAddService) && <div className="min-w-[14rem] w-full max-w-[calc(50%-1.25rem)">
                                <select id="serviceType" {...register("serviceType", { required: "The selection is required" })}
                                className="mt-1 block w-full border border-gray-300 rounded-md p-2">
                                    <option value="default">---Choisir un service---</option>
                                    {
                                        serviceType.map((item)=>{
                                            return (
                                                <option value={item.value}>{item.label}</option>
                                            )
                                        })
                                    }
                                </select>
                            </div>
                        }
                    </div>
                    <div className="w-full">
                        <label htmlFor="">Supprimer les services</label>
                        <div className="flex justify-start items-center flex-wrap gap-1 my-4">
                        {
                            parseService(services).map((service:Services,index:number) => {
                                return (
                                    <span className="bg-secondary py-1 px-2 flex justify-start items-center gap-2 rounded-[.5rem] text-white" key={clientId+'_'+service.serviceId+'_'+index} title="Supprimer ce service">
                                        {service.serviceType.replace("_"," ")}
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