import AdaptableCard from '@/components/shared/AdaptableCard';
import OnSiteComplaintsTable from './OnSiteComplaintsTable';
import OnSiteComplaintsTableTools from './Components/OnSiteComplaintsTableTools';
import { useState } from 'react';

const OnSiteComplaintsList = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filters, setFilters] = useState<{
    warrantyStatus?: string;
    complaintStatus?: string[];
  }>({});

  return (
    <AdaptableCard className="h-full" bodyClass="h-full">
      <div className="lg:flex items-center justify-between mb-4">
        <h3 className="mb-4 lg:mb-0">On-Site Complaints</h3>
        <OnSiteComplaintsTableTools onSearch={setSearchTerm} onFilter={setFilters} />
      </div>
      <OnSiteComplaintsTable searchTerm={searchTerm} filters={filters} />
    </AdaptableCard>
  );
};

export default OnSiteComplaintsList;