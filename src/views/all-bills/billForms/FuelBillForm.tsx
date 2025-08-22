import { forwardRef, useState, useEffect } from 'react'
import { FormContainer, FormItem } from '@/components/ui/Form'
import Button from '@/components/ui/Button'
import StickyFooter from '@/components/shared/StickyFooter'
import { Field, Form, Formik, FormikProps, FieldProps } from 'formik'
import { AiOutlineSave } from 'react-icons/ai'
import { HiOutlineTrash } from 'react-icons/hi'
import * as Yup from 'yup'
import { Input, Upload } from '@/components/ui'
import { AdaptableCard } from '@/components/shared'
import Select from '@/components/ui/Select'
import DatePicker from '@/components/ui/DatePicker'
import { fetchVehicles } from '../api/api'
import { format } from 'date-fns'

type FormikRef = FormikProps<any>
const today = new Date()

const PaymentMethodOptions = [
    { label: 'ADCB', value: 'adcb' },
    { label: 'ADIB', value: 'adib' },
    { label: 'Cash', value: 'cash' },
    { label: 'MASHREQ CARD', value: 'masherq_card' },
    { label: 'ATHEER PLUS ', value: 'atheer_plus' },
]

type InitialData = {
    billType: string
    billDate: string
    description: string
    vehicleNo: string
    vehicleId?: string

    paymentMethod: string
    amount: number
    kilometer: number
    liter: number
    remarks: string
    attachments: File[] | string[]
}

export type FormModel = InitialData

export type SetSubmitting = (isSubmitting: boolean) => void
export type OnDeleteCallback = React.Dispatch<React.SetStateAction<boolean>>
type OnDelete = (callback: OnDeleteCallback) => void

type FuelBillFormProps = {
    initialData?: InitialData
    type: 'edit' | 'new'
    onDiscard?: () => void
    onDelete?: OnDelete
    onFormSubmit: (
        formData: FormData,
        setSubmitting: SetSubmitting,
    ) => Promise<any>
}

