
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { AlertTriangle, ArrowLeft, Home, LogOut } from 'lucide-react';

const Unauthorized = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md max-w-md w-full text-center">
        <div className="text-red-500 dark:text-red-400 mb-4">
          <AlertTriangle className="h-16 w-16 mx-auto" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Access Denied
        </h1>
        
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Sorry, you don't have permission to access this page. Please contact your administrator if you need additional access.
        </p>
        
        <div className="flex flex-col space-y-3">
          <Button onClick={handleGoBack} variant="outline" className="flex items-center justify-center space-x-2">
            <ArrowLeft className="h-4 w-4" />
            <span>Go Back</span>
          </Button>
          
          <Button onClick={() => navigate('/dashboard')} variant="default" className="flex items-center justify-center space-x-2">
            <Home className="h-4 w-4" />
            <span>Go to Dashboard</span>
          </Button>
          
          <Button onClick={handleSignOut} variant="destructive" className="flex items-center justify-center space-x-2">
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
