import { useState, useEffect } from 'react';
import { Button, Dialog, FormItem, FormContainer, Input, Upload } from '@/components/ui';
import { HiOutlineCloudUpload, HiOutlineX, HiOutlinePhotograph } from 'react-icons/hi';

interface QuotationImage {
  _id: string;
  title: string;
  imageUrl: string;
  uploadedAt: string;
}

interface ImageEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (imageId: string, data: { title: string }) => void;
  onReplace: (imageId: string, file: File) => void;
  image: QuotationImage | null;
}

const ImageEditModal = ({ isOpen, onClose, onUpdate, onReplace, image }: ImageEditModalProps) => {
  const [title, setTitle] = useState('');
  const [replaceFile, setReplaceFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (image) {
      setTitle(image.title);
      setReplaceFile(null);
    }
  }, [image]);

  const handleBeforeUpload = (fileList: FileList | null) => {
    if (fileList && fileList.length > 0) {
      const file = fileList[0];
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return false;
      }
      setReplaceFile(file);
      return true; // Return true to indicate successful selection
    }
    return false;
  };

  const handleSubmit = async () => {
    if (!image) return;

    if (!title.trim()) {
      alert('Please enter a title for the image');
      return;
    }

    setIsSubmitting(true);
    try {
      // First update metadata
      await onUpdate(image._id, {
        title: title.trim(),
      });

      // Then replace image if a new file was selected
      if (replaceFile) {
        await onReplace(image._id, replaceFile);
      }

      onClose();
    } catch (error) {
      console.error('Error updating image:', error);
      alert('Failed to update image. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveReplaceFile = () => {
    setReplaceFile(null);
  };

  const handleClose = () => {
    setReplaceFile(null);
    setTitle(image?.title || '');
    onClose();
  };

  if (!image) return null;

  const previewUrl = replaceFile ? URL.createObjectURL(replaceFile) : image.imageUrl;

  return (
    <Dialog
      isOpen={isOpen}
      onClose={handleClose}
      onRequestClose={handleClose}
      width={800}
      height={600}
      style={{
        maxHeight: '90vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}
      contentClassName="flex flex-col h-full"
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200 dark:border-gray-600 flex-shrink-0">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Edit Image</h4>
        {/* <Button
          shape="circle"
          variant="plain"
          size="sm"
          icon={<HiOutlineX />}
          onClick={handleClose}
          className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
        /> */}
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto pr-2">
        <div className="flex flex-col lg:flex-row gap-6 mb-6">
          {/* Image Preview */}
          <div className="lg:w-1/2">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
              <div className="flex items-center gap-2 mb-3">
                <HiOutlinePhotograph className="text-lg text-gray-600 dark:text-gray-400" />
                <span className="font-medium text-gray-700 dark:text-gray-300">Image Preview</span>
              </div>
              <div className="aspect-square bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-600 overflow-hidden flex items-center justify-center">
                <img
                  src={previewUrl}
                  alt={title}
                  className="w-full h-full object-contain max-h-64"
                />
              </div>
              {replaceFile && (
                <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    New image selected: {replaceFile.name}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Form Fields */}
          <div className="lg:w-1/2">
            <FormContainer layout="vertical" size="sm">
              <FormItem 
                label="Title *" 
                className="mb-6"
                asterisk
              >
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter image title"
                  required
                />
              </FormItem>
            </FormContainer>

            {/* Replace Image Section */}
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
              <div className="flex items-center gap-3 mb-3">
                <HiOutlineCloudUpload className="text-lg text-gray-600 dark:text-gray-400" />
                <span className="font-semibold text-gray-700 dark:text-gray-300">Replace Image</span>
              </div>
              
              {replaceFile ? (
                <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-blue-700 dark:text-blue-300 truncate">
                      {replaceFile.name}
                    </p>
                    <p className="text-xs text-blue-600 dark:text-blue-400">
                      {(replaceFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <Button
                    size="xs"
                    variant="plain"
                    onClick={handleRemoveReplaceFile}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 ml-2"
                  >
                    Remove
                  </Button>
                </div>
              ) : (
                <div className="text-center p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-gray-400 dark:hover:border-gray-500 transition-colors">
                  <Upload
                    beforeUpload={handleBeforeUpload}
                    showList={false}
                    accept="image/*"
                  >
                    <Button
                      variant="twoTone"
                      icon={<HiOutlineCloudUpload />}
                      type="button"
                      size="sm"
                      className="mb-2"
                    >
                      Select New Image
                    </Button>
                  </Upload>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Choose a new image file to replace the current one
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons - Fixed at bottom */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-600 mt-auto flex-shrink-0">
        <Button 
          variant="plain" 
          onClick={handleClose}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          variant="solid"
          onClick={handleSubmit}
          loading={isSubmitting}
          disabled={!title.trim()}
          className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Updating...' : 'Update Image'}
        </Button>
      </div>
    </Dialog>
  );
};

export default ImageEditModal;