const FuelBillForm = forwardRef<FormikRef, FuelBillFormProps>((props, ref) => {
    const {
        type,
        initialData = {
            billType: 'fuel',
            billDate: new Date().toISOString().split('T')[0],
            description: '',
            vehicleNo: '',
            paymentMethod: '',
            amount: 0,
            kilometer: 0,
            liter: 0,
            remarks: '',
            attachments: [],
        },
        onFormSubmit,
        onDiscard,
        onDelete,
    } = props

    const [attachmentFiles, setAttachmentFiles] = useState<(File | string)[]>(
        [],
    )
    const [vehicleOptions, setVechileOptions] = useState<
        { label: string; value: string }[]
    >([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        if (initialData.attachments) {
            setAttachmentFiles(initialData.attachments)
        }
    }, [initialData])


    useEffect(() => {
        const loadData = async () => {
            try {
                // Fetch vehicle
                const vehicleData = await fetchVehicles()
                const vehicleOpts = vehicleData?.data?.vehicles.map(
                    (vehicle: any) => ({
                        label: vehicle.vehicleNumber,
                        value: vehicle._id,
                    }),
                )
                setVechileOptions(vehicleOpts || [])
            } catch (error) {
                console.error('Failed to load data:', error)
            } finally {
                setIsLoading(false)
            }
        }

        loadData()
    }, [])

    const validationSchema = Yup.object().shape({
        billType: Yup.string().required('Bill type is required'),
        billDate: Yup.date()
            .required('Bill date is required')
            .typeError('Please select a valid date'),
        description: Yup.string().required('Description is required'),
        vehicleNo: Yup.string().required('Vehicle number is required'),
        paymentMethod: Yup.string().required('Payment method is required'),
        amount: Yup.number()
            .required('Amount is required')
            .positive('Amount must be positive')
            .typeError('Amount must be a number'),
        kilometer: Yup.number()
            .required('Kilometer reading is required')
            .positive('Kilometer must be positive')
            .typeError('Kilometer must be a number'),
        liter: Yup.number()
            .required('Liter is required')
            .positive('Liter must be positive')
            .typeError('Liter must be a number'),
        remarks: Yup.string().max(
            500,
            'Remarks must be at most 500 characters',
        ),
        attachments: Yup.mixed(),
    })

    const handleAttachmentChange = (
        event: React.ChangeEvent<HTMLInputElement>,
    ) => {
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
                billType: initialData.billType || 'fuel',
                billDate: initialData.billDate || '',
                description: initialData.description || '',
                vehicleNo: initialData.vehicleId || initialData.vehicleNo || '',
                paymentMethod: initialData.paymentMethod || '',
                amount: initialData.amount || '',
                kilometer: initialData.kilometer || '',
                liter: initialData.liter || '',
                remarks: initialData.remarks || '',
                attachments: initialData.attachments || [],
            }}
            validationSchema={validationSchema}
            onSubmit={async (values, { setSubmitting, setErrors }) => {
                try {
                    const formData = new FormData()
                    formData.append('billType', values.billType)
                    formData.append('billDate', values.billDate)
                    formData.append('description', values.description)
                    formData.append('vehicle', values.vehicleNo)
                    formData.append('paymentMethod', values.paymentMethod)
                    formData.append('amount', values.amount.toString())
                    formData.append('kilometer', values.kilometer.toString())
                    formData.append('liter', values.liter.toString())
                    formData.append('remarks', values.remarks || '')

                    attachmentFiles.forEach((file, index) => {
                        if (file instanceof File) {
                            formData.append(`attachments`, file)
                        } else if (
                            typeof file === 'string' &&
                            type === 'edit'
                        ) {
                            formData.append(
                                `existingAttachments[${index}]`,
                                file,
                            )
                        }
                    })

                    await onFormSubmit(formData, setSubmitting)
                } catch (error: any) {
                    setSubmitting(false)
                    if (error.response?.data?.errors) {
                        setErrors(error.response.data.errors)
                    }
                    console.error('Form submission error:', error)
                }
            }}
            enableReinitialize={true}
        >
            {({
                values,
                touched,
                errors,
                isSubmitting,
                setFieldValue,
                handleBlur,
            }) => (
                <Form>
                    <FormContainer>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                            <div className="lg:col-span-2">
                                <AdaptableCard divider className="mb-4">
                                    <h5 className="mb-4">
                                        Fuel Bill Information
                                    </h5>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormItem
                                            label="Bill Type"
                                            invalid={
                                                !!errors.billType &&
                                                touched.billType
                                            }
                                            errorMessage={
                                                errors.billType as string
                                            }
                                        >
                                            <Field name="billType">
                                                {({
                                                    field,
                                                    form,
                                                }: FieldProps) => {
                                                    const options = [
                                                        {
                                                            label: 'Fuel',
                                                            value: 'fuel',
                                                            disabled: true,
                                                        },
                                                    ]
                                                    const selectedOption =
                                                        options.find(
                                                            (opt) =>
                                                                opt.value ===
                                                                field.value,
                                                        ) || options[0]
                                                    return (
                                                        <Select
                                                            options={options}
                                                            value={
                                                                selectedOption
                                                            }
                                                            isOptionDisabled={(
                                                                option,
                                                            ) =>
                                                                option.disabled
                                                            }
                                                            onChange={(
                                                                option,
                                                            ) => {
                                                                form.setFieldValue(
                                                                    field.name,
                                                                    option?.value,
                                                                )
                                                            }}
                                                            onBlur={
                                                                field.onBlur
                                                            }
                                                            name={field.name}
                                                        />
                                                    )
                                                }}
                                            </Field>
                                        </FormItem>

                                        <FormItem
                                            label="Bill Date"
                                            invalid={
                                                !!errors.billDate &&
                                                touched.billDate
                                            }
                                        >
                                            <Field name="billDate">
                                                {({
                                                    field,
                                                    form,
                                                }: FieldProps) => (
                                                    <DatePicker
                                                        placeholder="Select bill Date"
                                                        value={
                                                            field.value
                                                                ? new Date(
                                                                      field.value,
                                                                  )
                                                                : null
                                                        }
                                                        maxDate={today}
                                                        onChange={(date) =>
                                                            form.setFieldValue(
                                                                field.name,
                                                                date
                                                                    ? format(
                                                                          new Date(
                                                                              date.getFullYear(),
                                                                              date.getMonth(),
                                                                              date.getDate(),
                                                                          ),
                                                                          'yyyy-MM-dd',
                                                                      )
                                                                    : '',
                                                            )
                                                        }
                                                    />
                                                )}
                                            </Field>
                                        </FormItem>

                                        <FormItem
                                            label="Description"
                                            invalid={
                                                !!errors.description &&
                                                touched.description
                                            }
                                            errorMessage={
                                                errors.description as string
                                            }
                                        >
                                            <Field name="description">
                                                {({ field }: FieldProps) => (
                                                    <Input
                                                        type="text"
                                                        autoComplete="off"
                                                        placeholder="Description"
                                                        {...field}
                                                    />
                                                )}
                                            </Field>
                                        </FormItem>

                                        <FormItem
                                            label="Vehicle No"
                                            invalid={
                                                !!errors.vehicleNo &&
                                                touched.vehicleNo
                                            }
                                            errorMessage={
                                                errors.vehicleNo as string
                                            }
                                        >
                                            <Field name="vehicleNo">
                                                {({
                                                    field,
                                                    form,
                                                }: FieldProps) => (
                                                    <Select
                                                        placeholder="Select Vehicle Number"
                                                        options={vehicleOptions}
                                                        value={vehicleOptions.find(
                                                            (vehicle) =>
                                                                vehicle.value ===
                                                                values.vehicleNo,
                                                        )}
                                                        onChange={(option) => {
                                                            form.setFieldValue(
                                                                field.name,
                                                                option?.value ||
                                                                    '',
                                                            )
                                                        }}
                                                        onBlur={field.onBlur}
                                                        loading={isLoading}
                                                    />
                                                )}
                                            </Field>
                                        </FormItem>
                                        <FormItem
                                            label="Payment Method"
                                            invalid={
                                                !!errors.paymentMethod &&
                                                touched.paymentMethod
                                            }
                                            errorMessage={
                                                errors.paymentMethod as string
                                            }
                                        >
                                            <Field name="paymentMethod">
                                                {({
                                                    field,
                                                    form,
                                                }: FieldProps) => (
                                                    <Select
                                                        placeholder="Select Payment Method"
                                                        options={
                                                            PaymentMethodOptions
                                                        }
                                                        value={PaymentMethodOptions.find(
                                                            (method) =>
                                                                method.value ===
                                                                values.paymentMethod,
                                                        )}
                                                        onChange={(option) => {
                                                            form.setFieldValue(
                                                                field.name,
                                                                option?.value ||
                                                                    '',
                                                            )
                                                        }}
                                                        onBlur={field.onBlur}
                                                    />
                                                )}
                                            </Field>
                                        </FormItem>

                                        <FormItem
                                            label="Amount"
                                            invalid={
                                                !!errors.amount &&
                                                touched.amount
                                            }
                                            errorMessage={
                                                errors.amount as string
                                            }
                                        >
                                            <Field name="amount">
                                                {({
                                                    field,
                                                    form,
                                                }: FieldProps) => (
                                                    <Input
                                                        type="number"
                                                        autoComplete="off"
                                                        placeholder="Amount"
                                                        {...field}
                                                        onChange={(e) => {
                                                            form.setFieldValue(
                                                                field.name,
                                                                e.target.value,
                                                            )
                                                        }}
                                                    />
                                                )}
                                            </Field>
                                        </FormItem>

                                        <FormItem
                                            label="Kilometer"
                                            invalid={
                                                !!errors.kilometer &&
                                                touched.kilometer
                                            }
                                            errorMessage={
                                                errors.kilometer as string
                                            }
                                        >
                                            <Field name="kilometer">
                                                {({
                                                    field,
                                                    form,
                                                }: FieldProps) => (
                                                    <Input
                                                        type="number"
                                                        autoComplete="off"
                                                        placeholder="Kilometer Reading"
                                                        {...field}
                                                        onChange={(e) => {
                                                            form.setFieldValue(
                                                                field.name,
                                                                e.target.value,
                                                            )
                                                        }}
                                                    />
                                                )}
                                            </Field>
                                        </FormItem>

                                        <FormItem
                                            label="Liter"
                                            invalid={
                                                !!errors.liter && touched.liter
                                            }
                                            errorMessage={
                                                errors.liter as string
                                            }
                                        >
                                            <Field name="liter">
                                                {({
                                                    field,
                                                    form,
                                                }: FieldProps) => (
                                                    <Input
                                                        type="number"
                                                        autoComplete="off"
                                                        placeholder="Liter"
                                                        {...field}
                                                        onChange={(e) => {
                                                            form.setFieldValue(
                                                                field.name,
                                                                e.target.value,
                                                            )
                                                        }}
                                                    />
                                                )}
                                            </Field>
                                        </FormItem>
                                    </div>
                                </AdaptableCard>

                                <AdaptableCard divider className="mb-4">
                                    <h5 className="mb-4">Attachments</h5>
                                    <FormItem
                                        label="Attachments"
                                        invalid={
                                            !!errors.attachments &&
                                            touched.attachments
                                        }
                                        errorMessage={
                                            errors.attachments as string
                                        }
                                    >
                                        <div className="mb-4">
                                            <input
                                                type="file"
                                                multiple
                                                onChange={
                                                    handleAttachmentChange
                                                }
                                                onBlur={() =>
                                                    handleBlur({
                                                        target: {
                                                            name: 'attachments',
                                                        },
                                                    })
                                                }
                                                className="block w-full text-sm text-gray-500
                                                file:mr-4 file:py-2 file:px-4
                                                file:rounded-md file:border-0
                                                file:text-sm file:font-semibold
                                                file:bg-blue-50 file:text-blue-700
                                                hover:file:bg-blue-100
                                                dark:file:bg-blue-900/30 dark:file:text-blue-300
                                                dark:hover:file:bg-blue-900/20"
                                                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                            />
                                        </div>

                                        {attachmentFiles.length > 0 && (
                                            <div className="space-y-2">
                                                {attachmentFiles.map(
                                                    (file, index) => {
                                                        // Handle both File objects and attachment objects from API
                                                        let displayName: string
                                                        let fileId:
                                                            | string
                                                            | undefined

                                                        if (
                                                            file instanceof File
                                                        ) {
                                                            displayName =
                                                                file.name
                                                        } else if (
                                                            typeof file ===
                                                                'object' &&
                                                            file !== null
                                                        ) {
                                                            // Handle API attachment object
                                                            displayName =
                                                                file.fileName ||
                                                                file.filePath ||
                                                                'Attachment'
                                                            fileId = file._id
                                                        } else if (
                                                            typeof file ===
                                                            'string'
                                                        ) {
                                                            displayName = file
                                                        } else {
                                                            displayName =
                                                                'Attachment'
                                                        }

                                                        return (
                                                            <div
                                                                key={
                                                                    fileId ||
                                                                    index
                                                                }
                                                                className="flex items-center justify-between p-2 border rounded"
                                                            >
                                                                <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                                                                    {
                                                                        displayName
                                                                    }
                                                                </span>
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        handleAttachmentRemove(
                                                                            index,
                                                                        )
                                                                    }
                                                                    className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 ml-2"
                                                                >
                                                                    <HiOutlineTrash />
                                                                </button>
                                                            </div>
                                                        )
                                                    },
                                                )}
                                            </div>
                                        )}
                                    </FormItem>
                                </AdaptableCard>

                                <AdaptableCard divider className="mb-4">
                                    <h5 className="mb-4">Remarks</h5>
                                    <FormItem
                                        label="Remarks"
                                        invalid={
                                            !!errors.remarks && touched.remarks
                                        }
                                        errorMessage={errors.remarks as string}
                                    >
                                        <Field name="remarks">
                                            {({ field }: FieldProps) => (
                                                <Input
                                                    as="textarea"
                                                    autoComplete="off"
                                                    placeholder="Enter any remarks"
                                                    {...field}
                                                />
                                            )}
                                        </Field>
                                    </FormItem>
                                </AdaptableCard>
                            </div>
                        </div>

                        <StickyFooter
                            className="-mx-8 px-8 flex items-center justify-between py-4"
                            stickyClass="border-t bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                        >
                            <div>
                                {type === 'edit' && onDelete && (
                                    <Button
                                        size="sm"
                                        variant="plain"
                                        color="red"
                                        icon={<HiOutlineTrash />}
                                        type="button"
                                        onClick={() => onDelete(() => {})}
                                    >
                                        Delete
                                    </Button>
                                )}
                            </div>
                            <div className="md:flex items-center">
                                <Button
                                    size="sm"
                                    className="ltr:mr-3 rtl:ml-3"
                                    type="button"
                                    onClick={() => onDiscard?.()}
                                >
                                    Discard
                                </Button>
                                <Button
                                    size="sm"
                                    variant="solid"
                                    loading={isSubmitting}
                                    icon={<AiOutlineSave />}
                                    type="submit"
                                >
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

FuelBillForm.displayName = 'FuelBillForm'

export default FuelBillForm
