"use client"
import { AppContext } from "@/app/context/app-context";
import { useTranslationContext } from "@/hooks/app-hook";
import { getDoc, doc, updateDoc } from 'firebase/firestore';
import { useState, useContext, useEffect } from "react";
import Cookies from 'js-cookie';
import { useForm } from "react-hook-form";
import firebase from '@/utils/firebase'; // Importez votre configuration Firebase
import { useParams, useRouter, useSearchParams } from "next/navigation";

import Icon from "./Icon";
import { loadCountries } from "@/utils/fonction";

interface Services {
  serviceId:string;
  clientId:string;
  name:string;
  serviceType: "service"|"maintenance"|"service_and_maintenance";
  contractStatus: 'signed' | 'unsigned' | 'pending';
  contract?:Contract;
}

interface Client {
    id: string;
    name:string;
    email?:string;
    dateCreation: Date;
    clientNumber:number;
    invoiceCount?:number;
    contract?:Contract
}

interface Contract {
    name:string;
    adresse:{
        street:string;
        postalCode:string;
        city:string;
        country:string;
    }
    particular:boolean;
    company:boolean;
    clientBillingAddress?:string;
    clientEmail:string;
    clientPhone:string;
    freelancerName:string;
    freelancerTaxId?:string;
    freelanceAddress:string;
    projectTitle:string;
    projectDescription:string;
    projectFonctionList:string[];
    startDate:string;
    endDate?:string;
    contractType: "service"|"maintenance"|"service_and_maintenance";
    maintenanceType:"app"|"saas"|"web"|null;
    maintenaceOptionPayment?:"perYear"|"perHour"
    totalPrice:number;
    paymentSchedule:string;
    contractLanguage:string;
}

interface ContractProps{
    locale:string
}
const contractType = [
    { value: "service", label: "Services" },
    { value: "maintenance", label: "Maintenance" },
    { value: "service_and_maintenance", label: "Services et Maintenance" },
];

const contractStatus = [
    { value: "unsigned", label: "Non Signé" },
    { value: "pending", label: "En Attente de Signature" }
];

