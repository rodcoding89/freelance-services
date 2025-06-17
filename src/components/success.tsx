import React, { useEffect, useState } from 'react';
import Icon from './Icon';
import Link from 'next/link';
import { useTranslationContext } from '@/hooks/app-hook';

interface SuccessProps {
  locale: string;
  contractLink: string;
  paymentLink: string;
}

const Success: React.FC<SuccessProps> = ({ locale,contractLink,paymentLink }) => {
    const t:any = useTranslationContext();
    return (
        <div className="flex items-center justify-center min-h-[23rem] w-full bg-gray-100 px-8 py-4 success">
            <div className="flex items-center justify-center py-[1rem] px-[1rem] bg-white border border-green-700 text-primary rounded-md flex-col mt-5 mb-4">
                <h3 className='text-4xl text-green-700 mb-4 text-center'>{t.contractSuccess.title}</h3>
                <div className='flex flex-col items-center gap-4 mb-4'>
                    <Icon name="bx-check-circle" size='2rem' color='darkgreen'/>
                    <p>{t.contractSuccess.para}</p>
                    <p>{t.contractSuccess.para1}</p>
                </div>
                <div className='mb-3'>
                    <h3 className='text-2xl mb-[1.75rem] text-center'>{t.contractSuccess.titleDownload}</h3>
                    <div className='flex justify-center items-center gap-4 flex-wrap'>
                        <Link className='bg-green-700 text-white p-4 rounded-[.2rem] font-medium flex justify-start items-center gap-2 min-w-[14rem]' href={contractLink} target='_blank'><Icon name="bxs-file-pdf" size='1.6rem' color='white'/>{t.contractSuccess.signedContractTranslated}</Link>
                        <Link className='bg-green-700 text-white p-4 rounded-[.2rem] font-medium flex justify-start items-center gap-2 min-w-[14rem]' href={contractLink} target='_blank'><Icon name="bxs-file-pdf" size='1.6rem' color='white'/>{t.contractSuccess.signedContract}</Link>
                        <Link className='bg-green-700 text-white p-4 rounded-[.2rem] font-medium flex justify-start items-center gap-2 min-w-[14rem]' href={paymentLink} target='_blank'><Icon name="bxs-file-pdf" size='1.6rem' color='white'/>{t.contractSuccess.paymentMethode}</Link>
                    </div>
                </div>
            </div>
        </div>
        
    );
};

export default Success;
