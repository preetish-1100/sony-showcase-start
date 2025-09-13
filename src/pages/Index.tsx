import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import OnboardingFlow from '@/components/onboarding/OnboardingFlow';
import Home from './Home';
import Profile from './Profile';

interface UserPreferences {
  phoneNumber?: string;
  languages: string[];
  genres: string[];
  contentTypes: string[];
  allowLocation: boolean;
}

const Index = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [userPreferences, setUserPreferences] = useState<UserPreferences>({
    languages: [],
    genres: [],
    contentTypes: [],
    allowLocation: false,
  });

  // Determine current page based on URL
  const getCurrentPage = () => {
    const path = location.pathname;
    if (path === '/profile') return 'profile';
    if (path === '/home' || path === '/') return 'home';
    return 'onboarding';
  };

  const currentPage = getCurrentPage();

  const handleOnboardingComplete = (preferences: UserPreferences) => {
    setUserPreferences(preferences);
    navigate('/home');
  };

  if (currentPage === 'onboarding') {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="min-h-screen">
      {currentPage === 'home' && (
        <Home 
          userPreferences={userPreferences}
          onNavigateToProfile={() => navigate('/profile')}
        />
      )}
      {currentPage === 'profile' && (
        <div>
          <Profile userPreferences={userPreferences} />
          {/* Bottom Navigation */}
          <div className="fixed bottom-0 left-0 right-0 bg-background border-t z-50">
            <div className="max-w-md mx-auto flex justify-around py-3">
              <button 
                onClick={() => navigate('/home')}
                className="flex flex-col items-center space-y-1 text-muted-foreground"
              >
                <div className="w-6 h-6 flex items-center justify-center">🏠</div>
                <span className="text-xs">Home</span>
              </button>
              <button 
                onClick={() => navigate('/profile')}
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
