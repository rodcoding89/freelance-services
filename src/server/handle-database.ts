"use server"

import { Client, clientAddress, clientCountry, clientState, Contract, contractFormClient, Services } from '@/interfaces';
import db from './init-database'
import bcrypt from 'bcryptjs';

export const createTable = async()=>{
    db.serialize(() => {
        db.run(`
            CREATE TABLE account (
                id	INTEGER,
                email	TEXT NOT NULL,
                password	TEXT NOT NULL,
                createAt	NUMERIC NOT NULL,
                PRIMARY KEY("id" AUTOINCREMENT)
            );
        `);
        db.run(`
            CREATE TABLE IF NOT EXISTS saleTax (
                juridiction TEXT NOT NULL,
                totalSale REAL NOT NULL,
                taxThreshold REAL NOT NULL,
                taxRequired NUMERIC NOT NULL,
                lastUpdated NUMERIC NOT NULL
            );
        `)
        db.run(`CREATE TABLE IF NOT EXISTS webconfig (
            webpage TEXT NOT NULL,
            lastUpdate NUMERIC NOT NULL
        );`)
        db.run(`CREATE TABLE IF NOT EXISTS freelancer (
            freelancerId INTEGER PRIMARY KEY AUTOINCREMENT,
            freelancerName TEXT NOT NULL,
            freelancerAddress TEXT NOT NULL,
            freelancerTaxId TEXT NOT NULL,
            createAt NUMERIC NOT NULL
        );`)
        db.run(`CREATE TABLE IF NOT EXISTS clientState(
            stateId INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            tax REAL NOT NULL,
            vat TEXT NOT NULL,
            stateCode TEXT NOT NULL,
            threshold REAL NOT NULL
        );`)
        db.run(`CREATE TABLE IF NOT EXISTS clientCountry (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            itemId TEXT NOT NULL,
            name TEXT NOT NULL,
            taxB2B TEXT NOT NULL,
            taxB2C TEXT NOT NULL,
            groupe TEXT NOT NULL,
            currency TEXT NOT NULL,
            isoCode TEXT NOT NULL,
            thresholdBeforeTax REAL NOT NULL,
            specificTo TEXT CHECK(specificTo IN('state','country')),
            vat TEXT NULL,
            state INTEGER NULL,
            FOREIGN KEY (state) REFERENCES state(stateId) ON DELETE CASCADE
        );`)
        db.run(`CREATE TABLE IF NOT EXISTS address (
            addressId INTEGER PRIMARY KEY AUTOINCREMENT,
            street TEXT NULL,
            postalCode TEXT NULL,
            city TEXT NULL,
            country INTEGER NOT NULL,
            FOREIGN KEY (country) REFERENCES country(id) ON DELETE CASCADE
        );`)
        db.run(`CREATE TABLE IF NOT EXISTS clients (
            clientId INTEGER PRIMARY KEY AUTOINCREMENT,
            lname TEXT NOT NULL,
            fname TEXT NOT NULL,
            taxId TEXT NULL,
            email TEXT NULL,
            address INTEGER NULL,
            clientNumber INTEGER NOT NULL,
            invoiceCount INTEGER NOT NULL,
            clientLang TEXT CHECK(clientLang IN('fr','en','de')) NOT NULL,
            clientType TEXT CHECK(clientType IN('company','particular')) NOT NULL,
            modifDate NUMERIC NOT NULL,
            phone TEXT NULL,
            clientStatus TEXT CHECK(clientStatus IN('actived','desactived')) NOT NULL,
            createAt NUMERIC NOT NULL,
            FOREIGN KEY (address) REFERENCES address(addressId) ON DELETE CASCADE
        );`)
        db.run(`CREATE TABLE IF NOT EXISTS services (
            serviceId INTEGER PRIMARY KEY AUTOINCREMENT,
            serviceType TEXT CHECK(serviceType IN('service','maintenance','service_and_maintenance')),
            contractStatus TEXT CHECK(contractStatus IN('signed','unsigned','pending')),
            maintenanceType TEXT CHECK("maintenanceType" IN ('perHour', 'perYear')),
            client INTEGER NOT NULL,
            FOREIGN KEY (client) REFERENCES clients(clientId) ON DELETE CASCADE
        );`)
        db.run(`CREATE TABLE IF NOT EXISTS contracts (
            contractId INTEGER PRIMARY KEY AUTOINCREMENT,
            service INTEGER NOT NULL,
            prestataire INTEGER NOT NULL,
            maintenanceCategory TEXT CHECK(maintenanceCategory IN('app','saas','web')) NULL,
            maintenancePrice REAL NULL,
            taxPrice REAL NOT NULL,
            taxPercent INTEGER NOT NULL,
            projectTitle TEXT NOT NULL,
            projectDescription TEXT NOT NULL,
            startDate NUMERIC NOT NULL,
            endDate NUMERIC NOT NULL,
            totalPrice REAL NOT NULL,
            saveDate NUMERIC NULL,
            saleTermeConditionValided NUMERIC NULL,
            electronicContractSignatureAccepted NUMERIC NULL,
            rigthRetractionLostAfterServiceBegin NUMERIC NULL,
            paymentSchedule TEXT NOT NULL,
            FOREIGN KEY (service) REFERENCES services(serviceId) ON DELETE CASCADE,
            FOREIGN KEY (prestataire) REFERENCES freelancer(freelancerId) ON DELETE CASCADE
        );`)
        db.run(`CREATE TABLE IF NOT EXISTS features (
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            quantity INTEGER NOT NULL,
            price REAL NOT NULL,
            serviceFeature INTEGER NOT NULL,
            FOREIGN KEY (serviceFeature) REFERENCES contracts(contractId) ON DELETE CASCADE
        );`)
        db.run(`CREATE TABLE IF NOT EXISTS invoices (
            invoiceId INTEGER PRIMARY KEY AUTOINCREMENT,
            invoiceDate NUMERIC NOT NULL,
            ivoiceDueDate NUMERIC NOT NULL,
            client INTEGER NOT NULL,
            contract INTEGER NOT NULL,
            FOREIGN KEY (contract) REFERENCES contracts(contractId) ON DELETE CASCADE
            FOREIGN KEY (client) REFERENCES clients(clientId) ON DELETE CASCADE
        );`)
        db.run(`CREATE UNIQUE INDEX IF NOT EXISTS idx_account_email ON account(email);`)
        db.run(`CREATE INDEX IF NOT EXISTS idx_clients_name ON clients(lname, fname);`)
        db.run(`CREATE INDEX IF NOT EXISTS idx_clients_taxId ON clients(taxId);`)
        db.run(`CREATE INDEX IF NOT EXISTS idx_contracts_client ON contracts(client);`)
    });
}

