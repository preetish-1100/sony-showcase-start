import React, { useState, useEffect } from 'react';
import { Crown, Star, Zap, Clock, CheckCircle2, XCircle, Play } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import xpService from '@/services/xp';
import premiumUnlockService from '@/services/premiumUnlock';

interface PremiumContent {
  id: string;
  title: string;
  imageUrl: string;
  year: number;
  rating: number;
  duration: string;
  xpCost: number;
  userXP: number;
  canUnlock: boolean;
  isUnlocked: boolean;
  unlockExpiresAt?: string;
}

interface PremiumUnlockSystemProps {
  userXP: number;
  onUnlock: (contentId: string, xpCost: number) => boolean;
}

const PremiumUnlockSystem: React.FC<PremiumUnlockSystemProps> = ({
  userXP,
  onUnlock
}) => {
  const navigate = useNavigate();
  const [selectedContent, setSelectedContent] = useState<PremiumContent | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [unlockedContent, setUnlockedContent] = useState<Set<string>>(new Set());
  const [currentUserXP, setCurrentUserXP] = useState(userXP);

  // Update XP in real-time
  useEffect(() => {
    const interval = setInterval(() => {
      const newXP = xpService.getCurrentXP();
      if (newXP !== currentUserXP) {
        setCurrentUserXP(newXP);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [currentUserXP]);

  // Load unlocked content from service
  useEffect(() => {
    const unlockedIds = premiumUnlockService.getUnlockedContentIds();
    setUnlockedContent(new Set(unlockedIds));
  }, []);

  const favoriteContent: PremiumContent[] = [
    {
      id: '2',
      title: 'Pushpa: The Rise',
      imageUrl: 'https://image.tmdb.org/t/p/w300/dBLBDeyrGMzMtlhayZ3VrxZVcyg.jpg',
      year: 2021,
      rating: 4.5,
      duration: '2h 59m',
      xpCost: 200,
      userXP: currentUserXP,
      canUnlock: currentUserXP >= 200,
      isUnlocked: unlockedContent.has('2')
    },
    {
      id: 'tv_family_man',
      title: 'The Family Man S2',
      imageUrl: 'https://image.tmdb.org/t/p/w300/dqB6DodeNVaXB1PBGl8XYuKGRhc.jpg',
      year: 2021,
      rating: 4.8,
      duration: '8 episodes',
      xpCost: 300,
      userXP: currentUserXP,
      canUnlock: currentUserXP >= 300,
      isUnlocked: unlockedContent.has('tv_family_man'),
      unlockExpiresAt: unlockedContent.has('tv_family_man') ? premiumUnlockService.getTimeRemaining('tv_family_man') || undefined : undefined
    },
    {
      id: 'tv_scam_1992',
      title: 'Scam 1992',
      imageUrl: 'https://image.tmdb.org/t/p/w300/7VKwqzR0622LdYm0v2pzgP8dWAV.jpg',
      year: 2020,
      rating: 4.9,
      duration: '10 episodes',
      xpCost: 400,
      userXP: currentUserXP,
      canUnlock: currentUserXP >= 400,
      isUnlocked: unlockedContent.has('tv_scam_1992')
    },
    {
      id: 'tv_mumbai_diaries',
      title: 'Mumbai Diaries 26/11',
      imageUrl: 'https://image.tmdb.org/t/p/w300/8XZWnTtKx8VV1fCFg8dY1vFJ9Hs.jpg',
      year: 2021,
      rating: 4.3,
      duration: '8 episodes',
      xpCost: 250,
      userXP: currentUserXP,
      canUnlock: currentUserXP >= 250,
      isUnlocked: unlockedContent.has('tv_mumbai_diaries')
    }
  ];

  const handleUnlockClick = (content: PremiumContent) => {
    setSelectedContent(content);
    setShowConfirmDialog(true);
  };

  const handleConfirmUnlock = () => {
    if (selectedContent) {
      const success = onUnlock(selectedContent.id, selectedContent.xpCost);
      if (success) {
        // Unlock content using service
        premiumUnlockService.unlockContent(selectedContent.id, selectedContent.xpCost);
        
        // Update local state
        const newUnlocked = new Set(unlockedContent);
        newUnlocked.add(selectedContent.id);
        setUnlockedContent(newUnlocked);
        
        setShowConfirmDialog(false);
        setShowSuccessDialog(true);
      }
    }
  };

  const handleWatchNow = (contentId: string) => {
    console.log('🎬 Starting to watch:', contentId);
    
    // Check if content is unlocked using service
    if (!premiumUnlockService.isContentUnlocked(contentId)) {
      alert('❌ Content not unlocked or expired! Please unlock it first with XP.');
      return;
    }

    // Navigate to movie/show page
    navigate(`/movie/${contentId}`);
  };

  const handleStartWatching = () => {
    if (selectedContent) {
      setShowSuccessDialog(false);
      handleWatchNow(selectedContent.id);
    }
  };

  const getProgressPercentage = (content: PremiumContent) => {
    return Math.min((content.userXP / content.xpCost) * 100, 100);
  };

  const getXPShortfall = (content: PremiumContent) => {
    return Math.max(content.xpCost - content.userXP, 0);
  };

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Choose Your Dream Watchlist</h2>
        <p className="text-muted-foreground">
          Select premium content you'd love to watch - earn XP to unlock them!
        </p>
        <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black">
          <Crown className="w-3 h-3 mr-1" />
          Your XP Balance: {userXP}
        </Badge>
      </div>

      {/* Favorite Content Grid */}
      <div className="grid gap-4">
        {favoriteContent.map((content) => (
          <Card 
            key={content.id}
            className={`
              relative overflow-hidden
              ${content.isUnlocked ? 'border-green-300 bg-green-50/50 dark:bg-green-950/20' : ''}
              ${content.canUnlock && !content.isUnlocked ? 'border-yellow-300' : ''}
            `}
          >
            {/* Premium Badge */}
            <div className="absolute top-2 left-2 z-10">
              <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black text-xs">
                <Crown className="w-3 h-3 mr-1" />
                Premium
              </Badge>
            </div>

            {/* Unlock Status Badge */}
            {content.isUnlocked && (
              <div className="absolute top-2 right-2 z-10">
                <Badge className="bg-green-500 text-white text-xs">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Unlocked
                </Badge>
              </div>
            )}

            <CardContent className="p-4">
              <div className="flex space-x-4">
                {/* Content Poster */}
                <div className="flex-shrink-0">
                  <img
                    src={content.imageUrl}
                    alt={content.title}
                    className="w-20 h-28 object-cover rounded-lg"
                  />
                </div>

                {/* Content Info */}
                <div className="flex-1 space-y-3">
                  <div>
                    <h3 className="font-semibold">{content.title}</h3>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <span>{content.year}</span>
                      <span>•</span>
                      <div className="flex items-center">
                        <Star className="w-3 h-3 mr-1 fill-current text-yellow-400" />
                        {content.rating}
                      </div>
                      <span>•</span>
                      <span>{content.duration}</span>
                    </div>
                  </div>

                  {/* XP Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">XP Required: {content.xpCost}</span>
                      <span className="text-muted-foreground">
                        You have {content.userXP} XP
                      </span>
                    </div>
                    
                    <Progress 
                      value={getProgressPercentage(content)} 
                      className="h-2"
                    />
                    
                    {content.isUnlocked ? (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-green-600 font-medium">
                          ✓ Unlocked & Ready to Watch
                        </span>
                        {content.unlockExpiresAt && (
                          <div className="flex items-center text-xs text-orange-600">
                            <Clock className="w-3 h-3 mr-1" />
                            {content.unlockExpiresAt}
                          </div>
                        )}
                      </div>
                    ) : content.canUnlock ? (
                      <span className="text-sm text-green-600 font-medium">
                        Ready to Unlock! 🎉
                      </span>
                    ) : (
                      <span className="text-sm text-orange-600">
                        Earn {getXPShortfall(content)} more XP
                      </span>
                    )}
                  </div>

                  {/* Action Button */}
                  <div>
                    {content.isUnlocked ? (
                      <Button 
                        onClick={() => handleWatchNow(content.id)}
                        className="w-full bg-green-600 hover:bg-green-700"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Watch Now
                      </Button>
                    ) : content.canUnlock ? (
                      <Button 
                        onClick={() => handleUnlockClick(content)}
                        className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black"
                      >
                        <Crown className="w-4 h-4 mr-2" />
                        Unlock for {content.xpCost} XP
                      </Button>
                    ) : (
                      <Button disabled className="w-full">
                        <XCircle className="w-4 h-4 mr-2" />
                        Need {getXPShortfall(content)} more XP
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Crown className="w-5 h-5 mr-2 text-yellow-500" />
              Confirm Unlock
            </DialogTitle>
          </DialogHeader>
          
          {selectedContent && (
            <div className="space-y-4">
              <div className="text-center">
                <img
                  src={selectedContent.imageUrl}
                  alt={selectedContent.title}
                  className="w-16 h-20 object-cover rounded-lg mx-auto mb-2"
                />
                <h3 className="font-semibold">{selectedContent.title}</h3>
              </div>

              <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>XP Cost:</span>
                  <span className="font-medium">{selectedContent.xpCost} XP</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Your Balance:</span>
                  <span className="font-medium">{userXP} XP</span>
                </div>
                <div className="border-t pt-2 flex justify-between text-sm font-medium">
                  <span>After Unlock:</span>
                  <span>{userXP - selectedContent.xpCost} XP</span>
                </div>
              </div>

              <p className="text-sm text-muted-foreground text-center">
                Are you sure you want to spend {selectedContent.xpCost} XP to unlock this content?
              </p>

              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowConfirmDialog(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleConfirmUnlock}
                  className="flex-1 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black"
                >
                  <Crown className="w-4 h-4 mr-2" />
                  Unlock
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="max-w-sm">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mx-auto animate-pulse">
              <Crown className="w-8 h-8 text-black" />
            </div>
            
            <div>
              <h3 className="text-xl font-bold mb-2">Unlocked! 🎉</h3>
              <p className="text-muted-foreground">
                Valid for 7 days or one complete viewing
              </p>
            </div>

            <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-3">
              <div className="flex items-center justify-center space-x-2 text-sm text-green-600">
                <Clock className="w-4 h-4" />
                <span>6 days 23 hours remaining</span>
              </div>
            </div>

            <Button 
              onClick={handleStartWatching}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              <Play className="w-4 h-4 mr-2" />
              Start Watching Now
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PremiumUnlockSystem;