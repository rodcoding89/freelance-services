"use client";

import "vanilla-cookieconsent/dist/cookieconsent.css";
import * as CookieConsent from "vanilla-cookieconsent";
import { useEffect, useState } from "react";

interface CookieConsentCompoProbs{
    locale:string
}
const CookieConsentCompo:React.FC<CookieConsentCompoProbs> = ({locale}) => {
  
  useEffect(() => {
    CookieConsent.run({
        cookie: {
            name: 'rod-coding_cookie',
            domain: location.hostname,
            path: '/',
            sameSite: "Lax",
            expiresAfterDays: 182,
        },
        guiOptions: {
            consentModal: {
                layout: 'box wide',
                position: 'bottom left',
                equalWeightButtons: true,
                flipButtons: false
            },
            preferencesModal: {
                layout: 'box',
                equalWeightButtons: true,
                flipButtons: false
            }
        },
       categories: {
            necessary: {
                enabled: true,  // this category is enabled by default
                readOnly: true  // this category cannot be disabled
            },
            analytics: {}
        },

        language: {
            autoDetect: "document",
            default: 'en',
            translations: {
                fr: {
                    consentModal: {
                        title: 'Nous utilisons des cookies',
                        description: 'Ce site utilise des cookies pour améliorer votre expérience utilisateur et analyser le trafic.',
                        acceptAllBtn: 'Tout accepter',
                        footer: `
                        <a href="/${locale}/legal-notices" target="_blank">Mentions légales</a>
                        <a href="/${locale}/privacy-policies" target="_blank">Politique de confidentialité</a>
                        `,
                    },
                    preferencesModal: {
                        title: 'Manage cookie preferences',
                        acceptAllBtn: 'Accept all',
                        savePreferencesBtn: 'Accept current selection',
                        closeIconLabel: 'Close modal',
                        sections: []
                    }
                },
                de: {
                    consentModal: {
                        title: 'Wir verwenden Cookies',
                        description: 'Diese Website verwendet Cookies, um Ihre Nutzererfahrung zu verbessern und den Datenverkehr zu analysieren.',
                        acceptAllBtn: 'Alle akzeptieren',
                        footer: `
                        <a href="/${locale}/legal-notices" target="_blank">Impressum</a>
                        <a href="/${locale}/privacy-policies" target="_blank">Datenschutzerklärung</a>
                        `,  
                    },
                    preferencesModal: {
                        title: 'Manage cookie preferences',
                        acceptAllBtn: 'Accept all',
                        acceptNecessaryBtn: 'Reject all',
                        savePreferencesBtn: 'Accept current selection',
                        closeIconLabel: 'Close modal',
                        sections: []
                    }
                },
                en: {
                    consentModal: {
                        title: 'We use cookies',
                        description: 'This site uses cookies to enhance your user experience and analyze traffic.',
                        acceptAllBtn: 'Accept all',
                        footer: `
                        <a href="/${locale}/legal-notices" target="_blank">Legal Notice</a>
                        <a href="/${locale}/privacy-policies" target="_blank">Privacy Policy</a>
                        `,
                    },
                    preferencesModal: {
                        title: 'Manage cookie preferences',
                        acceptAllBtn: 'Accept all',
                        acceptNecessaryBtn: 'Reject all',
                        savePreferencesBtn: 'Accept current selection',
                        closeIconLabel: 'Close modal',
                        sections: []
                    }
                }
            }
        }     
    });
  }, []);

  return ''
};

export default CookieConsentCompo;
