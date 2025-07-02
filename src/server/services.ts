"use server"

import { cookies, headers } from "next/headers";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import firebase from "@/utils/firebase";
import { getDocs, collection, query, where, doc, setDoc, addDoc, orderBy, limit, getDoc, deleteDoc } from "firebase/firestore";

interface Services {
    serviceId?:string;
    clientId:string;
    name:string;
    serviceType: "service"|"maintenance"|"service_and_maintenance";
    contractStatus: 'signed' | 'unsigned' | 'pending';
}

interface Client {
    id?: string;
    name:string;
    taxId?:string;
    email?:string;
    services?:Services[];
    modifDate: string;
    clientNumber:number;
    invoiceCount?:number;
    clientLang:string;
    status:"actived"|"desactived"
}

interface UserSalesSchema {
    juridiction:string;
    totalSales:number;
    taxThreshold:number;
    taxRequired:boolean;
    lastUpdated:string;
}

const baseUrl = process.env.NEXT_PUBLIC_ROOT_LINK || 'http://localhost:3000';

async function getIp() {
  // L’IP est généralement dans les headers "x-forwarded-for"
  const headersList = headers();
  const forwarded = (await headersList).get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : null;

  return ip;

  // Traiter la requête avec l'IP...
}

async function userAuth(email:string,password:string){
  console.log("email",email)
  console.log("password",password)
  try {
    const credential = await signInWithEmailAndPassword(firebase.auth, email, password);
    const uid = credential.user.uid;

    const oneDayInSeconds = 24 * 60 * 60;
    const isDev = process.env.NODE_ENV === 'development';

    (await cookies()).set({
      name: "userAuth",
      value: uid,
      httpOnly: true,
      secure: isDev ? false : true,
      sameSite: 'strict',
      path: '/',
      maxAge: oneDayInSeconds
    });
    console.log("credential",credential)
    return { success: true, message: "" };
  } catch (error:any) {
    console.error("Erreur d'authentification :", error);
    let errorMessage = "Une erreur inconnue s'est produite lors de l'authentification.";
    if (error.code) {
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = "Aucun utilisateur trouvé avec cet e-mail.";
          break;
        case 'auth/wrong-password':
          errorMessage = "Mot de passe incorrect.";
          break;
        case 'auth/invalid-email':
          errorMessage = "L'adresse e-mail n'est pas valide.";
          break;
        default:
          errorMessage = error.message || errorMessage;
      }
    }
    return { success: false, message: errorMessage };
  }
}

async function userLogout(){
  try {
    await signOut(firebase.auth);
    return true;
  } catch (error) {
    console.log("error",error)
    return false;
  }
}

async function getCookie(name:string){
  try {
    const cookieStore = await cookies()
    const cookieValue = cookieStore.get(name)?.value ?? null;
    console.log("cookieValue",cookieValue)
    if (cookieValue) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.log("error",error)
    return false;
  }
}

async function getClientList(){
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
              clientLang: data.clientLang,
              email: data.email,
              clientNumber: data.clientNumber,
              taxId: data.taxId,
              invoiceCount: data.invoiceCount,
              status:data.status,
              services: clientService
          });
      }
      return clientsData
  } catch (error) {
      console.error("Erreur de chargement des clients:", error);
      return null
  }
}



const deleteClient = async (updateClient:any,id:string)=>{
  const docClient = doc(firebase.db,"clients",id)
  try {
    await setDoc(docClient,{ ...updateClient }, { merge: false })
    return true
  } catch (error) {
    console.error(error)
    return false;
  }
}

const addClient = async(clientData:Client) =>{
  try {
    const docRef = await addDoc(collection(firebase.db, "clients"), clientData);
    return docRef.id;
  } catch (e) {
    console.error("Error adding document: ", e);
    return null
  }
}

const updateClient = async(clientData:any,clientId:string)=>{
  try {
    const docClient = doc(firebase.db,"clients",clientId)
    setDoc(docClient,{ ...clientData }, { merge: false })
    return true;
  } catch (error) {
    console.error(error)
    return false;
  }
}


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

