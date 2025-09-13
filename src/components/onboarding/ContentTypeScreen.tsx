import React, { useState } from 'react';
import { Film, Monitor, Trophy } from 'lucide-react';
import OnboardingLayout from './OnboardingLayout';
import { Button } from '@/components/ui/button';

interface ContentType {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  examples: string[];
}

interface ContentTypeScreenProps {
  onNext: (selectedTypes: string[]) => void;
  onBack: () => void;
  onSkip: () => void;
}

const contentTypes: ContentType[] = [
  {
    id: 'movies',
    title: 'Movies',
    description: 'Feature films, blockbusters, indie cinema',
    icon: <Film className="w-8 h-8" />,
    examples: ['🎬', '🎭', '🎪'],
  },
  {
    id: 'series',
    title: 'TV Shows & Series',
    description: 'Web series, TV shows, episodes',
    icon: <Monitor className="w-8 h-8" />,
    examples: ['📺', '🎯', '🔥'],
  },
  {
    id: 'sports',
    title: 'Sports',
    description: 'Live matches, highlights, sports shows',
    icon: <Trophy className="w-8 h-8" />,
    examples: ['⚽', '🏏', '🏀'],
  },
];

const ContentTypeScreen: React.FC<ContentTypeScreenProps> = ({ onNext, onBack, onSkip }) => {
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

  const toggleContentType = (typeId: string) => {
    setSelectedTypes(prev => 
      prev.includes(typeId) 
        ? prev.filter(id => id !== typeId)
        : [...prev, typeId]
    );
  };

  const handleContinue = () => {
    onNext(selectedTypes);
  };

  return (
    <OnboardingLayout
      step={4}
      totalSteps={6}
      title="What do you prefer watching?"
      showBack={true}
      onBack={onBack}
    >
      <div className="space-y-8">
        {/* Optional Badge */}
        <div className="text-center">
          <span className="inline-block px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-medium">
            Optional
          </span>
        </div>

        {/* Content Type Cards */}
        <div className="space-y-4">
          {contentTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => toggleContentType(type.id)}
              className={`w-full p-6 rounded-xl border-2 transition-all duration-300 ${
                selectedTypes.includes(type.id)
                  ? 'border-primary bg-primary text-primary-foreground shadow-lg'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
              }`}
            >
              <div className="flex items-center space-x-4">
                {/* Icon */}
                <div className={`flex-shrink-0 ${
                  selectedTypes.includes(type.id) ? 'text-white' : 'text-primary'
                }`}>
                  {type.icon}
                </div>

                {/* Content */}
                <div className="flex-1 text-left">
                  <h3 className="text-lg font-bold mb-1">{type.title}</h3>
                  <p className={`text-sm ${
                    selectedTypes.includes(type.id) ? 'text-white/80' : 'text-gray-600'
                  }`}>
                    {type.description}
                  </p>
                </div>

                {/* Examples */}
                <div className="flex space-x-1">
                  {type.examples.map((example, index) => (
                    <span key={index} className="text-xl">
                      {example}
                    </span>
                  ))}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Selection Counter */}
        {selectedTypes.length > 0 && (
          <div className="text-center">
            <p className="text-sm text-gray-600">
              {selectedTypes.length} type{selectedTypes.length > 1 ? 's' : ''} selected
            </p>
          </div>
        )}

        {/* Continue Button */}
        <div className="space-y-4">
          <Button
            onClick={handleContinue}
            className="w-full h-14 text-lg font-semibold rounded-xl"
            size="lg"
          >
            Continue →
          </Button>

          {/* Skip Option */}
          <div className="text-center">
            <button
              onClick={onSkip}
              className="text-primary hover:text-primary/80 font-semibold transition-colors"
            >
              Skip
            </button>
          </div>
        </div>
      </div>
    </OnboardingLayout>
  );
};

export default ContentTypeScreen;