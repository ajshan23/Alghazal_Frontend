import { forwardRef, useState, useEffect } from 'react'
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
    iBan: string
    passportNumber: string
    passportExpireDate: Date | string
    emirateIdNumber: string
    emirateIdExpireDate: Date | string
    labourCardPersonalNumber: string
    workPermitNumber: string
    labourExpireDate: Date | string
    offerLetterTyping: string
    labourInsurance: string
    labourCardPayment: string
    statusChangeInOut: string
    insideEntry: string
    medicalSharjah: string
    tajweehSubmission: string
    iloeInsurance: string
    healthInsurance: string
    emirateId: string
    residenceStamping: string
    srilankaCouncilHead: string
    upscoding: string
    labourFinePayment: string
    labourCardRenewalPayment: string
    servicePayment: string
    visaStamping: string
    twoMonthVisitingVisa: string
    finePayment: string
    entryPermitOutside: string
    complaintEmployee: string
    arabicLetter: string
    violationCommittee: string
    quotaModification: string
    others: string
}

export type FormModel = Omit<InitialData, 
    'passportExpireDate' | 'emirateIdExpireDate' | 'labourExpireDate'
> & { 
    passportExpireDate: Date
    emirateIdExpireDate: Date
    labourExpireDate: Date
}

export type SetSubmitting = (isSubmitting: boolean) => void
export type OnDeleteCallback = React.Dispatch<React.SetStateAction<boolean>>
type OnDelete = (callback: OnDeleteCallback) => void

type VisaExpenseFormProps = {
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
    passportNumber: string
    emirateIdNumber: string
}

