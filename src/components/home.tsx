"use client"
import {Element, Link } from 'react-scroll';
import { useTranslationContext } from '@/hooks/app-hook';

interface HomeProps{
    locale:string
}

const Home:React.FC<HomeProps> = ({locale})=>{
    const t:any = useTranslationContext();
    return (
        <Element className="mt-[100px]" name="home">
            <div className='w-full bg-secondary'>
                <div className='w-full flex gap-[40px] justify-center items-start relative'>
                    <div className='flex flex-col justify-center items-center self-stretch ml-[calc(15%/2)] max-920:absolute max-920:bg-[rgba(0,0,0,.5)] max-920:ml-0 max-920:w-full max-920:h-full max-920:top-[50%] max-920:translate-y-[-50%] max-920:left-0 max-920:px-[10%]'>
                        <h1 className='text-fifty mb-3 uppercase text-[3em] max-420:text-[25px] max-485:mb-5 line-break'>{t["devTitle"]}</h1>
                        <p className='mb-3 text-fifty'>{t["devDescription"]}</p>
                        <div className='flex justify-center items-center gap-2 h-[86px] w-full mb-4 bg-primary p-4 flex-col'>
                            <h4 className='text-fifty uppercase text-[1em] dev text-ellipsis h-5 text-center overflow-hidden whitespace-nowrap w-full'>{t["domainTitle"]}</h4>
                            <div className="dropping-texts w-full h-[36px]">
                                <div className='text-center w-full flex justify-center items-center'>{t["web"]}</div>
                                <div className='text-center w-full flex justify-center items-center'>{t["ecommerceWebSite"]}</div>
                                <div className='text-center w-full flex justify-center items-center'>{t["mobileApp"]}</div>
                                <div className='text-center w-full flex justify-center items-center'>{t["saas"]}</div>
                            </div>
                        </div>
                        <div className='flex justify-start items-center gap-5 w-full mt-3 ml-5 max-485:flex-col max-485:ml-0'>
                            <span className='cursor-pointer px-6 py-3 text-secondary bg-fifty rounded-2xl hover:outline-fifty hover:outline hover:outline-1 hover:bg-secondary hover:text-fifty flex items-center justify-center transition-hover duration-500 ease-in max-485:w-full'>
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
                            <span className='cursor-pointer px-6 py-3 text-fifty bg-transparent border-[1px] border-solid border-fifty rounded-2xl hover:text-secondary hover:bg-fifty hover:border-fifty flex items-center justify-center transition-hover duration-500 ease-in max-485:w-full'>
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
                    <img className='w-1/2 rounded-tl-[100px] rounded-bl-[100px] h-[550px] max-920:w-full max-920:rounded-none' src='/assets/images/home.jpg' alt="home" />
                </div>
            </div>
        </Element>
    )
}

export default Home