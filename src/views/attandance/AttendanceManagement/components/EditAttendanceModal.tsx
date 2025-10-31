// components/EditAttendanceModal.tsx - WITH DAY OFF STATUS
import { useState, useEffect } from 'react';
import { 
  Dialog, 
  Button, 
  Input, 
  Select, 
  Notification,
  toast,
  Badge
} from '@/components/ui';
import { HiCheck, HiX, HiClock, HiUser, HiTrash, HiOfficeBuilding, HiCalendar } from 'react-icons/hi';
import { apiCreateOrUpdateAttendance, apiDeleteAttendanceRecord, apiGetUserProjects } from '../../api/api';

interface EditAttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedRecord: any) => void;
  onDelete?: (attendanceId: string) => void;
  record: any;
  user: any;
  isNewRecord?: boolean;
}

interface Project {
  _id: string;
  projectName: string;
  projectNumber: string;
  location: string;
  building: string;
  apartmentNumber: string;
  clientName: string;
  assignmentType: string;
}

const EditAttendanceModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  onDelete,
  record, 
  user,
  isNewRecord = false
}: EditAttendanceModalProps) => {
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(false);

  const [formData, setFormData] = useState({
    status: 'present' as 'present' | 'absent' | 'dayoff',
    workingHours: '8',
    type: 'normal',
    projectId: ''
  });

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      if (record && !isNewRecord) {
        // Determine status from record
        let status: 'present' | 'absent' | 'dayoff' = 'present';
        if (record.isPaidLeave) {
          status = 'dayoff';
        } else if (!record.present) {
          status = 'absent';
        }

        setFormData({
          status,
          workingHours: record.workingHours?.toString() || '0',
          type: record.type || 'normal',
          projectId: record.project?._id || ''
        });
      } else {
        // For new record - default values
        setFormData({
          status: 'present',
          workingHours: '8',
          type: 'normal',
          projectId: ''
        });
      }
    }
  }, [isOpen, record, isNewRecord]);

  // Fetch user's projects when modal opens and type is project
  useEffect(() => {
    const fetchUserProjects = async () => {
      // Don't fetch projects if type is not project OR status is day off
      if (!user?._id || formData.type !== 'project' || formData.status === 'dayoff') {
        setProjects([]);
        return;
      }
      
      try {
        setProjectsLoading(true);
        const response = await apiGetUserProjects(user._id);
        if (response.data) {
          setProjects(response.data.data || []);
          
          if (response.data.data.length === 0) {
            toast.push(
              <Notification title="Info" type="warning">
                No projects assigned to this user
              </Notification>
            );
          }
        }
      } catch (error: any) {
        console.error('Error fetching user projects:', error);
        toast.push(
          <Notification title="Error" type="danger">
            {error?.response?.data?.message || 'Failed to load projects'}
          </Notification>
        );
        setProjects([]);
      } finally {
        setProjectsLoading(false);
      }
    };

    if (isOpen && formData.type === 'project' && formData.status !== 'dayoff') {
      fetchUserProjects();
    } else {
      setProjects([]);
    }
  }, [isOpen, formData.type, formData.status, user?._id]);

  // Reset project when status changes to day off
  useEffect(() => {
    if (formData.status === 'dayoff') {
      setFormData(prev => ({ ...prev, projectId: '', type: 'normal' }));
    }
  }, [formData.status]);

  const handleSave = async () => {
    if (!user) {
      toast.push(
        <Notification title="Error" type="danger">
          No user selected
        </Notification>
      );
      return;
    }

    // Validate project selection for project type (unless day off)
    if (formData.type === 'project' && formData.status !== 'dayoff' && !formData.projectId) {
      toast.push(
        <Notification title="Error" type="danger">
          Please select a project for project attendance
        </Notification>
      );
      return;
    }

    // Day off cannot have project
    if (formData.status === 'dayoff' && formData.projectId) {
      toast.push(
        <Notification title="Error" type="danger">
          Day off cannot be associated with a project
        </Notification>
      );
      return;
    }

    // Validate working hours for present status
    const workingHoursValue = parseFloat(formData.workingHours);
    if (formData.status === 'present' && (isNaN(workingHoursValue) || workingHoursValue < 0 || workingHoursValue > 24)) {
      toast.push(
        <Notification title="Error" type="danger">
          Working hours must be between 0 and 24
        </Notification>
      );
      return;
    }

    try {
      setLoading(true);

      const attendanceData = {
        userId: user._id,
        date: record?.date ? new Date(record.date).toISOString() : new Date().toISOString(),
        present: formData.status === 'present',
        isPaidLeave: formData.status === 'dayoff',
        workingHours: formData.status === 'present' ? parseFloat(formData.workingHours) || 0 : 0,
        type: formData.status === 'dayoff' ? 'normal' : formData.type, // Force normal for day off
        projectId: (formData.type === 'project' && formData.status !== 'dayoff') ? formData.projectId : undefined
      };

      console.log('Saving attendance data:', attendanceData);

      const response = await apiCreateOrUpdateAttendance(attendanceData);

      if (response.data) {
        onSave(response.data.data);
        toast.push(
          <Notification title="Success" type="success">
            {isNewRecord ? 'Attendance created successfully' : 'Attendance updated successfully'}
          </Notification>
        );
        onClose();
      }
    } catch (error: any) {
      console.error('Error saving attendance:', error);
      toast.push(
        <Notification title="Error" type="danger">
          {error?.response?.data?.message || error?.message || 'Failed to save attendance'}
        </Notification>
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!record?._id || !onDelete) return;

    try {
      setDeleteLoading(true);
      await apiDeleteAttendanceRecord(record._id);
      
      onDelete(record._id);
      toast.push(
        <Notification title="Success" type="success">
          Attendance record deleted successfully
        </Notification>
      );
      onClose();
    } catch (error: any) {
      console.error('Error deleting attendance:', error);
      toast.push(
        <Notification title="Error" type="danger">
          {error?.response?.data?.message || error?.message || 'Failed to delete attendance'}
        </Notification>
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleWorkingHoursChange = (value: string) => {
    const numericValue = value.replace(/[^0-9.]/g, '');
    const parts = numericValue.split('.');
    const formattedValue = parts.length > 2 
      ? parts[0] + '.' + parts.slice(1).join('')
      : numericValue;

    setFormData(prev => ({
      ...prev,
      workingHours: formattedValue
    }));
  };

  const handleStatusChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      status: value as 'present' | 'absent' | 'dayoff',
      workingHours: value === 'present' ? prev.workingHours : '0'
    }));
  };

  const handleTypeChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      type: value,
      projectId: ''
    }));
  };

  const renderSelect = (value: string, onChange: (value: string) => void, options: { value: string; label: string }[], placeholder?: string) => {
    return (
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  };

  if (!user) return null;

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      onRequestClose={onClose}
      width={500}
      height="auto"
      contentClassName="flex flex-col max-h-[90vh]"
    >
      {/* Header - Fixed */}
      <div className="flex-shrink-0 p-6 border-b border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
            <HiUser className="text-xl text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1">
            <h4 className="text-lg font-bold text-gray-900 dark:text-white">
              {isNewRecord ? 'Create Attendance' : 'Edit Attendance'}
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {user.firstName} {user.lastName}
            </p>
          </div>
          {!isNewRecord && record?._id && (
            <Button
              variant="plain"
              color="red"
              icon={<HiTrash />}
              loading={deleteLoading}
              onClick={handleDelete}
              className="text-red-600 hover:text-red-700"
            >
              Delete
            </Button>
          )}
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {/* Date Display */}
        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Date: {new Date(record?.date || new Date()).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>

        {/* Status Selection - NOW WITH 3 OPTIONS */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Attendance Status
          </label>
          {renderSelect(
            formData.status,
            handleStatusChange,
            [
              { value: 'present', label: '✓ Present' },
              { value: 'absent', label: '✗ Absent (Unpaid)' },
              { value: 'dayoff', label: '⭐ Day Off (Paid Leave)' }
            ]
          )}
        </div>

        {/* Type Selection - Only show if NOT day off */}
        {formData.status !== 'dayoff' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Attendance Type
            </label>
            {renderSelect(
              formData.type,
              handleTypeChange,
              [
                { value: 'normal', label: 'Normal (Office)' },
                { value: 'project', label: 'Project' }
              ]
            )}
          </div>
        )}

        {/* Day Off Info Banner */}
        {formData.status === 'dayoff' && (
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-2">
              <HiCalendar className="text-blue-600 dark:text-blue-400 text-xl mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                  Paid Leave / Day Off
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                  • This is a company-paid leave
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  • Cannot be assigned to any project
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  • Working hours will be set to 0
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Project Selection - Only show for project type AND not day off */}
        {formData.type === 'project' && formData.status !== 'dayoff' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <HiOfficeBuilding className="inline mr-1" />
              Select Project
            </label>
            {renderSelect(
              formData.projectId,
              (value) => setFormData(prev => ({ ...prev, projectId: value })),
              [
                { value: '', label: projectsLoading ? "Loading projects..." : "Select a project" },
                ...projects.map(project => ({
                  value: project._id,
                  label: `${project.projectName} - ${project.projectNumber}${project.location ? ` (${project.location})` : ''}${project.assignmentType ? ` - ${project.assignmentType}` : ''}`
                }))
              ]
            )}
            {projectsLoading && (
              <p className="text-xs text-gray-500 mt-1">Loading projects...</p>
            )}
            {projects.length === 0 && !projectsLoading && (
              <p className="text-xs text-yellow-500 mt-1">
                No projects assigned to this user
              </p>
            )}
            {!formData.projectId && projects.length > 0 && (
              <p className="text-xs text-red-500 mt-1">
                Please select a project
              </p>
            )}
          </div>
        )}

        {/* Working Hours - Only show if present */}
        {formData.status === 'present' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <HiClock className="inline mr-1" />
              Working Hours
            </label>
            <Input
              type="text"
              value={formData.workingHours}
              onChange={(e) => handleWorkingHoursChange(e.target.value)}
              placeholder="8"
              className="w-full"
            />
            <p className="text-xs text-gray-500 mt-1">
              Regular working hours (0-24)
            </p>
          </div>
        )}

        {/* Show message when absent */}
        {formData.status === 'absent' && (
          <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-800">
            <p className="text-sm text-red-700 dark:text-red-300">
              <HiX className="inline mr-1" />
              User is marked as absent (unpaid). Working hours will be set to 0.
            </p>
          </div>
        )}

        {/* Existing Project Info */}
        {record?.project && formData.status !== 'dayoff' && (
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Project: <strong>{record.project.projectName}</strong>
            </p>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
              ID: {record.project._id}
            </p>
          </div>
        )}

        {/* Record Info */}
        {!isNewRecord && record && (
          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Last updated by: {record.markedBy?.firstName} {record.markedBy?.lastName}
            </p>
            {record.createdAt && (
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Created: {new Date(record.createdAt).toLocaleDateString()}
              </p>
            )}
            {record.isPaidLeave && (
              <Badge className="mt-2" content="Paid Leave" innerClass="bg-blue-500 text-white" />
            )}
          </div>
        )}
      </div>

      {/* Footer - Fixed */}
      <div className="flex-shrink-0 flex gap-3 justify-end p-6 border-t border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800">
        <Button
          variant="plain"
          onClick={onClose}
          disabled={loading || deleteLoading}
        >
          Cancel
        </Button>
        <Button
          variant="solid"
          color="blue"
          icon={<HiCheck />}
          loading={loading}
          onClick={handleSave}
          disabled={formData.type === 'project' && formData.status !== 'dayoff' && !formData.projectId}
        >
          {isNewRecord ? 'Create' : 'Save Changes'}
        </Button>
      </div>
    </Dialog>
  );
};

export default EditAttendanceModal;