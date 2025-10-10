import { useState } from 'react';
import { HiOutlineSearch } from 'react-icons/hi';
import Input from '@/components/ui/Input';
import Checkbox from '@/components/ui/Checkbox';
import debounce from 'lodash/debounce';

const PendingOnSiteComplaintsTableTools = ({
  onSearch,
  onFilter,
}: {
  onSearch: (query: string) => void;
  onFilter: (warranty: boolean) => void;
}) => {
  const [warrantyChecked, setWarrantyChecked] = useState(false);

  const debounceFn = debounce((val: string) => {
    onSearch(val);
  }, 500);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    debounceFn(e.target.value);
  };

  const handleWarrantyChange = (checked: boolean) => {
    setWarrantyChecked(checked);
    onFilter(checked);
  };

  return (
    <div className="flex flex-col lg:flex-row lg:items-center gap-2">
      {/* Search Input */}
      <Input
        className="w-full md:w-96 md:mb-0 mb-4"
        size="sm"
        placeholder="Search pending complaints..."
        prefix={<HiOutlineSearch className="text-lg" />}
        onChange={handleSearch}
      />

      {/* Warranty Checkbox */}
      <div className="flex items-center">
        <Checkbox
          checked={warrantyChecked}
          onChange={handleWarrantyChange}
        >
          Warranty
        </Checkbox>
      </div>
    </div>
  );
};

export default PendingOnSiteComplaintsTableTools;