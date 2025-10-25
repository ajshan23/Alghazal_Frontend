import AdaptableCard from '@/components/shared/AdaptableCard';
import JobCardTable from './JobCardTable';
import JobCardTableTools from './Components/JobCardTableTools';
import { useState } from 'react';

const JobCardList = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filters, setFilters] = useState<{
    status?: string[];
    warranty?: boolean;
  }>({});

  return (
    <AdaptableCard className="h-full" bodyClass="h-full">
      <div className="lg:flex items-center justify-between mb-4">
        <h3 className="mb-4 lg:mb-0">Job Cards</h3>
        <JobCardTableTools onSearch={setSearchTerm} onFilter={setFilters} />
      </div>
      <JobCardTable searchTerm={searchTerm} filters={filters} />
    </AdaptableCard>
  );
};

export default JobCardList;