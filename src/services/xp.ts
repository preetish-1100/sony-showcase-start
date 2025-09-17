// XP Management Service
class XPService {
  private storageKey = 'sonyliv_user_xp';
  private defaultXP = 1250; // Starting XP for new users

  // Get current user XP
  getCurrentXP(): number {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? parseInt(stored) : this.defaultXP;
    } catch (error) {
      console.error('Error reading XP:', error);
      return this.defaultXP;
    }
  }

  // Add XP to user account
  addXP(amount: number, reason: string = ''): number {
    try {
      const currentXP = this.getCurrentXP();
      const newXP = currentXP + amount;
      localStorage.setItem(this.storageKey, newXP.toString());

      console.log(`✨ Earned ${amount} XP: ${reason}. Total: ${newXP}`);
      return newXP;
    } catch (error) {
      console.error('Error adding XP:', error);
      return this.getCurrentXP();
    }
  }

  // Spend XP (for unlocking premium content)
  spendXP(amount: number, reason: string = ''): boolean {
    try {
      const currentXP = this.getCurrentXP();

      if (currentXP < amount) {
        console.warn(`❌ Insufficient XP. Need ${amount}, have ${currentXP}`);
        return false;
      }

      const newXP = currentXP - amount;
      localStorage.setItem(this.storageKey, newXP.toString());

      console.log(`💎 Spent ${amount} XP: ${reason}. Remaining: ${newXP}`);
      return true;
    } catch (error) {
      console.error('Error spending XP:', error);
      return false;
    }
  }

  // Check if user has enough XP
  hasEnoughXP(required: number): boolean {
    return this.getCurrentXP() >= required;
  }

  // Get XP progress for a requirement
  getXPProgress(required: number): number {
    const current = this.getCurrentXP();
    return Math.min((current / required) * 100, 100);
  }

  // Reset XP (for testing)
  resetXP(): void {
    localStorage.removeItem(this.storageKey);
    console.log('🔄 XP reset to default');
  }

  // Set specific XP amount (for testing)
  setXP(amount: number): void {
    localStorage.setItem(this.storageKey, amount.toString());
    console.log(`🎯 XP set to ${amount}`);
  }

  // XP earning activities
  static readonly XP_REWARDS = {
    WATCHLIST_ADD: 5,
    MOVIE_COMPLETE: 50,
    SERIES_EPISODE: 25,
    DAILY_LOGIN: 10,
    PROFILE_COMPLETE: 100,
    FIRST_WATCH: 20,
    STREAK_BONUS: 15
  };
}

export default new XPService();