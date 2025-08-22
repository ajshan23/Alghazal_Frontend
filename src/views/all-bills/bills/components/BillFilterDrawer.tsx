import React, { useEffect, useState } from 'react'
import { Drawer } from '@/components/ui'
import { Formik, Form, Field, FieldProps } from 'formik'
import * as Yup from 'yup'
import Select from '@/components/ui/Select'
import FormItem from '@/components/ui/Form/FormItem'
import DatePicker from '@/components/ui/DatePicker'
import { fetchCategories, fetchShops, fetchUser, fetchVehicles } from '../../api/api'
import { FiRotateCcw } from 'react-icons/fi'
import { format } from 'date-fns'

type BillFilterDrawerProps = {
    isOpen: boolean
    onClose: (e: React.MouseEvent) => void
    onRequestClose: (e: React.MouseEvent) => void
    billType: string
    onApplyFilters?: (filters: any) => void
}

type OptionType = {
    label: string
    value: string
}

const paymentMethodOptions: OptionType[] = [
    { label: 'ADCB', value: 'adcb' },
    { label: 'ADIB', value: 'adib' },
    { label: 'Cash', value: 'cash' },
    { label: 'ADVANCE', value: 'advance' },
    { label: 'MASHREQ CARD', value: 'masherq_card' },
    { label: 'ATHEER PLUS', value: 'atheer_plus' },
]

