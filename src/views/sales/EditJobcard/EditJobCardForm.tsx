import { useEffect, useState } from "react";
import { Formik, Form, Field, FormikProps } from "formik";
import * as Yup from "yup";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/toast";
import Notification from "@/components/ui/Notification";
import axios from "axios";
import JobCardImages from "./JobCardImages";
import JobCardWorkDetailsFields from "./JobCardWorkDetailsFields";
import JobCardMachineDetailsFields from "../JobCardList/Components/JobCardMachineDetailsFields";
import Button from "@/components/ui/Button";
import JobCardBasicInfoFields from "./JobCardBasicInfoFields";
import { BASE_URL } from "@/constants/app.constant";

type JobCardFormValues = {
  customerName: string;
  customerAddress: string;
  phoneNumber: string[]; // Updated to match backend response
  Make: string;
  HP?: number;
  KVA?: number;
  RPM?: number;
  Type: string;
  Frame: string;
  SrNo: string;
  DealerName: string;
  DealerNumber: string;
  works: string;
  spares: string;
  industrialworks: string;
  attachments: string[];
  warranty: boolean;
  others: string;
  images: Array<{ _id: string; image: string; fileType?: string }>;
  invoiceNumber: string;
  removedImages: string[];
  newFiles: File[];
};

type JobCardResponse = {
  data: {
    customerName: string;
    customerAddress: string;
    phoneNumber: string[]; // Updated to match backend response
    Make: string;
    HP?: number;
    KVA?: number;
    RPM?: number;
    Type: string;
    Frame: string;
    SrNo: string;
    DealerName: string;
    DealerNumber: string;
    works: string;
    spares: string;
    industrialworks: string;
    attachments: string[];
    warranty: boolean;
    others: string;
    images: Array<{ _id: string; image: string; fileType?: string }>;
    invoiceNumber: string;
    jobCardStatus: string;
  };
};

const validationSchema = Yup.object().shape({
  customerName: Yup.string().required("Customer Name is required"),
  customerAddress: Yup.string().required("Customer Address is required"),
  phoneNumber: Yup.array()
    .of(Yup.string().required("Phone Number is required"))
    .min(1, "At least one phone number is required"),
  Make: Yup.string().nullable(),
  HP: Yup.number().nullable(),
  KVA: Yup.number().nullable(),
  RPM: Yup.number().nullable(),
  Type: Yup.string().nullable(),
  Frame: Yup.string().nullable(),
  SrNo: Yup.string().nullable(),
  DealerName: Yup.string().nullable(),
  DealerNumber: Yup.string().nullable(),
  works: Yup.string().nullable(),
  spares: Yup.string().nullable(),
  industrialworks: Yup.string().nullable(),
  attachments: Yup.array().of(Yup.string()),
  warranty: Yup.boolean(),
  others: Yup.string().nullable(),
  images: Yup.array().of(Yup.mixed()),
  invoiceNumber: Yup.string().nullable(),
  removedImages: Yup.array().of(Yup.string()),
  newFiles: Yup.array().of(Yup.mixed()),
});

const EditJobCardForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [initialValues, setInitialValues] = useState<JobCardFormValues>({
    customerName: "",
    customerAddress: "",
    phoneNumber: [""], // Updated to match backend response
    Make: "",
    HP: undefined,
    KVA: undefined,
    RPM: undefined,
    Type: "",
    Frame: "",
    SrNo: "",
    DealerName: "",
    DealerNumber: "",
    works: "",
    spares: "",
    industrialworks: "",
    attachments: [],
    warranty: false,
    others: "",
    images: [],
    invoiceNumber: "",
    removedImages: [],
    newFiles: [],
  });
  const [isBilled, setIsBilled] = useState(false);

  // Fetch job card data
  useEffect(() => {
    const fetchJobCard = async () => {
      try {
        const response = await axios.get<JobCardResponse>(`${BASE_URL}/jobcards/${id}`);
        const jobCard = response.data.data;

        setIsBilled(jobCard.jobCardStatus === "Billed");

        setInitialValues({
          customerName: jobCard.customerName,
          customerAddress: jobCard.customerAddress,
          phoneNumber: jobCard.phoneNumber || [""], // Updated to match backend response
          Make: jobCard.Make,
          HP: jobCard.HP,
          KVA: jobCard.KVA,
          RPM: jobCard.RPM,
          Type: jobCard.Type,
          Frame: jobCard.Frame,
          SrNo: jobCard.SrNo,
          DealerName: jobCard.DealerName,
          DealerNumber: jobCard.DealerNumber,
          works: jobCard.works,
          spares: jobCard.spares,
          industrialworks: jobCard.industrialworks,
          attachments: jobCard.attachments || [],
          warranty: jobCard.warranty,
          others: jobCard.others,
          images: jobCard.images.map((img) => ({
            ...img,
            fileType: img.fileType || (img.image.toLowerCase().endsWith('.pdf') ? 'application/pdf' : 'image/jpeg'),
          })) || [],
          invoiceNumber: jobCard.invoiceNumber,
          removedImages: [],
          newFiles: [],
        });
      } catch (error) {
        console.error("Error fetching job card:", error);
        toast.push(
          <Notification title="Error" type="danger" duration={2500}>
            Failed to fetch job card. Please try again.
          </Notification>,
          { placement: "top-center" }
        );
      }
    };
    if (id) {
      fetchJobCard();
    }
  }, [id]);

  const handleFormSubmit = async (values: JobCardFormValues, { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void }) => {
    setSubmitting(true);

    const formData = new FormData();

    // Append all fields to FormData
    Object.keys(values).forEach((key) => {
      const value = values[key as keyof JobCardFormValues];
      
      if (key === 'newFiles' && Array.isArray(value)) {
        // Handle new file uploads
        (value as File[]).forEach((file) => {
          formData.append('files', file);
        });
      } else if (key === 'removedImages' && Array.isArray(value)) {
        // Handle removed images
        (value as string[]).forEach((imageId) => {
          formData.append('removedImages', imageId);
        });
      } else if (key === 'attachments' && Array.isArray(value)) {
        // Handle attachments
        (value as string[]).forEach((attachment) => {
          formData.append('attachments', attachment);
        });
      } else if (key === 'phoneNumber' && Array.isArray(value)) {
        // Handle phone numbers
        (value as string[]).forEach((phone, index) => {
          formData.append(`phoneNumber[${index}]`, phone);
        });
      } else if (value !== undefined && value !== null) {
        // Handle all other fields
        formData.append(key, value.toString());
      }
    });

    try {
      const response = await axios.put(
        `${BASE_URL}/jobcards/${id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status !== 200) {
        throw new Error("Failed to update job card");
      }

      toast.push(
        <Notification title="Job Card Updated" type="success" duration={2500}>
          Job card updated successfully.
        </Notification>,
        { placement: "top-center" }
      );

      navigate(-1);
    } catch (error) {
      console.error("Error updating job card:", error);
      toast.push(
        <Notification title="Error" type="danger" duration={2500}>
          Failed to update job card. Please try again.
        </Notification>,
        { placement: "top-center" }
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleFormSubmit}
      enableReinitialize
    >
      {({ values, touched, errors, isSubmitting, setFieldValue }) => {
        // Only check for required fields: customerName, customerAddress, and phoneNumber
        const hasRequiredFieldErrors = errors.customerName || errors.customerAddress || errors.phoneNumber;
        if (hasRequiredFieldErrors && Object.keys(touched).length > 0) {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        return (
          <Form>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2">
                <JobCardBasicInfoFields
                  touched={touched}
                  errors={errors}
                  values={values}
                  setFieldValue={setFieldValue}
                />
                <JobCardMachineDetailsFields
                  touched={touched}
                  errors={errors}
                  values={values}
                />
                <JobCardWorkDetailsFields
                  touched={touched}
                  errors={errors}
                />

                {isBilled && (
                  <div className="mb-4">
                    <label htmlFor="invoiceNumber" className="block text-sm font-medium text-gray-700">
                      Invoice Number
                    </label>
                    <Field
                      type="text"
                      name="invoiceNumber"
                      placeholder="Invoice Number"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 dark:bg-[#1f2937] dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                    />
                  </div>
                )}
              </div>
              <div className="lg:col-span-1">
                <JobCardImages values={{ images: values.images, removedImages: values.removedImages }} setFieldValue={setFieldValue} />
              </div>
            </div>

            <div className="mt-6">
              <Button
                variant="solid"
                type="submit"
                loading={isSubmitting}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Updating..." : "Update Job Card"}
              </Button>
            </div>
          </Form>
        );
      }}
    </Formik>
  );
};

export default EditJobCardForm;