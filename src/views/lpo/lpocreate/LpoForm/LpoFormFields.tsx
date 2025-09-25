import AdaptableCard from '@/components/shared/AdaptableCard'
import Input from '@/components/ui/Input'
import { FormItem } from '@/components/ui/Form'
import { Field, FormikErrors, FormikTouched, FieldProps } from 'formik'
import { useState } from 'react'
import { Button } from '@/components/ui'
import { HiOutlineTrash, HiOutlinePlus } from 'react-icons/hi'
import Upload from '@/components/ui/Upload'
import DoubleSidedImage from '@/components/shared/DoubleSidedImage'
import DatePicker from '@/components/ui/DatePicker'

type FormFieldsName = {
    projectId: string
    lpoNumber: string
    lpoDate: string
    supplier: string
    documents: File[]
    existingDocuments?: any[]
    items: {
        description: string
        quantity: number
        unitPrice: number
    }[]
}

type LpoFormFieldsProps = {
    touched: FormikTouched<FormFieldsName>
    errors: FormikErrors<FormFieldsName>
    values: FormFieldsName
    setFieldValue: any
    type: 'edit' | 'new'
}

const LpoFormFields = (props: LpoFormFieldsProps) => {
    const { touched, errors, values, setFieldValue, type } = props
    const [filePreviews, setFilePreviews] = useState<string[]>([])

    // Helper function to convert string date to Date object for DatePicker
    const stringToDate = (dateString: string): Date | null => {
        if (!dateString) return null;
        
        try {
            const date = new Date(dateString);
            return isNaN(date.getTime()) ? null : date;
        } catch (error) {
            console.error('Error converting string to date:', error);
            return null;
        }
    };

    // Helper function to convert Date object to string for form values
    const dateToString = (date: Date | null): string => {
        if (!date) return '';
        
        try {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        } catch (error) {
            console.error('Error converting date to string:', error);
            return '';
        }
    };

    const beforeUpload = (file: FileList | null) => {
        let valid: boolean | string = true
        const allowedFileTypes = [
            'application/pdf',
            
   
        ]
        const maxFileSize = 10 * 1024 * 1024 // 10MB

        if (file) {
            for (let i = 0; i < file.length; i++) {
                if (!allowedFileTypes.includes(file[i].type)) {
                    valid = 'Please upload a PDF'
                    break
                }

                if (file[i].size >= maxFileSize) {
                    valid = 'File size cannot be more than 10MB!'
                    break
                }
            }
        }

        return valid
    }

    const onFileChange = (
        files: File[]
    ) => {
        if (files.length > 0) {
            setFieldValue('documents', [...values.documents, ...files])
            setFilePreviews(prev => [...prev, ...files.map(file => URL.createObjectURL(file))])
        }
    }

    const removeFile = (
        index: number,
        isExisting: boolean = false
    ) => {
        if (isExisting) {
            const newExistingFiles = [...(values.existingDocuments || [])]
            newExistingFiles.splice(index, 1)
            setFieldValue('existingDocuments', newExistingFiles)
        } else {
            const newFiles = [...values.documents]
            newFiles.splice(index, 1)
            setFieldValue('documents', newFiles)
            
            const newPreviews = [...filePreviews]
            newPreviews.splice(index, 1)
            setFilePreviews(newPreviews)
        }
    }

    const addItem = () => {
        const newItems = [
            ...values.items,
            { description: '', quantity: 0, unitPrice: 0 }
        ]
        setFieldValue('items', newItems)
    }

    const removeItem = (
        index: number
    ) => {
        const newItems = [...values.items]
        newItems.splice(index, 1)
        setFieldValue('items', newItems)
    }

    const updateItem = (index: number, field: string, value: any) => {
        const newItems = [...values.items]
        newItems[index] = { ...newItems[index], [field]: value }
        setFieldValue('items', newItems)
    }

    // Debug log to see what date value is being passed to DatePicker
    console.log('LpoFormFields - Current lpoDate value:', values.lpoDate);
    console.log('LpoFormFields - Converted to Date object:', stringToDate(values.lpoDate));

    return (
        <AdaptableCard divider className="mb-4">
            <h5>LPO Information</h5>
            <p className="mb-6">Section to enter LPO details</p>

            {/* LPO Number Field */}
            <FormItem
                label="LPO Number"
                invalid={(errors.lpoNumber && touched.lpoNumber) as boolean}
                errorMessage={errors.lpoNumber}
            >
                <Field
                    type="text"
                    autoComplete="off"
                    name="lpoNumber"
                    placeholder="Enter LPO Number"
                    component={Input}
                />
            </FormItem>

            {/* LPO Date Field - FIXED */}
            <FormItem
                label="LPO Date"
                invalid={(errors.lpoDate && touched.lpoDate) as boolean}
                errorMessage={errors.lpoDate}
            >
                <Field name="lpoDate">
                    {({ field, form }: FieldProps) => (
                        <DatePicker
                            placeholder="Select date"
                            value={stringToDate(field.value)} // Convert string to Date object
                            onChange={(date) => {
                                const dateString = dateToString(date); // Convert Date back to string
                                console.log('DatePicker onChange - Date object:', date);
                                console.log('DatePicker onChange - String value:', dateString);
                                form.setFieldValue(field.name, dateString);
                            }}
                        />
                    )}
                </Field>
            </FormItem>

            {/* Supplier Field */}
            <FormItem
                label="Supplier"
                invalid={(errors.supplier && touched.supplier) as boolean}
                errorMessage={errors.supplier}
            >
                <Field
                    type="text"
                    autoComplete="off"
                    name="supplier"
                    placeholder="Enter supplier name"
                    component={Input}
                />
            </FormItem>

            {/* Documents Field */}
            <FormItem
                label="Attach Documents"
                invalid={(errors.documents && touched.documents) as boolean}
                errorMessage={errors.documents as string}
            >
                <div>
                    <Upload
                        beforeUpload={beforeUpload}
                        showList={false}
                        multiple
                        onChange={onFileChange}
                    >
                        <div className="my-4 text-center">
                            <DoubleSidedImage
                                className="mx-auto"
                                src="/img/others/upload.png"
                                darkModeSrc="/img/others/upload-dark.png"
                            />
                            <p className="font-semibold">
                                <span className="text-gray-800 dark:text-white">
                                    Drop your files here, or{' '}
                                </span>
                                <span className="text-blue-500">
                                    browse
                                </span>
                            </p>
                            <p className="mt-1 opacity-60 dark:text-white">
                                Support: PDF,(Max 10MB)
                            </p>
                        </div>
                    </Upload>
                    
                    {/* Existing Documents */}
                    {values.existingDocuments && values.existingDocuments.length > 0 && (
                        <div className="mt-4">
                            <h6 className="text-sm font-semibold mb-2">Existing Documents</h6>
                            <div className="space-y-2">
                                {values.existingDocuments.map((doc: any, index: number) => (
                                    <div
                                        key={`existing-${index}`}
                                        className="flex items-center justify-between p-2 border rounded"
                                    >
                                        <a
                                            href={doc.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-500 hover:underline truncate"
                                        >
                                            {doc.name}
                                        </a>
                                        <Button
                                            icon={<HiOutlineTrash />}
                                            variant="plain"
                                            size="xs"
                                            type="button"
                                            onClick={() => removeFile(index, true)}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* New Documents */}
                    {values.documents.length > 0 && (
                        <div className="mt-4">
                            <h6 className="text-sm font-semibold mb-2">New Documents</h6>
                            <div className="space-y-2">
                                {values.documents.map((file, index) => (
                                    <div
                                        key={`new-${index}`}
                                        className="flex items-center justify-between p-2 border rounded"
                                    >
                                        <span className="truncate">
                                            {file.name}
                                        </span>
                                        <Button
                                            icon={<HiOutlineTrash />}
                                            variant="plain"
                                            size="xs"
                                            type="button"
                                            onClick={() => removeFile(index)}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </FormItem>

            {/* Items Field */}
            <FormItem
                label="Items"
                invalid={(errors.items && touched.items) as boolean}
                errorMessage={errors.items as string}
            >
                <div className="space-y-4">
                    {values.items.map((item, index) => (
                        <div
                            key={index}
                            className="grid grid-cols-12 gap-4 items-end border p-4 rounded-lg"
                        >
                            <div className="col-span-5">
                                <FormItem
                                    label={`Item ${index + 1} - Description`}
                                    className="mb-0"
                                    invalid={errors.items?.[index]?.description && touched.items?.[index]?.description}
                                    errorMessage={errors.items?.[index]?.description}
                                >
                                    <Input
                                        type="text"
                                        autoComplete="off"
                                        placeholder="Item description"
                                        value={item.description}
                                        onChange={(e) => updateItem(index, 'description', e.target.value)}
                                    />
                                </FormItem>
                            </div>
                            <div className="col-span-2">
                                <FormItem
                                    label="Quantity"
                                    className="mb-0"
                                    invalid={errors.items?.[index]?.quantity && touched.items?.[index]?.quantity}
                                    errorMessage={errors.items?.[index]?.quantity}
                                >
                                    <Input
                                        type="number"
                                        min="1"
                                        autoComplete="off"
                                        placeholder="Qty"
                                        value={item.quantity}
                                        onChange={(e) => updateItem(index, 'quantity', Number(e.target.value))}
                                    />
                                </FormItem>
                            </div>
                            <div className="col-span-3">
                                <FormItem
                                    label="Unit Price"
                                    className="mb-0"
                                    invalid={errors.items?.[index]?.unitPrice && touched.items?.[index]?.unitPrice}
                                    errorMessage={errors.items?.[index]?.unitPrice}
                                >
                                    <Input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        autoComplete="off"
                                        placeholder="Price"
                                        value={item.unitPrice}
                                        onChange={(e) => updateItem(index, 'unitPrice', Number(e.target.value))}
                                    />
                                </FormItem>
                            </div>
                            <div className="col-span-2 flex justify-end">
                                {values.items.length > 1 && (
                                    <Button
                                        icon={<HiOutlineTrash />}
                                        variant="plain"
                                        size="sm"
                                        type="button"
                                        onClick={() => removeItem(index)}
                                    />
                                )}
                            </div>
                        </div>
                    ))}
                    <Button
                        icon={<HiOutlinePlus />}
                        variant="plain"
                        size="sm"
                        type="button"
                        onClick={addItem}
                    >
                        Add Item
                    </Button>
                </div>
            </FormItem>
        </AdaptableCard>
    )
}

export default LpoFormFields