"use client"

import { useTranslationContext } from "@/hooks/app-hook";

import { useContext, useEffect, useState } from "react";
import InitCanvaSignature from "./initCanvaSignature";
import { useParams, useRouter } from "next/navigation";
import { AppContext } from "@/app/context/app-context";
import Cookies from 'js-cookie';
import GeneratePdfContract from "./generate-pdf-contract";

interface Client {
    id: string;
    name:string;
    email?:string;
    contractType: "service"|"maintenance"|"service_and_maintenance";
    contractStatus: 'signed' | 'unsigned' | 'pending';
    dateCreation: Date;
    clientNumber:number;
    invoiceCount?:number;
    contract:Contract
}

interface Contract {
    name:string;
    clientAddress:string;
    clientBillingAddress?:string;
    clientEmail:string;
    clientPhone:string;
    clientSIRET?:string;
    freelancerName:string;
    freelancerSirets?:string;
    freelanceAddress:string;
    projectTitle:string;
    projectDescription:string;
    projectFonctionList:string[];
    startDate:string;
    endDate:string;
    contractType: "service"|"maintenance"|"service_and_maintenance";
    maintenanceType:"app"|"saas"|"web"|null;
    maintenaceOptionPayment?:"perYear"|"perHour"
    totalPrice:number;
    paymentSchedule:string;
    contractLanguage:string;
}

interface GeneredContractProps{
    locale:string
}

