import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';

interface LoginFormProps {
  onLogin: (email: string, password: string) => void;
  onForgotPassword: () => void;
  onRegisterClick: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ 
  onLogin, 
  onForgotPassword, 
  onRegisterClick 
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(email, password);
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="w-full">
      <h2 className="text-2xl font-semibold text-center text-gray-100 mb-4">Sign In!</h2>
      
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
        
        <div className="space-y-1">
          <div className="flex justify-end">
            <Button 
              type="button" 
              variant="link" 
              onClick={onForgotPassword}
              className="text-sm text-blue-400 hover:text-blue-300 px-0 h-auto"
            >
              Forgot password?
            </Button>
          </div>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Lock size={18} />
            </div>
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="pl-10 pr-10 bg-[#3A3D44FF] border-2 border-[#4A4D54FF] text-gray-100 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500"
              required
            />
            <Button
              type="button"
              variant="ghost"
              onClick={toggleShowPassword}
              className="absolute right-1 top-0 h-full px-2 text-gray-400 hover:text-gray-300 bg-transparent hover:bg-transparent"
            >
              {showPassword ? <EyeOff size={18} className="!h-5 !w-5" /> : <Eye size={18} className="!h-5 !w-5" />}
            </Button>
          </div>
        </div>
        
        <Button 
          type="submit" 
          variant="secondary"
          className="w-full h-10 rounded-full bg-blue-500 hover:bg-blue-600 text-white font-semibold"
        >
          Sign In
        </Button>
      </form>
      
      <div className="mt-6 text-center">
        <p className="text-gray-400">
          Don't have an account?{' '}
          <Button 
            type="button" 
            variant="link" 
            onClick={onRegisterClick}
            className="text-blue-400 hover:text-blue-300 px-1 h-auto"
          >
            Sign Up!
          </Button>
        </p>
      </div>
    </div>
  );
};

export default LoginForm; 