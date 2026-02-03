"use server"

import { Contract, invoiceSendData } from '@/interfaces';
import { saveClientInvoice, saveContract, updateClientByContract,updateContractStatus } from './handle-database';
import { cookies } from 'next/headers';
import { generedToken } from './token-auth';
import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs'
import fsp from "fs/promises";
import { DecoderData } from '@/utils/fonction';

import path from 'path';
import { fileURLToPath } from 'url';


interface UserSalesSchema {
  juridiction:string;
  totalSales:number;
  taxThreshold:number;
  taxRequired:boolean;
  lastUpdated:string;
}

const CONTRACT_FOLDER = process.env.MODE ? DecoderData(process.env.FOLDER_CONTRACT_ID ?? "") : process.env.FOLDER_CONTRACT_ID 
const INVOICE_FOLDER = process.env.MODE ? DecoderData(process.env.FOLDER_INVOICE_ID ?? "") : process.env.FOLDER_INVOICE_ID

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadDir = path.join(process.cwd(), 'upload');

//console.log("upload",uploadDir)

const saveContractDoc = async (contractData:{data:{serviceId:number,addressId:number,clientId:number,contractStatus:"signed"|"unsigned"|"pending",contract:Contract},translatedOrOriginalFilePdf:{file:string|null,name:string},originalByDiffNotFrLangFilePdf:{file:string,name:string}},locale:string,contentType:string)=>{
  
  const uploadDocOnDrive = async(accessTocken:string)=>{

    const MAX_SIZE = 250 * 1024 * 1024;

    const base64StringContract = contractData.originalByDiffNotFrLangFilePdf.file
    const base64StringNoFrContract = contractData.translatedOrOriginalFilePdf.file
    
    /*if(!contractFile) {console.log("arraybuffer null",contractFile);return false}
    
    if(contractFile.length > MAX_SIZE) {console.log("buffer sise greader",contractFile.length);return false}*/

    const base64DataContract = base64StringContract.replace(/^data:application\/\w+;base64,/, "");
    let base64DataNoFrContract = null
    let contractNoFrFileName = null
    
    if (base64StringNoFrContract) {
      base64DataNoFrContract = base64StringContract.replace(/^data:application\/\w+;base64,/, "");
      contractNoFrFileName = contractData.translatedOrOriginalFilePdf.name+'.pdf'
    }

    const originalContractName = contractData.originalByDiffNotFrLangFilePdf.name+'.pdf';
    let base64DataNotFrContract = null
  
    if (base64StringNoFrContract) {
     base64DataNotFrContract = base64StringNoFrContract.replace(/^data:application\/\w+;base64,/, "");
    }
    
    try {
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      fs.writeFileSync(`${uploadDir}/${originalContractName}`, base64DataContract, { encoding: 'base64' });
      
      if (base64DataNoFrContract && contractNoFrFileName) {
        fs.writeFileSync(`${uploadDir}/${contractNoFrFileName}`, base64DataNoFrContract, { encoding: 'base64' });
      }

      const docInfo = new FormData();
      const docInfoNoFr = new FormData();

      docInfo.append("content", fs.createReadStream(`${uploadDir}/${originalContractName}`), {
        filename: originalContractName,
        contentType: "application/pdf"
      });

      docInfo.append("filename",originalContractName)
      docInfo.append("parent_id",CONTRACT_FOLDER)
      docInfo.append('override-name-exist', 'true');

      if (base64DataNoFrContract && contractNoFrFileName) {
        docInfoNoFr.append("content", fs.createReadStream(`${uploadDir}/${contractNoFrFileName}`), {
          filename: contractNoFrFileName,
          contentType: "application/pdf"
        });

        docInfoNoFr.append("filename",contractNoFrFileName)
        docInfoNoFr.append("parent_id",CONTRACT_FOLDER)
        docInfoNoFr.append('override-name-exist', 'true');
      }

      const driveUrl = `${process.env.NEXT_PUBLIC_ZOHO_BASE_URL_DRIVE}/workdrive/api/v1/upload`

      const config = {
        method: 'post',
        url: driveUrl,
        headers: { 
          'Authorization': `Bearer ${accessTocken}`, 
          ...docInfo.getHeaders()
        },
        data : docInfo
      };

      let configNoFr = null

      if (base64DataNoFrContract && contractNoFrFileName) {
        configNoFr = {
          method: 'post',
          url: driveUrl,
          headers: { 
            'Authorization': `Bearer ${accessTocken}`, 
            ...docInfoNoFr.getHeaders()
          },
          data : docInfoNoFr
        };
      }

      const allRequest = configNoFr ? [
        axios(config),
        axios(configNoFr)
      ] : [axios(config)]

      const [res1,res2] = await Promise.all(allRequest)

      if (res1.status === 200) {
        //console.log("debut")
        try {
          const checkFileContract = fs.existsSync(uploadDir+"/"+originalContractName)
          //console.log("checkFile",checkFileContract)
          if (checkFileContract) {
            await fsp.unlink(`${uploadDir}/${originalContractName}`)
          }
          const checkNoFrFileContract = fs.existsSync(uploadDir+"/"+contractNoFrFileName)
          //console.log("checkNoFrFileContract",checkNoFrFileContract)
          if (base64DataNoFrContract && contractNoFrFileName && checkNoFrFileContract) {
            await fsp.unlink(`${uploadDir}/${contractNoFrFileName}`)
          }
          //console.log("supression reussi")
          await saveContract(contractData.data.contract,contractData.data.clientId,contractData.data.addressId,contractData.data.serviceId,1,"update","client",contractData.data.contract.contractId);
          //console.log("uodate contract reussi")
          await updateClientByContract(contractData.data.contract.clientGivingData,contractData.data.clientId,contractData.data.addressId,"update");
          //console.log("update client reussi")
          await updateContractStatus(contractData.data.serviceId,contractData.data.contractStatus)
          //console.log("update contract status reussi")
          return true
        } catch (error) {
          throw error
        }
      }
      return false
    } catch (error) {
      console.log("Erreur",error)
      throw error
    }
  }

  try {

    let accessTocken = await getAccessTocken()

    if (!accessTocken) {
      accessTocken = await generedToken()
    }

    if (!accessTocken) {
      return false
    }

    //console.log("accessTocken",accessTocken);
    
    const response = await uploadDocOnDrive(accessTocken);

    console.log("response",response)

    return response;

  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Détails Zoho:", error.response?.data);
      console.error("Statut HTTP:", error.response?.status);
      if (error.response?.data.errors[0].id === "F7003") {
        const accessTocken = await generedToken()
        console.log("refresh accessTocken",accessTocken)
        const response = await uploadDocOnDrive(accessTocken);
        return response
      }
      console.error("Error",error)
    }
    return false;
  }
}