const VisaExpenseForm = forwardRef<FormikRef, VisaExpenseFormProps>((props, ref) => {
    const {
        type,
        initialData = {
            employee: '',
            iBan: '',
            passportNumber: '',
            passportExpireDate: '',
            emirateIdNumber: '',
            emirateIdExpireDate: '',
            labourCardPersonalNumber: '',
            workPermitNumber: '',
            labourExpireDate: '',
            offerLetterTyping: '0',
            labourInsurance: '0',
            labourCardPayment: '0',
            statusChangeInOut: '0',
            insideEntry: '0',
            medicalSharjah: '0',
            tajweehSubmission: '0',
            iloeInsurance: '0',
            healthInsurance: '0',
            emirateId: '0',
            residenceStamping: '0',
            srilankaCouncilHead: '0',
            upscoding: '0',
            labourFinePayment: '0',
            labourCardRenewalPayment: '0',
            servicePayment: '0',
            visaStamping: '0',
            twoMonthVisitingVisa: '0',
            finePayment: '0',
            entryPermitOutside: '0',
            complaintEmployee: '0',
            arabicLetter: '0',
            violationCommittee: '0',
            quotaModification: '0',
            others: '0',
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
                    passportNumber: user.passportNumber,
                    emirateIdNumber: user.emiratesId
                }))
                setUserOptions(options)
            } catch (error) {
                console.error('Failed to fetch users', error)
            }
        }
        fetchUsers()
    }, [])

    const validationSchema = Yup.object().shape({
        employee: Yup.string().required('Employee is required'),
        passportNumber: Yup.string().required('Passport number is required'),
        emirateIdNumber: Yup.string().required('Emirate ID number is required'),
        passportExpireDate: Yup.date().required('Passport expiry date is required'),
        emirateIdExpireDate: Yup.date().required('Emirate ID expiry date is required'),
        labourExpireDate: Yup.date().required('Labour card expiry date is required'),
        offerLetterTyping: Yup.number().min(0),
        labourInsurance: Yup.number().min(0),
        labourCardPayment: Yup.number().min(0),
        statusChangeInOut: Yup.number().min(0),
        insideEntry: Yup.number().min(0),
        medicalSharjah: Yup.number().min(0),
        tajweehSubmission: Yup.number().min(0),
        iloeInsurance: Yup.number().min(0),
        healthInsurance: Yup.number().min(0),
        emirateId: Yup.number().min(0),
        residenceStamping: Yup.number().min(0),
        srilankaCouncilHead: Yup.number().min(0),
        upscoding: Yup.number().min(0),
        labourFinePayment: Yup.number().min(0),
        labourCardRenewalPayment: Yup.number().min(0),
        servicePayment: Yup.number().min(0),
        visaStamping: Yup.number().min(0),
        twoMonthVisitingVisa: Yup.number().min(0),
        finePayment: Yup.number().min(0),
        entryPermitOutside: Yup.number().min(0),
        complaintEmployee: Yup.number().min(0),
        arabicLetter: Yup.number().min(0),
        violationCommittee: Yup.number().min(0),
        quotaModification: Yup.number().min(0),
        others: Yup.number().min(0),
    })

    const calculateTotal = (values: any) => {
        const expenseFields = [
            'offerLetterTyping',
            'labourInsurance',
            'labourCardPayment',
            'statusChangeInOut',
            'insideEntry',
            'medicalSharjah',
            'tajweehSubmission',
            'iloeInsurance',
            'healthInsurance',
            'emirateId',
            'residenceStamping',
            'srilankaCouncilHead',
            'upscoding',
            'labourFinePayment',
            'labourCardRenewalPayment',
            'servicePayment',
            'visaStamping',
            'twoMonthVisitingVisa',
            'finePayment',
            'entryPermitOutside',
            'complaintEmployee',
            'arabicLetter',
            'violationCommittee',
            'quotaModification',
            'others'
        ]
        
        return expenseFields.reduce((sum, field) => {
            const value = parseFloat(values[field] as string) || 0
            return sum + value
        }, 0)
    }

    const handleFieldChange = (fieldName: string, value: string, setFieldValue: any) => {
        setFieldValue(fieldName, value)
    }

    return (
        <Formik
            innerRef={ref}
            initialValues={{
                employee: initialData.employee || '',
                iBan: initialData.iBan || '',
                passportNumber: initialData.passportNumber || '',
                passportExpireDate: initialData.passportExpireDate instanceof Date 
                    ? initialData.passportExpireDate 
                    : initialData.passportExpireDate 
                        ? new Date(initialData.passportExpireDate) 
                        : null,
                emirateIdNumber: initialData.emirateIdNumber || '',
                emirateIdExpireDate: initialData.emirateIdExpireDate instanceof Date 
                    ? initialData.emirateIdExpireDate 
                    : initialData.emirateIdExpireDate 
                        ? new Date(initialData.emirateIdExpireDate) 
                        : null,
                labourCardPersonalNumber: initialData.labourCardPersonalNumber || '',
                workPermitNumber: initialData.workPermitNumber || '',
                labourExpireDate: initialData.labourExpireDate instanceof Date 
                    ? initialData.labourExpireDate 
                    : initialData.labourExpireDate 
                        ? new Date(initialData.labourExpireDate) 
                        : null,
                offerLetterTyping: initialData.offerLetterTyping || '0',
                labourInsurance: initialData.labourInsurance || '0',
                labourCardPayment: initialData.labourCardPayment || '0',
                statusChangeInOut: initialData.statusChangeInOut || '0',
                insideEntry: initialData.insideEntry || '0',
                medicalSharjah: initialData.medicalSharjah || '0',
                tajweehSubmission: initialData.tajweehSubmission || '0',
                iloeInsurance: initialData.iloeInsurance || '0',
                healthInsurance: initialData.healthInsurance || '0',
                emirateId: initialData.emirateId || '0',
                residenceStamping: initialData.residenceStamping || '0',
                srilankaCouncilHead: initialData.srilankaCouncilHead || '0',
                upscoding: initialData.upscoding || '0',
                labourFinePayment: initialData.labourFinePayment || '0',
                labourCardRenewalPayment: initialData.labourCardRenewalPayment || '0',
                servicePayment: initialData.servicePayment || '0',
                visaStamping: initialData.visaStamping || '0',
                twoMonthVisitingVisa: initialData.twoMonthVisitingVisa || '0',
                finePayment: initialData.finePayment || '0',
                entryPermitOutside: initialData.entryPermitOutside || '0',
                complaintEmployee: initialData.complaintEmployee || '0',
                arabicLetter: initialData.arabicLetter || '0',
                violationCommittee: initialData.violationCommittee || '0',
                quotaModification: initialData.quotaModification || '0',
                others: initialData.others || '0',
            }}
            validationSchema={validationSchema}
            onSubmit={async (values, { setSubmitting }) => {
                try {
                    await onFormSubmit(values as FormModel, setSubmitting)
                } catch (error) {
                    setSubmitting(false)
                    console.error('Form submission error:', error)
                }
            }}
            enableReinitialize={true}
        >
            {({ values, touched, errors, isSubmitting, setFieldValue }) => {
                const totalExpenses = calculateTotal(values)
                
                return (
                    <Form>
                        <FormContainer>
                        

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                <div className="lg:col-span-3">
                                    <AdaptableCard divider className="mb-4">
                                        <h5 className="mb-4">Employee Information</h5>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <FormItem
                                                label="Employee"
                                                invalid={!!errors.employee && touched.employee}
                                                errorMessage={errors.employee as string}
                                            >
                                                <Select
                                                    options={userOptions}
                                                    value={userOptions.filter(
                                                        (option) => option.value === values.employee
                                                    )}
                                                    onChange={(option) => {
                                                        setFieldValue('employee', option?.value)
                                                        if (option) {
                                                            setFieldValue('passportNumber', option.passportNumber || '')
                                                            setFieldValue('emirateIdNumber', option.emirateIdNumber || '')
                                                        }
                                                    }}
                                                />
                                            </FormItem>

                                            <FormItem
                                                label="IBAN"
                                                invalid={!!errors.iBan && touched.iBan}
                                                errorMessage={errors.iBan as string}
                                            >
                                                <Field name="iBan">
                                                    {({ field }: FieldProps) => (
                                                        <Input
                                                            placeholder="IBAN"
                                                            {...field}
                                                        />
                                                    )}
                                                </Field>
                                            </FormItem>

                                            <FormItem
                                                label="Passport Number"
                                                invalid={!!errors.passportNumber && touched.passportNumber}
                                                errorMessage={errors.passportNumber as string}
                                            >
                                                <Field name="passportNumber">
                                                    {({ field }: FieldProps) => (
                                                        <Input
                                                            placeholder="Passport Number"
                                                            {...field}
                                                        />
                                                    )}
                                                </Field>
                                            </FormItem>

                                            <FormItem
                                                label="Passport Expiry Date"
                                                invalid={!!errors.passportExpireDate && touched.passportExpireDate}
                                                errorMessage={errors.passportExpireDate as string}
                                            >
                                                <Field name="passportExpireDate">
                                                    {({ field, form }: FieldProps) => (
                                                        <DatePicker
                                                            placeholder="Select Passport Expiry Date"
                                                            value={field.value ? new Date(field.value) : null}
                                                            onChange={(date) =>
                                                                form.setFieldValue(field.name, date)
                                                            }
                                                        />
                                                    )}
                                                </Field>
                                            </FormItem>

                                            <FormItem
                                                label="Emirate ID Number"
                                                invalid={!!errors.emirateIdNumber && touched.emirateIdNumber}
                                                errorMessage={errors.emirateIdNumber as string}
                                            >
                                                <Field name="emirateIdNumber">
                                                    {({ field }: FieldProps) => (
                                                        <Input
                                                            placeholder="Emirate ID Number"
                                                            {...field}
                                                        />
                                                    )}
                                                </Field>
                                            </FormItem>

                                            <FormItem
                                                label="Emirate ID Expiry Date"
                                                invalid={!!errors.emirateIdExpireDate && touched.emirateIdExpireDate}
                                                errorMessage={errors.emirateIdExpireDate as string}
                                            >
                                                <Field name="emirateIdExpireDate">
                                                    {({ field, form }: FieldProps) => (
                                                        <DatePicker
                                                            placeholder="Select Emirate ID Expiry Date"
                                                            value={field.value ? new Date(field.value) : null}
                                                            onChange={(date) =>
                                                                form.setFieldValue(field.name, date)
                                                            }
                                                        />
                                                    )}
                                                </Field>
                                            </FormItem>

                                            <FormItem
                                                label="Labour Card Personal Number"
                                                invalid={!!errors.labourCardPersonalNumber && touched.labourCardPersonalNumber}
                                                errorMessage={errors.labourCardPersonalNumber as string}
                                            >
                                                <Field name="labourCardPersonalNumber">
                                                    {({ field }: FieldProps) => (
                                                        <Input
                                                            placeholder="Labour Card Personal Number"
                                                            {...field}
                                                        />
                                                    )}
                                                </Field>
                                            </FormItem>

                                            <FormItem
                                                label="Work Permit Number"
                                                invalid={!!errors.workPermitNumber && touched.workPermitNumber}
                                                errorMessage={errors.workPermitNumber as string}
                                            >
                                                <Field name="workPermitNumber">
                                                    {({ field }: FieldProps) => (
                                                        <Input
                                                            placeholder="Work Permit Number"
                                                            {...field}
                                                        />
                                                    )}
                                                </Field>
                                            </FormItem>

                                            <FormItem
                                                label="Labour Card Expiry Date"
                                                invalid={!!errors.labourExpireDate && touched.labourExpireDate}
                                                errorMessage={errors.labourExpireDate as string}
                                            >
                                                <Field name="labourExpireDate">
                                                    {({ field, form }: FieldProps) => (
                                                        <DatePicker
                                                            placeholder="Select Labour Card Expiry Date"
                                                            value={field.value ? new Date(field.value) : null}
                                                            onChange={(date) =>
                                                                form.setFieldValue(field.name, date)
                                                            }
                                                        />
                                                    )}
                                                </Field>
                                            </FormItem>
                                        </div>
                                    </AdaptableCard>

                                    <AdaptableCard divider className="mb-4">
                                        <h5 className="mb-4">Visa Expenses</h5>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            {/* Group 1 */}
                                            <FormItem
                                                label="Offer Letter Typing"
                                                invalid={!!errors.offerLetterTyping && touched.offerLetterTyping}
                                                errorMessage={errors.offerLetterTyping as string}
                                            >
                                                <Field name="offerLetterTyping">
                                                    {({ field }: FieldProps) => (
                                                        <Input
                                                            type="number"
                                                            placeholder="Amount"
                                                            {...field}
                                                            onChange={(e) => handleFieldChange('offerLetterTyping', e.target.value, setFieldValue)}
                                                        />
                                                    )}
                                                </Field>
                                            </FormItem>

                                            <FormItem
                                                label="Labour Insurance"
                                                invalid={!!errors.labourInsurance && touched.labourInsurance}
                                                errorMessage={errors.labourInsurance as string}
                                            >
                                                <Field name="labourInsurance">
                                                    {({ field }: FieldProps) => (
                                                        <Input
                                                            type="number"
                                                            placeholder="Amount"
                                                            {...field}
                                                            onChange={(e) => handleFieldChange('labourInsurance', e.target.value, setFieldValue)}
                                                        />
                                                    )}
                                                </Field>
                                            </FormItem>

                                            <FormItem
                                                label="Labour Card Payment"
                                                invalid={!!errors.labourCardPayment && touched.labourCardPayment}
                                                errorMessage={errors.labourCardPayment as string}
                                            >
                                                <Field name="labourCardPayment">
                                                    {({ field }: FieldProps) => (
                                                        <Input
                                                            type="number"
                                                            placeholder="Amount"
                                                            {...field}
                                                            onChange={(e) => handleFieldChange('labourCardPayment', e.target.value, setFieldValue)}
                                                        />
                                                    )}
                                                </Field>
                                            </FormItem>

                                            {/* Group 2 */}
                                            <FormItem
                                                label="Status Change In/Out"
                                                invalid={!!errors.statusChangeInOut && touched.statusChangeInOut}
                                                errorMessage={errors.statusChangeInOut as string}
                                            >
                                                <Field name="statusChangeInOut">
                                                    {({ field }: FieldProps) => (
                                                        <Input
                                                            type="number"
                                                            placeholder="Amount"
                                                            {...field}
                                                            onChange={(e) => handleFieldChange('statusChangeInOut', e.target.value, setFieldValue)}
                                                        />
                                                    )}
                                                </Field>
                                            </FormItem>

                                            <FormItem
                                                label="Inside Entry"
                                                invalid={!!errors.insideEntry && touched.insideEntry}
                                                errorMessage={errors.insideEntry as string}
                                            >
                                                <Field name="insideEntry">
                                                    {({ field }: FieldProps) => (
                                                        <Input
                                                            type="number"
                                                            placeholder="Amount"
                                                            {...field}
                                                            onChange={(e) => handleFieldChange('insideEntry', e.target.value, setFieldValue)}
                                                        />
                                                    )}
                                                </Field>
                                            </FormItem>

                                            <FormItem
                                                label="Medical Sharjah"
                                                invalid={!!errors.medicalSharjah && touched.medicalSharjah}
                                                errorMessage={errors.medicalSharjah as string}
                                            >
                                                <Field name="medicalSharjah">
                                                    {({ field }: FieldProps) => (
                                                        <Input
                                                            type="number"
                                                            placeholder="Amount"
                                                            {...field}
                                                            onChange={(e) => handleFieldChange('medicalSharjah', e.target.value, setFieldValue)}
                                                        />
                                                    )}
                                                </Field>
                                            </FormItem>

                                            {/* Group 3 */}
                                            <FormItem
                                                label="Tajweeh Submission"
                                                invalid={!!errors.tajweehSubmission && touched.tajweehSubmission}
                                                errorMessage={errors.tajweehSubmission as string}
                                            >
                                                <Field name="tajweehSubmission">
                                                    {({ field }: FieldProps) => (
                                                        <Input
                                                            type="number"
                                                            placeholder="Amount"
                                                            {...field}
                                                            onChange={(e) => handleFieldChange('tajweehSubmission', e.target.value, setFieldValue)}
                                                        />
                                                    )}
                                                </Field>
                                            </FormItem>

                                            <FormItem
                                                label="ILOE Insurance"
                                                invalid={!!errors.iloeInsurance && touched.iloeInsurance}
                                                errorMessage={errors.iloeInsurance as string}
                                            >
                                                <Field name="iloeInsurance">
                                                    {({ field }: FieldProps) => (
                                                        <Input
                                                            type="number"
                                                            placeholder="Amount"
                                                            {...field}
                                                            onChange={(e) => handleFieldChange('iloeInsurance', e.target.value, setFieldValue)}
                                                        />
                                                    )}
                                                </Field>
                                            </FormItem>

                                            <FormItem
                                                label="Health Insurance"
                                                invalid={!!errors.healthInsurance && touched.healthInsurance}
                                                errorMessage={errors.healthInsurance as string}
                                            >
                                                <Field name="healthInsurance">
                                                    {({ field }: FieldProps) => (
                                                        <Input
                                                            type="number"
                                                            placeholder="Amount"
                                                            {...field}
                                                            onChange={(e) => handleFieldChange('healthInsurance', e.target.value, setFieldValue)}
                                                        />
                                                    )}
                                                </Field>
                                            </FormItem>

                                            {/* Group 4 */}
                                            <FormItem
                                                label="Emirate ID Fee"
                                                invalid={!!errors.emirateId && touched.emirateId}
                                                errorMessage={errors.emirateId as string}
                                            >
                                                <Field name="emirateId">
                                                    {({ field }: FieldProps) => (
                                                        <Input
                                                            type="number"
                                                            placeholder="Amount"
                                                            {...field}
                                                            onChange={(e) => handleFieldChange('emirateId', e.target.value, setFieldValue)}
                                                        />
                                                    )}
                                                </Field>
                                            </FormItem>

                                            <FormItem
                                                label="Residence Stamping"
                                                invalid={!!errors.residenceStamping && touched.residenceStamping}
                                                errorMessage={errors.residenceStamping as string}
                                            >
                                                <Field name="residenceStamping">
                                                    {({ field }: FieldProps) => (
                                                        <Input
                                                            type="number"
                                                            placeholder="Amount"
                                                            {...field}
                                                            onChange={(e) => handleFieldChange('residenceStamping', e.target.value, setFieldValue)}
                                                        />
                                                    )}
                                                </Field>
                                            </FormItem>

                                            <FormItem
                                                label="Srilanka Council Head"
                                                invalid={!!errors.srilankaCouncilHead && touched.srilankaCouncilHead}
                                                errorMessage={errors.srilankaCouncilHead as string}
                                            >
                                                <Field name="srilankaCouncilHead">
                                                    {({ field }: FieldProps) => (
                                                        <Input
                                                            type="number"
                                                            placeholder="Amount"
                                                            {...field}
                                                            onChange={(e) => handleFieldChange('srilankaCouncilHead', e.target.value, setFieldValue)}
                                                        />
                                                    )}
                                                </Field>
                                            </FormItem>

                                            {/* Group 5 */}
                                            <FormItem
                                                label="Upscoding"
                                                invalid={!!errors.upscoding && touched.upscoding}
                                                errorMessage={errors.upscoding as string}
                                            >
                                                <Field name="upscoding">
                                                    {({ field }: FieldProps) => (
                                                        <Input
                                                            type="number"
                                                            placeholder="Amount"
                                                            {...field}
                                                            onChange={(e) => handleFieldChange('upscoding', e.target.value, setFieldValue)}
                                                        />
                                                    )}
                                                </Field>
                                            </FormItem>

                                            <FormItem
                                                label="Labour Fine Payment"
                                                invalid={!!errors.labourFinePayment && touched.labourFinePayment}
                                                errorMessage={errors.labourFinePayment as string}
                                            >
                                                <Field name="labourFinePayment">
                                                    {({ field }: FieldProps) => (
                                                        <Input
                                                            type="number"
                                                            placeholder="Amount"
                                                            {...field}
                                                            onChange={(e) => handleFieldChange('labourFinePayment', e.target.value, setFieldValue)}
                                                        />
                                                    )}
                                                </Field>
                                            </FormItem>

                                            <FormItem
                                                label="Labour Card Renewal Payment"
                                                invalid={!!errors.labourCardRenewalPayment && touched.labourCardRenewalPayment}
                                                errorMessage={errors.labourCardRenewalPayment as string}
                                            >
                                                <Field name="labourCardRenewalPayment">
                                                    {({ field }: FieldProps) => (
                                                        <Input
                                                            type="number"
                                                            placeholder="Amount"
                                                            {...field}
                                                            onChange={(e) => handleFieldChange('labourCardRenewalPayment', e.target.value, setFieldValue)}
                                                        />
                                                    )}
                                                </Field>
                                            </FormItem>

                                            {/* Group 6 */}
                                            <FormItem
                                                label="Service Payment"
                                                invalid={!!errors.servicePayment && touched.servicePayment}
                                                errorMessage={errors.servicePayment as string}
                                            >
                                                <Field name="servicePayment">
                                                    {({ field }: FieldProps) => (
                                                        <Input
                                                            type="number"
                                                            placeholder="Amount"
                                                            {...field}
                                                            onChange={(e) => handleFieldChange('servicePayment', e.target.value, setFieldValue)}
                                                        />
                                                    )}
                                                </Field>
                                            </FormItem>

                                            <FormItem
                                                label="Visa Stamping"
                                                invalid={!!errors.visaStamping && touched.visaStamping}
                                                errorMessage={errors.visaStamping as string}
                                            >
                                                <Field name="visaStamping">
                                                    {({ field }: FieldProps) => (
                                                        <Input
                                                            type="number"
                                                            placeholder="Amount"
                                                            {...field}
                                                            onChange={(e) => handleFieldChange('visaStamping', e.target.value, setFieldValue)}
                                                        />
                                                    )}
                                                </Field>
                                            </FormItem>

                                            <FormItem
                                                label="Two Month Visiting Visa"
                                                invalid={!!errors.twoMonthVisitingVisa && touched.twoMonthVisitingVisa}
                                                errorMessage={errors.twoMonthVisitingVisa as string}
                                            >
                                                <Field name="twoMonthVisitingVisa">
                                                    {({ field }: FieldProps) => (
                                                        <Input
                                                            type="number"
                                                            placeholder="Amount"
                                                            {...field}
                                                            onChange={(e) => handleFieldChange('twoMonthVisitingVisa', e.target.value, setFieldValue)}
                                                        />
                                                    )}
                                                </Field>
                                            </FormItem>

                                            {/* Group 7 */}
                                            <FormItem
                                                label="Fine Payment"
                                                invalid={!!errors.finePayment && touched.finePayment}
                                                errorMessage={errors.finePayment as string}
                                            >
                                                <Field name="finePayment">
                                                    {({ field }: FieldProps) => (
                                                        <Input
                                                            type="number"
                                                            placeholder="Amount"
                                                            {...field}
                                                            onChange={(e) => handleFieldChange('finePayment', e.target.value, setFieldValue)}
                                                        />
                                                    )}
                                                </Field>
                                            </FormItem>

                                            <FormItem
                                                label="Entry Permit Outside"
                                                invalid={!!errors.entryPermitOutside && touched.entryPermitOutside}
                                                errorMessage={errors.entryPermitOutside as string}
                                            >
                                                <Field name="entryPermitOutside">
                                                    {({ field }: FieldProps) => (
                                                        <Input
                                                            type="number"
                                                            placeholder="Amount"
                                                            {...field}
                                                            onChange={(e) => handleFieldChange('entryPermitOutside', e.target.value, setFieldValue)}
                                                        />
                                                    )}
                                                </Field>
                                            </FormItem>

                                            <FormItem
                                                label="Complaint Employee"
                                                invalid={!!errors.complaintEmployee && touched.complaintEmployee}
                                                errorMessage={errors.complaintEmployee as string}
                                            >
                                                <Field name="complaintEmployee">
                                                    {({ field }: FieldProps) => (
                                                        <Input
                                                            type="number"
                                                            placeholder="Amount"
                                                            {...field}
                                                            onChange={(e) => handleFieldChange('complaintEmployee', e.target.value, setFieldValue)}
                                                        />
                                                    )}
                                                </Field>
                                            </FormItem>

                                            {/* Group 8 */}
                                            <FormItem
                                                label="Arabic Letter"
                                                invalid={!!errors.arabicLetter && touched.arabicLetter}
                                                errorMessage={errors.arabicLetter as string}
                                            >
                                                <Field name="arabicLetter">
                                                    {({ field }: FieldProps) => (
                                                        <Input
                                                            type="number"
                                                            placeholder="Amount"
                                                            {...field}
                                                            onChange={(e) => handleFieldChange('arabicLetter', e.target.value, setFieldValue)}
                                                        />
                                                    )}
                                                </Field>
                                            </FormItem>

                                            <FormItem
                                                label="Violation Committee"
                                                invalid={!!errors.violationCommittee && touched.violationCommittee}
                                                errorMessage={errors.violationCommittee as string}
                                            >
                                                <Field name="violationCommittee">
                                                    {({ field }: FieldProps) => (
                                                        <Input
                                                            type="number"
                                                            placeholder="Amount"
                                                            {...field}
                                                            onChange={(e) => handleFieldChange('violationCommittee', e.target.value, setFieldValue)}
                                                        />
                                                    )}
                                                </Field>
                                            </FormItem>

                                            <FormItem
                                                label="Quota Modification"
                                                invalid={!!errors.quotaModification && touched.quotaModification}
                                                errorMessage={errors.quotaModification as string}
                                            >
                                                <Field name="quotaModification">
                                                    {({ field }: FieldProps) => (
                                                        <Input
                                                            type="number"
                                                            placeholder="Amount"
                                                            {...field}
                                                            onChange={(e) => handleFieldChange('quotaModification', e.target.value, setFieldValue)}
                                                        />
                                                    )}
                                                </Field>
                                            </FormItem>

                                            {/* Group 9 */}
                                            <FormItem
                                                label="Others"
                                                invalid={!!errors.others && touched.others}
                                                errorMessage={errors.others as string}
                                            >
                                                <Field name="others">
                                                    {({ field }: FieldProps) => (
                                                        <Input
                                                            type="number"
                                                            placeholder="Amount"
                                                            {...field}
                                                            onChange={(e) => handleFieldChange('others', e.target.value, setFieldValue)}
                                                        />
                                                    )}
                                                </Field>
                                            </FormItem>
                                        </div>
                                    </AdaptableCard>
                                </div>
                            </div>
                                {/* Total Expenses Box */}
                                <div className="flex justify-end mb-6">
                                <div className="bg-blue-50 dark:bg-gray-700 p-4 rounded-lg shadow-sm border border-blue-100 dark:border-gray-600 w-64">
                                    <div className="text-sm font-semibold text-blue-600 dark:text-blue-300 mb-1">
                                        Total Expenses
                                    </div>
                                    <div className="text-2xl font-bold text-blue-800 dark:text-blue-200">
                                     {totalExpenses.toFixed(2)}
                                    </div>
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
                )
            }}
        </Formik>
    )
})

VisaExpenseForm.displayName = 'VisaExpenseForm'

export default VisaExpenseForm