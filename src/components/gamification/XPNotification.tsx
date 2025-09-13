import React, { useState, useEffect } from 'react';
import { Star, Zap, Trophy, Target } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface XPNotificationProps {
  xpAmount: number;
  reason: string;
  type: 'content_completion' | 'engagement' | 'streak' | 'discovery' | 'milestone';
  onComplete?: () => void;
}

const XPNotification: React.FC<XPNotificationProps> = ({
  xpAmount,
  reason,
  type,
  onComplete
}) => {
  const [visible, setVisible] = useState(true);
  const [animationPhase, setAnimationPhase] = useState('enter');

  useEffect(() => {
    const timer1 = setTimeout(() => {
      setAnimationPhase('exit');
    }, 2500);

    const timer2 = setTimeout(() => {
      setVisible(false);
      onComplete?.();
    }, 3000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [onComplete]);

  const getIcon = () => {
    switch (type) {
      case 'content_completion':
        return <Star className="w-6 h-6 text-yellow-400" />;
      case 'engagement':
        return <Zap className="w-6 h-6 text-blue-400" />;
      case 'streak':
        return <Trophy className="w-6 h-6 text-orange-400" />;
      case 'discovery':
        return <Target className="w-6 h-6 text-green-400" />;
      case 'milestone':
        return <Trophy className="w-6 h-6 text-purple-400" />;
      default:
        return <Star className="w-6 h-6 text-yellow-400" />;
    }
  };

  const getGradient = () => {
    switch (type) {
      case 'content_completion':
        return 'from-yellow-400/20 to-yellow-600/20 border-yellow-400/30';
      case 'engagement':
        return 'from-blue-400/20 to-blue-600/20 border-blue-400/30';
      case 'streak':
        return 'from-orange-400/20 to-orange-600/20 border-orange-400/30';
      case 'discovery':
        return 'from-green-400/20 to-green-600/20 border-green-400/30';
      case 'milestone':
        return 'from-purple-400/20 to-purple-600/20 border-purple-400/30';
      default:
        return 'from-yellow-400/20 to-yellow-600/20 border-yellow-400/30';
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 pointer-events-none">
      <Card 
        className={`
          bg-gradient-to-r ${getGradient()} border backdrop-blur-sm
          ${animationPhase === 'enter' ? 'animate-scale-in' : 'animate-fade-out'}
          shadow-lg
        `}
      >
        <div className="flex items-center space-x-3 p-4">
          <div className="flex-shrink-0">
            {getIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-lg font-bold text-foreground">
              +{xpAmount} XP
            </div>
            <div className="text-sm text-muted-foreground truncate">
              {reason}
            </div>
          </div>
          <div className="flex-shrink-0">
            <div className="w-8 h-8 rounded-full bg-sonyliv-primary/20 flex items-center justify-center">
              <span className="text-xs font-bold text-sonyliv-primary">XP</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default XPNotification;