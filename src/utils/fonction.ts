import { Metadata } from "next";
import { clientAddress, clientCountry, clientServiceContractDB, clientServiceDb, clientState, ContractDb, features, freelancer, serviceDb, Services } from "@/interfaces";

const validLocales = ['en', 'fr', 'de'];

export const loadCountries = async () => {
    try {
        const response = await fetch(process.env.NEXT_PUBLIC_ROOT_LINK+'/assets/countries.json');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error loading countries:', error);
        return [];
    }
}

export const loadTranslation = async (lang:"fr"|"de"|"en") =>{
    try {
        const messages = (await import(`../../messages/${lang}.json`)).default;
        //console.log("messages",messages,"contract",messages.contract)
        return messages.contract;
    } catch (error) {
        console.error('Error loading en translation:', error);
        return null;
    }
}

export const loadSeoTranslation = async (lang:string) =>{
  console.log("lang",lang)
  if (!validLocales.includes(lang)) {
    console.warn(`Locale invalide détectée: ${lang}`);
    return {}; // ou un fallback minimal
  }
  try {
      const messages = (await import(`../../messages/${lang}.json`)).default;
      //console.log("messages",messages,"contract",messages.contract)
      return {seo:messages.seo,websiteItemTitle:messages.websiteItemTitle,websiteItem4Proprio:messages.websiteItem4Proprio,websiteItem4Para:messages.websiteItem4Para,ecommerceItemTitle:messages.ecommerceItemTitle,ecommerceItem1Proprio:messages.ecommerceItem1Proprio,ecommerceWebSiteItem1Para:messages.ecommerceWebSiteItem1Para,saasItemTitle:messages.saasItemTitle,saasItem1Proprio:messages.saasItem1Proprio,saasItem1Para:messages.saasItem1Para,websiteItem1Para:messages.websiteItem1Para,websiteItem1Proprio:messages.websiteItem1Proprio};
  } catch (error) {
      console.error('Error loading en translation:', error);
      return null;
  }
}

export async function generateSeoMetadata({ params}: { params: { locale: string,author:string,page:string,siteName:string,pageImageLink:string,shouldIndex:boolean,pageLink:string } }): Promise<Metadata> {
  const { locale,page,author,siteName,pageImageLink,pageLink } = params;
  const baseUrl = process.env.NEXT_PUBLIC_WEB_LINK?.replace("{locale}","")
  const pageImage = process.env.NEXT_PUBLIC_ROOT_LINK+'/assets/images/share-social.png'
  const t = await loadSeoTranslation(locale);
  return {
    title: t?.seo[page].title,
    description: t?.seo[page].description,
    authors: [{ name: author }],
    robots: {
      index: true,
      follow: true,
    },
    icons:{
      icon: [
        { url: '/favicon.ico' }, // Chemin vers public/favicon.ico
        { url: '/icon-96x96.png', sizes: '96x96', type: 'image/png' },
        { url: '/favicon.svg', type: 'image/svg' },
      ],
      apple: [
        { url: '/apple-touch-icon.png' },
        { url: '/apple-touch-icon-96x96.png', sizes: '96x96', type: 'image/png' },
      ],
    },
    manifest:'/site.webmanifest',
    keywords: t?.seo[page].keyWords,
    openGraph: {
      title: t?.seo[page].title,
      description: t?.seo[page].description,
      url: pageLink,
      siteName,
      images: [
        {
          url: pageImage,
          width: 1200,
          height: 630,
          alt: t?.seo[page].title,
        },
      ],
      locale: locale === "fr" ? "fr_FR" : locale === "de" ? "de_DE" : "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      site: siteName,
      creator: author,
      title: t?.seo[page].title,
      description: t?.seo[page].description,
      images: [pageImage],
    },
    alternates: {
      canonical: pageLink,
      languages:{
        "en":baseUrl+"en",
        "fr":baseUrl+"fr",
        "de":baseUrl+"de",
        "x-default":baseUrl
      }
    },
  };
}

export const parseInputDate = (date:Date|number|string)=>{
  const newDate = date ? typeof(date) === "number" || typeof(date) === "string" ? new Date(date) : date : new Date()
  
  return `${newDate.getFullYear()}-${String(newDate.getMonth() + 1).padStart(2, '0')}-${String(newDate.getDate()).padStart(2, '0')}`
}

