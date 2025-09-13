// API Configuration
// Replace with your actual TMDB API key
export const TMDB_API_KEY = '8b5f8b5f8b5f8b5f8b5f8b5f8b5f8b5f';

// You can get a free API key from: https://www.themoviedb.org/settings/api
// Instructions:
// 1. Create an account at https://www.themoviedb.org/
// 2. Go to Settings > API
// 3. Request an API key (v3 auth)
// 4. Replace the key above with your actual key

export const API_CONFIG = {
  TMDB_BASE_URL: 'https://api.themoviedb.org/3',
  TMDB_IMAGE_BASE_URL: 'https://image.tmdb.org/t/p',
  DEFAULT_LANGUAGE: 'en-US',
  DEFAULT_REGION: 'IN', // India
  DEFAULT_PAGE_SIZE: 20,
  MAX_RETRIES: 3,
  REQUEST_TIMEOUT: 10000, // 10 seconds
};

// Language mapping for TMDB API
export const TMDB_LANGUAGE_MAPPING: Record<string, string> = {
  'te': 'te', // Telugu
  'hi': 'hi', // Hindi
  'ta': 'ta', // Tamil
  'ml': 'ml', // Malayalam
  'kn': 'kn', // Kannada
  'bn': 'bn', // Bengali
  'gu': 'gu', // Gujarati
  'mr': 'mr', // Marathi
  'en': 'en', // English
  'pa': 'pa', // Punjabi
  'as': 'as', // Assamese
  'or': 'or', // Odia
};

// Genre mapping for TMDB API
export const TMDB_GENRE_MAPPING: Record<string, number> = {
  'action': 28,
  'drama': 18,
  'comedy': 35,
  'romance': 10749,
  'thriller': 53,
  'horror': 27,
  'documentary': 99,
  'music': 10402,
  'sports': 10770,
  'reality': 10764,
};
