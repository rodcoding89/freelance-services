"use client"
import { Element } from 'react-scroll';
import Icon from './Icon';
import { useForm } from 'react-hook-form';
import { useContext, useEffect, useState } from 'react';
import CloseButton from './close-btn';
import { useTranslationContext } from '@/hooks/app-hook';
import  {sendEmailContact}  from '../server/services-mail'
import Toast from './toast';
import { AppContext } from '@/app/context/app-context';
interface Email{
    from:string;
    name:string;
    budget?:string;
    subject:string;
    content:string;
}

interface ContactProps{
    locale:string
}

const Contact:React.FC<ContactProps> = ({locale})=>{
    const t:any = useTranslationContext();
    const [loader,setLoader] = useState<boolean>(false)
    const [loaderOperation,setLoaderOperation] = useState<boolean>(false)
    const [isSended,setIsSended] = useState<boolean|null>(null)
    const [number,setNumber] = useState<string|null>(null);
    const {setContextData} = useContext(AppContext)
    const [honeypot,setHoneypot] = useState<string>("")
    const [isOperationValid,setIsOperationValid] = useState<boolean>(false)

    const budget = [
        '----'+t['budget']+'----',
        '0 - 1000',
        '1000 - 2500',
        '2500 - 5000',
        '5000 - 10000',
        '10000 - 20000'
    ]
    const {
        register,
        handleSubmit,
        formState: { errors,isValid },reset,watch
    } = useForm({ mode: 'onChange'});

    const result = watch('result')

    const sendMessage = async(data:any)=>{
        setLoader(true)
        setIsSended(null)
        const emailData:Email = {
            from: data.email,
            name: data.name,
            budget: !data.budget.includes("?----") ? data.budget : '',
            subject: data.subject,
            content: data.message
        }
        try {
            const response = await sendEmailContact(emailData,locale)
            //console.log("response",response)
            if (response === 'success') {
                setContextData({toast:{toastVariant:"success",toastMessage:t["successContact"],showToast:true,time:new Date().getTime()}})
                reset()
                setNumber(null)
                return
            }
            return
        } catch (error) {
            setContextData({toast:{toastVariant:"error",toastMessage:t["errorContact"],showToast:true,time:new Date().getTime()}})
            console.error(error)
        } finally {
            setTimeout(() => {
                setLoader(false)
            }, 100);
        }
        //console.log("data",data)
    }

    const handleResult = async(resultData:string)=>{
        //alert(e.target.value)
        try {
            if (resultData !== '') {
                setLoaderOperation(true)
                const result = await fetch('/api/operation-response/',{
                    method: 'POST', // Garde votre méthode GET pour l'exemple
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body:JSON.stringify({honeypot:honeypot,operation:resultData})
                })

                //console.log("result",result)

                if (!result.ok) {
                    if (result.statusText === "captcha") {
                        setContextData({toast:{toastVariant:"error",toastMessage:locale === "fr" ? "Probléme survenu lors de l'opération" : "Problem detected when operating",showToast:true,time:new Date().getTime()}})
                    }else if(result.statusText === "honeypot"){
                        setContextData({toast:{toastVariant:"error",toastMessage:locale === "fr" ? "Spam détecté" : "Spam detected",showToast:true,time:new Date().getTime()}})  
                    }else if(result.statusText === "captcha_incorrect"){
                        setContextData({toast:{toastVariant:"error",toastMessage:locale === "fr" ? "Operation incorrect" : "incorrect operation",showToast:true,time:new Date().getTime()}})
                    }
                }

                const response = await result.json() as {success?:string,error?:"captcha_incorrect"|"captcha"|"honeypot"};
                
                if (response.success) {
                    setIsOperationValid(true)
                }else{
                    if (result.statusText === "captcha") {
                        setContextData({toast:{toastVariant:"error",toastMessage:locale === "fr" ? "Probléme survenu lors de l'opération" : "Problem detected when operating",showToast:true,time:new Date().getTime()}})
                    }else if(result.statusText === "honeypot"){
                        setContextData({toast:{toastVariant:"error",toastMessage:locale === "fr" ? "Spam détecté" : "Spam detected",showToast:true,time:new Date().getTime()}})  
                    }else if(result.statusText === "captcha_incorrect"){
                        setContextData({toast:{toastVariant:"error",toastMessage:locale === "fr" ? "Operation incorrect" : "incorrect operation",showToast:true,time:new Date().getTime()}})
                    }
                }   
            }
        } catch (error) {
            console.log("Erreur",error)
        } finally{
            setLoaderOperation(false)
        }
    }

    const handleValidity = ()=>{
        return isValid && isOperationValid
    }

    useEffect(()=>{
        const callResult = async()=>{
            await handleResult(result)
        }
        if(result && result !== ""){
            callResult();
        }else{
            setIsOperationValid(false)
        }
    },[result])

    useEffect(()=>{
        const fetchNumOperation = async()=>{
            const result = await fetch(`/api/get-num-operation`,{
                method: 'POST', // Garde votre méthode GET pour l'exemple
                headers: {
                    'Content-Type': 'application/json',
                }
            })
            
            if (!result.ok) {
                setContextData({toast:{toastVariant:"error",toastMessage:"Erreur survenue lors de la requête",showToast:true,time:new Date().getTime()}}) 
            }

            const response = await result.json() as {success:boolean,question:string};
            
            if (response.success) {
                setNumber(`${locale === "fr" ? "Combient font "+response.question : "How make "+response.question}`)
            } else {
                setContextData({toast:{toastVariant:"error",toastMessage:locale === 'fr' ? "Service indisponible pour le moment." : "Service unavailable now.",showToast:true,time:new Date().getTime()}})
            }
        }
        fetchNumOperation()
    },[isSended])
    
    return (
        <Element className="mt-[6.875rem]" name="contact">
            <div className="w-[85%] mx-auto">
                <div className="section-heading  text-center"> 
                    <h1 className='uppercase text-thirty line-break'>{t["contactMe"]}</h1> 
                </div>
                <div className="w-full flex justify-center items-start gap-10 max-792:flex-col">
                    <div className="contact-info w-1/3 max-792:w-full">
                        <div className="contact-info-box">
                            <div className="contact-icon flex justify-center items-center">  <Icon name='bxl-whatsapp' size='1.3em' color='var(--color-primary)'/>  
                            </div>
                            <div className="contact-desc">
                              <h5 className='text-thirty'>{t["whatsapp"]}</h5>
                              <a href="https://wa.me/+33751025598" className='hover:text-secondary'>WhatsApp</a>
                              </div>
                          </div>
                        <div className="contact-info-box">
                            <div className="contact-icon flex justify-center items-center">  <Icon name='bx-phone' size='1.3em' color='var(--color-primary)'/>
                            </div>
                            <div className="contact-desc">
                                <h5 className='text-thirty'>{t["perPhone"]}</h5>
                                <a href="tel:+33751025598" className='hover:text-secondary'>+33 7 45 50 71 95</a>
                            </div>
                        </div>
                        <div className="contact-info-box">
                            <div className="contact-icon flex justify-center items-center"><Icon name='bx-envelope' size='1.3em' color='var(--color-primary)'/>  </div>
                            <div className="contact-desc">
                              <h5 className='text-thirty'>{t["perEmail"]}</h5>
                              <a href="mailto:contact@rodcoding.com" className='hover:text-secondary'>contact@rodcoding.com</a>
                            </div>
                        </div>
                        <div className="contact-info-box">
                            <div className="contact-icon flex justify-center items-center"><Icon name='bx-time' size='1.3em' color='var(--color-primary)'/>  </div>
                            <div className="contact-desc">
                              <h5 className='text-thirty'>{t["time"]}</h5>
                              <ul>
                                <li>{t["week"]}</li>
                                <li>{t["hourTime"]}</li>
                              </ul>
                            </div>
                        </div>
                    </div>
                    <div className="w-2/3 max-792:w-full">
                        <div className="contact-form">
                            <form onSubmit={handleSubmit((data) => sendMessage(data))}>
                                <div className='w-full flex justify-start items-start gap-5 max-485:flex-col max-485:gap-0'>
                                    <div className="w-1/2 max-485:w-full ">
                                        <div className="form-group">
                                            <input className={`form-control focus:outline-[#aaa] ${errors.name ? '!border-red-500 focus:outline-red-500':'focus:outline-[#aaa]'}`}  placeholder={t["yourName"]} type="text" {...register('name', { required: true })} aria-invalid={errors.name ? "true" : "false"}/>
                                            {errors.name?.type === 'required' && <div className='text-[.8em] text-red-500'>{t["errName"]}</div>}
                                        </div>
                                    </div>
                                    
                                    <div className="w-1/2 max-485:w-full">
                                        <div className="form-group">
                                            <input className={`form-control ${errors.email ? '!border-red-500 focus:outline-red-500':'focus:outline-[#aaa]'}`}  placeholder={t["yourEmail"]} type="text" {...register('email', { required: true,pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/i })} aria-invalid={errors.email ? "true" : "false"}/>
                                            {errors.email?.type == "required" && <div className='text-[.8em] text-red-500'>{t["errEmail"]}</div>}
                                            {errors.email?.type === "pattern" && <div className='text-[.8em] text-red-500'>{t["errValidEmail"]}</div>}
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="w-full">
                                    <div className=" form-group">
                                        <input className={`form-control focus:outline-[#aaa] ${errors.subject ? '!border-red-500 focus:outline-red-500':'focus:outline-[#aaa]'}`} placeholder={t["yourSubject"]} type="text" {...register('subject', { required: true })} aria-invalid={errors.subject ? "true" : "false"}/>
                                        {errors.subject?.type === "required" && <div className='text-[.8em] text-red-500'>{t["errSubject"]}</div>}
                                    </div>
                                </div>
                                <div className='w-full'>
                                    <div className="form-group">
                                        <select className='form-control' id="" {...register('budget')}>
                                            {
                                                budget.map((item,index)=>{
                                                    return (
                                                        <option key={index} value={item}>{item}</option>
                                                    )
                                                })
                                            }
                                        </select>
                                    </div>
                                </div>
                                <div className="w-full">
                                    <div className="form-group">
                                        <textarea className={`form-control focus:outline-[#aaa] ${errors.message ? '!border-red-500 focus:outline-red-500':'focus:outline-[#aaa]'}`} rows={18} placeholder={t["yourMessage"]} {...register('message', { required: true })} aria-invalid={errors.message ? "true" : "false"}></textarea>
                                        {errors.message?.type === "required" && <div className='text-[.8em] text-red-500'>{t["errMessage"]}</div>}
                                    </div>
                                </div>
                                <div className='w-full flex justify-between items-center gap-2 flex-wrap'>
                                    <div className='flex justify-start items-center gap-2'>
                                        <span>{number && number}</span>
                                        <input className='flex-1 focus:outline-none border-[1px] w-full min-w-[14rem] px-2 py-1 text-[0.89rem] border-solid border-[#aaa] h-8 rounded-[.4em]' type="text" id="result" {...register('result')} />
                                        {/* Honeypot */}
                                        <input type="text" name="company" tabIndex={-1} autoComplete="off" style={{ display: 'none' }} value={honeypot} onChange={(e)=>setHoneypot(e.target.value)}/>
                                    </div>
                                    <button className={`btn btn-primary text-fifty ${handleValidity() && !loader ? 'cursor-pointer opacity-100' : 'cursor-not-allowed opacity-45'} ${loader || loaderOperation ? 'flex justify-center items-center gap-2' : ''}`} type="submit" disabled={handleValidity() && !loader ? false : true}>{t["sendMessage"]}{loader || loaderOperation && <Icon name='bx bx-loader-alt bx-spin' size='1em' color='#fff'/>}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </Element>
    )
}

export default Contact