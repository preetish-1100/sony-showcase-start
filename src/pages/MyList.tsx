import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, Play, Star, Clock, Trash2, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface WatchlistItem {
  id: string;
  title: string;
  imageUrl: string;
  duration: string;
  rating: number;
  year: number;
  language: string;
  genre: string;
  isPremium: boolean;
  addedDate: string;
  type: 'movie' | 'series';
}

const MyList: React.FC = () => {
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState('recent');
  const [filterBy, setFilterBy] = useState('all');

  // Mock watchlist data with consistent fallback IDs
  const [watchlistItems, setWatchlistItems] = useState<WatchlistItem[]>([
    {
      id: '1',  // RRR - matches MovieDescription fallback
      title: 'RRR',
      imageUrl: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=300&h=400&fit=crop',
      duration: '3h 7m',
      rating: 4.5,
      year: 2022,
      language: 'Telugu',
      genre: 'Action',
      isPremium: false,
      addedDate: '2024-01-15',
      type: 'movie'
    },
    {
      id: '2',  // Pushpa - matches MovieDescription fallback
      title: 'Pushpa: The Rise',
      imageUrl: 'https://images.unsplash.com/photo-1509281373149-e957c6296406?w=300&h=400&fit=crop',
      duration: '2h 59m',
      rating: 4.2,
      year: 2021,
      language: 'Telugu',
      genre: 'Action',
      isPremium: false,
      addedDate: '2024-01-14',
      type: 'movie'
    },
    {
      id: '3',  // KGF Chapter 2 - matches MovieDescription fallback
      title: 'KGF Chapter 2',
      imageUrl: 'https://images.unsplash.com/photo-1478720568477-b956dc04de23?w=300&h=400&fit=crop',
      duration: '2h 48m',
      rating: 4.3,
      year: 2022,
      language: 'Kannada',
      genre: 'Action',
      isPremium: true,
      addedDate: '2024-01-13',
      type: 'movie'
    },
    {
      id: '4',  // Pathaan - matches MovieDescription fallback
      title: 'Pathaan',
      imageUrl: 'https://images.unsplash.com/photo-1489599328109-2af2c85020e4?w=300&h=400&fit=crop',
      duration: '2h 26m',
      rating: 4.1,
      year: 2023,
      language: 'Hindi',
      genre: 'Action',
      isPremium: true,
      addedDate: '2024-01-12',
      type: 'movie'
    },
    {
      id: '550',  // Real TMDB ID for Fight Club - for testing TMDB integration
      title: 'Fight Club',
      imageUrl: 'https://image.tmdb.org/t/p/w300/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg',
      duration: '2h 19m', 
      rating: 4.4,
      year: 1999,
      language: 'English',
      genre: 'Drama',
      isPremium: false,
      addedDate: '2024-01-11',
      type: 'movie'
    }
  ]);

  const handleRemoveFromList = (itemId: string) => {
    setWatchlistItems(prev => prev.filter(item => item.id !== itemId));
  };

  const handlePlay = (item: WatchlistItem) => {
    console.log('Playing:', item.title);
    // Navigate to movie description page with state indicating it's from My List
    navigate(`/movie/${item.id}`, { state: { fromMyList: true } });
  };

  const sortedAndFilteredItems = watchlistItems
    .filter(item => {
      if (filterBy === 'all') return true;
      if (filterBy === 'movies') return item.type === 'movie';
      if (filterBy === 'series') return item.type === 'series';
      if (filterBy === 'premium') return item.isPremium;
      if (filterBy === 'free') return !item.isPremium;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.addedDate).getTime() - new Date(a.addedDate).getTime();
        case 'rating':
          return b.rating - a.rating;
        case 'year':
          return b.year - a.year;
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-background shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button size="icon" variant="ghost" onClick={() => navigate('/')}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex items-center space-x-2">
                <Heart className="w-6 h-6 text-red-500 fill-current" />
                <h1 className="text-xl font-bold">My List</h1>
              </div>
            </div>
            <Badge variant="secondary" className="text-xs">
              {watchlistItems.length} items
            </Badge>
          </div>
        </div>
      </header>

      <div className="max-w-md mx-auto px-4 py-4">
        {/* Filters and Sort */}
        <div className="mb-6">
          <div className="flex space-x-3">
            <Select value={filterBy} onValueChange={setFilterBy}>
              <SelectTrigger className="flex-1">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Items</SelectItem>
                <SelectItem value="movies">Movies</SelectItem>
                <SelectItem value="series">TV Shows</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
                <SelectItem value="free">Free</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Recently Added</SelectItem>
                <SelectItem value="rating">Rating</SelectItem>
                <SelectItem value="year">Year</SelectItem>
                <SelectItem value="title">Title</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Watchlist Items */}
        {sortedAndFilteredItems.length > 0 ? (
          <ScrollArea className="h-[calc(100vh-200px)]">
            <div className="space-y-4">
              {sortedAndFilteredItems.map((item) => (
                <Card key={item.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex">
                      <div className="w-24 h-32 flex-shrink-0">
                        <img 
                          src={item.imageUrl} 
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-lg">{item.title}</h3>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleRemoveFromList(item.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            <span className="text-sm font-medium">{item.rating}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">{item.duration}</span>
                          </div>
                          <span className="text-sm text-muted-foreground">{item.year}</span>
                        </div>

                        <div className="flex items-center space-x-2 mb-3">
                          <Badge variant="outline" className="text-xs">
                            {item.language}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {item.genre}
                          </Badge>
                          {item.isPremium && (
                            <Badge variant="secondary" className="text-xs">
                              Premium
                            </Badge>
                          )}
                        </div>

                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            className="flex-1"
                            onClick={() => handlePlay(item)}
                          >
                            <Play className="w-4 h-4 mr-2" />
                            Play
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="text-center py-12">
            <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Your list is empty</h3>
            <p className="text-muted-foreground mb-4">
              Start adding movies and shows to your watchlist
            </p>
            <Button onClick={() => navigate('/')}>
              Browse Content
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyList;
