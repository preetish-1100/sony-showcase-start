import React, { useState } from 'react';
import OnboardingFlow from '@/components/onboarding/OnboardingFlow';
import Home from './Home';

interface UserPreferences {
  phoneNumber?: string;
  languages: string[];
  genres: string[];
  contentTypes: string[];
  allowLocation: boolean;
}

const Index = () => {
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [userPreferences, setUserPreferences] = useState<UserPreferences>({
    languages: [],
    genres: [],
    contentTypes: [],
    allowLocation: false,
  });

  const handleOnboardingComplete = (preferences: UserPreferences) => {
    setUserPreferences(preferences);
    setShowOnboarding(false);
  };

  if (showOnboarding) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />;
  }

  return <Home userPreferences={userPreferences} />;
};

export default Index;
