import { useState, useEffect } from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Input, FormItem, toast, Notification } from '@/components/ui';
import AvatarImage from './AvatarImage'; // Import the AvatarImage component
import { BASE_URL } from '@/constants/app.constant';

// Define the form values type
type FormValues = {
  workerName: string;
  phoneNumber: string;
  workerImage: File | null;
};

// Validation Schema
const validationSchema = Yup.object().shape({
  workerName: Yup.string().required('Worker Name is required'),
  phoneNumber: Yup.string()
    .required('Phone Number is required')
    .matches(/^\d{10}$/, 'Phone Number must be 10 digits'),
  workerImage: Yup.mixed().nullable(), // Make workerImage optional for editing
});

const WorkerCreatePage = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Get the worker ID from the URL params
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initialValues, setInitialValues] = useState<FormValues>({
    workerName: '',
    phoneNumber: '',
    workerImage: null,
  });
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null); // Store the existing image URL

  // Fetch worker data if editing
  useEffect(() => {
    if (id) {
      const fetchWorker = async () => {
        try {
          const response = await axios.get(`${BASE_URL}/worker/specific`, {
            params: { id }, // Pass the worker ID as a query parameter
          });
          const worker = response.data.data; // Access the worker data from the response

          setInitialValues({
            workerName: worker.workerName,
            phoneNumber: worker.phoneNumber,
            workerImage: null, // Set to null initially; we'll handle the image separately
          });

          // Set the existing image URL
          setExistingImageUrl(worker.workerImage);
        } catch (error) {
          console.error('Error fetching worker:', error);
          toast.push(
            <Notification title="Error" type="danger" duration={2500}>
              Failed to fetch worker data. Please try again.
            </Notification>,
            { placement: 'top-center' }
          );
        }
      };

      fetchWorker();
    }
  }, [id]);

  const handleSubmit = async (values: FormValues) => {
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append('workerName', values.workerName);
    formData.append('phoneNumber', values.phoneNumber);
    if (values.workerImage) {
      formData.append('image', values.workerImage);
    }
    // Add workerId to formData if in edit mode
    if (id) {
      formData.append('workerId', id);
    }

    try {
      let response;
      if (id) {
        // Edit worker
        response = await axios.put(`${BASE_URL}/worker/edit`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          }
        });
      } else {
        // Create worker
        response = await axios.post(`${BASE_URL}/worker`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      }

      if (response.status !== 200 && response.status !== 201) {
        throw new Error('Failed to save worker');
      }

      toast.push(
        <Notification
          title={id ? 'Worker Updated' : 'Worker Created'}
          type="success"
          duration={2500}
        >
          {id ? 'Worker updated successfully.' : 'Worker created successfully.'}
        </Notification>,
        { placement: 'top-center' }
      );

      navigate(-1);
    } catch (error) {
      console.error('Error saving worker:', error);
      toast.push(
        <Notification title="Error" type="danger" duration={2500}>
          {id
            ? 'Failed to update worker. Please try again.'
            : 'Failed to create worker. Please try again.'}
        </Notification>,
        { placement: 'top-center' }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6">
      <h3 className="mb-6">{id ? 'Edit Worker' : 'Create Worker'}</h3>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize // Reinitialize the form when initialValues change
      >
        {({ setFieldValue, values, touched, errors }) => (
          <Form>
            <div className="space-y-6">
              {/* Worker Name Field */}
              <FormItem
                label="Worker Name"
                invalid={!!errors.workerName && touched.workerName}
                errorMessage={errors.workerName}
              >
                <Field
                  type="text"
                  autoComplete="off"
                  name="workerName"
                  placeholder="Worker Name"
                  component={Input}
                />
              </FormItem>

              {/* Phone Number Field */}
              <FormItem
                label="Phone Number"
                invalid={!!errors.phoneNumber && touched.phoneNumber}
                errorMessage={errors.phoneNumber}
              >
                <Field
                  type="text"
                  autoComplete="off"
                  name="phoneNumber"
                  placeholder="Phone Number"
                  component={Input}
                />
              </FormItem>

              {/* Worker Image Upload */}
              <FormItem
                label="Worker Image"
                invalid={!!errors.workerImage && touched.workerImage}
                errorMessage={errors.workerImage}
              >
                <AvatarImage
                  onFileUpload={(files) => {
                    if (files.length > 0) {
                      setFieldValue('workerImage', files[0]); // Update Formik's state
                    }
                  }}
                  initialImage={existingImageUrl || undefined} // Convert null to undefined
                />
              </FormItem>

              {/* Submit Button */}
              <div className="flex justify-end">
                <Button
                  type="submit"
                  variant="solid"
                  loading={isSubmitting}
                  disabled={isSubmitting}
                >
                  {id ? 'Update Worker' : 'Create Worker'}
                </Button>
              </div>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default WorkerCreatePage;

