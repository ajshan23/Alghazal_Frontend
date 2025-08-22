import { useEffect, useState } from 'react';
import Button from '@/components/ui/Button';
import Loading from '@/components/shared/Loading';
import Logo from '@/components/template/Logo';
import { HiLocationMarker, HiUser, HiPlus, HiPencil } from 'react-icons/hi';
import useThemeClass from '@/utils/hooks/useThemeClass';
import { useAppSelector } from '@/store';
import dayjs from 'dayjs';
import { Notification, toast } from '@/components/ui';
import ImageUploadModal from './ImageUploadModal';
import { 
  apiGetCompletionData, 
  apiUploadCompletionImages, 
  apiCreateWorkCompletion, 
  apiDownloadCompletionCertificate,
  apiUpdateCompletionDate,
  apiUpdateHandoverDate,
  apiUpdateAcceptanceDate
} from '../../api/api';
import { useNavigate, useParams } from 'react-router-dom';
import { Input } from '@/components/ui';

type CompletionData = {
  _id: string;
  referenceNumber: string;
  fmContractor: string;
  subContractor: string;
  projectDescription: string;
  location: string;
  completionDate: string;
  lpoNumber: string;
  lpoDate: string;
  handover: {
    company: string;
    name: string;
    signature: string;
    date: string;
  };
  acceptance: {
    company: string;
    name: string;
    signature: string;
    date: string;
  };
  sitePictures: Array<{
    url: string;
    caption?: string;
  }>;
  project: {
    _id: string;
    projectName: string;
  };
  preparedBy: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  updatedAt: string;
};

