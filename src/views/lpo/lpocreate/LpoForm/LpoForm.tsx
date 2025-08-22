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
    documents: Yup.array()
        .min(1, 'At least one document is required')
        .required('Documents are required'),
})

const LpoForm = forwardRef<FormikRef, LpoFormProps>((props, ref) => {
    const { projectId } = useParams()
    const navigate = useNavigate()
    const userId = useAppSelector((state) => state.auth.user?.id)
    const [deleteConfirm, setDeleteConfirm] = useState(false)
    const { type="new", initialData, onDiscard } = props
    useEffect(()=>{
        if (!projectId|| projectId.length===0) {
            navigate("/")
        }
    },[])
    const newId = useUniqueId('lpo-')

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
            if (!initialData?.id) return
            
            await deleteLPO(initialData.id)
            toast.push(
                <Notification title="LPO deleted successfully" type="success" />,
                { placement: 'top-center' }
            )
            navigate(`/projects/${projectId}/lpos`)
        } catch (error) {
            toast.push(
                <Notification title="Failed to delete LPO" type="danger" />,
                { placement: 'top-center' }
            )
        }
    }

    return (
        <>
            <Formik
                innerRef={ref}
                initialValues={{
                    id: initialData?.id || '',
                    projectId: initialData?.projectId || projectId || '',
                    lpoNumber: initialData?.lpoNumber || '',
                    lpoDate: initialData?.lpoDate || '',
                    supplier: initialData?.supplier || '',
                    items: initialData?.items || [{ description: '', quantity: 0, unitPrice: 0 }],
                    documents: initialData?.documents || [],
                }}
                validationSchema={validationSchema}
                onSubmit={(values: ILPOFormValues, { setSubmitting }) => {
                    handleSubmit(values, setSubmitting)
                }}
            >
                {({ values, touched, errors, isSubmitting }) => (
                    <Form>
                        <FormContainer>
                            <LpoFormFields
                                touched={touched}
                                errors={errors}
                                values={values}
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