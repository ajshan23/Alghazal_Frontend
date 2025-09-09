import { forwardRef, useEffect, useState } from 'react';
import { FormContainer, FormItem } from '@/components/ui/Form';
import Button from '@/components/ui/Button';
import StickyFooter from '@/components/shared/StickyFooter';
import { Field, Form, Formik, FormikProps, FieldProps } from 'formik';
import { AiOutlineSave } from 'react-icons/ai';
import { HiOutlineTrash } from 'react-icons/hi';
import * as Yup from 'yup';
import { Input, Select } from '@/components/ui';
import { AdaptableCard } from '@/components/shared';
import { fetchEmpSummary, fetchUser } from '../api/api';

type FormikRef = FormikProps<any>;

type InitialData = {
    employee: string;
    labourCard: string;
    labourCardPersonalNo: string;
    period: string;
    basic: string;
    allowance: string;
    otOvertime: string; // Keep this field in the type
    deduction: string;
    mess: string;
    advance: string;
    net: string;
    remark: string;
};

export type SetSubmitting = (isSubmitting: boolean) => void;
export type OnDeleteCallback = React.Dispatch<React.SetStateAction<boolean>>;
type OnDelete = (callback: OnDeleteCallback) => void;

type PayrollFormProps = {
    initialData?: InitialData;
    type: 'edit' | 'new';
    onDiscard?: () => void;
    onDelete?: OnDelete;
    onFormSubmit: (formData: InitialData, setSubmitting: SetSubmitting) => Promise<any>;
};

type UserOption = {
    value: string;
    label: string;
};

