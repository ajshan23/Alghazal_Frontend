import { forwardRef, useState, useEffect } from 'react'
import { FormContainer, FormItem } from '@/components/ui/Form'
import Button from '@/components/ui/Button'
import StickyFooter from '@/components/shared/StickyFooter'
import { Field, FieldArray, Form, Formik, FormikProps, FieldProps } from 'formik'
import { HiOutlinePlus, HiOutlineTrash } from 'react-icons/hi'
import { AiOutlineSave } from 'react-icons/ai'
import * as Yup from 'yup'
import { Input, Upload } from '@/components/ui'
import { AdaptableCard } from '@/components/shared'
import Select from '@/components/ui/Select'
import ConfirmDialog from '@/components/shared/ConfirmDialog'

type FormikRef = FormikProps<any>

const RoleOptions = [
    { label: 'Admin', value: 'admin' },
    { label: 'Super Admin', value: 'super_admin' },
    { label: 'Engineer', value: 'engineer' },
    { label: 'Finance', value: 'finance' },
    { label: 'Driver', value: 'driver' },
    { label: 'Worker', value: 'worker' },
    { label: 'Supervisor', value: 'supervisor' },
]

type InitialData = {
    firstName?: string
    lastName?: string
    email?: string
    phoneNumbers?: string[]
    role?: string
    password?: string
    profileImage?: string | File
    signatureImage?: string | File
    salary?: number
    accountNumber?: string
    emiratesId?: string
    emiratesIdDocument?: string | File
    passportNumber?: string
    passportDocument?: string | File
}

export type FormModel = Omit<InitialData, 'tags'> & {
    tags: { label: string; value: string }[] | string[]
}

export type SetSubmitting = (isSubmitting: boolean) => void
export type OnDeleteCallback = React.Dispatch<React.SetStateAction<boolean>>
type OnDelete = (callback: OnDeleteCallback) => void

type UserForm = {
    initialData?: InitialData
    type: 'edit' | 'new'
    onDiscard?: () => void
    onDelete?: OnDelete
    onFormSubmit: (formData: FormData, setSubmitting: SetSubmitting) => Promise<any>
}

