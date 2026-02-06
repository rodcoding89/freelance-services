export const LANG_LIST: readonly string[] = ['en', 'fr'];
export const priceList:{id:number,bloc:{title:string,devMethode:string[],
    content:{price:string|undefined,devType:{type:string,outil:string},
    options?:string[],type:"webcms"|"webmix"|"webcustom"|"ecommercecms"|"ecommercemix"|"ecommercecustom",
    prices?:{cent:string|undefined,cinquante:string|undefined,cinqcent:string|undefined,soixantequize:string|undefined
    pagePrice:string|undefined
    }}[]}|{title:string,devMethode:string[],
    content:{noprice:string,devType:{type:string,outil:string}}[]}[]}[] = [
    {
        id:1,
        bloc:{
            title:"standartWebsite",
            devMethode:["Wordpress","mix","ofHand"],
            content:[
                {
                    price:process.env.NEXT_PUBLIC_DEV_WEBSITE_COST_CMS,
                    devType:{type:"devOn",outil:"outilTool"},
                    options:["optionWebSiteWordpress0","optionWebSiteWordpress1","optionWebSiteWordpress2","optionWebSiteWordpress3","optionWebSiteWordpress4","optionWebSiteWordpress5","optionWebSiteWordpress6","optionWebSiteWordpress7","optionWebSiteWordpress8","optionWebSiteWordpress9","optionWebSiteWordpress10","optionWebSiteWordpress11","optionWebSiteWordpress12"],
                    type:"webcms",
                    prices:{
                        cent:process.env.NEXT_PUBLIC_CENT, 
                        cinquante:process.env.NEXT_PUBLIC_CINQUANTE, 
                        cinqcent:process.env.NEXT_PUBLIC_CINQCENT,
                        soixantequize:process.env.NEXT_PUBLIC_SOIXANTEQUINZE,
                        pagePrice:process.env.NEXT_PUBLIC_DEV_WEBSITE_COST_CMS_SINGLE_PAGE,
                    }
                },
                {
                    price:process.env.NEXT_PUBLIC_DEV_WEBSITE_COST_HEALESS_CMS,
                    devType:{type:"devMix",outil:"outilMix"},
                    options:["optionWebSiteMix0","optionWebSiteMix1","optionWebSiteMix2","optionWebSiteMix3","optionWebSiteMix4","optionWebSiteMix5","optionWebSiteMix6","optionWebSiteMix7","optionWebSiteMix8","optionWebSiteMix9","optionWebSiteMix10","optionWebSiteMix11","optionWebSiteMix12"],
                    type:"webmix",
                    prices:{
                        cent:process.env.NEXT_PUBLIC_CENT, 
                        cinquante:process.env.NEXT_PUBLIC_CINQUANTE, 
                        cinqcent:process.env.NEXT_PUBLIC_CINQCENT,
                        soixantequize:process.env.NEXT_PUBLIC_SOIXANTEQUINZE,
                        pagePrice:process.env. NEXT_PUBLIC_DEV_WEBSITE_COST_HEALESS_CMS_SINGLE_PAGE,
                    }
                }
                ,{
                    price:process.env.NEXT_PUBLIC_DEV_WEBSITE_COST_CUSTOM,
                    devType:{type:"handDev",outil:"handOutil"},
                    options:["optionWebSiteOfHand0","optionWebSiteOfHand1","optionWebSiteOfHand2","optionWebSiteOfHand3","optionWebSiteOfHand4","optionWebSiteOfHand5","optionWebSiteOfHand6","optionWebSiteOfHand7","optionWebSiteOfHand8","optionWebSiteOfHand9","optionWebSiteOfHand10"],
                    type:"webcustom",
                    prices:{
                        cent:process.env.NEXT_PUBLIC_CENT, 
                        cinquante:process.env.NEXT_PUBLIC_CINQUANTE, 
                        cinqcent:process.env.NEXT_PUBLIC_CINQCENT,
                        soixantequize:process.env.NEXT_PUBLIC_SOIXANTEQUINZE,
                        pagePrice:process.env.NEXT_PUBLIC_DEV_WEBSITE_COST_CUSTOM_SINGLE_PAGE,
                    }
                }
            ]
        }
    },
    {
        id:2,
        bloc:{
            title:"ecommerce",
            devMethode:["Wordpress","mix","ofHand"],
            content:[
                {
                    price:process.env.NEXT_PUBLIC_DEV_ECOMMERCE_COST_CMS,
                    devType:{type:"devOn",outil:"outilTool"},
                    options:["optionEcommerceWordPress0","optionEcommerceWordPress1","optionEcommerceWordPress2","optionEcommerceWordPress3","optionEcommerceWordPress4","optionEcommerceWordPress5","optionEcommerceWordPress6","optionEcommerceWordPress7","optionEcommerceWordPress8","optionEcommerceWordPress9","optionEcommerceWordPress10","optionEcommerceWordPress11","optionEcommerceWordPress12","optionEcommerceWordPress13"],
                    type:"ecommercecms",
                    prices:{
                        cent:process.env.NEXT_PUBLIC_CENT, 
                        cinquante:process.env.NEXT_PUBLIC_CINQUANTE, 
                        cinqcent:process.env.NEXT_PUBLIC_CINQCENT,
                        soixantequize:process.env.NEXT_PUBLIC_SOIXANTEQUINZE,
                        pagePrice:process.env.NEXT_PUBLIC_DEV_ECOMMERCE_COST_CMS_SINGLE_PAGE,
                    }
                },
                {
                    price:process.env.NEXT_PUBLIC_DEV_ECOMMERCE_COST_HEALESS_CMS,
                    devType:{type:"devMix",outil:"outilMix"},
                    options:["optionEcommerceMix0","optionEcommerceMix1","optionEcommerceMix2","optionEcommerceMix3","optionEcommerceMix4","optionEcommerceMix5","optionEcommerceMix6",
                    "optionEcommerceMix7","optionEcommerceMix8","optionEcommerceMix9","optionEcommerceMix10","optionEcommerceMix11","optionEcommerceMix12","optionEcommerceMix13"],
                    type:"ecommercemix",
                    prices:{
                        cent:process.env.NEXT_PUBLIC_CENT, 
                        cinquante:process.env.NEXT_PUBLIC_CINQUANTE, 
                        cinqcent:process.env.NEXT_PUBLIC_CINQCENT,
                        soixantequize:process.env.NEXT_PUBLIC_SOIXANTEQUINZE,
                        pagePrice:process.env.NEXT_PUBLIC_DEV_ECOMMERCE_COST_HEALESS_CMS_SINGLE_PAGE,
                    }
                },
                {
                    price:process.env.NEXT_PUBLIC_DEV_ECOMMERCE_COST_CUSTOM,
                    devType:{type:"handDev",outil:"handOutil"},
                    options:["optionEcommerceOfHand0","optionEcommerceOfHand1","optionEcommerceOfHand2","optionEcommerceOfHand3","optionEcommerceOfHand4","optionEcommerceOfHand5","optionEcommerceOfHand6","optionEcommerceOfHand7","optionEcommerceOfHand8","optionEcommerceOfHand9","optionEcommerceOfHand10","optionEcommerceOfHand11","optionEcommerceOfHand12","optionEcommerceOfHand13"],
                    type:"ecommercecustom",
                    prices:{
                        cent:process.env.NEXT_PUBLIC_CENT, 
                        cinquante:process.env.NEXT_PUBLIC_CINQUANTE, 
                        cinqcent:process.env.NEXT_PUBLIC_CINQCENT,
                        soixantequize:process.env.NEXT_PUBLIC_SOIXANTEQUINZE,
                        pagePrice:process.env.NEXT_PUBLIC_DEV_ECOMMERCE_COST_CUSTOM_SINGLE_PAGE,
                    }
                }
            ]
        }
    },
    {
        id:3,
        bloc:[
            {
                title:"mobileApp",
                devMethode:["devhybride","devcross","devnatif"],
                content:[
                    {
                        noprice:"noprice",
                        devType:{type:"devTypeAppHybride",outil:"defapphybride"},
                    },
                    {
                        noprice:"noprice",
                        devType:{type:"devTypeAppCross",outil:"defappcrossplatform"},
                    },
                    {
                        noprice:"noprice",
                        devType:{type:"devTypeAppNatif",outil:"defappnatif"},
                    }
                ]
            },
            {
                title:"saas",
                devMethode:["ofHand","progiciel"],
                content:[
                    {
                        noprice:"noprice",
                        devType:{type:"devTypeSaasOfHanf",outil:"defsaasofhand"},
                    },
                    {
                        noprice:"noprice",
                        devType:{type:"devTypeSaasProgiciel",outil:"defsaasprogiciel"},
                    }
                ]
            }
        ]
    }
]
export const maintenanceOption:{hour?:string|undefined,year?:string|undefined,options:string[]|string,cinquante?:string|undefined,type?:"other",noprice?:string}[] = [
    {
        hour:process.env.NEXT_PUBLIC_MAINTENACE_WEBSITE_COST_PER_HOUR,
        year:process.env.NEXT_PUBLIC_MAINTENACE_WEBSITE_COST_PER_YEAR,
        options:[
            'optionWebSiteMaintenance1',
            'optionWebSiteMaintenance2',
            'optionWebSiteMaintenance3',
            'optionWebSiteMaintenance4',
            'optionWebSiteMaintenance5'
        ],
        cinquante:process.env.NEXT_PUBLIC_CINQUANTE,
        type:"other"
    },
    {
        hour:process.env.NEXT_PUBLIC_MAINTENACE_ECOMMERCE_COST_PER_HOUR,
        year:process.env.NEXT_PUBLIC_MAINTENACE_ECOMMERCE_COST_PER_YEAR,
        options:[
            'optionEcommerceMaintenance1',
            'optionEcommerceMaintenance2',
            'optionEcommerceMaintenance3',
            'optionEcommerceMaintenance4',
            'optionEcommerceMaintenance5'
        ],
        cinquante:process.env.NEXT_PUBLIC_CINQUANTE,
        type:"other"
    },
    {
        noprice:"noprice",
        options:'saasMaintenance'
    },
    {
        noprice:"noprice",
        options:'appMaintenance'
    }
]
export const services = [
    {
        id:1,
        service:{
            serviceName:"showcaseWebsite",
            shortDescript:"serviceWebsite",
            icon:"bx-code-alt"
        }   
    },
    {
        id:2,
        service:{
            serviceName:"reworkWebsite",
            shortDescript:"serviceWebsiteRework",
            icon:"bx-edit"
        }   
    },
    {
        id:3,
        service:{
            serviceName:"ecommerceWebste",
            shortDescript:"serviceEcommerce",
            icon:"bx-shopping-bag"
        }   
    },
    {
        id:4,
        service:{
            serviceName:"saas",
            shortDescript:"serviceSaas",
            icon:"bx-desktop"
        }   
    },
    {
        id:5,
        service:{
            serviceName:"mobileApp",
            shortDescript:"serviceApp",
            icon:"bx-devices"
        }   
    },
    {
        id:6,
        service:{
            serviceName:"maintenanceInformaticName",
            shortDescript:"maintenanceInformatic",
            icon:"bx-cog"
        }   
    }
]

