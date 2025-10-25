// components/WorkEndModal.tsx
import { useState } from 'react'
import { Dialog } from '@/components/ui'
import Button from '@/components/ui/Button'
import { Notification, toast } from '@/components/ui'
import { setWorkEndDate } from '../../api/api'
import dayjs from 'dayjs'

interface WorkEndModalProps {
    isOpen: boolean
    onClose: () => void
    projectId?: string
    endDate?: string
    refetch: () => void
}

const WorkEndModal = ({ isOpen, onClose, projectId, endDate, refetch }: WorkEndModalProps) => {
    const [loading, setLoading] = useState(false)
    const [date, setDate] = useState(endDate ? dayjs(endDate).format('YYYY-MM-DD') : '')

    const handleSubmit = async () => {
        if (!projectId) {
            toast.push(
                <Notification title="Error" type="danger">
                    Project ID is required
                </Notification>
            )
            return
        }

        if (!date) {
            toast.push(
                <Notification title="Error" type="danger">
                    Please select an end date
                </Notification>
            )
            return
        }

        setLoading(true)
        try {
            await setWorkEndDate(projectId, date)
            toast.push(
                <Notification title="Success" type="success">
                    Work end date set successfully
                </Notification>
            )
            refetch()
            onClose()
        } catch (error: any) {
            console.error('Error setting work end date:', error)
            const errorMessage = error.response?.data?.message || 'Failed to set work end date'
            toast.push(
                <Notification title="Error" type="danger">
                    {errorMessage}
                </Notification>
            )
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog
            isOpen={isOpen}
            onClose={onClose}
            onRequestClose={onClose}
            width={400}
        >
            <div className="p-6">
                <h3 className="text-lg font-bold mb-4">Set Work End Date</h3>
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">
                        Work End Date
                    </label>
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        max={dayjs().format('YYYY-MM-DD')} // Can't set future dates
                    />
                </div>
                <div className="flex gap-2 justify-end">
                    <Button onClick={onClose} variant="plain">
                        Cancel
                    </Button>
                    <Button 
                        loading={loading}
                        onClick={handleSubmit}
                        variant="solid"
                        className="bg-green-500 hover:bg-green-600"
                    >
                        Set End Date
                    </Button>
                </div>
            </div>
        </Dialog>
    )
}

export default WorkEndModal