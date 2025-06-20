"use server"
import { setDoc,doc, query, collection, where, getDocs, addDoc } from 'firebase/firestore';
import firebase from '@/utils/firebase';

import { drive_v3, google } from "googleapis";

import mime from 'mime';
import { Readable } from 'stream';

import { GoogleAuth } from './google-auth';
import { getIp } from './services';
import { use } from 'react';

interface UserSalesSchema {
  juridiction:string;
  totalSales:number;
  taxThreshold:number;
  taxRequired:boolean;
  lastUpdated:string;
}

const SCOPE = process.env.NEXT_PUBLIC_GOOGLE_DRIVE_SCOPE;

const CONTRACT_FOLDER = process.env.NEXT_PUBLIC_FOLDER_CONTRACT_ID
const INVOICE_FOLDER = process.env.NEXT_PUBLIC_FOLDER_INVOICE_ID

const saveClientInvoice = async(data:{service:any,blobInvoice:Blob},client:any,serviceId:string,userTax:{saleTax:{amount:number,taxThreshold:number|undefined},stateIsoCode:string|undefined}|null)=>{
  const auth = await GoogleAuth()
  if(!INVOICE_FOLDER || !SCOPE || !auth) return
  const drive = google.drive({ version: 'v3', auth });
  const clientFolderId = await getOrCreateFolder(`${client.name}_${client.id}`,INVOICE_FOLDER,drive)
  if(!clientFolderId) return
  const filename = `${client.name.replaceAll(" ","-")}.${new Date().getFullYear()}.${new Date().getMonth() + 1}.${new Date().getDate()}-${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()}_invoice`
  const mimeType = mime.getType(filename) || 'application/octet-stream';
  const arrayBuffer = await data.blobInvoice.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const bufferStream = Readable.from(buffer);
  const response = await drive.files.create({
    requestBody: {
      name: filename,
      parents: [`${clientFolderId}`], // ID du dossier partagé avec le compte de service
      },
      media: {
      mimeType,
      body: bufferStream,
    },
  });
  if (response.status === 200) {
    const result = await updateClientWithData(serviceId,data.service,client)
    if (userTax) {
      await addUpdateSales(userTax.stateIsoCode,userTax.saleTax)
    }
    
    console.log('File uploaded:', result);
    if (result) {
      return 'success'
    } else {
      return "error"
    }
  } else {
    return "error"
  }
}

const saveContractDoc = async(data:{service:any,translatedOrOriginalBlobPdf:Blob,originalByDiffNotEnLangBlobPdf:Blob|null},client:any,serviceId:string,locale:string)=>{
  const auth = await GoogleAuth()
  if(!CONTRACT_FOLDER || !SCOPE || !auth) return
  const filenameTranslatedOrOriginal = `${locale !== 'en' ? 'translated-' : 'original-'}signed-contract_${new Date().getFullYear()}-${new Date().getMonth() + 1}-${new Date().getDate()}-${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()}_${client.name.replaceAll(" ","-")}`;
  const filenameNotEnContract = `original-signed-contract_${new Date().getFullYear()}-${new Date().getMonth() + 1}-${new Date().getDate()}-${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()}_${client.name.replaceAll(" ","-")}`;
  const drive = google.drive({ version: 'v3', auth });
  const clientFolderId = await getOrCreateFolder(`${client.name}_${client.id}`,CONTRACT_FOLDER,drive)
  console.log("clientFolderId",clientFolderId)
  if(!clientFolderId) return

  const mimeTypeTranslatedOrOriginal = mime.getType(filenameTranslatedOrOriginal) || 'application/octet-stream';
  const mimeTypeNotEnContract = mime.getType(filenameTranslatedOrOriginal) || 'application/octet-stream';
  const arrayBuffer = await data.translatedOrOriginalBlobPdf.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const bufferStream = Readable.from(buffer);

  const arrayBufferNotEnCOntract = data.originalByDiffNotEnLangBlobPdf ? await data.originalByDiffNotEnLangBlobPdf.arrayBuffer() : null;
  const bufferNotEnContract = arrayBufferNotEnCOntract ? Buffer.from(arrayBufferNotEnCOntract) : null;
  const bufferStreamNotEnContract = bufferNotEnContract ? Readable.from(bufferNotEnContract) : null;
  const allRequest = bufferStreamNotEnContract ? [loadDocOnDrive(filenameNotEnContract,bufferStreamNotEnContract,drive,mimeTypeNotEnContract,clientFolderId),loadDocOnDrive(filenameTranslatedOrOriginal,bufferStream,drive,mimeTypeTranslatedOrOriginal,clientFolderId)] : [loadDocOnDrive(filenameTranslatedOrOriginal,bufferStream,drive,mimeTypeTranslatedOrOriginal,clientFolderId)]
  const [response] = await Promise.all(allRequest)
  if (response.status === 200) {
    const result = await updateClientWithData(serviceId,data.service,client)
    console.log('File uploaded:', result);
    if (result) {
      return 'success'
    } else {
      return "error"
    }
  } else {
    return "error"
  }
}