export const serviceDetails = {
    1:{
        title:"serviceSiteVitrineTitle",
        info:"serviceSiteVitrineDescrip",
        subtitle:"serviceSiteVitrineSubTitle",
        category:["cms","ofHand","hybride"],
        img:'/assets/images/neue-groupe.webp',
        avdisav:'avdistage',
        content:{
            title:"serviceSiteVitrineDef",
            para:"serviceWebsite",
            souspara:"websiteVitrineAvantgeTitle",
            notion:"notionvitrine",
            contentPara:[
                {title:"serviceSiteVitrineAvantageTitel1",text:"serviceSiteVitrineAvantageDescrip1"},
                {title:"serviceSiteVitrineAvantageTitel2",text:"serviceSiteVitrineAvantageDescrip2"},
                {title:"serviceSiteVitrineAvantageTitel3",text:"serviceSiteVitrineAvantageDescrip3"},
                {title:"serviceSiteVitrineAvantageTitel4",text:"serviceSiteVitrineAvantageDescrip4"},
                {title:"serviceSiteVitrineAvantageTitel5",text:"serviceSiteVitrineAvantageDescrip5"}
            ],
        },
        cost:{
            title:"websiteVitrineCostTitle",
            para:"websiteVitrineCostPara",
            souspara:"websiteCostSubPara",
        },
        devMode:{
            1:{
                def:"defworpress",
                notion:"notionwordpress",
            },
            2:{
                def:"defWebsiteFromHand",
                notion:"notionWebsiteFromHand",
                
            },
            3:{
                def:"wordpressAndDevofHand",
                notion:"notionwordpressAndDevofHand",
            }
        }
    },
    2:{
        title:"serviceReworkWebsiteTitle",
        info:"serviceReworkWebsiteDescrip",
        subtitle:"serviceReworkWebsiteSubTitle",
        img:'',
        category:["cms","ofHand","hybride"],
        avdisav:'avdistage',
        content:{
            title:"serviceReworkWebsiteDef",
            para:"serviceWebsiteRework",
            souspara:"websiteReworkWebsiteAvantgeTitle",
            notion:"notionrework",
            contentPara:[
                {title:"serviceReworkWebsiteAvantageTitel1",text:"serviceReworkWebsiteAvantageDescrip1"},
                {title:"serviceReworkWebsiteAvantageTitel2",text:"serviceReworkWebsiteAvantageDescrip2"},
                {title:"serviceReworkWebsiteAvantageTitel3",text:"serviceReworkWebsiteAvantageDescrip3"},
                {title:"serviceReworkWebsiteAvantageTitel4",text:"serviceReworkWebsiteAvantageDescrip4"},
                {title:"serviceReworkWebsiteAvantageTitel5",text:"serviceReworkWebsiteAvantageDescrip5"}
            ],
        },
        cost:{
            title:"websiteReworkWebsiteCostTitle",
            para:"websiteReworkWebsiteCostPara",
            souspara:"websiteCostSubPara",
        },
        devMode:{
            1:{
                def:"defreworkworpress",
                notion:"notionwordpress",
            },
            2:{
                def:"defReworkWebsiteFromHand",
                notion:"notionWebsiteReworkFromHand",
            },
            3:{
                def:"wordpressAndDevofHandRework",
                notion:"notionwordpressAndDevofHand",
            }
        }   
    },
    3:{
        title:"serviceEcommerceWebsiteTitle",
        info:"serviceEcommerceWebsiteDescrip",
        subtitle:"serviceEcommerceWebsiteSubTitle",
        img:'/assets/images/chicken-grill.webp',
        category:["cms","ofHand","hybride"],
        avdisav:'avdistage',
        content:{
            title:"serviceEcommerceWebsiteDef",
            para:"serviceEcommerce",
            souspara:"websiteEcommerceWebsiteAvantgeTitle",
            notion:"notionecommerce",
            contentPara:[
                {title:"serviceEcommerceWebsiteAvantageTitel1",text:"serviceEcommerceWebsiteAvantageDescrip1"},
                {title:"serviceEcommerceWebsiteAvantageTitel2",text:"serviceEcommerceWebsiteAvantageDescrip2"},
                {title:"serviceEcommerceWebsiteAvantageTitel3",text:"serviceEcommerceWebsiteAvantageDescrip3"},
                {title:"serviceEcommerceWebsiteAvantageTitel4",text:"serviceEcommerceWebsiteAvantageDescrip4"},
                {title:"serviceEcommerceWebsiteAvantageTitel5",text:"serviceEcommerceWebsiteAvantageDescrip5"}
            ],
        },
        cost:{
            title:"websiteEcommerceWebsiteCostTitle",
            para:"websiteEcommerceWebsiteCostPara",
            souspara:"websiteCostSubPara",
        },
        devMode:{
            1:{
                def:"defecommerceworpress",
                notion:"notionwordpress",
            },
            2:{
                def:"defEcommerceWebsiteFromHand",
                notion:"notionEcommerceFromHand",
            },
            3:{
                def:"wordpressAndDevofHandEcommerce",
                notion:"notionwordpressAndDevofHandEcommerce",
            }
        }   
    },
    4:{
        title:"serviceSaasTitle",
        info:"serviceSaasDescrip",
        subtitle:"serviceSaasSubTitle",
        img:'/assets/images/lovsid.webp',
        category:["ofHand","progiciel"],
        avdisav:'avdistageSaas',
        content:{
            title:"serviceSaasDef",
            para:"serviceSaas",
            souspara:"saasAvantgeTitle",
            notion:"saasnotion",
            contentPara:[
                {title:"serviceSaasAvantageTitel1",text:"serviceSaasAvantageDescrip1"},
                {title:"serviceSaasAvantageTitel2",text:"serviceSaasAvantageDescrip2"},
                {title:"serviceSaasAvantageTitel3",text:"serviceSaasAvantageDescrip3"},
                {title:"serviceSaasAvantageTitel4",text:"serviceSaasAvantageDescrip4"}
            ],
        },
        cost:{
            title:"serviceSaasCostTitle",
            para:"serviceSaasCostPara",
            souspara:"serviceSaasCostSubPara",
        },
        devMode:{
            1:{
                def:"defsaasofhand",
                notion:"notionsaasofhand",
            },
            2:{
                def:"defsaasprogiciel",
                notion:"notionsaasprogiciel",
            }
        }
    },
    5:{
        title:"serviceAppTitle",
        info:"serviceAppDescrip",
        subtitle:"serviceAppSubTitle",
        img:'/assets/images/fieger.webp',
        category:["apphybride","appcross","appnative"],
        avdisav:'avdistageApp',
        content:{
            title:"serviceAppDef",
            para:"serviceApp",
            souspara:"appAvantgeTitle",
            notion:"appnotion",
            contentPara:[
                {title:"serviceAppAvantageTitel1",text:"serviceAppAvantageDescrip1"},
                {title:"serviceAppAvantageTitel2",text:"serviceAppAvantageDescrip2"},
                {title:"serviceAppAvantageTitel3",text:"serviceAppAvantageDescrip3"},
                {title:"serviceAppAvantageTitel4",text:"serviceAppAvantageDescrip4"},
                {title:"serviceAppAvantageTitel5",text:"serviceAppAvantageDescrip5"}
            ],
        },
        cost:{
            title:"serviceAppCostTitle",
            para:"serviceAppCostPara",
            souspara:"serviceAppCostSubPara",
        },
        devMode:{
            1:{
                def:"defapphybride",
                notion:"notionhybride",
            },
            2:{
                def:"defappcrossplatform",
                notion:"notioncrossplatform",
            },
            3:{
                def:"defappnatif",
                notion:"notionnatif",
            }
        }
    },
    6:{
        title:"serviceMaintenanceTitle",
        info:"serviceMaintenanceDescrip",
        subtitle:"serviceMaintenanceSubTitle",
        img:'',
        category:[],
        avdisav:'avdistageMaintenance',
        content:{
            title:"serviceMaintenanceDef",
            para:"serviceMaintenance",
            souspara:"maintenanceAvantgeTitle",
            notion:"maintenancenotion",
            contentPara:[
                {title:"serviceMaintenanceAvantageTitel1",text:"serviceMaintenanceAvantageDescrip1"},
                {title:"serviceMaintenanceAvantageTitel2",text:"serviceMaintenanceAvantageDescrip2"},
                {title:"serviceMaintenanceAvantageTitel3",text:"serviceMaintenanceAvantageDescrip3"}
            ],
        },
        cost:{
            title:"serviceMaintenanceCostTitle",
            para:"serviceMaintenanceCostPara",
            souspara:"",
        },
        devMode:{
            1:{
                def:"",
                notion:"",
            },
            2:{
                def:"",
                notion:"",
            },
            3:{
                def:"",
                notion:"",
            }
        }
    },
    avdistageApp:{
        1:{
            advantage:[
                {title:"avAppHybrideTitle1",text:"avAppHybrideText1"},
                {title:"avAppHybrideTitle2",text:"avAppHybrideText2"},
                {title:"avAppHybrideTitle3",text:"avAppHybrideText3"},
                {title:"avAppHybrideTitle4",text:"avAppHybrideText4"},
                {title:"avAppHybrideTitle5",text:"avAppHybrideText5"}
            ],
            disadvantage:[
                {title:"disAppHybrideTitle1",text:"disAppHybrideText1"},
                {title:"disAppHybrideTitle2",text:"disAppHybrideText2"},
                {title:"disAppHybrideTitle3",text:"disAppHybrideText3"},
                {title:"disAppHybrideTitle4",text:"disAppHybrideText4"},
                {title:"disAppHybrideTitle5",text:"disAppHybrideText5"}
            ]
        },
        2:{
            advantage:[
                {title:"avAppCrossPlatformTitle1",text:"avAppCrossPlatformText1"},
                {title:"avAppCrossPlatformTitle2",text:"avAppCrossPlatformText2"},
                {title:"avAppCrossPlatformTitle3",text:"avAppCrossPlatformText3"},
                {title:"avAppCrossPlatformTitle4",text:"avAppCrossPlatformText4"},
                {title:"avAppCrossPlatformTitle5",text:"avAppCrossPlatformText5"}
            ],
            disadvantage:[
                {title:"disAppCrossPlatformTitle1",text:"disAppCrossPlatformText1"},
                {title:"disAppCrossPlatformTitle2",text:"disAppCrossPlatformText2"},
                {title:"disAppCrossPlatformTitle3",text:"disAppCrossPlatformText3"},
                {title:"disAppCrossPlatformTitle4",text:"disAppCrossPlatformText4"},
                {title:"disAppCrossPlatformTitle5",text:"disAppCrossPlatformText5"}
            ]
        },
        3:{
            advantage:[
                {title:"avAppNatifTitle1",text:"avAppNatifText1"},
                {title:"avAppNatifTitle2",text:"avAppNatifText2"},
                {title:"avAppNatifTitle3",text:"avAppNatifText3"},
                {title:"avAppNatifTitle4",text:"avAppNatifText4"},
                {title:"avAppNatifTitle5",text:"avAppNatifText5"}
            ],
            disadvantage:[
                {title:"disAppNatifTitle1",text:"disAppNatifText1"},
                {title:"disAppNatifTitle2",text:"disAppNatifText2"},
                {title:"disAppNatifTitle3",text:"disAppNatifText3"},
                {title:"disAppNatifTitle4",text:"disAppNatifText4"},
                {title:"disAppNatifTitle4",text:"disAppNatifText4"}
            ]
        }
    },
    avdistageSaas:{
        1:{
            advantage:[
                {title:"avSaasOfHandTitle1",text:"avSaasOfHandText1"},
                {title:"avSaasOfHandTitle2",text:"avSaasOfHandText2"},
                {title:"avSaasOfHandTitle3",text:"avSaasOfHandText3"},
                {title:"avSaasOfHandTitle4",text:"avSaasOfHandText4"},
                {title:"avSaasOfHandTitle5",text:"avSaasOfHandText5"}
            ],
            disadvantage:[
                {title:"disSaasOfHandTitle1",text:"disSaasOfHandText1"},
                {title:"disSaasOfHandTitle2",text:"disSaasOfHandText2"},
                {title:"disSaasOfHandTitle3",text:"disSaasOfHandText3"},
                {title:"disSaasOfHandTitle4",text:"disSaasOfHandText4"},
                {title:"disSaasOfHandTitle5",text:"disSaasOfHandText5"}
            ]
        },
        2:{
            advantage:[
                {title:"avSaasProgicielTitle1",text:"avSaasProgicielText1"},
                {title:"avSaasProgicielTitle2",text:"avSaasProgicielText2"},
                {title:"avSaasProgicielTitle3",text:"avSaasProgicielText3"},
                {title:"avSaasProgicielTitle4",text:"avSaasProgicielText4"},
                {title:"avSaasProgicielTitle5",text:"avSaasProgicielText5"}
            ],
            disadvantage:[
                {title:"disSaasProgicielTitle1",text:"disSaasProgicielText1"},
                {title:"disSaasProgicielTitle2",text:"disSaasProgicielText2"},
                {title:"disSaasProgicielTitle3",text:"disSaasProgicielText3"},
                {title:"disSaasProgicielTitle4",text:"disSaasProgicielText4"},
                {title:"disSaasProgicielTitle5",text:"disSaasProgicielText5"}
            ]
        }
    },
    avdistage:{
        1:{
            advantage:[
                {title:"avWorpressTitle1",text:"avWorpressText1"},
                {title:"avWorpressTitle2",text:"avWorpressText2"},
                {title:"avWorpressTitle3",text:"avWorpressText3"},
                {title:"avWorpressTitle4",text:"avWorpressText4"},
                {title:"avWorpressTitle5",text:"avWorpressText5"}
            ],
            disadvantage:[
                {title:"disWorpressTitle1",text:"disWorpressText1"},
                {title:"disWorpressTitle2",text:"disWorpressText2"},
                {title:"disWorpressTitle3",text:"disWorpressText3"},
                {title:"disWorpressTitle4",text:"disWorpressText4"},
                {title:"disWorpressTitle5",text:"disWorpressText5"}
            ]
        },
        2:{
            advantage:[
                {title:"avOfHandTitle1",text:"avOfHandText1"},
                {title:"avOfHandTitle2",text:"avOfHandText2"},
                {title:"avOfHandTitle3",text:"avOfHandText3"},
                {title:"avOfHandTitle4",text:"avOfHandText4"},
                {title:"avOfHandTitle5",text:"avOfHandText5"}
            ],
            disadvantage:[
                {title:"disOfHandTitle1",text:"disOfHandText1"},
                {title:"disOfHandTitle2",text:"disOfHandText2"},
                {title:"disOfHandTitle3",text:"disOfHandText3"},
                {title:"disOfHandTitle4",text:"disOfHandText4"},
                {title:"disOfHandTitle5",text:"disOfHandText5"}
            ]
        },
        3:{
            advantage:[
                {title:"avHybrideTitle1",text:"avHybrideText1"},
                {title:"avHybrideTitle2",text:"avHybrideText2"},
                {title:"avHybrideTitle3",text:"avHybrideText3"},
                {title:"avHybrideTitle4",text:"avHybrideText4"},
                {title:"avHybrideTitle5",text:"avHybrideText5"}
            ],
            disadvantage:[
                {title:"disHybrideTitle1",text:"disHybrideText1"},
                {title:"disHybrideTitle2",text:"disHybrideText2"},
                {title:"disHybrideTitle3",text:"disHybrideText3"}
            ]
        }
    }
}
interface ReferenceContentItem {
    img: string;
    projet: string;
    refId: number;
    index:number;
    name:string;
    cat:string;
    mode:string;
    shortText:string;
}
interface siteInterface {
    title:string,
    proprio:string,
    img:string,
    description : {title:string,para:string},
    infoSite:{title:string,year:string,cat:string,techno:string[],mode:string,link:string},
    task:string[]
}

