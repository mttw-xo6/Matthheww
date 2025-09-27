import React, { useState, useMemo } from 'react';
import { HabitStatus, Habit, HabitStats } from '../types';
import getMotivationalFeedback from '../services/geminiService';
import StatsDisplay from './StatsDisplay';
import CalendarView from './CalendarView';
import ActionPanel from './ActionPanel';
import Modal from './Modal';
// FIX: Import `startOfDay` from its submodule to resolve export error.
import { addDays } from 'date-fns';
import { startOfDay } from 'date-fns/startOfDay';
import { BellIcon } from './Icons';

interface HabitTrackerProps {
  habit: Habit;
  onHabitUpdate: (updatedHabit: Habit) => void;
}

const calculateUpdatedStats = (
  initialLogs: Date[],
  initialStats: HabitStats,
  today: Date
): { newLogs: Date[]; newStats: HabitStats } => {
  let logs = [...initialLogs];
  let stats = { ...initialStats };

  const sortedLogs = logs.sort((a, b) => b.getTime() - a.getTime());
  let uniqueLogsSet = new Set(sortedLogs.map(d => startOfDay(d).getTime()));
  
  const yesterday = addDays(today, -1);
  
  const isTryingToRecover = stats.status === HabitStatus.StreakLost || stats.status === HabitStatus.InRecovery;
  const hasLoggedRecoveryDays = uniqueLogsSet.has(today.getTime()) && uniqueLogsSet.has(yesterday.getTime());

  if (isTryingToRecover && hasLoggedRecoveryDays) {
      const patchDay = addDays(today, -2);
      if (!uniqueLogsSet.has(patchDay.getTime())) {
          logs.push(patchDay);
          uniqueLogsSet.add(patchDay.getTime());
          stats.recoveryPoints += 1;
      }
  }

    let longestStreak = 0;
    if (logs.length > 0) {
        let currentSegmentStreak = 0;
        const sortedUniqueLogs = Array.from(uniqueLogsSet).sort((a,b) => a - b);
        const firstDay = new Date(sortedUniqueLogs[0]);
        let cursor = firstDay;
        
        while(cursor <= today) {
            if(uniqueLogsSet.has(cursor.getTime())) {
                currentSegmentStreak++;
            } else {
                 if (currentSegmentStreak > longestStreak) {
                    longestStreak = currentSegmentStreak;
                }
                currentSegmentStreak = 0;
            }
            cursor = addDays(cursor, 1);
        }
        if (currentSegmentStreak > longestStreak) {
            longestStreak = currentSegmentStreak;
        }
    }


  const dayBeforeYesterday = addDays(today, -2);

  let streak = 0;
  let status = HabitStatus.OnTrack;
  let lastStreak = stats.lastStreakBeforeReset;

  if (uniqueLogsSet.has(today.getTime()) || uniqueLogsSet.has(yesterday.getTime())) {
    let cursor = uniqueLogsSet.has(today.getTime()) ? today : yesterday;
    let missedOne = false;
    while (true) {
      if (uniqueLogsSet.has(cursor.getTime())) {
        streak++;
        missedOne = false;
      } else {
        if (missedOne) break; 
        missedOne = true;
      }
      cursor = addDays(cursor, -1);
    }
  }

  const missedYesterday = !uniqueLogsSet.has(yesterday.getTime());
  const missedDayBefore = !uniqueLogsSet.has(dayBeforeYesterday.getTime());

  if (missedYesterday && missedDayBefore) {
      if (initialStats.streak > 0) {
          status = HabitStatus.StreakLost;
          lastStreak = initialStats.streak;
          streak = 0;
      }
  } else if (missedYesterday) {
    if(streak > 0){
        status = HabitStatus.MissedOne;
    }
  }
  
  if (initialStats.status === HabitStatus.StreakLost && status === HabitStatus.StreakLost) {
      status = HabitStatus.InRecovery;
  }

  if (uniqueLogsSet.has(today.getTime())) {
    status = HabitStatus.OnTrack;
  }

  const finalStats: HabitStats = {
    ...stats,
    streak,
    status,
    lastStreakBeforeReset: lastStreak,
    longestStreak: Math.max(initialStats.longestStreak, longestStreak, streak)
  };

  return { newLogs: logs, newStats: finalStats };
};


