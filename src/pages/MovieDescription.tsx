import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ArrowLeft, Play, Heart, Plus, Star, Clock, Calendar, Globe, Users, Crown, Zap, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import tmdbService, { TMDBMovieDetails } from '@/services/tmdb';
import VideoPlayer from '@/components/video/VideoPlayer';
import PremiumUnlockModal from '@/components/gamification/PremiumUnlockModal';
import watchlistService from '@/services/watchlist';

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
  const [userXP, setUserXP] = useState(1250); // Mock user XP
  const [movieData, setMovieData] = useState<MovieDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const [showPremiumUnlock, setShowPremiumUnlock] = useState(false);

  // Check if coming from My List page
  const isFromMyList = location.state?.fromMyList || false;

  // Fallback movie database for when TMDB fails or for banner fallback IDs
  const fallbackMovieDatabase: { [key: string]: MovieDetails } = {
    '1': {
      id: '1',
      title: 'RRR',
      description: 'A fictional story about two legendary revolutionaries and their journey away from home before they started fighting for their country in 1920s. Set in the 1920s, it is about two Indian revolutionaries, Alluri Sitarama Raju and Komaram Bheem, who fought against the British Raj and Nizam of Hyderabad respectively.',
      imageUrl: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=800&h=600&fit=crop&crop=center',
      duration: '3h 7m',
      rating: 4.5,
      year: 2022,
      language: 'Telugu',
      genre: ['Action', 'Adventure', 'Drama'],
      director: 'S.S. Rajamouli',
      cast: ['N.T. Rama Rao Jr.', 'Ram Charan', 'Ajay Devgn', 'Alia Bhatt'],
      isPremium: false,
      xpRequired: 0
    },
    '2': {
      id: '2',
      title: 'Pushpa: The Rise',
      description: 'A laborer rises through the ranks of a sandalwood smuggling syndicate, making some powerful enemies in the process. Pushpa Raj is a coolie who rises in the world of red sandalwood smuggling. Along the way, he doesnt shy from making an enemy or two.',
      imageUrl: 'https://images.unsplash.com/photo-1509281373149-e957c6296406?w=800&h=600&fit=crop&crop=center',
      duration: '2h 59m',
      rating: 4.2,
      year: 2021,
      language: 'Telugu',
      genre: ['Action', 'Crime', 'Drama'],
      director: 'Sukumar',
      cast: ['Allu Arjun', 'Rashmika Mandanna', 'Fahadh Faasil', 'Jagapathi Babu'],
      isPremium: false,
      xpRequired: 0
    },
    '3': {
      id: '3',
      title: 'KGF Chapter 2',
      description: 'Rocky, whose name strikes fear in the heart of his foes. His allies look up to Rocky as their Savior, the government sees him as a threat to law and order; enemies are clamoring for revenge and conspiring for his downfall.',
      imageUrl: 'https://images.unsplash.com/photo-1478720568477-b956dc04de23?w=800&h=600&fit=crop&crop=center',
      duration: '2h 48m',
      rating: 4.3,
      year: 2022,
      language: 'Kannada',
      genre: ['Action', 'Crime', 'Drama'],
      director: 'Prashanth Neel',
      cast: ['Yash', 'Sanjay Dutt', 'Raveena Tandon', 'Srinidhi Shetty'],
      isPremium: true,
      xpRequired: 1000
    },
    '4': {
      id: '4',
      title: 'Pathaan',
      description: 'An Indian spy takes on the leader of a group of mercenaries who have nefarious plans to target India. A spy thriller action film featuring Shah Rukh Khan as a RAW agent who must stop a terrorist attack.',
      imageUrl: 'https://images.unsplash.com/photo-1489599328109-2af2c85020e4?w=800&h=600&fit=crop&crop=center',
      duration: '2h 26m',
      rating: 4.1,
      year: 2023,
      language: 'Hindi',
      genre: ['Action', 'Thriller', 'Adventure'],
      director: 'Siddharth Anand',
      cast: ['Shah Rukh Khan', 'Deepika Padukone', 'John Abraham', 'Dimple Kapadia'],
      isPremium: true,
      xpRequired: 1000
    },
    '5': {
      id: '5',
      title: 'Live Cricket: India vs Australia',
      description: 'Experience the thrill of live cricket as India takes on Australia in this highly anticipated match. Watch your favorite players compete in real-time from the Melbourne Cricket Ground.',
      imageUrl: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800&h=600&fit=crop&crop=center',
      duration: 'LIVE',
      rating: 4.8,
      year: 2024,
      language: 'English',
      genre: ['Sports', 'Live'],
      director: 'Live Broadcast',
      cast: ['Team India', 'Team Australia'],
      isPremium: false,
      xpRequired: 0
    },
    '6': {
      id: '6',
      title: 'Pathaan',
      description: 'An Indian spy takes on the leader of a group of mercenaries who have nefarious plans to target India. A spy thriller action film featuring Shah Rukh Khan as a RAW agent who must stop a terrorist attack.',
      imageUrl: 'https://images.unsplash.com/photo-1489599328109-2af2c85020e4?w=800&h=600&fit=crop&crop=center',
      duration: '2h 26m',
      rating: 4.1,
      year: 2023,
      language: 'Hindi',
      genre: ['Action', 'Thriller', 'Adventure'],
      director: 'Siddharth Anand',
      cast: ['Shah Rukh Khan', 'Deepika Padukone', 'John Abraham', 'Dimple Kapadia'],
      isPremium: true,
      xpRequired: 1000
    },
    // Add more popular TMDB IDs for better coverage
    '550': {
      id: '550',
      title: 'Fight Club',
      description: 'A ticking-time-bomb insomniac and a slippery soap salesman channel primal male aggression into a shocking new form of therapy.',
      imageUrl: 'https://images.unsplash.com/photo-1489599328109-2af2c85020e4?w=800&h=600&fit=crop&crop=center',
      duration: '2h 19m',
      rating: 4.4,
      year: 1999,
      language: 'English',
      genre: ['Drama', 'Thriller'],
      director: 'David Fincher',
      cast: ['Brad Pitt', 'Edward Norton', 'Helena Bonham Carter'],
      isPremium: false,
      xpRequired: 0
    },
    '299536': {
      id: '299536',
      title: 'Avengers: Infinity War',
      description: 'The Avengers must stop Thanos, an intergalactic warlord, from getting his hands on all the infinity stones.',
      imageUrl: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=800&h=600&fit=crop&crop=center',
      duration: '2h 29m',
      rating: 4.3,
      year: 2018,
      language: 'English',
      genre: ['Action', 'Adventure', 'Sci-Fi'],
      director: 'Russo Brothers',
      cast: ['Robert Downey Jr.', 'Chris Evans', 'Mark Ruffalo', 'Chris Hemsworth'],
      isPremium: true,
      xpRequired: 1200
    }
  };

  // Fetch movie data from TMDB or fallback database
  useEffect(() => {
    const fetchMovieData = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        
        // Check if it's a fallback ID first
        if (fallbackMovieDatabase[id]) {
          setMovieData(fallbackMovieDatabase[id]);
          setError(null);
          setLoading(false);
          return;
        }
        
        // Try to fetch from TMDB
        console.log('🔍 Attempting to fetch movie data for ID:', id);
        
        const movieId = parseInt(id);
        if (isNaN(movieId)) {
          console.warn('⚠️ Non-numeric ID detected, creating fallback entry:', id);
          throw new Error(`Non-numeric movie ID: ${id}`);
        }
        
        console.log('📡 Fetching TMDB data for numeric ID:', movieId);
        
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
          director: 'Director info not available',
          cast: ['Cast info not available'],
          isPremium: Math.random() > 0.7,
          xpRequired: 1000,
          trailerUrl: undefined
        };
        
        setMovieData(movieDetails);
        setError(null);
      } catch (err: any) {
        console.error('❌ Error fetching movie data for ID:', id, err.message);
        
        // Create a more intelligent fallback based on the ID
        let fallbackTitle = `Movie ${id}`;
        let fallbackImage = 'https://images.unsplash.com/photo-1489599328109-2af2c85020e4?w=800&h=600&fit=crop&crop=center';
        
        // Try to determine content type from ID
        if (id.includes('tv_') || id.startsWith('tv')) {
          fallbackTitle = `TV Show ${id.replace('tv_', '')}`;
        }
        
        const basicFallback: MovieDetails = {
          id: id,
          title: fallbackTitle,
          description: 'Content details are being loaded. This might be a new release or regional content.',
          imageUrl: fallbackImage,
          duration: '2h 30m',
          rating: 4.0,
          year: 2023,
          language: 'English',
          genre: ['Entertainment'],
          director: 'Information loading...',
          cast: ['Cast information loading...'],
          isPremium: false,
          xpRequired: 0
        };
        
        console.log('📱 Created fallback movie data:', basicFallback);
        setMovieData(basicFallback);
        setError(null); // Don't show error, show fallback instead
      } finally {
        setLoading(false);
      }
    };

    fetchMovieData();
  }, [id]);

  // Initialize watchlist status
  useEffect(() => {
    if (id) {
      setIsInWatchlist(watchlistService.isInWatchlist(id));
    }
  }, [id]);

  const handlePlay = () => {
    console.log('Playing movie:', movieData?.title);
    
    // Check if it's premium content and user doesn't have enough XP
    if (movieData?.isPremium && movieData.xpRequired > 0 && userXP < movieData.xpRequired) {
      setShowPremiumUnlock(true);
    } else {
      setShowVideoPlayer(true);
    }
  };

  const handleXPEarned = (amount: number) => {
    setUserXP(prev => prev + amount);
    console.log(`Earned ${amount} XP from watching ${movieData?.title}`);
  };

  const handleUnlockWithXP = () => {
    if (movieData && userXP >= movieData.xpRequired) {
      setUserXP(prev => prev - movieData.xpRequired);
      setShowPremiumUnlock(false);
      setShowVideoPlayer(true);
      console.log(`Unlocked ${movieData.title} with ${movieData.xpRequired} XP`);
    }
  };

  const handleWatchWithPremium = () => {
    setShowPremiumUnlock(false);
    setShowVideoPlayer(true);
    console.log('Watching with premium subscription');
  };

  const handleAddToWatchlist = () => {
    if (!movieData) return;

    if (isInWatchlist) {
      // Remove from watchlist
      const success = watchlistService.removeFromWatchlist(movieData.id);
      if (success) {
        setIsInWatchlist(false);
        console.log('Removed from watchlist:', movieData.title);
      }
    } else {
      // Add to watchlist
      const watchlistItem = watchlistService.convertToWatchlistItem({
        id: movieData.id,
        title: movieData.title,
        imageUrl: movieData.imageUrl,
        duration: movieData.duration,
        rating: movieData.rating,
        year: movieData.year,
        language: movieData.language,
        genre: movieData.genre,
        isPremium: movieData.isPremium,
        type: 'movie',
        description: movieData.description
      });
      
      const success = watchlistService.addToWatchlist(watchlistItem);
      if (success) {
        setIsInWatchlist(true);
        console.log('Added to watchlist:', movieData.title);
      }
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

      {/* Video Player Modal */}
      {movieData && (
        <VideoPlayer
          isOpen={showVideoPlayer}
          onClose={() => setShowVideoPlayer(false)}
          movie={{
            id: movieData.id,
            title: movieData.title,
            imageUrl: movieData.imageUrl,
            duration: movieData.duration,
            isPremium: movieData.isPremium
          }}
          onXPEarned={handleXPEarned}
        />
      )}

      {/* Premium Unlock Modal */}
      {movieData && (
        <PremiumUnlockModal
          isOpen={showPremiumUnlock}
          onClose={() => setShowPremiumUnlock(false)}
          movie={{
            title: movieData.title,
            imageUrl: movieData.imageUrl,
            xpRequired: movieData.xpRequired
          }}
          userXP={userXP}
          onUnlock={handleUnlockWithXP}
          onWatchWithPremium={handleWatchWithPremium}
        />
      )}
    </div>
  );
};

export default MovieDescription;
