import { useState, useEffect, useRef } from 'react';
import TimeZoneCard from './components/TimeZoneCard.jsx';
import AddTimeZoneButton from './components/AddTimeZoneButton.jsx';
import TimeSlider from './components/TimeSlider.jsx';
import BestTimeSlot from './components/BestTimeSlot.jsx';

function App() {
  const [timeZones, setTimeZones] = useState(() => {
    // Initialize with user's local timezone
    const localTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return [{ id: crypto.randomUUID(), timeZone: localTz, label: 'My Location' }];
  });
  
  const cardsContainerRef = useRef(null);
  const [shouldShowIntro, setShouldShowIntro] = useState(true);

  // Check if cards are wrapping to the next line
  useEffect(() => {
    const checkWrapping = () => {
      if (!cardsContainerRef.current) return;

      const container = cardsContainerRef.current;
      const cardElements = container.querySelectorAll('[class*="flex-shrink-0"]');
      
      if (cardElements.length === 0) {
        setShouldShowIntro(true);
        return;
      }

      // Check if any card is on a different line by comparing top positions
      // If all cards have the same top position (within a small tolerance), they're on one line
      let firstTop = null;
      let isWrapped = false;

      cardElements.forEach((card) => {
        const rect = card.getBoundingClientRect();
        if (firstTop === null) {
          firstTop = rect.top;
        } else {
          // If this card's top is significantly different, it's wrapped
          if (Math.abs(rect.top - firstTop) > 10) {
            isWrapped = true;
          }
        }
      });

      // Hide intro if cards have wrapped to next line
      setShouldShowIntro(!isWrapped);
    };

    // Check on mount and when timeZones change
    // Use a small delay to ensure layout is complete after DOM updates
    const timeoutId = setTimeout(checkWrapping, 50);

    // Also check on window resize
    window.addEventListener('resize', checkWrapping);

    return () => {
      window.removeEventListener('resize', checkWrapping);
      clearTimeout(timeoutId);
    };
  }, [timeZones]);

  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [isFollowingCurrentTime, setIsFollowingCurrentTime] = useState(true);
  const [use24Hour, setUse24Hour] = useState(() => {
    try {
      const stored = localStorage.getItem('timeFormat24Hour');
      return stored ? JSON.parse(stored) : false;
    } catch {
      return false;
    }
  });

  // Update current time every second (for "Use Current Time" button)
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);
      if (isFollowingCurrentTime) {
        setSelectedTime(now);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [isFollowingCurrentTime]);

  const addTimeZone = (timeZone, label) => {
    setTimeZones((prev) => {
      // Check if this timezone is already added
      const isDuplicate = prev.some((tz) => tz.timeZone === timeZone);
      if (isDuplicate) {
        return prev; // Don't add duplicates
      }
      return [...prev, { id: crypto.randomUUID(), timeZone, label }];
    });
  };

  const removeTimeZone = (id) => {
    setTimeZones((prev) => prev.filter((tz) => tz.id !== id));
  };

  const handleTimeChange = (newTime, isManualChange = false) => {
    setSelectedTime(newTime);
    if (isManualChange) {
      setIsFollowingCurrentTime(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary-800 text-accent-50">
      {/* Header */}
      <header className="bg-secondary-800 border-b border-tertiary-700 px-6 py-4">
        <div className="max-w-[1920px] mx-auto">
          <h1 className="text-3xl font-display font-bold text-accent-50">Time Bro</h1>
          <p className="text-quaternary-400 text-sm mt-1">Convert time zones effortlessly</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1920px] mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Time Slider */}
          <div className="lg:col-span-1">
            <TimeSlider 
              selectedTime={selectedTime} 
              currentTime={currentTime}
              isFollowingCurrentTime={isFollowingCurrentTime}
              onTimeChange={handleTimeChange}
              onSetToNow={() => setIsFollowingCurrentTime(true)}
            />
            <BestTimeSlot timeZones={timeZones} selectedTime={selectedTime} />
          </div>

          {/* Right Column - Time Zone Cards */}
          <div className="lg:col-span-2">
            {/* Instructions - Only show when cards fit on one line */}
            {shouldShowIntro && (
              <div className="bg-tertiary-800/50 border border-tertiary-600 rounded-lg p-6 text-center mb-6">
                <p className="text-quaternary-300 mb-2">
                  <strong className="text-accent-50">Welcome to Time Bro!</strong>
                </p>
                <p className="text-quaternary-400 text-sm">
                  Use the time slider to select any time, and see what time it is in different time zones. 
                  Click the "+" button to add more time zones.
                </p>
              </div>
            )}

            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-display font-semibold text-accent-50">
                Time Zones
              </h2>
              {/* 12hr/24hr Toggle */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-quaternary-400">12hr</span>
                <button
                  onClick={() => {
                    const newValue = !use24Hour;
                    setUse24Hour(newValue);
                    try {
                      localStorage.setItem('timeFormat24Hour', JSON.stringify(newValue));
                    } catch {
                      // Ignore localStorage errors
                    }
                  }}
                  className={`relative w-14 h-7 rounded-full transition-colors duration-200 ${
                    use24Hour ? 'bg-tertiary-600' : 'bg-secondary-600'
                  }`}
                >
                  <div
                    className={`absolute top-1 left-1 w-5 h-5 bg-accent-50 rounded-full transition-transform duration-200 ${
                      use24Hour ? 'translate-x-7' : 'translate-x-0'
                    }`}
                  />
                </button>
                <span className="text-sm text-quaternary-400">24hr</span>
              </div>
            </div>

            {/* Time Zone Cards Grid */}
            <div ref={cardsContainerRef} className="flex flex-wrap gap-4">
              {timeZones.map((tz) => (
                <div key={tz.id} className="flex-shrink-0">
                  <TimeZoneCard
                    timeZone={tz}
                    currentTime={selectedTime}
                    onRemove={() => removeTimeZone(tz.id)}
                    showSeconds={isFollowingCurrentTime}
                    use24Hour={use24Hour}
                  />
                </div>
              ))}
              <div className="flex-shrink-0">
                <AddTimeZoneButton onAdd={addTimeZone} existingTimeZones={timeZones} />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-tertiary-500/30 bg-primary-800/80 py-4 text-center text-xs text-quaternary-500">
        <p>&copy; {new Date().getFullYear()} Amer Kovacevic All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;

