import { forwardRef } from 'react'
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
    projectName: string
    poNumber: string
    startDate: Date | string
    budget: number
    expenses: number
    profit: number
    description: string
    attachments?: Array<File | { fileName: string; filePath: string }>
}

export type FormModel = Omit<InitialData, 'startDate'> & { 
    startDate: Date
    attachments: Array<File | { fileName: string; filePath: string }>
}

const today = new Date()

export type SetSubmitting = (isSubmitting: boolean) => void
export type OnDeleteCallback = React.Dispatch<React.SetStateAction<boolean>>
type OnDelete = (callback: OnDeleteCallback) => void

type ProfitAndLossFormProps = {
    initialData?: InitialData
    type: 'edit' | 'new'
    onDiscard?: () => void
    onDelete?: OnDelete
    onFormSubmit: (
        formData: FormModel,
        setSubmitting: SetSubmitting,
    ) => Promise<any>
}

const ProfitAndLossForm = forwardRef<FormikRef, ProfitAndLossFormProps>((props, ref) => {
    const {
        type,
        initialData = {
            projectName: '',
            poNumber: '',
            startDate: new Date(),
            budget: 0,
            expenses: 0,
            profit: 0,
            description: '',
            attachments: [],
        },
        onFormSubmit,
        onDiscard,
        onDelete,
    } = props

    const validationSchema = Yup.object().shape({
        projectName: Yup.string()
            .required('Project name is required')
            .max(100, 'Project name must be at most 100 characters'),
        poNumber: Yup.string()
            .max(50, 'PO number must be at most 50 characters'),
        startDate: Yup.date()
            .required('Project start date is required')
            .typeError('Please select a valid date'),
        budget: Yup.number()
            .required('Budget is required')
            .positive('Budget must be positive')
            .typeError('Budget must be a number'),
        expenses: Yup.number()
            .required('Expenses are required')
            .positive('Expenses must be positive')
            .typeError('Expenses must be a number'),
        profit: Yup.number()
            .required('Profit is required')
            .typeError('Profit must be a number'),
        description: Yup.string()
            .max(500, 'Description must be at most 500 characters'),
        attachments: Yup.array().max(5, 'Maximum 5 attachments allowed'),
    })

    const handleAttachmentChange = (event: React.ChangeEvent<HTMLInputElement>, setFieldValue: any) => {
        if (event.target.files) {
            const newFiles = Array.from(event.target.files)
            setFieldValue('attachments', [...initialData.attachments || [], ...newFiles])
        }
    }

    const handleAttachmentRemove = (index: number, values: any, setFieldValue: any) => {
        const updatedFiles = [...values.attachments]
        updatedFiles.splice(index, 1)
        setFieldValue('attachments', updatedFiles)
    }

    return (
        <Formik
            innerRef={ref}
            initialValues={{
                projectName: initialData.projectName || '',
                poNumber: initialData.poNumber || '',
                startDate: initialData.startDate instanceof Date 
                    ? initialData.startDate 
                    : new Date(initialData.startDate),
                budget: initialData.budget || 0,
                expenses: initialData.expenses || 0,
                profit: initialData.profit || 0,
                description: initialData.description || '',
                attachments: initialData.attachments || [],
            }}
            validationSchema={validationSchema}
            onSubmit={async (values, { setSubmitting, setErrors, resetForm }) => {
                try {
                    await onFormSubmit(values as FormModel, setSubmitting)
                    // Optionally reset form after successful submission
                    // resetForm()
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
                resetForm,
            }) => (
                <Form>
                    <FormContainer>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                            <div className="lg:col-span-2">
                                <AdaptableCard divider className="mb-4">
                                    <h5 className="mb-4">Project Information</h5>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                        <FormItem
                                            label="Project Name"
                                            invalid={!!errors.projectName && touched.projectName}
                                            errorMessage={errors.projectName as string}
                                        >
                                            <Field name="projectName">
                                                {({ field }: FieldProps) => (
                                                    <Input
                                                        autoComplete="off"
                                                        placeholder="Enter project name"
                                                        {...field}
                                                    />
                                                )}
                                            </Field>
                                        </FormItem>

                                        <FormItem
                                            label="PO Number"
                                            invalid={!!errors.poNumber && touched.poNumber}
                                            errorMessage={errors.poNumber as string}
                                        >
                                            <Field name="poNumber">
                                                {({ field }: FieldProps) => (
                                                    <Input
                                                        autoComplete="off"
                                                        placeholder="Enter PO number"
                                                        {...field}
                                                    />
                                                )}
                                            </Field>
                                        </FormItem>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormItem
                                            label="Start Date"
                                            invalid={!!errors.startDate && touched.startDate}
                                            errorMessage={errors.startDate as string}
                                        >
                                            <Field name="startDate">
                                                {({ field, form }: FieldProps) => {
                                                    const dateValue = field.value && !isNaN(new Date(field.value).getTime())
                                                        ? new Date(field.value)
                                                        : null
                                                    
                                                    return (
                                                        <DatePicker
                                                            placeholder="Select Start Date"
                                                            value={dateValue}
                                                            maxDate={today}
                                                            onChange={(date) => form.setFieldValue(field.name, date || null)}
                                                        />
                                                    )
                                                }}
                                            </Field>
                                        </FormItem>
                                    </div>
                                </AdaptableCard>

                                <AdaptableCard divider className="mb-4">
                                    <h5 className="mb-4">Financial Information</h5>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <FormItem
                                            label="Budget"
                                            invalid={!!errors.budget && touched.budget}
                                            errorMessage={errors.budget as string}
                                        >
                                            <Field name="budget">
                                                {({ field, form }: FieldProps) => (
                                                    <Input
                                                        type="number"
                                                        autoComplete="off"
                                                        placeholder="Budget"
                                                        {...field}
                                                        onChange={(e) => {
                                                            form.setFieldValue(
                                                                field.name,
                                                                e.target.value,
                                                            )
                                                            // Auto-calculate profit
                                                            const budget = parseFloat(e.target.value) || 0
                                                            const expenses = parseFloat(values.expenses) || 0
                                                            const profit = budget - expenses
                                                            form.setFieldValue('profit', profit)
                                                        }}
                                                    />
                                                )}
                                            </Field>
                                        </FormItem>

                                        <FormItem
                                            label="Expenses"
                                            invalid={!!errors.expenses && touched.expenses}
                                            errorMessage={errors.expenses as string}
                                        >
                                            <Field name="expenses">
                                                {({ field, form }: FieldProps) => (
                                                    <Input
                                                        type="number"
                                                        autoComplete="off"
                                                        placeholder="Expenses"
                                                        {...field}
                                                        onChange={(e) => {
                                                            form.setFieldValue(
                                                                field.name,
                                                                e.target.value,
                                                            )
                                                            // Auto-calculate profit
                                                            const budget = parseFloat(values.budget) || 0
                                                            const expenses = parseFloat(e.target.value) || 0
                                                            const profit = budget - expenses
                                                            form.setFieldValue('profit', profit)
                                                        }}
                                                    />
                                                )}
                                            </Field>
                                        </FormItem>

                                        <FormItem
                                            label="Profit"
                                            invalid={!!errors.profit && touched.profit}
                                            errorMessage={errors.profit as string}
                                        >
                                            <Field name="profit">
                                                {({ field, form }: FieldProps) => (
                                                    <Input
                                                        type="number"
                                                        autoComplete="off"
                                                        placeholder="Profit"
                                                        {...field}
                                                        readOnly
                                                    />
                                                )}
                                            </Field>
                                        </FormItem>
                                    </div>
                                </AdaptableCard>

                                <AdaptableCard divider className="mb-4">
                                    <h5 className="mb-4">Project Details</h5>
                                    <FormItem
                                        label="Description"
                                        invalid={!!errors.description && touched.description}
                                        errorMessage={errors.description as string}
                                    >
                                        <Field name="description">
                                            {({ field }: FieldProps) => (
                                                <Input
                                                    as="textarea"
                                                    autoComplete="off"
                                                    placeholder="Enter project description"
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
                                        invalid={!!errors.attachments && touched.attachments}
                                        errorMessage={errors.attachments as string}
                                    >
                                        <div className="mb-4">
                                            <input
                                                key={values.attachments.length} // Important for reset
                                                type="file"
                                                multiple
                                                onChange={(e) => handleAttachmentChange(e, setFieldValue)}
                                                onBlur={() => handleBlur({ target: { name: 'attachments' } })}
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

                                        {values.attachments.length > 0 && (
                                            <div className="space-y-2">
                                                {values.attachments.map(
                                                    (file: File | { fileName: string; filePath: string }, index: number) => {
                                                        const isFileInstance = file instanceof File
                                                        const displayName = isFileInstance
                                                            ? file.name
                                                            : (file as { fileName: string }).fileName
                                                        const fileUrl = isFileInstance
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
                                                                    onClick={() => handleAttachmentRemove(index, values, setFieldValue)}
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
                                        onClick={() => onDelete((shouldDelete) => {
                                            if (shouldDelete) {
                                                resetForm()
                                            }
                                        })}
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
                                    onClick={() => {
                                        resetForm()
                                        onDiscard?.()
                                    }}
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

ProfitAndLossForm.displayName = 'ProfitAndLossForm'

export default ProfitAndLossForm