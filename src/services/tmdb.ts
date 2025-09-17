import axios from 'axios';

const TMDB_API_KEY = 'a920b40b16bf83b682220e54023bfb5c';

// Multiple API endpoints to handle regional blocking
const TMDB_ENDPOINTS = [
  'https://api.themoviedb.org/3',           // Primary endpoint
  'https://api.tmdb.org/3',                 // Alternative domain
  'https://cors-anywhere.herokuapp.com/https://api.themoviedb.org/3', // CORS proxy
  'https://api.allorigins.win/raw?url=https://api.themoviedb.org/3',   // AllOrigins proxy
];

const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

export interface TMDBMovie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  original_language: string;
  adult: boolean;
  popularity: number;
}

export interface TMDBGenre {
  id: number;
  name: string;
}

export interface TMDBMovieDetails extends TMDBMovie {
  runtime: number;
  genres: TMDBGenre[];
  production_countries: { iso_3166_1: string; name: string }[];
}

export interface TMDBTVShow {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  original_language: string;
  adult: boolean;
  popularity: number;
}

export interface TMDBSearchResult {
  page: number;
  results: TMDBMovie[];
  total_pages: number;
  total_results: number;
}

export interface TMDBTVSearchResult {
  page: number;
  results: TMDBTVShow[];
  total_pages: number;
  total_results: number;
}

// Language mapping for TMDB API
const LANGUAGE_MAP: { [key: string]: string } = {
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
  'or': 'or'  // Odia
};

// Genre mapping for TMDB API
const GENRE_MAP: { [key: string]: number } = {
  'action': 28,
  'adventure': 12,
  'animation': 16,
  'comedy': 35,
  'crime': 80,
  'documentary': 99,
  'drama': 18,
  'family': 10751,
  'fantasy': 14,
  'history': 36,
  'horror': 27,
  'music': 10402,
  'mystery': 9648,
  'romance': 10749,
  'science_fiction': 878,
  'thriller': 53,
  'war': 10752,
  'western': 37
};

class TMDBService {
  private apiKey: string;
  private endpoints: string[];
  private currentEndpointIndex: number;

  constructor() {
    this.apiKey = TMDB_API_KEY;
    this.endpoints = TMDB_ENDPOINTS;
    this.currentEndpointIndex = 0;
  }

  private getCurrentBaseURL(): string {
    return this.endpoints[this.currentEndpointIndex];
  }

  private switchToNextEndpoint(): boolean {
    this.currentEndpointIndex++;
    if (this.currentEndpointIndex >= this.endpoints.length) {
      this.currentEndpointIndex = 0;
      return false; // We've tried all endpoints
    }
    console.log(`🔄 Switching to endpoint ${this.currentEndpointIndex + 1}: ${this.getCurrentBaseURL()}`);
    return true;
  }

  // Try request with all available endpoints to handle regional blocking
  private async requestWithMultipleEndpoints<T>(endpoint: string, params: Record<string, any> = {}): Promise<T> {
    console.log(`🌐 Trying multiple endpoints for regional blocking bypass: ${endpoint}`);

    const originalIndex = this.currentEndpointIndex;
    let attempts = 0;

    do {
      const currentURL = this.getCurrentBaseURL();
      console.log(`🔗 Attempt ${attempts + 1}: ${currentURL}`);

      try {
        const response = await axios.get(`${currentURL}${endpoint}`, {
          params: {
            api_key: this.apiKey,
            ...params
          },
          timeout: 15000,
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Origin': 'https://sonyliv.com'
          }
        });

        if (response.data && (response.data.results !== undefined || response.data.genres !== undefined || response.data.id !== undefined)) {
          console.log(`✅ SUCCESS with endpoint: ${currentURL}`);
          return response.data;
        }

        throw new Error('Invalid response structure');

      } catch (error: any) {
        console.warn(`❌ Failed with ${currentURL}:`, error.message);

        // If it's a network/blocking error, try next endpoint
        if (['ENOTFOUND', 'ECONNREFUSED', 'ETIMEDOUT', 'ECONNABORTED'].includes(error.code) ||
          error.response?.status === 403 || error.response?.status === 429) {

          attempts++;
          if (this.switchToNextEndpoint()) {
            await new Promise(resolve => setTimeout(resolve, 1000)); // Brief delay
            continue;
          } else {
            // Reset to original endpoint
            this.currentEndpointIndex = originalIndex;
            break;
          }
        } else {
          // Non-network error, don't try other endpoints
          throw error;
        }
      }
    } while (attempts < this.endpoints.length);

