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
import { fetchCategories, fetchShops } from '../api/api'
import DatePicker from '@/components/ui/DatePicker'
import { format } from 'date-fns'

type FormikRef = FormikProps<any>

const PaymentMethodOptions = [
    { label: 'ADCB', value: 'adcb' },
    { label: 'ADIB', value: 'adib' },
    { label: 'Cash', value: 'cash' },
    { label: 'MASHREQ CARD', value: 'masherq_card' },
]

type InitialData = {
    billType: string
    billDate: string
    paymentMethod: string
    amount: number
    category: string
    shop: string
    invoiceNo: string
    remarks: string
    attachments: File[] | string[]
}

export type FormModel = InitialData
const today = new Date()

export type SetSubmitting = (isSubmitting: boolean) => void
export type OnDeleteCallback = React.Dispatch<React.SetStateAction<boolean>>
type OnDelete = (callback: OnDeleteCallback) => void

type BillFormProps = {
    initialData?: InitialData
    type: 'edit' | 'new'
    onDiscard?: () => void
    onDelete?: OnDelete
    onFormSubmit: (
        formData: FormData,
        setSubmitting: SetSubmitting,
    ) => Promise<any>
}

const GenBillForm = forwardRef<FormikRef, BillFormProps>((props, ref) => {
    const {
        type,
        initialData = {
            billType: 'general',
            billDate: new Date().toISOString().split('T')[0],
            paymentMethod: '',
            amount: 0,
            category: '',
            shop: '',
            invoiceNo: '',
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
    const [shopOptions, setShopOptions] = useState<
        { label: string; value: string }[]
    >([])
    const [categoryOptions, setCategoryOptions] = useState<
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
                // Fetch shops
                const shopData = await fetchShops()
                const shopOpts = shopData?.data?.shops.map((shop: any) => ({
                    label: shop.shopName,
                    value: shop._id,
                }))
                setShopOptions(shopOpts || [])

                // Fetch categories
                const categoryData = await fetchCategories()
                const categoryOpts = categoryData?.data?.categories?.map(
                    (category: any) => ({
                        label: category.name,
                        value: category._id,
                    }),
                )
                setCategoryOptions(categoryOpts || [])
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
        paymentMethod: Yup.string().required('Payment method is required'),
        amount: Yup.number()
            .required('Amount is required')
            .positive('Amount must be positive')
            .typeError('Amount must be a number'),
        category: Yup.string().required('Category is required'),
        shop: Yup.string().required('Shop is required'),
        invoiceNo: Yup.string(),
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
                billType: initialData.billType || 'general',
                billDate: initialData.billDate || '',
                paymentMethod: initialData.paymentMethod || '',
                amount: initialData.amount || '',
                category: initialData.category || '',
                shop: initialData.shop || '',
                invoiceNo: initialData.invoiceNo || '',
                remarks: initialData.remarks || '',
                attachments: initialData.attachments || [],
            }}
            validationSchema={validationSchema}
            onSubmit={async (values, { setSubmitting, setErrors }) => {
                try {
                    const formData = new FormData()
                    formData.append('billType', values.billType)
                    formData.append('billDate', values.billDate)
                    formData.append('paymentMethod', values.paymentMethod)
                    formData.append('amount', values.amount.toString())
                    formData.append('category', values.category)
                    formData.append('shop', values.shop)
                    formData.append('invoiceNo', values.invoiceNo)
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
                                    <h5 className="mb-4">Bill Information</h5>
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
                                                            label: 'General',
                                                            value: 'general',
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
                                                        placeholder="Select billDate Date"
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
                                    </div>
                                </AdaptableCard>

                                <AdaptableCard divider className="mb-4">
                                    <h5 className="mb-4">Details</h5>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormItem
                                            label="Category"
                                            invalid={
                                                !!errors.category &&
                                                touched.category
                                            }
                                            errorMessage={
                                                errors.category as string
                                            }
                                        >
                                            <Field name="category">
                                                {({
                                                    field,
                                                    form,
                                                }: FieldProps) => (
                                                    <Select
                                                        placeholder="Select Category"
                                                        options={
                                                            categoryOptions
                                                        }
                                                        value={categoryOptions.find(
                                                            (cat) =>
                                                                cat.value ===
                                                                values.category,
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
                                            label="Shop"
                                            invalid={
                                                !!errors.shop && touched.shop
                                            }
                                            errorMessage={errors.shop as string}
                                        >
                                            <Field name="shop">
                                                {({
                                                    field,
                                                    form,
                                                }: FieldProps) => (
                                                    <Select
                                                        placeholder="Select Shop"
                                                        options={shopOptions}
                                                        value={shopOptions.find(
                                                            (shop) =>
                                                                shop.value ===
                                                                values.shop,
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
                                            label="Invoice Number"
                                            invalid={
                                                !!errors.invoiceNo &&
                                                touched.invoiceNo
                                            }
                                            errorMessage={
                                                errors.invoiceNo as string
                                            }
                                        >
                                            <Field name="invoiceNo">
                                                {({ field }: FieldProps) => (
                                                    <Input
                                                        type="text"
                                                        autoComplete="off"
                                                        placeholder="Invoice Number"
                                                        {...field}
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
                                                        const isFileInstance =
                                                            file instanceof File
                                                        const displayName =
                                                            isFileInstance
                                                                ? file.name
                                                                : file.fileName
                                                        const fileUrl =
                                                            isFileInstance
                                                                ? undefined
                                                                : file.filePath

                                                        return (
                                                            <div
                                                                key={index}
                                                                className="flex items-center justify-between p-2 border rounded"
                                                            >
                                                                {fileUrl ? (
                                                                    <a
                                                                        href={
                                                                            fileUrl
                                                                        }
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="text-sm text-blue-600 dark:text-blue-300 truncate hover:underline"
                                                                    >
                                                                        {
                                                                            displayName
                                                                        }
                                                                    </a>
                                                                ) : (
                                                                    <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                                                                        {
                                                                            displayName
                                                                        }
                                                                    </span>
                                                                )}

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

GenBillForm.displayName = 'GenBillForm'

export default GenBillForm
