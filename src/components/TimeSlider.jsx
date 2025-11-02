import { useState, useEffect } from 'react';

function TimeSlider({ selectedTime, currentTime, isFollowingCurrentTime, onTimeChange, onSetToNow }) {
  const [hours, setHours] = useState(selectedTime.getHours());
  const [minutes, setMinutes] = useState(selectedTime.getMinutes());
  const [isUsingSlider, setIsUsingSlider] = useState(false);

  useEffect(() => {
    if (!isUsingSlider) {
      setHours(selectedTime.getHours());
      setMinutes(selectedTime.getMinutes());
    }
  }, [selectedTime, isUsingSlider]);

  // Sync with current time when using "Use Current Time" button
  useEffect(() => {
    if (!isUsingSlider && selectedTime.getTime() === new Date().getTime()) {
      const now = new Date();
      setHours(now.getHours());
      setMinutes(now.getMinutes());
    }
  }, [selectedTime, isUsingSlider]);

  const handleHoursChange = (newHours) => {
    setHours(newHours);
    setIsUsingSlider(true);
    const newDate = new Date(selectedTime);
    newDate.setHours(newHours, minutes, 0, 0);
    onTimeChange(newDate, true);
  };

  const handleMinutesChange = (newMinutes) => {
    setMinutes(newMinutes);
    setIsUsingSlider(true);
    const newDate = new Date(selectedTime);
    newDate.setHours(hours, newMinutes, 0, 0);
    onTimeChange(newDate, true);
  };

  const setToNow = () => {
    setIsUsingSlider(false);
    const now = new Date(currentTime);
    setHours(now.getHours());
    setMinutes(now.getMinutes());
    onSetToNow();
  };

  const quickSetTime = (targetHours, targetMinutes = 0) => {
    setIsUsingSlider(true);
    const newDate = new Date(selectedTime);
    newDate.setHours(targetHours, targetMinutes, 0, 0);
    setHours(targetHours);
    setMinutes(targetMinutes);
    onTimeChange(newDate, true);
  };

  const formatTime = (h, m) => {
    const hour12 = h % 12 || 12;
    const ampm = h < 12 ? 'AM' : 'PM';
    return `${hour12}:${m.toString().padStart(2, '0')} ${ampm}`;
  };

  const displayHour = hours % 12 || 12;
  const ampm = hours < 12 ? 'AM' : 'PM';

  return (
    <div className="bg-secondary-700 rounded-xl p-6 border border-tertiary-600">
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-quaternary-400">Set Time</label>
          <button
            onClick={setToNow}
            className="text-xs text-tertiary-400 hover:text-tertiary-300 px-3 py-1 rounded-lg bg-tertiary-800/50 hover:bg-tertiary-800 transition-colors"
          >
            Use Current Time
          </button>
        </div>

        {/* Current Selected Time Display */}
        <div className="text-center mb-6">
          {isFollowingCurrentTime ? (
            <>
              <div className="text-5xl font-mono font-bold text-accent-50 mb-1">
                {(() => {
                  const h = selectedTime.getHours();
                  const displayHour12 = h % 12 || 12;
                  return `${displayHour12}:${selectedTime.getMinutes().toString().padStart(2, '0')}:${selectedTime.getSeconds().toString().padStart(2, '0')}`;
                })()}
              </div>
              <div className="text-lg text-quaternary-400 font-medium">
                {selectedTime.getHours() < 12 ? 'AM' : 'PM'}
              </div>
              <div className="text-sm text-quaternary-500 mt-1">
                Live Time
              </div>
            </>
          ) : (
            <>
              <div className="text-5xl font-mono font-bold text-accent-50 mb-1">
                {displayHour}:{minutes.toString().padStart(2, '0')}
              </div>
              <div className="text-lg text-quaternary-400 font-medium">{ampm}</div>
              <div className="text-sm text-quaternary-500 mt-1">
                {formatTime(hours, minutes)} (24-hour: {hours.toString().padStart(2, '0')}:{minutes.toString().padStart(2, '0')})
              </div>
            </>
          )}
        </div>

        {/* Hours Slider */}
        <div className="mb-6">
          <label className="block text-sm text-quaternary-400 mb-3">
            Hour: <span className="text-accent-50 font-mono">{hours.toString().padStart(2, '0')}</span>
          </label>
            <input
            type="range"
            min="0"
            max="23"
            value={hours}
            onChange={(e) => handleHoursChange(parseInt(e.target.value))}
            className="w-full h-2 bg-tertiary-800 rounded-lg appearance-none cursor-pointer time-slider"
            style={{
              background: `linear-gradient(to right, 
                #415A77 0%, 
                #415A77 ${(hours / 23) * 100}%, 
                #1B263B ${(hours / 23) * 100}%, 
                #1B263B 100%)`
            }}
          />
          <div className="flex justify-between text-xs text-quaternary-500 mt-1">
            <span>12 AM</span>
            <span>6 AM</span>
            <span>12 PM</span>
            <span>6 PM</span>
            <span>11 PM</span>
          </div>
        </div>

        {/* Minutes Slider */}
        <div className="mb-4">
          <label className="block text-sm text-quaternary-400 mb-3">
            Minute: <span className="text-accent-50 font-mono">{minutes.toString().padStart(2, '0')}</span>
          </label>
            <input
            type="range"
            min="0"
            max="59"
            step="5"
            value={minutes}
            onChange={(e) => handleMinutesChange(parseInt(e.target.value))}
            className="w-full h-2 bg-tertiary-800 rounded-lg appearance-none cursor-pointer time-slider"
            style={{
              background: `linear-gradient(to right, 
                #415A77 0%, 
                #415A77 ${(minutes / 59) * 100}%, 
                #1B263B ${(minutes / 59) * 100}%, 
                #1B263B 100%)`
            }}
          />
          <div className="flex justify-between text-xs text-quaternary-500 mt-1">
            <span>0</span>
            <span>15</span>
            <span>30</span>
            <span>45</span>
            <span>59</span>
          </div>
        </div>

        {/* Quick Time Buttons */}
        <div className="grid grid-cols-4 gap-2 mt-6">
          <button
            onClick={() => quickSetTime(9, 0)}
            className="px-3 py-2 bg-tertiary-800 hover:bg-tertiary-700 text-quaternary-300 hover:text-accent-50 rounded-lg text-sm font-medium transition-colors"
          >
            9 AM
          </button>
          <button
            onClick={() => quickSetTime(12, 0)}
            className="px-3 py-2 bg-tertiary-800 hover:bg-tertiary-700 text-quaternary-300 hover:text-accent-50 rounded-lg text-sm font-medium transition-colors"
          >
            12 PM
          </button>
          <button
            onClick={() => quickSetTime(15, 0)}
            className="px-3 py-2 bg-tertiary-800 hover:bg-tertiary-700 text-quaternary-300 hover:text-accent-50 rounded-lg text-sm font-medium transition-colors"
          >
            3 PM
          </button>
          <button
            onClick={() => quickSetTime(18, 0)}
            className="px-3 py-2 bg-tertiary-800 hover:bg-tertiary-700 text-quaternary-300 hover:text-accent-50 rounded-lg text-sm font-medium transition-colors"
          >
            6 PM
          </button>
        </div>
      </div>
    </div>
  );
}

export default TimeSlider;

