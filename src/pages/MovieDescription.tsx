import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ArrowLeft, Play, Heart, Plus, Star, Clock, Calendar, Globe, Users, Crown, Zap, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import tmdbService, { TMDBMovieDetails } from '@/services/tmdb';

interface MovieDetails {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  duration: string;
  rating: number;
  year: number;
  language: string;
  genre: string[];
  director: string;
  cast: string[];
  isPremium: boolean;
  xpRequired: number;
  trailerUrl?: string;
}

const MovieDescription: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [userXP] = useState(1250); // Mock user XP
  const [movieData, setMovieData] = useState<MovieDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if coming from My List page
  const isFromMyList = location.state?.fromMyList || false;

  // Fetch movie data from TMDB
  useEffect(() => {
    const fetchMovieData = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const movieId = parseInt(id);
        const movie = await tmdbService.getMovieDetails(movieId);
        
        const movieDetails: MovieDetails = {
          id: movie.id.toString(),
          title: movie.title,
          description: movie.overview,
          imageUrl: tmdbService.getImageURL(movie.backdrop_path, 'w780'),
          duration: `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m`,
          rating: Math.round(movie.vote_average * 10) / 10,
          year: new Date(movie.release_date).getFullYear(),
          language: movie.original_language.toUpperCase(),
          genre: movie.genres.map(g => g.name),
          director: 'Director info not available', // TMDB doesn't provide director in movie details endpoint
          cast: ['Cast info not available'], // Would need separate API call for credits
          isPremium: Math.random() > 0.7, // Randomly assign premium status
          xpRequired: 1000,
          trailerUrl: undefined
        };
        
        setMovieData(movieDetails);
        setError(null);
      } catch (err) {
        console.error('Error fetching movie data:', err);
        setError('Failed to load movie details');
      } finally {
        setLoading(false);
      }
    };

    fetchMovieData();
  }, [id]);

  // Initialize watchlist status
  useEffect(() => {
    setIsInWatchlist(isFromMyList);
  }, [isFromMyList]);

  const handlePlay = () => {
    console.log('Playing movie:', movieData.title);
    // Navigate to player or show premium unlock
  };

  const handleAddToWatchlist = () => {
    setIsInWatchlist(!isInWatchlist);
    console.log(isInWatchlist ? 'Removed from watchlist:' : 'Added to watchlist:', movieData?.title);
  };

  const handleUnlockWithXP = () => {
    if (movieData && userXP >= movieData.xpRequired) {
      console.log('Unlocked with XP:', movieData.title);
      // Unlock premium content
    } else {
      console.log('Not enough XP');
    }
  };

  const canUnlockWithXP = movieData ? userXP >= movieData.xpRequired : false;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading movie details...</p>
        </div>
      </div>
    );
  }

  if (error || !movieData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center px-4">
          <p className="text-muted-foreground mb-4">{error || 'Movie not found'}</p>
          <Button onClick={() => navigate('/')}>Go Back Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-background shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Button size="icon" variant="ghost" onClick={() => navigate('/')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-lg font-semibold">Movie Details</h1>
            <div className="w-10" /> {/* Spacer */}
          </div>
        </div>
      </header>

      <div className="max-w-md mx-auto">
        {/* Hero Image */}
        <div className="relative h-64 w-full">
          <img 
            src={movieData.imageUrl} 
            alt={movieData.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          
          {/* Play Button Overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Button 
              size="lg" 
              className="bg-white/90 text-black hover:bg-white"
              onClick={handlePlay}
            >
              <Play className="w-6 h-6 mr-2" />
              Play Now
            </Button>
          </div>

          {/* Premium Badge */}
          {movieData.isPremium && (
            <div className="absolute top-4 right-4">
              <Badge className="bg-yellow-600 text-white">
                <Crown className="w-3 h-3 mr-1" />
                Premium
              </Badge>
            </div>
          )}
        </div>

        {/* Movie Info */}
        <div className="px-4 py-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-2">{movieData.title}</h1>
              <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-3">
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span className="font-medium">{movieData.rating}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>{movieData.year}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>{movieData.duration}</span>
                </div>
              </div>
            </div>
            <Button
              size="icon"
              variant="ghost"
              onClick={handleAddToWatchlist}
              className={isInWatchlist ? 'text-red-500' : 'text-muted-foreground'}
            >
              {isInWatchlist ? (
                <Trash2 className="w-6 h-6" />
              ) : (
                <Heart className="w-6 h-6" />
              )}
            </Button>
          </div>

          {/* Genres */}
          <div className="flex flex-wrap gap-2 mb-4">
            {movieData.genre.map((genre, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {genre}
              </Badge>
            ))}
            <Badge variant="outline" className="text-xs">
              <Globe className="w-3 h-3 mr-1" />
              {movieData.language}
            </Badge>
          </div>

          {/* Description */}
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Synopsis</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {movieData.description}
            </p>
          </div>

          {/* Cast & Crew */}
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Cast & Crew</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">
                  <span className="font-medium">Director:</span> {movieData.director}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">
                  <span className="font-medium">Cast:</span> {movieData.cast.join(', ')}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button 
              className="w-full" 
              size="lg"
              onClick={handlePlay}
            >
              <Play className="w-5 h-5 mr-2" />
              {movieData.isPremium ? 'Watch Premium' : 'Watch Now'}
            </Button>

            {movieData.isPremium && (
              <div className="space-y-2">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">
                    Unlock with {movieData.xpRequired} XP
                  </p>
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <Zap className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm font-medium">{userXP} XP available</span>
                  </div>
                  <Progress 
                    value={(userXP / movieData.xpRequired) * 100} 
                    className="w-full h-2"
                  />
                </div>
                
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={handleUnlockWithXP}
                  disabled={!canUnlockWithXP}
                >
                  <Crown className="w-4 h-4 mr-2" />
                  {canUnlockWithXP ? 'Unlock with XP' : 'Need More XP'}
                </Button>
              </div>
            )}

            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={handleAddToWatchlist}
              >
                {isInWatchlist ? (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Remove from List
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Add to List
                  </>
                )}
              </Button>
              <Button variant="outline" size="icon">
                <Heart className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDescription;
