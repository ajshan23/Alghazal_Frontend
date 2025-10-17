import AdaptableCard from '@/components/shared/AdaptableCard';
import Input from '@/components/ui/Input';
import { FormItem } from '@/components/ui/Form';
import { Field, FormikErrors, FormikTouched } from 'formik';
import { useState } from 'react';

type FormFieldsName = {
    Make: string;
    HP?: number;
    KVA?: number;
    RPM?: number;
    Type?: string;
    Frame: string;
    SrNo: string;
    DealerName?: string;
    DealerNumber?: string;
    warranty?: boolean;
};

type JobCardMachineDetailsFieldsProps = {
    touched: FormikTouched<FormFieldsName>;
    errors: FormikErrors<FormFieldsName>;
    values: {
        HP?: number;
        KVA?: number;
    };
};

const JobCardMachineDetailsFields = (props: JobCardMachineDetailsFieldsProps) => {
    const { touched, errors, values } = props;
    const [selectedOption, setSelectedOption] = useState<'HP' | 'KVA'>('HP');

    const handleInputKeyDown = (e: React.KeyboardEvent<HTMLElement>, nextFieldName?: string) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (nextFieldName) {
                const nextField = document.querySelector(`[name="${nextFieldName}"]`) as HTMLElement;
                nextField?.focus();
            }
        }
    };

    return (
        <AdaptableCard divider className="mb-4">
            <h5>Machine Details</h5>
            <p className="mb-6">Section to configure machine information</p>
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Fields marked with * are required
            </div>

            <FormItem
                label="Make *"
                invalid={!!errors.Make && touched.Make}
                errorMessage={errors.Make}
            >
                <Field
                    type="text"
                    autoComplete="off"
                    name="Make"
                    placeholder="Make"
                    component={Input}
                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => handleInputKeyDown(e, 'HP')}
                />
            </FormItem>

            <FormItem label="Select HP or KVA (Optional)">
                <div className="flex items-center gap-4 mb-4">
                    <label className="flex items-center">
                        <Field
                            type="radio"
                            name="selectedOption"
                            value="HP"
                            checked={selectedOption === 'HP'}
                            onChange={() => setSelectedOption('HP')}
                            className="mr-2"
                        />
                        HP
                    </label>
                    <label className="flex items-center">
                        <Field
                            type="radio"
                            name="selectedOption"
                            value="KVA"
                            checked={selectedOption === 'KVA'}
                            onChange={() => setSelectedOption('KVA')}
                            className="mr-2"
                        />
                        KVA
                    </label>
                </div>
                {selectedOption === 'HP' && (
                    <FormItem
                        label="HP"
                        invalid={!!errors.HP && touched.HP}
                        errorMessage={errors.HP}
                    >
                        <Field
                            type="number"
                            autoComplete="off"
                            name="HP"
                            placeholder="Enter HP"
                            component={Input}
                            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => handleInputKeyDown(e, 'RPM')}
                        />
                    </FormItem>
                )}
                {selectedOption === 'KVA' && (
                    <FormItem
                        label="KVA"
                        invalid={!!errors.KVA && touched.KVA}
                        errorMessage={errors.KVA}
                    >
                        <Field
                            type="number"
                            autoComplete="off"
                            name="KVA"
                            placeholder="Enter KVA"
                            component={Input}
                            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => handleInputKeyDown(e, 'RPM')}
                        />
                    </FormItem>
                )}
            </FormItem>

            <FormItem
                label="RPM (Optional)"
                invalid={!!errors.RPM && touched.RPM}
                errorMessage={errors.RPM}
            >
                <Field
                    as="select"
                    name="RPM"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 dark:bg-[#1f2937] dark:border-gray-600 dark:text-white"
                    onKeyDown={(e: React.KeyboardEvent<HTMLSelectElement>) => handleInputKeyDown(e, 'Type')}
                >
                    <option value="">Select RPM</option>
                    <option value="710">710 RPM</option>
                    <option value="960">960 RPM</option>
                    <option value="1440">1440 RPM</option>
                    <option value="2800">2800 RPM</option>
                </Field>
            </FormItem>

            <FormItem
                label="Type (Optional)"
                invalid={!!errors.Type && touched.Type}
                errorMessage={errors.Type}
            >
                <Field
                    type="text"
                    autoComplete="off"
                    name="Type"
                    placeholder="Type"
                    component={Input}
                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => handleInputKeyDown(e, 'Frame')}
                />
            </FormItem>

            <FormItem
                label="Frame (Optional)"
                invalid={!!errors.Frame && touched.Frame}
                errorMessage={errors.Frame}
            >
                <Field
                    type="text"
                    autoComplete="off"
                    name="Frame"
                    placeholder="Frame"
                    component={Input}
                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => handleInputKeyDown(e, 'SrNo')}
                />
            </FormItem>

            <FormItem
                label="Serial Number (Optional)"
                invalid={!!errors.SrNo && touched.SrNo}
                errorMessage={errors.SrNo}
            >
                <Field
                    type="text"
                    autoComplete="off"
                    name="SrNo"
                    placeholder="Serial Number"
                    component={Input}
                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => handleInputKeyDown(e, 'DealerName')}
                />
            </FormItem>

            <FormItem
                label="Dealer Name (Optional)"
                invalid={!!errors.DealerName && touched.DealerName}
                errorMessage={errors.DealerName}
            >
                <Field
                    type="text"
                    autoComplete="off"
                    name="DealerName"
                    placeholder="Dealer Name"
                    component={Input}
                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => handleInputKeyDown(e, 'DealerNumber')}
                />
            </FormItem>

            <FormItem
                label="Dealer Number (Optional)"
                invalid={!!errors.DealerNumber && touched.DealerNumber}
                errorMessage={errors.DealerNumber}
            >
                <Field
                    type="tel"
                    autoComplete="tel"
                    name="DealerNumber"
                    placeholder="Dealer Number"
                    component={Input}
                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => handleInputKeyDown(e, 'warranty')}
                />
            </FormItem>

            <FormItem label="Warranty (Optional)">
                <label className="flex items-center">
                    <Field
                        type="checkbox"
                        name="warranty"
                        className="mr-2"
                    />
                    Has Warranty
                </label>
            </FormItem>
        </AdaptableCard>
    );
};

export default JobCardMachineDetailsFields;