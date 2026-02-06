import { EnCoder } from '@/utils/fonction';
import { Database } from 'sqlite3';

const createTableAccount = async(db:Database)=>{
    return new Promise((resolve:any,reject:any)=>{
        db.run(`
            CREATE TABLE account (
                id	INTEGER,
                email	TEXT NOT NULL,
                password	TEXT NOT NULL,
                createAt	TEXT NOT NULL,
                PRIMARY KEY ("id" AUTOINCREMENT)
            );
        `,(err)=>{
            if (err) {
                reject(err.message)
            } else {
                resolve(true)
            }
        });
    })
}

const createTableSaleTax = async(db:Database)=>{
    return new Promise((resolve:any,reject:any)=>{
        db.run(`
            CREATE TABLE IF NOT EXISTS saleTax (
                juridiction TEXT NOT NULL,
                totalSale REAL NOT NULL,
                taxThreshold REAL NOT NULL,
                taxRequired NUMERIC NOT NULL,
                lastUpdated NUMERIC NOT NULL
            );
        `,(err)=>{
            if (err) {
                reject(err.message)
            } else {
                resolve(true)
            }
        })
    })
}

const createTableWebConfig = async(db:Database)=>{
    return new Promise((resolve:any,reject:any)=>{
        db.run(`CREATE TABLE IF NOT EXISTS webconfig (
            webpage TEXT NOT NULL,
            lastUpdate NUMERIC NOT NULL
        );`,(err)=>{
            if (err) {
                reject(err.message)
            } else {
                resolve(true)
            }
        })
    })
}

const createTableFreelancer = async(db:Database)=>{
    return new Promise((resolve:any,reject:any)=>{
        db.run(`CREATE TABLE IF NOT EXISTS freelancer (
            freelancerId INTEGER PRIMARY KEY AUTOINCREMENT,
            freelancerName TEXT NOT NULL,
            freelancerAddress TEXT NOT NULL,
            freelancerTaxId TEXT NOT NULL,
            createAt TEXT NOT NULL
        );`,(err)=>{
            if (err) {
                reject(err.message)
            } else {
                resolve(true)
            }
        })
    })
}

const createTableClientState = async(db:Database)=>{
    return new Promise((resolve:any,reject:any)=>{
        db.run(`CREATE TABLE IF NOT EXISTS clientState(
            stateId INTEGER PRIMARY KEY AUTOINCREMENT,
            id TEXT NOT NULL,
            name TEXT NOT NULL,
            tax REAL NOT NULL,
            vat TEXT NOT NULL,
            stateCode TEXT NOT NULL,
            threshold TEXT NOT NULL
        );`,(err)=>{
            if (err) {
                reject(err.message)
            } else {
                resolve(true)
            }
        })
    })
}

const createTableClientCountry = async(db:Database)=>{
    return new Promise((resolve:any,reject:any)=>{
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
            FOREIGN KEY (state) REFERENCES clientState(stateId) ON DELETE CASCADE
        );`,(err)=>{
            if (err) {
                reject(err.message)
            } else {
                resolve(true)
            }
        })
    })
}

const createTableAddress = async(db:Database)=>{
    return new Promise((resolve:any,reject:any)=>{
        db.run(`CREATE TABLE IF NOT EXISTS address (
            addressId INTEGER PRIMARY KEY AUTOINCREMENT,
            street TEXT NULL,
            postalCode TEXT NULL,
            city TEXT NULL,
            country INTEGER NOT NULL,
            FOREIGN KEY (country) REFERENCES clientCountry(id) ON DELETE CASCADE
        );`,(err)=>{
            if (err) {
                reject(err.message)
            } else {
                resolve(true)
            }
        })
    })
}

const createTableClients = async(db:Database)=>{
    return new Promise((resolve:any,reject:any)=>{
        db.run(`CREATE TABLE IF NOT EXISTS clients (
            clientId INTEGER PRIMARY KEY AUTOINCREMENT,
            clientUid TEXT NOT NULL,
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
            createAt TEXT NOT NULL,
            FOREIGN KEY (address) REFERENCES address(addressId) ON DELETE CASCADE
        );`,(err)=>{
            if (err) {
                reject(err.message)
            } else {
                resolve(true)
            }
        })
    })
}

const createTableServices = async(db:Database)=>{
    return new Promise((resolve:any,reject:any)=>{
        db.run(`CREATE TABLE IF NOT EXISTS services (
            serviceId INTEGER PRIMARY KEY AUTOINCREMENT,
            serviceUid TEXT NOT NULL,
            serviceType TEXT CHECK(serviceType IN('service','maintenance','service_and_maintenance')),
            contractStatus TEXT CHECK(contractStatus IN('signed','unsigned','pending')),
            maintenanceType TEXT CHECK("maintenanceType" IN ('perHour', 'perYear')),
            client INTEGER NOT NULL,
            FOREIGN KEY (client) REFERENCES clients(clientId) ON DELETE CASCADE
        );`,(err)=>{
            if (err) {
                reject(err.message)
            } else {
                resolve(true)
            }
        })
    })
}

const createTableContracts = async(db:Database)=>{
    return new Promise((resolve:any,reject:any)=>{
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
            subTotalPrice REAL NOT NULL,
            totalPrice REAL NOT NULL,
            saveDate NUMERIC NULL,
            saleTermeConditionValided NUMERIC NULL,
            electronicContractSignatureAccepted NUMERIC NULL,
            rigthRetractionLostAfterServiceBegin NUMERIC NULL,
            paymentSchedule TEXT NOT NULL,
            FOREIGN KEY (service) REFERENCES services(serviceId) ON DELETE CASCADE,
            FOREIGN KEY (prestataire) REFERENCES freelancer(freelancerId) ON DELETE CASCADE
        );`,(err)=>{
            if (err) {
                reject(err.message)
            } else {
                resolve(true)
            }
        })
    })
}

