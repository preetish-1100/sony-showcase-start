import React, { useState } from 'react';
import WelcomeScreen from './WelcomeScreen';
import OTPScreen from './OTPScreen';
import LanguageScreen from './LanguageScreen';
import GenreScreen from './GenreScreen';
import ContentTypeScreen from './ContentTypeScreen';
import LocationScreen from './LocationScreen';
import CompletionScreen from './CompletionScreen';

type OnboardingStep = 
  | 'welcome' 
  | 'otp' 
  | 'language' 
  | 'genre' 
  | 'contentType' 
  | 'location' 
  | 'completion';

interface UserPreferences {
  phoneNumber?: string;
  languages: string[];
  genres: string[];
  contentTypes: string[];
  allowLocation: boolean;
}

interface OnboardingFlowProps {
  onComplete: (preferences: UserPreferences) => void;
}

const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome');
  const [userPreferences, setUserPreferences] = useState<UserPreferences>({
    languages: [],
    genres: [],
    contentTypes: [],
    allowLocation: false,
  });

  const handleWelcomeNext = (phoneNumber: string) => {
    setUserPreferences(prev => ({ ...prev, phoneNumber }));
    setCurrentStep('otp');
  };

  const handleWelcomeSkip = () => {
    setCurrentStep('language');
  };

  const handleOTPNext = () => {
    setCurrentStep('language');
  };

  const handleOTPBack = () => {
    setCurrentStep('welcome');
  };

  const handleOTPEditNumber = () => {
    setCurrentStep('welcome');
  };

  const handleLanguageNext = (languages: string[]) => {
    setUserPreferences(prev => ({ ...prev, languages }));
    setCurrentStep('genre');
  };

  const handleLanguageBack = () => {
    if (userPreferences.phoneNumber) {
      setCurrentStep('otp');
    } else {
      setCurrentStep('welcome');
    }
  };

  const handleLanguageSkip = () => {
    setCurrentStep('genre');
  };

  const handleGenreNext = (genres: string[]) => {
    setUserPreferences(prev => ({ ...prev, genres }));
    setCurrentStep('contentType');
  };

  const handleGenreBack = () => {
    setCurrentStep('language');
  };

  const handleGenreSkip = () => {
    setCurrentStep('contentType');
  };

  const handleContentTypeNext = (contentTypes: string[]) => {
    setUserPreferences(prev => ({ ...prev, contentTypes }));
    setCurrentStep('location');
  };

  const handleContentTypeBack = () => {
    setCurrentStep('genre');
  };

  const handleContentTypeSkip = () => {
    setCurrentStep('location');
  };

  const handleLocationNext = (allowLocation: boolean) => {
    const finalPreferences = { ...userPreferences, allowLocation };
    setUserPreferences(finalPreferences);
    setCurrentStep('completion');
  };

  const handleLocationBack = () => {
    setCurrentStep('contentType');
  };

  const handleCompletionFinish = () => {
    onComplete(userPreferences);
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'welcome':
        return (
          <WelcomeScreen
            onNext={handleWelcomeNext}
            onSkip={handleWelcomeSkip}
          />
        );
      
      case 'otp':
        return (
          <OTPScreen
            phoneNumber={userPreferences.phoneNumber || ''}
            onNext={handleOTPNext}
            onBack={handleOTPBack}
            onEditNumber={handleOTPEditNumber}
          />
        );
      
      case 'language':
        return (
          <LanguageScreen
            onNext={handleLanguageNext}
            onBack={handleLanguageBack}
            onSkip={handleLanguageSkip}
          />
        );
      
      case 'genre':
        return (
          <GenreScreen
            onNext={handleGenreNext}
            onBack={handleGenreBack}
            onSkip={handleGenreSkip}
          />
        );
      
      case 'contentType':
        return (
          <ContentTypeScreen
            onNext={handleContentTypeNext}
            onBack={handleContentTypeBack}
            onSkip={handleContentTypeSkip}
          />
        );
      
      case 'location':
        return (
          <LocationScreen
            onNext={handleLocationNext}
            onBack={handleLocationBack}
          />
        );
      
      case 'completion':
        return (
          <CompletionScreen
            onComplete={handleCompletionFinish}
            userPreferences={userPreferences}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {renderCurrentStep()}
    </div>
  );
};

export default OnboardingFlow;