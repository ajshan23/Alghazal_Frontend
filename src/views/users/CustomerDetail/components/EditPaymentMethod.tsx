import { FC } from 'react'
import Dialog from '@/components/ui/Dialog'
import { PaymentMethod } from '../store'
// You'll need to create this form component


type EditPaymentMethodProps = {
    card: PaymentMethod
    onClose: () => void
    onSave: (card: PaymentMethod) => void
}

const EditPaymentMethod: FC<EditPaymentMethodProps> = ({ card, onClose, onSave }) => {
    const handleSubmit = (values: PaymentMethod) => {
        onSave(values)
    }

    return (
        <Dialog isOpen={true} onClose={onClose} onRequestClose={onClose}>
            <h4>Edit Credit Card</h4>
            {/* <PaymentMethodForm 
                initialValues={card}
                onSubmit={handleSubmit}
                onCancel={onClose}
            /> */}
        </Dialog>
    )
}

export default EditPaymentMethod