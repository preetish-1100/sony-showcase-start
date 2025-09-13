import React, { useState } from 'react';
import { Smartphone } from 'lucide-react';
import OnboardingLayout from './OnboardingLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface WelcomeScreenProps {
  onNext: (phoneNumber: string) => void;
  onSkip: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onNext, onSkip }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isValid, setIsValid] = useState(false);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ''); // Remove non-digits
    if (value.length <= 10) {
      setPhoneNumber(value);
      setIsValid(value.length === 10);
    }
  };

  const formatPhoneNumber = (number: string) => {
    if (number.length >= 6) {
      return `${number.slice(0, 3)} ${number.slice(3, 6)} ${number.slice(6)}`;
    } else if (number.length >= 3) {
      return `${number.slice(0, 3)} ${number.slice(3)}`;
    }
    return number;
  };

  const handleGetOTP = () => {
    if (isValid) {
      onNext(phoneNumber);
    }
  };

  return (
    <OnboardingLayout
      step={1}
      totalSteps={6}
      showProgress={false}
    >
      <div className="space-y-8">
        {/* Phone Input Section */}
        <div className="space-y-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
              <Smartphone className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Let's get started
            </h2>
            <p className="text-gray-600">
              Enter your mobile number to continue
            </p>
          </div>

          {/* Phone Input */}
          <div className="space-y-4">
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center">
                <span className="text-gray-600 font-medium">+91</span>
                <div className="w-px h-6 bg-gray-300 mx-3"></div>
              </div>
              <Input
                type="tel"
                placeholder="Enter mobile number"
                value={formatPhoneNumber(phoneNumber)}
                onChange={handlePhoneChange}
                className="pl-20 h-14 text-lg border-2 focus:border-primary rounded-xl"
                maxLength={12} // Formatted length
              />
            </div>
            
            {phoneNumber.length > 0 && phoneNumber.length < 10 && (
              <p className="text-sm text-red-500 text-center">
                Please enter a valid 10-digit mobile number
              </p>
            )}
          </div>

          {/* Get OTP Button */}
          <Button
            onClick={handleGetOTP}
            disabled={!isValid}
            className="w-full h-14 text-lg font-semibold rounded-xl"
            size="lg"
          >
            Get OTP
          </Button>
        </div>

        {/* Skip Option */}
        <div className="text-center">
          <button
            onClick={onSkip}
            className="text-gray-500 hover:text-gray-700 underline transition-colors"
          >
            Skip for now
          </button>
        </div>

        {/* Privacy Note */}
        <div className="text-center">
          <p className="text-xs text-gray-500 leading-relaxed">
            By continuing, you agree to our Terms of Service and Privacy Policy.
            We'll send you a verification code via SMS.
          </p>
        </div>
      </div>
    </OnboardingLayout>
  );
};

export default WelcomeScreen;