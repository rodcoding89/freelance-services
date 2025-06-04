"use server"
import { setDoc,doc } from 'firebase/firestore';
import firebase from '@/utils/firebase';

import { drive_v3, google } from "googleapis";

import mime from 'mime';
import { Readable } from 'stream';

import { GoogleAuth } from './google-auth';


const SCOPE = process.env.NEXT_PUBLIC_GOOGLE_DRIVE_SCOPE;

const CONTRACT_FOLDER = process.env.NEXT_PUBLIC_FOLDER_CONTRACT_ID
const INVOICE_FOLDER = process.env.NEXT_PUBLIC_FOLDER_INVOICE_ID

const saveClientInvoice = async(data:{service:any,blobInvoice:Blob},client:any,serviceId:string)=>{
  const auth = await GoogleAuth()
  if(!INVOICE_FOLDER || !SCOPE || !auth) return
  const drive = google.drive({ version: 'v3', auth });
  const clientFolderId = await getOrCreateFolder(`${client.name}_${client.id}`,INVOICE_FOLDER,drive)
  if(!clientFolderId) return
  const filename = `${client.name.replaceAll(" ","-")}.${new Date().getFullYear()}.${new Date().getMonth() + 1}.${new Date().getDate()}-${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()}`
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

const saveContractDoc = async(data:{service:any,blobPdf:Blob},client:any,filename:string,serviceId:string)=>{
  const auth = await GoogleAuth()
  if(!CONTRACT_FOLDER || !SCOPE || !auth) return

  const drive = google.drive({ version: 'v3', auth });
  const clientFolderId = await getOrCreateFolder(`${client.name}_${client.id}`,CONTRACT_FOLDER,drive)
  console.log("clientFolderId",clientFolderId)
  if(!clientFolderId) return

  const mimeType = mime.getType(filename) || 'application/octet-stream';
  const arrayBuffer = await data.blobPdf.arrayBuffer();
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

const updateClientWithData = async(clientServiceId:string,services:any,client:any)=>{
    //console.log("services",services,"client",client)
  try{
    const docService = doc(firebase.db,"services",clientServiceId)
    const docClient = doc(firebase.db,"clients",client.id)
    const allRequest = [
      setDoc(docClient,{ ...client }, { merge: false }),
      setDoc(docService, { ...services }, { merge: false }),
    ]
    await Promise.all(allRequest)
    return true
  }catch(error:any){
    console.log("error",error)
    return false;
  }
}

export {saveContractDoc,saveClientInvoice}