const BillFilterDrawer: React.FC<BillFilterDrawerProps> = ({
    isOpen,
    onClose,
    onRequestClose,
    billType,
    onApplyFilters,
}) => {
    const [shopOptions, setShopOptions] = useState<OptionType[]>([])
    const [categoryOptions, setCategoryOptions] = useState<OptionType[]>([])
    const [vehicleOptions, setVehicleOptions] = useState<OptionType[]>([])
    const [userOptions, setUserOptions] = useState<OptionType[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const loadData = async () => {
            try {
                const [shopData, categoryData, vehicleData, userData] = await Promise.all([
                    fetchShops(),
                    fetchCategories(),
                    fetchVehicles(),
                    fetchUser()
                ])

                setShopOptions(
                    shopData?.data?.shops?.map((shop: any) => ({
                        label: `${shop.shopName} (${shop.shopNo})`,
                        value: shop._id,
                    })) || []
                )

                setCategoryOptions(
                    categoryData?.data?.categories?.map((cat: any) => ({
                        label: cat.name,
                        value: cat._id,
                    })) || []
                )

                setVehicleOptions(
                    vehicleData?.data?.vehicles?.map((v: any) => ({
                        label: v.vehicleNumber,
                        value: v._id,
                    })) || []
                )

                setUserOptions(
                    userData?.data?.users?.map((user: any) => ({
                        label: `${user.firstName} ${user.lastName}`,
                        value: user._id,
                    })) || []
                )
            } catch (err) {
                console.error('Error loading filter options', err)
            } finally {
                setIsLoading(false)
            }
        }

        loadData()
    }, [])

    const today = new Date()

    return (
        <Drawer
            title={`Filter Reports and Bills`}
            isOpen={isOpen}
            onClose={onClose}
            onRequestClose={onRequestClose}
        >
            <Formik
                initialValues={{
                    startDate: '',
                    endDate: '',
                    category: '',
                    shop: '',
                    vehicleNo: '',
                    paymentMethod: '',
                    employee: '',
                }}
                validationSchema={Yup.object({})}
                onSubmit={(values) => {
                    onApplyFilters?.(values)
                    setTimeout(() => {
                        onClose?.(new MouseEvent('click') as React.MouseEvent)
                    }, 100)
                }}
            >
                {({ values, errors, touched, resetForm }) => (
                    <Form className="space-y-4">
                        {/* Start Date */}
                        <FormItem
                            label="Start Date"
                            invalid={!!errors.startDate && touched.startDate}
                        >
                            <Field name="startDate">
                                {({ field, form }: FieldProps) => (
                                    <DatePicker
                                        placeholder="Select Start Date"
                                        value={
                                            field.value
                                                ? new Date(field.value)
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

                        {/* End Date */}
                        <FormItem
                            label="End Date"
                            invalid={!!errors.endDate && touched.endDate}
                        >
                            <Field name="endDate">
                                {({ field, form }: FieldProps) => (
                                    <DatePicker
                                        placeholder="Select End Date"
                                        value={
                                            field.value
                                                ? new Date(field.value)
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

                        {/* Shop */}
                        {(billType === 'general' ||
                            billType === 'mess' ||
                            billType === 'accommodation' ||
                            billType === 'vehicle' ||
                            billType === 'adib') && (
                            <FormItem label="Shop Name">
                                <Field name="shop">
                                    {({ field, form }: FieldProps) => (
                                        <Select
                                            placeholder="Select Shop"
                                            options={shopOptions}
                                            value={shopOptions.find(
                                                (s) => s.value === field.value,
                                            )}
                                            onChange={(option) =>
                                                form.setFieldValue(
                                                    field.name,
                                                    option?.value || '',
                                                )
                                            }
                                            loading={isLoading}
                                        />
                                    )}
                                </Field>
                            </FormItem>
                        )}

                        {/* Category */}
                        {(billType === 'general' || billType === 'adib') && (
                            <FormItem label="Category">
                                <Field name="category">
                                    {({ field, form }: FieldProps) => (
                                        <Select
                                            placeholder="Select Category"
                                            options={categoryOptions}
                                            value={categoryOptions.find(
                                                (cat) =>
                                                    cat.value === field.value,
                                            )}
                                            onChange={(option) =>
                                                form.setFieldValue(
                                                    field.name,
                                                    option?.value || '',
                                                )
                                            }
                                            loading={isLoading}
                                        />
                                    )}
                                </Field>
                            </FormItem>
                        )}

                        {/* Vehicle */}
                        {(billType === 'vehicle' || billType === 'fuel') && (
                            <FormItem label="Vehicle No">
                                <Field name="vehicleNo">
                                    {({ field, form }: FieldProps) => (
                                        <Select
                                            placeholder="Select Vehicle"
                                            options={vehicleOptions}
                                            value={vehicleOptions.find(
                                                (v) => v.value === field.value,
                                            )}
                                            onChange={(option) =>
                                                form.setFieldValue(
                                                    field.name,
                                                    option?.value || '',
                                                )
                                            }
                                            loading={isLoading}
                                        />
                                    )}
                                </Field>
                            </FormItem>
                        )}

                        {/* Payment Method */}
                        {[
                            'general',
                            'mess',
                            'fuel',
                            'vehicle',
                            'accommodation',
                        ].includes(billType) && (
                            <FormItem label="Payment Method">
                                <Field name="paymentMethod">
                                    {({ field, form }: FieldProps) => (
                                        <Select
                                            placeholder="Select Payment Method"
                                            options={paymentMethodOptions}
                                            value={paymentMethodOptions.find(
                                                (m) => m.value === field.value,
                                            )}
                                            onChange={(option) =>
                                                form.setFieldValue(
                                                    field.name,
                                                    option?.value || '',
                                                )
                                            }
                                        />
                                    )}
                                </Field>
                            </FormItem>
                        )}

                        {/* Employee */}
                        {(billType === 'visaExpense' || billType === 'labour' || billType === 'payroll') && (
                            <FormItem label="Employee">
                                <Field name="employee">
                                    {({ field, form }: FieldProps) => (
                                        <Select
                                            placeholder="Select Employee"
                                            options={userOptions}
                                            value={userOptions.find(
                                                (u) => u.value === field.value,
                                            )}
                                            onChange={(option) =>
                                                form.setFieldValue(
                                                    field.name,
                                                    option?.value || '',
                                                )
                                            }
                                        />
                                    )}
                                </Field>
                            </FormItem>
                        )}

                        {/* Buttons */}
                        <div className="mt-8 flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => resetForm()}
                                className="flex items-center gap-1 text-sm bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white px-3 py-1.5 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                            >
                                <FiRotateCcw className="text-base" />
                                Reset
                            </button>
                            <button
                                type="submit"
                                className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700"
                            >
                                Apply Filters
                            </button>
                        </div>
                    </Form>
                )}
            </Formik>
        </Drawer>
    )
}

export default BillFilterDrawer