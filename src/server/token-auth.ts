"use server"

import { DecoderData } from '@/utils/fonction'
import axios from 'axios'
import { cookies } from 'next/headers'

const REFRESH_TOCKEN = process.env.MODE ? DecoderData(process.env.ZOHO_REFRESH_TOKEN ?? "") : process.env.ZOHO_REFRESH_TOKEN
const ZOHO_CLIENT_ID = process.env.MODE ? DecoderData(process.env.ZOHO_DRIVE_CLIENT_ID ?? "") : process.env.ZOHO_DRIVE_CLIENT_ID
const ZOHO_DRIVE_SECRET = process.env.MODE ? DecoderData(process.env.ZOHO_DRIVE_SECRET ?? "") : process.env.ZOHO_DRIVE_SECRET

export const generedToken = async()=>{
    const access_token = "1000.37f5046061a3a30a39497b0dfd1c5fa5.cdfe98d9a1b1bafa727de4f363af4fc7"
    const response = await axios.post(`${process.env.NEXT_PUBLIC_ZOHO_BASE_URL}/oauth/v2/token`,null,{
        params:{
            grant_type: 'refresh_token',
            refresh_token: REFRESH_TOCKEN,
            client_id: ZOHO_CLIENT_ID,
            client_secret: ZOHO_DRIVE_SECRET
        }
    })
    saveAccessTokenAsCookie(response.data.access_token ?? null)
    return response.data.access_token ?? null
}

const saveAccessTokenAsCookie = async(accessTocken:string|null)=>{
    if(!accessTocken) return
    const cookie = await cookies()
    cookie.set("access_token",accessTocken,{
        httpOnly: true,
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production',
        path: '/'
    })
}