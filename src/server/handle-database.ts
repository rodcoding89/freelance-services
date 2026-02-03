"use server"

import { Client, clientAddress, clientCountry, clientState, Contract, contractFormClient, countryState, features, invoiceSendData, Services } from '@/interfaces';
import db from './init-database'
import uid from 'uid2'
import { EnCoder, parseDataToSave, parseType } from '@/utils/fonction';

export const sign = async(email:string,pw:string):Promise<{uid:string}>=>{
    return new Promise((resolve:any,reject:any)=>{
        try {
            db.get(`SELECT * FROM account WHERE email = ?`,[EnCoder("string",email)],async(err:Error|null,row:any)=>{

                if (err) {
                    reject(new Error("Erreur lors de la requete "+err.message))
                }

                if(!row){
                    reject(new Error("Utilisateur pas trouvé"))
                }

                const isPasswordValid = EnCoder("string",pw);
                console.log("pass",isPasswordValid," = ",row.password)
                
                if (isPasswordValid === row.password) {
                    resolve({uid:row.email+"-"+row.id})
                }else{
                    reject(new Error("Mot de passe incorrect"))
                }
            })
        } catch (error:any) {
            reject(new Error("Erreur lors de la requete "+error.message))
        }
    })
}

export const addClient = async(clientData:Client,service:Services):Promise<{clientLang:"fr"|"en"}>=>{
    
    return new Promise((resolve:any,reject:any)=>{
        try {
            db.get(`SELECT email,fname,lname FROM clients WHERE email = ? AND lname = ? AND fname = ?`,[EnCoder("string",clientData.email ?? ''),EnCoder("string",clientData.lname),EnCoder("string",clientData.fname)],(err:Error|null,row:any)=>{
                if(err){
                    reject(new Error(`Erreur de la requete ${err.message}`))
                }
                if(!row){
                    db.get(`SELECT * FROM clients ORDER BY clientId DESC LIMIT 1`,[],(err:Error|null,row:any)=>{
                        if(err){
                            reject(new Error(`Erreur de la requete ${err.message}`))
                        }
                        const id = uid(24);
                        //console.log("client uid",uid)
                        db.run(`INSERT INTO clients(lname,fname,clientUid,taxId,email,address,clientNumber,invoiceCount,clientLang,clientType,modifDate,phone,clientStatus,createAt) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,[EnCoder("string",clientData.lname),EnCoder("string",clientData.fname),id,(clientData.taxId === '' || !clientData.taxId) ? '' : EnCoder("string",clientData.taxId),EnCoder("string",clientData.email),null, row ? (EnCoder("string",row.clientId + 1)) : EnCoder("integer",100),0,clientData.clientLang,clientData.clientType,EnCoder("integer",clientData.modifDate),EnCoder("string",clientData.phone),clientData.clientStatus,new Date()],async function(err:Error|null){
                            
                            if(err){
                                reject(new Error(`Erreur de la requete ${err.message}`))
                            }
                            console.log("client id",this.lastID)
                            const response = await addService({...service,clientId:this.lastID});
                            console.log(response)
                            if (response.response === true) {
                                resolve({clientLand:clientData.clientLang})
                            }else{
                                reject(new Error(`Erreur dans l'ajout du service`))
                            }
                        })
                    })
                }else{
                    reject(new Error(`Le client existe deja`))
                }
            })
        } catch (error:any) {
            reject(new Error(`Erreur de la requete `+error.message))
        }
    })
}

export const addService = async(service:Services):Promise<{response:boolean}>=>{
    return new Promise((resolve:any,reject:any)=>{
        try {
            const id = uid(24);
            console.log("service id",id)
            db.run(`INSERT INTO services(serviceType,serviceUid,contractStatus,client) VALUES(?,?,?,?)`,[service.serviceType,id,service.contractStatus,service.clientId],function(err){
                if(err){
                    reject(new Error(`Erreur de la requete ${err.message}`))
                }else{
                    resolve({response:true})
                }
            })
        } catch (error:any) {
            reject(new Error(`Erreur de la requete ${error.message}`))
        }
    })
}

export const getClientList = async():Promise<any[]>=>{
    
  return new Promise((resolve:any,reject:any)=>{
    try {
        db.all(`SELECT 
            c.clientId as clientId,
            c.lname as lname,
            c.fname as fname,
            c.clientUid as clientUid,
            c.taxId as taxId,
            c.email as email,
            c.clientUid as clientUid,
            c.clientNumber as clientNumber,
            c.invoiceCount as invoiceCount,
            c.clientLang as clientLang,
            c.clientType as clientType,
            c.modifDate as modifDate,
            c.phone as phone,
            c.clientStatus as clientStatus,
            c.address as address,
			COALESCE(
				(
					SELECT JSON_GROUP_ARRAY(
						JSON_OBJECT(
							'serviceId',s.serviceId,
                            'serviceUid',s.serviceUid,
							'serviceType',s.serviceType,
                            'maintenanceType',s.maintenanceType,
							'contractStatus',s.contractStatus,
							'clientId',s.client
						)
					) FROM services s WHERE s.client = c.clientId
				),
				json('[]')
			) AS services
			FROM clients c GROUP BY c.clientId;`,[],(err:Error|null,rows)=>{
            if(err){
                reject(new Error(`Erreur de la requete ${err.message}`))
            }else{
                resolve(rows)
            }
        })
    } catch (error:any) {
        reject(new Error(`Erreur de la requete ${error}`))
    }
  })
}

