// components/EditAttendanceModal.tsx - SIMPLIFIED WITHOUT EXTRA TIME BOXES
import { useState, useEffect } from 'react';
import { 
  Dialog, 
  Button, 
  Input, 
  Select, 
  Notification,
  toast,
  Avatar
} from '@/components/ui';
import { HiCheck, HiX, HiClock, HiUser, HiTrash, HiOfficeBuilding } from 'react-icons/hi';
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
    present: true,
    workingHours: '8',
    type: 'normal',
    projectId: ''
  });

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      if (record && !isNewRecord) {
        // For existing record
        setFormData({
          present: record.present || false,
          workingHours: record.workingHours?.toString() || '0',
          type: record.type || 'normal',
          projectId: record.project?._id || ''
        });
      } else {
        // For new record - default values
        setFormData({
          present: true,
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
      if (!user?._id || formData.type !== 'project') {
        setProjects([]);
        return;
      }
      
      try {
        setProjectsLoading(true);
        const response = await apiGetUserProjects(user._id);
        if (response.data) {
          setProjects(response.data.data || []);
          
          // If no projects found and type is project, show warning
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

    if (isOpen && formData.type === 'project') {
      fetchUserProjects();
    } else {
      setProjects([]);
    }
  }, [isOpen, formData.type, user?._id]);

  const handleSave = async () => {
    if (!user) {
      toast.push(
        <Notification title="Error" type="danger">
          No user selected
        </Notification>
      );
      return;
    }

    // Validate project selection for project type
    if (formData.type === 'project' && !formData.projectId) {
      toast.push(
        <Notification title="Error" type="danger">
          Please select a project for project attendance
        </Notification>
      );
      return;
    }

    // Validate working hours
    const workingHoursValue = parseFloat(formData.workingHours);
    if (formData.present && (isNaN(workingHoursValue) || workingHoursValue < 0 || workingHoursValue > 24)) {
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
        present: formData.present,
        workingHours: formData.present ? parseFloat(formData.workingHours) || 0 : 0,
        type: formData.type,
        projectId: formData.type === 'project' ? formData.projectId : undefined
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
    // Allow only numbers and decimal point
    const numericValue = value.replace(/[^0-9.]/g, '');
    
    // Ensure only one decimal point
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
    const isPresent = value === 'present';
    setFormData(prev => ({
      ...prev,
      present: isPresent,
      workingHours: isPresent ? prev.workingHours : '0'
    }));
  };

  const handleTypeChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      type: value,
      projectId: '' // Reset project when type changes
    }));
  };

  // If the Select component isn't working, let's use native select as fallback
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

        {/* Status and Type in Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Status
            </label>
            {renderSelect(
              formData.present ? 'present' : 'absent',
              handleStatusChange,
              [
                { value: 'present', label: 'Present' },
                { value: 'absent', label: 'Absent' }
              ]
            )}
          </div>

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
        </div>

        {/* Project Selection - Only show for project type */}
        {formData.type === 'project' && (
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
        {formData.present && (
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
        {!formData.present && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              <HiX className="inline mr-1" />
              User is marked as absent. Working hours will be set to 0.
            </p>
          </div>
        )}

        {/* Existing Project Info */}
        {record?.project && (
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
          disabled={formData.type === 'project' && !formData.projectId}
        >
          {isNewRecord ? 'Create' : 'Save Changes'}
        </Button>
      </div>
    </Dialog>
  );
};

export default EditAttendanceModal;