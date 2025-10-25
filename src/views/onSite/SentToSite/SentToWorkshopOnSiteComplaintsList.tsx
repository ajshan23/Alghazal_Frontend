import AdaptableCard from '@/components/shared/AdaptableCard';
import SentToWorkshopOnSiteComplaintsTable from './SentToWorkshopOnSiteComplaintsTable';
import { useState } from 'react';
import PendingOnSiteComplaintsTableTools from '../PendingList/PendingOnSiteComplaintsTableTools';

const SentToWorkshopOnSiteComplaintsList = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [warrantyFilter, setWarrantyFilter] = useState<boolean>(false);

  return (
    <AdaptableCard className="h-full" bodyClass="h-full">
      <div className="lg:flex items-center justify-between mb-4">
        <h3 className="mb-4 lg:mb-0">Sent to Workshop On-Site Complaints</h3>
        <PendingOnSiteComplaintsTableTools 
          onSearch={setSearchTerm} 
          onFilter={setWarrantyFilter} 
        />
      </div>
      <SentToWorkshopOnSiteComplaintsTable 
        searchTerm={searchTerm} 
        warrantyFilter={warrantyFilter} 
      />
    </AdaptableCard>
  );
};

export default SentToWorkshopOnSiteComplaintsList;