"use client"
import Link from 'next/link';
import Image from 'next/image';
import Icon from './Icon';
import { useTranslationContext } from '@/hooks/app-hook';
interface FooterProps{
    locale:string;
    date:number;
}

//console.log("lang",location.pathname)
const Footer:React.FC<FooterProps> = ({locale,date})=>{
    const t:any = useTranslationContext();
    const shareOnSocialMediaAppMode = ()=>{
        const text = `${locale === 'fr' ? 'Vous avez besoin d\'une solution web (site internet, e-commerce, etc.) ? Contactez-nous via le lien ci-dessous.' : locale === 'de' ? 'Benötigen Sie eine Weblösung (Website, E-Commerce, etc.)? Kontaktieren Sie uns über den untenstehenden Link.' : 'Need a web solution (website, e-commerce, etc.)? Contact us via the link below.'}`
        const url = `${process.env.NEXT_PUBLIC_WEB_LINK?.replace("{locale}",locale)}`
        let shareUrl;
        const encodedUrl = encodeURIComponent(url);
        const encodedText = encodeURIComponent(text);
        if (typeof window !== 'undefined' && window.navigator && navigator.share) {
            navigator.share({
                title: `${locale === 'fr' ? 'Développeur Web Freelance' : locale === 'de' ? 'Webentwickler Freelance' : 'Web Developer Freelance'}`,
                text: encodedText,
                url: encodedUrl
            })
            .then(() => console.log('Partage réussi'))
            .catch((error) => console.error('Erreur de partage', error));
        } else {
            console.log('Web Share API non supportée');
        }
    }
    const isMobileDevice = () =>{
        if (typeof window !== 'undefined' && window.navigator) {
            return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent); 
        }else{
            return false;
        }
    }
    const shareOnSocial = (platform:string) =>{
        const text = `${locale === 'fr' ? 'Vous avez besoin d\'une solution web (site internet, e-commerce, etc.) ? Contactez-nous via le lien ci-dessous.' : locale === 'de' ? 'Benötigen Sie eine Weblösung (Website, E-Commerce, etc.)? Kontaktieren Sie uns über den untenstehenden Link.' : 'Need a web solution (website, e-commerce, etc.)? Contact us via the link below.'}`
        const url = `${process.env.NEXT_PUBLIC_WEB_LINK?.replace("{locale}",locale)}`
        let shareUrl;
        const encodedUrl = encodeURIComponent(url);
        const encodedText = encodeURIComponent(text);
        
        switch(platform) {
            case 'facebook':
                shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`;
                break;
            case 'twitter':
                shareUrl = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`;
                break;
            case 'linkedin':
                shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
                break;
            case 'whatsapp':
                shareUrl = `https://wa.me/?text=${encodedText}%20${encodedUrl}`;
                break;
            case 'telegram':
                shareUrl = `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`;
                break;
            default:
                console.error('Plateforme non supportée');
                return;
        }
        
        window.open(shareUrl, '_blank', 'width=600,height=400');
    }
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth' // Animation fluide
        });
    };
    return (
        <footer className='bg-primary w-full flex justify-start items-center gap-8 flex-col py-10 mt-10 px-[8%] relative'>
            <span className='bg-secondary w-9 h-9 rounded-[.4rem] flex justify-center items-center cursor-pointer absolute top-[-1.25rem] right-10' onClick={scrollToTop}><Icon name='bx-chevron-up' size='1.7rem' color='var(--color-fifty)'/></span>
            <div className='flex justify-center items-start w-full gap-x-[13vw] gap-y-7 max-520:flex-col max-520:justify-center max-520:w-full'>
                <div className='text-fifty w-1/2 max-792:w-[6.25rem] max-520:w-full max-520:flex max-520:justify-center max-520:items-center'><Image src={`/assets/images/logo.webp`} alt="logo" width={100} height={100} className='w-auto h-[6.25rem] rounded-full'/></div>
                <div className='flex justify-start items-start w-1/2 max-792:flex-1 max-520:w-full max-520:justify-center max-520:items-center'>
                    <div className='flex justify-start items-start flex-col gap-5'>
                        <h4 className='text-fifty uppercase font-semibold'>{t["shareOn"]}</h4>
                        <div className='flex justify-center items-center gap-6 max-420:gap-4'>
                            <span onClick={()=>shareOnSocial('facebook')} className='flex justify-center items-center socialMediaIcon cursor-pointer'><Icon name='mt-[-0.315rem] bx bxl-facebook-circle pt-1' size='1.5em' color='var(--color-fifty)'/></span>
                            <span onClick={()=>shareOnSocial('twitter')} className='flex justify-center items-center socialMediaIcon cursor-pointer'><Icon name='mt-[-0.315rem] bx bxl-twitter pt-1' size='1.5em' color='var(--color-fifty)'/></span>
                            <span onClick={()=>shareOnSocial('telegram')} className='flex justify-center items-center socialMediaIcon cursor-pointer'><Icon name='mt-[-0.315rem] bx bxl-telegram pt-1' size='1.5em' color='var(--color-fifty)'/></span>
                            <span onClick={()=>shareOnSocial('whatsapp')} className='flex justify-center items-center socialMediaIcon cursor-pointer'><Icon name='mt-[-0.315rem] bx bxl-whatsapp pt-1' size='1.5em' color='var(--color-fifty)'/></span>
                            <span onClick={()=>shareOnSocial('linkedin')} className='flex justify-center items-center socialMediaIcon cursor-pointer'><Icon name='mt-[-0.315rem] bx bxl-linkedin pt-1' size='1.5em' color='var(--color-fifty)'/></span>
                            {
                                isMobileDevice() && <span className='flex justify-center items-center socialMediaIcon cursor-pointer' onClick={shareOnSocialMediaAppMode}><Icon name='bx mt-[-0.315rem] bx-share-alt pt-1' size='1.5em' color='var(--color-fifty)'/></span>
                            }
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
                                <h5 className='text-fifty uppercase font-semibold text-[0.8125rem]'>{t["whatsapp"]}</h5>
                                <a href="https://wa.me/+33751025598" className='hover:text-link text-fifty text-[0.8125rem]'>WhatsApp</a>
                            </div>
                        </div>
                        <div className="flex justify-start items-start gap-2">
                            <Icon name='bx-phone' size='1.3em' color='var(--color-fifty)'/>
                            <div className="">
                                <h5 className='text-fifty uppercase font-semibold text-[0.8125rem]'>{t["perPhone"]}</h5>
                                <a href="tel:+33751025598" className='hover:text-link text-fifty text-[0.8125rem]'>+33 7 45 50 71 95</a>
                            </div>
                        </div>
                        <div className="flex justify-start items-start gap-2">
                            <Icon name='bx-time' size='1.3em' color='var(--color-fifty)'/>
                            <div className="w-full">
                                <h5 className='text-fifty uppercase font-semibold text-[0.8125rem]'>{t["time"]}</h5>
                                <ul>
                                    <li className='text-fifty text-[0.8125rem]'>{t["week"]}</li>
                                    <li className='text-fifty text-[0.8125rem]'>{t["hourTime"]}</li>
                                </ul>
                            </div>
                        </div>
                        <div className="flex justify-start items-start gap-2">
                            <Icon name='bx-envelope' size='1.3em' color='var(--color-fifty)'/>
                            <div className="w-full">
                                <h5 className='text-fifty uppercase font-semibold text-[0.8125rem]'>{t["perEmail"]}</h5>
                                <a href="mailto:contact@rodcoding.com" className='hover:text-link text-fifty text-[0.8125rem] lineBreak'>contact@rodcoding.com</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className='w-full flex justify-start items-center gap-x-[13vw] gap-y-4 flex-wrap'>
                <div className='flex items-center justify-start gap-2 flex-wrap'>
                    <Link href={`/${locale}/legal-notice`} className='text-fifty underline hover:text-link text-left'>{t["legalNotice"]}</Link>
                    <Link href={`/${locale}/privacy-policies`} className='text-fifty underline hover:text-link text-left'>{t["privacyPolicies"]}</Link>
                    <Link href={`/${locale}/terms-of-sale`} className='text-fifty underline hover:text-link text-left'>{t["termsOfSale"]}</Link>
                </div>
                <p className='text-fifty text-letf'>© Copyright {date} {t["right"]}</p>
            </div>
        </footer>
    )
}

export default Footer