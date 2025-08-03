import React, { useState, useEffect } from 'react';

interface TimePickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const TimePicker: React.FC<TimePickerProps> = ({ value, onChange, placeholder = "Select Time", className = "" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedHours, setSelectedHours] = useState(0);
  const [selectedMinutes, setSelectedMinutes] = useState(0);
  const [selectedSeconds, setSelectedSeconds] = useState(0);

  // Parse initial value
  useEffect(() => {
    if (value) {
      const totalSeconds = parseInt(value);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      setSelectedHours(hours);
      setSelectedMinutes(minutes);
      setSelectedSeconds(seconds);
    }
  }, [value]);

  const formatTime = (hours: number, minutes: number, seconds: number) => {
    const totalSeconds = hours * 3600 + minutes * 60 + seconds;
    return totalSeconds.toString();
  };

  const handleTimeChange = (hours: number, minutes: number, seconds: number) => {
    setSelectedHours(hours);
    setSelectedMinutes(minutes);
    setSelectedSeconds(seconds);
    onChange(formatTime(hours, minutes, seconds));
  };

  const formatDisplayTime = (hours: number, minutes: number, seconds: number) => {
    if (hours === 0 && minutes === 0 && seconds === 0) {
      return placeholder;
    }
    return `${hours.toString().padStart(2, '0')} : ${minutes.toString().padStart(2, '0')} : ${seconds.toString().padStart(2, '0')}`;
  };

  const generateOptions = (max: number) => {
    return Array.from({ length: max + 1 }, (_, i) => i);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Display Input */}
      <div
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 cursor-pointer bg-white"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center justify-between">
          <span className={selectedHours === 0 && selectedMinutes === 0 && selectedSeconds === 0 ? "text-gray-500" : "text-gray-900"}>
            {formatDisplayTime(selectedHours, selectedMinutes, selectedSeconds)}
          </span>
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg">
          <div className="flex">
            {/* Hours Column */}
            <div className="flex-1 border-r border-gray-200">
              <div className="text-center py-2 font-medium text-sm text-gray-700 border-b border-gray-200">
                Hours
              </div>
              <div className="max-h-48 overflow-y-auto">
                {generateOptions(23).map((hour) => (
                  <div
                    key={hour}
                    className={`px-3 py-2 text-center cursor-pointer hover:bg-blue-50 ${
                      selectedHours === hour ? 'bg-blue-100 text-blue-700' : 'text-gray-700'
                    }`}
                    onClick={() => handleTimeChange(hour, selectedMinutes, selectedSeconds)}
                  >
                    {hour.toString().padStart(2, '0')}
                  </div>
                ))}
              </div>
            </div>

            {/* Minutes Column */}
            <div className="flex-1 border-r border-gray-200">
              <div className="text-center py-2 font-medium text-sm text-gray-700 border-b border-gray-200">
                Minutes
              </div>
              <div className="max-h-48 overflow-y-auto">
                {generateOptions(59).map((minute) => (
                  <div
                    key={minute}
                    className={`px-3 py-2 text-center cursor-pointer hover:bg-blue-50 ${
                      selectedMinutes === minute ? 'bg-blue-100 text-blue-700' : 'text-gray-700'
                    }`}
                    onClick={() => handleTimeChange(selectedHours, minute, selectedSeconds)}
                  >
                    {minute.toString().padStart(2, '0')}
                  </div>
                ))}
              </div>
            </div>

            {/* Seconds Column */}
            <div className="flex-1">
              <div className="text-center py-2 font-medium text-sm text-gray-700 border-b border-gray-200">
                Seconds
              </div>
              <div className="max-h-48 overflow-y-auto">
                {generateOptions(59).map((second) => (
                  <div
                    key={second}
                    className={`px-3 py-2 text-center cursor-pointer hover:bg-blue-50 ${
                      selectedSeconds === second ? 'bg-blue-100 text-blue-700' : 'text-gray-700'
                    }`}
                    onClick={() => handleTimeChange(selectedHours, selectedMinutes, second)}
                  >
                    {second.toString().padStart(2, '0')}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Set Button */}
          <div className="border-t border-gray-200 p-3">
            <button
              type="button"
              className="w-full bg-orange-500 text-white py-2 px-4 rounded-md hover:bg-orange-600 font-medium"
              onClick={() => setIsOpen(false)}
            >
              Set
            </button>
          </div>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default TimePicker; 