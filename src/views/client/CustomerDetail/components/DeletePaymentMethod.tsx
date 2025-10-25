import { FC } from 'react'
import ConfirmDialog from '@/components/shared/ConfirmDialog'

type DeletePaymentMethodProps = {
    onClose: () => void
    onConfirm: () => void
}

const DeletePaymentMethod: FC<DeletePaymentMethodProps> = ({ onClose, onConfirm }) => {
    return (
        <ConfirmDialog
            isOpen={true}
            type="danger"
            title="Remove payment method"
            confirmButtonColor="red-600"
            onClose={onClose}
            onRequestClose={onClose}
            onCancel={onClose}
            onConfirm={onConfirm}
        >
            <p>Are you sure you want to remove this payment method?</p>
        </ConfirmDialog>
    )
}

export default DeletePaymentMethod