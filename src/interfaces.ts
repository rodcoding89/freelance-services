export interface Client {
    clientId?: number;
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
    clientNumber:number,
    invoiceCount:number,
    clientLang:"fr"|"en"|"de",
    modifDate:number,
    phone:string,
    clientStatus:"actived"|"desactived";
    clientType:"company"|"particular";
    maintenanceType?:"perHour"|"perYear"|null;
    address:number,
    services:string
}

export interface clientServiceList extends Client{
    services:Services[]
}

export interface serviceDb extends Services{
    contract?:ContractDb
}

export interface clientServiceContract extends contractFormClient{
    services:serviceDb[]
}

export interface ContractDb extends prestationInfo,contractFormClient{
    contractId:number,
    freelancer?:{
        freelancerName:string;
        freelancerTaxId:string;
        freelancerAddress:string;
    }
    features:{title:string,description:string,quantity:number,price:number}[]|string
    maintenancePrice?:number;
    contractType?:"unsigned"|"pending"|"signed",
    saleTermeConditionValided?:boolean;
    electronicContractSignatureAccepted?:boolean;
    rigthRetractionLostAfterServiceBegin?:boolean;
}

export interface clientState {
    id:string,
    name:string,
    tax:number,
    vat:string,
    stateCode:string,
    threshold:number
}

export interface clientCountry {
    itemId:string,
    name:string,
    taxB2C:string,
    taxB2B:string,groupe:string,
    currency:string,
    isoCode:string,threshold_before_tax:number,
    specficTo:"state"|"country",
    vat?:string,
    clientState:clientState|null
}

export interface countryState {
    id:string,
    name:string,
    taxB2C:string,
    taxB2B:string,groupe:string,
    currency:string,
    isoCode:string,threshold_before_tax:number,
    specficTo:"state"|"country",vat?:string,
    state:clientState[]|null
}

export interface contractFormClient extends Client{
    addressClient?:clientAddress,
    saveDate:Date|string|number;
    maintenanceType?:"perHour"|"perYear"|null
}

export interface clientAddress {
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

export interface contractFormPrestataire extends prestationInfo{
    freelancerName:string;
    freelancerTaxId:string;
    freelancerAddress:string;
}

export interface prestationInfo{
    projectTitle:string;
    projectDescription:string;
    startDate:string;
    endDate:string;
    totalPrice:number;
    contractStatus:"pending"|"unsigned"|"signed"
    taxPrice:number;
    taxPercent:number,
    paymentSchedule:string;
    maintenanceCategory:"app"|"saas"|"web"|"ecommerce"|undefined;
    projectFonctionList:{title:string,description:string,quantity:number,price:number}[]|string;
}
