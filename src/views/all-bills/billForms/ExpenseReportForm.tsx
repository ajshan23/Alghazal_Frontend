import { forwardRef, useState } from 'react'
import { FormContainer, FormItem } from '@/components/ui/Form'
import Button from '@/components/ui/Button'
import StickyFooter from '@/components/shared/StickyFooter'
import { Field, Form, Formik, FormikProps, FieldProps } from 'formik'
import { AiOutlineSave } from 'react-icons/ai'
import { HiOutlineTrash } from 'react-icons/hi'
import * as Yup from 'yup'
import { Input } from '@/components/ui'
import { AdaptableCard } from '@/components/shared'
import DatePicker from '@/components/ui/DatePicker'

type FormikRef = FormikProps<any>

type InitialData = {
    reportDate: Date | string
    description: string
    amount: number
    remarks: string
    attachments?: Array<File | { fileName: string; filePath: string }>
}

export type FormModel = Omit<InitialData, 'reportDate'> & { 
    reportDate: Date 
    attachments?: File[]
}

const today = new Date()

export type SetSubmitting = (isSubmitting: boolean) => void
export type OnDeleteCallback = React.Dispatch<React.SetStateAction<boolean>>
type OnDelete = (callback: OnDeleteCallback) => void

type ExpenseReportFormProps = {
    initialData?: InitialData
    type: 'edit' | 'new'
    onDiscard?: () => void
    onDelete?: OnDelete
    onFormSubmit: (
        formData: FormModel,
        setSubmitting: SetSubmitting,
    ) => Promise<any>
}

const ExpenseReportForm = forwardRef<FormikRef, ExpenseReportFormProps>((props, ref) => {
    const {
        type,
        initialData = {
            reportDate: new Date(),
            description: '',
            amount: 0,
            remarks: '',
            attachments: [],
        },
        onFormSubmit,
        onDiscard,
        onDelete,
    } = props

    const [attachmentFiles, setAttachmentFiles] = useState<Array<File | { fileName: string; filePath: string }>>(
        initialData.attachments || []
    )

    const validationSchema = Yup.object().shape({
        reportDate: Yup.date()
            .required('Report date is required')
            .typeError('Please select a valid date'),
        description: Yup.string()
            .required('Description is required')
            .max(200, 'Description must be at most 200 characters'),
        amount: Yup.number()
            .required('Amount is required')
            .positive('Amount must be positive')
            .typeError('Amount must be a number'),
        remarks: Yup.string().max(500, 'Remarks must be at most 500 characters'),
        attachments: Yup.array().max(5, 'Maximum 5 attachments allowed'),
    })

    const handleAttachmentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            const newFiles = Array.from(event.target.files)
            const updatedFiles = [...attachmentFiles, ...newFiles]
            
            if (updatedFiles.length > 5) {
                alert('Maximum 5 attachments allowed')
                return
            }
            
            setAttachmentFiles(updatedFiles)
        }
    }

    const handleAttachmentRemove = (index: number) => {
        const updatedFiles = [...attachmentFiles]
        updatedFiles.splice(index, 1)
        setAttachmentFiles(updatedFiles)
    }

    return (
        <Formik
            innerRef={ref}
            initialValues={{
                reportDate: initialData.reportDate instanceof Date 
                    ? initialData.reportDate 
                    : new Date(initialData.reportDate),
                description: initialData.description || '',
                amount: initialData.amount || '',
                remarks: initialData.remarks || '',
                attachments: [],
            }}
            validationSchema={validationSchema}
            onSubmit={async (values, { setSubmitting, setErrors }) => {
                try {
                    const formData = {
                        ...values,
                        attachments: attachmentFiles.filter(file => file instanceof File) as File[],
                    } as FormModel
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
                                    <h5 className="mb-4">Expense Report Information</h5>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormItem
                                            label="Report Date"
                                            invalid={!!errors.reportDate && touched.reportDate}
                                            errorMessage={errors.reportDate as string}
                                        >
                                            <Field name="reportDate">
                                                {({ field, form }: FieldProps) => (
                                                    <DatePicker
                                                        placeholder="Select Report Date"
                                                        value={
                                                            field.value
                                                                ? new Date(field.value)
                                                                : null
                                                        }
                                                        maxDate={today}
                                                        onChange={(date) =>
                                                            form.setFieldValue(
                                                                field.name,
                                                                date || null
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
                                    <FormItem
                                        label="Description"
                                        invalid={!!errors.description && touched.description}
                                        errorMessage={errors.description as string}
                                    >
                                        <Field name="description">
                                            {({ field }: FieldProps) => (
                                                <Input
                                                    autoComplete="off"
                                                    placeholder="Enter description"
                                                    {...field}
                                                />
                                            )}
                                        </Field>
                                    </FormItem>

                                    <FormItem
                                        label="Remarks"
                                        invalid={!!errors.remarks && touched.remarks}
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
                                                onChange={handleAttachmentChange}
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
                                                                : (file as { fileName: string }).fileName
                                                        const fileUrl =
                                                            isFileInstance
                                                                ? undefined
                                                                : (file as { filePath: string }).filePath

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

ExpenseReportForm.displayName = 'ExpenseReportForm'

export default ExpenseReportForm