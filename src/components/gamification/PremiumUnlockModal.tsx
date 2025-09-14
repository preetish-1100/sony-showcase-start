import React from 'react';
import { Crown, Zap, Star, X, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

interface PremiumUnlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  movie: {
    title: string;
    imageUrl: string;
    xpRequired: number;
  };
  userXP: number;
  onUnlock: () => void;
  onWatchWithPremium: () => void;
}

const PremiumUnlockModal: React.FC<PremiumUnlockModalProps> = ({
  isOpen,
  onClose,
  movie,
  userXP,
  onUnlock,
  onWatchWithPremium
}) => {
  const canUnlock = userXP >= movie.xpRequired;
  const progressPercentage = (userXP / movie.xpRequired) * 100;
  const xpNeeded = movie.xpRequired - userXP;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto p-0 overflow-hidden" showClose={false}>
        {/* Header Image */}
        <div className="relative h-48 bg-gradient-to-br from-yellow-400 to-orange-500">
          <img 
            src={movie.imageUrl} 
            alt={movie.title}
            className="absolute inset-0 w-full h-full object-cover mix-blend-overlay"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          
          <Button
            size="icon"
            variant="ghost"
            className="absolute top-4 right-4 text-white hover:bg-white/20"
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </Button>

          <div className="absolute bottom-4 left-4 right-4">
            <Badge className="bg-yellow-600 text-white mb-2">
              <Crown className="w-3 h-3 mr-1" />
              Premium Content
            </Badge>
            <h2 className="text-white text-xl font-bold">{movie.title}</h2>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* XP Status */}
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-3">
              <Zap className="w-5 h-5 text-yellow-500" />
              <span className="text-lg font-bold text-sonyliv-primary">
                {userXP.toLocaleString()} XP
              </span>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Your XP</span>
                <span className="text-muted-foreground">Required</span>
              </div>
              <Progress value={Math.min(progressPercentage, 100)} className="h-3" />
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{userXP}</span>
                <span className="font-medium">{movie.xpRequired}</span>
              </div>
            </div>
          </div>

          {/* Unlock Status */}
          {canUnlock ? (
            <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex items-center space-x-2 text-green-700 dark:text-green-300">
                <Star className="w-5 h-5" />
                <span className="font-medium">Ready to unlock!</span>
              </div>
              <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                You have enough XP to unlock this premium content.
              </p>
            </div>
          ) : (
            <div className="bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
              <div className="flex items-center space-x-2 text-orange-700 dark:text-orange-300">
                <Zap className="w-5 h-5" />
                <span className="font-medium">Need more XP</span>
              </div>
              <p className="text-sm text-orange-600 dark:text-orange-400 mt-1">
                You need {xpNeeded.toLocaleString()} more XP to unlock this content.
              </p>
            </div>
          )}

          {/* Benefits */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
              Premium Benefits
            </h3>
            <div className="space-y-2">
              {[
                { icon: '🎬', text: 'Watch without ads' },
                { icon: '⚡', text: 'Earn bonus XP while watching' },
                { icon: '🎯', text: 'Access to exclusive content' },
                { icon: '⭐', text: 'Premium member badge' }
              ].map((benefit, index) => (
                <div key={index} className="flex items-center space-x-3 text-sm">
                  <span className="text-lg">{benefit.icon}</span>
                  <span>{benefit.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {canUnlock ? (
              <>
                <Button 
                  className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white"
                  onClick={onUnlock}
                >
                  <Crown className="w-4 h-4 mr-2" />
                  Unlock with {movie.xpRequired} XP
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={onWatchWithPremium}
                >
                  <Play className="w-4 h-4 mr-2" />
                  Watch with Premium
                </Button>
              </>
            ) : (
              <>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={onWatchWithPremium}
                >
                  <Play className="w-4 h-4 mr-2" />
                  Watch with Premium
                </Button>
                <Button 
                  disabled
                  className="w-full"
                >
                  <Crown className="w-4 h-4 mr-2" />
                  Need {xpNeeded} more XP
                </Button>
              </>
            )}
          </div>

          {/* Earn XP Tips */}
          {!canUnlock && (
            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h4 className="font-medium text-blue-700 dark:text-blue-300 mb-2">
                💡 How to earn XP
              </h4>
              <ul className="text-sm text-blue-600 dark:text-blue-400 space-y-1">
                <li>• Watch free content (+20 XP per completion)</li>
                <li>• Add movies to watchlist (+5 XP each)</li>
                <li>• Daily login streak (+10-50 XP)</li>
                <li>• Share content with friends (+15 XP)</li>
              </ul>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PremiumUnlockModal;