import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Card, 
  Badge, 
  Button, 
  Notification,
  toast
} from '@/components/ui';
import { HiOutlineRefresh, HiChevronLeft, HiChevronRight, HiDownload } from 'react-icons/hi';
import { apiGetUserMonthlyAttendance, apiGetUsers } from '../api/api';
import dayjs from 'dayjs';
import { Loading } from '@/components/shared';
import * as XLSX from 'xlsx';

interface AttendanceRecord {
  _id: string;
  date: Date;
  present: boolean;
  markedBy: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  type: 'project' | 'normal';
  project?: {
    _id: string;
    projectName: string;
  };
}

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  profileImage?: string;
}

const UserMonthlyAttendancePage = () => {
  const { userId } = useParams();
  const [loading, setLoading] = useState(true);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [month, setMonth] = useState<number>(dayjs().month() + 1);
  const [year, setYear] = useState<number>(dayjs().year());
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>(userId || '');
  const [selectedUserName, setSelectedUserName] = useState<string>('');

  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
  ];

  const years = Array.from({ length: 10 }, (_, i) => ({
    value: dayjs().year() - 5 + i,
    label: (dayjs().year() - 5 + i).toString(),
  }));

  const fetchUsers = async () => {
    try {
      const response = await apiGetUsers({ limit: 1000 });
      setUsers(response.data.data.users);
      // Set the selected user name if userId is provided in URL
      if (userId) {
        const user = response.data.data.users.find(u => u._id === userId);
        if (user) {
          setSelectedUserName(`${user.firstName} ${user.lastName}`);
        }
      }
    } catch (error: any) {
      toast.push(
        <Notification title="Error fetching users" type="danger">
          {error.message}
        </Notification>
      );
    }
  };

  const fetchAttendance = async () => {
    if (!selectedUser) return;

    try {
      setLoading(true);
      const response = await apiGetUserMonthlyAttendance(
        selectedUser,
        month,
        year
      );
      setAttendance(response.data.data);
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

  const changeMonth = (increment: number) => {
    const newDate = dayjs().month(month - 1).year(year).add(increment, 'month');
    setMonth(newDate.month() + 1);
    setYear(newDate.year());
  };

  const handleUserChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const userId = e.target.value;
    setSelectedUser(userId);
    const user = users.find(u => u._id === userId);
    setSelectedUserName(user ? `${user.firstName} ${user.lastName}` : '');
  };

  const exportToExcel = () => {
    if (attendance.length === 0) {
      toast.push(
        <Notification title="No data to export" type="warning">
          There are no attendance records to export
        </Notification>
      );
      return;
    }

    // Prepare data for Excel
    const data = attendance.map(record => ({
      Date: dayjs(record.date).format('DD/MM/YYYY'),
      Status: record.present ? 'Present' : 'Absent',
      Type: record.type === 'project' ? 'Project' : 'Normal',
      Project: record.project?.projectName || 'N/A',
      'Marked By': record.markedBy ? `${record.markedBy.firstName} ${record.markedBy.lastName}` : 'System'
    }));

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(data);
    
    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Attendance");
    
    // Generate file name
    const fileName = `Attendance_${selectedUserName || 'User'}_${months[month - 1].label}_${year}.xlsx`;
    
    // Export to Excel
    XLSX.writeFile(wb, fileName);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    fetchAttendance();
  }, [selectedUser, month, year]);

  const renderCalendar = () => {
    const startOfMonth = dayjs().year(year).month(month - 1).startOf('month');
    const endOfMonth = dayjs().year(year).month(month - 1).endOf('month');
    const daysInMonth = endOfMonth.date();
    const startDay = startOfMonth.day();

    const attendanceMap = new Map<string, AttendanceRecord>();
    attendance.forEach(record => {
      const dateStr = dayjs(record.date).format('YYYY-MM-DD');
      attendanceMap.set(dateStr, record);
    });

    const weeks = [];
    let days = [];
    
    for (let i = 0; i < startDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-24 p-1 border border-gray-200 dark:border-gray-700" />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = dayjs().year(year).month(month - 1).date(day);
      const dateStr = currentDate.format('YYYY-MM-DD');
      const record = attendanceMap.get(dateStr);
      const isToday = currentDate.isSame(dayjs(), 'day');
      const isWeekend = currentDate.day() === 0 || currentDate.day() === 6;

      days.push(
        <div 
          key={`day-${day}`} 
          className={`h-24 p-1 border border-gray-200 dark:border-gray-700 ${
            isToday ? 'bg-blue-50 dark:bg-blue-900/30' : 
            isWeekend ? 'bg-gray-50 dark:bg-gray-800' : ''
          }`}
        >
          <div className="flex justify-between items-start">
            <span className={`
              inline-flex items-center justify-center w-6 h-6 rounded-full text-sm font-medium
              ${record ? 
                (record.present ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200' : 
                                 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200') :
                'text-gray-800 dark:text-gray-200'
              }
              ${isToday ? 'ring-2 ring-blue-500' : ''}
            `}>
              {day}
            </span>
            {record && (
              <Badge
                content={record.type === 'project' ? 'P' : 'N'}
                innerClass={`${record.type === 'project' ? 'bg-blue-500' : 'bg-purple-500'} text-white`}
              />
            )}
          </div>
          {record && (
            <div className="mt-1 text-xs space-y-1">
              {record.type === 'project' && record.project && (
                <div className="truncate" title={record.project.projectName}>
                  {record.project.projectName}
                </div>
              )}
              <div className="text-gray-500 dark:text-gray-400">
                {record.markedBy ? `${record.markedBy.firstName} ${record.markedBy.lastName}` : 'System'}
              </div>
            </div>
          )}
        </div>
      );

      if (days.length === 7) {
        weeks.push(<div key={`week-${weeks.length}`} className="grid grid-cols-7">{days}</div>);
        days = [];
      }
    }

    if (days.length > 0) {
      while (days.length < 7) {
        days.push(<div key={`empty-end-${days.length}`} className="h-24 p-1 border border-gray-200 dark:border-gray-700" />);
      }
      weeks.push(<div key={`week-${weeks.length}`} className="grid grid-cols-7">{days}</div>);
    }

    return weeks;
  };

  return (
    <div className="container mx-auto px-4 h-full">
      <Card
        header={
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h4 className="text-lg font-bold">Monthly Attendance</h4>
            <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
              <select
                className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
                value={selectedUser}
                onChange={handleUserChange}
              >
                <option value="">Select user</option>
                {users.map(user => (
                  <option key={user._id} value={user._id}>
                    {user.firstName} {user.lastName}
                  </option>
                ))}
              </select>
              <div className="flex gap-2">
                <select
                  className="p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
                  value={month}
                  onChange={(e) => setMonth(Number(e.target.value))}
                >
                  {months.map(m => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
                <select
                  className="p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                >
                  {years.map(y => (
                    <option key={y.value} value={y.value}>
                      {y.label}
                    </option>
                  ))}
                </select>
                <Button
                  variant="plain"
                  shape="circle"
                  icon={<HiOutlineRefresh />}
                  onClick={fetchAttendance}
                />
                <Button
                  variant="plain"
                  shape="circle"
                  icon={<HiChevronLeft />}
                  onClick={() => changeMonth(-1)}
                />
                <Button
                  variant="plain"
                  shape="circle"
                  icon={<HiChevronRight />}
                  onClick={() => changeMonth(1)}
                />
                <Button
                  variant="solid"
                  icon={<HiDownload />}
                  onClick={exportToExcel}
                >
                  Export
                </Button>
              </div>
            </div>
          </div>
        }
      >
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loading />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="mb-4 grid grid-cols-7 text-center font-medium text-gray-500 dark:text-gray-400">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="p-2">{day}</div>
              ))}
            </div>
            {renderCalendar()}
            <div className="mt-4 flex flex-wrap gap-4 items-center justify-center">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200 text-sm">
                  1
                </span>
                <span>Present</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 text-sm">
                  1
                </span>
                <span>Absent</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge content="P" innerClass="bg-blue-500 text-white" />
                <span>Project</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge content="N" innerClass="bg-purple-500 text-white" />
                <span>Normal</span>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default UserMonthlyAttendancePage;