const CompletionContent = () => {
  const { textTheme } = useThemeClass();
  const mode = useAppSelector((state) => state.theme.mode);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<CompletionData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [creatingCompletion, setCreatingCompletion] = useState(false);
  const [editingCompletionDate, setEditingCompletionDate] = useState(false);
  const [editingHandoverDate, setEditingHandoverDate] = useState(false);
  const [editingAcceptanceDate, setEditingAcceptanceDate] = useState(false);
  const [tempCompletionDate, setTempCompletionDate] = useState('');
  const [tempHandoverDate, setTempHandoverDate] = useState('');
  const [tempAcceptanceDate, setTempAcceptanceDate] = useState('');

  const { projectId } = useParams();
  const navigate = useNavigate();

  const fetchCompletionData = async () => {
    try {
      setLoading(true);
      const response = await apiGetCompletionData(projectId);
      setData(response.data);
    } catch (err) {
      console.error('Error fetching completion data:', err);
      setError('Failed to load completion data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!projectId) navigate("/app/dashboard");
    fetchCompletionData();
  }, [projectId]);

  const handleUploadImages = async (files: File[], titles: string[], descriptions?: string[]) => {
    try {
      setLoading(true);
      await apiUploadCompletionImages({
        projectId: projectId!,
        images: files,
        titles,
        descriptions
      });
      
      const response = await apiGetCompletionData(projectId);
      setData(response.data);
      
      toast.push(
        <Notification title="Success" type="success">
          Images uploaded successfully
        </Notification>
      );
    } catch (error) {
      console.error('Error uploading images:', error);
      toast.push(
        <Notification title="Error" type="danger">
          Failed to upload images: {error.response?.data?.message || error.message}
        </Notification>
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCompletion = async () => {
    try {
      setCreatingCompletion(true);
      const response = await apiCreateWorkCompletion(projectId);
      setData(response.data);
      toast.push(
        <Notification title="Success" type="success">
          Work completion created successfully
        </Notification>
      );
    } catch (error) {
      console.error('Error creating work completion:', error);
      toast.push(
        <Notification title="Error" type="danger">
          Failed to create work completion
        </Notification>
      );
    } finally {
      setCreatingCompletion(false);
    }
  };

  const handleDownloadPdf = async () => {
    setPdfLoading(true);
    setError('');
    
    try {
      await apiDownloadCompletionCertificate(projectId!);
      
      toast.push(
        <Notification title="Success" type="success">
          PDF downloaded successfully
        </Notification>
      );
    } catch (error) {
      console.error('Error downloading PDF:', error);
      setError('Failed to download PDF');
      
      let errorMessage = 'Failed to download PDF';
      if (error.response) {
        if (error.response.status === 404) {
          errorMessage = 'Project data not found for PDF generation';
        } else if (error.response.status === 400) {
          errorMessage = 'Invalid project data for PDF generation';
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        }
      }
      
      toast.push(
        <Notification title="Error" type="danger">
          {errorMessage}
        </Notification>
      );
    } finally {
      setPdfLoading(false);
    }
  };

  const handleUpdateCompletionDate = async () => {
    try {
      setLoading(true);
      const response = await apiUpdateCompletionDate(projectId!, tempCompletionDate);
      setData(response.data);
      toast.push(
        <Notification title="Success" type="success">
          Completion date updated successfully
        </Notification>
      );
      setEditingCompletionDate(false);
    } catch (error) {
      console.error('Error updating completion date:', error);
      toast.push(
        <Notification title="Error" type="danger">
          Failed to update completion date
        </Notification>
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateHandoverDate = async () => {
    try {
      setLoading(true);
      const response = await apiUpdateHandoverDate(projectId!, tempHandoverDate);
      setData(response.data);
      toast.push(
        <Notification title="Success" type="success">
          Handover date updated successfully
        </Notification>
      );
      setEditingHandoverDate(false);
    } catch (error) {
      console.error('Error updating handover date:', error);
      toast.push(
        <Notification title="Error" type="danger">
          Failed to update handover date
        </Notification>
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAcceptanceDate = async () => {
    try {
      setLoading(true);
      const response = await apiUpdateAcceptanceDate(projectId!, tempAcceptanceDate);
      setData(response.data);
      toast.push(
        <Notification title="Success" type="success">
          Acceptance date updated successfully
        </Notification>
      );
      setEditingAcceptanceDate(false);
    } catch (error) {
      console.error('Error updating acceptance date:', error);
      toast.push(
        <Notification title="Error" type="danger">
          Failed to update acceptance date
        </Notification>
      );
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div className="p-4 text-center text-red-500">
        {error}
        <Button className="mt-4" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <Loading loading={creatingCompletion} />
        <p className="mt-4 mb-6">No work completion record found for this project</p>
        <Button
          variant="solid"
          loading={creatingCompletion}
          onClick={handleCreateCompletion}
        >
          Create Work Completion
        </Button>
      </div>
    );
  }

  return (
    <Loading loading={loading}>
      <ImageUploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onUpload={handleUploadImages}
        projectId={projectId}
      />
      
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-10">
        <div>
          <Logo className="mb-3" mode={mode} />
          <h2 className="text-2xl font-bold mb-4">COMPLETION CERTIFICATE</h2>
        </div>
        <div className="my-4">
          <div className="mb-2">
            <h4>Reference: {data.referenceNumber}</h4>
            <div className="flex flex-col space-y-1">
              <span>
                Prepared On: {dayjs(data.createdAt).format('dddd, DD MMMM, YYYY')}
              </span>
            </div>
          </div>
          <div className="mt-4 flex">
            <HiUser className={`text-xl ${textTheme}`} />
            <div className="ltr:ml-3 rtl:mr-3">
              Prepared By: {data.preparedBy?.firstName} {data.preparedBy?.lastName}
            </div>
          </div>
          <div className="mt-4 flex">
            <HiLocationMarker className={`text-xl ${textTheme}`} />
            <div className="ltr:ml-3 rtl:mr-3">
              <h6>Project: {data.project.projectName}</h6>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <p><strong>FM Contractor:</strong> {data.fmContractor}</p>
            <p><strong>Sub Contractor:</strong> {data.subContractor}</p>
          </div>
          <div>
            <p><strong>Project Description:</strong> {data.projectDescription}</p>
            <p><strong>Location:</strong> {data.location}</p>
          </div>
        </div>
        
        <div className="my-6 p-4 bg-gray-50 dark:bg-gray-700 rounded">
          <p className="text-center italic">
            This is to certify that the work described above on project description has been cleared out and completed.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="flex items-center">
            <p><strong>Completion Date:</strong> </p>
            {editingCompletionDate ? (
              <div className="flex items-center ml-2">
                <Input
                  type="date"
                  value={tempCompletionDate}
                  onChange={(e) => setTempCompletionDate(e.target.value)}
                  className="ml-2 w-40"
                />
                <Button
                  size="xs"
                  className="ml-2"
                  onClick={handleUpdateCompletionDate}
                >
                  Save
                </Button>
                <Button
                  size="xs"
                  className="ml-2"
                  variant="plain"
                  onClick={() => setEditingCompletionDate(false)}
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <div className="flex items-center ml-2">
                {dayjs(data.completionDate).format('DD MMMM, YYYY')}
                <HiPencil
                  className={`ml-2 cursor-pointer ${textTheme}`}
                  onClick={() => {
                    setTempCompletionDate(data.completionDate.split('T')[0]);
                    setEditingCompletionDate(true);
                  }}
                />
              </div>
            )}
          </div>
          <div>
            <p><strong>LPO Number:</strong> {data.lpoNumber}</p>
          </div>
          <div>
            <p><strong>LPO Date:</strong> {dayjs(data.lpoDate).format('DD MMMM, YYYY')}</p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="border rounded p-4">
          <h5 className="font-bold mb-4 text-center">Hand Over By</h5>
          <table className="w-full">
            <tbody>
              <tr>
                <td className="py-2 font-semibold">Company:</td>
                <td className="py-2">{data.handover.company}</td>
              </tr>
              <tr>
                <td className="py-2 font-semibold">Name:</td>
                <td className="py-2">{data.handover.name}</td>
              </tr>
              <tr>
                <td className="py-2 font-semibold">Date:</td>
                <td className="py-2">
                  {editingHandoverDate ? (
                    <div className="flex items-center">
                      <Input
                        type="date"
                        value={tempHandoverDate}
                        onChange={(e) => setTempHandoverDate(e.target.value)}
                        className="w-40"
                      />
                      <Button
                        size="xs"
                        className="ml-2"
                        onClick={handleUpdateHandoverDate}
                      >
                        Save
                      </Button>
                      <Button
                        size="xs"
                        className="ml-2"
                        variant="plain"
                        onClick={() => setEditingHandoverDate(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      {dayjs(data.handover.date).format('DD MMMM, YYYY')}
                      <HiPencil
                        className={`ml-2 cursor-pointer ${textTheme}`}
                        onClick={() => {
                          setTempHandoverDate(data.handover.date.split('T')[0]);
                          setEditingHandoverDate(true);
                        }}
                      />
                    </div>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div className="border rounded p-4">
          <h5 className="font-bold mb-4 text-center">Accepted By</h5>
          <table className="w-full">
            <tbody>
              <tr>
                <td className="py-2 font-semibold">Company:</td>
                <td className="py-2">{data.acceptance.company}</td>
              </tr>
              <tr>
                <td className="py-2 font-semibold">Name:</td>
                <td className="py-2">{data.acceptance.name}</td>
              </tr>
              <tr>
                <td className="py-2 font-semibold">Date:</td>
                <td className="py-2">
                  {editingAcceptanceDate ? (
                    <div className="flex items-center">
                      <Input
                        type="date"
                        value={tempAcceptanceDate}
                        onChange={(e) => setTempAcceptanceDate(e.target.value)}
                        className="w-40"
                      />
                      <Button
                        size="xs"
                        className="ml-2"
                        onClick={handleUpdateAcceptanceDate}
                      >
                        Save
                      </Button>
                      <Button
                        size="xs"
                        className="ml-2"
                        variant="plain"
                        onClick={() => setEditingAcceptanceDate(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      {dayjs(data.acceptance.date).format('DD MMMM, YYYY')}
                      <HiPencil
                        className={`ml-2 cursor-pointer ${textTheme}`}
                        onClick={() => {
                          setTempAcceptanceDate(data.acceptance.date.split('T')[0]);
                          setEditingAcceptanceDate(true);
                        }}
                      />
                    </div>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h5 className="font-bold">Site Pictures:</h5>
          <Button
            variant="solid"
            icon={<HiPlus />}
            onClick={() => setUploadModalOpen(true)}
          >
            Add Images
          </Button>
        </div>
        
        {data.sitePictures.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {data.sitePictures.map((image, index) => (
              <div key={`image-${index}`} className="border rounded overflow-hidden">
                <img 
                  src={image.url} 
                  alt={image.caption || `Site Image ${index + 1}`}
                  className="w-full h-48 object-cover"
                />
                {image.caption && (
                  <div className="p-2 bg-gray-50 dark:bg-gray-700 text-center">
                    <p className="text-sm">{image.caption}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 border rounded bg-gray-50 dark:bg-gray-700">
            <p>No site pictures uploaded yet</p>
            <Button
              className="mt-4"
              variant="solid"
              icon={<HiPlus />}
              onClick={() => setUploadModalOpen(true)}
            >
              Upload Images
            </Button>
          </div>
        )}
      </div>

      <div className="print:hidden mt-6 flex items-center justify-end gap-2">
        <Button
          variant="solid"
          onClick={() => setUploadModalOpen(true)}
        >
          Add More Images
        </Button>
        <Button 
          variant="solid" 
          loading={pdfLoading}
          onClick={handleDownloadPdf}
        >
          {pdfLoading ? 'Generating PDF...' : 'Download Completion Certificate'}
        </Button>
      </div>
    </Loading>
  );
};

export default CompletionContent;