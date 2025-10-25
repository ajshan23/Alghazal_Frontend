// src/views/QuotationForm/components/QuotationForm.tsx
import { forwardRef, useState, useEffect } from 'react';
import { FormContainer } from '@/components/ui/Form';
import Button from '@/components/ui/Button';
import StickyFooter from '@/components/shared/StickyFooter';
import { Form, Formik, FormikProps } from 'formik';
import * as Yup from 'yup';
import toast from '@/components/ui/toast';
import Notification from '@/components/ui/Notification';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import AdaptableCard from '@/components/shared/AdaptableCard';
import Input from '@/components/ui/Input';
import { FormItem } from '@/components/ui/Form';
import { Field, FieldArray } from 'formik';
import { HiOutlineTrash, HiOutlinePlus } from 'react-icons/hi';
import DatePicker from '@/components/ui/DatePicker';
import Select from '@/components/ui/Select';
import { createQuotation, getQuotationByProject, updateQuotation } from '../api/api';
import { APP_PREFIX_PATH } from '@/constants/route.constant';

const measurementUnits = [
    { value: 'nos', label: 'Numbers (NOS)' },
    { value: 'ls', label: 'Lumpsum (LS)' },
    { value: 'pcs', label: 'Pieces (pcs)' },
    { value: 'box', label: 'Box (box)' },
    { value: 'kg', label: 'Kilogram (kg)' },
    { value: 'l', label: 'Liter (L)' },
    { value: 'm', label: 'Meter (m)' },
    { value: 'sq_m', label: 'Square Meter (m²)' },
    { value: 'sq_ft', label: 'Square Foot (ft²)' },
];

const termsCategories = [
    { value: 'The work will be started after receiving the PO', label: 'The work will be started after receiving the PO' },
    { value: 'The work will be started after the confirmation of client', label: 'The work will be started after receiving the PO' },
];

const termsTypes = [
    { value: 'The payment as per accounting terms 90 days', label: 'The payment as per accounting terms 90 days' },
    { value: 'The payment as per accounting terms 60 days', label: 'The payment as per accounting terms 60 days' },
    { value: 'The payment as per accounting terms 30 days', label: 'The payment as per accounting terms 30 days' },
    { value: '50% advance and 50% after completion of work', label: '50% advance and 50% after completion of work' },
    { value: '50% advance before starting the work and 30% work on progress and 20% after completion of work', label: '50% advance before starting the work and 30% work on progress and 20% after completion of work' },
    { value: 'Cash on delivery', label: 'Cash on delivery' },
];

interface IQuotationItem {
    description: string;
    uom: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
}

interface InitialData {
    _id?: string;
    quotationNumber?: string;
    date: Date;
    validUntil: Date;
    items: IQuotationItem[];
    termsAndConditions: string[];
    vatPercentage: number;
    subtotal: number;
    vatAmount: number;
    netAmount: number;
    project?: string;
    estimation?: string;
}

export type QuotationFormModel = InitialData;

type FormikRef = FormikProps<QuotationFormModel>;

type QuotationFormProps = {
    onDiscard?: () => void;
};

// Add the missing validationSchema here
const validationSchema = Yup.object().shape({
    validUntil: Yup.date().required('Valid Until date is required'),
    items: Yup.array()
        .of(
            Yup.object().shape({
                description: Yup.string().required('Description is required'),
                uom: Yup.string().required('Unit of measurement is required'),
                quantity: Yup.number()
                    .required('Quantity is required')
                    .min(0, 'Quantity must be positive'),
                unitPrice: Yup.number()
                    .required('Unit price is required')
                    .min(0, 'Unit price must be positive'),
            })
        )
        .min(1, 'At least one item is required'),
    termsAndConditions: Yup.array()
        .of(Yup.string().required('Term cannot be empty'))
        .min(1, 'At least one term is required'),
    vatPercentage: Yup.number()
        .min(0, 'VAT percentage cannot be negative')
        .max(100, 'VAT percentage cannot exceed 100'),
});

