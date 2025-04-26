"use client"
import { collection, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import firebase from '@/utils/firebase'; // Importez votre configuration Firebase
import { signOut } from "firebase/auth";
import Cookies from 'js-cookie';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Client {
  id: string;
  name: string;
  contractType: "service"|"maintenance";
  contractStatus: 'signed' | 'unsigned' | 'pending';
  lastContact: Date;
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
            const clientsData = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            lastContact: doc.data().lastContact?.toDate()
            })) as Client[];
            setClients(clientsData);
        } catch (error) {
            console.error("Erreur de chargement des clients:", error);
        } finally {
            setLoading(false);
        }
        };

        fetchClients();
    }, []);

    // Supprimer un client
    const handleDelete = async (id: string) => {
        if (confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) {
        try {
            await deleteDoc(doc(firebase.db, 'clients', id));
            setClients(clients.filter(client => client.id !== id));
        } catch (error) {
            console.error("Erreur de suppression:", error);
        }
        }
    };

    // Ouvrir le formulaire d'édition
    const openEditForm = (client: Client) => {
        router.push('/'+locale+'/contract/'+client.id)
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
    const logout = async () => {
        try {
            await signOut(firebase.auth);
            Cookies.remove('logged');
            router.push('/'+locale+'/login');
        } catch (error) {
            console.error("Erreur de déconnexion:", error);
        }
    };
    if(!Cookies.get('logged')){
        router.push('/'+locale+'/login')
    }
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
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut du contrat</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dernier contact</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {clients.map(client => (
                            <tr key={client.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="font-medium text-gray-900">{client.name}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(client.contractStatus)}`}>
                                <i className={`${getStatusIcon(client.contractStatus)} mr-1`}></i>
                                {getStatusText(client.contractStatus)}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {client.lastContact?.toLocaleDateString() || 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <button
                                onClick={() => openEditForm(client)}
                                className="text-blue-600 hover:text-blue-900 mr-4"
                                title="Modifier"
                                >
                                <i className="bx bx-edit"></i>
                                </button>
                                <button
                                onClick={() => handleDelete(client.id)}
                                className="text-red-600 hover:text-red-900"
                                title="Supprimer"
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
                    <Link className='text-primary py-2 px-4 bg-[#ccc] rounded-[.2em]' href={'/'+locale+'/create-client'}>Créer un client</Link>
                    <span className='text-white py-2 px-4 bg-blue-600 hover:bg-blue-900 rounded-[.2em] cursor-pointer' onClick={logout}>Déconnexion</span>
                </div>
            </div>
        </div>
    );
};

export default ClientsList;