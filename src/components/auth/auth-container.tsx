import React, { useState } from 'react';
import LoginForm from './login-form';
import RegisterForm from './register-form';
import ForgotPasswordForm from './forgot-password-form';
import { authenticateUser, registerUser } from '@/services/auth-service'; 
import type { LoginCredentials, User, RegisterCredentials } from '@/types/auth'; 
import { toast } from 'sonner'; 
import { motion } from 'framer-motion'; 

type AuthFormType = 'login' | 'register' | 'forgot-password';

interface AuthContainerProps {
  onAuthSuccess?: (user: User) => void; 
}

const AuthContainer: React.FC<AuthContainerProps> = ({ onAuthSuccess }) => {
  const [currentForm, setCurrentForm] = useState<AuthFormType>('login');
  const [error, setError] = useState<string | null>(null); 
  const [isLoading, setIsLoading] = useState(false); 
  const [isAuthSuccessful, setIsAuthSuccessful] = useState(false); 

  const showLoginForm = () => {
    setCurrentForm('login');
    setError(null); 
  }
  const showRegisterForm = () => {
    setCurrentForm('register');
    setError(null);
  }
  const showForgotPasswordForm = () => {
    setCurrentForm('forgot-password');
    setError(null);
  }

  const handleLogin = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const credentials: LoginCredentials = { email, password };
      const loginResponse = await authenticateUser(credentials);
      toast.success('Login Successful!', { 
        description: `Welcome back, ${loginResponse.user.firstName}!`,
        duration: 4000,
      });
      
      setIsAuthSuccessful(true);
      
      setTimeout(() => {
        if (onAuthSuccess) onAuthSuccess(loginResponse.user);
      }, 300);
    } catch (err: any) {
      const errorMessage = err.message || 'An unexpected error occurred during login.';
      setError(errorMessage); 
      toast.error('Login Failed', { 
        description: errorMessage,
        duration: 4000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (firstName: string, lastName: string, email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const credentials: RegisterCredentials = { firstName, lastName, email, password };
      await registerUser(credentials);
      toast.success('Registration Successful!', { 
        description: 'Please check your email to confirm your account.',
        duration: 5000, 
      });
      setCurrentForm('login');
    } catch (err: any) {
      const errorMessage = err.message || 'An unexpected error occurred during registration.';
      setError(errorMessage); 
      toast.error('Registration Failed', { 
        description: errorMessage,
        duration: 4000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = () => {
    setIsLoading(true);
    setError(null);

    // try {
    //   await resetPasswordService(email);
    //   toast.success('Password Reset Requested', { description: 'If an account exists for this email, you will receive reset instructions.'});
    // } catch (err:any) {
    //   const errorMessage = err.message || 'An unexpected error occurred during password reset.';
    //   setError(errorMessage);
    //   toast.error('Password Reset Failed', { description: errorMessage });
    // } finally {
    //   setIsLoading(false);
    // }
    setIsLoading(false);
  };

  const renderForm = () => {
    switch (currentForm) {
      case 'login':
        return (
          <LoginForm 
            key="login-form" 
            onLogin={handleLogin} 
            onForgotPassword={showForgotPasswordForm} 
            onRegisterClick={showRegisterForm} 
          />
        );
      case 'register':
        return (
          <RegisterForm 
            key="register-form" 
            onRegister={handleRegister} 
            onLoginClick={showLoginForm} 
          />
        );
      case 'forgot-password':
        return (
          <ForgotPasswordForm 
            key="forgot-password-form" 
            onResetPassword={handleResetPassword} 
            onBackToLogin={showLoginForm} 
          />
        );
      default:
        return null;
    }
  };

  return (
    <motion.div 
      className="w-full"
      animate={{ opacity: isAuthSuccessful ? 0 : 1 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      {/* Display global error message if exists */}
      {error && (
        <div className="hidden mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}
      
      {/* Show loading overlay */}
      {isLoading && (
        <div className="hidden absolute inset-0 bg-black/20 flex items-center justify-center z-10 rounded-lg">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      
      <div className="relative">
        {renderForm()}
      </div>
    </motion.div>
  );
};

export default AuthContainer; 