    // Reset to original endpoint
    this.currentEndpointIndex = originalIndex;
    throw new Error(`All ${this.endpoints.length} endpoints failed for ${endpoint}. Regional blocking detected.`);
  }

  private async request<T>(endpoint: string, params: Record<string, any> = {}, retries: number = 5): Promise<T> {
    console.log(`🔄 TMDB API Request: ${endpoint}`, params);

    // Try multiple strategies to ensure API success
    const strategies = [
      // Strategy 1: Standard request with longer timeout
      {
        timeout: 30000,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      },
      // Strategy 2: Different user agent
      {
        timeout: 25000,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'SonyLIV-App/1.0'
        }
      },
      // Strategy 3: Minimal headers
      {
        timeout: 20000,
        headers: {
          'Accept': '*/*'
        }
      },
      // Strategy 4: With cache control
      {
        timeout: 35000,
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      },
      // Strategy 5: Last resort with maximum timeout
      {
        timeout: 45000,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'curl/7.68.0'
        }
      }
    ];

    // First, try the multi-endpoint approach for regional blocking
    try {
      console.log(`🌐 Attempting multi-endpoint request for regional blocking bypass...`);
      return await this.requestWithMultipleEndpoints(endpoint, params);
    } catch (multiEndpointError: any) {
      console.warn(`⚠️ Multi-endpoint approach failed:`, multiEndpointError.message);
      console.log(`🔄 Falling back to aggressive retry strategy...`);
    }

    // Fallback to aggressive retry with current endpoint
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const strategy = strategies[attempt - 1] || strategies[strategies.length - 1];

        console.log(`📡 Retry ${attempt}/${retries} - Strategy: ${strategy.timeout / 1000}s timeout`);

        const response = await axios.get(`${this.getCurrentBaseURL()}${endpoint}`, {
          params: {
            api_key: this.apiKey,
            ...params
          },
          ...strategy
        });

        console.log(`✅ TMDB API SUCCESS for ${endpoint}:`, {
          status: response.status,
          items: response.data?.results?.length || response.data?.genres?.length || 0,
          attempt: attempt,
          strategy: `${strategy.timeout / 1000}s`
        });

        // Validate response structure
        if (response.data) {
          // For endpoints that return results array
          if (response.data.results !== undefined) {
            console.log(`📊 Successfully got ${response.data.results.length} results from TMDB API`);
            return response.data;
          }
          // For endpoints that return genres array
          if (response.data.genres !== undefined) {
            console.log(`🎭 Successfully got ${response.data.genres.length} genres from TMDB API`);
            return response.data;
          }
          // For single item endpoints (like movie details)
          if (response.data.id !== undefined) {
            console.log(`🎬 Successfully got movie details for ID ${response.data.id} from TMDB API`);
            return response.data;
          }
        }

        console.warn(`⚠️ Invalid response structure for ${endpoint}:`, response.data);
        throw new Error('Invalid response structure from TMDB API');

      } catch (error: any) {
        const isLastAttempt = attempt === retries;

        console.error(`❌ TMDB API Error for ${endpoint} (attempt ${attempt}/${retries}):`, {
          message: error.message,
          status: error.response?.status,
          statusText: error.response?.statusText,
          code: error.code,
          isTimeout: error.code === 'ECONNABORTED',
          isNetworkError: ['ENOTFOUND', 'ECONNREFUSED', 'ETIMEDOUT'].includes(error.code)
        });

        // Only use fallback as absolute last resort
        if (isLastAttempt) {
          console.error(`🚨 CRITICAL: All ${retries} attempts failed for TMDB API ${endpoint}`);
          console.error(`🚨 This should not happen in production. Check network/firewall settings.`);

          // Throw the error to let the calling code handle fallback
          throw new Error(`TMDB API completely unavailable for ${endpoint}: ${error.message}`);
        }

        // Progressive delay with jitter to avoid thundering herd
        const baseDelay = Math.min(2000 * Math.pow(2, attempt - 1), 30000);
        const jitter = Math.random() * 1000;
        const delay = baseDelay + jitter;

        console.log(`⏳ Waiting ${Math.round(delay)}ms before retry ${attempt + 1}...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    // This should never be reached due to throw above
    throw new Error(`TMDB API failed after ${retries} attempts for ${endpoint}`);
  }

  // Get image URL
  getImageURL(path: string | null, size: string = 'w500'): string {
    if (!path) return 'https://via.placeholder.com/500x750/16213e/ffffff?text=No+Image';
    return `https://image.tmdb.org/t/p/${size}${path}`;
  }

  // Get popular movies
  async getPopularMovies(page: number = 1): Promise<TMDBSearchResult> {
    return this.request<TMDBSearchResult>('/movie/popular', { page });
  }

  // Get trending movies
  async getTrendingMovies(timeWindow: 'day' | 'week' = 'week'): Promise<TMDBSearchResult> {
    return this.request<TMDBSearchResult>(`/trending/movie/${timeWindow}`);
  }

  // Get movies by language
  async getMoviesByLanguage(language: string, page: number = 1): Promise<TMDBSearchResult> {
    const tmdbLanguage = LANGUAGE_MAP[language] || language;
    return this.request<TMDBSearchResult>('/discover/movie', {
      with_original_language: tmdbLanguage,
      page,
      sort_by: 'popularity.desc'
    });
  }

  // Get movies by genre
  async getMoviesByGenre(genreIds: number[], page: number = 1): Promise<TMDBSearchResult> {
    return this.request<TMDBSearchResult>('/discover/movie', {
      with_genres: genreIds.join(','),
      page,
      sort_by: 'popularity.desc'
    });
  }

  // Get movies by language and genre
  async getMoviesByPreferences(
    languages: string[],
    genres: string[],
    page: number = 1
  ): Promise<TMDBSearchResult> {
    const tmdbLanguages = languages.map(lang => LANGUAGE_MAP[lang] || lang);
    const genreIds = genres.map(genre => GENRE_MAP[genre]).filter(Boolean);

    return this.request<TMDBSearchResult>('/discover/movie', {
      with_original_language: tmdbLanguages.join('|'),
      with_genres: genreIds.length > 0 ? genreIds.join(',') : undefined,
      page,
      sort_by: 'popularity.desc'
    });
  }

  // Search movies
  async searchMovies(query: string, page: number = 1): Promise<TMDBSearchResult> {
    return this.request<TMDBSearchResult>('/search/movie', {
      query,
      page,
      include_adult: false
    });
  }

  // Get movie details
  async getMovieDetails(movieId: number): Promise<TMDBMovieDetails> {
    return this.request<TMDBMovieDetails>(`/movie/${movieId}`);
  }

  // Get genres list
  async getGenres(): Promise<{ genres: TMDBGenre[] }> {
    return this.request<{ genres: TMDBGenre[] }>('/genre/movie/list');
  }

  // Get now playing movies
  async getNowPlayingMovies(page: number = 1): Promise<TMDBSearchResult> {
    return this.request<TMDBSearchResult>('/movie/now_playing', { page });
  }

  // Get upcoming movies
  async getUpcomingMovies(page: number = 1): Promise<TMDBSearchResult> {
    return this.request<TMDBSearchResult>('/movie/upcoming', { page });
  }

  // Get top rated movies
  async getTopRatedMovies(page: number = 1): Promise<TMDBSearchResult> {
    return this.request<TMDBSearchResult>('/movie/top_rated', { page });
  }

  // Get trending movies in India (all languages)
  async getTrendingInIndia(page: number = 1): Promise<TMDBSearchResult> {
    return this.request<TMDBSearchResult>('/discover/movie', {
      region: 'IN',
      page,
      sort_by: 'popularity.desc',
      'vote_count.gte': 100
    });
  }

  // Get sports content (documentaries and sports-related movies)
  async getSportsContent(page: number = 1): Promise<TMDBSearchResult> {
    return this.request<TMDBSearchResult>('/discover/movie', {
      with_keywords: '6075|180547|190859', // Sports, Boxing, Football keywords
      with_genres: '99', // Documentary genre
      page,
      sort_by: 'popularity.desc'
    });
  }

  // Get popular TV shows
  async getPopularTVShows(page: number = 1): Promise<TMDBTVSearchResult> {
    return this.request<TMDBTVSearchResult>('/tv/popular', { page });
  }

  // Get trending TV shows
  async getTrendingTVShows(timeWindow: 'day' | 'week' = 'week'): Promise<TMDBTVSearchResult> {
    return this.request<TMDBTVSearchResult>(`/trending/tv/${timeWindow}`);
  }

  // Get TV shows by language
  async getTVShowsByLanguage(language: string, page: number = 1): Promise<TMDBTVSearchResult> {
    const tmdbLanguage = LANGUAGE_MAP[language] || language;
    return this.request<TMDBTVSearchResult>('/discover/tv', {
      with_original_language: tmdbLanguage,
      page,
      sort_by: 'popularity.desc'
    });
  }

  // Get TV shows by genre
  async getTVShowsByGenre(genreIds: number[], page: number = 1): Promise<TMDBTVSearchResult> {
    return this.request<TMDBTVSearchResult>('/discover/tv', {
      with_genres: genreIds.join(','),
      page,
      sort_by: 'popularity.desc'
    });
  }

  // Get TV shows by language and genre
  async getTVShowsByPreferences(
    languages: string[],
    genres: string[],
    page: number = 1
  ): Promise<TMDBTVSearchResult> {
    const tmdbLanguages = languages.map(lang => LANGUAGE_MAP[lang] || lang);
    const genreIds = genres.map(genre => GENRE_MAP[genre]).filter(Boolean);

    return this.request<TMDBTVSearchResult>('/discover/tv', {
      with_original_language: tmdbLanguages.join('|'),
      with_genres: genreIds.length > 0 ? genreIds.join(',') : undefined,
      page,
      sort_by: 'popularity.desc'
    });
  }

  // Get content by specific language and genre (movies only)
  async getMoviesBySpecificLanguageAndGenre(
    language: string,
    genres: string[],
    page: number = 1
  ): Promise<TMDBSearchResult> {
    const tmdbLanguage = LANGUAGE_MAP[language] || language;
    const genreIds = genres.map(genre => GENRE_MAP[genre]).filter(Boolean);

    return this.request<TMDBSearchResult>('/discover/movie', {
      with_original_language: tmdbLanguage,
      with_genres: genreIds.length > 0 ? genreIds.join(',') : undefined,
      page,
      sort_by: 'popularity.desc'
    });
  }

  // Get content by specific language and genre (TV shows only)
  async getTVShowsBySpecificLanguageAndGenre(
    language: string,
    genres: string[],
    page: number = 1
  ): Promise<TMDBTVSearchResult> {
    const tmdbLanguage = LANGUAGE_MAP[language] || language;
    const genreIds = genres.map(genre => GENRE_MAP[genre]).filter(Boolean);

    return this.request<TMDBTVSearchResult>('/discover/tv', {
      with_original_language: tmdbLanguage,
      with_genres: genreIds.length > 0 ? genreIds.join(',') : undefined,
      page,
      sort_by: 'popularity.desc'
    });
  }

  // Convert TMDB movie to our format
  convertToContentItem(movie: TMDBMovie): any {
    const isPremium = Math.random() > 0.6; // 40% chance for premium content
    return {
      id: movie.id.toString(),
      title: movie.title,
      imageUrl: this.getImageURL(movie.poster_path),
      duration: '2h 30m', // Default duration since TMDB basic movie data doesn't include runtime
      rating: movie.vote_average,
      year: new Date(movie.release_date).getFullYear(),
      language: movie.original_language,
      type: 'movie',
      isPremium: isPremium,
      xpRequired: isPremium ? Math.floor(Math.random() * 1500) + 500 : 0, // 500-2000 XP for premium content
      description: movie.overview,
      genres: movie.genre_ids || []
    };
  }

  // Convert TMDB TV show to our format
  convertTVShowToContentItem(tvShow: TMDBTVShow): any {
    const isPremium = Math.random() > 0.5; // 50% chance for premium TV shows
    return {
      id: `tv_${tvShow.id}`,
      title: tvShow.name,
      imageUrl: this.getImageURL(tvShow.poster_path),
      duration: '45min', // Default episode duration
      rating: tvShow.vote_average,
      year: new Date(tvShow.first_air_date).getFullYear(),
      language: tvShow.original_language,
      type: 'series',
      isPremium: isPremium,
      xpRequired: isPremium ? Math.floor(Math.random() * 1200) + 800 : 0, // 800-2000 XP for premium TV shows
      description: tvShow.overview,
      genres: tvShow.genre_ids || []
    };
  }

  // Fallback data methods for when API fails
  private getFallbackMovies(): TMDBMovie[] {
    return [
      {
        id: 1,
        title: 'RRR',
        overview: 'A fictional story about two legendary revolutionaries and their journey away from home before they started fighting for their country in 1920s.',
        poster_path: '/rCzpDGLbOoPwLjy3OAm5QVUJFSM.jpg',
        backdrop_path: '/8I37NtDffNV7AZlDa7uDvvqhovU.jpg',
        release_date: '2022-03-24',
        vote_average: 7.9,
        vote_count: 1200,
        genre_ids: [28, 18, 12],
        original_language: 'te',
        adult: false,
        popularity: 85.5
      },
      {
        id: 2,
        title: 'Pushpa: The Rise',
        overview: 'A laborer rises through the ranks of a sandalwood smuggling syndicate, making some powerful enemies in the process.',
        poster_path: '/dBLBDeyrGMzMtlhayZ3VrxZVcyg.jpg',
        backdrop_path: '/c6H7Z4u73ir3cIoCteuhJh7UCAR.jpg',
        release_date: '2021-12-17',
        vote_average: 7.3,
        vote_count: 890,
        genre_ids: [28, 80, 18],
        original_language: 'te',
        adult: false,
        popularity: 78.2
      },
      {
        id: 3,
        title: 'KGF Chapter 2',
        overview: 'Rocky, whose name strikes fear in the heart of his foes. His allies look up to Rocky as their Savior.',
        poster_path: '/lP5eKh8WOcPysfELrUpGhHJGZEH.jpg',
        backdrop_path: '/f7UILNKSHbcqXrZ5Ps1g5z3QB5j.jpg',
        release_date: '2022-04-14',
        vote_average: 8.1,
        vote_count: 1500,
        genre_ids: [28, 80, 18],
        original_language: 'kn',
        adult: false,
        popularity: 92.1
      },
      {
        id: 4,
        title: 'Pathaan',
        overview: 'An Indian spy takes on the leader of a group of mercenaries who have nefarious plans to target India.',
        poster_path: '/kqjL17yufvn9OVLyXYpvtyrFfak.jpg',
        backdrop_path: '/s16H6tpK2utvwDtzZ8Qy4qm5Emw.jpg',
        release_date: '2023-01-25',
        vote_average: 6.8,
        vote_count: 750,
        genre_ids: [28, 53, 12],
        original_language: 'hi',
        adult: false,
        popularity: 88.7
      },
      {
        id: 5,
        title: 'Vikram',
        overview: 'Members of a black ops team must track and eliminate a gang of masked murderers.',
        poster_path: '/YCLV8b2zIiOJYAd6Zl3DYfD6lS.jpg',
        backdrop_path: '/4m1Au3YkjqsxF8iwQy0fPYSxE0h.jpg',
        release_date: '2022-06-03',
        vote_average: 7.6,
        vote_count: 980,
        genre_ids: [28, 53, 80],
        original_language: 'ta',
        adult: false,
        popularity: 76.3
      },
      {
        id: 6,
        title: 'Jawan',
        overview: 'A high-octane action thriller which outlines the emotional journey of a man who is set to rectify the wrongs in the society.',
        poster_path: '/5ScPNT6fHtfYJeWBajZciPV3hEL.jpg',
        backdrop_path: '/yF1eOkaYvwiORauRCPWznV9xVvi.jpg',
        release_date: '2023-09-07',
        vote_average: 7.2,
        vote_count: 650,
        genre_ids: [28, 53, 18],
        original_language: 'hi',
        adult: false,
        popularity: 82.4
      }
    ];
  }

  private getFallbackTVShows(): TMDBTVShow[] {
    return [
      {
        id: 101,
        name: 'Scam 1992',
        overview: 'Set in 1980s and 90s Bombay, it follows the life of Harshad Mehta, a stockbroker who took the stock market to dizzying heights.',
        poster_path: '/7VKwqzR0622LdYm0v2pzgP8dWAV.jpg',
        backdrop_path: '/9yBVqNruk6Ykrwc32qrK2TIE5xw.jpg',
        first_air_date: '2020-10-09',
        vote_average: 9.2,
        vote_count: 450,
        genre_ids: [18, 80],
        original_language: 'hi',
        adult: false,
        popularity: 65.8
      },
      {
        id: 102,
        name: 'The Family Man',
        overview: 'A working man from the National Investigation Agency tries to protect the nation while also keeping his family happy.',
        poster_path: '/dqB6DodeNVaXB1PBGl8XYuKGRhc.jpg',
        backdrop_path: '/mYLOqiStMxDK3fYZFirgrMt8z5d.jpg',
        first_air_date: '2019-09-20',
        vote_average: 8.7,
        vote_count: 380,
        genre_ids: [18, 28, 53],
        original_language: 'hi',
        adult: false,
        popularity: 72.1
      },
      {
        id: 103,
        name: 'Mumbai Diaries 26/11',
        overview: 'Medical drama series inspired by the terror attacks of November 26, 2008, in Mumbai.',
        poster_path: '/8XZWnTtKx8VV1fCFg8dY1vFJ9Hs.jpg',
        backdrop_path: '/hIZFG9T8a885HHoPhzHLCVh6mOH.jpg',
        first_air_date: '2021-09-09',
        vote_average: 8.1,
        vote_count: 290,
        genre_ids: [18, 10765],
        original_language: 'hi',
        adult: false,
        popularity: 58.9
      }
    ];
  }

  private getFallbackGenres(): TMDBGenre[] {
    return [
      { id: 28, name: 'Action' },
      { id: 12, name: 'Adventure' },
      { id: 16, name: 'Animation' },
      { id: 35, name: 'Comedy' },
      { id: 80, name: 'Crime' },
      { id: 99, name: 'Documentary' },
      { id: 18, name: 'Drama' },
      { id: 10751, name: 'Family' },
      { id: 14, name: 'Fantasy' },
      { id: 36, name: 'History' },
      { id: 27, name: 'Horror' },
      { id: 10402, name: 'Music' },
      { id: 9648, name: 'Mystery' },
      { id: 10749, name: 'Romance' },
      { id: 878, name: 'Science Fiction' },
      { id: 10770, name: 'TV Movie' },
      { id: 53, name: 'Thriller' },
      { id: 10752, name: 'War' },
      { id: 37, name: 'Western' }
    ];
  }

  private getFallbackMovieDetails(): TMDBMovieDetails {
    return {
      id: 1,
      title: 'RRR',
      overview: 'A fictional story about two legendary revolutionaries and their journey away from home before they started fighting for their country in 1920s.',
      poster_path: '/rCzpDGLbOoPwLjy3OAm5QVUJFSM.jpg',
      backdrop_path: '/8I37NtDffNV7AZlDa7uDvvqhovU.jpg',
      release_date: '2022-03-24',
      vote_average: 7.9,
      vote_count: 1200,
      genre_ids: [28, 18, 12],
      original_language: 'te',
      adult: false,
      popularity: 85.5,
      runtime: 187,
      genres: [
        { id: 28, name: 'Action' },
        { id: 18, name: 'Drama' },
        { id: 12, name: 'Adventure' }
      ],
      production_countries: [
        { iso_3166_1: 'IN', name: 'India' }
      ]
    };
  }

  // Aggressive API connectivity test - prioritize getting API to work
  async testConnection(): Promise<boolean> {
    console.log('🔍 Testing TMDB API connectivity with multiple strategies...');

    const testConfigs = [
      { timeout: 15000, name: 'Quick Test', userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      { timeout: 25000, name: 'Standard Test', userAgent: 'SonyLIV-App/1.0' },
      { timeout: 35000, name: 'Extended Test', userAgent: 'curl/7.68.0' }
    ];

    for (const config of testConfigs) {
      try {
        console.log(`🧪 ${config.name} (${config.timeout / 1000}s timeout)...`);

        const response = await axios.get(`${this.getCurrentBaseURL()}/movie/popular`, {
          params: { api_key: this.apiKey, page: 1 },
          timeout: config.timeout,
          headers: {
            'Accept': 'application/json',
            'User-Agent': config.userAgent
          }
        });

        if (response.status === 200 && response.data?.results?.length > 0) {
          console.log(`✅ TMDB API is WORKING! Got ${response.data.results.length} movies`);
          console.log(`🎬 First movie: "${response.data.results[0].title}"`);
          return true;
        }
      } catch (error: any) {
        console.warn(`⚠️ ${config.name} failed:`, error.message);

        // Wait before next attempt
        if (config !== testConfigs[testConfigs.length - 1]) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
    }

    console.error('❌ All TMDB API connectivity tests failed - will attempt with fallback handling');
    return false;
  }

  // Get content with automatic fallback
  async getContentWithFallback<T>(
    apiCall: () => Promise<T>,
    fallbackData: T,
    description: string
  ): Promise<T> {
    try {
      console.log(`Attempting to fetch ${description}...`);
      const result = await apiCall();
      console.log(`✅ Successfully fetched ${description}`);
      return result;
    } catch (error: any) {
      console.warn(`⚠️ Failed to fetch ${description}, using fallback data:`, error.message);
      return fallbackData;
    }
  }
}

export default new TMDBService();