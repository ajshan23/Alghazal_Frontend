import AdaptableCard from '@/components/shared/AdaptableCard';
import PendingTable from './PendingTable';
import PendingTableTools from './Components/PendingTableTools';
import { useState } from 'react';

const PendingList = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filters, setFilters] = useState<{
    warranty?: boolean;
  }>({});

  return (
    <AdaptableCard className="h-full" bodyClass="h-full">
      <div className="lg:flex items-center justify-between mb-4">
        <h3 className="mb-4 lg:mb-0">Pending Job Cards</h3>
        <PendingTableTools onSearch={setSearchTerm} onFilter={setFilters} />
      </div>
      <PendingTable searchTerm={searchTerm} filters={filters} />
    </AdaptableCard>
  );
};

export default PendingList;