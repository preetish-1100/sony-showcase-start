import React, { useState } from 'react';
import { Search, User, TrendingUp, Star, MapPin, Trophy, Crown, Zap } from 'lucide-react';
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
}

const Home: React.FC<HomeProps> = ({ userPreferences, onNavigateToProfile }) => {
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

  // Mock movie posters - using placeholder images that represent different content types
  const getImageUrl = (title: string, language?: string) => {
    const imageMap: { [key: string]: string } = {
      'Pushpa: The Rise': 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=300&h=400&fit=crop&crop=face',
      'RRR': 'https://images.unsplash.com/photo-1509347528160-9329d33b280f?w=300&h=400&fit=crop',
      'KGF Chapter 2': 'https://images.unsplash.com/photo-1518604666860-f6c8c9199b44?w=300&h=400&fit=crop',
      'Sooryavanshi': 'https://images.unsplash.com/photo-1489599328109-2af2c85020e4?w=300&h=400&fit=crop',
      'Spider-Man: No Way Home': 'https://images.unsplash.com/photo-1635863138275-d9864d29c6ed?w=300&h=400&fit=crop',
      'The Batman': 'https://images.unsplash.com/photo-1509347528160-9329d33b280f?w=300&h=400&fit=crop',
      'Gangubai Kathiawadi': 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=300&h=400&fit=crop',
      'Brahmastra': 'https://images.unsplash.com/photo-1518604666860-f6c8c9199b44?w=300&h=400&fit=crop',
      'Vikram': 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=300&h=400&fit=crop',
      'Beast': 'https://images.unsplash.com/photo-1489599328109-2af2c85020e4?w=300&h=400&fit=crop',
      'Jersey': 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=300&h=400&fit=crop',
      'Heropanti 2': 'https://images.unsplash.com/photo-1635863138275-d9864d29c6ed?w=300&h=400&fit=crop',
      'Runway 34': 'https://images.unsplash.com/photo-1518604666860-f6c8c9199b44?w=300&h=400&fit=crop',
      'Bhool Bhulaiyaa 2': 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=300&h=400&fit=crop',
      'Jurassic World Dominion': 'https://images.unsplash.com/photo-1509347528160-9329d33b280f?w=300&h=400&fit=crop'
    };
    return imageMap[title] || 'https://images.unsplash.com/photo-1489599328109-2af2c85020e4?w=300&h=400&fit=crop';
  };

  // Language-specific content mapping
  const getLanguageContent = (language: string) => {
    const languageContentMap: { [key: string]: string[] } = {
      'Telugu': ['Pushpa: The Rise', 'RRR', 'Brahmastra', 'Vikram', 'Beast'],
      'Hindi': ['Sooryavanshi', 'Gangubai Kathiawadi', 'Jersey', 'Heropanti 2', 'Bhool Bhulaiyaa 2'],
      'Tamil': ['Vikram', 'Beast', 'KGF Chapter 2', 'RRR', 'Pushpa: The Rise'],
      'Malayalam': ['Brahmastra', 'Jersey', 'The Batman', 'Vikram', 'Beast'],
      'Kannada': ['KGF Chapter 2', 'Pushpa: The Rise', 'RRR', 'Brahmastra', 'Vikram'],
      'English': ['Spider-Man: No Way Home', 'The Batman', 'Jurassic World Dominion', 'Runway 34', 'Sooryavanshi']
    };
    return languageContentMap[language] || [];
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
        'Pushpa: The Rise', 'RRR', 'KGF Chapter 2', 'Sooryavanshi', 'Spider-Man: No Way Home',
        'The Batman', 'Gangubai Kathiawadi', 'Brahmastra', 'Vikram', 'Beast',
        'Jersey', 'Heropanti 2', 'Runway 34', 'Bhool Bhulaiyaa 2', 'Jurassic World Dominion'
      ];
    }

    return Array.from({ length: Math.min(count, titles.length) }, (_, i) => {
      const title = titles[i % titles.length];
      return {
        id: `${options.language || 'general'}-${i}`,
        title,
        imageUrl: getImageUrl(title, options.language),
        duration: options.isLive ? 'LIVE' : '2h 30m',
        rating: Math.round((4.2 + (Math.random() * 0.8)) * 10) / 10,
        language: options.language || undefined,
        isPremium: options.isPremium || Math.random() > 0.7,
        isLive: options.isLive || false,
        matchPercentage: options.showMatch ? Math.floor(85 + Math.random() * 15) : undefined,
        viewCount: options.showViews ? `${Math.floor(1 + Math.random() * 5)}k` : undefined
      };
    });
  };

  const trendingContent = generateMockContent(6, { showViews: true });
  const sportsContent = generateMockContent(4, { isLive: Math.random() > 0.5 });
  const premiumContent = generateMockContent(6, { isPremium: true });
  const topPicksContent = generateMockContent(6, { showMatch: true });

  const handleItemPlay = (item: any) => {
    console.log('Play item:', item);
    
    // Add XP for content completion
    const xpAmount = item.isPremium ? 25 : 20;
    setUserXP(prev => prev + xpAmount);
    setShowXPNotification({
      show: true,
      amount: xpAmount,
      reason: `Completed '${item.title}'`,
      type: 'content_completion'
    });
    
    // Add to continue watching when user starts watching
    if (!currentlyWatching.has(item.id)) {
      const newWatchItem = {
        id: item.id,
        title: item.title,
        episode: item.language ? `${item.language} Movie` : 'Movie',
        progress: 0,
        timeRemaining: item.duration,
        lastWatched: 'Just now'
      };
      setContinueWatchingItems(prev => [newWatchItem, ...prev.slice(0, 4)]); // Keep max 5 items
      setCurrentlyWatching(prev => new Set([...prev, item.id]));
    }
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

  const handleSeeAll = (sectionTitle: string) => {
    console.log('See all for:', sectionTitle);
    // In a real app, this would navigate to a dedicated page with all content
    alert(`Navigate to ${sectionTitle} page - Coming Soon!`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation Bar */}
      <header className="bg-background shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <img 
                src="/placeholder.svg" 
                alt="SonyLIV" 
                className="h-8 w-auto"
                style={{ filter: 'hue-rotate(220deg) saturate(1.5)' }}
              />
            </div>
            <div className="flex items-center space-x-3">
              <Button size="icon" variant="ghost" className="text-muted-foreground">
                <Search className="w-5 h-5" />
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
          <HeroBanner />
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
              title={`In ${language}`}
              items={languageContent}
              onItemPlay={handleItemPlay}
              onItemWatchlist={handleItemWatchlist}
              onSeeAll={() => handleSeeAll(`In ${language}`)}
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