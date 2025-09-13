import React from 'react';
import { Trophy, Star, Zap, Users, Calendar, Globe, Film } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  progress: number;
  maxProgress: number;
  completed: boolean;
  rarity: 'common' | 'rare' | 'epic';
  xpReward: number;
}

const AchievementSystem: React.FC = () => {
  const achievements: Achievement[] = [
    {
      id: 'weekend-binger',
      title: 'Weekend Binger',
      description: 'Watch 3+ hours on weekend',
      icon: <Calendar className="w-5 h-5" />,
      progress: 2,
      maxProgress: 3,
      completed: false,
      rarity: 'common',
      xpReward: 50
    },
    {
      id: 'regional-explorer',
      title: 'Regional Explorer',
      description: 'Watch content in 3+ different languages',
      icon: <Globe className="w-5 h-5" />,
      progress: 3,
      maxProgress: 3,
      completed: true,
      rarity: 'rare',
      xpReward: 100
    },
    {
      id: 'genre-hopper',
      title: 'Genre Hopper',
      description: 'Complete content from 5+ different genres',
      icon: <Film className="w-5 h-5" />,
      progress: 4,
      maxProgress: 5,
      completed: false,
      rarity: 'rare',
      xpReward: 75
    },
    {
      id: 'social-butterfly',
      title: 'Social Butterfly',
      description: 'Share 10 pieces of content',
      icon: <Users className="w-5 h-5" />,
      progress: 7,
      maxProgress: 10,
      completed: false,
      rarity: 'common',
      xpReward: 40
    },
    {
      id: 'loyal-fan',
      title: 'Loyal Fan',
      description: '30-day viewing streak',
      icon: <Trophy className="w-5 h-5" />,
      progress: 12,
      maxProgress: 30,
      completed: false,
      rarity: 'epic',
      xpReward: 500
    },
    {
      id: 'quality-hunter',
      title: 'Quality Hunter',
      description: 'Watch 10 HD/4K titles',
      icon: <Star className="w-5 h-5" />,
      progress: 10,
      maxProgress: 10,
      completed: true,
      rarity: 'rare',
      xpReward: 80
    }
  ];

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'epic':
        return 'bg-purple-500 text-white';
      case 'rare':
        return 'bg-blue-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getRarityBorder = (rarity: string) => {
    switch (rarity) {
      case 'epic':
        return 'border-purple-300';
      case 'rare':
        return 'border-blue-300';
      default:
        return 'border-gray-300';
    }
  };

  const completedAchievements = achievements.filter(a => a.completed);
  const inProgressAchievements = achievements.filter(a => !a.completed);

  return (
    <div className="space-y-6 p-4">
      {/* Achievement Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Trophy className="w-5 h-5 mr-2 text-yellow-500" />
            Achievement Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-sonyliv-primary">
                {completedAchievements.length}
              </div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-500">
                {inProgressAchievements.length}
              </div>
              <div className="text-sm text-muted-foreground">In Progress</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-500">
                {completedAchievements.reduce((sum, a) => sum + a.xpReward, 0)}
              </div>
              <div className="text-sm text-muted-foreground">XP Earned</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Completed Achievements */}
      {completedAchievements.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3 flex items-center">
            <Zap className="w-5 h-5 mr-2 text-green-500" />
            Completed Achievements
          </h3>
          <div className="grid gap-3">
            {completedAchievements.map((achievement) => (
              <Card 
                key={achievement.id} 
                className={`border-2 ${getRarityBorder(achievement.rarity)} bg-green-50/50 dark:bg-green-950/20`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 text-green-500">
                      {achievement.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-medium">{achievement.title}</h4>
                        <Badge className={`text-xs ${getRarityColor(achievement.rarity)}`}>
                          {achievement.rarity.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {achievement.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-green-600 font-medium">
                          ✓ Completed
                        </span>
                        <Badge variant="secondary">
                          +{achievement.xpReward} XP
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* In Progress Achievements */}
      <div>
        <h3 className="text-lg font-semibold mb-3 flex items-center">
          <Target className="w-5 h-5 mr-2 text-blue-500" />
          In Progress
        </h3>
        <div className="grid gap-3">
          {inProgressAchievements.map((achievement) => (
            <Card 
              key={achievement.id}
              className={`border ${getRarityBorder(achievement.rarity)}`}
            >
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 text-muted-foreground">
                    {achievement.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-medium">{achievement.title}</h4>
                      <Badge className={`text-xs ${getRarityColor(achievement.rarity)}`}>
                        {achievement.rarity.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {achievement.description}
                    </p>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{achievement.progress}/{achievement.maxProgress}</span>
                        <span>+{achievement.xpReward} XP</span>
                      </div>
                      <Progress 
                        value={(achievement.progress / achievement.maxProgress) * 100} 
                        className="h-2"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

const Target: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
    <circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="2"/>
    <circle cx="12" cy="12" r="2" stroke="currentColor" strokeWidth="2"/>
  </svg>
);

export default AchievementSystem;