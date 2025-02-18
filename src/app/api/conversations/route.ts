import { NextResponse } from "next/server"

export async function GET() {
  try {
    const mockData = [
      {
        "18098": {
          "last_message": "Dear valued Traders, We are delighted to announce that we have made significant enhancements to our customer service system to ensure a more efficient and seamless experience for you.",
          "last_time": "2023-07-29T02:56:29",
          "user_name": "Odd Soerhaug",
          "user_email": "ohs@spanialegal.com",
          "is_last_message_owner_agent": true
        }
      },
      {
        "15887": {
          "last_message": "Let me check this again. I will get back to you soon.",
          "last_time": "2023-07-17T07:28:17",
          "user_name": "Mina Henin",
          "user_email": "minabaher350@gmail.com",
          "is_last_message_owner_agent": true
        }
      },
      {
        "2548": {
          "last_message": "Hopefully, your day will be pleasant. Please let me know if there is any way I can be of assistance.",
          "last_time": "2023-07-26T09:04:44",
          "user_name": "mahdi berro",
          "user_email": "mahdi_berro@hotmail.com",
          "is_last_message_owner_agent": true
        }
      },
      {
        "10587": {
          "last_message": "As a FundedNext trader, you have access to a range of starting balance options across our challenges.",
          "last_time": "2023-09-13T06:58:49",
          "user_name": "Tain Quin liaw",
          "user_email": "liaw90@hotmail.com",
          "is_last_message_owner_agent": true
        }
      },
      {
        "21938": {
          "last_message": "Dear valued Traders, We are delighted to announce that we have made significant enhancements to our customer service system.",
          "last_time": "2023-07-27T13:07:23",
          "user_name": "Muhammad Umar Farooq",
          "user_email": "xarain096@gmail.com",
          "is_last_message_owner_agent": true
        }
      }
    ]

    // For now, return mock data instead of making the actual API call
    // const response = await fetch("http://api.avaflow.net/conversation/head", {
    //   headers: {
    //     "Content-Type": "application/json",
    //     "Accept": "application/json",
    //   },
    //   cache: "no-store"
    // })

    // if (!response.ok) {
    //   const errorText = await response.text()
    //   console.error(`API Error (${response.status}):`, errorText)
    //   throw new Error(`API responded with status: ${response.status}`)
    // }

    // const data = await response.json()

    return NextResponse.json(mockData, {
      headers: {
        "Cache-Control": "no-store, max-age=0",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    })
  } catch (error) {
    console.error("Error fetching conversations:", error)
    return NextResponse.json(
      { error: "Failed to fetch conversations. Please try again later." },
      { 
        status: 500,
        headers: {
          "Cache-Control": "no-store, max-age=0",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      }
    )
  }
}

export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    }
  )
}
