import { useState } from 'react';

function TimeZoneCard({ timeZone, currentTime, onRemove, showSeconds = false, use24Hour = false }) {
  const [isHovered, setIsHovered] = useState(false);

  const formatTime = (date, tz, showSeconds = false, use24Hour = false) => {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: tz.timeZone,
      hour: '2-digit',
      minute: '2-digit',
      ...(showSeconds && { second: '2-digit' }),
      hour12: !use24Hour,
    }).format(date);
  };

  const formatDate = (date, tz) => {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: tz.timeZone,
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  const getOffset = (tz) => {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: tz.timeZone,
      timeZoneName: 'short',
    });
    const parts = formatter.formatToParts(now);
    const tzName = parts.find((part) => part.type === 'timeZoneName')?.value || '';
    return tzName;
  };

  const time = formatTime(currentTime, timeZone, showSeconds, use24Hour);
  const date = formatDate(currentTime, timeZone);
  const offset = getOffset(timeZone);

  return (
    <div
      className="relative bg-secondary-700 rounded-xl p-6 w-[280px] border border-tertiary-600 hover:border-tertiary-500 transition-all duration-200 shadow-lg"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Remove Button */}
      {isHovered && (
        <button
          onClick={onRemove}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-error-500/20 hover:bg-error-500/40 border border-error-500/50 hover:border-error-500 flex items-center justify-center text-error-300 hover:text-error-100 transition-colors duration-200"
          aria-label="Remove time zone"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}

      {/* Time Zone Label */}
      <div className="text-quaternary-400 text-sm mb-2 font-medium">{timeZone.label}</div>

      {/* Time Display */}
      <div className="text-4xl font-mono font-bold text-accent-50 mb-2 tracking-tight">
        {time}
      </div>

      {/* Date and Offset */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-tertiary-600">
        <div className="text-quaternary-300 text-sm">{date}</div>
        <div className="text-quaternary-400 text-xs font-mono bg-tertiary-800/50 px-2 py-1 rounded">
          {offset}
        </div>
      </div>

      {/* Time Zone Name */}
      <div className="text-quaternary-500 text-xs mt-2 truncate" title={timeZone.timeZone}>
        {timeZone.timeZone.split('/').pop()?.replace(/_/g, ' ')}
      </div>
    </div>
  );
}

export default TimeZoneCard;

