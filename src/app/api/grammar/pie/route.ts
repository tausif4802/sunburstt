import { NextResponse } from 'next/server';

import { logger } from '@/lib/logger';
import NodeCache from 'node-cache';

// Initialize cache with 5 minute TTL
const cache = new NodeCache({ stdTTL: 300 });

// Custom error class for validation errors
class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

// Date validation functions
function isValidISODate(dateStr: string): boolean {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateStr)) return false;
  const date = new Date(dateStr);
  return date instanceof Date && !isNaN(date.getTime());
}

function validateDateRange(fromDate: string | null, toDate: string | null) {
  if (fromDate && !isValidISODate(fromDate)) {
    throw new ValidationError('from_date must be in YYYY-MM-DD format');
  }
  if (toDate && !isValidISODate(toDate)) {
    throw new ValidationError('to_date must be in YYYY-MM-DD format');
  }
  
  if (fromDate && toDate) {
    const fromDateTime = new Date(fromDate).getTime();
    const toDateTime = new Date(toDate).getTime();
    const maxRangeMs = 365 * 24 * 60 * 60 * 1000; // 1 year in milliseconds

    if (fromDateTime > toDateTime) {
      throw new ValidationError('from_date must be before or equal to to_date');
    }

    if (toDateTime - fromDateTime > maxRangeMs) {
      throw new ValidationError('Date range cannot exceed 1 year');
    }

    const now = new Date().getTime();
    if (toDateTime > now) {
      throw new ValidationError('to_date cannot be in the future');
    }
  }
}

export async function GET(request: Request) {
  const route = '/api/grammar/pie';
  try {
    const { searchParams } = new URL(request.url);
    const fromDate = searchParams.get('from_date');
    const toDate = searchParams.get('to_date');
    const errorCode = searchParams.get('error_code');
    const agentId = searchParams.get('agent_id');

    logger.info('Received pie chart request', { 
      params: Object.fromEntries(searchParams.entries()) 
    }, route);

    // Validate dates if provided
    try {
      validateDateRange(fromDate, toDate);
    } catch (error) {
      if (error instanceof ValidationError) {
        logger.warn('Date validation failed', {
          error: error.message,
          params: { fromDate, toDate }
        }, route);
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }
      throw error;
    }

    // Build query parameters
    const queryParams = new URLSearchParams();
    if (fromDate) queryParams.append('from_date', fromDate);
    if (toDate) queryParams.append('to_date', toDate);
    if (errorCode) queryParams.append('error_code', errorCode);
    if (agentId) queryParams.append('agent_id', agentId);

    // Check cache first
    const cacheKey = `pie:${queryParams.toString()}`;
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      logger.info('Cache hit', { cacheKey }, route);
      return NextResponse.json(cachedData);
    }

    logger.info('Cache miss, fetching from API', { cacheKey }, route);

    // Fetch data from external API
    const apiUrl = `http://api.avaflow.net/grammar/pie${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    logger.info('Fetching from external API', { url: apiUrl }, route);

    const response = await fetch(apiUrl, {
      headers: {
        'accept': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error('External API error', new Error(errorText), {
        status: response.status,
        url: apiUrl
      }, route);
      
      // Handle specific HTTP status codes
      switch (response.status) {
        case 400:
          return NextResponse.json(
            { error: 'Invalid request parameters' },
            { status: 400 }
          );
        case 404:
          return NextResponse.json(
            { error: 'Requested data not found' },
            { status: 404 }
          );
        case 429:
          return NextResponse.json(
            { error: 'Too many requests. Please try again later' },
            { status: 429 }
          );
        default:
          throw new Error(`API request failed with status ${response.status}: ${errorText}`);
      }
    }

    const data = await response.json();
    
    // Cache the successful response
    cache.set(cacheKey, data);
    logger.info('Successfully cached response', { 
      cacheKey,
      dataLength: typeof data === 'object' ? Object.keys(data).length : 'N/A' 
    }, route);
    
    return NextResponse.json(data);
  } catch (error) {
    logger.error('Unhandled error in pie API', error instanceof Error ? error : new Error('Unknown error'), {
      url: request.url
    }, route);
    
    // Handle different error types
    if (error instanceof ValidationError) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    // Handle network errors specifically
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      return NextResponse.json(
        { error: 'Unable to connect to the grammar pie service. Please try again later.' },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch grammar pie data' },
      { status: 500 }
    );
  }
}
