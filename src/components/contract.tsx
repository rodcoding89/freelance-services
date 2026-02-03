"use client"
import { AppContext } from "@/app/context/app-context";
import { useTranslationContext } from "@/hooks/app-hook";

import { useState, useContext, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import SalesTax from 'sales-tax';
import Icon from "./Icon";
import { decodeClientServiceContract, loadCountries, parseInputDate } from "@/utils/fonction";

import { getCookie } from "@/server/services";
import { clientAddress, clientCountry, clientServiceContractDB, clientState, Contract, ContractDb, contractFormClient, contractFormPrestataire, countryState, features, freelancer, serviceDb, Services } from "@/interfaces";
import { sendEmailForFillingContract } from "@/server/services-mail";

interface ContractProps{
    locale:string;
    clientUid:string;
    serviceUid:string;
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

const Contrat:React.FC<ContractProps> = ({locale,clientUid,serviceUid})=>{
    if(!clientUid || !serviceUid) return "Page non trouvé"
    const t:any = useTranslationContext();
    const [isPopUp,setIsPopUp] = useState<boolean>(false)
    const [maintenanceCategory,setMaintenaceCategory] = useState<"app"|"saas"|"web"|"ecommerce"|undefined>(undefined)
    const [cookie,setCookie] = useState<boolean|null>(null)
    const [loading, setLoading] = useState(true);
    const [loader, setLoader] = useState(false);
    const {contextData,setContextData} = useContext(AppContext)
    const [fonctionalityList, setFonctionalityList] = useState<features[]>([])
    const [fonctionality, setFonctionality] = useState<features>({title:"",description:"",quantity:0,price:0})
    const router = useRouter();

    const [selectedCountry,setSelectedCountry] = useState<countryState|null>(null)

    const countryToSave = useRef<clientCountry|null>(null)
    
    const [currency,setCurrency] = useState<string>("")
    const [currentCountry,setCurrentCountry] = useState<string|null>(null)
    const [currentState,setCurrentState] = useState<string|null>(null)
    const toSaveState = useRef<clientState|null>(null)
    const [contract, setContract] = useState<Contract|null>(null)
    const [maintenaceCost,setMaintenaceCost] = useState<number>(0)
    const [service, setService] = useState<Services|null>(null)
    const [useEffectAction,setUseEffectAction] = useState<boolean>(false);

    const [countries, setCountries] = useState<countryState[]>([])
    const isUpdate = useRef(false)
    const noClientId = useRef<boolean>(true)
    const companyAdress = `${process.env.NEXT_PUBLIC_COMPANY_ADRESS_STREET} ${process.env.NEXT_PUBLIC_COMPANY_ADRESS_CITY} ${process.env.NEXT_PUBLIC_COMPANY_ADRESS_POSTAL_CODE} ${process.env.NEXT_PUBLIC_COMPANY_ADRESS_COUNTRY}`
    const companyName = process.env.NEXT_PUBLIC_COMPANY_NAME
    // Contenu dynamique basé sur la langue
    const searchParams = useSearchParams();
    const [vatNumberChecking,setVatNumberChecking] = useState<{success:boolean,message:string}|null>(null)
    const [perHourCost,setPerHourCost] = useState(0)
    const [perYearCost,setPerYearCost] = useState(0)

    const [clientId,setClientId] = useState<number>(0)
    const [serviceId,setServiceId] = useState<number>(0)
    //alert(clientId)
    const {
        register: registerClient,
        handleSubmit: handleSubmitClient,
        reset: resetClient,
        setValue: setValueClient,
        watch: watchClient,
        formState: { errors: errorsClient, isValid: isValidClient }
    } = useForm<contractFormClient>({ mode: 'onChange' });

    const formClient = watchClient()
    //console.log("context",AppContext);
    const {
        register: registerPrestataire,
        handleSubmit: handleSubmitPrestataire,
        reset: resetPrestataire,
        setValue: setValuePrestataire,
        watch: watchPrestataire,
        formState: { errors: errorsPrestataire, isValid: isValidPrestataire }
    } = useForm<contractFormPrestataire>({ mode: 'onChange' });

    const startDate = watchPrestataire("startDate")

    const clientType = watchClient("clientType");
    const taxId = watchClient("taxId");
    const maintenanceType = watchClient("maintenanceType");

    const checkClientTaxNumber = async (isoCode:string,taxNumber:string)=>{
        if (enableCheckTaxNumerCountr.includes(isoCode)) {
            const response = await SalesTax.validateTaxNumber ( isoCode,taxNumber) 
            return {success:response,message:response ? `Numéro de Tax valid` : `Numéro de Tax invalid, modifié le sinon le montant sera facturé avec la Tax.`}
        } else {
            //manuelle chacking before contract creating
            if (contract && contract.clientGivingData?.taxId) {
                return {success:true,message:`Numéro de Tax vérifié et valid`}
            } else {
                return {success:false,message:`Numéro de Tax non prise en charge`}
            }
        }
    }

    const parseProjectFonctionList = (features:features[]|string)=>{
        if (typeof(features) === "string") {
            return JSON.parse(features)
        }
        return features
    }

    //console.log("startDate",new Date(startDate).getTime())

    const onSubmitPrestataire = async(data:contractFormPrestataire) => {
        if(!maintenanceCategory) return
        
        try {
            setLoader(true)
            const formData = {...data}
            const clientInfo = {...formClient, adresse: {...formClient.addressClient, country: countryToSave.current}}
            const clientGivingData:contractFormClient = {...clientInfo,fname:clientInfo.fname,lname:clientInfo.lname,phone:clientInfo.phone ?? undefined}
            const prestataireGivingData:contractFormPrestataire = {...formData,subTotalPrice: contract?.prestataireGivingData?.totalPrice ?? formData.totalPrice,maintenanceCategory:maintenanceCategory,startDate:new Date(formData.startDate).getTime(),endDate:new Date(formData.endDate).getTime(),projectFonctionList:fonctionalityList,taxPercent:contract?.prestataireGivingData?.taxPercent ?? 0,taxPrice:contract?.prestataireGivingData?.taxPrice ?? 0}
            const contractItem:Contract = {contractId:contract?.contractId,prestataireGivingData:prestataireGivingData,clientGivingData:clientGivingData,maintenancePrice:0}
            //console.log("link",link,"serviceUid",serviceUid,"clientUid",clientUid)
            saveContractAndNavigate(contractItem,"prestataire",contract?.contractId ? "update":"add")
        } catch (error) {
            console.log("error",error)
        }
    }

    const onSubmitClient = async(data:contractFormClient) => {
        if(!countryToSave.current || !contractStatus || !maintenanceCategory) return
        setLoader(true);
        try {
            const clientInfo:contractFormClient = {...data,saveDate:new Date().getTime(),modifDate:new Date().getTime(),address:contract?.clientGivingData?.address, addressClient: {addressId:contract?.clientGivingData?.addressClient?.addressId,street:data.addressClient?.street ?? "",postalCode:data.addressClient?.postalCode ?? "",city:data.addressClient?.city ?? "", clientCountry: countryToSave.current}}
            const prestataireGivingData:contractFormPrestataire = {
                maintenanceCategory:maintenanceCategory,contractStatus:contract?.prestataireGivingData?.contractStatus ?? "unsigned",
                freelancerName:contract?.prestataireGivingData?.freelancerName || process.env.NEXT_PUBLIC_COMPANY_NAME || "",
                freelancerAddress:contract?.prestataireGivingData?.freelancerAddress ?? "",
                freelancerTaxId:contract?.prestataireGivingData?.freelancerTaxId ?? "",
                projectTitle:contract?.prestataireGivingData?.projectTitle ?? "",
                projectDescription:contract?.prestataireGivingData?.projectDescription ?? "",
                projectFonctionList:contract?.prestataireGivingData?.projectFonctionList ?? [],
                startDate:contract?.prestataireGivingData?.startDate ?? new Date().getTime(),
                endDate:contract?.prestataireGivingData?.endDate ?? new Date().getTime(),
                paymentSchedule:contract?.prestataireGivingData?.paymentSchedule ?? "",
                totalPrice:contract?.prestataireGivingData?.totalPrice ?? 0,
                taxPercent: 0,
                taxPrice: 0,
                subTotalPrice: contract?.prestataireGivingData?.totalPrice ?? 0
            }

            const contractData:Contract = {
                contractId:contract?.contractId,
                contractStatus:service?.contractStatus ?? "unsigned",
                prestataireGivingData: prestataireGivingData || null,
                clientGivingData: clientInfo,
                maintenancePrice:maintenaceCost ? maintenaceCost : contract?.maintenancePrice ?? 0,
                electronicContractSignatureAccepted:contract?.electronicContractSignatureAccepted,
                saleTermeConditionValided:contract?.saleTermeConditionValided,
                rigthRetractionLostAfterServiceBegin:contract?.rigthRetractionLostAfterServiceBegin
            };
            //console.log("contractData",contractData)
            saveContractAndNavigate(contractData,"client","update")
        } catch (error) {
            setLoader(false)
            //console.log("error",error)
        }
    };

    const saveContractAndNavigate = async(contractData:Contract,from:"client"|"prestataire",mode:"update"|"add") => {
        
        const addressId = contractData.clientGivingData?.address ?? null

        try {
            const result = await fetch('/api/save-contract/',{
                method: 'POST', // Garde votre méthode GET pour l'exemple
                headers: {
                    'Content-Type': 'application/json',
                },
                body:JSON.stringify({contract:contractData,clientId,addressId,serviceId:serviceId,prestataireId:1,mode:mode,from:from,contractId:contractData.contractId})
            })

            if (!result.ok) {
                setContextData({toast:{toastVariant:"error",toastMessage:contract?.clientGivingData?.clientLang ?? locale === "fr" ? "Une erreur est survenue lors de la requête.":"An error occurred during the request.",showToast:true,time:new Date().getTime()}})
            }

            const response = await result.json() as any;

            if (response.success) {
                const client = contractData?.clientGivingData;
                if (cookie) {
                    if (!client?.email) {setContextData({toast:{toastVariant:"error",toastMessage:contract?.clientGivingData?.clientLang ?? locale ? "Email ou Données client absent" : "Email or client data missing.",showToast:true,time:new Date().getTime()}});return}
                    const link = `${process.env.NEXT_PUBLIC_WEB_LINK?.replace("{locale}",client.clientLang ?? 'en')}/create-contract/${clientUid}/${serviceUid}/?data=${clientId}${serviceId}`
                    console.log("LINK",link)
                    const result = await sendEmailForFillingContract(client.email,client.fname + " "+ client.lname,link,client.clientLang)
                    if (result === "success") {
                        sessionStorage.removeItem('clientServiceContract_'+clientId+'-'+serviceId)
                        sessionStorage.removeItem('clientData')
                        router.push("/"+(contractData.clientGivingData?.clientLang ?? 'en')+"/sign-contract/"+clientUid+'/'+serviceUid+"/?data="+clientId+serviceId)
                    }else{
                        setContextData({toast:{toastVariant:"error",toastMessage:contract?.clientGivingData?.clientLang ?? locale ? "Erreur lors de l’envoi de l’email." : "Error while sending the email.",showToast:true,time:new Date().getTime()}})
                    }
                }else{
                    sessionStorage.removeItem('clientServiceContract_'+clientId+'-'+serviceId)
                    sessionStorage.removeItem('clientData')
                    router.push("/"+(contractData.clientGivingData?.clientLang ?? 'en')+"/sign-contract/"+clientUid+'/'+serviceUid+"/?data="+clientId+serviceId)
                }
            } else {
                setContextData({toast:{toastVariant:"error",toastMessage: contract?.clientGivingData?.clientLang ?? locale ? "Une erreur est survenue lors de la requête." : "An Error occurred during the request",showToast:true,time:new Date().getTime()}})
            }
        } catch (error) {
            console.error('Erreur lors de la mise à jour du document :', error);
        } finally{
            setLoader(false)
        }
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
    
    const getStatusIcon = (status: string) => {
        if(!status) return 'bx bx-question-mark';
        switch (status) {
            case 'signed': return 'bx bx-check-circle';
            case 'pending': return 'bx bx-time';
            case 'unsigned': return 'bx bx-error-circle';
            default: return 'bx bx-question-mark';
        }
    };
    
    const chooseMaintenance = (type:"app"|"saas"|"web"|"ecommerce"|undefined)=>{
        setMaintenaceCategory((prev)=>{
            if(prev === type) return undefined
            return type
        })
    }

    const parseToInt = (data:number|string)=>{
        if (typeof(data) === "string") {
            return parseInt(data)
        }
        return data
    }

    const checkFormValidation = ()=>{
        if (cookie) {
            //console.log("maintenanceCategory",maintenanceCategory,"fonctionalityList",fonctionalityList.length,"isValidPrestataire",isValidPrestataire,"loader",loader,"errorsPrestataire",errorsPrestataire)
            return (maintenanceCategory !== null && fonctionalityList.length > 0 && isValidPrestataire) && !loader
        } else {
            //console.log("isValidClient",isValidClient,"countryToSave",countryToSave.current,(contract?.clientGivingData?.clientType === 'company' ? (contract.clientGivingData.taxId !== '' ? true : false) : true))
            return isValidClient && countryToSave.current !== null && (countryToSave.current?.specificTo === 'state' ? toSaveState.current !== null : true) && !loader
        }
    }
    
    const clearAdresse = () => {
        setValueClient('addressClient.street', '');
        setValueClient('addressClient.city', '');
        setValueClient('addressClient.postalCode', '');
    }

    const featurePrise = (price:string|number,quantity:string|number)=>{
        const parseedPrice = typeof(price) === "string" ? parseFloat(price) : price
        const parsedQuantity = typeof(quantity) === "string" ? parseInt(quantity) : quantity
        return parseedPrice*parsedQuantity
    }

    const handleStateChange = (e:any)=>{
        if (e.target.value !== 'default') {
            const state = selectedCountry?.state?.find((item:any) => item.id === e.target.value);
            ////console.log("id",e.target.value,"state",state)
            setCurrentState(state?.id ?? null)
            if (state) {
                toSaveState.current = {...state,stateId:toSaveState.current?.stateId}
            }else{
                toSaveState.current = null
            }
            
            if (countryToSave.current) {
                countryToSave.current = {...countryToSave.current,clientState:toSaveState.current}
            } else {
                countryToSave.current = null
            }
            
        }else{
            setCurrentState(null);
            toSaveState.current = null
        }
    }

    const calculePrise = (fonctionalityList:features[])=>{
        const result = fonctionalityList.reduce((prev:number,curr:features)=>{
            const currPrice = featurePrise(curr.price,curr.quantity)
            return (prev + currPrice)
        },0)
        return result.toFixed(2)
    }

    const addFeature = (feature:features)=>{
        if (feature.title !== "" && feature.description !== "" && feature.price && feature.quantity) {
            setFonctionalityList((prev)=>{
                const newFeature = [...prev,feature]
                resetPrestataire({totalPrice:calculePrise(newFeature)})
                return newFeature
            });
            setFonctionality({title:'',description:'',quantity:0,price:0});
        }
    }

    const handleCountryChange = async(e:any)=>{
        if (e.target.value !== 'default') {
            //console.log("id",e.target.value)
            const country = countries.find((item) => item.id === e.target.value);
            setSelectedCountry(country ?? null)
            countryToSave.current = country ? {id:countryToSave.current?.id,name:country.name,groupe:country.groupe,taxB2B:country.taxB2B,taxB2C:country.taxB2C,currency:country.currency,isoCode:country.isoCode,threshold_before_tax:country.threshold_before_tax,specificTo:country.specificTo,vat:country.vat,clientState:null,itemId:country.id}  as clientCountry: null
            setCurrentCountry(country?.id ?? null)
            if(taxId && taxId !== ''){
                const response = await checkClientTaxNumber(countryToSave.current?.isoCode ?? '',taxId)
                //console.log("response",response)
                setVatNumberChecking(response)
            }
            console.log("countryToSave.current",countryToSave.current)
        } else {
            setCurrentCountry(null);
            clearAdresse()
        }
    }
    
    useEffect(() => {
        
        const loadCountrieData = async () => {
            try {
            const countries = await loadCountries() as {countries:countryState[]};
            return countries.countries
            } catch (error) {
                //console.error('Erreur lors du chargement des pays :', error);
                return
            }
        }

        const checkCookie = async ()=>{
            const cookie = await getCookie('userAuth')
            setCookie(cookie)
            return cookie
        }

        let clientId = 0;
        let serviceId = 0;
    
        const handleDataParam = async()=>{
            const search = window.location.search
            const data = search.split("=");
            const clientIdParam = data[1].split("")[0]
            const serviceIdParam = data[1].split("")[1]
            clientId = parseInt(clientIdParam ?? "0")
            serviceId = parseInt(serviceIdParam ?? "0")
            setClientId(clientId)
            setServiceId(serviceId)
            const cookie = await getCookie("userAuth")
            if(!clientId || !serviceId) {cookie ? router.push(`/${locale}/clients-list`) : router.push(`/${locale}`)}
        }
        handleDataParam()
        
        const checkUserConnection = (contractStatus:"signed"|"unsigned"|"pending",cookie:boolean)=>{
            if (cookie || contractStatus === 'pending') {
                //console.log("cookie",cookie)
            }else{
                router.push("/"+locale)
                return null
            }
        }
        
        const fetchContractClientService = async (clientId: number,serviceId:number) =>{
            
            const result = await fetch(`/api/get-client-service-contract/?serviceId=${serviceId}&clientId=${clientId}&prestataireId=${1}`,{
                method: 'GET', // Garde votre méthode GET pour l'exemple
                headers: {
                    'Content-Type': 'application/json',
                }
            })

            try {
                if (!result.ok) {
                    setContextData({toast:{toastVariant:"error",toastMessage:contract?.clientGivingData?.clientLang ?? locale ? "Une erreur est survenue lors de la requête." : "An Error occurred during the request",showToast:true,time:new Date().getTime()}})     
                }

                const response = await result.json() as any;
                
                if (response.success && response.result) {
                    handleResponse(response.result as clientServiceContractDB)
                    sessionStorage.setItem('clientServiceContract_'+clientId+'-'+serviceId, JSON.stringify(response.result));
                } else {
                    setContextData({toast:{toastVariant:"error",toastMessage:contract?.clientGivingData?.clientLang ?? locale ? "Une erreur est survenue lors de la requête." : "An Error occurred during the request",showToast:true,time:new Date().getTime()}})
                }   
            } catch (error) {
                console.log("Erreur",error)
            } finally{
                setLoading(false)
            }
        }
        
        const handleResponse = async(clientData:clientServiceContractDB)=>{
            //console.log("clientData",clientData)
            if(!clientData) return
            const client = decodeClientServiceContract(clientData) as clientServiceContractDB
            //console.log("client",client)
            const freelancer = typeof(client.freelancer) === "string" ? JSON.parse(client.freelancer) as freelancer|null : client.freelancer
            const cookie = await checkCookie()
            
            let addressClient: clientAddress|undefined = undefined

            const serviceList = client?.services as serviceDb[];

            if (client.addressClient) {
                if (typeof(client.addressClient) === "string") {
                    addressClient = JSON.parse(client.addressClient)
                }else{
                    addressClient = client.addressClient
                }
            }else{
                addressClient = undefined
            }

            if (serviceList.length > 0) {
                const service = serviceList[0]
                //console.log("service",service)

                const contractData = service.contract as ContractDb
                //console.log("contractData",contractData.projectFonctionList)
                const contract:Contract|null = contractData ? {contractId:contractData?.contractId,
                    clientGivingData:{clientUid:client.clientUid,saveDate:client.saveDate,clientNumber:client.clientNumber,
                        clientLang:client.clientLang,clientStatus:client.clientStatus,
                        modifDate:new Date(client.modifDate).getTime(),email:client.email,address:client.address,
                        addressClient:addressClient,fname:client.fname,lname:client.lname,
                        taxId:client.taxId ?? '',phone:client.phone,clientType:client.clientType},
                    prestataireGivingData:{subTotalPrice:contractData.totalPrice,contractStatus:service.contractStatus,taxPercent:contractData.taxPercent,taxPrice:contractData.taxPrice,maintenanceCategory:contractData.maintenanceCategory,totalPrice:contractData?.totalPrice,paymentSchedule:contractData?.paymentSchedule,startDate:contractData?.startDate,endDate:contractData?.endDate,projectTitle:contractData?.projectTitle,
                    projectDescription:contractData?.projectDescription,freelancerTaxId:freelancer?.freelancerTaxId ?? "",freelancerName:freelancer?.freelancerName ?? "",freelancerAddress:freelancer?.freelancerAddress ?? "",
                    projectFonctionList:contractData?.projectFonctionList ?? fonctionalityList}} : null
                
                checkUserConnection(service?.contractStatus ?? 'unsigned',cookie)

                const countriesList = await loadCountrieData() as countryState[];

                setCountries(countriesList)
                
                setContract(contract);
                setCurrency(addressClient?.clientCountry?.currency ?? "USD")
                setService(service); 
                //console.log("contract",contract)
                if (contract) {
                    if (contract.clientGivingData) {
                        resetClient({...contract.clientGivingData,maintenanceType:service.maintenanceType});
                        if(contract.clientGivingData.addressClient?.clientCountry){
                            const countryItem = contract.clientGivingData.addressClient?.clientCountry as clientCountry
                            const country = countriesList.find((item) => item.id === countryItem.itemId) as countryState|undefined;
                            if(country){
                                setSelectedCountry(country)
                            }
                            if (countryItem.clientState) {
                                console.log("client state",countryItem.clientState)
                                const clientState = countryItem.clientState as clientState
                                countryToSave.current = {...countryItem,clientState:clientState}
                                toSaveState.current = clientState ?? null    
                                setCurrentState(clientState?.id ?? null)    
                            } else {
                                countryToSave.current = {...countryItem,clientState:null}
                            }

                            countryToSave.current = {...countryItem,clientState:null}
                            setCurrentCountry(countryItem.itemId ?? null)
                        }
                    }else{
                        resetClient({email:client.email,fname:client.fname,lname:client.lname,taxId:client.taxId ?? '',phone:client.phone});
                    }
                    if (contract.prestataireGivingData) {
                        const startDate = parseInputDate(contract.prestataireGivingData.startDate)
                        const endDate = parseInputDate(contract.prestataireGivingData.endDate)
                        resetPrestataire({...contract.prestataireGivingData,maintenanceCategory:contract.prestataireGivingData.maintenanceCategory,contractStatus:service.contractStatus,startDate:startDate,endDate:endDate});
                    }
                    setMaintenaceCategory(contract.prestataireGivingData?.maintenanceCategory ?? undefined)
                    setFonctionalityList(parseProjectFonctionList(contract.prestataireGivingData?.projectFonctionList ?? fonctionalityList))
                }else{
                    resetClient({email:client.email,fname:client.fname,lname:client.lname,taxId:client.taxId ?? '',phone:client.phone,clientType:client.clientType});
                    if (freelancer) {
                        resetPrestataire({freelancerAddress:freelancer.freelancerAddress,freelancerName:freelancer.freelancerName,freelancerTaxId:freelancer.freelancerTaxId}) 
                    }
                }
                setLoading(false);
                if (service?.contractStatus === "signed"){
                    if (cookie) {
                        router.push(`/${locale}/clients-list`)
                    }else{
                        router.push(`/${locale}/clients-list`)
                    }
                }
            }
        }

        const handleData = async()=>{
            setLoading(false)
            
            const sessionloadedContractData = sessionStorage.getItem('clientServiceContract_'+clientId+'-'+serviceId);

            if (sessionloadedContractData) {
                const clientParsed = JSON.parse(sessionloadedContractData) as clientServiceContractDB;
                handleResponse(clientParsed)
                await checkCookie()
                //alert(cookie)
                setLoading(false)
            }else{
                fetchContractClientService(clientId,serviceId);
            }
            setUseEffectAction(true)
        }

        handleData();
    }, [clientUid,serviceUid,locale,useEffectAction]);

    const resetInput = () => {
        setValueClient('maintenanceType',undefined);
    }

    const disableProviderInput = ()=>{
        if (!cookie) {
            return true
        }
        return false
    }

    const disableClientInput = () =>{
        const env = process.env.NEXT_PUBLIC_ENV
        if (env === "dev") {
            return false;
        } else {
            if (!cookie) {
                return false
            } else {
                return true
            }
        }
    }

    useEffect(()=>{
        if (contextData && (contextData.state === "hide" || contextData.state === "show")) {
            //console.log("inside contextData",contextData)
            setIsPopUp(contextData.value)
        }
    },[contextData])

    useEffect(()=>{
        if (maintenanceType === 'perHour') {
            setMaintenaceCost(process.env.NEXT_PUBLIC_MAINTENACE_COST_PER_HOUR as unknown as number)
        } else if(maintenanceType === 'perYear') {
            setMaintenaceCost(process.env.NEXT_PUBLIC_MAINTENACE_COST_PER_YEAR as unknown as number);
        }
        if (maintenanceCategory === 'web') {
            setPerHourCost(process.env.NEXT_PUBLIC_MAINTENACE_WEBSITE_COST_PER_HOUR as unknown as number)
            setPerYearCost(process.env.NEXT_PUBLIC_MAINTENACE_WEBSITE_COST_PER_YEAR as unknown as number)
        } else if(maintenanceCategory === 'ecommerce') {
            setPerHourCost(process.env.NEXT_PUBLIC_MAINTENACE_ECOMMERCE_COST_PER_HOUR as unknown as number)
            setPerYearCost(process.env.NEXT_PUBLIC_MAINTENACE_ECOMMERCE_COST_PER_YEAR as unknown as number)
        }
    },[maintenanceType,maintenanceCategory])

    useEffect(()=>{
        const clientTaxNumberValidation = async()=>{
            if (taxId && taxId !== '') {
                const response = await checkClientTaxNumber(countryToSave.current?.isoCode ?? '',taxId)
                //console.log("response",response)
                setVatNumberChecking(response)
            }
            //setVatNumberChecking(null)
        }
        clientTaxNumberValidation()
        //console.log("taxId",taxId,"countryToSave",countryToSave.current)
    },[taxId])

    //console.log("maintenance act",maintenanceCategory)

    if (loading) return <div className="text-center py-8 mt-[6.875rem] h-[12.5rem] flex justify-center items-center w-[85%] mx-auto">{t.loading}</div>;
    
    return (
        <main className={`transition-transform duration-700 delay-300 ease-in-out ${isPopUp ? 'translate-x-[-25vw]' : 'translate-x-0'} w-full mt-[6.875rem] mx-auto`}>
            <h1 className="text-center text-thirty uppercase">{t["contrat"]}</h1>
            <div className="max-w-[1000px] mx-auto p-6 bg-white shadow-md rounded-lg">
                <div className="flex justify-start items-center gap-2 mb-6 flex-wrap">
                    <h1 className="text-2xl font-bold">{t.contractPrestation}</h1>
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(service?.contractStatus ?? '')}`}><i className={`${getStatusIcon(service?.contractStatus ?? '')} mr-1`}></i>{getStatusText(service?.contractStatus ?? '')}</span>
                </div>

                <form id="onSubmitClientForm" onSubmit={handleSubmitClient(onSubmitClient)} className="space-y-6">
                    {/* === Client Information === */}
                    <section className="border-b pb-6">
                        <h2 className="text-xl font-semibold mb-4">{t.clientGivingData}</h2>
                        <div className="flex justify-start items-start gap-4 mb-3 w-full flex-wrap">
                            <div className="flex justify-start items-start gap-4 w-2/3">
                                <div className="min-[14rem] w-full max-w-[calc(50%-8px)]">
                                    <label className="block text-sm font-medium text-gray-700">
                                        {t.clientName} <em className="text-red-700">*</em>
                                    </label>
                                    <input
                                        {...registerClient("fname", { required: t.fileRequirer })}
                                        className="mt-1 block w-full border border-gray-300 rounded-md p-2" disabled={disableClientInput()}
                                    />
                                    {errorsClient.fname && (
                                        <p className="text-red-500 text-sm mt-1">{errorsClient.fname.message as string}</p>
                                    )}
                                </div>
                                <div className="min-[14rem] w-full max-w-[calc(50%-8px)]">
                                    <label className="block text-sm font-medium text-gray-700">
                                        {t.clientName} <em className="text-red-700">*</em>
                                    </label>
                                    <input
                                        {...registerClient("lname", { required: t.fileRequirer })}
                                        className="mt-1 block w-full border border-gray-300 rounded-md p-2" disabled={disableClientInput()}
                                    />
                                    {errorsClient.lname && (
                                        <p className="text-red-500 text-sm mt-1">{errorsClient.lname.message as string}</p>
                                    )}
                                </div>
                            </div>
                            <div className="min-[14rem] w-full max-w-[calc(25%-8px)]">
                                <label className="block text-sm font-medium text-gray-700">{t.clientType} <em className="text-red-700">*</em></label>
                                <div className="flex items-center justify-start gap-2 flex-wrap w-full mt-3">
                                    <div className="flex items-center gap-2">
                                        <input type="radio" id="particular" {...registerClient("clientType", { required: true })} value={"particular"} disabled={disableClientInput()}/>
                                        <label htmlFor="particular" className="ml-2 block text-sm font-medium text-gray-700">
                                            {t.particular}</label>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input type="radio" id="company" {...registerClient("clientType", { required: true })} value={"company"} disabled={disableClientInput()}/>
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
                                    {...registerClient("email", {
                                        required: t.errorEmail,
                                        pattern: {
                                            value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/i,
                                            message: t.invalidEmail,
                                        },
                                    })}
                                    className="mt-1 block w-full border border-gray-300 rounded-md p-2" disabled={disableClientInput()}
                                />
                                {errorsClient.email && (
                                    <p className="text-red-500 text-sm mt-1">{errorsClient.email.message as string}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">{t.tel} <em className="text-red-700">*</em></label>
                                <input
                                    type="tel"
                                    {...registerClient("phone", { required: t.errorTel })}
                                    className="mt-1 block w-full border border-gray-300 rounded-md p-2" disabled={disableClientInput()}
                                />
                                {errorsClient.phone && (
                                    <p className="text-red-500 text-sm mt-1">{errorsClient.phone.message as string}</p>
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
                                            <option key={index} value={item.id}>{t.adresse[item.name]}</option>
                                        ))
                                    }
                                </select>
                            </div>
                        </div>
                        {
                        currentCountry && (
                            <div className="flex justify-between items-center gap-4 flex-wrap w-full">
                                <div className="w-[calc(50%-8px)] min-w-[14rem]">
                                    <label className="block text-sm font-medium text-gray-700">
                                        {t.adresse.street} <em className="text-red-700">*</em>
                                    </label>
                                    <input
                                        {...registerClient("addressClient.street", { required: t.fileRequirer })}
                                        placeholder={t.adresse.street}
                                        className="mt-1 block w-full border border-gray-300 rounded-md p-2" disabled={disableClientInput()}
                                    />
                                    {errorsClient.addressClient?.street && (
                                        <p className="text-red-500 text-sm mt-1">{errorsClient.addressClient.street.message as string}</p>
                                    )}
                                </div>
                                <div className="min-w-[14rem] w-[calc(50%-8px)]">
                                    <label className="block text-sm font-medium text-gray-700">
                                        {t.adresse.city} <em className="text-red-700">*</em>
                                    </label>
                                    <input
                                        {...registerClient("addressClient.city", { required: t.fileRequirer })}
                                        placeholder={t.adresse.city}
                                        className="mt-1 block w-full border border-gray-300 rounded-md p-2" disabled={disableClientInput()}
                                    />
                                    {errorsClient.addressClient?.city && (
                                        <p className="text-red-500 text-sm mt-1">{errorsClient.addressClient.city.message as string}</p>
                                    )}
                                </div>
                                <div className="min-w-[14rem] w-[calc(50%-8px)]">
                                    <label className="block text-sm font-medium text-gray-700">
                                        {t.adresse.codePostal} <em className="text-red-700">*</em>
                                    </label>
                                    <input
                                        {...registerClient("addressClient.postalCode", { required: t.fileRequirer })}
                                        placeholder={t.adresse.codePostal}
                                        className="mt-1 block w-full border border-gray-300 rounded-md p-2" disabled={disableClientInput()}
                                    />
                                    {errorsClient.addressClient?.postalCode && (
                                        <p className="text-red-500 text-sm mt-1">{errorsClient.addressClient.postalCode.message as string}</p>
                                    )}
                                </div>
                                {
                                    (selectedCountry && selectedCountry.specificTo === "state" && currentCountry === selectedCountry.id) && (
                                    <div className="w-[calc(50%-8px)]">
                                        <label className="block text-sm font-medium text-gray-700">
                                            {t.adresse.state} <em className="text-red-700">*</em>
                                        </label>
                                        <select value={currentState || 'default'} id="" className="mt-1 block w-full border border-gray-300 rounded-md p-2" onChange={handleStateChange} disabled={disableClientInput()}>
                                            <option value="default">{t.adresse.defaultState}</option>
                                            {
                                                selectedCountry.state?.map((item, index) => ( 
                                                    <option key={index} value={item.id}>{item.name}</option>
                                                ))
                                            }
                                        </select>
                                    </div>)
                                }
                                {
                                    (clientType === 'company' && currentCountry) && 
                                    <div className="min-w-[14rem] w-[calc(50%-8px)]">
                                        <label className="block text-sm font-medium text-gray-700">
                                        {t.taxNumberText.replace("{tax}",selectedCountry?.vat ?? 'VAT')} <em className="text-red-700">*</em>
                                        </label>
                                        <input
                                        {...registerClient("taxId")}
                                        className="mt-1 block w-full border border-gray-300 rounded-md p-2" disabled={disableClientInput()}
                                        />
                                        {vatNumberChecking && (
                                            <p className={`text-sm mt-1 ${vatNumberChecking.success ? 'text-green-600' : 'text-red-500'}`}>{vatNumberChecking.message}</p>
                                        )}
                                    </div>
                                }
                            </div>
                        )
                    }
                    {
                        maintenanceCategory && (<div>
                            <h2 className="text-xl font-semibold my-4">{`${t.maintenanceService.title} ( ${maintenanceCategory === 'web' ? t.web : maintenanceCategory === 'ecommerce' ? t.ecommerce : maintenanceCategory === 'saas' ? t.saasTitle : t.appTitle})`} {service?.serviceType === 'service_and_maintenance' && <em className="text-red-700">*</em>}</h2>
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
                                            <input type="radio" {...registerClient("maintenanceType")} value={"perHour"} id="hour" disabled={disableClientInput()}/>
                                            <label className="block text-sm font-medium text-gray-700" htmlFor="hour">{t.maintenanceService.pricePerHour.replace("{price}",perHourCost)}</label>
                                        </div>
                                        <div className="flex gap-2 justify-start items-center">
                                            <input type="radio" {...registerClient("maintenanceType")} value={"perYear"} id="year" disabled={disableClientInput()}/>
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
                <form onSubmit={handleSubmitPrestataire(onSubmitPrestataire)} className={`space-y-6 ${!cookie ? "border-[1px] p-6 border-red-500" : ""}`}>

                    {/* === Freelancer Information === */}
                    {!cookie ? <h2 className="text-xl">Ne pas remplir cette zone</h2> : ''}
                    <section className={`border-b pb-6`}>
                        <h2 className="text-xl font-semibold my-4">{t.freelancerInfo}</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">{t.freelancerCompanyName} <em className="text-red-700">*</em></label>
                                <input
                                    {...registerPrestataire("freelancerName", { required: t.fileRequirer })}
                                    className="mt-1 block w-full border border-gray-300 rounded-md p-2" disabled={true}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">{t.freelancerCompanyAdresse} <em className="text-red-700">*</em></label>
                                <input
                                    {...registerPrestataire("freelancerAddress", { required: t.fileRequirer })}
                                    className="mt-1 block w-full border border-gray-300 rounded-md p-2" disabled={true}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">{t.invoice.identificationNumber} <em className="text-red-700">*</em></label>
                                <input
                                    {...registerPrestataire("freelancerTaxId", { required: t.fileRequirer })}
                                    className="mt-1 block w-full border border-gray-300 rounded-md p-2" disabled={true}
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
                            cookie && (<div className="my-4 w-full border rounded-sm border-gray-500 p-6">
                                <h4 className="block font-medium text-gray-700 text-xl">{t.projetFonctionality} <em className="text-red-700">*</em></h4>
                                <div className="flex items-start gap-4 mt-2 justify-start w-full flex-wrap">
                                    <div className="w-[calc(50%-8px)] min-w-[14rem] flex flex-col gap-1">
                                        <label htmlFor="title" className="block text-sm font-medium text-gray-700">Titre de la fonctionnalié</label>
                                        <input className="p-2 bg-[#f5f5f5] w-full focus:outline-none" value={fonctionality.title} type="text" placeholder="Titre de la fonctionnalité" id="title" onChange={(e)=>setFonctionality((prev)=> {return{...prev,title:e.target.value}})}/>
                                    </div>
                                    <div className="w-[calc(50%-8px)] min-w-[14rem] flex flex-col gap-1">
                                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description de la fonctionnalité</label>
                                        <textarea className="p-2 bg-[#f5f5f5] w-full focus:outline-none" placeholder="Description de la fonctionnalité" id="" value={fonctionality.description} onChange={(e)=>setFonctionality((prev)=> {return{...prev,description:e.target.value}})}></textarea>
                                    </div>
                                    <div className="w-[calc(50%-8px)] min-w-[14rem] flex flex-col gap-1">
                                        <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">Quantité</label>
                                        <input className="p-2 bg-[#f5f5f5] w-full focus:outline-none" value={parseToInt(fonctionality.quantity) > 0 ? fonctionality.quantity.toString() : ''} type="text" placeholder="Quantité" onChange={(e)=>setFonctionality((prev)=> {return{...prev,quantity:parseInt(e.target.value)}})}/>
                                    </div>
                                    <div className="w-[calc(50%-8px)] min-w-[14rem] flex flex-col gap-1">
                                        <label htmlFor="price" className="block text-sm font-medium text-gray-700">Prix</label>
                                        <input className="p-2 bg-[#f5f5f5] w-full focus:outline-none" value={parseToInt(fonctionality.price) > 0 ? fonctionality.price.toString()  : ''} type="text" placeholder="Prix" onChange={(e)=>setFonctionality((prev)=> {return{...prev,price:parseInt(e.target.value)}})}/>
                                    </div>
                                    <div className="w-full flex justify-start items-center gap-2 my-4">
                                        <span className="p-2 cursor-pointer flex justify-start items-center gap-1 w-fit bg-slate-800 text-white rounded-[.2em]" onClick={()=> addFeature(fonctionality)}><Icon name="bx-plus" size="1.5em" color="#fff"/>{t.add}</span><span className="p-2 cursor-pointer w-fit flex justify-start items-center gap-1 bg-slate-800 text-white rounded-[.2em]" onClick={()=>{setFonctionalityList([]);setFonctionality({title:'',description:'',quantity:0,price:0})}}><Icon name="bx-trash" size="1.5em" color="#fff"/>{t.clearListe}</span>
                                    </div>
                                </div>
                            </div>)
                        }

                        {
                            fonctionalityList.length > 0 && (
                                <>
                                <label className="block text-sm font-medium text-gray-700 py-3">{t.principalFonctionality}</label>
                                <ul className="my-4 mx-4 list-disc">
                                    {
                                        fonctionalityList.map((item, index) => (
                                            <li key={index} className={`${index === fonctionalityList.length - 1 ? 'mb-0' : 'mb-2'}`}>{item.title} - {item.description} - {featurePrise(item.price,item.quantity)} {currency}</li>
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
                                    min={parseInputDate(new Date())}
                                    {...registerPrestataire("endDate",{ required: t.fileRequirer })}
                                    className="mt-1 block w-full border border-gray-300 rounded-md p-2" disabled={disableProviderInput()}
                                />
                                {errorsPrestataire.endDate && (
                                    <p className="text-red-500 text-sm mt-1">{errorsPrestataire.endDate.message as string}</p>
                                )}
                            </div>
                        </div>
                    </section>

                    {/* === Payment Terms === */}
                    <section className="border-b pb-6">
                        <h2 className="text-xl font-semibold mb-4">{t.paymentCondition}</h2>

                        <div className="flex justify-start items-center gap-4 flex-wrap w-full">
                            <div className="min-w-[14rem] w-full max-w-[calc(50%-8px)]">
                                <label className="block text-sm font-medium text-gray-700">{t.totalPrice} ({currency}) <em className="text-red-700">*</em></label>
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
                            <div className="min-w-[14rem] max-w-[calc(50%-8px)] w-full">
                                <label className="block text-sm font-medium text-gray-700">{t.paymentSchedule} <em className="text-red-700">*</em></label>
                                <input type="text"
                                {...registerPrestataire("paymentSchedule", { required: "Ce champ est requis",pattern: {
                                    value: /^\d+%(?:;\d+%)*$/i,
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
                        cookie && (<section className="border-b pb-6">
                        <h2 className="text-xl font-semibold mb-4">{t.maintenanceService.title}</h2>
                        <div className="flex gap-5 justify-start items-center flex-wrap">
                                <span className={`py-1 px-3 inline-flex text-xs leading-5 font-semibold rounded-[ 0.25rem] cursor-pointer ${maintenanceCategory === 'web' ? 'bg-indigo-100 text-indigo-800 pointer-events-none' : 'bg-gray-100 text-gray-800'} cursor-pointer`} onClick={()=>chooseMaintenance('web')}>{t.maintenanceService.web}</span>
                                <span className={`py-1 px-3 inline-flex text-xs leading-5 font-semibold rounded-[ 0.25rem] cursor-pointer ${maintenanceCategory === 'ecommerce' ? 'bg-indigo-100 text-indigo-800 pointer-events-none' : 'bg-gray-100 text-gray-800'} cursor-pointer`} onClick={()=>chooseMaintenance('ecommerce')}>{t.maintenanceService.ecommerce}</span>
                                <span className={`py-1 px-3 inline-flex text-xs leading-5 font-semibold rounded-[ 0.25rem] ${maintenanceCategory === 'app' ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-800'} cursor-pointer`} onClick={()=>chooseMaintenance('app')}>{t.maintenanceService.app}</span>
                                <span className={`py-1 px-3 inline-flex text-xs leading-5 font-semibold rounded-[ 0.25rem] cursor-pointer ${maintenanceCategory === 'saas' ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-800'} cursor-pointer`} onClick={()=>chooseMaintenance('saas')}>{t.maintenanceService.saas}</span>
                            </div>
                        
                        
                        {
                            maintenanceCategory === undefined && (<p className="text-red-500 text-sm mt-1">{t.maintenanceService.maintenanceError}</p>)
                        }
                        </section>)
                    }
                    {
                        cookie && (
                            <>
                            <section className="border-b pb-6">
                                <h2 className="text-xl font-semibold mb-4">{t.contractStatus}</h2>
                                <select {...registerPrestataire("contractStatus", { required: "Ce champ est requis"})}
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
                        cookie && (
                            <div className="flex justify-end gap-3 flex-wrap">
                                <a href={'/'+(contract?.clientGivingData?.clientLang ?? 'en')+'/clients-list'} className="px-4 py-2 bg-fifty text-primary rounded-md hover:bg-[#ccc] min-w-[14rem] text-center">{t.clientList}</a>
                            
                                <button
                                    type="submit"
                                    className={`px-4 py-2 bg-thirty hover:bg-secondary text-white rounded-md min-w-[14rem] ${checkFormValidation() ? 'opacity-1 cursor-pointer' : 'opacity-50 cursor-not-allowed'} flex justify-center items-center gap-2`} disabled={checkFormValidation() ? false : true}
                                >
                                    {loader && <Icon name='bx bx-loader-alt bx-spin bx-rotate-180' color='#fff' size='1em'/>}{t.generedContract}
                                </button>
                            </div>
                        )
                    }
                </form>
                {/* Submit Button */}
                {
                    !cookie && (
                        <div className="flex justify-end gap-3 flex-wrap my-4">
                            <button form="onSubmitClientForm" type="submit"
                            className={`px-4 py-2 bg-thirty text-white hover:bg-secondarytext-white rounded-md min-w-[14rem] ${checkFormValidation() ? 'opacity-1 cursor-pointer' : 'opacity-50 cursor-not-allowed'} flex justify-center items-center gap-2`} disabled={checkFormValidation() ? false : true}>{loader && <Icon name='bx bx-loader-alt bx-spin bx-rotate-180' color='#fff' size='1em'/>}{t.generedContract}</button>
                        </div>
                    )
                }
            </div>
        </main>
    )
    
}

export default Contrat
