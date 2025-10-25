import { HiCheckCircle, HiLockClosed } from 'react-icons/hi'

type FormStepProps = {
  currentStep: number
  steps: { 
    label: string; 
    value: number; 
    icon?: React.ReactNode;
    gradient?: string;
  }[]
  onStepChange: (step: number) => void
  completed: number
}

const FormStep = ({ currentStep, steps, onStepChange, completed }: FormStepProps) => {
  const getStepStatus = (stepValue: number) => {
    if (stepValue < completed) return 'completed'
    if (stepValue === currentStep) return 'current'
    if (stepValue <= completed) return 'available'
    return 'locked'
  }

  const getStepStyles = (step: any, status: string) => {
    const baseStyles = "transition-all duration-300 ease-in-out"
    
    switch (status) {
      case 'completed':
        return {
          container: `${baseStyles} opacity-100 cursor-pointer hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 dark:hover:from-green-900/20 dark:hover:to-emerald-900/20`,
          iconContainer: "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg",
          text: "text-gray-800 dark:text-white font-medium",
          connector: "bg-gradient-to-b from-green-500 to-emerald-600"
        }
      case 'current':
        return {
          container: `${baseStyles} opacity-100 cursor-pointer bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-800 dark:via-gray-750 dark:to-gray-700 border-l-4 border-blue-500`,
          iconContainer: `bg-gradient-to-r ${step.gradient || 'from-blue-500 to-indigo-600'} text-white shadow-xl`,
          text: "text-gray-900 dark:text-white font-bold",
          connector: `bg-gradient-to-b ${step.gradient || 'from-blue-500 to-indigo-600'}`
        }
      case 'available':
        return {
          container: `${baseStyles} opacity-90 cursor-pointer hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 dark:hover:from-gray-800 dark:hover:to-gray-750`,
          iconContainer: "bg-gradient-to-r from-gray-400 to-gray-500 text-white shadow-md",
          text: "text-gray-700 dark:text-gray-300 font-medium",
          connector: "bg-gradient-to-b from-gray-400 to-gray-500"
        }
      default:
        return {
          container: `${baseStyles} opacity-50 cursor-not-allowed`,
          iconContainer: "bg-gradient-to-r from-gray-300 to-gray-400 text-gray-500 shadow-sm",
          text: "text-gray-400 dark:text-gray-600",
          connector: "bg-gray-300 dark:bg-gray-600"
        }
    }
  }

  return (
    <div className="relative">
      {/* Progress Line Background */}
      <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700"></div>
      
      {steps.map((step, index) => {
        const status = getStepStatus(step.value)
        const styles = getStepStyles(step, status)
        const isLast = index === steps.length - 1
        const canNavigate = step.value <= completed

        return (
          <div key={step.value} className="relative">
            {/* Step Item */}
            <div
              className={`
                relative flex items-center p-4 rounded-xl mb-3 border border-transparent
                ${styles.container}
                ${canNavigate ? 'hover:shadow-lg hover:scale-[1.02]' : ''}
              `}
              onClick={() => canNavigate && onStepChange(step.value)}
            >
              {/* Step Icon */}
              <div className={`
                relative z-10 flex items-center justify-center w-12 h-12 rounded-xl
                ${styles.iconContainer}
                ${canNavigate ? 'hover:scale-110' : ''}
                transition-transform duration-200
              `}>
                {status === 'completed' ? (
                  <HiCheckCircle className="text-2xl" />
                ) : status === 'locked' ? (
                  <HiLockClosed className="text-xl" />
                ) : (
                  step.icon || <span className="text-lg font-bold">{step.value + 1}</span>
                )}
              </div>

              {/* Step Content */}
              <div className="ml-4 flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className={`text-lg ${styles.text}`}>
                      {step.label}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {status === 'completed' ? 'Completed' : 
                       status === 'current' ? 'In Progress' : 
                       status === 'available' ? 'Available' : 'Locked'}
                    </p>
                  </div>
                  
                  {/* Step Number Badge */}
                  <div className={`
                    px-3 py-1 rounded-full text-sm font-medium
                    ${status === 'current' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                      status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                      'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}
                  `}>
                    Step {step.value + 1}
                  </div>
                </div>
              </div>
            </div>

            {/* Progress Connector */}
            {!isLast && (
              <div className={`
                absolute left-6 top-16 w-0.5 h-8 z-0
                ${status === 'completed' || (status === 'current' && index < currentStep) ? 
                  styles.connector : 'bg-gray-200 dark:bg-gray-700'}
              `}></div>
            )}

            {/* Active Step Indicator */}
            {status === 'current' && (
              <div className="absolute -left-1 top-8 w-2 h-8 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full animate-pulse"></div>
            )}
          </div>
        )
      })}

      {/* Overall Progress Bar */}
      <div className="mt-6 p-4 bg-gradient-to-r from-gray-50 via-white to-gray-50 dark:from-gray-800 dark:via-gray-850 dark:to-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Overall Progress
          </span>
          <span className="text-sm font-bold text-gray-900 dark:text-white">
            {Math.round(((completed + 1) / steps.length) * 100)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${((completed + 1) / steps.length) * 100}%` }}
          ></div>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          {completed + 1} of {steps.length} steps completed
        </p>
      </div>
    </div>
  )
}

export { FormStep }