
import React from 'react';

interface ActivityItem {
  id: string;
  user: {
    name: string;
    avatar?: string;
  };
  action: string;
  target?: string;
  timestamp: string;
  status?: 'pending' | 'completed' | 'failed';
}

interface RecentActivitiesProps {
  activities: ActivityItem[];
}

const RecentActivities: React.FC<RecentActivitiesProps> = ({ activities }) => {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold mb-4">Recent Activities</h3>
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start space-x-3 p-2 hover:bg-gray-50 rounded-lg">
            <div className="h-9 w-9 rounded-full bg-tanzanian-blue/10 flex items-center justify-center overflow-hidden">
              {activity.user.avatar ? (
                <img src={activity.user.avatar} alt={activity.user.name} className="h-full w-full object-cover" />
              ) : (
                <span className="text-sm font-medium text-tanzanian-blue">
                  {activity.user.name.split(' ').map(name => name[0]).join('')}
                </span>
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm">
                <span className="font-medium">{activity.user.name}</span>{' '}
                {activity.action}
                {activity.target && <span className="font-medium"> {activity.target}</span>}
              </p>
              <span className="text-xs text-gray-500">{activity.timestamp}</span>
            </div>
            {activity.status && (
              <span
                className={`text-xs px-2 py-1 rounded-full ${
                  activity.status === 'completed'
                    ? 'bg-green-100 text-green-800'
                    : activity.status === 'pending'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {activity.status}
              </span>
            )}
          </div>
        ))}
      </div>
      <div className="mt-4 pt-2 border-t border-gray-100">
        <button className="text-sm text-tanzanian-blue hover:underline">View all activities</button>
      </div>
    </div>
  );
};

export default RecentActivities;
