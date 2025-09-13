import React, { useState, useEffect } from 'react';
import { Crown, Star, Play, Gift, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface WelcomeBackScreenProps {
  onStartWatching: () => void;
  onLearnMore: () => void;
  onClose: () => void;
}

const WelcomeBackScreen: React.FC<WelcomeBackScreenProps> = ({
  onStartWatching,
  onLearnMore,
  onClose
}) => {
  const [timeRemaining, setTimeRemaining] = useState({
    days: 2,
    hours: 23,
    minutes: 33,
    seconds: 15
  });

  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else if (prev.days > 0) {
          return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const confettiTimer = setTimeout(() => {
      setShowConfetti(false);
    }, 3000);
    return () => clearTimeout(confettiTimer);
  }, []);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      {/* Confetti Animation */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            >
              {Math.random() > 0.5 ? '🎊' : '✨'}
            </div>
          ))}
        </div>
      )}

      <Card className="w-full max-w-md mx-auto relative animate-scale-in">
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
          <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full p-4 shadow-lg animate-pulse">
            <Crown className="w-8 h-8 text-white" />
          </div>
        </div>

        <CardContent className="pt-12 pb-6 px-6 text-center space-y-6">
          {/* Welcome Title */}
          <div>
            <h1 className="text-2xl font-bold mb-2">Welcome Back! 🎊</h1>
            <p className="text-muted-foreground">
              You've unlocked 3 days of Premium access
            </p>
          </div>

          {/* Benefits List */}
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-muted/30 rounded-lg">
              <Star className="w-5 h-5 text-yellow-500" />
              <span className="text-sm">Access to exclusive Premium shows</span>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-muted/30 rounded-lg">
              <Play className="w-5 h-5 text-blue-500" />
              <span className="text-sm">HD/4K streaming quality</span>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-muted/30 rounded-lg">
              <Gift className="w-5 h-5 text-green-500" />
              <span className="text-sm">Ad-free viewing experience</span>
            </div>
          </div>

          {/* Countdown Timer */}
          <div className="bg-gradient-to-r from-red-500/10 to-orange-500/10 rounded-lg p-4 border border-red-200">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Clock className="w-4 h-4 text-red-500" />
              <span className="text-sm font-medium text-red-600">Offer expires in</span>
            </div>
            <div className="flex items-center justify-center space-x-4 text-2xl font-bold">
              <div className="text-center">
                <div className="text-red-600">{timeRemaining.days.toString().padStart(2, '0')}</div>
                <div className="text-xs text-muted-foreground">Days</div>
              </div>
              <div className="text-red-600">:</div>
              <div className="text-center">
                <div className="text-red-600">{timeRemaining.hours.toString().padStart(2, '0')}</div>
                <div className="text-xs text-muted-foreground">Hours</div>
              </div>
              <div className="text-red-600">:</div>
              <div className="text-center">
                <div className="text-red-600">{timeRemaining.minutes.toString().padStart(2, '0')}</div>
                <div className="text-xs text-muted-foreground">Min</div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button 
              onClick={onStartWatching}
              className="w-full bg-gradient-to-r from-sonyliv-primary to-blue-600 hover:from-sonyliv-primary/90 hover:to-blue-600/90"
            >
              <Crown className="w-4 h-4 mr-2" />
              Start Watching Premium Content
            </Button>
            
            <Button 
              variant="outline" 
              onClick={onLearnMore}
              className="w-full"
            >
              Learn about Premium plans
            </Button>
            
            <Button 
              variant="ghost" 
              onClick={onClose}
              className="w-full text-muted-foreground"
            >
              Continue with free content
            </Button>
          </div>

          {/* Premium Badge */}
          <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black">
            <Crown className="w-3 h-3 mr-1" />
            FREE Premium Access
          </Badge>
        </CardContent>
      </Card>
    </div>
  );
};

export default WelcomeBackScreen;