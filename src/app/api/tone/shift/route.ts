import { NextResponse } from "next/server";

interface ToneShiftResponse {
  data: Record<string, number>;
  conversation_id_list: number[];
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const fromDate = searchParams.get('from_date');
    const toDate = searchParams.get('to_date');
    
    if (!fromDate || !toDate) {
      return NextResponse.json(
        { error: 'from_date and to_date are required parameters' },
        { status: 400 }
      );
    }

    const agentId = searchParams.get('agent_id');
    const apiParams = new URLSearchParams();
    apiParams.append('from_date', fromDate);
    apiParams.append('to_date', toDate);
    if (agentId) apiParams.append('agent_id', agentId);

    const url = `http://api.avaflow.net/tone/shift?${apiParams.toString()}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('Failed to fetch tone shift data');
    }
    const responseData = await response.json() as ToneShiftResponse;
    
    if (!responseData.data) {
      throw new Error('Invalid response format: missing data property');
    }
    
    return NextResponse.json(responseData.data);
  } catch (error) {
    console.error('Error fetching tone shift data:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch tone shift data' },
      { status: 500 }
    );
  }
}
