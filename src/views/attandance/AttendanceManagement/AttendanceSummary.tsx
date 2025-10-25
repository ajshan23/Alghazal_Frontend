import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Card, 
  Table, 
  Avatar, 
  Badge, 
  Button,
  toast 
} from '@/components/ui';
import { HiRefresh } from 'react-icons/hi';
import { apiGetAttendanceSummary } from '../api/api';
import dayjs from 'dayjs';
import { Loading } from '@/components/shared';

interface Worker {
  _id: string;
  name: string;
  profileImage?: string;
}

interface AttendanceData {
  present: boolean;
  workingHours: number;
  overtimeHours: number;
}

interface TotalData {
  presentDays: number;
  totalWorkingHours: number;
  totalOvertimeHours: number;
}

interface SummaryItem {
  date: string;
  [workerId: string]: string | AttendanceData;
}

interface AttendanceSummaryData {
  dates: string[];
  summary: SummaryItem[];
  totals: Record<string, TotalData | string>;
  users: Worker[];
}

const AttendanceSummary = () => {
  const { projectId } = useParams();
  const [loading, setLoading] = useState(true);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [summary, setSummary] = useState<SummaryItem[]>([]);
  const [totals, setTotals] = useState<Record<string, TotalData>>({});

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await apiGetAttendanceSummary(projectId as string);
      
      if (response.data && response.data.data) {
        const { users = [], summary = [], totals = {} } = response.data.data;
        setWorkers(users);
        setSummary(summary);
        
        // Filter out the 'date' property from totals and ensure proper typing
        const filteredTotals: Record<string, TotalData> = {};
        Object.entries(totals).forEach(([key, value]) => {
          if (key !== 'date' && typeof value === 'object' && value !== null) {
            filteredTotals[key] = value as TotalData;
          }
        });
        setTotals(filteredTotals);
      }
    } catch (error: any) {
      toast.show({
        type: 'danger',
        title: 'Error fetching attendance summary',
        message: error.message || 'Failed to load attendance data'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchData();
    }
  }, [projectId]);

  const getStatusBadge = (data: AttendanceData | null) => {
    if (!data) return null;
    return (
      <div className="flex flex-col items-center gap-1">
        <Badge
          content={data.present ? 'P' : 'A'}
          innerClass={`${data.present ? 'bg-emerald-500' : 'bg-red-500'} text-white`}
        />
        {data.present && (
          <div className="text-xs text-gray-600 dark:text-gray-400">
            <div>{data.workingHours}h</div>
            {data.overtimeHours > 0 && (
              <div className="text-orange-500">+{data.overtimeHours}h</div>
            )}
          </div>
        )}
      </div>
    );
  };

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
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h4 className="text-lg font-bold">Attendance Summary</h4>
            <div className="flex items-center gap-2">
              <Button
                variant="plain"
                icon={<HiRefresh />}
                onClick={fetchData}
              >
                Refresh
              </Button>
            </div>
          </div>
        }
      >
        <div className="overflow-x-auto">
          <Table>
            <thead>
              <tr>
                <th>Date</th>
                {workers.map(worker => (
                  <th key={worker._id} className="text-center min-w-[120px]">
                    <div className="flex flex-col items-center">
                      <Avatar 
                        size="sm" 
                        src={worker.profileImage} 
                        className="mb-1"
                      />
                      <span className="text-xs whitespace-nowrap">
                        {worker.name}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {summary.map((row, index) => (
                <tr key={index}>
                  <td className="font-medium">{dayjs(row.date).format('DD MMM YYYY')}</td>
                  {workers.map(worker => (
                    <td 
                      key={`${row.date}-${worker._id}`} 
                      className="text-center"
                    >
                      {getStatusBadge(row[worker._id] as AttendanceData | null)}
                    </td>
                  ))}
                </tr>
              ))}
              {summary.length > 0 && (
                <>
                  <tr className="font-semibold bg-gray-50 dark:bg-gray-700">
                    <td>Total Present Days</td>
                    {workers.map(worker => (
                      <td key={`present-${worker._id}`} className="text-center">
                        <Badge
                          content={totals[worker._id]?.presentDays?.toString() || '0'}
                          innerClass="bg-blue-500 text-white"
                        />
                      </td>
                    ))}
                  </tr>
                  <tr className="font-semibold bg-gray-50 dark:bg-gray-700">
                    <td>Total Working Hours</td>
                    {workers.map(worker => (
                      <td key={`hours-${worker._id}`} className="text-center">
                        <Badge
                          content={`${totals[worker._id]?.totalWorkingHours || 0}h`}
                          innerClass="bg-green-500 text-white"
                        />
                      </td>
                    ))}
                  </tr>
                  <tr className="font-semibold bg-gray-50 dark:bg-gray-700">
                    <td>Total Overtime Hours</td>
                    {workers.map(worker => (
                      <td key={`overtime-${worker._id}`} className="text-center">
                        <Badge
                          content={`${totals[worker._id]?.totalOvertimeHours || 0}h`}
                          innerClass="bg-orange-500 text-white"
                        />
                      </td>
                    ))}
                  </tr>
                </>
              )}
            </tbody>
          </Table>
          {summary.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No attendance records found
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default AttendanceSummary;