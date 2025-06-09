"use client"
import Link from 'next/link';
import Icon from './Icon';
import { useTranslationContext } from '@/hooks/app-hook';
interface FooterProps{
    locale:string;
    date:number;
}

//console.log("lang",location.pathname)
const Footer:React.FC<FooterProps> = ({locale,date})=>{
    const t:any = useTranslationContext();
    return (
        <footer className='bg-primary w-full flex justify-start items-center gap-8 flex-col py-10 mt-10 px-[8%] '>
            <div className='flex justify-center items-start w-full gap-x-[13vw] gap-y-7 max-520:flex-col max-520:justify-center max-520:w-full'>
                <div className='text-fifty w-1/2 max-792:w-[100px] max-520:w-full max-520:flex max-520:justify-center max-520:items-center'><img src="/assets/images/logo.webp" alt="logo" className='w-auto h-[100px] rounded-full'/></div>
                <div className='flex justify-start items-start w-1/2 max-792:flex-1 max-520:w-full max-520:justify-center max-520:items-center'>
                    <div className='flex justify-start items-start flex-col gap-5'>
                        <h4 className='text-fifty uppercase font-semibold'>{t["shareOn"]}</h4>
                        <div className='flex justify-center items-center gap-6 max-420:gap-4'>
                            <Link href={'/fr/legal-notice'} className='flex justify-center items-center socialMediaIcon'><Icon name='bx bxl-facebook-circle pt-1' size='1.5em' color='var(--color-fifty)'/></Link>
                            <Link href={'/'+locale+'/legal-notice'} className='flex justify-center items-center socialMediaIcon'><Icon name='bx bxl-twitter pt-1' size='1.5em' color='var(--color-fifty)'/></Link>
                            <Link href={'/fr/legal-notice'} className='flex justify-center items-center socialMediaIcon'><Icon name='bx bxl-instagram pt-1' size='1.5em' color='var(--color-fifty)'/></Link>
                            <Link href={'/fr/legal-notice'} className='flex justify-center items-center socialMediaIcon'><Icon name='bx bxl-linkedin pt-1' size='1.5em' color='var(--color-fifty)'/></Link>
                            <span className='flex justify-center items-center socialMediaIcon'><Icon name='bx bx-share-alt pt-1' size='1.5em' color='var(--color-fifty)'/></span>
                        </div>
                    </div>
                </div>
            </div>
            <hr className='border-secondary w-full'/>
            <div className='flex justify-center items-start gap-x-[13vw] gap-y-4 w-full max-640:flex-col'>
                <div className='w-1/2 max-640:w-full'>
                    <h4 className='text-fifty uppercase font-semibold mb-5'>{t["devTitle"]}</h4>
                    <p className='text-[#aaa]'>{t["devDescription"]}</p>
                </div>
                <div className='w-1/2 flex flex-col justify-start items-start max-640:w-full max-640:justify-start max-640:items-start'>
                    <h5 className='text-fifty uppercase font-semibold mb-5'>{t["contactMe"]}</h5>
                    <div className="flex justify-start items-start gap-x-5 gap-y-3 flex-wrap">
                        <div className="flex justify-start items-start gap-2">
                            <Icon name='bxl-whatsapp' size='1.3em' color='var(--color-fifty)'/>
                            <div className="">
                                <h5 className='text-fifty uppercase font-semibold text-[13px]'>{t["whatsapp"]}</h5>
                                <a href="https://wa.me/+33751025598" className='hover:text-link text-fifty text-[13px]'>WhatsApp</a>
                            </div>
                        </div>
                        <div className="flex justify-start items-start gap-2">
                            <Icon name='bx-phone' size='1.3em' color='var(--color-fifty)'/>
                            <div className="">
                                <h5 className='text-fifty uppercase font-semibold text-[13px]'>{t["perPhone"]}</h5>
                                <a href="tel:+33751025598" className='hover:text-link text-fifty text-[13px]'>+33 7 51 02 55 98</a>
                            </div>
                        </div>
                        <div className="flex justify-start items-start gap-2">
                            <Icon name='bx-time' size='1.3em' color='var(--color-fifty)'/>
                            <div className="w-full">
                                <h5 className='text-fifty uppercase font-semibold text-[13px]'>{t["time"]}</h5>
                                <ul>
                                    <li className='text-fifty text-[13px]'>{t["week"]}</li>
                                    <li className='text-fifty text-[13px]'>{t["hourTime"]}</li>
                                </ul>
                            </div>
                        </div>
                        <div className="flex justify-start items-start gap-2">
                            <Icon name='bx-envelope' size='1.3em' color='var(--color-fifty)'/>
                            <div className="w-full">
                                <h5 className='text-fifty uppercase font-semibold text-[13px]'>{t["perEmail"]}</h5>
                                <a href="mailto:rodriguekwayep.freelance@hotmail.com" className='hover:text-link text-fifty text-[13px]'>rodriguekwayep.freelance@hotmail.com</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className='w-full flex justify-between items-center gap-x-[13vw] gap-y-4 flex-wrap'>
                <div className='flex items-center justify-start gap-2 flex-wrap'>
                    <Link href={`/${locale}/legal-notice`} className='text-fifty underline hover:text-link text-left'>{t["legalNotice"]}</Link>
                    <Link href={`/${locale}/privacy-policies`} className='text-fifty underline hover:text-link text-left'>{t["privacyPolicies"]}</Link>
                    <Link href={`/${locale}/terms-of-sale`} className='text-fifty underline hover:text-link text-left'>{t["termsOfSale"]}</Link>
                </div>
                <div className='flex items-center justify-end gap-2 flex-1'>
                    <p className='text-fifty text-right'>© Copyright {date} {t["right"]}</p>
                </div>
            </div>
        </footer>
    )
}

export default Footer