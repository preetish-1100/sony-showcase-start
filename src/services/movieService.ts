// Movie Database Service using The Movie Database (TMDB) API
// This service fetches real movie data and posters based on user preferences

import { TMDB_API_KEY, API_CONFIG, TMDB_LANGUAGE_MAPPING, TMDB_GENRE_MAPPING } from '@/config/api';

export interface Movie {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  adult: boolean;
  original_language: string;
  popularity: number;
  video: boolean;
}

export interface MovieDetails extends Movie {
  genres: Array<{ id: number; name: string }>;
  runtime: number;
  status: string;
  tagline: string;
  spoken_languages: Array<{ iso_639_1: string; name: string }>;
  production_countries: Array<{ iso_3166_1: string; name: string }>;
}

export interface TVShow {
  id: number;
  name: string;
  original_name: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  first_air_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  adult: boolean;
  original_language: string;
  popularity: number;
  origin_country: string[];
}

export interface TVShowDetails extends TVShow {
  genres: Array<{ id: number; name: string }>;
  episode_run_time: number[];
  status: string;
  tagline: string;
  spoken_languages: Array<{ iso_639_1: string; name: string }>;
  production_countries: Array<{ iso_3166_1: string; name: string }>;
  number_of_seasons: number;
  number_of_episodes: number;
}

export interface SearchResult {
  movies: Movie[];
  tvShows: TVShow[];
  total_results: number;
  total_pages: number;
}

// Use imported configuration
const LANGUAGE_MAPPING = TMDB_LANGUAGE_MAPPING;
const GENRE_MAPPING = TMDB_GENRE_MAPPING;

class MovieService {
  private apiKey: string;
  private baseUrl: string;
  private imageBaseUrl: string;

  constructor() {
    this.apiKey = TMDB_API_KEY;
    this.baseUrl = API_CONFIG.TMDB_BASE_URL;
    this.imageBaseUrl = API_CONFIG.TMDB_IMAGE_BASE_URL;
  }

  // Get full image URL for posters and backdrops
  getImageUrl(path: string, size: 'w200' | 'w300' | 'w500' | 'w780' | 'original' = 'w500'): string {
    if (!path) return '/placeholder.svg';
    return `${this.imageBaseUrl}/${size}${path}`;
  }

  // Get poster URL
  getPosterUrl(path: string, size: 'w200' | 'w300' | 'w500' = 'w500'): string {
    return this.getImageUrl(path, size);
  }

  // Get backdrop URL
  getBackdropUrl(path: string, size: 'w300' | 'w780' | 'w1280' | 'original' = 'w1280'): string {
    return this.getImageUrl(path, size);
  }

