
import React from 'react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  change?: {
    value: string | number;
    positive: boolean;
  };
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'indigo' | 'cyan' | 'emerald' | 'orange';
}

const StatCard = ({ title, value, icon, change, color = 'blue' }: StatCardProps) => {
  const colorClasses = {
    blue: {
      bg: 'bg-tanzanian-blue/10',
      icon: 'bg-tanzanian-blue/20 text-tanzanian-blue',
      text: 'text-tanzanian-blue'
    },
    green: {
      bg: 'bg-tanzanian-green/10',
      icon: 'bg-tanzanian-green/20 text-tanzanian-green',
      text: 'text-tanzanian-green'
    },
    yellow: {
      bg: 'bg-tanzanian-gold/10',
      icon: 'bg-tanzanian-gold/20 text-amber-600',
      text: 'text-amber-600'
    },
    red: {
      bg: 'bg-tanzanian-red/10',
      icon: 'bg-tanzanian-red/20 text-tanzanian-red',
      text: 'text-tanzanian-red'
    },
    purple: {
      bg: 'bg-tanzanian-purple/10',
      icon: 'bg-tanzanian-purple/20 text-tanzanian-purple',
      text: 'text-tanzanian-purple'
    },
    indigo: {
      bg: 'bg-indigo-100',
      icon: 'bg-indigo-200 text-indigo-600',
      text: 'text-indigo-600'
    },
    cyan: {
      bg: 'bg-cyan-100',
      icon: 'bg-cyan-200 text-cyan-600',
      text: 'text-cyan-600'
    },
    emerald: {
      bg: 'bg-emerald-100',
      icon: 'bg-emerald-200 text-emerald-600',
      text: 'text-emerald-600'
    },
    orange: {
      bg: 'bg-orange-100',
      icon: 'bg-orange-200 text-orange-600',
      text: 'text-orange-600'
    }
  };

  return (
    <div className={cn("rounded-xl p-6 shadow-sm border border-gray-100", colorClasses[color].bg)}>
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm text-gray-500">{title}</p>
          <h3 className="text-2xl font-bold">{value}</h3>
          {change && (
            <p className={`text-xs ${change.positive ? 'text-green-500' : 'text-red-500'} flex items-center`}>
              {change.positive ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
              {change.value}% since last month
            </p>
          )}
        </div>
        <div className={cn("p-3 rounded-full", colorClasses[color].icon)}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
