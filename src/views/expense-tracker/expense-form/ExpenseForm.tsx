import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Formik, Form, Field, FieldArray } from 'formik';
import * as Yup from 'yup';
import { Button, Input, FormItem, DatePicker, Notification, toast } from '@/components/ui';
import { HiOutlineTrash, HiOutlinePlus } from 'react-icons/hi';
import { 
  getProjectLaborData, 
  createExpense, 
  fetchExpense, 
  updateExpense 
} from '../api/api';

interface MaterialItem {
  description: string;
  date: Date;
  invoiceNo: string;
  amount: number;
  supplierName?: string;
  supplierMobile?: string;
  supplierEmail?: string;
  documentUrl?: string;
  documentKey?: string;
  file?: File | null;
}

interface MiscellaneousItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface Worker {
  user: string;
  firstName: string;
  lastName: string;
  profileImage?: string;
  daysPresent: number;
  dailySalary: number;
  totalSalary: number;
}

interface Driver {
  user: string;
  firstName: string;
  lastName: string;
  profileImage?: string;
  daysPresent: number;
  dailySalary: number;
  totalSalary: number;
}

interface LaborData {
  workers: Worker[];
  driver: Driver | null;
  totalLaborCost: number;
}

const validationSchema = Yup.object().shape({
  materials: Yup.array().of(
    Yup.object().shape({
      description: Yup.string().required('Description is required'),
      date: Yup.date().required('Date is required'),
      invoiceNo: Yup.string().required('Invoice number is required'),
      amount: Yup.number()
        .min(0, 'Amount must be positive')
        .required('Amount is required'),
      supplierName: Yup.string(),
      supplierMobile: Yup.string(),
      supplierEmail: Yup.string().email('Invalid email format'),
      file: Yup.mixed()
        .test('fileSize', 'File too large (max 5MB)', (value) => {
          if (!value) return true;
          return value.size <= 5 * 1024 * 1024;
        })
        .test('fileType', 'Unsupported file type', (value) => {
          if (!value) return true;
          return ['application/pdf', 'image/jpeg', 'image/png'].includes(value.type);
        })
    })
  ),
  miscellaneous: Yup.array().of(
    Yup.object().shape({
      description: Yup.string().required('Description is required'),
      quantity: Yup.number()
        .min(0.01, 'Quantity must be at least 0.01')
        .required('Quantity is required'),
      unitPrice: Yup.number()
        .min(0.01, 'Unit price must be at least 0.01')
        .required('Unit price is required'),
    })
  ),
  laborDetails: Yup.object().required("Labor details are required")
});

