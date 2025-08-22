import { useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import { HiOutlineEye, HiRefresh } from 'react-icons/hi';
import DataTable from '@/components/shared/DataTable';
import Badge from '@/components/ui/Badge';
import { useNavigate } from 'react-router-dom';
import type { ColumnDef, DataTableResetHandle } from '@/components/shared/DataTable';
import Button from '@/components/ui/Button';
import Drawer from '@/components/ui/Drawer';
import { BASE_URL } from '@/constants/app.constant';

interface OnSiteComplaint {
  _id: string;
  customerName: string;
  customerAddress: string;
  complaintNumber: string;
  phoneNumbers: string[];
  make: string;
  dealerName?: string;
  warrantyStatus: 'Warranty' | 'Non-Warranty';
  reportedComplaint: string;
  complaintStatus: 'Pending' | 'Closed' | 'Sent to Workshop';
  paymentStatus: 'Pending' | 'Paid';
  createdAt: string;
  updatedAt: string;
  attendedPerson?: {
    _id: string;
    workerName: string;
    workerImage: string;
  };
}

const statusColorMap: Record<string, { dotClass: string }> = {
  Pending: { dotClass: 'bg-amber-500' },
  Closed: { dotClass: 'bg-emerald-500' },
  'Sent to Workshop': { dotClass: 'bg-blue-500' },
};

const warrantyColorMap: Record<string, { dotClass: string }> = {
  Warranty: { dotClass: 'bg-green-500' },
  'Non-Warranty': { dotClass: 'bg-red-500' },
};

const SentToWorkshopOnSiteComplaintsTable = ({
  searchTerm,
  warrantyFilter,
}: {
  searchTerm: string;
  warrantyFilter: boolean;
}) => {
  const tableRef = useRef<DataTableResetHandle>(null);
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState<OnSiteComplaint[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [pageIndex, setPageIndex] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [total, setTotal] = useState<number>(0);

  // Drawer state for status change
  const [isStatusDrawerOpen, setIsStatusDrawerOpen] = useState(false);
  const [selectedStatusComplaintId, setSelectedStatusComplaintId] = useState<string | null>(null);

  useEffect(() => {
    setPageIndex(1);
  }, [searchTerm, warrantyFilter]);

  useEffect(() => {
    const fetchComplaints = async () => {
      setLoading(true);
      try {
        const params: any = {
          page: pageIndex,
          limit: pageSize,
          searchTerm: searchTerm || '',
          complaintStatus: 'Sent to Workshop', // Only fetch "Sent to Workshop" complaints
        };
        if (warrantyFilter) params.warrantyStatus = "true"; // Convert boolean to string
        else params.warrantyStatus = "false"; // Convert boolean to string

        const response = await axios.get(`${BASE_URL}/onsite`, { params });
        setComplaints(response.data.data.data);
        setTotal(response.data.data.countOfDocuments);
      } catch (error) {
        console.error('Error fetching complaints:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();
  }, [pageIndex, pageSize, searchTerm, warrantyFilter]);

  // Open status change drawer
  const openStatusDrawer = (complaintId: string) => {
    setSelectedStatusComplaintId(complaintId);
    setIsStatusDrawerOpen(true);
  };

  // Close status change drawer
  const closeStatusDrawer = () => {
    setIsStatusDrawerOpen(false);
    setSelectedStatusComplaintId(null);
  };

  // Handle status change
  const handleChangeStatus = async (status: 'Pending' | 'Closed' | 'Sent to Workshop') => {
    if (!selectedStatusComplaintId) return;

    try {
      // Update complaint status
      await axios.put(
        `${BASE_URL}/onsite/${selectedStatusComplaintId}/status`,
        { complaintStatus: status }
      );

      // Refresh complaints
      const params: any = {
        page: pageIndex,
        limit: pageSize,
        searchTerm: searchTerm || '',
        complaintStatus: 'Sent to Workshop',
      };
      if (warrantyFilter) params.warrantyStatus = "true";
      else params.warrantyStatus = "false";

      const response = await axios.get(`${BASE_URL}/onsite`, { params });
      setComplaints(response.data.data.data);

      // Close the drawer
      closeStatusDrawer();
    } catch (error) {
      console.error('Error changing status:', error);
    }
  };

  const columns: ColumnDef<OnSiteComplaint>[] = useMemo(
    () => [
      {
        header: 'Customer Name',
        accessorKey: 'customerName',
        cell: (props) => (
          <span className="capitalize">{props.row.original.customerName}</span>
        ),
      },
      {
        header: 'Address',
        accessorKey: 'customerAddress',
      },
      {
        header: 'Complaint No.',
        accessorKey: 'complaintNumber',
      },
      {
        header: 'Make',
        accessorKey: 'make',
      },
      {
        header: 'Warranty',
        accessorKey: 'warrantyStatus',
        cell: (props) => {
          const status = props.row.original.warrantyStatus;
          return (
            <div className="flex items-center gap-2">
              <Badge className={warrantyColorMap[status]?.dotClass || 'bg-gray-500'} />
              <span className="capitalize font-semibold">{status}</span>
            </div>
          );
        },
      },
      {
        header: 'Worker',
        accessorKey: 'attendedPerson',
        cell: (props) => {
          const worker = props.row.original.attendedPerson;
          return worker ? (
            <div className="flex justify-center">
              <img
                src={worker.workerImage}
                alt={worker.workerName}
                className="w-10 h-10 rounded-full object-cover"
              />
            </div>
          ) : null;
        },
      },
    
      {
        header: 'Actions',
        id: 'actions',
        cell: (props) => (
          <div className="flex justify-end text-lg gap-2">
            <span
              className="cursor-pointer p-2 hover:text-green-500"
              onClick={() => navigate(`/app/onsite/${props.row.original._id}`)}
            >
              <HiOutlineEye />
            </span>
            <Button
              size="xs"
              icon={<HiRefresh />}
              onClick={() => openStatusDrawer(props.row.original._id)}
            >
              Change Status
            </Button>
          </div>
        ),
      },
    ],
    [navigate]
  );

  const onPaginationChange = (page: number) => setPageIndex(page);
  const onSelectChange = (size: number) => {
    setPageSize(size);
    setPageIndex(1);
  };

  return (
    <>
      <DataTable
        ref={tableRef}
        columns={columns}
        data={complaints}
        loading={loading}
        pagingData={{ total, pageIndex, pageSize }}
        onPaginationChange={onPaginationChange}
        onSelectChange={onSelectChange}
      />

      {/* Status Change Drawer */}
      <Drawer
        title="Change Status"
        isOpen={isStatusDrawerOpen}
        onClose={closeStatusDrawer}
        onRequestClose={closeStatusDrawer}
      >
        <div className="space-y-4">
          <Button
            block
            onClick={() => handleChangeStatus('Pending')}
          >
            Mark as Pending
          </Button>
          <Button
            block
            onClick={() => handleChangeStatus('Closed')}
          >
            Mark as Closed
          </Button>
        </div>
      </Drawer>
    </>
  );
};

export default SentToWorkshopOnSiteComplaintsTable;