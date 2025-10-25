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
    currentFilters?: {
        startDate: string
        endDate: string
        category: string
        shop: string
        vehicleNo: string
        vehicle?: string
        paymentMethod: string
        employee: string
        month?: number | string
        year?: number | string
    }
}

type OptionType = {
    label: string
    value: string
}

const paymentMethodOptions = [
    { label: 'ADVANCE', value: 'advance' },
    { label: 'ADIB', value: 'adib' },
    { label: 'Cash', value: 'cash' },
    { label: 'MASHREQ CARD', value: 'mashreq_card' },
    { label: 'CREDIT', value: 'credit' },
    { label: 'ADCB CARD', value: 'adcb_card' },
    { label: 'ADCB BANK', value: 'adcb_bank' },
    { label: 'MASHREQ BANK', value: 'mashreq_bank' },
    { label: 'OWNER PERSONAL PAY', value: 'owner_personal_pay' },
    { label: 'MR.SYED PAY', value: 'mr_syed_pay' },
    { label: 'OTHER PAY', value: 'other_pay' },
    { label: 'CHEQUE', value: 'cheque' },
    { label: 'WIO CARD', value: 'wio_card' },
    { label: 'WIO BANK', value: 'wio_bank' }
];

const BillFilterDrawer: React.FC<BillFilterDrawerProps> = ({
    isOpen,
    onClose,
    onRequestClose,
    billType,
    onApplyFilters,
    currentFilters,
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

    // FIXED: Use vehicleNo from currentFilters (not vehicle)
    const initialValues = {
        startDate: currentFilters?.startDate || '',
        endDate: currentFilters?.endDate || '',
        category: currentFilters?.category || '',
        shop: currentFilters?.shop || '',
        vehicleNo: currentFilters?.vehicleNo || '', // Use vehicleNo consistently
        paymentMethod: currentFilters?.paymentMethod || '',
        employee: currentFilters?.employee || '',
    }

    const handleSubmit = (values: any) => {
        // FIXED: Only send non-empty filter values
        const filters: any = {};
        
        if (values.startDate) filters.startDate = values.startDate;
        if (values.endDate) filters.endDate = values.endDate;
        if (values.category) filters.category = values.category;
        if (values.shop) filters.shop = values.shop;
        if (values.vehicleNo) filters.vehicle = values.vehicleNo; // Map to 'vehicle' for backend
        if (values.paymentMethod) filters.paymentMethod = values.paymentMethod;
        if (values.employee) filters.employee = values.employee;

        console.log('Applying Filters from Drawer:', filters);
        onApplyFilters?.(filters);
        
        setTimeout(() => {
            onClose?.(new MouseEvent('click') as React.MouseEvent);
        }, 100);
    };

    const handleReset = (resetForm: any) => {
        resetForm();
        // Reset with empty filters
        onApplyFilters?.({
            startDate: '',
            endDate: '',
            category: '',
            shop: '',
            vehicle: '',
            paymentMethod: '',
            employee: '',
        });
    };

    return (
        <Drawer
            title={`Filter ${billType.charAt(0).toUpperCase() + billType.slice(1)} Bills`}
            isOpen={isOpen}
            onClose={onClose}
            onRequestClose={onRequestClose}
        >
            <Formik
                key={`${isOpen}-${JSON.stringify(currentFilters)}`}
                initialValues={initialValues}
                validationSchema={Yup.object({})}
                onSubmit={handleSubmit}
            >
                {({ values, errors, touched, resetForm, setFieldValue }) => (
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
                                            onClear={() => form.setFieldValue(field.name, '')}
                                            isClearable
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
                                            onClear={() => form.setFieldValue(field.name, '')}
                                            isClearable
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
                                            onClear={() => form.setFieldValue(field.name, '')}
                                            isClearable
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
                                            onClear={() => form.setFieldValue(field.name, '')}
                                            isClearable
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
                                            onClear={() => form.setFieldValue(field.name, '')}
                                            isClearable
                                        />
                                    )}
                                </Field>
                            </FormItem>
                        )}

                        {/* Buttons */}
                        <div className="mt-8 flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => handleReset(resetForm)}
                                className="flex items-center gap-1 text-sm bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white px-3 py-1.5 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                            >
                                <FiRotateCcw className="text-base" />
                                Reset
                            </button>
                            <button
                                type="submit"
                                className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 transition-colors"
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