import AdaptableCard from '@/components/shared/AdaptableCard';
import BilledTable from './BilledTable';
import BilledTableTools from './BilledTableTools';
import { useState } from 'react';

const BilledList = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filters, setFilters] = useState<{
    warranty?: boolean;
  }>({});

  return (
    <AdaptableCard className="h-full" bodyClass="h-full">
      <div className="lg:flex items-center justify-between mb-4">
        <h3 className="mb-4 lg:mb-0">Billed Job Cards</h3>
        <BilledTableTools onSearch={setSearchTerm} onFilter={setFilters} />
      </div>
      <BilledTable searchTerm={searchTerm} filters={filters} />
    </AdaptableCard>
  );
};

export default BilledList;