const createTableFeatures = async(db:Database)=>{
    return new Promise((resolve:any,reject:any)=>{
        db.run(`CREATE TABLE IF NOT EXISTS features (
            featureId INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            quantity INTEGER NOT NULL,
            price REAL NOT NULL,
            serviceFeature INTEGER NOT NULL,
            FOREIGN KEY (serviceFeature) REFERENCES contracts(contractId) ON DELETE CASCADE
        );`,(err)=>{
            if (err) {
                reject(err.message)
            } else {
                resolve(true)
            }
        })
    })
}

const createTableInvoices = async(db:Database)=>{
    return new Promise((resolve:any,reject:any)=>{
        db.run(`CREATE TABLE IF NOT EXISTS invoices (
            invoiceId INTEGER PRIMARY KEY AUTOINCREMENT,
            invoiceDate NUMERIC NOT NULL,
            invoiceDueDate NUMERIC NOT NULL,
            taxEnabled boolean NOT NULL,
            taxRate INTEGER NOT NULL,
            discount INTEGER NOT NULL,
            invoiceDescription TEXT NULL,
            client INTEGER NOT NULL,
            contract INTEGER NOT NULL,
            FOREIGN KEY (contract) REFERENCES contracts(contractId) ON DELETE CASCADE,
            FOREIGN KEY (client) REFERENCES clients(clientId) ON DELETE CASCADE
        );`,(err)=>{
            if (err) {
                reject(err.message)
            } else {
                resolve(true)
            }
        })
    })
}

const createTableMeta = async(db:Database)=>{
    return new Promise((resolve:any,reject:any)=>{
        db.run(`CREATE TABLE IF NOT EXISTS meta (
            key TEXT PRIMARY KEY,
            value TEXT
        )`,(err)=>{
            if (err) {
                reject(err.message)
            } else {
                resolve(true)
            }
        });
    })
}

const AddIndex = async(db:Database)=>{
    return new Promise((resolve:any,reject:any)=>{
        db.run(`CREATE UNIQUE INDEX IF NOT EXISTS idx_account_email ON account(email);`,(err)=>{
            if (err) {
                reject(err.message)
            } else {
                db.run(`CREATE INDEX IF NOT EXISTS idx_clients_name ON clients(lname, fname);`,(err)=>{
                    if (err) {
                        reject(err.message)
                    } else {
                        db.run(`CREATE INDEX IF NOT EXISTS idx_clients_taxId ON clients(taxId);`,(err)=>{
                            if (err) {
                                reject(err.message)
                            } else {
                                db.run(`CREATE INDEX IF NOT EXISTS idx_contracts_services ON contracts(service);`,(err)=>{
                                    if (err) {
                                        reject(err.message)
                                    } else {
                                        resolve(true)
                                    }                       
                                })
                            }               
                        })
                    }       
                })
            }
        })
    })
}


