import { FC, useState } from 'react'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import { deleteCategory } from '../api/api'

type DeleteProps = {
    isOpen: boolean
    onClose: () => void
    category: {
        _id: string
        name: string
    } | null
    refetch: () => void
}

const CategoryDeleteConfirm: FC<DeleteProps> = ({
    isOpen,
    onClose,
    category,
    refetch,
}) => {
    const [isDeleting, setIsDeleting] = useState(false)

    if (!isOpen || !category) return null

    const handleDelete = async () => {
        setIsDeleting(true)
        try {
            await deleteCategory(category._id)
            refetch()
            toast.push(
                <Notification 
                    title={`Category "${category.name}" deleted`} 
                    type="success" 
                    duration={2500}
                >
                    The category has been successfully deleted.
                </Notification>,
                { placement: 'top-center' }
            )
            onClose()
        } catch (error: any) {
            console.error('Delete failed:', error)
            toast.push(
                <Notification
                    title={`Failed to delete category "${category.name}"`}
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
            title={`Delete Category "${category.name}"`}
            confirmButtonColor="red-600"
            onClose={onClose}
            onRequestClose={onClose}
            onCancel={onClose}
            onConfirm={handleDelete}
            confirmButtonDisabled={isDeleting}
        >
            <p>
                Are you sure you want to delete the category "{category.name}"? 
                This action cannot be undone.
            </p>
            {isDeleting && (
                <div className="mt-4 flex justify-center">
                    <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            )}
        </ConfirmDialog>
    )
}

export default CategoryDeleteConfirm