import { useState, useRef } from 'react';
import { Button, Dialog, FormItem, FormContainer, Input, Upload } from '@/components/ui';
import { HiOutlineCloudUpload, HiOutlineTrash, HiOutlineX } from 'react-icons/hi';

interface ImageFile {
  id: string;
  name: string;
  type: string;
  size: number;
  file: File;
}

interface ImageUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (files: File[], titles: string[]) => void; // Remove descriptions
  quotationId: string;
}

const ImageUploadModal = ({ isOpen, onClose, onUpload, quotationId }: ImageUploadModalProps) => {
  const [files, setFiles] = useState<ImageFile[]>([]);
  const [titles, setTitles] = useState<string[]>([]);
  // Remove descriptions state
  const uploadRef = useRef<HTMLInputElement>(null);

  const beforeUpload = (fileList: FileList | null) => {
    if (fileList && fileList.length > 0) {
      const newFiles: ImageFile[] = Array.from(fileList).map((file) => ({
        id: `${file.name}-${Date.now()}`,
        name: file.name,
        type: file.type,
        size: file.size,
        file,
      }));

      setFiles(prevFiles => [...prevFiles, ...newFiles]);
      setTitles(prevTitles => [...prevTitles, ...newFiles.map(() => '')]);
      // Remove descriptions initialization
      
      return true;
    }
    
    return true;
  };

  const handleTitleChange = (index: number, value: string) => {
    setTitles(prev => {
      const newTitles = [...prev];
      newTitles[index] = value;
      return newTitles;
    });
  };

  const handleRemove = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setTitles(prev => prev.filter((_, i) => i !== index));
    // Remove descriptions removal
  };

  const handleUpload = () => {
    const fileObjects = files.map(fileItem => fileItem.file);
    onUpload(fileObjects, titles); // Remove descriptions parameter
    setFiles([]);
    setTitles([]);
    onClose();
  };

  const isFormValid = files.length > 0 && titles.every(title => title?.trim());

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      onRequestClose={onClose}
      width={800}
    >
      <div className="flex justify-between items-center mb-4">
        <h4>Upload Quotation Images</h4>
        <Button
          shape="circle"
          variant="plain"
          icon={<HiOutlineX />}
          onClick={onClose}
        />
      </div>
      
      <div className="mb-6">
        <Upload
          ref={uploadRef}
          beforeUpload={beforeUpload}
          showList={false}
          multiple
          accept="image/*"
        >
          <Button
            variant="solid"
            icon={<HiOutlineCloudUpload />}
            type="button"
          >
            Select Images
          </Button>
        </Upload>
        <p className="text-xs text-gray-500 mt-2">
          Upload images for quotation (JPEG, PNG, GIF supported)
        </p>
      </div>

      {files.length > 0 && (
        <div className="max-h-96 overflow-y-auto border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              {files.length} image{files.length > 1 ? 's' : ''} selected
            </span>
            <Button
              size="xs"
              variant="plain"
              onClick={() => {
                setFiles([]);
                setTitles([]);
              }}
              className="text-red-500 hover:text-red-600"
            >
              Clear All
            </Button>
          </div>
          
          {files.map((file, index) => (
            <div key={file.id} className="mb-4 p-4 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 last:mb-0">
              <div className="flex gap-4">
                <div className="w-24 h-24 bg-gray-100 dark:bg-gray-600 rounded-lg overflow-hidden flex-shrink-0">
                  {file.type.startsWith('image/') && (
                    <img
                      src={URL.createObjectURL(file.file)}
                      alt={file.name}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <FormContainer layout="vertical" size="sm">
                    <FormItem 
                      label="Title *" 
                      className="mb-3"
                      asterisk
                    >
                      <Input
                        value={titles[index] || ''}
                        onChange={(e) => handleTitleChange(index, e.target.value)}
                        placeholder="Enter image title"
                        required
                        size="sm"
                      />
                    </FormItem>
                    {/* Remove description form item */}
                  </FormContainer>
                </div>
                <div className="flex flex-col gap-2 flex-shrink-0">
                  <Button
                    shape="circle"
                    variant="plain"
                    size="sm"
                    icon={<HiOutlineTrash />}
                    onClick={() => handleRemove(index)}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                    title="Remove image"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
        <Button variant="plain" onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="solid"
          onClick={handleUpload}
          disabled={!isFormValid}
          className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Upload {files.length > 0 ? `${files.length} Image${files.length > 1 ? 's' : ''}` : 'Images'}
        </Button>
      </div>
    </Dialog>
  );
};

export default ImageUploadModal;