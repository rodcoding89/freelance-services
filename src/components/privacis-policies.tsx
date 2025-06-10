"use client"
import { AppContext } from '@/app/context/app-context';
import { useTranslationContext } from '@/hooks/app-hook';
import { useContext, useEffect, useState } from 'react';

interface PrivacyPoliciesProps {
  locale: string;
}


const PrivacyPolicies: React.FC<PrivacyPoliciesProps> = ({ locale }) => {
    const t:any = useTranslationContext();
    const [isPopUp,setIsPopUp] = useState<boolean>(false)
    const {contextData} = useContext(AppContext)
    console.log("main",contextData)
    useEffect(()=>{
        if (contextData && (contextData.state === "hide" || contextData.state === "show")) {
            console.log("inside contextData",contextData)
            setIsPopUp(contextData.value)
        }
    },[contextData])

    const replaceContent = (key: string,replaceText: string,replaceValue: string): string => {
        return key.replace(replaceText, replaceValue);
    };
    return (
    <main className={`transition-transform duration-700 delay-300 ease-in-out ${isPopUp ? 'translate-x-[-25vw]' : 'translate-x-0'} w-[85%] mt-[130px] mx-auto`}>
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-center text-thirty uppercase">{t["privacyPolicies"]}</h1>
            {locale !== 'fr' && (
                <div className="my-3">
                    <p className="my-3 p-2 px-4 bg-blue-500 text-white rounded-300" dangerouslySetInnerHTML={{ __html: replaceContent(t.privacyPoliciesContent.content_0, '', '') }} />
                </div>
            )}
            <p className="my-5 font-bold text-[1.8rem]" dangerouslySetInnerHTML={{ __html: replaceContent(t.privacyPoliciesContent.content_1, '{date}', '16 janvier 2025') }} />
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