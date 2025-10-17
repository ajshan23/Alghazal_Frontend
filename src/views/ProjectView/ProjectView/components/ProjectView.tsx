import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Card,
  Avatar,
  Button,
  Tooltip,
  Notification,
  toast,
  Badge,
  Drawer,
  Dialog,
  Select
} from '@/components/ui';
import { ClipLoader } from 'react-spinners';
import { 
  HiOutlineEye, 
  HiOutlinePlus,
  HiOutlineUserAdd,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineCalendar,
  HiOutlineDocumentText,
  HiOutlineDocumentReport,
  HiOutlineClipboardList,
  HiOutlineClipboardCheck,
  HiOutlineReceiptTax,
  HiOutlineCash,
  HiOutlineSparkles,
  HiOutlineLightBulb,
  HiOutlineChartBar
} from 'react-icons/hi';
import { NumericFormat } from 'react-number-format';
import dayjs from 'dayjs';
import useThemeClass from '@/utils/hooks/useThemeClass';
import CustomerInfo from './CustomerInfo';
import ProjectInfo from './ProjectInfo';
import Issue from '../../Issue';
import {
  Approvedproject,
  assignEngineer,
  checkProject,
  fetchEngineers,
  fetchProject,
} from '../api/api';
import { useAppSelector } from '@/store';
import { AdaptableCard, Loading } from '@/components/shared';

interface Document {
  type: 'estimation' | 'quotation' | 'lpo' | 'workProgress' | 'invoice' | 'expenseTracker';
  title: string;
  amount?: number;
  date?: string;
  status?: string;
  exists: boolean;
  route: string;
  viewRoute?: string;
  roles?: string[];
}

