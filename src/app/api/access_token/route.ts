
import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

export async function GET(req: NextRequest) {
    /*const response = await axios.post('https://accounts.zoho.eu/oauth/v2/token',null,
        {
            params:{
                grant_type: 'refresh_token',
                refresh_token: process.env.ZOHO_REFRESH_TOKEN,
                client_id: process.env.ZOHO_DRIVE_CLIENT_ID,
                client_secret: process.env.ZOHO_DRIVE_SECRET
            }
        })

  
  console.log("token",response.data,response.data.token,"refresh",response.data.refresh_token)
  return NextResponse.json({data:response.data},{status:200})*/
  
}
