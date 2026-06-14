/**
 * Central API configuration.
 *
 * In development: points to the local FastAPI server.
 * In production: update API_BASE_URL to your deployed backend URL.
 *
 * Usage:
 *   import { API_BASE_URL, apiUrl } from '../config/api';
 *   fetch(apiUrl('/contact'), { ... })
 */

export const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

/**
 * Build a full API URL from a path.
 *
 * @param {string} path - e.g., '/sessions', '/bookings/azure-bronze-gold'
 * @returns {string} Full URL like 'http://localhost:8000/api/v1/sessions'
 */
export const apiUrl = (path) => `${API_BASE_URL}/api/v1${path}`;