import AdaptableCard from '@/components/shared/AdaptableCard';
import WorkersTable from './WorkersTable';
import WorkersTableTools from './WorkersTableTools';
import { useState } from 'react';

const WorkersList = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');

  return (
    <AdaptableCard className="h-full" bodyClass="h-full">
      <div className="lg:flex items-center justify-between mb-4">
        <h3 className="mb-4 lg:mb-0">Workers</h3>
        <WorkersTableTools onSearch={setSearchTerm} />
      </div>
      <WorkersTable searchTerm={searchTerm} />
    </AdaptableCard>
  );
};

export default WorkersList;