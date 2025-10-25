import { useState } from "react";
import AdaptableCard from "@/components/shared/AdaptableCard";
import Upload from "@/components/ui/Upload";
import { Field, FieldProps } from "formik";
import { FormItem } from "@/components/ui";
import { FaFilePdf, FaDownload, FaTrash } from "react-icons/fa";

type JobCardImagesProps = {
  values: {
    images: Array<{ _id: string; image: string; fileType?: string }>;
    removedImages: string[];
  };
  setFieldValue: (field: string, value: any) => void;
};

const JobCardImages = (props: JobCardImagesProps) => {
  const { values, setFieldValue } = props;

  const beforeUpload = (file: FileList | null) => {
    if (!file || file.length === 0) {
      return "Please upload a file!";
    }

    const uploadedFile = file[0];
    const isImage = uploadedFile.type.startsWith("image/");
    const isPDF = uploadedFile.type === "application/pdf";

    if (!isImage && !isPDF) {
      return "Please upload an image or PDF file!";
    }

    const isLt2MB = uploadedFile.size / 1024 / 1024 <= 2;
    if (!isLt2MB) {
      return "File size must be less than 2MB!";
    }

    return true;
  };

  const handleNewFileUpload = (files: File[], fileList: File[]) => {
    console.log("New Files Added:", files); // Debugging: Log new files
    setFieldValue("newFiles", files); // Update newFiles in form state
  };

  const handleRemoveFile = (fileId: string) => {
    console.log("Removing File ID:", fileId); // Debugging: Log removed file ID
    setFieldValue("removedImages", [...values.removedImages, fileId]); // Add to removedImages
    const updatedImages = values.images.filter((img) => img._id !== fileId);
    setFieldValue("images", updatedImages); // Update images array
  };

  const renderFilePreview = (file: { _id: string; image: string; fileType?: string }) => {
    const isPDF = file.fileType === "application/pdf" || file.image.toLowerCase().endsWith(".pdf");

    return (
      <div className="relative group">
        {isPDF ? (
          <div className="flex items-center space-x-2 p-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
            <FaFilePdf className="text-red-500 w-6 h-6" />
            <div className="flex-1 min-w-0">
              <a
                href={file.image}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 truncate block"
              >
                View PDF
              </a>
            </div>
            <button
              onClick={() => handleRemoveFile(file._id)}
              className="text-red-500 hover:text-red-700 p-1"
              title="Remove file"
            >
              <FaTrash className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="relative group">
            <img
              src={file.image}
              alt="Preview"
              className="w-24 h-24 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
            />
            <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 flex items-center justify-center space-x-2 rounded-lg transition-opacity">
              <a
                href={file.image}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1 bg-white rounded-full hover:bg-gray-100"
                title="View image"
              >
                <FaDownload className="w-4 h-4 text-gray-700" />
              </a>
              <button
                onClick={() => handleRemoveFile(file._id)}
                className="p-1 bg-white rounded-full hover:bg-gray-100"
                title="Remove image"
              >
                <FaTrash className="w-4 h-4 text-red-500" />
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <AdaptableCard className="mb-4">
      <h5>Job Card Files</h5>
      <p className="mb-6">Add or change files for the job card</p>
      <FormItem>
        <Field name="images">
          {({ field, form }: FieldProps) => (
            <>
              {/* Display existing files */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                {values.images.map((file) => (
                  <div key={file._id}>{renderFilePreview(file)}</div>
                ))}
              </div>

              {/* Upload new files */}
              <Upload
                draggable
                beforeUpload={beforeUpload}
                onChange={handleNewFileUpload}
                accept=".jpg,.jpeg,.png,.pdf"
              >
                <div className="my-16 text-center">
                  <p className="font-semibold">
                    <span className="text-gray-800 dark:text-white">
                      Drop your files here, or{" "}
                    </span>
                    <span className="text-blue-500">browse</span>
                  </p>
                  <p className="mt-1 opacity-60 dark:text-white">
                    Support: jpeg, png, pdf (Max: 2MB)
                  </p>
                </div>
              </Upload>

              <input
                type="hidden"
                name="removedImages"
                value={JSON.stringify(values.removedImages)}
              />
            </>
          )}
        </Field>
      </FormItem>
    </AdaptableCard>
  );
};

export default JobCardImages;