"use client"
import { AppContext } from '@/app/context/app-context';
import { useTranslationContext } from '@/hooks/app-hook';
import { decodeResult, parseDate } from '@/utils/fonction';

import { useContext, useEffect, useState } from 'react';

interface PrivacyPoliciesProps {
  locale: string;
}


const PrivacyPolicies: React.FC<PrivacyPoliciesProps> = ({ locale }) => {
    const t:any = useTranslationContext();
    const [isPopUp,setIsPopUp] = useState<boolean>(false)
    const {contextData} = useContext(AppContext)
    const [configDate,setConfigDate] = useState<number>(0)
    const [loading, setLoading] = useState(true);
    const {setContextData} = useContext(AppContext)
    //console.log("main",contextData)
    useEffect(()=>{
        if (contextData && (contextData.state === "hide" || contextData.state === "show")) {
            //console.log("inside contextData",contextData)
            setIsPopUp(contextData.value)
        }
    },[contextData])

    useEffect(()=>{
        const handleWebConfig = async () => {
            const sessionWebConfig = sessionStorage.getItem("webConfig")
            if(sessionWebConfig){
                const webConfig = JSON.parse(sessionWebConfig)
                for (const data of webConfig) {
                    if (data.webpage === 'privacie-policies') {
                        setConfigDate(data.lastUpdate)
                    }
                }
                setLoading(false);
            }else{
                const result = await fetch(`/api/fetch-web-config/`,{
                    method: 'GET', // Garde votre méthode GET pour l'exemple
                    headers: {
                    'Content-Type': 'application/json',
                    }
                })
                if (!result.ok) {
                    setContextData({toast:{toastVariant:"error",toastMessage:locale ? "Une erreur est survenue lors de la requête." : "An Error occurred during the request",showToast:true,time:new Date().getTime()}})     
                }
                const response = await result.json();
                if (response.success && response.result) {
                    const resultDecoded = decodeResult(response.result)
                    for (const data of resultDecoded) {
                        if (data.webpage === 'privacie-policies') {
                            setConfigDate(data.lastUpdate)
                        }
                    }
                    setLoading(false);
                    sessionStorage.setItem("webConfig",JSON.stringify(resultDecoded))
                } else {
                    setLoading(false);
                    setContextData({toast:{toastVariant:"error",toastMessage:locale ? "Une erreur est survenue lors de la requête." : "An Error occurred during the request",showToast:true,time:new Date().getTime()}})
                }
            }
        };
        handleWebConfig();
    },[locale])

    const replaceContent = (key: string,replaceText: string,replaceValue: string): string => {
        return key.replace(replaceText, replaceValue);
    };
    if (loading) return <div className="text-center py-8 mt-[6.875rem] h-[12.5rem] flex justify-center items-center w-[85%] mx-auto">Chargement...</div>;
    return (
    <main className={`transition-transform duration-700 delay-300 ease-in-out ${isPopUp ? 'translate-x-[-25vw]' : 'translate-x-0'} w-[85%] mt-[8.125rem] mx-auto`}>
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-center text-thirty uppercase">{t["privacyPolicies"]}</h1>
            {locale !== 'fr' && (
                <div className="my-3">
                    <p className="my-3 p-2 px-4 bg-blue-500 text-white rounded-300" dangerouslySetInnerHTML={{ __html: replaceContent(t.privacyPoliciesContent.content_0, '', '') }} />
                </div>
            )}
            <p className="font-bold my-4" dangerouslySetInnerHTML={{ __html: replaceContent(t.privacyPoliciesContent.content_1, '{date}', parseDate(new Date(configDate),locale)) }} />
            <section className="mb-8">
                <h2 dangerouslySetInnerHTML={{ __html: replaceContent(t.privacyPoliciesContent.content_2,'','' )}} className="text-2xl font-semibold mb-4"></h2>
                <p dangerouslySetInnerHTML={{ __html: replaceContent(t.privacyPoliciesContent.content_3,'','' )}} className="">
                
                </p>
            </section>

            <section className="mb-8">
                <h2 dangerouslySetInnerHTML={{ __html: replaceContent(t.privacyPoliciesContent.content_4,'','' )}} className="text-2xl font-semibold mb-4"></h2>
                <p dangerouslySetInnerHTML={{ __html: replaceContent(t.privacyPoliciesContent.content_5,'','' )}} className="">
                
                </p>
                <ul className="list-disc list-inside  mt-2">
                    <li dangerouslySetInnerHTML={{ __html: replaceContent(t.privacyPoliciesContent.content_6 ,'','' )}}></li>
                    <li dangerouslySetInnerHTML={{ __html: replaceContent(t.privacyPoliciesContent.content_7 ,'','' )}}></li>
                    <li dangerouslySetInnerHTML={{ __html: replaceContent(t.privacyPoliciesContent.content_8 ,'','' )}}></li>
                </ul>
            </section>

            <section className="mb-8">
                <h2 dangerouslySetInnerHTML={{ __html: replaceContent(t.privacyPoliciesContent.content_9 ,'','' )}} className="text-2xl font-semibold mb-4"></h2>
                <p dangerouslySetInnerHTML={{ __html: replaceContent(t.privacyPoliciesContent.content_10 ,'','' )}} className=""></p>
                <ul className="list-disc list-inside  mt-2">
                    <li dangerouslySetInnerHTML={{ __html: replaceContent(t.privacyPoliciesContent.content_11 ,'','' )}}></li>
                    <li dangerouslySetInnerHTML={{ __html: replaceContent(t.privacyPoliciesContent.content_12 ,'','' )}}></li>
                    <li dangerouslySetInnerHTML={{ __html: replaceContent(t.privacyPoliciesContent.content_13 ,'','' )}}></li>
                    <li dangerouslySetInnerHTML={{ __html: replaceContent(t.privacyPoliciesContent.content_14 ,'','' )}}></li>
                </ul>
            </section>

            <section className="mb-8">
                <h2 dangerouslySetInnerHTML={{ __html: replaceContent(t.privacyPoliciesContent.content_15 ,'','' )}} className="text-2xl font-semibold mb-4"></h2>
                <p dangerouslySetInnerHTML={{ __html: replaceContent(t.privacyPoliciesContent.content_16 ,'','' )}} className=""></p>
            </section>

            <section className="mb-8">
                <h2 dangerouslySetInnerHTML={{ __html: replaceContent(t.privacyPoliciesContent.content_17 ,'','' )}} className="text-2xl font-semibold mb-4"></h2>
                <p dangerouslySetInnerHTML={{ __html: replaceContent(t.privacyPoliciesContent.content_18 ,'','' )}} className=""></p>
            </section>

            <section className="mb-8">
                <h2 dangerouslySetInnerHTML={{ __html: replaceContent(t.privacyPoliciesContent.content_19 ,'','' )}} className="text-2xl font-semibold mb-4"></h2>
                <p dangerouslySetInnerHTML={{ __html: replaceContent(t.privacyPoliciesContent.content_20 ,'{rodcodingSupport}','<a href="mailto:support@rodcoding.com" class="underline text-blue-500">support&#64;rodcoding.com</a>' )}} className=""></p>
            </section>

            <section className="mb-8">
                <h2 dangerouslySetInnerHTML={{ __html: replaceContent(t.privacyPoliciesContent.content_21 ,'','' )}} className="text-2xl font-semibold mb-4"></h2>
                <p dangerouslySetInnerHTML={{ __html: replaceContent(t.privacyPoliciesContent.content_22 ,'','' )}} className=""></p>
            </section>

            <section className="mb-8">
                <h2 dangerouslySetInnerHTML={{ __html: replaceContent(t.privacyPoliciesContent.content_23,'','' )}} className="text-2xl font-semibold mb-4"></h2>
                <p dangerouslySetInnerHTML={{ __html: replaceContent(t.privacyPoliciesContent.content_24,'{link}','<a href="mailto:support@rodcoding.com" class="underline text-blue-500">support&#64;rodcoding.com</a>')}} className="mt-2">
                </p>
            </section>
            </div>
    </main>
  );
};

export default PrivacyPolicies;