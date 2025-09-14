import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import HeroBanner from '@/components/home/HeroBanner';
import ContentSection from '@/components/home/ContentSection';
import ContinueWatchingSection from '@/components/home/ContinueWatchingSection';
import XPNotification from '@/components/gamification/XPNotification';
import WelcomeBackScreen from '@/components/gamification/WelcomeBackScreen';
import { Button } from '@/components/ui/button';
import { User, Search, List, TrendingUp, Star, MapPin, Trophy, Crown, Zap, Heart, Bookmark } from 'lucide-react';
import tmdbService, { TMDBMovie } from '@/services/tmdb';

interface HomeProps {
  userPreferences: {
    phoneNumber?: string;
    languages: string[];
    genres: string[];
    contentTypes: string[];
    allowLocation: boolean;
  };
  onNavigateToProfile?: () => void;
  onNavigateToSearch?: () => void;
}

const Home: React.FC<HomeProps> = ({ userPreferences, onNavigateToProfile, onNavigateToSearch }) => {
  const navigate = useNavigate();
  // State for actual watched content - only show continue watching if user has watched something
  const [continueWatchingItems, setContinueWatchingItems] = useState<any[]>([]);
  const [currentlyWatching, setCurrentlyWatching] = useState<Set<string>>(new Set());
  
  // Gamification state
  const [userXP, setUserXP] = useState(1240);
  const [showXPNotification, setShowXPNotification] = useState<{
    show: boolean;
    amount: number;
    reason: string;
    type: 'content_completion' | 'engagement' | 'streak' | 'discovery' | 'milestone';
  }>({ show: false, amount: 0, reason: '', type: 'content_completion' });
  
  const [showWelcomeBack, setShowWelcomeBack] = useState(false);
  const [returningUser] = useState(Math.random() > 0.7); // 30% chance for demo
  
  // Content state organized by user preferences
  const [heroContent, setHeroContent] = useState<any[]>([]);
  const [moviesByLanguage, setMoviesByLanguage] = useState<{ [key: string]: any[] }>({});
  const [tvShowsByLanguage, setTVShowsByLanguage] = useState<{ [key: string]: any[] }>({});
  const [sportsContent, setSportsContent] = useState<any[]>([]);
  const [trendingContent, setTrendingContent] = useState<any[]>([]);
  const [premiumContent, setPremiumContent] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  // Fetch content based on user preferences
  useEffect(() => {
    const fetchContentByPreferences = async () => {
      try {
        setLoading(true);
        console.log('User preferences:', userPreferences);
        
        // Reset all content state
        setHeroContent([]);
        setMoviesByLanguage({});
        setTVShowsByLanguage({});
        setSportsContent([]);
        setTrendingContent([]);
        setPremiumContent([]);
        
        // 1. Fetch hero content based on primary preference
        const primaryContentType = userPreferences.contentTypes[0] || 'movies';
        let heroData = [];
        
        if (primaryContentType === 'sports') {
          const sports = await tmdbService.getSportsContent();
          heroData = sports.results.slice(0, 5).map(movie => ({
            ...tmdbService.convertToContentItem(movie),
            isLive: Math.random() > 0.7
          }));
        } else if (primaryContentType === 'tv_shows' || primaryContentType === 'series') {
          const trending = await tmdbService.getTrendingTVShows();
          heroData = trending.results.slice(0, 5).map(show => tmdbService.convertTVShowToContentItem(show));
        } else {
          // Default to movies
          const trending = await tmdbService.getTrendingMovies();
          heroData = trending.results.slice(0, 5).map(movie => tmdbService.convertToContentItem(movie));
        }
        setHeroContent(heroData);
        
        // 2. Fetch content for each selected language
        const moviesByLangTemp: { [key: string]: any[] } = {};
        const tvShowsByLangTemp: { [key: string]: any[] } = {};
        
        for (const language of userPreferences.languages) {
          console.log(`Fetching content for language: ${language}`);
          
          // Fetch movies for this language with user's preferred genres
          if (userPreferences.contentTypes.includes('movies')) {
            try {
              const movies = await tmdbService.getMoviesBySpecificLanguageAndGenre(
                language, 
                userPreferences.genres
              );
              moviesByLangTemp[language] = movies.results.slice(0, 20).map(movie => tmdbService.convertToContentItem(movie));
              console.log(`Fetched ${moviesByLangTemp[language].length} movies for ${language}`);
            } catch (error) {
              console.error(`Error fetching movies for ${language}:`, error);
              moviesByLangTemp[language] = [];
            }
          }
          
          // Fetch TV shows for this language with user's preferred genres
          if (userPreferences.contentTypes.includes('tv_shows') || userPreferences.contentTypes.includes('series')) {
            try {
              const tvShows = await tmdbService.getTVShowsBySpecificLanguageAndGenre(
                language, 
                userPreferences.genres
              );
              tvShowsByLangTemp[language] = tvShows.results.slice(0, 20).map(show => tmdbService.convertTVShowToContentItem(show));
              console.log(`Fetched ${tvShowsByLangTemp[language].length} TV shows for ${language}`);
            } catch (error) {
              console.error(`Error fetching TV shows for ${language}:`, error);
              tvShowsByLangTemp[language] = [];
            }
          }
        }
        
        setMoviesByLanguage(moviesByLangTemp);
        setTVShowsByLanguage(tvShowsByLangTemp);
        
        // 3. Fetch sports content if user selected sports
        if (userPreferences.contentTypes.includes('sports')) {
          const sports = await tmdbService.getSportsContent();
          const sportsFormatted = sports.results.slice(0, 20).map(movie => ({
            ...tmdbService.convertToContentItem(movie),
            isLive: Math.random() > 0.7,
            type: 'sports'
          }));
          setSportsContent(sportsFormatted);
        }
        
        // 4. Fetch general trending content
        const trending = await tmdbService.getTrendingMovies();
        const trendingFormatted = trending.results.slice(0, 20).map(movie => tmdbService.convertToContentItem(movie));
        setTrendingContent(trendingFormatted);
        
        // 5. Fetch premium content
        const popular = await tmdbService.getPopularMovies();
        const premiumFormatted = popular.results.slice(0, 20).map(movie => ({
          ...tmdbService.convertToContentItem(movie),
          isPremium: true
        }));
        setPremiumContent(premiumFormatted);
        
        setLoading(false);
        
      } catch (error) {
        console.error('Error fetching content:', error);
        setLoading(false);
      }
    };

    if (userPreferences.languages.length > 0 && userPreferences.contentTypes.length > 0) {
      fetchContentByPreferences();
    }
  }, [userPreferences]);

  // Fallback content for when API fails
  const getFallbackContent = (count: number = 6) => {
    return [
      {
        id: '1',
        title: 'Pushpa: The Rise',
        imageUrl: 'https://images.unsplash.com/photo-1509281373149-e957c6296406?w=300&h=400&fit=crop',
        duration: '2h 59m',
        rating: 4.2,
        language: 'te',
        isPremium: false,
        type: 'movie'
      },
      {
        id: '2', 
        title: 'RRR',
        imageUrl: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=300&h=400&fit=crop',
        duration: '3h 7m',
        rating: 4.5,
        language: 'te',
        isPremium: false,
        type: 'movie'
      },
      {
        id: '3',
        title: 'KGF Chapter 2',
        imageUrl: 'https://images.unsplash.com/photo-1478720568477-b956dc04de23?w=300&h=400&fit=crop',
        duration: '2h 48m', 
        rating: 4.3,
        language: 'kn',
        isPremium: true,
        type: 'movie'
      },
      {
        id: '4',
        title: 'Pathaan',
        imageUrl: 'https://images.unsplash.com/photo-1489599328109-2af2c85020e4?w=300&h=400&fit=crop',
        duration: '2h 26m',
        rating: 4.1,
        language: 'hi',
        isPremium: true,
        type: 'movie'
      },
      {
        id: '5',
        title: 'Vikram',
        imageUrl: 'https://images.unsplash.com/photo-1489599328109-2af2c85020e4?w=300&h=400&fit=crop',
        duration: '2h 53m',
        rating: 4.4,
        language: 'ta', 
        isPremium: false,
        type: 'movie'
      },
      {
        id: '6',
        title: 'Jawan',
        imageUrl: 'https://images.unsplash.com/photo-1489599328109-2af2c85020e4?w=300&h=400&fit=crop',
        duration: '2h 49m',
        rating: 4.2,
        language: 'hi',
        isPremium: true,
        type: 'movie'
      }
    ].slice(0, count);
  };

  // Event handlers
  const handleItemPlay = (item: any) => {
    console.log('Play item:', item);
    
    // Ensure proper ID format for navigation
    const movieId = item.id.toString().replace('tv_', '');
    navigate(`/movie/${movieId}`);
  };

  const handleItemWatchlist = (item: any) => {
    console.log('Add to watchlist:', item);
    
    // Add XP for engagement
    const xpAmount = 5;
    setUserXP(prev => prev + xpAmount);
    setShowXPNotification({
      show: true,
      amount: xpAmount,
      reason: 'Added to watchlist',
      type: 'engagement'
    });
  };

  const handleSeeAll = (section: string) => {
    console.log('See all for section:', section);
    navigate('/seeall', { state: { section, userPreferences } });
  };

  const handleContinueWatching = (item: any) => {
    console.log('Continue watching:', item);
    handleItemPlay(item);
  };

  const handleRemoveContinueWatching = (item: any) => {
    console.log('Remove from continue watching:', item);
    setContinueWatchingItems(prev => prev.filter(i => i.id !== item.id));
    setCurrentlyWatching(prev => {
      const newSet = new Set(prev);
      newSet.delete(item.id);
      return newSet;
    });
  };



  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation Bar */}
      <header className="bg-background shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">S</span>
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  SonyLIV
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button 
                size="icon" 
                variant="ghost" 
                className="text-muted-foreground"
                onClick={() => navigate('/search')}
              >
                <Search className="w-5 h-5" />
              </Button>
              <Button 
                size="icon" 
                variant="ghost" 
                className="text-muted-foreground hover:text-red-500 transition-colors"
                onClick={() => {
                  console.log('My List button clicked');
                  navigate('/mylist');
                }}
                title="My List"
              >
                <Bookmark className="w-5 h-5" />
              </Button>
              <Button 
                size="icon" 
                variant="ghost" 
                className="text-muted-foreground relative"
                onClick={onNavigateToProfile}
              >
                <div className="w-8 h-8 bg-sonyliv-primary/20 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-sonyliv-primary" />
                </div>
                {/* XP Badge */}
                <div className="absolute -top-1 -right-1 bg-yellow-500 text-black text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {Math.floor(userXP / 100)}
                </div>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-md mx-auto">
        {/* Hero Banner Carousel */}
        <div className="px-4 pt-4">
          <HeroBanner userPreferences={userPreferences} movies={heroContent} />
        </div>

        {/* Continue Watching Section - Only show if user has watched content */}
        {continueWatchingItems.length > 0 && (
          <ContinueWatchingSection
            items={continueWatchingItems}
            onResume={handleContinueWatching}
            onRemove={handleRemoveContinueWatching}
          />
        )}

        {/* 1. Trending Content - Universal (FIRST) */}
        {trendingContent.length > 0 && (
          <ContentSection
            title="Trending Now 🔥"
            subtitle="What everyone is watching"
            items={trendingContent.slice(0, 6)}
            icon={<TrendingUp className="w-5 h-5 text-orange-500" />}
            onItemPlay={handleItemPlay}
            onItemWatchlist={handleItemWatchlist}
            onSeeAll={() => handleSeeAll('Trending Now')}
          />
        )}

        {/* 2. Popular Near You - Location-based (SECOND) */}
        <ContentSection
          title="Popular Near You 📍"
          subtitle="Trending in your area"
          items={trendingContent.length > 6 
            ? trendingContent.slice(6, 12).map(movie => ({
                ...movie,
                viewCount: `${Math.floor(1 + Math.random() * 5)}k`
              }))
            : getFallbackContent(6).map(movie => ({
                ...movie,
                viewCount: `${Math.floor(1 + Math.random() * 5)}k`
              }))
          }
          icon={<MapPin className="w-5 h-5 text-blue-500" />}
          onItemPlay={handleItemPlay}
          onItemWatchlist={handleItemWatchlist}
          onSeeAll={() => handleSeeAll('Popular Near You')}
        />

        {/* 3. Preferred Language Contents (THIRD) */}
        {userPreferences.languages.map((language, index) => {
          const languageName = getLanguageDisplayName(language);
          const movies = moviesByLanguage[language] || [];
          const tvShows = tvShowsByLanguage[language] || [];
          const fallback = getFallbackContent(6);
          
          return (
            <div key={language}>
              {/* Movies in this language */}
              {(userPreferences.contentTypes.includes('movies') || userPreferences.contentTypes.length === 0) && (
                <ContentSection
                  title={`${languageName} Movies 🎬`}
                  subtitle={`Popular movies in ${languageName}`}
                  items={movies.length > 0 ? movies.slice(0, 6) : fallback}
                  onItemPlay={handleItemPlay}
                  onItemWatchlist={handleItemWatchlist}
                  onSeeAll={() => handleSeeAll(`${languageName} Movies`)}
                />
              )}
              
              {/* TV Shows in this language */}
              {(userPreferences.contentTypes.includes('tv_shows') || userPreferences.contentTypes.includes('series')) && (
                <ContentSection
                  title={`${languageName} TV Shows 📺`}
                  subtitle={`Popular series in ${languageName}`}
                  items={tvShows.length > 0 ? tvShows.slice(0, 6) : fallback.map(item => ({ ...item, type: 'series' }))}
                  onItemPlay={handleItemPlay}
                  onItemWatchlist={handleItemWatchlist}
                  onSeeAll={() => handleSeeAll(`${languageName} TV Shows`)}
                />
              )}
            </div>
          );
        })}

        {/* 4. Premium Content (FOURTH) */}
        {premiumContent.length > 0 && (
          <ContentSection
            title="Premium Content ⭐"
            subtitle="Exclusive premium movies and shows"
            items={premiumContent.slice(0, 6)}
            icon={<Crown className="w-5 h-5 text-yellow-500" />}
            onItemPlay={handleItemPlay}
            onItemWatchlist={handleItemWatchlist}
            onSeeAll={() => handleSeeAll('Premium Content')}
          />
        )}

        {/* 5. Sports Content (FIFTH) */}
        {userPreferences.contentTypes.includes('sports') && sportsContent.length > 0 && (
          <ContentSection
            title="Sports Highlights ⚽"
            subtitle="Live sports and highlights"
            items={sportsContent.slice(0, 6)}
            icon={<Trophy className="w-5 h-5 text-green-500" />}
            onItemPlay={handleItemPlay}
            onItemWatchlist={handleItemWatchlist}
            onSeeAll={() => handleSeeAll('Sports Highlights')}
          />
        )}

        {/* Loading state */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading your personalized content...</p>
            </div>
          </div>
        )}

        {/* Bottom Spacing */}
        <div className="h-8" />
      </div>

      {/* XP Notification */}
      {showXPNotification.show && (
        <XPNotification
          xpAmount={showXPNotification.amount}
          reason={showXPNotification.reason}
          type={showXPNotification.type}
          onComplete={() => setShowXPNotification({ ...showXPNotification, show: false })}
        />
      )}

      {/* Welcome Back Screen for Returning Users */}
      {returningUser && showWelcomeBack && (
        <WelcomeBackScreen
          onStartWatching={() => setShowWelcomeBack(false)}
          onLearnMore={() => console.log('Learn more about premium')}
          onClose={() => setShowWelcomeBack(false)}
        />
      )}
    </div>
  );
};

export default Home;