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
import { createLPO, deleteLPO, updateLPO } from '../../api/api'

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
    existingDocuments?: any[] // Add this for existing documents
}

type LpoFormProps = {
    initialData?: ILPOFormValues
    type: 'edit' | 'new'
    onDiscard?: () => void
}

const { useUniqueId } = hooks

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
    const { projectId, lpoId } = useParams()
    const navigate = useNavigate()
    const userId = useAppSelector((state) => state.auth.user?.id)
    const [deleteConfirm, setDeleteConfirm] = useState(false)
    const { type = "new", initialData, onDiscard } = props
    const [isLoading, setIsLoading] = useState(type === 'edit')
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
        }
    }, [])

    useEffect(() => {
        // const fetchLpoData = async () => {
        //     if (type === 'edit' && lpoId) {
        //         try {
        //             const response = await getLPODetails(lpoId)
        //             const lpoData = response.data
                    
        //             setFormInitialValues({
        //                 id: lpoData._id,
        //                 projectId: lpoData.project._id,
        //                 lpoNumber: lpoData.lpoNumber,
        //                 lpoDate: new Date(lpoData.lpoDate).toISOString().split('T')[0],
        //                 supplier: lpoData.supplier,
        //                 items: lpoData.items.map((item: any) => ({
        //                     description: item.description,
        //                     quantity: item.quantity,
        //                     unitPrice: item.unitPrice
        //                 })),
        //                 documents: [],
        //                 existingDocuments: lpoData.documents
        //             })
        //         } catch (error) {
        //             console.error('Error fetching LPO data:', error)
        //             toast.push(
        //                 <Notification title="Failed to load LPO data" type="danger" />,
        //                 { placement: 'top-center' }
        //             )
        //             navigate(`/app/project-view/${projectId}`)
        //         } finally {
        //             setIsLoading(false)
        //         }
        //     }
        // }

        // fetchLpoData()
    }, [type, lpoId, projectId, navigate])

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
            if (type === 'edit' && values.existingDocuments) {
                formData.append('existingDocuments', JSON.stringify(values.existingDocuments));
            }

            let response;
            if (type === 'new') {
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
                {({ values, touched, errors, isSubmitting, setFieldValue }) => (
                    <Form>
                        <FormContainer>
                            <LpoFormFields
                                touched={touched}
                                errors={errors}
                                values={values}
                                setFieldValue={setFieldValue}
                                type={type}
                            />
                            <StickyFooter
                                className="-mx-8 px-8 flex items-center justify-between py-4"
                                stickyClass="border-t bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                            >
                                <div>
                                    {type === 'edit' && (
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
                                        {type === 'new' ? 'Create' : 'Save'}
                                    </Button>
                                </div>
                            </StickyFooter>
                        </FormContainer>
                    </Form>
                )}
            </Formik>
        </>
    )
})

LpoForm.displayName = 'LpoForm'

export default LpoForm