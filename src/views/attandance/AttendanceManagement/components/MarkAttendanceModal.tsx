import React, { useState, useEffect } from 'react'
import Dialog from '@/components/ui/Dialog'
import Button from '@/components/ui/Button'
import Select from '@/components/ui/Select'
import type { MouseEvent } from 'react'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import { HiCalendar } from 'react-icons/hi'

interface MarkAttendanceModalProps {
    isOpen: boolean
    onClose: (e: MouseEvent) => void
    onConfirm: (e: MouseEvent, selectedHour?: number, isPaidLeave?: boolean) => void
    modalType: 'present' | 'absent' | 'dayoff'
}

const MarkAttendanceModal: React.FC<MarkAttendanceModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    modalType
}) => {
    const [selectedHour, setSelectedHour] = useState<number>(8)
    const [validationError, setValidationError] = useState<string | null>(null)

    const hourOptions = Array.from({ length: 24 }, (_, i) => ([
        { label: `${i.toString().padStart(2, '0')}:00`, value: `${i}:00` },
        { label: `${i.toString().padStart(2, '0')}:30`, value: `${i}:30` }
    ])).flat();

    useEffect(() => {
        if (!isOpen) {
            setSelectedHour(8)
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
            onConfirm(e, selectedHour, false)
        } else if (modalType === 'dayoff') {
            // For day off (paid leave)
            onConfirm(e, 0, true)
        } else {
            // For absent (unpaid)
            onConfirm(e, 0, false)
        }
    }

    const handleClose = (e: MouseEvent) => {
        setSelectedHour(8)
        setValidationError(null)
        onClose(e)
    }

    const getTitle = () => {
        switch (modalType) {
            case 'present':
                return 'Mark Present'
            case 'dayoff':
                return 'Mark Day Off (Paid Leave)'
            case 'absent':
            default:
                return 'Mark Absent'
        }
    }

    const getDescription = () => {
        switch (modalType) {
            case 'present':
                return 'Please select the working hours for this attendance:'
            case 'dayoff':
                return (
                    <div className="space-y-2">
                        <p>Mark this employee as on paid leave (day off):</p>
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800 mt-2">
                            <div className="flex items-start gap-2">
                                <HiCalendar className="text-blue-600 dark:text-blue-400 text-lg mt-0.5" />
                                <div className="text-xs text-blue-600 dark:text-blue-400">
                                    <p>• This is a company-paid leave</p>
                                    <p>• Working hours will be set to 0</p>
                                    <p>• Cannot be assigned to any project</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            case 'absent':
            default:
                return 'Are you sure you want to mark this employee as absent (unpaid)?'
        }
    }

    return (
        <Dialog isOpen={isOpen} onClose={handleClose} onRequestClose={handleClose}>
            <h5 className="mb-4">
                {getTitle()}
            </h5>

            <div className="mb-4">
                {getDescription()}
            </div>

            {modalType === 'present' && (
                <>
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
                    color={modalType === 'dayoff' ? 'blue' : modalType === 'present' ? 'green' : 'red'}
                    onClick={handleConfirm}
                >
                    Confirm
                </Button>
            </div>
        </Dialog>
    )
}

export default MarkAttendanceModal