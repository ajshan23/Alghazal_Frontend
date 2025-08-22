import { useState, useEffect } from 'react';
import { Button, Card, Avatar, Badge, Notification, toast } from '@/components/ui';
import { HiCheck, HiX, HiOutlineRefresh } from 'react-icons/hi';
import { apiMarkNormalAttendance, apiGetDailyNormalAttendance } from '../api/api';
import useThemeClass from '@/utils/hooks/useThemeClass';
import dayjs from 'dayjs';
import { Loading } from '@/components/shared';
import { FiUser } from 'react-icons/fi';
import MarkAttendanceModal from './components/MarkAttendanceModal';

interface UserAttendance {
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    profileImage?: string;
    role: string;
  };
  present: boolean;
  markedBy?: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  markedAt?: Date;
}

const NormalAttendancePage = () => {
  const { textTheme } = useThemeClass();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [attendanceData, setAttendanceData] = useState<UserAttendance[]>([]);
  const [date, setDate] = useState(dayjs().format('DD MMM YYYY'));
  const [attendanceModal, setAttendanceModal] = useState(false)
  const [selectedWorker, setSelectedWorker] = useState<string | null>(null)


  console.log(attendanceModal,"attendanceModal")
  const fetchAttendanceData = async () => {
    try {
      setLoading(true);
      const today = dayjs().format('YYYY-MM-DD');
      const response = await apiGetDailyNormalAttendance(today);
      
      if (response.data && response.data.data) {
        setAttendanceData(response.data.data.users || []);
        setDate(dayjs(response.data.data.date).format('DD MMM YYYY'));
      }
    } catch (error: any) {
      toast.push(
        <Notification title="Error fetching attendance" type="danger">
          {error.message}
        </Notification>
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendanceData();
  }, []);

  const handleMarkAttendance = async (userId: string, present: boolean,hour?:number) => {
    try {
      setSubmitting(true);
      await apiMarkNormalAttendance({
        userId,
        present,
        hour
      });
      
      // Update local state
      setAttendanceData(prev => prev.map(item => 
        item.user._id === userId 
          ? { 
              ...item, 
              present,
              markedBy: {
                _id: 'current-user',
                firstName: 'You',
                lastName: ''
              },
              markedAt: new Date()
            } 
          : item
      ));
      
      toast.push(
        <Notification title="Success" type="success">
          Attendance marked successfully
        </Notification>
      );
    } catch (error: any) {
      toast.push(
        <Notification title="Error marking attendance" type="danger">
          {error.message}
        </Notification>
      );
    } finally {
      setSubmitting(false);
    }
  };

  // const handleMarkAll = async (present: boolean) => {
  //   try {
  //     setSubmitting(true);
  //     await Promise.all(
  //       attendanceData.map(item => 
  //         apiMarkNormalAttendance({
  //           userId: item.user._id,
  //           present
  //         })
  //       )
  //     );
      
  //     // Update all users
  //     setAttendanceData(prev => prev.map(item => ({
  //       ...item,
  //       present,
  //       markedBy: {
  //         _id: 'current-user',
  //         firstName: 'You',
  //         lastName: ''
  //       },
  //       markedAt: new Date()
  //     })));
      
  //     toast.push(
  //       <Notification title="Success" type="success">
  //         All users marked as {present ? 'present' : 'absent'}
  //       </Notification>
  //     );
  //   } catch (error: any) {
  //     toast.push(
  //       <Notification title="Error marking attendance" type="danger">
  //         {error.message}
  //       </Notification>
  //     );
  //   } finally {
  //     setSubmitting(false);
  //   }
  // };

  const openModal = (workerId: string) => {
    setSelectedWorker(workerId)
    setAttendanceModal(true)
  }

  const closeModal = () => {
    setSelectedWorker(null)
    setAttendanceModal(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loading />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 h-full">
      <Card
        header={
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <h4 className="text-lg font-bold mb-1">Normal Attendance</h4>
              <p className="text-gray-500 dark:text-gray-400">
                {date}
              </p>
            </div>
            <div className="flex items-center gap-2 mt-2 md:mt-0">
              <Button
                size="sm"
                variant="plain"
                icon={<HiOutlineRefresh />}
                onClick={fetchAttendanceData}
              >
                Refresh
              </Button>
              {/* <Button
                size="sm"
                variant="solid"
                onClick={() => handleMarkAll(true)}
                disabled={submitting}
              >
                Mark All Present
              </Button> */}
            </div>
          </div>
        }
      >
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
              {attendanceData.length > 0 ? (
                attendanceData.map((item) => (
                  <tr key={item.user._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Avatar
                          size="sm"
                          src={item.user.profileImage}
                          className="mr-3"
                          icon={<FiUser />}
                        />
                        <div>
                          <div className="font-medium text-gray-900 dark:text-gray-200">
                            {item.user.firstName} {item.user.lastName}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {item.user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge
                        content={item.user.role.replace('_', ' ')}
                        innerClass="bg-blue-500 text-white"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge
                        content={item.present ? 'Present' : 'Absent'}
                        innerClass={`${
                          item.present
                            ? 'bg-emerald-500 text-white'
                            : 'bg-red-500 text-white'
                        }`}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="xs"
                          variant="solid"
                          color="green"
                          icon={<HiCheck />}
                          onClick={() => openModal(item?.user._id)}                          
                          disabled={submitting || item.present}
                        >
                          Present
                        </Button>
                        <Button
                          size="xs"
                          variant="solid"
                          color="red"
                          icon={<HiX />}
                          onClick={() => handleMarkAttendance(item.user._id, false)}
                          disabled={submitting || !item.present}
                        >
                          Absent
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                    No attendance records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </Card>
      <MarkAttendanceModal
        isOpen={attendanceModal}
        onClose={closeModal}
        onConfirm={(e, selectedHour) => {
          if (selectedWorker) {
            handleMarkAttendance(selectedWorker, true, selectedHour)
            closeModal(e); 
          }
        }}
      />
    </div>
  );
};

export default NormalAttendancePage;