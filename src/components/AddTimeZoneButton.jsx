import { useState } from 'react';

// Top 20 most popular time zones for conversion worldwide
// Based on global business, travel, and technology hubs
const POPULAR_TIMEZONES = [
  { value: 'America/New_York', label: 'New York' },           // #1 - US East Coast (EST/EDT)
  { value: 'America/Los_Angeles', label: 'Los Angeles' },     // #2 - US West Coast (PST/PDT)
  { value: 'Europe/London', label: 'London' },                 // #3 - UK (GMT/BST)
  { value: 'Asia/Tokyo', label: 'Tokyo' },                    // #4 - Japan (JST)
  { value: 'Asia/Shanghai', label: 'Shanghai' },              // #5 - China (CST)
  { value: 'Europe/Paris', label: 'Paris' },                  // #6 - France/Central Europe (CET/CEST)
  { value: 'America/Chicago', label: 'Chicago' },              // #7 - US Central (CST/CDT)
  { value: 'Asia/Dubai', label: 'Dubai' },                    // #8 - UAE (GST)
  { value: 'Asia/Singapore', label: 'Singapore' },            // #9 - Singapore (SGT)
  { value: 'Asia/Kolkata', label: 'New Delhi (India)' },      // #10 - India (IST, UTC+5:30)
  { value: 'Australia/Sydney', label: 'Sydney' },            // #11 - Australia East (AEST/AEDT)
  { value: 'Europe/Berlin', label: 'Berlin' },                // #12 - Germany (CET/CEST)
  { value: 'America/Toronto', label: 'Toronto' },             // #13 - Canada East (EST/EDT)
  { value: 'Asia/Hong_Kong', label: 'Hong Kong' },            // #14 - Hong Kong (HKT)
  { value: 'Europe/Moscow', label: 'Moscow' },                // #15 - Russia (MSK)
  { value: 'America/Mexico_City', label: 'Mexico City' },    // #16 - Mexico (CST)
  { value: 'Asia/Bangkok', label: 'Bangkok' },               // #17 - Thailand (ICT)
  { value: 'America/Sao_Paulo', label: 'São Paulo' },        // #18 - Brazil (BRT)
  { value: 'Asia/Seoul', label: 'Seoul' },                   // #19 - South Korea (KST)
  { value: 'Europe/Rome', label: 'Rome' },                    // #20 - Italy (CET/CEST)
];

// UTC offsets
const UTC_OFFSETS = [
  { value: 'UTC-12', label: 'UTC-12', offset: -12 },
  { value: 'UTC-11', label: 'UTC-11', offset: -11 },
  { value: 'UTC-10', label: 'UTC-10', offset: -10 },
  { value: 'UTC-9', label: 'UTC-9', offset: -9 },
  { value: 'UTC-8', label: 'UTC-8', offset: -8 },
  { value: 'UTC-7', label: 'UTC-7', offset: -7 },
  { value: 'UTC-6', label: 'UTC-6', offset: -6 },
  { value: 'UTC-5', label: 'UTC-5', offset: -5 },
  { value: 'UTC-4', label: 'UTC-4', offset: -4 },
  { value: 'UTC-3', label: 'UTC-3', offset: -3 },
  { value: 'UTC-2', label: 'UTC-2', offset: -2 },
  { value: 'UTC-1', label: 'UTC-1', offset: -1 },
  { value: 'UTC+0', label: 'UTC+0', offset: 0 },
  { value: 'UTC+1', label: 'UTC+1', offset: 1 },
  { value: 'UTC+2', label: 'UTC+2', offset: 2 },
  { value: 'UTC+3', label: 'UTC+3', offset: 3 },
  { value: 'UTC+4', label: 'UTC+4', offset: 4 },
  { value: 'UTC+5', label: 'UTC+5', offset: 5 },
  { value: 'UTC+6', label: 'UTC+6', offset: 6 },
  { value: 'UTC+7', label: 'UTC+7', offset: 7 },
  { value: 'UTC+8', label: 'UTC+8', offset: 8 },
  { value: 'UTC+9', label: 'UTC+9', offset: 9 },
  { value: 'UTC+10', label: 'UTC+10', offset: 10 },
  { value: 'UTC+11', label: 'UTC+11', offset: 11 },
  { value: 'UTC+12', label: 'UTC+12', offset: 12 },
];

