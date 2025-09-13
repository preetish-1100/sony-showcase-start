import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface OnboardingLayoutProps {
  children: React.ReactNode;
  step: number;
  totalSteps: number;
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  showProgress?: boolean;
}

const OnboardingLayout: React.FC<OnboardingLayoutProps> = ({
  children,
  step,
  totalSteps,
  title,
  showBack = false,
  onBack,
  showProgress = true,
}) => {
  const progressPercent = (step / totalSteps) * 100;

  return (
    <div className="onboarding-container">
      {/* Content Mosaic Header */}
      <div className="content-mosaic">
        <div className="relative z-10 pt-12 pb-8 text-center">
          {/* SonyLIV Logo */}
          <div className="mb-2">
            <h1 className="text-3xl font-bold text-primary tracking-wide">SonyLIV</h1>
          </div>
          {/* Tagline */}
          <p className="text-sm text-gray-600 font-medium">Your Entertainment, Your Language</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 bg-white min-h-[calc(100vh-16rem)] rounded-t-3xl mt-48 shadow-lg">
        {/* Header */}
        <div className="px-6 pt-6">
          {/* Back Button & Progress */}
          <div className="flex items-center justify-between mb-6">
            {showBack && onBack ? (
              <button
                onClick={onBack}
                className="flex items-center text-gray-600 hover:text-primary transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-1" />
                Back
              </button>
            ) : (
              <div />
            )}
            
            {showProgress && (
              <div className="flex-1 max-w-32 mx-4">
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1 text-center">
                  Step {step} of {totalSteps}
                </p>
              </div>
            )}
            
            <div className="w-12" /> {/* Spacer for balance */}
          </div>

          {/* Title */}
          {title && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 text-center leading-tight">
                {title}
              </h2>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="px-6 pb-8">
          {children}
        </div>
      </div>
    </div>
  );
};

export default OnboardingLayout;