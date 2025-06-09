"use client"
import { Element } from 'react-scroll';
import Icon from './Icon';
import { experienceData, pathwayData } from '@/constants';
import { useTranslationContext } from '@/hooks/app-hook';
import Link from 'next/link';

interface AboutProps{
    locale:string
}

const About:React.FC<AboutProps> = ({locale}) =>{
    const t:any = useTranslationContext();
    const pathway = pathwayData.map((item:any)=>{
        return {title:t[item.title],country:t[item.country],periode:t[item.periode],description:t[item.description]}
    })
    const experience = experienceData.map((item)=>{
        return {title:t[item.title],country:t[item.country],periode:t[item.periode],enterprice:t[item.enterprice],description:t[item.description]}
    })
    const stat = [
        {
            title:t["yearExperiences"],
            nb:8,
            icon:"bx-code-alt"
        },
        {
            title:t["realiseProject"],
            nb:10,
            icon:"bx-customize"
        },{
            title:t["satisfiedCustomer"],
            nb:8,
            icon:"bx-line-chart"
        }
    ]
    return (
        <Element className="mt-[110px]" name="about">
            <div className='w-[85%] mx-auto'>
                <h1 className='text-center uppercase text-thirty mb-10 line-break'>{t["about"]}</h1>
                <div className='flex justify-start items-center gap-20 flex-col'>
                    <div className='w-full flex justify-center items-center gap-8 relative'>
                        <div className="parcours w-full">
                            <h3 className='text-[#aaa] text-[1.5em] mb-4'>{t["pathway"]}</h3>
                            <div className='flex flex-col gap-y-4 ml-4'>
                            {
                                pathway.map((item,index)=>{
                                    return (
                                        <div key={index}>
                                    {
                                        index === 2 && <div className='flex justify-center items-center w-full my-4'><img className='w-1/3 h-auto max-792:w-2/3' src="/assets/images/about.svg" alt="about" /></div>
                                    }
                                        <div>
                                            <h4 className='mb-3 text-secondary'>{item.title}</h4>
                                            <div className='ml-4'>
                                                <p className='flex justify-start items-start gap-x-2 mb-1 flex-wrap'>
                                                    <span><strong>{t["periode"]}</strong>:</span><span className='text-[gray] text-[.85em]'>{item.periode}</span></p>
                                                <p className='flex justify-start items-start gap-2 mb-2 flex-wrap'>
                                                    <span><strong>{t["country"]}</strong>:</span><span className='text-[gray] text-[.85em]'>{item.country}</span></p>
                                                <p>{item.description}</p>
                                            </div>
                                        </div>
                                        </div>
                                    )
                                })
                            }
                            </div>
                        </div>
                    </div>
                    <div className='w-full'>
                        <div className="experience w-full">
                            <h3 className='text-[#aaa] text-[1.5em] mb-4'>{t["expiriences"]}</h3>
                            <div className='flex justify-start items-start flex-col gap-y-4 ml-4'>
                            {
                                experience.map((item,index)=>{
                                    return (
                                        <div key={index}>
                                        {index === 2 && <div className='flex justify-center items-center w-full my-4'><img className='w-1/3 h-auto max-792:w-2/3' src="/assets/images/about.svg" alt="about" /></div>}
                                        <div>
                                            <h4 className='mb-3 text-secondary text-left'>{item.title}</h4>
                                            <div className='ml-4 w-full'>
                                                <p className='flex justify-start items-start gap-x-2 mb-1 flex-wrap'>
                                                    <span><strong>{t["periode"]}</strong>:</span><span className='text-[gray] text-[.85em]'>{item.periode}</span></p>
                                                <p className='flex justify-start items-start gap-2 mb-2 flex-wrap'>
                                                    <span><strong>{t["country"]}</strong>:</span><span className='text-[gray] text-[.85em]'>{item.country}</span></p>
                                                <p className='flex justify-start items-center gap-2 mb-2 uppercase'>
                                                    <span><strong>{t["enterprice"]}</strong>:</span><span className='text-[gray] text-[.85em]'>{item.enterprice}</span></p>
                                                <p className='text-left'>{item.description}</p>
                                            </div>
                                        </div>
                                        </div>
                                    )
                                })
                            }
                            </div>
                        </div>
                    </div>
                </div>
                <span className='block text-left italic text-[.8em] mt-5'>{t['moreEx']}<Link className='text-[#535bf2] hover:underline text-[14px] not-italic' href={'https://portfolio.rodcoding.com'}>{t['portfolio']}</Link></span>
                <div className='w-full flex justify-center items-center'>
                    <div className="stat flex justify-start items-center flex-wrap gap-5 mt-4 max-485:justify-center">
                        {
                            stat.map((item,index)=>{
                                return (
                                    <div key={index} className='flex justify-start items-start gap-2'>
                                        <Icon name={item.icon+' mt-5'} size='3em' color='var(--color-primary)'/>
                                        <div className='flex flex-col gap-1'>
                                            <em className='not-italic text-[4em] relative before:w-full before:h-[3px] before:bg-thirty before:absolute before:left-[5px] before:bottom-0 w-fit'>{item.nb}</em>
                                            <span className='ml-1 mt-1'>{item.title}</span>
                                        </div>
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

export default About