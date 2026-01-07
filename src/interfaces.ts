export interface Client {
    clientId?: string;
    taxId?:string;
    fname:string;
    lname:string;
    email?:string;
    modifDate:Date;
    clientNumber:number;
    invoiceCount?:number;
    clientLang:string;
    clientStatus:"actived"|"desactived";
    clientType:"company"|"particular"|null;
    services?:Services[]|string
}

export interface Services {
    clientId:number;
    serviceId?:string;
    serviceType: "service"|"maintenance"|"service_and_maintenance";
    contractStatus: 'signed' | 'unsigned' | 'pending';
}