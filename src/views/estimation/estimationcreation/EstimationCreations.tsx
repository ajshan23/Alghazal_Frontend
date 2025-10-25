import React, { forwardRef, useState, useEffect } from 'react';
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
import { HiOutlineTrash, HiOutlinePlus, HiOutlineDocumentText } from 'react-icons/hi';
import DatePicker from '@/components/ui/DatePicker';
import Select from '@/components/ui/Select';
import { createEstimation, fetchEstimation, editEstimation } from '../api/api';
import { Card } from '@/components/ui';
import { NumericFormat } from 'react-number-format';

type FormikRef = FormikProps<any>;

interface IMaterialItem {
  description: string;
  uom: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface ILabourItem {
  designation: string;
  days: number;
  price: number;
  total: number;
}

interface ITermsItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface InitialData {
  _id?: string;
  dateOfEstimation: Date;
  workStartDate: Date;
  workEndDate: Date;
  validUntil: Date;
  paymentDueBy: number;
  status: string;
  estimationNumber?: string;
  materials: IMaterialItem[];
  labourCharges: ILabourItem[];
  termsAndConditions: ITermsItem[];
  estimatedAmount: number;
  quotationAmount?: number;
  commissionAmount?: number;
  profit?: number;
  project?: string;
  subject?: string;
}

export type FormModel = InitialData;

type EstimationFormProps = {
  onDiscard?: () => void;
};

const validationSchema = Yup.object().shape({
  dateOfEstimation: Yup.date().required('Estimation Date is required'),
  workStartDate: Yup.date()
    .required('Work Start Date is required'),
  workEndDate: Yup.date()
    .required('Work End Date is required'),
  validUntil: Yup.date()
    .required('Valid Until Date is required'),
    
  paymentDueBy: Yup.string().required('Payment Due is required'),
  status: Yup.string().required('Status is required'),
  subject: Yup.string().required('Subject is required'),
  materials: Yup.array().of(
    Yup.object().shape({
      description: Yup.string().required('Material name is required'),
      uom: Yup.string().required('Unit of measurement is required'),
      quantity: Yup.number()
        .required('Quantity is required')
        .min(0, 'Quantity must be positive')
        .typeError('Quantity must be a number'),
      unitPrice: Yup.number()
        .required('Unit price is required')
        .min(0, 'Unit price must be positive')
        .typeError('Unit price must be a number'),
    })
  ),
  labourCharges: Yup.array().of(
    Yup.object().shape({
      designation: Yup.string().required('Designation is required'),
      days: Yup.number()
        .required('Days is required')
        .min(0, 'Days must be positive')
        .typeError('Days must be a number'),
      price: Yup.number()
        .required('Price is required')
        .min(0, 'Price must be positive')
        .typeError('Price must be a number'),
    })
  ),
  termsAndConditions: Yup.array().of(
    Yup.object().shape({
      description: Yup.string().required('Description is required'),
      quantity: Yup.number()
        .required('Quantity is required')
        .min(0, 'Quantity must be positive')
        .typeError('Quantity must be a number'),
      unitPrice: Yup.number()
        .required('Unit price is required')
        .min(0, 'Unit price must be positive')
        .typeError('Unit price must be a number'),
    })
  ),
});

const measurementUnits = [
  // Count/Other
  { value: 'nos', label: 'Numbers (NOS)' },
  { value: 'ls', label: 'Lumpsum (LS)' },
  { value: 'pcs', label: 'Pieces (pcs)' },
  { value: 'box', label: 'Box (box)' },
  { value: 'dozen', label: 'Dozen (dozen)' },
  { value: 'pack', label: 'Pack (pack)' },

  // Mass
  { value: 'kg', label: 'Kilogram (kg)' },
  { value: 'g', label: 'Gram (g)' },
  { value: 'mg', label: 'Milligram (mg)' },
  { value: 'lb', label: 'Pound (lb)' },
  { value: 'oz', label: 'Ounce (oz)' },
  { value: 'ton', label: 'Ton (ton)' },

  // Volume
  { value: 'l', label: 'Liter (L)' },
  { value: 'ml', label: 'Milliliter (mL)' },
  { value: 'gal', label: 'Gallon (gal)' },
  { value: 'pt', label: 'Pint (pt)' },
  { value: 'qt', label: 'Quart (qt)' },
  { value: 'fl_oz', label: 'Fluid Ounce (fl oz)' },

  // Length
  { value: 'm', label: 'Meter (m)' },
  { value: 'cm', label: 'Centimeter (cm)' },
  { value: 'mm', label: 'Millimeter (mm)' },
  { value: 'in', label: 'Inch (in)' },
  { value: 'ft', label: 'Foot (ft)' },
  { value: 'yd', label: 'Yard (yd)' },
  
  { value: 'sq_m', label: 'Square Meter (m²)' },
  { value: 'sq_cm', label: 'Square Centimeter (cm²)' },
  { value: 'sq_mm', label: 'Square Millimeter (mm²)' },
  { value: 'sq_km', label: 'Square Kilometer (km²)' },
  { value: 'sq_in', label: 'Square Inch (in²)' },
  { value: 'sq_ft', label: 'Square Foot (ft²)' },
  { value: 'sq_yd', label: 'Square Yard (yd²)' },
  { value: 'acre', label: 'Acre' },
  { value: 'hectare', label: 'Hectare (ha)' },
];

const EstimationForm = forwardRef<FormikRef, EstimationFormProps>((props, ref) => {
  const { onDiscard } = props;
  const navigate = useNavigate();
  const paramsData = useParams();
  const { state } = useLocation();

  const { projectId, estimationId } = paramsData;

  const [initialValues, setInitialValues] = useState<FormModel>({
    dateOfEstimation: new Date(),
    workStartDate: new Date(),
    workEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    paymentDueBy: '',
    status: 'Draft',
    materials: [
      { description: '', uom: '', quantity: 0.0, unitPrice: 0.0, total: 0.0 },
    ],
    labourCharges: [
      { designation: '', days: 0.0, price: 0.0, total: 0.0 },
    ],
    termsAndConditions: [
      { description: '', quantity: 0.0, unitPrice: 0.0, total: 0.0 },
    ],
    estimatedAmount: 0.0,
    quotationAmount: 0.0,
    subject: "",
  });

  const [isLoading, setIsLoading] = useState(!!estimationId);

  useEffect(() => {
    const fetchEstimationData = async () => {
      if (estimationId) {
        try {
          const response = await fetchEstimation(estimationId);
          const estimation = response.data;

          setInitialValues({
            dateOfEstimation: new Date(estimation.createdAt),
            workStartDate: new Date(estimation.workStartDate),
            workEndDate: new Date(estimation.workEndDate),
            validUntil: new Date(estimation.validUntil),
            paymentDueBy: estimation.paymentDueBy.toString(),
            status: estimation.status || 'Draft',
            materials: estimation.materials.map(m => ({
              description: m.description,
              uom: m.uom,
              quantity: m.quantity,
              unitPrice: m.unitPrice,
              total: m.total,
            })),
            labourCharges: estimation.labour.map(l => ({
              designation: l.designation,
              days: l.days,
              price: l.price,
              total: l.total,
            })),
            termsAndConditions: estimation.termsAndConditions.map(t => ({
              description: t.description,
              quantity: t.quantity,
              unitPrice: t.unitPrice,
              total: t.total,
            })),
            estimatedAmount: estimation.estimatedAmount,
            quotationAmount: estimation.quotationAmount || 0.0,
            commissionAmount: estimation.commissionAmount,
            profit: estimation.profit,
            project: estimation.project._id,
            subject: estimation?.subject
          });
        } catch (error) {
          console.error('Error fetching estimation:', error);
          toast.push(
            <Notification title="Error" type="danger" duration={2500}>
              Failed to load estimation data.
            </Notification>,
            { placement: 'top-center' }
          );
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchEstimationData();
  }, [estimationId]);

  const handleFormSubmit = async (values: FormModel) => {
    try {
      // Prepare the data for API
      const estimationData = {
        project: values.project || projectId,
        workStartDate: values.workStartDate,
        workEndDate: values.workEndDate,
        validUntil: values.validUntil,
        paymentDueBy: Number(values.paymentDueBy),
        materials: values.materials,
        labour: values.labourCharges,
        termsAndConditions: values.termsAndConditions,
        commissionAmount: values.commissionAmount || 0,
        quotationAmount: values.quotationAmount || 0,
        subject: values.subject
      };

      console.log('Submitting estimation data:', estimationData);

      if (estimationId) {
        // Edit existing estimation
        await editEstimation(estimationId, estimationData);

        toast.push(
          <Notification
            title={`Estimation Updated`}
            type="success"
            duration={2500}
          >
            Estimation updated successfully.
          </Notification>,
          { placement: 'top-center' }
        );
      } else {
        // Create new estimation
        await createEstimation(estimationData);

        toast.push(
          <Notification
            title={`Estimation Created`}
            type="success"
            duration={2500}
          >
            Estimation created successfully.
          </Notification>,
          { placement: 'top-center' }
        );
      }

      navigate(-1);
    } catch (error: any) {
      console.error(`Error ${estimationId ? 'updating' : 'creating'} estimation:`, error);
      
      let errorMessage = `Failed to ${estimationId ? 'update' : 'create'} estimation. Please try again.`;
      
      if (error?.status === 400) {
        errorMessage = estimationId 
          ? 'Failed to update estimation. Please check your data.' 
          : 'Only one estimation is allowed per project.';
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      toast.push(
        <Notification title="Error" type="danger" duration={2500}>
          {errorMessage}
        </Notification>,
        { placement: 'top-center' }
      );
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-850 dark:to-gray-900">
      <div className="container mx-auto p-6">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg">
              <HiOutlineDocumentText className="text-2xl text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
              {estimationId ? 'Edit Estimation' : 'Create Estimation'}
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            {estimationId 
              ? 'Update the estimation details for this project' 
              : 'Create a new estimation for your project'
            }
          </p>
        </div>

        <Formik
          innerRef={ref}
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleFormSubmit}
          enableReinitialize
        >
          {({ values, touched, errors, isSubmitting, setFieldValue, handleChange }) => {
            // Calculate totals whenever values change
            useEffect(() => {
              // Calculate materials totals
              values.materials.forEach((material, index) => {
                const total = parseFloat((material.quantity * material.unitPrice).toFixed(2));
                if (material.total !== total) {
                  setFieldValue(`materials[${index}].total`, total);
                }
              });
              // Calculate labour totals
              values.labourCharges.forEach((labour, index) => {
                const total = parseFloat((labour.days * labour.price).toFixed(2));
                if (labour.total !== total) {
                  setFieldValue(`labourCharges[${index}].total`, total);
                }
              });

              // Calculate terms totals
              values.termsAndConditions.forEach((term, index) => {
                const total = parseFloat((term.quantity * term.unitPrice).toFixed(2));
                if (term.total !== total) {
                  setFieldValue(`termsAndConditions[${index}].total`, total);
                }
              });

              // Calculate estimated amount
              const materialsTotal = values.materials.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
              const labourTotal = values.labourCharges.reduce((sum, item) => sum + (item.days * item.price), 0);
              const termsTotal = values.termsAndConditions.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
              const estimatedAmount = parseFloat((materialsTotal + labourTotal + termsTotal).toFixed(2));

              if (values.estimatedAmount !== estimatedAmount) {
                setFieldValue('estimatedAmount', estimatedAmount);
              }

              // Calculate profit if quotation and commission amounts exist
              if (values.quotationAmount !== undefined && values.commissionAmount !== undefined) {
                const profit = parseFloat((values.quotationAmount - estimatedAmount - values.commissionAmount).toFixed(2));
                if (values.profit !== profit) {
                  setFieldValue('profit', profit);
                }
              }
            }, [values.materials, values.labourCharges, values.termsAndConditions, values.quotationAmount, values.commissionAmount]);

            const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
              handleChange(e);
              const { name, value } = e.target;
              setFieldValue(name, parseFloat(value) || 0);
            };

            return (
              <Form>
                <FormContainer>
                  <Card className="mb-6 bg-gradient-to-br from-white via-gray-50 to-white dark:from-gray-800 dark:via-gray-850 dark:to-gray-900 border-2 border-blue-200 dark:border-blue-800">
                    <div className="p-6">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg">
                          <HiOutlineDocumentText className="text-2xl text-white" />
                        </div>
                        <h5 className="text-xl font-bold text-gray-800 dark:text-white">Work Details</h5>
                      </div>
                      <p className="mb-6 text-gray-600 dark:text-gray-400">Section to configure client and work information</p>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <FormItem
                          label="Work Start Date *"
                          invalid={!!errors.workStartDate && touched.workStartDate}
                          errorMessage={errors.workStartDate as string}
                        >
                          <Field name="workStartDate">
                            {({ field, form }: any) => (
                              <DatePicker
                                placeholder="Select date"
                                value={field.value}
                                onChange={(date) => {
                                  form.setFieldValue(field.name, date);
                                }}
                                minDate={values.dateOfEstimation}
                              />
                            )}
                          </Field>
                        </FormItem>

                        <FormItem
                          label="Work End Date *"
                          invalid={!!errors.workEndDate && touched.workEndDate}
                          errorMessage={errors.workEndDate as string}
                        >
                          <Field name="workEndDate">
                            {({ field, form }: any) => (
                              <DatePicker
                                placeholder="Select date"
                                value={field.value}
                                onChange={(date) => {
                                  form.setFieldValue(field.name, date);
                                }}
                                minDate={values.workStartDate}
                              />
                            )}
                          </Field>
                        </FormItem>

                        <FormItem
                          label="Valid Until *"
                          invalid={!!errors.validUntil && touched.validUntil}
                          errorMessage={errors.validUntil as string}
                        >
                          <Field name="validUntil">
                            {({ field, form }: any) => (
                              <DatePicker
                                placeholder="Select date"
                                value={field.value}
                                onChange={(date) => {
                                  form.setFieldValue(field.name, date);
                                }}
                                minDate={values.dateOfEstimation}
                              />
                            )}
                          </Field>
                        </FormItem>

                        <FormItem
                          label="Payment Due By *"
                          invalid={!!errors.paymentDueBy && touched.paymentDueBy}
                          errorMessage={errors.paymentDueBy as string}
                        >
                          <Field
                            type="number"
                            name="paymentDueBy"
                            placeholder="Payment Due By"
                            component={Input}
                          />
                        </FormItem>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <FormItem 
                          label="Subject *"
                          invalid={!!errors.subject && touched.subject}
                          errorMessage={errors.subject as string}
                        >
                          <Field
                            type="text"
                            name="subject"
                            value={values.subject}
                            placeholder="Subject"
                            textArea={true}
                            component={Input}
                          />
                        </FormItem>
                      </div>
                    </div>
                  </Card>

                  <Card className="mb-6 bg-gradient-to-br from-white via-gray-50 to-white dark:from-gray-800 dark:via-gray-850 dark:to-gray-900 border-2 border-purple-200 dark:border-purple-800">
                    <div className="p-6">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg">
                          <HiOutlineDocumentText className="text-2xl text-white" />
                        </div>
                        <h5 className="text-xl font-bold text-gray-800 dark:text-white">Materials</h5>
                      </div>
                      <p className="mb-6 text-gray-600 dark:text-gray-400">List of materials required for the project</p>

                      <FieldArray name="materials">
                        {({ push, remove }) => (
                          <div className="space-y-4">
                            {values.materials.map((material, index) => (
                              <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end border-b pb-4 border-gray-200 dark:border-gray-700">
                                <FormItem
                                  label={`Material ${index + 1}`}
                                  invalid={!!errors.materials?.[index]?.description && touched.materials?.[index]?.description}
                                  errorMessage={errors.materials?.[index]?.description}
                                >
                                  <Field
                                    type="text"
                                    name={`materials[${index}].description`}
                                    placeholder="Material name"
                                    component={Input}
                                  />
                                </FormItem>
                                <FormItem
                                  label="UOM"
                                  invalid={!!errors.materials?.[index]?.uom && touched.materials?.[index]?.uom}
                                  errorMessage={errors.materials?.[index]?.uom}
                                >
                                  <Field name={`materials[${index}].uom`}>
                                    {({ field, form }: any) => (
                                      <Select
                                        options={measurementUnits}
                                        value={measurementUnits.find(option => option.value === field.value) || null}
                                        onChange={(option: any) => {
                                          form.setFieldValue(field.name, option?.value || '');
                                        }}
                                        placeholder="Select unit"
                                      />
                                    )}
                                  </Field>
                                </FormItem>

                                <FormItem
                                  label="Quantity"
                                  invalid={!!errors.materials?.[index]?.quantity && touched.materials?.[index]?.quantity}
                                  errorMessage={errors.materials?.[index]?.quantity}
                                >
                                  <Field
                                    type="number"
                                    name={`materials[${index}].quantity`}
                                    placeholder="Quantity"
                                    component={Input}
                                    min={0}
                                    step="0.01"
                                    onChange={handleFieldChange}
                                  />
                                </FormItem>

                                <FormItem
                                  label="Unit Price"
                                  invalid={!!errors.materials?.[index]?.unitPrice && touched.materials?.[index]?.unitPrice}
                                  errorMessage={errors.materials?.[index]?.unitPrice}
                                >
                                  <Field
                                    type="number"
                                    name={`materials[${index}].unitPrice`}
                                    placeholder="Unit price"
                                    component={Input}
                                    min={0}
                                    step="0.01"
                                    onChange={handleFieldChange}
                                  />
                                </FormItem>

                                <FormItem label="Total">
                                  <Input
                                    readOnly
                                    value={material.total}
                                    placeholder="Total"
                                  />
                                </FormItem>

                                <div className="flex justify-end">
                                  {values.materials.length > 1 && (
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
                              variant="solid"
                              icon={<HiOutlinePlus />}
                              onClick={() => push({ description: '', uom: '', quantity: 0.0, unitPrice: 0.0, total: 0.0 })}
                              className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white"
                            >
                              Add Material
                            </Button>
                          </div>
                        )}
                      </FieldArray>
                    </div>
                  </Card>

                  <Card className="mb-6 bg-gradient-to-br from-white via-gray-50 to-white dark:from-gray-800 dark:via-gray-850 dark:to-gray-900 border-2 border-green-200 dark:border-green-800">
                    <div className="p-6">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-gradient-to-r from-green-500 to-teal-600 rounded-lg">
                          <HiOutlineDocumentText className="text-2xl text-white" />
                        </div>
                        <h5 className="text-xl font-bold text-gray-800 dark:text-white">Labour Charges</h5>
                      </div>
                      <p className="mb-6 text-gray-600 dark:text-gray-400">List of labour charges for the project</p>

                      <FieldArray name="labourCharges">
                        {({ push, remove }) => (
                          <div className="space-y-4">
                            {values.labourCharges.map((labour, index) => (
                              <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end border-b pb-4 border-gray-200 dark:border-gray-700">
                                <FormItem
                                  label={`Designation ${index + 1}`}
                                  invalid={!!errors.labourCharges?.[index]?.designation && touched.labourCharges?.[index]?.designation}
                                  errorMessage={errors.labourCharges?.[index]?.designation}
                                >
                                  <Field
                                    type="text"
                                    name={`labourCharges[${index}].designation`}
                                    placeholder="Designation"
                                    component={Input}
                                  />
                                </FormItem>

                                <FormItem
                                  label="Days"
                                  invalid={!!errors.labourCharges?.[index]?.days && touched.labourCharges?.[index]?.days}
                                  errorMessage={errors.labourCharges?.[index]?.days}
                                >
                                  <Field
                                    type="number"
                                    name={`labourCharges[${index}].days`}
                                    placeholder="Days"
                                    component={Input}
                                    min={0}
                                    step="0.01"
                                    onChange={handleFieldChange}
                                  />
                                </FormItem>

                                <FormItem
                                  label="Price"
                                  invalid={!!errors.labourCharges?.[index]?.price && touched.labourCharges?.[index]?.price}
                                  errorMessage={errors.labourCharges?.[index]?.price}
                                >
                                  <Field
                                    type="number"
                                    name={`labourCharges[${index}].price`}
                                    placeholder="Price per day"
                                    component={Input}
                                    min={0}
                                    step="0.01"
                                    onChange={handleFieldChange}
                                  />
                                </FormItem>

                                <FormItem label="Total">
                                  <Input
                                    readOnly
                                    value={labour.total}
                                    placeholder="Total"
                                  />
                                </FormItem>

                                <div className="flex justify-end">
                                  {values.labourCharges.length > 1 && (
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
                              variant="solid"
                              icon={<HiOutlinePlus />}
                              onClick={() => push({ designation: '', days: 0.0, price: 0.0, total: 0.0 })}
                              className="bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white"
                            >
                              Add Labour Charge
                            </Button>
                          </div>
                        )}
                      </FieldArray>
                    </div>
                  </Card>

                  <Card className="mb-6 bg-gradient-to-br from-white via-gray-50 to-white dark:from-gray-800 dark:via-gray-850 dark:to-gray-900 border-2 border-orange-200 dark:border-orange-800">
                    <div className="p-6">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg">
                          <HiOutlineDocumentText className="text-2xl text-white" />
                        </div>
                        <h5 className="text-xl font-bold text-gray-800 dark:text-white">Terms & Conditions</h5>
                      </div>
                      <p className="mb-6 text-gray-600 dark:text-gray-400">Additional terms and conditions for the project</p>

                      <FieldArray name="termsAndConditions">
                        {({ push, remove }) => (
                          <div className="space-y-4">
                            {values.termsAndConditions.map((term, index) => (
                              <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end border-b pb-4 border-gray-200 dark:border-gray-700">
                                <FormItem
                                  label={`Description ${index + 1}`}
                                  invalid={!!errors.termsAndConditions?.[index]?.description && touched.termsAndConditions?.[index]?.description}
                                  errorMessage={errors.termsAndConditions?.[index]?.description}
                                >
                                  <Field
                                    type="text"
                                    name={`termsAndConditions[${index}].description`}
                                    placeholder="Description"
                                    component={Input}
                                  />
                                </FormItem>

                                <FormItem
                                  label="Quantity"
                                  invalid={!!errors.termsAndConditions?.[index]?.quantity && touched.termsAndConditions?.[index]?.quantity}
                                  errorMessage={errors.termsAndConditions?.[index]?.quantity}
                                >
                                  <Field
                                    type="number"
                                    name={`termsAndConditions[${index}].quantity`}
                                    placeholder="Quantity"
                                    component={Input}
                                    min={0}
                                    step="0.01"
                                    onChange={handleFieldChange}
                                  />
                                </FormItem>

                                <FormItem
                                  label="Unit Price"
                                  invalid={!!errors.termsAndConditions?.[index]?.unitPrice && touched.termsAndConditions?.[index]?.unitPrice}
                                  errorMessage={errors.termsAndConditions?.[index]?.unitPrice}
                                >
                                  <Field
                                    type="number"
                                    name={`termsAndConditions[${index}].unitPrice`}
                                    placeholder="Unit price"
                                    component={Input}
                                    min={0}
                                    step="0.01"
                                    onChange={handleFieldChange}
                                  />
                                </FormItem>

                                <FormItem label="Total">
                                  <Input
                                    readOnly
                                    value={term.total}
                                    placeholder="Total"
                                  />
                                </FormItem>

                                <div className="flex justify-end">
                                  {values.termsAndConditions.length > 1 && (
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
                              variant="solid"
                              icon={<HiOutlinePlus />}
                              onClick={() => push({ description: '', quantity: 0.0, unitPrice: 0.0, total: 0.0 })}
                              className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white"
                            >
                              Add Term
                            </Button>
                          </div>
                        )}
                      </FieldArray>
                    </div>
                  </Card>

                  <Card className="mb-6 bg-gradient-to-br from-white via-gray-50 to-white dark:from-gray-800 dark:via-gray-850 dark:to-gray-900 border-2 border-indigo-200 dark:border-indigo-800">
                    <div className="p-6">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-lg">
                          <HiOutlineDocumentText className="text-2xl text-white" />
                        </div>
                        <h5 className="text-xl font-bold text-gray-800 dark:text-white">Summary</h5>
                      </div>
                      <p className="mb-6 text-gray-600 dark:text-gray-400">Final amounts and approvals</p>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <FormItem label="Estimated Amount">
                          <div className="relative">
                            <NumericFormat
                              customInput={Input}
                              readOnly
                              name="estimatedAmount"
                              value={values.estimatedAmount}
                              placeholder="Estimated amount"
                              thousandSeparator={true}
                              // prefix="$"
                              decimalScale={2}
                            />
                          </div>
                        </FormItem>

                        <FormItem label="Quotation Amount (Optional)">
                          <div className="relative">
                            <NumericFormat
                              customInput={Input}
                              type="text"
                              name="quotationAmount"
                              placeholder="Quotation amount"
                              thousandSeparator={true}
                              // prefix="$"
                              decimalScale={2}
                              onValueChange={(values) => {
                                setFieldValue('quotationAmount', values.floatValue || 0);
                              }}
                              value={values.quotationAmount}
                            />
                          </div>
                        </FormItem>

                        <FormItem label="Commission Amount (Optional)">
                          <div className="relative">
                            <NumericFormat
                              customInput={Input}
                              type="text"
                              name="commissionAmount"
                              placeholder="Commission amount"
                              thousandSeparator={true}
                              prefix="$"
                              decimalScale={2}
                              onValueChange={(values) => {
                                setFieldValue('commissionAmount', values.floatValue || 0);
                              }}
                              value={values.commissionAmount}
                            />
                          </div>
                        </FormItem>

                        {values.quotationAmount !== undefined && values.commissionAmount !== undefined && (
                          <FormItem label="Profit">
                            <div className="relative">
                              <NumericFormat
                                customInput={Input}
                                readOnly
                                name="profit"
                                value={values.profit || 0}
                                placeholder="Profit"
                                thousandSeparator={true}
                                prefix="$"
                                decimalScale={2}
                              />
                            </div>
                          </FormItem>
                        )}
                      </div>
                    </div>
                  </Card>

                  <StickyFooter
                    className="-mx-8 px-8 flex items-center justify-between py-4 bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-800/50 dark:to-slate-800/50 border-t border-gray-200 dark:border-gray-700"
                    stickyClass="border-t bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                  >
                    <div>
                      <Button
                        size="sm"
                        className="ltr:mr-3 rtl:ml-3"
                        type="button"
                        onClick={onDiscard}
                        variant="plain"
                      >
                        Discard
                      </Button>
                    </div>
                    <div className='md:flex grid-2 gap-2'>
                      <div className="md:flex">
                        <Button
                          size="sm"
                          variant="solid"
                          loading={isSubmitting}
                          type="submit"
                          className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold"
                        >
                          {estimationId ? 'Update Estimation' : 'Create Estimation'}
                        </Button>
                      </div>
                    </div>
                  </StickyFooter>
                </FormContainer>
              </Form>
            );
          }}
        </Formik>
      </div>
    </div>
  );
});

EstimationForm.displayName = 'EstimationForm';

export default EstimationForm;