async function loadDocOnDrive(filename:string,bufferStream:Readable,drive:drive_v3.Drive,mimeType:string,clientFolderId:string){
  const response = await drive.files.create({
    requestBody: {
      name: filename,
      parents: [`${clientFolderId}`], // ID du dossier partagé avec le compte de service
      },
      media: {
      mimeType,
      body: bufferStream,
    },
  });
  return response
}

async function getOrCreateFolder(name: string, parentId: string,drive:drive_v3.Drive): Promise<string> {
  // Cherche un dossier avec ce nom dans le dossier parent
  const res = await drive.files.list({
    q: `'${parentId}' in parents and name='${name}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
    fields: 'files(id, name)',
  });

  if (res.data.files && res.data.files.length > 0) {
    // Dossier trouvé, retourne son ID
    return res.data.files[0].id!;
  } else {
    // Crée le dossier
    const folderMetadata = {
      name,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [parentId],
    };
    const folder = await drive.files.create({
      requestBody: folderMetadata,
      fields: 'id',
    });
    return folder.data.id!;
  }
}

const addUpdateSales = async(stateIsoCode:string|undefined,saleTax:{amount:number,taxThreshold:number|undefined})=>{
  if(!stateIsoCode || !saleTax.taxThreshold) return
  try {
    const postsQuery = query(collection(firebase.db, 'saleTax'), where('clientId', '==', stateIsoCode));
    const postsSnapshot = await getDocs(postsQuery);
    if (!postsSnapshot.empty) {
      const response:UserSalesSchema = postsSnapshot.docs[0].data() as UserSalesSchema;
      const updateTotalSale = response.totalSales + saleTax.amount;
      let taxRequired = false;
      if (response.taxThreshold <= updateTotalSale && !response.taxRequired) {
        taxRequired = true;
      }
      const updateTax = {
        totalSales: updateTotalSale,
        taxRequired: taxRequired,
        lastUpdated: new Date().toISOString(),
      };
      const docRef = doc(firebase.db, 'saleTax', postsSnapshot.docs[0].id);
      await setDoc(docRef, updateTax, { merge: true });
    } else {
      const newTax = {
        juridiction: stateIsoCode,
        totalSales: saleTax.amount,
        taxThreshold:saleTax.taxThreshold,
        taxRequired: false,
        lastUpdated: new Date().toISOString(),
      };
      await addDoc(collection(firebase.db, 'saleTax'), newTax);
    }
  } catch (error) {
    console.error(error);
  }
}

const updateClientWithData = async(clientServiceId:string,services:any,client:any)=>{
  try{
    const contractSignedDate = new Date().toISOString();
    const clientIP = await getIp()
    const updateService = {...services,contract:{...services.contract,contractSignedDate:contractSignedDate,clientIP:clientIP}}
    const docService = doc(firebase.db,"services",clientServiceId)
    const docClient = doc(firebase.db,"clients",client.id)
    console.log("updateService",updateService)
    const allRequest = [
      setDoc(docClient,{ ...client }, { merge: false }),
      setDoc(docService, { ...updateService }, { merge: false }),
    ]
    await Promise.all(allRequest)
    return true
  }catch(error:any){
    console.log("error",error)
    return false;
  }
}

export {saveContractDoc,saveClientInvoice}