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
}

const LpoFormFields = (props: LpoFormFieldsProps) => {
    const { touched, errors, values } = props
    const [filePreviews, setFilePreviews] = useState<string[]>([])

    const beforeUpload = (file: FileList | null) => {
        let valid: boolean | string = true
        const allowedFileTypes = [
            'application/pdf',
            'image/jpeg',
            'image/png',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel'
        ]
        const maxFileSize = 10 * 1024 * 1024 // 10MB

        if (file) {
            for (let i = 0; i < file.length; i++) {
                if (!allowedFileTypes.includes(file[i].type)) {
                    valid = 'Please upload a PDF, Excel, JPEG, or PNG file!'
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
        form: any,
        field: any,
        files: File[],
        setFieldValue: any
    ) => {
        if (files.length > 0) {
            setFieldValue(field.name, files)
            setFilePreviews(files.map(file => URL.createObjectURL(file)))
        }
    }

    const removeFile = (
        index: number,
        values: FormFieldsName,
        setFieldValue: any
    ) => {
        const newFiles = [...values.documents]
        newFiles.splice(index, 1)
        setFieldValue('documents', newFiles)
        
        const newPreviews = [...filePreviews]
        newPreviews.splice(index, 1)
        setFilePreviews(newPreviews)
    }

    const addItem = (values: FormFieldsName, setFieldValue: any) => {
        const newItems = [
            ...values.items,
            { description: '', quantity: 0, unitPrice: 0 }
        ]
        setFieldValue('items', newItems)
    }

    const removeItem = (
        index: number,
        values: FormFieldsName,
        setFieldValue: any
    ) => {
        const newItems = [...values.items]
        newItems.splice(index, 1)
        setFieldValue('items', newItems)
    }

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

            {/* LPO Date Field */}
            <FormItem
                label="LPO Date"
                invalid={(errors.lpoDate && touched.lpoDate) as boolean}
                errorMessage={errors.lpoDate}
            >
                <Field name="lpoDate">
                    {({ field, form }: FieldProps) => (
                        <DatePicker
                            placeholder="Select date"
                            {...field}
                            onChange={(date) => {
                                form.setFieldValue(field.name, date)
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
                <Field name="documents">
                    {({ field, form }: FieldProps) => (
                        <div>
                            <Upload
                                beforeUpload={beforeUpload}
                                showList={false}
                                multiple
                                onChange={(files) =>
                                    onFileChange(
                                        form,
                                        field,
                                        files,
                                        form.setFieldValue
                                    )
                                }
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
                                        Support: PDF, Excel, JPEG, PNG (Max 10MB each)
                                    </p>
                                </div>
                            </Upload>
                            {values.documents.length > 0 && (
                                <div className="mt-4 space-y-2">
                                    {values.documents.map((file, index) => (
                                        <div
                                            key={index}
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
                                                onClick={() =>
                                                    removeFile(
                                                        index,
                                                        values,
                                                        form.setFieldValue
                                                    )
                                                }
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </Field>
            </FormItem>

            {/* Items Field */}
            <FormItem
                label="Items"
                invalid={(errors.items && touched.items) as boolean}
                errorMessage={errors.items as string}
            >
                <Field name="items">
                    {({ field, form }: FieldProps) => (
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
                                        >
                                            <Input
                                                type="text"
                                                autoComplete="off"
                                                name={`items.${index}.description`}
                                                placeholder="Item description"
                                                value={item.description}
                                                onChange={(e) => {
                                                    const newItems = [
                                                        ...values.items,
                                                    ]
                                                    newItems[index].description =
                                                        e.target.value
                                                    form.setFieldValue(
                                                        'items',
                                                        newItems
                                                    )
                                                }}
                                            />
                                        </FormItem>
                                    </div>
                                    <div className="col-span-2">
                                        <FormItem
                                            label="Quantity"
                                            className="mb-0"
                                        >
                                            <Input
                                                type="number"
                                                min="0"
                                                autoComplete="off"
                                                name={`items.${index}.quantity`}
                                                placeholder="Qty"
                                                value={item.quantity}
                                                onChange={(e) => {
                                                    const newItems = [
                                                        ...values.items,
                                                    ]
                                                    newItems[index].quantity =
                                                        Number(e.target.value)
                                                    form.setFieldValue(
                                                        'items',
                                                        newItems
                                                    )
                                                }}
                                            />
                                        </FormItem>
                                    </div>
                                    <div className="col-span-3">
                                        <FormItem
                                            label="Unit Price"
                                            className="mb-0"
                                        >
                                            <Input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                autoComplete="off"
                                                name={`items.${index}.unitPrice`}
                                                placeholder="Price"
                                                value={item.unitPrice}
                                                onChange={(e) => {
                                                    const newItems = [
                                                        ...values.items,
                                                    ]
                                                    newItems[index].unitPrice =
                                                        Number(e.target.value)
                                                    form.setFieldValue(
                                                        'items',
                                                        newItems
                                                    )
                                                }}
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
                                                onClick={() =>
                                                    removeItem(
                                                        index,
                                                        values,
                                                        form.setFieldValue
                                                    )
                                                }
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
                                onClick={() =>
                                    addItem(values, form.setFieldValue)
                                }
                            >
                                Add Item
                            </Button>
                        </div>
                    )}
                </Field>
            </FormItem>
        </AdaptableCard>
    )
}

export default LpoFormFields