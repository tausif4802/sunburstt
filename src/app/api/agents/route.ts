import { NextResponse } from 'next/server';

interface TeamData {
  [team: string]: string[];
}

export async function GET() {
  try {
    // Fetch team data
    const response = await fetch('http://api.avaflow.net/agent/team', {
      headers: {
        'accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Team API request failed with status ${response.status}`);
    }

    const teamData = await response.json() as TeamData;
    
    // Transform team data into flat list of agents with team info
    const agents = Object.entries(teamData).flatMap(([team, agentIds]) =>
      agentIds.map((id: string) => ({
        id,
        name: `Agent ${id} (${team.replace('TEAM_', 'Team ')})`
      }))
    ).sort((a, b) => a.name.localeCompare(b.name));

    return NextResponse.json(agents);

    /* Real implementation will look like this:
    const { sql } = require('@vercel/postgres');
    const { rows } = await sql`
      SELECT id::text, name 
      FROM users 
      WHERE role = 'agent'
      ORDER BY name ASC;
    `;
    return NextResponse.json(rows);
    */
  } catch (error) {
    console.error('Error fetching agents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch agents' },
      { status: 500 }
    );
  }
}