export const parseDate = (date:Date|number|string,locale:string)=>{
  console.log("date",date)
  const newDate = typeof(date) === "number" || typeof(date) === "string" ? new Date(date) : date
  
  return newDate.toLocaleDateString(`${locale === 'fr' ? 'fr-FR' : locale === 'de' ? 'de-DE' : 'en-US'}`)
}

export const ShemaLdJson = async (locale:string) => {
  const t = await loadSeoTranslation(locale)

  const name = "RodCoding by ROD TECH SOLUTIONS"
  const pageLink = process.env.NEXT_PUBLIC_ROOT_LINK;
  const companyDescription = '';
  const author = process.env.NEXT_PUBLIC_COMPANY_AUTHOR;
  const authorEmail = process.env.NEXT_PUBLIC_FREELANCE_EMAIL
  const devService = t?.seo.devService;
  const companyStreet = process.env.NEXT_PUBLIC_COMPANY_ADRESS_STREET
  const companyPostalCode = process.env.NEXT_PUBLIC_COMPANY_ADRESS_POSTAL_CODE
  const companyCity = process.env.NEXT_PUBLIC_COMPANY_ADRESS_CITY
  const companyCountry = process.env.NEXT_PUBLIC_COMPANY_ADRESS_COUNTRY

  const companyLocaleStreet = process.env.NEXT_PUBLIC_COMPANY_LOCALE_ADRESS_STREET
  const companyLocalePostalCode = process.env.NEXT_PUBLIC_COMPANY_LOCALE_ADRESS_POSTAL_CODE
  const companyLocaleCity = process.env.NEXT_PUBLIC_COMPANY_LOCALE_ADRESS_CITY
  const companyLocaleCountry = process.env.NEXT_PUBLIC_COMPANY_LOCALE_ADRESS_COUNTRY
  const companySTate = process.env
  const serviceDescription = t?.seo.serviceDescription
  const logo = pageLink+"/assets/images/logo.webp"
  
  const schema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": name,
      "url": pageLink,
      "potentialAction": {
        "@type": "SearchAction",
        "target": pageLink+"?q={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    },
    {
      "@type": "Organization",
      "name": name,
      "url": pageLink,
      "logo": pageLink+"/assets/images/logo.webp",
      "description": companyDescription,
      "founder": {
        "@type": "Person",
        "name": author
      },
      "contactPoint": {
        "@type": "ContactPoint",
        "email": authorEmail,
        "contactType": "service client"
      },
      "openingHoursSpecification": {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        "opens": "09:00",
        "closes": "18:00"
      }
    },
    {
      "@type": "ProfessionalService",
      "name": name,
      "url": pageLink,
      "image": logo,
      "serviceType": devService,
      "address": {
        "@type": "PostalAddress",
        "streetAddress": companyStreet,
        "addressLocality": companyCity,
        "postalCode": companyPostalCode,
        "addressCountry": "US"
      },
      "location":[
        {
          "@type": "Place",
          "name": t?.seo.workPlace,
          "address":{
            "@type": "PostalAddress",
            "streetAddress": companyLocaleStreet,
            "addressLocality": companyLocaleCity,
            "postalCode": companyLocalePostalCode,
            "addressCountry": "FR"
          }
        }
      ],
      "areaServed": {
        "@type": "GeoCircle",
        "geoMidpoint": {
          "@type": "GeoCoordinates",
          "latitude": 48.8566,
          "longitude": 2.3522
        },
        "geoRadius": 500000
      },
      "workExample": [
        {
          "@type": "WebApplication",
          "name":`${t?.websiteItemTitle} ${t?.websiteItem4Proprio}`,
          "description": t?.websiteItem4Para.replaceAll("<br>","").replaceAll("<strong>","").replaceAll("</strong>",""),
          "screenshot": pageLink+"/assets/images/charlotte-consulting.webp",
          "datePublished": "2025-01-01",
          "applicationCategory": "DeveloperApplication",
          "operatingSystem": "Web",
          "url": "https://charlottekoona.com/"
        },
        {
          "@type": "WebApplication",
          "name":`${t?.ecommerceItemTitle} ${t?.ecommerceItem1Proprio}`,
          "description": t?.ecommerceWebSiteItem1Para.replaceAll("<br>","").replaceAll("<strong>","").replaceAll("</strong>",""),
          "screenshot": pageLink+"/assets/images/chicken-grill.webp",
          "datePublished": "2021-09-31",
          "applicationCategory": "ShoppingApplication",
          "operatingSystem": "Web",
          "url":"https://chicken-grill.com/"
        },
        {
          "@type": "WebApplication",
          "name":`${t?.saasItemTitle} ${t?.saasItem1Proprio}`,
          "description": t?.saasItem1Para.replaceAll("<br>","").replaceAll("<strong>","").replaceAll("</strong>",""),
          "screenshot": pageLink+"/assets/images/lovsid.webp",
          "datePublished": "2021-09-31",
          "applicationCategory": "BusinessApplication",
          "operatingSystem": "Web",
          "url":"https://lovsid.com/"
        },
        {
          "@type": "WebApplication",
          "name":`${t?.websiteItemTitle} ${t?.websiteItem1Proprio}`,
          "description": t?.websiteItem1Para.replaceAll("<br>","").replaceAll("<strong>","").replaceAll("</strong>",""),
          "screenshot": pageLink+"/assets/images/fieger.webp",
          "datePublished": "2019-07-31",
          "applicationCategory": "DeveloperApplication",
          "operatingSystem": "Web",
          "url":"https://www.fieger-lamellenfenster.de/"
        }
      ],
      "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": t?.seo.offers,
        "itemListElement": [
          {
            "@type": "OfferCatalog",
            "name": t?.seo.dev.title,
            "itemListElement": [
              {
                "@type": "Offer",
                "itemOffered": {
                  "@type": "Service",
                  "name": t?.seo.dev.siteweb.name,
                  "description": t?.seo.dev.siteweb.description
                },
                "priceSpecification": {
                  "@type": "CompoundPriceSpecification",
                  "priceComponent": [
                    {
                      "@type": "UnitPriceSpecification",
                      "name": t?.seo.dev.siteweb.cmsOption,
                      "description": t?.seo.dev.siteweb.cmsOptionDescription,
                      "priceCurrency": "EUR",
                      "price": process.env.NEXT_PUBLIC_DEV_WEBSITE_COST_CMS,
                      "priceType": "Total"
                    },
                    {
                      "@type": "UnitPriceSpecification",
                      "name": t?.seo.dev.siteweb.handOption,
                      "description": t?.seo.dev.siteweb.handOptionDescription,
                      "priceCurrency": "EUR",
                      "price": process.env.NEXT_PUBLIC_DEV_WEBSITE_COST_CUSTOM,
                      "priceType": "Total"
                    },
                    {
                      "@type": "UnitPriceSpecification",
                      "name": t?.seo.dev.siteweb.mixOption,
                      "description": t?.seo.dev.siteweb.mixOptionDescription,
                      "priceCurrency": "EUR",
                      "price": process.env.NEXT_PUBLIC_DEV_WEBSITE_COST_HEALESS_CMS,
                      "priceType": "Total"
                    }
                  ]
                }
              },
              {
                "@type": "Offer",
                "itemOffered": {
                  "@type": "Service",
                  "name": t?.seo.dev.ecommerce.name,
                  "description": t?.seo.dev.ecommerce.description
                },
                "priceSpecification": {
                  "@type": "CompoundPriceSpecification",
                  "priceComponent": [
                    {
                      "@type": "UnitPriceSpecification",
                      "name": t?.seo.dev.ecommerce.cmsOption,
                      "description": t?.seo.dev.ecommerce.cmsOptionDescription,
                      "priceCurrency": "EUR",
                      "price": process.env.NEXT_PUBLIC_DEV_ECOMMERCE_COST_CMS,
                      "priceType": "Total"
                    },
                    {
                      "@type": "UnitPriceSpecification",
                      "name": t?.seo.dev.ecommerce.handOption,
                      "description": t?.seo.dev.ecommerce.handOptionDescription,
                      "priceCurrency": "EUR",
                      "price": process.env.NEXT_PUBLIC_DEV_ECOMMERCE_COST_CUSTOM,
                      "priceType": "Total"
                    },
                    {
                      "@type": "UnitPriceSpecification",
                      "name": t?.seo.dev.ecommerce.mixOption,
                      "description": t?.seo.dev.ecommerce.mixOptionDescription,
                      "priceCurrency": "EUR",
                      "price": process.env.NEXT_PUBLIC_DEV_ECOMMERCE_COST_HEALESS_CMS,
                      "priceType": "Total"
                    }
                  ]
                }
              },
              {
                "@type": "Offer",
                "itemOffered": {
                  "@type": "Service",
                  "name": t?.seo.dev.saas.name,
                  "description": t?.seo.dev.saas.description
                },
                "priceSpecification": {
                  "@type": "UnitPriceSpecification",
                  "priceCurrency": "EUR",
                  "priceType": "PriceOnRequest",
                  "billingIncrement": "1",
                  "unitCode": "HUR"
                }
              },
              {
                "@type": "Offer",
                "itemOffered": {
                  "@type": "Service",
                  "name": t?.seo.dev.app.name,
                  "description": t?.seo.dev.app.description
                },
                "priceSpecification": {
                  "@type": "UnitPriceSpecification",
                  "priceCurrency": "EUR",
                  "billingIncrement": "1",
                  "unitCode": "HUR",
                  "priceType": "PriceOnRequest"
                }
              }
            ]
          },
          {
            "@type": "OfferCatalog",
            "name": t?.seo.maintenance.title,
            "itemListElement": [
              {
                "@type": "Offer",
                "itemOffered": {
                  "@type": "Service",
                  "name": t?.seo.maintenance.siteweb.name,
                  "description": t?.seo.maintenance.siteweb.desciption
                },
                "priceSpecification": {
                  "@type": "CompoundPriceSpecification",
                  "priceComponent": [
                    {
                      "@type": "UnitPriceSpecification",
                      "priceType": "HourlyRate",
                      "priceCurrency": "EUR",
                      "price": process.env.NEXT_PUBLIC_MAINTENACE_WEBSITE_COST_PER_HOUR,
                      "billingIncrement": "1",
                      "unitCode": "HUR",
                      "description": t?.seo.maintenance.siteweb.hour
                    },
                    {
                      "@type": "UnitPriceSpecification",
                      "priceType": "Annual",
                      "priceCurrency": "EUR",
                      "price": process.env.NEXT_PUBLIC_MAINTENACE_WEBSITE_COST_PER_YEAR,
                      "billingDuration": "P1Y",
                      "description": t?.seo.maintenance.siteweb.annual
                    }
                  ]
                }
              },
              {
                "@type": "Offer",
                "itemOffered": {
                  "@type": "Service",
                  "name": t?.seo.maintenance.ecommerce.name,
                  "description": t?.seo.maintenance.ecommerce.desciption
                },
                "priceSpecification": {
                  "@type": "CompoundPriceSpecification",
                  "priceComponent": [
                    {
                      "@type": "UnitPriceSpecification",
                      "priceType": "HourlyRate",
                      "priceCurrency": "EUR",
                      "price": process.env.NEXT_PUBLIC_MAINTENACE_ECOMMERCE_COST_PER_HOUR,
                      "billingIncrement": "1",
                      "unitCode": "HUR",
                      "description": t?.seo.maintenance.ecommerce.hour
                    },
                    {
                      "@type": "UnitPriceSpecification",
                      "priceType": "Annual",
                      "priceCurrency": "EUR",
                      "price": process.env.NEXT_PUBLIC_MAINTENACE_ECOMMERCE_COST_PER_YEAR,
                      "billingDuration": "P1Y",
                      "description": t?.seo.maintenance.ecommerce.annual
                    }
                  ]
                }
              },
              {
                "@type": "Offer",
                "itemOffered": {
                  "@type": "Service",
                  "name": t?.seo.maintenance.saas.name,
                  "description": t?.seo.maintenance.saas.desciption
                },
                "priceSpecification": {
                  "@type": "UnitPriceSpecification",
                  "priceCurrency": "EUR",
                  "priceType": "PriceOnRequest",
                  "billingIncrement": "1"
                }
              },
              {
                "@type": "Offer",
                "itemOffered": {
                  "@type": "Service",
                  "name": t?.seo.maintenance.app.name,
                  "description": t?.seo.maintenance.app.desciption
                },
                "priceSpecification": {
                  "@type": "UnitPriceSpecification",
                  "priceCurrency": "EUR",
                  "priceType": "PriceOnRequest",
                  "billingIncrement": "1"
                }
              }
            ]
          }
        ]
      }
    }
  ]
};

  return schema
}//19-24-15-4-64-8-12-19-4-6-4-17-70-3-0-19-0-64-55
// t  y  p  e :  i n  t  e g e r  ,  d a t  a :   3
// 19-24-15-4-64-5-13-14-0-19-70-3-0-19-0-64-56-60-67-56-57
// t  y  p  e  : f  l  o a  t ,  d a  t a  :  4  8  .  4  5
// 19-24-15-4-64-8-12-19-4-6-4-17-70-3-0-19-0-64-55
// t  y   p e  : f  l  o a  t  , d a  t a  :  3  0  2  . 
// 19-24-15-4-64-18-19-17-8-12-6-70-3-0-19-0-64-65-36-8-11-1-0-13-88-60-61-65
// t  y  p  e :  s  t  r  i n  g  , d a  t a :  "  K  i m  b a l  @  89" 
const coder = ['a','b','c','d','e','f','g','h','i','j','k','m','n','l','o','p','q','r','s','t','u','v','w','x','y','z',
	'A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z',
	'0','1','2','3','4','5','6','7','8','9','{','}',':','"','_','.',';','%',',','#','&','=','$','*',"'",'\\','~','/','-','!','?','|','+','[',']','|','@','(',')',' '];

