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

    const url = `http://api.avaflow.net/tone/agent?${apiParams.toString()}`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching agent tone data:", error);
    return NextResponse.json(
      { error: "Failed to fetch agent tone data" },
      { status: 500 }
    );
  }
}
