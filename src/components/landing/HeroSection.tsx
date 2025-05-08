
import React from 'react';
import { Button } from '@/components/ui/button';

const HeroSection: React.FC = () => {
  const scrollToRegister = () => {
    const registerSection = document.getElementById('register');
    if (registerSection) {
      registerSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="bg-gradient-to-b from-tanzanian-blue to-tanzanian-blue/90 text-white py-20 px-4 md:px-8">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between">
        <div className="md:w-1/2 mb-10 md:mb-0">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Elimu Tanzania School Management System
          </h1>
          <p className="text-xl mb-8 max-w-lg">
            A centralized, role-based platform designed specifically for Tanzanian schools of all levels.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button onClick={scrollToRegister} className="bg-white text-tanzanian-blue hover:bg-gray-100 hover:text-tanzanian-blue/90">
              Register Your School
            </Button>
            <Button variant="outline" className="bg-transparent border-white text-white hover:bg-white/10">
              Learn More
            </Button>
          </div>
        </div>
        <div className="md:w-1/2">
          <div className="bg-white rounded-lg shadow-xl p-2 md:p-4 transform rotate-2">
            <img 
              src="https://images.unsplash.com/photo-1605810230434-7631ac76ec81?q=80&w=1374&auto=format&fit=crop" 
              alt="Students using the system" 
              className="rounded w-full h-auto"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