export const EnCoder = (type:string,text:any) =>{
  const newText = parseDataToSave(type,text)
  //console.log("stringtify data",newText)
  let indexOfText = "";
  if (newText) {
    const data = newText.split('');
    for(let j = 0; j<data.length;j++) {
      for(let i = 0; i<coder.length;i++) {
        if(data[j] === coder[i]) {
          indexOfText += i.toString();
          if(j !== newText.length - 1) {
            indexOfText += "-";
          }
        }
      }
    }
    return indexOfText;
  }else{
    return null
  }
}
	
export const DecoderData = (text:string) =>{
  let decripted = "";
  //console.log("decripted text",text)
  if (text && typeof(text) === "string" && text.includes("-")) {
    const data = text.split("-");
    for(let j = 0; j<data.length;j++) {
      for(let i = 0; i<coder.length;i++) {
        if(parseInt(data[j]) == i) {
          decripted += coder[i];
        }
      }
    }
    //console.log("decripted",decripted)
    return parseType(decripted);
  } else {
    return null
  }	
}
  
export const encodeSecretEnvVar = ()=>{
  return {
    contractFolder:EnCoder("string",process.env.FOLDER_CONTRACT_ID),
    invoiceFolder:EnCoder("string",process.env.FOLDER_INVOICE_ID),
    zohoRefreshTocken:EnCoder("string",process.env.ZOHO_REFRESH_TOKEN),
    zohoDriverClientId:EnCoder("string",process.env.ZOHO_DRIVE_CLIENT_ID),
    zohoDriveSecret:EnCoder("string",process.env.ZOHO_DRIVE_SECRET),
    zohoStmpConsomer:EnCoder("string",process.env.ZOHO_SMTP_CONSUMER),
    zohoStmpPass:EnCoder("string",process.env.ZOHO_SMTP_PASSWORD),
    passwordAccount:EnCoder("string",process.env.PASSWORD_ACCOUNT)
  }
}

