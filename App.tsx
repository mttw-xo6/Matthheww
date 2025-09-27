import React, { useState, useEffect, useRef } from 'react';
import { Habit, HabitStatus } from './types';
import HabitTracker from './components/HabitTracker';
import HabitSelector from './components/HabitSelector';
import { WelcomePlaceholder } from './components/Icons';
// FIX: Import `startOfDay` from its submodule to resolve export error.
import { format } from 'date-fns';
import { startOfDay } from 'date-fns/startOfDay';


const App: React.FC = () => {
  const [habits, setHabits] = useState<Habit[]>(() => {
    try {
      const savedHabits = localStorage.getItem('habits');
      if (savedHabits) {
        const parsedHabits = JSON.parse(savedHabits);
        return parsedHabits.map((habit: any) => ({
          ...habit,
          logs: habit.logs.map((log: string) => new Date(log)),
        }));
      }
    } catch (error) {
      console.error("Failed to parse habits from localStorage", error);
    }
    return [];
  });
  
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null);
  const habitsRef = useRef(habits);

  useEffect(() => {
    habitsRef.current = habits;
    localStorage.setItem('habits', JSON.stringify(habits));
  }, [habits]);

  useEffect(() => {
    if (!selectedHabitId && habits.length > 0) {
      setSelectedHabitId(habits[0].id);
    }
    if (selectedHabitId && !habits.some(h => h.id === selectedHabitId)) {
        setSelectedHabitId(habits.length > 0 ? habits[0].id : null);
    }
  }, [habits, selectedHabitId]);

  useEffect(() => {
    // Request notification permission on mount
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    const checkReminders = () => {
      if (Notification.permission !== 'granted') return;

      const now = new Date();
      const currentTime = format(now, 'HH:mm');
      const today = startOfDay(now).getTime();
      
      habitsRef.current.forEach(habit => {
        if (habit.reminder?.enabled && habit.reminder.time === currentTime) {
          const isLoggedToday = habit.logs.some(log => startOfDay(new Date(log)).getTime() === today);
          if (!isLoggedToday) {
            new Notification('習慣リマインダー', {
              body: `「${habit.name}」を記録する時間です！`,
              icon: '/vite.svg',
            });
          }
        }
      });
    };

    const intervalId = setInterval(checkReminders, 60000); // Check every minute
    return () => clearInterval(intervalId);
  }, []); // Run only once on mount

  const handleAddHabit = (name: string) => {
    if (name.trim() === '') return;
    const newHabit: Habit = {
      id: Date.now().toString(),
      name,
      logs: [],
      stats: {
        streak: 0,
        recoveryPoints: 0,
        status: HabitStatus.OnTrack,
        lastStreakBeforeReset: 0,
        longestStreak: 0,
      },
      reminder: {
        time: '19:00',
        enabled: false,
      },
    };
    setHabits(prev => [...prev, newHabit]);
    setSelectedHabitId(newHabit.id);
  };

  const handleDeleteHabit = (id: string) => {
    setHabits(prev => prev.filter(h => h.id !== id));
  };

  const handleUpdateHabit = (updatedHabit: Habit) => {
    setHabits(prev =>
      prev.map(h => (h.id === updatedHabit.id ? updatedHabit : h))
    );
  };

  const selectedHabit = habits.find(h => h.id === selectedHabitId);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col p-4 sm:p-6 lg:p-8">
      <header className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900">
          Habit Coach <span className="text-indigo-600">AI</span>
        </h1>
        <p className="mt-2 text-lg text-slate-600">
          AIと共に、継続を力に。
        </p>
      </header>
      <main className="flex-grow w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
        <div className="md:col-span-1 lg:col-span-1">
          <HabitSelector
            habits={habits}
            selectedHabitId={selectedHabitId}
            onSelectHabit={setSelectedHabitId}
            onAddHabit={handleAddHabit}
            onDeleteHabit={handleDeleteHabit}
          />
        </div>
        <div className="md:col-span-2 lg:col-span-3">
          {selectedHabit ? (
            <HabitTracker
              key={selectedHabit.id}
              habit={selectedHabit}
              onHabitUpdate={handleUpdateHabit}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full bg-white rounded-2xl shadow-lg p-8 text-center">
                <WelcomePlaceholder className="w-48 h-48 text-indigo-200" />
                <h2 className="mt-6 text-2xl font-bold text-slate-700">習慣トラッカーへようこそ！</h2>
                <p className="mt-2 text-slate-500">リストに新しい習慣を追加して、今日から始めましょう。</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;