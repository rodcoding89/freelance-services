"use client"
import { AppContext } from "@/app/context/app-context";
import { useTranslationContext } from "@/hooks/app-hook";
import { getDoc, doc, updateDoc, setDoc } from 'firebase/firestore';
import { useState, useContext, useEffect, useRef } from "react";
import Cookies from 'js-cookie';
import { useForm } from "react-hook-form";
import firebase from '@/utils/firebase'; // Importez votre configuration Firebase
import { useParams, useRouter, useSearchParams } from "next/navigation";
import SalesTax from 'sales-tax';
import Icon from "./Icon";
import { loadCountries } from "@/utils/fonction";

interface Services {
  clientId:string;
  name:string;
  serviceType: "service"|"maintenance"|"service_and_maintenance";
  contractStatus: 'signed' | 'unsigned' | 'pending';
  contract?:Contract;
}

interface Client {
    id?: string;
    name:string;
    email?:string;
    modifDate:string;
    clientNumber:number;
    invoiceCount?:number;
    clientLang:string;
}

interface contractFormPrestataire{
    freelancerName:string;
    freelancerTaxId?:string;
    freelanceAddress:string;
    projectTitle:string;
    projectDescription:string;
    startDate:string;
    endDate:string;
    totalPrice:number;
    paymentSchedule:string;
    maintenanceCategory:"app"|"saas"|"website"|"ecommerce"|null;
}
interface state {
    name:string,
    tax:number,
    vat:string,
    stateCode:string
}
interface clientCountry {
    name:string,
    taxB2C:string,
    taxB2B:string,groupe:string,
    currency:string,
    isoCode:string,threshold_before_tax:number,
    specficTo:"state"|"country",
    vat?:string,
    state:state|null
}
interface countryState {
    name:string,
    taxB2C:string,
    taxB2B:string,groupe:string,
    currency:string,
    isoCode:string,threshold_before_tax:number,
    specficTo:"state"|"country",vat?:string,
    state:{name:string,tax:number,vat:string,threshold:number,stateCode:string}[]|null
}
interface contractFormClient{
    name:string;
    adresse:{
        street:string;
        postalCode:string;
        city:string;
        country:clientCountry;
    }
    typeClient:"company"|"particular";
    clientBillingAddress?:string;
    clientEmail:string;
    clientPhone:string;
    clientVatNumber?:string;
    typeMaintenance?:"perYear"|"perHour"|"";
}

