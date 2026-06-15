import React from 'react';

const ProgressBar = ({ currentStep, totalSteps }) => {
  const percentage = (currentStep / totalSteps) * 100;

  return (
    <div className="w-full mb-8">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-semibold text-gray-400">
          Step {currentStep} of {totalSteps}
        </span>
        <span className="text-sm font-semibold text-orange-500">
          {Math.round(percentage)}% Complete
        </span>
      </div>
      <div className="w-full bg-gray-800 h-2.5 rounded-full overflow-hidden">
        <div 
          className="bg-orange-500 h-2.5 rounded-full transition-all duration-500 ease-out" 
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
