import React, { useState, useEffect } from 'react';
import { Crown, Star, Zap, Trophy, TrendingUp, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import xpService from '@/services/xp';

interface XPTransaction {
  id: string;
  type: 'content_completion' | 'engagement' | 'streak' | 'discovery';
  description: string;
  amount: number;
  timestamp: string;
  icon: string;
}

interface UserLevel {
  current: 'Newcomer' | 'Bronze Viewer' | 'Silver Viewer' | 'Gold Viewer';
  currentXP: number;
  nextLevelXP: number;
  totalXP: number;
  multiplier: number;
}

const XPDashboard: React.FC = () => {
  const [userLevel, setUserLevel] = useState<UserLevel>({
    current: 'Silver Viewer',
    currentXP: 740,
    nextLevelXP: 1000,
    totalXP: xpService.getCurrentXP(),
    multiplier: 1.15
  });

  // Update XP in real-time
  useEffect(() => {
    const updateXP = () => {
      const currentXP = xpService.getCurrentXP();
      setUserLevel(prev => ({
        ...prev,
        totalXP: currentXP,
        currentXP: currentXP % 1000 // Assuming 1000 XP per level
      }));
    };

    updateXP();
    const interval = setInterval(updateXP, 1000);
    return () => clearInterval(interval);
  }, []);

  const [xpHistory, setXpHistory] = useState<XPTransaction[]>([
    {
      id: '1',
      type: 'content_completion',
      description: "Completed 'Pushpa'",
      amount: 20,
      timestamp: '2 hours ago',
      icon: '🎬'
    },
    {
      id: '2',
      type: 'streak',
      description: '3-day streak bonus',
      amount: 50,
      timestamp: 'Yesterday',
      icon: '🔥'
    },
    {
      id: '3',
      type: 'engagement',
      description: 'Shared content',
      amount: 10,
      timestamp: '2 days ago',
      icon: '📱'
    },
    {
      id: '4',
      type: 'discovery',
      description: 'Watched Tamil content',
      amount: 15,
      timestamp: '3 days ago',
      icon: '🌟'
    }
  ]);

  const [animatedXP, setAnimatedXP] = useState(userLevel.totalXP);

  useEffect(() => {
    const interval = setInterval(() => {
      if (animatedXP < userLevel.totalXP) {
        setAnimatedXP(prev => Math.min(prev + 10, userLevel.totalXP));
      }
    }, 50);
    return () => clearInterval(interval);
  }, [animatedXP, userLevel.totalXP]);

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'Gold Viewer':
        return <Crown className="w-6 h-6 text-yellow-500" />;
      case 'Silver Viewer':
        return <Star className="w-6 h-6 text-gray-400" />;
      case 'Bronze Viewer':
        return <Trophy className="w-6 h-6 text-amber-600" />;
      default:
        return <Zap className="w-6 h-6 text-blue-500" />;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Gold Viewer':
        return 'bg-gradient-to-r from-yellow-400 to-yellow-600';
      case 'Silver Viewer':
        return 'bg-gradient-to-r from-gray-300 to-gray-500';
      case 'Bronze Viewer':
        return 'bg-gradient-to-r from-amber-400 to-amber-600';
      default:
        return 'bg-gradient-to-r from-blue-400 to-blue-600';
    }
  };

  const progressPercentage = (userLevel.currentXP / userLevel.nextLevelXP) * 100;
  const xpToNext = userLevel.nextLevelXP - userLevel.currentXP;

  return (
    <div className="space-y-6 p-4">
      {/* Main XP Display */}
      <Card className="relative overflow-hidden">
        <div className={`absolute inset-0 ${getLevelColor(userLevel.current)} opacity-10`} />
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getLevelIcon(userLevel.current)}
              <div>
                <CardTitle className="text-lg">{userLevel.current}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Level {userLevel.multiplier}x XP Multiplier
                </p>
              </div>
            </div>
            <Badge variant="secondary" className="px-3 py-1">
              <TrendingUp className="w-3 h-3 mr-1" />
              {(userLevel.multiplier * 100 - 100).toFixed(0)}% Bonus
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Animated XP Counter */}
          <div className="text-center">
            <div className="text-4xl font-bold text-sonyliv-primary mb-1">
              {animatedXP.toLocaleString()} XP
            </div>
            <p className="text-sm text-muted-foreground">Total Experience Points</p>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{userLevel.currentXP} XP</span>
              <span>{userLevel.nextLevelXP} XP</span>
            </div>
            <Progress value={progressPercentage} className="h-3" />
            <p className="text-center text-sm text-muted-foreground">
              {xpToNext} XP to Gold Viewer
            </p>
          </div>

          {/* Next Level Benefits */}
          <div className="bg-muted/50 rounded-lg p-3">
            <h4 className="font-medium mb-2 flex items-center">
              <Crown className="w-4 h-4 mr-2 text-yellow-500" />
              Gold Viewer Benefits
            </h4>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• 25% bonus XP multiplier</li>
              <li>• Monthly premium unlock token</li>
              <li>• Exclusive Gold events access</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* XP History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            Recent XP Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {xpHistory.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-lg">{transaction.icon}</span>
                  <div>
                    <p className="font-medium text-sm">{transaction.description}</p>
                    <p className="text-xs text-muted-foreground">{transaction.timestamp}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-bold text-sonyliv-success">
                    +{transaction.amount} XP
                  </span>
                </div>
              </div>
            ))}
          </div>
          
          <Button variant="outline" className="w-full mt-4">
            View Full History
          </Button>
        </CardContent>
      </Card>

      {/* Daily Goal */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Today's XP Goal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>Daily Target: 50 XP</span>
              <span>35/50 XP</span>
            </div>
            <Progress value={70} className="h-2" />
            <p className="text-xs text-muted-foreground">
              Complete one more movie to reach today's goal! 🎯
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default XPDashboard;