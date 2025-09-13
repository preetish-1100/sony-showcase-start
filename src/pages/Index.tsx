import React, { useState } from 'react';
import OnboardingFlow from '@/components/onboarding/OnboardingFlow';
import Home from './Home';
import Profile from './Profile';
import Search from './Search';

interface UserPreferences {
  phoneNumber?: string;
  languages: string[];
  genres: string[];
  contentTypes: string[];
  allowLocation: boolean;
}

const Index = () => {
  const [currentPage, setCurrentPage] = useState<'onboarding' | 'home' | 'profile' | 'search'>('onboarding');
  const [userPreferences, setUserPreferences] = useState<UserPreferences>({
    languages: [],
    genres: [],
    contentTypes: [],
    allowLocation: false,
  });

  const handleOnboardingComplete = (preferences: UserPreferences) => {
    setUserPreferences(preferences);
    setCurrentPage('home');
  };

  if (currentPage === 'onboarding') {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="min-h-screen">
      {currentPage === 'home' && (
        <Home 
          userPreferences={userPreferences}
          onNavigateToProfile={() => setCurrentPage('profile')}
          onNavigateToSearch={() => setCurrentPage('search')}
        />
      )}
      {currentPage === 'search' && (
        <Search 
          userPreferences={userPreferences}
          onBack={() => setCurrentPage('home')}
        />
      )}
      {currentPage === 'profile' && (
        <div>
          <Profile userPreferences={userPreferences} />
          {/* Bottom Navigation */}
          <div className="fixed bottom-0 left-0 right-0 bg-background border-t z-50">
            <div className="max-w-md mx-auto flex justify-around py-3">
              <button 
                onClick={() => setCurrentPage('home')}
                className="flex flex-col items-center space-y-1 text-muted-foreground"
              >
                <div className="w-6 h-6 flex items-center justify-center">🏠</div>
                <span className="text-xs">Home</span>
              </button>
              <button 
                onClick={() => setCurrentPage('profile')}
                className="flex flex-col items-center space-y-1 text-sonyliv-primary"
              >
                <div className="w-6 h-6 flex items-center justify-center">👤</div>
                <span className="text-xs">Profile</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
