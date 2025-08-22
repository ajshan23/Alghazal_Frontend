// src/views/attendance/components/StatsOverview.tsx
import { Card, Progress } from '@/components/ui';
import { NumericFormat } from 'react-number-format';

interface StatsOverviewProps {
  data: {
    totalEmployees: number;
    totalPresent: number;
    totalAbsent: number;
    overallAttendance: number;
  };
}

const StatsOverview = ({ data }: StatsOverviewProps) => {
  const stats = [
    {
      title: 'Total Employees',
      value: data.totalEmployees,
      change: 0,
      isCurrency: false
    },
    {
      title: 'Present Days',
      value: data.totalPresent,
      change: 0,
      isCurrency: false
    },
    {
      title: 'Absent Days',
      value: data.totalAbsent,
      change: 0,
      isCurrency: false
    },
    {
      title: 'Overall Attendance',
      value: data.overallAttendance,
      change: 0,
      isPercentage: true,
      progress: data.overallAttendance
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <Card key={index} className="p-4">
          <h4 className="font-semibold text-gray-500 text-sm mb-2">
            {stat.title}
          </h4>
          <div className="flex items-end justify-between">
            <div>
              <h3 className="font-bold text-2xl">
                <NumericFormat
                  displayType="text"
                  value={stat.value}
                  thousandSeparator
                  suffix={stat.isPercentage ? '%' : ''}
                />
              </h3>
            </div>
          </div>
          {stat.progress && (
            <Progress
              className="mt-2"
              percent={stat.progress}
              color="blue-500"
            />
          )}
        </Card>
      ))}
    </div>
  );
};

export default StatsOverview;