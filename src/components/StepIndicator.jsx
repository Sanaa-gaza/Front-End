import React from "react";

export default function StepIndicator({ steps, currentStep }) {
    return (
        <div className="flex items-center justify-center gap-4 mb-6">
            {steps.map((label, idx) => {
                const stepNum = idx + 1;
                const isDone = stepNum < currentStep;
                const isActive = stepNum === currentStep;
                return (
                    <React.Fragment key={label}>
                        {idx > 0 && <div className="w-16 h-[2px] bg-[#4B9AD2]"></div>}
                        <div className="flex flex-col items-center gap-1.5">
                            <div
                                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold ${isDone || isActive
                                    ? "bg-[#4B9AD2] text-white"
                                    : "border-2 border-[#bfc6d3] text-[#89949D] dark:text-slate-400 bg-transparent"
                                    }`}
                            >
                                {isDone ? <i className="fa-solid fa-check text-xs"></i> : stepNum}
                            </div>
                            <span
                                className={`text-xs ${isActive
                                    ? "text-[#141415D1] dark:text-slate-100 font-bold"
                                    : isDone
                                        ? "text-[#4B9AD2] font-medium"
                                        : "text-[#89949D] dark:text-slate-400 font-medium"
                                    }`}
                            >
                                {label}
                            </span>
                        </div>
                    </React.Fragment>
                );
            })}
        </div>
    );
}