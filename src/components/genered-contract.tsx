"use client"

import { useTranslationContext } from "@/hooks/app-hook";

import { useContext, useEffect, useRef, useState } from "react";
import InitCanvaSignature from "./initCanvaSignature";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { AppContext } from "@/app/context/app-context";

import GeneratePdfContract from "./generate-pdf-contract";
import Success from "./success";
import Echec from "./echec";
import Icon from "./Icon";
import Link from "next/link";

import { Client, clientAddress, clientServiceContractDB, Contract, features, serviceDb, Services } from "@/interfaces";
import { decodeClientServiceContract, parseDate } from "@/utils/fonction";
import { getCookie } from "@/server/services";
import SalesTax from "sales-tax";

interface GeneredContractProps{
    locale:string;
    clientUid:string;
    serviceUid:string;
}

const enableCountryforLostRetraction = ['GB','CH','FR','IT','ES','NL','DE','AT','BE','ZA','AU','CA']
const supportCountryWithTaxIdNumberOnLineVerification = ["US","CA","DE","FR","IT","ES","AT","BE","NL","CH","GB","AU","ZA","NG"]
const enableCountryForThresholdBeforTax = ["CA","US","CH","AU","ZA"]

const GeneredContract:React.FC<GeneredContractProps> = ({locale,clientUid,serviceUid})=>{
    if(!clientUid || !serviceUid) return "Page non trouvé"
    const t:any = useTranslationContext();
    const [contract, setContract] = useState<Contract|null>(null)
    const [contractStatus, setContractStatus] = useState<{translatedOrOriginalContractLink:string;notFrContractLink:string;paymentLink:string;status:"success"|"error"}|null>(null)
    const router = useRouter()
    const cookie = useRef<boolean>(false)
    const [currency,setCurrency] = useState<string>("")
    const [isPopUp,setIsPopUp] = useState<boolean>(false)
    const [loading, setLoading] = useState(true);
    const [loader, setLoader] = useState(false);
    const [canGenereContract,setCanGenereContract] = useState<boolean>(false)
    const {contextData,setContextData} = useContext(AppContext)
    
    const [clientSignatureLink, setClientSignatureLink] = useState<string | null>(null);
    const [freelanceSignatureLink, setFreelanceSignatureLink] = useState<string | null>(null);
    const [service, setService] = useState<Services|null>(null);
    const [acceptSaleTerm,setAcceptSaleTerm] = useState<boolean>(false)
    const [confirmAcceptBackAmountCondition,setConfirmAcceptBackAmountCondition] = useState<boolean>(false)
    const [confirmElectronicSignature, setConfirmElectronicSignature] = useState<boolean>(false);
    const noClientId = useRef<boolean>(true)
    const [tax,setTax] = useState<number>(0)

    const [clientId,setClientId] = useState<number>(0)
    const [serviceId,setServiceId] = useState<number>(0)
   

    const handleSignatureChange = (data:any)=>{
        setClientSignatureLink(data.clientSignatureLink)
        setFreelanceSignatureLink(data.freelanceSignature)
    }

    useEffect(()=>{
        if (contextData && (contextData.state === "hide" || contextData.state === "show")) {
            console.log("inside contextData",contextData)
            setIsPopUp(contextData.value)
        }
    },[contextData])

    const uploadContract = ()=>{
        if(!contract || !clientSignatureLink || !freelanceSignatureLink || !service) return
        setLoader(true)
        setCanGenereContract(true)
        //setServiceData(service)
    }

    const checkContractValidation = ()=>{
        return (clientSignatureLink !== null && freelanceSignatureLink !== null && confirmElectronicSignature && acceptSaleTerm && (enableCountryforLostRetraction.includes(contract?.clientGivingData?.addressClient?.clientCountry?.isoCode ?? '') ? confirmAcceptBackAmountCondition : true)) && !loader
    }

    const parseProjectFonctionList = (features:features[]|string|null)=>{
        if (typeof(features) === "string") {
            return JSON.parse(features)
        }
        return features ?? []
    }

    const handleContractStatus = (data: { translatedOrOriginalContractLink: string;notFrContractLink: string; paymentLink: string; status: "success" | "error"; }): void =>{
        setContractStatus(data)
        setLoader(false)
    }

    const handleEmit = (data: string): void =>{
        setContractStatus(null)
        setClientSignatureLink(null)
        setFreelanceSignatureLink(null)
        setConfirmElectronicSignature(false)
        setAcceptSaleTerm(false)
        setConfirmAcceptBackAmountCondition(false)
    }

    console.log("CURRENCY",currency)

    const calculTaxPrice = (price:number,rate:number)=>{
        return (price * rate).toFixed(2)
    }

    const handleClientTaxability = async(juridiction:string)=>{
        const result = await fetch(`/api/check-client-taxability/`,{
            method: 'POST', // Garde votre méthode GET pour l'exemple
            headers: {
            'Content-Type': 'application/json',
            },
            body: JSON.stringify({juridiction})
        })
        if (!result.ok) {
            
        }
        const response = await result.json() as {success:boolean,error:false};
        return response.success
    }

    const getClientTaxInfo = async(isoCode:string,stateCode:string|null,taxId:string|undefined,tax:string) =>{
        //console.log("tax",tax)
        const isCountryTaxable  =  SalesTax.hasSalesTax (isoCode);
        const isStateTaxable = SalesTax.hasStateSalesTax ( isoCode ,  stateCode ?? '' )
        const canPayTax = await checkCLientIsExemptFromTax(isoCode,stateCode,taxId)
        console.log("isCountryTaxable",isCountryTaxable,"isStateTaxable",isStateTaxable,"canPayTax",canPayTax)
        console.log("isocode",isoCode,"stateCode",stateCode,"taxNumber",taxId)

        const getTaxData = async()=>{
            if (isCountryTaxable || isStateTaxable) {
                if (!canPayTax.exempt) {
                    const saleTax = await SalesTax. getSalesTax(isoCode,stateCode,  taxId)
                    console.log("saleTax",saleTax)
                    return {rate:saleTax.rate}
                }
                return null
            }
            return null
        }

        if(supportCountryWithTaxIdNumberOnLineVerification.includes(isoCode)){
            if (enableCountryForThresholdBeforTax.includes(isoCode)) {
                const canTaxClient = await handleClientTaxability(isoCode)
                //console.log("canTaxClient",canTaxClient)
                if (!canTaxClient) {
                    return getTaxData()
                }
                return null
            }else{
                return getTaxData()
            }
        }else{
            return new Promise((resolve,reject)=>{
                resolve({rate:parseInt(tax)/100})})
        }
    }
    const getPriceListDetail = async(totalPrice:string,isoCode:string,stateCode:string,taxId:string|undefined,specificTo:"state"|"country",taxFromFile:string)=>{
        console.log("totalPrice",totalPrice)
        if(!totalPrice) return
        const {taxPrice,totalePrice,taxValue,subTotalPrice} = await calculTotalPriceWithTva(totalPrice,isoCode,stateCode,taxId,specificTo,taxFromFile)
        return {taxPrice,totalePrice,taxValue,subTotalPrice} as {taxPrice:string|number,totalePrice:string|number,taxValue:string|number,subTotalPrice:string|number}
    }

    const checkCLientIsExemptFromTax = async(isoCode:string,stateCode:string|null,taxNumber:string|undefined)=>{
        const data = await SalesTax.getTaxExchangeStatus (isoCode, stateCode,taxNumber)
        return data;
    }

    const calculTotalPriceWithTva = async(price:string,isoCode:string,stateCode:string|null,taxId:string|undefined,specficTo:"state"|"country",tax:string)=>{
        const clientTaxInfo = await getClientTaxInfo(isoCode,stateCode,taxId,tax) as {rate:number}|null
        setTax(clientTaxInfo ? clientTaxInfo.rate * 100 : 0)
        console.log("clientTaxInfo",clientTaxInfo)
        if (clientTaxInfo === null) {
            return {taxPrice:'0',totalePrice:parseInt(price).toFixed(2),taxValue:0}
        } else{
            const taxPrice = calculTaxPrice(parseInt(price),clientTaxInfo.rate)
            const totalePrice = (parseInt(price) + parseInt(taxPrice)).toFixed(2)
            const subTotalPrice = (parseFloat(totalePrice) - parseFloat(taxPrice)).toFixed(2)
            return {taxPrice,totalePrice,taxValue:clientTaxInfo.rate*100,subTotalPrice:subTotalPrice}
        }
    }

    const featurePrise = (price:string|number,quantity:string|number)=>{
        const parseedPrice = typeof(price) === "string" ? parseFloat(price) : price
        const parsedQuantity = typeof(quantity) === "string" ? parseInt(quantity) : quantity
        return parseedPrice*parsedQuantity
    }

    useEffect(() => {
        let clientId = 0;
        let serviceId = 0;
        const handleDataParam = async()=>{
            const search = window.location.search
            const data = search.split("=");
            //alert(data)
            const clientIdParam = data[1].split("")[0]
            const serviceIdParam = data[1].split("")[1]
            //alert(serviceIdParam)
            clientId = parseInt(clientIdParam ?? "0")
            serviceId = parseInt(serviceIdParam ?? "0")
            setClientId(clientId)
            setServiceId(serviceId)
            const cookieData = await getCookie("userAuth")
            cookie.current = cookieData
            if(!clientId || !serviceId) {cookie.current ? router.push(`/${locale}/clients-list`) : router.push(`/${locale}`)}
        }
        handleDataParam()
        
        const fetchContractClientService = async (clientId: number,serviceId:number) =>{
            
            const result = await fetch(`/api/get-client-service-contract/?serviceId=${serviceId}&clientId=${clientId}&prestataireId=${1}`,{
                method: 'GET', // Garde votre méthode GET pour l'exemple
                headers: {
                    'Content-Type': 'application/json',
                }
            })

            if (!result.ok) {
                setContextData({toast:{toastVariant:"error",toastMessage: contract?.clientGivingData?.clientLang ?? locale ? "Une erreur est survenue lors de la requête." : "An Error occurred during the request",showToast:true,time:new Date().getTime()}}) 
            }

            const response = await result.json();
            
            if (response.success && response.result) {
                handleResponse(response.result as clientServiceContractDB)
                //console.log("Client",response.result)
                sessionStorage.setItem('clientServiceContract_'+clientId+'-'+serviceId, JSON.stringify(response.result));
            } else {
                setContextData({toast:{toastVariant:"error",toastMessage:contract?.clientGivingData?.clientLang ?? locale ? "Une erreur est survenue lors de la requête." : "An Error occurred during the request",showToast:true,time:new Date().getTime()}})
            }
        }

        const handleResponse = async(clientData:clientServiceContractDB)=>{
            console.log("Client",clientData)
            setLoading(false);
            if(!clientData) return
            const client = decodeClientServiceContract(clientData) as clientServiceContractDB
                       
            //const cookie = await checkCookie()
            //console.log("addressClient",client.addressClient)

            let addressClient = undefined as clientAddress|undefined

            if (client.addressClient) {
                if (typeof(client.addressClient) === "string") {
                    addressClient = JSON.parse(client.addressClient)
                }else{
                    addressClient = client.addressClient
                }
            }else{
                addressClient = undefined
            }

            const serviceList = client?.services as serviceDb[];
            setCurrency(addressClient?.clientCountry?.currency ?? "USD")
            //console.log("priceDetail",priceDetail)
            if (serviceList.length > 0) {
                const service = serviceList[0]
                const contractData = service.contract
                const priceDetail = await getPriceListDetail(contractData?.totalPrice ? typeof(contractData?.totalPrice) === "number" ? contractData?.totalPrice.toString() : contractData?.totalPrice : "",addressClient?.clientCountry?.isoCode ?? "",addressClient?.clientCountry?.clientState?.stateCode ?? "",contractData?.taxId,addressClient?.clientCountry?.specificTo ?? "country",addressClient?.clientCountry?.taxB2B ?? "0")
                console.log("priceDetail",priceDetail)
                const freelancer = typeof(client.freelancer) === "string" ? JSON.parse(client.freelancer) : client.freelancer
                const contract:Contract|null = contractData ? {contractId:contractData?.contractId,
                    clientGivingData:{clientUid:client.clientUid,saveDate:client.saveDate,clientNumber:client.clientNumber,
                        clientLang:client.clientLang,clientStatus:client.clientStatus,
                        modifDate:client.modifDate,email:client.email,address:client.address,
                        addressClient:addressClient,fname:client.fname,lname:client.lname,
                        taxId:client.taxId ?? '',phone:client.phone,clientType:client.clientType},
                    prestataireGivingData:{subTotalPrice:priceDetail?.subTotalPrice ?? 0,
                        contractStatus:service.contractStatus,taxPercent:priceDetail?.taxValue ?? 0,
                        taxPrice:priceDetail?.taxPrice ?? 0,maintenanceCategory:contractData.maintenanceCategory,
                        totalPrice:priceDetail?.totalePrice ?? 0,paymentSchedule:contractData?.paymentSchedule,
                        startDate:contractData?.startDate,endDate:contractData?.endDate,
                        projectTitle:contractData?.projectTitle,
                    projectDescription:contractData?.projectDescription,freelancerTaxId:freelancer?.freelancerTaxId ?? "",freelancerName:freelancer?.freelancerName ?? "",freelancerAddress:freelancer?.freelancerAddress ?? "",
                    projectFonctionList:contractData?.projectFonctionList}} : null
                setContract(contract);
                //console.log("contract data",contract)
                setService(service);

                if (service?.contractStatus === "signed"){
                    if (cookie.current) {
                        router.push(`/${locale}/clients-list`)
                    }else{
                        router.push(`/${locale}`)
                    }
                }
            }
        }

        const handleData = async()=>{
            const sessionloadedContractData = sessionStorage.getItem('clientServiceContract_'+clientId+'-'+serviceId);
            
            if (sessionloadedContractData) {
                //alert("0")
                const clientParsed = JSON.parse(sessionloadedContractData) as clientServiceContractDB;
                handleResponse(clientParsed)
            }else{
                //alert("1")
                fetchContractClientService(clientId,serviceId);
            }
        }

        handleData()
        
    }, [clientUid,serviceUid,locale]);
    
    if (!contract && loading) return <div className="text-center py-8 mt-[6.875rem] h-[12.5rem] flex justify-center items-center w-[85%] mx-auto">{t.loading}</div>;
    
    return (
        <main className={`transition-transform duration-700 delay-300 ease-in-out ${isPopUp ? 'translate-x-[-25vw]' : 'translate-x-0'} w-[85%] mt-[6.875rem] mx-auto`}>
            {
                contractStatus === null ? (
                    <>
                    <section className="py-5">
                        <h1 className="text-left text-[2.5rem] text-thirty uppercase mb-5">{t.contractTerme}</h1>
                        <div className="">
                            <h2 className="text-[1.8rem] leading-[1.95rem] mb-5">{t.contract.sections["1"].title}</h2>
                            <p className="text-[1rem] mb-3"><strong>{t.contract.sections["1"].paraDef}</strong> {t.contract.sections["1"].para1}</p>
                            <p className="text-[1rem] mb-3"><strong>{t.contract.sections["1"].paraDef}</strong> {t.contract.sections["1"].para2}</p>
                            <p className="text-[1rem] mb-3"><strong>{t.contract.sections["1"].paraDef}</strong> {t.contract.sections["1"].para3}</p>
                            <p className="text-[1rem] mb-5"><strong>{t.contract.sections["1"].para}</strong></p>
                            <h2 className="text-[1.8rem] leading-[1.95rem] mb-5">{t.contract.sections["2"].title}</h2>
                            <h3 className="text-[1.5rem] leading-[1.95rem] mb-3">{t.contract.sections["2"].sec1.title}</h3>
                            <p className="text-[1rem] mb-5">{t.contract.sections["2"].sec1.para}</p>
                            <h3 className="text-[1.5rem] leading-[1.95rem] mb-3">{t.contract.sections["2"].sec2.title}</h3>
                            <p className="text-[1rem] mb-5">{t.contract.sections["2"].sec2.para}</p>
                            <h2 className="text-[1.8rem] leading-[1.95rem] mb-5">{t.contract.sections["3"].title}</h2>
                            <h3 className="text-[1.5rem] leading-[1.95rem] mb-3">{t.contract.sections["3"].sec1.title}</h3>
                            <p className="text-[1rem] mb-5">{contract?.prestataireGivingData?.projectDescription}</p>
                            <h3 className="text-[1.5rem] leading-[1.95rem] mb-3">{t.contract.sections["3"].sec2.title}</h3>
                            <ul className="list-disc ml-10 mb-5">
                                {
                                    contract?.prestataireGivingData && parseProjectFonctionList(contract?.prestataireGivingData?.projectFonctionList).map((item:features, index:number) => (
                                        <li className="text-[1rem] mb-1" key={contract.contractId+'-'+index}>{item.title} - {item.description} - {featurePrise(item.price,item.quantity)} {currency}</li>
                                    ))
                                }
                            </ul>
                            <h3 className="text-[1.5rem] leading-[1.95rem] mb-3">{t.contract.sections["3"].sec3.title}</h3>
                            <p className="text-[1rem] mb-3">{
                                service?.serviceType === 'service' ? t.contract.sections["3"].sec3.paraService.replace("{startDate}",parseDate(contract?.prestataireGivingData?.startDate ?? new Date().getTime(),locale)).replace("{endDate}",parseDate(new Date(contract?.prestataireGivingData?.endDate ?? new Date()),locale)) : service?.serviceType === 'maintenance' ? t.contract.sections["3"].sec3.paraMaintenance : t.contract.sections["3"].sec3.paraServiceMaintenance.replace("{endDate}",parseDate(new Date(contract?.prestataireGivingData?.endDate ?? new Date()),locale))
                            }</p>
                            <h3 className="text-[1.5rem] leading-[1.95rem] mb-3">{
                                service?.serviceType === 'service' ? t.contract.sections["3"].sec4.titleService : service?.serviceType === 'maintenance' ? t.contract.sections["3"].sec4.titleMaintenance : t.contract.sections["3"].sec4.titleServiceMaintenance
                            }</h3>
                            <p className="text-[1rem] mb-5">{
                                service?.serviceType === 'service' ? t.contract.sections["3"].sec4.paraService.replace("{price}",contract?.prestataireGivingData?.totalPrice + " "+currency) : service?.serviceType === 'maintenance' ? service.maintenanceType === 'perHour' ? t.contract.sections["3"].sec4.paraMaintenance.perHour.replace("{mprice}",process.env.NEXT_PUBLIC_MAINTENACE_COST_PER_HOUR + " "+currency) : t.contract.sections["3"].sec4.paraMaintenance.perYear.replace("{mprice}",process.env.NEXT_PUBLIC_MAINTENACE_COST_PER_YEAR + " "+currency) : `${t.contract.sections["3"].sec4.paraServiceMaintenance.para.replace("{price}",contract?.prestataireGivingData?.totalPrice + " "+currency)} ${
                                    service?.maintenanceType=== 'perHour' ? t.contract.sections["3"].sec4.paraServiceMaintenance.perHour.replace("{mprice}",process.env.NEXT_PUBLIC_MAINTENACE_COST_PER_HOUR + " "+currency) : t.contract.sections["3"].sec4.paraServiceMaintenance.perYear.replace("{mprice}",process.env.NEXT_PUBLIC_MAINTENACE_COST_PER_YEAR + " "+currency)} ${t.contract.sections["3"].sec4.paraServiceMaintenance.para1}`
                            }</p>
                            <h2 className="text-[1.8rem] leading-[1.95rem] mb-5">{t.contract.sections["4"].title}</h2>
                            <h3 className="text-[1.5rem] leading-[1.95rem] mb-3">{t.contract.sections["4"].sec1.title}</h3>
                            <p className="text-[1rem] mb-3">{t.contract.sections["4"].sec1.para}</p>
                            <h3 className="text-[1.5rem] leading-[1.95rem] mb-3">{t.contract.sections["4"].sec2.title}</h3>
                            <p className="text-[1rem] mb-3">{t.contract.sections["4"].sec2.para}</p>
                            <h2 className="text-[1.8rem] leading-[1.95rem] mb-5">{t.contract.sections["5"].title}</h2>
                            <h3 className="text-[1.5rem] leading-[1.95rem] mb-3">{t.contract.sections["5"].sec1.title}</h3>
                            <p className="text-[1rem] mb-5">{t.contract.sections["5"].sec1.para}</p>
                            <h3 className="text-[1.5rem] leading-[1.95rem] mb-3">{t.contract.sections["5"].sec2.title}</h3>
                            <p className="text-[1rem] mb-3">{t.contract.sections["5"].sec2.para1}</p>
                            <p className="text-[1rem] mb-5">{t.contract.sections["5"].sec2.para2}</p>
                            <h3 className="text-[1.5rem] leading-[1.95rem] mb-3">{t.contract.sections["5"].sec3.title}</h3>
                            <p className="text-[1rem] mb-3">{t.contract.sections["5"].sec3.para}</p>
                            <p className="text-[1rem] mb-2">{t.contract.sections["5"].sec3.paraA}</p>
                            <p className="text-[1rem] mb-2">{t.contract.sections["5"].sec3.paraB1}</p>
                            <p className="text-[1rem] mb-2">{t.contract.sections["5"].sec3.paraC}</p>
                            <p className="text-[1rem] mb-2">{t.contract.sections["5"].sec3.paraD}</p>
                            <p className="text-[1rem] mb-2">{t.contract.sections["5"].sec3.paraE}</p>
                            <p className="text-[1rem] mb-2">{t.contract.sections["5"].sec3.paraF}</p>
                            <p className="text-[1rem] mb-2"><strong>{t.contract.sections["5"].sec3.paraG}</strong></p>
                            <p className="text-[1rem] mb-2">{t.contract.sections["5"].sec3.paraH1} <strong>{t.contract.sections["5"].sec3.paraH2}</strong></p>
                            <p className="text-[1rem] mb-2">{t.contract.sections["5"].sec3.paraI}</p>
                            <p className="text-[1rem] mb-5">{t.contract.sections["5"].sec3.paraJ}</p>
                            <h3 className="text-[1.5rem] leading-[1.95rem] mb-3">{t.contract.sections["5"].sec4.title}</h3>
                            <p className="text-[1rem] mb-3">{t.contract.sections["5"].sec4.para}</p>
                            <p  className="text-[1rem] mb-2">{t.contract.sections["5"].sec4.paraA}</p>
                            <p className="text-[1rem] mb-2">{t.contract.sections["5"].sec4.paraB1} <strong>{t.contract.sections["5"].sec4.paraB2}</strong></p>
                            <p className="text-[1rem] mb-5">{t.contract.sections["5"].sec4.paraC}</p>
                            <h3 className="text-[1.5rem] leading-[1.95rem] mb-3">{t.contract.sections["5"].sec5.title}</h3>
                            <p className="text-[1rem] mb-5">{t.contract.sections["5"].sec5.para}</p>
                            <h3 className="text-[1.5rem] leading-[1.95rem] mb-3">{t.contract.sections["5"].sec6.title}</h3>
                            <p className="text-[1rem] mb-5">{t.contract.sections["5"].sec6.para11} <strong>{t.contract.sections["5"].sec6.para12}</strong> {t.contract.sections["5"].sec6.para13}</p>
                            <h3 className="text-[1.5rem] leading-[1.95rem] mb-3">{t.contract.sections["5"].sec7.title}</h3>
                            <p className="text-[1rem] mb-5">{t.contract.sections["5"].sec7.para}</p>
                            <h3 className="text-[1.5rem] leading-[1.95rem] mb-3">{t.contract.sections["5"].sec8.title}</h3>
                            <p className="text-[1rem] mb-3">{t.contract.sections["5"].sec8.para11} <strong>{t.contract.sections["5"].sec8.para12}</strong> {t.contract.sections["5"].sec8.para13}</p>
                            <p className="text-[1rem] mb-5">{t.contract.sections["5"].sec8.para}</p>
                            <h3 className="text-[1.5rem] leading-[1.95rem] mb-3">{t.contract.sections["5"].sec9.title}</h3>
                            <p className="text-[1rem] mb-3">{t.contract.sections["5"].sec9.para1}</p>
                            <p className="text-[1rem] mb-3">{t.contract.sections["5"].sec9.para2.replace("{sday}",3)}</p>
                            <p className="text-[1rem] mb-5">{t.contract.sections["5"].sec9.para3.replace("{day}",7).replace("{sday}",3)}</p>
                            <h3 className="text-[1.5rem] leading-[1.95rem] mb-3">{t.contract.sections["5"].sec10.title}</h3>
                            <p className="text-[1rem] mb-3">{t.contract.sections["5"].sec10.para1}</p>
                            <p className="text-[1rem] mb-2">{t.contract.sections["5"].sec10.paraA}</p>
                            <p className="text-[1rem] mb-2">{t.contract.sections["5"].sec10.paraB}</p>
                            <p className="text-[1rem] mb-2">{t.contract.sections["5"].sec10.paraC}</p>
                            <p className="text-[1rem] mb-3"><strong>{t.contract.sections["5"].sec10.para21}</strong> {t.contract.sections["5"].sec10.para22}</p>
                            <p className="text-[1rem] mb-5"><strong>{t.contract.sections["5"].sec10.paraClose}</strong></p>
                            <h3 className="text-[1.5rem] leading-[1.95rem] mb-3">{t.contract.sections["5"].sec11.title}</h3>
                            <p className="text-[1rem] mb-3">{t.contract.sections["5"].sec11.para1}</p>
                            <p className="text-[1rem] mb-3">{t.contract.sections["5"].sec11.para2}</p>
                            <p className="text-[1rem] mb-5">{t.contract.sections["5"].sec11.para3}</p>
                            <h3 className="text-[1.5rem] leading-[1.95rem] mb-3">{t.contract.sections["5"].sec12.title}</h3>
                            <p className="text-[1rem] mb-3">{t.contract.sections["5"].sec12.para}</p>
                            <p className="text-[1rem] mb-2">{t.contract.sections["5"].sec12.paraA}</p>
                            <p className="text-[1rem] mb-2">{t.contract.sections["5"].sec12.paraB}</p>
                            <p className="text-[1rem] mb-2">{t.contract.sections["5"].sec12.paraC}</p>
                            <p className="text-[1rem] mb-2">{t.contract.sections["5"].sec12.paraD}</p>
                            <p className="text-[1rem] mb-2">{t.contract.sections["5"].sec12.paraE}</p>
                            <p className="text-[1rem] mb-2">{t.contract.sections["5"].sec12.paraF}</p>
                            <p className="text-[1rem] mb-2">{t.contract.sections["5"].sec12.paraG}</p>
                            <p className="text-[1rem] mb-5">{t.contract.sections["5"].sec12.paraH}</p>
                            <h3 className="text-[1.5rem] leading-[1.95rem] mb-3">{t.contract.sections["5"].sec13.title}</h3>
                            <p className="text-[1rem] mb-3">{t.contract.sections["5"].sec13.para}</p>
                            <p className="text-[1rem] mb-2">{t.contract.sections["5"].sec13.paraA}</p>
                            <p className="text-[1rem] mb-2">{t.contract.sections["5"].sec13.paraB}</p>
                            <p className="text-[1rem] mb-5">{t.contract.sections["5"].sec13.paraClose}</p>
                            <h3 className="text-[1.5rem] leading-[1.95rem] mb-3">{t.contract.sections["5"].sec14.title}</h3>
                            <p className="text-[1rem] mb-3">{t.contract.sections["5"].sec14.para}</p>
                            <p className="text-[1rem] mb-2">{t.contract.sections["5"].sec14.paraA}</p>
                            <p className="text-[1rem] mb-2">{t.contract.sections["5"].sec14.paraB}</p>
                            <p className="text-[1rem] mb-2">{t.contract.sections["5"].sec14.paraC}</p>
                            <p className="text-[1rem] mb-2">{t.contract.sections["5"].sec14.paraD}</p>
                            <p className="text-[1rem] mb-2">{t.contract.sections["5"].sec14.paraE}</p>
                            <p className="text-[1rem] mb-5">{t.contract.sections["5"].sec14.paraClose}</p>
                            <h3 className="text-[1.5rem] leading-[1.95rem] mb-3">{t.contract.sections["5"].sec15.title}</h3>
                            <p className="text-[1rem] mb-3">{t.contract.sections["5"].sec15.para11} <strong>{t.contract.sections["5"].sec15.para12}</strong> {t.contract.sections["5"].sec15.para13}</p>
                            <p className="text-[1rem] mb-3">{t.contract.sections["5"].sec15.para4}</p>
                            <ol className="list-decimal ml-10 mb-5">
                                {
                                    contract?.prestataireGivingData?.paymentSchedule.split(';').map((item, index) => (
                                        <li className="text-[1rem] mb-1" key={index}><strong>{index === 0 ? t.contract.sections["5"].sec15.item : index === contract.prestataireGivingData!.paymentSchedule.split(',').length - 1 ? t.contract.sections["5"].sec15.itemEnd : t.contract.sections["5"].sec15.item1 + (index + 1) + ' : '}</strong> {item}</li>
                                    ))
                                }
                            </ol>
                            <h3 className="text-[1.5rem] leading-[1.95rem] mb-3">{t.contract.sections["5"].sec16.title}</h3>
                            <p className="text-[1rem] mb-5">{t.contract.sections["5"].sec16.para11} <strong>{t.contract.sections["5"].sec16.para12}</strong> {t.contract.sections["5"].sec16.para13}</p>
                            <h3 className="text-[1.5rem] leading-[1.95rem] mb-3">{t.contract.sections["5"].sec17.title}</h3>
                            <p className="text-[1rem] mb-3">{t.contract.sections["5"].sec17.para1}</p>
                            <p className="text-[1rem] mb-2">{t.contract.sections["5"].sec17.paraA}</p>
                            <p className="text-[1rem] mb-2">{t.contract.sections["5"].sec17.paraB}</p>
                            <p className="text-[1rem] mb-2">{t.contract.sections["5"].sec17.paraC}</p>
                            <p className="text-[1rem] mb-3">{t.contract.sections["5"].sec17.para2}</p>
                            <p className="text-[1rem] mb-5">{t.contract.sections["5"].sec17.paraClose}</p>
                            <h3 className="text-[1.5rem] leading-[1.95rem] mb-3">{t.contract.sections["5"].sec18.title}</h3>
                            <p className="text-[1rem] mb-2">{t.contract.sections["5"].sec18.para1}</p>
                            <p className="text-[1rem] mb-2">{t.contract.sections["5"].sec18.para2}</p>
                            <p className="text-[1rem] mb-2">3) <strong>{t.contract.sections["5"].sec18.para3}</strong></p>
                            <p className="text-[1rem] mb-5">{t.contract.sections["5"].sec18.paraClose}</p>
                            <h3 className="text-[1.5rem] leading-[1.95rem] mb-3">{t.contract.sections["5"].sec19.title}</h3>
                            <p className="text-[1rem] mb-2">{t.contract.sections["5"].sec19.para1}</p>
                            <p className="text-[1rem] mb-2">{t.contract.sections["5"].sec19.para2}</p>
                            <p className="text-[1rem] mb-2">{t.contract.sections["5"].sec19.para3}</p>
                            <p className="text-[1rem] mb-5">{t.contract.sections["5"].sec19.para4}</p>
                            <h3 className="text-[1.5rem] leading-[1.95rem] mb-3">{t.contract.sections["5"].sec20.title}</h3>
                            <p className="text-[1rem] mb-2">{t.contract.sections["5"].sec20.para11} <strong>{t.contract.sections["5"].sec20.para12}</strong> {t.contract.sections["5"].sec20.para13} <strong>{t.contract.sections["5"].sec20.para14}</strong> {t.contract.sections["5"].sec20.para15}</p>
                            <ul className="list-disc ml-10 mb-5">
                                <li>{t.contract.sections["5"].sec20.para2A}</li>
                                <li>{t.contract.sections["5"].sec20.para2B}</li>
                            </ul>
                            <p className="text-[1rem] mb-5">{t.contract.sections["5"].sec20.para3}</p>
                            <p className="text-[1rem] mb-5"><strong>{t.contract.sections["5"].sec20.paraBold}</strong></p>
                            <ul className="list-disc ml-10 mb-5">
                                <li>{t.contract.sections["5"].sec20.para3A}</li>
                                <li>{t.contract.sections["5"].sec20.para3B}</li>
                                <li>{t.contract.sections["5"].sec20.para3C}</li>
                            </ul>
                            <p className="text-[1rem] mb-5">{t.contract.sections["5"].sec20.para4}</p>
                            <p className="text-[1rem] mb-5">{t.contract.sections["5"].sec20.para51} <strong>{t.contract.sections["5"].sec20.para52}</strong> {t.contract.sections["5"].sec20.para53}</p>
                            <h2 className="text-[1.8rem] leading-[1.95rem] mb-5">{t.contract.sections["6"].title}</h2>
                            <p className="text-[1rem] mb-5">{t.contract.sections["6"].para}</p>
                            <h3 className="text-[1.5rem] leading-[1.95rem] mb-3">{t.contract.sections["6"].sec1.title}</h3>
                            <p className="text-[1rem] mb-5">{t.contract.sections["6"].sec1.para}</p>
                            <h3 className="text-[1.5rem] leading-[1.95rem] mb-3">{t.contract.sections["6"].sec2.title}</h3>
                            <p className="text-[1rem] mb-5">{t.contract.sections["6"].sec2.para11} <strong>{t.contract.sections["6"].sec2.para12}</strong> {t.contract.sections["6"].sec2.para13}</p>
                            <h3 className="text-[1.5rem] leading-[1.95rem] mb-3">{t.contract.sections["6"].sec3.title}</h3>
                            <p className="text-[1rem] mb-5">{t.contract.sections["6"].sec3.para}</p>
                            <h3 className="text-[1.5rem] leading-[1.95rem] mb-3">{t.contract.sections["6"].sec4.title}</h3>
                            <p className="text-[1rem] mb-5">{t.contract.sections["6"].sec4.para}</p>
                            <h3 className="text-[1.5rem] leading-[1.95rem] mb-3">{t.contract.sections["6"].sec5.title}</h3>
                            <p className="text-[1rem] mb-5">{t.contract.sections["6"].sec5.para}</p>
                            <h3 className="text-[1.5rem] leading-[1.95rem] mb-3">{t.contract.sections["6"].sec6.title}</h3>
                            <p className="text-[1rem] mb-5">{t.contract.sections["6"].sec6.para}</p>
                            <h3 className="text-[1.5rem] leading-[1.95rem] mb-3">{t.contract.sections["6"].sec7.title}</h3>
                            <p className="text-[1rem] mb-5">{t.contract.sections["6"].sec7.para}</p>
                            <h3 className="text-[1.5rem] leading-[1.95rem] mb-3">{t.contract.sections["6"].sec8.title}</h3>
                            <p className="text-[1rem] mb-5">{t.contract.sections["6"].sec8.para}</p>
                            <h3 className="text-[1.5rem] leading-[1.95rem] mb-3">{t.contract.sections["6"].sec9.title}</h3>
                            <p className="text-[1rem] mb-5">{t.contract.sections["6"].sec9.para}</p>
                            <h3 className="text-[1.5rem] leading-[1.95rem] mb-3">{t.contract.sections["6"].sec10.title}</h3>
                            <p className="text-[1rem] mb-5">{t.contract.sections["6"].sec10.para}</p>
                            <h3 className="text-[1.5rem] leading-[1.95rem] mb-3">{t.contract.sections["6"].sec11.title}</h3>
                            <p className="text-[1rem] mb-5">{t.contract.sections["6"].sec11.para}</p>
                            <h3 className="text-[1.5rem] leading-[1.95rem] mb-3">{t.contract.sections["6"].sec12.title}</h3>
                            <p className="text-[1rem] mb-5">{t.contract.sections["6"].sec12.para11} <strong>{t.contract.sections["6"].sec12.para12}</strong></p>
                            {
                                t.contract.sections["6"].sec12.para2 !== '' && <p className="text-[1rem] mb-5">{t.contract.sections["6"].sec12.para2}</p>
                            }
                            <h3 className="text-[1.5rem] leading-[1.95rem] mb-3">{t.contract.sections["6"].sec13.title}</h3>
                            <p className="text-[1rem] mb-5">{t.contract.sections["6"].sec13.para}</p>
                            <h3 className="text-[1.5rem] leading-[1.95rem] mb-3">{t.contract.sections["6"].sec14.title}</h3>
                            <p className="text-[1rem] mb-5">{t.contract.sections["6"].sec14.para}</p>
                            <h3 className="text-[1.5rem] leading-[1.95rem] mb-3">{t.contract.sections["6"].sec15.title}</h3>
                            <p className="text-[1rem] mb-5">{t.contract.sections["6"].sec15.para}</p>
                            <h3 className="text-[1.5rem] leading-[1.95rem] mb-3">{t.contract.sections["6"].sec16.title}</h3>
                            <p className="text-[1rem] mb-5">{t.contract.sections["6"].sec16.para}</p>
                            <h2 className="text-[1.8rem] leading-[1.95rem] mb-5">{t.contract.sections["7"].title}</h2>
                            <p className="text-[1rem] mb-5">{t.contract.sections["7"].para}</p>
                            <h2 className="text-[1.8rem] leading-[1.95rem] mb-5">{t.contract.sections["8"].title}</h2>
                            <p className="text-[1rem] mb-3">{t.contract.sections["8"].para}</p>
                            <p className="text-[1rem] mb-2">{t.contract.sections["8"].paraA}</p>
                            <p className="text-[1rem] mb-2">{t.contract.sections["8"].paraB}</p>
                            <p className="text-[1rem] mb-2">{t.contract.sections["8"].paraC}</p>
                            <p className="text-[1rem] mb-2">{t.contract.sections["8"].paraD.replace("{day}",7)}</p>
                            <p className="text-[1rem] mb-2">{t.contract.sections["8"].paraE}</p>
                            <p className="text-[1rem] mb-5">{t.contract.sections["8"].paraClose}</p>
                            <h2 className="text-[1.8rem] leading-[1.95rem] mb-5">{t.contract.sections["9"].title}</h2>
                            <p className="text-[1rem] mb-3">{t.contract.sections["9"].para}</p>
                            <p className="text-[1rem] mb-2">{t.contract.sections["8"].paraA}</p>
                            <p className="text-[1rem] mb-2">{t.contract.sections["9"].paraB}</p>
                            <p className="text-[1rem] mb-2">{t.contract.sections["9"].paraC}</p>
                        </div>
                        {canGenereContract && <GeneratePdfContract clientId={clientId} serviceId={serviceId} clientSignatureLink={clientSignatureLink} freelanceSignatureLink={freelanceSignatureLink} contract={contract} service={service} locale={locale} onEmit={handleContractStatus}/>}
                    </section>
                    {
                        locale !== 'fr' && <div className="flex justify-center items-start flex-col gap-1 mb-3"><span className="block italic my-4">{t.originalVersion}</span><Link className="p-1 px-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-center text-[.85rem]" href={`/fr/sign-contract/${clientUid}/${serviceUid}`}>{t.readOriginalVersion}</Link></div>
                    }
                    <span className="block italic my-4">{t.contractConfirm} <Link className="text-sm text-blue-600 underline" href={`mailto:${process.env.NEXT_PUBLIC_FREELANCE_EMAIL_SUPPORT}`}>{process.env.NEXT_PUBLIC_FREELANCE_EMAIL_SUPPORT}</Link></span>
                    <div className="flex justify-start items-center my-5 gap-2">
                        <input type="checkbox" name="" id="confirmElectronicSignature" onChange={(e:any)=>setConfirmElectronicSignature(e.target.checked)}/>
                        <label htmlFor="confirmElectronicSignature">{t.confirmElectronicSignature}</label>
                    </div>
                    <div className="flex justify-start items-center my-5 gap-2">
                        <input type="checkbox" name="" id="acceptSaleTerms" onChange={(e:any)=>setAcceptSaleTerm(e.target.checked)}/>
                        <label htmlFor="acceptSaleTerms" dangerouslySetInnerHTML={{ __html: t.acceptSaleTerm.replace('{GTS}','<a href="/'+(contract?.clientGivingData?.clientLang ?? 'en')+'/terms-of-sale" target="_blank" rel="noreferrer" class="underline text-blue-500">'+t["termsOfSale"]+'</a>') }}/>
                    </div>
                    {
                        enableCountryforLostRetraction.includes(contract?.clientGivingData?.addressClient?.clientCountry?.isoCode ?? '') && (
                            <div className="flex justify-start items-center my-5 gap-2">
                                <input type="checkbox" name="" id="backAmountCondition" onChange={(e:any)=>setConfirmAcceptBackAmountCondition(e.target.checked)}/>
                                <label htmlFor="backAmountCondition" dangerouslySetInnerHTML={{ __html: t.backAmountConditionText.replace('{GTS}','<a href="/'+(contract?.clientGivingData?.clientLang ?? 'en')+'/terms-of-sale#article13" target="_blank" rel="noreferrer" class="underline text-blue-500">'+t.backAmountCondition+'</a>') }}/>
                            </div>
                        )
                    }
                    <section className={`signing ${confirmElectronicSignature && acceptSaleTerm && (enableCountryforLostRetraction.includes(contract?.clientGivingData?.addressClient?.clientCountry?.isoCode ?? '') ? confirmAcceptBackAmountCondition : true) ? 'opacity-100 pointer-events-auto' : 'opacity-50 pointer-events-none'}`}>
                        <InitCanvaSignature locale={locale} emit={handleSignatureChange} enable={confirmElectronicSignature}/>
                    </section>
                    <div className="flex justify-end items-center mt-5 gap-4 flex-wrap">
                        <a className="px-4 py-2 bg-fifty text-primary rounded-md hover:bg-[#ccc] min-w-[14rem] text-center" href={`/${contract?.clientGivingData?.clientLang ?? 'en'}/create-contract/${clientUid}/${serviceUid}`}>{t.updateContract}</a>
                        <button type="button" className={`px-4 py-2 bg-thirty hover:bg-secondary text-white rounded-md min-w-[14rem] ${checkContractValidation() ? 'opacity-1 cursor-pointer' : 'opacity-50 cursor-not-allowed'} flex justify-center items-center gap-2`} disabled={checkContractValidation() ? false : true} onClick={uploadContract}>{loader && <Icon name='bx bx-loader-alt bx-spin bx-rotate-180' color='#fff' size='1em'/>}{t.uploadContract}</button>
                    </div>
                    </>
            ) : (
                contractStatus.status === 'success' ? (
                    <div className="pt-9 pb-1"><Success originalContractLink={contractStatus.translatedOrOriginalContractLink} notFrContractLink={contractStatus.notFrContractLink} paymentLink={contractStatus.paymentLink} locale={contract?.clientGivingData?.clientLang ?? 'en'}/></div>
                ) : (
                    <div className="pt-9 pb-1"><Echec locale={contract?.clientGivingData?.clientLang ?? 'en'} onEmit={handleEmit}/></div>
                )
            )
        }
        </main>
    )
}

export default GeneredContract