const savePreFillContract = async (parsedService:any,clientServiceId:string)=>{
  try {
    const docService = doc(firebase.db,"services",clientServiceId)
    await setDoc(docService, { ...parsedService }, { merge: false })
    return true
  } catch (error) {
    console.error(error)
    return false;
  }
}

const getClientAndService = async (clientId:string,serviceId:string)=>{
  try {
    const docClientRef = doc(firebase.db, "clients", clientId);
    const docServiceRef = doc(firebase.db, 'services', serviceId);
    const allRequest = [
      await getDoc(docClientRef),
      await getDoc(docServiceRef)
    ]
    
    const [clientSnap,serviceSnap] = await Promise.all(allRequest)

    if (clientSnap.exists() && serviceSnap.exists()) {
        const client = { id: clientSnap.id, ...clientSnap.data() } as Client;
        const service = { clientId: serviceSnap.data().clientId,name: serviceSnap.data().name, serviceType: serviceSnap.data().serviceType,contractStatus: serviceSnap.data().contractStatus,contract:serviceSnap.data().contract ?? null } as Services;
        return { client, service };
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error getting document:", error);
    return null;
  }
}

const checkClientTaxability = async(juridiction:string)=>{
  //by CH juridiction check the CA (chiffre d'affaire)
  try {
    const postsQuery = query(collection(firebase.db, 'saleTax'), where('clientId', '==', juridiction));
    const postsSnapshot = await getDocs(postsQuery);
    if (!postsSnapshot.empty) {
      const response:UserSalesSchema = postsSnapshot.docs[0].data() as UserSalesSchema;
      return response.taxRequired;
    }else {
      return false;
    }
  } catch (error) {
    console.error(error);
    return false;
  }
}

const getClientWithService = async (clientId:string)=>{
  try {
    const docClientRef = doc(firebase.db, "clients",clientId);            
    const clientSnap = await getDoc(docClientRef)
    if (clientSnap.exists()) {
      const clientService:Services[] = await loadClientService(clientSnap.id);
      return {client:clientSnap.data() as Client,service:clientService}
    } else {
      return null
    }
  } catch (error) {
    console.error("Error getting document:", error);
    return null
  }
}

const fetchWebConfig = async () => {
  try {
    const querySnapshot = await getDocs(collection(firebase.db, 'webconfig'));
    const webconfigData: {id:string,type:string,date:string}[] = [];
    for (const doc of querySnapshot.docs) {
      webconfigData.push({id:doc.id,type:doc.data().type,date:doc.data().date});
    }
    return webconfigData
  } catch (error) {
    console.error("Erreur de chargement des clients:", error);
    return null
  }
};

const deleteService = async (serviceId:string)=>{
  try {
    await deleteDoc(doc(firebase.db, 'services', serviceId));
    return true
  } catch (error) {
    console.error(error)
    return false;
  }
}

const saveWebConfig = async(type:string,config:any,id:string)=>{
  try {
    if (type === 'add') {
      await addDoc(collection(firebase.db, "webconfig"), config);
    } else {
      const docRef = doc(firebase.db,"webconfig",id)
      await setDoc(docRef, { ...config }, { merge: false })
    }
    return true
  } catch (error) {
    console.error("Erreur de chargement des clients:", error);
    return false
  }
}

const getLastClient = async()=>{
  const collectionRef = collection(firebase.db, "clients");
  const q = query(
    collectionRef,
    orderBy("modifDate", "desc"), // Champ de date/timestamp
    limit(1)
  );

  try {
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const latestDoc = querySnapshot.docs[0];
      console.log("Dernier document:", latestDoc.data());
      return latestDoc.data() as Client
    } else {
      console.log("Aucun document trouvé");
      return null;
    }
  } catch (error) {
    console.error("Erreur lors de la récupération du dernier document:", error);
    return null;
  }
}

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

export {getIp,userAuth,getCookie,userLogout,getClientList,deleteClient,addClient,addService,getLastClient,savePreFillContract,getClientAndService,checkClientTaxability,fetchWebConfig,updateClient,deleteService,getClientWithService,saveWebConfig};