
import React from 'react';
import { HabitStatus } from '../types';
import { SparklesIcon } from './Icons';

interface ActionPanelProps {
  isLoggedToday: boolean;
  onLogToday: () => void;
  onGetAIFeedback: () => void;
  status: HabitStatus;
}

const StatusMessage: React.FC<{ status: HabitStatus }> = ({ status }) => {
    let message = '';
    let bgColor = '';
    switch (status) {
        case HabitStatus.OnTrack:
            message = '順調です！この調子で続けましょう。';
            bgColor = 'bg-green-100 text-green-800';
            break;
        case HabitStatus.MissedOne:
            message = '1日休みました。今日達成すれば継続は維持されます！';
            bgColor = 'bg-yellow-100 text-yellow-800';
            break;
        case HabitStatus.InRecovery:
            message = '復活チャンス！今日達成して継続を取り戻しましょう！';
            bgColor = 'bg-blue-100 text-blue-800';
            break;
        case HabitStatus.StreakLost:
            message = '継続が途切れました。今日から新たなスタートです！';
            bgColor = 'bg-red-100 text-red-800';
            break;
        default:
            return null;
    }
    return (
        <div className={`p-3 rounded-lg text-center text-sm font-medium ${bgColor}`}>
            {message}
        </div>
    );
};

const ActionPanel: React.FC<ActionPanelProps> = ({ isLoggedToday, onLogToday, onGetAIFeedback, status }) => {
  return (
    <div className="flex flex-col gap-4">
      <StatusMessage status={status} />
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={onLogToday}
          disabled={isLoggedToday}
          className="w-full sm:w-1/2 flex-1 px-6 py-3 text-lg font-bold text-white bg-indigo-600 rounded-xl shadow-lg hover:bg-indigo-700 disabled:bg-slate-400 disabled:cursor-not-allowed disabled:shadow-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-75 transition-all duration-300 transform hover:-translate-y-0.5"
        >
          {isLoggedToday ? '今日の習慣は達成済み' : '今日の習慣を記録'}
        </button>
        <button
          onClick={onGetAIFeedback}
          className="w-full sm:w-1/2 flex-1 px-6 py-3 text-lg font-semibold text-indigo-600 bg-white border-2 border-indigo-200 rounded-xl hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-75 transition-all duration-300 flex items-center justify-center gap-2 transform hover:-translate-y-0.5"
        >
          <SparklesIcon className="w-6 h-6" />
          <span>AIからの応援</span>
        </button>
      </div>
    </div>
  );
};

export default ActionPanel;
