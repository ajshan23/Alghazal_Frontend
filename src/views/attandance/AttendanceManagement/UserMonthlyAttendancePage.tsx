import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Card, 
  Badge, 
  Button, 
  Notification,
  toast,
  Avatar,
  Tooltip
} from '@/components/ui';
import { 
  HiOutlineRefresh, 
  HiChevronLeft, 
  HiChevronRight, 
  HiDownload, 
  HiFilter,
  HiOutlineCalendar,
  HiOutlineUser,
  HiOutlineClock,
  HiOutlineCash,
  HiOutlineChartBar
} from 'react-icons/hi';
import { apiGetUserMonthlyAttendance, apiGetUsers } from '../api/api';
import { apiCreateOrUpdateAttendance, apiDeleteAttendanceRecord } from '../api/api';
import dayjs from 'dayjs';
import { Loading } from '@/components/shared';
import * as XLSX from 'xlsx';
import useThemeClass from '@/utils/hooks/useThemeClass';
import EditAttendanceModal from './components/EditAttendanceModal';

interface AttendanceRecord {
  _id: string;
  date: Date;
  present: boolean;
  isPaidLeave?: boolean;
  workingHours: number;
  overtimeHours: number;
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
  user?: any;
}

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  profileImage?: string;
}

const UserMonthlyAttendancePage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { textTheme } = useThemeClass();
  const [loading, setLoading] = useState(true);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [month, setMonth] = useState<number>(dayjs().month() + 1);
  const [year, setYear] = useState<number>(dayjs().year());
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>(userId || '');
  const [selectedUserName, setSelectedUserName] = useState<string>('');
  const [filterType, setFilterType] = useState<'all' | 'project' | 'normal'>('all');
  const [totals, setTotals] = useState<any>({});
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<User | null>(null);
  const [isNewRecord, setIsNewRecord] = useState(false);

  const canEditAttendance = true;

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
      const usersData = response.data?.data?.users || response.data?.users || [];
      setUsers(usersData);
      
      if (userId) {
        const user = usersData.find((u: User) => u._id === userId);
        if (user) {
          setSelectedUserName(`${user.firstName} ${user.lastName}`);
        }
      }
    } catch (error: any) {
      toast.push(
        <Notification title="Error fetching users" type="danger">
          {error?.response?.data?.message || error?.message || 'Failed to fetch users'}
        </Notification>
      );
    }
  };

  const fetchAttendance = async () => {
    if (!selectedUser) return;

    try {
      setLoading(true);
      const response = await apiGetUserMonthlyAttendance(selectedUser, month, year, filterType);
      
      let attendanceData: AttendanceRecord[] = [];
      let totalsData = {};

      if (response?.data) {
        const responseData = response.data?.data || response.data;
        
        if (responseData?.attendance && Array.isArray(responseData.attendance)) {
          attendanceData = responseData.attendance;
        } else if (Array.isArray(responseData)) {
          attendanceData = responseData;
        } else if (responseData?.normalAttendance && responseData?.projectAttendance) {
          attendanceData = [...(responseData.normalAttendance || []), ...(responseData.projectAttendance || [])];
        }

        if (responseData?.totals) {
          totalsData = responseData.totals;
        }
      }
      
      attendanceData.sort((a, b) => {
        const dateCompare = new Date(a.date).getTime() - new Date(b.date).getTime();
        if (dateCompare === 0) {
          return a.type.localeCompare(b.type);
        }
        return dateCompare;
      });
      
      setAttendance(attendanceData);
      setTotals(totalsData);
    } catch (error: any) {
      console.error('Fetch attendance error:', error);
      toast.push(
        <Notification title="Error fetching attendance" type="danger">
          {error?.response?.data?.message || error?.message || 'Failed to fetch attendance data'}
        </Notification>
      );
      setAttendance([]);
      setTotals({});
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

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterType(e.target.value as 'all' | 'project' | 'normal');
  };

  const handleDayClick = (date: string, records: AttendanceRecord[]) => {
    if (!canEditAttendance || !selectedUser) return;

    const clickedDate = new Date(date);
    const userForRecord = users.find(u => u._id === selectedUser);
    
    if (!userForRecord) {
      toast.push(
        <Notification title="Error" type="danger">
          User not found
        </Notification>
      );
      return;
    }

    setSelectedUserForEdit(userForRecord);

    if (records.length > 0) {
      setSelectedRecord(records[0]);
      setIsNewRecord(false);
    } else {
      setSelectedRecord({
        _id: `new-${Date.now()}`,
        date: clickedDate,
        present: true,
        workingHours: 8,
        overtimeHours: 0,
        markedBy: {
          _id: 'current-user',
          firstName: 'Current',
          lastName: 'User'
        },
        type: 'normal',
        user: selectedUser
      } as AttendanceRecord);
      setIsNewRecord(true);
    }
    setEditModalOpen(true);
  };

  const handleAttendanceUpdate = (updatedRecord: AttendanceRecord) => {
    setAttendance(prev => {
      const filtered = prev.filter(record => 
        record._id !== updatedRecord._id && 
        !(record._id.startsWith('new-') && updatedRecord._id.startsWith('new-'))
      );
      
      const newAttendance = [...filtered, updatedRecord].sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      
      return newAttendance;
    });
    
    setTimeout(() => {
      fetchAttendance();
    }, 1000);
  };

  const handleDeleteAttendance = (attendanceId: string) => {
    setAttendance(prev => prev.filter(record => record._id !== attendanceId));
    
    setTimeout(() => {
      fetchAttendance();
    }, 1000);
  };

  const exportToExcel = () => {
    if (!attendance || attendance.length === 0) {
      toast.push(
        <Notification title="No data to export" type="warning">
          There are no attendance records to export
        </Notification>
      );
      return;
    }

    const data = attendance.map(record => ({
      Date: dayjs(record.date).format('DD/MM/YYYY'),
      Status: record.isPaidLeave ? 'Day Off (Paid)' : record.present ? 'Present' : 'Absent',
      Type: record.type === 'project' ? 'Project' : 'Normal',
      Project: record.project?.projectName || 'N/A',
      'Working Hours': record.workingHours || 0,
      'Overtime Hours': record.overtimeHours || 0,
      'Marked By': record.markedBy ? `${record.markedBy.firstName} ${record.markedBy.lastName}` : 'System'
    }));

    const totalRow = {
      Date: 'TOTALS',
      Status: `${attendance.filter(r => r.present).length} Present Days`,
      Type: `${filterType.toUpperCase()} Attendance`,
      Project: '',
      'Working Hours': attendance.reduce((sum, r) => sum + (r.workingHours || 0), 0),
      'Overtime Hours': attendance.reduce((sum, r) => sum + (r.overtimeHours || 0), 0),
      'Marked By': ''
    };
    data.push(totalRow);

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Attendance");
    
    const fileName = `Attendance_${selectedUserName || 'User'}_${months[month - 1].label}_${year}_${filterType}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    fetchAttendance();
  }, [selectedUser, month, year, filterType]);

  const renderCalendar = () => {
    const safeAttendance = Array.isArray(attendance) ? attendance : [];
    
    const startOfMonth = dayjs().year(year).month(month - 1).startOf('month');
    const endOfMonth = dayjs().year(year).month(month - 1).endOf('month');
    const daysInMonth = endOfMonth.date();
    const startDay = startOfMonth.day();

    const attendanceMap = new Map<string, AttendanceRecord[]>();
    safeAttendance.forEach(record => {
      const dateStr = dayjs(record.date).format('YYYY-MM-DD');
      if (!attendanceMap.has(dateStr)) {
        attendanceMap.set(dateStr, []);
      }
      attendanceMap.get(dateStr)!.push(record);
    });

    const weeks = [];
    let days = [];
    
    for (let i = 0; i < startDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-32 p-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800" />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = dayjs().year(year).month(month - 1).date(day);
      const dateStr = currentDate.format('YYYY-MM-DD');
      const records = attendanceMap.get(dateStr) || [];
      const isToday = currentDate.isSame(dayjs(), 'day');
      const isWeekend = currentDate.day() === 0 || currentDate.day() === 6;

      const hasAnyPresent = records.some(r => r.present);
      const hasAnyAbsent = records.some(r => !r.present && !r.isPaidLeave);
      const hasAnyDayOff = records.some(r => r.isPaidLeave);

      days.push(
        <div 
          key={`day-${day}`} 
          className={`h-32 p-2 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 ${
            isToday ? 'bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 ring-2 ring-blue-500' : 
            isWeekend ? 'bg-gray-50 dark:bg-gray-800' : 'bg-white dark:bg-gray-800'
          } ${canEditAttendance ? 'cursor-pointer hover:ring-2 hover:ring-blue-300' : ''}`}
          onClick={() => handleDayClick(dateStr, records)}
        >
          <div className="flex justify-between items-start mb-1">
            <span className={`
              inline-flex items-center justify-center w-6 h-6 rounded-full text-sm font-medium
              ${records.length > 0 ? 
                (hasAnyDayOff ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                 hasAnyPresent && !hasAnyAbsent ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200' : 
                 hasAnyAbsent && !hasAnyPresent ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200') :
                'text-gray-800 dark:text-gray-200'
              }
            `}>
              {day}
            </span>
            {records.length > 1 && (
              <span className="text-xs bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-1.5 py-0.5 rounded-full shadow-sm">
                {records.length}
              </span>
            )}
          </div>
          
          <div className="space-y-1">
            {records.slice(0, 2).map((record, index) => (
              <div key={index} className="text-xs">
                <div className="flex items-center justify-between">
                  <Badge
                    content={record.type === 'project' ? 'P' : 'N'}
                    innerClass={`${record.type === 'project' ? 'bg-gradient-to-r from-blue-500 to-blue-600' : 'bg-gradient-to-r from-purple-500 to-purple-600'} text-white shadow-sm`}
                  />
                  {record.isPaidLeave ? (
                    <Badge
                      content="PL"
                      innerClass="bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-sm"
                    />
                  ) : (
                    <Badge
                      content={record.present ? 'P' : 'A'}
                      innerClass={`${record.present ? 'bg-gradient-to-r from-emerald-500 to-emerald-600' : 'bg-gradient-to-r from-red-500 to-red-600'} text-white shadow-sm`}
                    />
                  )}
                </div>
                
                {record.type === 'project' && record.project && !record.isPaidLeave && (
                  <div className="truncate text-gray-600 dark:text-gray-400 mt-1" 
                       title={record.project.projectName}>
                    {record.project.projectName}
                  </div>
                )}
                
                {record.isPaidLeave && (
                  <div className="text-blue-600 dark:text-blue-400 text-xs mt-1">
                    Paid Leave
                  </div>
                )}
                
                {record.workingHours > 0 && !record.isPaidLeave && (
                  <div className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <HiOutlineClock className="text-xs" />
                    {record.workingHours}h
                    {record.overtimeHours > 0 && (
                      <span className="text-orange-500"> +{record.overtimeHours}h</span>
                    )}
                  </div>
                )}
              </div>
            ))}
            
            {records.length > 2 && (
              <div className="text-xs text-gray-500 dark:text-gray-400">
                +{records.length - 2} more
              </div>
            )}
          </div>
        </div>
      );

      if (days.length === 7) {
        weeks.push(<div key={`week-${weeks.length}`} className="grid grid-cols-7 gap-2">{days}</div>);
        days = [];
      }
    }

    if (days.length > 0) {
      while (days.length < 7) {
        days.push(<div key={`empty-end-${days.length}`} className="h-32 p-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800" />);
      }
      weeks.push(<div key={`week-${weeks.length}`} className="grid grid-cols-7 gap-2">{days}</div>);
    }

    return weeks;
  };

  const renderTotals = () => {
    if (!totals || Object.keys(totals).length === 0) return null;

    if (totals.overall) {
      return (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg">
                <HiOutlineChartBar className="text-xl text-white" />
              </div>
              <h5 className="font-semibold text-blue-700 dark:text-blue-300">Overall Totals</h5>
            </div>
            <div className="mt-2 space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Present Days:</span>
                <span className="font-bold text-blue-700 dark:text-blue-300">{totals.overall.presentDays}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Working Hours:</span>
                <span className="font-bold text-blue-700 dark:text-blue-300">{totals.overall.totalWorkingHours}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Overtime Hours:</span>
                <span className="font-bold text-blue-700 dark:text-blue-300">{totals.overall.totalOvertimeHours}</span>
              </div>
            </div>
          </Card>
          
          {totals.project && (
            <Card className="p-4 bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 border border-purple-200 dark:border-purple-800">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-gradient-to-r from-purple-500 to-violet-600 rounded-lg">
                  <HiOutlineCalendar className="text-xl text-white" />
                </div>
                <h5 className="font-semibold text-purple-700 dark:text-purple-300">Project Totals</h5>
              </div>
              <div className="mt-2 space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Present Days:</span>
                  <span className="font-bold text-purple-700 dark:text-purple-300">{totals.project.presentDays}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Working Hours:</span>
                  <span className="font-bold text-purple-700 dark:text-purple-300">{totals.project.totalWorkingHours}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Overtime Hours:</span>
                  <span className="font-bold text-purple-700 dark:text-purple-300">{totals.project.totalOvertimeHours}</span>
                </div>
              </div>
            </Card>
          )}
          
          {totals.normal && (
            <Card className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg">
                  <HiOutlineClock className="text-xl text-white" />
                </div>
                <h5 className="font-semibold text-green-700 dark:text-green-300">Normal Totals</h5>
              </div>
              <div className="mt-2 space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Present Days:</span>
                  <span className="font-bold text-green-700 dark:text-green-300">{totals.normal.presentDays}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Working Hours:</span>
                  <span className="font-bold text-green-700 dark:text-green-300">{totals.normal.totalWorkingHours}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Overtime Hours:</span>
                  <span className="font-bold text-green-700 dark:text-green-300">{totals.normal.totalOvertimeHours}</span>
                </div>
              </div>
            </Card>
          )}
        </div>
      );
    } else {
      return (
        <div className="mt-6">
          <Card className="p-4 bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-800/50 dark:to-slate-800/50 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-gradient-to-r from-gray-500 to-slate-600 rounded-lg">
                <HiOutlineChartBar className="text-xl text-white" />
              </div>
              <h5 className="font-semibold text-gray-700 dark:text-gray-300">Monthly Totals</h5>
            </div>
            <div className="mt-2 grid grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="text-gray-600 dark:text-gray-400">Present Days</div>
                <div className="text-xl font-bold text-blue-600 dark:text-blue-400">{totals.presentDays || 0}</div>
              </div>
              <div className="text-center">
                <div className="text-gray-600 dark:text-gray-400">Working Hours</div>
                <div className="text-xl font-bold text-green-600 dark:text-green-400">{totals.totalWorkingHours || 0}</div>
              </div>
              <div className="text-center">
                <div className="text-gray-600 dark:text-gray-400">Overtime Hours</div>
                <div className="text-xl font-bold text-orange-600 dark:text-orange-400">{totals.totalOvertimeHours || 0}</div>
              </div>
            </div>
          </Card>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-850 dark:to-gray-900">
      <div className="container mx-auto p-6">
        <Card
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden"
          header={
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-750 p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg">
                    <HiOutlineCalendar className="text-2xl text-white" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-800 dark:text-white">Monthly Attendance Calendar</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Track and manage employee attendance</p>
                    {canEditAttendance && (
                      <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                        Click on any day to edit attendance
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
                  <div className="relative flex-1">
                    <select
                      className="w-full p-3 border-2 border-gray-200 rounded-xl dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
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
                  </div>
                  
                  <div className="relative">
                    <select
                      className="w-full p-3 border-2 border-gray-200 rounded-xl dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                      value={filterType}
                      onChange={handleFilterChange}
                    >
                      <option value="all">All Types</option>
                      <option value="project">Project Only</option>
                      <option value="normal">Normal Only</option>
                    </select>
                  </div>
                  
                  <div className="flex gap-2">
                    <select
                      className="p-3 border-2 border-gray-200 rounded-xl dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
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
                      className="p-3 border-2 border-gray-200 rounded-xl dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                      value={year}
                      onChange={(e) => setYear(Number(e.target.value))}
                    >
                      {years.map(y => (
                        <option key={y.value} value={y.value}>
                          {y.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="flex gap-2">
                    <Tooltip title="Refresh">
                      <Button
                        variant="solid"
                        shape="circle"
                        icon={<HiOutlineRefresh />}
                        onClick={fetchAttendance}
                        disabled={loading}
                        className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white p-3 shadow-lg hover:shadow-xl transition-all duration-200"
                      />
                    </Tooltip>
                    <Tooltip title="Previous Month">
                      <Button
                        variant="solid"
                        shape="circle"
                        icon={<HiChevronLeft />}
                        onClick={() => changeMonth(-1)}
                        className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white p-3 shadow-lg hover:shadow-xl transition-all duration-200"
                      />
                    </Tooltip>
                    <Tooltip title="Next Month">
                      <Button
                        variant="solid"
                        shape="circle"
                        icon={<HiChevronRight />}
                        onClick={() => changeMonth(1)}
                        className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white p-3 shadow-lg hover:shadow-xl transition-all duration-200"
                      />
                    </Tooltip>
                    <Button
                      variant="solid"
                      icon={<HiDownload />}
                      onClick={exportToExcel}
                      disabled={!attendance.length}
                      className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold px-4 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      Export
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          }
        >
          {loading ? (
            <div className="flex items-center justify-center h-96">
              <Loading />
            </div>
          ) : (
            <>
              <div className="mb-6 text-center">
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
                  {months[month - 1].label} {year}
                  {selectedUserName && (
                    <span className="text-blue-600 dark:text-blue-400 ml-2">- {selectedUserName}</span>
                  )}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Showing {filterType === 'all' ? 'all attendance types' : `${filterType} attendance only`}
                  {canEditAttendance && (
                    <span className="text-blue-600 dark:text-blue-400 ml-2">• Click on any day to edit</span>
                  )}
                </p>
              </div>

              <div className="mb-4 grid grid-cols-7 gap-2 text-center font-medium text-gray-500 dark:text-gray-400">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">{day}</div>
                ))}
              </div>

              <div className="space-y-2">
                {renderCalendar()}
              </div>

              <div className="mt-8 flex flex-wrap gap-6 items-center justify-center text-sm p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <div className="flex items-center gap-2">
                  <Badge content="P" innerClass="bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-sm" />
                  <span className="text-gray-700 dark:text-gray-300">Project</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge content="N" innerClass="bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-sm" />
                  <span className="text-gray-700 dark:text-gray-300">Normal</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge content="P" innerClass="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-sm" />
                  <span className="text-gray-700 dark:text-gray-300">Present</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge content="A" innerClass="bg-gradient-to-r from-red-500 to-red-600 text-white shadow-sm" />
                  <span className="text-gray-700 dark:text-gray-300">Absent</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge content="PL" innerClass="bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-sm" />
                  <span className="text-gray-700 dark:text-gray-300">Paid Leave</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 text-sm shadow-sm">
                    1
                  </span>
                  <span className="text-gray-700 dark:text-gray-300">Mixed Status</span>
                </div>
              </div>

              {renderTotals()}
            </>
          )}
        </Card>

        <EditAttendanceModal
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          onSave={handleAttendanceUpdate}
          onDelete={handleDeleteAttendance}
          record={selectedRecord}
          user={selectedUserForEdit}
          isNewRecord={isNewRecord}
        />
      </div>
    </div>
  );
};

export default UserMonthlyAttendancePage;