const GeneredContract:React.FC<GeneredContractProps> = ({locale})=>{
    const t:any = useTranslationContext();
    const [contract, setContract] = useState<Contract|null>(null)
    const [client, setClient] = useState<Client|null>(null)
    const [contractData, setContractData] = useState<Contract|null>(null)
    const router = useRouter()
    const [isPopUp,setIsPopUp] = useState<boolean>(false)
    const [loading, setLoading] = useState(true);
    const {contextData} = useContext(AppContext)
    const [clientSignatureLink, setClientSignatureLink] = useState<string | null>(null);
    const [freelanceSignatureLink, setFreelanceSignatureLink] = useState<string | null>(null);

    const {id} = useParams()
    const clientId = id as string

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
        const contractData = sessionStorage.getItem('contractData');
        if (contractData) {
            const parsedData = JSON.parse(contractData);
            setContract(parsedData.contract);
            setClient(parsedData.client);
            setLoading(false);
        }else{
            router.push("/"+locale+"/create-contract/"+clientId)
        }
    },[clientId,locale,loading])

    if (client?.contractStatus === 'signed' || (client?.contractStatus === 'unsigned' && !Cookies.get('logged'))) {
        router.push("/"+locale)
    }
    const uploadContract = ()=>{
        if(!contract || !clientSignatureLink || !freelanceSignatureLink || !client) return
        setContractData(contract)
    }
    const checkContractValidation = ()=>{
        return clientSignatureLink !== null && freelanceSignatureLink !== null
    }
    if (loading) return <div className="text-center py-8 mt-[110px] h-[200px] flex justify-center items-center w-[85%] mx-auto">Chargement...</div>;
    return (
        <main className={`transition-transform duration-700 delay-300 ease-in-out ${isPopUp ? 'translate-x-[-25vw]' : 'translate-x-0'} w-[85%] mt-[110px] mx-auto`}>
            <section className="py-5">
                <h1 className="text-left text-[2.5rem] text-thirty uppercase mb-5">Terme du contrat</h1>
                <div className="">
                    <h2 className="text-[2.1rem] leading-9 mb-5">{t.contract.sections["1"].title}</h2>
                    <p className="text-[1rem] mb-3"><strong>{t.contract.sections["1"].paraDef}</strong> {t.contract.sections["1"].para1}</p>
                    <p className="text-[1rem] mb-3"><strong>{t.contract.sections["1"].paraDef}</strong> {t.contract.sections["1"].para2}</p>
                    <p className="text-[1rem] mb-3"><strong>{t.contract.sections["1"].paraDef}</strong> {t.contract.sections["1"].para3}</p>
                    <p className="text-[1rem] mb-5"><strong>{t.contract.sections["1"].para}</strong></p>
                    <h2 className="text-[2.1rem] leading-9 mb-5">{t.contract.sections["2"].title}</h2>
                    <h3 className="text-[1.8rem] leading-9 mb-3">{t.contract.sections["2"].sec1.title}</h3>
                    <p className="text-[1rem] mb-5">{t.contract.sections["2"].sec1.para}</p>
                    <h3 className="text-[1.8rem] leading-9 mb-3">{t.contract.sections["2"].sec2.title}</h3>
                    <p className="text-[1rem] mb-5">{t.contract.sections["2"].sec2.para}</p>
                    <h2 className="text-[2.1rem] leading-9 mb-5">{t.contract.sections["3"].title}</h2>
                    <h3 className="text-[1.8rem] leading-9 mb-3">{t.contract.sections["3"].sec1.title}</h3>
                    <p className="text-[1rem] mb-5">{contract?.projectDescription}</p>
                    <h3 className="text-[1.8rem] leading-9 mb-3">{t.contract.sections["3"].sec2.title}</h3>
                    <ul className="list-disc ml-10 mb-5">
                        {
                            contract?.projectFonctionList.map((item, index) => (
                                <li className="text-[1rem] mb-1" key={index}>{item}</li>
                            ))
                        }
                    </ul>
                    <h3 className="text-[1.8rem] leading-9 mb-3">{t.contract.sections["3"].sec3.title}</h3>
                    <p className="text-[1rem] mb-3">{
                        contract ? contract.contractType === 'service' ? t.contract.sections["3"].sec3.paraService : contract.contractType === 'maintenance' ? t.contract.sections["3"].sec3.serviceMaintenance : t.contract.sections["3"].sec3.paraServiceMaintenance : ''
                    }</p>
                    <h3 className="text-[1.8rem] leading-9 mb-3">{
                        contract ? contract.contractType === 'service' ? t.contract.sections["3"].sec4.titleService : contract.contractType === 'maintenance' ? t.contract.sections["3"].sec4.titleMaintenance : t.contract.sections["3"].sec4.titleServiceMaintenance : ''
                    }</h3>
                    <p className="text-[1rem] mb-5">{
                        contract ? contract.contractType === 'service' ? t.contract.sections["3"].sec4.paraService : contract.contractType === 'maintenance' ? contract.maintenaceOptionPayment === 'perHour' ? t.contract.sections["3"].sec4.paraMaintenance.peerHour : t.contract.sections["3"].sec4.paraMaintenance.perYear : `${t.contract.sections["3"].sec4.paraServiceMaintenance.para} ${
                            contract.maintenaceOptionPayment === 'perHour' ? t.contract.sections["3"].sec4.paraServiceMaintenance.peerHour : t.contract.sections["3"].sec4.paraServiceMaintenance.perYear} ${t.contract.sections["3"].sec4.paraServiceMaintenance.para1}` : ''
                    }</p>
                    <h2 className="text-[2.1rem] leading-9 mb-5">{t.contract.sections["4"].title}</h2>
                    <h3 className="text-[1.8rem] leading-9 mb-3">{t.contract.sections["4"].sec1.title}</h3>
                    <p className="text-[1rem] mb-3">{t.contract.sections["4"].sec1.para}</p>
                    <h3 className="text-[1.8rem] leading-9 mb-3">{t.contract.sections["4"].sec2.title}</h3>
                    <p className="text-[1rem] mb-3">{t.contract.sections["4"].sec2.para}</p>
                    <h2 className="text-[2.1rem] leading-9 mb-5">{t.contract.sections["5"].title}</h2>
                    <h3 className="text-[1.8rem] leading-9 mb-3">{t.contract.sections["5"].sec1.title}</h3>
                    <p className="text-[1rem] mb-5">{t.contract.sections["5"].sec1.para}</p>
                    <h3 className="text-[1.8rem] leading-9 mb-3">{t.contract.sections["5"].sec2.title}</h3>
                    <p className="text-[1rem] mb-3">{t.contract.sections["5"].sec2.para1}</p>
                    <p className="text-[1rem] mb-5">{t.contract.sections["5"].sec2.para2}</p>
                    <h3 className="text-[1.8rem] leading-9 mb-3">{t.contract.sections["5"].sec3.title}</h3>
                    <p className="text-[1rem] mb-3">{t.contract.sections["5"].sec3.para}</p>
                    <p className="text-[1rem] mb-2">{t.contract.sections["5"].sec3.paraA}</p>
                    <p className="text-[1rem] mb-2">{t.contract.sections["5"].sec3.paraB1} <strong>{t.contract.sections["5"].sec3.paraB2}</strong></p>
                    <p className="text-[1rem] mb-2">{t.contract.sections["5"].sec3.paraC}</p>
                    <p className="text-[1rem] mb-2">{t.contract.sections["5"].sec3.paraD}</p>
                    <p className="text-[1rem] mb-2">{t.contract.sections["5"].sec3.paraE}</p>
                    <p className="text-[1rem] mb-2">{t.contract.sections["5"].sec3.paraF}</p>
                    <p className="text-[1rem] mb-2"><strong>{t.contract.sections["5"].sec3.paraG}</strong></p>
                    <p className="text-[1rem] mb-2">{t.contract.sections["5"].sec3.paraH1} <strong>{t.contract.sections["5"].sec3.paraH2}</strong></p>
                    <p className="text-[1rem] mb-2">{t.contract.sections["5"].sec3.paraI}</p>
                    <p className="text-[1rem] mb-5">{t.contract.sections["5"].sec3.paraJ}</p>
                    <h3 className="text-[1.8rem] leading-9 mb-3">{t.contract.sections["5"].sec4.title}</h3>
                    <p className="text-[1rem] mb-3">{t.contract.sections["5"].sec4.para}</p>
                    <p  className="text-[1rem] mb-2">{t.contract.sections["5"].sec4.paraA}</p>
                    <p className="text-[1rem] mb-2">{t.contract.sections["5"].sec4.paraB1} <strong>{t.contract.sections["5"].sec4.paraB2}</strong></p>
                    <p className="text-[1rem] mb-5">{t.contract.sections["5"].sec4.paraC}</p>
                    <h3 className="text-[1.8rem] leading-9 mb-3">{t.contract.sections["5"].sec5.title}</h3>
                    <p className="text-[1rem] mb-5">{t.contract.sections["5"].sec5.para}</p>
                    <h3 className="text-[1.8rem] leading-9 mb-3">{t.contract.sections["5"].sec6.title}</h3>
                    <p className="text-[1rem] mb-5">{t.contract.sections["5"].sec6.para11} <strong>{t.contract.sections["5"].sec6.para12}</strong> {t.contract.sections["5"].sec6.para13}</p>
                    <h3 className="text-[1.8rem] leading-9 mb-3">{t.contract.sections["5"].sec7.title}</h3>
                    <p className="text-[1rem] mb-5">{t.contract.sections["5"].sec7.para}</p>
                    <h3 className="text-[1.8rem] leading-9 mb-3">{t.contract.sections["5"].sec8.title}</h3>
                    <p className="text-[1rem] mb-3">{t.contract.sections["5"].sec8.para11} <strong>{t.contract.sections["5"].sec8.para12}</strong> {t.contract.sections["5"].sec8.para13}</p>
                    <p className="text-[1rem] mb-5">{t.contract.sections["5"].sec8.para}</p>
                    <h3 className="text-[1.8rem] leading-9 mb-3">{t.contract.sections["5"].sec9.title}</h3>
                    <p className="text-[1rem] mb-3">{t.contract.sections["5"].sec9.para1}</p>
                    <p className="text-[1rem] mb-3">{t.contract.sections["5"].sec9.para2}</p>
                    <p className="text-[1rem] mb-5">{t.contract.sections["5"].sec9.para3}</p>
                    <h3 className="text-[1.8rem] leading-9 mb-3">{t.contract.sections["5"].sec10.title}</h3>
                    <p className="text-[1rem] mb-3">{t.contract.sections["5"].sec10.para1}</p>
                    <p className="text-[1rem] mb-2">{t.contract.sections["5"].sec10.paraA}</p>
                    <p className="text-[1rem] mb-2">{t.contract.sections["5"].sec10.paraB}</p>
                    <p className="text-[1rem] mb-2">{t.contract.sections["5"].sec10.paraC}</p>
                    <p className="text-[1rem] mb-3"><strong>{t.contract.sections["5"].sec10.para21}</strong> {t.contract.sections["5"].sec10.para22}</p>
                    <p className="text-[1rem] mb-5"><strong>{t.contract.sections["5"].sec10.paraClose}</strong></p>
                    <h3 className="text-[1.8rem] leading-9 mb-3">{t.contract.sections["5"].sec11.title}</h3>
                    <p className="text-[1rem] mb-3">{t.contract.sections["5"].sec11.para1}</p>
                    <p className="text-[1rem] mb-3">{t.contract.sections["5"].sec11.para2}</p>
                    <p className="text-[1rem] mb-5">{t.contract.sections["5"].sec11.para3}</p>
                    <h3 className="text-[1.8rem] leading-9 mb-3">{t.contract.sections["5"].sec12.title}</h3>
                    <p className="text-[1rem] mb-3">{t.contract.sections["5"].sec12.para}</p>
                    <p className="text-[1rem] mb-2">{t.contract.sections["5"].sec12.paraA}</p>
                    <p className="text-[1rem] mb-2">{t.contract.sections["5"].sec12.paraB}</p>
                    <p className="text-[1rem] mb-2">{t.contract.sections["5"].sec12.paraC}</p>
                    <p className="text-[1rem] mb-2">{t.contract.sections["5"].sec12.paraD}</p>
                    <p className="text-[1rem] mb-2">{t.contract.sections["5"].sec12.paraE}</p>
                    <p className="text-[1rem] mb-2">{t.contract.sections["5"].sec12.paraF}</p>
                    <p className="text-[1rem] mb-2">{t.contract.sections["5"].sec12.paraG}</p>
                    <p className="text-[1rem] mb-5">{t.contract.sections["5"].sec12.paraH}</p>
                    <h3 className="text-[1.8rem] leading-9 mb-3">{t.contract.sections["5"].sec13.title}</h3>
                    <p className="text-[1rem] mb-3">{t.contract.sections["5"].sec13.para}</p>
                    <p className="text-[1rem] mb-2">{t.contract.sections["5"].sec13.paraA}</p>
                    <p className="text-[1rem] mb-2">{t.contract.sections["5"].sec13.paraB}</p>
                    <p className="text-[1rem] mb-5">{t.contract.sections["5"].sec13.paraClose}</p>
                    <h3 className="text-[1.8rem] leading-9 mb-3">{t.contract.sections["5"].sec14.title}</h3>
                    <p className="text-[1rem] mb-3">{t.contract.sections["5"].sec14.para}</p>
                    <p className="text-[1rem] mb-2">{t.contract.sections["5"].sec14.paraA}</p>
                    <p className="text-[1rem] mb-2">{t.contract.sections["5"].sec14.paraB}</p>
                    <p className="text-[1rem] mb-2">{t.contract.sections["5"].sec14.paraC}</p>
                    <p className="text-[1rem] mb-2">{t.contract.sections["5"].sec14.paraD}</p>
                    <p className="text-[1rem] mb-2">{t.contract.sections["5"].sec14.paraE}</p>
                    <p className="text-[1rem] mb-5">{t.contract.sections["5"].sec14.paraClose}</p>
                    <h3 className="text-[1.8rem] leading-9 mb-3">{t.contract.sections["5"].sec15.title}</h3>
                    <p className="text-[1rem] mb-3">{t.contract.sections["5"].sec15.para11} <strong>{t.contract.sections["5"].sec15.para12}</strong> {t.contract.sections["5"].sec15.para13}</p>
                    <p className="text-[1rem] mb-3">{t.contract.sections["5"].sec15.para4}</p>
                    <ol className="list-decimal ml-10 mb-5">
                        {
                            contract?.paymentSchedule.split(',').map((item, index) => (
                                <li className="text-[1rem] mb-1" key={index}><strong>{index === 0 ? t.contract.sections["5"].sec15.item : index === contract?.paymentSchedule.split(',').length - 1 ? t.contract.sections["5"].sec15.itemEnd : t.contract.sections["5"].sec15.item1 + (index + 1) + ': '}</strong> {item}</li>
                            ))
                        }
                    </ol>
                    <h3 className="text-[1.8rem] leading-9 mb-3">{t.contract.sections["5"].sec16.title}</h3>
                    <p className="text-[1rem] mb-5">{t.contract.sections["5"].sec16.para11} <strong>{t.contract.sections["5"].sec16.para12}</strong> {t.contract.sections["5"].sec16.para13}</p>
                    <h3 className="text-[1.8rem] leading-9 mb-3">{t.contract.sections["5"].sec17.title}</h3>
                    <p className="text-[1rem] mb-3">{t.contract.sections["5"].sec17.para1}</p>
                    <p className="text-[1rem] mb-2">{t.contract.sections["5"].sec17.paraA}</p>
                    <p className="text-[1rem] mb-2">{t.contract.sections["5"].sec17.paraB}</p>
                    <p className="text-[1rem] mb-2">{t.contract.sections["5"].sec17.paraC}</p>
                    <p className="text-[1rem] mb-3">{t.contract.sections["5"].sec17.para2}</p>
                    <p className="text-[1rem] mb-5">{t.contract.sections["5"].sec17.paraClose}</p>
                    <h3 className="text-[1.8rem] leading-9 mb-3">{t.contract.sections["5"].sec18.title}</h3>
                    <p className="text-[1rem] mb-2">{t.contract.sections["5"].sec18.para1}</p>
                    <p className="text-[1rem] mb-2">{t.contract.sections["5"].sec18.para2}</p>
                    <p className="text-[1rem] mb-2">3) <strong>{t.contract.sections["5"].sec18.para3}</strong></p>
                    <p className="text-[1rem] mb-5">{t.contract.sections["5"].sec18.paraClose}</p>
                    <h3 className="text-[1.8rem] leading-9 mb-3">{t.contract.sections["5"].sec19.title}</h3>
                    <p className="text-[1rem] mb-2">{t.contract.sections["5"].sec19.para1}</p>
                    <p className="text-[1rem] mb-2">{t.contract.sections["5"].sec19.para2}</p>
                    <p className="text-[1rem] mb-2">{t.contract.sections["5"].sec19.para3}</p>
                    <p className="text-[1rem] mb-5">{t.contract.sections["5"].sec19.para4}</p>
                    <h2 className="text-[2.1rem] leading-9 mb-5">{t.contract.sections["6"].title}</h2>
                    <p className="text-[1rem] mb-5">{t.contract.sections["6"].para}</p>
                    <h3 className="text-[1.8rem] leading-9 mb-3">{t.contract.sections["6"].sec1.title}</h3>
                    <p className="text-[1rem] mb-5">{t.contract.sections["6"].sec1.para}</p>
                    <h3 className="text-[1.8rem] leading-9 mb-3">{t.contract.sections["6"].sec2.title}</h3>
                    <p className="text-[1rem] mb-5">{t.contract.sections["6"].sec2.para11} <strong>{t.contract.sections["6"].sec2.para12}</strong> {t.contract.sections["6"].sec2.para13}</p>
                    <h3 className="text-[1.8rem] leading-9 mb-3">{t.contract.sections["6"].sec3.title}</h3>
                    <p className="text-[1rem] mb-5">{t.contract.sections["6"].sec3.para}</p>
                    <h3 className="text-[1.8rem] leading-9 mb-3">{t.contract.sections["6"].sec4.title}</h3>
                    <p className="text-[1rem] mb-5">{t.contract.sections["6"].sec4.para}</p>
                    <h3 className="text-[1.8rem] leading-9 mb-3">{t.contract.sections["6"].sec5.title}</h3>
                    <p className="text-[1rem] mb-5">{t.contract.sections["6"].sec5.para}</p>
                    <h3 className="text-[1.8rem] leading-9 mb-3">{t.contract.sections["6"].sec6.title}</h3>
                    <p className="text-[1rem] mb-5">{t.contract.sections["6"].sec6.para}</p>
                    <h3 className="text-[1.8rem] leading-9 mb-3">{t.contract.sections["6"].sec7.title}</h3>
                    <p className="text-[1rem] mb-5">{t.contract.sections["6"].sec7.para}</p>
                    <h3 className="text-[1.8rem] leading-9 mb-3">{t.contract.sections["6"].sec8.title}</h3>
                    <p className="text-[1rem] mb-5">{t.contract.sections["6"].sec8.para}</p>
                    <h3 className="text-[1.8rem] leading-9 mb-3">{t.contract.sections["6"].sec9.title}</h3>
                    <p className="text-[1rem] mb-5">{t.contract.sections["6"].sec9.para}</p>
                    <h3 className="text-[1.8rem] leading-9 mb-3">{t.contract.sections["6"].sec10.title}</h3>
                    <p className="text-[1rem] mb-5">{t.contract.sections["6"].sec10.para}</p>
                    <h3 className="text-[1.8rem] leading-9 mb-3">{t.contract.sections["6"].sec11.title}</h3>
                    <p className="text-[1rem] mb-5">{t.contract.sections["6"].sec11.para}</p>
                    <h3 className="text-[1.8rem] leading-9 mb-3">{t.contract.sections["6"].sec12.title}</h3>
                    <p className="text-[1rem] mb-5">{t.contract.sections["6"].sec12.para}</p>
                    <h3 className="text-[1.8rem] leading-9 mb-3">{t.contract.sections["6"].sec13.title}</h3>
                    <p className="text-[1rem] mb-5">{t.contract.sections["6"].sec13.para}</p>
                    <h3 className="text-[1.8rem] leading-9 mb-3">{t.contract.sections["6"].sec14.title}</h3>
                    <p className="text-[1rem] mb-5">{t.contract.sections["6"].sec14.para}</p>
                    <h3 className="text-[1.8rem] leading-9 mb-3">{t.contract.sections["6"].sec15.title}</h3>
                    <p className="text-[1rem] mb-5">{t.contract.sections["6"].sec15.para}</p>
                    <h2 className="text-[2.1rem] leading-9 mb-5">{t.contract.sections["7"].title}</h2>
                    <p className="text-[1rem] mb-5">{t.contract.sections["7"].para}</p>
                    <h2 className="text-[2.1rem] leading-9 mb-5">{t.contract.sections["8"].title}</h2>
                    <p className="text-[1rem] mb-3">{t.contract.sections["8"].para}</p>
                    <p className="text-[1rem] mb-2">{t.contract.sections["8"].paraA}</p>
                    <p className="text-[1rem] mb-2">{t.contract.sections["8"].paraB}</p>
                    <p className="text-[1rem] mb-2">{t.contract.sections["8"].paraC}</p>
                    <p className="text-[1rem] mb-2">{t.contract.sections["8"].paraD}</p>
                    <p className="text-[1rem] mb-2">{t.contract.sections["8"].paraE}</p>
                    <p className="text-[1rem] mb-2">{t.contract.sections["8"].paraF}</p>
                    <p className="text-[1rem] mb-5">{t.contract.sections["8"].paraClose}</p>
                    <h2 className="text-[2.1rem] leading-9 mb-5">{t.contract.sections["9"].title}</h2>
                    <p className="text-[1rem] mb-3">{t.contract.sections["9"].para}</p>
                    <p className="text-[1rem] mb-2">{t.contract.sections["8"].paraA}</p>
                    <p className="text-[1rem] mb-2">{t.contract.sections["9"].paraB}</p>
                    <p className="text-[1rem] mb-2">{t.contract.sections["9"].paraC}</p>
                </div>
                <GeneratePdfContract data={contractData} clientSignatureLink={clientSignatureLink} freelanceSignatureLink={freelanceSignatureLink} client={client} locale={locale}/>
            </section>
            <span className="block italic my-4">Si vous êtes d'accord avec ces termes, signé en dessous. Dans le cas contraire,indiquez nous les raisons de votre rétition.</span>
            <section className="signing">
                <InitCanvaSignature locale={locale} emit={handleSignatureChange}/>
            </section>
            <div className="flex justify-end items-center mt-5 gap-4">
                <a className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700" href={`/${locale}/create-contract/${clientId}/?edit=true`}>Modifier le contrat</a>
                <button type="button" className={`px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 ${checkContractValidation() ? 'opacity-1 cursor-pointer' : 'opacity-50 cursor-not-allowed'}`} disabled={!checkContractValidation()} onClick={uploadContract}>Télecharger le contrat</button>
            </div>
        </main>
    )
}

export default GeneredContract