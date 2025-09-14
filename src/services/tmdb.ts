import axios from 'axios';

const TMDB_API_KEY = 'a920b40b16bf83b682220e54023bfb5c';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
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
  private baseURL: string;

  constructor() {
    this.apiKey = TMDB_API_KEY;
    this.baseURL = TMDB_BASE_URL;
  }

  private async request<T>(endpoint: string, params: Record<string, any> = {}): Promise<T> {
    try {
      const response = await axios.get(`${this.baseURL}${endpoint}`, {
        params: {
          api_key: this.apiKey,
          ...params
        },
        timeout: 5000 // 5 second timeout
      });
      return response.data;
    } catch (error) {
      console.error(`TMDB API Error for ${endpoint}:`, error);
      // Return empty results instead of throwing to prevent app crash
      return { results: [], page: 1, total_pages: 0, total_results: 0 } as T;
    }
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
    return {
      id: movie.id.toString(),
      title: movie.title,
      imageUrl: this.getImageURL(movie.poster_path),
      duration: '2h 30m', // Default duration since TMDB basic movie data doesn't include runtime
      rating: movie.vote_average,
      year: new Date(movie.release_date).getFullYear(),
      language: movie.original_language,
      type: 'movie',
      isPremium: Math.random() > 0.7, // Randomly assign premium status
      description: movie.overview,
      genres: movie.genre_ids || []
    };
  }

  // Convert TMDB TV show to our format
  convertTVShowToContentItem(tvShow: TMDBTVShow): any {
    return {
      id: `tv_${tvShow.id}`,
      title: tvShow.name,
      imageUrl: this.getImageURL(tvShow.poster_path),
      duration: '45min', // Default episode duration
      rating: tvShow.vote_average,
      year: new Date(tvShow.first_air_date).getFullYear(),
      language: tvShow.original_language,
      type: 'series',
      isPremium: Math.random() > 0.7, // Randomly assign premium status
      description: tvShow.overview,
      genres: tvShow.genre_ids || []
    };
  }
}

export default new TMDBService();