const DocumentCard = ({
  data,
  onAddClick,
}: {
  data: Document;
  onAddClick: (type: string) => void;
}) => {
  const { textTheme } = useThemeClass();
  const navigate = useNavigate();
  const { id } = useParams();

  const getDocumentIcon = () => {
    switch(data.type) {
      case 'estimation':
        return <HiOutlineDocumentText className="text-3xl" />;
      case 'quotation':
        return <HiOutlineDocumentReport className="text-3xl" />;
      case 'lpo':
        return <HiOutlineClipboardList className="text-3xl" />;
      case 'workProgress':
        return <HiOutlineClipboardCheck className="text-3xl" />;
      case 'invoice':
        return <HiOutlineReceiptTax className="text-3xl" />;
      case 'expenseTracker':
        return <HiOutlineCash className="text-3xl" />;
      default:
        return <HiOutlineDocumentText className="text-3xl" />;
    }
  };

  const handleClick = () => {
    if (data.exists) {
      if (data.type === 'quotation') {
        navigate(`/app/quotation-view/${id}`);
      } else if (data.type === 'expenseTracker') {
        navigate(data.viewRoute || `/app/expense/${id}`);
      } else {
        navigate(data.viewRoute || data.route, {
          state: { projectId: id },
        });
      }
    } else {
      onAddClick(data.type);
    }
  };

  const getGradient = () => {
    switch(data.type) {
      case 'estimation': return 'from-blue-400 via-blue-500 to-blue-600';
      case 'quotation': return 'from-purple-400 via-purple-500 to-purple-600';
      case 'lpo': return 'from-green-400 via-green-500 to-green-600';
      case 'workProgress': return 'from-orange-400 via-orange-500 to-orange-600';
      case 'invoice': return 'from-indigo-400 via-indigo-500 to-indigo-600';
      case 'expenseTracker': return 'from-red-400 via-red-500 to-red-600';
      default: return 'from-gray-400 via-gray-500 to-gray-600';
    }
  };

  const getAccentColor = () => {
    switch(data.type) {
      case 'estimation': return 'border-blue-200 dark:border-blue-800';
      case 'quotation': return 'border-purple-200 dark:border-purple-800';
      case 'lpo': return 'border-green-200 dark:border-green-800';
      case 'workProgress': return 'border-orange-200 dark:border-orange-800';
      case 'invoice': return 'border-indigo-200 dark:border-indigo-800';
      case 'expenseTracker': return 'border-red-200 dark:border-red-800';
      default: return 'border-gray-200 dark:border-gray-800';
    }
  };

  return (
    <div className="group relative">
      {data.exists ? (
        <Card className={`h-full transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 bg-gradient-to-br from-white via-gray-50 to-white dark:from-gray-800 dark:via-gray-850 dark:to-gray-900 border-2 ${getAccentColor()} hover:border-opacity-60`}>
          <div className="relative overflow-hidden rounded-lg">
            <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${getGradient()}`}></div>
            
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-r ${getGradient()} text-white shadow-lg group-hover:shadow-xl transition-shadow duration-300`}>
                    {getDocumentIcon()}
                  </div>
                  <div>
                    <h6 className="font-bold text-xl text-gray-800 dark:text-gray-100">{data.title}</h6>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Document</p>
                  </div>
                </div>
                {data.status && (
                  <Badge 
                    content={data.status} 
                    className="px-3 py-1 text-xs font-semibold"
                    innerClass={`${
                      data.status === 'approved' 
                        ? 'bg-emerald-500' 
                        : data.status === 'pending' 
                          ? 'bg-amber-500' 
                          : 'bg-blue-500'
                    } shadow-lg`}
                  />
                )}
              </div>
              
              <div className="space-y-3">
                {data.amount && (
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Amount</p>
                    <h4 className="text-2xl font-bold text-gray-900 dark:text-white">
                      <NumericFormat
                        displayType="text"
                        value={data.amount}
                        prefix="$"
                        thousandSeparator={true}
                        decimalScale={2}
                      />
                    </h4>
                  </div>
                )}
                {data.date && (
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <HiOutlineCalendar />
                    <span>{dayjs(data.date).format('MMM D, YYYY')}</span>
                  </div>
                )}
              </div>
              
              <Button
                className="w-full mt-4 font-semibold transition-all duration-200 hover:scale-105"
                size="sm"
                variant="solid"
                icon={<HiOutlineEye className="text-lg" />}
                onClick={handleClick}
                style={{ 
                  background: `linear-gradient(135deg, ${data.type === 'estimation' ? '#3b82f6, #1d4ed8' : 
                    data.type === 'quotation' ? '#8b5cf6, #7c3aed' :
                    data.type === 'lpo' ? '#10b981, #059669' :
                    data.type === 'workProgress' ? '#f59e0b, #d97706' :
                    data.type === 'invoice' ? '#6366f1, #4f46e5' :
                    '#ef4444, #dc2626'})`,
                  border: 'none',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                }}
              >
                View
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <Card
          clickable
          className="group border-dashed border-3 hover:border-indigo-400 dark:hover:border-gray-300 bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-800 dark:via-gray-850 dark:to-gray-900 h-full flex items-center justify-center transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
          onClick={handleClick}
        >
          <div className="flex flex-col justify-center items-center py-8">
            <div className="relative">
              <div className="p-4 rounded-full bg-gradient-to-r from-indigo-100 via-purple-100 to-pink-100 dark:from-indigo-900 dark:via-purple-900 dark:to-pink-900 transition-all duration-300 group-hover:scale-110">
                <HiOutlinePlus className="text-3xl text-indigo-500 dark:text-indigo-400" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full animate-pulse"></div>
            </div>
            <p className="mt-4 font-bold text-lg text-gray-700 dark:text-gray-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              Add {data.title}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Click to create new document
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};

const StatusModal = ({
  isOpen,
  onClose,
  estimationId,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  estimationId: string;
  onSuccess: () => void;
}) => {
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (isApproved: boolean) => {
    setIsSubmitting(true);
    setError(null);

    try {
      await Approvedproject({
        estimationId,
        isApproved,
        comment: comment || undefined,
      });

      toast.push(
        <Notification
          title={`Project ${
            isApproved ? 'approved' : 'rejected'
          } successfully`}
          type="success"
        />,
        { placement: 'top-center' },
      );

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error updating project status:', error);
      setError(
        error.response?.data?.message ||
          'Failed to update project status',
      );

      toast.push(
        <Notification
          title="Failed to update project status"
          type="danger"
        />,
        { placement: 'top-center' },
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      width={500}
      className="dark:bg-gray-800 rounded-xl"
    >
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
            <HiOutlineCheckCircle className="text-2xl text-white" />
          </div>
          <h5 className="text-xl font-bold dark:text-white">Update Project Status</h5>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg dark:bg-red-900/30 dark:text-red-400 dark:border-red-800">
            {error}
          </div>
        )}

        <div className="mb-6">
          <label className="block mb-3 font-semibold text-gray-700 dark:text-gray-300">
            Comments
          </label>
          <textarea
            className="w-full p-4 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-200"
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Enter your comments here..."
          />
        </div>

        <div className="flex justify-end space-x-3">
          <Button
            variant="plain"
            onClick={() => handleSubmit(false)}
            disabled={isSubmitting}
            className="px-6 py-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30 font-semibold border-2 border-red-200 dark:border-red-800 rounded-lg transition-all duration-200"
          >
            {isSubmitting ? 'Processing...' : 'Reject'}
          </Button>
          <Button
            variant="solid"
            onClick={() => handleSubmit(true)}
            disabled={isSubmitting}
            className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
          >
            {isSubmitting ? 'Processing...' : 'Approve'}
          </Button>
        </div>
      </div>
    </Dialog>
  );
};

const StatusModal2 = React.memo(({
  isOpen,
  onClose,
  estimationId,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  estimationId: string;
  onSuccess: () => void;
}) => {
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (isChecked: boolean) => {
    setIsSubmitting(true);
    setError(null);

    try {
      await checkProject({
        estimationId,
        isChecked,
        comment: comment || undefined,
      });

      toast.push(
        <Notification
          title={`Project ${
            isChecked ? 'checked' : 'rejected'
          } successfully`}
          type="success"
        />,
        { placement: 'top-center' },
      );

      onSuccess();
      onClose();
      setComment('');
    } catch (error) {
      console.error('Error updating project status:', error);
      setError(
        error.response?.data?.message ||
          'Failed to update project status',
      );

      toast.push(
        <Notification
          title="Failed to update project status"
          type="danger"
        />,
        { placement: 'top-center' },
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (!isOpen) {
      setComment('');
      setError(null);
    }
  }, [isOpen]);

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      width={500}
      className="dark:bg-gray-800 rounded-xl"
    >
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gradient-to-r from-green-500 to-teal-600 rounded-lg">
            <HiOutlineSparkles className="text-2xl text-white" />
          </div>
          <h5 className="text-xl font-bold dark:text-white">Verify Project</h5>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg dark:bg-red-900/30 dark:text-red-400 dark:border-red-800">
            {error}
          </div>
        )}

        <div className="mb-6">
          <label className="block mb-3 font-semibold text-gray-700 dark:text-gray-300">
            Comments
          </label>
          <textarea
            className="w-full p-4 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-200"
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Enter your comments here..."
          />
        </div>

        <div className="flex justify-end space-x-3">
          <Button
            variant="plain"
            onClick={() => handleSubmit(false)}
            disabled={isSubmitting}
            className="px-6 py-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30 font-semibold border-2 border-red-200 dark:border-red-800 rounded-lg transition-all duration-200"
          >
            {isSubmitting ? 'Processing...' : 'Reject'}
          </Button>
          <Button
            variant="solid"
            onClick={() => handleSubmit(true)}
            disabled={isSubmitting}
            className="px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
          >
            {isSubmitting ? 'Processing...' : 'Checked'}
          </Button>
        </div>
      </div>
    </Dialog>
  );
});

