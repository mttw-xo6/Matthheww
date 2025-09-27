
import React from 'react';
// FIX: Import 'startOfDay' and 'startOfWeek' from their submodules and 'ja' locale from its specific path to resolve export errors.
import { addDays, format, getDay } from 'date-fns';
import { startOfDay } from 'date-fns/startOfDay';
import { startOfWeek } from 'date-fns/startOfWeek';
import { ja } from 'date-fns/locale/ja';

interface CalendarViewProps {
  logs: Date[];
}

const CalendarView: React.FC<CalendarViewProps> = ({ logs }) => {
  const loggedDatesSet = new Set(logs.map(d => startOfDay(d).getTime()));
  const today = startOfDay(new Date());

  const daysToDisplay = 42;
  const startDate = startOfWeek(addDays(today, -(daysToDisplay - 1 - getDay(today))), { locale: ja });

  const days = [];
  for (let i = 0; i < daysToDisplay; i++) {
    days.push(addDays(startDate, i));
  }

  const dayNames = ['日', '月', '火', '水', '木', '金', '土'];

  return (
    <div className="bg-slate-50 p-4 rounded-xl">
      <div className="grid grid-cols-7 gap-1 text-center text-xs text-slate-500 mb-2">
        {dayNames.map(day => <div key={day}>{day}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map(day => {
          const isLogged = loggedDatesSet.has(day.getTime());
          const isToday = day.getTime() === today.getTime();
          const isFuture = day > today;

          let cellClasses = "w-full aspect-square rounded-md flex items-center justify-center transition-all duration-200";

          if (isFuture) {
            cellClasses += " bg-slate-100";
          } else if (isLogged) {
            cellClasses += " bg-indigo-500";
          } else {
            cellClasses += " bg-slate-200";
          }
          
          if(isToday){
             cellClasses += " ring-2 ring-offset-2 ring-indigo-500";
          }
          
          return (
            <div key={day.toISOString()} className={cellClasses} title={format(day, 'yyyy/MM/dd')}>
              <span className={`text-xs ${isLogged ? 'text-white' : 'text-slate-500'}`}>
                {format(day, 'd')}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarView;