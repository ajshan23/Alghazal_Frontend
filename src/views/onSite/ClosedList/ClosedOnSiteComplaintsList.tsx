import AdaptableCard from '@/components/shared/AdaptableCard';
import ClosedOnSiteComplaintsTable from './ClosedOnSiteComplaintsTable';
import { useState } from 'react';
import PendingOnSiteComplaintsTableTools from '../PendingList/PendingOnSiteComplaintsTableTools';

const ClosedOnSiteComplaintsList = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [warrantyFilter, setWarrantyFilter] = useState<boolean>(false);

  return (
    <AdaptableCard className="h-full" bodyClass="h-full">
      <div className="lg:flex items-center justify-between mb-4">
        <h3 className="mb-4 lg:mb-0">Closed On-Site Complaints</h3>
        <PendingOnSiteComplaintsTableTools 
          onSearch={setSearchTerm} 
          onFilter={setWarrantyFilter} 
        />
      </div>
      <ClosedOnSiteComplaintsTable 
        searchTerm={searchTerm} 
        warrantyFilter={warrantyFilter} 
      />
    </AdaptableCard>
  );
};

export default ClosedOnSiteComplaintsList;