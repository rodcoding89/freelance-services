"use client"
import { useState, useContext, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslationContext } from '@/hooks/app-hook';
import { AppContext } from '@/app/context/app-context';
import  firebase  from "@/utils/firebase";
import { collection, addDoc, getDocs,query, orderBy, limit } from "firebase/firestore";
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import Link from 'next/link';

interface CreateClientProps {
    locale:string
}

interface Client {
    id?: string;
    name:string;
    email?:string;
    dateCreation: Date;
    clientNumber:number;
    invoiceCount?:number;
}

interface Services {
    clientId:string;
    name:string;
    serviceType: "service"|"maintenance"|"service_and_maintenance";
    contractStatus: 'signed' | 'unsigned' | 'pending';
}


const CreateClient: React.FC<CreateClientProps> = ({locale}) => {
    const t:any = useTranslationContext();
    const [isPopUp,setIsPopUp] = useState<boolean>(false)
    const {contextData} = useContext(AppContext)
    const [lastClient,setLastClient] = useState<Client|null>(null)
    const router = useRouter();
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    const addService = async(id:string,serviceName:string,serviceType:"service"|"maintenance"|"service_and_maintenance") =>{
        try {
            const service:Services = {
                clientId:id,
                name:serviceName,
                contractStatus:'unsigned',
                serviceType:serviceType
            }
            const docRef = await addDoc(collection(firebase.db, "services"), service);
            return docRef.id;
        } catch (error) {
            console.error("Error adding document: ", error);
        }
    }

    const addClient = async(clientData:Client) =>{
        try {
          const docRef = await addDoc(collection(firebase.db, "clients"), clientData);
          return docRef.id;
        } catch (e) {
          console.error("Error adding document: ", e);
        }
    }

    const onSubmit = async(data: any) => {
        const client:Client = {name:data.clientName,dateCreation:new Date(),clientNumber:lastClient?.clientNumber ? lastClient.clientNumber + 1 : 1000}
        console.log('Client Data:', data);

        const clientId = await addClient(client);
        
        if (clientId) {
            const serviceId = await addService(clientId,data.serviceType,data.serviceType)
            if (serviceId) {
                router.push('/'+locale+'/clients-list')
            }
        }
        console.log("clientId",clientId)
    };
    console.log("main",contextData)
    useEffect(()=>{
        if (contextData && (contextData.state === "hide" || contextData.state === "show")) {
            console.log("inside contextData",contextData)
            setIsPopUp(contextData.value)
        }
    },[contextData])

    useEffect(()=>{
        const getLastClient = async()=>{
            const collectionRef = collection(firebase.db, "clients");
            const q = query(
                collectionRef,
                orderBy("dateCreation", "desc"), // Champ de date/timestamp
                limit(1)
            );
            
            const querySnapshot = await getDocs(q);
            
            if (!querySnapshot.empty) {
                const latestDoc = querySnapshot.docs[0];
                console.log("Dernier document:", latestDoc.data());
                setLastClient(latestDoc.data() as Client)
            } else {
                console.log("Aucun document trouvé");
                return null;
            }
        }
        getLastClient();
    },[])

    if(!Cookies.get('logged')){
        router.push('/'+locale+'/login')
    }
  return (
    <main className={`transition-transform duration-700 delay-300 ease-in-out ${isPopUp ? 'translate-x-[-25vw]' : 'translate-x-0'} w-[85%] mt-[110px] mx-auto`}>
        <h1 className="text-center text-thirty uppercase">Ajouter un nouveau client</h1>
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Création du client</h1>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                <label htmlFor="clientName" className="block text-sm font-medium text-gray-700">
                    Nom complet du client
                </label>
                <input
                    type="text"
                    id="clientName"
                    {...register('clientName', { required: 'Client name is required' })}
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2" placeholder='Nom complet du client'
                />
                {errors.clientName && (
                    <p className="text-red-500 text-sm mt-1">{errors.clientName.message as string}</p>
                )}
                </div>
                <div className='my-3'>
                    <label htmlFor="clientName" className="block text-sm font-medium text-gray-700">
                        Choisir le type de contrat
                    </label>
                    <select id="serviceType" {...register("serviceType", { required: "This field is required" })}
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2">
                        <option value="service">Service</option>
                        <option value="maintenance">Maintenance</option>
                        <option value="service_and_maintenance">Service plus Maintenance</option>
                    </select>
                    {errors.serviceType && (
                        <p className="text-red-500 text-sm mt-1">{errors.serviceType?.message as string}</p>
                    )}
                </div>
                <div className='flex justify-start items-center gap-5'>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
                        Créer le client
                    </button>
                    <Link className='text-primary py-2 px-4 bg-[#ccc] rounded-[.2em]' href={'/'+locale+'/clients-list'}>Liste de clients</Link>
                </div>
            </form>
            </div>
    </main>
  );
};

export default CreateClient;