export const parseDataToSave = (type:string,data:any)=>{
  if (data !== null && data !== undefined && data !== "null") {
    const newdata = type === "integer" || type === "float" || type === "array" || type === "object" ? data : `\"${data}\"`
    return `type:${type},data:${newdata}`
  }else{
    return null
  }
}

export const decodeClientServiceContract = (data:clientServiceContractDB):clientServiceContractDB=>{
  //console.log("price",DecoderData("19-24-15-4-64-5-13-14-0-19-70-3-0-19-0-64-54-57-57"))
  const services = typeof(data.services) === "string" ? JSON.parse(data.services) as serviceDb[] : data.services ? data.services : []
  const contract = services[0].contract as ContractDb | null
  
  const addressClient = typeof(data.addressClient) === "string" ? JSON.parse(data.addressClient as string) as clientAddress : data.addressClient
  const freelancer = typeof(data.freelancer) === "string" ? JSON.parse(data.freelancer) : data.freelancer 
  const clientCountry = addressClient?.clientCountry as clientCountry
  const clientState = addressClient?.clientCountry?.clientState as clientState;
  //console.log("data client",data,"contract",contract)
  const addressParsed = !addressClient ? undefined : {
    addressId:addressClient.addressId,
    street:DecoderData(addressClient?.street ?? ""),
    city:DecoderData(addressClient?.city ?? ""),
    postalCode:DecoderData(addressClient?.postalCode ?? ""),
    clientCountry:{
      id:clientCountry?.id,
      name:DecoderData(clientCountry?.name ?? ""),
      taxB2B:DecoderData(clientCountry?.taxB2B ?? ""),
      taxB2C:DecoderData(clientCountry?.taxB2C ?? ""),
      specificTo:clientCountry?.specificTo ?? "",
      currency:DecoderData(clientCountry?.currency ?? ""),
      groupe:DecoderData(clientCountry?.groupe ?? ""),
      isoCode:DecoderData(clientCountry?.isoCode ?? ""),
      itemId:DecoderData(clientCountry?.itemId ?? ""),
      threshold_before_tax:DecoderData(clientCountry?.threshold_before_tax?.toString() ?? ''),
      clientState:clientState ? {
        name:DecoderData(clientState?.name ?? ""),
        stateCode:DecoderData(clientState?.stateCode ?? ""),
        tax:DecoderData(clientState?.tax.toString() ?? ""),
        threshold:DecoderData(clientState?.threshold.toString() ?? ""),
        id:clientState?.id,
        vat:clientState?.vat
      } as clientState : null
    } as clientCountry
  } as clientAddress|undefined
  //console.log("addressParsed",addressParsed)
  const user = {
    clientId:data.clientId,
    clientLang:data.clientLang,
    clientNumber:typeof(data.clientNumber) === "string" ? DecoderData(data.clientNumber) : data.clientNumber,
    clientStatus:data.clientStatus,
    clientType:data.clientType,
    clientUid:data.clientUid,
    lname:DecoderData(data.lname),
    fname:DecoderData(data.fname),
    email:DecoderData(data.email ?? ""),
    phone:DecoderData(data.phone ?? ""),
    taxId:DecoderData(data.taxId ?? ""),
    address:data.address,
    addressClient:addressParsed,
    invoiceCount:typeof(data.invoiceCount) === "string" ? DecoderData(data.invoiceCount) : data.invoiceCount,
    modifDate:DecoderData(typeof(data.modifDate) === "string" ? data.modifDate : data.modifDate.toString()),
    maintenanceType:data.maintenanceType ?? "perHour",
  }

  const features = contract?.features ? contract.features as features[] : []

  const parsedFeature:features[] = features.map((item)=>{return{title:DecoderData(item.title),description:DecoderData(item.description),price:DecoderData(typeof(item.price) === "string" ? item.price : item.price.toString()),quantity:DecoderData(typeof(item.quantity) === "string" ? item.quantity : item.quantity.toString())}})
  //console.log("parsedFeature",parsedFeature)
  return {
    services:[{
      serviceType:services[0].serviceType,
      serviceId:services[0].serviceId,
      contractStatus:services[0].contractStatus,
      clientId:services[0].clientId,
      maintenanceType:services[0].maintenanceType ?? "perHour",
      contract:{
        contractId:contract?.contractId,
        ...user,
        maintenancePrice:DecoderData(typeof(contract?.maintenancePrice) === "string" ? contract?.maintenancePrice ?? "" : contract?.maintenancePrice?.toString() ?? ""),
        contractType:contract?.contractType,
        saleTermeConditionValided:DecoderData(typeof(contract?.saleTermeConditionValided) === "string" ? contract.saleTermeConditionValided : ""),
        electronicContractSignatureAccepted:DecoderData(typeof(contract?.electronicContractSignatureAccepted) === "string" ? contract.electronicContractSignatureAccepted : ""),
        rigthRetractionLostAfterServiceBegin:DecoderData(typeof(contract?.rigthRetractionLostAfterServiceBegin) === "string" ? contract.rigthRetractionLostAfterServiceBegin : ""),
        projectTitle:DecoderData(contract?.projectTitle ?? ""),
        projectDescription:DecoderData(contract?.projectDescription ?? ""),
        projectFonctionList:parsedFeature,
        startDate:DecoderData(contract?.startDate.toString() ?? ""),
        endDate:DecoderData(contract?.endDate.toString() ?? ""),
        subTotalPrice:DecoderData(typeof(contract?.subTotalPrice) === "string" ? contract?.subTotalPrice : contract?.subTotalPrice?.toString() ?? ""),
        taxPercent:DecoderData(typeof(contract?.taxPercent) === "string" ? contract?.taxPercent : contract?.taxPercent.toString() ?? ""),
        taxPrice:DecoderData(typeof(contract?.taxPrice) === "string" ? contract?.taxPrice : contract?.taxPrice.toString() ?? ""),
        totalPrice:DecoderData(typeof(contract?.totalPrice) === "string" ? contract?.totalPrice : contract?.totalPrice.toString() ?? ""),
        paymentSchedule:DecoderData(contract?.paymentSchedule ?? ""),
        maintenanceCategory:contract?.maintenanceCategory ?? "",
        contractStatus:contract?.contractStatus ?? "",
        saveDate:DecoderData(typeof(contract?.saveDate) === "number" ? contract.saveDate?.toString() : "")
      } as ContractDb
    }] as serviceDb[],
    ...user,
    freelancer:{
      freelancerTaxId:DecoderData(freelancer.freelancerTaxId),
      freelancerAddress:DecoderData(freelancer.freelancerAddress),
      freelancerName:DecoderData(freelancer.freelancerName)
    } as freelancer,
    saveDate:DecoderData(data.saveDate?.toString()),
    invoiceId:data.invoiceId
  } 
}

