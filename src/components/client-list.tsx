"use client"

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Icon from './Icon';
import { getCookie, userLogout } from '@/server/services';
import { Client } from '@/interfaces';
import { parseDate } from '@/utils/fonction';

interface CLientsListProps {
    locale:string,
}

const ClientsList: React.FC<CLientsListProps> = ({locale}) => {
    const [clients, setClients] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [loader, setLoader] = useState(false);
    const router = useRouter();
    // Charger les clients depuis Firestore
    useEffect(() => {
        const handleClient = async()=>{
            const clientDataSession = sessionStorage.getItem("clientData")
            if (clientDataSession) {
                const clientData = JSON.parse(clientDataSession);
                setClients(clientData);
                setLoading(false);
            } else {
                const response = await fetch('/api/get-clients-list/',{
                    method: 'GET', // Garde votre méthode GET pour l'exemple
                    headers: {
                    'Content-Type': 'application/json',
                    }
                })
                if (!response.ok) {
                    alert(response.statusText)
                    throw new Error('Erreur lors de la requête');
                }
                const data = await response.json();
                const clientData:any[] = data.result
                const parsedClient = clientData.map((item)=>{
                    return {...item,services:JSON.parse(item.services)}
                })
                if (parsedClient) {
                    setClients(parsedClient);
                    sessionStorage.setItem("clientData",JSON.stringify(parsedClient))
                    setLoading(false);
                } else {
                    alert("Erreur lors du chargement des clients")
                    setLoading(false);
                }
            }
        }
        handleClient()
    }, []);

    // Supprimer un client
    const handleDeleteClient = async (id: string) => {
        if (getDeleteConfirmation()) {
            console.log("id",id)
            try {
                const result = await fetch('/api/delete-client/',{
                    method: 'PUT', // Garde votre méthode GET pour l'exemple
                    headers: {
                    'Content-Type': 'application/json',
                    },
                    body:JSON.stringify({status:"desactived",clientId:id})
                })
                if (!result.ok) {
                    alert(result.statusText)
                    throw new Error('Erreur lors de la requête');
                }
                const response = await result.json();
                
                if (response.success) {
                    setClients((prev)=>{
                        const clientItemIndex = prev.findIndex((item)=>item.id === id)
                        if (clientItemIndex > -1) {
                            const updateClient:Client = {...prev[clientItemIndex],status:"desactived"}
                            const updateClients = prev.splice(clientItemIndex,1,updateClient)
                            sessionStorage.setItem("clientData",JSON.stringify(updateClients))
                            return updateClients
                        }
                        return prev
                    })
                } else {
                    alert("Erreur lors de l'operation")
                }   
            } catch (error) {
                console.error("Erreur lors de la suppression du client:", error);
            }
        }else{
            console.log("id not confirm")
        }
    };

    const getDeleteConfirmation = ()=>{
        if (confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) {
            return true
        }
        return false
    }

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
        setLoader(true);
        try {
            const response = await fetch('/api/logout/',{
                method: 'GET', // Garde votre méthode GET pour l'exemple
                headers: {
                    'Content-Type': 'application/json',
                },
            })
            if (!response.ok) {
                throw new Error('Erreur lors de la requête');
            }
            const data = await response.json();
            if (data.response) {
                router.push('/'+locale+'/login');
            }
        } catch (error) {
            setLoader(false);
            console.error("Erreur de déconnexion:", error);
        }
    };
    useEffect(()=>{
        const checkCookie = async ()=>{
            const cookie = await getCookie('userAuth')
            if(!cookie){
                router.push('/'+locale+'/login')
            }
        }
        checkCookie()
    },[locale])
    if (loading) return <div className="text-center py-8 mt-[6.875rem] h-[12.5rem] flex justify-center items-center w-[85%] mx-auto">Chargement...</div>;
    if(!clients.length) return

    return (
        <div className="container px-4 py-8 mt-[6.875rem] w-[85%] mx-auto">
            <h1 className="text-2xl font-bold mb-6">Gestion des Clients</h1>
        
            {/* Liste des clients */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dernier Modification</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prestation</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut Client</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {clients.map((client,index) => (
                            <tr key={`${client.clientId}-${index}`}>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="font-medium text-gray-900">{client.lname+" "+client.fname}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {parseDate(new Date(client.modifDate),locale) || 'N/A'}
                            </td>
                            <td className={`px-6 py-4 whitespace-nowrap text-sm text-gray-500 ${client.clientStatus === 'actived' ? '' : 'pointer-events-none opacity-50'}`}>
                                <ul className='m-0 p-0 flex flex-col gap-2 w-full'>
                                    {client.services?.map((service:any,i:number) => (<li key={`${client.clientId}-${service.serviceId}-${i}`} className='flex justify-start items-start gap-2 flex-col border-solid border-b-[ 0.0625rem] border-gray-200 py-2 w-full'>
                                        <div className='flex justify-start items-start gap-1'><span className={`px-2 inline-flex text-[0.625rem] leading-5 font-semibold rounded-full ${getStatusClass(service.contractStatus)}`}>
                                        <i className={`${getStatusIcon(service.contractStatus)} mr-1`}></i>
                                        {getStatusText(service.contractStatus)}
                                        </span>
                                        </div>
                                        <div className='w-full flex justify-start items-center gap-2'>
                                            <span className='flex-1 whitespace-pre-wrap capitalize'>{service.serviceType.replaceAll('_',' ')}</span>
                                            <div className=' flex justify-start items-start gap-2 w-max flex-wrap'>
                                                <a title="Remplir le formulaire de création de contrat" href={`/${client.clientLang}/create-contract/${client.clientId}/${service.serviceId}`} className="text-blue-600 hover:text-blue-900 "><Icon name="bx bx-edit" size="1rem"/></a>
                                                <a title="Générer une facture" href={`/${client.clientLang}/bill/${client.clientId}/${service.serviceId}`} className="text-blue-600 hover:text-blue-900 "><Icon name="bx bx-receipt" size="1rem"/></a>
                                            </div>
                                        </div>
                                    </li>))}
                                </ul>
                            </td>
                            <td className="px-6 py-4">
                                <span className={`${client.clientStatus === 'actived' ? 'bg-green-700 text-fifty' : 'bg-orange-600 text-white'} py-1 px-2 rounded-[.4rem] text-[.75rem]`}>{client.clientStatus}</span>
                            </td>
                            <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium flex justify-start items-center gap-2`}>
                                <a title="Modifier le client" href={`/${client.clientLang}/update-client/${client.clientId}`} className="text-blue-600 hover:text-blue-900 mr-4"><Icon name="bx bx-edit" size="1rem"/></a>
                                <button
                                onClick={() => handleDeleteClient(client.clientId ?? "")}
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
                    <Link className='text-primary py-2 px-4 bg-fifty rounded-[.2em] hover:bg-[#ccc]' href={'/'+locale+'/web-config'}>Configurer le site</Link>
                    <Link className='text-primary py-2 px-4 bg-fifty rounded-[.2em] hover:bg-[#ccc]' href={'/'+locale+'/create-client'}>Créer un client</Link>
                    <span className='text-white py-2 px-4 bg-thirty hover:bg-secondary rounded-[.2em] cursor-pointer flex justify-center items-center gap-2' onClick={logout}>{loader && <Icon name='bx bx-loader-alt bx-spin' size='1em' color='#fff'/>}Déconnexion</span>
                </div>
            </div>
        </div>
    );
};

export default ClientsList;