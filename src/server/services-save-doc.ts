"use server"
import { number } from 'framer-motion';
import { getIp } from './services';
import { Contract } from '@/interfaces';
import { saveContract, updateClientByContract,updateContractStatus } from './handle-database';
import { cookies } from 'next/headers';
import { generedToken } from './token-auth';
import axios from 'axios';
import FormData from 'form-data';


interface UserSalesSchema {
  juridiction:string;
  totalSales:number;
  taxThreshold:number;
  taxRequired:boolean;
  lastUpdated:string;
}

const SCOPE = process.env.GOOGLE_DRIVE_SCOPE;

const CONTRACT_FOLDER = process.env.FOLDER_CONTRACT_ID
const INVOICE_FOLDER = process.env.FOLDER_INVOICE_ID

const saveClientInvoice = async(data:{service:any,blobInvoice:Blob},client:any,serviceId:string,userTax:{saleTax:{amount:number,taxThreshold:number|undefined},stateIsoCode:string|undefined}|null)=>{
  /*const auth = await GoogleAuth()
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
  }*/
}

const saveContractDoc = async (contractData:{data:{serviceId:number,addressId:number,clientId:number,contractStatus:"signed"|"unsigned"|"pending",contract:Contract},translatedOrOriginalFilePdf:{file:string|null,name:string},originalByDiffNotFrLangFilePdf:{file:string,name:string}},locale:string,contentType:string)=>{
  
  try {
    let accessTocken = await getAccessTocken()

    if (!accessTocken) {
      accessTocken = await generedToken()
    }

    if (!accessTocken) {
      return false
    }

    console.log("accessTocken",accessTocken)
    const MAX_SIZE = 250 * 1024 * 1024;
    
    const contractBuffer = Buffer.from(contractData.originalByDiffNotFrLangFilePdf.file)

    console.log("buffer",contractBuffer.length)
    if(!contractBuffer) {console.log("arraybuffer null",contractBuffer);return false}
    
    if(contractBuffer.length > MAX_SIZE) {console.log("buffer sise greader",contractBuffer.length);return false}

    const docInfo = new FormData();
    docInfo.append("file",contractBuffer,{
      filename:contractData.originalByDiffNotFrLangFilePdf.name,
      contentType:contentType
    })
    docInfo.append("parent_id",process.env.FOLDER_CONTRACT_ID ?? "")
    docInfo.append("override-name-exist","true")

    const driveUrl = `${process.env.ZOHO_VASE_URL_DRIVE}/workdrive/api/v1/upload`

    var config = {
      method: 'post',
      url: 'https://workdrive.zoho.com/api/v1/upload',
      headers: { 
        'Authorization': `Zoho-oauthtoken ${accessTocken}`, 
        ...docInfo.getHeaders()
      },
      data : docInfo
    };


    const response = await axios(config)

    console.log("response",response)

    if (response.status === 200) {
      return true
    }

    /*await saveContract(contractData.data.contract,contractData.data.clientId,contractData.data.addressId,contractData.data.serviceId,1,"update","client",contractData.data.contract.contractId);
    await updateClientByContract(contractData.data.contract.clientGivingData,contractData.data.clientId,contractData.data.addressId);
    await updateContractStatus(contractData.data.serviceId,contractData.data.contractStatus);*/
    return false
  } catch (error) {
    console.log("erreur drive ",error)
    return false
  }
}

/*const saveContractDoc = async(contractData{data:{serviceId:number,clientId:number,contractStatus:"signed",contract:Contract},translatedOrOriginalBlobPdf:Blob,originalByDiffNotFrLangBlobPdf:Blob},locale:string):Promise<"success"|"error">=>{
  /*const auth = await GoogleAuth()
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
  return new Promise(resolve => "success")
}*/

async function loadDocOnDrive(filename:string,/*bufferStream:Readable,drive:drive_v3.Drive,mimeType:string,clientFolderId:string*/){
  /*const response = await drive.files.create({
    requestBody: {
      name: filename,
      parents: [`${clientFolderId}`], // ID du dossier partagé avec le compte de service
      },
      media: {
      mimeType,
      body: bufferStream,
    },
  });
  return response*/
}

async function getOrCreateFolder(name: string, /*parentId: string,drive:drive_v3.Drive*/){
  // Cherche un dossier avec ce nom dans le dossier parent
  /*const res = await drive.files.list({
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
  }*/
}

const addUpdateSales = async(stateIsoCode:string|undefined,saleTax:{amount:number,taxThreshold:number|undefined})=>{
  /*if(!stateIsoCode || !saleTax.taxThreshold) return
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
  }*/
}

const updateClientWithData = async(clientServiceId:string,services:any,client:any)=>{
  /*try{
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
  }*/
}

const getAccessTocken = async()=>{
  const accessTocken = (await cookies()).get("access_token")?.value
  return accessTocken
}

export {saveContractDoc,saveClientInvoice}