interface RefItemContent {
    title: string;
    [key: number]: siteInterface;
}
  
interface ReferenceItem {
    title: string;
    referenceContent: ReferenceContentItem[];
}
interface refContent{
    [key: string]: RefItemContent;
}

interface Reference {
    [key: number]: ReferenceItem;
}

export const refDetailContent:refContent = {
    website: {
        title:"websiteTitle",
        1:{
            title:"websiteItemTitle",
            proprio:"websiteItem1Proprio",
            img: '/assets/images/fieger.webp',
            description:{
                title:'activityDomain',
                para:'websiteItem1Para'
            },
            infoSite:{
                title:'infoProjet',
                year:"2019",
                cat:"devModeWordpress",
                techno:['HTML5','Bootstrap','JavaScirpt',"JQuery","WordPress (CMS)",'CSS3'],
                mode:'devModeWordpress',
                link:'https://www.fieger-lamellenfenster.de/'
            },
            task:['websiteItem1TaskPara1','websiteItem1TaskPara2','websiteItem1TaskPara3','websiteItem1TaskPara4','websiteItem1TaskPara5']
        },
        2:{
            title:"websiteItemTitle",
            proprio:"websiteItem2Proprio",
            img: '/assets/images/neue-groupe.webp',
            description:{
                title:'activityDomain',
                para:'websiteItem2Para'
            },
            infoSite:{
                title:'infoProjet',
                year:"2019",
                cat:"devModeOfHand",
                techno:['HTML5','JavaScirpt',"JQuery","JQuery",'CSS3'],
                mode:'devModeOfHand',
                link:'https://www.neue-gruppe.com/'
            },
            task:['websiteItem2TaskPara1','websiteItem2TaskPara2','websiteItem2TaskPara3','websiteItem2TaskPara4','websiteItem2TaskPara5']
        },
        3:{
            title:"websiteItemTitle",
            proprio:"websiteItem3Proprio",
            img: '/assets/images/avlis.webp',
            description:{
                title:'activityDomain',
                para:'websiteItem3Para'
            },
            infoSite:{
                title:'infoProjet',
                year:"2022-2023",
                cat:"devModeOfHand",
                techno:['HTML5','Bootstrap','JavaScirpt',"JQuery","PHP",'CSS3','MySQL'],
                mode:'devModeOfHand',
                link:'https://www.avlis.fr'
            },
            task:['websiteItem3TaskPara1','websiteItem3TaskPara2','websiteItem3TaskPara3','websiteItem3TaskPara4','websiteItem3TaskPara5','websiteItem3TaskPara6']
        },
        4:{
            title:"websiteItemTitle",
            proprio:"websiteItem4Proprio",
            img: '/assets/images/charlotte-consulting.webp',
            description:{
                title:'activityDomain',
                para:'websiteItem4Para'
            },
            infoSite:{
                title:'infoProjet',
                year:"2025",
                cat:"devModeOfHand",
                techno:['HTML5','Bootstrap','JavaScirpt',"JQuery","MySql","PHP",'CSS3','External Module'],
                mode:'devModeOfHand',
                link:'https://charlottekoona.com/'
            },
            task:['websiteItem4TaskPara1','websiteItem4TaskPara2','websiteItem4TaskPara3','websiteItem4TaskPara4','websiteItem4TaskPara5','websiteItem4TaskPara6']
        },
        5:{
            title:"websiteItemTitle",
            proprio:"websiteItem5Proprio",
            img: '/assets/images/portfolio.webp',
            description:{
                title:'activityDomain',
                para:'websiteItem5Para'
            },
            infoSite:{
                title:'infoProjet',
                year:"2024",
                cat:"devModeOfHand",
                techno:['HTML5','React','JavaScirpt',"SCSS",'External Module'],
                mode:'devModeOfHand',
                link:process.env.NEXT_PUBLIC_MODE ? process.env.NEXT_PUBLIC_MODE === "prodDocker" ? 'https://portfolio.rodcoding.com' : "http://portfolio.localhost" : ""
            },
            task:['websiteItem5TaskPara1','websiteItem5TaskPara2','websiteItem5TaskPara3','websiteItem5TaskPara4','websiteItem5TaskPara5','websiteItem5TaskPara6']
        },
        6:{
            title:"websiteItemTitle",
            proprio:"websiteItem6Proprio",
            img: '/assets/images/movie-api.webp',
            description:{
                title:'activityDomain',
                para:'websiteItem6Para'
            },
            infoSite:{
                title:'infoProjet',
                year:"2024",
                cat:"devModeOfHand",
                techno:['HTML5','SCSS','JavaScirpt',"React","RestFullApi","TMDB",'CSS3','Tailwind CSS','External Module'],
                mode:'devModeOfHand',
                link:'https://movie-api-cyan-seven.vercel.app/'
            },
            task:['websiteItem6TaskPara1','websiteItem6TaskPara2','websiteItem6TaskPara3','websiteItem6TaskPara4','websiteItem6TaskPara5','websiteItem6TaskPara6']
        },
        /*/7:{
            title:"reworkedItemTitle",
            proprio:"reworkedItemProprio",
            img: '/assets/images/graphicon.webp',
            description:{
                title:'activityDomain',
                para:'reworkedWebSiteItem1Para'
            },
            infoSite:{
                title:'infoProjet',
                year:"2019",
                cat:"devModeOfHand",
                techno:['HTML5','Angular +2','JavaScirpt','CSS3(SCSS)','External Module'],
                mode:'devModeOfHand',
                link:'https://www.graphicon.de/'
            },
            task:['reworkedItemTaskPara1','reworkedItemTaskPara2','reworkedItemTaskPara3','reworkedItemTaskPara4','reworkedItemTaskPara5']
        }*/
    },
    reworked:{
        title:"reworkedTitle",
        /*1:{
            title:"reworkedItemTitle",
            proprio:"reworkedItemProprio",
            img: '/assets/images/graphicon.webp',
            description:{
                title:'activityDomain',
                para:'reworkedWebSiteItem1Para'
            },
            infoSite:{
                title:'infoProjet',
                year:"2019",
                cat:"devModeOfHand",
                techno:['HTML5','Angular +2','JavaScirpt','CSS3(SCSS)','External Module'],
                mode:'devModeOfHand',
                link:'https://www.graphicon.de/'
            },
            task:['reworkedItemTaskPara1','reworkedItemTaskPara2','reworkedItemTaskPara3','reworkedItemTaskPara4','reworkedItemTaskPara5']
        }*/
    },
    ecommerce:{
        title:"ecommerceTitle",
        1:{
            title:"ecommerceItemTitle",
            proprio:"ecommerceItem1Proprio",
            img: '/assets/images/chicken-grill.webp',
            description:{
                title:'activityDomain',
                para:'ecommerceWebSiteItem1Para'
            },
            infoSite:{
                title:'infoProjet',
                year:"2021",
                cat:"devModeOfHand",
                techno:['PHP','JavaScirpt','JQuery','MySQL','HTML5','CSS3','Bootstrap','External Module'],
                mode:'devModeOfHand',
                link:''
            },
            task:['ecommerceItem1TaskPara1','ecommerceItem1TaskPara2','ecommerceItem1TaskPara3','ecommerceItem1TaskPara4','ecommerceItem1TaskPara5','ecommerceItem1TaskPara6','ecommerceItem1TaskPara7','ecommerceItem1TaskPara8','ecommerceItem1TaskPara9']
        },
        2:{
            title:"ecommerceItemTitle",
            proprio:"ecommerceItem1Proprio",
            img: '/assets/images/kebab-gare.webp',
            description:{
                title:'activityDomain',
                para:'ecommerceWebSiteItem2Para'
            },
            infoSite:{
                title:'infoProjet',
                year:"2021",
                cat:"devModeOfHand",
                techno:['PHP','JavaScirpt','JQuery','MySQL','HTML5','CSS3','Bootstrap','External Module'],
                mode:'devModeOfHand',
                link:'https://kebab78.free.nf'
            },
            task:['ecommerceItem1TaskPara1','ecommerceItem1TaskPara2','ecommerceItem1TaskPara3','ecommerceItem1TaskPara4','ecommerceItem2TaskPara5','ecommerceItem1TaskPara6','ecommerceItem1TaskPara7','ecommerceItem1TaskPara8','ecommerceItem1TaskPara9']
        }
    },
    saas:{
        title:"saasTitle",
        1:{
            title:"saasItemTitle",
            proprio:"saasItem1Proprio",
            img: '/assets/images/lovsid.webp',
            description:{
                title:'activityDomain',
                para:'saasItem1Para'
            },
            infoSite:{
                title:'infoProjet',
                year:"2024-2025",
                cat:"devModeOfHand",
                techno:["JavaScirpt", "Angular 2+", "MySQL", "HTML5", "CSS3", "SCSS", "MySQL", "Node.js", "Docker", "S3 (AWS)", "Redis", "External Module"],
                mode:'devModeOfHand',
                link:'unavailable'
            },
            task:['saasItem1TaskPara1','saasItem1TaskPara2','saasItem1TaskPara3','saasItem1TaskPara4','saasItem1TaskPara5','saasItem1TaskPara6','saasItem1TaskPara7','saasItem1TaskPara8','saasItem1TaskPara9','saasItem1TaskPara10','saasItem1TaskPara11','saasItem1TaskPara12']
        },
        2:{
            title:"saasItemTitle",
            proprio:"saasItem2Proprio",
            img: '/assets/images/reservation-salle.webp',
            description:{
                title:'activityDomain',
                para:'saasItem2Para'
            },
            infoSite:{
                title:'infoProjet',
                year:"2021",
                cat:"devModeOfHand",
                techno:['PHP','JavaScirpt','JQuery','MySQL','HTML5','CSS3','Bootstrap','External Module'],
                mode:'devModeOfHand',
                link:'https://stwich.free.nf/'
            },
            task:['saasItem2TaskPara1','saasItem2TaskPara2','saasItem2TaskPara3','saasItem2TaskPara4','saasItem2TaskPara5','saasItem2TaskPara6','saasItem2TaskPara7,saasItem2TaskPara8']
        },
        3:{
            title:"saasItemTitle",
            proprio:"saasItem3Proprio",
            img: '/assets/images/avlis-gestion.webp',
            description:{
                title:'activityDomain',
                para:'saasItem3Para'
            },
            infoSite:{
                title:'infoProjet',
                year:"2022-2023",
                cat:"devModeOfHand",
                techno:['PHP','JavaScirpt','JQuery','MySQL','HTML5','CSS3','Bootstrap','External Module'],
                mode:'devModeOfHand',
                link:'https://www.avlis.fr/gestion'
            },
            task:['saasItem3TaskPara1','saasItem3TaskPara2','saasItem3TaskPara3','saasItem3TaskPara4','saasItem3TaskPara5','saasItem3TaskPara6,saasItem3TaskPara7']
        },
        4:{
            title:"saasItemTitle",
            proprio:"saasItem3Proprio",
            img: '/assets/images/avlis-formation.webp',
            description:{
                title:'activityDomain',
                para:'saasItem4Para'
            },
            infoSite:{
                title:'infoProjet',
                year:"2021",
                cat:"devModeOfHand",
                techno:['PHP','JavaScirpt','JQuery','MySQL','HTML5','CSS3','Bootstrap','External Module'],
                mode:'devModeOfHand',
                link:'https://www.avlis.fr/formation'
            },
            task:['saasItem3TaskPara1','saasItem3TaskPara2','saasItem3TaskPara3','saasItem3TaskPara4','saasItem3TaskPara5','saasItem3TaskPara6,saasItem3TaskPara7']
        }
    },
    app:{
        title:"appTitle",
        1:{
            title:"appItemTitle",
            proprio:"appItem1Proprio",
            img: '/assets/images/lovsid.webp',
            description:{
                title:'activityDomain',
                para:'appItem1Para'
            },
            infoSite:{
                title:'infoProjet',
                year:"2025",
                cat:"devModeOfHand",
                techno:['IONIC', 'JavaScirpt', 'ANDROID', 'CAPACITOR', 'Angular 2+', 'HTML5', 'CSS3', 'SCSS', 'External Module'],
                mode:'devModeOfHand',
                link:'unavailable'
            },
            task:['appItem4TaskPara1','appItem4TaskPara2','appItem4TaskPara3','appItem4TaskPara4','appItem4TaskPara5','appItem4TaskPara6','appItem4TaskPara7','appItem4TaskPara8','appItem4TaskPara9','appItem4TaskPara10']
        }
    }
}
export const reference: Reference = {
    1: {
      title: "websiteVitrineReferenceTitle",
      referenceContent: [
        {
          img: '/assets/images/fieger.webp',
          projet: 'Fieger',
          refId: 1,
          index:1,
          name:"websiteItem1Proprio",
          mode:"devModeWordpress",
          shortText:"websiteVitrineShortText1",
          cat:'website'
        },
        {
          img: '/assets/images/neue-groupe.webp',
          projet: 'Neue-gruppe',
          refId: 2,
          index:2,
          name:"websiteItem2Proprio",
          mode:"devModeOfHand",
          shortText:"websiteVitrineShortText2",
          cat:'website'
        },
        {
            img: '/assets/images/avlis.webp',
            projet: 'Avlis formation',
            refId: 3,
            index:3,
            name:"websiteItem3Proprio",
            mode:"devModeOfHand",
            shortText:"websiteVitrineShortText3",
            cat:'website'
        },
        {
            img: '/assets/images/charlotte-consulting.webp',
            projet: 'consultante',
            refId: 4,
            index:4,
            name:"websiteItem4Proprio",
            mode:"devModeOfHand",
            shortText:"websiteVitrineShortText4",
            cat:'website'
        },
        {
            img: '/assets/images/portfolio.webp',
            projet: 'Portfolio',
            refId: 5,
            index:5,
            name:"websiteItem5Proprio",
            mode:"devModeOfHand",
            shortText:"websiteVitrineShortText5",
            cat:'website'
        },
        {
            img: '/assets/images/movie-api.webp',
            projet: 'Movie & Serie',
            refId: 6,
            index:6,
            name:"websiteItem6Proprio",
            mode:"devModeOfHand",
            shortText:"websiteVitrineShortText6",
            cat:'website'
        },
        /*{
            img: '/assets/images/graphicon.webp',
            projet: 'Graphicon',
            refId: 7,
            index:7,
            name:"reworkedItemProprio",
            mode:"devModeOfHand",
            shortText:"websiteReworkShortText1",
            cat:'website'
        }*/
      ]
    },
    2:{
        title: "reworkWebsiteReferenceTitle",
        referenceContent: [
            /*{
                img: '/assets/images/graphicon.webp',
                projet: 'Graphicon',
                refId: 5,
                index:5,
                name:"reworkedItemProprio",
                mode:"devModeOfHand",
                shortText:"websiteReworkShortText1",
                cat:'reworked'
            }*/
        ]
    },
    3: {
        title: "websiteEcommerReferenceTitle",
        referenceContent: [
            {
                img: '/assets/images/kebab-gare.webp',
                projet: 'Kebab 78',
                refId: 2,
                index:7,
                name:"ecommerceItem1Proprio",
                mode:"devModeOfHand",
                shortText:"websiteEcommerShortText1",
                cat:'ecommerce'
            },
            {
                img: '/assets/images/chicken-grill.webp',
                projet: 'Chicken grill',
                name:"ecommerceItem1Proprio",
                refId: 1,
                index:8,
                mode:"devModeOfHand",
                shortText:"websiteEcommerShortText2",
                cat:'ecommerce'
            }
        ]
    },
    4: {
        title: "referenceSaasTitle",
        referenceContent: [
          {
            img: '/assets/images/lovsid.webp',
            projet: 'LovSid',
            refId: 1,
            index:11,
            name:"saasItem1Proprio",
            mode:"devModeOfHand",
            shortText:"saasShortText1",
            cat:'saas'
          },
          {
            img: '/assets/images/reservation-salle.webp',
            projet: 'Location de salle',
            refId: 2,
            index:12,
            name:"saasItem2Proprio",
            mode:"devModeOfHand",
            shortText:"saasShortText2",
            cat:'saas'
          },
          {
            img: '/assets/images/avlis-gestion.webp',
            projet: 'Avlis backoffice',
            refId: 3,
            index:13,
            name:"saasItem3Proprio",
            mode:"devModeOfHand",
            shortText:"saasShortText3",
            cat:'saas'
          },
          {
            img: '/assets/images/avlis-formation.webp',
            projet: 'Avlis formation',
            refId: 4,
            index:14,
            name:"saasItem3Proprio",
            mode:"devModeOfHand",
            shortText:"saasShortText4",
            cat:'saas'
          }
        ]
    },
    5: {
        title: "referenceAppTitle",
        referenceContent: [
          {
            img: '/assets/images/lovsid.webp',
            projet: 'LovSid App',
            refId: 1,
            index:11,
            name:"appItem1Proprio",
            mode:"devModeOfHand",
            shortText:"appShortText1",
            cat:'app'
          }
        ]
    }
};

export const pathwayData = [
    {
        title:'title1',
        country:'countryDe',
        periode:"periode1",
        description:"description1"
    },
    {
        title:'title2',
        country:'countryFr',
        periode:"periode2",
        description:"description2"
    },
    {
        title:'title3',
        country:'countryFr',
        periode:"periode3",
        description:"description3"
    }
]
export const experienceData = [
    {
        title:'exTitle1',
        country:'countryDe',
        periode:"exPeriode1",
        enterprice:"enterprice1",
        description:"exDescription1"
    },
    {
        title:'exTitle2',
        country:'countryFr',
        periode:"exPeriode2",
        enterprice:"enterprice2",
        description:"exDescription2"
    },
    {
        title:'exTitle3',
        country:'countryFr',
        periode:"exPeriode3",
        enterprice:"enterprice3",
        description:"exDescription3"
    },
    {
        title:'exTitle4',
        country:'countryFr',
        periode:"exPeriode4",
        enterprice:"enterprice4",
        description:"exDescription4"
    },
    {
        title:'exTitle5',
        country:'countryFr',
        periode:"exPeriode5",
        enterprice:"enterprice5",
        description:"exDescription5"
    }
]