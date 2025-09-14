import React, { useState, useEffect } from 'react';
import { X, Play, Pause, Volume2, VolumeX, RotateCcw, RotateCw, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface VideoPlayerProps {
  isOpen: boolean;
  onClose: () => void;
  movie: {
    id: string;
    title: string;
    imageUrl: string;
    duration: string;
    isPremium: boolean;
  };
  onXPEarned?: (amount: number) => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ 
  isOpen, 
  onClose, 
  movie, 
  onXPEarned 
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalTime, setTotalTime] = useState(180); // 3 minutes demo
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [xpEarned, setXpEarned] = useState(0);

  // Convert duration to seconds for demo purposes
  const getDurationInSeconds = (duration: string) => {
    if (duration === 'LIVE') return 0;
    const matches = duration.match(/(\d+)h\s*(\d+)m/);
    if (matches) {
      return parseInt(matches[1]) * 3600 + parseInt(matches[2]) * 60;
    }
    return 180; // Default 3 minutes
  };

  useEffect(() => {
    if (isOpen) {
      setCurrentTime(0);
      setTotalTime(getDurationInSeconds(movie.duration));
      setIsPlaying(false);
      setXpEarned(0);
    }
  }, [isOpen, movie.duration]);

  // Simulate video progress
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && isOpen) {
      interval = setInterval(() => {
        setCurrentTime(prev => {
          const newTime = prev + 1;
          
          // Award XP for watching milestones
          const watchedPercentage = (newTime / totalTime) * 100;
          if (watchedPercentage >= 25 && xpEarned === 0) {
            setXpEarned(10);
            onXPEarned?.(10);
          } else if (watchedPercentage >= 50 && xpEarned === 10) {
            setXpEarned(25);
            onXPEarned?.(15);
          } else if (watchedPercentage >= 75 && xpEarned === 25) {
            setXpEarned(40);
            onXPEarned?.(15);
          } else if (watchedPercentage >= 95 && xpEarned === 40) {
            setXpEarned(60);
            onXPEarned?.(20);
          }
          
          if (newTime >= totalTime) {
            setIsPlaying(false);
            return totalTime;
          }
          return newTime;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, isOpen, totalTime, xpEarned, onXPEarned]);

  // Hide controls after 3 seconds of inactivity
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (showControls && isPlaying) {
      timeout = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
    return () => clearTimeout(timeout);
  }, [showControls, isPlaying]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (percentage: number) => {
    const newTime = (percentage / 100) * totalTime;
    setCurrentTime(newTime);
  };

  const handleSkip = (seconds: number) => {
    setCurrentTime(prev => Math.max(0, Math.min(totalTime, prev + seconds)));
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const progress = totalTime > 0 ? (currentTime / totalTime) * 100 : 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className={`p-0 max-w-4xl w-full ${isFullscreen ? 'max-w-full h-screen' : 'max-w-4xl'}`}
        showClose={false}
      >
        <div 
          className={`relative bg-black ${isFullscreen ? 'h-screen' : 'aspect-video'}`}
          onMouseMove={() => setShowControls(true)}
          onMouseLeave={() => setShowControls(false)}
        >
          {/* Video Thumbnail/Poster */}
          <div className="absolute inset-0">
            <img 
              src={movie.imageUrl} 
              alt={movie.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/30" />
          </div>

          {/* Loading/Buffering Indicator */}
          {!isPlaying && currentTime === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-black/50 rounded-full p-6">
                <Play className="w-16 h-16 text-white" />
              </div>
            </div>
          )}

          {/* XP Notification */}
          {xpEarned > 0 && (
            <div className="absolute top-4 right-4 bg-yellow-500 text-black px-3 py-2 rounded-full font-bold text-sm animate-pulse">
              +{xpEarned} XP
            </div>
          )}

          {/* Premium Badge */}
          {movie.isPremium && (
            <div className="absolute top-4 left-4 bg-yellow-600 text-white px-3 py-1 rounded-full text-sm font-medium">
              ⭐ Premium
            </div>
          )}

          {/* Controls Overlay */}
          <div 
            className={`absolute inset-0 transition-opacity duration-300 ${
              showControls ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {/* Close Button */}
            <Button
              size="icon"
              variant="ghost"
              className="absolute top-4 right-4 text-white hover:bg-white/20 z-10"
              onClick={onClose}
            >
              <X className="w-6 h-6" />
            </Button>

            {/* Center Play/Pause */}
            <div className="absolute inset-0 flex items-center justify-center">
              <Button
                size="icon"
                variant="ghost"
                className="text-white hover:bg-white/20 w-16 h-16"
                onClick={handlePlayPause}
              >
                {isPlaying ? (
                  <Pause className="w-8 h-8" />
                ) : (
                  <Play className="w-8 h-8" />
                )}
              </Button>
            </div>

            {/* Bottom Controls */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
              <div className="space-y-4">
                {/* Progress Bar */}
                <div className="space-y-2">
                  <Progress 
                    value={progress} 
                    className="w-full h-2 cursor-pointer"
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const x = e.clientX - rect.left;
                      const percentage = (x / rect.width) * 100;
                      handleSeek(percentage);
                    }}
                  />
                  <div className="flex items-center justify-between text-white text-sm">
                    <span>{formatTime(currentTime)}</span>
                    <span className="text-center font-medium">{movie.title}</span>
                    <span>{formatTime(totalTime)}</span>
                  </div>
                </div>

                {/* Control Buttons */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-white hover:bg-white/20"
                      onClick={handlePlayPause}
                    >
                      {isPlaying ? (
                        <Pause className="w-5 h-5" />
                      ) : (
                        <Play className="w-5 h-5" />
                      )}
                    </Button>

                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-white hover:bg-white/20"
                      onClick={() => handleSkip(-10)}
                    >
                      <RotateCcw className="w-5 h-5" />
                    </Button>

                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-white hover:bg-white/20"
                      onClick={() => handleSkip(10)}
                    >
                      <RotateCw className="w-5 h-5" />
                    </Button>

                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-white hover:bg-white/20"
                      onClick={() => setIsMuted(!isMuted)}
                    >
                      {isMuted ? (
                        <VolumeX className="w-5 h-5" />
                      ) : (
                        <Volume2 className="w-5 h-5" />
                      )}
                    </Button>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-white hover:bg-white/20"
                      onClick={toggleFullscreen}
                    >
                      {isFullscreen ? (
                        <Minimize2 className="w-5 h-5" />
                      ) : (
                        <Maximize2 className="w-5 h-5" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VideoPlayer;