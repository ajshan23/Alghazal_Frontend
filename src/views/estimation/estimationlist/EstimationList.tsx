import AdaptableCard from '@/components/shared/AdaptableCard';

import { useState } from 'react';
import EstimationTable from './EstimationTable';
import EstimationTableTools from './Components/EstimationTableTools';

const EstimationList = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filters, setFilters] = useState<{
    status?: string[];
  }>({});

  return (
    <AdaptableCard className="h-full" bodyClass="h-full">
      <div className="lg:flex items-center justify-between mb-4">
        <h3 className="mb-4 lg:mb-0">Estimations</h3>
        <EstimationTableTools 
          onSearch={setSearchTerm} 
          onFilter={setFilters} 
        />
      </div>
      <EstimationTable 
        searchTerm={searchTerm} 
        filters={filters} 
      />
    </AdaptableCard>
  );
};

export default EstimationList;