export const deleteClient = async (status:"desactived",clientId:string):Promise<boolean>=>{
  return new Promise((resolve:any,reject:any)=>{
    try {
        db.run(`UPDATE clients SET clientStatus = ? WHERE clientId = ?`,[status,clientId],(err)=>{
            if(err){
                reject(new Error(`Erreur de la requete ${err.message}`))
            }else{
                resolve(true)
            }
        })
    } catch (error:any) {
        reject(new Error(`Erreur de la requete ${error}`))
    }
  })
}

export const fetchWebConfig = async ():Promise<any[]> => {
  return new Promise((resolve:any,reject:any)=>{
    try {
        db.all(`SELECT * FROM webconfig`,[],(err:Error|null,rows:any[])=>{
            if(err){
                reject(new Error(`Erreur de la requete ${err.message}`))
            }else{
                resolve(rows)
            }
        })
    } catch (error) {
        reject(new Error(`Erreur de la requete ${error}`))
    }
  })
};

export const saveWebConfig = async(type:"update"|"add",config:{webpage:string,lastUpdate:string},date:Date):Promise<boolean>=>{
  return new Promise((resolve:any,reject:any)=>{
    try {
        //console.log("date",date,"config",config)
        if (type === "update") {
            db.run(`UPDATE webconfig SET lastUpdate = ? WHERE webpage = ?`,[EnCoder("integer",new Date(config.lastUpdate).getTime()),EnCoder("string",config.webpage)],(err)=>{
                if(err){
                    reject(new Error(`Erreur de la requete ${err.message}`))
                }else{
                    resolve(true)
                }
            })
        }else{
            db.run(`INSERT INTO webconfig (webpage,lastUpdate) VALUES (?,?)`,[EnCoder("integer",new Date(config.lastUpdate).getTime()),new Date(config.lastUpdate)],(err)=>{
                if(err){
                    reject(new Error(`Erreur de la requete ${err.message}`))
                }else{
                    resolve(true)
                }
            })
        }
    } catch (error) {
        reject(new Error(`Erreur de la requete ${error}`))
    }
  })
}

export const deleteService = async (serviceId:string):Promise<boolean> =>{
  return new Promise((resolve:any,reject:any)=>{
    try {
        db.run(`DELETE FROM services WHERE serviceId = ?`,[serviceId],(err)=>{
            if(err){
                reject(new Error(`Erreur de la requete ${err.message}`))
            }else{
                resolve(true)
            }
        })
    } catch (error) {
        reject(new Error(`Erreur de la requete ${error}`))
    }
  })
}

export const getClientWithService = async (clientId:string):Promise<any> =>{
  return new Promise((resolve:any,reject:any)=>{
    try {
        db.get(`SELECT 
            c.clientId as clientId,
            c.lname as lname,
            c.fname as fname,
            c.clientUid as clientUid,
            c.taxId as taxId,
            c.clientUid as clientUid,
            c.email as email,
            c.clientNumber as clientNumber,
            c.invoiceCount as invoiceCount,
            c.clientLang as clientLang,
            c.clientType as clientType,
            c.modifDate as modifDate,
            c.phone as phone,
            c.clientStatus as clientStatus,
            c.address as address,
			COALESCE(
				(
					SELECT JSON_GROUP_ARRAY(
						JSON_OBJECT(
							'serviceId',s.serviceId,
                            'serviceUid',s.serviceUid,
							'serviceType',s.serviceType,
                            'maintenanceType',s.maintenanceType,
							'contractStatus',s.contractStatus,
							'clientId',s.client
						)
					) FROM services s WHERE s.client = c.clientId
				),
				json('[]')
			) AS services
			FROM clients c WHERE clientId = ? GROUP BY c.clientId;`,[clientId],(err:Error|null,row)=>{
            if(err){
                console.log("Erreur",err.message)
                reject(new Error(`Erreur de la requete ${err.message}`))
            }else{
                resolve(row)
            }
        })
    } catch (error) {
        console.log("Erreur",error)
        reject(new Error(`Erreur de la requete ${error}`))
    }
  })
}


