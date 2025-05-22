import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { confirmEmail } from '@/services/auth-service';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

const ConfirmEmailPage: React.FC = () => {
  const { confirm_token } = useParams<{ confirm_token: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const processConfirmation = async () => {
      if (!confirm_token) {
        setError('Confirmation token is missing.');
        setIsLoading(false);
        return;
      }

      try {
        await confirmEmail(confirm_token);
        setIsSuccess(true);
        toast.success('Email Confirmed!', {
          description: 'Your account has been successfully verified. You can now log in.',
          duration: 4000,
        });
      } catch (err: any) {
        const errorMessage = err.message || 'An unexpected error occurred during email confirmation.';
        setError(errorMessage);
        toast.error('Email Confirmation Failed', {
          description: errorMessage,
          duration: 4000,
        });
      } finally {
        setIsLoading(false);
      }
    };

    processConfirmation();
  }, [confirm_token]);

  const handleGoToLogin = () => {
    navigate('/'); // Предполагается, что страница логина находится в корне или на /dashboard
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#292C31FF] text-gray-200 p-6">
        <Loader2 className="h-16 w-16 text-blue-500 animate-spin mb-4" />
        <p className="text-xl">Confirming your email...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#292C31FF] text-gray-200 p-6 text-center">
      {isSuccess ? (
        <>
          <CheckCircle className="h-20 w-20 text-green-500 mb-6" />
          <h1 className="text-3xl font-semibold mb-3">Email Successfully Confirmed!</h1>
          <p className="text-lg text-gray-400 mb-8">Your account is now active. You can proceed to login.</p>
          <Button 
            onClick={handleGoToLogin}
            variant="secondary"
            className="h-10 rounded-full bg-blue-500 hover:bg-blue-600 text-white font-semibold px-8"
          >
            Go to Login
          </Button>
        </>
      ) : (
        <>
          <XCircle className="h-20 w-20 text-red-500 mb-6" />
          <h1 className="text-3xl font-semibold mb-3">Email Confirmation Failed</h1>
          <p className="text-lg text-gray-400 mb-8">
            {error || 'Something went wrong. Please try the link again or contact support.'}
          </p>
          <Button 
            onClick={handleGoToLogin} 
            variant="outline"
            className="bg-transparent hover:bg-[#303237FF] border-2 border-[#414448FF] h-10 rounded-full text-[#A7A8AAFF] hover:text-white font-semibold px-8"
          >
            Back to Safety (Login)
          </Button>
        </>
      )}
    </div>
  );
};

export default ConfirmEmailPage; 