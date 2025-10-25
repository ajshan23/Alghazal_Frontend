import { forwardRef, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { FormContainer } from '@/components/ui/Form'
import Button from '@/components/ui/Button'
import hooks from '@/components/ui/hooks'
import StickyFooter from '@/components/shared/StickyFooter'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import { Form, Formik, FormikProps } from 'formik'
import LpoFormFields from './LpoFormFields'
import { HiOutlineTrash } from 'react-icons/hi'
import { AiOutlineSave } from 'react-icons/ai'
import * as Yup from 'yup'

import { useAppSelector } from '@/store'
import { useNavigate } from 'react-router-dom'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import { createLPO, deleteLPO, updateLPO, fetchLPODetails } from '../../api/api'

type FormikRef = FormikProps<any>

interface ILPOFormValues {
    id?: string
    projectId: string
    lpoNumber: string
    lpoDate: string
    supplier: string
    items: {
        description: string
        quantity: number
        unitPrice: number
    }[]
    documents: File[]
    existingDocuments?: any[]
}

type LpoFormProps = {
    initialData?: ILPOFormValues
    type: 'edit' | 'new'
    onDiscard?: () => void
}

const { useUniqueId } = hooks

// Helper function to format date properly for input
const formatDateForInput = (dateString: string): string => {
    if (!dateString) return '';
    
    try {
        // If it's already in YYYY-MM-DD format, return as is
        if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
            return dateString;
        }
        
        // Parse the date and format it
        const date = new Date(dateString);
        
        // Check if date is valid
        if (isNaN(date.getTime())) {
            console.error('Invalid date:', dateString);
            return '';
        }
        
        // Get local date string in YYYY-MM-DD format
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        
        return `${year}-${month}-${day}`;
    } catch (error) {
        console.error('Error formatting date:', error);
        return '';
    }
};

const validationSchema = Yup.object().shape({
    lpoNumber: Yup.string().required('LPO Number is required'),
    lpoDate: Yup.string().required('LPO Date is required'),
    supplier: Yup.string().required('Supplier is required'),
    items: Yup.array().of(
        Yup.object().shape({
            description: Yup.string().required('Description is required'),
            quantity: Yup.number()
                .required('Quantity is required')
                .min(1, 'Quantity must be at least 1'),
            unitPrice: Yup.number()
                .required('Unit price is required')
                .min(0, 'Unit price cannot be negative'),
        })
    ).min(1, 'At least one item is required'),
})

