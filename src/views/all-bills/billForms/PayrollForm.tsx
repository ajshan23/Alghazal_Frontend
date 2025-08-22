import { forwardRef, useEffect, useState } from 'react'
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
import { fetchUser } from '../api/api'

type FormikRef = FormikProps<any>

type InitialData = {
    employee: string
    labourCard: string
    labourCardPersonalNo: string
    period: string
    allowance: string
    deduction: string
    mess: string
    advance: string
    net: string
    remark: string
}

export type SetSubmitting = (isSubmitting: boolean) => void
export type OnDeleteCallback = React.Dispatch<React.SetStateAction<boolean>>
type OnDelete = (callback: OnDeleteCallback) => void

type PayrollFormProps = {
    initialData?: InitialData
    type: 'edit' | 'new'
    onDiscard?: () => void
    onDelete?: OnDelete
    onFormSubmit: (
        formData: FormModel,
        setSubmitting: SetSubmitting,
    ) => Promise<any>
}

type UserOption = {
    value: string
    label: string
}

const PayrollForm = forwardRef<FormikRef, PayrollFormProps>((props, ref) => {
    const {
        type,
        initialData = {
            employee: '',
            labourCard: '',
            labourCardPersonalNo: '',
            period: '',
            allowance: '',
            deduction: '',
            mess: '',
            advance: '',
            net: '',
            remark: '',
        },
        onFormSubmit,
        onDiscard,
        onDelete,
    } = props

    const [userOptions, setUserOptions] = useState<UserOption[]>([])

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await fetchUser()
                const options = response.data?.users.map((user: any) => ({
                    value: user._id,
                    label: `${user.firstName} ${user.lastName}`,
                }))
                setUserOptions(options)
            } catch (error) {
                console.error('Failed to fetch users', error)
            }
        }

        fetchUsers()
    }, [])

    const validationSchema = Yup.object().shape({
        employee: Yup.string().required('Employee name is required'),
        labourCard: Yup.string().required('Labour Card is required'),
        labourCardPersonalNo: Yup.string().required(
            'Labour Card Personal No is required',
        ),
        period: Yup.string().required('Period is required'),
        allowance: Yup.string().required('Allowance is required'),
        deduction: Yup.string().required('Deduction is required'),
        mess: Yup.string().required('Mess is required'),
        advance: Yup.string().required('Advance is required'),
        net: Yup.string().required('Net is required'),

        remark: Yup.string().max(500, 'Remark must be at most 500 characters'),
    })

    return (
        <Formik
            innerRef={ref}
            initialValues={{
                employee: initialData.employee || '',
                labourCard: initialData.labourCard || '',
                labourCardPersonalNo: initialData.labourCardPersonalNo || '',
                period: initialData.period || '',
                allowance: initialData.allowance || '',
                deduction: initialData.deduction || '',
                mess: initialData.mess || '',
                advance: initialData.advance || '',
                net: initialData.net || '',

                remark: initialData.remark || '',
            }}
            validationSchema={validationSchema}
            onSubmit={async (
                values,
                { setSubmitting, setErrors, resetForm },
            ) => {
                try {
                    await onFormSubmit(values as FormModel, setSubmitting)
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
                                    <h5 className="mb-4">
                                        Employee Information
                                    </h5>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                        <FormItem
                                            label="EMPLOYEE"
                                            invalid={!!errors.employee}
                                            errorMessage={
                                                errors.employee as string
                                            }
                                        >
                                            <Select
                                                name="employee"
                                                placeholder="Select user"
                                                value={userOptions.find(
                                                    (opt) =>
                                                        opt.value ===
                                                        values.employee,
                                                )}
                                                options={userOptions}
                                                onChange={(option) => {
                                                    setFieldValue(
                                                        'employee',
                                                        option?.value || '',
                                                    ) // Store only the _id
                                                }}
                                                onBlur={handleBlur}
                                            />
                                        </FormItem>

                                        <FormItem
                                            label="LABOUR CARD"
                                            invalid={!!errors.labourCard}
                                            errorMessage={
                                                errors.labourCard as string
                                            }
                                        >
                                            <Field name="labourCard">
                                                {({
                                                    field,
                                                    form,
                                                }: FieldProps) => (
                                                    <Input
                                                        type="text"
                                                        autoComplete="off"
                                                        placeholder="LabourCard"
                                                        {...field}
                                                    />
                                                )}
                                            </Field>
                                        </FormItem>

                                        <FormItem
                                            label="LABOUR CARD PERSONAL NO"
                                            invalid={
                                                !!errors.labourCardPersonalNo
                                            }
                                            errorMessage={
                                                errors.labourCardPersonalNo as string
                                            }
                                        >
                                            <Field name="labourCardPersonalNo">
                                                {({
                                                    field,
                                                    form,
                                                }: FieldProps) => (
                                                    <Input
                                                        type="text"
                                                        autoComplete="off"
                                                        placeholder="Labour Card PersonalNo"
                                                        {...field}
                                                    />
                                                )}
                                            </Field>
                                        </FormItem>

                                        <FormItem
                                            label="PERIOD"
                                            invalid={!!errors.period}
                                            errorMessage={
                                                errors.period as string
                                            }
                                        >
                                            <Field name="period">
                                                {({ field }: FieldProps) => (
                                                    <Input
                                                        autoComplete="off"
                                                        placeholder="e.g. January 2023"
                                                        {...field}
                                                    />
                                                )}
                                            </Field>
                                        </FormItem>
                                    </div>
                                </AdaptableCard>

                                <AdaptableCard divider className="mb-4">
                                    <h5 className="mb-4">Salary Details</h5>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormItem
                                            label="Allowance"
                                            invalid={
                                                !!errors.allowance &&
                                                touched.allowance
                                            }
                                            errorMessage={
                                                errors.allowance as string
                                            }
                                        >
                                            <Field name="allowance">
                                                {({
                                                    field,
                                                    form,
                                                }: FieldProps) => (
                                                    <Input
                                                        type="text"
                                                        autoComplete="off"
                                                        placeholder="Allowance"
                                                        {...field}
                                                    />
                                                )}
                                            </Field>
                                        </FormItem>

                                        <FormItem
                                            label="Deduction"
                                            invalid={
                                                !!errors.deduction &&
                                                touched.deduction
                                            }
                                            errorMessage={
                                                errors.deduction as string
                                            }
                                        >
                                            <Field name="deduction">
                                                {({
                                                    field,
                                                    form,
                                                }: FieldProps) => (
                                                    <Input
                                                        type="text"
                                                        autoComplete="off"
                                                        placeholder="Deduction"
                                                        {...field}
                                                    />
                                                )}
                                            </Field>
                                        </FormItem>

                                        <FormItem
                                            label="Mess"
                                            invalid={
                                                !!errors.mess && touched.mess
                                            }
                                            errorMessage={errors.mess as string}
                                        >
                                            <Field name="mess">
                                                {({
                                                    field,
                                                    form,
                                                }: FieldProps) => (
                                                    <Input
                                                        type="text"
                                                        autoComplete="off"
                                                        placeholder="Mess"
                                                        {...field}
                                                    />
                                                )}
                                            </Field>
                                        </FormItem>

                                        <FormItem
                                            label="Advance"
                                            invalid={
                                                !!errors.advance &&
                                                touched.advance
                                            }
                                            errorMessage={
                                                errors.advance as string
                                            }
                                        >
                                            <Field name="advance">
                                                {({
                                                    field,
                                                    form,
                                                }: FieldProps) => (
                                                    <Input
                                                        type="text"
                                                        autoComplete="off"
                                                        placeholder="Advance"
                                                        {...field}
                                                    />
                                                )}
                                            </Field>
                                        </FormItem>

                                        <FormItem
                                            label="Net"
                                            invalid={
                                                !!errors.net && touched.net
                                            }
                                            errorMessage={errors.net as string}
                                        >
                                            <Field name="net">
                                                {({ field }: FieldProps) => (
                                                    <Input
                                                        type="text"
                                                        autoComplete="off"
                                                        placeholder="Net"
                                                        {...field}
                                                    />
                                                )}
                                            </Field>
                                        </FormItem>
                                    </div>
                                </AdaptableCard>

                                <AdaptableCard divider className="mb-4">
                                    <h5 className="mb-4">Remarks</h5>
                                    <FormItem
                                        label="REMARK"
                                        invalid={
                                            !!errors.remark && touched.remark
                                        }
                                        errorMessage={errors.remark as string}
                                    >
                                        <Field name="remark">
                                            {({ field }: FieldProps) => (
                                                <Input
                                                    as="textarea"
                                                    autoComplete="off"
                                                    placeholder="Enter remarks"
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
                                        onClick={() =>
                                            onDelete((shouldDelete) => {
                                                if (shouldDelete) {
                                                    resetForm()
                                                }
                                            })
                                        }
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

PayrollForm.displayName = 'PayrollForm'

export default PayrollForm
