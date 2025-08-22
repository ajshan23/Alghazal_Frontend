import { forwardRef, useState } from 'react'
import { FormContainer, FormItem } from '@/components/ui/Form'
import Button from '@/components/ui/Button'
import StickyFooter from '@/components/shared/StickyFooter'
import { Field, Form, Formik, FormikProps, FieldProps } from 'formik'
import { AiOutlineSave } from 'react-icons/ai'
import { HiOutlineTrash } from 'react-icons/hi'
import * as Yup from 'yup'
import { Input, Select } from '@/components/ui'
import { AdaptableCard } from '@/components/shared'
import DatePicker from '@/components/ui/DatePicker'
import { format } from 'date-fns'
import ConfirmDialog from '@/components/shared/ConfirmDialog'

type FormikRef = FormikProps<any>
const today = new Date()

type InitialData = {
    billType?: string
    billDate?: string
    amount: number | string
    paymentMethod?: string
}

export type FormModel = InitialData
export type SetSubmitting = (isSubmitting: boolean) => void
export type OnDeleteCallback = React.Dispatch<React.SetStateAction<boolean>>
type OnDelete = (callback: OnDeleteCallback) => void

type CommissionBillFormProps = {
    initialData?: InitialData
    type: 'edit' | 'new'
    onDiscard?: () => void
    onDelete?: OnDelete
    onFormSubmit: (
        formData: FormData,
        setSubmitting: SetSubmitting,
    ) => Promise<any>
}

const paymentMethodOptions = [
    { label: 'ADVANCE', value: 'advance' },
    { label: 'ADIB', value: 'adib' },
    { label: 'Cash', value: 'cash' },
    { label: 'MASHREQ CARD', value: 'masherq_card' },
]

