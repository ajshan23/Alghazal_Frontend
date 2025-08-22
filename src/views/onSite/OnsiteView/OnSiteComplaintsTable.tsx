import { useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import { HiOutlineEye } from 'react-icons/hi';
import DataTable from '@/components/shared/DataTable';
import Badge from '@/components/ui/Badge';
import { useNavigate } from 'react-router-dom';
import type { ColumnDef, DataTableResetHandle } from '@/components/shared/DataTable';
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

const OnSiteComplaintsTable = ({
  searchTerm,
  filters,
}: {
  searchTerm: string;
  filters: { warrantyStatus?: string; complaintStatus?: string[] };
}) => {
  const tableRef = useRef<DataTableResetHandle>(null);
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState<OnSiteComplaint[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [pageIndex, setPageIndex] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [total, setTotal] = useState<number>(0);

  useEffect(() => {
    setPageIndex(1);
  }, [searchTerm, filters]);

  useEffect(() => {
    const fetchComplaints = async () => {
      setLoading(true);
      try {
        const params: any = {
          page: pageIndex,
          limit: pageSize,
          searchTerm: searchTerm || '',
        };
        if (filters.warrantyStatus) params.warrantyStatus = filters.warrantyStatus;
        if (filters.complaintStatus?.includes('Pending')) params.pending = true;
        if (filters.complaintStatus?.includes('Closed')) params.closed = true;
        if (filters.complaintStatus?.includes('Sent to Workshop')) params.sentToWorkshop = true;

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
  }, [pageIndex, pageSize, searchTerm, filters]);

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
        header: 'Status',
        accessorKey: 'complaintStatus',
        cell: (props) => {
          const status = props.row.original.complaintStatus;
          return (
            <div className="flex items-center gap-2">
              <Badge className={statusColorMap[status]?.dotClass || 'bg-gray-500'} />
              <span className="capitalize font-semibold">{status}</span>
            </div>
          );
        },
      },
      {
        header: 'Actions',
        id: 'actions',
        cell: (props) => (
          <div className="flex justify-end text-lg">
            <span
              className="cursor-pointer p-2 hover:text-green-500"
              onClick={() => navigate(`/app/onsite/${props.row.original._id}`)}
            >
              <HiOutlineEye />
            </span>
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
    <DataTable
      ref={tableRef}
      columns={columns}
      data={complaints}
      loading={loading}
      pagingData={{ total, pageIndex, pageSize }}
      onPaginationChange={onPaginationChange}
      onSelectChange={onSelectChange}
    />
  );
};

export default OnSiteComplaintsTable;