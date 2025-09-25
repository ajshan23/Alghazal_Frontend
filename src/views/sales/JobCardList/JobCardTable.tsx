import { useEffect, useMemo, useRef,useState } from 'react';
import axios from 'axios';
import { HiOutlinePencil, HiOutlineEye } from 'react-icons/hi'; // Changed HiOutlineTrash to HiOutlineEye
import DataTable from '@/components/shared/DataTable';
import Badge from '@/components/ui/Badge';
import { useNavigate } from 'react-router-dom'; // Added for navigation
import type { ColumnDef, DataTableResetHandle } from '@/components/shared/DataTable';
import { BASE_URL } from '@/constants/app.constant';

interface JobCard {
  _id: string;
  customerName: string;
  phoneNumber: string;
  jobCardNumber: string;
  InDate: string;
  OutDate: string | null;
  jobCardStatus: string;
  warranty: boolean;
  images: { _id: string; image: string }[] | null;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

const statusColorMap: Record<string, { dotClass: string }> = {
  Completed: { dotClass: 'bg-emerald-500' },
  Pending: { dotClass: 'bg-amber-500' },
  Cancelled: { dotClass: 'bg-red-500' },
  Returned: { dotClass: 'bg-blue-500' },
  Billed: { dotClass: 'bg-purple-500' },
  Created: { dotClass: 'bg-gray-500' },
};

const JobCardTable = ({
  searchTerm,
  filters,
}: {
  searchTerm: string;
  filters: { status?: string[]; warranty?: boolean };
}) => {
  const tableRef = useRef<DataTableResetHandle>(null);
  const navigate = useNavigate(); // Added for navigation
  const [jobCards, setJobCards] = useState<JobCard[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [pageIndex, setPageIndex] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [total, setTotal] = useState<number>(0);

  useEffect(() => {
    setPageIndex(1);
  }, [searchTerm, filters]);

  useEffect(() => {
    const fetchJobCards = async () => {
      setLoading(true);
      try {
        const params: any = {
          page: pageIndex,
          limit: pageSize,
          searchTerm:searchTerm?searchTerm:"",
        };
        if (filters.warranty !== undefined) params.warranty = filters.warranty;
        if (filters.status?.includes('Returned')) params.returned = true;
        if (filters.status?.includes('Pending')) params.pending = true;
        if (filters.status?.includes('Completed')) params.completed = true;
        if (filters.status?.includes('Billed')) params.billed = true;

        const response = await axios.get(`${BASE_URL}/jobcards/`, { params });
        console.log(response);
        
        setJobCards(response.data?.data?.data);
        setTotal(response.data?.data?.countOfDocuments);
      } catch (error) {
        console.error('Error fetching job cards:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobCards();
  }, [pageIndex, pageSize, searchTerm, filters]);

  const columns: ColumnDef<JobCard>[] = useMemo(
    () => [
      {
        header: 'Customer Name',
        accessorKey: 'customerName',
        cell: (props) => (
          <span className="capitalize">{props.row.original.customerName}</span>
        ),
      },
      {
        header: 'Phone',
        accessorKey: 'phoneNumber',
      },
      {
        header: 'In-Date',
        accessorKey: 'InDate',
        cell: (props) => (
          <span>{new Date(props.row.original.InDate).toLocaleDateString()}</span>
        ),
      },
      {
        header: 'Out-Date',
        accessorKey: 'OutDate',
        cell: (props) => (
          <span>
            {props.row.original.OutDate
              ? new Date(props.row.original.OutDate).toLocaleDateString()
              : '-'}
          </span>
        ),
      },
      {
        header: 'Jobcard No.',
        accessorKey: 'jobCardNumber',
      },
      {
        header: 'Status',
        accessorKey: 'jobCardStatus',
        cell: (props) => {
          const status = props.row.original.jobCardStatus;
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
            {/* <span
              className="cursor-pointer p-2 hover:text-blue-500"
              onClick={() => navigate(`/app/jobcards/edit/${props.row.original._id}`)}
            >
              <HiOutlinePencil />
            </span> */}
            <span
              className="cursor-pointer p-2 hover:text-green-500" // Changed color to green for view
              onClick={() => navigate(`/app/jobcards/jobcard/${props.row.original._id}`)}
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
      data={jobCards}
      loading={loading}
      pagingData={{ total, pageIndex, pageSize }}
      onPaginationChange={onPaginationChange}
      onSelectChange={onSelectChange}
    />
  );
};

export default JobCardTable;