const QuotationForm = forwardRef<FormikRef, QuotationFormProps>((props, ref) => {
    const { onDiscard } = props;
    const navigate = useNavigate();
    const { projectId, quotationId } = useParams();
    const { state } = useLocation();
    
    const estimationId = state?.estimationId;

    const [initialValues, setInitialValues] = useState<QuotationFormModel>({
        quotationNumber: '',
        date: new Date(),
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        items: [
            { description: '', uom: '', quantity: 0, unitPrice: 0, totalPrice: 0 },
        ],
        termsAndConditions: [''],
        vatPercentage: 5,
        subtotal: 0,
        vatAmount: 0,
        netAmount: 0,
        project: projectId,
        estimation: estimationId,
    });

    const [isLoading, setIsLoading] = useState(!!quotationId);

    useEffect(() => {
        const fetchQuotationData = async () => {
            if (quotationId && projectId) {
                try {
                    setIsLoading(true);
                    console.log('Fetching quotation data for:', { quotationId, projectId });
                    
                    const response = await getQuotationByProject(projectId);
                    const quotation = response.data;
                    
                    if (quotation._id === quotationId) {
                        setInitialValues({
                            _id: quotation._id,
                            quotationNumber: quotation.quotationNumber,
                            date: new Date(quotation.date),
                            validUntil: new Date(quotation.validUntil),
                            items: quotation.items.map(item => ({
                                description: item.description,
                                uom: item.uom,
                                quantity: item.quantity,
                                unitPrice: item.unitPrice,
                                totalPrice: item.totalPrice,
                            })),
                            termsAndConditions: quotation.termsAndConditions.length > 0 
                                ? quotation.termsAndConditions 
                                : [''],
                            vatPercentage: quotation.vatPercentage,
                            subtotal: quotation.subtotal,
                            vatAmount: quotation.vatAmount,
                            netAmount: quotation.netAmount,
                            project: quotation.project?._id || projectId,
                            estimation: quotation.estimation?._id || estimationId,
                        });
                    } else {
                        throw new Error('Quotation ID mismatch');
                    }
                } catch (error) {
                    console.error('Error fetching quotation:', error);
                    toast.push(
                        <Notification title="Error" type="danger" duration={2500}>
                            Failed to load quotation data
                        </Notification>,
                        { placement: 'top-center' }
                    );
                    navigate(-1);
                } finally {
                    setIsLoading(false);
                }
            }
        };

        fetchQuotationData();
    }, [quotationId, projectId, estimationId, navigate]);

    const handleFormSubmit = async (values: QuotationFormModel) => {
        try {
            const quotationData = {
                project: values.project!,
                estimation: values.estimation!,
                validUntil: values.validUntil,
                scopeOfWork: [],
                termsAndConditions: values.termsAndConditions,
                items: values.items,
                vatPercentage: values.vatPercentage,
            };

            if (quotationId) {
                await updateQuotation(quotationId, quotationData);
                toast.push(
                    <Notification title="Success" type="success" duration={2500}>
                        Quotation updated successfully.
                    </Notification>,
                    { placement: 'top-center' }
                );
            } else {
                await createQuotation(quotationData);
                toast.push(
                    <Notification title="Success" type="success" duration={2500}>
                        Quotation created successfully.
                    </Notification>,
                    { placement: 'top-center' }
                );
            }
            navigate(-1);
        } catch (error: any) {
            console.error(`Error ${quotationId ? 'updating' : 'creating'} quotation:`, error);
            toast.push(
                <Notification title="Error" type="danger" duration={2500}>
                    {error.response?.data?.message || `Failed to ${quotationId ? 'update' : 'create'} quotation. Please try again.`}
                </Notification>,
                { placement: 'top-center' }
            );
        }
    };

    const formTitle = quotationId ? 'Edit Quotation' : 'Create Quotation';
    const submitButtonText = quotationId ? 'Update Quotation' : 'Create Quotation';

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{formTitle}</h2>
                <p className="text-gray-600 dark:text-gray-400">
                    {quotationId ? 'Edit existing quotation' : 'Create a new quotation'}
                </p>
            </div>
            
            <Formik
                innerRef={ref}
                initialValues={initialValues}
                validationSchema={validationSchema} // This now exists
                onSubmit={handleFormSubmit}
                enableReinitialize
            >
                {({ values, touched, errors, isSubmitting, setFieldValue }) => {
                    useEffect(() => {
                        values.items.forEach((item, index) => {
                            const totalPrice = parseFloat((item.quantity * item.unitPrice).toFixed(2));
                            if (item.totalPrice !== totalPrice) {
                                setFieldValue(`items[${index}].totalPrice`, totalPrice);
                            }
                        });

                        const subtotal = values.items.reduce((sum, item) => sum + item.totalPrice, 0);
                        if (values.subtotal !== subtotal) {
                            setFieldValue('subtotal', subtotal);
                        }

                        const vatAmount = parseFloat((subtotal * (values.vatPercentage / 100)).toFixed(2));
                        const netAmount = parseFloat((subtotal + vatAmount).toFixed(2));
                        
                        if (values.vatAmount !== vatAmount) {
                            setFieldValue('vatAmount', vatAmount);
                        }
                        if (values.netAmount !== netAmount) {
                            setFieldValue('netAmount', netAmount);
                        }
                    }, [values.items, values.vatPercentage]);

                    return (
                        <Form>
                            <FormContainer>
                                <AdaptableCard divider className="mb-6">
                                    <h5 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Quotation Details</h5>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <FormItem 
                                            label="Quotation Number"
                                            className="mb-0"
                                        >
                                            <Input 
                                                readOnly 
                                                value={values.quotationNumber || 'Auto-generated'}
                                                placeholder="Auto-generated"
                                            />
                                        </FormItem>
                                        <FormItem 
                                            label="Date"
                                            className="mb-0"
                                        >
                                            <DatePicker
                                                placeholder="Select date"
                                                value={values.date}
                                                onChange={(date) => {
                                                    setFieldValue('date', date);
                                                }}
                                                inputClass="h-11"
                                            />
                                        </FormItem>
                                        <FormItem
                                            label="Valid Until *"
                                            invalid={!!errors.validUntil && touched.validUntil}
                                            errorMessage={errors.validUntil as string}
                                            className="mb-0"
                                        >
                                            <DatePicker
                                                placeholder="Select date"
                                                value={values.validUntil}
                                                onChange={(date) => {
                                                    setFieldValue('validUntil', date);
                                                }}
                                                inputClass="h-11"
                                            />
                                        </FormItem>
                                    </div>
                                </AdaptableCard>

                                {/* Rest of your form content remains the same */}
                                <AdaptableCard divider className="mb-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <h5 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Quotation Items</h5>
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="twoTone"
                                            icon={<HiOutlinePlus />}
                                            onClick={() => {
                                                setFieldValue('items', [
                                                    ...values.items,
                                                    { description: '', uom: '', quantity: 0, unitPrice: 0, totalPrice: 0 }
                                                ]);
                                            }}
                                        >
                                            Add Item
                                        </Button>
                                    </div>
                                    
                                    <FieldArray name="items">
                                        {({ remove }) => (
                                            <div className="space-y-4">
                                                {values.items.map((item, index) => (
                                                    <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                                        <div className="md:col-span-4">
                                                            <FormItem
                                                                label={`Item ${index + 1}`}
                                                                invalid={!!errors.items?.[index]?.description && touched.items?.[index]?.description}
                                                                errorMessage={errors.items?.[index]?.description}
                                                                className="mb-0"
                                                            >
                                                                <Field
                                                                    as={Input}
                                                                    name={`items[${index}].description`}
                                                                    placeholder="Description"
                                                                    value={item.description}
                                                                    textArea
                                                                    rows={2}
                                                                />
                                                            </FormItem>
                                                        </div>

                                                        <div className="md:col-span-2">
                                                            <FormItem
                                                                label="UOM"
                                                                invalid={!!errors.items?.[index]?.uom && touched.items?.[index]?.uom}
                                                                errorMessage={errors.items?.[index]?.uom}
                                                                className="mb-0"
                                                            >
                                                                <Field name={`items[${index}].uom`}>
                                                                    {({ field }: any) => (
                                                                        <Select
                                                                            options={measurementUnits}
                                                                            value={measurementUnits.find(option => option.value === field.value) || null}
                                                                            onChange={(option: any) => {
                                                                                setFieldValue(`items[${index}].uom`, option?.value || '');
                                                                            }}
                                                                            placeholder="Select unit"
                                                                        />
                                                                    )}
                                                                </Field>
                                                            </FormItem>
                                                        </div>

                                                        <div className="md:col-span-1">
                                                            <FormItem
                                                                label="Qty"
                                                                invalid={!!errors.items?.[index]?.quantity && touched.items?.[index]?.quantity}
                                                                errorMessage={errors.items?.[index]?.quantity}
                                                                className="mb-0"
                                                            >
                                                                <Field
                                                                    type="number"
                                                                    name={`items[${index}].quantity`}
                                                                    placeholder="Quantity"
                                                                    component={Input}
                                                                    min={0}
                                                                    step="any"
                                                                    value={item.quantity || ''}
                                                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                                        const value = parseFloat(e.target.value) || 0;
                                                                        setFieldValue(`items[${index}].quantity`, value);
                                                                    }}
                                                                />
                                                            </FormItem>
                                                        </div>

                                                        <div className="md:col-span-2">
                                                            <FormItem
                                                                label="Unit Price"
                                                                invalid={!!errors.items?.[index]?.unitPrice && touched.items?.[index]?.unitPrice}
                                                                errorMessage={errors.items?.[index]?.unitPrice}
                                                                className="mb-0"
                                                            >
                                                                <Field
                                                                    type="number"
                                                                    name={`items[${index}].unitPrice`}
                                                                    placeholder="Unit price"
                                                                    component={Input}
                                                                    min={0}
                                                                    value={item.unitPrice || ''}
                                                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                                        const value = parseFloat(e.target.value) || 0;
                                                                        setFieldValue(`items[${index}].unitPrice`, value);
                                                                    }}
                                                                />
                                                            </FormItem>
                                                        </div>

                                                        <div className="md:col-span-2">
                                                            <FormItem 
                                                                label="Total"
                                                                className="mb-0"
                                                            >
                                                                <Input
                                                                    readOnly
                                                                    value={(item.quantity * item.unitPrice).toFixed(2)}
                                                                    placeholder="Total"
                                                                    className="font-semibold"
                                                                />
                                                            </FormItem>
                                                        </div>

                                                        <div className="md:col-span-1">
                                                            <Button
                                                                type="button"
                                                                size="sm"
                                                                variant="plain"
                                                                color="red"
                                                                icon={<HiOutlineTrash />}
                                                                onClick={() => remove(index)}
                                                            />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </FieldArray>
                                </AdaptableCard>

                                {/* Terms & Conditions Section */}
                                <AdaptableCard divider className="mb-6">
                                    <h5 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Terms & Conditions</h5>
                                    <FieldArray name="termsAndConditions">
                                        {({ push, remove }) => (
                                            <div className="space-y-4">
                                                {values.termsAndConditions.map((term, index) => (
                                                    <div key={index} className="flex items-start gap-4">
                                                        <FormItem
                                                            className="flex-grow mb-0"
                                                            invalid={!!errors.termsAndConditions?.[index] && touched.termsAndConditions?.[index]}
                                                            errorMessage={errors.termsAndConditions?.[index] as string}
                                                        >
                                                            {index < 2 ? (
                                                                <Field name={`termsAndConditions[${index}]`}>
                                                                    {({ field }: any) => (
                                                                        <Select
                                                                            options={index === 0 ? termsCategories : termsTypes}
                                                                            value={(index === 0 ? termsCategories : termsTypes)
                                                                                .find(option => option.value === field.value) || null}
                                                                            onChange={(option: any) => {
                                                                                setFieldValue(`termsAndConditions[${index}]`, option?.value || '');
                                                                            }}
                                                                            placeholder={index === 0 ? 'Select work start term' : 'Select payment term'}
                                                                        />
                                                                    )}
                                                                </Field>
                                                            ) : (
                                                                <div className="flex gap-2">
                                                                    <Field
                                                                        as={Input}
                                                                        name={`termsAndConditions[${index}]`}
                                                                        placeholder="Additional term or condition"
                                                                        value={term}
                                                                    />
                                                                    <Button
                                                                        type="button"
                                                                        size="sm"
                                                                        variant="plain"
                                                                        color="red"
                                                                        icon={<HiOutlineTrash />}
                                                                        onClick={() => remove(index)}
                                                                        className="mt-2"
                                                                    />
                                                                </div>
                                                            )}
                                                        </FormItem>
                                                        {index < 2 && (
                                                            <Button
                                                                type="button"
                                                                size="sm"
                                                                variant="plain"
                                                                color="red"
                                                                icon={<HiOutlineTrash />}
                                                                onClick={() => remove(index)}
                                                                className="mt-2"
                                                            />
                                                        )}
                                                    </div>
                                                ))}
                                                <div className="flex justify-center mt-4">
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        variant="twoTone"
                                                        icon={<HiOutlinePlus />}
                                                        onClick={() => push('')}
                                                    >
                                                        Add Term
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </FieldArray>
                                </AdaptableCard>

                                {/* Financial Summary Section */}
                                <AdaptableCard divider className="mb-6">
                                    <h5 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Financial Summary</h5>
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                        <FormItem label="Subtotal" className="mb-0">
                                            <Input
                                                readOnly
                                                value={values.subtotal.toFixed(2)}
                                                placeholder="Subtotal"
                                                className="font-semibold"
                                            />
                                        </FormItem>
                                        <FormItem
                                            label="VAT Percentage"
                                            invalid={!!errors.vatPercentage && touched.vatPercentage}
                                            errorMessage={errors.vatPercentage as string}
                                            className="mb-0"
                                        >
                                            <div className="flex items-center">
                                                <Field
                                                    as={Input}
                                                    type="number"
                                                    name="vatPercentage"
                                                    placeholder="VAT percentage"
                                                    min={0}
                                                    max={100}
                                                    value={values.vatPercentage}
                                                    className="flex-grow"
                                                />
                                                <span className="ml-2 text-gray-500">%</span>
                                            </div>
                                        </FormItem>
                                        <FormItem label="VAT Amount" className="mb-0">
                                            <Input
                                                readOnly
                                                value={values.vatAmount.toFixed(2)}
                                                placeholder="VAT amount"
                                                className="font-semibold"
                                            />
                                        </FormItem>
                                        <FormItem label="Net Amount" className="mb-0">
                                            <Input
                                                readOnly
                                                value={values.netAmount.toFixed(2)}
                                                placeholder="Net amount"
                                                className="font-semibold text-blue-600 dark:text-blue-400"
                                            />
                                        </FormItem>
                                    </div>
                                </AdaptableCard>

                                <StickyFooter
                                    className="-mx-8 px-8 flex items-center justify-between py-4"
                                    stickyClass="border-t bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                                >
                                    <div>
                                        <Button
                                            size="sm"
                                            className="ltr:mr-3 rtl:ml-3"
                                            type="button"
                                            onClick={onDiscard}
                                        >
                                            Discard
                                        </Button>
                                    </div>
                                    <div className='md:flex grid-2 gap-2'>
                                        <Button
                                            size="sm"
                                            variant="solid"
                                            loading={isSubmitting}
                                            type="submit"
                                        >
                                            {submitButtonText}
                                        </Button>
                                    </div>
                                </StickyFooter>
                            </FormContainer>
                        </Form>
                    );
                }}
            </Formik>
        </div>
    );
});

QuotationForm.displayName = 'QuotationForm';

export default QuotationForm;