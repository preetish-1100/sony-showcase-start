// Premium Content Unlock Service
interface UnlockedContent {
  id: string;
  unlockedAt: string;
  expiresAt: string;
  xpSpent: number;
}

class PremiumUnlockService {
  private storageKey = 'sonyliv_unlocked_content';
  private unlockDuration = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

  // Get all unlocked content
  getUnlockedContent(): UnlockedContent[] {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error reading unlocked content:', error);
      return [];
    }
  }

  // Check if content is unlocked and not expired
  isContentUnlocked(contentId: string): boolean {
    const unlockedContent = this.getUnlockedContent();
    const content = unlockedContent.find(item => item.id === contentId);
    
    if (!content) return false;
    
    // Check if expired
    const now = new Date().getTime();
    const expiresAt = new Date(content.expiresAt).getTime();
    
    if (now > expiresAt) {
      // Remove expired content
      this.removeUnlockedContent(contentId);
      return false;
    }
    
    return true;
  }

  // Unlock content with XP
  unlockContent(contentId: string, xpSpent: number): boolean {
    try {
      const now = new Date();
      const expiresAt = new Date(now.getTime() + this.unlockDuration);
      
      const unlockedContent = this.getUnlockedContent();
      
      // Remove existing entry if any
      const filtered = unlockedContent.filter(item => item.id !== contentId);
      
      // Add new unlock
      const newUnlock: UnlockedContent = {
        id: contentId,
        unlockedAt: now.toISOString(),
        expiresAt: expiresAt.toISOString(),
        xpSpent
      };
      
      filtered.push(newUnlock);
      
      localStorage.setItem(this.storageKey, JSON.stringify(filtered));
      console.log(`🔓 Unlocked content ${contentId} for ${xpSpent} XP, expires at ${expiresAt}`);
      
      return true;
    } catch (error) {
      console.error('Error unlocking content:', error);
      return false;
    }
  }

  // Remove unlocked content
  removeUnlockedContent(contentId: string): void {
    try {
      const unlockedContent = this.getUnlockedContent();
      const filtered = unlockedContent.filter(item => item.id !== contentId);
      localStorage.setItem(this.storageKey, JSON.stringify(filtered));
      console.log(`🗑️ Removed unlocked content: ${contentId}`);
    } catch (error) {
      console.error('Error removing unlocked content:', error);
    }
  }

  // Get time remaining for unlocked content
  getTimeRemaining(contentId: string): string | null {
    const unlockedContent = this.getUnlockedContent();
    const content = unlockedContent.find(item => item.id === contentId);
    
    if (!content) return null;
    
    const now = new Date().getTime();
    const expiresAt = new Date(content.expiresAt).getTime();
    const remaining = expiresAt - now;
    
    if (remaining <= 0) return null;
    
    const days = Math.floor(remaining / (24 * 60 * 60 * 1000));
    const hours = Math.floor((remaining % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
    
    if (days > 0) {
      return `${days} days ${hours} hours remaining`;
    } else if (hours > 0) {
      return `${hours} hours ${minutes} minutes remaining`;
    } else {
      return `${minutes} minutes remaining`;
    }
  }

  // Clean up expired content
  cleanupExpiredContent(): void {
    const unlockedContent = this.getUnlockedContent();
    const now = new Date().getTime();
    
    const active = unlockedContent.filter(item => {
      const expiresAt = new Date(item.expiresAt).getTime();
      return now <= expiresAt;
    });
    
    if (active.length !== unlockedContent.length) {
      localStorage.setItem(this.storageKey, JSON.stringify(active));
      console.log(`🧹 Cleaned up ${unlockedContent.length - active.length} expired unlocks`);
    }
  }

  // Get all unlocked content IDs
  getUnlockedContentIds(): string[] {
    this.cleanupExpiredContent(); // Clean up first
    return this.getUnlockedContent().map(item => item.id);
  }
}

export default new PremiumUnlockService();