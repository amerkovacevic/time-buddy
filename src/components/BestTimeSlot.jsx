import { useMemo } from 'react';

function BestTimeSlot({ timeZones, selectedTime }) {
  const workingHoursStart = 7; // 7 AM
  const workingHoursEnd = 17; // 5 PM (17:00)
  
  const bestSlots = useMemo(() => {
    if (timeZones.length < 2) {
      return [];
    }

    const slots = [];

    // Use the selected time's date as the base date
    const baseDate = new Date(selectedTime);
    const baseYear = baseDate.getUTCFullYear();
    const baseMonth = baseDate.getUTCMonth();
    const baseDay = baseDate.getUTCDate();

    // Test times throughout the day in UTC (check every 30 minutes)
    // We'll test a full 24 hours to find times that work for all timezones
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const testTime = new Date(Date.UTC(baseYear, baseMonth, baseDay, hour, minute, 0));

        // Check what this UTC time is in each timezone
        const timeZoneInfo = timeZones.map((tz) => {
          const formatter = new Intl.DateTimeFormat('en-US', {
            timeZone: tz.timeZone,
            hour: 'numeric',
            minute: '2-digit',
            hour12: false,
          });
          
          const parts = formatter.formatToParts(testTime);
          const tzHour = parseInt(parts.find((p) => p.type === 'hour')?.value || '0', 10);

          return {
            timeZone: tz,
            hour: tzHour,
            isWorkingHours: tzHour >= workingHoursStart && tzHour < workingHoursEnd,
          };
        });

        const workingCount = timeZoneInfo.filter((info) => info.isWorkingHours).length;
        const totalTimeZones = timeZones.length;

        // Calculate how close each timezone is to working hours
        // Score based on distance from 7am-5pm range (0 = in range, higher = further away)
        let distanceScore = 0;
        timeZoneInfo.forEach((info) => {
          const hour = info.hour;
          if (hour < workingHoursStart) {
            // Before 7am - add distance from 7am
            distanceScore += (workingHoursStart - hour);
          } else if (hour >= workingHoursEnd) {
            // After 5pm - add distance from 5pm
            distanceScore += (hour - workingHoursEnd + 1);
          }
          // If in range, distanceScore stays 0
        });

        if (workingCount === totalTimeZones) {
          // All timezones are in working hours
          slots.push({
            time: testTime,
            timeZoneInfo,
            score: workingCount,
            distanceScore: 0, // Perfect match
            isWorkingHours: true,
          });
        } else if (workingCount >= Math.ceil(totalTimeZones * 0.75)) {
          // At least 75% of timezones are in working hours
          slots.push({
            time: testTime,
            timeZoneInfo,
            score: workingCount,
            distanceScore: distanceScore,
            isWorkingHours: true,
          });
        } else {
          // Not ideal, but still record it for fallback
          slots.push({
            time: testTime,
            timeZoneInfo,
            score: workingCount,
            distanceScore: distanceScore,
            isWorkingHours: false,
          });
        }
      }
    }

    // Separate working hours slots from non-working hours slots
    const workingSlots = slots.filter((s) => s.isWorkingHours);
    const fallbackSlots = slots.filter((s) => !s.isWorkingHours);

    // If we have working hours slots, sort and return those
    if (workingSlots.length > 0) {
      workingSlots.sort((a, b) => {
        if (b.score !== a.score) {
          return b.score - a.score;
        }
        return a.time.getTime() - b.time.getTime();
      });
      return workingSlots.slice(0, 3);
    }

    // Otherwise, use fallback: sort by distance score (closest to working hours first)
    // and then by how many are close to working hours
    fallbackSlots.sort((a, b) => {
      // First, prioritize by distance score (lower is better - closer to working hours)
      if (a.distanceScore !== b.distanceScore) {
        return a.distanceScore - b.distanceScore;
      }
      // Then prioritize slots with more timezones in or near working hours
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      // Finally, sort by time
      return a.time.getTime() - b.time.getTime();
    });

    // Return top 3 fallback slots (closest to working hours)
    return fallbackSlots.slice(0, 3);
  }, [timeZones, selectedTime]);

  if (timeZones.length < 2) {
    return null;
  }

  const formatTime = (date, timeZone) => {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: timeZone || undefined,
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  };

  const formatTimeForTZ = (date, timeZone) => {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: timeZone,
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  };

  return (
    <div className="bg-secondary-700 rounded-xl p-6 border border-tertiary-600 mt-6">
      <h3 className="text-lg font-display font-semibold text-accent-50 mb-4">
        Best Meeting Times
      </h3>
      <p className="text-xs text-quaternary-400 mb-4">
        Suggested times when all time zones are within working hours (7 AM - 5 PM)
      </p>

      {bestSlots.length > 0 ? (
        <div className="space-y-3">
          {bestSlots.map((slot, index) => {
            const isBest = index === 0 && slot.score === timeZones.length && slot.isWorkingHours;
            const hasWorkingHours = bestSlots.some((s) => s.isWorkingHours);
            const showWarning = !hasWorkingHours && index === 0;
            return (
              <div
                key={slot.time.getTime()}
                className={`rounded-lg p-4 border transition-all duration-200 ${
                  isBest
                    ? 'bg-tertiary-800/50 border-tertiary-500'
                    : 'bg-secondary-800 border-tertiary-700'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="text-2xl font-mono font-bold text-accent-50">
                      {formatTime(slot.time, timeZones[0]?.timeZone)}
                    </div>
                    <div className="text-xs text-quaternary-500">
                      ({timeZones[0]?.label})
                    </div>
                    {isBest && (
                      <span className="text-xs font-medium text-success-400 bg-success-500/20 px-2 py-1 rounded">
                        Best Match
                      </span>
                    )}
                    {showWarning && (
                      <span className="text-xs font-medium text-warning-400 bg-warning-500/20 px-2 py-1 rounded">
                        Closest Match
                      </span>
                    )}
                    <span className="text-xs text-quaternary-400">
                      {slot.isWorkingHours
                        ? `${slot.score}/${timeZones.length} zones in working hours`
                        : `${slot.score}/${timeZones.length} zones close to working hours`}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  {timeZones.map((tz, tzIndex) => {
                    const tzHour = slot.timeZoneInfo[tzIndex].hour;
                    const isWorking = slot.timeZoneInfo[tzIndex].isWorkingHours;
                    return (
                      <div
                        key={tz.id}
                        className={`px-2 py-1 rounded ${
                          isWorking
                            ? 'bg-tertiary-800/30 text-quaternary-300'
                            : 'bg-error-500/20 text-error-400'
                        }`}
                      >
                        <div className="font-medium truncate">{tz.label}</div>
                        <div className="font-mono">
                          {formatTimeForTZ(slot.time, tz.timeZone)}
                        </div>
                        <div className="text-[10px] opacity-75">
                          {isWorking
                            ? 'Working hours'
                            : tzHour < workingHoursStart
                            ? `${workingHoursStart - tzHour}h before`
                            : `${tzHour - workingHoursEnd + 1}h after`}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-6 text-quaternary-400 text-sm">
          <p>No suitable meeting times found.</p>
          <p className="text-xs mt-2">
            Try adjusting the time or adding fewer time zones.
          </p>
        </div>
      )}
    </div>
  );
}

export default BestTimeSlot;

