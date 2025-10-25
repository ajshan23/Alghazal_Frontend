import { forwardRef, useState, useEffect, useCallback } from 'react'
import { FormContainer, FormItem } from '@/components/ui/Form'
import Button from '@/components/ui/Button'
import StickyFooter from '@/components/shared/StickyFooter'
import { Field, Form, Formik, FormikProps, FieldProps } from 'formik'
import { AiOutlineSave } from 'react-icons/ai'
import { HiOutlineTrash } from 'react-icons/hi'
import * as Yup from 'yup'
import { Input } from '@/components/ui'
import { AdaptableCard } from '@/components/shared'
import Select from '@/components/ui/Select'
import { fetchCategories, fetchShops } from '../api/api'
import DatePicker from '@/components/ui/DatePicker'
import { format } from 'date-fns'
import { debounce } from 'lodash'

type FormikRef = FormikProps<any>

type InitialData = {
    reportDate: Date | string
    amount: number
    category: string
    shop: string
    remarks: string
    attachments?: Array<{ fileName: string; filePath: string }> | File[]
}

export type FormModel = Omit<InitialData, 'reportDate'> & { 
    reportDate: Date 
    attachments?: File[] | Array<{ fileName: string; filePath: string }>
}

const today = new Date()

export type SetSubmitting = (isSubmitting: boolean) => void
export type OnDeleteCallback = React.Dispatch<React.SetStateAction<boolean>>
type OnDelete = (callback: OnDeleteCallback) => void

type AdibReportFormProps = {
    initialData?: InitialData
    type: 'edit' | 'new'
    onDiscard?: () => void
    onDelete?: OnDelete
    onFormSubmit: (
        formData: FormModel,
        setSubmitting: SetSubmitting,
    ) => Promise<any>
}

// Shop and Category type definitions
interface Shop {
    _id: string
    shopName: string
}

interface Category {
    _id: string
    name: string
}

interface ShopsResponse {
    data: {
        shops: Shop[]
        pagination: {
            total: number
            page: number
            limit: number
            totalPages: number
            hasNextPage: boolean
            hasPreviousPage: boolean
        }
    }
}

interface CategoriesResponse {
    data: {
        categories: Category[]
        pagination: {
            total: number
            page: number
            limit: number
            totalPages: number
            hasNextPage: boolean
            hasPreviousPage: boolean
        }
    }
}

