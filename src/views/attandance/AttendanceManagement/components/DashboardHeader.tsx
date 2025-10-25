// src/views/attendance/components/DashboardHeader.tsx
import { Button, Select } from '@/components/ui';
import { HiRefresh } from 'react-icons/hi';

interface DashboardHeaderProps {
  period: 'weekly' | 'monthly' | 'yearly';
  year: number;
  onPeriodChange: (period: 'weekly' | 'monthly' | 'yearly') => void;
  onYearChange: (year: number) => void;
  onRefresh: () => void;
}

const periodOptions = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' }
];

const DashboardHeader = ({
  period,
  year,
  onPeriodChange,
  onYearChange,
  onRefresh
}: DashboardHeaderProps) => {
  // Generate year options (current year and 4 previous years)
  const yearOptions = Array.from({ length: 5 }, (_, i) => {
    const y = new Date().getFullYear() - i;
    return { value: y, label: y.toString() };
  });

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h3 className="text-2xl font-bold">Attendance Dashboard</h3>
        <p className="text-gray-500">Monitor and analyze attendance patterns</p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <Select
          size="sm"
          className="min-w-[120px]"
          options={periodOptions}
          value={periodOptions.find(opt => opt.value === period)}
          onChange={(opt) => onPeriodChange(opt.value)}
        />
        <Select
          size="sm"
          className="min-w-[100px]"
          options={yearOptions}
          value={yearOptions.find(opt => opt.value === year)}
          onChange={(opt) => onYearChange(opt.value)}
        />
        <Button
          variant="solid"
          size="sm"
          icon={<HiRefresh />}
          onClick={onRefresh}
        >
          Refresh
        </Button>
      </div>
    </div>
  );
};

export default DashboardHeader;