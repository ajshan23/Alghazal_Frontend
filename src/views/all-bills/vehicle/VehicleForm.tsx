import { forwardRef, useState } from 'react'
import { Formik, Form, Field, FormikProps } from 'formik'
import * as Yup from 'yup'
import {
    Input,
    Select,
    DatePicker,
    Radio,
    Notification,
    toast,
} from '@/components/ui'
import Button from '@/components/ui/Button'
import { FormContainer, FormItem } from '@/components/ui/Form'
import StickyFooter from '@/components/shared/StickyFooter'
import { AiOutlineSave } from 'react-icons/ai'
import { HiOutlineTrash } from 'react-icons/hi'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import { AdaptableCard } from '@/components/shared'
import dayjs from 'dayjs'

type FormikRef = FormikProps<VehicleFormModel>

type VehicleFormModel = {
    vehicleNumber: string
    vehicleType: string
    make: string
    model: string
    year: number | null
    color: string
    registrationDate: Date | string
    insuranceExpiry: Date | string
    lastServiceDate?: Date | string
    currentMileage: number
    status: string
}

export type SetSubmitting = (isSubmitting: boolean) => void
export type OnDeleteCallback = React.Dispatch<React.SetStateAction<boolean>>
type OnDelete = (callback: OnDeleteCallback) => void

type VehicleFormProps = {
    initialData?: Partial<VehicleFormModel>
    type: 'edit' | 'new'
    onFormSubmit: (
        values: VehicleFormModel,
        setSubmitting: SetSubmitting,
    ) => Promise<void>
    onDiscard?: () => void
    onDelete?: OnDelete
}

const vehicleTypes = [
    { value: 'car', label: 'Car' },
    { value: 'truck', label: 'Truck' },
    { value: 'van', label: 'Van' },
    { value: 'pickup', label: 'Pickup' },
    { value: 'motorcycle', label: 'Motorcycle' },
    { value: 'other', label: 'Other' },
]

const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'maintenance', label: 'Maintenance' },
]

const currentYear = new Date().getFullYear()
const yearOptions = Array.from({ length: 30 }, (_, i) => ({
    value: currentYear - i,
    label: (currentYear - i).toString(),
}))