const AdibReportForm = forwardRef<FormikRef, AdibReportFormProps>((props, ref) => {
    const {
        type,
        initialData = {
            reportDate: new Date(),
            amount: 0,
            category: '',
            shop: '',
            remarks: '',
            attachments: [],
        },
        onFormSubmit,
        onDiscard,
        onDelete,
    } = props
    
    const [shopOptions, setShopOptions] = useState<{ label: string; value: string }[]>([])
    const [categoryOptions, setCategoryOptions] = useState<{ label: string; value: string }[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isShopLoading, setIsShopLoading] = useState(false)
    const [isCategoryLoading, setIsCategoryLoading] = useState(false)
    
    // Search terms and pagination states
    const [shopSearchTerm, setShopSearchTerm] = useState('')
    const [categorySearchTerm, setCategorySearchTerm] = useState('')
    
    const [shopPagination, setShopPagination] = useState({
        page: 1,
        limit: 30,
        total: 0,
        totalPages: 0,
        hasMore: false
    })
    
    const [categoryPagination, setCategoryPagination] = useState({
        page: 1,
        limit: 30,
        total: 0,
        totalPages: 0,
        hasMore: false
    })
    
    const [attachmentFiles, setAttachmentFiles] = useState<Array<File | { fileName: string; filePath: string }>>(
        initialData.attachments || []
    )

    // Debounced shop search with pagination
    const debouncedShopSearch = useCallback(
        debounce(async (searchTerm: string, page: number = 1) => {
            try {
                setIsShopLoading(true)
                const shopData = await fetchShops(searchTerm, page, shopPagination.limit) as ShopsResponse
                const shopOpts = shopData?.data?.shops.map((shop: Shop) => ({
                    label: shop.shopName,
                    value: shop._id,
                }))
                
                if (page === 1) {
                    setShopOptions(shopOpts || [])
                } else {
                    setShopOptions(prev => [...prev, ...(shopOpts || [])])
                }
                
                setShopPagination(prev => ({
                    ...prev,
                    page,
                    total: shopData?.data?.pagination?.total || 0,
                    totalPages: shopData?.data?.pagination?.totalPages || 0,
                    hasMore: page < (shopData?.data?.pagination?.totalPages || 0)
                }))
            } catch (error) {
                console.error('Error searching shops:', error)
            } finally {
                setIsShopLoading(false)
            }
        }, 500),
        [shopPagination.limit]
    )

    // Debounced category search with pagination
    const debouncedCategorySearch = useCallback(
        debounce(async (searchTerm: string, page: number = 1) => {
            try {
                setIsCategoryLoading(true)
                const categoryData = await fetchCategories(searchTerm, page, categoryPagination.limit) as CategoriesResponse
                const categoryOpts = categoryData?.data?.categories.map((category: Category) => ({
                    label: category.name,
                    value: category._id,
                }))
                
                if (page === 1) {
                    setCategoryOptions(categoryOpts || [])
                } else {
                    setCategoryOptions(prev => [...prev, ...(categoryOpts || [])])
                }
                
                setCategoryPagination(prev => ({
                    ...prev,
                    page,
                    total: categoryData?.data?.pagination?.total || 0,
                    totalPages: categoryData?.data?.pagination?.totalPages || 0,
                    hasMore: page < (categoryData?.data?.pagination?.totalPages || 0)
                }))
            } catch (error) {
                console.error('Error searching categories:', error)
            } finally {
                setIsCategoryLoading(false)
            }
        }, 500),
        [categoryPagination.limit]
    )

    useEffect(() => {
        const loadData = async () => {
            try {
                setIsLoading(true)
                
                // Load shops
                const shopData = await fetchShops('', 1, shopPagination.limit) as ShopsResponse
                const shopOpts = shopData?.data?.shops.map((shop: Shop) => ({
                    label: shop.shopName,
                    value: shop._id,
                }))
                setShopOptions(shopOpts || [])
                
                setShopPagination(prev => ({
                    ...prev,
                    total: shopData?.data?.pagination?.total || 0,
                    totalPages: shopData?.data?.pagination?.totalPages || 0,
                    hasMore: 1 < (shopData?.data?.pagination?.totalPages || 0)
                }))

                // Load categories
                const categoryData = await fetchCategories('', 1, categoryPagination.limit) as CategoriesResponse
                const categoryOpts = categoryData?.data?.categories.map((category: Category) => ({
                    label: category.name,
                    value: category._id,
                }))
                setCategoryOptions(categoryOpts || [])
                
                setCategoryPagination(prev => ({
                    ...prev,
                    total: categoryData?.data?.pagination?.total || 0,
                    totalPages: categoryData?.data?.pagination?.totalPages || 0,
                    hasMore: 1 < (categoryData?.data?.pagination?.totalPages || 0)
                }))
                
            } catch (error) {
                console.error('Failed to load data:', error)
            } finally {
                setIsLoading(false)
            }
        }

        loadData()
    }, [])

    const handleShopSearch = (inputValue: string) => {
        setShopSearchTerm(inputValue)
        debouncedShopSearch(inputValue, 1) // Reset to page 1 on new search
        return inputValue
    }

    const handleShopMenuScrollToBottom = () => {
        if (shopPagination.hasMore && !isShopLoading) {
            const nextPage = shopPagination.page + 1
            debouncedShopSearch(shopSearchTerm, nextPage)
        }
    }

    const handleCategorySearch = (inputValue: string) => {
        setCategorySearchTerm(inputValue)
        debouncedCategorySearch(inputValue, 1) // Reset to page 1 on new search
        return inputValue
    }

    const handleCategoryMenuScrollToBottom = () => {
        if (categoryPagination.hasMore && !isCategoryLoading) {
            const nextPage = categoryPagination.page + 1
            debouncedCategorySearch(categorySearchTerm, nextPage)
        }
    }

    const handleAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const newFiles = Array.from(e.target.files)
            setAttachmentFiles(prev => [...prev, ...newFiles])
        }
    }

    const handleAttachmentRemove = (index: number) => {
        setAttachmentFiles(prev => prev.filter((_, i) => i !== index))
    }

    const validationSchema = Yup.object().shape({
        reportDate: Yup.date()
            .required('Bill date is required')
            .typeError('Please select a valid date'),
        amount: Yup.number()
            .required('Amount is required')
            .positive('Amount must be positive')
            .typeError('Amount must be a number'),
        category: Yup.string().required('Category is required'),
        shop: Yup.string().required('Shop is required'),
        remarks: Yup.string().max(500, 'Remarks must be at most 500 characters'),
        attachments: Yup.mixed(),
    })

    return (
        <Formik
            innerRef={ref}
            initialValues={{
                reportDate: initialData.reportDate instanceof Date ? initialData.reportDate : new Date(initialData.reportDate),
                amount: initialData.amount || '',
                category: initialData.category || '',
                shop: initialData.shop || '',
                remarks: initialData.remarks || '',
                attachments: initialData.attachments || [],
            }}
            validationSchema={validationSchema}
            onSubmit={async (values, { setSubmitting, setErrors }) => {
                try {
                    const formData = {
                        ...values,
                        attachments: attachmentFiles,
                    } as FormModel
                    await onFormSubmit(formData, setSubmitting)
                } catch (error: any) {
                    setSubmitting(false)
                    if (error.response?.data?.errors) {
                        setErrors(error.response.data.errors)
                    }
                    console.error('Form submission error:', error)
                }
            }}
            enableReinitialize={true}
        >
            {({
                values,
                touched,
                errors,
                isSubmitting,
                setFieldValue,
                handleBlur,
            }) => (
                <Form>
                    <FormContainer>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                            <div className="lg:col-span-2">
                                <AdaptableCard divider className="mb-4">
                                    <h5 className="mb-4">ADIB Report Information</h5>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormItem
                                            label="Bill Date"
                                            invalid={!!errors.reportDate && touched.reportDate}
                                        >
                                            <Field name="reportDate">
                                                {({ field, form }: FieldProps) => (
                                                    <DatePicker
                                                        placeholder="Select Bill Date"
                                                        value={
                                                            field.value
                                                                ? new Date(field.value)
                                                                : null
                                                        }
                                                        maxDate={today}
                                                        onChange={(date) =>
                                                            form.setFieldValue(
                                                                field.name,
                                                                date || null
                                                            )
                                                        }
                                                    />
                                                )}
                                            </Field>
                                        </FormItem>

                                        <FormItem
                                            label="Amount"
                                            invalid={!!errors.amount && touched.amount}
                                            errorMessage={errors.amount as string}
                                        >
                                            <Field name="amount">
                                                {({ field, form }: FieldProps) => (
                                                    <Input
                                                        type="number"
                                                        autoComplete="off"
                                                        placeholder="Amount"
                                                        {...field}
                                                        onChange={(e) => {
                                                            form.setFieldValue(
                                                                field.name,
                                                                e.target.value,
                                                            )
                                                        }}
                                                    />
                                                )}
                                            </Field>
                                        </FormItem>
                                    </div>
                                </AdaptableCard>

                                <AdaptableCard divider className="mb-4">
                                    <h5 className="mb-4">Details</h5>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormItem
                                            label="Category"
                                            invalid={!!errors.category && touched.category}
                                            errorMessage={errors.category as string}
                                        >
                                            <Field name="category">
                                                {({ field, form }: FieldProps) => {
                                                    const selectedCategory = categoryOptions.find(
                                                        (category) => category.value === field.value
                                                    ) || null

                                                    return (
                                                        <Select
                                                            placeholder={isLoading ? 'Loading categories...' : 'Select Category'}
                                                            options={categoryOptions}
                                                            value={selectedCategory}
                                                            onChange={(option) => {
                                                                form.setFieldValue(field.name, option?.value || '')
                                                            }}
                                                            loading={isCategoryLoading}
                                                            isSearchable={true}
                                                            onInputChange={handleCategorySearch}
                                                            inputValue={categorySearchTerm}
                                                            onMenuScrollToBottom={handleCategoryMenuScrollToBottom}
                                                            noOptionsMessage={() =>
                                                                isCategoryLoading ? 'Loading...' : 'No categories found'
                                                            }
                                                            loadingMessage={() => 'Loading categories...'}
                                                        />
                                                    )
                                                }}
                                            </Field>
                                        </FormItem>

                                        <FormItem
                                            label="Shop Name"
                                            invalid={!!errors.shop && touched.shop}
                                            errorMessage={errors.shop as string}
                                        >
                                            <Field name="shop">
                                                {({ field, form }: FieldProps) => {
                                                    const selectedShop = shopOptions.find(
                                                        (shop) => shop.value === field.value
                                                    ) || null

                                                    return (
                                                        <Select
                                                            placeholder={isLoading ? 'Loading shops...' : 'Select Shop'}
                                                            options={shopOptions}
                                                            value={selectedShop}
                                                            onChange={(option) => {
                                                                form.setFieldValue(field.name, option?.value || '')
                                                            }}
                                                            loading={isShopLoading}
                                                            isSearchable={true}
                                                            onInputChange={handleShopSearch}
                                                            inputValue={shopSearchTerm}
                                                            onMenuScrollToBottom={handleShopMenuScrollToBottom}
                                                            noOptionsMessage={() =>
                                                                isShopLoading ? 'Loading...' : 'No shops found'
                                                            }
                                                            loadingMessage={() => 'Loading shops...'}
                                                        />
                                                    )
                                                }}
                                            </Field>
                                        </FormItem>
                                    </div>
                                </AdaptableCard>

                                <AdaptableCard divider className="mb-4">
                                    <h5 className="mb-4">Remarks</h5>
                                    <FormItem
                                        label="Remarks"
                                        invalid={!!errors.remarks && touched.remarks}
                                        errorMessage={errors.remarks as string}
                                    >
                                        <Field name="remarks">
                                            {({ field }: FieldProps) => (
                                                <Input
                                                    as="textarea"
                                                    autoComplete="off"
                                                    placeholder="Enter any remarks"
                                                    {...field}
                                                />
                                            )}
                                        </Field>
                                    </FormItem>
                                </AdaptableCard>

                                <AdaptableCard divider className="mb-4">
                                    <h5 className="mb-4">Attachments</h5>
                                    <FormItem
                                        label="Attachments"
                                        invalid={
                                            !!errors.attachments &&
                                            touched.attachments
                                        }
                                        errorMessage={
                                            errors.attachments as string
                                        }
                                    >
                                        <div className="mb-4">
                                            <input
                                                type="file"
                                                multiple
                                                onChange={
                                                    handleAttachmentChange
                                                }
                                                onBlur={() =>
                                                    handleBlur({
                                                        target: {
                                                            name: 'attachments',
                                                        },
                                                    })
                                                }
                                                className="block w-full text-sm text-gray-500
                                                file:mr-4 file:py-2 file:px-4
                                                file:rounded-md file:border-0
                                                file:text-sm file:font-semibold
                                                file:bg-blue-50 file:text-blue-700
                                                hover:file:bg-blue-100
                                                dark:file:bg-blue-900/30 dark:file:text-blue-300
                                                dark:hover:file:bg-blue-900/20"
                                                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                            />
                                        </div>

                                        {attachmentFiles.length > 0 && (
                                            <div className="space-y-2">
                                                {attachmentFiles.map(
                                                    (file, index) => {
                                                        const isFileInstance =
                                                            file instanceof File
                                                        const displayName =
                                                            isFileInstance
                                                                ? file.name
                                                                : (file as { fileName: string }).fileName
                                                        const fileUrl =
                                                            isFileInstance
                                                                ? undefined
                                                                : (file as { filePath: string }).filePath

                                                        return (
                                                            <div
                                                                key={index}
                                                                className="flex items-center justify-between p-2 border rounded"
                                                            >
                                                                {fileUrl ? (
                                                                    <a
                                                                        href={
                                                                            fileUrl
                                                                        }
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="text-sm text-blue-600 dark:text-blue-300 truncate hover:underline"
                                                                    >
                                                                        {
                                                                            displayName
                                                                        }
                                                                    </a>
                                                                ) : (
                                                                    <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                                                                        {
                                                                            displayName
                                                                        }
                                                                    </span>
                                                                )}

                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        handleAttachmentRemove(
                                                                            index,
                                                                        )
                                                                    }
                                                                    className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 ml-2"
                                                                >
                                                                    <HiOutlineTrash />
                                                                </button>
                                                            </div>
                                                        )
                                                    },
                                                )}
                                            </div>
                                        )}
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
                                        onClick={() => onDelete(() => {})}
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

AdibReportForm.displayName = 'AdibReportForm'

export default AdibReportForm