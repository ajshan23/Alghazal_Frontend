import { forwardRef, useState, useEffect } from 'react';
import { FormContainer } from '@/components/ui/Form';
import Button from '@/components/ui/Button';
import StickyFooter from '@/components/shared/StickyFooter';
import { Form, Formik, FormikProps } from 'formik';
import * as Yup from 'yup';
import toast from '@/components/ui/toast';
import Notification from '@/components/ui/Notification';
import { useNavigate, useParams } from 'react-router-dom';
import OnSiteComplaintBasicInfoFields from './Components/OnSiteComplaintBasicInfoFields';
import OnSiteComplaintDetailsFields from './Components/OnSiteComplaintDetailsFields';
import axios from 'axios';
import { BASE_URL } from '@/constants/app.constant';

// Types
type FormikRef = FormikProps<any>;

type InitialData = {
    customerName: string;
    customerAddress: string;
    complaintNumber: string;
    phoneNumbers: string[];
    make: string;
    dealerName: string;
    warrantyStatus: string;
    reportedComplaint: string;
};

export type FormModel = InitialData;

export type SetSubmitting = (isSubmitting: boolean) => void;

type OnSiteComplaintFormProps = {
    onDiscard?: () => void;
};

// Validation Schema
const validationSchema = Yup.object().shape({
    customerName: Yup.string().required('Customer Name is required'),
    customerAddress: Yup.string().required('Customer Address is required'),
    phoneNumbers: Yup.array()
        .of(Yup.string().required('Phone Number is required'))
        .min(1, 'At least one phone number is required'),
    complaintNumber: Yup.string().nullable(),
    make: Yup.string().nullable(),
    dealerName: Yup.string().nullable(),
    warrantyStatus: Yup.string().nullable(),
    reportedComplaint: Yup.string().nullable(),
}); 
const OnSiteComplaintForm = forwardRef<FormikRef, OnSiteComplaintFormProps>((props, ref) => {
    const { onDiscard } = props;
    const navigate = useNavigate();
    const { id } = useParams(); // Get the `id` parameter from the URL
    const type = id ? 'edit' : 'new';

    const [initialValues, setInitialValues] = useState<FormModel>({
        customerName: '',
        customerAddress: '',
        complaintNumber: '',
        phoneNumbers: [], // Initialize as an empty array
        make: '',
        dealerName: '',
        warrantyStatus: '',
        reportedComplaint: '',
    });

    // Fetch complaint details if in edit mode
    useEffect(() => {
        if (type === 'edit' && id) {
            const fetchComplaintDetails = async () => {
                try {
                    const response = await axios.get(`${BASE_URL}/onsite/${id}`);
                    console.log('API Response:', response.data); // Debug the response
                    const complaint = response.data.data;

                    // Update initial values
                    setInitialValues({
                        customerName: complaint.customerName,
                        customerAddress: complaint.customerAddress,
                        complaintNumber: complaint.complaintNumber,
                        phoneNumbers: complaint.phoneNumbers || [], // Ensure it's an array
                        make: complaint.make,
                        dealerName: complaint.dealerName,
                        warrantyStatus: complaint.warrantyStatus,
                        reportedComplaint: complaint.reportedComplaint,
                    });
                } catch (error) {
                    console.error('Error fetching complaint details:', error);
                    toast.push(
                        <Notification title="Error" type="danger" duration={2500}>
                            Failed to fetch complaint details. Please try again.
                        </Notification>,
                        { placement: 'top-center' }
                    );
                }
            };

            fetchComplaintDetails();
        }
    }, [id, type]);

    const handleFormSubmit = async (values: FormModel, { setSubmitting }: { setSubmitting: SetSubmitting }) => {
        setSubmitting(true);

        try {
            const url = type === 'new' 
                ? `${BASE_URL}/onsite` 
                : `${BASE_URL}/onsite/${id}`;
            const method = type === 'new' ? 'post' : 'put';

            console.log('Sending payload:', values); // Debug payload
            const response = await axios[method](url, values);

            if (response.status !== (type === 'new' ? 201 : 200)) {
                throw new Error(`Failed to ${type === 'new' ? 'create' : 'update'} complaint`);
            }

            toast.push(
                <Notification title={`Complaint ${type === 'new' ? 'Created' : 'Updated'}`} type="success" duration={2500}>
                    Complaint {type === 'new' ? 'created' : 'updated'} successfully.
                </Notification>,
                { placement: 'top-center' }
            );

            navigate(-1);
        } catch (error:any) {
            console.error(`Error ${type === 'new' ? 'creating' : 'updating'} complaint:`, error);
            if (error.response) {
                console.error('API Response:', error.response.data);
            }
            toast.push(
                <Notification title="Error" type="danger" duration={2500}>
                    Failed to {type === 'new' ? 'create' : 'update'} complaint. Please try again.
                </Notification>,
                { placement: 'top-center' }
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <>
            <Formik
                innerRef={ref}
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleFormSubmit}
                enableReinitialize // Allow reinitialization of form values
            >
                {({ values, touched, errors, isSubmitting }) => (
                    <Form>
                        <FormContainer>
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                <div className="lg:col-span-2">
                                    <OnSiteComplaintBasicInfoFields
                                        touched={touched}
                                        errors={errors}
                                        values={values}
                                    />
                                    <OnSiteComplaintDetailsFields
                                        touched={touched}
                                        errors={errors}
                                        values={values}
                                    />
                                </div>
                            </div>
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
                                <div className="md:flex items-center">
                                    <Button
                                        size="sm"
                                        variant="solid"
                                        loading={isSubmitting}
                                        type="submit"
                                    >
                                        {type === 'new' ? 'Create Complaint' : 'Update Complaint'}
                                    </Button>
                                </div>
                            </StickyFooter>
                        </FormContainer>
                    </Form>
                )}
            </Formik>
        </>
    );
});

OnSiteComplaintForm.displayName = 'OnSiteComplaintForm';

export default OnSiteComplaintForm;