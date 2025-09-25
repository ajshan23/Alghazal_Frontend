import AdaptableCard from '@/components/shared/AdaptableCard';

import PendingOnSiteComplaintsTableTools from './PendingOnSiteComplaintsTableTools';
import { useState } from 'react';
import PendingOnSiteComplaintsTable from './OnSiteComplaintsTable';

const PendingOnSiteComplaintsList = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [warrantyFilter, setWarrantyFilter] = useState<boolean>(false);

  return (
    <AdaptableCard className="h-full" bodyClass="h-full">
      <div className="lg:flex items-center justify-between mb-4">
        <h3 className="mb-4 lg:mb-0">Pending On-Site Complaints</h3>
        <PendingOnSiteComplaintsTableTools 
          onSearch={setSearchTerm} 
          onFilter={setWarrantyFilter} 
        />
      </div>
      <PendingOnSiteComplaintsTable 
        searchTerm={searchTerm} 
        warrantyFilter={warrantyFilter} 
      />
    </AdaptableCard>
  );
};

export default PendingOnSiteComplaintsList;