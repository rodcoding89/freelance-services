import axios from 'axios'
import { cookies } from 'next/headers'

export const generedToken = async()=>{
    const access_token = "1000.37f5046061a3a30a39497b0dfd1c5fa5.cdfe98d9a1b1bafa727de4f363af4fc7"
    const response = await axios.post(`${process.env.ZOHO_BASE_URL}/oauth/v2/token`,null,{
        params:{
            grant_type: 'refresh_token',
            refresh_token: process.env.ZOHO_REFRESH_TOKEN,
            client_id: process.env.ZOHO_DRIVE_CLIENT_ID,
            client_secret: process.env.ZOHO_DRIVE_SECRET
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