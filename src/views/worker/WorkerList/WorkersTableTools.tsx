import { useState, useRef } from 'react';
import { HiOutlineSearch, HiPlusCircle } from 'react-icons/hi';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import LinkButton from '@/components/ui/LinkButton/LinkButton';
import debounce from 'lodash/debounce';

const WorkersTableTools = ({
  onSearch,
}: {
  onSearch: (query: string) => void;
}) => {
  const searchInput = useRef<HTMLInputElement>(null);

  const debounceFn = debounce((val: string) => {
    onSearch(val);
  }, 500);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    debounceFn(e.target.value);
  };

  return (
    <div className="flex flex-col lg:flex-row lg:items-center gap-2">
      {/* Search Input - Wider */}
      <Input
        ref={searchInput}
        className="w-full md:w-96 md:mb-0 mb-4"
        size="sm"
        placeholder="Search workers..."
        prefix={<HiOutlineSearch className="text-lg" />}
        onChange={handleSearch}
      />

      {/* Add Worker Button */}
      <LinkButton
        to="/app/worker/form"
        block
        variant="solid"
        size="sm"
        icon={<HiPlusCircle />}
        className="block lg:inline-block md:mb-0 mb-4"
      >
        Add Worker
      </LinkButton>
    </div>
  );
};

export default WorkersTableTools;