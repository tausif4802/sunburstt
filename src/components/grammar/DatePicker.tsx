"use client";

import * as React from "react";
import type { DateRange } from "react-day-picker";
import type { RequiredDateRange } from "@/lib/utils";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTHS = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC",
];

import { getDefaultDateRange } from "@/lib/utils";

interface CustomDatePickerProps {
  onDateChange: (range: DateRange) => void;
  initialRange: RequiredDateRange;
}

export function CustomDatePicker({ onDateChange, initialRange }: CustomDatePickerProps) {
  const [dateRange, setDateRange] = React.useState<DateRange>({
    from: initialRange.from,
    to: initialRange.to
  });
  const [isOpen, setIsOpen] = React.useState(false);
  const [startMonth, setStartMonth] = React.useState(10); // November
  const [startYear, setStartYear] = React.useState(2024);
  const [endMonth, setEndMonth] = React.useState(11); // December
  const [endYear, setEndYear] = React.useState(2024);

  const getMonthDays = (month: number, year: number) => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];

    // Add empty cells for days before the first day of the month
    const firstDayOfWeek = firstDay.getDay() || 7; // Convert Sunday (0) to 7
    for (let i = 1; i < firstDayOfWeek; i++) {
      days.push(null);
    }

    // Add the days of the month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const isInRange = (date: Date) => {
    if (!dateRange?.from || !dateRange?.to) return false;
    return date >= dateRange.from && date <= dateRange.to;
  };

  const isSelected = (date: Date) => {
    if (!dateRange) return false;
    return (
      date.getTime() === dateRange.from?.getTime() ||
      date.getTime() === dateRange.to?.getTime()
    );
  };

  const handleDateClick = (date: Date) => {
    let newRange: DateRange;
    if (!dateRange?.from || (dateRange?.from && dateRange?.to)) {
      newRange = { from: date, to: undefined };
    } else {
      if (date < dateRange.from) {
        newRange = { from: date, to: dateRange.from };
      } else {
        newRange = { from: dateRange.from, to: date };
      }
    }
    setDateRange(newRange);
    onDateChange(newRange);
  };

  const formatDate = (date: Date) => {
    return `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 border rounded-full bg-white w-[210px] text-sm font-semibold"
      >
        <span>
          {dateRange?.from
            ? `${formatDate(dateRange.from)}${
                dateRange?.to ? ` - ${formatDate(dateRange.to)}` : ""
              }`
            : "Select date range"}
        </span>
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 p-5 bg-white border rounded-3xl z-50 w-[32rem] shadow-md">
          <div className="flex text-xs items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <select
                value={startMonth}
                onChange={(e) => setStartMonth(Number(e.target.value))}
                className="px-4 py-2"
              >
                {MONTHS.map((month, i) => (
                  <option key={month} value={i}>
                    {month}
                  </option>
                ))}
              </select>
              <select
                value={startYear}
                onChange={(e) => setStartYear(Number(e.target.value))}
                className="px-4 py-2"
              >
                {[2024, 2025].map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            <span className="text-gray-500">To</span>

            <div className="flex items-center gap-2">
              <select
                value={endMonth}
                onChange={(e) => setEndMonth(Number(e.target.value))}
                className="px-4 py-2"
              >
                {MONTHS.map((month, i) => (
                  <option key={month} value={i}>
                    {month}
                  </option>
                ))}
              </select>
              <select
                value={endYear}
                onChange={(e) => setEndYear(Number(e.target.value))}
                className="px-4 py-2"
              >
                {[2024, 2025].map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-10">
            {[
              { month: startMonth, year: startYear },
              { month: endMonth, year: endYear },
            ].map(({ month, year }, calendarIndex) => (
              <div key={`${month}-${year}`} className="flex-1">
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {DAYS.map((day) => (
                    <div
                      key={day}
                      className="text-center text-xs text-gray-500 h-8 flex items-center justify-center"
                    >
                      {day}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {getMonthDays(month, year).map((date, i) => {
                    if (!date) {
                      return <div key={`empty-${i}`} />;
                    }
                    const inRange = isInRange(date);
                    const selected = isSelected(date);
                    return (
                      <button
                        key={date.toISOString()}
                        onClick={() => handleDateClick(date)}
                        className={`
                         h-5 w-8 text-sm rounded-md flex items-center justify-center
                          ${
                            selected
                              ? "bg-teal-700 text-white rounded-s"
                              : inRange
                              ? "bg-teal-700 text-white"
                              : "hover:bg-gray-100"
                          }
                        `}
                      >
                        {date.getDate()}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
