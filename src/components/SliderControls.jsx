function SliderControls({ currentIndex, totalItems, onPrev, onNext }) {
  const canGoPrev = currentIndex > 0;
  const canGoNext = currentIndex < totalItems - 1;

  return (
    <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 flex items-center justify-between pointer-events-none px-2">
      {/* Previous Button */}
      <button
        onClick={onPrev}
        disabled={!canGoPrev}
        className={`pointer-events-auto w-10 h-10 rounded-full bg-secondary-800/90 backdrop-blur-sm border border-tertiary-600 hover:border-tertiary-400 flex items-center justify-center transition-all duration-200 shadow-lg ${
          canGoPrev
            ? 'text-accent-50 hover:bg-secondary-700 cursor-pointer'
            : 'text-quaternary-600 cursor-not-allowed opacity-50'
        }`}
        aria-label="Previous time zone"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Next Button */}
      <button
        onClick={onNext}
        disabled={!canGoNext}
        className={`pointer-events-auto w-10 h-10 rounded-full bg-secondary-800/90 backdrop-blur-sm border border-tertiary-600 hover:border-tertiary-400 flex items-center justify-center transition-all duration-200 shadow-lg ${
          canGoNext
            ? 'text-accent-50 hover:bg-secondary-700 cursor-pointer'
            : 'text-quaternary-600 cursor-not-allowed opacity-50'
        }`}
        aria-label="Next time zone"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}

export default SliderControls;

