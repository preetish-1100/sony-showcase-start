import React, { useState, useEffect } from 'react';
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
  const [currentPage, setCurrentPage] = useState<'onboarding' | 'home' | 'profile'>('onboarding');
  const [userPreferences, setUserPreferences] = useState<UserPreferences>({
    languages: [],
    genres: [],
    contentTypes: [],
    allowLocation: false,
  });
  const [debugInfo, setDebugInfo] = useState('');
  const [showDebugPanel, setShowDebugPanel] = useState(false); // Only show when there are errors

  // Add debug info display function
  const addDebug = (message: string) => {
    console.log('DEBUG:', message);
    setDebugInfo(prev => prev + message + '\n');
  };

  // Check localStorage for existing preferences on mount
  useEffect(() => {
    addDebug('Index component mounted, checking localStorage...');
    const savedPreferences = localStorage.getItem('userPreferences');
    const onboardingCompleted = localStorage.getItem('onboardingCompleted');
    
    addDebug(`Onboarding completed: ${onboardingCompleted}`);
    addDebug(`Saved preferences: ${savedPreferences}`);
    
    // Check for force reset parameter (for testing)
    const urlParams = new URLSearchParams(window.location.search);
    const forceReset = urlParams.get('reset') === 'true';
    const forceOnboarding = urlParams.get('onboarding') === 'true';
    
    if (forceReset || forceOnboarding) {
      addDebug('Forcing onboarding reset...');
      localStorage.removeItem('userPreferences');
      localStorage.removeItem('onboardingCompleted');
      setCurrentPage('onboarding');
      return;
    }
    
    // Check if user has completed onboarding with valid preferences
    if (onboardingCompleted === 'true' && savedPreferences) {
      try {
        const preferences = JSON.parse(savedPreferences);
        addDebug(`Parsed preferences: ${JSON.stringify(preferences)}`);
        
        // Strict validation - require at least one language and one genre
        const hasValidPrefs = preferences.languages && 
                             Array.isArray(preferences.languages) &&
                             preferences.languages.length > 0 &&
                             preferences.genres && 
                             Array.isArray(preferences.genres) &&
                             preferences.contentTypes &&
                             Array.isArray(preferences.contentTypes);
        
        if (hasValidPrefs) {
          addDebug('Valid complete preferences found, going to home');
          setUserPreferences(preferences);
          setCurrentPage('home');
        } else {
          addDebug('Incomplete preferences, forcing onboarding');
          localStorage.removeItem('userPreferences');
          localStorage.removeItem('onboardingCompleted');
          setCurrentPage('onboarding');
        }
      } catch (error) {
        addDebug(`Error parsing saved preferences: ${error}`);
        localStorage.removeItem('userPreferences');
        localStorage.removeItem('onboardingCompleted');
        setCurrentPage('onboarding');
      }
    } else {
      addDebug('No valid onboarding found, showing onboarding...');
      setCurrentPage('onboarding');
    }
  }, []);

  const handleOnboardingComplete = (preferences: UserPreferences) => {
    setUserPreferences(preferences);
    // Save to localStorage
    localStorage.setItem('userPreferences', JSON.stringify(preferences));
    localStorage.setItem('onboardingCompleted', 'true');
    setCurrentPage('home');
  };

  // Debug panel for development
  const isDevelopment = import.meta.env.DEV;
  
  if (currentPage === 'onboarding') {
    return (
      <div>
        <OnboardingFlow onComplete={handleOnboardingComplete} />
        {isDevelopment && debugInfo && (
          <div className="fixed top-0 right-0 bg-black text-white p-4 text-xs max-w-sm z-[9999] opacity-75">
            <h3 className="font-bold mb-2">Debug Info:</h3>
            <pre className="whitespace-pre-wrap">{debugInfo}</pre>
            <button 
              onClick={() => {
                localStorage.clear();
                window.location.reload();
              }}
              className="mt-2 bg-red-500 px-2 py-1 rounded text-white"
            >
              Clear All & Reload
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Debug panel for development */}
      {isDevelopment && debugInfo && currentPage === 'home' && showDebugPanel && (
        <div className="fixed top-0 right-0 bg-red-500 text-white p-4 text-xs max-w-sm z-[9999]">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-bold">⚠️ Onboarding Skipped - Debug Info:</h3>
            <button 
              onClick={() => setShowDebugPanel(false)}
              className="text-white hover:text-gray-300 font-bold text-lg leading-none"
              title="Hide debug panel"
            >
              ×
            </button>
          </div>
          <pre className="whitespace-pre-wrap">{debugInfo}</pre>
          <button 
            onClick={() => {
              localStorage.clear();
              setDebugInfo('');
              setCurrentPage('onboarding');
            }}
            className="mt-2 bg-white text-red-500 px-2 py-1 rounded font-bold"
          >
            Force Onboarding
          </button>
          <button 
            onClick={() => {
              localStorage.clear();
              window.location.reload();
            }}
            className="mt-2 ml-2 bg-black text-white px-2 py-1 rounded"
          >
            Clear & Reload
          </button>
        </div>
      )}
      
      {/* Show debug panel toggle when hidden */}
      {isDevelopment && !showDebugPanel && currentPage === 'home' && (
        <button 
          onClick={() => setShowDebugPanel(true)}
          className="fixed top-4 right-4 bg-gray-500 text-white px-3 py-1 rounded text-xs z-[9999]"
          title="Show debug panel"
        >
          Debug
        </button>
      )}
      
      {currentPage === 'home' && (
        <Home 
          userPreferences={userPreferences}
          onNavigateToProfile={() => setCurrentPage('profile')}
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
