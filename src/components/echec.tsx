import { useTranslationContext } from '@/hooks/app-hook';
import Link from 'next/link';
import React from 'react';

interface EchecProps {
  locale: string;
  onEmit: (data:string) => void;
}

const Echec: React.FC<EchecProps> = ({locale,onEmit}) => {
  const t:any = useTranslationContext();
  return (
    <div className="flex items-center justify-center min-h-[23rem] w-full bg-gray-100 px-8 py-4">
      <div className="text-center py-[1rem] px-[.65rem] bg-white rounded shadow-md">
        <h1 className="text-4xl font-bold text-red-600 mb-4">{t.contractEchec.title}</h1>
        <p className="text-lg text-gray-700 mb-6">
          {t.contractEchec.para}
        </p>
        <div className='flex justify-center gap-4 flex-wrap'>
          <Link href="mailto:support@rodcoding.com" className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-300 min-w-[14rem]">{t.contractEchec.supportClient}</Link>
          <span className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-300 cursor-pointer min-w-[14rem]" onClick={()=>onEmit('reset')}>{t.contractEchec.retry}</span>
        </div>
      </div>
    </div>
  );
};

export default Echec;
