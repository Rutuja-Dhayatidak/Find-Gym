import React from 'react';

const MembershipStepper = ({ currentStep }) => {
  const steps = [
    { number: 1, label: 'Plan Details' },
    { number: 2, label: 'User Details' },
    { number: 3, label: 'Payment' },
    { number: 4, label: 'Success' }
  ];

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between relative">
        {/* Background Line */}
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[2px] bg-slate-200 z-0"></div>
        {/* Progress Line */}
        <div 
          className="absolute left-0 top-1/2 -translate-y-1/2 h-[2px] bg-gradient-to-r from-purple-700 to-indigo-600 transition-all duration-500 z-0"
          style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
        ></div>

        {steps.map((step) => {
          const isCompleted = currentStep > step.number;
          const isActive = currentStep === step.number;

          return (
            <div key={step.number} className="flex flex-col items-center z-10 relative">
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                  isCompleted 
                    ? 'bg-purple-700 text-white border-2 border-purple-700 shadow-md shadow-purple-200' 
                    : isActive 
                      ? 'bg-white text-purple-700 border-2 border-purple-700 shadow-lg shadow-purple-100 scale-110' 
                      : 'bg-white text-slate-400 border-2 border-slate-200'
                }`}
              >
                {isCompleted ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  step.number
                )}
              </div>
              <span 
                className={`text-[11px] md:text-xs font-semibold mt-2 transition-colors duration-300 ${
                  isActive ? 'text-purple-700 font-bold' : isCompleted ? 'text-slate-700' : 'text-slate-400'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MembershipStepper;
