import React from 'react';
import { UserPlus, Dumbbell, IndianRupee, ShieldCheck, Ban } from 'lucide-react';
import Button from '../../common/Button';

const RecentActivities = () => {
  const activities = [
    { id: 1, type: 'registration', text: 'New user registration', entity: 'Rahul Sharma', time: '10 mins ago', icon: UserPlus, color: 'text-blue-500', bg: 'bg-blue-100' },
    { id: 2, type: 'approval', text: 'New gym approved', entity: 'Titan Fitness', time: '1 hour ago', icon: Dumbbell, color: 'text-green-500', bg: 'bg-green-100' },
    { id: 3, type: 'payment', text: 'New payment received', entity: '₹12,000 from Gold\'s Gym', time: '2 hours ago', icon: IndianRupee, color: 'text-orange-500', bg: 'bg-orange-100' },
    { id: 4, type: 'trainer_approved', text: 'Trainer approved', entity: 'Priya Singh', time: '4 hours ago', icon: ShieldCheck, color: 'text-teal-500', bg: 'bg-teal-100' },
    { id: 5, type: 'suspended', text: 'Gym suspended', entity: 'Flex Fitness', time: '5 hours ago', icon: Ban, color: 'text-red-500', bg: 'bg-red-100' },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
      <h3 className="text-lg font-bold text-gray-900 mb-6">Recent Activities</h3>
      <div className="space-y-6">
        {activities.map((activity) => (
          <div key={activity.id} className="flex gap-4 items-start pb-6 border-b border-gray-100 last:border-0 last:pb-0">
            <div className={`p-2 rounded-full mt-1 ${activity.bg}`}>
              <activity.icon size={18} className={activity.color} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-800">{activity.text}</p>
              <p className="text-sm text-primary font-medium">{activity.entity}</p>
              <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 text-center">
        <Button variant="secondary" className="w-full sm:w-auto">Load More</Button>
      </div>
    </div>
  );
};

export default RecentActivities;
