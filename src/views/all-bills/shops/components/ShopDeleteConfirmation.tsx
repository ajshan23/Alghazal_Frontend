import { FC, useState } from 'react'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import { deleteShop } from '../api/api'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'

type DeleteProps = {
    isOpen: boolean
    onClose: () => void
    shopId: string | null
    shopName?: string
    refetch: () => void
}

const ShopDeleteConfirmation: FC<DeleteProps> = ({
    isOpen,
    onClose,
    shopId,
    shopName,
    refetch,
}) => {
    const [isDeleting, setIsDeleting] = useState(false)

    if (!isOpen || !shopId) return null

    const handleDelete = async () => {
        setIsDeleting(true)
        try {
            await deleteShop(shopId)
            refetch()
            toast.push(
                <Notification title="Shop deleted" type="success" duration={2500}>
                    The shop has been successfully deleted.
                </Notification>,
                { placement: 'top-center' }
            )
            onClose()
        } catch (error: any) {
            console.error('Delete failed:', error)
            toast.push(
                <Notification
                    title="Failed to delete shop"
                    type="danger"
                    duration={2500}
                >
                    {error?.response?.data?.message || error.message || 'Something went wrong'}
                </Notification>,
                { placement: 'top-center' }
            )
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <ConfirmDialog
            isOpen={isOpen}
            type="danger"
            title="Delete Shop"
            confirmButtonColor="red-600"
            onClose={onClose}
            onRequestClose={onClose}
            onCancel={onClose}
            onConfirm={handleDelete}
            confirmButtonDisabled={isDeleting}
        >
            <p>
                Are you sure you want to delete
                {shopName ? ` the shop "${shopName}"` : ' this shop'}? This action
                cannot be undone.
            </p>
            {isDeleting && (
                <div className="mt-4 flex justify-center">
                    <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            )}
        </ConfirmDialog>
    )
}

export default ShopDeleteConfirmation
