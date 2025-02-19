import { Element } from 'react-scroll';
import IsoTopeGrid from "react-isotope";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from 'react';
import { reference } from '../utils/constant';
import Icon from './Icon';

interface ReferenceProps{

}
  
const Reference:React.FC<ReferenceProps> = ()=>{
    const nav = [
        { name: "Tous" ,label:"all"},
        { name: "Site internet",label:"website" },
        { name: "Site E-commerce",label:"ecommerce" },
        { name: "Application mobile",label:"app" },
        { name: "Logiciel metiès / Saas",label:"saas" }
    ];
    const [selectedCategory, setSelectedCategory] = useState<string>("all");
    const [cardsLayout,setCardsLayout] = useState<any[]>([])
    const containerRef = useRef<HTMLDivElement>(null);

    const filteredItems =
    selectedCategory === "all"
      ? cardsLayout
      : cardsLayout.filter((item) => item.category === selectedCategory);

    useEffect(()=>{
      const createCardObjet = ()=>{
        const gridData:any = []
        Object.values(reference).forEach((item)=>{
          item.referenceContent.forEach((val:any)=>{
            const item = {title:val.projet,link:val.img,mode:val.mode,shortText:val.shortText,category:val.cat,name:val.name}
            gridData.push(item)
          })
        })
        
        const newArray = [...gridData]; // Copie du tableau pour éviter de modifier l'original
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1)); // Index aléatoire entre 0 et i
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]]; // Échange des éléments
        }
        return newArray
      }
      const cardsLayout = createCardObjet();
      setCardsLayout(cardsLayout)
    },[])
    console.log("cardsLayout",cardsLayout)
    return (
        <Element className="mt-[75px]" name="reference">
            <div className='bg-secondary h-[400px]'>
                <h1 className='mb-10 mx-[calc(15%/2)] pt-[20px] uppercase text-fifty'>Nos références</h1>
                <p className='mx-[calc(15%/2)] text-fifty'>Lorem ipsum dolor sit amet consectetur adipisicing elit. Quo inventore sunt tenetur. Lorem ipsum dolor sit amet consectetur adipisicing elit. Quo inventore sunt tenetur.</p>
            </div>
            <div className='w-[85%] mx-auto mt-[-160px] min-h-[160px]'>
                <nav className='flex justify-center items-center gap-4 bg-fifty p-2 flex-wrap'>
                    {
                        nav.map((item)=>{
                            return (
                              <div className={`cursor-pointer hover:underline hover:text-secondary ${selectedCategory === item.label ? 'text-secondary' : 'text-primary'}`} key={`${item.label}_key`} onClick={()=>setSelectedCategory(item.label)}>{item.name}</div> 
                            )
                        })
                    }
                </nav>
                <div ref={containerRef} className="flex justify-center items-start gap-4 relative mt-5 w-full flex-wrap">
                  <AnimatePresence>
                    {filteredItems.map((card:any,index:number) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className="w-[350px] group"
                      >
                        <div className='h-[300px] relative overflow-hidden group'>
                          <img className='h-full object-cover cursor-pointer' src={card.link} alt={card.title} />
                          <div className='h-full cursor-pointer w-full bg-[rgba(142,22,22,.5)] absolute top-0 left-0 flex justify-center items-center transition-transform duration-500 ease-in-out translate-y-[350px] group-hover:translate-y-0'><Icon name='bx-show' size='4em' color='#fff'/></div>
                        </div>
                        <div className={`bg-fifty group-hover:bg-secondary py-2`}>
                            <div className='flex justify-between items-center gap-2 mx-4'>
                              <h4 className='text-secondary font-semibold text-[18px] mb-2 text-ellipsis whitespace-nowrap flex-1 uppercase group-hover:text-fifty relative before:w-1/5 before:h-1 before:bg-secondary before:bottom-[-4px] before:left-[1px] before:block before:group-hover:bg-fifty before:absolute'>{card.name}</h4>
                              <span className='text-[11px] text-[#aaa]'>{card.mode}</span>
                            </div>
                            <p className='mx-4 mt-1 text-[13px] text-primary uppercase group-hover:text-fifty'>{card.shortText}</p>
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