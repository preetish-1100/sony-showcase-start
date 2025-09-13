import React, { useState, useRef, useEffect } from 'react';
import { Shield, RefreshCw } from 'lucide-react';
import OnboardingLayout from './OnboardingLayout';
import { Button } from '@/components/ui/button';

interface OTPScreenProps {
  phoneNumber: string;
  onNext: () => void;
  onBack: () => void;
  onEditNumber: () => void;
}

const OTPScreen: React.FC<OTPScreenProps> = ({ 
  phoneNumber, 
  onNext, 
  onBack, 
  onEditNumber 
}) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Timer for resend
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => {
        setResendTimer(resendTimer - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendTimer]);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return; // Prevent multiple characters
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      // Focus previous input on backspace if current is empty
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    if (otp.every(digit => digit !== '')) {
      setIsVerifying(true);
      // Simulate verification delay
      setTimeout(() => {
        setIsVerifying(false);
        onNext();
      }, 1500);
    }
  };

  const handleResendOTP = () => {
    if (canResend) {
      setResendTimer(30);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    }
  };

  const formatPhoneNumber = (number: string) => {
    return `+91 ${number.slice(0, 3)} ${number.slice(3, 6)} ${number.slice(6)}`;
  };

  const isComplete = otp.every(digit => digit !== '');

  return (
    <OnboardingLayout
      step={1}
      totalSteps={6}
      showBack={true}
      onBack={onBack}
      showProgress={false}
    >
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Verify your number
          </h2>
          <p className="text-gray-600 leading-relaxed">
            Enter the 6-digit code sent to
          </p>
          <div className="flex items-center justify-center mt-2">
            <span className="font-semibold text-gray-900">
              {formatPhoneNumber(phoneNumber)}
            </span>
            <button
              onClick={onEditNumber}
              className="ml-2 text-primary hover:text-primary/80 underline text-sm"
            >
              Edit
            </button>
          </div>
        </div>

        {/* OTP Input */}
        <div className="space-y-6">
          <div className="flex justify-center space-x-3">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="otp-input"
                autoFocus={index === 0}
              />
            ))}
          </div>

          {/* Verify Button */}
          <Button
            onClick={handleVerify}
            disabled={!isComplete || isVerifying}
            className="w-full h-14 text-lg font-semibold rounded-xl"
            size="lg"
          >
            {isVerifying ? (
              <div className="flex items-center">
                <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                Verifying...
              </div>
            ) : (
              'Verify'
            )}
          </Button>
        </div>

        {/* Resend Section */}
        <div className="text-center space-y-3">
          {!canResend ? (
            <p className="text-gray-500">
              Resend OTP in{' '}
              <span className="font-semibold text-primary">
                00:{resendTimer.toString().padStart(2, '0')}
              </span>
            </p>
          ) : (
            <button
              onClick={handleResendOTP}
              className="text-primary hover:text-primary/80 font-semibold transition-colors"
            >
              Didn't receive? Resend OTP
            </button>
          )}
          
          <p className="text-xs text-gray-500">
            Make sure you have a stable internet connection
          </p>
        </div>
      </div>
    </OnboardingLayout>
  );
};

export default OTPScreen;