// Get all IANA time zones - includes all capital cities globally
// Intl.supportedValuesOf('timeZone') returns ALL IANA time zone identifiers,
// which comprehensively includes all capital cities and major cities worldwide
const getAllTimeZones = () => {
  try {
    const allTZ = Intl.supportedValuesOf('timeZone');
    
    // Validation: Check that major capital cities are present
    // This ensures "Search Cities" tab has comprehensive coverage
    const majorCapitals = [
      'America/Washington',      'Europe/London',      'Europe/Paris',       'Asia/Tokyo',
      'Asia/Beijing',            'Europe/Berlin',      'Europe/Rome',        'Europe/Madrid',
      'Asia/Jakarta',            'Africa/Cairo',       'America/Mexico_City', 'Europe/Moscow',
      'Asia/Delhi',              'Asia/Bangkok',       'Europe/Amsterdam',    'Europe/Brussels',
      'Europe/Stockholm',        'Europe/Warsaw',      'Asia/Seoul',         'Asia/Manila',
      'Asia/Dhaka',              'Asia/Karachi',       'Europe/Athens',      'Europe/Prague',
      'Europe/Dublin',           'Europe/Lisbon',      'Europe/Vienna',      'Asia/Riyadh',
      'Asia/Tehran',             'Africa/Lagos',       'Africa/Johannesburg', 'Africa/Nairobi',
      'America/Buenos_Aires',    'America/Santiago',   'America/Bogota',     'America/Lima',
      'Australia/Canberra',      'Pacific/Wellington',
    ];
    
    // Log validation in development (all capitals should be present)
    if (process.env.NODE_ENV === 'development') {
      const missing = majorCapitals.filter(capital => !allTZ.includes(capital));
      if (missing.length > 0) {
        console.warn('Some expected capital cities not found:', missing);
      } else {
        console.log('✓ All major capital cities validated in time zone list');
      }
    }
    
    return allTZ.map((tz) => {
      const parts = tz.split('/');
      let label = parts[parts.length - 1]?.replace(/_/g, ' ') || tz;
      
      // Add better labels for known cities and odd-offset time zones
      const knownLabels = {
        'Asia/Kolkata': 'Kolkata (India)',
        'Asia/Calcutta': 'Calcutta (India)',
        'Asia/Colombo': 'Colombo (Sri Lanka)',
        'Asia/Kabul': 'Kabul (Afghanistan)',
        'Asia/Kathmandu': 'Kathmandu (Nepal)',
        'Asia/Yangon': 'Yangon (Myanmar)',
        'Asia/Tehran': 'Tehran (Iran)',
        'America/St_Johns': 'St. John\'s (Canada)',
        'Australia/Adelaide': 'Adelaide (Australia)',
        'Australia/Darwin': 'Darwin (Australia)',
        'Australia/Eucla': 'Eucla (Australia)',
        'Pacific/Chatham': 'Chatham Islands (New Zealand)',
        'America/Washington': 'Washington D.C.',
        'Asia/Delhi': 'Delhi (India)',
        'Asia/Beijing': 'Beijing (China)',
        'Australia/Canberra': 'Canberra (Australia)',
      };
      
      return {
        value: tz,
        label: knownLabels[tz] || label,
      };
    });
  } catch {
    // Fallback if supportedValuesOf is not available
    return POPULAR_TIMEZONES;
  }
};

