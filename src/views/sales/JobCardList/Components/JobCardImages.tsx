import { useState } from 'react';
import AdaptableCard from '@/components/shared/AdaptableCard';
import Upload from '@/components/ui/Upload';
import { Field, FieldProps } from 'formik';
import { FormItem } from '@/components/ui';

type JobCardImagesProps = {
    values: {
        images: File[];
    };
};

const JobCardImages = (props: JobCardImagesProps) => {
    const { values } = props;

    const beforeUpload = (file: FileList | null, fileList: File[]) => {
        if (!file || file.length === 0) {
            return 'Please upload a file!';
        }

        const uploadedFile = file[0];

        const isImage = uploadedFile.type.startsWith('image/');
        const isPDF = uploadedFile.type === 'application/pdf';

        if (!isImage && !isPDF) {
            return 'Please upload an image or PDF file!';
        }

        const isLt2MB = uploadedFile.size / 1024 / 1024 <= 2;
        if (!isLt2MB) {
            return 'File size must be less than 2MB!';
        }

        return true;
    };

    return (
        <AdaptableCard className="mb-4">
            <h5>Job Card Files</h5>
            <p className="mb-6">Add or change files for the job card</p>
            <FormItem>
                <Field name="images">
                    {({ field, form }: FieldProps) => (
                        <Upload
                            draggable
                            beforeUpload={beforeUpload}
                            onChange={(files) => {
                                form.setFieldValue(field.name, files); // Update the form field
                            }}
                        >
                            <div className="my-16 text-center">
                                <p className="font-semibold">
                                    <span className="text-gray-800 dark:text-white">
                                        Drop your file here, or{' '}
                                    </span>
                                    <span className="text-blue-500">browse</span>
                                </p>
                                <p className="mt-1 opacity-60 dark:text-white">
                                    Support: jpeg, png, pdf
                                </p>
                            </div>
                        </Upload>
                    )}
                </Field>
            </FormItem>
        </AdaptableCard>
    );
};

export default JobCardImages;