import { useState, useRef } from 'react';
import { HiOutlineSearch, HiOutlineFilter, HiDownload, HiPlusCircle } from 'react-icons/hi';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Drawer from '@/components/ui/Drawer';
import { Formik, Form, Field } from 'formik';
import { FormItem, FormContainer } from '@/components/ui/Form';
import Checkbox from '@/components/ui/Checkbox';
import debounce from 'lodash/debounce';
import LinkButton from '@/components/ui/LinkButton/LinkButton';

type FilterFormModel = {
  status: string[];
  warranty: boolean | null;
};

const JobCardTableTools = ({
  onSearch,
  onFilter,
}: {
  onSearch: (query: string) => void;
  onFilter: (filters: { status?: string[]; warranty?: boolean }) => void;
}) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const searchInput = useRef<HTMLInputElement>(null);

  const debounceFn = debounce((val: string) => {
    onSearch(val);
  }, 500);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    debounceFn(e.target.value);
  };

  const openFilterDrawer = () => setIsFilterOpen(true);
  const closeFilterDrawer = () => setIsFilterOpen(false);

  const handleFilterSubmit = (values: FilterFormModel) => {
    onFilter({
      status: values.status.length > 0 ? values.status : undefined,
      warranty: values.warranty ?? undefined,
    });
    closeFilterDrawer();
  };

  return (
    <div className="flex flex-col lg:flex-row lg:items-center gap-2">
      {/* Search Input - Wider */}
      <Input
        ref={searchInput}
        className="w-full md:w-96 md:mb-0 mb-4" // Increased width from md:w-80 to md:w-96 (24rem)
        size="sm"
        placeholder="Search job cards..."
        prefix={<HiOutlineSearch className="text-lg" />}
        onChange={handleSearch}
      />

      {/* Filter Button */}
      <Button
        size="sm"
        className="block lg:inline-block md:mb-0 mb-4"
        icon={<HiOutlineFilter />}
        onClick={openFilterDrawer}
      >
        Filter
      </Button>

      {/* Export Button */}
      <Button
        block
        size="sm"
        icon={<HiDownload />}
        className="block lg:inline-block md:mb-0 mb-4"
      >
        Export
      </Button>

      {/* Add Job Card Button */}
      <LinkButton
    to="/app/jobcards/jobcard-new"
    block
    variant="solid"
    size="sm"
    icon={<HiPlusCircle />}
    className="block lg:inline-block md:mb-0 mb-4"
>
    Add Job Card
</LinkButton>

      {/* Filter Drawer */}
      <Drawer
        title="Filter Job Cards"
        isOpen={isFilterOpen}
        onClose={closeFilterDrawer}
        onRequestClose={closeFilterDrawer}
        footer={
          <div className="text-right w-full">
            <Button size="sm" className="mr-2" onClick={closeFilterDrawer}>
              Cancel
            </Button>
            <Button size="sm" variant="solid" type="submit" form="filter-form">
              Query
            </Button>
          </div>
        }
      >
        <Formik
          initialValues={{ status: [], warranty: null }}
          onSubmit={handleFilterSubmit}
        >
          {({ values, setFieldValue }) => (
            <Form id="filter-form">
              <FormContainer>
                <FormItem>
                  <h6 className="mb-4">Job Card Status</h6>
                  <Checkbox.Group
                    vertical
                    value={values.status}
                    onChange={(options) => setFieldValue('status', options)}
                  >
                    <Checkbox className="mb-3" value="Pending">
                      Pending
                    </Checkbox>
                    <Checkbox className="mb-3" value="Completed">
                      Completed
                    </Checkbox>
                    <Checkbox className="mb-3" value="Returned">
                      Returned
                    </Checkbox>
                    <Checkbox className="mb-3" value="Billed">
                      Billed
                    </Checkbox>
                  </Checkbox.Group>
                </FormItem>
                <FormItem>
                  <h6 className="mb-4">Warranty Status</h6>
                  <Checkbox
                    checked={values.warranty === true}
                    onChange={(checked) => setFieldValue('warranty', checked ? true : null)}
                  >
                    Under Warranty
                  </Checkbox>
                </FormItem>
              </FormContainer>
            </Form>
          )}
        </Formik>
      </Drawer>
    </div>
  );
};

export default JobCardTableTools;