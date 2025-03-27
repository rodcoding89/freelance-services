import { Element } from 'react-scroll';
import Icon from './Icon';
import { useContext } from 'react';
import { AppContext } from '../app-context';
import { services } from '../utils/constant';
import { useTranslation } from 'react-i18next';
interface ServiceProps{

}

const Services:React.FC<ServiceProps> = ()=>{
    const {setContextData} = useContext(AppContext)
    const {t} = useTranslation()

    const handleShowMore = (id:number)=>{
        const windowWidth = window.innerWidth;
        const costomeWidth = windowWidth >= 600 ? 'w-[70%]' : windowWidth <= 600 && windowWidth >= 420 ? 'w-[85%]' : 'w-[100%]'
        setContextData({state:"show",value:true,size:costomeWidth,mode:'service',id:id})
    }
    return (
        <Element className="mt-[110px]" name="services">
            <div className='bg-fifty flex flex-col'>
                <h1 className='mb-10 mx-[calc(15%/2)] pt-[20px] uppercase'>{t('services')}</h1>
                <p className='mx-[calc(15%/2)] pb-10'>{t("serviceDescription")}</p>
                <div className='mx-auto bg-white relative'>
                    <div className='h-[100px] w-full bg-fifty absolute top-0 left-0 z-[1]'></div>
                    <div className='flex justify-center items-start gap-y-8 flex-wrap w-[85%] mx-auto z-[2] relative'>
                    {
                        services.map((item:any)=>{
                            return (
                                <div key={item.id} className='basis-[300px] max-w-[400px] flex-grow px-[30px] border-b-4 border-solid py-[40px] bg-white boxShadow transition-hover duration-[.4s] ease-in border-white hover:border-b-secondary max-520:max-w-[320px] max-520:basis-[250px] self-stretch relative flex flex-col justify-between items-start'>
                                    <div className='flex justify-start items-center gap-2 mb-3'><span className='w-16 h-16 radius bg-secondary flex justify-center items-center'><Icon name={item.service.icon} color="#fff" size="1.6em"/></span><h3 className='uppercase text-[1.1em] flex-1'>{t(item.service.serviceName)}</h3></div>
                                    <p className='mb-3'>{t(item.service.shortDescript)}</p>
                                    <div onClick={()=>handleShowMore(item.id)} className='border-2 border-solid border-secondary py-2 px-5 text-center cursor-pointer transition-hover duration-[.5s] ease-in w-full  hover:bg-secondary hover:text-white'>{t("learnMore")}</div>
                                </div>
                            )
                        })
                    }
                    </div>
                </div>
            </div>
            
        </Element>
    )
}

export default Services