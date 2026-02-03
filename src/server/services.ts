"use server"

import { cookies, headers } from "next/headers";

import { sign } from "./handle-database";

interface UserSalesSchema {
    juridiction:string;
    totalSales:number;
    taxThreshold:number;
    taxRequired:boolean;
    lastUpdated:string;
}

const baseUrl = process.env.NEXT_PUBLIC_ROOT_LINK || 'http://localhost:3000';

async function getIp() {
  // L’IP est généralement dans les headers "x-forwarded-for"
  const headersList = headers();
  const forwarded = (await headersList).get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : null;

  return ip;

  // Traiter la requête avec l'IP...
}

async function userAuth(email:string,password:string){
  console.log("email",email)
  console.log("password",password)
  try {
    const credential = await sign(email, password);
    const uid = credential.uid;

    const oneDayInSeconds = 24 * 60 * 60;
    const isDev = process.env.NODE_ENV === 'development';

    (await cookies()).set({
      name: "userAuth",
      value: uid,
      httpOnly: true,
      secure: isDev ? false : true,
      sameSite: 'strict',
      path: '/',
      maxAge: oneDayInSeconds
    });
    console.log("credential",credential)
    return { success: true, message: "" };
  } catch (error:any) {
    console.error("Erreur d'authentification :", error);
    let errorMessage = "Une erreur inconnue s'est produite lors de l'authentification.";
    if (error.code) {
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = "Aucun utilisateur trouvé avec cet e-mail.";
          break;
        case 'auth/wrong-password':
          errorMessage = "Mot de passe incorrect.";
          break;
        case 'auth/invalid-email':
          errorMessage = "L'adresse e-mail n'est pas valide.";
          break;
        default:
          errorMessage = error.message || errorMessage;
      }
    }
    return { success: false, message: errorMessage };
  }
}

async function userLogout(){
  
}

async function getCookie(name:string){
  try {
    const cookieStore = await cookies()
    const cookieValue = cookieStore.get(name)?.value ?? null;
    //console.log("cookieValue",cookieValue)
    if (cookieValue) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.log("error",error)
    return false;
  }
}

export {getIp,userAuth,getCookie,userLogout};