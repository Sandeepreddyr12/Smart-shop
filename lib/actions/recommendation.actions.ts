'use server';

import { IProduct } from '../db/models/product.model';
import { formatError } from '../utils';

// Types for recommendation responses
export interface RecommendationProduct extends IProduct{
  score : number
}

export interface RecommendationResponse {
  recommendations: RecommendationProduct[];
  success: string;
  message?: string;
}

// Configuration
const RECOMMENDATION_API_BASE_URL =
  process.env.RECOMMENDATION_API_URL || 'http://127.0.0.1:8000';

/**
 * Get user recommendations from FastAPI endpoint
 * @param user_id - The ID of the user
 * @param n_recommendations - Number of recommendations to return (default: 10)
 * @returns Promise with recommendation data or error
 */
export async function getUserRecommendations(
  user_id: string,
  // n_recommendations: number = 10
): Promise<{
  success: boolean;
  data?: RecommendationProduct[];
  message?: string;
}> {
  try {
    const url = `${RECOMMENDATION_API_BASE_URL}/api/v1/recommendations/${user_id}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Add timeout for better error handling
      // signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    return {
      success: true,
      data: JSON.parse(JSON.stringify(data as RecommendationProduct[])),
    };
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    };
  }
}

/**
 * Get product-specific recommendations from FastAPI endpoint
 * @param user_id - The ID of the user
 * @param product_id - The ID of the product being viewed
 * @param n_recommendations - Number of recommendations to return (default: 10)
 * @returns Promise with recommendation response or error
 */
export async function getProductRecommendations(
  user_id: string,
  product_id: string,
  // n_recommendations: number = 10
): Promise<{
  success: boolean;
  data?: RecommendationProduct[];
  message?: string;
}> {
  try {
    const url = `${RECOMMENDATION_API_BASE_URL}/api/v1/recommendations/${user_id}/${product_id}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Add timeout for better error handling
      // signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    return {
      success: true,
      data: JSON.parse(JSON.stringify(data as RecommendationProduct[])),
    };
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    };
  }
}

/**
 * Get recommendations with authentication (if needed)
 * @param user_id - The ID of the user
 * @param product_id - Optional product ID for product-specific recommendations
 * @param n_recommendations - Number of recommendations to return (default: 10)
 * @param authToken - Optional authentication token
 * @returns Promise with recommendation data or error
 */
export async function getRecommendationsWithAuth(
  user_id: string,
  product_id?: string,
  // n_recommendations: number = 10,
  authToken?: string
): Promise<{
  success: boolean;
  data?: RecommendationProduct[];
  message?: string;
}> {
  try {
    let url: string;

    if (product_id) {
      url = `${RECOMMENDATION_API_BASE_URL}/api/v1/recommendations/${user_id}/${product_id}`;
    } else {
      url = `${RECOMMENDATION_API_BASE_URL}/api/v1/recommendations/${user_id}`;
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Add authorization header if token is provided
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers,
      // signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    return {
      success: true,
      data: JSON.parse(JSON.stringify(data as RecommendationProduct[])),
    };
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    };
  }
}