const LpoForm = forwardRef<FormikRef, LpoFormProps>((props, ref) => {
    const { lpoId, projectId } = useParams()
    const navigate = useNavigate()
    const userId = useAppSelector((state) => state.auth.user?.id)
    const [deleteConfirm, setDeleteConfirm] = useState(false)
    const { onDiscard } = props
    const [isLoading, setIsLoading] = useState(!!lpoId)
    const [formType, setFormType] = useState<'edit' | 'new'>(lpoId ? 'edit' : 'new')
    const [formInitialValues, setFormInitialValues] = useState<ILPOFormValues>({
        id: '',
        projectId: projectId || '',
        lpoNumber: '',
        lpoDate: '',
        supplier: '',
        items: [{ description: '', quantity: 0, unitPrice: 0 }],
        documents: [],
        existingDocuments: []
    })

    useEffect(() => {
        if (!projectId || projectId.length === 0) {
            navigate("/")
            return
        }

        const fetchLpoData = async () => {
            if (formType === 'edit' && lpoId) {
                try {
                    const response = await fetchLPODetails(projectId)
                    const lpoData = response.data
                    
                    // Debug logging
                    console.log('Original lpoDate from API:', lpoData.lpoDate);
                    const formattedDate = formatDateForInput(lpoData.lpoDate);
                    console.log('Formatted lpoDate for input:', formattedDate);
                    
                    setFormInitialValues({
                        id: lpoData._id,
                        projectId: lpoData.project,
                        lpoNumber: lpoData.lpoNumber,
                        lpoDate: formattedDate,
                        supplier: lpoData.supplier,
                        items: lpoData.items.map((item: any) => ({
                            description: item.description,
                            quantity: item.quantity,
                            unitPrice: item.unitPrice
                        })),
                        documents: [],
                        existingDocuments: lpoData.documents
                    })
                } catch (error) {
                    console.error('Error fetching LPO data:', error)
                    toast.push(
                        <Notification title="Failed to load LPO data" type="danger" />,
                        { placement: 'top-center' }
                    )
                    navigate(`/app/project-view/${projectId}`)
                } finally {
                    setIsLoading(false)
                }
            } else {
                setIsLoading(false)
            }
        }

        fetchLpoData()
    }, [formType, lpoId, projectId, navigate])

    const handleSubmit = async (
        values: ILPOFormValues,
        setSubmitting: (isSubmitting: boolean) => void
    ) => {
        setSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('projectId', values.projectId);
            formData.append('lpoNumber', values.lpoNumber);
            formData.append('lpoDate', values.lpoDate);
            formData.append('supplier', values.supplier);
            
            // Stringify items array
            formData.append('items', JSON.stringify(values.items));
            
            // Append each file
            values.documents.forEach(file => {
                formData.append('documents', file);
            });

            // Append existing document URLs for edit
            if (formType === 'edit' && values.existingDocuments) {
                formData.append('existingDocuments', JSON.stringify(values.existingDocuments));
            }

            let response;
            if (formType === 'new') {
                response = await createLPO(formData);
                toast.push(
                    <Notification title="LPO created successfully" type="success" />,
                    { placement: 'top-center' }
                );
            } else {
                response = await updateLPO(values.id as string, formData);
                toast.push(
                    <Notification title="LPO updated successfully" type="success" />,
                    { placement: 'top-center' }
                );
            }

            navigate(`/app/project-view/${projectId}`);
        } catch (error) {
            console.error('Error submitting LPO:', error);
            toast.push(
                <Notification 
                    title="Failed to save LPO" 
                    type="danger" 
                />,
                { placement: 'top-center' }
            );
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        try {
            if (!formInitialValues?.id) return
            
            await deleteLPO(formInitialValues.id)
            toast.push(
                <Notification title="LPO deleted successfully" type="success" />,
                { placement: 'top-center' }
            )
            navigate(`/app/project-view/${projectId}`)
        } catch (error) {
            toast.push(
                <Notification title="Failed to delete LPO" type="danger" />,
                { placement: 'top-center' }
            )
        }
    }

    const handleDiscard = () => {
        if (onDiscard) {
            onDiscard()
        } else {
            navigate(`/app/project-view/${projectId}`)
        }
    }

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        )
    }

    return (
        <>
            <Formik
                innerRef={ref}
                initialValues={formInitialValues}
                validationSchema={validationSchema}
                onSubmit={(values: ILPOFormValues, { setSubmitting }) => {
                    handleSubmit(values, setSubmitting)
                }}
                enableReinitialize
            >
                {({ values, touched, errors, isSubmitting, setFieldValue }) => {
                    // Debug log to see current form values
                    console.log('Current form lpoDate value:', values.lpoDate);
                    
                    return (
                        <Form>
                            <FormContainer>
                                <div className="mb-6">
                                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                                        {formType === 'new' ? 'Create New LPO' : 'Edit LPO'}
                                    </h1>
                                    <p className="text-gray-500 dark:text-gray-400">
                                        {formType === 'new' 
                                            ? 'Create a new purchase order for the project' 
                                            : 'Update the purchase order details'}
                                    </p>
                                </div>
                                
                                <LpoFormFields
                                    touched={touched}
                                    errors={errors}
                                    values={values}
                                    setFieldValue={setFieldValue}
                                    type={formType}
                                />
                                
                                <StickyFooter
                                    className="-mx-8 px-8 flex items-center justify-between py-4"
                                    stickyClass="border-t bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                                >
                                    <div>
                                        {formType === 'edit' && (
                                            <>
                                                <Button
                                                    className="text-red-600"
                                                    variant="plain"
                                                    size="sm"
                                                    icon={<HiOutlineTrash />}
                                                    type="button"
                                                    onClick={() => setDeleteConfirm(true)}
                                                >
                                                    Delete
                                                </Button>
                                                <ConfirmDialog
                                                    isOpen={deleteConfirm}
                                                    type="danger"
                                                    title="Delete LPO"
                                                    confirmButtonColor="red-600"
                                                    onClose={() => setDeleteConfirm(false)}
                                                    onRequestClose={() => setDeleteConfirm(false)}
                                                    onCancel={() => setDeleteConfirm(false)}
                                                    onConfirm={handleDelete}
                                                >
                                                    <p>
                                                        Are you sure you want to delete this LPO? This action cannot
                                                        be undone.
                                                    </p>
                                                </ConfirmDialog>
                                            </>
                                        )}
                                    </div>
                                    <div className="md:flex items-center">
                                        <Button
                                            size="sm"
                                            className="ltr:mr-3 rtl:ml-3"
                                            type="button"
                                            onClick={handleDiscard}
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
                                            {formType === 'new' ? 'Create LPO' : 'Save Changes'}
                                        </Button>
                                    </div>
                                </StickyFooter>
                            </FormContainer>
                        </Form>
                    )
                }}
            </Formik>
        </>
    )
})

LpoForm.displayName = 'LpoForm'

export default LpoForm