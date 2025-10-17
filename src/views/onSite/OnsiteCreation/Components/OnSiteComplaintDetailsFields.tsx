import AdaptableCard from '@/components/shared/AdaptableCard';
import Input from '@/components/ui/Input';
import { FormItem } from '@/components/ui/Form';
import { Field, FormikErrors, FormikTouched } from 'formik';

type FormFieldsName = {
    make: string;
    dealerName: string;
    warrantyStatus: string;
    reportedComplaint: string;
};

type OnSiteComplaintDetailsFieldsProps = {
    touched: FormikTouched<FormFieldsName>;
    errors: FormikErrors<FormFieldsName>;
    values: FormFieldsName;
};

const OnSiteComplaintDetailsFields = (props: OnSiteComplaintDetailsFieldsProps) => {
    const { touched, errors } = props;

    return (
        <AdaptableCard divider className="mb-4">
            <h5>Complaint Details</h5>
            <p className="mb-6">Section to configure complaint details</p>

            <FormItem
                label="Make"
                invalid={!!errors.make && touched.make}
                errorMessage={errors.make}
            >
                <Field
                    type="text"
                    autoComplete="off"
                    name="make"
                    placeholder="Make"
                    component={Input}
                />
            </FormItem>

            <FormItem
                label="Dealer Name"
                invalid={!!errors.dealerName && touched.dealerName}
                errorMessage={errors.dealerName}
            >
                <Field
                    type="text"
                    autoComplete="off"
                    name="dealerName"
                    placeholder="Dealer Name"
                    component={Input}
                />
            </FormItem>

            <FormItem
                label="Warranty Status"
                invalid={!!errors.warrantyStatus && touched.warrantyStatus}
                errorMessage={errors.warrantyStatus}
            >
                <Field
                    as="select"
                    name="warrantyStatus"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 dark:bg-[#1f2937] dark:border-gray-600 dark:text-white"
                >
                    <option value="">Select Warranty Status</option>
                    <option value="Warranty">Warranty</option>
                    <option value="Non-Warranty">Non-Warranty</option>
                </Field>
            </FormItem>

            <FormItem
                label="Reported Complaint"
                invalid={!!errors.reportedComplaint && touched.reportedComplaint}
                errorMessage={errors.reportedComplaint}
            >
                <Field
                    as="textarea"
                    name="reportedComplaint"
                    placeholder="Reported Complaint"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 dark:bg-[#1f2937] dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                    rows={3}
                />
            </FormItem>
        </AdaptableCard>
    );
};

export default OnSiteComplaintDetailsFields;