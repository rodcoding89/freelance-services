"use client"
import { useContext, useEffect, useState } from "react";

import { useTranslationContext } from "@/hooks/app-hook";
import { AppContext } from "@/app/context/app-context";

interface TermsOfServicesProps{
    locale:string
}
const TermsOfSale:React.FC<TermsOfServicesProps> = ({locale})=>{
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
    const replaceContent = (key: string,replaceText: string | string[],replaceValue: string | string[]): string => {
    if (Array.isArray(replaceText) && Array.isArray(replaceValue)) {
        replaceText.forEach((text, index) => {
        key = key.replace(text, replaceValue[index]);
        });
        return key;
    } else if (typeof replaceText === 'string' && typeof replaceValue === 'string') {
        return key.replace(replaceText, replaceValue);
    }
        console.warn('replaceContent called with mismatched types');
        return key;
    };
    return (
        <main className={`transition-transform duration-700 delay-300 ease-in-out ${isPopUp ? 'translate-x-[-25vw]' : 'translate-x-0'} w-[85%] mt-[130px] mx-auto`}>
            <h1 className="text-center text-thirty uppercase">{t["termsOfSale"]}</h1>
            <div className="saleBloc">
                {locale !== 'fr' && (
                    <div className="my-3">
                        <p className="my-3 p-2 px-4 bg-blue-500 text-white rounded-300" dangerouslySetInnerHTML={{ __html: replaceContent(t.termSale.content_0, '', '') }} />
                    </div>
                )}
                <p className="my-5 font-bold text-[1.8rem]" dangerouslySetInnerHTML={{ __html: replaceContent(t.termSale.content_1, '{date}', '16 janvier 2025') }} />
                <h3 className="my-3 text-[1.5rem]" dangerouslySetInnerHTML={{ __html: replaceContent(t.termSale.content_2, '', '') }} />
                <p className="my-2" dangerouslySetInnerHTML={{ __html: replaceContent(t.termSale.content_3, '', '') }} />
                <p className="my-2" dangerouslySetInnerHTML={{ __html: replaceContent(t.termSale.content_4, '', '') }} />
                <ul className="ml-10 list-disc">
                    <li dangerouslySetInnerHTML={{ __html: replaceContent(t.termSale.content_5, '', '') }} />
                    <li dangerouslySetInnerHTML={{ __html: replaceContent(t.termSale.content_6, '', '') }} />
                </ul>
                <p className="my-2" dangerouslySetInnerHTML={{ __html: replaceContent(t.termSale.content_7, '', '') }} />
                <p className="my-2" dangerouslySetInnerHTML={{ __html: replaceContent(t.termSale.content_8, '', '') }} />
                <div className="content">
                    <nav className="flex justify-start items-start gap-2 flex-col mb-10">
                        <a className="text-blue-600 font-medium" href={`/${locale}/terms-of-sale#chapitre1`} dangerouslySetInnerHTML={{ __html: replaceContent(t.termSale.content_10, '', '') }} />
                        <a className="text-blue-600 font-medium"  href={`/${locale}/terms-of-sale#chapitre2`} dangerouslySetInnerHTML={{ __html: replaceContent(t.termSale.content_11, '', '') }} />
                        <nav className="flex justify-start items-start gap-2 flex-col ml-10">
                            <a className="text-blue-600 font-medium"  href={`/${locale}/terms-of-sale`} dangerouslySetInnerHTML={{ __html: replaceContent(t.termSale.content_12, '', '') }} />
                            <a className="text-blue-600 font-medium"  href={`/${locale}/terms-of-sale`} dangerouslySetInnerHTML={{ __html: replaceContent(t.termSale.content_13, '', '') }} />
                            <a className="text-blue-600 font-medium"  href={`/${locale}/terms-of-sale`} dangerouslySetInnerHTML={{ __html: replaceContent(t.termSale.content_14, '', '') }} />
                            <a className="text-blue-600 font-medium"  href={`/${locale}/terms-of-sale`} dangerouslySetInnerHTML={{ __html: replaceContent(t.termSale.content_15, '', '') }} />
                            <a className="text-blue-600 font-medium"  href={`/${locale}/terms-of-sale`} dangerouslySetInnerHTML={{ __html: replaceContent(t.termSale.content_16, '', '') }} />
                        </nav>
                        <a className="text-blue-600 font-medium"  href={`/${locale}/terms-of-sale#chapitre3`} dangerouslySetInnerHTML={{ __html: replaceContent(t.termSale.content_20, '', '') }} />
                        <nav className="flex justify-start items-start gap-2 flex-col ml-10">
                            <a className="text-blue-600 font-medium"  href={`/${locale}/terms-of-sale`} dangerouslySetInnerHTML={{ __html: replaceContent(t.termSale.content_21, '', '') }} />
                            <a className="text-blue-600 font-medium"  href={`/${locale}/terms-of-sale`} dangerouslySetInnerHTML={{ __html: replaceContent(t.termSale.content_22, '', '') }} />
                            <a className="text-blue-600 font-medium"  href={`/${locale}/terms-of-sale`} dangerouslySetInnerHTML={{ __html: replaceContent(t.termSale.content_23, '', '') }} />
                            <a className="text-blue-600 font-medium"  href={`/${locale}/terms-of-sale`} dangerouslySetInnerHTML={{ __html: replaceContent(t.termSale.content_24, '', '') }} />
                            <a className="text-blue-600 font-medium"  href={`/${locale}/terms-of-sale`} dangerouslySetInnerHTML={{ __html: replaceContent(t.termSale.content_25, '', '') }} />
                            <a className="text-blue-600 font-medium"  href={`/${locale}/terms-of-sale`} dangerouslySetInnerHTML={{ __html: replaceContent(t.termSale.content_26, '', '') }} />
                        </nav>
                        <a className="text-blue-600 font-medium"  href={`/${locale}/terms-of-sale#chapitre4`} dangerouslySetInnerHTML={{ __html: replaceContent(t.termSale.content_27, '', '') }} />
                        <nav className="flex justify-start items-start gap-2 flex-col ml-10">
                            <a className="text-blue-600 font-medium"  href={`/${locale}/terms-of-sale`} dangerouslySetInnerHTML={{ __html: replaceContent(t.termSale.content_28, '', '') }} />
                            <a className="text-blue-600 font-medium"  href={`/${locale}/terms-of-sale`} dangerouslySetInnerHTML={{ __html: replaceContent(t.termSale.content_29, '', '') }} />
                            <a className="text-blue-600 font-medium"  href={`/${locale}/terms-of-sale`} dangerouslySetInnerHTML={{ __html: replaceContent(t.termSale.content_30, '', '') }} />
                        </nav>
                        <a className="text-blue-600 font-medium"  href={`/${locale}/terms-of-sale#chapitre5`} dangerouslySetInnerHTML={{ __html: replaceContent(t.termSale.content_31, '', '') }} />
                        <a className="text-blue-600 font-medium"  href={`/${locale}/terms-of-sale#chapitre6`} dangerouslySetInnerHTML={{ __html: replaceContent(t.termSale.content_32, '', '') }} />
                        <a className="text-blue-600 font-medium"  href={`/${locale}/terms-of-sale#chapitre7`} dangerouslySetInnerHTML={{ __html: replaceContent(t.termSale.content_33, '', '') }} />
                    </nav>
                    <div id="chapitre1">
                        <h3 className="my-3 text-[1.5rem]" dangerouslySetInnerHTML={{ __html: replaceContent(t.termSale.content_34, '', '') }} />
                        <p className="my-2" dangerouslySetInnerHTML={{ __html: replaceContent(t.termSale.content_35, '', '') }} />
                        <p className="my-2" dangerouslySetInnerHTML={{ __html: replaceContent(t.termSale.content_36, '', '') }} />
                    </div>
                    <div id="chapitre2">
                        <h3 className="my-3 text-[1.5rem]" dangerouslySetInnerHTML={{ __html: replaceContent(t.termSale.content_37, '', '') }} />
                        <div id="article1">
                            <h4 className="my-3 text-[1.2rem]" dangerouslySetInnerHTML={{ __html: replaceContent(t.termSale.content_38, '', '') }} />
                            <p className="my-2" dangerouslySetInnerHTML={{ __html: replaceContent(t.termSale.content_39, '', '') }} />
                        </div>
                        <div id="article2">
                            <h4 className="my-3 text-[1.2rem]" dangerouslySetInnerHTML={{ __html: replaceContent(t.termSale.content_40, '', '') }} />
                            <p className="my-2" dangerouslySetInnerHTML={{ __html: replaceContent(t.termSale.content_41, '', '') }} />
                        </div>
                        <div id="article3">
                            <h4 className="my-3 text-[1.2rem]" dangerouslySetInnerHTML={{ __html: replaceContent(t.termSale.content_42, '', '') }} />
                            <p className="my-2" dangerouslySetInnerHTML={{ __html: replaceContent(t.termSale.content_43, '', '') }} />
                        </div>
                        <div id="article4">
                            <h4 className="my-3 text-[1.2rem]" dangerouslySetInnerHTML={{ __html: replaceContent(t.termSale.content_44, '', '') }} />
                            <p className="my-2" dangerouslySetInnerHTML={{ __html: replaceContent(t.termSale.content_45, '', '') }} />
                        </div>
                        <div id="article5">
                            <h4 className="my-3 text-[1.2rem]" dangerouslySetInnerHTML={{ __html: replaceContent(t.termSale.content_46, '', '') }} />
                            <p className="my-2" dangerouslySetInnerHTML={{ __html: replaceContent(t.termSale.content_47, '', '') }} />
                        </div>
                    </div>
                    <div id="chapitre3">
                        <h3 className="my-3 text-[1.5rem]" dangerouslySetInnerHTML={{ __html: replaceContent(t.termSale.content_55, '', '') }} />
                        <div id="article9">
                            <h4 className="my-3 text-[1.2rem]" dangerouslySetInnerHTML={{ __html: replaceContent(t.termSale.content_56, '', '') }} />
                            <p className="my-2" dangerouslySetInnerHTML={{ __html: replaceContent(t.termSale.content_57, '', '') }} />
                        </div>
                        <div id="article10">
                            <h4 className="my-3 text-[1.2rem]" dangerouslySetInnerHTML={{ __html: replaceContent(t.termSale.content_60, '', '') }} />
                            <p className="my-2" dangerouslySetInnerHTML={{ __html: replaceContent(t.termSale.content_61, '', '') }} />
                            <h5 className="my-3 text-[1.2rem]" dangerouslySetInnerHTML={{ __html: replaceContent(t.termSale.content_63, '', '') }}/>
                            <p className="my-2" dangerouslySetInnerHTML={{ __html: replaceContent(t.termSale.content_64, '', '') }} />
                            <h5 className="my-3 text-[1.2rem]" dangerouslySetInnerHTML={{ __html: replaceContent(t.termSale.content_65, '', '') }}/>
                            <p className="my-2" dangerouslySetInnerHTML={{ __html: replaceContent(t.termSale.content_66, '', '') }} />
                        </div>
                        <div id="article12">
                            <h4 className="my-3 text-[1.2rem]" dangerouslySetInnerHTML={{ __html: replaceContent(t.termSale.content_84, '', '') }} />
                            <p className="my-2" dangerouslySetInnerHTML={{ __html: replaceContent(t.termSale.content_85, '', '') }} />
                            <p className="my-2" dangerouslySetInnerHTML={{ __html: replaceContent(t.termSale.content_86, '', '') }} />
                            <ul className="ml-10 list-disc">
                                <li dangerouslySetInnerHTML={{ __html: replaceContent(t.termSale.content_87, '', '') }} />
                                <li dangerouslySetInnerHTML={{ __html: replaceContent(t.termSale.content_88, '', '') }} />
                                <li dangerouslySetInnerHTML={{ __html: replaceContent(t.termSale.content_89, '', '') }} />
                            </ul>
                            <p className="my-2" dangerouslySetInnerHTML={{ __html: replaceContent(t.termSale.content_90, '', '') }} />
                        </div>
                        <div id="article14">
                            <h4 className="my-3 text-[1.2rem]" dangerouslySetInnerHTML={{ __html: replaceContent(t.termSale.content_94, '', '') }} />
                            <p className="my-2" dangerouslySetInnerHTML={{ __html: replaceContent(t.termSale.content_95, '', '') }} />
                        </div>
                    </div>
                    <div id="chapitre4">
                        <h3 className="my-3 text-[1.5rem]" dangerouslySetInnerHTML={{ __html: replaceContent(t.termSale.content_96, '', '') }} />
                        <div id="article15">
                            <h4 className="my-3 text-[1.2rem]" dangerouslySetInnerHTML={{ __html: replaceContent(t.termSale.content_97, '', '') }} />
                            <p className="my-2" dangerouslySetInnerHTML={{ __html: replaceContent(t.termSale.content_98, '', '') }} />
                            <p className="my-2" dangerouslySetInnerHTML={{ __html: replaceContent(t.termSale.content_99, '', '') }} />
                        </div>
                        <div id="article16">
                            <h4 className="my-3 text-[1.2rem]" dangerouslySetInnerHTML={{ __html: replaceContent(t.termSale.content_100, '', '') }} />
                            <p className="my-2" dangerouslySetInnerHTML={{ __html: replaceContent(t.termSale.content_101, '{termServiceTag}', '<a className="text-blue-600 font-medium" target="_blank" href={`/${locale}/terms-of-services`} style="color:#39699d;font-size:1rem;">CGU</a>') }} />
                        </div>
                        <div id="article17">
                            <h4 className="my-3 text-[1.2rem]" dangerouslySetInnerHTML={{ __html: replaceContent(t.termSale.content_103, '', '') }} />
                            <p className="my-2" dangerouslySetInnerHTML={{ __html: replaceContent(t.termSale.content_104, '', '') }} />
                        </div>
                    </div>
                    <div id="chapitre5">
                        <h3 className="my-3 text-[1.5rem]" dangerouslySetInnerHTML={{ __html: replaceContent(t.termSale.content_105, '', '') }} />
                        <p className="my-2" dangerouslySetInnerHTML={{ __html: replaceContent(t.termSale.content_106, '', '') }} />
                        <p className="my-2" dangerouslySetInnerHTML={{ __html: replaceContent(t.termSale.content_107, '', '') }} />
                    </div>
                    <div id="chapitre6">
                        <h3 className="my-3 text-[1.5rem]" dangerouslySetInnerHTML={{ __html: replaceContent(t.termSale.content_109, '', '') }} />
                        <p className="my-2" dangerouslySetInnerHTML={{ __html: replaceContent(t.termSale.content_110, '', '') }} />
                        <p className="my-2" dangerouslySetInnerHTML={{ __html: replaceContent(t.termSale.content_111, '', '') }} />
                        <p className="my-2" dangerouslySetInnerHTML={{ __html: replaceContent(t.termSale.content_112, '', '') }} />
                        <p className="my-2" dangerouslySetInnerHTML={{ __html: replaceContent(t.termSale.content_113, '', '') }} />
                        <p className="my-2" dangerouslySetInnerHTML={{ __html: replaceContent(t.termSale.content_114, '', '') }} />
                        <p className="my-2" dangerouslySetInnerHTML={{ __html: replaceContent(t.termSale.content_115, '', '') }} />
                    </div>
                    <div id="chapitre7">
                        <h3 className="my-3 text-[1.5rem]" dangerouslySetInnerHTML={{ __html: replaceContent(t.termSale.content_116, '', '') }} />
                        <p className="my-2" dangerouslySetInnerHTML={{ __html: replaceContent(t.termSale.content_117, '{rodcodingSupportTag}', '<a className="text-blue-600 font-medium" href="mailto:support@rodcoding.com" style="color:#39699d;font-size:1rem;">support@rodcoding.com</a>') }} />
                    </div>
                </div>
            </div>
        </main>
    )
}

export default TermsOfSale
