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
};

const EstimationTableTools = ({
  onSearch,
  onFilter,
}: {
  onSearch: (query: string) => void;
  onFilter: (filters: { status?: string[] }) => void;
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
    });
    closeFilterDrawer();
  };

  return (
    <div className="flex flex-col lg:flex-row lg:items-center gap-2">
      {/* Search Input */}
      <Input
        ref={searchInput}
        className="w-full md:w-96 md:mb-0 mb-4"
        size="sm"
        placeholder="Search estimations..."
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

      {/* Add Estimation Button */}
      <LinkButton
        to="/app/create-estimation"
        block
        variant="solid"
        size="sm"
        icon={<HiPlusCircle />}
        className="block lg:inline-block md:mb-0 mb-4"
      >
        Add Estimation
      </LinkButton>

      {/* Filter Drawer */}
      <Drawer
        title="Filter Estimations"
        isOpen={isFilterOpen}
        onClose={closeFilterDrawer}
        onRequestClose={closeFilterDrawer}
        footer={
          <div className="text-right w-full">
            <Button size="sm" className="mr-2" onClick={closeFilterDrawer}>
              Cancel
            </Button>
            <Button size="sm" variant="solid" type="submit" form="filter-form">
              Apply
            </Button>
          </div>
        }
      >
        <Formik
          initialValues={{ status: [] }}
          onSubmit={handleFilterSubmit}
        >
          {({ values, setFieldValue }) => (
            <Form id="filter-form">
              <FormContainer>
                <FormItem>
                  <h6 className="mb-4">Estimation Status</h6>
                  <Checkbox.Group
                    vertical
                    value={values.status}
                    onChange={(options) => setFieldValue('status', options)}
                  >
                    <Checkbox className="mb-3" value="Draft">
                      Draft
                    </Checkbox>
                    <Checkbox className="mb-3" value="Sent">
                      Sent
                    </Checkbox>
                    <Checkbox className="mb-3" value="Approved">
                      Approved
                    </Checkbox>
                    <Checkbox className="mb-3" value="Rejected">
                      Rejected
                    </Checkbox>
                    <Checkbox className="mb-3" value="Converted">
                      Converted to Job
                    </Checkbox>
                  </Checkbox.Group>
                </FormItem>
              </FormContainer>
            </Form>
          )}
        </Formik>
      </Drawer>
    </div>
  );
};

export default EstimationTableTools;