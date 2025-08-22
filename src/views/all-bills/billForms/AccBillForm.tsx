import { forwardRef, useState, useEffect } from 'react'
import { FormContainer, FormItem } from '@/components/ui/Form'
import Button from '@/components/ui/Button'
import StickyFooter from '@/components/shared/StickyFooter'
import { Field, Form, Formik, FormikProps, FieldProps } from 'formik'
import { AiOutlineSave } from 'react-icons/ai'
import { HiOutlineTrash } from 'react-icons/hi'
import * as Yup from 'yup'
import { Input } from '@/components/ui'
import { AdaptableCard } from '@/components/shared'
import Select from '@/components/ui/Select'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import { fetchShops } from '../api/api'
import DatePicker from '@/components/ui/DatePicker'
import { format } from 'date-fns'

type FormikRef = FormikProps<any>
const today = new Date()

const PaymentMethodOptions = [
    { label: 'ADVANCE', value: 'advance' },
    { label: 'ADIB', value: 'adib' },
    { label: 'Cash', value: 'cash' },
    { label: 'MASHREQ CARD', value: 'masherq_card' },
]

type InitialData = {
    billType?: string
    date?: string
    shopName?: string
    shopId?: string
    roomNo?: string
    amount: number | string
    invoiceNumber?: string
    paymentMethod?: string
    note?: string
    remarks?: string
    attachments?: Array<{ fileName: string; filePath: string }> | File[]
}

export type FormModel = InitialData
export type SetSubmitting = (isSubmitting: boolean) => void
export type OnDeleteCallback = React.Dispatch<React.SetStateAction<boolean>>
type OnDelete = (callback: OnDeleteCallback) => void

type AccBillFormProps = {
    initialData?: InitialData
    type: 'edit' | 'new'
    onDiscard?: () => void
    onDelete?: OnDelete
    onFormSubmit: (
        formData: FormData,
        setSubmitting: SetSubmitting,
    ) => Promise<any>
}

