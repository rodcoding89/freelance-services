"use server"

import { Client, Services } from '@/interfaces';
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
        CREATE TABLE IF NOT EXISTS saleTax (
            juridiction TEXT NOT NULL,
            totalSale REAL NOT NULL,
            taxThreshold REAL NOT NULL,
            taxRequired NUMERIC NOT NULL,
            lastUpdated NUMERIC NOT NULL
        );
        CREATE TABLE IF NOT EXISTS webconfig (
            webpage TEXT NOT NULL,
            lastUpdate NUMERIC NOT NULL
        );
        CREATE TABLE IF NOT EXISTS freelancer (
            freelancerId INTEGER PRIMARY KEY AUTOINCREMENT,
            freelancerName TEXT NOT NULL,
            freelanceraddress TEXT NOT NULL,
            createAt NUMERIC NOT NULL
        );
        CREATE TABLE IF NOT EXISTS state(
            stateId INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            tax REAL NOT NULL,
            vat TEXT NOT NULL,
            stateCode TEXT NOT NULL,
            threshold REAL NOT NULL
        );
        CREATE TABLE IF NOT EXISTS country (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            taxB2B TEXT NOT NULL,
            taxB2C TEXT NOT NULL,
            groupe TEXT NOT NULL,
            currency TEXT NOT NULL,
            isoCode TEXT NOT NULL,
            thresholdBeforeTax REAL NOT NULL,
            specificTo TEXT CHECK(specificTo IN("state","country")),
            vat TEXT NULL,
            state INTEGER NULL,
            FOREIGN KEY (state) REFERENCES state(stateId) ON DELETE CASCADE
        );
        CREATE TABLE IF NOT EXISTS address (
            addressId INTEGER PRIMARY KEY AUTOINCREMENT,
            street TEXT NULL,
            postalCode TEXT NULL,
            city TEXT NULL,
            country INTEGER,
            FOREIGN KEY (country) REFERENCES country(id) ON DELETE CASCADE
        );
        CREATE TABLE IF NOT EXISTS clients (
            clientId INTEGER PRIMARY KEY AUTOINCREMENT,
            lname TEXT NOT NULL,
            fname TEXT NOT NULL,
            taxId TEXT NULL,
            email TEXT NULL,
            address INTEGER NULL,
            clientNumber INTEGER NOT NULL,
            invoiceCount INTEGER NOT NULL,
            clientLang TEXT CHECK(clientLang IN("fr","en","de")) NOT NULL,
            clientType TEXT CHECK(clientType IN("company","particular")) NOT NULL,
            modifDate NUMERIC NOT NULL,
            maintenanceType TEXT CHECK(maintenanceType IN("perHour","perYear")) NULL,
            phone TEXT NULL,
            clientStatus TEXT CHECK(clientStatus IN("actived","desactived")) NOT NULL,
            createAt NUMERIC NOT NULL,
            FOREIGN KEY (address) REFERENCES address(addressId) ON DELETE CASCADE
        );
        CREATE TABLE IF NOT EXISTS services (
            serviceId INTEGER PRIMARY KEY AUTOINCREMENT,
            serviceType TEXT CHECK(serviceType IN("service","maintenance","service_and_maintenance")),
            contractStatus TEXT CHECK(contractStatus IN("signed","unsigned","pending")),
            client INTEGER NOT NULL,
            FOREIGN KEY (client) REFERENCES clients(clientId) ON DELETE CASCADE
        );
        CREATE TABLE IF NOT EXISTS contracts (
            contractId INTEGER PRIMARY KEY AUTOINCREMENT,
            client INTEGER NOT NULL,
            prestataire INTEGER NOT NULL,
            maintenanceCategory TEXT CHECK(maintenanceCategory IN("app","saas","web")) NULL,
            maintenancePrice REAL NULL,
            taxPrice REAL NOT NULL,
            projectTitle TEXT NOT NULL,
            projectDescription TEXT NOT NULL,
            startDate NUMERIC NOT NULL,
            endDate NUMERIC NOT NULL,
            totalPrice REAL NOT NULL,
            saveDate NUMERIC NOT NULL,
            saleTermeConditionValided NUMERIC NULL,
            electronicContractSignatureAccepted NUMERIC NULL,
            rigthRetractionLostAfterServiceBegin NUMERIC NULL,
            paymentSchedule TEXT NOT NULL,
            FOREIGN KEY (client) REFERENCES clients(clientId) ON DELETE CASCADE
        );
        CREATE TABLE IF NOT EXISTS features (
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            quantity INTEGER NOT NULL,
            price REAL NOT NULL,
            serviceFeature INTEGER NOT NULL,
            FOREIGN KEY (serviceFeature) REFERENCES contracts(contractId) ON DELETE CASCADE
        );
        CREATE TABLE IF NOT EXISTS invoices (
            invoiceId INTEGER PRIMARY KEY AUTOINCREMENT,
            invoiceDate NUMERIC NOT NULL,
            ivoiceDueDate NUMERIC NOT NULL,
            client INTEGER NOT NULL,
            contract INTEGER NOT NULL,
            FOREIGN KEY (contract) REFERENCES contracts(contractId) ON DELETE CASCADE
            FOREIGN KEY (client) REFERENCES clients(clientId) ON DELETE CASCADE
        );
        CREATE UNIQUE INDEX IF NOT EXISTS idx_account_email ON account(email);
        CREATE INDEX IF NOT EXISTS idx_clients_name ON clients(lname, fname);
        CREATE INDEX IF NOT EXISTS idx_clients_taxId ON clients(taxId);
        CREATE INDEX IF NOT EXISTS idx_contracts_client ON contracts(client);
    `);
  });
}

export const sign = async(email:string,pw:string):Promise<{uid:string}>=>{
    return new Promise((resolve:any,reject:any)=>{
        try {
            db.get(`SELECT * FROM account WHERE email = ?`,[email],async(err:Error|null,row:any)=>{
                
                const isPasswordValid = await bcrypt.compare(pw, row.password);

                if (err) {
                    reject(new Error("Erreur lors de la requete "+err.message))
                }

                if(!row){
                    reject(new Error("Utilisateur pas trouvé"))
                }
                
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
    const hashedPassword = await bcrypt.hash(process.env.PW ?? "", salt);
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
                        db.run(`INSERT INTO clients(lname,fname,taxId,email,address,clientNumber,invoiceCount,clientLang,clientType,modifDate,maintenanceType,phone,clientStatus,createAt) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,[clientData.lname,clientData.fname,(clientData.taxId === '' || !clientData.taxId) ? null : clientData.taxId,clientData.email,null, row ? (row.clientId + 1) : 100,0,clientData.clientLang,clientData.clientType,new Date(),null,null,clientData.clientStatus,new Date()],async function(err:Error|null){
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
            subQuery.clientId as clientId,
            subQuery.lname as lname,
            subQuery.fname as fname,
            subQuery.taxId as taxId,
            subQuery.email as email,
            subQuery.clientNumber as clientNumber,
            subQuery.invoiceCount as invoiceCount,
            subQuery.clientLang as clientLang,
            subQuery.clientType as clientType,
            subQuery.modifDate as modifDate,
            subQuery.maintenanceType as maintenanceType,
            subQuery.phone as phone,
            subQuery.clientStatus as clientStatus,
            subQuery.address as address,
            CONCAT(
            "[",
            GROUP_CONCAT(
                JSON_OBJECT(
                    'serviceId',subQuery.serviceId,
                    'serviceType',subQuery.serviceType,
                    'contractStatus',subQuery.contractStatus,
                    'clientId',subQuery.client
                )
            ),
            "]"
            ) as services FROM (SELECT c.*,s.* FROM clients c INNER JOIN services s ON s.client = c.clientId) as subQuery;`,[],(err:Error|null,rows)=>{
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
        db.run(`UPDATE clients SET status = ? HWERE clientId = ?`,[status,clientId],(err)=>{
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
    } finally{
        db.close()
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
            subQuery.clientId as clientId,
            subQuery.lname as lname,
            subQuery.fname as fname,
            subQuery.taxId as taxId,
            subQuery.email as email,
            subQuery.clientNumber as clientNumber,
            subQuery.invoiceCount as invoiceCount,
            subQuery.clientLang as clientLang,
            subQuery.clientType as clientType,
            subQuery.modifDate as modifDate,
            subQuery.maintenanceType as maintenanceType,
            subQuery.phone as phone,
            subQuery.clientStatus as clientStatus,
            subQuery.address as address,
            CONCAT(
            "[",
            GROUP_CONCAT(
                JSON_OBJECT(
                    'serviceId',subQuery.serviceId,
                    'serviceType',subQuery.serviceType,
                    'contractStatus',subQuery.contractStatus,
                    'clientId',subQuery.client
                )
            ),
            "]"
            ) as services FROM (SELECT c.*,s.* FROM clients c INNER JOIN services s ON s.client = c.clientId WHERE clientId = ?) as subQuery;`,[clientId],(err:Error|null,row)=>{
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
        db.run(`UPDATE clients SET fname = ?, lname = ?, clientStatus = ?, taxId = ?, clientType = ?, modifDate = ?, email = ?, clientLang = ?`,[client.fname,client.lname,client.clientStatus,client.taxId,client.clientType,client.modifDate,client.email,client.clientLang],(err)=>{
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