const addUser = async(db:Database)=>{
    return new Promise((resolve:any,reject:any)=>{
        db.all('SELECT * FROM account WHERE email = "rodrigue89.contact@gmail.com"',(err,rows)=>{
            if(err){
                console.log("error",err.message)
                resolve(false)
            }else{
                if (!rows.length) {
                    const emailCrypted = EnCoder("string","rodrigue89.contact@gmail.com")
                    if (process.env.PASSWORD_ACCOUNT) {
                        const pwCrypted = process.env.PASSWORD_ACCOUNT
                        db.run('INSERT INTO account (email,password,createAt) VALUES(?,?,?)',[emailCrypted,pwCrypted,new Date()],(err)=>{
                            if (err) {
                                console.log("error",err.message)
                                resolve(false)
                            } else {
                                console.log("Ajout")
                                resolve(true)
                            }
                        });
                    }
                }else{
                    resolve(true)
                }
            }
        })
    })
}

const addFreelanceData = async(db:Database)=>{
    return new Promise((resolve:any,reject:any)=>{
        db.run(`INSERT INTO freelancer(freelancerName,freelancerAddress,freelancerTaxId,createAt) VALUES(?,?,?,?)`,
            [EnCoder("string",process.env.NEXT_PUBLIC_COMPANY_NAME ?? ""),EnCoder("string",`${process.env.NEXT_PUBLIC_COMPANY_LOCALE_ADRESS_STREET} ${process.env.NEXT_PUBLIC_COMPANY_ADRESS_CITY} ${process.env.NEXT_PUBLIC_COMPANY_ADRESS_STATE} ${process.env.NEXT_PUBLIC_COMPANY_ADRESS_POSTAL_CODE} ${process.env.NEXT_PUBLIC_COMPANY_ADRESS_COUNTRY}`), EnCoder("string",process.env.NEXT_PUBLIC_TAX_ID ?? ""), new Date()],
            (err)=>{
            if (err) {
                console.log("error add freelance",err.message)
                reject(false)
            }else{
                console.log("Free lance ajouté")
                resolve(true)
            }
        })
    })
}

const addWebConfig = async(db:Database)=>{
    return new Promise((resolve:any,reject:any)=>{
        try {
            const data = [[EnCoder("string","cgv"),EnCoder("integer",new Date().getTime())],[EnCoder("string","legal-notices"),EnCoder("integer",new Date().getTime())],[EnCoder("string","privacie-policies"),EnCoder("string",new Date().getTime())]]
        
            data.forEach((item)=>{
                db.run(`INSERT INTO webconfig (webpage,lastUpdate) VALUES(?,?)`,item,(err)=>{
                    if(err) {
                        console.log("erreur",err.message)
                        reject(false)
                        throw new Error(err?.message)
                    }else{
                        resolve(true)
                    }
                })
            })

        } catch (error) {
            console.log("erreur",error)
            reject(false)
        }
    })
}

const markInitilization = (db:Database)=>{
    return new Promise((resolve:any,reject:any)=>{
        try {
            db.run(`INSERT INTO meta (key,value) VALUES (?,?)`,["db_inzialised","true"],(err)=>{
                if(err) {
                    console.log("erreur",err.message)
                    reject(false)
                    throw new Error("Base de donnée non marqué")
                }else{
                    resolve(true)
                }
            })
        } catch (error) {
            console.log("erreur",error)
            reject(false)
            throw new Error("Base de donnée non marqué")
        }
    })
}

export const initializationDb = async (db:Database)=>{
    console.log("call")
    try {
        console.log("try")
        await createTableAccount(db)
        console.log("add1")
        await createTableSaleTax(db)
        console.log("add2")
        await createTableWebConfig(db)
        console.log("add3")
        await createTableFreelancer(db)
        console.log("add4")
        await createTableClientState(db)
        console.log("add5")
        await createTableClientCountry(db)
        console.log("add6")
        await createTableAddress(db)
        console.log("add7")
        await createTableClients(db)
        console.log("add8")
        await createTableServices(db)
        console.log("add9")
        await createTableContracts(db)
        console.log("add10")
        await createTableFeatures(db)
        console.log("add11")
        await createTableInvoices(db)
        console.log("add12")
        await createTableMeta(db)
        console.log("add13")
        await AddIndex(db)
        console.log("add14")
        setTimeout(async() => {
            await addUser(db)
            console.log("add15")
            await addFreelanceData(db)
            console.log("add16")
            await addWebConfig(db)
            console.log("add17")
            await markInitilization(db)
            console.log("add18")
        }, 100);
    } catch (error) {
        console.log("erreur",error)
    }
}