import React, { useState, useEffect } from 'react';
import { Play, Clock, Star, Heart, MoreHorizontal, Check } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import watchlistService from '@/services/watchlist';

interface ContentCardProps {
  id?: string;
  title: string;
  imageUrl?: string;
  duration?: string;
  rating?: number;
  language?: string;
  isPremium?: boolean;
  isLive?: boolean;
  progress?: number;
  matchPercentage?: number;
  viewCount?: string;
  size?: 'small' | 'medium' | 'large';
  showPlayButton?: boolean;
  onPlay?: () => void;
  onAddToWatchlist?: () => void;
}

const ContentCard: React.FC<ContentCardProps> = ({
  id,
  title,
  imageUrl,
  duration,
  rating,
  language,
  isPremium,
  isLive,
  progress,
  matchPercentage,
  viewCount,
  size = 'medium',
  showPlayButton = true,
  onPlay,
  onAddToWatchlist
}) => {
  const [isInWatchlist, setIsInWatchlist] = useState(false);

  // Check if item is in watchlist
  useEffect(() => {
    if (id) {
      setIsInWatchlist(watchlistService.isInWatchlist(id));
    }
  }, [id]);

  const handleWatchlistClick = () => {
    if (onAddToWatchlist) {
      onAddToWatchlist();
      // Update local state
      if (id) {
        setIsInWatchlist(watchlistService.isInWatchlist(id));
      }
    }
  };
  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'w-[110px] h-[160px]';
      case 'large':
        return 'w-[140px] h-[200px]';
      default:
        return 'w-[120px] h-[180px]';
    }
  };

  return (
    <Card 
      className={`${getSizeClasses()} relative overflow-hidden group cursor-pointer hover:scale-105 transition-transform duration-200`}
      onClick={() => onPlay?.()}
    >
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"
        style={{
          backgroundImage: imageUrl ? `url(${imageUrl})` : 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--sonyliv-secondary)) 100%)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        {!imageUrl && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-white/50 text-4xl font-bold">
              {title.charAt(0)}
            </div>
          </div>
        )}
      </div>

      {/* Premium Badge */}
      {isPremium && (
        <div className="absolute top-2 left-2 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black text-xs px-2 py-1 rounded-full flex items-center border-2 border-yellow-300">
          <Star className="w-3 h-3 mr-1 fill-current" />
          Premium
        </div>
      )}

      {/* Live Badge */}
      {isLive && (
        <div className="absolute top-2 left-2 bg-sonyliv-live text-white text-xs px-2 py-1 rounded-full flex items-center">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse mr-1" />
          LIVE
        </div>
      )}

      {/* Language Badge */}
      {language && (
        <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
          {language}
        </div>
      )}

      {/* Play Button Overlay */}
      {showPlayButton && (
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <Button
            size="icon"
            className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-white/30"
            onClick={(e) => {
              e.stopPropagation();
              onPlay?.();
            }}
          >
            <Play className="w-6 h-6" />
          </Button>
        </div>
      )}

      {/* Progress Bar */}
      {progress !== undefined && progress > 0 && (
        <div className="absolute bottom-12 left-0 right-0 h-1 bg-white/30">
          <div 
            className="h-full bg-sonyliv-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Content Info */}
      <div className="absolute bottom-0 left-0 right-0 p-3">
        <h3 className="text-white font-medium text-sm mb-1 line-clamp-2 leading-tight">
          {title}
        </h3>
        
        <div className="flex items-center justify-between text-white/80 text-xs">
          <div className="flex items-center space-x-2">
            {duration && (
              <div className="flex items-center">
                <Clock className="w-3 h-3 mr-1" />
                {duration}
              </div>
            )}
            {rating && (
              <div className="flex items-center">
                <Star className="w-3 h-3 mr-1 fill-current text-yellow-400" />
                {rating}
              </div>
            )}
          </div>
          
          {onAddToWatchlist && (
            <Button
              size="icon"
              variant="ghost"
              className={`h-6 w-6 hover:bg-white/20 ${
                isInWatchlist 
                  ? 'text-red-500 hover:text-red-400' 
                  : 'text-white/80 hover:text-white'
              }`}
              onClick={(e) => {
                e.stopPropagation();
                handleWatchlistClick();
              }}
            >
              {isInWatchlist ? (
                <Heart className="w-3 h-3 fill-current" />
              ) : (
                <Heart className="w-3 h-3" />
              )}
            </Button>
          )}
        </div>

        {/* Match Percentage */}
        {matchPercentage && (
          <div className="mt-1 text-sonyliv-success text-xs font-medium">
            {matchPercentage}% Match
          </div>
        )}

        {/* View Count */}
        {viewCount && (
          <div className="mt-1 text-white/60 text-xs">
            {viewCount} watching
          </div>
        )}
      </div>
    </Card>
  );
};

export default ContentCard;