const Contrat:React.FC<ContractProps> = ({locale})=>{
    const t:any = useTranslationContext();
    const [isPopUp,setIsPopUp] = useState<boolean>(false)
    const [maintenaceType,setMaintenaceType] = useState<"app"|"saas"|"web"|null>(null)
    const [loading, setLoading] = useState(true);
    const {contextData} = useContext(AppContext)
    const [fonctionalityList, setFonctionalityList] = useState<string[]>([])
    const [fonction, setFonction] = useState<string>('')
    const router = useRouter();
    const [selectedCountry,setSelectedCountry] = useState<{name:string,taxB2C:string,taxB2B:string,groupe:string,currency:string,threshold_before_tax:number,turnover:number}|null>(null)
    const [client, setClient] = useState<Client|null>(null)
    const [service, setService] = useState<Services|null>(null)
    const [selectedContractType, setSelectedContractType] = useState<"service"|"maintenance"|"service_and_maintenance"|null>(null);
    const [selectedContractStatus, setSelectedContractStatus] = useState<'signed' | 'unsigned' | 'pending'|null>(null);
    const [countries, setCountries] = useState<{name:string,taxB2C:string,taxB2B:string,groupe:string,currency:string,threshold_before_tax:number,turnover:number}[]>([])
    const [contractLanguage, setContractLanguage] = useState<string>('')
    // Contenu dynamique basé sur la langue
    const searchParams = useSearchParams();
    const edit = searchParams.get('edit');
    const {id,serviceId} = useParams()
    const clientId = id as string
    const clientServiceId = serviceId as string;
    
    const {
        register,
        handleSubmit,
        reset,
        setValue,
        formState: { errors,isValid },
    } = useForm<Contract>({ mode: 'onChange'});

    const onSubmit = (data:Contract) => {
        console.log("Contract Data:", data);
        sessionStorage.setItem('contractData', JSON.stringify({contract:{...data,projectFonctionList:fonctionalityList,maintenaceType:maintenaceType,contractLanguage:contractLanguage,contractType:selectedContractType,contractStatus:selectedContractStatus},client:{...client,contractType:selectedContractType,contractStatus:selectedContractStatus}}));
        router.push("/"+locale+"/sign-contract/"+clientId)
        // Generate PDF or send data to backend
    };
    
    const getStatusText = (status: string) => {
        if(!status) return 'Statut inconnu';
        switch (status) {
        case 'signed': return 'Contrat signé';
        case 'pending': return 'En cours de signature';
        case 'unsigned': return 'Contrat non signé';
        default: return 'Statut inconnu';
        }
    };
    const getStatusClass = (status: string) => {
        if(!status) return 'bg-gray-100 text-gray-800';
        switch (status) {
        case 'signed': return 'bg-green-100 text-green-800';
        case 'pending': return 'bg-yellow-100 text-yellow-800';
        case 'unsigned': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
        }
    };
    // Obtenir l'icône en fonction du statut
    const getStatusIcon = (status: string) => {
        if(!status) return 'bx bx-question-mark';
        switch (status) {
        case 'signed': return 'bx bx-check-circle';
        case 'pending': return 'bx bx-time';
        case 'unsigned': return 'bx bx-error-circle';
        default: return 'bx bx-question-mark';
        }
    };
    
    const chooseMaintenance = (type:"app"|"saas"|"web")=>{
        setMaintenaceType((prev)=>{
            if(prev === type) return null
            return type
        })
    }

    const checkFormValidation = ()=>{
        return isValid && maintenaceType !== null && selectedContractType !== null && selectedContractStatus !== null && fonctionalityList.length > 0 && contractLanguage !== '' && contractLanguage !== 'default'
    }

    const clearAdresse = () => {
        setValue('adresse.street', '');
        setValue('adresse.city', '');
        setValue('adresse.postalCode', '');
    }

    const handleContractLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setContractLanguage(e.target.value);
    };
    
    useEffect(() => {
        async function getDocumentById(collectionName: string, id: string,serviceId:string) {
            if(!id || !serviceId) return
            const docClientRef = doc(firebase.db, collectionName, id);
            const docServiceRef = doc(firebase.db, 'services', serviceId);
            const allRequest = [
            await getDoc(docClientRef),
            await getDoc(docServiceRef)
            ]
    
            const [clientSnap,serviceSnap] = await Promise.all(allRequest)
          
            if (clientSnap.exists() && serviceSnap.exists()) {
                const client = { id: clientSnap.id, ...clientSnap.data() } as Client;
                const service = { serviceId: serviceSnap.id, clientId: clientSnap.data().clientId,name: serviceSnap.data().name, serviceType: serviceSnap.data().serviceType,contractStatus: serviceSnap.data().contractStatus,contract:serviceSnap.data().contract ?? null } as Services;
                const contract = service.contract
                setService(service)
                console.log("service",service,"client",client)
                if (edit === 'true') {
                    loadContractFromCache()
                }else{
                    setClient(client);
                    reset(client)
                    if (contract) {
                        setFonctionalityList(contract.projectFonctionList)
                        reset(contract);
                        setMaintenaceType(contract.maintenanceType)
                        setContractLanguage(contract.contractLanguage);
                    }
                    setSelectedContractStatus(service.contractStatus)
                    setSelectedContractType(service.serviceType)
                    setLoading(false);
                }
            } else {
              console.log("Document non trouvé !");
              return null;
            }
        }
        const loadContractFromCache = () => {
            const contractData = sessionStorage.getItem('contractData');
            if (contractData) {
                const parsedData = JSON.parse(contractData);
                reset(parsedData.contract);
                setClient(parsedData.client);
                setContractLanguage(parsedData.contract.contractLanguage)
                setMaintenaceType(parsedData.contract.maintenanceType)
                setSelectedContractStatus(parsedData.client.contractStatus)
                setSelectedContractType(parsedData.client.contractType)
                setFonctionalityList(parsedData.contract.projectFonctionList)
                setLoading(false);
            }
        }
        getDocumentById("clients",clientId,clientServiceId);
    }, [edit,clientId]);
    useEffect(()=>{
        const loadCountrieData = async () => {
            try {
            const countries = await loadCountries();
            setCountries(countries.countries)
            } catch (error) {
                console.error('Erreur lors du chargement des pays :', error);
                return
            }
        }
        loadCountrieData();
    },[])
    console.log("selectedContractStatus",selectedContractStatus,"maintenaceType",maintenaceType)
    const handleContractStatusChange = (value: "signed" | "unsigned" | "pending") => {
        setSelectedContractStatus(value as 'signed' | 'unsigned' | 'pending');
    };

    const handleContractTypeChange = (value: "service"|"maintenance"|"service_and_maintenance") => {
        setSelectedContractType(value as "service"|"maintenance"|"service_and_maintenance");
    };

    useEffect(()=>{
        if (contextData && (contextData.state === "hide" || contextData.state === "show")) {
            console.log("inside contextData",contextData)
            setIsPopUp(contextData.value)
        }
    },[contextData])

    if (service?.contractStatus === 'signed' || (service?.contractStatus === 'unsigned' && !Cookies.get('logged'))) {
        router.push("/"+locale)
        return null
    }
    if (loading) return <div className="text-center py-8 mt-[110px] h-[200px] flex justify-center items-center w-[85%] mx-auto">Chargement...</div>;
    return (
        <main className={`transition-transform duration-700 delay-300 ease-in-out ${isPopUp ? 'translate-x-[-25vw]' : 'translate-x-0'} w-[85%] mt-[110px] mx-auto`}>
            <h1 className="text-center text-thirty uppercase">{t["contrat"]}</h1>
            <div className="max-w-3xl mx-auto p-6 bg-white shadow-md rounded-lg">
                <h1 className="text-2xl font-bold mb-6 flex justify-start items-center gap-2">Contrat de prestation de service/maintenace<span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(service?.contractStatus ?? '')}`}><i className={`${getStatusIcon(service?.contractStatus ?? '')} mr-1`}></i>{getStatusText(service?.contractStatus ?? '')}</span></h1>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* === Client Information === */}
                    <section className="border-b pb-6">
                        <h2 className="text-xl font-semibold mb-4">Information sur le client</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Nom complet / Nom de l'entreprise <em>*</em>
                                </label>
                                <input
                                    {...register("name", { required: "This field is required" })}
                                    className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                                />
                                {errors.name && (
                                    <p className="text-red-500 text-sm mt-1">{errors.name.message as string}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Type de client <em>*</em></label>
                                <div className="flex items-center justify-start gap-2 flex-wrap w-full mt-3">
                                    <div className="flex items-center gap-2">
                                        <input type="checkbox" id="particular" {...register("particular")}/>
                                        <label htmlFor="particular" className="ml-2 block text-sm font-medium text-gray-700">
                                            Particuler</label>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input type="checkbox" id="company" {...register("company")}/>
                                        <label htmlFor="company" className="ml-2 block text-sm font-medium text-gray-700">
                                            Entreprise</label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Adresse email <em>*</em></label>
                                <input
                                    type="email"
                                    {...register("clientEmail", {
                                    required: "Email is required",
                                    pattern: {
                                        value: /^\S+@\S+$/i,
                                        message: "Invalid email format",
                                    },
                                    })}
                                    className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                                />
                                {errors.clientEmail && (
                                    <p className="text-red-500 text-sm mt-1">{errors.clientEmail.message as string}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Numéro de téléphone <em>*</em></label>
                                <input
                                    type="tel"
                                    {...register("clientPhone", { required: "Phone is required" })}
                                    className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                                />
                                {errors.clientPhone && (
                                    <p className="text-red-500 text-sm mt-1">{errors.clientPhone.message as string}</p>
                                )}
                            </div>
                        </div>

                        <div className="my-4 w-full">
                            <label className="block text-sm font-medium text-gray-700">
                            Adresse <em>*</em>
                            </label>
                            <div>
                                <select name="" id="" className="mt-1 block w-full border border-gray-300 rounded-md p-2" onChange={(e:any)=>{e.target.value !== 'default' ? setSelectedCountry(JSON.parse(e.target.value)):setSelectedCountry(null);clearAdresse()}}>
                                    <option value="default">---Choisir un pays---</option>
                                    {
                                        countries.map((item, index) => ( 
                                            <option key={index} value={JSON.stringify(item)}>{item.name}</option>
                                        ))
                                    }
                                </select>
                            </div>
                        </div>
                        {
                        selectedCountry && (
                            <div className="flex justify-start items-center gap-3 flex-wrap w-full">
                            <div className="min-w-[16.875rem] w-max max-w-1/3">
                                <label className="block text-sm font-medium text-gray-700">
                                    Rue <em>*</em>
                                </label>
                                <input
                                    {...register("adresse.street", { required: "This field is required" })}
                                    placeholder="Street"
                                    className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                                />
                                {errors.adresse?.street && (
                                    <p className="text-red-500 text-sm mt-1">{errors.adresse.street.message as string}</p>
                                )}
                            </div>
                            <div className="min-w-[16.875rem] w-max max-w-1/3">
                                <label className="block text-sm font-medium text-gray-700">
                                    Ville <em>*</em>
                                </label>
                                <input
                                    {...register("adresse.city", { required: "This field is required" })}
                                    placeholder="City"
                                    className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                                />
                                {errors.adresse?.city && (
                                    <p className="text-red-500 text-sm mt-1">{errors.adresse.city.message as string}</p>
                                )}
                            </div>
                            <div className="min-w-[16.875rem] w-max max-w-1/3">
                                <label className="block text-sm font-medium text-gray-700">
                                    Code Postale <em>*</em>
                                </label>
                                <input
                                    {...register("adresse.postalCode", { required: "This field is required" })}
                                    placeholder="Code Postal"
                                    className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                                />
                                {errors.adresse?.postalCode && (
                                    <p className="text-red-500 text-sm mt-1">{errors.adresse.postalCode.message as string}</p>
                                )}
                            </div>
                            </div>
                        )
                    }
                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700">
                        Adresse de facturation (si différente)
                        </label>
                        <input
                        {...register("clientBillingAddress")}
                        className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                        />
                    </div>
                    </section>

                    {/* === Freelancer Information === */}
                    <section className="border-b pb-6">
                    <h2 className="text-xl font-semibold mb-4">Information sur le prestataire de service</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                        <label className="block text-sm font-medium text-gray-700">Nom complet / Nom de l'entreprise <em>*</em></label>
                        <input
                            {...register("freelancerName", { required: "This field is required" })}
                            className="mt-1 block w-full border border-gray-300 rounded-md p-2" value={'ROD TECH SOLUTIONS'} disabled={true}
                        />
                        </div>

                        <div>
                        <label className="block text-sm font-medium text-gray-700">Adresse <em>*</em></label>
                        <input
                            {...register("freelanceAddress", { required: "This field is required" })}
                            className="mt-1 block w-full border border-gray-300 rounded-md p-2" value={'123 rue Saint-Sébastien, Poissy 78300, France'} disabled={true}
                        />
                        </div>
                    </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">{t.invoice.identificationNumber} <em>*</em></label>
                                <input
                                    {...register("freelancerTaxId", { required: "This field is required" })}
                                    className="mt-1 block w-full border border-gray-300 rounded-md p-2" value={process.env.NEXT_PUBLIC_TAX_ID} disabled={true}
                                />
                            </div>
                        </div>
                    </section>

                    {/* === Project Details === */}
                    <section className="border-b pb-6">
                    <h2 className="text-xl font-semibold mb-4">Détailles du projet</h2>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nom du projet <em>*</em></label>
                        <input
                        {...register("projectTitle", { required: "This field is required" })}
                        className="mt-1 block w-full border border-gray-300 rounded-md p-2" disabled={service && service.contractStatus === 'pending' ? true : false}
                        />
                        {errors.projectTitle && (
                        <p className="text-red-500 text-sm mt-1">{errors.projectTitle.message as string}</p>
                        )}
                    </div>

                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700">Déscription du projet <em>*</em></label>
                        <textarea
                        {...register("projectDescription", { required: "Ce champ est requis" })}
                        rows={4}
                        className="mt-1 block w-full border border-gray-300 rounded-md p-2" disabled={service && service.contractStatus === 'pending' ? true : false}
                        />
                        {errors.projectDescription && (
                        <p className="text-red-500 text-sm mt-1">{errors.projectDescription.message as string}</p>
                        )}
                    </div>

                    {
                        Cookies.get('logged') && (<div className="my-4 w-full">
                            <label className="block text-sm font-medium text-gray-700">Ajouter des fonctionnalités *</label>
                            <div className="flex items-center mt-2 justify-start gap-1 w-full"><input className="p-2 bg-gray-200 w-2/4 focus:outline-none" value={fonction} type="text" onChange={(e)=>setFonction(e.target.value)}/><span className="p-2 cursor-pointer flex justify-start items-center gap-1 w-1/4 bg-slate-800 text-white rounded-[.2em]" onClick={()=>{fonction !== '' && setFonctionalityList([...fonctionalityList,fonction]);setFonction('')}}><Icon name="bx-plus" size="1.5em" color="#fff"/>Ajouter</span><span className="p-2 cursor-pointer w-1/4 flex justify-start items-center gap-1 bg-slate-800 text-white rounded-[.2em]" onClick={()=>{setFonctionalityList([]);setFonction('')}}><Icon name="bx-trash" size="1.5em" color="#fff"/>Vider la liste</span></div>
                        </div>)
                    }

                    {
                        fonctionalityList.length > 0 && (
                            <>
                            <label className="block text-sm font-medium text-gray-700 py-3">Liste des fonctionnalités principales</label>
                            <ul className="my-4 mx-4 list-disc">
                                {
                                    fonctionalityList.map((item, index) => (
                                        <li key={index} className={`${index === fonctionalityList.length - 1 ? 'mb-0' : 'mb-2'}`}>{item}</li>
                                    ))
                                }
                            </ul>
                            </>
                        )
                    }

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Date de début du contrat <em>*</em></label>
                            <input
                                type="date"
                                {...register("startDate", { required: "This field is required" })}
                                className="mt-1 block w-full border border-gray-300 rounded-md p-2" disabled={service && service.contractStatus === 'pending' ? true : false}
                            />
                            {errors.startDate && (
                                <p className="text-red-500 text-sm mt-1">{errors.startDate.message as string}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Date de fin du contrat (estimation)
                            </label>
                            <input
                                type="date"
                                {...register("endDate")}
                                className="mt-1 block w-full border border-gray-300 rounded-md p-2" disabled={service && service.contractStatus === 'pending' ? true : false}
                            />
                        </div>
                    </div>
                    </section>

                    {/* === Payment Terms === */}
                    <section className="border-b pb-6">
                        <h2 className="text-xl font-semibold mb-4">Conditions de paiement</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Prix ​​total (€) <em>*</em></label>
                                <input
                                    type="number"
                                    {...register("totalPrice", {
                                    required: "Price is required",
                                    min: { value: 0, message: "Price must be positive" },
                                    })}
                                    className="mt-1 block w-full border border-gray-300 rounded-md p-2" disabled={service && service.contractStatus === 'pending' ? true : false}
                                />
                                {errors.totalPrice && (
                                    <p className="text-red-500 text-sm mt-1">{errors.totalPrice.message as string}</p>
                                )}
                            </div>
                        </div>

                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700">Échéancier de paiement <em>*</em></label>
                            <textarea
                            {...register("paymentSchedule", { required: "Ce champ est requis",pattern: {
                                value: /^\d+%(?:,\d+%)*$/i,
                                message: "Structure invalide",
                            }, })}
                            rows={2}
                            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                            placeholder="50% au début, 50% a la livraison" disabled={service && service.contractStatus === 'pending' ? true : false}
                            />
                            {errors.paymentSchedule && (
                            <p className="text-red-500 text-sm mt-1">{errors.paymentSchedule.message as string}</p>
                            )}
                        </div>
                    </section>

                    <section className="border-b pb-6">
                        <h2 className="text-xl font-semibold mb-4">Services maintenace</h2>
                        {
                            Cookies.get('logged') && (<div className="flex gap-5 justify-start items-center">
                                <span className={`py-1 px-3 inline-flex text-xs leading-5 font-semibold rounded-[4px] cursor-pointer ${maintenaceType === 'web' ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-800'} ${service?.contractStatus === 'pending' ? 'pointer-events-none cursor-not-allowed' : 'pointer-events-auto cursor-pointer'}`} onClick={()=>chooseMaintenance('web')}>Web</span>
                                <span className={`py-1 px-3 inline-flex text-xs leading-5 font-semibold rounded-[4px] ${maintenaceType === 'app' ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-800'} ${service?.contractStatus === 'pending' ? 'pointer-events-none cursor-not-allowed' : 'pointer-events-auto cursor-pointer'}`} onClick={()=>chooseMaintenance('app')}>Application mobile</span>
                                <span className={`py-1 px-3 inline-flex text-xs leading-5 font-semibold rounded-[4px] cursor-pointer ${maintenaceType === 'saas' ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-800'} ${service?.contractStatus === 'pending' ? 'pointer-events-none cursor-not-allowed' : 'pointer-events-auto cursor-pointer'}`} onClick={()=>chooseMaintenance('saas')}>Application métier / SaaS</span>
                            </div>)
                        }
                        
                        {
                            maintenaceType === null && (<p className="text-red-500 text-sm mt-1">Indiquer le type de maintenance</p>)
                        }
                        {
                            maintenaceType !== null && (<div className="mt-4">
                                {
                                    maintenaceType === "app" ? (
                                        <div className="flex gap-2 justify-start items-center">
                                            <input type="checkbox" name="app" id="app" />
                                            <label className="block text-sm font-medium text-gray-700" htmlFor="app">Maintenance pour une application mobile</label>
                                        </div>
                                    ) : maintenaceType === "saas" ? (<div className="flex gap-2 justify-start items-center">
                                        <input type="checkbox" name="saas" id="saas" />
                                        <label className="block text-sm font-medium text-gray-700" htmlFor="saas">Maintenance pour une application métier / SaaS</label>
                                    </div>) : (<div className="flex gap-5 justify-start items-center flex-wrap">
                                        <div className="flex gap-2 justify-start items-center">
                                            <input type="checkbox" name="hour" id="hour" />
                                            <label className="block text-sm font-medium text-gray-700" htmlFor="hour">Facturation à l'heure (50€)/heure</label>
                                        </div>
                                        <div className="flex gap-2 justify-start items-center">
                                            <input type="checkbox" name="year" id="year" />
                                            <label className="block text-sm font-medium text-gray-700" htmlFor="year">Facturation annuélle (500€)/An</label>
                                        </div>
                                    </div>)
                                }
                            </div>)
                        }
                    </section>
                    {
                        Cookies.get('logged') && (
                            <>
                            <section className="border-b pb-6">
                                <h2 className="text-xl font-semibold mb-4">Choisir la langue pour le contrat <em>*</em></h2>
                                <select value={contractLanguage} onChange={handleContractLanguageChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-md p-2">
                                    <option value="default">---Choisir une langue---</option>
                                    <option value="fr">Français</option>
                                    <option value="en">English</option>
                                    <option value="en">Allemand</option>
                                </select>
                                {
                                    contractLanguage === 'default' || contractLanguage === '' && (<p className="text-red-500 text-sm mt-1">Veuillez choisir une langue</p>)
                                }
                            </section>
                            <section className="border-b pb-6">
                                <h2 className="text-xl font-semibold mb-4">Modifier le type de contrat</h2>
                                <select value={selectedContractType as "service"|"maintenance"|"service_and_maintenance"} onChange={(e:any)=>handleContractTypeChange(e.target.value)}
                                className="mt-1 block w-full border border-gray-300 rounded-md p-2">
                                {
                                    contractType.map((item, index) => (
                                        <option key={index} value={item.value} >{item.label}</option>
                                    ))
                                }  
                                </select>
                            </section>
                            <section className="border-b pb-6">
                                <h2 className="text-xl font-semibold mb-4">Modifier le status du contrat</h2>
                                <select value={selectedContractStatus as "pending"|"unsigned"|"signed"} onChange={(e:any)=>handleContractStatusChange(e.target.value)}
                                className="mt-1 block w-full border border-gray-300 rounded-md p-2">
                                {
                                    contractStatus.map((item, index) => (
                                        <option key={index} value={item.value} >{item.label}</option>
                                    ))
                                }
                                </select>
                            </section>
                            </>
                        )
                    }
                    
                    {/* Submit Button */}
                    <div className="flex justify-end gap-3">
                        {
                            Cookies.get('logged')  && (<a href={'/'+locale+'/clients-list'} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Liste client</a>)
                        }
                        
                        <button
                            type="submit"
                            className={`px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 ${checkFormValidation() ? 'opacity-1 cursor-pointer' : 'opacity-50 cursor-not-allowed'}`} disabled={!checkFormValidation()}
                        >
                            Générer le contrat
                        </button>
                    </div>
                </form>
            </div>
        </main>
    )
    
}

export default Contrat