export const updateClient = async(client:Client,service:Services):Promise<boolean> =>{
  return new Promise((resolve:any,reject:any)=>{
    try {
        db.run(`UPDATE clients SET fname = ?, lname = ?, clientStatus = ?, taxId = ?, clientType = ?, modifDate = ?, email = ?, clientLang = ?, phone = ? WHERE clientId = ?`,[EnCoder("string",client.fname),EnCoder("string",client.lname),client.clientStatus,EnCoder("string",client.taxId),client.clientType,EnCoder("integer",client.modifDate),EnCoder("string",client.email),client.clientLang,EnCoder("string",client.phone),client.clientId],async(err)=>{
            if(err){
                console.log("Erreur",err.message)
                reject(new Error(`Erreur de la requete ${err.message}`))
            }else{
                await updateServiceType(service)
                resolve(true)
            }
        })
    } catch (error) {
        console.log("Erreur",error)
        reject(new Error(`Erreur de la requete ${error}`))
    }
  })
}

export const updateServiceType = async(service:Services)=>{
    return new Promise((resolve:any,reject:any)=>{
        try {
            if (service.serviceId) {
                db.run(`UPDATE services SET serviceType = ? WHERE serviceId = ?`,[service.serviceType,service.serviceId],(err)=>{
                    if(err){
                        console.log("Erreur",err.message)
                        reject(new Error(`Erreur de la requete ${err.message}`))
                    }else{
                        resolve(true)
                    }
                })   
            }else{
                resolve(true)
            }
        } catch (error) {
            console.log("Erreur",error)
            reject(new Error(`Erreur de la requete ${error}`))
        }
    })
}