  // Fetch popular movies by language
  async getPopularMovies(language: string, page: number = 1): Promise<Movie[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/movie/popular?api_key=${this.apiKey}&language=${language}&page=${page}&region=IN`
      );
      const data = await response.json();
      return data.results || [];
    } catch (error) {
      console.error('Error fetching popular movies:', error);
      return [];
    }
  }

  // Fetch popular TV shows by language
  async getPopularTVShows(language: string, page: number = 1): Promise<TVShow[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/tv/popular?api_key=${this.apiKey}&language=${language}&page=${page}&region=IN`
      );
      const data = await response.json();
      return data.results || [];
    } catch (error) {
      console.error('Error fetching popular TV shows:', error);
      return [];
    }
  }

  // Fetch trending content
  async getTrendingContent(timeWindow: 'day' | 'week' = 'week', language: string = 'en'): Promise<Movie[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/trending/all/${timeWindow}?api_key=${this.apiKey}&language=${language}&region=IN`
      );
      const data = await response.json();
      return data.results || [];
    } catch (error) {
      console.error('Error fetching trending content:', error);
      return [];
    }
  }

  // Search movies and TV shows
  async searchContent(query: string, language: string = 'en', page: number = 1): Promise<SearchResult> {
    try {
      const [moviesResponse, tvResponse] = await Promise.all([
        fetch(`${this.baseUrl}/search/movie?api_key=${this.apiKey}&query=${encodeURIComponent(query)}&language=${language}&page=${page}&region=IN`),
        fetch(`${this.baseUrl}/search/tv?api_key=${this.apiKey}&query=${encodeURIComponent(query)}&language=${language}&page=${page}&region=IN`)
      ]);

      const moviesData = await moviesResponse.json();
      const tvData = await tvResponse.json();

      return {
        movies: moviesData.results || [],
        tvShows: tvData.results || [],
        total_results: (moviesData.total_results || 0) + (tvData.total_results || 0),
        total_pages: Math.max(moviesData.total_pages || 0, tvData.total_pages || 0)
      };
    } catch (error) {
      console.error('Error searching content:', error);
      return { movies: [], tvShows: [], total_results: 0, total_pages: 0 };
    }
  }

  // Get movies by genre
  async getMoviesByGenre(genreId: number, language: string, page: number = 1): Promise<Movie[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/discover/movie?api_key=${this.apiKey}&with_genres=${genreId}&language=${language}&page=${page}&region=IN&sort_by=popularity.desc`
      );
      const data = await response.json();
      return data.results || [];
    } catch (error) {
      console.error('Error fetching movies by genre:', error);
      return [];
    }
  }

  // Get TV shows by genre
  async getTVShowsByGenre(genreId: number, language: string, page: number = 1): Promise<TVShow[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/discover/tv?api_key=${this.apiKey}&with_genres=${genreId}&language=${language}&page=${page}&region=IN&sort_by=popularity.desc`
      );
      const data = await response.json();
      return data.results || [];
    } catch (error) {
      console.error('Error fetching TV shows by genre:', error);
      return [];
    }
  }

  // Get movie details
  async getMovieDetails(movieId: number, language: string = 'en'): Promise<MovieDetails | null> {
    try {
      const response = await fetch(
        `${this.baseUrl}/movie/${movieId}?api_key=${this.apiKey}&language=${language}`
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching movie details:', error);
      return null;
    }
  }

  // Get TV show details
  async getTVShowDetails(tvId: number, language: string = 'en'): Promise<TVShowDetails | null> {
    try {
      const response = await fetch(
        `${this.baseUrl}/tv/${tvId}?api_key=${this.apiKey}&language=${language}`
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching TV show details:', error);
      return null;
    }
  }

  // Get content based on user preferences
  async getContentForUser(userPreferences: {
    languages: string[];
    genres: string[];
    contentTypes: string[];
  }): Promise<{
    movies: Movie[];
    tvShows: TVShow[];
    trending: Movie[];
  }> {
    const { languages, genres, contentTypes } = userPreferences;
    
    // Default to English if no languages selected
    const primaryLanguage = languages.length > 0 ? LANGUAGE_MAPPING[languages[0]] || 'en' : 'en';
    
    try {
      const promises: Promise<any>[] = [];
      
      // Get popular content for primary language
      if (contentTypes.includes('movies') || contentTypes.length === 0) {
        promises.push(this.getPopularMovies(primaryLanguage));
      }
      
      if (contentTypes.includes('series') || contentTypes.length === 0) {
        promises.push(this.getPopularTVShows(primaryLanguage));
      }
      
      // Get trending content
      promises.push(this.getTrendingContent('week', primaryLanguage));
      
      const results = await Promise.all(promises);
      
      return {
        movies: results[0] || [],
        tvShows: results[1] || [],
        trending: results[2] || []
      };
    } catch (error) {
      console.error('Error fetching content for user:', error);
      return { movies: [], tvShows: [], trending: [] };
    }
  }

  // Get content by specific genre
  async getContentByGenre(genre: string, language: string, contentType: 'movies' | 'tv' | 'both' = 'both'): Promise<{
    movies: Movie[];
    tvShows: TVShow[];
  }> {
    const genreId = GENRE_MAPPING[genre];
    if (!genreId) return { movies: [], tvShows: [] };

    try {
      const promises: Promise<any>[] = [];
      
      if (contentType === 'movies' || contentType === 'both') {
        promises.push(this.getMoviesByGenre(genreId, language));
      }
      
      if (contentType === 'tv' || contentType === 'both') {
        promises.push(this.getTVShowsByGenre(genreId, language));
      }
      
      const results = await Promise.all(promises);
      
      return {
        movies: results[0] || [],
        tvShows: results[1] || []
      };
    } catch (error) {
      console.error('Error fetching content by genre:', error);
      return { movies: [], tvShows: [] };
    }
  }
}

// Create and export a singleton instance
export const movieService = new MovieService();

// Helper function to convert TMDB data to our app format
export const convertToContentItem = (item: Movie | TVShow, type: 'movie' | 'tv' = 'movie') => {
  const isMovie = type === 'movie';
  const movie = movieService;
  
  return {
    id: item.id.toString(),
    title: isMovie ? (item as Movie).title : (item as TVShow).name,
    imageUrl: movie.getPosterUrl(item.poster_path),
    backdropUrl: movie.getBackdropUrl(item.backdrop_path),
    duration: isMovie ? `${(item as Movie).runtime || 120} min` : 'TV Series',
    rating: Math.round((item.vote_average / 2) * 10) / 10, // Convert 10-point scale to 5-point
    language: item.original_language,
    year: isMovie 
      ? new Date((item as Movie).release_date).getFullYear()
      : new Date((item as TVShow).first_air_date).getFullYear(),
    genre: item.genre_ids,
    isPremium: item.vote_average > 7, // Consider high-rated content as premium
    overview: item.overview,
    popularity: item.popularity,
    voteCount: item.vote_count
  };
};
