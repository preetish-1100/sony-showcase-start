import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Info } from 'lucide-react';

interface BannerItem {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  type: 'movie' | 'series' | 'sports' | 'live';
  cta: string;
}

const HeroBanner: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const bannerItems: BannerItem[] = [
    {
      id: '1',
      title: 'Rocket Boys Season 2',
      description: 'The untold story of Dr. Homi Bhabha and Dr. Vikram Sarabhai',
      type: 'series',
      cta: 'Watch Now'
    },
    {
      id: '2',
      title: 'Live Cricket: India vs Australia',
      description: 'Don\'t miss the thrilling match live',
      type: 'live',
      cta: 'Watch Live'
    },
    {
      id: '3',
      title: 'Pushpa 2: The Rise',
      description: 'The most awaited sequel of the year',
      type: 'movie',
      cta: 'Watch Premium'
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
      <Card className="relative h-[200px] overflow-hidden">
        {/* Background */}
        <div 
          className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent"
          style={{
            background: currentItem.imageUrl 
              ? `linear-gradient(to right, rgba(0,0,0,0.8), rgba(0,0,0,0.4)), url(${currentItem.imageUrl})`
              : getGradientForType(currentItem.type),
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />

        {/* Content */}
        <div className="relative h-full flex items-center p-6">
          <div className="max-w-md">
            {/* Type Badge */}
            <div className="mb-2">
              {currentItem.type === 'live' && (
                <span className="bg-sonyliv-live text-white text-xs px-3 py-1 rounded-full font-medium">
                  🔴 LIVE
                </span>
              )}
              {currentItem.type === 'movie' && (
                <span className="bg-sonyliv-premium text-white text-xs px-3 py-1 rounded-full font-medium">
                  ⭐ PREMIUM
                </span>
              )}
              {currentItem.type === 'series' && (
                <span className="bg-sonyliv-secondary text-white text-xs px-3 py-1 rounded-full font-medium">
                  📺 NEW SEASON
                </span>
              )}
            </div>

            <h1 className="text-white text-2xl font-bold mb-2 leading-tight">
              {currentItem.title}
            </h1>
            
            <p className="text-white/90 text-sm mb-4 leading-relaxed">
              {currentItem.description}
            </p>

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