const AccBillForm = forwardRef<FormikRef, AccBillFormProps>((props, ref) => {
    const {
        type,
        initialData = {
            billType: 'accommodation',
            date: new Date().toISOString().split('T')[0],
            shopName: '',
            roomNo: '',
            invoiceNumber: '',
            amount: '',
            paymentMethod: '',
            note: '',
            remarks: '',
            attachments: [],
        },
        onFormSubmit,
        onDiscard,
        onDelete,
    } = props

    const [shopOptions, setShopOptions] = useState<{ label: string; value: string }[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [attachmentFiles, setAttachmentFiles] = useState<
        Array<File | { fileName: string; filePath: string }>
    >(initialData.attachments || [])

    useEffect(() => {
        const loadShops = async () => {
            try {
                setIsLoading(true)
                const response = await fetchShops()
                const shops =
                    response.data?.shops?.map((shop: any) => ({
                        label: shop.shopName,
                        value: shop._id,
                    })) || []
                setShopOptions(shops)
            } catch (error) {
                console.error('Failed to fetch shops:', error)
            } finally {
                setIsLoading(false)
            }
        }

        loadShops()
    }, [])

    useEffect(() => {
        if (initialData.attachments) {
            setAttachmentFiles(initialData.attachments)
        }
    }, [initialData.attachments])

    const validationSchema = Yup.object().shape({
        date: Yup.string().required('Date is required'),
        shopName: Yup.string().required('Shop Name is required'),
        roomNo: Yup.string().required('Room No is required'),
        paymentMethod: Yup.string().required('Payment Method is required'),
        amount: Yup.number()
            .typeError('Amount must be a number')
            .required('Amount is required'),
    })

    const handleAttachmentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            const newFiles = Array.from(event.target.files)
            setAttachmentFiles((prev) => [...prev, ...newFiles])
        }
    }

    const handleAttachmentRemove = (index: number) => {
        setAttachmentFiles((prev) => prev.filter((_, i) => i !== index))
    }

    return (
        <Formik
            innerRef={ref}
            initialValues={{
                ...initialData,
                billType: initialData.billType || 'accommodation',
                date: initialData.date || new Date().toISOString().split('T')[0],
                shopName: initialData.shopName || '',
                shopId: initialData.shopId || '',
                roomNo: initialData.roomNo || '',
                paymentMethod: initialData.paymentMethod || '',
                note: initialData.note || '',
                remarks: initialData.remarks || '',
                attachments: initialData.attachments || [],
                amount: initialData.amount ?? '',
            }}
            validationSchema={validationSchema}
            onSubmit={async (values, { setSubmitting, setErrors }) => {
                const formData = new FormData()

                formData.append('billType', values.billType)
                formData.append('billDate', values.date)
                formData.append('shopName', values.shopName)
                if (values.shopId) {
                    formData.append('shop', values.shopId)
                }
                formData.append('roomNo', values.roomNo)
                formData.append('paymentMethod', values.paymentMethod)
                formData.append('amount', values.amount.toString())

                if (values.invoiceNumber) {
                    formData.append('invoiceNo', values.invoiceNumber)
                }
                if (values.note) {
                    formData.append('note', values.note)
                }
                if (values.remarks) {
                    formData.append('remarks', values.remarks)
                }

                attachmentFiles.forEach((file, index) => {
                    if (file instanceof File) {
                        formData.append('attachments', file)
                    } else {
                        formData.append(`existingAttachments[${index}]`, JSON.stringify(file))
                    }
                })

                try {
                    await onFormSubmit(formData, setSubmitting)
                } catch (error: any) {
                    setSubmitting(false)
                    if (error.message?.includes('Shop already exists')) {
                        setErrors({ shopName: 'This shop already exists' })
                    }
                }
            }}
            enableReinitialize
        >
            {({ values, touched, errors, isSubmitting, setFieldValue }) => (
                <Form>
                    <FormContainer>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                            <div className="lg:col-span-2">
                                <AdaptableCard divider className="mb-4">
                                    <h5 className="mb-4">Accommodation Bill Information</h5>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormItem label="Bill Type">
                                            <Field name="billType">
                                                {({ field, form }: FieldProps) => (
                                                    <Select
                                                        options={[{ label: 'Accommodation', value: 'accommodation' }]}
                                                        value={{ label: 'Accommodation', value: 'accommodation' }}
                                                        onChange={(option) =>
                                                            form.setFieldValue(field.name, option?.value)
                                                        }
                                                        isDisabled={type === 'edit'}
                                                    />
                                                )}
                                            </Field>
                                        </FormItem>

                                    <FormItem label="Bill Date" invalid={!!errors.billDate && touched.billDate}>
                                                                    <Field name="billDate">
                                                                        {({ field, form }: FieldProps) => (
                                                                            <DatePicker
                                                                                placeholder="Select bill Date"
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
                                            label="Shop Name"
                                            invalid={!!errors.shopName && touched.shopName}
                                            errorMessage={errors.shopName as string}
                                        >
                                            <Field name="shopName">
                                                {({ field, form }: FieldProps) => {
                                                    const selectedShop = shopOptions.find(
                                                        (shop) => shop.label === field.value
                                                    ) || null

                                                    return (
                                                        <Select
                                                            placeholder={isLoading ? 'Loading shops...' : 'Select Shop'}
                                                            options={shopOptions}
                                                            value={selectedShop}
                                                            onChange={(option) => {
                                                                form.setFieldValue(field.name, option?.label || '')
                                                                form.setFieldValue('shopId', option?.value || '')
                                                            }}
                                                            loading={isLoading}
                                                        />
                                                    )
                                                }}
                                            </Field>
                                        </FormItem>

                                        <FormItem
                                            label="Room No"
                                            invalid={!!errors.roomNo && touched.roomNo}
                                            errorMessage={errors.roomNo as string}
                                        >
                                            <Field
                                                type="text"
                                                autoComplete="off"
                                                name="roomNo"
                                                placeholder="Room No"
                                                component={Input}
                                            />
                                        </FormItem>

                                        <FormItem
                                            label="Payment Method"
                                            invalid={!!errors.paymentMethod && touched.paymentMethod}
                                            errorMessage={errors.paymentMethod as string}
                                        >
                                            <Field name="paymentMethod">
                                                {({ field, form }: FieldProps) => (
                                                    <Select
                                                        placeholder="Select Payment Method"
                                                        options={PaymentMethodOptions}
                                                        value={PaymentMethodOptions.find(
                                                            (method) => method.value === values.paymentMethod
                                                        )}
                                                        onChange={(option) =>
                                                            form.setFieldValue(field.name, option?.value || '')
                                                        }
                                                    />
                                                )}
                                            </Field>
                                        </FormItem>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormItem label="Invoice Number">
                                            <Field
                                                type="text"
                                                autoComplete="off"
                                                name="invoiceNumber"
                                                placeholder="Invoice Number"
                                                component={Input}
                                            />
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
                                    </div>

                                    <div className="grid grid-cols-1 gap-4">
                                        <FormItem label="Note">
                                            <Field
                                                as="textarea"
                                                autoComplete="off"
                                                name="note"
                                                placeholder="Note"
                                                component={Input}
                                                textArea
                                            />
                                        </FormItem>
                                       
                                    </div>
                                </AdaptableCard>

                                <AdaptableCard divider className="mb-4">
                                    <h5 className="mb-4">Attachments</h5>
                                    <FormItem label="Attachments">
                                        <input
                                            type="file"
                                            multiple
                                            onChange={handleAttachmentChange}
                                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/30 dark:file:text-blue-300 dark:hover:file:bg-blue-900/20"
                                            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                        />

                                        {attachmentFiles.length > 0 && (
                                            <div className="space-y-2 mt-3">
                                                {attachmentFiles.map((file, index) => {
                                                    const isFileInstance = file instanceof File
                                                    const displayName = isFileInstance
                                                        ? file.name
                                                        : (file as any).fileName
                                                    const fileUrl = isFileInstance
                                                        ? undefined
                                                        : (file as any).filePath

                                                    return (
                                                        <div
                                                            key={index}
                                                            className="flex items-center justify-between p-2 border rounded"
                                                        >
                                                            {fileUrl ? (
                                                                <a
                                                                    href={fileUrl}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="text-sm text-blue-600 dark:text-blue-300 truncate hover:underline"
                                                                >
                                                                    {displayName}
                                                                </a>
                                                            ) : (
                                                                <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                                                                    {displayName}
                                                                </span>
                                                            )}
                                                            <button
                                                                type="button"
                                                                onClick={() => handleAttachmentRemove(index)}
                                                                className="text-red-500 hover:text-red-700 ml-2"
                                                            >
                                                                <HiOutlineTrash />
                                                            </button>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        )}
                                    </FormItem>
                                </AdaptableCard>
                                <AdaptableCard divider className="mb-4">
                                    <h5 className="mb-4">Remarks</h5>
                                     <FormItem label="Remarks">
                                            <Field
                                                as="textarea"
                                                autoComplete="off"
                                                name="remarks"
                                                placeholder="Remarks"
                                                component={Input}
                                                textArea
                                            />
                                        </FormItem>
                                </AdaptableCard>

                            </div>
                        </div>

                        <StickyFooter className="-mx-8 px-8 flex items-center justify-between py-4" stickyClass="border-t bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                            <div>
                                {type === 'edit' && onDelete && (
                                    <DeleteBillButton onDelete={onDelete} />
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

AccBillForm.displayName = 'AccBillForm'

const DeleteBillButton = ({ onDelete }: { onDelete: OnDelete }) => {
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
                title="Delete Accommodation Bill"
                confirmButtonColor="red-600"
                onClose={onDialogClose}
                onRequestClose={onDialogClose}
                onCancel={onDialogClose}
                onConfirm={onConfirmDialog}
            >
                <p>Are you sure you want to delete this accommodation bill?</p>
            </ConfirmDialog>
        </>
    )
}

export default AccBillForm