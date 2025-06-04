"use client"
import { useContext, useEffect, useState } from "react"

import { Link } from 'react-scroll';

import CloseButton from "./close-btn";

import Icon from "./Icon";
import { useRouter } from "next/navigation";
import { useTranslationContext } from "@/hooks/app-hook";
import { AppContext } from "@/app/context/app-context";
import { refDetailContent, reference, serviceDetail } from "@/constants";

interface PopupProps{
    locale:string,
    id:number|null
}

const PopUp:React.FC<PopupProps> = ({id,locale})=>{
    const t:any = useTranslationContext();
    const navigate = useRouter();
    const [hidePopUp,setHidePopUp] = useState<boolean>(false);
    const [refDetail,setRefDetail] = useState<any>()
    const [serviceSiteReference,setServiceSiteReference] = useState<any>()
    const [windowSize,setWindowSize] = useState<string>('w-0')
    const {contextData,setContextData} = useContext(AppContext)
    const data:any = id !== null ? serviceDetail[id as keyof typeof serviceDetail] : null;
    const [switchIndex,setSwitchIndex] = useState<number>(0)
    const serviceAvDistage = id && id < 4 ? serviceDetail.avdistage : id === 5 ? serviceDetail.avdistageApp : serviceDetail.avdistageSaas;
    //const refenrence = id !== null && mode === 'service' ? reference[id] : null
    //= id !== null ? refDetailContent[id] : null
    const [popupMode,setMode] = useState<string>('')
    const [currentIndex,setCurrentIndex] = useState<number>(0)
    const handlePopUp = ()=>{
        setContextData({state:"hide",value:false,size:windowSize})
        setHidePopUp(false)
    }
    const openRefDetail = (refId:number,cat:string)=>{ 
        console.log("refDetail",refId,cat)
        setRefDetail(refDetailContent[cat][refId])
        setMode('reference')
    }
    const slide = (param:string)=>{
        console.log('is called',param)
        if (param === 'prev') {
            setCurrentIndex((prev)=>prev > 0 ? prev - 1 : 0)
        }else{
            setCurrentIndex((prev)=> prev === serviceSiteReference?.referenceContent.length! - 1 ? prev : prev + 1)
        }
    }
    const switchDevMode = (devModeContent:any)=>{
        console.log("devModeContent",devModeContent,"avdistage",serviceAvDistage)
        if(!devModeContent || !serviceAvDistage) return
        return (
            <div>
                <p className="text-[14px] my-3" dangerouslySetInnerHTML={{ __html: t[devModeContent[switchIndex + 1].def] }}/>
                <span className="text-[11px] text-primary font-regular mb-5 italic block" dangerouslySetInnerHTML={{ __html: t[devModeContent[switchIndex + 1].notion] }}/>
                <div className="flex justify-start items-start gap-3 max-792:flex-col">
                    <div className="w-1/2 max-792:w-full">
                        <h4 className="mb-5 text-[1.15em] font-semibold uppercase text-secondary">{t["advantage"]}</h4>
                        <div className="flex flex-col justify-start items-start gap-3">
                            {
                                serviceAvDistage[switchIndex + 1 as keyof typeof serviceAvDistage].advantage.map((item:any,index:number)=>{
                                    return <div key={index} className="">
                                        <h6 className="text-[14px] font-semibold ">{t[item.title]} : </h6>
                                        <p className="text-[13px]" dangerouslySetInnerHTML={{ __html: t[item.text] }}/>
                                    </div>
                                })
                            }
                        </div>
                    </div>
                    <div className="w-1/2 max-792:w-full">
                        <h4 className="mb-5 text-[1.15em] font-semibold uppercase text-secondary">{t["disadvantage"]}</h4>
                        <div className="flex flex-col justify-start items-start gap-3">
                            {
                                serviceAvDistage[switchIndex + 1 as keyof typeof serviceAvDistage].disadvantage.map((item:any,index:number)=>{
                                    return <div key={index} className="">
                                        <h6 className="text-[14px] font-semibold ">{t[item.title]} : </h6>
                                        <p className="text-[13px]" dangerouslySetInnerHTML={{ __html: t[item.text] }}/>
                                    </div>
                                })
                            }
                        </div>
                    </div>
                </div>
            </div>
        )
    }
    const switchToStart = ()=>{
        const location = new URL(window.location.href);
        if (location.pathname.split("/").length > 2) {
            navigate.push("/"+locale)
        }
    }
    useEffect(()=>{
        if (contextData && contextData.state === "show") {
            console.log("contextData.value",contextData.value)
            if (contextData.mode === "service" && id) {
                setServiceSiteReference(reference[id])
            }else if(contextData.mode === "reference" && id){
                //console.log("cat",cat,id)
                setRefDetail(refDetailContent[contextData.cat][contextData.id])
            }
            setHidePopUp(contextData.value)
            setWindowSize(contextData.size)
            setMode(contextData.mode)
        }else{
            setHidePopUp(false)
            setWindowSize('w-0')
        }
    },[contextData])
    console.log("mode",hidePopUp,contextData)
    return (
        <div className={`fixed flex justify-end w-[100vw] h-[100vh] top-0 right-0 bottom-0 transition-all duration-500 ease-in-out ${hidePopUp ? 'z-[100] bg-[rgba(0,0,0,0.3)]':'z-[-1] bg-transparent'}`}>
            <div className={`relative ${windowSize} bg-fifty overflow-y-auto transition-transform duration-700 ease-in-out ${hidePopUp ? 'translate-x-0' : 'translate-x-[100vw]'}`}>
                {
                    popupMode === 'mobile' ? (
                        <div className="flex flex-col justify-between items-start h-[100vh] gap-3 py-3 px-5">
                            <div className="flex justify-between items-center gap-3 w-full">
                                <Link
                                className='cursor-pointer'
                                activeClass="active" 
                                spy={true} 
                                smooth={true} 
                                offset={-65} 
                                duration={500}
                                to={`home`}
                                ><img src="/assets/images/logo.webp" alt="logo" className='w-auto h-[45px] rounded-full' onClick={switchToStart}/></Link>
                                <span className=" cursor-pointer"><CloseButton size="large" onClose={handlePopUp}/></span>
                            </div>
                            <div className="w-full">
                                <h4 className="uppercase text-[1.15em] mb-2 font-semibold">{t["about"]}<span className='w-1/6 block h-[2px] bg-thirty mb-2'></span></h4>
                                <p>{t["devTitle"]}</p>
                            </div>
                            <div className="w-full">
                                <h4 className="uppercase text-[1.15em] mb-3 font-semibold">{t["navigation"]}<span className='w-1/6 block h-[2px] bg-thirty mb-2'></span></h4>
                                <nav className='navi flex justify-start items-start gap-2 flex-col'>
                                    <Link
                                    className='cursor-pointer text-primary'
                                    activeClass="active" 
                                    spy={true} 
                                    smooth={true} 
                                    offset={-65} 
                                    duration={500}
                                    to={`home`} onClick={switchToStart}>{t["home"]}</Link>
                                    <Link 
                                    className='cursor-pointer text-primary'
                                    activeClass="active"
                                    spy={true} 
                                    smooth={true} 
                                    offset={-65} 
                                    duration={500} 
                                    to={`about`} onClick={switchToStart}>{t["about"]}</Link>
                                    <Link
                                    className='cursor-pointer text-primary'
                                    activeClass="active"
                                    spy={true} 
                                    smooth={true} 
                                    offset={-65} 
                                    duration={500} 
                                    to={`services`} onClick={switchToStart}>{t["services"]}</Link>
                                    <Link
                                    className='cursor-pointer text-primary'
                                    activeClass="active"
                                    spy={true} 
                                    smooth={true} 
                                    offset={-65} 
                                    duration={500} 
                                    to={`reference`} onClick={switchToStart}>{t["references"]}</Link>
                                    <Link
                                    className='cursor-pointer text-primary'
                                    activeClass="active"
                                    spy={true} 
                                    smooth={true} 
                                    offset={-65} 
                                    duration={500} 
                                    to={`price`} onClick={switchToStart}>{t["price"]}</Link>
                                    <Link
                                    className='cursor-pointer text-primary'
                                    activeClass="active"
                                    spy={true} 
                                    smooth={true} 
                                    offset={-65} 
                                    duration={500} 
                                    to={`contact`} onClick={switchToStart}>{t["contact"]}</Link>
                                    <a href="https://portfolio.rodcoding.tech" className='cursor-pointer text-primary' target="_blank">{t["protfolio"]}</a>
                                </nav>
                            </div>
                            <div className="w-full">
                                <h4 className="uppercase text-[1.15em] mb-2 font-semibold">{t["contact"]}<span className='w-1/6 block h-[2px] bg-thirty mb-2'></span></h4>
                                <p className="mb-2">{t["devTitle"]}</p>
                                <div className='flex justify-start items-center gap-2'>
                                    <a className='flex justify-center items-center gap-1 w-[40px] h-[40px] rounded-[.2em] bg-white'  href='tel:+33751025598'><Icon name='bx-phone' size='1.4em' color='var(--color-secondary)'/></a>
                                    <a className='flex justify-center items-center gap-1 w-[40px] h-[40px] rounded-[.2em] bg-white'  href='mailto:rodriguekwayep.freelance@hotmail.com'><Icon name='bx-envelope' size='1.4em' color='var(--color-secondary)'/></a>
                                    <span className='flex justify-center items-center gap-1 w-[40px] h-[40px] rounded-[.2em] bg-white cursor-pointer' title={t["shareOn"]}><Icon name="bx-share-alt" size="1.4em" color="var(--color-secondary)"/></span>
                                </div>
                            </div>
                        </div>
                    ): popupMode === 'service' ? (
                        <div className="flex flex-col justify-between items-start h-[100vh] gap-3 py-3 px-8 overflow-y-auto ">
                            <div className="flex justify-between items-center gap-3 w-full">
                                <h3 className="text-[1.8em] font-bold uppercase text-thirty line-break max-420:text-[20px]">{t["services"]}</h3>
                                <span className=" cursor-pointer"><CloseButton size="large" onClose={handlePopUp}/></span>
                            </div>
                            <div className="mt-3 w-full">
                                <h2 className="text-[1.5em] text-thirty font-semibold mb-3 max-420:text-[17px]">{t[data?.title]}</h2>
                                <div className="flex flex-col justify-start items-center gap-5">
                                    <div className="mt-3 mb-5 w-full block">
                                        <h4 className="font-semibold mb-1">{t[data?.content.title]}</h4>
                                        <p className="whitespace-pre-wrap mb-2">{t[data?.content.para]}</p>
                                        <p className="whitespace-pre-wrap font-bold text-blue-950">{t[data?.content.souspara]}</p>
                                        <span className="text-[11px] text-primary font-regular mb-5 italic block mt-4" dangerouslySetInnerHTML={{ __html: t[data?.content.notion] }}/>
                                    </div>
                                    <div className={`w-full flex items-center gap-5 max-810:flex-col flex-row-reverse`}>
                                        <img className="w-1/2 max-810:w-full aspect-[4/3]" src={data?.img} alt={t[data?.content.title]} />
                                        <div className="flex-1">
                                        {data?.content.contentPara.map((para:any, j:number) => (
                                            <div className="" key={j}>
                                                <h5 className=" text-secondary mb-2 font-semibold text-[1.15em]">{t[para.title]}</h5>
                                                <p className="whitespace-pre-wrap mb-3">{t[para.text]}</p>
                                            </div>
                                        ))}
                                        </div>
                                    </div> 
                                </div>
                                <h2 className="text-[1.5em] text-thirty font-semibold mb-3 mt-10 max-420:text-[17px]">{t[data?.subtitle]}</h2>
                                <p className="mb-3">{t[data?.info]}</p>
                                <div className="my-5">
                                    <div className='flex justify-around items-center gap-3 py-2 px-3 bg-white flex-wrap'>
                                    {
                                        data?.category?.map((m:any,i:number)=>{
                                            return(
                                                <p onClick={()=>setSwitchIndex(i)} className={`relative cursor-pointer uppercase text-[.67em] text-ellipsis whitespace-nowrap overflow-hidden before:w-0 
                                                before:transition-all before:duration-700 before:ease-in-out z-0 ${switchIndex === i ? ' py-1 px-2 before:absolute before:left-0 before:top-0 before:bg-thirty before:!w-full before:h-full before:rounded-xl before:z-[-1] font-semibold text-fifty':''}`} key={i}>{t[m]}</p>
                                            )
                                        })
                                    }
                                    </div>
                                    {
                                        switchDevMode(data?.devMode)
                                    }
                                </div>
                                <h2 className="text-[1.5em] text-thirty font-semibold mb-3 mt-10">{t[data?.cost.title]}</h2>
                                <div className="flex max-810:flex-col justify-start items-center gap-5">
                                    <img className="w-1/2 max-810:w-full aspect-[4/2]" src={data?.img} alt={t[data?.cost.title]} />
                                    <div className="mt-3 mb-5 w-full block">
                                        <p className="whitespace-pre-wrap mb-2">{t[data?.cost.para]}</p>
                                        <p className="whitespace-pre-wrap font-bold text-blue-950">{t[data?.cost.souspara]}</p>
                                    </div> 
                                </div>
                                <div className="mt-10 mb-3">
                                    <h2 className="mb-3 text-[1.5em] text-thirty font-semibold">{t["realisation"]}</h2>
                                    <h4 className="mb-3 text-[1.2em] text-primary font-semibold">{t[serviceSiteReference?.title]}</h4>
                                    <div className="flex justify-between items-start gap-3 max-810:flex-col-reverse">
                                        <div className="overflow-hidden w-4/5 max-810:w-full">
                                            <div className={`flex justify-start transition-transform duration-700 ease-in-out items-center`} style={{width:`${serviceSiteReference?.referenceContent.length!*100}%`,transform: `translateX(-${currentIndex*100/serviceSiteReference?.referenceContent.length!}%)`}}>
                                                {
                                                    serviceSiteReference?.referenceContent.map((item:any,index:number)=>{
                                                    return (
                                                        <div key={index} className={` relative w-full group`} style={{width:`${100 / serviceSiteReference?.referenceContent.length!}%`}} onClick={()=>openRefDetail(item.refId,item.cat)}>
                                                            <div className='relative h-[350px] w-full overflow-hidden group'>
                                                                <img className='h-full object-cover cursor-pointer w-full' src={item.img} alt={item.projet} />
                                                                <div className='h-full cursor-pointer w-full bg-[rgba(142,22,22,.5)] absolute top-0 left-0 flex justify-center items-center transition-transform duration-500 ease-in-out translate-y-[350px] group-hover:translate-y-0'><Icon name='bx-show' size='4em' color='#fff'/></div>
                                                            </div>
                                                            <div className={`bg-fifty group-hover:bg-secondary py-2`}>
                                                                <div className='flex justify-between items-start gap-2 mx-4'>
                                                                    <h4 className='text-secondary font-semibold text-[18px] mb-2 w-fit uppercase group-hover:text-fifty relative before:w-2/5 before:h-1 before:bg-secondary before:bottom-[-4px] before:left-[1px] before:block before:group-hover:bg-fifty before:absolute'>{item.projet}</h4>
                                                                    <span className='text-[11px] text-[#aaa]'>{t[item.mode]}</span>
                                                                </div>
                                                                <p className='uppercase text-[14px] font-medium mx-4 mt-1 text-primary group-hover:text-fifty'>{t[item.name]}</p>
                                                                <p className='mx-4 mt-1 text-[13px] text-primary uppercase group-hover:text-fifty'>{t[item.shortText]}</p>
                                                            </div>
                                                        </div>
                                                    )
                                                })
                                            }
                                            </div>
                                        </div>
                                        <div className="flex justify-start items-center gap-5 w-1/5">
                                            <span onClick={()=>slide('prev')} className={`cursor-pointer w-10 h-10 rounded-[.2em] flex justify-center items-center bg-white ${currentIndex === 0 ? 'opacity-40 cursor-not-allowed':''}`}><Icon name="bx-chevron-left" size="2em" color="var(--color-thirty)"/></span>
                                            <span onClick={()=>slide('naxt')} className={`cursor-pointer w-10 h-10 rounded-[.2em] flex justify-center items-center bg-white ${currentIndex === serviceSiteReference?.referenceContent.length! - 1 ? 'opacity-40 cursor-not-allowed':''}`}><Icon name="bx-chevron-right" size="2em" color="var(--color-thirty)"/></span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col justify-start items-start h-[100vh] gap-3 py-3 px-8 overflow-y-auto">
                            <div className="flex justify-between items-center gap-3 w-full">
                                <h3 className="text-[1.5em] font-bold uppercase text-thirty">{t["references"]}</h3>
                                <span className=" cursor-pointer"><CloseButton size="large" onClose={handlePopUp}/></span>
                            </div>
                            <div className="mt-4">
                                <h3 className="text-[1.7em] font-semibold text-right uppercase mb-3 ml-[50%] max-810:ml-[35%] max-420:ml-0 max-792:ml-[10%]">{t[refDetail?.title]+' '+t[refDetail?.proprio]}</h3>
                                <hr  className="border-thirty mb-10 ml-[50%]"/>
                                <div className="flex justify-center items-center gap-4 max-810:flex-col max-810:gap-y-5">
                                    <img className="w-1/2 aspect-[4/3] max-810:w-full" src={refDetail?.img} alt={t[refDetail?.proprio]} />
                                    <div className="w-1/2 max-810:w-full">
                                        <h4 className="text-[1.4em] font-semibold text-thirty uppercase">{t[refDetail?.infoSite.title]}</h4>
                                        <div className="flex flex-col justify-start items-start gap-2 mt-4">
                                            <div className="flex justify-between items-center gap-1 w-full flex-wrap">
                                                <span className="flex justify-start items-center gap-1">
                                                    <Icon name="bx-calendar" size="1em" color="var(--color-thirty)"/>
                                                    {t["yeare"]}
                                                </span> 
                                                <span className="font-medium flex-1 text-right">{refDetail?.infoSite.year}</span>
                                            </div>
                                            <div className="flex justify-between items-center gap-1 w-full flex-wrap">
                                                <span className="flex justify-start items-center gap-1">
                                                    <Icon name="bx-category" size="1em" color="var(--color-thirty)"/>
                                                    {t["categorie"]}</span>
                                                <span className="font-medium flex-1 text-right">{t[refDetail?.infoSite.cat]}</span>
                                            </div>
                                            <div className="flex justify-between items-center gap-2 w-full flex-wrap">
                                                <span className="flex justify-start items-center gap-1">
                                                    <Icon name="bx-code-alt" size="1.1em" color="var(--color-thirty)"/>{t["techno"]}
                                                </span>
                                                <div className="mt-4 flex justify-end items-center flex-wrap gap-2">
                                                {
                                                    refDetail?.infoSite.techno.map((item:string,index:number)=>{
                                                        return <p className="py-1 px-2 rounded-[.2em] text-fifty bg-thirty" key={index}>{item}</p>
                                                    })
                                                }
                                            </div>
                                            </div>
                                            {
                                                refDetail?.infoSite.link !== '' ? <div className="mt-4 flex justify-end items-end w-full"><a href={refDetail?.infoSite.link} className="py-1 px-4 outline outline-1 outline-thirty rounded-lg" target="__blanc">{t["websiteLink"]} </a></div> : <div className="mt-4 w-full flex justify-end items-end"><span className="py-1 px-4 outline outline-1 outline-thirty rounded-lg">{t["websiteOnMaintenance"]}</span></div>
                                            }
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-10">
                                    <h4 className="text-[1.4em] font-semibold text-thirty uppercase mb-3">{t[refDetail?.description.title] + ' '+t[refDetail?.proprio]}</h4>
                                    <hr  className="border-thirty mb-5"/>
                                    <div className="mt-4">
                                        {
                                            refDetail?.description.para.map((item:any, index:number) => {
                                                const modifiedItem = item
                                                  .replace(/{name}/g, t[refDetail?.proprio])
                                                  .replace(/{open}/g, '<strong>')
                                                  .replace(/{close}/g, '</strong>');
                                        
                                                return (
                                                  <p className="whitespace-pre-wrap mb-3" key={index} dangerouslySetInnerHTML={{ __html: modifiedItem }}></p>
                                                );
                                            })
                                        }
                                    </div>
                                </div>
                                <div className="mt-10">
                                    <h4 className="text-[1.4em] font-semibold text-thirty mb-3 uppercase">{t["tasksOnWebsite"]}</h4>
                                    <hr  className="border-thirty mb-5"/>
                                    <ul className="flex justify-start items-center !list-decimal gap-2 flex-wrap w-full pl-5 max-792:flex-col">
                                        {
                                            refDetail?.task.map((item:string,index:number)=>{
                                                return <li className="w-[calc(50%-4px)] max-792:w-[calc(100%-4px)]" key={index}>
                                                <div className="flex justify-start items-center gap-1">
                                                  <Icon name="bx-check" size=".9em" />
                                                  {t[item]}
                                                </div>
                                              </li>
                                            })
                                        }
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )
                }
            </div>
        </div>
    )
}

export default PopUp