const ProjectView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [projectData, setProjectData] = useState<any>(null);
  const [projectLoading, setProjectLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [currentProjectId, setCurrentProjectId] = useState('');
  const [isStatusModalOpen2, setIsStatusModalOpen2] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [engineers, setEngineers] = useState<any[]>([]);
  const [selectedEngineer, setSelectedEngineer] = useState<string | null>(null);
  const [engineersLoading, setEngineersLoading] = useState(false);
  const [refreshActivity, setRefreshActivity] = useState(false);
  const userAuthority = useAppSelector((state) => state.auth.user.authority) || [];
  const role = userAuthority[0] || 'finance';
  const [isAssigning, setIsAssigning] = useState(false);

  const fetchEngineersData = async () => {
    setEngineersLoading(true);
    try {
      const response = await fetchEngineers();
      setEngineers(response.data.engineers);

      if (projectData?.assignedTo) {
        setSelectedEngineer(projectData.assignedTo._id);
      }
    } catch (error) {
      console.error('Failed to fetch engineers:', error);
      toast.push(
        <Notification title="Failed to load engineers" type="danger" />,
        { placement: 'top-center' },
      );
    } finally {
      setEngineersLoading(false);
    }
  };

  const openDrawer = () => {
    setIsOpen(true);
    fetchEngineersData();
  };

  const onDrawerClose = () => {
    setIsOpen(false);
  };

  const openStatusModal = () => {
    if (projectData?.estimationId) {
      setIsStatusModalOpen(true);
    }
  };

  const closeStatusModal = () => {
    setIsStatusModalOpen(false);
  };

  const openStatusModal2 = (projectId: string) => {
    setCurrentProjectId(projectId);
    setIsStatusModalOpen2(true);
  };

  const closeStatusModal2 = () => {
    setIsStatusModalOpen2(false);
  };

  const handleApprovalSuccess = () => {
    fetchProject(id).then((data) => {
      setProjectData(data?.data);
      setRefreshActivity(prev => !prev);
    });
    window.location.reload();
  };

  const handleCheckSuccess = () => {
    fetchProject(id).then((data) => {
      setProjectData(data?.data);
      setRefreshActivity(prev => !prev);
    });
  };

  const handleAssignEngineer = async () => {
    if (!selectedEngineer || !id) {
      toast.push(
        <Notification
          title="Please select an engineer"
          type="warning"
        />,
        { placement: 'top-center' },
      );
      return;
    }
  
    setIsAssigning(true);
  
    try {
      await assignEngineer({
        projectId: id,
        engineerId: selectedEngineer,
      });
  
      toast.push(
        <Notification
          title="Engineer assigned successfully"
          type="success"
        />,
        { placement: 'top-center' },
      );
  
      const updatedProject = await fetchProject(id);
      setProjectData(updatedProject?.data);
      onDrawerClose();
    } catch (error) {
      console.error('Assignment failed:', error);
      let errorMessage = 'Failed to assign engineer';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      toast.push(<Notification title={errorMessage} type="danger" />, {
        placement: 'top-center',
      });
    } finally {
      setIsAssigning(false);
    }
  };

  const handleAddDocument = (type: string) => {
    const document = documents.find((doc) => doc.type === type);
    if (document) {
      if (type === 'expenseTracker') {
        navigate(document.exists ? (document.viewRoute || `/app/expense/${id}`) : document.route);
      } else {
        navigate(document.exists ? (document.viewRoute || document.route) : document.route, {
          state: { projectId: id },
        });
      }
    }
  };

  useEffect(() => {
    setProjectLoading(true);
    fetchProject(id)
      .then((data) => {
        setProjectData(data?.data);
        setProjectLoading(false);

        const status = data?.data?.status || 'draft';
        const isApproved = data?.data?.isApproved;
        const hasAssignedEngineer = !!data?.data?.assignedTo;
        const hasEstimation = !!data?.data?.estimationId;
        const hasQuotation = !!data?.data?.quotationId;
        const hasLPO = !!data?.data?.lpoId;
        const hasInvoice = !!data?.data?.lopId;
        const hasWorkProgress = !!data?.data?.lpoId;
        const hasExpenseTracker = !!data?.data?.expenseId;

        const baseDocuments = [
          {
            type: 'estimation',
            title: 'Estimation',
            route: `/app/create-estimation/${id}`,
            viewRoute: hasEstimation ? `/app/estimation-view/${data.data.estimationId}` : undefined,
            exists: hasEstimation,
            roles: ['finance', 'super_admin', 'admin', 'engineer'],
          }
        ];

        let statusDocuments = [...baseDocuments];

        if (isApproved && hasAssignedEngineer) {
          statusDocuments.push({
            type: 'quotation',
            title: 'Quotation',
            route: `/app/quotation-new/${id}`,
            viewRoute: hasQuotation ? `/app/quotation-view/${id}` : undefined,
            exists: hasQuotation,
            roles: ['finance', 'super_admin', 'admin','engineer'],
          });
        }

        if (['quotation_sent', 'lpo_received', 'work_started', 'in_progress', 'work_completed', 'invoice_sent','team_assigned'].includes(status)) {
  // For engineers, only add LPO document if it exists (view-only)
  // For other roles, add it regardless (can add or view)
  if (role === 'engineer') {
    if (hasLPO) {
      statusDocuments.push({
        type: 'lpo',
        title: 'LPO',
        route: `/app/lpo/${id}`,
        exists: true,
        viewRoute: `/app/lpo-view/${id}`,
        roles: ['finance', 'super_admin', 'admin', 'engineer'],
      });
    }
    // If hasLPO is false, don't add the document at all for engineers
  } else {
    // For non-engineers, add regardless of existence (can create or view)
    statusDocuments.push({
      type: 'lpo',
      title: 'LPO',
      route: `/app/lpo/${id}`,
      exists: hasLPO,
      viewRoute: hasLPO ? `/app/lpo-view/${id}` : undefined,
      roles: ['finance', 'super_admin', 'admin', 'engineer'],
    });
  }
}

        if (['lpo_received', 'work_started', 'in_progress', 'work_completed', 'invoice_sent', "team_assigned"].includes(status)) {
          statusDocuments.push({
            type: 'workProgress',
            title: 'Work Progress',
            route: hasWorkProgress ? undefined : '/app/workprogress',
            viewRoute: hasWorkProgress ? `/app/workprogress/${id}` : undefined,
            exists: hasWorkProgress,
            roles: ['finance', 'super_admin', 'admin', 'engineer'],
          });
        }

        if (status === 'work_completed') {
          statusDocuments.push({
            type: 'workCompletion',
            title: 'Completion Report',
            viewRoute: `/app/workcompletionreport/${id}`,
            exists: true,
            roles: ['finance', 'super_admin', 'admin', 'engineer'],
          });
        }

        if (status === 'work_completed') {
          statusDocuments.push({
            type: 'invoice',
            title: 'Invoice',
            viewRoute: id ? `/app/invoice-view/${id}` : undefined,
            exists: id,
            roles: ['finance', 'super_admin', 'admin'],
          });
        }

        if (['lpo_received', 'work_started', 'in_progress', 'work_completed', 'invoice_sent', 'team_assigned'].includes(status)) {
          statusDocuments.push({
            type: 'expenseTracker',
            title: 'Expense Tracker',
            route: `/app/expense/${id}`,
            viewRoute: `/app/expense-view/${data?.data?.expenseId}`,
            exists: hasExpenseTracker,
            roles: ['finance', 'super_admin', 'admin'],
          });
        }

        const filteredDocuments = statusDocuments.filter(doc => doc.roles?.includes(role));
        setDocuments(filteredDocuments);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching project:', error);
        setProjectLoading(false);
      });
  }, [id, role, refreshActivity]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-850 dark:to-gray-900">
      <div className="container mx-auto p-6">
        {/* Header Section */}
       

        {/* Documents Grid */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg">
              <HiOutlineChartBar className="text-2xl text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Project Documents</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {!loading && documents.length > 0
              ? documents.map((doc) => (
                  <DocumentCard
                    key={doc.type}
                    data={doc}
                    onAddClick={handleAddDocument}
                  />
                ))
              : [...Array(4).keys()].map((elm) => (
                  <Card key={elm} className="h-64">
                    <div className="flex justify-center items-center h-full">
                      <ClipLoader size={40} color="#6366f1" loading={loading} />
                    </div>
                  </Card>
                ))}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left Column - Project Info & Issues */}
          <div className="xl:col-span-2 space-y-8">
            {/* Project Information */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-750 p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg">
                    <HiOutlineDocumentText className="text-2xl text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white">Project Information</h3>
                </div>
              </div>
              <div className="p-6">
                <ProjectInfo projectdetails={projectData} />
              </div>
            </div>

            {/* Issues Section */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-gray-800 dark:to-gray-750 p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg">
                    <HiOutlineXCircle className="text-2xl text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white">Project Issues</h3>
                </div>
              </div>
              <div className="p-6">
                <Issue projectId={id} refresh={refreshActivity} />
              </div>
            </div>
          </div>

          {/* Right Column - Customer Info & Status */}
          <div className="space-y-8">
            {/* Customer Information */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="bg-gradient-to-r from-green-50 to-teal-50 dark:from-gray-800 dark:to-gray-750 p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-green-500 to-teal-600 rounded-lg">
                    <HiOutlineUserAdd className="text-2xl text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white">Customer Information</h3>
                </div>
              </div>
              <div className="p-6">
                <CustomerInfo clientinformation={projectData} />
              </div>
            </div>

            {/* Project Status Card */}
            {projectData?.estimationId && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-750 p-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg">
                      <HiOutlineCheckCircle className="text-2xl text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white">Project Status</h3>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  {/* Status Overview */}
                  <div className="grid grid-cols-1 gap-4">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-gray-700 dark:text-gray-300">Status</span>
                        <Badge 
                          content={projectData?.status || 'draft'} 
                          className="px-3 py-1 text-xs font-bold"
                          innerClass="bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg"
                        />
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-gray-700 dark:text-gray-300">Verified</span>
                        <Badge 
                          content={projectData?.isChecked ? 'Verified' : 'Pending'} 
                          className="px-3 py-1 text-xs font-bold"
                          innerClass={`${projectData?.isChecked ? 'bg-gradient-to-r from-emerald-500 to-green-600' : 'bg-gradient-to-r from-amber-500 to-orange-600'} text-white shadow-lg`}
                        />
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 p-4 rounded-xl border border-purple-200 dark:border-purple-800">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-gray-700 dark:text-gray-300">Approved</span>
                        <Badge 
                          content={projectData?.isApproved ? 'Approved' : 'Pending'} 
                          className="px-3 py-1 text-xs font-bold"
                          innerClass={`${projectData?.isApproved ? 'bg-gradient-to-r from-emerald-500 to-green-600' : 'bg-gradient-to-r from-amber-500 to-orange-600'} text-white shadow-lg`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Engineer Assignment */}
                  <div className="bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-800/50 dark:to-slate-800/50 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-gray-700 dark:text-gray-300">Assigned Engineer</span>
                      {projectData?.assignedTo ? (
                        <div className="flex items-center gap-3">
                          <Avatar
                            size={40}
                            src={projectData.assignedTo.profileImage}
                            shape="circle"
                            className="border-2 border-white shadow-lg"
                          />
                          <div className="text-right">
                            <p className="font-semibold text-gray-800 dark:text-white">
                              {projectData.assignedTo.firstName} {projectData.assignedTo.lastName}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Engineer</p>
                          </div>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="solid"
                          icon={<HiOutlineUserAdd />}
                          onClick={openDrawer}
                          className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold px-4 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                        >
                          Assign Engineer
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    {projectData?.assignedTo && (
                      <Button
                        block
                        size="lg"
                        variant="solid"
                        icon={<HiOutlineCalendar />}
                        onClick={() => navigate(`/app/attendance-summary/${id}`)}
                        className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                      >
                        View Attendance Summary
                      </Button>
                    )}

                    {['super_admin', 'admin'].includes(role) && !projectData?.isApproved && (
                      <Button
                        block
                        size="lg"
                        variant="solid"
                        onClick={openStatusModal}
                        disabled={!projectData?.isChecked}
                        icon={projectData?.isChecked ? <HiOutlineCheckCircle /> : <HiOutlineXCircle />}
                        className={`font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 ${
                          projectData?.isChecked 
                            ? 'bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white' 
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        {projectData?.isChecked ? 'Approve Project' : 'Verification Required'}
                      </Button>
                    )}

                    {['super_admin', 'admin', 'engineer'].includes(role) && !projectData?.isChecked && (
                      <Button
                        block
                        size="lg"
                        variant="solid"
                        onClick={() => openStatusModal2(id || '')}
                        icon={<HiOutlineSparkles />}
                        className="bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                      >
                        Verify Project
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Engineer Assignment Drawer */}
        <Drawer
          title="Assign Engineer"
          isOpen={isOpen}
          onClose={onDrawerClose}
          width={450}
          className="rounded-l-2xl"
        >
          <div className="p-6">
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg">
                  <HiOutlineUserAdd className="text-2xl text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white">Select Engineer</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Choose an engineer to assign to this project</p>
                </div>
              </div>
            </div>

            {engineersLoading ? (
              <div className="flex justify-center py-12">
                <div className="text-center">
                  <ClipLoader size={40} color="#6366f1" />
                  <p className="mt-4 text-gray-500 dark:text-gray-400">Loading engineers...</p>
                </div>
              </div>
            ) : engineers.length > 0 ? (
              <div className="space-y-4">
                {engineers.map((engineer) => (
                  <div
                    key={engineer._id}
                    className={`group flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all duration-300 border-2 ${
                      selectedEngineer === engineer._id
                        ? 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 border-blue-300 dark:border-blue-600 shadow-lg'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md'
                    }`}
                    onClick={() => setSelectedEngineer(engineer._id)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <Avatar
                          size={50}
                          src={engineer.profileImage}
                          className="border-3 border-white shadow-lg"
                          shape="circle"
                        />
                        {selectedEngineer === engineer._id && (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full border-2 border-white flex items-center justify-center">
                            <HiOutlineCheckCircle className="text-xs text-white" />
                          </div>
                        )}
                      </div>
                      <div>
                        <h5 className="font-bold text-gray-900 dark:text-white text-lg">
                          {engineer.firstName} {engineer.lastName}
                        </h5>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {engineer.phoneNumbers?.[0] || 'No phone number'}
                        </p>
                        <div className="mt-1">
                          <Badge 
                            content="Engineer" 
                            className="text-xs"
                            innerClass="bg-gradient-to-r from-green-500 to-teal-600 text-white"
                          />
                        </div>
                      </div>
                    </div>
                    <div className={`transition-all duration-200 ${selectedEngineer === engineer._id ? 'scale-110' : 'scale-75 opacity-0 group-hover:opacity-50 group-hover:scale-100'}`}>
                      <div className="w-6 h-6 rounded-full border-2 border-blue-300 dark:border-blue-600 flex items-center justify-center">
                        {selectedEngineer === engineer._id && (
                          <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                  {isAssigning ? (
                    <div className="flex items-center justify-center py-4">
                      <div className="flex items-center gap-3">
                        <ClipLoader size={20} color="#6366f1" />
                        <span className="text-gray-600 dark:text-gray-400">Assigning engineer...</span>
                      </div>
                    </div>
                  ) : (
                    <Button
                      block
                      size="lg"
                      variant="solid"
                      onClick={handleAssignEngineer}
                      disabled={!selectedEngineer}
                      className={`font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 ${
                        selectedEngineer 
                          ? 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white' 
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {selectedEngineer ? 'Confirm Assignment' : 'Select an engineer first'}
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-xl">
                  <HiOutlineUserAdd className="text-4xl text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400 font-medium">No engineers available</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Please add engineers to the system first</p>
                </div>
              </div>
            )}
          </div>
        </Drawer>

        {/* Status Modals */}
        <StatusModal
          isOpen={isStatusModalOpen}
          onClose={closeStatusModal}
          estimationId={projectData?.estimationId}
          onSuccess={handleApprovalSuccess}
        />
        <StatusModal2
          isOpen={isStatusModalOpen2}
          onClose={closeStatusModal2}
          estimationId={projectData?.estimationId || ''}
          onSuccess={handleCheckSuccess}
        />
      </div>
    </div>
  );
};

export default ProjectView;