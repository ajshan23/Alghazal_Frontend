import { useEffect, useState } from 'react';
import Button from '@/components/ui/Button';
import Loading from '@/components/shared/Loading';
import Logo from '@/components/template/Logo';
import {
  HiPencil,
  HiOutlineDocumentText,
  HiOutlineCalendar,
  HiOutlineCamera,
  HiOutlineDownload,
  HiOutlineCheckCircle,
  HiMail,
  HiPlus
} from 'react-icons/hi';
import useThemeClass from '@/utils/hooks/useThemeClass';
import { useAppSelector } from '@/store';
import dayjs from 'dayjs';
import { Notification, toast } from '@/components/ui';
import ImageUploadModal from './ImageUploadModal';
import CcEmailModal from './CcEmailModal';
import {
  apiGetCompletionData,
  apiUploadCompletionImages,
  apiCreateWorkCompletion,
  apiDownloadCompletionCertificate,
  apiUpdateCompletionDate,
  apiUpdateHandoverDate,
  apiUpdateAcceptanceDate,
  apiSendWorkCompletionEmail,
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
  const [emailLoading, setEmailLoading] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [ccModalOpen, setCcModalOpen] = useState(false);
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
      const response = await apiGetCompletionData(projectId!);
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

      const response = await apiGetCompletionData(projectId!);
      setData(response.data);

      toast.push(
        <Notification title="Success" type="success">
          Images uploaded successfully
        </Notification>
      );
    } catch (error: any) {
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
      const response = await apiCreateWorkCompletion(projectId!);
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
    } catch (error: any) {
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

  const handleSendEmail = async (ccEmails: string[]) => {
    if (!projectId) return;
    
    setEmailLoading(true);
    setError('');
    
    try {
      await apiSendWorkCompletionEmail(projectId, ccEmails);
      toast.push(
        <Notification title="Success" type="success">
          Work completion email sent successfully 
        </Notification>
      );
      setCcModalOpen(false);
    } catch (error: any) {
      setError('Failed to send email');
      toast.push(
        <Notification title="Error" type="danger">
          {error.response?.data?.message || error.message || 'Failed to send email'}
        </Notification>
      );
    } finally {
      setEmailLoading(false);
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-850 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 max-w-md mx-4">
          <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <HiOutlineDocumentText className="text-2xl text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Error Loading Completion</h3>
          <p className="text-red-600 dark:text-red-400 mb-6">{error}</p>
          <Button
            className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-850 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 max-w-md mx-4">
          <Loading loading={creatingCompletion} />
          <div className="mt-6">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <HiOutlineDocumentText className="text-2xl text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">No Completion Record Found</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">No work completion record exists for this project yet.</p>
            <Button
              variant="solid"
              loading={creatingCompletion}
              onClick={handleCreateCompletion}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {creatingCompletion ? 'Creating...' : 'Create Work Completion'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-850 dark:to-gray-900">
      <Loading loading={loading}>
        <ImageUploadModal
          isOpen={uploadModalOpen}
          onClose={() => setUploadModalOpen(false)}
          onUpload={handleUploadImages}
          projectId={projectId}
        />

        <CcEmailModal
          isOpen={ccModalOpen}
          onClose={() => setCcModalOpen(false)}
          onSend={handleSendEmail}
          loading={emailLoading}
        />

        <div className="container mx-auto p-6 space-y-8">
          {/* Header Section */}
          <div className="w-96">
            <Logo className="w-full h-auto" mode={mode} />
          </div>

          {/* Project Details - Full Width */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-750 p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg">
                  <HiOutlineDocumentText className="text-2xl text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">Project Details</h3>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                    <label className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">FM Contractor</label>
                    <p className="text-lg font-semibold text-gray-800 dark:text-white mt-1">{data.fmContractor}</p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                    <label className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Sub Contractor</label>
                    <p className="text-lg font-semibold text-gray-800 dark:text-white mt-1">{data.subContractor}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                    <label className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Project Description</label>
                    <p className="text-lg font-semibold text-gray-800 dark:text-white mt-1">{data.projectDescription}</p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                    <label className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Location</label>
                    <p className="text-lg font-semibold text-gray-800 dark:text-white mt-1">{data.location}</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-purple-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                <p className="text-center text-lg italic text-gray-700 dark:text-gray-300 leading-relaxed">
                  "This is to certify that the work described above on project description has been cleared out and completed."
                </p>
              </div>
            </div>
          </div>

          {/* Hand Over By and Accepted By - Full Width Side by Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Handover Section */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="bg-gradient-to-r from-green-50 to-teal-50 dark:from-gray-800 dark:to-gray-750 p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-green-500 to-teal-600 rounded-lg">
                    <HiOutlineCheckCircle className="text-2xl text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white">Hand Over By</h3>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                    <label className="text-sm font-semibold text-green-600 dark:text-green-400 uppercase tracking-wide">Company</label>
                    <p className="text-lg font-bold text-gray-800 dark:text-white mt-1">{data.handover.company}</p>
                  </div>
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                    <label className="text-sm font-semibold text-green-600 dark:text-green-400 uppercase tracking-wide">Name</label>
                    <p className="text-lg font-bold text-gray-800 dark:text-white mt-1">{data.handover.name}</p>
                  </div>
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                    <label className="text-sm font-semibold text-green-600 dark:text-green-400 uppercase tracking-wide">Date</label>
                    {editingHandoverDate ? (
                      <div className="flex items-center gap-2 mt-2">
                        <Input
                          type="date"
                          value={tempHandoverDate}
                          onChange={(e) => setTempHandoverDate(e.target.value)}
                          className="flex-1"
                        />
                        <Button size="sm" onClick={handleUpdateHandoverDate}>Save</Button>
                        <Button size="sm" variant="plain" onClick={() => setEditingHandoverDate(false)}>Cancel</Button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-lg font-bold text-gray-800 dark:text-white">
                          {dayjs(data.handover.date).format('MMM DD, YYYY')}
                        </p>
                        <button
                          onClick={() => {
                            setTempHandoverDate(data.handover.date.split('T')[0]);
                            setEditingHandoverDate(true);
                          }}
                          className="p-2 hover:bg-green-100 dark:hover:bg-green-900/50 rounded-lg transition-colors"
                        >
                          <HiPencil className="text-green-500" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Acceptance Section */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-750 p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg">
                    <HiOutlineCheckCircle className="text-2xl text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white">Accepted By</h3>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
                    <label className="text-sm font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wide">Company</label>
                    <p className="text-lg font-bold text-gray-800 dark:text-white mt-1">{data.acceptance.company}</p>
                  </div>
                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
                    <label className="text-sm font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wide">Name</label>
                    <p className="text-lg font-bold text-gray-800 dark:text-white mt-1">{data.acceptance.name}</p>
                  </div>
                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
                    <label className="text-sm font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wide">Date</label>
                    {editingAcceptanceDate ? (
                      <div className="flex items-center gap-2 mt-2">
                        <Input
                          type="date"
                          value={tempAcceptanceDate}
                          onChange={(e) => setTempAcceptanceDate(e.target.value)}
                          className="flex-1"
                        />
                        <Button size="sm" onClick={handleUpdateAcceptanceDate}>Save</Button>
                        <Button size="sm" variant="plain" onClick={() => setEditingAcceptanceDate(false)}>Cancel</Button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-lg font-bold text-gray-800 dark:text-white">
                          {dayjs(data.acceptance.date).format('MMM DD, YYYY')}
                        </p>
                        <button
                          onClick={() => {
                            setTempAcceptanceDate(data.acceptance.date.split('T')[0]);
                            setEditingAcceptanceDate(true);
                          }}
                          className="p-2 hover:bg-purple-100 dark:hover:bg-purple-900/50 rounded-lg transition-colors"
                        >
                          <HiPencil className="text-purple-500" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Completion Information - Full Width */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-gray-800 dark:to-gray-750 p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-orange-500 to-amber-600 rounded-lg">
                  <HiOutlineCalendar className="text-2xl text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">Completion Information</h3>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                  <label className="text-sm font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide">Completion Date</label>
                  {editingCompletionDate ? (
                    <div className="flex items-center gap-2 mt-2">
                      <Input
                        type="date"
                        value={tempCompletionDate}
                        onChange={(e) => setTempCompletionDate(e.target.value)}
                        className="flex-1"
                      />
                      <Button size="sm" onClick={handleUpdateCompletionDate}>Save</Button>
                      <Button size="sm" variant="plain" onClick={() => setEditingCompletionDate(false)}>Cancel</Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-lg font-bold text-gray-800 dark:text-white">
                        {dayjs(data.completionDate).format('MMM DD, YYYY')}
                      </p>
                      <button
                        onClick={() => {
                          setTempCompletionDate(data.completionDate.split('T')[0]);
                          setEditingCompletionDate(true);
                        }}
                        className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg transition-colors"
                      >
                        <HiPencil className="text-blue-500" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200 dark:border-green-800">
                  <label className="text-sm font-semibold text-green-600 dark:text-green-400 uppercase tracking-wide">LPO Number</label>
                  <p className="text-lg font-bold text-gray-800 dark:text-white mt-2">{data.lpoNumber}</p>
                </div>

                <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
                  <label className="text-sm font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wide">LPO Date</label>
                  <p className="text-lg font-bold text-gray-800 dark:text-white mt-2">{dayjs(data.lpoDate).format('MMM DD, YYYY')}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Site Pictures - Full Width */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-gray-800 dark:to-gray-750 p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-lg">
                    <HiOutlineCamera className="text-2xl text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white">Site Pictures</h3>
                </div>
                <Button
                  variant="solid"
                  icon={<HiPlus />}
                  onClick={() => setUploadModalOpen(true)}
                  className="bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white font-semibold px-4 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  Add Images
                </Button>
              </div>
            </div>

            <div className="p-6">
              {data.sitePictures && data.sitePictures.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {data.sitePictures.map((image, index) => (
                    <div key={`image-${index}`} className="group bg-white dark:bg-gray-700 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-600 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                      <div className="aspect-video overflow-hidden">
                        <img
                          src={image.url}
                          alt={image.caption || `Site Image ${index + 1}`}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                      {image.caption && (
                        <div className="p-4">
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center">
                            {image.caption}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700">
                  <div className="p-3 bg-gray-100 dark:bg-gray-600 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <HiOutlineCamera className="text-2xl text-gray-400" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-2">No Images Uploaded</h4>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">Upload site pictures to document project completion</p>
                  <Button
                    variant="solid"
                    icon={<HiPlus />}
                    onClick={() => setUploadModalOpen(true)}
                    className="bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    Upload Images
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons - Full Width */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-750 p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg">
                  <HiOutlineDownload className="text-2xl text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">Actions</h3>
              </div>
            </div>
            <div className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  variant="solid"
                  icon={<HiOutlineCamera />}
                  onClick={() => setUploadModalOpen(true)}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white font-semibold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  Add More Images
                </Button>

                <Button
                  size="lg"
                  variant="solid"
                  loading={pdfLoading}
                  icon={<HiOutlineDownload />}
                  onClick={handleDownloadPdf}
                  className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  {pdfLoading ? 'Generating PDF...' : 'Download Certificate'}
                </Button>

                <Button
                  size="lg"
                  variant="solid"
                  icon={<HiMail />}
                  onClick={() => setCcModalOpen(true)}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  Send Email
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Loading>
    </div>
  );
};

export default CompletionContent;
                   