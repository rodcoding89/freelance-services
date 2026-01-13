"use client"
import {Element, Link } from 'react-scroll';
import { useTranslationContext } from '@/hooks/app-hook';
import Image from 'next/image';
import { useEffect } from 'react';

interface HomeProps{
    locale:string
}

const Home:React.FC<HomeProps> = ({locale})=>{
    const t:any = useTranslationContext();
    
    return (
        <Element className="mt-[6.25rem]" name="home">
            <div className='w-full bg-secondary'>
                <div className='w-full flex gap-[4.5rem] justify-center items-start relative'>
                    <div className='flex flex-col justify-center items-center self-stretch w-1/2 ml-[calc(15%/2)] max-920:absolute max-920:bg-[rgba(0,0,0,.5)] max-920:ml-0 max-920:w-full max-920:h-full max-920:top-[50%] max-920:translate-y-[-50%] max-920:left-0 max-920:px-[10%] max-420:aspect-[19/20] z-20'>
                        <h1 className='text-fifty mb-3 uppercase text-[2.2em] max-420:text-[1.2rem] max-485:mb-5 max-485:text-[1.5rem] line-break'>{t["devTitle"]}</h1>
                        <p className='mb-3 text-fifty'>{t["devDescription"]}</p>
                        <div className='flex justify-center items-center gap-2 h-[5.375rem] w-full mb-4 py-4 px-10 flex-col relative rounded-tl-[4.25rem] border-[0.0675rem] border-solid border-primary rounded-br-[4.25rem] bg-fifty max-920:border-secondary max-520:px-6 max-485:hidden'>
                            <h4 className='text-primary uppercase text-[.9em] text-ellipsis h-5 text-center max-920:text-primary  overflow-hidden whitespace-nowrap w-[calc(100%-6rem)] absolute top-2 left-[50%] translate-x-[-50%] mx-6 '>{t["domainTitle"]}</h4>
                            <h4 className='text-primary uppercase text-[1em] text-ellipsis h-5 text-center max-920:text-primary overflow-hidden whitespace-nowrap w-[calc(100%-6rem)] unvisible mx-6'>{t["domainTitle"]}</h4>
                            <div className="dropping-texts w-full h-[5.375rem] rounded-2xl">
                                <div className='text-center w-full flex justify-center items-center'>{t["web"]}</div>
                                <div className='text-center w-full flex justify-center items-center'>{t["ecommerceWebSite"]}</div>
                                <div className='text-center w-full flex justify-center items-center'>{t["mobileApp"]}</div>
                                <div className='text-center w-full flex justify-center items-center'>{t["saas"]}</div>
                            </div>
                        </div>
                        <div className='flex justify-start items-center gap-5 w-full mt-3 ml-5 max-485:flex-col max-485:ml-0'>
                            <span className='cursor-pointer px-6 py-3 text-secondary bg-fifty rounded-2xl hover:outline-fifty hover:outline hover:outline-1 hover:bg-secondary hover:text-fifty flex items-center justify-center transition-hover duration-500 ease-in max-485:w-full max-485:py-1'>
                                <Link
                                    activeClass="active"
                                    spy={true} 
                                    smooth={true} 
                                    offset={-100} 
                                    duration={500} 
                                    to={`contact`} 
                                    >{t["devi"]}
                                </Link>
                            </span>
                            <span className='cursor-pointer px-6 py-[calc(0.75rem-0.0625rem)] text-fifty bg-transparent border-[0.0625rem] border-solid border-fifty rounded-2xl hover:text-secondary hover:bg-fifty hover:border-fifty flex items-center justify-center transition-hover duration-500 ease-in max-485:w-full max-485:py-1'>
                                <Link
                                    activeClass="active"
                                    spy={true} 
                                    smooth={true} 
                                    offset={-100} 
                                    duration={500} 
                                    to={`services`} 
                                    >{t["ourServices"]}
                                </Link>
                            </span>
                        </div>
                    </div>
                    <picture className='brightness-75 w-1/2 max-920:w-full h-[calc(100vh-6.25rem)] max-920:brightness-100 max-920:aspect-[20/12] max-920:h-unset max-640:aspect-[20/17] max-420:!aspect-[19/21] max-330:!aspect-[19/26]'>
                        <Image src={'/assets/images/home1.jpg'} width={1536} height={1006} alt='baniere' className='w-full rounded-tl-[6.25rem] rounded-bl-[6.25rem] max-920:rounded-none'/>
                    </picture>
                </div>
            </div>
        </Element>
    )
}

export default Home