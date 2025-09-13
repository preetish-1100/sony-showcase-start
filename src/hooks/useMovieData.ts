import { useState, useEffect, useCallback } from 'react';
import { movieService, convertToContentItem, Movie, TVShow } from '@/services/movieService';

interface UserPreferences {
  languages: string[];
  genres: string[];
  contentTypes: string[];
  allowLocation: boolean;
}

interface ContentItem {
  id: string;
  title: string;
  imageUrl: string;
  backdropUrl?: string;
  duration?: string;
  rating?: number;
  language?: string;
  year?: number;
  genre?: number[];
  isPremium?: boolean;
  overview?: string;
  popularity?: number;
  voteCount?: number;
  isLive?: boolean;
  progress?: number;
  matchPercentage?: number;
  viewCount?: string;
}

interface UseMovieDataReturn {
  // Content data
  popularMovies: ContentItem[];
  popularTVShows: ContentItem[];
  trendingContent: ContentItem[];
  genreContent: Record<string, ContentItem[]>;
  
  // Loading states
  isLoading: boolean;
  isError: boolean;
  error: string | null;
  
  // Actions
  searchContent: (query: string) => Promise<ContentItem[]>;
  getContentByGenre: (genre: string) => Promise<ContentItem[]>;
  refreshData: () => Promise<void>;
}

export const useMovieData = (userPreferences: UserPreferences): UseMovieDataReturn => {
  const [popularMovies, setPopularMovies] = useState<ContentItem[]>([]);
  const [popularTVShows, setPopularTVShows] = useState<ContentItem[]>([]);
  const [trendingContent, setTrendingContent] = useState<ContentItem[]>([]);
  const [genreContent, setGenreContent] = useState<Record<string, ContentItem[]>>({});
  
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch content based on user preferences
  const fetchContent = useCallback(async () => {
    if (!userPreferences.languages.length) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setIsError(false);
      setError(null);

      // Get primary language
      const primaryLanguage = userPreferences.languages[0];
      
      // Fetch popular content
      const [movies, tvShows, trending] = await Promise.all([
        movieService.getPopularMovies(primaryLanguage, 1),
        movieService.getPopularTVShows(primaryLanguage, 1),
        movieService.getTrendingContent('week', primaryLanguage)
      ]);

      // Convert to our format
      const convertedMovies = movies.slice(0, 20).map(movie => convertToContentItem(movie, 'movie'));
      const convertedTVShows = tvShows.slice(0, 20).map(show => convertToContentItem(show, 'tv'));
      const convertedTrending = trending.slice(0, 10).map(item => 
        convertToContentItem(item, 'original_title' in item ? 'movie' : 'tv')
      );

      setPopularMovies(convertedMovies);
      setPopularTVShows(convertedTVShows);
      setTrendingContent(convertedTrending);

      // Fetch content by user's preferred genres
      if (userPreferences.genres.length > 0) {
        const genrePromises = userPreferences.genres.map(async (genre) => {
          const content = await movieService.getContentByGenre(genre, primaryLanguage, 'both');
          const allContent = [
            ...content.movies.map(movie => convertToContentItem(movie, 'movie')),
            ...content.tvShows.map(show => convertToContentItem(show, 'tv'))
          ];
          return { genre, content: allContent.slice(0, 10) };
        });

        const genreResults = await Promise.all(genrePromises);
        const genreMap: Record<string, ContentItem[]> = {};
        genreResults.forEach(({ genre, content }) => {
          genreMap[genre] = content;
        });
        setGenreContent(genreMap);
      }

    } catch (err) {
      console.error('Error fetching movie data:', err);
      setIsError(true);
      setError(err instanceof Error ? err.message : 'Failed to fetch movie data');
    } finally {
      setIsLoading(false);
    }
  }, [userPreferences]);

  // Search content
  const searchContent = useCallback(async (query: string): Promise<ContentItem[]> => {
    if (!query.trim()) return [];

    try {
      const primaryLanguage = userPreferences.languages[0] || 'en';
      const results = await movieService.searchContent(query, primaryLanguage);
      
      const allResults = [
        ...results.movies.map(movie => convertToContentItem(movie, 'movie')),
        ...results.tvShows.map(show => convertToContentItem(show, 'tv'))
      ];

      return allResults;
    } catch (err) {
      console.error('Error searching content:', err);
      return [];
    }
  }, [userPreferences.languages]);

  // Get content by specific genre
  const getContentByGenre = useCallback(async (genre: string): Promise<ContentItem[]> => {
    try {
      const primaryLanguage = userPreferences.languages[0] || 'en';
      const content = await movieService.getContentByGenre(genre, primaryLanguage, 'both');
      
      const allContent = [
        ...content.movies.map(movie => convertToContentItem(movie, 'movie')),
        ...content.tvShows.map(show => convertToContentItem(show, 'tv'))
      ];

      return allContent;
    } catch (err) {
      console.error('Error fetching content by genre:', err);
      return [];
    }
  }, [userPreferences.languages]);

  // Refresh data
  const refreshData = useCallback(async () => {
    await fetchContent();
  }, [fetchContent]);

  // Fetch data on mount and when preferences change
  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  return {
    popularMovies,
    popularTVShows,
    trendingContent,
    genreContent,
    isLoading,
    isError,
    error,
    searchContent,
    getContentByGenre,
    refreshData
  };
};

// Hook for getting content by specific criteria
export const useContentByCriteria = (
  userPreferences: UserPreferences,
  criteria: {
    type?: 'movies' | 'tv' | 'both';
    genre?: string;
    language?: string;
    limit?: number;
  }
) => {
  const [content, setContent] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  const fetchContent = useCallback(async () => {
    if (!criteria.genre && !criteria.type) return;

    setIsLoading(true);
    setIsError(false);

    try {
      const language = criteria.language || userPreferences.languages[0] || 'en';
      let results: ContentItem[] = [];

      if (criteria.genre) {
        const genreContent = await movieService.getContentByGenre(
          criteria.genre,
          language,
          criteria.type || 'both'
        );
        
        results = [
          ...genreContent.movies.map(movie => convertToContentItem(movie, 'movie')),
          ...genreContent.tvShows.map(show => convertToContentItem(show, 'tv'))
        ];
      } else if (criteria.type) {
        if (criteria.type === 'movies' || criteria.type === 'both') {
          const movies = await movieService.getPopularMovies(language);
          results.push(...movies.map(movie => convertToContentItem(movie, 'movie')));
        }
        
        if (criteria.type === 'tv' || criteria.type === 'both') {
          const tvShows = await movieService.getPopularTVShows(language);
          results.push(...tvShows.map(show => convertToContentItem(show, 'tv')));
        }
      }

      if (criteria.limit) {
        results = results.slice(0, criteria.limit);
      }

      setContent(results);
    } catch (err) {
      console.error('Error fetching content by criteria:', err);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  }, [userPreferences.languages, criteria]);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  return {
    content,
    isLoading,
    isError,
    refetch: fetchContent
  };
};
