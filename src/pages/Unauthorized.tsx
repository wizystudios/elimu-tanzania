
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const Unauthorized = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md max-w-md w-full text-center">
        <div className="text-red-500 dark:text-red-400 mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 mx-auto"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Hakuna Ruhusa
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Samahani, huna ruhusa ya kufikia ukurasa huu. Tafadhali wasiliana na msimamizi wako kama unahitaji msaada zaidi.
        </p>
        <div className="flex flex-col space-y-3">
          <Button onClick={handleGoBack} variant="outline">
            Rudi Nyuma
          </Button>
          <Button onClick={() => navigate('/dashboard')} variant="default">
            Nenda kwenye Dashboard
          </Button>
          <Button onClick={signOut} variant="destructive">
            Toka Kwenye Akaunti
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
