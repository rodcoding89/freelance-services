"use client"
import { useState, useContext, useEffect } from "react";
import  firebase  from "@/utils/firebase";
import { collection, addDoc, getDocs, doc, setDoc } from "firebase/firestore";
import { useTranslationContext } from "@/hooks/app-hook";
import { AppContext } from "@/app/context/app-context";

interface LegalNoticeProps{
    locale:string
}

const LegalNotice:React.FC<LegalNoticeProps> = ({locale})=>{
    const t:any = useTranslationContext();
    const [configDate,setConfigDate] = useState<string>('')
    const [loading, setLoading] = useState(true);
    const [isPopUp,setIsPopUp] = useState<boolean>(false)
    const {contextData} = useContext(AppContext)
    console.log("main",contextData)
    const companyName = process.env.NEXT_PUBLIC_COMPANY_NAME ?? '';
    const companyAdresse = `${process.env.NEXT_PUBLIC_COMPANY_STREET ?? ''}, ${process.env.NEXT_PUBLIC_COMPANY_POSTAL_CODE ?? ''} ${process.env.NEXT_PUBLIC_COMPANY_CITY ?? ''} ${process.env.NEXT_PUBLIC_COMPANY_COUNTRY ?? ''}`;
    const companyEinNumber = process.env.NEXT_PUBLIC_TAX_ID ?? '';
    const companyAuthor = process.env.NEXT_PUBLIC_COMPANY_AUTHOR ?? '';
    const hostingProviderName = process.env.NEXT_PUBLIC_HOSTING_PROVIDER ?? '';
    const hostingProviderAdresse = process.env.NEXT_PUBLIC_HOSTING_PROVIDER_ADRESSE ?? ''
    const hostingProviderTel = process.env.NEXT_PUBLIC_HOSTING_PROVIDER_TEL ?? '';
    const hostingProviderLink = process.env.NEXT_PUBLIC_HOSTING_PROVIDER_URL ?? '';

    useEffect(()=>{
        if (contextData && (contextData.state === "hide" || contextData.state === "show")) {
            console.log("inside contextData",contextData)
            setIsPopUp(contextData.value)
        }
    },[contextData])

    useEffect(()=>{
        const fetchWebConfig = async () => {
            try {
                const querySnapshot = await getDocs(collection(firebase.db, 'webconfig'));
                for (const doc of querySnapshot.docs) {
                    const data = doc.data();
                    if (data.type === 'legal-notices') {
                        setConfigDate(data.date)
                    }
                }
            } catch (error) {
                console.error("Erreur de chargement des clients:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchWebConfig();
    },[locale])

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
    if (loading) return <div className="text-center py-8 mt-[110px] h-[200px] flex justify-center items-center w-[85%] mx-auto">Chargement...</div>;
    return (
        <main className={`transition-transform duration-700 delay-300 ease-in-out ${isPopUp ? 'translate-x-[-25vw]' : 'translate-x-0'} w-[85%] mt-[130px] mx-auto`}>
            <h1 className="text-center text-thirty uppercase">{t["legalNotice"]}</h1>
            <div className="mt-8">
                {
                    locale !== 'fr' && <div className="my-3">
                    <p className="my-3 p-2 px-4 bg-blue-500 text-white rounded-300" dangerouslySetInnerHTML={{ __html: replaceContent(t.legalNotices.content_0, '', '') }}></p>
                </div>
                }
                <p className="font-bold" dangerouslySetInnerHTML={{ __html: replaceContent(t.legalNotices.content_1, '{date}', new Date(configDate).toLocaleDateString(`${locale === 'fr' ? 'fr-FR' : locale === 'de' ? 'de-DE' : 'en-US'}`)) }}></p>
                <h3 className="my-3 text-[1.5rem]"
                    dangerouslySetInnerHTML={{ __html: replaceContent(t.legalNotices.content_2, '', '') }}
                ></h3>

                <div className="flex justify-start items-start gap-2 flex-col">
                    <span dangerouslySetInnerHTML={{ __html: replaceContent(t.legalNotices.content_3, '{companyName}', companyName.replace('LLC', '')) }}></span>
                    <span
                    dangerouslySetInnerHTML={{
                        __html: replaceContent(t.legalNotices.content_4, '', ''),
                    }}
                    ></span>
                    <span
                    dangerouslySetInnerHTML={{
                        __html: replaceContent(t.legalNotices.content_5, '{companyAdresse}', companyAdresse),
                    }}
                    ></span>
                    <span
                    dangerouslySetInnerHTML={{
                        __html: replaceContent(t.legalNotices.content_6, '{tagSupport}', '<a class="text-blue-500 underline" href="mailto:support@rodcoding.com">support&#64;rodcoding.com</a>'),
                    }}
                    ></span>
                    <span
                    dangerouslySetInnerHTML={{
                        __html: replaceContent(t.legalNotices.content_8, '{einNumber}', companyEinNumber),
                    }}
                    ></span>
                    <span
                    dangerouslySetInnerHTML={{
                        __html: replaceContent(
                        t.legalNotices.content_9,
                        ['{authorName}', '{companyName}'],
                        [companyAuthor, companyName]
                        ),
                    }}
                    ></span>
                </div>

                <h3 className="my-3 text-[1.5rem]" dangerouslySetInnerHTML={{ __html: replaceContent(t.legalNotices.content_10, '', '') }}></h3>

                <div className="flex justify-start items-start gap-2 flex-col">
                    <span
                    dangerouslySetInnerHTML={{
                        __html: replaceContent(t.legalNotices.content_11, '{hostingProviderName}', hostingProviderName),
                    }}
                    ></span>
                    <span
                    dangerouslySetInnerHTML={{
                        __html: replaceContent(t.legalNotices.content_12, '{hostingProviderAdresse}', hostingProviderAdresse),
                    }}
                    ></span>
                    <span
                    dangerouslySetInnerHTML={{
                        __html: replaceContent(t.legalNotices.content_13, '{hostingProviderTel}', hostingProviderTel),
                    }}
                    ></span>
                    <span
                    dangerouslySetInnerHTML={{
                        __html: replaceContent(
                        t.legalNotices.content_14,
                        '{hostingProviderLinkTag}',
                        `<a class="text-blue-500 underline" href='${hostingProviderLink}' target='_blank'>${hostingProviderLink}</a>`
                        ),
                    }}
                    ></span>
                </div>

                <h3 className="my-3 text-[1.5rem]" dangerouslySetInnerHTML={{ __html: replaceContent(t.legalNotices.content_16, '', '') }}></h3>
                <p dangerouslySetInnerHTML={{ __html: replaceContent(t.legalNotices.content_17, '', '') }}></p>

                <h3 className="my-3 text-[1.5rem]" dangerouslySetInnerHTML={{ __html: replaceContent(t.legalNotices.content_18, '', '') }}></h3>
                <p
                    dangerouslySetInnerHTML={{
                    __html: replaceContent(t.legalNotices.content_19, '{companyName}', companyName),
                    }}
                ></p>

                <h3 className="my-3 text-[1.5rem]" dangerouslySetInnerHTML={{ __html: replaceContent(t.legalNotices.content_20, '', '') }}></h3>
                <p
                    dangerouslySetInnerHTML={{
                    __html: replaceContent(t.legalNotices.content_21, '{companyName}', companyName),
                    }}
                ></p>

                <h3 className="my-3 text-[1.5rem]" dangerouslySetInnerHTML={{ __html: replaceContent(t.legalNotices.content_22, '', '') }}></h3>
                <p dangerouslySetInnerHTML={{ __html: replaceContent(t.legalNotices.content_23, '', '') }}></p>

                <h3 className="my-3 text-[1.5rem]" dangerouslySetInnerHTML={{ __html: replaceContent(t.legalNotices.content_24, '', '') }}></h3>
                <p
                    dangerouslySetInnerHTML={{
                    __html: replaceContent(
                        t.legalNotices.content_25,
                        '{rodcodingMail}',
                        "<a class='underline text-blue-500' href='mailto:support@rodcoding.com'>support&#64;rodcoding.com</a>"
                    ),
                    }}
                ></p>
            </div>
        </main>
    )
}


export default LegalNotice
