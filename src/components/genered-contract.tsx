"use client"

import { useTranslationContext } from "@/hooks/app-hook";

import { useContext, useEffect, useState } from "react";
import InitCanvaSignature from "./initCanvaSignature";
import { useParams, useRouter } from "next/navigation";
import { AppContext } from "@/app/context/app-context";

import GeneratePdfContract from "./generate-pdf-contract";
import Success from "./success";
import Echec from "./echec";
import Icon from "./Icon";
import Link from "next/link";
import { getCookie } from "@/server/services";

interface Client {
    id: string;
    name:string;
    taxId?:string;
    email?:string;
    modifDate:string
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
    maintenanceCategory:"app"|"saas"|"web"|null;
}

interface clientCountry {
    id:number,
    name:string,
    taxB2C:string,
    taxB2B:string,groupe:string,
    currency:string,
    isoCode:string,threshold_before_tax:number,
    specficTo:"state"|"country",
    vat?:string,
    state:{name:string,tax:number,vat:string,stateCode:string,threshold:number}|null
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
    maintenanceCategory:"app"|"saas"|"web"|null;
    mprice?:number;
    tax:number;
    projectFonctionList:{title:string,description:string,quantity:number,price:number}[];
    contractLanguage:string;
    saleTermeConditionValided?:boolean;
    electronicContractSignatureAccepted?:boolean;
    rigthRetractionLostAfterServiceBegin?:boolean;
}

interface Services {
    clientId:string;
    name:string;
    serviceType: "service"|"maintenance"|"service_and_maintenance";
    contractStatus: 'signed' | 'unsigned' | 'pending';
    contract:Contract
}

interface GeneredContractProps{
    locale:string;
    clientId:string;
    clientServiceId:string;
}

const enableCountryforLostRetraction = ['GB','CH','FR','IT','ES','NL','DE','AT','BE','ZA','AU','CA']

