import { useState, useRef, useEffect } from 'react';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Loading from '@/components/shared/Loading';
import Avatar from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';
import { 
  HiCheck, 
  HiOutlineEye, 
  HiX, 
  HiTag, 
  HiOutlineArrowUp, 
  HiUserGroup, 
  HiTruck,
  HiDocumentReport,
  HiCalendar,
  HiClipboardList,
  HiChatAlt2
} from 'react-icons/hi';
import { 
  apiGetProjectDetails, 
  apiGetProjectProgressUpdates, 
  apiPostProjectProgressUpdate,
  apiGetAssignedTeam
} from '../../api/api';
import { useParams } from 'react-router-dom';
import { Notification, toast } from '@/components/ui';
import { NumericFormat } from 'react-number-format';
import ProgressBar from './ProgressBar';

type Comment = {
  id: string;
  name: string;
  img: string;
  time: string;
  comment: string;
  actionType?: string;
  progress?: number;
};

type TeamMember = {
  _id: string;
  firstName: string;
  lastName: string;
  profileImage?: string;
};

const TimelineAvatar = ({ src }: { src?: string }) => {
  return (
    <Avatar 
      src={src} 
      size={40} 
      shape="circle" 
      className="ring-2 ring-white dark:ring-gray-800 shadow-md"
    />
  );
};

