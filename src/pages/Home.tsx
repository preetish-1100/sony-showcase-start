import React from 'react';
import { Play, TrendingUp, Clock, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HomeProps {
  userPreferences: {
    phoneNumber?: string;
    languages: string[];
    genres: string[];
    contentTypes: string[];
    allowLocation: boolean;
  };
}

const Home: React.FC<HomeProps> = ({ userPreferences }) => {
  const hasPreferences = userPreferences.languages.length > 0 || 
                        userPreferences.genres.length > 0 || 
                        userPreferences.contentTypes.length > 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-md mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-primary">SonyLIV</h1>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
            </div>
          </div>
        </div>
      </header>

      {/* Welcome Message */}
      <div className="max-w-md mx-auto px-6 py-6">
        <div className="bg-gradient-to-r from-primary/10 to-sonyliv-success/10 rounded-xl p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Welcome to SonyLIV! 🎉
          </h2>
          <p className="text-gray-700">
            {hasPreferences ? 
              "Your personalized content is ready based on your preferences." :
              "Discover amazing content from around the world."
            }
          </p>
        </div>

        {/* Preferences Summary */}
        {hasPreferences && (
          <div className="bg-white rounded-xl p-6 shadow-sm border mb-6">
            <h3 className="font-semibold text-gray-800 mb-4">Your Preferences</h3>
            <div className="space-y-3">
              {userPreferences.languages.length > 0 && (
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="text-sm text-gray-700">
                    Languages: {userPreferences.languages.join(', ')}
                  </span>
                </div>
              )}
              {userPreferences.genres.length > 0 && (
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="text-sm text-gray-700">
                    Genres: {userPreferences.genres.join(', ')}
                  </span>
                </div>
              )}
              {userPreferences.contentTypes.length > 0 && (
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="text-sm text-gray-700">
                    Content: {userPreferences.contentTypes.join(', ')}
                  </span>
                </div>
              )}
              {userPreferences.allowLocation && (
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-sonyliv-success rounded-full"></div>
                  <span className="text-sm text-gray-700">
                    Location-based recommendations enabled
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Button className="h-16 flex flex-col items-center justify-center space-y-1">
            <Play className="w-6 h-6" />
            <span className="text-sm">Watch Now</span>
          </Button>
          <Button variant="outline" className="h-16 flex flex-col items-center justify-center space-y-1">
            <TrendingUp className="w-6 h-6 text-primary" />
            <span className="text-sm">Trending</span>
          </Button>
        </div>

        {/* Content Sections */}
        <div className="space-y-6">
          {/* Continue Watching */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Continue Watching</h3>
              <Clock className="w-5 h-5 text-gray-400" />
            </div>
            <div className="bg-gray-100 rounded-xl p-8 text-center">
              <p className="text-gray-500">Start watching to see your progress here</p>
            </div>
          </section>

          {/* Recommended */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {hasPreferences ? 'Recommended for You' : 'Popular Content'}
              </h3>
              <Star className="w-5 h-5 text-yellow-500" />
            </div>
            <div className="bg-gray-100 rounded-xl p-8 text-center">
              <p className="text-gray-500">
                {hasPreferences ? 
                  'Personalized recommendations based on your preferences' :
                  'Popular movies and shows'
                }
              </p>
            </div>
          </section>

          {/* Location-based (if enabled) */}
          {userPreferences.allowLocation && (
            <section>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Most Watched Near You</h3>
                <TrendingUp className="w-5 h-5 text-sonyliv-success" />
              </div>
              <div className="bg-gray-100 rounded-xl p-8 text-center">
                <p className="text-gray-500">Trending content in your area</p>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;