const HabitTracker: React.FC<HabitTrackerProps> = ({ habit, onHabitUpdate }) => {
  const [aiFeedback, setAiFeedback] = useState<string>('');
  const [isFeedbackLoading, setIsFeedbackLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRecoveryModalOpen, setIsRecoveryModalOpen] = useState(false);

  const { name: habitName, logs, stats, reminder } = habit;

  const loggedDatesSet = useMemo(() => new Set(logs.map(d => startOfDay(d).getTime())), [logs]);
  const today = useMemo(() => startOfDay(new Date()), []);

  React.useEffect(() => {
    if (stats.status === HabitStatus.StreakLost && stats.recoveryPoints > 0 && !isRecoveryModalOpen) {
      setIsRecoveryModalOpen(true);
    }
  }, [stats.status, stats.recoveryPoints, isRecoveryModalOpen]);

  const handleLogToday = () => {
    if (loggedDatesSet.has(today.getTime())) {
      return;
    }
    const updatedLogs = [...logs, today];
    const { newLogs, newStats } = calculateUpdatedStats(updatedLogs, stats, today);
    onHabitUpdate({ ...habit, logs: newLogs, stats: newStats });
  };

  const handleUseRecoveryPoint = () => {
    const yesterday = addDays(today, -1);
    const updatedLogs = [...logs, yesterday];
    const tempStats = {
      ...stats,
      recoveryPoints: stats.recoveryPoints - 1,
    };
    const { newLogs, newStats } = calculateUpdatedStats(updatedLogs, tempStats, today);
    onHabitUpdate({ ...habit, logs: newLogs, stats: newStats });
    setIsRecoveryModalOpen(false);
  };
  
  const handleGetAIFeedback = async () => {
    setIsFeedbackLoading(true);
    setIsModalOpen(true);
    const feedback = await getMotivationalFeedback(habitName, stats);
    setAiFeedback(feedback);
    setIsFeedbackLoading(false);
  };
  
  const handleDeclineRecovery = () => {
    setIsRecoveryModalOpen(false);
    const updatedStats = { ...stats, status: HabitStatus.InRecovery };
    onHabitUpdate({ ...habit, stats: updatedStats });
  };

  const handleReminderChange = (change: { time?: string; enabled?: boolean }) => {
    onHabitUpdate({
      ...habit,
      reminder: {
        time: reminder?.time || '19:00',
        enabled: reminder?.enabled || false,
        ...change,
      },
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 w-full h-full transition-all duration-300">
      <h2 className="text-2xl font-bold text-slate-800 mb-2">{habitName}</h2>
      
      <div className="mb-6 border-b border-slate-200 pb-6">
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-3">
              <BellIcon className="w-5 h-5 text-slate-500" />
              <label htmlFor="reminder-toggle" className="font-medium text-slate-700 select-none">
                毎日リマインダー
              </label>
            </div>
            <div className="flex items-center gap-4">
              {reminder?.enabled && (
                <input
                  type="time"
                  value={reminder.time}
                  onChange={(e) => handleReminderChange({ time: e.target.value })}
                  className="px-2 py-1 text-sm bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              )}
              <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                <input
                    type="checkbox"
                    name="reminder-toggle"
                    id="reminder-toggle"
                    checked={reminder?.enabled || false}
                    onChange={(e) => handleReminderChange({ enabled: e.target.checked })}
                    className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                />
                <label htmlFor="reminder-toggle" className="toggle-label block overflow-hidden h-6 rounded-full bg-slate-300 cursor-pointer"></label>
              </div>
            </div>
          </div>
          <style>{`
            .toggle-checkbox:checked {
              right: 0;
              border-color: #4f46e5; /* indigo-600 */
            }
            .toggle-checkbox:checked + .toggle-label {
              background-color: #4f46e5; /* indigo-600 */
            }
          `}</style>
      </div>
      
      <StatsDisplay stats={stats} />

      <div className="my-8">
        <CalendarView logs={logs} />
      </div>

      <ActionPanel 
        isLoggedToday={loggedDatesSet.has(today.getTime())}
        onLogToday={handleLogToday}
        onGetAIFeedback={handleGetAIFeedback}
        status={stats.status}
      />
      
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="AIコーチからのフィードバック"
      >
        {isFeedbackLoading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <p className="text-slate-600 whitespace-pre-wrap leading-relaxed">{aiFeedback}</p>
        )}
      </Modal>

      <Modal
        isOpen={isRecoveryModalOpen}
        onClose={handleDeclineRecovery}
        title="継続がリセットされました"
      >
        <div className="text-center">
            <p className="text-slate-600 mb-6">
            継続が2日以上途切れましたが、リカバリーポイントを1つ使用して継続を救いますか？
            </p>
            <div className="flex justify-center gap-4">
                <button
                    onClick={handleUseRecoveryPoint}
                    className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-75 transition-colors"
                >
                    ポイントを使う
                </button>
                <button
                    onClick={handleDeclineRecovery}
                    className="px-6 py-2 bg-slate-200 text-slate-800 font-semibold rounded-lg hover:bg-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-opacity-75 transition-colors"
                >
                    使わない
                </button>
            </div>
        </div>
      </Modal>
    </div>
  );
};

export default HabitTracker;