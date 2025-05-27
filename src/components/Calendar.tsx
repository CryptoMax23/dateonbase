import { useState } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  setMonth,
  setYear,
} from 'date-fns';
import { useIsDateMinted } from '@/hooks/useIsDateMinted';
import { useMonthMintedDates } from '@/hooks/useMonthMintedDates';

interface CalendarProps {
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

// Generate years array from 1900 to 2025
const YEARS = Array.from({ length: 2025 - 1900 + 1 }, (_, i) => 1900 + i);

export default function Calendar({ selectedDate, onDateSelect }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date(2025, 0, 1));
  const selectedDateMinted = useIsDateMinted(selectedDate);
  const mintedDates = useMonthMintedDates(currentMonth);

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  const handleMonthChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newMonth = parseInt(event.target.value);
    setCurrentMonth(prevDate => setMonth(prevDate, newMonth));
  };

  const handleYearChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newYear = parseInt(event.target.value);
    setCurrentMonth(prevDate => setYear(prevDate, newYear));
  };

  return (
    <div className="bg-white rounded-lg p-4 shadow">
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2">
          <select
            value={currentMonth.getMonth()}
            onChange={handleMonthChange}
            className="px-3 py-1.5 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black font-semibold text-lg appearance-none bg-white cursor-pointer hover:border-gray-400"
          >
            {MONTHS.map((month, index) => (
              <option key={month} value={index} className="text-black font-normal">
                {month}
              </option>
            ))}
          </select>
          <select
            value={currentMonth.getFullYear()}
            onChange={handleYearChange}
            className="px-3 py-1.5 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black font-semibold text-lg appearance-none bg-white cursor-pointer hover:border-gray-400"
          >
            {YEARS.map(year => (
              <option key={year} value={year} className="text-black font-normal">
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div
            key={day}
            className="text-center text-sm font-medium text-gray-600 p-2"
          >
            {day}
          </div>
        ))}

        {Array.from({ length: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay() }).map((_, index) => (
          <div key={`empty-${index}`} className="p-2" />
        ))}

        {days.map((day) => {
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const dateId = parseInt(format(day, 'yyyyMMdd'));
          const isMinted = mintedDates[dateId];

          return (
            <button
              key={day.toISOString()}
              onClick={() => onDateSelect(day)}
              disabled={!isCurrentMonth}
              className={`
                p-2 w-full text-center rounded transition-colors
                ${isSelected 
                  ? 'bg-blue-500 text-white hover:bg-blue-600' 
                  : isMinted
                  ? 'bg-red-50 text-red-700 hover:bg-red-100'
                  : 'hover:bg-gray-100 text-gray-700'
                }
                ${!isCurrentMonth ? 'text-gray-300 cursor-not-allowed' : ''}
              `}
            >
              {format(day, 'd')}
            </button>
          );
        })}
      </div>
    </div>
  );
} 