const PayrollForm = forwardRef<FormikRef, PayrollFormProps>((props, ref) => {
    const {
        type,
        initialData = {
            employee: '',
            labourCard: '',
            labourCardPersonalNo: '',
            period: '',
            basic: '0',
            allowance: '0',
            otOvertime: '0', // Initial value for the new field
            deduction: '0',
            mess: '0',
            advance: '0',
            net: '0',
            remark: '',
        },
        onFormSubmit,
        onDiscard,
        onDelete,
    } = props;

    const [userOptions, setUserOptions] = useState<UserOption[]>([]);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await fetchUser();
                const options = response.data?.users.map((user: any) => ({
                    value: user._id,
                    label: `${user.firstName} ${user.lastName}`,
                }));
                setUserOptions(options);
            } catch (error) {
                console.error('Failed to fetch users', error);
            }
        };
        fetchUsers();
    }, []);

    const validationSchema = Yup.object().shape({
        employee: Yup.string().required('Employee name is required'),
        labourCard: Yup.string().required('Labour Card is required'),
        labourCardPersonalNo: Yup.string().required('Labour Card Personal No is required'),
        period: Yup.string().required('Period is required'),
        basic: Yup.string().required('Basic salary is required'),
        allowance: Yup.string().required('Allowance is required'),
        otOvertime: Yup.string(), // Removed the required validation
        deduction: Yup.string().required('Deduction is required'),
        mess: Yup.string().required('Mess is required'),
        advance: Yup.string().required('Advance is required'),
        net: Yup.string().required('Net is required'),
        remark: Yup.string().max(500, 'Remark must be at most 500 characters'),
    });

    return (
        <Formik
            innerRef={ref}
            initialValues={initialData}
            validationSchema={validationSchema}
            onSubmit={async (values, { setSubmitting, setErrors }) => {
                try {
                    await onFormSubmit(values, setSubmitting);
                } catch (error: any) {
                    setSubmitting(false);
                    if (error.response?.data?.errors) {
                        setErrors(error.response.data.errors);
                    }
                    console.error('Form submission error:', error);
                }
            }}
            enableReinitialize={true}
        >
            {({ values, touched, errors, isSubmitting, setFieldValue, handleBlur, resetForm }) => {
                const basic = parseFloat(values.basic) || 0;
                const allowance = parseFloat(values.allowance) || 0;
                const overtime = parseFloat(values.otOvertime) || 0;
                const deduction = parseFloat(values.deduction) || 0;
                const mess = parseFloat(values.mess) || 0;
                const advance = parseFloat(values.advance) || 0;

                const totalEarnings = basic + allowance + overtime;
                const totalDeductions = deduction + mess + advance;
                const netSalary = totalEarnings - totalDeductions;

                useEffect(() => {
                    setFieldValue('net', netSalary.toFixed(2));
                }, [basic, allowance, overtime, deduction, mess, advance, netSalary, setFieldValue]);

                return (
                    <Form>
                        <FormContainer>
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                <div className="lg:col-span-2">
                                    <AdaptableCard divider className="mb-4">
                                        <h5 className="mb-4">Employee Information</h5>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                            <FormItem
                                                label="EMPLOYEE"
                                                invalid={!!errors.employee}
                                                errorMessage={errors.employee as string}
                                            >
                                                <Select
                                                    name="employee"
                                                    placeholder="Select user"
                                                    value={userOptions.find((opt) => opt.value === values.employee)}
                                                    options={userOptions}
                                                    onChange={async (option) => {
                                                        const employeeId = option?.value || '';
                                                        setFieldValue('employee', employeeId);

                                                        if (employeeId) {
                                                            try {
                                                                const response = await fetchEmpSummary(employeeId);
                                                                const employeeData = response.data;

                                                                setFieldValue('basic', employeeData?.employee?.basicSalary || '0');
                                                                setFieldValue('otOvertime', employeeData?.overtime?.previousMonthTotal || '0');
                                                                
                                                                // Reset other numerical fields
                                                                setFieldValue('allowance', '0');
                                                                setFieldValue('deduction', '0');
                                                                setFieldValue('mess', '0');
                                                                setFieldValue('advance', '0');
                                                                
                                                                if (employeeData?.visaDetails) {
                                                                    setFieldValue('labourCard', employeeData.visaDetails.labourCardPersonalNumber || '');
                                                                    setFieldValue('labourCardPersonalNo', employeeData.visaDetails.workPermitNumber || '');
                                                                } else {
                                                                    setFieldValue('labourCard', '');
                                                                    setFieldValue('labourCardPersonalNo', '');
                                                                }
                                                            } catch (error) {
                                                                console.error('Failed to fetch employee details', error);
                                                                setFieldValue('basic', '0');
                                                                setFieldValue('otOvertime', '0');
                                                                setFieldValue('allowance', '0');
                                                                setFieldValue('deduction', '0');
                                                                setFieldValue('mess', '0');
                                                                setFieldValue('advance', '0');
                                                                setFieldValue('labourCard', '');
                                                                setFieldValue('labourCardPersonalNo', '');
                                                            }
                                                        } else {
                                                            // Clear all fields if no employee is selected
                                                            setFieldValue('labourCard', '');
                                                            setFieldValue('labourCardPersonalNo', '');
                                                            setFieldValue('basic', '0');
                                                            setFieldValue('otOvertime', '0');
                                                            setFieldValue('allowance', '0');
                                                            setFieldValue('deduction', '0');
                                                            setFieldValue('mess', '0');
                                                            setFieldValue('advance', '0');
                                                        }
                                                    }}
                                                    onBlur={handleBlur}
                                                />
                                            </FormItem>
                                            <FormItem
                                                label="LABOUR CARD"
                                                invalid={!!errors.labourCard}
                                                errorMessage={errors.labourCard as string}
                                            >
                                                <Field name="labourCard">
                                                    {({ field }: FieldProps) => (
                                                        <Input
                                                            type="text"
                                                            autoComplete="off"
                                                            placeholder="LabourCard"
                                                            {...field}
                                                            readOnly={true}
                                                        />
                                                    )}
                                                </Field>
                                            </FormItem>
                                            <FormItem
                                                label="LABOUR CARD PERSONAL NO"
                                                invalid={!!errors.labourCardPersonalNo}
                                                errorMessage={errors.labourCardPersonalNo as string}
                                            >
                                                <Field name="labourCardPersonalNo">
                                                    {({ field }: FieldProps) => (
                                                        <Input
                                                            type="text"
                                                            autoComplete="off"
                                                            placeholder="Labour Card PersonalNo"
                                                            {...field}
                                                            readOnly={true}
                                                        />
                                                    )}
                                                </Field>
                                            </FormItem>
                                            <FormItem
                                                label="PERIOD"
                                                invalid={!!errors.period}
                                                errorMessage={errors.period as string}
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
                                            <FormItem label="Basic salary">
                                                <Input
                                                    type="text"
                                                    autoComplete="off"
                                                    placeholder="Basic Salary"
                                                    value={values.basic}
                                                    readOnly={true}
                                                />
                                            </FormItem>
                                            <FormItem
                                                label="Allowance"
                                                invalid={!!errors.allowance && touched.allowance}
                                                errorMessage={errors.allowance as string}
                                            >
                                                <Field name="allowance">
                                                    {({ field }: FieldProps) => (
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
                                                label="Overtime"
                                                invalid={!!errors.otOvertime && touched.otOvertime}
                                                errorMessage={errors.otOvertime as string}
                                            >
                                                <Field name="otOvertime">
                                                    {({ field }: FieldProps) => (
                                                        <Input
                                                            type="text"
                                                            autoComplete="off"
                                                            placeholder="Overtime"
                                                            {...field}
                                                            readOnly={true} // This makes the field read-only
                                                        />
                                                    )}
                                                </Field>
                                            </FormItem>
                                            <FormItem
                                                label="Deduction"
                                                invalid={!!errors.deduction && touched.deduction}
                                                errorMessage={errors.deduction as string}
                                            >
                                                <Field name="deduction">
                                                    {({ field }: FieldProps) => (
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
                                                invalid={!!errors.mess && touched.mess}
                                                errorMessage={errors.mess as string}
                                            >
                                                <Field name="mess">
                                                    {({ field }: FieldProps) => (
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
                                                invalid={!!errors.advance && touched.advance}
                                                errorMessage={errors.advance as string}
                                            >
                                                <Field name="advance">
                                                    {({ field }: FieldProps) => (
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
                                                invalid={!!errors.net && touched.net}
                                                errorMessage={errors.net as string}
                                            >
                                                <Field name="net">
                                                    {({ field }: FieldProps) => (
                                                        <Input
                                                            type="text"
                                                            autoComplete="off"
                                                            placeholder="Net"
                                                            {...field}
                                                            readOnly={true}
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
                                            invalid={!!errors.remark && touched.remark}
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
                                                        resetForm();
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
                                            resetForm();
                                            onDiscard?.();
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
                );
            }}
        </Formik>
    );
});

PayrollForm.displayName = 'PayrollForm';

export default PayrollForm;