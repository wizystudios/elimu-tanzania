
import React from 'react';
import { Link } from 'react-router-dom';
import SchoolRegistrationForm from '@/components/registration/SchoolRegistrationForm';
import { Button } from '@/components/ui/button';

const Register = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <Link to="/" className="text-tanzanian-blue dark:text-tanzanian-blue hover:opacity-80 flex items-center gap-2">
            <span className="text-2xl font-bold">Elimu Tanzania</span>
          </Link>
          <Link to="/login">
            <Button variant="outline">Ingia</Button>
          </Link>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-2 text-tanzanian-blue dark:text-blue-400">
            Sajili Shule Yako
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-center mb-8">
            Jiunge na mfumo wa kisasa wa usimamizi wa shule Tanzania. 
            Jaza fomu hii kupata akaunti yako ya kipekee.
          </p>
          
          <SchoolRegistrationForm />
          
          <div className="mt-6 text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-2">Tayari una akaunti?</p>
            <Link to="/login">
              <Button variant="link" className="text-tanzanian-blue dark:text-blue-400">
                Ingia kwenye portal ya shule yako
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