const UserForm = forwardRef<FormikRef, UserForm>((props, ref) => {
    const {
        type,
        initialData = {
            firstName: '',
            lastName: '',
            email: '',
            phoneNumbers: [''],
            role: '',
            password: '',
            profileImage: '',
            signatureImage: '',
            salary: 0,
            accountNumber: '',
            emiratesId: '',
            emiratesIdDocument: '',
            passportNumber: '',
            passportDocument: ''
        },
        onFormSubmit,
        onDiscard,
        onDelete,
    } = props

    const [profileImageFile, setProfileImageFile] = useState<File | null>(null)
    const [signatureImageFile, setSignatureImageFile] = useState<File | null>(null)
    const [emiratesIdFile, setEmiratesIdFile] = useState<File | null>(null)
    const [passportFile, setPassportFile] = useState<File | null>(null)

    const [existingFiles, setExistingFiles] = useState({
        profileImage: initialData.profileImage as string || '',
        signatureImage: initialData.signatureImage as string || '',
        emiratesIdDocument: initialData.emiratesIdDocument as string || '',
        passportDocument: initialData.passportDocument as string || ''
    })

    useEffect(() => {
        setExistingFiles({
            profileImage: initialData.profileImage as string || '',
            signatureImage: initialData.signatureImage as string || '',
            emiratesIdDocument: initialData.emiratesIdDocument as string || '',
            passportDocument: initialData.passportDocument as string || ''
        })
    }, [initialData])

    const validationSchema = Yup.object().shape({
        firstName: Yup.string().required('First Name is required'),
        lastName: Yup.string().required('Last Name is required'),
        email: Yup.string().email('Invalid email').required('Email is required'),
        role: Yup.string().required('Role is required'),
        password: type === 'new' 
            ? Yup.string().required('Password is required') 
            : Yup.string(),
        phoneNumbers: Yup.array()
            .of(Yup.string().matches(/^[0-9]+$/, 'Phone number must be digits only'))
            .min(1, 'At least one phone number is required'),
        salary: Yup.number()
            .moreThan(0, 'Salary must be greater than zero')
            .when('role', {
                is: (role: string) => !['admin', 'super_admin'].includes(role),
                then: (schema) => schema.required('Salary is required for this role'),
                otherwise: (schema) => schema.notRequired()
            }),
        accountNumber: Yup.string(),
        emiratesId: Yup.string(),
        passportNumber: Yup.string()
    })

    return (
        <Formik
            innerRef={ref}
            initialValues={{
                ...initialData,
                phoneNumbers: Array.isArray(initialData.phoneNumbers) 
                    ? initialData.phoneNumbers 
                    : typeof initialData.phoneNumbers === 'string'
                        ? JSON.parse(initialData.phoneNumbers.replace(/'/g, '"')) 
                        : [''],
                salary: initialData.salary || 0
            }}
            validationSchema={validationSchema}
            onSubmit={async (values, { setSubmitting, setErrors }) => {
                const formData = new FormData()
                
                formData.append('firstName', values.firstName || '')
                formData.append('lastName', values.lastName || '')
                formData.append('email', values.email || '')
                formData.append('role', values.role || '')
                
                if (values.password) {
                    formData.append('password', values.password)
                }

                let phoneNumbersArray = values.phoneNumbers || ['']
                if (!Array.isArray(phoneNumbersArray)) {
                    phoneNumbersArray = [phoneNumbersArray]
                }
                formData.append('phoneNumbers', JSON.stringify(phoneNumbersArray.filter(num => num.trim().length > 0)))

                if (values.role && !['admin', 'super_admin'].includes(values.role)) {
                    formData.append('salary', values.salary?.toString() || '0')
                }

                if (values.accountNumber) formData.append('accountNumber', values.accountNumber)
                if (values.emiratesId) formData.append('emiratesId', values.emiratesId)
                if (values.passportNumber) formData.append('passportNumber', values.passportNumber)

                if (profileImageFile) formData.append('profileImage', profileImageFile)
                if (signatureImageFile) formData.append('signatureImage', signatureImageFile)
                if (emiratesIdFile) formData.append('emiratesIdDocument', emiratesIdFile)
                if (passportFile) formData.append('passportDocument', passportFile)

                if (type === 'edit') {
                    if (!profileImageFile && existingFiles.profileImage) {
                        formData.append('profileImageUrl', existingFiles.profileImage)
                    }
                    if (!signatureImageFile && existingFiles.signatureImage) {
                        formData.append('signatureImageUrl', existingFiles.signatureImage)
                    }
                    if (!emiratesIdFile && existingFiles.emiratesIdDocument) {
                        formData.append('emiratesIdDocumentUrl', existingFiles.emiratesIdDocument)
                    }
                    if (!passportFile && existingFiles.passportDocument) {
                        formData.append('passportDocumentUrl', existingFiles.passportDocument)
                    }

                    if (!values.profileImage && existingFiles.profileImage) {
                        formData.append('removeProfileImage', 'true')
                    }
                    if (!values.signatureImage && existingFiles.signatureImage) {
                        formData.append('removeSignatureImage', 'true')
                    }
                    if (!values.emiratesIdDocument && existingFiles.emiratesIdDocument) {
                        formData.append('removeEmiratesIdDocument', 'true')
                    }
                    if (!values.passportDocument && existingFiles.passportDocument) {
                        formData.append('removePassportDocument', 'true')
                    }
                }

                try {
                    await onFormSubmit(formData, setSubmitting)
                } catch (error: any) {
                    setSubmitting(false)
                    if (error.message?.includes("Email already in use")) {
                        setErrors({ email: "This email is already registered" })
                    }
                }
            }}
            enableReinitialize={true}
        >
            {({ values, touched, errors, isSubmitting, setFieldValue }) => {
                const handleProfileImageChange = (files: File[]) => {
                    if (files.length > 0) {
                        setProfileImageFile(files[0])
                        setFieldValue('profileImage', files[0].name)
                        setExistingFiles(prev => ({ ...prev, profileImage: '' }))
                    } else {
                        setProfileImageFile(null)
                        setFieldValue('profileImage', existingFiles.profileImage || '')
                    }
                }
                
                const handleSignatureImageChange = (files: File[]) => {
                    if (files.length > 0) {
                        setSignatureImageFile(files[0])
                        setFieldValue('signatureImage', files[0].name)
                        setExistingFiles(prev => ({ ...prev, signatureImage: '' }))
                    } else {
                        setSignatureImageFile(null)
                        setFieldValue('signatureImage', existingFiles.signatureImage || '')
                    }
                }

                const handleEmiratesIdChange = (files: File[]) => {
                    if (files.length > 0) {
                        setEmiratesIdFile(files[0])
                        setFieldValue('emiratesIdDocument', files[0].name)
                        setExistingFiles(prev => ({ ...prev, emiratesIdDocument: '' }))
                    } else {
                        setEmiratesIdFile(null)
                        setFieldValue('emiratesIdDocument', existingFiles.emiratesIdDocument || '')
                    }
                }

                const handlePassportChange = (files: File[]) => {
                    if (files.length > 0) {
                        setPassportFile(files[0])
                        setFieldValue('passportDocument', files[0].name)
                        setExistingFiles(prev => ({ ...prev, passportDocument: '' }))
                    } else {
                        setPassportFile(null)
                        setFieldValue('passportDocument', existingFiles.passportDocument || '')
                    }
                }

                const handleProfileRemove = () => {
                    setProfileImageFile(null)
                    setFieldValue('profileImage', '')
                    setExistingFiles(prev => ({ ...prev, profileImage: '' }))
                }

                const handleSignatureRemove = () => {
                    setSignatureImageFile(null)
                    setFieldValue('signatureImage', '')
                    setExistingFiles(prev => ({ ...prev, signatureImage: '' }))
                }

                const handleEmiratesIdRemove = () => {
                    setEmiratesIdFile(null)
                    setFieldValue('emiratesIdDocument', '')
                    setExistingFiles(prev => ({ ...prev, emiratesIdDocument: '' }))
                }

                const handlePassportRemove = () => {
                    setPassportFile(null)
                    setFieldValue('passportDocument', '')
                    setExistingFiles(prev => ({ ...prev, passportDocument: '' }))
                }

                const showSalaryField = !['admin', 'super_admin'].includes(values.role)

                return (
                    <Form>
                        <FormContainer>
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                <div className="lg:col-span-2">
                                    <AdaptableCard divider className="mb-4">
                                        <h5 className="mb-4">Basic Information</h5>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormItem
                                                label="First Name"
                                                invalid={!!errors.firstName && touched.firstName}
                                                errorMessage={errors.firstName as string}
                                            >
                                                <Field
                                                    type="text"
                                                    autoComplete="off"
                                                    name="firstName"
                                                    placeholder="First Name"
                                                    component={Input}
                                                />
                                            </FormItem>

                                            <FormItem
                                                label="Last Name"
                                                invalid={!!errors.lastName && touched.lastName}
                                                errorMessage={errors.lastName as string}
                                            >
                                                <Field
                                                    type="text"
                                                    autoComplete="off"
                                                    name="lastName"
                                                    placeholder="Last Name"
                                                    component={Input}
                                                />
                                            </FormItem>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormItem
                                                label="Email"
                                                invalid={!!errors.email && touched.email}
                                                errorMessage={errors.email as string}
                                            >
                                                <Field
                                                    type="email"
                                                    autoComplete="off"
                                                    name="email"
                                                    placeholder="Email"
                                                    component={Input}
                                                />
                                            </FormItem>

                                            <FormItem
                                                label="Role"
                                                invalid={!!errors.role && touched.role}
                                                errorMessage={errors.role as string}
                                            >
                                                <Field name="role">
                                                    {({ field, form }: FieldProps) => (
                                                        <Select
                                                            placeholder="Select Role"
                                                            field={field}
                                                            form={form}
                                                            options={RoleOptions}
                                                            value={RoleOptions.find(
                                                                (role) => role.value === values.role
                                                            )}
                                                            onChange={(role) => {
                                                                form.setFieldValue(
                                                                    field.name,
                                                                    role?.value || ''
                                                                )
                                                            }}
                                                        />
                                                    )}
                                                </Field>
                                            </FormItem>
                                        </div>

                                        {showSalaryField && (
                                            <FormItem
                                                label="Salary"
                                                invalid={!!errors.salary && touched.salary}
                                                errorMessage={errors.salary as string}
                                            >
                                                <Field
                                                    type="number"
                                                    autoComplete="off"
                                                    name="salary"
                                                    placeholder="Salary"
                                                    component={Input}
                                                    min="0"
                                                    step="0.01"
                                                />
                                            </FormItem>
                                        )}
                                    </AdaptableCard>

                                    <AdaptableCard divider className="mb-4">
                                        <h5 className="mb-4">Contact Information</h5>
                                        <FieldArray name="phoneNumbers">
                                            {({ push, remove }) => (
                                                <div className="space-y-4">
                                                    {values.phoneNumbers?.map((phoneNumber, index) => (
                                                        <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end border-b pb-4">
                                                            <FormItem
                                                                label={`Phone Number ${index + 1}`}
                                                                invalid={Boolean(
                                                                    errors.phoneNumbers &&
                                                                    (errors.phoneNumbers as any)[index] &&
                                                                    touched.phoneNumbers
                                                                )}
                                                                errorMessage={
                                                                    errors.phoneNumbers && 
                                                                    (errors.phoneNumbers as any)[index]
                                                                }
                                                            >
                                                                <Field
                                                                    name={`phoneNumbers.${index}`}
                                                                    component={Input}
                                                                    placeholder="Phone Number"
                                                                    value={phoneNumber || ''}
                                                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                                        const newPhoneNumbers = [...values.phoneNumbers]
                                                                        newPhoneNumbers[index] = e.target.value
                                                                        setFieldValue('phoneNumbers', newPhoneNumbers)
                                                                    }}
                                                                />
                                                            </FormItem>
                                                            <div className="flex justify-end">
                                                                {values.phoneNumbers.length > 1 && (
                                                                    <Button
                                                                        type="button"
                                                                        size="sm"
                                                                        variant="plain"
                                                                        color="red"
                                                                        icon={<HiOutlineTrash />}
                                                                        onClick={() => remove(index)}
                                                                    />
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        variant="twoTone"
                                                        icon={<HiOutlinePlus />}
                                                        onClick={() => push('')}
                                                    >
                                                        Add Phone Number
                                                    </Button>
                                                </div>
                                            )}
                                        </FieldArray>

                                        <FormItem
                                            label="Account Number"
                                        >
                                            <Field
                                                type="text"
                                                autoComplete="off"
                                                name="accountNumber"
                                                placeholder="Bank Account Number"
                                                component={Input}
                                            />
                                        </FormItem>
                                    </AdaptableCard>

                                    <AdaptableCard divider className="mb-4">
                                        <h5 className="mb-4">Document Information</h5>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormItem
                                                label="Emirates ID"
                                            >
                                                <Field
                                                    type="text"
                                                    autoComplete="off"
                                                    name="emiratesId"
                                                    placeholder="Emirates ID Number"
                                                    component={Input}
                                                />
                                            </FormItem>

                                            <FormItem
                                                label="Passport Number"
                                            >
                                                <Field
                                                    type="text"
                                                    autoComplete="off"
                                                    name="passportNumber"
                                                    placeholder="Passport Number"
                                                    component={Input}
                                                />
                                            </FormItem>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormItem
                                                label="Emirates ID Document"
                                            >
                                                <Upload 
                                                    onChange={(files) => handleEmiratesIdChange(files)}
                                                    onFileRemove={handleEmiratesIdRemove}
                                                    uploadLimit={1}
                                                    defaultFile={
                                                        existingFiles.emiratesIdDocument 
                                                            ? [{ 
                                                                name: 'Emirates_ID_Document', 
                                                                url: existingFiles.emiratesIdDocument 
                                                              }]
                                                            : []
                                                    }
                                                    fileList={emiratesIdFile ? [emiratesIdFile] : []}
                                                    accept=".pdf,.png,.jpeg,.jpg"
                                                />
                                            </FormItem>

                                            <FormItem
                                                label="Passport Document"
                                            >
                                                <Upload 
                                                    onChange={(files) => handlePassportChange(files)}
                                                    onFileRemove={handlePassportRemove}
                                                    uploadLimit={1}
                                                    defaultFile={
                                                        existingFiles.passportDocument 
                                                            ? [{ 
                                                                name: 'Passport_Document', 
                                                                url: existingFiles.passportDocument 
                                                              }]
                                                            : []
                                                    }
                                                    fileList={passportFile ? [passportFile] : []}
                                                    accept=".pdf,.png,.jpeg,.jpg"
                                                />
                                            </FormItem>
                                        </div>
                                    </AdaptableCard>

                                    <AdaptableCard divider className="mb-4">
                                        <h5 className="mb-4">Profile Images</h5>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormItem
                                                label="Profile Image"
                                            >
                                                <Upload 
                                                    onChange={(files) => handleProfileImageChange(files)}
                                                    onFileRemove={handleProfileRemove}
                                                    uploadLimit={1}
                                                    defaultFile={
                                                        existingFiles.profileImage 
                                                            ? [{ name: 'profile.jpg', url: existingFiles.profileImage }]
                                                            : []
                                                    }
                                                    fileList={profileImageFile ? [profileImageFile] : []}
                                                    accept="image/*"
                                                />
                                            </FormItem>

                                            <FormItem
                                                label="Signature Image"
                                            >
                                                <Upload 
                                                    onChange={(files) => handleSignatureImageChange(files)}
                                                    onFileRemove={handleSignatureRemove}
                                                    uploadLimit={1}
                                                    defaultFile={
                                                        existingFiles.signatureImage 
                                                            ? [{ name: 'signature.jpg', url: existingFiles.signatureImage }]
                                                            : []
                                                    }
                                                    fileList={signatureImageFile ? [signatureImageFile] : []}
                                                    accept="image/*"
                                                />
                                            </FormItem>
                                        </div>
                                    </AdaptableCard>

                                    {type === 'new' && (
                                        <AdaptableCard divider className="mb-4">
                                            <h5 className="mb-4">Security</h5>
                                            <FormItem
                                                label="Password"
                                                invalid={!!errors.password && touched.password}
                                                errorMessage={errors.password as string}
                                            >
                                                <Field
                                                    type="password"
                                                    autoComplete="off"
                                                    name="password"
                                                    placeholder="Password"
                                                    component={Input}
                                                />
                                            </FormItem>
                                        </AdaptableCard>
                                    )}
                                </div>
                            </div>
                            
                            <StickyFooter
                                className="-mx-8 px-8 flex items-center justify-between py-4"
                                stickyClass="border-t bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                            >
                                <div>
                                    {type === 'edit' && onDelete && (
                                        <DeleteProductButton
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

UserForm.displayName = 'UserForm'

const DeleteProductButton = ({ onDelete }: { onDelete: OnDelete }) => {
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
                title="Delete user"
                confirmButtonColor="red-600"
                onClose={onDialogClose}
                onRequestClose={onDialogClose}
                onCancel={onDialogClose}
                onConfirm={onConfirmDialog}
            >
                <p>Are you sure you want to delete this user?</p>
            </ConfirmDialog>
        </>
    )
}

export default UserForm