// Get usage count from localStorage
const getUsageCount = () => {
  try {
    const stored = localStorage.getItem('timeZoneUsage');
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

// Update usage count
const updateUsageCount = (timeZone) => {
  try {
    const usage = getUsageCount();
    usage[timeZone] = (usage[timeZone] || 0) + 1;
    localStorage.setItem('timeZoneUsage', JSON.stringify(usage));
  } catch {
    // Ignore localStorage errors
  }
};

function AddTimeZoneButton({ onAdd, existingTimeZones = [] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('popular'); // 'popular', 'cities', 'utc'

  const allTimeZones = getAllTimeZones();
  const usageCount = getUsageCount();
  
  // Get set of already added timezone values for quick lookup
  const existingTimeZoneValues = new Set(existingTimeZones.map((tz) => tz.timeZone));

  // Sort popular timezones by usage, then alphabetically
  const sortedPopular = [...POPULAR_TIMEZONES].sort((a, b) => {
    const aUsage = usageCount[a.value] || 0;
    const bUsage = usageCount[b.value] || 0;
    if (aUsage !== bUsage) {
      return bUsage - aUsage; // Higher usage first
    }
    return a.label.localeCompare(b.label);
  });

  const filteredPopular = sortedPopular.filter((tz) =>
    tz.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tz.value.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter all cities (for city search tab)
  const filteredAllCities = allTimeZones.filter((tz) =>
    tz.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tz.value.toLowerCase().includes(searchTerm.toLowerCase())
  );


  const filteredUTC = UTC_OFFSETS.filter((tz) =>
    tz.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectCity = (timeZone) => {
    // Check if already added
    if (existingTimeZoneValues.has(timeZone.value)) {
      return; // Don't add duplicates
    }
    updateUsageCount(timeZone.value);
    onAdd(timeZone.value, timeZone.label);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleSelectUTC = (utcOffset) => {
    // Convert UTC offset to IANA timezone format (Etc/GMT format)
    // Note: IANA timezone offsets are inverted (GMT-5 means UTC+5)
    const ianaOffset = -utcOffset.offset;
    const timeZoneId = ianaOffset === 0 ? 'Etc/UTC' : `Etc/GMT${ianaOffset >= 0 ? '+' : ''}${ianaOffset}`;
    
    // Check if already added
    if (existingTimeZoneValues.has(timeZoneId)) {
      return; // Don't add duplicates
    }
    
    onAdd(timeZoneId, utcOffset.label);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="w-[280px] h-[220px] bg-secondary-700 hover:bg-secondary-600 border-2 border-dashed border-tertiary-500 hover:border-tertiary-400 rounded-xl flex flex-col items-center justify-center transition-all duration-200 group"
      >
        <div className="w-12 h-12 rounded-full bg-tertiary-700 group-hover:bg-tertiary-600 flex items-center justify-center mb-3 transition-colors">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-accent-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </div>
        <span className="text-quaternary-400 group-hover:text-quaternary-300 text-sm font-medium">
          Add Time Zone
        </span>
      </button>

      {/* Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-primary-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => {
                    setIsOpen(false);
                    setSearchTerm('');
                    setActiveTab('popular');
                  }}
        >
          <div
            className="bg-secondary-800 rounded-xl border border-tertiary-600 shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b border-tertiary-700">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-display font-bold text-accent-50">Add Time Zone</h2>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    setSearchTerm('');
                    setActiveTab('popular');
                  }}
                  className="text-quaternary-400 hover:text-accent-50 transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search time zones..."
                  className="w-full bg-secondary-700 border border-tertiary-600 rounded-lg px-4 py-2 pl-10 text-accent-50 placeholder-quaternary-500 focus:outline-none focus:border-tertiary-400 focus:ring-2 focus:ring-tertiary-500/20"
                  autoFocus
                />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-quaternary-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>

              {/* Tabs */}
              <div className="mt-4 flex gap-2 flex-wrap">
                <button
                  onClick={() => {
                    setActiveTab('popular');
                    setSearchTerm('');
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'popular'
                      ? 'bg-tertiary-600 text-accent-50'
                      : 'bg-secondary-700 text-quaternary-400 hover:text-accent-50'
                  }`}
                >
                  Popular
                </button>
                <button
                  onClick={() => {
                    setActiveTab('cities');
                    setSearchTerm('');
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'cities'
                      ? 'bg-tertiary-600 text-accent-50'
                      : 'bg-secondary-700 text-quaternary-400 hover:text-accent-50'
                  }`}
                >
                  Search Cities
                </button>
                <button
                  onClick={() => {
                    setActiveTab('utc');
                    setSearchTerm('');
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'utc'
                      ? 'bg-tertiary-600 text-accent-50'
                      : 'bg-secondary-700 text-quaternary-400 hover:text-accent-50'
                  }`}
                >
                  UTC Offsets
                </button>
              </div>
            </div>

            {/* Time Zone List */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-2">
                {activeTab === 'utc' ? (
                  filteredUTC.length > 0 ? (
                    filteredUTC.map((utc) => {
                      const ianaOffset = -utc.offset;
                      const timeZoneId = ianaOffset === 0 ? 'Etc/UTC' : `Etc/GMT${ianaOffset >= 0 ? '+' : ''}${ianaOffset}`;
                      const isSelected = existingTimeZoneValues.has(timeZoneId);
                      return (
                        <button
                          key={utc.value}
                          onClick={() => handleSelectUTC(utc)}
                          disabled={isSelected}
                          className={`w-full text-left px-4 py-3 rounded-lg border transition-all duration-200 group ${
                            isSelected
                              ? 'bg-secondary-900 border-tertiary-700 opacity-60 cursor-not-allowed'
                              : 'bg-secondary-700 hover:bg-secondary-600 border-transparent hover:border-tertiary-500'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className={`font-medium group-hover:text-accent-100 ${
                              isSelected ? 'text-quaternary-500' : 'text-accent-50'
                            }`}>
                              {utc.label}
                            </div>
                            {isSelected && (
                              <div className="text-xs text-tertiary-400 bg-tertiary-800/50 px-2 py-1 rounded">
                                Selected
                              </div>
                            )}
                          </div>
                          <div className="text-xs text-quaternary-500 mt-1">
                            Coordinated Universal Time {utc.offset >= 0 ? '+' : ''}{utc.offset}
                          </div>
                        </button>
                      );
                    })
                  ) : (
                    <div className="text-center py-8 text-quaternary-400">
                      No UTC offsets found matching "{searchTerm}"
                    </div>
                  )
                ) : activeTab === 'cities' ? (
                  filteredAllCities.length > 0 ? (
                    filteredAllCities.map((tz) => {
                      const isSelected = existingTimeZoneValues.has(tz.value);
                      return (
                        <button
                          key={tz.value}
                          onClick={() => handleSelectCity(tz)}
                          disabled={isSelected}
                          className={`w-full text-left px-4 py-3 rounded-lg border transition-all duration-200 group ${
                            isSelected
                              ? 'bg-secondary-900 border-tertiary-700 opacity-60 cursor-not-allowed'
                              : 'bg-secondary-700 hover:bg-secondary-600 border-transparent hover:border-tertiary-500'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className={`font-medium group-hover:text-accent-100 ${
                              isSelected ? 'text-quaternary-500' : 'text-accent-50'
                            }`}>
                              {tz.label}
                            </div>
                            {isSelected && (
                              <div className="text-xs text-tertiary-400 bg-tertiary-800/50 px-2 py-1 rounded">
                                Selected
                              </div>
                            )}
                          </div>
                          <div className="text-xs text-quaternary-500 mt-1 font-mono">
                            {tz.value}
                          </div>
                        </button>
                      );
                    })
                  ) : (
                    <div className="text-center py-8 text-quaternary-400">
                      No cities found matching "{searchTerm}"
                    </div>
                  )
                ) : ( // Popular tab
                  filteredPopular.length > 0 ? (
                    filteredPopular.map((tz) => {
                      const isSelected = existingTimeZoneValues.has(tz.value);
                      return (
                        <button
                          key={tz.value}
                          onClick={() => handleSelectCity(tz)}
                          disabled={isSelected}
                          className={`w-full text-left px-4 py-3 rounded-lg border transition-all duration-200 group ${
                            isSelected
                              ? 'bg-secondary-900 border-tertiary-700 opacity-60 cursor-not-allowed'
                              : 'bg-secondary-700 hover:bg-secondary-600 border-transparent hover:border-tertiary-500'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className={`font-medium group-hover:text-accent-100 ${
                              isSelected ? 'text-quaternary-500' : 'text-accent-50'
                            }`}>
                              {tz.label}
                            </div>
                            {isSelected && (
                              <div className="text-xs text-tertiary-400 bg-tertiary-800/50 px-2 py-1 rounded">
                                Selected
                              </div>
                            )}
                          </div>
                          <div className="text-xs text-quaternary-500 mt-1 font-mono">
                            {tz.value}
                          </div>
                        </button>
                      );
                    })
                  ) : (
                    <div className="text-center py-8 text-quaternary-400">
                      No time zones found matching "{searchTerm}"
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default AddTimeZoneButton;


