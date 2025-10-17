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
  onUpload: (files: File[], titles: string[], descriptions?: string[]) => void;
  projectId: string;
}

const ImageUploadModal = ({ isOpen, onClose, onUpload, projectId }: ImageUploadModalProps) => {
  const [files, setFiles] = useState<ImageFile[]>([]);
  const [titles, setTitles] = useState<string[]>([]);
  const [descriptions, setDescriptions] = useState<string[]>([]);
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
      setDescriptions(prevDescriptions => [...prevDescriptions, ...newFiles.map(() => '')]);
    }
    return false;
  };

  const handleTitleChange = (index: number, value: string) => {
    setTitles(prev => {
      const newTitles = [...prev];
      newTitles[index] = value;
      return newTitles;
    });
  };

  const handleDescriptionChange = (index: number, value: string) => {
    setDescriptions(prev => {
      const newDescriptions = [...prev];
      newDescriptions[index] = value;
      return newDescriptions;
    });
  };

  const handleRemove = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setTitles(prev => prev.filter((_, i) => i !== index));
    setDescriptions(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = () => {
    const fileObjects = files.map(fileItem => fileItem.file);
    onUpload(fileObjects, titles, descriptions);
    setFiles([]);
    setTitles([]);
    setDescriptions([]);
    onClose();
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      onRequestClose={onClose}
      width={800}
    >
      <div className="flex justify-between items-center mb-4">
        <h4>Upload Work Completion Images</h4>
       
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
          Upload images of completed work (JPEG, PNG)
        </p>
      </div>

      {files.length > 0 && (
        <div className="max-h-96 overflow-y-auto">
          {files.map((file, index) => (
            <div key={file.id} className="mb-4 p-4 border rounded">
              <div className="flex gap-4">
                <div className="w-24 h-24 bg-gray-100 rounded overflow-hidden">
                  {file.type.startsWith('image/') && (
                    <img
                      src={URL.createObjectURL(file.file)}
                      alt={file.name}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="flex-1">
                  <FormContainer>
                    <FormItem label="Title" className="mb-3">
                      <Input
                        value={titles[index] || ''}
                        onChange={(e) => handleTitleChange(index, e.target.value)}
                        placeholder="Enter image title"
                        required
                      />
                    </FormItem>
                    <FormItem label="Description (Optional)">
                      <Input
                        value={descriptions[index] || ''}
                        onChange={(e) => handleDescriptionChange(index, e.target.value)}
                        placeholder="Enter description"
                      />
                    </FormItem>
                  </FormContainer>
                </div>
                <Button
                  shape="circle"
                  variant="plain"
                  icon={<HiOutlineTrash />}
                  onClick={() => handleRemove(index)}
                  className="text-red-500 hover:text-red-600"
                />
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-end gap-2 mt-6">
        <Button variant="plain" onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="solid"
          onClick={handleUpload}
          disabled={files.length === 0 || titles.some(title => !title?.trim())}
        >
          Upload Images
        </Button>
      </div>
    </Dialog>
  );
};

export default ImageUploadModal;