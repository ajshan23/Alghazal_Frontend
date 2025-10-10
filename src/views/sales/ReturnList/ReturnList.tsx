import AdaptableCard from '@/components/shared/AdaptableCard';
import ReturnTable from './ReturnTable';
import ReturnTableTools from './Components/ReturnTableTools';
import { useState } from 'react';

const ReturnList = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filters, setFilters] = useState<{
    warranty?: boolean;
  }>({});

  return (
    <AdaptableCard className="h-full" bodyClass="h-full">
      <div className="lg:flex items-center justify-between mb-4">
        <h3 className="mb-4 lg:mb-0">Returned Job Cards</h3>
        <ReturnTableTools onSearch={setSearchTerm} onFilter={setFilters} />
      </div>
      <ReturnTable searchTerm={searchTerm} filters={filters} />
    </AdaptableCard>
  );
};

export default ReturnList;