export const decodeResult = (data:{webpage:string,lastUpdate:number}[])=>{
  return data.map((item)=>{return {webpage:DecoderData(item.webpage),lastUpdate:DecoderData(item.lastUpdate.toString())}})
}

export const decodeDbData = (data:clientServiceDb):clientServiceDb=>{
  
  const services = typeof(data.services) === "string" ? JSON.parse(data.services) as Services[] : data.services
  
  return {
    clientId:data.clientId,
    clientLang:data.clientLang,
    clientNumber:typeof(data.clientNumber) === "string" ? DecoderData(data.clientNumber) : data.clientNumber,
    clientStatus:data.clientStatus,
    clientType:data.clientType,
    clientUid:data.clientUid,
    services:services,
    lname:DecoderData(data.lname),
    fname:DecoderData(data.fname),
    email:DecoderData(data.email),
    phone:DecoderData(data.phone),
    taxId:DecoderData(data.taxId),
    address:data.address,
    invoiceCount:typeof(data.invoiceCount) === "string" ? DecoderData(data.invoiceCount) : data.invoiceCount,
    modifDate:DecoderData(data.modifDate),
    maintenanceType:DecoderData(data.maintenanceType ?? ""),
  }
}

export const JsonParse = (data:string)=>{
  //console.log("decriptes json",data)
  if (data && data !== "") {
    const splitData = data.split(",");
    const type = splitData[0].split(":")[1].replaceAll('"',"")
    const value = splitData[1].split(":")[1].replaceAll('"',"")
    return {type:type,data:value}
  }
  return null
}

export const parseType = (value:any)=>{
  const newData = JsonParse(value) as {type:string,data:any}|null
  //console.log("newdata",newData)
  if (newData) {
    if (newData.type === 'string') {
      return newData.data
    } else if(newData.type === "array" || newData.type === "object"){
      return JSON.stringify(newData.data)
    } else if(newData.data === 'boolean'){
      return newData.data === '1' ? true : false
    } else if(newData.type === 'integer'){
      return parseInt(newData.data)
    }else if(newData.type === "float"){
      return parseFloat(newData.data)
    }else{
      return ""
    }
  }
  return ""
}