export interface Client {
    clientId?: number;
    clientUid:string;
    taxId?:string;
    fname:string;
    lname:string;
    email?:string;
    address?:number,
    phone?:string,
    modifDate:Date|string|number;
    clientNumber:number;
    invoiceCount?:number;
    clientLang:"fr"|"en"|"de",
    clientStatus:"actived"|"desactived";
    clientType:"company"|"particular"|null;
}


export interface Services {
    clientId:number;
    serviceId?:number;
    serviceUid:string
    maintenanceType?:"perHour"|"perYear"|null;
    serviceType: "service"|"maintenance"|"service_and_maintenance";
    contractStatus: 'signed' | 'unsigned' | 'pending';
}

export interface clientServiceDb{
    clientId:number,
    lname:string,
    fname:string,
    taxId:string,
    email:string,
    clientUid:string,
    clientNumber:string|number,
    invoiceCount:string|number,
    clientLang:"fr"|"en"|"de",
    modifDate:string,
    phone:string,
    clientStatus:"actived"|"desactived";
    clientType:"company"|"particular";
    maintenanceType?:"perHour"|"perYear"|null;
    address:number,
    services:string|Services[]
}

export interface clientServiceList extends Client{
    services:Services[]
}

export interface serviceDb extends Services{
    contract?:ContractDb
}

export interface clientServiceContractDB extends Client{
    freelancer:string|freelancer,
    addressClient?:clientAddress,
    saveDate:Date|string|number;
    maintenanceType?:"perHour"|"perYear"|null
    services:serviceDb[],
    invoiceId:number
}

export interface ContractDb extends prestationInfo,contractFormClient{
    contractId:number,
    features:{title:string,description:string,quantity:number,price:number}[]|string
    maintenancePrice?:number|string;
    contractType?:"unsigned"|"pending"|"signed",
    saleTermeConditionValided?:boolean|string;
    electronicContractSignatureAccepted?:boolean|string;
    rigthRetractionLostAfterServiceBegin?:boolean|string;
}

export interface clientState {
    id:string,
    stateId?:number,
    name:string,
    tax:number,
    vat:string,
    stateCode:string,
    threshold:number
}

export interface clientCountry {
    id?:number,
    itemId:string,
    name:string,
    taxB2C:string,
    taxB2B:string,
    groupe:string,
    currency:string,
    isoCode:string,
    threshold_before_tax:number,
    specificTo:"state"|"country",
    state?:number,
    vat?:string,
    clientState:clientState|null
}

export interface invoiceSendData{
    invoiceId?:number
    invoiceName:string,
    invoiceCount:number,
    invoiceDate:number,
    ivoiceDueDate:number,
    taxEnabled: boolean;
    clientId:number,
    taxRate: number,
    discount: number,
    invoiceDescription:string,
    blobInvoice:string
    fileName:string
    contractId:number
}

export interface countryState {
    id:string,
    name:string,
    taxB2C:string,
    taxB2B:string,
    groupe:string,
    currency:string,
    isoCode:string,
    threshold_before_tax:number,
    specificTo:"state"|"country",
    vat?:string,
    state:clientState[]|null
}

export interface contractFormClient extends Client{
    addressClient?:clientAddress,
    saveDate:Date|string|number;
    maintenanceType?:"perHour"|"perYear"|null
}

export interface clientAddress {
    addressId?:number,
    street:string;
    postalCode:string;
    city:string;
    country?:number;
    clientCountry:clientCountry|null;
}

export interface Contract {
    contractId?:number,
    clientGivingData:contractFormClient|null,
    prestataireGivingData:contractFormPrestataire|null,
    maintenancePrice?:number;
    contractStatus?:"unsigned"|"pending"|"signed",
    saleTermeConditionValided?:boolean;
    electronicContractSignatureAccepted?:boolean;
    rigthRetractionLostAfterServiceBegin?:boolean;
}

export interface freelancer{
    freelancerName:string;
    freelancerTaxId:string;
    freelancerAddress:string;
}

export interface features {
    id?:number,
    title:string,
    description:string,
    quantity:number|string,
    price:number|string
};

export interface contractFormPrestataire extends prestationInfo,freelancer{
    
}

export interface prestationInfo{
    projectTitle:string;
    projectDescription:string;
    startDate:number|string;
    endDate:number|string;
    subTotalPrice:number|string
    totalPrice:number|string;
    contractStatus:"pending"|"unsigned"|"signed"
    taxPrice:number|string;
    taxPercent:number|string,
    paymentSchedule:string;
    maintenanceCategory:"app"|"saas"|"web"|"ecommerce"|undefined;
    projectFonctionList:features[]|string;
}
