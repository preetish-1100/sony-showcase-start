import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Info, Star, Clock } from 'lucide-react';

interface BannerItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  type: 'movie' | 'series' | 'sports' | 'live';
  cta: string;
  rating: number;
  year: number;
  duration: string;
  language: string;
  isPremium: boolean;
}

interface HeroBannerProps {
  userPreferences?: {
    languages?: string[];
    genres?: string[];
    contentTypes?: string[];
  };
  movies?: any[];
}

const HeroBanner: React.FC<HeroBannerProps> = ({ userPreferences, movies = [] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Enhanced banner items with proper movie posters
  const bannerItems: BannerItem[] = [
    {
      id: '1',
      title: 'RRR',
      description: 'A fictional story about two legendary revolutionaries and their journey away from home before they started fighting for their country in 1920s.',
      imageUrl: 'https://via.placeholder.com/800x600/16213e/ffffff?text=RRR',
      type: 'movie',
      cta: 'Watch Now',
      rating: 4.5,
      year: 2022,
      duration: '3h 7m',
      language: 'Telugu',
      isPremium: false
    },
    {
      id: '2',
      title: 'Pushpa: The Rise',
      description: 'A laborer rises through the ranks of a sandalwood smuggling syndicate, making some powerful enemies in the process.',
      imageUrl: 'https://via.placeholder.com/800x600/1a1a2e/ffffff?text=Pushpa',
      type: 'movie',
      cta: 'Watch Now',
      rating: 4.2,
      year: 2021,
      duration: '2h 59m',
      language: 'Telugu',
      isPremium: false
    },
    {
      id: '3',
      title: 'KGF Chapter 2',
      description: 'Rocky, a young man, seeks power and wealth in order to fulfill a promise to his dying mother.',
      imageUrl: 'https://via.placeholder.com/800x600/0f3460/ffffff?text=KGF+2',
      type: 'movie',
      cta: 'Watch Premium',
      rating: 4.3,
      year: 2022,
      duration: '2h 48m',
      language: 'Kannada',
      isPremium: true
    },
    {
      id: '4',
      title: 'Pathaan',
      description: 'An Indian spy takes on the leader of a group of mercenaries who have nefarious plans to target India.',
      imageUrl: 'https://via.placeholder.com/800x600/ff6b6b/ffffff?text=Pathaan',
      type: 'movie',
      cta: 'Watch Premium',
      rating: 4.1,
      year: 2023,
      duration: '2h 26m',
      language: 'Hindi',
      isPremium: true
    },
    {
      id: '5',
      title: 'Live Cricket: India vs Australia',
      description: 'Don\'t miss the thrilling match live from Melbourne Cricket Ground',
      imageUrl: 'https://via.placeholder.com/800x600/ff9ff3/ffffff?text=Live+Cricket',
      type: 'live',
      cta: 'Watch Live',
      rating: 4.8,
      year: 2024,
      duration: 'LIVE',
      language: 'English',
      isPremium: false
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % bannerItems.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [bannerItems.length]);

  const currentItem = bannerItems[currentIndex];

  const getGradientForType = (type: string) => {
    switch (type) {
      case 'live':
        return 'linear-gradient(135deg, hsl(var(--sonyliv-live)) 0%, hsl(var(--sonyliv-primary)) 100%)';
      case 'movie':
        return 'linear-gradient(135deg, hsl(var(--sonyliv-premium)) 0%, hsl(var(--sonyliv-secondary)) 100%)';
      default:
        return 'linear-gradient(135deg, hsl(var(--sonyliv-primary)) 0%, hsl(var(--sonyliv-secondary)) 100%)';
    }
  };

  return (
    <div className="mb-6">
      <Card className="relative h-[240px] overflow-hidden">
        {/* Background */}
        <div 
          className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent"
          style={{
            backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.9), rgba(0,0,0,0.5), rgba(0,0,0,0.1)), url(${currentItem.imageUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />

        {/* Content */}
        <div className="relative h-full flex items-center p-6">
          <div className="max-w-md">
            {/* Type Badge */}
            <div className="mb-3">
              {currentItem.type === 'live' && (
                <span className="bg-red-600 text-white text-xs px-3 py-1 rounded-full font-medium animate-pulse">
                  🔴 LIVE
                </span>
              )}
              {currentItem.type === 'movie' && currentItem.isPremium && (
                <span className="bg-yellow-600 text-white text-xs px-3 py-1 rounded-full font-medium">
                  ⭐ PREMIUM
                </span>
              )}
              {currentItem.type === 'movie' && !currentItem.isPremium && (
                <span className="bg-green-600 text-white text-xs px-3 py-1 rounded-full font-medium">
                  🎬 FREE
                </span>
              )}
              {currentItem.type === 'series' && (
                <span className="bg-blue-600 text-white text-xs px-3 py-1 rounded-full font-medium">
                  📺 NEW SEASON
                </span>
              )}
            </div>

            <h1 className="text-white text-2xl font-bold mb-2 leading-tight">
              {currentItem.title}
            </h1>
            
            <p className="text-white/90 text-sm mb-4 leading-relaxed line-clamp-2">
              {currentItem.description}
            </p>

            {/* Movie Details */}
            <div className="flex items-center space-x-4 mb-4 text-white/80 text-xs">
              <div className="flex items-center space-x-1">
                <Star className="w-3 h-3 fill-current text-yellow-400" />
                <span>{currentItem.rating}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="w-3 h-3" />
                <span>{currentItem.duration}</span>
              </div>
              <span>{currentItem.year}</span>
              <span className="bg-white/20 px-2 py-1 rounded text-xs">{currentItem.language}</span>
            </div>

            <div className="flex items-center space-x-3">
              <Button className="bg-white text-black hover:bg-white/90 font-medium">
                <Play className="w-4 h-4 mr-2" />
                {currentItem.cta}
              </Button>
              <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">
                <Info className="w-4 h-4 mr-2" />
                More Info
              </Button>
            </div>
          </div>
        </div>

        {/* Pagination Dots */}
        <div className="absolute bottom-4 right-6 flex space-x-2">
          {bannerItems.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentIndex 
                  ? 'bg-white scale-125' 
                  : 'bg-white/50 hover:bg-white/70'
              }`}
              onClick={() => setCurrentIndex(index)}
            />
          ))}
        </div>
      </Card>
    </div>
  );
};

export default HeroBanner;