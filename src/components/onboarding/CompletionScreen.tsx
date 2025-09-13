import React, { useEffect, useState } from 'react';
import { Check, Sparkles } from 'lucide-react';
import OnboardingLayout from './OnboardingLayout';

interface CompletionScreenProps {
  onComplete: () => void;
  userPreferences: {
    phoneNumber?: string;
    languages: string[];
    genres: string[];
    contentTypes: string[];
    allowLocation: boolean;
  };
}

const CompletionScreen: React.FC<CompletionScreenProps> = ({ 
  onComplete, 
  userPreferences 
}) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Animate progress bar
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          // Auto-transition after completion
          setTimeout(() => {
            onComplete();
          }, 1000);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <OnboardingLayout
      step={6}
      totalSteps={6}
      showProgress={false}
    >
      <div className="space-y-8 text-center">
        {/* Success Animation */}
        <div className="space-y-6">
          <div className="relative">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-sonyliv-success/10 rounded-full">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-sonyliv-success rounded-full">
                <Check className="w-8 h-8 text-white animate-bounce" />
              </div>
            </div>
            <div className="absolute -top-2 -right-2">
              <Sparkles className="w-8 h-8 text-yellow-400 animate-pulse" />
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-gray-900">All set!</h2>
            <p className="text-lg text-gray-600">
              Building your personalized homepage...
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-4">
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary to-sonyliv-success transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-gray-600">
            {progress < 30 && "Analyzing your preferences..."}
            {progress >= 30 && progress < 60 && "Finding content you'll love..."}
            {progress >= 60 && progress < 90 && "Customizing your experience..."}
            {progress >= 90 && "Almost ready!"}
          </p>
        </div>

        {/* Preferences Summary */}
        <div className="bg-gray-50 rounded-xl p-6 text-left space-y-4">
          <h3 className="font-semibold text-gray-800 text-center mb-4">
            Your Personalization
          </h3>
          
          {userPreferences.languages.length > 0 && (
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
              <span className="text-sm text-gray-700">
                <strong>{userPreferences.languages.length}</strong> preferred language{userPreferences.languages.length > 1 ? 's' : ''}
              </span>
            </div>
          )}
          
          {userPreferences.genres.length > 0 && (
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
              <span className="text-sm text-gray-700">
                <strong>{userPreferences.genres.length}</strong> favorite genre{userPreferences.genres.length > 1 ? 's' : ''}
              </span>
            </div>
          )}
          
          {userPreferences.contentTypes.length > 0 && (
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
              <span className="text-sm text-gray-700">
                <strong>{userPreferences.contentTypes.length}</strong> content type preference{userPreferences.contentTypes.length > 1 ? 's' : ''}
              </span>
            </div>
          )}
          
          {userPreferences.allowLocation && (
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-sonyliv-success rounded-full flex-shrink-0" />
              <span className="text-sm text-gray-700">
                Local trending content enabled
              </span>
            </div>
          )}
        </div>

        {/* Loading Text */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            This will only take a moment...
          </p>
        </div>
      </div>
    </OnboardingLayout>
  );
};

export default CompletionScreen;