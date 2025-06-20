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

  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_BASE_URL}/api/auth/google/login`;
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
          Login
        </Button>

        <div className="-mt-1 relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-gray-600">
          <span className="relative z-10 bg-[#25282CFF] px-2 text-gray-400">
            Or continue with
          </span>
        </div>

        <Button 
          type="button" 
          variant="outline" 
          onClick={handleGoogleLogin}
          className="-mt-1 w-full flex items-center justify-center gap-2 bg-transparent hover:bg-[#303237FF] border-2 border-[#414448FF] h-10 rounded-full text-[#A7A8AAFF] hover:text-white"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5">
            <path
              d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
              fill="currentColor"
            />
          </svg>
          Google
        </Button>
      </form>
      
      <div className="mt-4 text-sm text-center">
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