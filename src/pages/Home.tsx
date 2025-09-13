import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, User, TrendingUp, Star, MapPin, Trophy, Crown, Zap, Heart, Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import HeroBanner from '@/components/home/HeroBanner';
import ContentSection from '@/components/home/ContentSection';
import ContinueWatchingSection from '@/components/home/ContinueWatchingSection';
import XPNotification from '@/components/gamification/XPNotification';
import WelcomeBackScreen from '@/components/gamification/WelcomeBackScreen';
import { useMovieData } from '@/hooks/useMovieData';

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
  
  // Use the movie data hook
  const {
    popularMovies,
    popularTVShows,
    trendingContent,
    genreContent,
    isLoading: isMovieDataLoading,
    isError: isMovieDataError
  } = useMovieData(userPreferences);
  
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

  // Loading state for movie data
  if (isMovieDataLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your personalized content...</p>
        </div>
      </div>
    );
  }

  // Error state for movie data
  if (isMovieDataError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">Failed to load content</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  // Get language display name
  const getLanguageDisplayName = (languageCode: string) => {
    const languageNames: { [key: string]: string } = {
      'te': 'Telugu',
      'hi': 'Hindi', 
      'ta': 'Tamil',
      'kn': 'Kannada',
      'ml': 'Malayalam',
      'en': 'English'
    };
    return languageNames[languageCode] || languageCode;
  };

  const generateMockContent = (count: number, options: any = {}) => {
    let titles: string[];
    
    if (options.language) {
      // Get language-specific content
      titles = getLanguageContent(options.language);
      if (titles.length === 0) {
        titles = ['Pushpa: The Rise', 'RRR', 'KGF Chapter 2'];
      }
    } else {
      // General content pool
      titles = [
        'Pushpa: The Rise', 'RRR', 'KGF Chapter 2', 'Sooryavanshi', 'Pathaan',
        'Jawan', 'Gangubai Kathiawadi', 'Brahmastra', 'Vikram', 'Beast',
        'Jersey', 'Heropanti 2', 'Runway 34', 'Bhool Bhulaiyaa 2', 'Jurassic World Dominion'
      ];
    }

    return Array.from({ length: Math.min(count, titles.length) }, (_, i) => {
      const title = titles[i % titles.length];
      const movieData = movieDatabase[title];
      return {
        id: `${options.language || 'general'}-${i}`,
        title,
        imageUrl: movieData?.imageUrl || getImageUrl(title),
        duration: options.isLive ? 'LIVE' : movieData?.duration || '2h 30m',
        rating: movieData?.rating || Math.round((4.2 + (Math.random() * 0.8)) * 10) / 10,
        language: options.language || movieData?.language || undefined,
        isPremium: options.isPremium !== undefined ? options.isPremium : movieData?.isPremium || Math.random() > 0.7,
        isLive: options.isLive || false,
        matchPercentage: options.showMatch ? Math.floor(85 + Math.random() * 15) : undefined,
        viewCount: options.showViews ? `${Math.floor(1 + Math.random() * 5)}k` : undefined,
        year: movieData?.year || 2022,
        genre: movieData?.genre || 'action'
      };
    });
  };

  // Filter content based on user preferences
  const filterContentByPreferences = (content: any[], preferences: any) => {
    return content.filter(item => {
      // Filter by language preferences
      if (preferences.languages.length > 0) {
        const languageMatch = preferences.languages.some((lang: string) => 
          item.language === lang || 
          (lang === 'te' && item.language === 'Telugu') ||
          (lang === 'hi' && item.language === 'Hindi') ||
          (lang === 'ta' && item.language === 'Tamil') ||
          (lang === 'ml' && item.language === 'Malayalam') ||
          (lang === 'kn' && item.language === 'Kannada') ||
          (lang === 'en' && item.language === 'English')
        );
        if (!languageMatch) return false;
      }

      // Filter by genre preferences
      if (preferences.genres.length > 0) {
        const genreMatch = preferences.genres.some((genre: string) => 
          item.genre === genre
        );
        if (!genreMatch) return false;
      }

      return true;
    });
  };

  // Generate personalized content based on user preferences
  const generatePersonalizedContent = (count: number, options: any = {}) => {
    const allContent = generateMockContent(20, options);
    const filteredContent = filterContentByPreferences(allContent, userPreferences);
    
    // If filtered content is less than requested, add some diverse content
    if (filteredContent.length < count) {
      const diverseContent = generateMockContent(count - filteredContent.length, { 
        ...options, 
        diverse: true 
      });
      return [...filteredContent, ...diverseContent].slice(0, count);
    }
    
    return filteredContent.slice(0, count);
  };

  // Use real movie data for content sections
  const trendingContentData = trendingContent.slice(0, 6);
  const sportsContent = popularMovies.filter(movie => movie.genre?.includes(16)).slice(0, 4); // Sports genre
  const premiumContent = popularMovies.filter(movie => movie.isPremium).slice(0, 6);
  const topPicksContent = popularMovies.slice(0, 6);

  const handleItemPlay = (item: any) => {
    console.log('Play item:', item);
    
    // Navigate to movie description page
    navigate(`/movie/${item.id}`);
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
    // Navigate to full list page or show more content
    // For now, just log the action
  };

  const handleContinueWatching = (item: any) => {
    console.log('Continue watching:', item);
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
                onClick={() => navigate('/mylist')}
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
          <HeroBanner userPreferences={userPreferences} />
        </div>

        {/* Continue Watching Section - Only show if user has watched content */}
        {continueWatchingItems.length > 0 && (
          <ContinueWatchingSection
            items={continueWatchingItems}
            onResume={handleContinueWatching}
            onRemove={handleRemoveContinueWatching}
          />
        )}

        {/* Top Picks for You - Personalized */}
        <ContentSection
          title="Top Picks for You"
          subtitle="Based on your preferences"
          items={topPicksContent}
          icon={<Zap className="w-5 h-5 text-sonyliv-primary" />}
          cardSize="medium"
          onItemPlay={handleItemPlay}
          onItemWatchlist={handleItemWatchlist}
          onSeeAll={() => handleSeeAll('Top Picks for You')}
        />

        {/* Most Watched Near You - Location-based */}
        {userPreferences.allowLocation && (
          <ContentSection
            title="Most Watched Near You"
            subtitle="Trending in your area"
            items={generateMockContent(6, { showViews: true })}
            icon={<MapPin className="w-5 h-5 text-sonyliv-success" />}
            onItemPlay={handleItemPlay}
            onItemWatchlist={handleItemWatchlist}
            onSeeAll={() => handleSeeAll('Most Watched Near You')}
          />
        )}

        {/* Trending Now in India - Universal */}
        <ContentSection
          title="Trending Now in India 🔥"
          items={trendingContentData}
          icon={<TrendingUp className="w-5 h-5 text-sonyliv-live" />}
          onItemPlay={handleItemPlay}
          onItemWatchlist={handleItemWatchlist}
          onSeeAll={() => handleSeeAll('Trending Now in India')}
        />

        {/* Language-specific sections - Only show languages user selected */}
        {userPreferences.languages.slice(0, 2).map((language) => {
          const languageContent = popularMovies.filter(movie => movie.language === language).slice(0, 6);
          return languageContent.length > 0 ? (
            <ContentSection
              key={language}
              title={`Trending in ${getLanguageDisplayName(language)}`}
              items={languageContent}
              onItemPlay={handleItemPlay}
              onItemWatchlist={handleItemWatchlist}
              onSeeAll={() => handleSeeAll(`Trending in ${getLanguageDisplayName(language)}`)}
            />
          ) : null;
        })}

        {/* Sports Highlights - Universal Business Priority */}
        <ContentSection
          title="Sports Highlights ⚽"
          items={sportsContent}
          icon={<Trophy className="w-5 h-5 text-sonyliv-secondary" />}
          onItemPlay={handleItemPlay}
          onItemWatchlist={handleItemWatchlist}
          onSeeAll={() => handleSeeAll('Sports Highlights')}
        />

        {/* Premium Content - Universal Monetization */}
        <ContentSection
          title="Premium Movies & Shows ⭐"
          subtitle="Upgrade to Premium for exclusive content"
          items={premiumContent}
          icon={<Crown className="w-5 h-5 text-sonyliv-premium" />}
          onItemPlay={handleItemPlay}
          onItemWatchlist={handleItemWatchlist}
          onSeeAll={() => handleSeeAll('Premium Movies & Shows')}
        />

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