import AdaptableCard from '@/components/shared/AdaptableCard';
import CompletedTable from './CompletedTable';
import CompletedTableTools from './CompletedTableTools';
import { useState } from 'react';

const CompletedList = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filters, setFilters] = useState<{
    warranty?: boolean;
  }>({});

  return (
    <AdaptableCard className="h-full" bodyClass="h-full">
      <div className="lg:flex items-center justify-between mb-4">
        <h3 className="mb-4 lg:mb-0">Completed Job Cards</h3>
        <CompletedTableTools onSearch={setSearchTerm} onFilter={setFilters} />
      </div>
      <CompletedTable searchTerm={searchTerm} filters={filters} />
    </AdaptableCard>
  );
};

export default CompletedList;