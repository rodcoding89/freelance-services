export const LANG_LIST: readonly string[] = ['en', 'fr','de'];
export const priceList = [
    {
        id:1,
        bloc:{
            title:"standartWebsite",
            devMethode:["Wordpress","mix","ofHand"],
            content:[
                {
                    price:"999.99",
                    devType:{type:"devOn",outil:"outilTool"},
                    options:["optionWebSiteWordpress1","optionWebSiteWordpress2","optionWebSiteWordpress3","optionWebSiteWordpress4","optionWebSiteWordpress5","optionWebSiteWordpress6","optionWebSiteWordpress7","optionWebSiteWordpress8","optionWebSiteWordpress9","optionWebSiteWordpress10","optionWebSiteWordpress11","optionWebSiteWordpress12"]
                },
                {
                    price:"1999.99",
                    devType:{type:"devMix",outil:"outilMix"},
                    options:["optionWebSiteMix1","optionWebSiteMix2","optionWebSiteMix3","optionWebSiteMix4","optionWebSiteMix5","optionWebSiteMix6","optionWebSiteMix7","optionWebSiteMix8","optionWebSiteMix9","optionWebSiteMix10","optionWebSiteMix11","optionWebSiteMix12"]
                }
                ,{
                    price:"1500",
                    devType:{type:"handDev",outil:"handOutil"},
                    options:["optionWebSiteOfHand1","optionWebSiteOfHand2","optionWebSiteOfHand3","optionWebSiteOfHand4","optionWebSiteOfHand5","optionWebSiteOfHand6","optionWebSiteOfHand7","optionWebSiteOfHand8","optionWebSiteOfHand9","optionWebSiteOfHand10"]
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
                    price:"2500",
                    devType:{type:"devOn",outil:"outilTool"},
                    options:["optionEcommerceWordPress1","optionEcommerceWordPress2","optionEcommerceWordPress3","optionEcommerceWordPress4","optionEcommerceWordPress5","optionEcommerceWordPress6","optionEcommerceWordPress7","optionEcommerceWordPress8","optionEcommerceWordPress9","optionEcommerceWordPress10","optionEcommerceWordPress11","optionEcommerceWordPress12","optionEcommerceWordPress13"]
                },
                {
                    price:"1999.99",
                    devType:{type:"devMix",outil:"outilMix"},
                    options:["optionEcommerceMix1","optionEcommerceMix2","optionEcommerceMix3","optionEcommerceMix4","optionEcommerceMix5","optionEcommerceMix6",
                    "optionEcommerceMix7","optionEcommerceMix8","optionEcommerceMix9","optionEcommerceMix10","optionEcommerceMix11","optionEcommerceMix12","optionEcommerceMix13"]
                },
                {
                    price:"4000",
                    devType:{type:"handDev",outil:"handOutil"},
                    options:["optionEcommerceOfHand1","optionEcommerceOfHand2","optionEcommerceOfHand3","optionEcommerceOfHand4","optionEcommerceOfHand5","optionEcommerceOfHand6","optionEcommerceOfHand7","optionEcommerceOfHand8","optionEcommerceOfHand9","optionEcommerceOfHand10","optionEcommerceOfHand11","optionEcommerceOfHand12","optionEcommerceOfHand13"]
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
export const maintenanceOption = [
    {
        hour:50,
        year:500,
        options:[
            'optionWebSiteMaintenance1',
            'optionWebSiteMaintenance2',
            'optionWebSiteMaintenance3',
            'optionWebSiteMaintenance4',
            'optionWebSiteMaintenance5'
        ]
    },
    {
        hour:50,
        year:500,
        options:[
            'optionEcommerceMaintenance1',
            'optionEcommerceMaintenance2',
            'optionEcommerceMaintenance3',
            'optionEcommerceMaintenance4',
            'optionEcommerceMaintenance5'
        ]
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
    }
]

export const serviceDetails = {
    1:{
        title:"serviceSiteVitrineTitle",
        info:"serviceSiteVitrineDescrip",
        subtitle:"serviceSiteVitrineSubTitle",
        category:["cms","ofHand","hybride"],
        img:'/assets/images/neue-groupe.png',
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
        img:'/assets/images/graphicon.png',
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
        img:'/assets/images/chicken-grill.png',
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
        img:'/assets/images/lovsid.png',
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
        img:'/assets/images/fieger.png',
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
            img: '/assets/images/fieger.png',
            description:{
                title:'acivityDomaine',
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
            task:['websiteItem1TaksPara1','websiteItem1TaksPara2','websiteItem1TaksPara3','websiteItem1TaksPara4','websiteItem1TaksPara5']
        },
        2:{
            title:"websiteItemTitle",
            proprio:"websiteItem2Proprio",
            img: '/assets/images/neue-groupe.png',
            description:{
                title:'acivityDomaine',
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
            task:['websiteItem2TaksPara1','websiteItem2TaksPara2','websiteItem2TaksPara3','websiteItem2TaksPara4','websiteItem2TaksPara5']
        },
        3:{
            title:"websiteItemTitle",
            proprio:"websiteItem3Proprio",
            img: '/assets/images/avlis.png',
            description:{
                title:'acivityDomaine',
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
            task:['websiteItem3TaksPara1','websiteItem3TaksPara2','websiteItem3TaksPara3','websiteItem3TaksPara4','websiteItem3TaksPara5','websiteItem3TaksPara6']
        },
        4:{
            title:"websiteItemTitle",
            proprio:"websiteItem4Proprio",
            img: '/assets/images/charlotte-consulting.png',
            description:{
                title:'acivityDomaine',
                para:'websiteItem4Para'
            },
            infoSite:{
                title:'infoProjet',
                year:"2024",
                cat:"devModeOfHand",
                techno:['HTML5','Bootstrap','JavaScirpt',"JQuery","MySql","PHP",'CSS3','External Module'],
                mode:'WordPress',
                link:'https://charlottekoona.com/'
            },
            task:['websiteItem4TaksPara1','websiteItem4TaksPara2','websiteItem4TaksPara3','websiteItem4TaksPara4','websiteItem4TaksPara5','websiteItem4TaksPara6']
        },
        5:{
            title:"reworkedItemTitle",
            proprio:"reworkedItemProprio",
            img: '/assets/images/graphicon.png',
            description:{
                title:'acivityDomaine',
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
            task:['reworkedItemTaksPara1','reworkedItemTaksPara2','reworkedItemTaksPara3','reworkedItemTaksPara4','reworkedItemTaksPara5']
        }
    },
    reworked:{
        title:"reworkedTitle",
        1:{
            title:"reworkedItemTitle",
            proprio:"reworkedItemProprio",
            img: '/assets/images/graphicon.png',
            description:{
                title:'acivityDomaine',
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
            task:['reworkedItemTaksPara1','reworkedItemTaksPara2','reworkedItemTaksPara3','reworkedItemTaksPara4','reworkedItemTaksPara5']
        }
    },
    ecommerce:{
        title:"ecommerceTitle",
        1:{
            title:"ecommerceItemTitle",
            proprio:"ecommerceItem1Proprio",
            img: '/assets/images/chicken-grill.png',
            description:{
                title:'acivityDomaine',
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
            task:['ecommerceItem1TaksPara1','ecommerceItem1TaksPara2','ecommerceItem1TaksPara3','ecommerceItem1TaksPara4','ecommerceItem1TaksPara5','ecommerceItem1TaksPara6','ecommerceItem1TaksPara7','ecommerceItem1TaksPara8','ecommerceItem1TaksPara9']
        },
        2:{
            title:"ecommerceItemTitle",
            proprio:"ecommerceItem1Proprio",
            img: '/assets/images/kebab-gare.png',
            description:{
                title:'acivityDomaine',
                para:'ecommerceWebSiteItem2Para'
            },
            infoSite:{
                title:'infoProjet',
                year:"2021",
                cat:"devModeOfHand",
                techno:['PHP','JavaScirpt','JQuery','MySQL','HTML5','CSS3','Bootstrap','External Module'],
                mode:'devModeOfHand',
                link:''
            },
            task:['ecommerceItem1TaksPara1','ecommerceItem1TaksPara2','ecommerceItem1TaksPara3','ecommerceItem1TaksPara4','ecommerceItem2TaksPara5','ecommerceItem1TaksPara6','ecommerceItem1TaksPara7','ecommerceItem1TaksPara8','ecommerceItem1TaksPara9']
        }
    },
    saas:{
        title:"saasTitle",
        1:{
            title:"saasItemTitle",
            proprio:"saasItem1Proprio",
            img: '/assets/images/lovsid.png',
            description:{
                title:'acivityDomaine',
                para:'saasItem1Para'
            },
            infoSite:{
                title:'infoProjet',
                year:"2024-2025",
                cat:"devModeOfHand",
                techno:["JavaScirpt", "Angular 2+", "MySQL", "HTML5", "CSS3", "SCSS", "MySQL", "Node.js", "Docker", "S3 (AWS)", "Redis", "External Module"],
                mode:'devModeOfHand',
                link:'https://www.lovsid.com/'
            },
            task:['saasItem1TaksPara1','saasItem1TaksPara2','saasItem1TaksPara3','saasItem1TaksPara4','saasItem1TaksPara5','saasItem1TaksPara6','saasItem1TaksPara7','saasItem1TaksPara8','saasItem1TaksPara9','saasItem1TaksPara10']
        },
        2:{
            title:"saasItemTitle",
            proprio:"saasItem2Proprio",
            img: '/assets/images/reservation-salle.png',
            description:{
                title:'acivityDomaine',
                para:'saasItem2Para'
            },
            infoSite:{
                title:'infoProjet',
                year:"2021",
                cat:"devModeOfHand",
                techno:['PHP','JavaScirpt','JQuery','MySQL','HTML5','CSS3','Bootstrap','External Module'],
                mode:'devModeOfHand',
                link:''
            },
            task:['saasItem2TaksPara1','saasItem2TaksPara2','saasItem2TaksPara3','saasItem2TaksPara4','saasItem2TaksPara5','saasItem2TaksPara6','saasItem2TaksPara7']
        },
        3:{
            title:"saasItemTitle",
            proprio:"saasItem3Proprio",
            img: '/assets/images/avlis-gestion.png',
            description:{
                title:'acivityDomaine',
                para:'saasItem3Para'
            },
            infoSite:{
                title:'infoProjet',
                year:"2022-2023",
                cat:"devModeOfHand",
                techno:['PHP','JavaScirpt','JQuery','MySQL','HTML5','CSS3','Bootstrap','External Module'],
                mode:'devModeOfHand',
                link:'https://www.avlis.fr/formation'
            },
            task:['saasItem3TaksPara1','saasItem3TaksPara2','saasItem3TaksPara3','saasItem3TaksPara4','saasItem3TaksPara5','saasItem3TaksPara6']
        },
        4:{
            title:"saasItemTitle",
            proprio:"saasItem3Proprio",
            img: '/assets/images/avlis-formation.png',
            description:{
                title:'acivityDomaine',
                para:'saasItem4Para'
            },
            infoSite:{
                title:'infoProjet',
                year:"2021",
                cat:"devModeOfHand",
                techno:['PHP','JavaScirpt','JQuery','MySQL','HTML5','CSS3','Bootstrap','External Module'],
                mode:'devModeOfHand',
                link:'https://www.avlis.fr/gestion'
            },
            task:['saasItem3TaksPara1','saasItem3TaksPara2','saasItem3TaksPara3','saasItem3TaksPara4','saasItem3TaksPara5','saasItem3TaksPara6']
        }
    },
    app:{
        title:"appTitle",
        1:{
            title:"appItemTitle",
            proprio:"appItem1Proprio",
            img: '/assets/images/avlis.png',
            description:{
                title:'acivityDomaine',
                para:'appItem1Para'
            },
            infoSite:{
                title:'infoProjet',
                year:"2025",
                cat:"devModeOfHand",
                techno:['IONIC', 'JavaScirpt', 'ANDROID', 'CAPACITOR', 'Angular 2+', 'HTML5', 'CSS3', 'SCSS', 'External Module'],
                mode:'devModeOfHand',
                link:''
            },
            task:['appItem4TaksPara1','appItem4TaksPara2','appItem4TaksPara3','appItem4TaksPara4','appItem4TaksPara5','appItem4TaksPara6','appItem4TaksPara7','appItem4TaksPara8']
        }
    }
}
export const reference: Reference = {
    1: {
      title: "websiteVitrineReferenceTitle",
      referenceContent: [
        {
          img: '/assets/images/fieger.png',
          projet: 'Fieger',
          refId: 1,
          index:1,
          name:"websiteItem1Proprio",
          mode:"devModeWordpress",
          shortText:"websiteVitrineShortText1",
          cat:'website'
        },
        {
          img: '/assets/images/neue-groupe.png',
          projet: 'Neue-gruppe',
          refId: 2,
          index:2,
          name:"websiteItem2Proprio",
          mode:"devModeOfHand",
          shortText:"websiteVitrineShortText2",
          cat:'website'
        },
        {
            img: '/assets/images/avlis.png',
            projet: 'Avlis formation',
            refId: 3,
            index:3,
            name:"websiteItem3Proprio",
            mode:"devModeOfHand",
            shortText:"websiteVitrineShortText3",
            cat:'website'
        },
        {
            img: '/assets/images/charlotte-consulting.png',
            projet: 'Charlotte consulting',
            refId: 4,
            index:4,
            name:"websiteItem4Proprio",
            mode:"devModeOfHand",
            shortText:"websiteVitrineShortText4",
            cat:'website'
        },
        {
            img: '/assets/images/graphicon.png',
            projet: 'Graphicon',
            refId: 5,
            index:5,
            name:"reworkedItemProprio",
            mode:"devModeOfHand",
            shortText:"websiteReworkShortText1",
            cat:'website'
        }
      ]
    },
    2:{
        title: "reworkWebsiteReferenceTitle",
        referenceContent: [
            {
                img: '/assets/images/graphicon.png',
                projet: 'Graphicon',
                refId: 5,
                index:5,
                name:"reworkedItemProprio",
                mode:"devModeOfHand",
                shortText:"websiteReworkShortText1",
                cat:'website'
            }
        ]
    },
    3: {
        title: "websiteEcommerReferenceTitle",
        referenceContent: [
            {
                img: '/assets/images/kebab-gare.png',
                projet: 'Kebab 78',
                refId: 2,
                index:7,
                name:"ecommerceItem1Proprio",
                mode:"devModeOfHand",
                shortText:"websiteEcommerShortText1",
                cat:'ecommerce'
            },
            {
                img: '/assets/images/chicken-grill.png',
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
            img: '/assets/images/lovsid.png',
            projet: 'LovSid',
            refId: 1,
            index:11,
            name:"saasItem1Proprio",
            mode:"devModeOfHand",
            shortText:"saasShortText1",
            cat:'saas'
          },
          {
            img: '/assets/images/reservation-salle.png',
            projet: 'Location de salle',
            refId: 2,
            index:12,
            name:"saasItem2Proprio",
            mode:"devModeOfHand",
            shortText:"saasShortText2",
            cat:'saas'
          },
          {
            img: '/assets/images/avlis-gestion.png',
            projet: 'Avlis backoffice',
            refId: 3,
            index:13,
            name:"saasItem3Proprio",
            mode:"devModeOfHand",
            shortText:"saasShortText3",
            cat:'saas'
          },
          {
            img: '/assets/images/avlis-formation.png',
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
            img: '/assets/images/fieger.png',
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
        country:'countryDe',
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
  