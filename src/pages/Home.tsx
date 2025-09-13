import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, User, TrendingUp, Star, MapPin, Trophy, Crown, Zap, Heart, Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import HeroBanner from '@/components/home/HeroBanner';
import ContentSection from '@/components/home/ContentSection';
import ContinueWatchingSection from '@/components/home/ContinueWatchingSection';
import XPNotification from '@/components/gamification/XPNotification';
import WelcomeBackScreen from '@/components/gamification/WelcomeBackScreen';

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

  // Enhanced movie database with proper posters and metadata
  const movieDatabase = {
    'Pushpa: The Rise': {
      imageUrl: 'https://via.placeholder.com/300x400/1a1a2e/ffffff?text=Pushpa',
      language: 'Telugu',
      genre: 'action',
      year: 2021,
      rating: 4.2,
      isPremium: false,
      duration: '2h 59m'
    },
    'RRR': {
      imageUrl: 'https://via.placeholder.com/300x400/16213e/ffffff?text=RRR',
      language: 'Telugu',
      genre: 'action',
      year: 2022,
      rating: 4.5,
      isPremium: false,
      duration: '3h 7m'
    },
    'KGF Chapter 2': {
      imageUrl: 'https://via.placeholder.com/300x400/0f3460/ffffff?text=KGF+2',
      language: 'Kannada',
      genre: 'action',
      year: 2022,
      rating: 4.3,
      isPremium: true,
      duration: '2h 48m'
    },
    'Sooryavanshi': {
      imageUrl: 'https://via.placeholder.com/300x400/e94560/ffffff?text=Sooryavanshi',
      language: 'Hindi',
      genre: 'action',
      year: 2021,
      rating: 4.0,
      isPremium: false,
      duration: '2h 28m'
    },
    'Pathaan': {
      imageUrl: 'https://via.placeholder.com/300x400/ff6b6b/ffffff?text=Pathaan',
      language: 'Hindi',
      genre: 'action',
      year: 2023,
      rating: 4.1,
      isPremium: true,
      duration: '2h 26m'
    },
    'Jawan': {
      imageUrl: 'https://m.media-amazon.com/images/M/MV5BMzI2NzY2Nzk3M15BMl5BanBnXkFtZTgwNzI3MzQ2NDM@._V1_.jpg',
      language: 'Hindi',
      genre: 'action',
      year: 2023,
      rating: 4.2,
      isPremium: true,
      duration: '2h 49m'
    },
    'Gangubai Kathiawadi': {
      imageUrl: 'https://m.media-amazon.com/images/M/MV5BMjU3NTE4NjQ1NF5BMl5BanBnXkFtZTgwNjE4NTY2NzM@._V1_.jpg',
      language: 'Hindi',
      genre: 'drama',
      year: 2022,
      rating: 4.3,
      isPremium: false,
      duration: '2h 34m'
    },
    'Brahmastra': {
      imageUrl: 'https://m.media-amazon.com/images/M/MV5BODI1MTA0N2UtYjU2My00MjM4LWFjOGQtNzY5N2Y2N2VjMzE1XkEyXkFqcGdeQXVyMTUzNTgzNzM0._V1_.jpg',
      language: 'Hindi',
      genre: 'action',
      year: 2022,
      rating: 3.8,
      isPremium: true,
      duration: '2h 47m'
    },
    'Vikram': {
      imageUrl: 'https://via.placeholder.com/300x400/00d2d3/ffffff?text=Vikram',
      language: 'Tamil',
      genre: 'action',
      year: 2022,
      rating: 4.4,
      isPremium: false,
      duration: '2h 53m'
    },
    'Beast': {
      imageUrl: 'https://via.placeholder.com/300x400/ff9ff3/ffffff?text=Beast',
      language: 'Tamil',
      genre: 'action',
      year: 2022,
      rating: 3.9,
      isPremium: false,
      duration: '2h 38m'
    },
    'Jersey': {
      imageUrl: 'https://via.placeholder.com/300x400/54a0ff/ffffff?text=Jersey',
      language: 'Telugu',
      genre: 'drama',
      year: 2019,
      rating: 4.1,
      isPremium: false,
      duration: '2h 17m'
    },
    'Heropanti 2': {
      imageUrl: 'https://via.placeholder.com/300x400/ff6348/ffffff?text=Heropanti+2',
      language: 'Hindi',
      genre: 'action',
      year: 2022,
      rating: 3.7,
      isPremium: true,
      duration: '2h 23m'
    },
    'Runway 34': {
      imageUrl: 'https://via.placeholder.com/300x400/2f3542/ffffff?text=Runway+34',
      language: 'Hindi',
      genre: 'thriller',
      year: 2022,
      rating: 3.8,
      isPremium: false,
      duration: '2h 11m'
    },
    'Bhool Bhulaiyaa 2': {
      imageUrl: 'https://via.placeholder.com/300x400/ff7675/ffffff?text=Bhool+2',
      language: 'Hindi',
      genre: 'horror',
      year: 2022,
      rating: 3.9,
      isPremium: false,
      duration: '2h 24m'
    },
    'Jurassic World Dominion': {
      imageUrl: 'https://via.placeholder.com/300x400/70a1ff/ffffff?text=Jurassic+World',
      language: 'English',
      genre: 'action',
      year: 2022,
      rating: 4.0,
      isPremium: true,
      duration: '2h 27m'
    },
    'Baahubali: The Beginning': {
      imageUrl: 'https://via.placeholder.com/300x400/ff6b35/ffffff?text=Baahubali',
      language: 'Telugu',
      genre: 'action',
      year: 2015,
      rating: 4.6,
      isPremium: false,
      duration: '2h 39m'
    },
    'KGF Chapter 1': {
      imageUrl: 'https://via.placeholder.com/300x400/2c2c54/ffffff?text=KGF+1',
      language: 'Kannada',
      genre: 'action',
      year: 2018,
      rating: 4.4,
      isPremium: false,
      duration: '2h 35m'
    },
    'Ala Vaikunthapurramuloo': {
      imageUrl: 'https://via.placeholder.com/300x400/ff9f43/ffffff?text=Ala+Vaikunthapurramuloo',
      language: 'Telugu',
      genre: 'family',
      year: 2020,
      rating: 4.3,
      isPremium: false,
      duration: '2h 49m'
    },
    'Geetha Govindam': {
      imageUrl: 'https://via.placeholder.com/300x400/ff3838/ffffff?text=Geetha+Govindam',
      language: 'Telugu',
      genre: 'romance',
      year: 2018,
      rating: 4.2,
      isPremium: false,
      duration: '2h 24m'
    }
  };

  const getImageUrl = (title: string) => {
    return movieDatabase[title]?.imageUrl || 'https://images.unsplash.com/photo-1489599328109-2af2c85020e4?w=300&h=400&fit=crop';
  };

  // Language-specific content mapping
  const getLanguageContent = (language: string) => {
    const languageContentMap: { [key: string]: string[] } = {
      'te': ['Pushpa: The Rise', 'RRR', 'Jersey', 'Baahubali: The Beginning', 'Ala Vaikunthapurramuloo', 'Geetha Govindam'],
      'hi': ['Sooryavanshi', 'Gangubai Kathiawadi', 'Pathaan', 'Jawan', 'Heropanti 2', 'Brahmastra'],
      'ta': ['Vikram', 'Beast'],
      'kn': ['KGF Chapter 2', 'KGF Chapter 1'],
      'ml': ['Brahmastra', 'Jersey'],
      'en': ['Jurassic World Dominion', 'Runway 34']
    };
    return languageContentMap[language] || [];
  };

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

  const trendingContent = generatePersonalizedContent(6, { showViews: true });
  const sportsContent = generatePersonalizedContent(4, { isLive: Math.random() > 0.5 });
  const premiumContent = generatePersonalizedContent(6, { isPremium: true });
  const topPicksContent = generatePersonalizedContent(6, { showMatch: true });

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
          items={trendingContent}
          icon={<TrendingUp className="w-5 h-5 text-sonyliv-live" />}
          onItemPlay={handleItemPlay}
          onItemWatchlist={handleItemWatchlist}
          onSeeAll={() => handleSeeAll('Trending Now in India')}
        />

        {/* Language-specific sections - Only show languages user selected */}
        {userPreferences.languages.slice(0, 2).map((language) => {
          const languageContent = generateMockContent(6, { language });
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