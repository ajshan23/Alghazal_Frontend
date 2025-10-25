import { forwardRef, useState } from 'react'
import { Formik, Form, Field, FormikProps } from 'formik'
import * as Yup from 'yup'
import { Input } from '@/components/ui'
import Button from '@/components/ui/Button'
import { FormContainer, FormItem } from '@/components/ui/Form'
import StickyFooter from '@/components/shared/StickyFooter'
import { AiOutlineSave } from 'react-icons/ai'
import { HiOutlineTrash } from 'react-icons/hi'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import { AdaptableCard } from '@/components/shared'

type FormikRef = FormikProps<CategoryFormModel>

type CategoryFormModel = {
    name: string
    description: string
}

export type SetSubmitting = (isSubmitting: boolean) => void
export type OnDeleteCallback = React.Dispatch<React.SetStateAction<boolean>>
type OnDelete = (callback: OnDeleteCallback) => void

type CategoryDetailsFormProps = {
    initialData?: Partial<CategoryFormModel>
    type: 'edit' | 'new'
    onFormSubmit: (values: CategoryFormModel, setSubmitting: SetSubmitting) => Promise<void>
    onDiscard?: () => void
    onDelete?: OnDelete
}

const CategoryDetailsForm = forwardRef<FormikRef, CategoryDetailsFormProps>((props, ref) => {
    const {
        type,
        initialData = {
            name: '',
            description: '',
        },
        onFormSubmit,
        onDiscard,
        onDelete,
    } = props

    const validationSchema = Yup.object().shape({
        name: Yup.string().required('Category name is required'),
        description: Yup.string(),
    })

    return (
        <Formik
            innerRef={ref}
            initialValues={{
                name: initialData.name || '',
                description: initialData.description || '',
            }}
            validationSchema={validationSchema}
            onSubmit={async (values, { setSubmitting, setErrors }) => {
                try {
                    await onFormSubmit(values, setSubmitting)
                } catch (error: any) {
                    setSubmitting(false)
                    if (error.message?.includes('Category already exists')) {
                        setErrors({ name: 'This category name is already registered' })
                    }
                }
            }}
            enableReinitialize
            validateOnChange
            validateOnBlur
        >
            {({ errors, touched, isSubmitting }) => (
                <Form>
                    <FormContainer>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <AdaptableCard divider className="mb-4">
                                <h5 className="mb-4">Category Information</h5>

                                <FormItem
                                    label="Category Name"
                                    invalid={Boolean(errors.name && touched.name)}
                                    errorMessage={errors.name as string}
                                >
                                    <Field
                                        type="text"
                                        autoComplete="off"
                                        name="name"
                                        placeholder="Enter category name"
                                        component={Input}
                                    />
                                </FormItem>

                                <FormItem
                                    label="Description"
                                    invalid={Boolean(errors.description && touched.description)}
                                    errorMessage={errors.description as string}
                                >
                                    <Field
                                        as="textarea"
                                        autoComplete="off"
                                        name="description"
                                        placeholder="Enter any description"
                                        component={Input}
                                        textArea
                                    />
                                </FormItem>
                            </AdaptableCard>
                        </div>

                        <StickyFooter
                            className="-mx-8 px-8 flex items-center justify-between py-4"
                            stickyClass="border-t bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                        >
                            <div>
                                {type === 'edit' && onDelete && (
                                    <DeleteCategoryButton onDelete={onDelete} />
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

CategoryDetailsForm.displayName = 'CategoryDetailsForm'

const DeleteCategoryButton = ({ onDelete }: { onDelete: OnDelete }) => {
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
                title="Delete Category"
                confirmButtonColor="red-600"
                onClose={onDialogClose}
                onRequestClose={onDialogClose}
                onCancel={onDialogClose}
                onConfirm={onConfirmDialog}
            >
                <p>Are you sure you want to delete this category?</p>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    This action cannot be undone.
                </p>
            </ConfirmDialog>
        </>
    )
}

export default CategoryDetailsForm