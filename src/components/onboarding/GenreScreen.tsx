import React, { useState } from 'react';
import OnboardingLayout from './OnboardingLayout';
import { Button } from '@/components/ui/button';

interface Genre {
  id: string;
  name: string;
  image: string;
  color: string;
}

interface GenreScreenProps {
  onNext: (selectedGenres: string[]) => void;
  onBack: () => void;
  onSkip: () => void;
}

const genres: Genre[] = [
  { id: 'action', name: 'Action', image: '🎬', color: 'from-red-500 to-orange-500' },
  { id: 'drama', name: 'Drama', image: '🎭', color: 'from-purple-500 to-pink-500' },
  { id: 'comedy', name: 'Comedy', image: '😄', color: 'from-yellow-500 to-green-500' },
  { id: 'romance', name: 'Romance', image: '💕', color: 'from-pink-500 to-red-500' },
  { id: 'thriller', name: 'Thriller', image: '🔥', color: 'from-gray-700 to-gray-900' },
  { id: 'horror', name: 'Horror', image: '👻', color: 'from-gray-800 to-black' },
  { id: 'documentary', name: 'Documentary', image: '📺', color: 'from-blue-500 to-teal-500' },
  { id: 'music', name: 'Music', image: '🎵', color: 'from-indigo-500 to-purple-500' },
  { id: 'sports', name: 'Sports', image: '⚽', color: 'from-green-500 to-blue-500' },
  { id: 'reality', name: 'Reality Shows', image: '📹', color: 'from-orange-500 to-red-500' },
];

const GenreScreen: React.FC<GenreScreenProps> = ({ onNext, onBack, onSkip }) => {
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);

  const toggleGenre = (genreId: string) => {
    setSelectedGenres(prev => 
      prev.includes(genreId) 
        ? prev.filter(id => id !== genreId)
        : [...prev, genreId]
    );
  };

  const handleContinue = () => {
    if (selectedGenres.length > 0) {
      onNext(selectedGenres);
    }
  };

  return (
    <OnboardingLayout
      step={3}
      totalSteps={6}
      title="What type of content do you love watching?"
      showBack={true}
      onBack={onBack}
    >
      <div className="space-y-8">
        {/* Genre Grid */}
        <div className="grid grid-cols-2 gap-4">
          {genres.map((genre) => (
            <button
              key={genre.id}
              onClick={() => toggleGenre(genre.id)}
              className={`genre-card ${
                selectedGenres.includes(genre.id) ? 'selected' : ''
              }`}
              style={{
                backgroundImage: `linear-gradient(135deg, rgba(0,0,0,0.4), rgba(0,0,0,0.6)), linear-gradient(135deg, ${genre.color.replace('from-', '').replace('to-', ', ')})`
              }}
            >
              <div className="relative z-10 flex flex-col items-center justify-center h-full text-white">
                <div className="text-3xl mb-2">{genre.image}</div>
                <div className="text-lg font-bold text-center">{genre.name}</div>
              </div>
            </button>
          ))}
        </div>

        {/* Selection Counter */}
        {selectedGenres.length > 0 && (
          <div className="text-center">
            <p className="text-sm text-gray-600">
              {selectedGenres.length} genre{selectedGenres.length > 1 ? 's' : ''} selected
            </p>
          </div>
        )}

        {/* Continue Button */}
        <div className="space-y-4">
          <Button
            onClick={handleContinue}
            disabled={selectedGenres.length === 0}
            className="w-full h-14 text-lg font-semibold rounded-xl"
            size="lg"
          >
            Continue →
          </Button>

          {/* Skip Option */}
          <div className="text-center">
            <button
              onClick={onSkip}
              className="text-gray-500 hover:text-gray-700 underline transition-colors"
            >
              Skip for now
            </button>
          </div>
        </div>
      </div>
    </OnboardingLayout>
  );
};

export default GenreScreen;