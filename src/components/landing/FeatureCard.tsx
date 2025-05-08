
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => {
  return (
    <Card className="hover:shadow-lg transition-shadow dark:bg-gray-800 border dark:border-gray-700">
      <CardHeader className="flex flex-row items-center gap-4 pb-2">
        <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg">
          {icon}
        </div>
        <h3 className="text-xl font-bold dark:text-white">{title}</h3>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600 dark:text-gray-300">{description}</p>
      </CardContent>
    </Card>
  );
};

export default FeatureCard;
