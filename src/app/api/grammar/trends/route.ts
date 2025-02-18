import { NextResponse } from 'next/server';
import NodeCache from 'node-cache';
import { logger } from '@/lib/logger';

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

function validateDateRange(fromDate: string, toDate: string) {
  // Validate date formats
  if (!isValidISODate(fromDate)) {
    throw new ValidationError('from_date must be in YYYY-MM-DD format');
  }
  if (!isValidISODate(toDate)) {
    throw new ValidationError('to_date must be in YYYY-MM-DD format');
  }

  const fromDateTime = new Date(fromDate).getTime();
  const toDateTime = new Date(toDate).getTime();
  const maxRangeMs = 365 * 24 * 60 * 60 * 1000; // 1 year in milliseconds

  // Validate date order
  if (fromDateTime > toDateTime) {
    throw new ValidationError('from_date must be before or equal to to_date');
  }

  // Validate range limit
  if (toDateTime - fromDateTime > maxRangeMs) {
    throw new ValidationError('Date range cannot exceed 1 year');
  }

  // Validate future dates
  const now = new Date().getTime();
  if (toDateTime > now) {
    throw new ValidationError('to_date cannot be in the future');
  }
}

function generateCacheKey(params: URLSearchParams): string {
  return `trends:${params.toString()}`;
}

export async function GET(request: Request) {
  const route = '/api/grammar/trends';
  try {
    const { searchParams } = new URL(request.url);
    const errorCode = searchParams.get('error_code');
    const isTeam = searchParams.get('is_team');

    logger.info('Received trends request', { 
      params: Object.fromEntries(searchParams.entries()) 
    }, route);

    // Validate required parameters
    if (!errorCode) {
      logger.warn('Missing required parameter: error_code', {
        params: Object.fromEntries(searchParams.entries())
      }, route);
      return NextResponse.json(
        { error: 'error_code is required' },
        { status: 400 }
      );
    }

    // Get dates with defaults
    const toDate = searchParams.get('to_date') || new Date().toISOString().split('T')[0];
    const defaultFromDate = new Date();
    defaultFromDate.setDate(defaultFromDate.getDate() - 30);
    const fromDate = searchParams.get('from_date') || defaultFromDate.toISOString().split('T')[0];

    // Validate dates
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
    queryParams.append('from_date', fromDate);
    queryParams.append('to_date', toDate);
    queryParams.append('error_code', errorCode);
    queryParams.append('is_team', isTeam === 'true' ? 'true' : 'false');

    // Check cache first
    const cacheKey = generateCacheKey(queryParams);
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      logger.info('Cache hit', { cacheKey }, route);
      return NextResponse.json(cachedData);
    }

    logger.info('Cache miss, fetching from API', { cacheKey }, route);

    // Fetch data from external API
    const apiUrl = `http://api.avaflow.net/grammar/trends${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
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
            { error: 'Invalid request parameters. Please check your input.' },
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
    logger.info('Successfully cached response', { cacheKey }, route);
    
    return NextResponse.json(data);
  } catch (error) {
    logger.error('Unhandled error in trends API', error instanceof Error ? error : new Error('Unknown error'), {
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
        { error: 'Unable to connect to the grammar trends service. Please try again later.' },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch grammar trends data' },
      { status: 500 }
    );
  }
}
