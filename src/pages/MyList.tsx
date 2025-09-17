import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, Play, Star, Clock, Trash2, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import watchlistService, { WatchlistItem } from '@/services/watchlist';

const MyList: React.FC = () => {
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState('recent');
  const [filterBy, setFilterBy] = useState('all');
  const [watchlistItems, setWatchlistItems] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Load watchlist from localStorage on component mount
  useEffect(() => {
    const loadWatchlist = () => {
      try {
        const items = watchlistService.getWatchlist();
        setWatchlistItems(items);
        console.log('Loaded watchlist:', items.length, 'items');
      } catch (error) {
        console.error('Error loading watchlist:', error);
      } finally {
        setLoading(false);
      }
    };

    loadWatchlist();
  }, []);

  const handleRemoveFromList = (itemId: string) => {
    const success = watchlistService.removeFromWatchlist(itemId);
    if (success) {
      setWatchlistItems(prev => prev.filter(item => item.id !== itemId));
    }
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

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading your watchlist...</p>
            </div>
          </div>
        ) : (
          <>
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
                            {Array.isArray(item.genre) ? item.genre[0] : item.genre}
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
          </>
        )}
      </div>
    </div>
  );
};

export default MyList;
