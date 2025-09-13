import React, { useState } from 'react';
import { Search, User, TrendingUp, Star, MapPin, Trophy, Crown, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import HeroBanner from '@/components/home/HeroBanner';
import ContentSection from '@/components/home/ContentSection';
import ContinueWatchingSection from '@/components/home/ContinueWatchingSection';

interface HomeProps {
  userPreferences: {
    phoneNumber?: string;
    languages: string[];
    genres: string[];
    contentTypes: string[];
    allowLocation: boolean;
  };
}

const Home: React.FC<HomeProps> = ({ userPreferences }) => {
  // Mock data - in real app this would come from API
  const [continueWatchingItems] = useState([
    {
      id: '1',
      title: 'Scam 1992',
      episode: 'Episode 5: The Rise',
      progress: 65,
      timeRemaining: '25 min',
      lastWatched: '2 hours ago'
    },
    {
      id: '2', 
      title: 'The Family Man',
      episode: 'Season 2, Episode 3',
      progress: 30,
      timeRemaining: '40 min',
      lastWatched: 'Yesterday'
    }
  ]);

  const generateMockContent = (count: number, options: any = {}) => {
    const titles = [
      'Pushpa: The Rise', 'RRR', 'KGF Chapter 2', 'Sooryavanshi', 'Spider-Man: No Way Home',
      'The Batman', 'Gangubai Kathiawadi', 'Brahmastra', 'Vikram', 'Beast',
      'Jersey', 'Heropanti 2', 'Runway 34', 'Bhool Bhulaiyaa 2', 'Jurassic World Dominion'
    ];

    return Array.from({ length: count }, (_, i) => ({
      id: `mock-${i}`,
      title: titles[i % titles.length],
      duration: '2h 30m',
      rating: 4.2 + (Math.random() * 0.8),
      language: options.language || undefined,
      isPremium: options.isPremium || Math.random() > 0.7,
      isLive: options.isLive || false,
      matchPercentage: options.showMatch ? Math.floor(85 + Math.random() * 15) : undefined,
      viewCount: options.showViews ? `${Math.floor(1 + Math.random() * 5)}k` : undefined
    }));
  };

  const trendingContent = generateMockContent(8, { showViews: true });
  const sportsContent = generateMockContent(6, { isLive: Math.random() > 0.5 });
  const premiumContent = generateMockContent(8, { isPremium: true });
  const topPicksContent = generateMockContent(8, { showMatch: true });

  const handleItemPlay = (item: any) => {
    console.log('Play item:', item);
  };

  const handleItemWatchlist = (item: any) => {
    console.log('Add to watchlist:', item);
  };

  const handleContinueWatching = (item: any) => {
    console.log('Continue watching:', item);
  };

  const handleRemoveContinueWatching = (item: any) => {
    console.log('Remove from continue watching:', item);
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
              <Button size="icon" variant="ghost" className="text-muted-foreground">
                <div className="w-8 h-8 bg-sonyliv-primary/20 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-sonyliv-primary" />
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

        {/* Continue Watching Section */}
        <ContinueWatchingSection
          items={continueWatchingItems}
          onResume={handleContinueWatching}
          onRemove={handleRemoveContinueWatching}
        />

        {/* Top Picks for You - Personalized */}
        <ContentSection
          title="Top Picks for You"
          subtitle="Based on your preferences"
          items={topPicksContent}
          icon={<Zap className="w-5 h-5 text-sonyliv-primary" />}
          cardSize="large"
          onItemPlay={handleItemPlay}
          onItemWatchlist={handleItemWatchlist}
        />

        {/* Most Watched Near You - Location-based */}
        {userPreferences.allowLocation && (
          <ContentSection
            title="Most Watched Near You"
            subtitle="Trending in your area"
            items={generateMockContent(8, { showViews: true })}
            icon={<MapPin className="w-5 h-5 text-sonyliv-success" />}
            onItemPlay={handleItemPlay}
            onItemWatchlist={handleItemWatchlist}
          />
        )}

        {/* Trending Now in India - Universal */}
        <ContentSection
          title="Trending Now in India 🔥"
          items={trendingContent}
          icon={<TrendingUp className="w-5 h-5 text-sonyliv-live" />}
          onItemPlay={handleItemPlay}
          onItemWatchlist={handleItemWatchlist}
        />

        {/* Language-specific sections */}
        {userPreferences.languages.map((language) => (
          <ContentSection
            key={language}
            title={`In ${language}`}
            items={generateMockContent(8, { language })}
            onItemPlay={handleItemPlay}
            onItemWatchlist={handleItemWatchlist}
          />
        ))}

        {/* Sports Highlights - Universal Business Priority */}
        <ContentSection
          title="Sports Highlights ⚽"
          items={sportsContent}
          icon={<Trophy className="w-5 h-5 text-sonyliv-secondary" />}
          onItemPlay={handleItemPlay}
          onItemWatchlist={handleItemWatchlist}
        />

        {/* Premium Content - Universal Monetization */}
        <ContentSection
          title="Premium Movies & Shows ⭐"
          subtitle="Upgrade to Premium for exclusive content"
          items={premiumContent}
          icon={<Crown className="w-5 h-5 text-sonyliv-premium" />}
          onItemPlay={handleItemPlay}
          onItemWatchlist={handleItemWatchlist}
        />

        {/* Bottom Spacing */}
        <div className="h-8" />
      </div>
    </div>
  );
};

export default Home;