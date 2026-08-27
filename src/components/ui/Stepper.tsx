import React from 'react';
import clsx from 'clsx';

export interface StepItem {
  id: number | string;
  numberText: string; // e.g. '01'
  title: string;
  subtitle: string;
}

export interface StepperProps {
  steps: StepItem[];
  currentStep: number;
  onSelectStep?: (stepNum: number) => void;
  orientation?: 'vertical' | 'horizontal';
  className?: string;
}

export const Stepper: React.FC<StepperProps> = ({
  steps,
  currentStep,
  onSelectStep,
  orientation = 'vertical',
  className,
}) => {
  return (
    <div className={clsx('ui-stepper', `stepper-${orientation}`, className)}>
      {steps.map((step, idx) => {
        const stepNum = idx + 1;
        const isActive = currentStep === stepNum;
        const isCompleted = currentStep > stepNum;

        return (
          <button
            key={step.id}
            type="button"
            disabled={!onSelectStep || (!isCompleted && !isActive)}
            className={clsx('ui-step-nav-btn', {
              active: isActive,
              completed: isCompleted,
            })}
            onClick={() => onSelectStep && onSelectStep(stepNum)}
          >
            <div className="ui-step-badge">
              <span>{step.numberText}</span>
            </div>
            <div className="ui-step-text-block">
              <span className="ui-step-title">{step.title}</span>
              <span className="ui-step-subtitle">{step.subtitle}</span>
            </div>
          </button>
        );
      })}
    </div>
  );
};
