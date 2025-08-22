import React, { useState, useEffect } from 'react'
import Dialog from '@/components/ui/Dialog'
import Button from '@/components/ui/Button'
import Select from '@/components/ui/Select'
import type { MouseEvent } from 'react'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'

interface MarkAttendanceModalProps {
    isOpen: boolean
    onClose: (e: MouseEvent) => void
    onConfirm: (e: MouseEvent, selectedHour: number) => void
}

const MarkAttendanceModal: React.FC<MarkAttendanceModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
}) => {
    const [selectedHour, setSelectedHour] = useState<number | null>(null)
    const [validationError, setValidationError] = useState<string | null>(null)

    const hourOptions = Array.from({ length: 24 }, (_, i) => ({
        label: `${i.toString().padStart(2, '0')}:00`,
        value: i,
    }))

    // Clear form when modal closes
    useEffect(() => {
        if (!isOpen) {
            setSelectedHour(null)
            setValidationError(null)
        }
    }, [isOpen])

    const handleConfirm = (e: MouseEvent) => {
        if (selectedHour === null) {
            setValidationError('Please select an hour')
            toast.push(
                <Notification title="Validation Error" type="danger">
                    Please select an hour before confirming
                </Notification>
            )
            return
        }
        setValidationError(null)
        onConfirm(e, selectedHour)
    }

    const handleClose = (e: MouseEvent) => {
        setSelectedHour(null)
        setValidationError(null)
        onClose(e)
    }

    return (
        <Dialog isOpen={isOpen} onClose={handleClose} onRequestClose={handleClose}>
            <h5 className="mb-4">Mark Attendance</h5>
            <p className="mb-4">
                Please select the hour you want to mark attendance for:
            </p>

            <Select
                placeholder="Select Hour"
                options={hourOptions}
                value={hourOptions.find(opt => opt.value === selectedHour) || null}
                onChange={(option) => {
                    setSelectedHour(option?.value || null)
                    setValidationError(null)
                }}
                className={validationError ? 'border-red-500' : ''}
            />
            
            {validationError && (
                <p className="mt-2 text-red-500 text-sm">{validationError}</p>
            )}

            <div className="text-right mt-6">
                <Button
                    className="ltr:mr-2 rtl:ml-2"
                    variant="plain"
                    onClick={handleClose}
                >
                    Cancel
                </Button>
                <Button
                    variant="solid"
                    onClick={handleConfirm}
                >
                    Confirm
                </Button>
            </div>
        </Dialog>
    )
}

export default MarkAttendanceModal