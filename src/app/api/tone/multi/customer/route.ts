import { NextResponse } from "next/server";

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

    const url = `http://api.avaflow.net/tone/multi/customer?${apiParams.toString()}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('Failed to fetch multi-customer data');
    }
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch multi-customer data' },
      { status: 500 }
    );
  }
}
