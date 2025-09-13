import React, { useState } from 'react';
import { Check } from 'lucide-react';
import OnboardingLayout from './OnboardingLayout';
import { Button } from '@/components/ui/button';

interface Language {
  code: string;
  native: string;
  english: string;
}

interface LanguageScreenProps {
  onNext: (selectedLanguages: string[]) => void;
  onBack: () => void;
  onSkip: () => void;
}

const languages: Language[] = [
  { code: 'te', native: 'తెలుగు', english: 'Telugu' },
  { code: 'hi', native: 'हिंदी', english: 'Hindi' },
  { code: 'ta', native: 'தமிழ்', english: 'Tamil' },
  { code: 'ml', native: 'മലയാളം', english: 'Malayalam' },
  { code: 'kn', native: 'ಕನ್ನಡ', english: 'Kannada' },
  { code: 'bn', native: 'বাংলা', english: 'Bengali' },
  { code: 'gu', native: 'ગુજરાતી', english: 'Gujarati' },
  { code: 'mr', native: 'मराठी', english: 'Marathi' },
  { code: 'en', native: 'English', english: 'English' },
  { code: 'pa', native: 'ਪੰਜਾਬੀ', english: 'Punjabi' },
  { code: 'as', native: 'অসমীয়া', english: 'Assamese' },
  { code: 'or', native: 'ଓଡିଆ', english: 'Odia' },
];

const LanguageScreen: React.FC<LanguageScreenProps> = ({ onNext, onBack, onSkip }) => {
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);

  const toggleLanguage = (code: string) => {
    setSelectedLanguages(prev => 
      prev.includes(code) 
        ? prev.filter(lang => lang !== code)
        : [...prev, code]
    );
  };

  const handleContinue = () => {
    if (selectedLanguages.length > 0) {
      onNext(selectedLanguages);
    }
  };

  return (
    <OnboardingLayout
      step={2}
      totalSteps={6}
      title="Choose your preferred language"
      showBack={true}
      onBack={onBack}
    >
      <div className="space-y-8">
        {/* Language Grid */}
        <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto">
          {languages.map((language) => (
            <button
              key={language.code}
              onClick={() => toggleLanguage(language.code)}
              className={`language-card ${
                selectedLanguages.includes(language.code) ? 'selected' : ''
              }`}
            >
              <div className="text-sm font-bold mb-1">
                {language.native}
              </div>
              <div className="text-xs opacity-75">
                {language.english}
              </div>
              {selectedLanguages.includes(language.code) && (
                <div className="absolute top-1 right-1">
                  <Check className="w-4 h-4" />
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Selection Counter */}
        {selectedLanguages.length > 0 && (
          <div className="text-center">
            <p className="text-sm text-gray-600">
              {selectedLanguages.length} language{selectedLanguages.length > 1 ? 's' : ''} selected
            </p>
          </div>
        )}

        {/* Continue Button */}
        <div className="space-y-4">
          <Button
            onClick={handleContinue}
            disabled={selectedLanguages.length === 0}
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

export default LanguageScreen;