import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, ArrowLeft } from 'lucide-react';

interface ForgotPasswordFormProps {
  onResetPassword: (email: string) => void;
  onBackToLogin: () => void;
}

const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ 
  onResetPassword, 
  onBackToLogin 
}) => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onResetPassword(email);
    setIsSubmitted(true);
  };

  return (
    <div className="w-full">
      <h2 className="text-2xl font-semibold text-center text-gray-100 mb-2">
        {isSubmitted ? "Check your email" : "Forgot password?"}
      </h2>
      <p className="text-center text-gray-400 mb-3">
        {!isSubmitted 
          ? "Enter the email you used to sign up"
          : `We sent a password reset link to ${email}`
        }
      </p>
      
      {!isSubmitted ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Mail size={18} />
              </div>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="pl-10 bg-[#3A3D44FF] border-2 border-[#4A4D54FF] text-gray-100 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>
          
          <Button 
            type="submit" 
            variant="secondary"
            className="w-full h-10 rounded-full bg-blue-500 hover:bg-blue-600 text-white font-semibold"
          >
            Send link
          </Button>
        </form>
      ) : (
        <div className="space-y-4">
          <p className="text-gray-300 text-center">
            If you didn't receive the email, check your spam folder or request it again
          </p>
          <Button 
            onClick={() => setIsSubmitted(false)} 
            className="w-full h-10 rounded-full bg-blue-500 hover:bg-blue-600 text-white font-semibold"
          >
            Send link again
          </Button>
        </div>
      )}
      
      <div className="mt-6 text-center">
        <Button 
          type="button"
          variant="link"
          onClick={onBackToLogin}
          className="text-blue-400 hover:text-blue-300 inline-flex items-center gap-1"
        >
          <ArrowLeft size={16} />
          Back to login
        </Button>
      </div>
    </div>
  );
};

export default ForgotPasswordForm; 