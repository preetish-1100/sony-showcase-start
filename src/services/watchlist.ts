// Watchlist management service
export interface WatchlistItem {
  id: string;
  title: string;
  imageUrl: string;
  duration: string;
  rating: number;
  year: number;
  language: string;
  genre: string[];
  isPremium: boolean;
  addedDate: string;
  type: 'movie' | 'series';
  description?: string;
}

class WatchlistService {
  private storageKey = 'sonyliv_watchlist';

  // Get all watchlist items
  getWatchlist(): WatchlistItem[] {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error reading watchlist:', error);
      return [];
    }
  }

  // Add item to watchlist
  addToWatchlist(item: Omit<WatchlistItem, 'addedDate'>): boolean {
    try {
      const watchlist = this.getWatchlist();
      
      // Check if item already exists
      if (watchlist.some(existing => existing.id === item.id)) {
        console.log('Item already in watchlist:', item.title);
        return false;
      }

      const newItem: WatchlistItem = {
        ...item,
        addedDate: new Date().toISOString()
      };

      watchlist.unshift(newItem); // Add to beginning
      localStorage.setItem(this.storageKey, JSON.stringify(watchlist));
      
      console.log('Added to watchlist:', item.title);
      return true;
    } catch (error) {
      console.error('Error adding to watchlist:', error);
      return false;
    }
  }

  // Remove item from watchlist
  removeFromWatchlist(itemId: string): boolean {
    try {
      const watchlist = this.getWatchlist();
      const filtered = watchlist.filter(item => item.id !== itemId);
      
      if (filtered.length === watchlist.length) {
        console.log('Item not found in watchlist:', itemId);
        return false;
      }

      localStorage.setItem(this.storageKey, JSON.stringify(filtered));
      console.log('Removed from watchlist:', itemId);
      return true;
    } catch (error) {
      console.error('Error removing from watchlist:', error);
      return false;
    }
  }

  // Check if item is in watchlist
  isInWatchlist(itemId: string): boolean {
    const watchlist = this.getWatchlist();
    return watchlist.some(item => item.id === itemId);
  }

  // Get watchlist count
  getWatchlistCount(): number {
    return this.getWatchlist().length;
  }

  // Clear entire watchlist
  clearWatchlist(): void {
    localStorage.removeItem(this.storageKey);
    console.log('Watchlist cleared');
  }

  // Convert content item to watchlist format
  convertToWatchlistItem(contentItem: any): Omit<WatchlistItem, 'addedDate'> {
    return {
      id: contentItem.id.toString(),
      title: contentItem.title,
      imageUrl: contentItem.imageUrl || contentItem.image || 'https://via.placeholder.com/300x400/16213e/ffffff?text=No+Image',
      duration: contentItem.duration || '2h 30m',
      rating: contentItem.rating || 0,
      year: contentItem.year || new Date().getFullYear(),
      language: contentItem.language || 'Unknown',
      genre: Array.isArray(contentItem.genre) ? contentItem.genre : [contentItem.genre || 'Unknown'],
      isPremium: contentItem.isPremium || false,
      type: contentItem.type === 'series' ? 'series' : 'movie',
      description: contentItem.description || contentItem.overview || ''
    };
  }
}

export default new WatchlistService();