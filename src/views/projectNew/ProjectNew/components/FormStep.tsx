import Menu from '@/components/ui/Menu'
import { HiCheckCircle, HiLockClosed } from 'react-icons/hi'
import useThemeClass from '@/utils/hooks/useThemeClass'

type FormStepProps = {
  currentStep: number
  steps: { label: string; value: number }[]
  onStepChange: (step: number) => void
  completed:number
}

const FormStep = ({ currentStep, steps, onStepChange,completed }: FormStepProps) => {
  const { textTheme } = useThemeClass()

  return (
    <Menu variant="transparent" className="px-2">
      {steps.map((step) => (
        <Menu.MenuItem
          key={step.value}
          eventKey={step.value.toString()}
          className={`mb-2 ${step.value <= currentStep ? 'cursor-pointer' : 'cursor-not-allowed'}`}
          isActive={currentStep === step.value}
          onSelect={() => {
            // Allow navigation to any completed step or current step
            if (step.value <= completed) {
              onStepChange(step.value)
            }
          }}
        >
          <span className="text-2xl ltr:mr-2 rtl:ml-2">
            {step.value < completed && <HiCheckCircle className={textTheme} />}
            {step.value === completed && (
              <HiCheckCircle className={textTheme} />
            )}
            {step.value > completed && (
              <HiLockClosed className="text-gray-400" />
            )}
          </span>
          <span className={step.value > completed ? 'text-gray-400' : ''}>
            {step.label}
          </span>
        </Menu.MenuItem>
      ))}
    </Menu>
  )
}

export { FormStep }