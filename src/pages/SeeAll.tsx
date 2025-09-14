import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import ContentCard from '@/components/home/ContentCard';
import tmdbService from '@/services/tmdb';

interface SeeAllProps {}

const SeeAll: React.FC<SeeAllProps> = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { section, userPreferences } = location.state || { section: 'Trending Now', userPreferences: { languages: [], genres: [], contentTypes: [] } };
  
  const [movies, setMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('popularity');
  const [page, setPage] = useState(1);

  // Language display names
  const getLanguageDisplayName = (languageCode: string) => {
    const languageNames: { [key: string]: string } = {
      'te': 'Telugu',
      'hi': 'Hindi', 
      'ta': 'Tamil',
      'kn': 'Kannada',
      'ml': 'Malayalam',
      'en': 'English',
      'bn': 'Bengali',
      'gu': 'Gujarati',
      'mr': 'Marathi',
      'pa': 'Punjabi'
    };
    return languageNames[languageCode] || languageCode;
  };

  useEffect(() => {
    fetchMovies();
  }, [section, page]);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      let response;
      let tvResponse;
      let formattedMovies = [];
      
      console.log('Fetching movies for section:', section);
      
      switch (section) {
        case 'Trending Now':
          response = await tmdbService.getTrendingMovies();
          formattedMovies = response.results.map(movie => tmdbService.convertToContentItem(movie));
          break;
          
        case 'Popular Near You':
          // Fetch trending movies for location-based content
          response = await tmdbService.getTrendingInIndia(page);
          formattedMovies = response.results.map(movie => ({
            ...tmdbService.convertToContentItem(movie),
            viewCount: `${Math.floor(1 + Math.random() * 5)}k`
          }));
          break;
          
        case 'Premium Content':
          response = await tmdbService.getPopularMovies(page);
          formattedMovies = response.results.map(movie => ({
            ...tmdbService.convertToContentItem(movie),
            isPremium: true
          }));
          break;
          
        case 'Sports Highlights':
        case 'Sports Content':
          response = await tmdbService.getSportsContent(page);
          formattedMovies = response.results.map(movie => ({
            ...tmdbService.convertToContentItem(movie),
            isLive: Math.random() > 0.7,
            type: 'sports'
          }));
          break;
          
        default:
          // Handle language-specific sections
          if (section.includes('Movies') || section.includes('TV Shows')) {
            const language = userPreferences?.languages?.find(lang => 
              section.includes(getLanguageDisplayName(lang))
            );
            
            if (language) {
              if (section.includes('TV Shows')) {
                tvResponse = await tmdbService.getTVShowsBySpecificLanguageAndGenre(
                  language,
                  userPreferences.genres || [],
                  page
                );
                formattedMovies = tvResponse.results.map(show => tmdbService.convertTVShowToContentItem(show));
              } else {
                response = await tmdbService.getMoviesBySpecificLanguageAndGenre(
                  language,
                  userPreferences.genres || [],
                  page
                );
                formattedMovies = response.results.map(movie => tmdbService.convertToContentItem(movie));
              }
            } else {
              // Fallback to trending movies
              response = await tmdbService.getTrendingMovies();
              formattedMovies = response.results.map(movie => tmdbService.convertToContentItem(movie));
            }
          } else {
            // Generic fallback
            response = await tmdbService.getPopularMovies(page);
            formattedMovies = response.results.map(movie => tmdbService.convertToContentItem(movie));
          }
      }
      
      if (page === 1) {
        setMovies(formattedMovies);
      } else {
        setMovies(prev => [...prev, ...formattedMovies]);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching movies:', error);
      // Set fallback content
      const fallbackMovies = [
        {
          id: '1',
          title: 'RRR',
          imageUrl: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=300&h=400&fit=crop',
          duration: '3h 7m',
          rating: 4.5,
          language: 'Telugu',
          isPremium: false,
          type: 'movie'
        },
        {
          id: '2',
          title: 'Pushpa: The Rise',
          imageUrl: 'https://images.unsplash.com/photo-1509281373149-e957c6296406?w=300&h=400&fit=crop',
          duration: '2h 59m',
          rating: 4.2,
          language: 'Telugu',
          isPremium: false,
          type: 'movie'
        },
        {
          id: '3',
          title: 'KGF Chapter 2',
          imageUrl: 'https://images.unsplash.com/photo-1478720568477-b956dc04de23?w=300&h=400&fit=crop',
          duration: '2h 48m',
          rating: 4.3,
          language: 'Kannada',
          isPremium: true,
          type: 'movie'
        }
      ];
      setMovies(fallbackMovies);
      setLoading(false);
    }
  };

  const handlePlay = (item: any) => {
    navigate(`/movie/${item.id}`);
  };

  const handleAddToWatchlist = (item: any) => {
    console.log('Added to watchlist:', item.title);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    try {
      setLoading(true);
      const response = await tmdbService.searchMovies(searchQuery);
      const formattedMovies = response.results.map(movie => tmdbService.convertToContentItem(movie));
      setMovies(formattedMovies);
      setLoading(false);
    } catch (error) {
      console.error('Error searching movies:', error);
      setLoading(false);
    }
  };

  const getCategoryTitle = () => {
    return section || 'Movies';
  };

  const filteredAndSortedMovies = movies
    .filter(movie => 
      movie.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'year':
          return b.year - a.year;
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0; // Keep original order (popularity)
      }
    });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-background shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center space-x-3 mb-3">
            <Button size="icon" variant="ghost" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold">{getCategoryTitle()}</h1>
          </div>
          
          {/* Search and Filter */}
          <div className="flex space-x-3">
            <div className="flex-1 relative">
              <Input
                placeholder="Search movies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="pr-10"
              />
              <Button
                size="icon"
                variant="ghost"
                className="absolute right-0 top-0 h-full"
                onClick={handleSearch}
              >
                <Search className="w-4 h-4" />
              </Button>
            </div>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popularity">Popularity</SelectItem>
                <SelectItem value="rating">Rating</SelectItem>
                <SelectItem value="year">Year</SelectItem>
                <SelectItem value="title">Title</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </header>

      {/* Content Grid */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {loading ? (
          <div className="text-center py-12">
            <p>Loading movies...</p>
          </div>
        ) : (
          <ScrollArea className="h-[calc(100vh-200px)]">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredAndSortedMovies.map((movie) => (
                <ContentCard
                  key={movie.id}
                  title={movie.title}
                  imageUrl={movie.imageUrl}
                  rating={movie.rating}
                  duration={movie.duration || '2h 30m'}
                  language={movie.language}
                  isPremium={movie.isPremium}
                  isLive={movie.isLive}
                  onPlay={() => handlePlay(movie)}
                  onAddToWatchlist={() => handleAddToWatchlist(movie)}
                />
              ))}
            </div>
            
            {!loading && filteredAndSortedMovies.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No movies found</p>
              </div>
            )}
          </ScrollArea>
        )}
      </div>
    </div>
  );
};

export default SeeAll;