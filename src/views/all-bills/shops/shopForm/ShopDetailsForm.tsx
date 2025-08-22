import { forwardRef, useState, useEffect } from 'react'
import { FormContainer, FormItem } from '@/components/ui/Form'
import Button from '@/components/ui/Button'
import StickyFooter from '@/components/shared/StickyFooter'
import { Field, Form, Formik, FormikProps } from 'formik'
import { AiOutlineSave } from 'react-icons/ai'
import { HiOutlineTrash } from 'react-icons/hi'
import * as Yup from 'yup'
import { Input } from '@/components/ui'
import { AdaptableCard } from '@/components/shared'
import ConfirmDialog from '@/components/shared/ConfirmDialog'

type FormikRef = FormikProps<any>

type InitialData = {
    shopName?: string
    shopNo?: string
    address?: string
    vat?: string
    ownerName?: string
    ownerEmail?: string
    contact?: string
 shopAttachments?: Array<File | { fileName: string; filePath: string }>
}

export type FormModel = InitialData

export type SetSubmitting = (isSubmitting: boolean) => void
export type OnDeleteCallback = React.Dispatch<React.SetStateAction<boolean>>
type OnDelete = (callback: OnDeleteCallback) => void

type ShopDetailsForm = {
    initialData?: InitialData
    type: 'edit' | 'new'
    onDiscard?: () => void
    onDelete?: OnDelete
    onFormSubmit: (
        formData: FormData,
        setSubmitting: SetSubmitting,
    ) => Promise<any>
}