const CommissionBillForm = forwardRef<FormikRef, CommissionBillFormProps>((props, ref) => {
    const {
        type,
        initialData = {
            billType: 'commission',
            billDate: new Date().toISOString().split('T')[0],
            amount: '',
            paymentMethod: 'cash',
        },
        onFormSubmit,
        onDiscard,
        onDelete,
    } = props

    const validationSchema = Yup.object().shape({
        billDate: Yup.string().required('Date is required'),
        amount: Yup.number()
            .typeError('Amount must be a number')
            .required('Amount is required'),
        paymentMethod: Yup.string().required('Payment method is required'),
    })

    return (
        <Formik
            innerRef={ref}
            initialValues={{
                ...initialData,
                billType: initialData.billType || 'commission',
                billDate: initialData.billDate || new Date().toISOString().split('T')[0],
                amount: initialData.amount ?? '',
                paymentMethod: initialData.paymentMethod || 'cash',
            }}
            validationSchema={validationSchema}
            onSubmit={async (values, { setSubmitting }) => {
                const formData = new FormData()
                formData.append('billType', values.billType)
                formData.append('billDate', values.billDate)
                formData.append('amount', values.amount.toString())
                formData.append('paymentMethod', values.paymentMethod)

                await onFormSubmit(formData, setSubmitting)
            }}
            enableReinitialize
        >
            {({ values, touched, errors, isSubmitting, setFieldValue }) => (
                <Form>
                    <FormContainer>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                            <div className="lg:col-span-2">
                                <AdaptableCard divider className="mb-4">
                                    <h5 className="mb-4">Commission Information</h5>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormItem label="Bill Type">
                                            <Field name="billType">
                                                {({ field, form }: FieldProps) => (
                                                    <Select
                                                        options={[{ label: 'Commission', value: 'commission' }]}
                                                        value={{ label: 'Commission', value: 'commission' }}
                                                        onChange={(option) =>
                                                            form.setFieldValue(field.name, option?.value)
                                                        }
                                                        isDisabled={type === 'edit'}
                                                    />
                                                )}
                                            </Field>
                                        </FormItem>

                                        <FormItem label="Date" invalid={!!errors.billDate && touched.billDate}>
                                            <Field name="billDate">
                                                {({ field, form }: FieldProps) => (
                                                    <DatePicker
                                                        placeholder="Select Date"
                                                        value={field.value ? new Date(field.value) : null}
                                                        maxDate={today}
                                                        onChange={(date) =>
                                                            form.setFieldValue(
                                                                field.name,
                                                                date
                                                                    ? format(
                                                                        new Date(
                                                                            date.getFullYear(),
                                                                            date.getMonth(),
                                                                            date.getDate()
                                                                        ),
                                                                        'yyyy-MM-dd'
                                                                    )
                                                                    : ''
                                                            )
                                                        }
                                                    />
                                                )}
                                            </Field>
                                        </FormItem>

                                        <FormItem
                                            label="Amount"
                                            invalid={!!errors.amount && touched.amount}
                                            errorMessage={errors.amount as string}
                                        >
                                            <Field name="amount">
                                                {({ field, form }: FieldProps) => (
                                                    <Input
                                                        type="number"
                                                        autoComplete="off"
                                                        placeholder="Amount"
                                                        {...field}
                                                        onChange={(e) =>
                                                            form.setFieldValue(field.name, e.target.value)
                                                        }
                                                    />
                                                )}
                                            </Field>
                                        </FormItem>

                                        <FormItem
                                            label="Payment Method"
                                            invalid={!!errors.paymentMethod && touched.paymentMethod}
                                            errorMessage={errors.paymentMethod as string}
                                        >
                                            <Field name="paymentMethod">
                                                {({ field, form }: FieldProps) => (
                                                    <Select
                                                        options={paymentMethodOptions}
                                                        value={paymentMethodOptions.find(
                                                            (option) => option.value === field.value
                                                        )}
                                                        onChange={(option) =>
                                                            form.setFieldValue(field.name, option?.value)
                                                        }
                                                    />
                                                )}
                                            </Field>
                                        </FormItem>
                                    </div>
                                </AdaptableCard>
                            </div>
                        </div>

                        <StickyFooter className="-mx-8 px-8 flex items-center justify-between py-4" stickyClass="border-t bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                            <div>
                                {type === 'edit' && onDelete && (
                                    <DeleteCommissionButton onDelete={onDelete} />
                                )}
                            </div>
                            <div className="md:flex items-center">
                                <Button size="sm" className="ltr:mr-3 rtl:ml-3" type="button" onClick={() => onDiscard?.()}>
                                    Discard
                                </Button>
                                <Button size="sm" variant="solid" loading={isSubmitting} icon={<AiOutlineSave />} type="submit">
                                    Save
                                </Button>
                            </div>
                        </StickyFooter>
                    </FormContainer>
                </Form>
            )}
        </Formik>
    )
})

CommissionBillForm.displayName = 'CommissionBillForm'

const DeleteCommissionButton = ({ onDelete }: { onDelete: OnDelete }) => {
    const [dialogOpen, setDialogOpen] = useState(false)

    const onConfirmDialog = () => {
        setDialogOpen(false)
        onDelete?.(setDialogOpen)
    }

    const onDialogClose = () => {
        setDialogOpen(false)
    }

    return (
        <>
            <Button
                className="text-red-600"
                variant="plain"
                size="sm"
                icon={<HiOutlineTrash />}
                type="button"
                onClick={() => setDialogOpen(true)}
            >
                Delete
            </Button>
            <ConfirmDialog
                isOpen={dialogOpen}
                type="danger"
                title="Delete Commission Entry"
                confirmButtonColor="red-600"
                onClose={onDialogClose}
                onRequestClose={onDialogClose}
                onCancel={onDialogClose}
                onConfirm={onConfirmDialog}
            >
                <p>Are you sure you want to delete this commission entry?</p>
            </ConfirmDialog>
        </>
    )
}

export default CommissionBillForm