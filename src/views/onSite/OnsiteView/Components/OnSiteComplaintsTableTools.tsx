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
  complaintStatus: string[];
  warrantyStatus: string | null;
};

const OnSiteComplaintsTableTools = ({
  onSearch,
  onFilter,
}: {
  onSearch: (query: string) => void;
  onFilter: (filters: { warrantyStatus?: string; complaintStatus?: string[] }) => void;
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
      warrantyStatus: values.warrantyStatus || undefined,
      complaintStatus: values.complaintStatus.length > 0 ? values.complaintStatus : undefined,
    });
    closeFilterDrawer();
  };

  return (
    <div className="flex flex-col lg:flex-row lg:items-center gap-2">
      <Input
        ref={searchInput}
        className="w-full md:w-96 md:mb-0 mb-4"
        size="sm"
        placeholder="Search complaints..."
        prefix={<HiOutlineSearch className="text-lg" />}
        onChange={handleSearch}
      />
      <Button
        size="sm"
        className="block lg:inline-block md:mb-0 mb-4"
        icon={<HiOutlineFilter />}
        onClick={openFilterDrawer}
      >
        Filter
      </Button>
      <Button
        block
        size="sm"
        icon={<HiDownload />}
        className="block lg:inline-block md:mb-0 mb-4"
      >
        Export
      </Button>
      <LinkButton
        to="/app/onsite/form"
        block
        variant="solid"
        size="sm"
        icon={<HiPlusCircle />}
        className="block lg:inline-block md:mb-0 mb-4"
      >
        Add Complaint
      </LinkButton>
      <Drawer
        title="Filter Complaints"
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
          initialValues={{ complaintStatus: [], warrantyStatus: null }}
          onSubmit={handleFilterSubmit}
        >
          {({ values, setFieldValue }) => (
            <Form id="filter-form">
              <FormContainer>
                <FormItem>
                  <h6 className="mb-4">Complaint Status</h6>
                  <Checkbox.Group
                    vertical
                    value={values.complaintStatus}
                    onChange={(options) => setFieldValue('complaintStatus', options)}
                  >
                    <Checkbox className="mb-3" value="Pending">
                      Pending
                    </Checkbox>
                    <Checkbox className="mb-3" value="Closed">
                      Closed
                    </Checkbox>
                    <Checkbox className="mb-3" value="Sent to Workshop">
                      Sent to Workshop
                    </Checkbox>
                  </Checkbox.Group>
                </FormItem>
                <FormItem>
                  <h6 className="mb-4">Warranty Status</h6>
                  <Checkbox
                    checked={values.warrantyStatus === 'Warranty'}
                    onChange={(checked) =>
                      setFieldValue('warrantyStatus', checked ? 'Warranty' : null)
                    }
                  >
                    Warranty
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

export default OnSiteComplaintsTableTools;