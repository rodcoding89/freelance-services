"use server"

import { headers } from "next/headers";

async function getIp() {
  // L’IP est généralement dans les headers "x-forwarded-for"
  const headersList = headers();
  const forwarded = (await headersList).get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : null;

  return ip;

  // Traiter la requête avec l'IP...
}

export {getIp};