// src/views/attendance/components/AttendanceTrendChart.tsx
import { Card } from '@/components/ui';
import Chart from '@/components/shared/Chart';

interface AttendanceTrendChartProps {
  data: Array<{
    month: number;
    attendanceRate: number;
  }>;
  period: 'weekly' | 'monthly' | 'yearly';
}

const AttendanceTrendChart = ({ data, period }: AttendanceTrendChartProps) => {
  const chartData = {
    series: [
      {
        name: 'Attendance Rate',
        data: data.map(item => item.attendanceRate)
      }
    ],
    categories: data.map(item => {
      if (period === 'monthly') {
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                           'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return monthNames[item.month - 1] || `Month ${item.month}`;
      }
      return `Week ${item.month}`;
    })
  };

  return (
    <Card>
      <h4 className="font-bold mb-4">Attendance Trend ({period})</h4>
      <Chart
        series={chartData.series}
        xAxis={chartData.categories}
        height={400}
        customOptions={{
          colors: ['#3b82f6'],
          yaxis: {
            min: 0,
            max: 100,
            labels: {
              formatter: (value: number) => `${value}%`
            }
          },
          tooltip: {
            y: {
              formatter: (value: number) => `${value}%`
            }
          }
        }}
      />
    </Card>
  );
};

export default AttendanceTrendChart;