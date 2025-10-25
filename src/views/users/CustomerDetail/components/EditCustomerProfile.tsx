import { useRef } from 'react'
import Button from '@/components/ui/Button'
import Drawer from '@/components/ui/Drawer'
import CustomerForm, { FormikRef, FormModel } from '@/views/crm/CustomerForm'
import dayjs from 'dayjs'

type DrawerFooterProps = {
    onSaveClick?: () => void
    onCancel?: () => void
}

type EditCustomerProfileProps = {
    isOpen: boolean
    onClose: () => void
    customer: Customer
    onSave?: (customer: Customer) => void
}

const DrawerFooter = ({ onSaveClick, onCancel }: DrawerFooterProps) => {
    return (
        <div className="text-right w-full">
            <Button size="sm" className="mr-2" onClick={onCancel}>
                Cancel
            </Button>
            <Button size="sm" variant="solid" onClick={onSaveClick}>
                Save
            </Button>
        </div>
    )
}

const EditCustomerProfile = ({ isOpen, onClose, customer, onSave }: EditCustomerProfileProps) => {
    const formikRef = useRef<FormikRef>(null)

    const formSubmit = () => {
        formikRef.current?.submitForm()
    }

    const onFormSubmit = (values: FormModel) => {
        const {
            name,
            birthday,
            email,
            img,
            location,
            title,
            phoneNumber,
            facebook,
            twitter,
            pinterest,
            linkedIn,
        } = values

        const updatedCustomer = {
            ...customer,
            name,
            email,
            img,
            personalInfo: {
                ...customer.personalInfo,
                location,
                title,
                birthday: dayjs(birthday).format('DD/MM/YYYY'),
                phoneNumber,
                facebook,
                twitter,
                pinterest,
                linkedIn,
            }
        }
        
        if (onSave) {
            onSave(updatedCustomer)
        }
        onClose()
    }

    return (
        <Drawer
            isOpen={isOpen}
            closable={false}
            bodyClass="p-0"
            footer={
                <DrawerFooter
                    onCancel={onClose}
                    onSaveClick={formSubmit}
                />
            }
            onClose={onClose}
            onRequestClose={onClose}
        >
            <CustomerForm
                ref={formikRef}
                customer={customer}
                onFormSubmit={onFormSubmit}
            />
        </Drawer>
    )
}

export default EditCustomerProfile