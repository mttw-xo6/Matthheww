import React, { useState } from 'react';
import { Habit } from '../types';
import { PlusIcon, TrashIcon } from './Icons';

interface HabitSelectorProps {
  habits: Habit[];
  selectedHabitId: string | null;
  onSelectHabit: (id: string) => void;
  onAddHabit: (name: string) => void;
  onDeleteHabit: (id: string) => void;
}

const HabitSelector: React.FC<HabitSelectorProps> = ({
  habits,
  selectedHabitId,
  onSelectHabit,
  onAddHabit,
  onDeleteHabit,
}) => {
  const [newHabitName, setNewHabitName] = useState('');

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddHabit(newHabitName);
    setNewHabitName('');
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-4 h-full flex flex-col">
      <h2 className="text-lg font-bold text-slate-800 mb-4 px-2">マイリスト</h2>
      <div className="flex-grow overflow-y-auto pr-1">
        {habits.length > 0 ? (
          <ul className="space-y-2">
            {habits.map(habit => (
              <li key={habit.id}>
                <button
                  onClick={() => onSelectHabit(habit.id)}
                  className={`w-full text-left p-3 rounded-lg flex justify-between items-center transition-colors duration-200 ${
                    selectedHabitId === habit.id
                      ? 'bg-indigo-100 text-indigo-800 font-semibold'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="truncate">{habit.name}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteHabit(habit.id);
                    }}
                    className="p-1 rounded-full text-slate-400 hover:bg-red-100 hover:text-red-600 opacity-50 hover:opacity-100"
                    aria-label={`Delete ${habit.name}`}
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-500 text-center py-4">
            新しい習慣を追加して始めましょう！
          </p>
        )}
      </div>
      <form onSubmit={handleAddSubmit} className="mt-4 pt-4 border-t border-slate-200">
        <label htmlFor="new-habit-name" className="sr-only">New habit name</label>
        <div className="flex gap-2">
          <input
            id="new-habit-name"
            type="text"
            value={newHabitName}
            onChange={(e) => setNewHabitName(e.target.value)}
            placeholder="新しい習慣を入力..."
            className="flex-grow w-full px-3 py-2 text-sm bg-slate-100 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            className="p-2 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-75 transition-colors"
            disabled={!newHabitName.trim()}
            aria-label="Add new habit"
          >
            <PlusIcon className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default HabitSelector;