const ShopDetailsForm = forwardRef<FormikRef, ShopDetailsForm>((props, ref) => {
    const {
        type,
        initialData = {
            shopName: '',
            shopNo: '',
            address: '',
            vat: '',
            ownerName: '',
            ownerEmail: '',
            contact: '',
            shopAttachments: [],
        },
        onFormSubmit,
        onDiscard,
        onDelete,
    } = props

    const [attachmentFiles, setAttachmentFiles] = useState<File[]>([])

    useEffect(() => {
        if (initialData.shopAttachments) {
            setAttachmentFiles(initialData.shopAttachments)
        }
    }, [initialData])

    const validationSchema = Yup.object().shape({
        shopName: Yup.string().required('Shop Name is required'),
        shopNo: Yup.string().required('Shop Number is required'),
        address: Yup.string().required('Address is required'),
        vat: Yup.string().required('VAT is required'),

        ownerName: Yup.string().required('Owner Name is required'),
        ownerEmail: Yup.string()
            .email('Invalid email')
            .required('Owner Email is required'),

        contact: Yup.string().required('Contact number is required'),
    })

    return (
        <Formik
            innerRef={ref}
            initialValues={{
                ...initialData,
                contact: initialData.contact || '',
                shopName: initialData.shopName || '',
                shopNo: initialData.shopNo || '',
                address: initialData.address || '',
                vat: initialData.vat || '',
                ownerName: initialData.ownerName || '',
                ownerEmail: initialData.ownerEmail || '',
                shopAttachments: initialData.shopAttachments || [],
            }}
            validationSchema={validationSchema}
            onSubmit={async (values, { setSubmitting, setErrors }) => {
                const formData = new FormData()

                formData.append('shopName', values.shopName || '')
                formData.append('shopNo', values.shopNo || '')
                formData.append('address', values.address || '')
                formData.append('vat', values.vat || '')
                formData.append('ownerName', values.ownerName || '')
                formData.append('ownerEmail', values.ownerEmail || '')
                formData.append('contact', values.contact || '')

                attachmentFiles.forEach((file) => {
                    formData.append('shopAttachments', file)
                })

                try {
                    await onFormSubmit(formData, setSubmitting)
                } catch (error: any) {
                    setSubmitting(false)

                    if (error.message?.includes('Shop already exists')) {
                        setErrors({
                            shopName: 'This shop name is already registered',
                        })
                    }
                }
            }}
            enableReinitialize={true}
            validateOnChange={true}
            validateOnBlur={true}
        >
            {({
                values,
                touched,
                errors,
                isSubmitting,
                setFieldValue,
                handleBlur,
            }) => {
                const handleAttachmentChange = (
                    e: React.ChangeEvent<HTMLInputElement>,
                ) => {
                    if (e.target.files && e.target.files.length > 0) {
                        const newFiles = Array.from(e.target.files)
                        const updatedFiles = [...attachmentFiles, ...newFiles]
                        setAttachmentFiles(updatedFiles)
                        setFieldValue('shopAttachments', updatedFiles)
                        handleBlur({ target: { name: 'shopAttachments' } }) // Trigger validation
                    }
                }

                const handleAttachmentRemove = (index: number) => {
                    const updatedFiles = [...attachmentFiles]
                    updatedFiles.splice(index, 1)
                    setAttachmentFiles(updatedFiles)
                    setFieldValue('shopAttachments', updatedFiles)
                    handleBlur({ target: { name: 'shopAttachments' } }) // Trigger validation
                }

                return (
                    <Form>
                        <FormContainer>
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                <div className="lg:col-span-2">
                                    <AdaptableCard divider className="mb-4">
                                        <h5 className="mb-4">
                                            Shop Information
                                        </h5>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormItem
                                                label="Shop Name"
                                                invalid={
                                                    !!errors.shopName &&
                                                    touched.shopName
                                                }
                                                errorMessage={errors.shopName}
                                            >
                                                <Field
                                                    type="text"
                                                    autoComplete="off"
                                                    name="shopName"
                                                    placeholder="Shop Name"
                                                    component={Input}
                                                    validateOnBlur
                                                />
                                            </FormItem>

                                            <FormItem
                                                label="Shop Number"
                                                invalid={
                                                    !!errors.shopNo &&
                                                    touched.shopNo
                                                }
                                                errorMessage={errors.shopNo}
                                            >
                                                <Field
                                                    type="text"
                                                    autoComplete="off"
                                                    name="shopNo"
                                                    placeholder="Shop Number"
                                                    component={Input}
                                                    validateOnBlur
                                                />
                                            </FormItem>
                                        </div>

                                        <FormItem
                                            label="Address"
                                            invalid={
                                                !!errors.address &&
                                                touched.address
                                            }
                                            errorMessage={errors.address}
                                        >
                                            <Field
                                                type="text"
                                                autoComplete="off"
                                                name="address"
                                                placeholder="Shop Address"
                                                component={Input}
                                                validateOnBlur
                                            />
                                        </FormItem>

                                        <FormItem
                                            label="VAT"
                                            invalid={
                                                !!errors.vat && touched.vat
                                            }
                                            errorMessage={errors.vat}
                                        >
                                            <Field
                                                type="text"
                                                autoComplete="off"
                                                name="vat"
                                                placeholder="VAT Number"
                                                component={Input}
                                                validateOnBlur
                                            />
                                        </FormItem>
                                    </AdaptableCard>

                                    <AdaptableCard divider className="mb-4">
                                        <h5 className="mb-4">
                                            Owner Information
                                        </h5>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormItem
                                                label="Owner Name"
                                                invalid={
                                                    !!errors.ownerName &&
                                                    touched.ownerName
                                                }
                                                errorMessage={errors.ownerName}
                                            >
                                                <Field
                                                    type="text"
                                                    autoComplete="off"
                                                    name="ownerName"
                                                    placeholder="Owner Name"
                                                    component={Input}
                                                    validateOnBlur
                                                />
                                            </FormItem>

                                            <FormItem
                                                label="Owner Email"
                                                invalid={
                                                    !!errors.ownerEmail &&
                                                    touched.ownerEmail
                                                }
                                                errorMessage={errors.ownerEmail}
                                            >
                                                <Field
                                                    type="email"
                                                    autoComplete="off"
                                                    name="ownerEmail"
                                                    placeholder="Owner Email"
                                                    component={Input}
                                                    validateOnBlur
                                                />
                                            </FormItem>

                                            <FormItem
                                                label="Owner Contact"
                                                invalid={
                                                    !!errors.contact &&
                                                    touched.contact
                                                }
                                                errorMessage={errors.contact}
                                            >
                                                <Field
                                                    type="text"
                                                    autoComplete="off"
                                                    name="contact"
                                                    placeholder="Contact Number"
                                                    component={Input}
                                                    validateOnBlur
                                                />
                                            </FormItem>
                                        </div>
                                    </AdaptableCard>

                                    <AdaptableCard divider className="mb-4">
                                        <h5 className="mb-4">
                                            Shop Attachments
                                        </h5>
                                        <FormItem
                                            label="Attachments"
                                            invalid={
                                                !!errors.shopAttachments &&
                                                touched.shopAttachments
                                            }
                                            errorMessage={
                                                errors.shopAttachments as string
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
                                                                name: 'shopAttachments',
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
                                                    {attachmentFiles.map((file, index) => {
                                                        const isFileInstance = file instanceof File
                                                        const displayName = isFileInstance ? file.name : file.fileName
                                                        const fileUrl = isFileInstance ? undefined : file.filePath

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
                                                    })}
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
                                        <DeleteShopButton
                                            onDelete={onDelete as OnDelete}
                                        />
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
                )
            }}
        </Formik>
    )
})

ShopDetailsForm.displayName = 'ShopDetailsForm'

const DeleteShopButton = ({ onDelete }: { onDelete: OnDelete }) => {
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
                title="Delete shop"
                confirmButtonColor="red-600"
                onClose={onDialogClose}
                onRequestClose={onDialogClose}
                onCancel={onDialogClose}
                onConfirm={onConfirmDialog}
            >
                <p>Are you sure you want to delete this shop?</p>
            </ConfirmDialog>
        </>
    )
}

export default ShopDetailsForm
