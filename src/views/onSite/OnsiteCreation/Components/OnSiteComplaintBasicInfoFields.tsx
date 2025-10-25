import AdaptableCard from '@/components/shared/AdaptableCard';
import Input from '@/components/ui/Input';
import { FormItem } from '@/components/ui/Form';
import { Field, FormikErrors, FormikTouched, useFormikContext } from 'formik';
import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui';

type FormFieldsName = {
    customerName: string;
    customerAddress: string;
    complaintNumber: string;
    phoneNumbers: string[];
};

type OnSiteComplaintBasicInfoFieldsProps = {
    touched: FormikTouched<FormFieldsName>;
    errors: FormikErrors<FormFieldsName>;
    values: FormFieldsName;
};

const OnSiteComplaintBasicInfoFields = (props: OnSiteComplaintBasicInfoFieldsProps) => {
    const { touched, errors, values } = props;
    const { setFieldValue } = useFormikContext<FormFieldsName>();
    const addressTextareaRef = useRef<HTMLTextAreaElement>(null);

    // Ensure phoneNumbers is always an array
    const phoneNumbers = values.phoneNumbers || [];

    // Handle Enter key for navigation
    const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, nextFieldName?: string) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (nextFieldName) {
                const nextField = document.querySelector(`[name="${nextFieldName}"]`) as HTMLElement;
                nextField?.focus();
            }
        }
    };

    // Auto-resize textarea
    useEffect(() => {
        if (addressTextareaRef.current) {
            addressTextareaRef.current.style.height = 'auto';
            addressTextareaRef.current.style.height = `${addressTextareaRef.current.scrollHeight}px`;
        }
    }, [values.customerAddress]);

    return (
        <AdaptableCard divider className="mb-4">
            <h5>Basic Information</h5>
            <p className="mb-6">Section to configure basic complaint details</p>

            <FormItem
                label="Customer Name"
                invalid={!!errors.customerName && touched.customerName}
                errorMessage={errors.customerName}
            >
                <Field
                    type="text"
                    autoComplete="off"
                    name="customerName"
                    placeholder="Customer Name"
                    component={Input}
                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => handleInputKeyDown(e, 'customerAddress')}
                />
            </FormItem>

            <FormItem
                label="Customer Address"
                invalid={!!errors.customerAddress && touched.customerAddress}
                errorMessage={errors.customerAddress}
            >
                <Field
                    as="textarea"
                    name="customerAddress"
                    placeholder="Customer Address"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 dark:bg-[#1f2937] dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                    rows={1}
                    innerRef={addressTextareaRef}
                    style={{ overflow: 'hidden', resize: 'none' }}
                />
            </FormItem>

            <FormItem
                label="Complaint Number"
                invalid={!!errors.complaintNumber && touched.complaintNumber}
                errorMessage={errors.complaintNumber}
            >
                <Field
                    type="text"
                    autoComplete="off"
                    name="complaintNumber"
                    placeholder="Complaint Number"
                    component={Input}
                />
            </FormItem>

            <FormItem
                label="Phone Numbers"
                invalid={!!errors.phoneNumbers && touched.phoneNumbers}
                // errorMessage={errors.phoneNumbers}
            >
                {phoneNumbers.map((phone, index) => (
                    <Field
                        key={index}
                        type="text"
                        autoComplete="off"
                        name={`phoneNumbers[${index}]`}
                        placeholder={`Phone Number ${index + 1}`}
                        component={Input}
                        className="mb-2"
                    />
                ))}
                <Button
                    size="sm"
                    type="button"
                    onClick={() => setFieldValue('phoneNumbers', [...phoneNumbers, ''])}
                >
                    Add Phone Number
                </Button>
            </FormItem>
        </AdaptableCard>
    );
};

export default OnSiteComplaintBasicInfoFields;