const StatusTag = ({ status, time }: { status: string, time: string }) => {
  const getTagStyle = () => {
    switch (status.toLowerCase()) {
      case 'approval':
      case 'approved':
        return {
          bg: 'bg-emerald-100 dark:bg-emerald-500/20',
          icon: <HiCheck className="text-emerald-600 dark:text-emerald-400" />,
          text: 'Approved',
          textColor: 'text-emerald-600 dark:text-emerald-400'
        };
      case 'check':
      case 'checked':
        return {
          bg: 'bg-amber-100 dark:bg-amber-500/20',
          icon: <HiOutlineEye className="text-amber-600 dark:text-amber-400" />,
          text: 'Checked',
          textColor: 'text-amber-600 dark:text-amber-400'
        };
      case 'reject':
      case 'rejected':
        return {
          bg: 'bg-red-100 dark:bg-red-500/20',
          icon: <HiX className="text-red-600 dark:text-red-400" />,
          text: 'Rejected',
          textColor: 'text-red-600 dark:text-red-400'
        };
      case 'progress_update':
        return {
          bg: 'bg-indigo-100 dark:bg-indigo-500/20',
          icon: <HiOutlineArrowUp className="text-indigo-600 dark:text-indigo-400" />,
          text: 'Progress Update',
          textColor: 'text-indigo-600 dark:text-indigo-400'
        };
      default:
        return {
          bg: 'bg-blue-100 dark:bg-blue-500/20',
          icon: <HiTag className="text-blue-600 dark:text-blue-400" />,
          text: 'General',
          textColor: 'text-blue-600 dark:text-blue-400'
        };
    }
  };

  const tagStyle = getTagStyle();

  return (
    <div className="flex items-center gap-2">
      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${tagStyle.bg} ${tagStyle.textColor} shadow-sm`}>
        <span className="mr-1">{tagStyle.icon}</span>
        {tagStyle.text}
      </div>
      <span className="text-sm text-gray-500 dark:text-gray-400">{time}</span>
    </div>
  );
};

const CommentItem = ({ comment }: { comment: Comment }) => {
  return (
    <div className="flex mb-6 group">
      <div className="flex flex-col items-center mr-4">
        <TimelineAvatar src={comment.img} />
        <div className="w-px h-full bg-gradient-to-b from-indigo-200 to-purple-200 dark:from-gray-600 dark:to-gray-700 mt-2"></div>
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-3">
          <span className="font-semibold text-gray-900 dark:text-gray-100">
            {comment.name}
          </span>
          <StatusTag status={comment.actionType || 'general'} time={comment.time} />
        </div>
        {comment.progress !== undefined && (
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Progress Update</span>
              <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                {comment.progress}%
              </span>
            </div>
            <ProgressBar 
              percent={comment.progress} 
              showInfo={false}
              strokeColor="#4f46e5"
              trailColor="#e0e7ff"
              className="h-2 rounded-full"
            />
          </div>
        )}
        <div className="p-4 bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-800 dark:to-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 shadow-sm">
          <p className="text-gray-800 dark:text-gray-200">
            {comment.comment}
          </p>
        </div>
      </div>
    </div>
  );
};

const Progress = () => {
  const [loading, setLoading] = useState(true);
  const [commenting, setCommenting] = useState(false);
  const [progress, setProgress] = useState(0);
  const commentInput = useRef<HTMLInputElement>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const { projectId } = useParams();
  const [teamAssigned, setTeamAssigned] = useState(false);
  const [loadingTeam, setLoadingTeam] = useState(true);
  const [assignedTeam, setAssignedTeam] = useState<{
    workers: TeamMember[];
    driver: TeamMember | null;
  }>({ workers: [], driver: null });

  useEffect(() => {
    const checkTeamAssignment = async () => {
      try {
        const [projectResponse, teamResponse] = await Promise.all([
          apiGetProjectDetails(projectId),
          apiGetAssignedTeam(projectId)
        ]);
        
        const project = projectResponse.data.data;
        const team = teamResponse.data.data;
        
        const statusRequiresTeam = [
          'team_assigned', 
          'work_started', 
          'in_progress',
          'work_completed',
          'quality_check',
          'client_handover'
        ].includes(project.status);
        
        setTeamAssigned(
          statusRequiresTeam && 
          project.assignedWorkers?.length > 0 && 
          project.assignedDriver
        );
        
        if (team) {
          setAssignedTeam({
            workers: team.workers || [],
            driver: team.driver || null
          });
        }
      } catch (error) {
        console.error('Error checking team assignment:', error);
        toast.push(
          <Notification title="Error" type="danger">
            Failed to load team information
          </Notification>
        );
      } finally {
        setLoadingTeam(false);
      }
    };

    checkTeamAssignment();
  }, [projectId]);

  useEffect(() => {
    const fetchProgressUpdates = async () => {
      try {
        setLoading(true);
        const response = await apiGetProjectProgressUpdates(projectId);
        if (response.data) {
          const formattedComments = response.data.map((item: any) => ({
            id: item._id,
            name: item.user?.firstName 
              ? `${item.user.firstName} ${item.user.lastName}`
              : 'Unknown User',
            img: item.user?.profileImage || '/img/avatars/thumb-1.jpg',
            time: new Date(item.createdAt).toLocaleString(),
            comment: item.content,
            actionType: item.actionType,
            progress: item.progress
          }));
          setComments(formattedComments);
          
          if (formattedComments.length > 0 && formattedComments[0].progress !== undefined) {
            setProgress(formattedComments[0].progress);
          }
        }
      } catch (error) {
        console.error('Failed to fetch progress updates:', error);
        toast.push(
          <Notification title="Error" type="danger">
            Failed to load progress updates
          </Notification>
        );
      } finally {
        setLoading(false);
      }
    };
    
    fetchProgressUpdates();
  }, [projectId]);

  const submitComment = async () => {
    const message = commentInput.current?.value;
    if (!message?.trim()) return;

    try {
      setCommenting(true);
      
      const response = await apiPostProjectProgressUpdate({
        projectId,
        progress,
        comment: message
      });
      
      if (response.data) {
        const newComment = {
          id: response.data._id,
          name: 'You',
          img: '/img/avatars/thumb-1.jpg',
          time: 'just now',
          comment: message,
          actionType: 'progress_update',
          progress: progress
        };
        
        setComments(prev => [newComment, ...prev]);
        if (commentInput.current) {
          commentInput.current.value = '';
        }
        
        toast.push(
          <Notification title="Success" type="success">
            Progress updated successfully
          </Notification>
        );
      }
    } catch (error) {
      console.error('Failed to submit progress update:', error);
      toast.push(
        <Notification title="Error" type="danger">
          Failed to update progress
        </Notification>
      );
    } finally {
      setCommenting(false);
    }
  };

  if (loadingTeam) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-850 dark:to-gray-900">
        <Loading />
      </div>
    );
  }

  if (!teamAssigned) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-850 dark:to-gray-900">
        <div className="container mx-auto p-6">
          <Card className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden text-center p-8">
            <div className="mb-4">
              <HiUserGroup className="text-6xl text-indigo-600 dark:text-indigo-400 mx-auto" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Team Not Assigned</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Please assign workers and a driver before updating progress
            </p>
            <Button
              variant="solid"
              onClick={() => window.location.href = `/app/teams-assign/${projectId}`}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
            >
              Assign Team
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-850 dark:to-gray-900">
      <div className="container mx-auto p-6">
        <Loading loading={loading}>
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg">
                <HiDocumentReport className="text-2xl text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Project Progress</h1>
                <p className="text-gray-500 dark:text-gray-400">Track and update the current status of the project</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8">
            {/* Left Column - Team Assignment */}
            <div className="xl:col-span-1">
              <Card className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-750 p-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg">
                      <HiUserGroup className="text-2xl text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white">Assigned Team</h3>
                  </div>
                </div>
                <div className="p-6">
                  <div className="space-y-6">
                    <div>
                      <h6 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
                        Workers ({assignedTeam.workers.length})
                      </h6>
                      <div className="space-y-3">
                        {assignedTeam.workers.map(worker => (
                          <div key={worker._id} className="flex items-center p-3 bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-700 dark:to-gray-600 rounded-xl border border-gray-200 dark:border-gray-600">
                            <Avatar src={worker.profileImage} size={40} />
                            <span className="ml-3 dark:text-gray-200 font-medium">
                              {worker.firstName} {worker.lastName}
                            </span>
                          </div>
                        ))}
                        {assignedTeam.workers.length === 0 && (
                          <p className="text-gray-500 dark:text-gray-400 text-sm py-2 text-center">
                            No workers assigned
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <h6 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-2">
                        <HiTruck className="text-indigo-600 dark:text-indigo-400" />
                        Driver
                      </h6>
                      {assignedTeam.driver ? (
                        <div className="flex items-center p-3 bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-700 dark:to-gray-600 rounded-xl border border-gray-200 dark:border-gray-600">
                          <Avatar src={assignedTeam.driver.profileImage} size={40} />
                          <span className="ml-3 dark:text-gray-200 font-medium">
                            {assignedTeam.driver.firstName} {assignedTeam.driver.lastName}
                          </span>
                        </div>
                      ) : (
                        <p className="text-gray-500 dark:text-gray-400 text-sm py-2 text-center">
                          No driver assigned
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Right Column - Progress & Updates */}
            <div className="xl:col-span-2">
              {/* Progress Section */}
              <Card className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden mb-8">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-750 p-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg">
                      <HiClipboardList className="text-2xl text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white">Current Progress</h3>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h5 className="text-md font-semibold dark:text-gray-200">Project Completion</h5>
                    <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                      <NumericFormat
                        displayType="text"
                        value={progress}
                        suffix="%"
                        decimalScale={0}
                      />
                    </span>
                  </div>
                  <ProgressBar 
                    percent={progress} 
                    showInfo={false}
                    className="mb-6"
                    strokeColor="#4f46e5"
                    trailColor="#e0e7ff"
                    className="h-3 rounded-full"
                  />
                  <div className="flex items-center gap-4">
                    <Input 
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={progress}
                      onChange={(e) => setProgress(Number(e.target.value))}
                      className="flex-1"
                    />
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400 w-12 text-center">
                      {progress}%
                    </span>
                  </div>
                </div>
              </Card>

              {/* Progress History */}
              <Card className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden mb-8">
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-750 p-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg">
                      <HiCalendar className="text-2xl text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white">Progress History</h3>
                  </div>
                </div>
                <div className="p-6">
                  {comments.length > 0 ? (
                    <div className="space-y-6">
                      {comments.map((comment) => (
                        <CommentItem key={comment.id} comment={comment} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <HiChatAlt2 className="text-4xl text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 dark:text-gray-400">No progress updates yet</p>
                      <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                        Be the first to update the progress
                      </p>
                    </div>
                  )}
                </div>
              </Card>

              {/* Add Progress Update */}
              <Card className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-gray-800 dark:to-gray-750 p-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-lg">
                      <HiChatAlt2 className="text-2xl text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white">Add Progress Update</h3>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex gap-4">
                    <TimelineAvatar src="/img/avatars/thumb-1.jpg" />
                    <div className="flex-1">
                      <Input
                        ref={commentInput}
                        textArea
                        placeholder="Describe what's been completed, any challenges, or next steps..."
                        disabled={commenting}
                        rows={3}
                        className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                      />
                      <div className="flex justify-between items-center mt-4">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Progress will be saved with your comment
                        </span>
                        <Button
                          variant="solid"
                          onClick={submitComment}
                          loading={commenting}
                          disabled={commenting}
                          icon={<HiOutlineArrowUp />}
                          className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold px-6 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                        >
                          Post Update
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </Loading>
      </div>
    </div>
  );
};

export default Progress;