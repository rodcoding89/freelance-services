import Link from 'next/link';
import React from 'react';

interface EchecProps {
  locale: string;
  onEmit: (data:string) => void;
}

const Echec: React.FC<EchecProps> = ({locale,onEmit}) => {
  return (
    <div className="flex items-center justify-center min-h-[23rem] w-full bg-gray-100 px-8 py-4">
      <div className="text-center p-8 bg-white rounded shadow-md">
        <h1 className="text-4xl font-bold text-red-600 mb-4">Échec sur la génération du contrat</h1>
        <p className="text-lg text-gray-700 mb-6">
          Un problème s'est produit lors de la génération du contrat. Nous ne pouvons pas determiner avec précision l'origine de l'erreur, nous vous recommandons de contacter le service client.
        </p>
        <div className='flex justify-center gap-4'>
            <Link className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-300" href={`/${locale}`}>Contacter le service client</Link>
            <span className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-300 cursor-pointer" onClick={()=>onEmit('reset')}>Réesayer</span>
        </div>
      </div>
    </div>
  );
};

export default Echec;
