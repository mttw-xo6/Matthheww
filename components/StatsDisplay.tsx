
import React from 'react';
import { HabitStats } from '../types';
import { FireIcon, ShieldCheckIcon, TrophyIcon } from './Icons';

interface StatsDisplayProps {
  stats: HabitStats;
}

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: number | string; color: string;}> = ({ icon, label, value, color }) => (
  <div className={`flex-1 p-4 rounded-xl flex items-center gap-4 bg-opacity-10 ${color}`}>
    <div className={`p-2 rounded-full ${color} bg-opacity-20`}>
      {icon}
    </div>
    <div>
      <div className="text-sm text-slate-600">{label}</div>
      <div className="text-2xl font-bold text-slate-800">{value}</div>
    </div>
  </div>
);

const StatsDisplay: React.FC<StatsDisplayProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <StatCard 
        icon={<FireIcon className="w-6 h-6 text-orange-500" />}
        label="現在の継続"
        value={`${stats.streak} 日`}
        color="bg-orange-100"
      />
      <StatCard 
        icon={<ShieldCheckIcon className="w-6 h-6 text-green-500" />}
        label="リカバリーポイント"
        value={stats.recoveryPoints}
        color="bg-green-100"
      />
      <StatCard 
        icon={<TrophyIcon className="w-6 h-6 text-yellow-500" />}
        label="最長継続"
        value={`${stats.longestStreak} 日`}
        color="bg-yellow-100"
      />
    </div>
  );
};

export default StatsDisplay;