interface Contract {
    clientGivingData:contractFormClient|null,
    prestataireGivingData:contractFormPrestataire|null,
    contractType: "service"|"maintenance"|"service_and_maintenance";
    maintenanceCategory:"app"|"saas"|"website"|"ecommerce"|null;
    mprice:number;
    projectFonctionList:{title:string,content:string}[];
    contractLanguage:string;
    saleTermeConditionValided?:boolean;
    electronicContractSignatureAccepted?:boolean;
    rigthRetractionLostAfterServiceBegin?:boolean;
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
    { value: "pending", label: "En Attente de Signature" },
    { value: "signed", label: "Signé" },
];
const enableCheckTaxNumerCountr = ["US","CA","DE","FR","IT","ES","AT","BE","NL"]
const Contrat:React.FC<ContractProps> = ({locale})=>{
    const t:any = useTranslationContext();
    const [isPopUp,setIsPopUp] = useState<boolean>(false)
    const [maintenanceCategory,setMaintenaceType] = useState<"app"|"saas"|"website"|"ecommerce"|null>(null)
    const [loading, setLoading] = useState(true);
    const [loader, setLoader] = useState(false);
    const {contextData} = useContext(AppContext)
    const [fonctionalityList, setFonctionalityList] = useState<{title:string,content:string}[]>([])
    const [fonctionalityTitle, setFonctionalityTile] = useState<string>('')
    const [fonctionalityDescription, setFonctionalityDescription] = useState<string>('')
    const router = useRouter();

    const [selectedCountry,setSelectedCountry] = useState<countryState|null>(null)

    const countryToSave = useRef<clientCountry|null>(null)

    const [currentCountry,setCurrentCountry] = useState<string|null>(null)
    const [currentState,setCurrentState] = useState<string|null>(null)
    const toSaveState = useRef<state|null>(null)
    const [client, setClient] = useState<Client|null>(null)
    const maintenaceCost = useRef<number>(0)
    const [service, setService] = useState<Services|null>(null)
    const [selectedContractType, setSelectedContractType] = useState<"service"|"maintenance"|"service_and_maintenance"|null>(null);
    const [selectedContractStatus, setSelectedContractStatus] = useState<'signed' | 'unsigned' | 'pending'|null>(null);

    const [countries, setCountries] = useState<countryState[]>([])

    const companyAdress = `${process.env.NEXT_PUBLIC_COMPANY_ADRESS_STREET} ${process.env.NEXT_PUBLIC_COMPANY_ADRESS_CITY} ${process.env.NEXT_PUBLIC_COMPANY_ADRESS_POSTAL_CODE} ${process.env.NEXT_PUBLIC_COMPANY_ADRESS_COUNTRY}`
    const companyName = process.env.NEXT_PUBLIC_COMPANY_NAME
    // Contenu dynamique basé sur la langue
    const searchParams = useSearchParams();
    const edit = searchParams.get('edit');
    const {id,serviceId} = useParams()
    const clientId = id as string
    const [vatNumberChecking,setVatNumberChecking] = useState<{success:boolean,message:string}|null>(null)
    const clientServiceId = serviceId as string;
    const [perHourCost,setPerHourCost] = useState(0)
    const [perYearCost,setPerYearCost] = useState(0)
    const {
        register: registerClient,
        handleSubmit: handleSubmitClient,
        reset: resetClient,
        setValue: setValueClient,
        watch: watchClient,
        formState: { errors: errorsClient, isValid: isValidClient }
    } = useForm<contractFormClient>({ mode: 'onChange' });
    const {
        register: registerPrestataire,
        handleSubmit: handleSubmitPrestataire,
        reset: resetPrestataire,
        setValue: setValuePrestataire,
        watch: watchPrestataire,
        formState: { errors: errorsPrestataire, isValid: isValidPrestataire }
    } = useForm<contractFormPrestataire>({ mode: 'onChange' });
    const typeClient = watchClient("typeClient");
    const clientVatNumber = watchClient("clientVatNumber");
    const typeMaintenance = watchClient("typeMaintenance");

    const checkClientTaxNumber = async (isoCode:string,taxNumber:string)=>{
        if (enableCheckTaxNumerCountr.includes(isoCode)) {
            const response = await SalesTax.validateTaxNumber ( isoCode,taxNumber) 
            return {success:response,message:response ? `Numéro de Tax valid` : `Numéro de Tax invalid, modifié le sinon le montant sera facturé avec la Tax.`}
        } else {
            return {success:false,message:`Numéro de Tax non prise en charge`}
        }
    }

    const onSubmitPrestataire = async(data:contractFormPrestataire) => {
        if(!selectedContractType || !maintenanceCategory) return
        setLoader(true)
        console.log("provider data",data)
        const formData = {...data}
        const contractItem = {...service?.contract,prestataireGivingData:formData,projectFonctionList:fonctionalityList,maintenanceCategory:maintenanceCategory,contractLanguage:client?.clientLang ?? 'en',contractType:selectedContractType,clientGivingData:service?.contract?.clientGivingData ? service?.contract?.clientGivingData : null,mprice:0}
        console.log("provider data contract",contractItem,"formData",formData)
        const parsedService = {...service,clientId:service?.clientId ?? clientId,name:service?.name ?? selectedContractType,serviceType:selectedContractType,contractStatus:selectedContractStatus ?? 'unsigned',contract:contractItem}
        const clientData = {...client,modifDate:new Date().toLocaleDateString()}
        saveContractAndNavigate(clientData,parsedService)
    }

    const onSubmitClient = async(data:contractFormClient) => {
        if(!countryToSave.current || !selectedContractType || !maintenanceCategory) return
        setLoader(true);
        const clientInfo = {...data, adresse: {...data.adresse, country: countryToSave.current}}
        const contract = {
            ...service?.contract,
            prestataireGivingData: service?.contract?.prestataireGivingData || null,
            clientGivingData: clientInfo,
            contractType: selectedContractType,
            maintenanceCategory: service?.contract?.maintenanceCategory ?? null,contractLanguage:service?.contract?.contractLanguage ?? 'en',mprice:maintenaceCost.current,projectFonctionList:service?.contract?.projectFonctionList ?? fonctionalityList
        };
        
        const parsedService = {...service,clientId:service?.clientId ?? clientId,name:service?.name ?? selectedContractType,serviceType:selectedContractType,contractStatus:selectedContractStatus ?? 'unsigned',contract:contract};
        const clientData = {...client,name:data.name,modifDate:new Date().toLocaleDateString()}
        saveContractAndNavigate(clientData,parsedService)
        // Generate PDF or send data to backend
    };

    const saveContractAndNavigate = async(clientData:any,parsedService:Services) => {
        if (Cookies.get('logged')) {
            try {
                const docService = doc(firebase.db,"services",clientServiceId)
                await setDoc(docService, { ...parsedService }, { merge: false })
                sessionStorage.setItem('contractData', JSON.stringify({client:clientData,service:parsedService}));
                router.push("/"+(client?.clientLang ?? 'en')+"/sign-contract/"+clientId+'/'+clientServiceId)
            } catch (error) {
                setLoader(false)
                console.error('Erreur lors de la mise à jour du document :', error);
            }
        }else{
            sessionStorage.setItem('contractData', JSON.stringify({client:clientData,service:parsedService}));
            router.push("/"+(client?.clientLang ?? 'en')+"/sign-contract/"+clientId+'/'+clientServiceId)
        }
        //console.log("Contract Data:", contract);
    }
        
    
    const getStatusText = (status: string) => {
        if(!status) return t.unknownStatus;
        switch (status) {
        case 'signed': return t.signedContract;
        case 'pending': return t.pendingContract;
        case 'unsigned': return t.unsignedContract;
        default: return t.unknownStatus;
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
    
    const chooseMaintenance = (type:"app"|"saas"|"website"|"ecommerce")=>{
        setMaintenaceType((prev)=>{
            if(prev === type) return null
            return type
        })
    }

    const checkFormValidation = ()=>{
        if (Cookies.get('logged')) {
            return maintenanceCategory !== null && selectedContractType !== null && selectedContractStatus !== null && fonctionalityList.length > 0 && isValidPrestataire
        } else {
            //console.log("isValidClient",isValidClient,"countryToSave",countryToSave.current,"typeClient",typeClient,"clientVatNumber",clientVatNumber,"selectedContractType",selectedContractType,"countryToSave",toSaveState.current)
            return isValidClient && countryToSave.current !== null && (typeClient === 'company' ? clientVatNumber !== '' : true) && (selectedContractType === 'service_and_maintenance' ? (typeMaintenance !== "") : true) && (countryToSave.current?.specficTo === 'state' ? toSaveState.current !== null : true)
        }
    }
    
    const clearAdresse = () => {
        setValueClient('adresse.street', '');
        setValueClient('adresse.city', '');
        setValueClient('adresse.postalCode', '');
    }

    const handleStateChange = (e:any)=>{
        if (e.target.value !== 'default') {
            setCurrentState(e.target.value)
            const state = selectedCountry?.state?.find((item:any) => item.name === e.target.value);
            toSaveState.current = state ?? null
            if (countryToSave.current) {
                countryToSave.current = {...countryToSave.current,state:toSaveState.current}
            } else {
                countryToSave.current = null
            }
            
        }else{
            setCurrentState(null);
            toSaveState.current = null
        }
    }

    const handleCountryChange = async(e:any)=>{
        if (e.target.value !== 'default') {
            setCurrentCountry(e.target.value)
            const country = countries.find((item:any) => item.name === e.target.value);
            setSelectedCountry(country ?? null)
            countryToSave.current = country ? {...country,state:null} : null
            if(clientVatNumber && clientVatNumber !== ''){
                const response = await checkClientTaxNumber(countryToSave.current?.isoCode ?? '',clientVatNumber)
                //console.log("response",response)
                setVatNumberChecking(response)
            }
        } else {
            setCurrentCountry(null);
            clearAdresse()
        }
    }

    const parseInputDate = ()=>{
        return `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`
    }

    useEffect(() => {
        const loadCountrieData = async () => {
            try {
            const countries = await loadCountries();
            return countries.countries
            } catch (error) {
                console.error('Erreur lors du chargement des pays :', error);
                return
            }
        }
        const checkUserConnection = (contractStatus:"signed"|"unsigned"|"pending")=>{
            if (Cookies.get('logged') || contractStatus === 'pending') {
            }else{
                router.push("/"+locale)
                return null
            }
        }
        async function getDocumentById(collectionName: string, id: string,serviceId:string) {
            if(!id || !serviceId) return
            const docClientRef = doc(firebase.db, collectionName, id);
            const docServiceRef = doc(firebase.db, 'services', serviceId);
            const allRequest = [
                await getDoc(docClientRef),
                await getDoc(docServiceRef)
            ]
            const countriesList = await loadCountrieData();
            setCountries(countriesList)
            const [clientSnap,serviceSnap] = await Promise.all(allRequest)
          
            if (clientSnap.exists() && serviceSnap.exists()) {
                const client = { id: clientSnap.id, ...clientSnap.data() } as Client;
                const service = { clientId: serviceSnap.data().clientId,name: serviceSnap.data().name, serviceType: serviceSnap.data().serviceType,contractStatus: serviceSnap.data().contractStatus,contract:serviceSnap.data().contract ?? null } as Services;
                const contract = service.contract
                setService(service)
                checkUserConnection(service.contractStatus)
                //console.log("service",service,"client",client)
                if (edit === 'true') {
                    loadContractFromCache(countriesList)
                }else{
                    setClient(client);
                    if (contract) {
                        setFonctionalityList(contract.projectFonctionList)
                        if (contract.clientGivingData) {
                            resetClient(contract.clientGivingData);
                            const country = countriesList.find((item:any) => item.name === contract.clientGivingData?.adresse.country.name);
                            setCurrentCountry(country?.name ?? null)
                            countryToSave.current = country ?? null
                            if (country.specficTo === 'state' && country.name === contract.clientGivingData.adresse.country.name) {
                                const updateCountry = {...country,state:contract.clientGivingData.adresse.country.state}
                                countryToSave.current = updateCountry ?? null
                                toSaveState.current = contract.clientGivingData.adresse.country.state
                                setCurrentState(contract.clientGivingData.adresse.country.state?.name ?? '')
                            }else{
                                countryToSave.current = country ?? null
                            }
                        }else{
                            resetClient({clientEmail:client.email,name:client.name});
                        }
                        if (contract.prestataireGivingData) {
                            resetPrestataire(contract.prestataireGivingData);
                        }
                        setMaintenaceType(contract.maintenanceCategory)
                    }else{
                        resetClient({clientEmail:client.email,name:client.name});
                        resetPrestataire(contract);
                    }
                    setSelectedContractStatus(service.contractStatus)
                    setSelectedContractType(service.serviceType)
                    setLoading(false);
                }
            } else {
              console.log("Document non trouvé !");
              router.push("/"+locale)
              return null;
            }
        }
        
        const loadContractFromCache = (countriesList:any[]) => {
            const contractData = sessionStorage.getItem('contractData');
            if (contractData) {
                const parsedData = JSON.parse(contractData);
                setClient(parsedData.client);
                if (parsedData.service.contract) {
                    if (parsedData.service.contract.clientGivingData) {
                        resetClient(parsedData.service.contract.clientGivingData);
                        const country = countriesList.find(item => item.name === parsedData.service.contract.clientGivingData.adresse.country.name);
                        setCurrentCountry(country?.name ?? null)
                        setSelectedCountry(country)
                        if (country.specficTo === 'state' && country.name === parsedData.service.contract.clientGivingData.adresse.country.name) {
                            const updateCountry = {...country,state:parsedData.service.contract.clientGivingData.adresse.country.state}
                            countryToSave.current = updateCountry ?? null
                            toSaveState.current = parsedData.service.contract.clientGivingData.adresse.country.state
                            setCurrentState(parsedData.service.contract.clientGivingData.adresse.country.state.name)
                        }else{
                           countryToSave.current = country ?? null
                        }
                    }
                    if (parsedData.service.contract.prestataireGivingData) {
                        resetPrestataire(parsedData.service.contract.prestataireGivingData);
                    }
                    setMaintenaceType(parsedData.service.contract.maintenanceCategory)
                    setFonctionalityList(parsedData.service.contract.projectFonctionList)
                }
                setSelectedContractStatus(parsedData.service.contractStatus)
                setSelectedContractType(parsedData.service.serviceType)
                checkUserConnection(parsedData.service.contractStatus)
                setLoading(false);
            }else{
                router.push("/"+locale)
            }
        }
        getDocumentById("clients",clientId,clientServiceId);
    }, [edit,clientId,router,locale]);
    
    const handleContractStatusChange = (value: "signed" | "unsigned" | "pending") => {
        setSelectedContractStatus(value as 'signed' | 'unsigned' | 'pending');
    };

    const handleContractTypeChange = (value: "service"|"maintenance"|"service_and_maintenance") => {
        setSelectedContractType(value as "service"|"maintenance"|"service_and_maintenance");
    };

    const resetInput = () => {
        setValueClient('typeMaintenance','');
    }

    const disableProviderInput = ()=>{
        return false
    }

    const disableClientInput = () =>{
        const env = process.env.NEXT_PUBLIC_ENV
        if (env === "dev") {
            return false;
        } else {
            if (!Cookies.get('logged')) {
                return false
            } else {
                return true
            }
        }
    }

    useEffect(()=>{
        if (contextData && (contextData.state === "hide" || contextData.state === "show")) {
            console.log("inside contextData",contextData)
            setIsPopUp(contextData.value)
        }
    },[contextData])

    useEffect(()=>{
        if (typeMaintenance === 'perHour') {
            maintenaceCost.current = process.env.NEXT_PUBLIC_MAINTENACE_COST_PER_HOUR as unknown as number;
        } else if(typeMaintenance === 'perYear') {
            maintenaceCost.current = process.env.NEXT_PUBLIC_MAINTENACE_COST_PER_YEAR as unknown as number;
        }
        if (maintenanceCategory === 'website') {
            setPerHourCost(process.env.NEXT_PUBLIC_MAINTENACE_WEBSITE_COST_PER_HOUR as unknown as number)
            setPerYearCost(process.env.NEXT_PUBLIC_MAINTENACE_WEBSITE_COST_PER_YEAR as unknown as number)
        } else if(maintenanceCategory === 'ecommerce') {
            setPerHourCost(process.env.NEXT_PUBLIC_MAINTENACE_ECOMMERCE_COST_PER_HOUR as unknown as number)
            setPerYearCost(process.env.NEXT_PUBLIC_MAINTENACE_ECOMMERCE_COST_PER_YEAR as unknown as number)
        }
    },[typeMaintenance,maintenanceCategory])

    useEffect(()=>{
        const clientTaxNumberValidation = async()=>{
            if (clientVatNumber && clientVatNumber !== '') {
                const response = await checkClientTaxNumber(countryToSave.current?.isoCode ?? '',clientVatNumber)
                console.log("response",response)
                setVatNumberChecking(response)
            }
            //setVatNumberChecking(null)
        }
        clientTaxNumberValidation()
        console.log("clientVatNumber",clientVatNumber,"countryToSave",countryToSave.current)
    },[clientVatNumber])
    console.log("vatNumberChecking",vatNumberChecking)
    if (loading) return <div className="text-center py-8 mt-[110px] h-[200px] flex justify-center items-center w-[85%] mx-auto">{t.loading}</div>;
    return (
        <main className={`transition-transform duration-700 delay-300 ease-in-out ${isPopUp ? 'translate-x-[-25vw]' : 'translate-x-0'} w-[85%] mt-[110px] mx-auto`}>
            <h1 className="text-center text-thirty uppercase">{t["contrat"]}</h1>
            <div className="max-w-3xl mx-auto p-6 bg-white shadow-md rounded-lg">
                <div className="flex justify-start items-center gap-2 mb-6 flex-wrap">
                    <h1 className="text-2xl font-bold">{t.contractPrestation}</h1>
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(service?.contractStatus ?? '')}`}><i className={`${getStatusIcon(service?.contractStatus ?? '')} mr-1`}></i>{getStatusText(service?.contractStatus ?? '')}</span>
                </div>

                <form id="onSubmitClientForm" onSubmit={handleSubmitClient(onSubmitClient)} className="space-y-6">
                    {/* === Client Information === */}
                    <section className="border-b pb-6">
                        <h2 className="text-xl font-semibold mb-4">{t.clientGivingData}</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    {t.clientName} <em className="text-red-700">*</em>
                                </label>
                                <input
                                    {...registerClient("name", { required: t.fileRequirer })}
                                    className="mt-1 block w-full border border-gray-300 rounded-md p-2" disabled={disableClientInput()}
                                />
                                {errorsClient.name && (
                                    <p className="text-red-500 text-sm mt-1">{errorsClient.name.message as string}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">{t.clientType} <em className="text-red-700">*</em></label>
                                <div className="flex items-center justify-start gap-2 flex-wrap w-full mt-3">
                                    <div className="flex items-center gap-2">
                                        <input type="radio" id="particular" {...registerClient("typeClient", { required: true })} value={"particular"} disabled={disableClientInput()}/>
                                        <label htmlFor="particular" className="ml-2 block text-sm font-medium text-gray-700">
                                            {t.particular}</label>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input type="radio" id="company" {...registerClient("typeClient", { required: true })} value={"company"} disabled={disableClientInput()}/>
                                        <label htmlFor="company" className="ml-2 block text-sm font-medium text-gray-700">
                                            {t.company}</label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">{t.email} <em className="text-red-700">*</em></label>
                                <input
                                    type="email"
                                    {...registerClient("clientEmail", {
                                        required: t.errorEmail,
                                        pattern: {
                                            value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/i,
                                            message: t.invalidEmail,
                                        },
                                    })}
                                    className="mt-1 block w-full border border-gray-300 rounded-md p-2" disabled={disableClientInput()}
                                />
                                {errorsClient.clientEmail && (
                                    <p className="text-red-500 text-sm mt-1">{errorsClient.clientEmail.message as string}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">{t.tel} <em className="text-red-700">*</em></label>
                                <input
                                    type="tel"
                                    {...registerClient("clientPhone", { required: t.errorTel })}
                                    className="mt-1 block w-full border border-gray-300 rounded-md p-2" disabled={disableClientInput()}
                                />
                                {errorsClient.clientPhone && (
                                    <p className="text-red-500 text-sm mt-1">{errorsClient.clientPhone.message as string}</p>
                                )}
                            </div>
                        </div>

                        <div className="my-4 w-full">
                            <label className="block text-sm font-medium text-gray-700">
                            {t.adresse.title} <em className="text-red-700">*</em>
                            </label>
                            <div>
                                <select value={currentCountry || "default"} id="" className="mt-1 block w-full border border-gray-300 rounded-md p-2" onChange={handleCountryChange} disabled={disableClientInput()}>
                                    <option value="default">{t.adresse.default}</option>
                                    {
                                        countries.map((item, index) => ( 
                                            <option key={index} value={item.name}>{t.adresse[item.name]}</option>
                                        ))
                                    }
                                </select>
                            </div>
                        </div>
                        {
                        currentCountry && (
                            <div className="flex justify-between items-center gap-3 flex-wrap w-full">
                            <div className="w-max max-w-1/3 min-w-[14rem]">
                                <label className="block text-sm font-medium text-gray-700">
                                    {t.adresse.street} <em className="text-red-700">*</em>
                                </label>
                                <input
                                    {...registerClient("adresse.street", { required: t.fileRequirer })}
                                    placeholder={t.adresse.street}
                                    className="mt-1 block w-full border border-gray-300 rounded-md p-2" disabled={disableClientInput()}
                                />
                                {errorsClient.adresse?.street && (
                                    <p className="text-red-500 text-sm mt-1">{errorsClient.adresse.street.message as string}</p>
                                )}
                            </div>
                            <div className="min-w-[14rem] w-max max-w-1/3">
                                <label className="block text-sm font-medium text-gray-700">
                                    {t.adresse.city} <em className="text-red-700">*</em>
                                </label>
                                <input
                                    {...registerClient("adresse.city", { required: t.fileRequirer })}
                                    placeholder={t.adresse.city}
                                    className="mt-1 block w-full border border-gray-300 rounded-md p-2" disabled={disableClientInput()}
                                />
                                {errorsClient.adresse?.city && (
                                    <p className="text-red-500 text-sm mt-1">{errorsClient.adresse.city.message as string}</p>
                                )}
                            </div>
                            <div className="min-w-[14rem] w-max max-w-1/3">
                                <label className="block text-sm font-medium text-gray-700">
                                    {t.adresse.codePostal} <em className="text-red-700">*</em>
                                </label>
                                <input
                                    {...registerClient("adresse.postalCode", { required: t.fileRequirer })}
                                    placeholder={t.adresse.codePostal}
                                    className="mt-1 block w-full border border-gray-300 rounded-md p-2" disabled={disableClientInput()}
                                />
                                {errorsClient.adresse?.postalCode && (
                                    <p className="text-red-500 text-sm mt-1">{errorsClient.adresse.postalCode.message as string}</p>
                                )}
                            </div>
                            {
                                (selectedCountry && selectedCountry.specficTo === "state" && currentCountry === selectedCountry.name) && (
                                    <div className="w-full">
                                        <label className="block text-sm font-medium text-gray-700">
                                            {t.adresse.state} <em className="text-red-700">*</em>
                                        </label>
                                        <select value={currentState || 'default'} id="" className="mt-1 block w-full border border-gray-300 rounded-md p-2" onChange={handleStateChange} disabled={disableClientInput()}>
                                            <option value="default">{t.adresse.defaultState}</option>
                                            {
                                                selectedCountry.state?.map((item, index) => ( 
                                                    <option key={index} value={item.name}>{item.name}</option>
                                                ))
                                            }
                                        </select>
                                    </div>)
                            }
                            </div>
                        )
                    }
                    <div className="flex justify-between items-center gap-3 flex-wrap w-full my-3">
                        {
                            (typeClient === 'company' && currentCountry) && <div className="min-w-[14rem] w-max max-w-1/3">
                                <label className="block text-sm font-medium text-gray-700">
                                {t.taxNumberText.replace("{tax}",selectedCountry?.vat ?? 'VAT')} <em className="text-red-700">*</em>
                                </label>
                                <input
                                {...registerClient("clientVatNumber")}
                                className="mt-1 block w-full border border-gray-300 rounded-md p-2" disabled={disableClientInput()}
                                />
                                {vatNumberChecking && (
                                    <p className={`text-sm mt-1 ${vatNumberChecking.success ? 'text-green-600' : 'text-red-500'}`}>{vatNumberChecking.message}</p>
                                )}
                            </div>
                        }
                        <div className="min-w-[14rem] w-max max-w-1/3">
                            <label className="block text-sm font-medium text-gray-700">
                            {t.diffAdresse}
                            </label>
                            <input
                            {...registerClient("clientBillingAddress")}
                            className="mt-1 block w-full border border-gray-300 rounded-md p-2" disabled={disableClientInput()}
                            />
                        </div>
                    </div>
                    {
                        maintenanceCategory !== null && (<div>
                            <h2 className="text-xl font-semibold my-4">{`${t.maintenanceService.title} ( ${maintenanceCategory === 'website' ? t.website : maintenanceCategory === 'ecommerce' ? t.ecommerce : maintenanceCategory === 'saas' ? t.saasTitle : t.appTitle})`} {selectedContractType === 'service_and_maintenance' && <em className="text-red-700">*</em>}</h2>
                            <div className="mt-4">
                                {
                                    maintenanceCategory === "app" ? (
                                        <div className="flex gap-2 justify-start items-center">
                                            <input type="checkbox" name="app" id="app" disabled={disableClientInput()}/>
                                            <label className="block text-sm font-medium text-gray-700" htmlFor="app">{t.maintenanceService.maintenanceApp}</label>
                                        </div>
                                    ) : maintenanceCategory === "saas" ? (<div className="flex gap-2 justify-start items-center">
                                        <input type="checkbox" name="saas" id="saas" disabled={disableClientInput()}/>
                                        <label className="block text-sm font-medium text-gray-700" htmlFor="saas">{t.maintenanceService.maintenanceSaas}</label>
                                    </div>) : (<div className="flex gap-5 justify-start items-center flex-wrap">
                                        <div className="flex gap-2 justify-start items-center">
                                            <input type="radio" {...registerClient("typeMaintenance")} value={"perHour"} id="hour" disabled={disableClientInput()}/>
                                            <label className="block text-sm font-medium text-gray-700" htmlFor="hour">{t.maintenanceService.pricePerHour.replace("{price}",perHourCost)}</label>
                                        </div>
                                        <div className="flex gap-2 justify-start items-center">
                                            <input type="radio" {...registerClient("typeMaintenance")} value={"perYear"} id="year" disabled={disableClientInput()}/>
                                            <label className="block text-sm font-medium text-gray-700" htmlFor="year">{t.maintenanceService.pricePerYear.replace("{price}",perYearCost)}</label>
                                        </div>
                                        <div onClick={resetInput} className="px-2 py-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-[.8rem] text-center cursor-pointer">{t.reset}</div>
                                    </div>)
                                }
                            </div>
                        </div>)
                    }
                    </section>
                </form>
                <form onSubmit={handleSubmitPrestataire(onSubmitPrestataire)} className="space-y-6">

                    {/* === Freelancer Information === */}
                    <section className="border-b pb-6">
                    <h2 className="text-xl font-semibold my-4">{t.freelancerInfo}</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                        <label className="block text-sm font-medium text-gray-700">{t.freelancerCompanyName} <em className="text-red-700">*</em></label>
                        <input
                            {...registerPrestataire("freelancerName", { required: t.fileRequirer })}
                            className="mt-1 block w-full border border-gray-300 rounded-md p-2" value={companyName} disabled={true}
                        />
                        </div>

                        <div>
                        <label className="block text-sm font-medium text-gray-700">{t.freelancerCompanyAdresse} <em className="text-red-700">*</em></label>
                        <input
                            {...registerPrestataire("freelanceAddress", { required: t.fileRequirer })}
                            className="mt-1 block w-full border border-gray-300 rounded-md p-2" value={companyAdress} disabled={true}
                        />
                        </div>
                    </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">{t.invoice.identificationNumber} <em className="text-red-700">*</em></label>
                                <input
                                    {...registerPrestataire("freelancerTaxId", { required: t.fileRequirer })}
                                    className="mt-1 block w-full border border-gray-300 rounded-md p-2" value={process.env.NEXT_PUBLIC_TAX_ID} disabled={true}
                                />
                            </div>
                        </div>
                    </section>

                    {/* === Project Details === */}
                    <section className="border-b pb-6">
                    <h2 className="text-xl font-semibold mb-4">{t.projetInfo}</h2>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">{t.projetTitle} <em className="text-red-700">*</em></label>
                        <input
                        {...registerPrestataire("projectTitle", { required: t.fileRequirer })}
                        className="mt-1 block w-full border border-gray-300 rounded-md p-2" disabled={disableProviderInput()}
                        />
                        {errorsPrestataire.projectTitle && (
                        <p className="text-red-500 text-sm mt-1">{errorsPrestataire.projectTitle.message as string}</p>
                        )}
                    </div>

                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700">{t.projetDescription} <em className="text-red-700">*</em></label>
                        <textarea
                        {...registerPrestataire("projectDescription", { required: t.fileRequirer })}
                        rows={4}
                        className="mt-1 block w-full border border-gray-300 rounded-md p-2" disabled={disableProviderInput()}
                        />
                        {errorsPrestataire.projectDescription && (
                        <p className="text-red-500 text-sm mt-1">{errorsPrestataire.projectDescription.message as string}</p>
                        )}
                    </div>

                    {
                        Cookies.get('logged') && (<div className="my-4 w-full">
                            <label className="block text-sm font-medium text-gray-700">{t.projetFonctionality} <em className="text-red-700">*</em></label>
                            <div className="flex items-start gap-5 mt-2 justify-start flex-col w-full flex-wrap">
                                <input className="p-2 bg-[#f5f5f5] w-3/5 min-w-[14rem] focus:outline-none" value={fonctionalityTitle} type="text" placeholder="Titre de la fonctionnalité" onChange={(e)=>setFonctionalityTile(e.target.value)}/>
                                <textarea className="p-2 bg-[#f5f5f5] w-3/5 min-w-[14rem] focus:outline-none" placeholder="Description de la fonctionnalité" id="" value={fonctionalityDescription} onChange={(e)=>setFonctionalityDescription(e.target.value)}></textarea>
                                <span className="p-2 cursor-pointer flex justify-start items-center gap-1 w-fit bg-slate-800 text-white rounded-[.2em]" onClick={()=>{(fonctionalityTitle !== '' && fonctionalityDescription !== '') && setFonctionalityList([...fonctionalityList,{title:fonctionalityTitle,content:fonctionalityDescription}]);setFonctionalityTile('');setFonctionalityDescription('')}}><Icon name="bx-plus" size="1.5em" color="#fff"/>{t.add}</span><span className="p-2 cursor-pointer w-fit flex justify-start items-center gap-1 bg-slate-800 text-white rounded-[.2em]" onClick={()=>{setFonctionalityList([]);setFonctionalityTile('');setFonctionalityDescription('')}}><Icon name="bx-trash" size="1.5em" color="#fff"/>{t.clearListe}</span></div>
                        </div>)
                    }

                    {
                        fonctionalityList.length > 0 && (
                            <>
                            <label className="block text-sm font-medium text-gray-700 py-3">{t.principalFonctionality}</label>
                            <ul className="my-4 mx-4 list-disc">
                                {
                                    fonctionalityList.map((item, index) => (
                                        <li key={index} className={`${index === fonctionalityList.length - 1 ? 'mb-0' : 'mb-2'}`}>{item.title} - {item.content}</li>
                                    ))
                                }
                            </ul>
                            </>
                        )
                    }

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">{t.beginContract} <em className="text-red-700">*</em></label>
                            <input
                                type="date"
                                {...registerPrestataire("startDate", { required: t.fileRequirer })}
                                min={parseInputDate()}
                                className="mt-1 block w-full border border-gray-300 rounded-md p-2" disabled={disableProviderInput()}
                            />
                            {errorsPrestataire.startDate && (
                                <p className="text-red-500 text-sm mt-1">{errorsPrestataire.startDate.message as string}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                {t.endContract}
                            </label>
                            <input
                                type="date"
                                min={parseInputDate()}
                                {...registerPrestataire("endDate")}
                                className="mt-1 block w-full border border-gray-300 rounded-md p-2" disabled={disableProviderInput()}
                            />
                        </div>
                    </div>
                    </section>

                    {/* === Payment Terms === */}
                    <section className="border-b pb-6">
                        <h2 className="text-xl font-semibold mb-4">{t.paymentCondition}</h2>

                        <div className="flex justify-start items-center gap-3 flex-wrap w-full">
                            <div className="min-w-[14rem] w-full max-w-[calc(50%-1.5rem)]">
                                <label className="block text-sm font-medium text-gray-700">{t.totalPrice} (€) <em className="text-red-700">*</em></label>
                                <input
                                    type="text"
                                    {...registerPrestataire("totalPrice", {
                                    required: t.priceError
                                    })}
                                    className="mt-1 block w-full border border-gray-300 rounded-md p-2" disabled={disableProviderInput()}
                                />
                                {errorsPrestataire.totalPrice && (
                                    <p className="text-red-500 text-sm mt-1">{errorsPrestataire.totalPrice.message as string}</p>
                                )}
                            </div>
                            <div className="min-w-[14rem] w-full max-w-[calc(50%-1.5rem)]">
                                <label className="block text-sm font-medium text-gray-700">{t.paymentSchedule} <em className="text-red-700">*</em></label>
                                <input type="text"
                                {...registerPrestataire("paymentSchedule", { required: "Ce champ est requis",pattern: {
                                    value: /^\d+%(?:,\d+%)*$/i,
                                    message: t.errorPaymentShedule,
                                }, })}
                                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                                placeholder="50% au début, 50% a la livraison" disabled={disableProviderInput()}
                                />
                                {errorsPrestataire.paymentSchedule && (
                                <p className="text-red-500 text-sm mt-1">{errorsPrestataire.paymentSchedule.message as string}</p>
                                )}

                            </div>
                        </div>
                    </section>

                    {
                        Cookies.get('logged') && (<section className="border-b pb-6">
                        <h2 className="text-xl font-semibold mb-4">{t.maintenanceService.title}</h2>
                        <div className="flex gap-5 justify-start items-center flex-wrap">
                                <span className={`py-1 px-3 inline-flex text-xs leading-5 font-semibold rounded-[4px] cursor-pointer ${maintenanceCategory === 'website' ? 'bg-indigo-100 text-indigo-800 pointer-events-none' : 'bg-gray-100 text-gray-800'} cursor-pointer`} onClick={()=>chooseMaintenance('website')}>{t.maintenanceService.web}</span>
                                <span className={`py-1 px-3 inline-flex text-xs leading-5 font-semibold rounded-[4px] cursor-pointer ${maintenanceCategory === 'ecommerce' ? 'bg-indigo-100 text-indigo-800 pointer-events-none' : 'bg-gray-100 text-gray-800'} cursor-pointer`} onClick={()=>chooseMaintenance('ecommerce')}>{t.maintenanceService.ecommerce}</span>
                                <span className={`py-1 px-3 inline-flex text-xs leading-5 font-semibold rounded-[4px] ${maintenanceCategory === 'app' ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-800'} cursor-pointer`} onClick={()=>chooseMaintenance('app')}>{t.maintenanceService.app}</span>
                                <span className={`py-1 px-3 inline-flex text-xs leading-5 font-semibold rounded-[4px] cursor-pointer ${maintenanceCategory === 'saas' ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-800'} cursor-pointer`} onClick={()=>chooseMaintenance('saas')}>{t.maintenanceService.saas}</span>
                            </div>
                        
                        
                        {
                            maintenanceCategory === null && (<p className="text-red-500 text-sm mt-1">{t.maintenanceService.maintenanceError}</p>)
                        }
                        </section>)
                    }
                    {
                        Cookies.get('logged') && (
                            <>
                            <section className="border-b pb-6">
                                <h2 className="text-xl font-semibold mb-4">{t.contractType}</h2>
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
                                <h2 className="text-xl font-semibold mb-4">{t.contractStatus}</h2>
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
                    {
                        Cookies.get('logged') && (
                            <div className="flex justify-end gap-3 flex-wrap">
                                <a href={'/'+(client?.clientLang ?? 'en')+'/clients-list'} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 min-w-[14rem] text-center">{t.clientList}</a>
                            
                                <button
                                    type="submit"
                                    className={`px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 min-w-[14rem] ${checkFormValidation() ? 'opacity-1 cursor-pointer' : 'opacity-50 cursor-not-allowed'} flex justify-center items-center gap-2`} disabled={!checkFormValidation()}
                                >
                                    {loader && <Icon name='bx bx-loader-alt bx-spin bx-rotate-180' color='#fff' size='1em'/>}{t.generedContract}
                                </button>
                            </div>
                        )
                    }
                </form>
                {/* Submit Button */}
                {
                    !Cookies.get("logged") && (
                        <div className="flex justify-end gap-3 flex-wrap my-4">
                            <button form="onSubmitClientForm" type="submit"
                            className={`px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 min-w-[14rem] ${checkFormValidation() ? 'opacity-1 cursor-pointer' : 'opacity-50 cursor-not-allowed'} flex justify-center items-center gap-2`} disabled={!checkFormValidation()}>{loader && <Icon name='bx bx-loader-alt bx-spin bx-rotate-180' color='#fff' size='1em'/>}{t.generedContract}</button>
                        </div>
                    )
                }
            </div>
        </main>
    )
    
}

export default Contrat
