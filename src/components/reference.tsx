"use client"
import { Element } from 'react-scroll';
import { motion, AnimatePresence } from "framer-motion";
import { useContext, useEffect, useRef, useState } from 'react';
import Image from 'next/image';

import Icon from './Icon';
import { useTranslationContext } from '@/hooks/app-hook';
import { AppContext } from '@/app/context/app-context';
import { reference } from '@/constants';


interface ReferenceProps{
  locale:string
}
  
const Reference:React.FC<ReferenceProps> = ({locale})=>{
    const t:any = useTranslationContext();
    const nav = [
        { name: t["website"],label:"website" },
        { name: t["ecommerce"],label:"ecommerce" },
        { name: t["mobileApp"],label:"app" },
        { name: t["saas"],label:"saas" }
    ];
    const [selectedCategory, setSelectedCategory] = useState<string>("website");
    const [cardsLayout,setCardsLayout] = useState<any[]>([])
    const containerRef = useRef<HTMLDivElement>(null);
    const {setContextData} = useContext(AppContext)
    const filteredItems =
    cardsLayout.filter((item) => item.category === selectedCategory);
    const showRefContent = (card:any)=>{
      const windowWidth = window.innerWidth;
      const costomeWidth = windowWidth >= 600 ? 'w-[70%]' : windowWidth <= 600 && windowWidth >= 420 ? 'w-[85%]' : 'w-[100%]'
      setContextData({state:"show",value:true,size:costomeWidth,mode:'reference',id:card.refId,cat:card.category})
    }
    useEffect(()=>{
      const createCardObjet = ()=>{
        const gridData:any = []
        Object.values(reference).forEach((item)=>{
          item.referenceContent.forEach((val:any)=>{
            const item = {title:val.projet,link:val.img,mode:val.mode,shortText:val.shortText,category:val.cat,name:val.name,refId:val.refId,projet:val.projet}
            gridData.push(item)
          })
        })
        return gridData
      }
      const cardsLayout = createCardObjet();
      setCardsLayout(cardsLayout)
    },[])
    console.log("cardsLayout",cardsLayout)
    return (
        <Element className="mt-[6.875rem]" name="reference">
            <div className='bg-secondary pb-8'>
                <h1 className='mb-5 mx-[calc(15%/2)] pt-[1.875rem] uppercase text-fifty line-break'>{t["ourReferences"]}</h1>
                <p className='mx-[calc(15%/2)] text-fifty mb-10'>{t["referenceTitle"]}</p>
                <div className='w-[85%] mx-auto'>
                  <nav className='flex justify-center items-center gap-4 bg-white py-2 px-5 flex-wrap w-fit'>
                      {
                          nav.map((item)=>{
                              return (
                                <div className={`cursor-pointer hover:underline hover:text-secondary ${selectedCategory === item.label ? 'text-secondary' : 'text-primary'}`} key={`${item.label}_key`} onClick={()=>setSelectedCategory(item.label)}>{item.name}</div> 
                              )
                          })
                      }
                  </nav>
                </div>
            </div>
            <div className='w-[85%] mx-auto'>
                <div ref={containerRef} className="flex justify-center items-start gap-4 relative mt-5 w-full flex-wrap">
                  <AnimatePresence>
                    {filteredItems.map((card:any,index:number) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.5 }}
                        className="w-[21.875rem] group max-420:w-[17.5rem] max-330:w-[15.625rem] self-stretch" onClick={()=>showRefContent(card)}>
                        <div className='aspect-[12/10] relative overflow-hidden group'>
                          <Image src={card.link} alt={card.title} width={800} height={600} className='h-full object-cover cursor-pointer w-full'/>
                          <div className='h-full cursor-pointer w-full bg-[rgba(142,22,22,.5)] absolute top-0 left-0 flex justify-center items-center transition-transform duration-500 ease-in-out translate-y-[21.875rem] group-hover:translate-y-0'><Icon name='bx-show' size='4em' color='#fff'/></div>
                        </div>
                        <div className={`bg-fifty group-hover:bg-secondary py-2`}>
                            <div className='flex justify-between items-center gap-2 mx-4'>
                              <h4 className='text-secondary font-semibold text-[1.125rem] pb-[0.3125rem] mb-2 text-ellipsis whitespace-nowrap uppercase max-w-[55%] w-full overflow-hidden group-hover:text-fifty relative before:w-1/5 before:h-1 before:bg-secondary before:bottom-[0.25rem] before:left-[0.0625rem] before:block before:group-hover:bg-fifty before:absolute'>{card.projet}</h4>
                              <span className='text-[0.6875rem] text-[#aaa] block'>{t[card.mode]}</span>
                            </div>
                            <p className='uppercase text-[0.875rem] font-medium mx-4 mt-1 text-primary group-hover:text-fifty'>{t[card.name]}</p>
                            <p className='mx-4 mt-1 text-[0.8125rem] text-primary group-hover:text-fifty'>{t[card.shortText]}</p>
                          </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
            </div>
        </Element>
    )
}

export default Reference