const saveInvoiceDoc = async(data:invoiceSendData)=>{
  const uploadDocOnDrive = async(accessTocken:string)=>{

    const MAX_SIZE = 250 * 1024 * 1024;

    const base64StringInvoice = data.blobInvoice

    const base64DataInvoice = base64StringInvoice.replace(/^data:application\/\w+;base64,/, "");
    const invoiceName = data.invoiceName+'.pdf';
    
    try {

      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      fs.writeFileSync(`${uploadDir}/${invoiceName}`, base64DataInvoice, { encoding: 'base64' });
    
      const docInfo = new FormData();

      docInfo.append("content", fs.createReadStream(`${uploadDir}/${invoiceName}`), {
        filename: invoiceName,
        contentType: "application/pdf"
      });

      docInfo.append("filename",invoiceName)
      docInfo.append("parent_id",INVOICE_FOLDER)
      docInfo.append('override-name-exist', 'true');

      const driveUrl = `${process.env.NEXT_PUBLIC_ZOHO_BASE_URL_DRIVE}/workdrive/api/v1/upload`

      const config = {
        method: 'post',
        url: driveUrl,
        headers: { 
          'Authorization': `Bearer ${accessTocken}`, 
          ...docInfo.getHeaders()
        },
        data : docInfo
      };

      const response = await axios(config)

      console.log("response",response)

      if (response.status === 200) {
        const checkFileInvoice = fs.existsSync(uploadDir+"/"+invoiceName)
        if (checkFileInvoice) {
          await fsp.unlink(`${uploadDir}/${invoiceName}`)
        }
        await saveClientInvoice(data)
        return true
      }
      return false
    } catch (error) {
      throw error
    }
  }

  try {

    let accessTocken = await getAccessTocken()

    if (!accessTocken) {
      accessTocken = await generedToken()
    }

    if (!accessTocken) {
      return false
    }

    //console.log("accessTocken",accessTocken)
    
    const response = await uploadDocOnDrive(accessTocken);

    console.log("response",response)

    return response

  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Détails Zoho:", error.response?.data);
      console.error("Statut HTTP:", error.response?.status);
      if (error.response?.data.errors[0].id === "F7003") {
        const accessTocken = await generedToken()
        console.log("refresh accessTocken",accessTocken)
        const response = await uploadDocOnDrive(accessTocken);
        return response
      }
      console.error("Error",error)
    }
    return false;
  }
}

export const saveDocPayment = async(data:invoiceSendData)=>{

  const uploadDocOnDrive = async(accessTocken:string)=>{
    try {
      const driveUrl = `${process.env.ZOHO_BASE_URL_DRIVE}/workdrive/api/v1/upload`;

      const fileName = `${data.fileName}.pdf`

      const docInfo = new FormData()

      docInfo.append("content", fs.createReadStream(`upload/${data.blobInvoice}`), {
        filename: fileName,
        contentType: "application/pdf"
      });

      docInfo.append("filename",fileName)
      docInfo.append("parent_id",INVOICE_FOLDER)
      docInfo.append('override-name-exist', 'true');

      const config = {
        method: 'post',
        url: driveUrl,
        headers: { 
          'Authorization': `Bearer ${accessTocken}`, 
          ...docInfo.getHeaders()
        },
        data : docInfo
      };
      
      const response = await axios(config);

      if (response.status === 200) {
        await fsp.unlink(`upload/${fileName}`)
        const result = await saveClientInvoice(data)
        return result
      }
      return false
    } catch (error) {
      throw error
    }
  }

  try {

    let accessTocken = await getAccessTocken()

    if (!accessTocken) {
      accessTocken = await generedToken()
    }

    if (!accessTocken) {
      return false
    }

    const response = await uploadDocOnDrive(accessTocken);

    console.log("response",response)

    return response

  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Détails Zoho:", error.response?.data);
      console.error("Statut HTTP:", error.response?.status);
      if (error.response?.data.errors[0].id === "F7003") {
        const accessTocken = await generedToken()
        console.log("refresh accessTocken",accessTocken)
        const response = await uploadDocOnDrive(accessTocken);
        return response
      }
      console.error("Error",error)
      return false
    }
    return false;
  }
}

export const getAccessTocken = async()=>{
  const accessTocken = (await cookies()).get("access_token")?.value
  return accessTocken
}

export {saveContractDoc,saveInvoiceDoc}