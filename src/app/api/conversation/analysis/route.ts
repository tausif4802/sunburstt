import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import NodeCache from 'node-cache';

interface ErrorMappers {
  grammar: { [key: string]: string };
  tone: { [key: string]: string };
}

// Initialize cache with 5 minute TTL
const cache = new NodeCache({ stdTTL: 300 });

// Grammar error type definitions
const grammarTypes = {
  "G_101": "Sentence Structure Errors",
  "G_102": "Subject-Verb Agreement Errors",
  "G_103": "Pronoun Usage Errors",
  "G_104": "Punctuation Errors",
  "G_105": "Regular Spelling Errors",
  "G_106": "Context-Altering Spelling Errors",
  "G_107": "Preposition Errors",
  "G_108": "Capitalization Errors",
  "G_109": "Tone/Style Errors",
  "G_110": "Redundancy and Wordiness Errors",
  "G_111": "Negation Errors",
  "G_112": "Lack of Consistency Errors",
  "G_113": "Missing Articles Errors",
  "G_114": "Misuse of Conjunctions Errors"
};

// Tone error type definitions
const toneTypes = {
  "T_101": "Negative Tone",
  "T_102": "Unprofessional Language",
  "T_103": "Aggressive Language",
  "T_104": "Dismissive Tone",
  "T_105": "Sarcastic Tone",
  "T_106": "Condescending Tone",
  "T_107": "Impatient Tone",
  "T_108": "Frustrated Tone",
  "T_109": "Insensitive Language",
  "T_110": "Overly Casual Tone"
};

async function fetchErrorMappers(): Promise<ErrorMappers> {
  const cacheKey = 'error:mappers';
  const cachedMappers = cache.get(cacheKey) as ErrorMappers | undefined;
  if (cachedMappers) {
    return cachedMappers;
  }

  try {
    // Fetch grammar mapper
    const grammarResponse = await fetch('http://api.avaflow.net/grammar/mapper');
    const grammarData = await grammarResponse.json();

    // Fetch tone mapper
    const toneResponse = await fetch('http://api.avaflow.net/tone/mapper');
    const toneData = await toneResponse.json();

    const mappers: ErrorMappers = {
      grammar: grammarData,
      tone: toneData
    };

    cache.set(cacheKey, mappers);
    return mappers;
  } catch (error) {
    logger.error('Failed to fetch error mappers', error instanceof Error ? error : new Error('Unknown error'));
    // Fallback to local definitions if API fails
    return {
      grammar: grammarTypes,
      tone: toneTypes
    };
  }
}

export async function GET(request: Request) {
  const route = '/api/conversation/analysis';
  const { searchParams } = new URL(request.url);
  const conversationId = searchParams.get('conversation_id');
  
  if (!conversationId) {
    return new NextResponse('Missing conversation_id parameter', { status: 400 });
  }

  try {
    // Fetch error mappers (from cache or API)
    const errorMappers = await fetchErrorMappers();

    // Fetch conversation analysis
    const url = new URL('/conversation/analysis', 'http://api.avaflow.net');
    url.searchParams.set('conversation_id', conversationId);
    const response = await fetch(url);
    const data = await response.json();

    // Map error codes to descriptions
    const mappedData = data.map((item: any) => ({
      ...item,
      error_details: item.error_details.map((error: any) => ({
        ...error,
        error_description: error.error_code.startsWith('G_') 
          ? errorMappers.grammar[error.error_code]
          : errorMappers.tone[error.error_code]
      }))
    }));

    return NextResponse.json(mappedData);
  } catch (error) {
    logger.error('Error in conversation analysis', error instanceof Error ? error : new Error('Unknown error'), {}, route);
    return NextResponse.json(
      { error: 'Failed to fetch conversation analysis' },
      { status: 500 }
    );
  }
}