const VehicleForm = forwardRef<FormikRef, VehicleFormProps>((props, ref) => {
    const {
        type,
        initialData = {
            vehicleNumber: '',
            vehicleType: 'car',
            make: '',
            model: '',
            year: null,
            color: '',
            registrationDate: new Date(),
            insuranceExpiry: new Date(),
            lastServiceDate: undefined,
            currentMileage: 0,
            status: 'active',
        },
        onFormSubmit,
        onDiscard,
        onDelete,
    } = props

    const validationSchema = Yup.object().shape({
        vehicleNumber: Yup.string()
            .required('Vehicle number is required')
            .matches(/^[A-Z0-9]+$/, 'Must be uppercase alphanumeric'),
        vehicleType: Yup.string().required('Vehicle type is required'),
        make: Yup.string().required('Make is required'),
        model: Yup.string().required('Model is required'),
        year: Yup.number()
            .required('Year is required')
            .min(1900, 'Year must be after 1900')
            .max(currentYear + 1, `Year can't be in the future`),
        color: Yup.string(),
        registrationDate: Yup.date().required('Registration date is required'),
        insuranceExpiry: Yup.date()
            .required('Insurance expiry is required')
            .min(
                Yup.ref('registrationDate'),
                'Insurance expiry must be after registration date',
            ),
        lastServiceDate: Yup.date().nullable(),
        currentMileage: Yup.number()
            .min(0, 'Mileage cannot be negative')
            .integer('Mileage must be a whole number'),
        status: Yup.string().required('Status is required'),
    })

    return (
        <Formik
            innerRef={ref}
            initialValues={{
                ...initialData,
                year: initialData.year || null,
                registrationDate: initialData.registrationDate
                    ? dayjs(initialData.registrationDate).toDate()
                    : new Date(),
                insuranceExpiry: initialData.insuranceExpiry
                    ? dayjs(initialData.insuranceExpiry).toDate()
                    : new Date(),
                lastServiceDate: initialData.lastServiceDate
                    ? dayjs(initialData.lastServiceDate).toDate()
                    : undefined,
            }}
            validationSchema={validationSchema}
            onSubmit={async (values, { setSubmitting, setErrors }) => {
                try {
                    // Validate required fields
                    if (
                        !values.vehicleNumber ||
                        !values.vehicleType ||
                        !values.make ||
                        !values.model ||
                        !values.year ||
                        !values.registrationDate ||
                        !values.insuranceExpiry
                    ) {
                        throw new Error('Required fields are missing')
                    }

                    const formattedValues = {
                        ...values,
                        registrationDate: dayjs(values.registrationDate).format(
                            'YYYY-MM-DD',
                        ),
                        insuranceExpiry: dayjs(values.insuranceExpiry).format(
                            'YYYY-MM-DD',
                        ),
                        lastServiceDate: values.lastServiceDate
                            ? dayjs(values.lastServiceDate).format('YYYY-MM-DD')
                            : undefined,
                    }

                    await onFormSubmit(
                        formattedValues as VehicleFormModel,
                        setSubmitting,
                    )
                } catch (error: any) {
                    setSubmitting(false)
                    toast.push(
                        <Notification
                            title="Validation Error"
                            type="danger"
                            duration={2500}
                        >
                            {error.message || 'Please fill all required fields'}
                        </Notification>,
                        { placement: 'top-center' },
                    )
                }
            }}
            enableReinitialize
            validateOnChange
            validateOnBlur
        >
            {({ values, errors, touched, isSubmitting, setFieldValue }) => (
                <Form>
                    <FormContainer>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <AdaptableCard divider className="mb-4">
                                <h5 className="mb-4">Vehicle Information</h5>

                                <FormItem
                                    label="Vehicle Number"
                                    invalid={Boolean(
                                        errors.vehicleNumber &&
                                            touched.vehicleNumber,
                                    )}
                                    errorMessage={
                                        errors.vehicleNumber as string
                                    }
                                >
                                    <Field
                                        type="text"
                                        autoComplete="off"
                                        name="vehicleNumber"
                                        placeholder="Enter vehicle number"
                                        component={Input}
                                        onChange={(
                                            e: React.ChangeEvent<HTMLInputElement>,
                                        ) => {
                                            setFieldValue(
                                                'vehicleNumber',
                                                e.target.value.toUpperCase(),
                                            )
                                        }}
                                    />
                                </FormItem>

                                <FormItem
                                    label="Vehicle Type"
                                    invalid={Boolean(
                                        errors.vehicleType &&
                                            touched.vehicleType,
                                    )}
                                    errorMessage={errors.vehicleType as string}
                                >
                                    <Select
                                        placeholder="Select vehicle type"
                                        field="vehicleType"
                                        options={vehicleTypes}
                                        value={vehicleTypes.find(
                                            (type) =>
                                                type.value ===
                                                values.vehicleType,
                                        )}
                                        onChange={(option) =>
                                            setFieldValue(
                                                'vehicleType',
                                                option?.value,
                                            )
                                        }
                                    />
                                </FormItem>

                                <FormItem
                                    label="Make"
                                    invalid={Boolean(
                                        errors.make && touched.make,
                                    )}
                                    errorMessage={errors.make as string}
                                >
                                    <Field
                                        type="text"
                                        autoComplete="off"
                                        name="make"
                                        placeholder="Enter make"
                                        component={Input}
                                    />
                                </FormItem>

                                <FormItem
                                    label="Model"
                                    invalid={Boolean(
                                        errors.model && touched.model,
                                    )}
                                    errorMessage={errors.model as string}
                                >
                                    <Field
                                        type="text"
                                        autoComplete="off"
                                        name="model"
                                        placeholder="Enter model"
                                        component={Input}
                                    />
                                </FormItem>

                                <FormItem
                                    label="Year"
                                    invalid={Boolean(
                                        errors.year && touched.year,
                                    )}
                                    errorMessage={errors.year as string}
                                >
                                    <Select
                                        placeholder="Select year"
                                        field="year"
                                        options={yearOptions}
                                        value={
                                            values.year
                                                ? yearOptions.find(
                                                      (year) =>
                                                          year.value ===
                                                          values.year,
                                                  )
                                                : undefined
                                        }
                                        onChange={(option) =>
                                            setFieldValue('year', option?.value)
                                        }
                                    />
                                </FormItem>

                                <FormItem
                                    label="Color"
                                    invalid={Boolean(
                                        errors.color && touched.color,
                                    )}
                                    errorMessage={errors.color as string}
                                >
                                    <Field
                                        type="text"
                                        autoComplete="off"
                                        name="color"
                                        placeholder="Enter color"
                                        component={Input}
                                    />
                                </FormItem>
                            </AdaptableCard>

                            <AdaptableCard divider className="mb-4">
                                <h5 className="mb-4">Registration & Status</h5>

                                <FormItem
                                    label="Registration Date"
                                    invalid={Boolean(
                                        errors.registrationDate &&
                                            touched.registrationDate,
                                    )}
                                    errorMessage={
                                        errors.registrationDate as string
                                    }
                                >
                                    <DatePicker
                                        field="registrationDate"
                                        placeholder="Select registration date"
                                        value={values.registrationDate}
                                        onChange={(date) => {
                                            if (!date) return
                                            setFieldValue(
                                                'registrationDate',
                                                date,
                                            )
                                            // Reset insurance date if it's now before registration date
                                            if (
                                                values.insuranceExpiry &&
                                                dayjs(date).isAfter(
                                                    values.insuranceExpiry,
                                                )
                                            ) {
                                                setFieldValue(
                                                    'insuranceExpiry',
                                                    date,
                                                )
                                            }
                                        }}
                                        maxDate={new Date()}
                                    />
                                </FormItem>

                                <FormItem
                                    label="Insurance Expiry Date"
                                    invalid={Boolean(
                                        errors.insuranceExpiry &&
                                            touched.insuranceExpiry,
                                    )}
                                    errorMessage={
                                        errors.insuranceExpiry as string
                                    }
                                >
                                    <DatePicker
                                        field="insuranceExpiry"
                                        placeholder="Select insurance expiry date"
                                        value={values.insuranceExpiry}
                                        onChange={(date) => {
                                            if (!date) return
                                            setFieldValue(
                                                'insuranceExpiry',
                                                date,
                                            )
                                        }}
                                        minDate={values.registrationDate}
                                    />
                                </FormItem>

                                <FormItem
                                    label="Last Service Date"
                                    invalid={Boolean(
                                        errors.lastServiceDate &&
                                            touched.lastServiceDate,
                                    )}
                                    errorMessage={
                                        errors.lastServiceDate as string
                                    }
                                >
                                    <DatePicker
                                        field="lastServiceDate"
                                        placeholder="Select last service date"
                                        value={values.lastServiceDate}
                                        onChange={(date) => {
                                            if (!date) return
                                            setFieldValue(
                                                'lastServiceDate',
                                                date,
                                            )
                                        }}
                                        maxDate={new Date()}
                                    />
                                </FormItem>

                                <FormItem
                                    label="Current Mileage (km)"
                                    invalid={Boolean(
                                        errors.currentMileage &&
                                            touched.currentMileage,
                                    )}
                                    errorMessage={
                                        errors.currentMileage as string
                                    }
                                >
                                    <Field
                                        type="number"
                                        autoComplete="off"
                                        name="currentMileage"
                                        placeholder="Enter current mileage"
                                        component={Input}
                                        min={0}
                                    />
                                </FormItem>

                                <FormItem
                                    label="Status"
                                    invalid={Boolean(
                                        errors.status && touched.status,
                                    )}
                                    errorMessage={errors.status as string}
                                >
                                    <Radio.Group
                                        value={values.status}
                                        onChange={(val) =>
                                            setFieldValue('status', val)
                                        }
                                    >
                                        {statusOptions.map((status) => (
                                            <Radio
                                                key={status.value}
                                                value={status.value}
                                            >
                                                {status.label}
                                            </Radio>
                                        ))}
                                    </Radio.Group>
                                </FormItem>
                            </AdaptableCard>
                        </div>

                        <StickyFooter
                            className="-mx-8 px-8 flex items-center justify-between py-4"
                            stickyClass="border-t bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                        >
                            <div>
                                {type === 'edit' && onDelete && (
                                    <DeleteVehicleButton onDelete={onDelete} />
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

VehicleForm.displayName = 'VehicleForm'

const DeleteVehicleButton = ({ onDelete }: { onDelete: OnDelete }) => {
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
                title="Delete Vehicle"
                confirmButtonColor="red-600"
                onClose={onDialogClose}
                onRequestClose={onDialogClose}
                onCancel={onDialogClose}
                onConfirm={onConfirmDialog}
            >
                <p>Are you sure you want to delete this vehicle?</p>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    This action cannot be undone.
                </p>
            </ConfirmDialog>
        </>
    )
}

export default VehicleForm
