import { Metadata } from "next";

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

export const loadEnTranslation = async (lang:string) =>{
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

export const parseInputDate = (date:Date)=>{
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

export const parseDate = (date:Date,locale:string)=>{
  return date.toLocaleDateString(`${locale === 'fr' ? 'fr-FR' : locale === 'de' ? 'de-DE' : 'en-US'}`)
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
}