const GeneredContract:React.FC<GeneredContractProps> = ({locale,clientId,clientServiceId})=>{
    const t:any = useTranslationContext();
    const [contract, setContract] = useState<Contract|null>(null)
    const [client, setClient] = useState<Client|null>(null)
    const [contractStatus, setContractStatus] = useState<{translatedOrOriginalContractLink:string;notEnContractLink:string;paymentLink:string;status:"success"|"error"}|null>(null)
    const router = useRouter()
    const [isPopUp,setIsPopUp] = useState<boolean>(false)
    const [loading, setLoading] = useState(true);
    const [loader, setLoader] = useState(false);
    const {contextData} = useContext(AppContext)
    const [clientSignatureLink, setClientSignatureLink] = useState<string | null>(null);
    const [freelanceSignatureLink, setFreelanceSignatureLink] = useState<string | null>(null);
    const [service, setService] = useState<Services|null>(null);
    const [serviceData, setServiceData] = useState<Services|null>(null);
    const [acceptSaleTerm,setAcceptSaleTerm] = useState<boolean>(false)
    const [confirmAcceptBackAmountCondition,setConfirmAcceptBackAmountCondition] = useState<boolean>(false)
    const [confirmElectronicSignature, setConfirmElectronicSignature] = useState<boolean>(false);
    const handleSignatureChange = (data:any)=>{
        console.log("data",data)
        setClientSignatureLink(data.clientSignatureLink)
        setFreelanceSignatureLink(data.freelanceSignature)
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
            return cookie;
        }
        const checkUserConnection = async(contractStatus:"signed"|"unsigned"|"pending")=>{
            const cookie = await checkCookie()
            if (cookie || contractStatus === 'pending') {
            }else{
                router.push("/"+locale)
                return null
            }
        }
        const contractData = sessionStorage.getItem('contractData');
        if (contractData) {
            const parsedData = JSON.parse(contractData);
            console.log("parsedData",parsedData)
            setContract(parsedData.service.contract);
            setClient(parsedData.client);
            setService(parsedData.service);
            checkUserConnection(parsedData.service.contractStatus)
            setLoading(false);
        }else{
            router.push("/"+(client?.clientLang ?? 'en')+"/create-contract/"+clientId+"/"+clientServiceId)
        }
    },[clientId,locale,loading,router])

    const uploadContract = ()=>{
        if(!contract || !clientSignatureLink || !freelanceSignatureLink || !client || !service) return
        setLoader(true)
        setServiceData(service)
    }
    const checkContractValidation = ()=>{
        return (clientSignatureLink !== null && freelanceSignatureLink !== null && confirmElectronicSignature && acceptSaleTerm && confirmAcceptBackAmountCondition) && !loader
    }
    //console.log("totalPrice",contract?.totalPrice, contract)
    const handleContractStatus = (data: { translatedOrOriginalContractLink: string;notEnContractLink: string; paymentLink: string; status: "success" | "error"; }): void =>{
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
                                    contract?.projectFonctionList.map((item, index) => (
                                        <li className="text-[1rem] mb-1" key={index}>{item.title} - {item.description} - {item.price}</li>
                                    ))
                                }
                            </ul>
                            <h3 className="text-[1.5rem] leading-[1.95rem] mb-3">{t.contract.sections["3"].sec3.title}</h3>
                            <p className="text-[1rem] mb-3">{
                                contract ? contract.contractType === 'service' ? t.contract.sections["3"].sec3.paraService.replace("{startDate}",new Date(contract.prestataireGivingData?.startDate!).toLocaleDateString(`${locale === 'fr' ? 'fr-FR' : locale === 'de' ? 'de-DE' : 'en-US'}`)).replace("{endDate}",new Date(contract.prestataireGivingData?.endDate!).toLocaleDateString(`${locale === 'fr' ? 'fr-FR' : locale === 'de' ? 'de-DE' : 'en-US'}`)) : contract.contractType === 'maintenance' ? t.contract.sections["3"].sec3.serviceMaintenance : t.contract.sections["3"].sec3.paraServiceMaintenance.replace("{endDate}",new Date(contract.prestataireGivingData?.endDate!).toLocaleDateString(`${locale === 'fr' ? 'fr-FR' : locale === 'de' ? 'de-DE' : 'en-US'}`)) : ''
                            }</p>
                            <h3 className="text-[1.5rem] leading-[1.95rem] mb-3">{
                                contract ? contract.contractType === 'service' ? t.contract.sections["3"].sec4.titleService : contract.contractType === 'maintenance' ? t.contract.sections["3"].sec4.titleMaintenance : t.contract.sections["3"].sec4.titleServiceMaintenance : ''
                            }</h3>
                            <p className="text-[1rem] mb-5">{
                                contract ? contract.contractType === 'service' ? t.contract.sections["3"].sec4.paraService.replace("{price}",contract.prestataireGivingData?.totalPrice) : contract.contractType === 'maintenance' ? contract.clientGivingData?.typeMaintenance === 'perHour' ? t.contract.sections["3"].sec4.paraMaintenance.peerHour.replace("{mprice}",contract.mprice) : t.contract.sections["3"].sec4.paraMaintenance.perYear.replace("{mprice}",contract.mprice) : `${t.contract.sections["3"].sec4.paraServiceMaintenance.para.replace("{price}",contract.prestataireGivingData?.totalPrice)} ${
                                    contract.clientGivingData?.typeMaintenance === 'perHour' ? t.contract.sections["3"].sec4.paraServiceMaintenance.peerHour.replace("{mprice}",contract.mprice) : t.contract.sections["3"].sec4.paraServiceMaintenance.peerYear.replace("{mprice}",contract.mprice)} ${t.contract.sections["3"].sec4.paraServiceMaintenance.para1}` : ''
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
                                    contract?.prestataireGivingData?.paymentSchedule.split(',').map((item, index) => (
                                        <li className="text-[1rem] mb-1" key={index}><strong>{index === 0 ? t.contract.sections["5"].sec15.item : index === contract.prestataireGivingData!.paymentSchedule.split(',').length - 1 ? t.contract.sections["5"].sec15.itemEnd : t.contract.sections["5"].sec15.item1 + (index + 1) + ': '}</strong> {item}</li>
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
                            <p className="text-[1rem] mb-2">{t.contract.sections["8"].paraD}</p>
                            <p className="text-[1rem] mb-2">{t.contract.sections["8"].paraE.replace("{day}",7)}</p>
                            <p className="text-[1rem] mb-2">{t.contract.sections["8"].paraF}</p>
                            <p className="text-[1rem] mb-5">{t.contract.sections["8"].paraClose}</p>
                            <h2 className="text-[1.8rem] leading-[1.95rem] mb-5">{t.contract.sections["9"].title}</h2>
                            <p className="text-[1rem] mb-3">{t.contract.sections["9"].para}</p>
                            <p className="text-[1rem] mb-2">{t.contract.sections["8"].paraA}</p>
                            <p className="text-[1rem] mb-2">{t.contract.sections["9"].paraB}</p>
                            <p className="text-[1rem] mb-2">{t.contract.sections["9"].paraC}</p>
                        </div>
                        <GeneratePdfContract clientSignatureLink={clientSignatureLink} freelanceSignatureLink={freelanceSignatureLink} client={client} service={serviceData} locale={locale} onEmit={handleContractStatus}/>
                    </section>
                    {
                        locale !== 'en' && <div className="flex justify-center items-start flex-col gap-1 mb-3"><span className="block italic my-4">{t.originalVersion}</span><Link className="p-1 px-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-center text-[.85rem]" href={`/en/sign-contract/${clientId}/${clientServiceId}`}>{t.readOriginalVersion}</Link></div>
                    }
                    <span className="block italic my-4">{t.contractConfirm}</span>
                    <div className="flex justify-start items-center my-5 gap-2">
                        <input type="checkbox" name="" id="confirmElectronicSignature" onChange={(e:any)=>setConfirmElectronicSignature(e.target.checked)}/>
                        <label htmlFor="confirmElectronicSignature">{t.confirmElectronicSignature}</label>
                    </div>
                    <div className="flex justify-start items-center my-5 gap-2">
                        <input type="checkbox" name="" id="acceptSaleTerms" onChange={(e:any)=>setAcceptSaleTerm(e.target.checked)}/>
                        <label htmlFor="acceptSaleTerms" dangerouslySetInnerHTML={{ __html: t.acceptSaleTerm.replace('{GTS}','<a href="/'+(client?.clientLang ?? 'en')+'/terms-of-sale" target="_blank" rel="noreferrer" class="underline text-blue-500">'+t["termsOfSale"]+'</a>') }}/>
                    </div>
                    {
                        enableCountryforLostRetraction.includes(contract?.clientGivingData?.adresse.country.isoCode ?? '') && (
                            <div className="flex justify-start items-center my-5 gap-2">
                                <input type="checkbox" name="" id="backAmountCondition" onChange={(e:any)=>setConfirmAcceptBackAmountCondition(e.target.checked)}/>
                                <label htmlFor="backAmountCondition" dangerouslySetInnerHTML={{ __html: t.backAmountConditionText.replace('{GTS}','<a href="/'+(client?.clientLang ?? 'en')+'/terms-of-sale#article13" target="_blank" rel="noreferrer" class="underline text-blue-500">'+t.backAmountCondition+'</a>') }}/>
                            </div>
                        )
                    }
                    <section className={`signing ${confirmElectronicSignature && acceptSaleTerm && confirmAcceptBackAmountCondition ? 'opacity-100 pointer-events-auto' : 'opacity-50 pointer-events-none'}`}>
                        <InitCanvaSignature locale={locale} emit={handleSignatureChange} enable={confirmElectronicSignature}/>
                    </section>
                    <div className="flex justify-end items-center mt-5 gap-4 flex-wrap">
                        <a className="px-4 py-2 bg-fifty text-primary rounded-md hover:bg-[#ccc] min-w-[14rem] text-center" href={`/${client?.clientLang ?? 'en'}/create-contract/${clientId}/${clientServiceId}/?edit=true`}>{t.updateContract}</a>
                        <button type="button" className={`px-4 py-2 bg-thirty hover:bg-secondary text-white rounded-md min-w-[14rem] ${checkContractValidation() ? 'opacity-1 cursor-pointer' : 'opacity-50 cursor-not-allowed'} flex justify-center items-center gap-2`} disabled={!checkContractValidation()} onClick={uploadContract}>{loader && <Icon name='bx bx-loader-alt bx-spin bx-rotate-180' color='#fff' size='1em'/>}{t.uploadContract}</button>
                    </div>
                    </>
            ) : (
                contractStatus.status === 'success' ? (
                    <div className="pt-9 pb-1"><Success translatedOrOriginalContractLink={contractStatus.translatedOrOriginalContractLink} notEnContractLink={contractStatus.notEnContractLink} paymentLink={contractStatus.paymentLink} locale={client?.clientLang ?? 'en'}/></div>
                ) : (
                    <div className="pt-9 pb-1"><Echec locale={client?.clientLang ?? 'en'} onEmit={handleEmit}/></div>
                )
            )
        }
        </main>
    )
}

export default GeneredContract