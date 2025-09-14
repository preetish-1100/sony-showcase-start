// Debug utility for troubleshooting Sony LIV app issues
// Run in browser console or as a Node.js script

console.log('Sony LIV Debug Utilities');
console.log('=========================');

// Function to check localStorage state
function checkLocalStorage() {
  const onboardingCompleted = localStorage.getItem('onboardingCompleted');
  const userPreferences = localStorage.getItem('userPreferences');
  
  console.log('LocalStorage Status:');
  console.log('- Onboarding Completed:', onboardingCompleted);
  console.log('- User Preferences:', userPreferences);
  
  if (userPreferences) {
    try {
      const parsed = JSON.parse(userPreferences);
      console.log('- Parsed Preferences:', parsed);
    } catch (e) {
      console.log('- Error parsing preferences:', e.message);
    }
  }
}

// Function to reset onboarding
function resetOnboarding() {
  localStorage.removeItem('onboardingCompleted');
  localStorage.removeItem('userPreferences');
  console.log('Onboarding reset! Refresh the page to see onboarding flow.');
}

// Function to set test preferences
function setTestPreferences() {
  const testPrefs = {
    languages: ['hi', 'en', 'te'],
    genres: ['action', 'drama', 'comedy'],
    contentTypes: ['movies', 'series'],
    allowLocation: true,
    phoneNumber: '+91 9876543210'
  };
  
  localStorage.setItem('userPreferences', JSON.stringify(testPrefs));
  localStorage.setItem('onboardingCompleted', 'true');
  console.log('Test preferences set:', testPrefs);
  console.log('Refresh the page to see home with preferences.');
}

// Function to check movie IDs in use
function checkMovieIds() {
  const fallbackIds = ['1', '2', '3', '4', '5', '6'];
  const tmdbIds = ['628', '447365', '440472', '634649', '524434'];
  
  console.log('Movie ID Mapping:');
  console.log('- Fallback IDs (for banner/mock content):', fallbackIds);
  console.log('- TMDB IDs (for My List):', tmdbIds);
  console.log('- All these IDs should work in movie detail pages');
}

// Export functions for console use
window.debugUtils = {
  checkLocalStorage,
  resetOnboarding,
  setTestPreferences,
  checkMovieIds
};

// Run initial check
checkLocalStorage();
checkMovieIds();

console.log('\nAvailable functions:');
console.log('- debugUtils.checkLocalStorage() - Check current localStorage state');
console.log('- debugUtils.resetOnboarding() - Reset onboarding to show again');
console.log('- debugUtils.setTestPreferences() - Set test preferences');
console.log('- debugUtils.checkMovieIds() - Show movie ID mappings');