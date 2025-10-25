// src/components/ui/FormRow.tsx
import { ReactNode } from 'react'
import classNames from 'classnames'

interface FormRowProps {
    label?: string
    children: ReactNode
    invalid?: boolean
    errorMessage?: string
    className?: string
}

const FormRow = ({
    label,
    children,
    invalid,
    errorMessage,
    className
}: FormRowProps) => {
    return (
        <div className={classNames('mb-4', className)}>
            {label && (
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    {label}
                </label>
            )}
            <div>{children}</div>
            {invalid && (
                <div className="mt-1 text-xs text-red-600 dark:text-red-400">
                    {errorMessage}
                </div>
            )}
        </div>
    )
}

export default FormRow