import React, { useState } from 'react';
import { MapPin, Check, X, Shield } from 'lucide-react';
import OnboardingLayout from './OnboardingLayout';
import { Button } from '@/components/ui/button';

interface LocationScreenProps {
  onNext: (allowLocation: boolean) => void;
  onBack: () => void;
}

const LocationScreen: React.FC<LocationScreenProps> = ({ onNext, onBack }) => {
  const [selectedOption, setSelectedOption] = useState<'allow' | 'later' | null>(null);
  const [isRequesting, setIsRequesting] = useState(false);

  const handleAllowLocation = async () => {
    setSelectedOption('allow');
    setIsRequesting(true);
    
    // Simulate location permission request
    setTimeout(() => {
      setIsRequesting(false);
      onNext(true);
    }, 1500);
  };

  const handleMaybeLater = () => {
    setSelectedOption('later');
    onNext(false);
  };

  return (
    <OnboardingLayout
      step={5}
      totalSteps={6}
      title="Find content trending near you"
      showBack={true}
      onBack={onBack}
    >
      <div className="space-y-8">
        {/* Location Icon */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-full mb-6">
            <MapPin className="w-10 h-10 text-primary" />
          </div>
        </div>

        {/* Benefits List */}
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-6 h-6 bg-sonyliv-success/10 rounded-full flex items-center justify-center mt-0.5">
              <Check className="w-4 h-4 text-sonyliv-success" />
            </div>
            <p className="text-gray-700">See what's popular in your area</p>
          </div>
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-6 h-6 bg-sonyliv-success/10 rounded-full flex items-center justify-center mt-0.5">
              <Check className="w-4 h-4 text-sonyliv-success" />
            </div>
            <p className="text-gray-700">Discover regional favorites</p>
          </div>
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-6 h-6 bg-sonyliv-success/10 rounded-full flex items-center justify-center mt-0.5">
              <Check className="w-4 h-4 text-sonyliv-success" />
            </div>
            <p className="text-gray-700">Get location-based recommendations</p>
          </div>
        </div>

        {/* Privacy Note */}
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Shield className="w-5 h-5 text-gray-600" />
            <span className="font-semibold text-gray-800">Privacy Protected</span>
          </div>
          <p className="text-sm text-gray-600">
            We only use city-level location data to show trending content. Your exact location is never stored or shared.
          </p>
        </div>

        {/* Permission Options */}
        <div className="space-y-4">
          {/* Allow Location */}
          <button
            onClick={handleAllowLocation}
            disabled={isRequesting}
            className={`w-full p-6 rounded-xl border-2 transition-all duration-300 ${
              selectedOption === 'allow'
                ? 'border-sonyliv-success bg-sonyliv-success text-white shadow-lg'
                : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
            }`}
          >
            <div className="flex items-center space-x-4">
              <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                selectedOption === 'allow' ? 'bg-white/20' : 'bg-sonyliv-success/10'
              }`}>
                {isRequesting ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Check className={`w-6 h-6 ${
                    selectedOption === 'allow' ? 'text-white' : 'text-sonyliv-success'
                  }`} />
                )}
              </div>
              <div className="flex-1 text-left">
                <h3 className="text-lg font-bold mb-1">
                  {isRequesting ? 'Requesting Permission...' : 'Yes, show me local trends'}
                </h3>
                <p className={`text-sm ${
                  selectedOption === 'allow' ? 'text-white/80' : 'text-gray-600'
                }`}>
                  We'll add 'Most Watched Near You' section
                </p>
              </div>
            </div>
          </button>

          {/* Maybe Later */}
          <button
            onClick={handleMaybeLater}
            className={`w-full p-6 rounded-xl border-2 transition-all duration-300 ${
              selectedOption === 'later'
                ? 'border-gray-400 bg-gray-100 shadow-lg'
                : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
            }`}
          >
            <div className="flex items-center space-x-4">
              <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                selectedOption === 'later' ? 'bg-gray-200' : 'bg-gray-100'
              }`}>
                <X className="w-6 h-6 text-gray-600" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="text-lg font-bold mb-1 text-gray-800">Maybe later</h3>
                <p className="text-sm text-gray-600">
                  You can enable this anytime in settings
                </p>
              </div>
            </div>
          </button>
        </div>

        {/* Privacy Link */}
        <div className="text-center">
          <button className="text-primary hover:text-primary/80 underline text-sm transition-colors">
            Learn about our privacy policy
          </button>
        </div>
      </div>
    </OnboardingLayout>
  );
};

export default LocationScreen;