import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import NodeCache from 'node-cache';

// Initialize cache with 5 minute TTL
const cache = new NodeCache({ stdTTL: 300 });

// Grammar error type definitions with descriptions
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

export const GET = async () => {
  const route = '/api/grammar/mapper';
  try {
    logger.info('Received mapper request', {
      typesAvailable: Object.keys(grammarTypes).length
    }, route);

    // Check cache first
    const cacheKey = 'mapper:types';
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      logger.info('Cache hit', { cacheKey }, route);
      return NextResponse.json(cachedData);
    }

    logger.info('Cache miss, preparing response', { cacheKey }, route);
    
    // Cache the grammar types
    cache.set(cacheKey, grammarTypes);
    logger.info('Successfully cached grammar types', {
      cacheKey,
      typesCount: Object.keys(grammarTypes).length
    }, route);
    
    return NextResponse.json(grammarTypes);
  } catch (error) {
    logger.error('Unhandled error in mapper API', error instanceof Error ? error : new Error('Unknown error'), {}, route);
    
    return NextResponse.json(
      { error: 'Failed to fetch grammar types' },
      { status: 500 }
    );
  }
}
