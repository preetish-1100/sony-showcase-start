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
import watchlistService from '@/services/watchlist';
import xpService from '@/services/xp';

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
  const [userXP, setUserXP] = useState(xpService.getCurrentXP());
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
  const [apiStatus, setApiStatus] = useState<'testing' | 'connected' | 'fallback' | 'error' | 'blocked'>('testing');
  const [isRegionallyBlocked, setIsRegionallyBlocked] = useState(false);

  // Debug logging for content state
  useEffect(() => {
    console.log('Content state updated:');
    console.log('- Hero content:', heroContent.length);
    console.log('- Trending content:', trendingContent.length);
    console.log('- Movies by language:', Object.keys(moviesByLanguage).length);
    console.log('- TV shows by language:', Object.keys(tvShowsByLanguage).length);
    console.log('- Sports content:', sportsContent.length);
    console.log('- Premium content:', premiumContent.length);
  }, [heroContent, trendingContent, moviesByLanguage, tvShowsByLanguage, sportsContent, premiumContent]);

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

  // Test TMDB API connection with detailed diagnostics
  const testTMDBConnection = async () => {
    try {
      console.log('🔍 Testing TMDB API connection...');
      const isConnected = await tmdbService.testConnection();
      console.log('🔍 TMDB API connection test result:', isConnected);
      return isConnected;
    } catch (error) {
      console.error('❌ TMDB API test failed:', error);
      return false;
    }
  };

  // Network diagnostics
  const runNetworkDiagnostics = async () => {
    console.log('🔧 Running network diagnostics...');

    // Test 1: Basic connectivity
    try {
      const response = await fetch('https://httpbin.org/get', {
        method: 'GET',
        signal: AbortSignal.timeout(10000)
      });
      console.log('✅ Basic internet connectivity: OK');
    } catch (error) {
      console.error('❌ Basic internet connectivity: FAILED', error);
      return false;
    }

    // Test 2: TMDB domain resolution
    try {
      const response = await fetch('https://api.themoviedb.org', {
        method: 'HEAD',
        signal: AbortSignal.timeout(15000)
      });
      console.log('✅ TMDB domain resolution: OK');
    } catch (error) {
      console.error('❌ TMDB domain resolution: FAILED', error);
      return false;
    }

    return true;
  };

  // Fetch content based on user preferences
  useEffect(() => {
    const fetchContentByPreferences = async () => {
      try {
        setLoading(true);
        console.log('User preferences:', userPreferences);

        // Test API connection first - but proceed regardless
        console.log('🚀 Starting content fetch with user preferences:', userPreferences);
        setApiStatus('testing');

        const isAPIConnected = await testTMDBConnection();
        console.log('🔍 Initial API Connection Status:', isAPIConnected);

        if (isAPIConnected) {
          setApiStatus('connected');
          console.log('✅ TMDB API is working, fetching live data');
        } else {
          console.warn('⚠️ Initial API test failed, but will still attempt API calls with aggressive retry');
        }

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

        try {
          if (primaryContentType === 'sports') {
            console.log('🏈 Fetching sports content for hero banner...');
            const sports = await tmdbService.getSportsContent();
            heroData = sports.results.slice(0, 5).map(movie => ({
              ...tmdbService.convertToContentItem(movie),
              isLive: Math.random() > 0.7
            }));
            console.log(`✅ Got ${heroData.length} sports items for hero`);
          } else if (primaryContentType === 'tv_shows' || primaryContentType === 'series') {
            console.log('📺 Fetching trending TV shows for hero banner...');
            const trending = await tmdbService.getTrendingTVShows();
            heroData = trending.results.slice(0, 5).map(show => tmdbService.convertTVShowToContentItem(show));
            console.log(`✅ Got ${heroData.length} TV shows for hero`);
          } else {
            console.log('🎬 Fetching trending movies for hero banner...');
            const trending = await tmdbService.getTrendingMovies();
            heroData = trending.results.slice(0, 5).map(movie => tmdbService.convertToContentItem(movie));
            console.log(`✅ Got ${heroData.length} movies for hero`);
          }

          setHeroContent(heroData);
          setApiStatus('connected');
        } catch (error: any) {
          console.log('📱 Loading curated content for hero banner');

          // Check if it's regional blocking
          if (error.message.includes('Regional blocking') || error.message.includes('All') && error.message.includes('endpoints failed')) {
            setIsRegionallyBlocked(true);
            setApiStatus('blocked');
          } else {
            setApiStatus('fallback');
          }

          heroData = getFallbackContent(5);
          setHeroContent(heroData);
        }

        // 2. Fetch content for each selected language
        const moviesByLangTemp: { [key: string]: any[] } = {};
        const tvShowsByLangTemp: { [key: string]: any[] } = {};

        for (const language of userPreferences.languages) {
          console.log(`Fetching content for language: ${language}`);

          // Fetch movies for this language with user's preferred genres
          if (userPreferences.contentTypes.includes('movies')) {
            try {
              console.log(`🎬 Fetching ${language} movies with genres:`, userPreferences.genres);
              const movies = await tmdbService.getMoviesBySpecificLanguageAndGenre(language, userPreferences.genres);
              moviesByLangTemp[language] = movies.results.slice(0, 20).map(movie => tmdbService.convertToContentItem(movie));
              console.log(`✅ Successfully fetched ${moviesByLangTemp[language].length} ${language} movies from API`);
            } catch (error) {
              console.log(`📱 Loading curated ${language} movies`);
              moviesByLangTemp[language] = getFallbackContent(20);
            }
          }

          // Fetch TV shows for this language with user's preferred genres
          if (userPreferences.contentTypes.includes('tv_shows') || userPreferences.contentTypes.includes('series')) {
            try {
              console.log(`📺 Fetching ${language} TV shows with genres:`, userPreferences.genres);
              const tvShows = await tmdbService.getTVShowsBySpecificLanguageAndGenre(language, userPreferences.genres);
              tvShowsByLangTemp[language] = tvShows.results.slice(0, 20).map(show => tmdbService.convertTVShowToContentItem(show));
              console.log(`✅ Successfully fetched ${tvShowsByLangTemp[language].length} ${language} TV shows from API`);
            } catch (error) {
              console.log(`📱 Loading curated ${language} TV shows`);
              tvShowsByLangTemp[language] = getFallbackContent(20).map(item => ({ ...item, type: 'series' }));
            }
          }
        }

        setMoviesByLanguage(moviesByLangTemp);
        setTVShowsByLanguage(tvShowsByLangTemp);

        // 3. Fetch sports content if user selected sports
        if (userPreferences.contentTypes.includes('sports')) {
          try {
            console.log('🏈 Fetching sports content...');
            const sports = await tmdbService.getSportsContent();
            const sportsFormatted = sports.results.slice(0, 20).map(movie => ({
              ...tmdbService.convertToContentItem(movie),
              isLive: Math.random() > 0.7,
              type: 'sports'
            }));
            setSportsContent(sportsFormatted);
            console.log(`✅ Successfully fetched ${sportsFormatted.length} sports items from API`);
          } catch (error) {
            console.log('📱 Loading curated sports content');
            const fallbackSports = getFallbackContent(20).map(movie => ({
              ...movie,
              isLive: Math.random() > 0.7,
              type: 'sports'
            }));
            setSportsContent(fallbackSports);
          }
        }

        // 4. Fetch general trending content
        try {
          console.log('🔥 Fetching trending movies...');
          const trending = await tmdbService.getTrendingMovies();
          const trendingFormatted = trending.results.slice(0, 20).map(movie => tmdbService.convertToContentItem(movie));
          setTrendingContent(trendingFormatted);
          console.log(`✅ Successfully fetched ${trendingFormatted.length} trending movies from API`);
        } catch (error) {
          console.log('📱 Loading curated trending content');
          const fallbackTrending = getFallbackContent(20);
          setTrendingContent(fallbackTrending);
        }

        // 5. Fetch premium content
        try {
          console.log('⭐ Fetching popular movies for premium content...');
          const popular = await tmdbService.getPopularMovies();
          const premiumFormatted = popular.results.slice(0, 20).map(movie => ({
            ...tmdbService.convertToContentItem(movie),
            isPremium: true
          }));
          setPremiumContent(premiumFormatted);
          console.log(`✅ Successfully fetched ${premiumFormatted.length} premium movies from API`);
        } catch (error) {
          console.log('📱 Loading curated premium content');
          const fallbackPremium = getFallbackContent(20).map(movie => ({
            ...movie,
            isPremium: true
          }));
          setPremiumContent(fallbackPremium);
        }

        setLoading(false);
        console.log('Content fetching completed');

        // Update API status based on content availability
        if (trendingContent.length > 0 || heroContent.length > 0) {
          setApiStatus('connected');
        } else {
          setApiStatus('fallback');
        }

      } catch (error) {
        console.error('Error fetching content:', error);
        setLoading(false);
      }
    };

    if (userPreferences.languages.length > 0 && userPreferences.contentTypes.length > 0) {
      console.log('Starting content fetch with preferences:', userPreferences);
      fetchContentByPreferences();
    } else {
      console.log('Skipping content fetch - missing preferences:', userPreferences);
    }
  }, [userPreferences]);

  // Fallback content for when API fails - using proper movie poster URLs
  const getFallbackContent = (count: number = 6) => {
    return [
      {
        id: '1',
        title: 'RRR',
        imageUrl: 'https://image.tmdb.org/t/p/w300/rCzpDGLbOoPwLjy3OAm5QVUJFSM.jpg',
        duration: '3h 7m',
        rating: 4.5,
        year: 2022,
        language: 'Telugu',
        genre: ['Action', 'Drama'],
        isPremium: false,
        xpRequired: 0,
        type: 'movie'
      },
      {
        id: '2',
        title: 'Pushpa: The Rise',
        imageUrl: 'https://image.tmdb.org/t/p/w300/dBLBDeyrGMzMtlhayZ3VrxZVcyg.jpg',
        duration: '2h 59m',
        rating: 4.2,
        year: 2021,
        language: 'Telugu',
        genre: ['Action', 'Crime'],
        isPremium: true,
        xpRequired: 1200,
        type: 'movie'
      },
      {
        id: '3',
        title: 'KGF Chapter 2',
        imageUrl: 'https://image.tmdb.org/t/p/w300/lP5eKh8WOcPysfELrUpGhHJGZEH.jpg',
        duration: '2h 48m',
        rating: 4.3,
        year: 2022,
        language: 'Kannada',
        genre: ['Action', 'Crime'],
        isPremium: true,
        xpRequired: 1000,
        type: 'movie'
      },
      {
        id: '4',
        title: 'Pathaan',
        imageUrl: 'https://image.tmdb.org/t/p/w300/kqjL17yufvn9OVLyXYpvtyrFfak.jpg',
        duration: '2h 26m',
        rating: 4.1,
        year: 2023,
        language: 'Hindi',
        genre: ['Action', 'Thriller'],
        isPremium: true,
        xpRequired: 1500,
        type: 'movie'
      },
      {
        id: '5',
        title: 'Vikram',
        imageUrl: 'https://image.tmdb.org/t/p/w300/YCLV8b2zIiOJYAd6Zl3DYfD6lS.jpg',
        duration: '2h 53m',
        rating: 4.4,
        year: 2022,
        language: 'Tamil',
        genre: ['Action', 'Thriller'],
        isPremium: false,
        xpRequired: 0,
        type: 'movie'
      },
      {
        id: '6',
        title: 'Jawan',
        imageUrl: 'https://image.tmdb.org/t/p/w300/5ScPNT6fHtfYJeWBajZciPV3hEL.jpg',
        duration: '2h 49m',
        rating: 4.2,
        year: 2023,
        language: 'Hindi',
        genre: ['Action', 'Thriller'],
        isPremium: true,
        xpRequired: 1800,
        type: 'movie'
      }
    ].slice(0, count);
  };

  // Event handlers
  const handleItemPlay = (item: any) => {
    console.log('🎬 Play item clicked:', {
      id: item.id,
      title: item.title,
      type: item.type
    });

    if (!item.id) {
      console.error('❌ No ID found for item:', item);
      return;
    }

    // Handle different ID formats
    let movieId = item.id.toString();

    // For TV shows, remove the tv_ prefix for the movie description page
    if (movieId.startsWith('tv_')) {
      movieId = movieId.replace('tv_', '');
      console.log('📺 TV show detected, using ID:', movieId);
    }

    console.log('🔗 Navigating to /movie/' + movieId);
    navigate(`/movie/${movieId}`);
  };

  const handleItemWatchlist = (item: any) => {
    console.log('Add to watchlist:', item);

    // Convert item to watchlist format and add
    const watchlistItem = watchlistService.convertToWatchlistItem(item);
    const success = watchlistService.addToWatchlist(watchlistItem);

    if (success) {
      // Add XP for engagement
      const xpAmount = xpService.XP_REWARDS.WATCHLIST_ADD;
      const newXP = xpService.addXP(xpAmount, 'Added to watchlist');
      setUserXP(newXP);
      setShowXPNotification({
        show: true,
        amount: xpAmount,
        reason: 'Added to watchlist',
        type: 'engagement'
      });
    } else {
      // Item already in watchlist
      setShowXPNotification({
        show: true,
        amount: 0,
        reason: 'Already in watchlist',
        type: 'engagement'
      });
    }
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
              <p className="text-muted-foreground">Preparing your personalized experience...</p>
              <p className="text-xs text-muted-foreground mt-2">Curating content based on your preferences</p>
              <div className="mt-4 text-xs text-muted-foreground">
                <p>Languages: {userPreferences.languages.map(lang => getLanguageDisplayName(lang)).join(', ')}</p>
                <p>Content Types: {userPreferences.contentTypes.join(', ')}</p>
              </div>
            </div>
          </div>
        )}

        {/* Ensure content is always shown - no empty states */}

        {/* Ensure minimum content is always available */}
        {!loading && trendingContent.length === 0 && heroContent.length === 0 && (
          <ContentSection
            title="Popular Movies 🎬"
            subtitle="Discover amazing content"
            items={getFallbackContent(6)}
            onItemPlay={handleItemPlay}
            onItemWatchlist={handleItemWatchlist}
            onSeeAll={() => handleSeeAll('Popular Movies')}
          />
        )}

        {/* Development Test Panel */}
        {import.meta.env.DEV && (
          <div className="px-4 py-4 border-t mt-8">
            <h3 className="text-sm font-medium mb-3">Development Tools</h3>
            <div className="space-y-2">
              <Button
                size="sm"
                variant="outline"
                onClick={async () => {
                  console.log('🧪 Testing TMDB API manually...');
                  setApiStatus('testing');
                  try {
                    const result = await tmdbService.getTrendingMovies();
                    console.log('✅ Manual test result:', result);
                    setApiStatus('connected');
                    alert(`✅ API Test SUCCESS: ${result.results.length} movies found!\n\nFirst movie: "${result.results[0]?.title}"`);
                  } catch (error: any) {
                    console.error('❌ Manual test failed:', error);
                    setApiStatus('error');
                    alert(`❌ API Test FAILED: ${error.message}\n\nCheck console for details.`);
                  }
                }}
              >
                🧪 Test TMDB API
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={async () => {
                  console.log('🔧 Running network diagnostics...');
                  const networkOK = await runNetworkDiagnostics();
                  if (networkOK) {
                    alert('✅ Network diagnostics passed!\n\nTrying to reload content...');
                    setLoading(true);
                    setUserPreferences({ ...userPreferences });
                  } else {
                    alert('❌ Network issues detected!\n\nCheck your internet connection or firewall settings.');
                  }
                }}
              >
                🔧 Network Test
              </Button>
              {isRegionallyBlocked && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    alert('🌐 Content Access Info\n\nFor the latest releases and live content:\n\n• Use a VPN service for global access\n• Try a different network connection\n• Check back later for updates\n\nCurrently showing our curated collection.');
                  }}
                >
                  🌐 Access Info
                </Button>
              )}
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  console.log('🔄 Retrying content fetch...');
                  setLoading(true);
                  // Trigger a re-fetch by updating a dependency
                  setUserPreferences({ ...userPreferences });
                }}
              >
                🔄 Retry API Calls
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  localStorage.clear();
                  window.location.reload();
                }}
              >
                🗑️ Clear Cache & Reload
              </Button>
            </div>
          </div>
        )}

        {/* API Status Debug Panel (Development Only) */}
        {import.meta.env.DEV && (
          <div className="fixed bottom-4 right-4 bg-black/80 text-white p-3 rounded-lg text-xs z-50 max-w-xs">
            <div className="flex items-center space-x-2 mb-2">
              <div className={`w-2 h-2 rounded-full ${apiStatus === 'connected' ? 'bg-green-500' :
                apiStatus === 'blocked' ? 'bg-orange-500' :
                  apiStatus === 'fallback' ? 'bg-yellow-500' :
                    apiStatus === 'testing' ? 'bg-blue-500' : 'bg-red-500'
                }`} />
              <span className="font-medium">
                {apiStatus === 'connected' ? 'API Connected' :
                  apiStatus === 'blocked' ? 'Regional Blocking' :
                    apiStatus === 'fallback' ? 'Using Fallback Data' :
                      apiStatus === 'testing' ? 'Testing API...' : 'API Error'}
              </span>
            </div>
            <div className="space-y-1 text-xs opacity-75">
              <div>Hero: {heroContent.length} items</div>
              <div>Trending: {trendingContent.length} items</div>
              <div>Languages: {Object.keys(moviesByLanguage).length}</div>
              <div>Premium: {premiumContent.length} items</div>
            </div>
            {apiStatus === 'blocked' && (
              <div className="mt-2 text-xs text-orange-300">
                Regional blocking detected. Multiple endpoints tried.
              </div>
            )}
            {apiStatus === 'fallback' && !isRegionallyBlocked && (
              <div className="mt-2 text-xs text-yellow-300">
                Network issue detected. Using offline content.
              </div>
            )}
          </div>
        )}

        {/* Only show notifications in development mode for debugging */}

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