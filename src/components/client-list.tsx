"use client"
import { collection, getDocs, deleteDoc, doc, updateDoc, query, where } from 'firebase/firestore';
import firebase from '@/utils/firebase'; // Importez votre configuration Firebase
import { signOut } from "firebase/auth";
import Cookies from 'js-cookie';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Icon from './Icon';


interface Services {
    serviceId:string;
    clientId:string;
    name:string;
    serviceType: "service"|"maintenance"|"service_and_maintenance";
    contractStatus: 'signed' | 'unsigned' | 'pending';
}

interface Client {
    id: string;
    name:string;
    email?:string;
    services:Services[];
    modifDate: string;
    clientNumber:number;
    invoiceCount?:number;
}
interface CLientsListProps {
    locale:string
}


const ClientsList: React.FC<CLientsListProps> = ({locale}) => {
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    // Charger les clients depuis Firestore
    useEffect(() => {
        const fetchClients = async () => {
            try {
                const querySnapshot = await getDocs(collection(firebase.db, 'clients'));
                const clientsData: Client[] = [];
                for (const doc of querySnapshot.docs) {
                    const clientService:Services[] = await loadClientService(doc.id);
                    const data = doc.data();
                    clientsData.push({
                        id: doc.id,
                        modifDate: data.modifDate,
                        name: data.name,
                        clientNumber: data.clientNumber,
                        invoiceCount: data.invoiceCount,
                        services: clientService
                    });
                }
                console.log("clientsData",clientsData)
                setClients(clientsData);
            } catch (error) {
                console.error("Erreur de chargement des clients:", error);
            } finally {
                setLoading(false);
            }
        };

        const loadClientService = async (clientId:string) => {
            const postsQuery = query(collection(firebase.db, 'services'), where('clientId', '==', clientId));
            const postsSnapshot = await getDocs(postsQuery);
            const postsData:Services[] = postsSnapshot.docs.map(doc => {
                const data = doc.data();
                return { serviceId: doc.id, clientId: data.clientId,
                name: data.name,
                serviceType: data.serviceType,
                contractStatus: data.contractStatus }
            });
            return postsData;
        }

        fetchClients();
    }, []);

    // Supprimer un client
    const handleDeleteClient = async (id: string) => {
        if (confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) {
            try {
                await deleteAllPostsByUser(id);
                await deleteDoc(doc(firebase.db, 'clients', id));
                setClients(clients.filter(client => client.id !== id));
            } catch (error) {
                console.error("Erreur de suppression:", error);
            }
        }
    };

    const deleteAllPostsByUser = async (clientId:string) => {
        try {
            // 1. Trouver tous les posts de l'utilisateur
            const serviceQuery = query(collection(firebase.db, 'services'), where('clientId', '==', clientId));
            const querySnapshot = await getDocs(serviceQuery);
            
            // 2. Supprimer chaque post trouvé
            const deletePromises = querySnapshot.docs.map(async (document) => {
                await deleteDoc(doc(firebase.db, 'services', document.id));
            });
            
            await Promise.all(deletePromises);
            console.log(`Tous les posts de l'utilisateur ${clientId} ont été supprimés`);
            return true;
        } catch (error) {
            console.error("Erreur lors de la suppression des posts: ", error);
            return false;
        }
    };

    // Obtenir la classe CSS en fonction du statut
    const getStatusClass = (status: string) => {
        switch (status) {
        case 'signed': return 'bg-green-100 text-green-800';
        case 'pending': return 'bg-yellow-100 text-yellow-800';
        case 'unsigned': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
        }
    };

    // Obtenir l'icône en fonction du statut
    const getStatusIcon = (status: string) => {
        switch (status) {
        case 'signed': return 'bx bx-check-circle';
        case 'pending': return 'bx bx-time';
        case 'unsigned': return 'bx bx-error-circle';
        default: return 'bx bx-question-mark';
        }
    };

    // Obtenir le texte du statut
    const getStatusText = (status: string) => {
        switch (status) {
        case 'signed': return 'Contrat signé';
        case 'pending': return 'En cours de signature';
        case 'unsigned': return 'Contrat non signé';
        default: return 'Statut inconnu';
        }
    };

    const parseDate = (date: string) => {
        if (!date) return 'N/A';
        return date;
    }

    const logout = async () => {
        try {
            await signOut(firebase.auth);
            Cookies.remove('logged');
            router.push('/'+locale+'/login');
        } catch (error) {
            console.error("Erreur de déconnexion:", error);
        }
    };
    useEffect(()=>{
        if(!Cookies.get('logged')){
            router.push('/'+locale+'/login')
        }
    },[locale])
    if (loading) return <div className="text-center py-8 mt-[110px] h-[200px] flex justify-center items-center w-[85%] mx-auto">Chargement...</div>;

    return (
        <div className="container px-4 py-8 mt-[110px] w-[85%] mx-auto">
            <h1 className="text-2xl font-bold mb-6">Gestion des Clients</h1>
        
            {/* Liste des clients */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dernier contact</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prestation</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {clients.map(client => (
                            <tr key={client.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="font-medium text-gray-900">{client.name}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {parseDate(client.modifDate) || 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <ul className='m-0 p-0 flex flex-col gap-2 w-full'>
                                    {client.services.map(service => (<li className='flex justify-start items-start gap-2 flex-col border-solid border-b-[1px] border-gray-200 py-2 w-full' key={service.serviceId}>
                                        <div className='flex justify-start items-start gap-1'><span className={`px-2 inline-flex text-[0.625rem] leading-5 font-semibold rounded-full ${getStatusClass(service.contractStatus)}`}>
                                        <i className={`${getStatusIcon(service.contractStatus)} mr-1`}></i>
                                        {getStatusText(service.contractStatus)}
                                        </span>
                                        </div>
                                        <div className='w-full flex justify-start items-center gap-2'>
                                            <span className='flex-1 whitespace-pre-wrap capitalize'>{service.name.replaceAll('_',' ')}</span>
                                            <div className=' flex justify-start items-start gap-2 w-max flex-wrap'>
                                                <a title="Remplir le formulaire de création de contrat" href={`/${locale}/create-contract/${client.id}/${service.serviceId}`} className="text-blue-600 hover:text-blue-900 "><Icon name="bx bx-edit" size="1rem"/></a>
                                                <a title="Générer une facture" href={`/${locale}/bill/${client.id}/${service.serviceId}`} className="text-blue-600 hover:text-blue-900 "><Icon name="bx bx-receipt" size="1rem"/></a>
                                            </div>
                                        </div>
                                    </li>))}
                                </ul>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex justify-start items-center gap-2">
                                <a title="Modifier le client" href={`/${locale}/upate-client/${client.id}`} className="text-blue-600 hover:text-blue-900 mr-4"><Icon name="bx bx-edit" size="1rem"/></a>
                                <button
                                onClick={() => handleDeleteClient(client.id)}
                                className="text-red-600 hover:text-red-900"
                                title="Supprimer ce client"
                                >
                                <i className="bx bx-trash"></i>
                                </button>
                            </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <div className='w-full flex items-end justify-end mt-5'>
                <div className='flex justify-start items-center gap-3 w-full'>
                    <Link className='text-primary py-2 px-4 bg-[#ccc] rounded-[.2em]' href={'/'+locale+'/web-config'}>Configurer le site</Link>
                    <Link className='text-primary py-2 px-4 bg-[#ccc] rounded-[.2em]' href={'/'+locale+'/create-client'}>Créer un client</Link>
                    <span className='text-white py-2 px-4 bg-blue-600 hover:bg-blue-900 rounded-[.2em] cursor-pointer' onClick={logout}>Déconnexion</span>
                </div>
            </div>
        </div>
    );
};

export default ClientsList;