export const sign = async(email:string,pw:string):Promise<{uid:string}>=>{
    return new Promise((resolve:any,reject:any)=>{
        try {
            db.get(`SELECT * FROM account WHERE email = ?`,[email],async(err:Error|null,row:any)=>{

                if (err) {
                    reject(new Error("Erreur lors de la requete "+err.message))
                }

                if(!row){
                    reject(new Error("Utilisateur pas trouvé"))
                }

                const isPasswordValid = await bcrypt.compare(pw, row.password);
                
                if (isPasswordValid) {
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

export const addUser = async()=>{
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("Kimbal@freelance89", salt);
    db.all('SELECT * FROM account WHERE email = "rodrigue89.contact@gmail.com"',(err,row)=>{
        if(err){
            console.log("error",err.message)
        }else{
            if (row.length === 0) {
                const stm = db.prepare('INSERT INTO account (email,password,createAt) VALUES(?,?,?)');
                const response = stm.run("rodrigue89.contact@gmail.com",hashedPassword,new Date())
                console.log("staement",response) 
            }else{
                console.log("utilisateur existe deja")
            }
        }
    })
}

export const addClient = async(clientData:Client,service:Services):Promise<{clientLang:"fr"|"de"|"en"}>=>{
    console.log("client",clientData)
    return new Promise((resolve:any,reject:any)=>{
        try {
            db.get(`SELECT email,fname,lname FROM clients WHERE email = ? AND lname = ? AND fname = ?`,[clientData.email ?? null,clientData.lname,clientData.fname],(err:Error|null,row:any)=>{
                if(err){
                    reject(new Error(`Erreur de la requete ${err.message}`))
                }
                if(!row){
                    db.get(`SELECT * FROM clients ORDER BY clientId DESC LIMIT 1`,[],(err:Error|null,row:any)=>{
                        if(err){
                            reject(new Error(`Erreur de la requete ${err.message}`))
                        }
                        db.run(`INSERT INTO clients(lname,fname,taxId,email,address,clientNumber,invoiceCount,clientLang,clientType,modifDate,phone,clientStatus,createAt) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)`,[clientData.lname,clientData.fname,(clientData.taxId === '' || !clientData.taxId) ? null : clientData.taxId,clientData.email,null, row ? (row.clientId + 1) : 100,0,clientData.clientLang,clientData.clientType,new Date(),clientData.phone,clientData.clientStatus,new Date()],async function(err:Error|null){
                            if(err){
                                reject(new Error(`Erreur de la requete ${err.message}`))
                            }

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
            db.run(`INSERT INTO services(serviceType,contractStatus,client) VALUES(?,?,?)`,[service.serviceType,service.contractStatus,service.clientId],function(err){
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
            c.taxId as taxId,
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
            db.run(`UPDATE webconfig SET lastUpdate = ? WHERE webpage = ?`,[new Date(config.lastUpdate),config.webpage],(err)=>{
                if(err){
                    reject(new Error(`Erreur de la requete ${err.message}`))
                }else{
                    resolve(true)
                }
            })
        }else{
            db.run(`INSERT INTO webconfig (webpage,lastUpdate) VALUES (?,?)`,[config.webpage,new Date(config.lastUpdate)],(err)=>{
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

export const addWebConfig = async()=>{
    try {
        const data = [["cgv",new Date()],["legal-notices",new Date()],["privacie-policies",new Date()]]
    
        data.forEach((item)=>{
            db.run(`INSERT INTO webconfig (webpage,lastUpdate) VALUES(?,?)`,item,(err)=>{
                if(err) console.log("erreur",err.message)
            })
        })

    } catch (error) {
        console.log("erreur",error)
    }
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
            c.taxId as taxId,
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


export const updateClient = async(client:Client):Promise<boolean> =>{
  return new Promise((resolve:any,reject:any)=>{
    try {
        db.run(`UPDATE clients SET fname = ?, lname = ?, clientStatus = ?, taxId = ?, clientType = ?, modifDate = ?, email = ?, clientLang = ?, phone = ?`,[client.fname,client.lname,client.clientStatus,client.taxId,client.clientType,new Date(client.modifDate),client.email,client.clientLang,client.phone],(err)=>{
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

export const saveContract = async (contractData:Contract,clientId:number,addressId:number,serviceId:number,prestataireId:number,mode:"add"|"update",from:"prestataire"|"client",contractId:number|undefined):Promise<boolean>=>{
    return new Promise((resolve:any,reject:any)=>{
        try {
            if (from === "prestataire") {
                if(mode === "add"){
                    db.run(`INSERT INTO contracts(service,prestataire,maintenanceCategory,maintenancePrice,taxPrice,taxPercent,projectTitle,
                        projectDescription,startDate,endDate,saveDate,totalPrice,paymentSchedule,saleTermeConditionValided,
                        electronicContractSignatureAccepted,rigthRetractionLostAfterServiceBegin) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
                        [serviceId,prestataireId,contractData.prestataireGivingData?.maintenanceCategory ?? null,null,
                        contractData.prestataireGivingData?.taxPrice ?? 0, contractData.prestataireGivingData?.taxPercent ?? 0,
                        contractData.prestataireGivingData?.projectTitle ?? '', contractData.prestataireGivingData?.projectDescription ?? '',
                        new Date(contractData.prestataireGivingData?.startDate ?? new Date()), new Date(contractData.prestataireGivingData?.endDate ?? new Date()),null,
                        contractData.prestataireGivingData?.totalPrice ?? 0,contractData.prestataireGivingData?.paymentSchedule ?? "",null,null,null],

                        async function(err){
                            if(err){
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
                        reject(new Error(`Contract Id manquant`))
                    } else {
                        db.run(`UPDATE contracts SET taxPrice = ?,taxPercent = ?,projectTitle = ?,
                            projectDescription = ?,startDate = ?,endDate = ?,totalPrice = ?,paymentSchedule = ? WHERE contractId = ?`,
                            [contractData.prestataireGivingData?.taxPrice ?? 0, contractData.prestataireGivingData?.taxPercent ?? 0,contractData.prestataireGivingData?.projectTitle ?? '',contractData.prestataireGivingData?.projectDescription ?? '',
                            new Date(contractData.prestataireGivingData?.startDate ?? new Date()), new Date(contractData.prestataireGivingData?.endDate ?? new Date()),
                            contractData.prestataireGivingData?.totalPrice ?? 0,contractData.prestataireGivingData?.paymentSchedule ?? '',contractId],async function(err){
                                if(err){
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
                if (mode === "update") {
                    //console.log("contract",contractData)
                    db.run(`UPDATE contracts SET maintenancePrice = ?,saveDate = ?,saleTermeConditionValided = ?,
                        electronicContractSignatureAccepted = ?,rigthRetractionLostAfterServiceBegin = ? WHERE contractId = ?`,
                        [contractData.maintenancePrice ?? null,new Date(),contractData.saleTermeConditionValided ?? null,contractData.electronicContractSignatureAccepted ?? null,
                        contractData.rigthRetractionLostAfterServiceBegin],
                        async function(err){
                            if(err){
                                reject(new Error(`Erreur de la requete ${err.message}`))
                            }else{
                                const response = await addAddress(addressId,clientId,contractData.clientGivingData?.addressClient,contractData.clientGivingData,serviceId,contractData.clientGivingData?.maintenanceType ?? null)
                                if (response.success) {
                                    resolve(true)
                                } else {
                                    reject(new Error(response.message))
                                }
                            }
                    })
                }else{
                    resolve(true)
                }
            }
        } catch (error) {
            console.log("error",error)
            reject(new Error(`Erreur de la requete ${error}`))
        }
    })
}

export const updateClientByContract = async(client:contractFormClient|null,clientId:number,addressId:number):Promise<boolean>=>{
    return new Promise((resolve:any,reject:any)=>{
        if(!client){
            reject(new Error(`Client absent`))
        }else{
            try {
                db.run(`UPDATE clients SET fname = ?, lname = ?, email = ?, clientType = ?, phone = ?, taxId = ?, modifDate = ?, address = ? WHERE clientId = ?`,
                    [client.fname,client.lname,client.email ?? "",client.clientType, client.phone ?? "", client.taxId ?? "", new Date(client.modifDate), addressId, clientId],
                (err)=>{
                    if(err){
                        reject(new Error(`Erreur de la requete ${err.message}`))
                    }else{
                        resolve(true)
                    }
                })
            } catch (error) {
                reject(new Error(`Erreur de la requete ${error}`))
            }
        }
    })
}

const addState = async(state:clientState|null):Promise<{success:boolean,message?:string,stateId:number}>=>{
    return new Promise((resolve:any,reject:any)=>{
        try {
            if (state) {
                db.run(`INSERT INTO clientState(id,name,tax,vat,stateCode) VALUES(?,?,?,?,?)`,
                    [state.id,state.name,state.tax,state.vat,state.stateCode],function(err){
                    if(err){
                        console.log("erreur",err.message)
                        resolve({success:false,message:"Une erreur s'est produit lors de l'operation, Veillez recommencé dans quelque instant."})
                    }else{
                        resolve({success:true,stateId:this.lastID})
                    }
                })
            } else {
                resolve({success:false,message:"Une erreur s'est produit lors de l'operation, Veillez recommencé dans quelque instant."})
            }
        } catch (error) {
            reject(new Error(`Erreur de la requete ${error}`))
        }
    })
}

const addAddress = async(addressId:number,clientId:number,addressClient:clientAddress|undefined,client:contractFormClient|null,serviceId:number,maintenanceType:"perHour"|"perYear"|null):Promise<{success:boolean,message?:string}>=>{ 
    return new Promise(async(resolve:any,reject:any)=>{
        try {
            if (addressClient && client) {
                if (addressClient.clientCountry?.clientState) {
                    const result = await addState(addressClient.clientCountry.clientState)
                    if (result.success) {
                        const response = await handleAddressAdding(addressClient.clientCountry,addressClient.street,addressClient.postalCode,addressClient.city,result.stateId ?? null,addressId,clientId,serviceId,client,maintenanceType)
                        if (response.success) {
                            resolve({success:true})
                        } else {
                            resolve({success:false,message:response.message})
                        }
                    } else {
                        resolve({success:false,message:result.message})
                    }
                }
                
            } else {
                console.log("Definir un client")
                resolve({success:false,message:"Vous n'avez pas remplis tous les champs"})
            }
        } catch (error) {
            reject(new Error(`Erreur de la requete ${error}`))
        }
    })
}

const handleAddressAdding = async(country:clientCountry,street:string,postalCode:string,city:string,stateId:number|null,addressId:number,clientId:number,serviceId:number,client:contractFormClient,maintenanceType:"perHour"|"perYear"|null):Promise<{success:boolean,message:string}>=>{
    console.log("specificto",country.specficTo)
    return new Promise((resolve:any,reject:any)=>{
        try {
            db.run(`INSERT INTO clientCountry(itemId,name,taxB2B,taxB2C,groupe,currency,isoCode,thresholdBeforeTax,specificTo,vat,state) VALUES(?,?,?,?,?,?,?,?,?,?,?)`,
                [country.itemId ?? "",country?.name ?? "",country?.taxB2B ?? "",
                country.taxB2C ?? "", country?.groupe ?? "",
                country.currency ?? "USD", country?.isoCode ?? "",
                country.threshold_before_tax ?? 0,country?.specficTo ?? "country",
                country.vat ?? null,stateId],function(err){
                if(err){
                    console.log("erreur",err.message)
                    resolve({success:false,message:"Une erreur s'est produit lors de l'operation, Veillez recommencé dans quelque instant."})
                }else{
                    db.run(`DELETE FROM address WHERE addressId = ?`,[addressId],function(err){
                        if(err){
                            console.log("erreur",err.message)
                            resolve({success:false,message:"Une erreur s'est produit lors de l'operation, Veillez recommencé dans quelque instant."})
                        }else{
                            db.run(`INSERT INTO address(street,postalCode,city,country) VALUES(?,?,?,?)`,
                                [street ?? "",postalCode ?? "",city ?? "",this.lastID
                                ],async function(err){
                                if(err){
                                    console.log("erreur",err.message)
                                    resolve({success:false,message:"Une erreur s'est produit lors de l'operation, Veillez recommencé dans quelque instant."})
                                }else{
                                    await updateServiceMaintenanceType(serviceId,maintenanceType)
                                    await updateClientByContract(client,clientId,this.lastID)
                                    resolve({success:true})
                                }
                            })
                        }
                    })
                }
            })
        } catch (error) {
            reject(new Error(`Erreur de la requete ${error}`))
        }
    })
}

const updateServiceMaintenanceType = async(serviceId:number,maintenanceType:"perHour"|"perYear"|null):Promise<boolean>=>{ 
    return new Promise((resolve:any,reject:any)=>{
        try {
            db.run(`UPDATE services SET maintenanceType = ? WHERE serviceId = ?`,[maintenanceType ?? null,serviceId],(err)=>{
                if(err){
                    reject(new Error(`Erreur de la requete ${err.message}`))
                }else{
                    //console.log("updated")
                    resolve(true)
                }
            })
        } catch (error) {
            reject(new Error(`Erreur de la requete ${error}`))
        }
    })
}

export const updateContractStatus = async(serviceId:number,status:"unsigned"|"pending"|"signed"):Promise<boolean>=>{
    //console.log("status",status,serviceId)
    return new Promise((resolve:any,reject:any)=>{
        try {
            db.run(`UPDATE services SET contractStatus = ? WHERE serviceId = ?`,[status,serviceId],(err)=>{
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

const addFeature = async(features:{title:string,description:string,quantity:number,price:number}[],contractId:number):Promise<boolean>=>{
    return new Promise((resolve:any,reject:any)=>{
        try {
            db.run(`DELETE FROM features WHERE serviceFeature = ?`,[contractId],(err)=>{
                if(err){
                    reject(new Error(`Erreur de la requete ${err.message}`))
                }
                features.forEach((item)=>{
                    db.run(`INSERT INTO features (title,description,quantity,price,serviceFeature) VALUES(?,?,?,?,?)`,[item.title,item.description,item.quantity,item.price,contractId],(err)=>{
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
    //console.log("ids",clientId,clientServiceId,prestataireId)
    return new Promise((resolve:any,reject:any)=>{
        try {
           db.get(`SELECT 
                c.clientId as clientId,
                c.lname as lname,
                c.fname as fname,
                c.taxId as taxId,
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
                            'street',d.street,
                            'city',d.city,
                            'postalCode',d.postalCode,
                            'country',d.country,
                            'clientCountry', COALESCE(
                                (
                                    SELECT JSON_OBJECT(
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
                                                    'name',i.name,
                                                    'tax',i.tax,
                                                    'vat',i.vat,
                                                    'stateCode',i.stateCode
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
                        SELECT JSON_GROUP_ARRAY(
                            JSON_OBJECT(
                                'serviceId',s.serviceId,
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
                                            'paymentSchedule',t.paymentSchedule,
                                            'saleTermeConditionValided',t.saleTermeConditionValided,
                                            'electronicContractSignatureAccepted',t.electronicContractSignatureAccepted,
                                            'rigthRetractionLostAfterServiceBegin',t.rigthRetractionLostAfterServiceBegin,
                                            'freelancer',COALESCE(
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
                                            ),
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
                    //console.log("row",row)
                    resolve(row)
                }
            }) 
        } catch (error) {
            reject(new Error(`Erreur de la requete ${error}`))
        }
    })
}

export const checkClientTaxability = async(juridiction:string)=>{
  
}
