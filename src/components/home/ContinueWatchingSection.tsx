import React from 'react';
import { Clock, X } from 'lucide-react';
import SectionHeader from './SectionHeader';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ContinueWatchingItem {
  id: string;
  title: string;
  episode?: string;
  imageUrl?: string;
  progress: number;
  timeRemaining: string;
  lastWatched: string;
}

interface ContinueWatchingSectionProps {
  items: ContinueWatchingItem[];
  onResume?: (item: ContinueWatchingItem) => void;
  onRemove?: (item: ContinueWatchingItem) => void;
}

const ContinueWatchingSection: React.FC<ContinueWatchingSectionProps> = ({
  items,
  onResume,
  onRemove
}) => {
  if (items.length === 0) return null;

  return (
    <section className="mb-8">
      <div className="px-4">
        <SectionHeader
          title="Continue Watching"
          icon={<Clock className="w-5 h-5 text-sonyliv-primary" />}
          showSeeAll={false}
        />
      </div>

      <ScrollArea className="w-full">
        <div className="flex space-x-3 px-4 pb-2">
          {items.map((item) => (
            <Card 
              key={item.id} 
              className="w-[280px] h-[120px] relative overflow-hidden group cursor-pointer hover:scale-105 transition-transform duration-200"
              onClick={() => onResume?.(item)}
            >
              {/* Background Image */}
              <div 
                className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent"
                style={{
                  backgroundImage: item.imageUrl 
                    ? `url(${item.imageUrl})` 
                    : 'linear-gradient(135deg, hsl(var(--sonyliv-primary)) 0%, hsl(var(--sonyliv-secondary)) 100%)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                {!item.imageUrl && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-white/50 text-2xl font-bold">
                      {item.title.charAt(0)}
                    </div>
                  </div>
                )}
              </div>

              {/* Remove Button */}
              <Button
                size="icon"
                variant="ghost"
                className="absolute top-2 right-2 h-6 w-6 text-white/80 hover:text-white hover:bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove?.(item);
                }}
              >
                <X className="w-4 h-4" />
              </Button>

              {/* Progress Bar */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/30">
                <div 
                  className="h-full bg-sonyliv-primary transition-all duration-300"
                  style={{ width: `${item.progress}%` }}
                />
              </div>

              {/* Content Info */}
              <div className="absolute bottom-4 left-4 right-4">
                <h3 className="text-white font-medium text-sm mb-1 line-clamp-1">
                  {item.title}
                </h3>
                
                {item.episode && (
                  <p className="text-white/80 text-xs mb-2">
                    {item.episode}
                  </p>
                )}

                <div className="flex items-center justify-between text-white/80 text-xs">
                  <span>{item.timeRemaining} left</span>
                  <span>{item.lastWatched}</span>
                </div>
              </div>

              {/* Resume Button Overlay */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <Button
                  size="sm"
                  className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-white/30"
                >
                  Resume
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </section>
  );
};

export default ContinueWatchingSection;