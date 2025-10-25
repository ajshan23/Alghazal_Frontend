import { FC, useState } from 'react'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import { deleteVehicle } from '../api/api'

type DeleteProps = {
    isOpen: boolean
    onClose: () => void
    vehicle: {
        _id: string
        vehicleNumber: string
        make: string
        model: string
    } | null
    refetch: () => void
}

const VehicleDeleteConfirmation: FC<DeleteProps> = ({
    isOpen,
    onClose,
    vehicle,
    refetch,
}) => {
    const [isDeleting, setIsDeleting] = useState(false)

    if (!isOpen || !vehicle) return null

    const handleDelete = async () => {
        setIsDeleting(true)
        try {
            await deleteVehicle(vehicle._id)
            refetch()
            toast.push(
                <Notification
                    title={`Vehicle "${vehicle.vehicleNumber}" deleted`}
                    type="success"
                    duration={2500}
                >
                    {`${vehicle.make} ${vehicle.model} (${vehicle.vehicleNumber}) has been successfully deleted.`}
                </Notification>,
                { placement: 'top-center' },
            )
            onClose()
        } catch (error: any) {
            console.error('Delete failed:', error)
            toast.push(
                <Notification
                    title={`Failed to delete vehicle "${vehicle.vehicleNumber}"`}
                    type="danger"
                    duration={2500}
                >
                    {error?.response?.data?.message ||
                        error.message ||
                        'Something went wrong'}
                </Notification>,
                { placement: 'top-center' },
            )
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <ConfirmDialog
            isOpen={isOpen}
            type="danger"
            title={`Delete Vehicle "${vehicle.vehicleNumber}"`}
            confirmButtonColor="red-600"
            onClose={onClose}
            onRequestClose={onClose}
            onCancel={onClose}
            onConfirm={handleDelete}
            confirmButtonDisabled={isDeleting}
        >
            <p>
                Are you sure you want to delete the vehicle "{vehicle.make}{' '}
                {vehicle.model}" with registration number{' '}
                {vehicle.vehicleNumber}? This action cannot be undone.
            </p>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                All associated records will also be removed.
            </p>
            {isDeleting && (
                <div className="mt-4 flex justify-center">
                    <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            )}
        </ConfirmDialog>
    )
}

export default VehicleDeleteConfirmation
