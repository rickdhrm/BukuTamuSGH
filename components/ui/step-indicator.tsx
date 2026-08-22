import React from "react";
import { cn } from "@/lib/utils";

interface StepIndicatorProps {
  currentStep: number;
  totalSteps?: number;
  stepTitles?: string[];
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({
  currentStep,
  totalSteps = 3,
  stepTitles = ["Data Diri", "Detail Kunjungan", "Foto Selfie"],
}) => {
  return (
    <div className="w-full mb-8">
      {/* Step Numbers & Connecting Lines */}
      <div className="flex items-center justify-between relative px-2">
        {/* Background Line */}
        <div className="absolute top-1/2 left-6 right-6 -translate-y-1/2 h-0.5 bg-slate-800 -z-0" />
        
        {/* Progress Line */}
        <div
          className="absolute top-1/2 left-6 -translate-y-1/2 h-0.5 bg-blue-500 transition-all duration-300 -z-0"
          style={{
            width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%`,
          }}
        />

        {Array.from({ length: totalSteps }, (_, i) => {
          const stepNum = i + 1;
          const isCompleted = stepNum < currentStep;
          const isCurrent = stepNum === currentStep;

          return (
            <div key={stepNum} className="flex flex-col items-center z-10">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-300 shadow-md",
                  isCompleted &&
                    "bg-blue-600 text-white shadow-blue-500/30 border border-blue-400/40",
                  isCurrent &&
                    "bg-blue-500 text-white shadow-blue-500/50 ring-4 ring-blue-500/20 border border-blue-300",
                  !isCompleted &&
                    !isCurrent &&
                    "bg-slate-900 text-slate-400 border border-slate-700/80"
                )}
              >
                {isCompleted ? (
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  stepNum
                )}
              </div>

              {/* Title below node */}
              <span
                className={cn(
                  "mt-2 text-xs font-medium transition-colors text-center hidden sm:block",
                  isCurrent ? "text-blue-400 font-semibold" : "text-slate-400"
                )}
              >
                {stepTitles[i]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