export const saveContract = async (contractData:Contract,clientId:number,addressId:number|null,serviceId:number,prestataireId:number,mode:"add"|"update",from:"prestataire"|"client",contractId:number|undefined):Promise<boolean>=>{
    return new Promise((resolve:any,reject:any)=>{
        try {
            if (from === "prestataire") {
                if(mode === "add"){
                    db.run(`INSERT INTO contracts(subTotalPrice,service,prestataire,maintenanceCategory,maintenancePrice,taxPrice,taxPercent,projectTitle,
                        projectDescription,startDate,endDate,saveDate,totalPrice,paymentSchedule,saleTermeConditionValided,
                        electronicContractSignatureAccepted,rigthRetractionLostAfterServiceBegin) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
                        [EnCoder("float",contractData.prestataireGivingData?.subTotalPrice ?? 0),serviceId,prestataireId,contractData.prestataireGivingData?.maintenanceCategory ?? '',null,
                        contractData.prestataireGivingData?.taxPrice ?? 0, contractData.prestataireGivingData?.taxPercent ?? 0,
                        EnCoder("string",contractData.prestataireGivingData?.projectTitle ?? ''), EnCoder("string",contractData.prestataireGivingData?.projectDescription ?? ''),
                        EnCoder("integer",contractData.prestataireGivingData?.startDate ?? new Date().getTime()), EnCoder("integer",contractData.prestataireGivingData?.endDate ?? new Date().getTime()),null,
                        EnCoder("float",contractData.prestataireGivingData?.totalPrice ?? 0),EnCoder("string",contractData.prestataireGivingData?.paymentSchedule ?? ""),null,null,null],

                        async function(err){
                            if(err){
                                console.log("Erreur",err.message)
                                reject(new Error(`Erreur de la requete ${err.message}`))
                            }else{
                                const features = Array.isArray(contractData.prestataireGivingData?.projectFonctionList) ? contractData.prestataireGivingData?.projectFonctionList : []
                                await addFeature(features,this.lastID)
                                await updateContractStatus(serviceId,contractData.prestataireGivingData?.contractStatus ?? "unsigned")
                                resolve(true)
                            }
                    })
                }else{
                    if (!contractId || contractId === 0) {
                        console.log("Contract Id manquant")
                        reject(new Error(`Contract Id manquant`))
                    } else {
                        db.run(`UPDATE contracts SET taxPrice = ?,taxPercent = ?,projectTitle = ?,
                            projectDescription = ?,startDate = ?,endDate = ?, subTotalPrice = ?,totalPrice = ?,paymentSchedule = ? WHERE contractId = ?`,
                            [EnCoder("integer",contractData.prestataireGivingData?.taxPrice ?? 0), EnCoder("integer",contractData.prestataireGivingData?.taxPercent ?? 0),EnCoder("string",contractData.prestataireGivingData?.projectTitle ?? ''),EnCoder("string",contractData.prestataireGivingData?.projectDescription ?? ''),
                            EnCoder("integer",contractData.prestataireGivingData?.startDate ?? new Date().getTime()), EnCoder("integer",contractData.prestataireGivingData?.endDate ?? new Date().getTime()),
                            EnCoder("float",contractData.prestataireGivingData?.subTotalPrice ?? 0),EnCoder("integer",contractData.prestataireGivingData?.totalPrice ?? 0),EnCoder("string",contractData.prestataireGivingData?.paymentSchedule ?? ''),contractId],async function(err){
                                if(err){
                                    console.log("Erreur",err.message)
                                    reject(new Error(`Erreur de la requete ${err.message}`))
                                }else{
                                    const features = Array.isArray(contractData.prestataireGivingData?.projectFonctionList) ? contractData.prestataireGivingData?.projectFonctionList : []
                                    await addFeature(features,contractId)
                                    await updateContractStatus(serviceId,contractData.prestataireGivingData?.contractStatus ?? "unsigned")
                                    resolve(true)
                                }
                        }) 
                    }
                }
            } else {
                if (contractData.contractId) {
                    console.log("contractData",contractData)
                    const subPrice = EnCoder("float",contractData.prestataireGivingData?.subTotalPrice ?? 0)
                    const taxPrice = EnCoder("float",contractData.prestataireGivingData?.taxPrice ?? 0)
                    const totalPrice = EnCoder("float",contractData.prestataireGivingData?.totalPrice ?? 0)
                    const taxPercent = EnCoder("float",contractData.prestataireGivingData?.taxPercent ?? 0)
                    console.log("taxPrice",taxPrice)
                    db.run(`UPDATE contracts SET maintenancePrice = ?,subTotalPrice = ?,taxPrice = ?,taxPercent = ?,totalPrice = ?,saveDate = ?,saleTermeConditionValided = ?,
                        electronicContractSignatureAccepted = ?,rigthRetractionLostAfterServiceBegin = ? WHERE contractId = ?`,
                        [EnCoder("float",contractData.maintenancePrice ?? ''),subPrice,taxPrice,taxPercent,totalPrice,EnCoder("integer",new Date().getTime()),EnCoder("string",contractData.saleTermeConditionValided ? contractData.saleTermeConditionValided ? 'true' : 'false' : ''),EnCoder("string",contractData.electronicContractSignatureAccepted ? contractData.electronicContractSignatureAccepted === true ? 'true' : 'false' : ''),
                        EnCoder("string",contractData.rigthRetractionLostAfterServiceBegin ? contractData.rigthRetractionLostAfterServiceBegin ? 'true' : 'false' : ''),contractData.contractId],
                        async function(err){
                        if(err){
                            console.log("Erreur",err.message)
                            reject(new Error(`Erreur de la requete ${err.message}`))
                        }else{
                            const response = await addAddress(addressId,clientId,contractData.clientGivingData?.addressClient,contractData.clientGivingData,serviceId,contractData.clientGivingData?.maintenanceType ?? "perHour")
                            console.log("response",response)
                            if (response.success) {
                                resolve(true)
                            } else {
                                reject(new Error(response.message))
                            }
                        }
                    })
                }else{
                    console.log("erreur update")
                    resolve(false)
                }
            }
        } catch (error) {
            console.log("Erreur",error)
            reject(new Error(`Erreur de la requete ${error}`))
        }
    })
}

export const updateClientByContract = async(client:contractFormClient|null,clientId:number,addressId:number|null,type:"add"|"update"):Promise<{success:boolean,message:string}>=>{
    console.log("addressId",addressId)
    return new Promise((resolve:any,reject:any)=>{
        if(!client){
            resolve({success:false,message:"Veillez remplir les données client"})
        }else{
            try {
                if (addressId) {
                    db.run(`UPDATE clients SET fname = ?, lname = ?, email = ?, clientType = ?, phone = ?, taxId = ?, modifDate = ?, address = ? WHERE clientId = ?`,
                        [EnCoder("string",client.fname),EnCoder("string",client.lname),EnCoder("string",client.email ?? ""), client.clientType, EnCoder("string",client.phone ?? ""), EnCoder("string",client.taxId ?? ""), EnCoder("integer",client.modifDate), addressId, clientId],
                        (err)=>{
                            if(err){
                                console.log("Erreur",err.message)
                                resolve({success:false,message:"Une erreur s'est produit lors de l'operation"})
                            }else{
                                resolve({success:true})
                            }
                    })   
                } else {
                    resolve({success:false,message:"Addresse client incorrect"})
                }
            } catch (error) {
                console.log("Erreur",error)
                reject(new Error(`Erreur de la requete ${error}`))
            }
        }
    })
}

const addState = async(state:clientState):Promise<{success:boolean,message?:string,stateId:number,type:"add"|"update"}>=>{
    const clientState = typeof(state) === 'string' ? JSON.parse(state) as clientState : state;
    return new Promise((resolve:any,reject:any)=>{
        try {
            if (!clientState) {
                resolve({success:false})
            } else {
                if (clientState.stateId) {
                    db.run(`UPDATE clientState SET id=?,name=?,tax=?,vat=?,stateCode=?,threshold=?`,
                    [clientState.id,EnCoder("string",clientState.name),EnCoder("integer",clientState.tax),EnCoder("string",clientState.vat),EnCoder("string",clientState.stateCode),EnCoder("integer",clientState.threshold)],(err)=>{
                        if (err) {
                            //console.log("Erreur",err.message)
                            resolve({success:false,message:"Une erreur s'est produit lors de l'operation, Veillez recommencé dans quelque instant."})
                        }else{
                            resolve({success:true,stateId:undefined,type:"update"})
                        }
                    })
                } else {
                    db.run(`INSERT INTO clientState(id,name,tax,vat,stateCode,threshold) VALUES(?,?,?,?,?,?)`,
                        [clientState.id,EnCoder("string",clientState.name),EnCoder("integer",clientState.tax),EnCoder("string",clientState.vat),EnCoder("string",clientState.stateCode),EnCoder("integer",clientState.threshold)],function(err){
                        if(err){
                            console.log("Erreur",err.message)
                            resolve({success:false,message:"Une erreur s'est produit lors de l'operation, Veillez recommencé dans quelque instant."})
                        }else{
                            resolve({success:true,stateId:this.lastID,type:"add"})
                        }
                    })
                }   
            }
        } catch (error) {
            console.log("Erreur",error)
            reject(new Error(`Erreur de la requete ${error}`))
        }
    })
}

const addAddress = async(addressId:number|null,clientId:number,addressClient:clientAddress|undefined,client:contractFormClient|null,serviceId:number,maintenanceType:"perHour"|"perYear"|null):Promise<{success:boolean,message?:string}>=>{ 
    console.log("addressId 2",addressId,addressClient, client, addressClient?.clientCountry)
    return new Promise(async(resolve:any,reject:any)=>{
        try {
            if (addressClient && client && addressClient.clientCountry) {
                const clientCountry = typeof(addressClient.clientCountry) === "string" ? JSON.parse(addressClient.clientCountry) as clientCountry : addressClient.clientCountry
                if (clientCountry.clientState) {
                    const result = await addState(clientCountry.clientState)
                    console.log("result state",result)
                    if (result.success) {
                        if (result.type === "update") {
                            resolve({success:true})
                        } else {
                            const response = await handleAddressAdding(addressClient.clientCountry,addressClient.street,addressClient.postalCode,addressClient.city,result.stateId ?? null,addressId,clientId,serviceId,client,maintenanceType)
                            if (response.success) {
                                resolve({success:true})
                            } else {
                                console.log("error 1")
                                resolve({success:false,message:response.message})
                            }   
                        }
                    } else {
                        console.log("error 2")
                        resolve({success:false,message:result.message})
                    }
                }else{
                    const response = await handleAddressAdding(addressClient.clientCountry,addressClient.street,addressClient.postalCode,addressClient.city,null,addressId,clientId,serviceId,client,maintenanceType)
                    if (response.success) {
                        resolve({success:true})
                    } else {
                        console.log("error 3")
                        resolve({success:false,message:response.message})
                    }
                }
            } else {
                console.log("error 4")
                resolve({success:false,message:"Vous n'avez pas remplis tous les champs"})
            }
        } catch (error) {
            console.log("Erreur",error)
            reject(new Error(`Erreur de la requete ${error}`))
        }
    })
}

const handleAddressAdding = async(country:clientCountry,street:string,postalCode:string,city:string,stateId:number|null,addressId:number|null,clientId:number,serviceId:number,client:contractFormClient,maintenanceType:"perHour"|"perYear"|null):Promise<{success:boolean,message:string}>=>{
    console.log("addressId 3",addressId)
    return new Promise((resolve:any,reject:any)=>{
        try {
            if (country.id) {
                //console.log("country exist",country.id)
                db.run(`UPDATE clientCountry SET itemId = ?,name = ?,taxB2B = ?,taxB2C = ?,groupe = ?,currency = ?,isoCode = ?,thresholdBeforeTax = ?,specificTo = ?,vat = ?,state = ? WHERE id = ?`,
                    [EnCoder("string",country.itemId ?? ""), EnCoder("string",country?.name ?? ""),EnCoder("float",country?.taxB2B ?? ""),
                    EnCoder("float",country.taxB2C ?? ""), EnCoder("string",country?.groupe ?? ""),
                    EnCoder("string",country.currency ?? "USD"), EnCoder("string",country?.isoCode ?? ""),
                    EnCoder("integer",country.threshold_before_tax ?? 0),country?.specificTo ?? "country",
                    EnCoder("string",country.vat ?? ''),country.state,country.id],async(err)=>{
                    if(err){
                        console.log("Erreur",err.message)
                        resolve({success:false,message:"Une erreur s'est produit lors de l'operation, Veillez recommencé dans quelque instant."})
                    }else{
                        const resp = await addUpdateAddress(addressId,street,postalCode,city,serviceId,maintenanceType,client,clientId,undefined)
                        resolve({success:resp.success,message:resp.message})
                    }
                })
            } else {
                //console.log("country not exist",)
                db.run(`INSERT INTO clientCountry(itemId,name,taxB2B,taxB2C,groupe,currency,isoCode,thresholdBeforeTax,specificTo,vat,state) VALUES(?,?,?,?,?,?,?,?,?,?,?)`,
                    [EnCoder("string",country.itemId ?? ""),EnCoder("string",country?.name ?? ""),EnCoder("string",country?.taxB2B ?? ""),
                    EnCoder("string",country.taxB2C ?? ""), EnCoder("string",country?.groupe ?? ""),
                    EnCoder("string",country.currency ?? "USD"), EnCoder("string",country?.isoCode ?? ""),
                    EnCoder("integer",country.threshold_before_tax ?? 0),country?.specificTo ?? "country",
                    EnCoder("string",country.vat ?? ''),stateId],async function(err){
                    if(err){
                        console.log("Erreur",err.message)
                        resolve({success:false,message:"Une erreur s'est produit lors de l'operation, Veillez recommencé dans quelque instant."})
                    }else{
                        const resp = await addUpdateAddress(addressId,street,postalCode,city,serviceId,maintenanceType,client,clientId,this.lastID)
                        resolve({success:resp.success,message:resp.message})
                    }
                })   
            } 
        } catch (error) {
            console.log("Erreur",error)
            reject(new Error(`Erreur de la requete ${error}`))
        }
    })
}

const addUpdateAddress = (addressId:number|null,street:string,postalCode:string,city:string,serviceId:number,maintenanceType:"perHour"|"perYear"|null,client:contractFormClient,clientId:number,lastId:number|undefined):Promise<{success:boolean,message:boolean}>=>{
    console.log("addressId 4",addressId)
    return new Promise((resolve:any,reject:any)=>{
        if (addressId) {
            //console.log("adress exist",addressId)
            db.run(`UPDATE address SET street = ?,postalCode = ?, city = ?, country = ?`,[EnCoder("string",street),EnCoder("string",postalCode),EnCoder("string",city),addressId],async function(err){
                if(err){
                    console.log("Erreur",err.message)
                    resolve({success:false,message:"Une erreur s'est produit lors de l'operation, Veillez recommencé dans quelque instant."})
                }else{
                    const res1 = await updateServiceMaintenanceType(serviceId,maintenanceType)
                    if (res1.success) {
                        const res2 = await updateClientByContract(client,clientId,addressId,"update")
                        resolve({success:res2.success, message:res2.message })
                    }else{
                        resolve({success:res1.success, message:res1.message })
                    }
                }
            })
        }else{
            //console.log("adress not exist")
            if (lastId) {
                //console.log("adress not exist add id ref",lastId)
                db.run(`INSERT INTO address(street,postalCode,city,country) VALUES(?,?,?,?)`,
                    [EnCoder("string",street ?? ""),EnCoder("string",postalCode ?? ""),EnCoder("string",city ?? ""),lastId
                    ],async function(err){
                    if(err){
                        console.log("Erreur",err.message)
                        resolve({success:false,message:"Une erreur s'est produit lors de l'operation, Veillez recommencé dans quelque instant."})
                    }else{
                        const res1 = await updateServiceMaintenanceType(serviceId,maintenanceType)
                        console.log("res1",res1)
                        if (res1.success) {
                            const res2 = await updateClientByContract(client,clientId,this.lastID,"add")
                            console.log("res2",res2)
                            resolve({success:res2.success, message:res2.message })
                        }else{
                            resolve({success:res1.success, message:res1.message })
                        }
                    }
                })
            } else {
                console.log("country not inserted")
                resolve({success:false,message:"Une erreur s'est produit lors de l'operation, Veillez recommencé dans quelque instant."})
            }
        }
    })
}

const updateServiceMaintenanceType = async(serviceId:number,maintenanceType:"perHour"|"perYear"|null):Promise<{success:boolean,message:string}>=>{ 
    return new Promise((resolve:any,reject:any)=>{
        try {
            db.run(`UPDATE services SET maintenanceType = ? WHERE serviceId = ?`,[maintenanceType,serviceId],(err)=>{
                if(err){
                    console.log("Erreur",err.message)
                    resolve({success:false,message:"Erreur lors de l'operation"})
                }else{
                    resolve({success:true,message:"Erreur lors de l'operation"})
                }
            })
        } catch (error) {
            console.log("Erreur",error)
            reject(new Error(`Erreur de la requete ${error}`))
        }
    })
}

export const updateContractStatus = async(serviceId:number,status:"unsigned"|"pending"|"signed"):Promise<boolean>=>{
    return new Promise((resolve:any,reject:any)=>{
        try {
            db.run(`UPDATE services SET contractStatus = ? WHERE serviceId = ?`,[status,serviceId],(err)=>{
                if(err){
                    console.log("Erreur",err.message)
                    reject(new Error(`Erreur de la requete ${err.message}`))
                }else{
                    resolve(true)
                }
            })
        } catch (error) {
            console.log("Erreur",error)
            reject(new Error(`Erreur de la requete ${error}`))
        }
    })
}

const addFeature = async(features:features[],contractId:number):Promise<boolean>=>{
    return new Promise((resolve:any,reject:any)=>{
        try {
            db.run(`DELETE FROM features WHERE serviceFeature = ?`,[contractId],(err)=>{
                if(err){
                    reject(new Error(`Erreur de la requete ${err.message}`))
                }
                features.forEach((item)=>{
                    db.run(`INSERT INTO features (title,description,quantity,price,serviceFeature) VALUES(?,?,?,?,?)`,[EnCoder("string",item.title),EnCoder("string",item.description),EnCoder("integer",item.quantity),EnCoder("float",item.price),contractId],(err)=>{
                        if(err){
                            reject(new Error(`Erreur de la requete ${err.message}`))
                        }
                    })
                    resolve(true)
                })
            })
        } catch (error) {
            reject(new Error(`Erreur de la requete ${error}`))
        }
    })
}

export const getContratClientAndService = async (clientId:string,clientServiceId:string,prestataireId:string):Promise<any>=>{
    return new Promise((resolve:any,reject:any)=>{
        try {
           db.get(`SELECT 
                c.clientId as clientId,
                c.lname as lname,
                c.fname as fname,
                c.clientUid as clientUid,
                c.taxId as taxId,
                c.clientUid as clientUid,
                c.email as email,
                c.clientNumber as clientNumber,
                c.invoiceCount as invoiceCount,
                c.clientLang as clientLang,
                c.clientType as clientType,
                c.modifDate as modifDate,
                c.phone as phone,
                c.clientStatus as clientStatus,
                c.address as address,
                COALESCE(
                    (
                        SELECT JSON_OBJECT(
                            'addressId',d.addressId,
                            'street',d.street,
                            'city',d.city,
                            'postalCode',d.postalCode,
                            'country',d.country,
                            'clientCountry', COALESCE(
                                (
                                    SELECT JSON_OBJECT(
                                        'id',e.id,
                                        'name',e.name,
                                        'itemId',e.itemId,
                                        'taxB2B',e.taxB2B,
                                        'taxB2C',e.taxB2C,
                                        'groupe',e.groupe,
                                        'currency',e.currency,
                                        'isoCode',e.isoCode,
                                        'thresholdBeforeTax',e.thresholdBeforeTax,
                                        'specificTo',e.specificTo,
                                        'vat',e.vat,
                                        'state',e.state,
                                        'clientState',COALESCE(
                                            (
                                                SELECT JSON_OBJECT(
                                                    'id',i.id,
                                                    'stateId',i.stateId,
                                                    'name',i.name,
                                                    'tax',i.tax,
                                                    'vat',i.vat,
                                                    'stateCode',i.stateCode,
                                                    'threshold', i.threshold
                                                ) FROM clientState i WHERE i.stateId = e.state 
                                            ),
                                            json('null')
                                        )
                                    ) FROM clientCountry e WHERE e.id = d.country
                                ),
                                json('null')
                            )
                        ) FROM address d WHERE c.address = d.addressId
                    ),
                    json('null')
                ) AS addressClient,
                COALESCE(
                    (
                        SELECT JSON_OBJECT(
                            'freelancerId',f.freelancerId,
                            'freelancerName',f.freelancerName,
                            'freelancerAddress',f.freelancerAddress,
                            'freelancerTaxId',f.freelancerTaxId,
                            'createAt',f.createAt
                        ) FROM freelancer f WHERE f.freelancerId = ?
                    ),
                    json('null')
                ) AS freelancer,
                COALESCE(
                    (
                        SELECT JSON_GROUP_ARRAY(
                            JSON_OBJECT(
                                'serviceId',s.serviceId,
                                'serviceUid',s.serviceUid,
                                'serviceType',s.serviceType,
                                'contractStatus',s.contractStatus,
                                'maintenanceType',s.maintenanceType,
                                'clientId',s.client,
                                'contract', COALESCE(
                                    (
                                        SELECT JSON_OBJECT(
                                            'contractId',t.contractId,
                                            'service',t.service,
                                            'prestataire',t.prestataire,
                                            'maintenanceCategory',t.maintenanceCategory,
                                            'maintenancePrice',t.maintenancePrice,
                                            'taxPrice',t.taxPrice,
                                            'taxPercent',t.taxPercent,
                                            'projectTitle',t.projectTitle,
                                            'projectDescription',t.projectDescription,
                                            'startDate',t.startDate,
                                            'endDate',t.endDate,
                                            'saveDate',t.saveDate,
                                            'totalPrice',t.totalPrice,
                                            'subTotalPrice',t.subTotalPrice,
                                            'paymentSchedule',t.paymentSchedule,
                                            'saleTermeConditionValided',t.saleTermeConditionValided,
                                            'electronicContractSignatureAccepted',t.electronicContractSignatureAccepted,
                                            'rigthRetractionLostAfterServiceBegin',t.rigthRetractionLostAfterServiceBegin,
                                            'features', COALESCE(
                                                (
                                                    SELECT JSON_GROUP_ARRAY(
                                                        JSON_OBJECT(
                                                            'title',a.title,
                                                            'description',a.description,
                                                            'quantity',a.quantity,
                                                            'price',a.price,
                                                            'serviceFeature',a.serviceFeature
                                                        )
                                                    ) FROM features a WHERE a.serviceFeature = t.contractId
                                                ),
                                                json('[]')
                                            ),
                                            'invoiceCount', COALESCE(
                                                (
                                                    SELECT ic.invoiceId FROM invoices ic WHERE  ic.client = c.clientId AND ic.contract = t.contractId
                                                ),
                                                json('null')
                                            )
                                        )
                                        FROM contracts t WHERE t.service = s.serviceId
                                    ),
                                    json('null')
                                )
                            )
                        )
                        FROM services s WHERE s.client = ? AND serviceId = ?
                    ),
                    json('[]')
                ) AS services
                FROM clients c WHERE c.clientId = ?`,[prestataireId,clientId,clientServiceId,clientId],(err,row)=>{
                if(err){
                    reject(new Error(`Erreur de la requete ${err.message}`))
                }else{
                    resolve(row)
                }
            }) 
        } catch (error) {
            reject(new Error(`Erreur de la requete ${error}`))
        }
    })
}

export const saveClientInvoice = async(data:invoiceSendData):Promise<boolean>=>{
    console.log("Invoice",data)
    return new Promise(async(resolve:any,reject:any)=>{
        const response = await updateInvoiceCount(data.invoiceCount,data.clientId)
        if (response.success) {
            try {
                if (data.invoiceId) {
                    db.run(`UPDATE invoices SET invoiceDate =?, invoiceDueDate =?,invoiceDescription =?, taxRate =?, taxEnabled =?, discount =?, contract =?, client =? WHERE invoiceId =?`,
                        [EnCoder("integer",data.invoiceDate),EnCoder("integer",data.ivoiceDueDate),EnCoder("string",data.invoiceDescription),EnCoder("integer",data.taxRate),EnCoder("boolean",data.taxEnabled),EnCoder("integer",data.discount),data.contractId,data.clientId,data.invoiceId],(err)=>{
                        if(err){
                            console.log("Error add freelance",err.message)
                            reject(new Error(`Erreur de l'enregistrement de l'operation`))
                        }else{
                            resolve(true)
                        }
                    })
                } else {
                    db.run(`INSERT INTO invoices (invoiceDate, invoiceDueDate,invoiceDescription, taxRate, taxEnabled, discount, contract, client) VALUES(?,?,?,?,?,?,?,?)`,
                        [EnCoder("integer",data.invoiceDate),EnCoder("integer",data.ivoiceDueDate),EnCoder("string",data.invoiceDescription),EnCoder("integer",data.taxRate),EnCoder("boolean",data.taxEnabled),EnCoder("integer",data.discount),data.contractId,data.clientId],(err)=>{
                        if(err){
                            //console.log("Error add freelance",err.message)
                            reject(new Error(`Erreur de l'enregistrement de l'operation`))
                        }else{
                            resolve(true)
                        }
                    })
                }   
            } catch (error) {
                reject(new Error(`Erreur de la requete ${error}`))
            }
        } else {
            resolve(response.success)
        }
    })
}


const updateInvoiceCount = (invoiceCount:number,clientId:number):Promise<{success:boolean,message:string}>=>{
    return new Promise((resolve:any,reject:any)=>{
        try {
            if (invoiceCount && clientId) {
                db.run(`UPDATE clients SET invoiceCount = ? WHERE clientId = ?`,[EnCoder("integer",invoiceCount),clientId],(err)=>{
                    if (err) {
                        console.log("Erreur",err.message)
                        resolve({success:false,message:"Erreur lors l'operation"})
                    } else {
                        resolve({success:true})
                    }
                })
            } else {
                resolve({success:false,message:"Erreur données manquand"})
            }
        } catch (error) {
            reject(new Error(`Erreur de la requete ${error}`))
        }
    })
}

export const checkClientTaxability = async(juridiction:string)=>{
    return new Promise((resolve:any,reject:any)=>{
        resolve(true)
    })
}