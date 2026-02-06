"use client"
import { Link,animateScroll as scroller } from 'react-scroll';
import Icon from './Icon';
import { useContext, useEffect, useState } from 'react';
import { useTranslationContext } from '@/hooks/app-hook';
import { AppContext } from '@/app/context/app-context';
import { usePathname, useRouter } from "next/navigation";
import Image from 'next/image';

interface HeaderProps{
    locale:string
}

const Header:React.FC<HeaderProps> = ({locale})=>{
    const t:any = useTranslationContext();
    const {setContextData} = useContext(AppContext)
    const [language, setLanguage] = useState(locale);
    const [isShowLang, setIsShowLang] = useState(false);
    const [hasChangeLanguage, setHasChangeLanguage] = useState(false);
    const pathname = usePathname();
    const navigate = useRouter()
    useEffect(() => {
        scroller.scrollTo(1, {
            duration: 500,
            smooth: true,
            offset: 0, // Scrolls to element + 50 pixels down the page
            // ... other options
        });
        //alert()
    }, [navigate]);
    
    const switchToStart = ()=>{
        const location = new URL(window.location.href);
        if (location.pathname.split("/").length > 2) {
            navigate.push("/"+locale)
        }
    }
    const handleShowMore = ()=>{
        const windowWidth = window.innerWidth;
        const costomeWidth = windowWidth >= 920 ? 'w-[25%]' : windowWidth <= 920 && windowWidth >= 650 ? 'w-[45%]' : windowWidth <= 650 && windowWidth >= 420 ? 'w-[55%]' : 'w-[100%]'
        console.log("width",window.innerWidth)
        setContextData({state:"show",value:true,size:costomeWidth,mode:"mobile"})
    }
    const changeLanguage = (lang:string) => {
        // Rediriger vers la nouvelle langue
        let t = pathname.split('/');
        t.splice(1,1);
        console.log('pathname',t)
        const urlToNavigate = `/${lang}/${t.join('/')}`;
        setLanguage(lang)
        navigate.push(urlToNavigate);
    }; 
    return (
        <header className='header w-full h-[6.25rem] fixed top-0 left-0 bottom-0 right-0 z-10 flex items-center'>
            <div className='mx-auto flex justify-between items-center w-[85%]'>
                <Link
                className='cursor-pointer'
                activeClass="active" 
                spy={true} 
                smooth={true} 
                offset={-100} 
                duration={500}
                to={`home`}
                ><Image src={`/assets/images/logo.webp`} alt="logo" width={80} height={80} className='w-auto h-[5rem] rounded-full' onClick={switchToStart}/></Link>
                <nav className='navi flex justify-start items-center gap-4 max-1085:hidden'>
                    <Link
                    className='cursor-pointer text-primary'
                    activeClass="active" 
                    spy={true} 
                    smooth={true} 
                    offset={-100} 
                    duration={500}
                    to={`home`} onClick={switchToStart}>{t["home"]}</Link>
                    <Link 
                    className='cursor-pointer text-primary'
                    activeClass="active"
                    spy={true} 
                    smooth={true} 
                    offset={-100} 
                    duration={500} 
                    to={`about`} onClick={switchToStart}>{t["about"]}</Link>
                    <Link
                    className='cursor-pointer text-primary'
                    activeClass="active"
                    spy={true} 
                    smooth={true} 
                    offset={-100} 
                    duration={500} 
                    to={`services`} onClick={switchToStart}>{t["services"]}</Link>
                    <Link
                    className='cursor-pointer text-primary'
                    activeClass="active"
                    spy={true} 
                    smooth={true} 
                    offset={-100} 
                    duration={500} 
                    to={`reference`} onClick={switchToStart}>{t["references"]}</Link>
                    <Link
                    className='cursor-pointer text-primary'
                    activeClass="active"
                    spy={true} 
                    smooth={true} 
                    offset={-100} 
                    duration={500} 
                    to={`price`} onClick={switchToStart}>{t["price"]}</Link>
                    <Link
                    className='cursor-pointer text-primary'
                    activeClass="active"
                    spy={true} 
                    smooth={true} 
                    offset={-100} 
                    duration={500} 
                    to={`contact`} onClick={switchToStart}>{t["contact"]}</Link>
                    <a href={process.env.NEXT_PUBLIC_MODE ? process.env.NEXT_PUBLIC_MODE === "prodDocker" ? 'https://portfolio.rodcoding.com' : "http://portfolio.localhost" : ""} className='cursor-pointer text-primary' target="_blank">{t["portfolio"]}</a>
                </nav>
                <div className='relative flex justify-start items-center gap-6'>
                    <div className='flex justify-start items-center gap-2 max-485:hidden'>
                        <a className='flex justify-center items-center gap-1 w-[2.5rem] h-[2.5rem] rounded-[.2em] bg-fifty'  href='tel:+33745507195'><Icon name='bx-phone' size='1.4em' color='var(--color-secondary)'/></a>
                        <a className='flex justify-center items-center gap-1 w-[2.5rem] h-[2.5rem] rounded-[.2em] bg-fifty'  href='mailto:rodriguekwayep.freelance@hotmail.com'><Icon name='bx-envelope' size='1.4em' color='var(--color-secondary)'/></a>
                    </div>
                    <button onClick={()=>setIsShowLang(!isShowLang)} className="language-picker__button menu focus:outline-none hover:border-0" aria-label="english Select your language" aria-expanded="false" aria-controls="language-picker-select-dropdown"><span aria-hidden="true" className="language-picker__label language-picker__flag language-picker__flag--english"><svg viewBox="0 0 16 16" className="icon"><path d="M8,0C3.6,0,0,3.6,0,8s3.6,8,8,8s8-3.6,8-8S12.4,0,8,0z M13.9,7H12c-0.1-1.5-0.4-2.9-0.8-4.1 C12.6,3.8,13.6,5.3,13.9,7z M8,14c-0.6,0-1.8-1.9-2-5H10C9.8,12.1,8.6,14,8,14z M6,7c0.2-3.1,1.3-5,2-5s1.8,1.9,2,5H6z M4.9,2.9 C4.4,4.1,4.1,5.5,4,7H2.1C2.4,5.3,3.4,3.8,4.9,2.9z M2.1,9H4c0.1,1.5,0.4,2.9,0.8,4.1C3.4,12.2,2.4,10.7,2.1,9z M11.1,13.1 c0.5-1.2,0.7-2.6,0.8-4.1h1.9C13.6,10.7,12.6,12.2,11.1,13.1z"></path></svg><em className='not-italic'>{language === 'fr' ? 'FR' : 'EN'}</em><svg viewBox="0 0 16 16" className="icon"><polygon points="3,5 8,11 13,5 "></polygon></svg></span></button>
                    <div className={`languages absolute top-[2.1875rem] left-[7.125rem] rounded-lg w-[7.5rem] my-2 bg-white overflow-hidden ${isShowLang ? 'opacity-1' : 'opacity-0'} max-485:left-0 max-485:right-[7.125rem]`}>
                        <ul className={`${isShowLang ? 'h-[3.85rem]' : 'h-0'}`}>
                            <li onClick={()=>{changeLanguage("en");setHasChangeLanguage(true)}} className={`py-1 cursor-pointer ${language === 'en' ? 'bg-thirty flex justify-between items-center text-white' : 'hover:bg-[#aaa]'}`}><span className='px-2'>English</span> {language === 'en' && <Icon name="bx-check mr-2" size='1.2' color='#fff'/>}</li>
                            <li onClick={()=>{changeLanguage("fr");setHasChangeLanguage(true)}} className={`py-1 cursor-pointer ${language === 'fr' ? 'bg-thirty flex justify-between items-center text-white' : 'hover:bg-[#aaa]'}`}><span className='px-2'>Français</span> {language === 'fr' && <Icon name="bx-check mr-2" size='1.2' color='#fff'/>}</li>
                        </ul>
                    </div>
                    <div className='flex w-[2.5rem] h-[2.5rem] justify-center items-center cursor-pointer rounded-full bg-fifty' onClick={handleShowMore}>
                        <div className='flex justify-center items-center flex-col gap-1 py-1 w-3/5'>
                            <span className='bg-secondary rounded-[0.625rem] h-[0.125rem] w-1/2'></span>
                            <span className='bg-secondary rounded-[0.625rem] h-[0.125rem] w-full'></span>
                            <span className='bg-secondary rounded-[0.625rem] h-[0.125rem] w-2/3'></span>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    )
}

export default Header