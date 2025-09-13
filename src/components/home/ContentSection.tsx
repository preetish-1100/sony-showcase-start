import React from 'react';
import SectionHeader from './SectionHeader';
import ContentCard from './ContentCard';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ContentItem {
  id: string;
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
}

interface ContentSectionProps {
  title: string;
  subtitle?: string;
  items: ContentItem[];
  showSeeAll?: boolean;
  cardSize?: 'small' | 'medium' | 'large';
  icon?: React.ReactNode;
  onSeeAll?: () => void;
  onItemPlay?: (item: ContentItem) => void;
  onItemWatchlist?: (item: ContentItem) => void;
}

const ContentSection: React.FC<ContentSectionProps> = ({
  title,
  subtitle,
  items,
  showSeeAll = true,
  cardSize = 'medium',
  icon,
  onSeeAll,
  onItemPlay,
  onItemWatchlist
}) => {
  if (items.length === 0) return null;

  return (
    <section className="mb-8">
      <div className="px-4">
        <SectionHeader
          title={title}
          subtitle={subtitle}
          showSeeAll={showSeeAll}
          onSeeAll={onSeeAll}
          icon={icon}
        />
      </div>

      <ScrollArea className="w-full">
        <div className="flex space-x-3 px-4 pb-2">
          {items.map((item) => (
            <ContentCard
              key={item.id}
              title={item.title}
              imageUrl={item.imageUrl}
              duration={item.duration}
              rating={item.rating}
              language={item.language}
              isPremium={item.isPremium}
              isLive={item.isLive}
              progress={item.progress}
              matchPercentage={item.matchPercentage}
              viewCount={item.viewCount}
              size={cardSize}
              onPlay={() => onItemPlay?.(item)}
              onAddToWatchlist={() => onItemWatchlist?.(item)}
            />
          ))}
        </div>
      </ScrollArea>
    </section>
  );
};

export default ContentSection;