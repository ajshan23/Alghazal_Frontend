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
    onConfirm: (e: MouseEvent, selectedHour?: number) => void
    modalType: 'present' | 'absent'
}

const MarkAttendanceModal: React.FC<MarkAttendanceModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    modalType
}) => {
    const [selectedHour, setSelectedHour] = useState<number>(8) // Default to 8 hours
    const [validationError, setValidationError] = useState<string | null>(null)

    const hourOptions = Array.from({ length: 24 }, (_, i) => ([
        { label: `${i.toString().padStart(2, '0')}:00`, value: `${i}:00` },
        { label: `${i.toString().padStart(2, '0')}:30`, value: `${i}:30` }
    ])).flat();

    // Clear form when modal closes
    useEffect(() => {
        if (!isOpen) {
            setSelectedHour(8) // Reset to default
            setValidationError(null)
        }
    }, [isOpen])

    const handleConfirm = (e: MouseEvent) => {
        if (modalType === 'present') {
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
        } else {
            // For absent, just confirm without hours
            onConfirm(e, 0) // FIX: Pass 0 hours for absent
        }
    }

    const handleClose = (e: MouseEvent) => {
        setSelectedHour(8) // Reset to default
        setValidationError(null)
        onClose(e)
    }

    return (
        <Dialog isOpen={isOpen} onClose={handleClose} onRequestClose={handleClose}>
            <h5 className="mb-4">
                {modalType === 'present' ? 'Mark Present' : 'Mark Absent'}
            </h5>

            {modalType === 'present' ? (
                <>
                    <p className="mb-4">
                        Please select the working hours for this attendance:
                    </p>

                    <Select
                        placeholder="Select Working Hours"
                        options={hourOptions}
                        value={hourOptions.find(opt => opt.value === selectedHour) || null}
                        onChange={(option) => {
                            setSelectedHour(option?.value || 8)
                            setValidationError(null)
                        }}
                        className={validationError ? 'border-red-500' : ''}
                    />

                    {validationError && (
                        <p className="mt-2 text-red-500 text-sm">{validationError}</p>
                    )}
                </>
            ) : (
                <p className="mb-4">
                    Are you sure you want to mark this employee as absent?
                </p>
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