const ExpenseForm = () => {
  const { projectId, expenseId } = useParams();
  const navigate = useNavigate();
  const [laborData, setLaborData] = useState<LaborData | null>(null);
  const [initialValues, setInitialValues] = useState({
    materials: [{
      description: '', 
      date: new Date(), 
      invoiceNo: '', 
      amount: 0,
      supplierName: '',
      supplierMobile: '',
      supplierEmail: '',
      documentUrl: undefined,
      documentKey: undefined,
      file: null
    }],
    miscellaneous: [{
      description: '',
      quantity: 1,
      unitPrice: 0,
      total: 0,
    }],
    laborDetails: {
      workers: [] as Worker[],
      driver: null as Driver | null,
      totalLaborCost: 0
    },
    totalMaterialCost: 0,
    totalMiscellaneousCost: 0
  });
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const laborResponse = await getProjectLaborData(projectId!);
        setLaborData(laborResponse.data);
        
        if (expenseId) {
          const expenseResponse = await fetchExpense(expenseId);
          const materials = expenseResponse.data.materials.map((m: any) => ({
            ...m,
            date: new Date(m.date),
            file: null
          }));
          
          const miscellaneous = expenseResponse.data.miscellaneous?.map((m: any) => ({
            description: m.description,
            quantity: m.quantity,
            unitPrice: m.unitPrice,
            total: m.total
          })) || [{
            description: '',
            quantity: 1,
            unitPrice: 0,
            total: 0
          }];
          
          setInitialValues({
            materials,
            miscellaneous,
            laborDetails: expenseResponse.data.laborDetails,
            totalMaterialCost: expenseResponse.data.totalMaterialCost,
            totalMiscellaneousCost: expenseResponse.data.totalMiscellaneousCost || 0
          });
        } else {
          setInitialValues(prev => ({
            ...prev,
            laborDetails: laborResponse.data
          }));
        }
      } catch (error) {
        toast.push(
          <Notification title="Error" type="danger">
            Failed to load required data
          </Notification>
        );
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [projectId, expenseId]);

  const handleSubmit = async (values: typeof initialValues) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      
      // Prepare materials data
      const materialsData = values.materials.map(m => ({
        description: m.description,
        date: m.date.toISOString(),
        invoiceNo: m.invoiceNo,
        amount: Number(m.amount),
        supplierName: m.supplierName || undefined,
        supplierMobile: m.supplierMobile || undefined,
        supplierEmail: m.supplierEmail || undefined,
        documentUrl: m.documentUrl,
        documentKey: m.documentKey
      }));
  
      // Prepare miscellaneous data
      const miscellaneousData = values.miscellaneous.map(m => ({
        description: m.description,
        quantity: Number(m.quantity),
        unitPrice: Number(m.unitPrice),
        total: Number(m.quantity) * Number(m.unitPrice)
      }));
  
      // Append JSON data
      formData.append('materials', JSON.stringify(materialsData));
      formData.append('miscellaneous', JSON.stringify(miscellaneousData));
      formData.append('laborDetails', JSON.stringify(values.laborDetails));
  
      // Append files with the correct field name ('files' instead of 'materialFiles')
      values.materials.forEach((material) => {
        if (material.file) {
          formData.append('files', material.file);
        }
      });
  
      if (expenseId) {
        await updateExpense(expenseId, formData);
        toast.push(
          <Notification title="Success" type="success">
            Expense updated successfully
          </Notification>
        );
      } else {
        await createExpense(projectId!, formData);
        toast.push(
          <Notification title="Success" type="success">
            Expense created successfully
          </Notification>
        );
      }
      navigate(`/app/project-view/${projectId}`);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 
                         error.message || 
                         'Failed to process expense';
      
      toast.push(
        <Notification title="Error" type="danger">
          {errorMessage}
        </Notification>,
        { placement: 'top-center' }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateTotal = (quantity: number, unitPrice: number) => {
    return (quantity * unitPrice).toFixed(2);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 dark:border-blue-400"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ values, setFieldValue, errors, touched }) => (
          <Form className="space-y-6">
            {/* Material Expenses Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
                Material Expenses
              </h2>
              <FieldArray name="materials">
                {({ push, remove }) => (
                  <div className="space-y-4">
                    {values.materials.map((material, index) => (
                      <div 
                        key={index} 
                        className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormItem
                            label="Description"
                            invalid={(errors.materials?.[index] as any)?.description && 
                                    (touched.materials?.[index] as any)?.description}
                            errorMessage={(errors.materials?.[index] as any)?.description}
                          >
                            <Field 
                              name={`materials[${index}].description`} 
                              as={Input} 
                              placeholder="Material description" 
                            />
                          </FormItem>

                          <FormItem
                            label="Date"
                            invalid={(errors.materials?.[index] as any)?.date && 
                                    (touched.materials?.[index] as any)?.date}
                          >
                            <Field name={`materials[${index}].date`}>
                              {({ field, form }: any) => (
                                <DatePicker
                                  placeholder="Select date"
                                  value={field.value}
                                  onChange={(date: Date) => form.setFieldValue(field.name, date)}
                                />
                              )}
                            </Field>
                          </FormItem>

                          <FormItem
                            label="Invoice Number"
                            invalid={(errors.materials?.[index] as any)?.invoiceNo && 
                                    (touched.materials?.[index] as any)?.invoiceNo}
                            errorMessage={(errors.materials?.[index] as any)?.invoiceNo}
                          >
                            <Field 
                              name={`materials[${index}].invoiceNo`} 
                              as={Input} 
                              placeholder="Invoice number" 
                            />
                          </FormItem>

                          <FormItem
                            label="Amount (AED)"
                            invalid={(errors.materials?.[index] as any)?.amount && 
                                    (touched.materials?.[index] as any)?.amount}
                            errorMessage={(errors.materials?.[index] as any)?.amount}
                          >
                            <Field 
                              name={`materials[${index}].amount`} 
                              type="number" 
                              as={Input} 
                              placeholder="Amount" 
                              min="0"
                              step="0.01"
                            />
                          </FormItem>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                          <FormItem label="Supplier Name">
                            <Field 
                              name={`materials[${index}].supplierName`} 
                              as={Input} 
                              placeholder="Supplier name" 
                            />
                          </FormItem>
                          <FormItem label="Supplier Mobile">
                            <Field 
                              name={`materials[${index}].supplierMobile`} 
                              as={Input} 
                              placeholder="Supplier mobile" 
                            />
                          </FormItem>
                          <FormItem 
                            label="Supplier Email"
                            invalid={(errors.materials?.[index] as any)?.supplierEmail && 
                                    (touched.materials?.[index] as any)?.supplierEmail}
                            errorMessage={(errors.materials?.[index] as any)?.supplierEmail}
                          >
                            <Field 
                              name={`materials[${index}].supplierEmail`} 
                              as={Input} 
                              placeholder="Supplier email" 
                              type="email"
                            />
                          </FormItem>
                        </div>

                        <div className="mt-4">
                          <FormItem
                            label="Document Attachment"
                            invalid={(errors.materials?.[index] as any)?.file}
                            errorMessage={(errors.materials?.[index] as any)?.file}
                          >
                            <input
                              type="file"
                              onChange={(e) => {
                                const file = e.target.files?.[0] || null;
                                setFieldValue(`materials[${index}].file`, file);
                              }}
                              className="block w-full text-sm text-gray-500
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-md file:border-0
                                file:text-sm file:font-semibold
                                file:bg-blue-50 file:text-blue-700
                                hover:file:bg-blue-100
                                dark:file:bg-blue-900/30 dark:file:text-blue-300
                                dark:hover:file:bg-blue-900/20"
                              accept=".pdf,.jpg,.jpeg,.png"
                            />
                            {material.documentUrl && !material.file && (
                              <div className="mt-2">
                                <a 
                                  href={material.documentUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                >
                                  View Current Document
                                </a>
                              </div>
                            )}
                            {material.file && (
                              <div className="mt-2 text-sm text-green-600 dark:text-green-400">
                                New file selected: {material.file.name}
                              </div>
                            )}
                          </FormItem>
                        </div>

                        {values.materials.length > 1 && (
                          <div className="flex justify-end mt-4">
                            <button
                              type="button"
                              onClick={() => remove(index)}
                              className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 flex items-center"
                            >
                              <HiOutlineTrash className="mr-1" />
                              Remove Item
                            </button>
                          </div>
                        )}
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={() => push({
                        description: '', 
                        date: new Date(), 
                        invoiceNo: '', 
                        amount: 0,
                        supplierName: '',
                        supplierMobile: '',
                        supplierEmail: '',
                        file: null
                      })}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none dark:bg-blue-500 dark:hover:bg-blue-600"
                    >
                      <HiOutlinePlus className="mr-1" />
                      Add Material
                    </button>
                  </div>
                )}
              </FieldArray>
            </div>

            {/* Miscellaneous Expenses Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
                Miscellaneous Expenses
              </h2>
              <FieldArray name="miscellaneous">
                {({ push, remove }) => (
                  <div className="space-y-4">
                    {values.miscellaneous.map((misc, index) => (
                      <div 
                        key={index} 
                        className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <FormItem
                            label="Description"
                            invalid={(errors.miscellaneous?.[index] as any)?.description && 
                                    (touched.miscellaneous?.[index] as any)?.description}
                            errorMessage={(errors.miscellaneous?.[index] as any)?.description}
                          >
                            <Field 
                              name={`miscellaneous[${index}].description`} 
                              as={Input} 
                              placeholder="Expense description" 
                            />
                          </FormItem>

                          <FormItem
                            label="Quantity"
                            invalid={(errors.miscellaneous?.[index] as any)?.quantity && 
                                    (touched.miscellaneous?.[index] as any)?.quantity}
                            errorMessage={(errors.miscellaneous?.[index] as any)?.quantity}
                          >
                            <Field 
                              name={`miscellaneous[${index}].quantity`} 
                              type="number" 
                              as={Input} 
                              placeholder="Quantity" 
                              min="0.01"
                              step="0.01"
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                const quantity = parseFloat(e.target.value) || 0;
                                const unitPrice = parseFloat(values.miscellaneous[index].unitPrice.toString()) || 0;
                                setFieldValue(`miscellaneous[${index}].quantity`, quantity);
                                setFieldValue(`miscellaneous[${index}].total`, quantity * unitPrice);
                              }}
                            />
                          </FormItem>

                          <FormItem
                            label="Unit Price (AED)"
                            invalid={(errors.miscellaneous?.[index] as any)?.unitPrice && 
                                    (touched.miscellaneous?.[index] as any)?.unitPrice}
                            errorMessage={(errors.miscellaneous?.[index] as any)?.unitPrice}
                          >
                            <Field 
                              name={`miscellaneous[${index}].unitPrice`} 
                              type="number" 
                              as={Input} 
                              placeholder="Unit price" 
                              min="0.01"
                              step="0.01"
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                const unitPrice = parseFloat(e.target.value) || 0;
                                const quantity = parseFloat(values.miscellaneous[index].quantity.toString()) || 0;
                                setFieldValue(`miscellaneous[${index}].unitPrice`, unitPrice);
                                setFieldValue(`miscellaneous[${index}].total`, quantity * unitPrice);
                              }}
                            />
                          </FormItem>
                        </div>

                        <div className="mt-4">
                          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                              Total
                            </label>
                            <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                              AED {calculateTotal(
                                parseFloat(values.miscellaneous[index].quantity.toString()) || 0,
                                parseFloat(values.miscellaneous[index].unitPrice.toString()) || 0
                              )}
                            </div>
                          </div>
                        </div>

                        {values.miscellaneous.length > 1 && (
                          <div className="flex justify-end mt-4">
                            <button
                              type="button"
                              onClick={() => remove(index)}
                              className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 flex items-center"
                            >
                              <HiOutlineTrash className="mr-1" />
                              Remove Item
                            </button>
                          </div>
                        )}
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={() => push({
                        description: '',
                        quantity: 1,
                        unitPrice: 0,
                        total: 0
                      })}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none dark:bg-blue-500 dark:hover:bg-blue-600"
                    >
                      <HiOutlinePlus className="mr-1" />
                      Add Miscellaneous Expense
                    </button>
                  </div>
                )}
              </FieldArray>
            </div>

            {/* Labor Details Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
                Labor Details
              </h2>
              
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-3 text-gray-900 dark:text-gray-100">
                  Workers
                </h3>
                {laborData?.workers?.length ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Name
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Days Present
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Daily Salary
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Total
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {laborData.workers.map((worker, index) => (
                          <tr key={index}>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                {worker.profileImage && (
                                  <img 
                                    className="h-10 w-10 rounded-full mr-3" 
                                    src={worker.profileImage} 
                                    alt={`${worker.firstName} ${worker.lastName}`} 
                                  />
                                )}
                                <div className="text-gray-900 dark:text-gray-100">
                                  {worker.firstName} {worker.lastName}
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400">
                              {worker.daysPresent}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400">
                              AED {worker.dailySalary.toFixed(2)}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400">
                              AED {worker.totalSalary.toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">
                    No workers assigned to this project
                  </p>
                )}
              </div>

              <div>
                <h3 className="text-lg font-medium mb-3 text-gray-900 dark:text-gray-100">
                  Driver
                </h3>
                {laborData?.driver ? (
                  <div className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    {laborData.driver.profileImage && (
                      <img 
                        className="h-12 w-12 rounded-full" 
                        src={laborData.driver.profileImage} 
                        alt={`${laborData.driver.firstName} ${laborData.driver.lastName}`} 
                      />
                    )}
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 dark:text-gray-100">
                        {laborData.driver.firstName} {laborData.driver.lastName}
                      </div>
                      <div className="grid grid-cols-3 gap-4 mt-2">
                        <div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Days Present
                          </div>
                          <div className="text-gray-900 dark:text-gray-100">
                            {laborData.driver.daysPresent}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Daily Salary
                          </div>
                          <div className="text-gray-900 dark:text-gray-100">
                            AED {laborData.driver.dailySalary.toFixed(2)}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Total
                          </div>
                          <div className="text-gray-900 dark:text-gray-100">
                            AED {laborData.driver.totalSalary.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">
                    No driver assigned to this project
                  </p>
                )}
              </div>
            </div>

            {/* Summary Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
                Expense Summary
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                    Total Material Cost
                  </label>
                  <div className="mt-1 text-2xl font-semibold text-gray-900 dark:text-gray-100">
                    AED {values.materials.reduce((sum, m) => sum + Number(m.amount), 0).toFixed(2)}
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                    Total Misc Cost
                  </label>
                  <div className="mt-1 text-2xl font-semibold text-gray-900 dark:text-gray-100">
                    AED {values.miscellaneous.reduce((sum, m) => sum + (Number(m.quantity) * Number(m.unitPrice)), 0).toFixed(2)}
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                    Total Labor Cost
                  </label>
                  <div className="mt-1 text-2xl font-semibold text-gray-900 dark:text-gray-100">
                    AED {laborData?.totalLaborCost.toFixed(2) || '0.00'}
                  </div>
                </div>
                <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg">
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                    Total Expense
                  </label>
                  <div className="mt-1 text-2xl font-semibold text-green-600 dark:text-green-400">
                    AED {(
                      values.materials.reduce((sum, m) => sum + Number(m.amount), 0) + 
                      values.miscellaneous.reduce((sum, m) => sum + (Number(m.quantity) * Number(m.unitPrice)), 0) +
                      (laborData?.totalLaborCost || 0)
                    ).toFixed(2)}
                  </div>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 py-3 flex justify-between shadow-lg">
              <Button
                type="button"
                onClick={() => navigate(`/projects/${projectId}/expenses`)}
                variant="plain"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="solid"
                color="blue-600"
                loading={isSubmitting}
                disabled={isSubmitting}
              >
                {expenseId ? 'Update Expense' : 'Create Expense'}
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default ExpenseForm;