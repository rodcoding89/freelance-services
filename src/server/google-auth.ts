"use server"
import { drive_v3, google } from "googleapis";
import path from 'path';
import { fileURLToPath } from "url";

// Emulation de __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SCOPE = process.env.GOOGLE_DRIVE_SCOPE;

export async function GoogleAuth (){
    if(!SCOPE) return null;
    const auth = new google.auth.GoogleAuth({
        keyFile: path.resolve(__dirname, './google-service.json'), // Ton fichier téléchargé
        scopes: [SCOPE],
    });
    return auth;
}