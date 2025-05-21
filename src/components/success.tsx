import React, { useEffect, useState } from 'react';
import Icon from './Icon';
import Link from 'next/link';

interface SuccessProps {
  locale: string;
  contractLink: string;
  paymentLink: string;
}

const Success: React.FC<SuccessProps> = ({ locale,contractLink,paymentLink }) => {
    return (
        <div className="flex items-center justify-center min-h-[23rem] w-full bg-gray-100 px-8 py-4">
            <div className="flex items-center justify-center px-8 py-6 bg-white border border-green-700 text-primary rounded-md flex-col mt-5 mb-4">
                <h3 className='text-4xl text-green-700 mb-4 text-center'>Contrat généré avec succès</h3>
                <div className='flex flex-col items-center gap-4 mb-4'>
                    <Icon name="bx-check-circle" size='2rem' color='darkgreen'/>
                    <p>{locale === 'fr' ? 'Le contrat pour la prestation de service à bien été signé. Vous pouvez le télécharger à partir du lien en dessous. Vous devez egalement télécharger le pdf consernant les modalités de paiement en cliquant sur le bouton en dessous.' : locale === 'de' ? '' : ''}</p>
                    <p>{locale === 'fr' ? 'Une copie de ses deux document vous on egalement été envoyé par email.' : locale === 'de' ? '' : ''}</p>
                </div>
                <div className='mb-3'>
                    <h3 className='text-2xl mb-3 text-center'>Télécharger ses documments</h3>
                    <div className='flex justify-center items-center gap-4'>
                        <Link className='bg-green-700 text-white p-4 rounded-[.2rem] font-medium flex justify-start items-center gap-2' href={contractLink} target='_blank'><Icon name="bxs-file-pdf" size='1.6rem' color='white'/>Contrat signé</Link>
                        <Link className='bg-green-700 text-white p-4 rounded-[.2rem] font-medium flex justify-start items-center gap-2' href={paymentLink} target='_blank'><Icon name="bxs-file-pdf" size='1.6rem' color='white'/>Modalité de paiement</Link>
                    </div>
                </div>
            </div>
        </div>
        
    );
};

export default Success;
