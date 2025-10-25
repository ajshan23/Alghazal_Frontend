import { useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import { HiOutlineEye, HiUserAdd, HiRefresh } from 'react-icons/hi';
import DataTable from '@/components/shared/DataTable';
import Badge from '@/components/ui/Badge';
import { useNavigate } from 'react-router-dom';
import type { ColumnDef, DataTableResetHandle } from '@/components/shared/DataTable';
import Button from '@/components/ui/Button';
import Drawer from '@/components/ui/Drawer';
import toast from '@/components/ui/toast';
import Notification from '@/components/ui/Notification';
import { BASE_URL } from '@/constants/app.constant';

// Define warrantyColorMap
const warrantyColorMap: Record<string, { dotClass: string }> = {
  Warranty: { dotClass: 'bg-green-500' }, // Green for Warranty
  'Non-Warranty': { dotClass: 'bg-red-500' }, // Red for Non-Warranty
};

// Define statusColorMap
const statusColorMap: Record<string, { dotClass: string }> = {
  Pending: { dotClass: 'bg-amber-500' },
  Closed: { dotClass: 'bg-emerald-500' },
  'Sent to Workshop': { dotClass: 'bg-blue-500' },
};

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

interface Worker {
  _id: string;
  workerName: string;
  workerImage: string;
  phoneNumber: string;
  status: boolean;
}

const PendingOnSiteComplaintsTable = ({
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

  // Drawer state for worker assignment
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedComplaintId, setSelectedComplaintId] = useState<string | null>(null);
  const [availableWorkers, setAvailableWorkers] = useState<Worker[]>([]);

  // Drawer state for change status
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
          complaintStatus: 'Pending', // Only fetch pending complaints
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

  const openDrawer = async (complaintId: string) => {
    setSelectedComplaintId(complaintId);
    setIsDrawerOpen(true);

    // Fetch available workers
    try {
      const response = await axios.get(`${BASE_URL}/worker/available`);
      setAvailableWorkers(response.data.data);
    } catch (error) {
      console.error('Error fetching available workers:', error);
    }
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedComplaintId(null);
  };

  const handleAssignWorker = async (workerId: string) => {
    if (!selectedComplaintId) return;

    try {
      // Assign worker to the complaint
      await axios.put(`${BASE_URL}/onsite/${selectedComplaintId}/assign-worker`, {
        workerId,
      });

      // Refresh complaints
      const params: any = {
        page: pageIndex,
        limit: pageSize,
        searchTerm: searchTerm || '',
        complaintStatus: 'Pending',
      };
      if (warrantyFilter) params.warrantyStatus = "true";
      else params.warrantyStatus = "false";

      const response = await axios.get(`${BASE_URL}/onsite`, { params });
      setComplaints(response.data.data.data);

      // Close the drawer
      closeDrawer();
    } catch (error) {
      console.error('Error assigning worker:', error);
    }
  };

  const openStatusDrawer = (complaintId: string) => {
    setSelectedStatusComplaintId(complaintId);
    setIsStatusDrawerOpen(true);
  };

  const closeStatusDrawer = () => {
    setIsStatusDrawerOpen(false);
    setSelectedStatusComplaintId(null);
  };

  const handleChangeStatus = async (status: 'Pending' | 'Closed' | 'Sent to Workshop') => {
    if (!selectedStatusComplaintId) return;

    try {
      // Update complaint status
      await axios.put(
        `${BASE_URL}/onsite/${selectedStatusComplaintId}/status`,
        { complaintStatus: status } // Send complaintStatus in the request body
      );

      // Refresh complaints
      const params: any = {
        page: pageIndex,
        limit: pageSize,
        searchTerm: searchTerm || '',
        complaintStatus: 'Pending',
      };
      if (warrantyFilter) params.warrantyStatus = "true";
      else params.warrantyStatus = "false";

      const response = await axios.get(`${BASE_URL}/onsite`, { params });
      setComplaints(response.data.data.data);

      // Show success toast
      toast.push(
        <Notification title="Success" type="success">
          Status changed successfully.
        </Notification>
      );

      // Close the drawer
      closeStatusDrawer();
    } catch (error) {
      console.error('Error changing status:', error);
      // Show error toast
      toast.push(
        <Notification title="Error" type="danger">
          Failed to change status.
        </Notification>
      );
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
                className="w-10 h-10 rounded-full object-cover cursor-pointer"
                onClick={() => openDrawer(props.row.original._id)}
              />
            </div>
          ) : (
            <div className="flex justify-center">
              <Button
                size="xs"
                icon={<HiUserAdd />}
                onClick={() => openDrawer(props.row.original._id)}
              >
                Assign
              </Button>
            </div>
          );
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
              Change
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

      {/* Worker Assignment Drawer */}
      <Drawer
        title="Assign Worker"
        isOpen={isDrawerOpen}
        onClose={closeDrawer}
        onRequestClose={closeDrawer}
      >
        <div className="space-y-4">
          {availableWorkers.map((worker) => (
            <div
              key={worker._id}
              className="flex items-center justify-between p-2 hover:bg-gray-100 rounded"
            >
              <div className="flex items-center gap-4">
                <img
                  src={worker.workerImage}
                  alt={worker.workerName}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold">{worker.workerName}</p>
                  <p className="text-sm text-gray-500">{worker.phoneNumber}</p>
                </div>
              </div>
              <Button
                size="xs"
                onClick={() => handleAssignWorker(worker._id)}
              >
                Assign
              </Button>
            </div>
          ))}
        </div>
      </Drawer>

      {/* Change Status Drawer */}
      <Drawer
        title="Change Status"
        isOpen={isStatusDrawerOpen}
        onClose={closeStatusDrawer}
        onRequestClose={closeStatusDrawer}
      >
        <div className="space-y-4">
          {/* <Button
            block
            onClick={() => handleChangeStatus('Pending')}
          >
            Mark as Pending
          </Button> */}
          <Button
            block
            onClick={() => handleChangeStatus('Closed')}
          >
            Close Complaint
          </Button>
          <Button
            block
            onClick={() => handleChangeStatus('Sent to Workshop')}
          >
            Send to Workshop
          </Button>
        </div>
      </Drawer>
    </>
  );
};

export default PendingOnSiteComplaintsTable;