"use client"
import { useState } from 'react';
import {Element, Link } from 'react-scroll';

import Icon from './Icon';

import { useTranslationContext } from '@/hooks/app-hook';
import { maintenanceOption, priceList } from '@/constants';

interface PriceProps{
    locale:string
}
const maintenancePlateform = ['maintenanceWebsite','maintenanceEcommerce','maintenanceApp','maintenanceSaas'
]
const Price:React.FC<PriceProps> = ({locale})=>{
    const t:any = useTranslationContext();
    const initialActiveContentIndex = priceList.reduce((acc, _, index) => {
        acc[index] = 0; // Par défaut, sélectionner "Wordpress" (content[0])
        return acc;
      }, {} as { [key: number]: number });
    const [acitveIndex,setActiveIndex] = useState<number>(0)
    const [activeContentIndex, setActiveContentIndex] = useState<{ [key: number]: number }>(
        initialActiveContentIndex
    );
    const handleContentSwitch = (itemIndex: number, contentIndex: number) => {
        setActiveContentIndex((prev) => ({
          ...prev,
          [itemIndex]: contentIndex, // Met à jour l'index du contenu pour cet élément
        }));
    };
    const handleMaintenanceSwitch = (contentIndex: number) => {
        setActiveIndex(contentIndex)
    }
    return (
        <Element className="mt-[110px] price" name="price">
            <div>
                <div className='w-[85%] mx-auto'>
                    <h1 className='text-center text-thirty font-semibold mb-4 uppercase line-break'>{t["price"]}</h1>
                    <h4 className='text-center text-[#aaa] text-[1.4em] mb-10'>{t["priceTitle"]}</h4>
                    <div className='flex flex-wrap gap-5 justify-center w-full'>
                        {
                            priceList.map((item:any,index:number)=>{
                                console.log("item.id+'-'+index",item.id+index)
                                return (
                                    <div key={item.id+'_'+index} className={`self-stretch flex flex-col justify-between items-center basis-[200px] flex-grow max-w-[400px] ${Array.isArray(item.bloc) ? 'bg-white gap-y-4' : 'bg-[#211f1f] py-4'}`}>
                                    {
                                        !Array.isArray(item.bloc) ? (
                                            <div className='w-full'>
                                                <div className='w-full px-[10px]'>
                                                    <h3 className='text-center uppercase font-bold text-[1em] flex flex-col justify-center text-fifty items-center mx-4'>{t[item.bloc.title]}<span className='w-1/5 h-[6px] bg-thirty mb-5 mt-3'></span></h3>
                                                    {
                                                        item.bloc.devMethode && (
                                                            <div className='flex justify-center mx-2 w-[calc(100%-16px)]'>
                                                                <div className='flex justify-around items-center flex-wrap gap-3 w-full py-2 px-3 bg-white'>
                                                                {
                                                                    item.bloc.devMethode.map((m:string,i:number)=>{
                                                                        return(
                                                                            <p key={`${i}`} onClick={()=>handleContentSwitch(index, i)} className={` relative cursor-pointer uppercase text-[.67em] text-ellipsis whitespace-nowrap overflow-hidden before:w-0 
                                                                            before:transition-all before:duration-700 before:ease-in-out z-0 ${activeContentIndex[index] === i ? ' py-1 px-2 before:absolute before:left-0 before:top-0 before:bg-thirty before:!w-full before:h-full before:rounded-xl before:z-[-1] font-semibold text-fifty':''}`}>{t[m]}</p>
                                                                        )
                                                                    })
                                                                }
                                                                </div>
                                                            </div>
                                                        )
                                                    }
                                                    <h6 className='text-center text-[#aaa] uppercase mt-4 mb-[-4px] mx-4'>{t["from"]}</h6>
                                                    <div className='text-center w-full flex flex-col justify-center items-center px-4'>
                                                        <span className='text-center text-[3em] relative text-fifty'>{item.bloc.content[activeContentIndex[index] || 0].price}<em className='absolute top-[3px] right-[-8px] !text-[.4em] text-fifty'>€</em></span>
                                                        <span className='w-1/5 block h-[6px] bg-thirty mb-5 mt-2'></span>
                                                    </div>
                                                    <p className='block text-center font-medium text-fifty'>{t[item.bloc.content[activeContentIndex[index] || 0].devType.type]}</p>
                                                    <span className='block text-center text-[.8em] mb-3 text-fifty'>{t[item.bloc.content[activeContentIndex[index] || 0].devType.outil]}</span>
                                                </div>
                                                <ul className='m-0 p-0 flex flex-col justify-start items-start gap-2 w-full'>
                                                    {
                                                        item.bloc.content[activeContentIndex[index] || 0].options.map((o:string,k:number)=>{
                                                            return (
                                                                <li key={'option-'+k} className={`flex justify-start items-center py-[6px] px-2 w-full gap-1 ${k%2 === 0 ? 'bg-primary text-fifty' : 'text-fifty'}`}><Icon name="bx-plus" size='1.3em' color='var(--color-thirty)'/><div className='option' dangerouslySetInnerHTML={{ __html: t[o] }}/></li>
                                                            )
                                                        })
                                                    }
                                                </ul>
                                                <span className='cursor-pointer px-6 mt-3 py-3 text-fifty bg-thirty hover:text-thirty hover:bg-white flex items-center justify-center transition-hover duration-500 ease-in mx-4 w-[calc(100%-32px)]'>
                                                <Link
                                                activeClass="active"
                                                className='text-center'
                                                spy={true} 
                                                smooth={true} 
                                                offset={-65} 
                                                duration={500} 
                                                to={`contact`} 
                                                >{t["devi"]}
                                                </Link>
                                                </span>
                                            </div>
                                        ) : (
                                            <>
                                                {
                                                    item.bloc.map((b:any,i:number)=>{
                                                        return (
                                                            <div key={'bloc-'+i} className='self-stretch flex flex-col justify-between items-center h-fit py-4 bg-[#211f1f] w-full'>
                                                                <div className='w-full px-[10px]'>
                                                                    <h3 className='text-center uppercase font-bold text-[1em] flex flex-col justify-center text-fifty items-center mx-4'>{t[b.title]}<span className='w-1/5 h-[6px] bg-thirty mb-5 mt-3'></span></h3>
                                                                    {
                                                                        b.devMethode && (
                                                                            <div className='flex justify-center mx-2 w-[calc(100%-16px)]'>
                                                                                <div className='flex justify-around items-center flex-wrap gap-3 w-full py-2 px-3 bg-white'>
                                                                                {
                                                                                    b.devMethode.map((m:string,o:number)=>{
                                                                                        return(
                                                                                            <p onClick={()=>handleContentSwitch(index, o)} className={` relative cursor-pointer uppercase text-[.67em] text-ellipsis whitespace-nowrap overflow-hidden before:w-0 
                                                                                            before:transition-all before:duration-700 before:ease-in-out z-0 ${activeContentIndex[index] === o ? ' py-1 px-2 before:absolute before:left-0 before:top-0 before:bg-thirty before:!w-full before:h-full before:rounded-xl before:z-[-1] font-semibold text-fifty':''}`} key={'dev-'+o}>{t[m]}</p>
                                                                                        )
                                                                                    })
                                                                                }
                                                                                </div>
                                                                            </div>
                                                                        )
                                                                    }
                                                                    <h6 className='text-center text-[#aaa] uppercase mt-4 mb-[-4px] mx-4'>{t["from"]}</h6>
                                                                    <div className='text-center w-full flex flex-col justify-center items-center px-4'>
                                                                        <span className='noprice'>{t[b.content[activeContentIndex[index] || 0]?.noprice]}</span>
                                                                        
                                                                        <span className='w-1/5 block h-[6px] bg-thirty mb-5 mt-2'></span>
                                                                    </div>
                                                                    <p className='block text-center font-medium text-thirty text-[18px] mb-[10px]'>{t[b.content[activeContentIndex[index] || 0]?.devType.type]}</p>
                                                                    <span className='block text-center text-[.8em] mb-3 text-fifty'>{t[b.content[activeContentIndex[index] || 0]?.devType.outil]}</span>
                                                                </div>
                                                                <span className='cursor-pointer px-6 mt-3 py-3 text-fifty bg-thirty hover:text-thirty hover:bg-white flex items-center justify-center transition-hover duration-500 ease-in mx-4 w-[calc(100%-32px)]'>
                                                                <Link
                                                                activeClass="active"
                                                                className='text-center'
                                                                spy={true} 
                                                                smooth={true} 
                                                                offset={-65} 
                                                                duration={500} 
                                                                to={`contact`} 
                                                                >{t["devi"]}
                                                                </Link>
                                                                </span>
                                                            </div>
                                                        )
                                                    })
                                                }
                                            </>
                                        )
                                    }
                                   </div> 
                                )
                            })
                        }
                    </div>
                    <div className='flex flex-wrap justify-center gap-5 mt-10'>
                        <div className='basis-[200px] flex-grow max-w-[350px] py-4 bg-[#211f1f] flex-wrap'>
                            <h3 className='text-center uppercase font-bold text-[1.3em] flex flex-col justify-center items-center text-fifty mx-4'>{t["maintice"]}<span className='w-1/5 h-[6px] bg-thirty mb-5 mt-3'></span></h3>
                            <div className='flex justify-around items-center flex-wrap gap-3 w-[calc(100%-32px)] py-2 px-3 bg-white mx-4'>
                                {
                                    maintenancePlateform.map((m:string,i:number)=>{
                                        return(
                                            <p onClick={()=>handleMaintenanceSwitch(i)} className={` relative cursor-pointer uppercase text-[.67em] text-ellipsis whitespace-nowrap overflow-hidden before:w-0 
                                            before:transition-all before:duration-700 before:ease-in-out z-0 ${acitveIndex === i ? ' py-1 px-2 before:absolute before:left-0 before:top-0 before:bg-thirty before:!w-full before:h-full before:rounded-xl before:z-[-1] font-semibold text-fifty':''}`} key={'maintenance-'+i}>{t[m]}</p>
                                        )
                                    })
                                }
                                </div>
                            {
                                Array.isArray(maintenanceOption[acitveIndex].options) ? (
                                    <div>
                                        <div className='text-center w-full flex flex-wrap gap-[10px] mt-4 mb-4 justify-center items-center px-4'>
                                            <p className='font-semibold text-[1.7em] text-fifty'>{maintenanceOption[acitveIndex].hour}<em className='font-light text-[.5em] mt-[-1px] text-fifty'>€/{t["hourOr"]}</em></p>
                                            <div className='flex justify-start items-start gap-1'>
                                                <div className='flex justify-center items-center flex-col relative'>
                                                    <span className='text-center text-[3em] relative text-fifty'>{maintenanceOption[acitveIndex].year}</span>
                                                    <span className='w-2/5 block h-[6px] bg-thirty mb-1 mt-0'></span>
                                                </div>
                                                <em className='text-[.8em] text-[#aaa]'>€/{t["year"]}</em>
                                            </div>
                                        </div>
                                        <ul className='m-0 p-0 flex flex-col justify-start items-start gap-2 w-full'>
                                            {
                                                maintenanceOption[acitveIndex].options.map((o:string,k:number)=>{
                                                    return (
                                                        <li key={'mainOption'+k} className={`flex justify-start items-center py-[6px] px-2 w-full gap-1 ${k%2 === 0 ? 'bg-primary text-fifty' : 'text-fifty'}`}><Icon name="bx-plus" size='1.3em' color='var(--color-thirty)'/><div className='option' dangerouslySetInnerHTML={{ __html: t[o] }}/></li>
                                                    )
                                                })
                                            }
                                        </ul>
                                    </div>
                                ) : (
                                    <div>
                                        <p className='noprice mt-6 mb-3 text-center mx-4'>{t[maintenanceOption[acitveIndex]?.noprice ?? '']}</p>
                                        <span className='block text-center text-[.8em] mb-3 text-fifty mx-4'>{t[maintenanceOption[acitveIndex].options]}</span>
                                    </div>
                                )
                            }
                            <span className='cursor-pointer px-6 mt-3 py-3 text-fifty bg-thirty hover:text-thirty hover:bg-white flex items-center justify-center transition-hover duration-500 ease-in mx-4'>
                                <Link
                                activeClass="active"
                                spy={true} 
                                smooth={true} 
                                offset={-65} 
                                duration={500} 
                                to={`contact`} 
                                >{t["contactMe"]}
                                </Link>
                            </span>
                        </div>
                        <div className='basis-[200px] flex-grow max-w-[350px] py-4 bg-[#211f1f] self-start'>
                            <h3 className='text-center uppercase font-bold text-[1.3em] flex flex-col justify-center items-center text-fifty mx-4'>{t["specificDev"]}<span className='w-1/5 h-[6px] bg-thirty mb-5 mt-3'></span></h3>
                            <h6 className='text-center text-[#aaa] uppercase mt-4 mb-[-4px] mx-4'>{t["dayPrice"]}</h6>
                            <div className='flex justify-center items-start gap-1 px-4 mt-8 mb-4'>
                                <div className='flex justify-center items-center flex-col relative'>
                                                                                        <span           className='text-center text-[3em] relative text-fifty'>400</span>
                                                    <span className='w-2/5 block h-[6px] bg-thirty mb-1 mt-0'></span>
                                </div>
                                <em className='text-[.8em] text-[#aaa]'>€/{t["day"]}</em>
                            </div>
                            <span className='cursor-pointer px-6 mt-3 py-3 text-fifty bg-thirty hover:text-thirty hover:bg-white flex items-center justify-center transition-hover duration-500 ease-in mx-4'>
                                <Link
                                activeClass="active"
                                spy={true} 
                                smooth={true} 
                                offset={-65} 
                                duration={500} 
                                to={`contact`} 
                                >{t["contactMe"]}
                                </Link>
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </Element>
    )
}

export default Price