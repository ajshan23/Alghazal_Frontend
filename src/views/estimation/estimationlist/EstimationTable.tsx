import { useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import { HiOutlinePencil, HiOutlineEye } from 'react-icons/hi';
import DataTable from '@/components/shared/DataTable';
import Badge from '@/components/ui/Badge';
import { useNavigate } from 'react-router-dom';
import type { ColumnDef, DataTableResetHandle } from '@/components/shared/DataTable';
import { BASE_URL } from '@/constants/app.constant';

interface Estimation {
  _id: string;
  clientName: string;
  clientAddress: string;
  workDescription: string;
  dateOfEstimation: string;
  estimationNumber: string;
  estimatedAmount: number;
  quotationAmount?: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

const statusColorMap: Record<string, { dotClass: string }> = {
  Draft: { dotClass: 'bg-gray-500' },
  Sent: { dotClass: 'bg-blue-500' },
  Approved: { dotClass: 'bg-emerald-500' },
  Rejected: { dotClass: 'bg-red-500' },
  Converted: { dotClass: 'bg-purple-500' },
};

const EstimationTable = ({
  searchTerm,
  filters,
}: {
  searchTerm: string;
  filters: { status?: string[] };
}) => {
  const tableRef = useRef<DataTableResetHandle>(null);
  const navigate = useNavigate();
  const [estimations, setEstimations] = useState<Estimation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [pageIndex, setPageIndex] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [total, setTotal] = useState<number>(0);

  useEffect(() => {
    setPageIndex(1);
  }, [searchTerm, filters]);

  useEffect(() => {
    const fetchEstimations = async () => {
      setLoading(true);
      try {
        const params: any = {
          page: pageIndex,
          limit: pageSize,
          search: searchTerm || undefined,
        };

        if (filters.status?.length) {
          params.status = filters.status.join(',');
        }

        const response = await axios.get(`${BASE_URL}/estimation`, { params });
        
        setEstimations(response.data?.data?.estimations || []);
        setTotal(response.data?.data?.pagination?.total || 0);
      } catch (error) {
        console.error('Error fetching estimations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEstimations();
  }, [pageIndex, pageSize, searchTerm, filters]);

  const columns: ColumnDef<Estimation>[] = useMemo(
    () => [
      {
        header: 'Estimation No.',
        accessorKey: 'estimationNumber',
      },
      {
        header: 'Client Name',
        accessorKey: 'clientName',
        cell: (props) => (
          <span className="capitalize">{props.row.original.clientName}</span>
        ),
      },
      {
        header: 'Date',
        accessorKey: 'dateOfEstimation',
        cell: (props) => (
          <span>{new Date(props.row.original.dateOfEstimation).toLocaleDateString()}</span>
        ),
      },
      {
        header: 'Estimated Amount',
        accessorKey: 'estimatedAmount',
        cell: (props) => (
          <span>₹{props.row.original.estimatedAmount.toLocaleString()}</span>
        ),
      },
    //   {
    //     header: 'Quotation Amount',
    //     accessorKey: 'quotationAmount',
    //     cell: (props) => (
    //       <span>
    //         {props.row.original.quotationAmount 
    //           ? `₹${props.row.original.quotationAmount.toLocaleString()}` 
    //           : '-'}
    //       </span>
    //     ),
    //   },
      {
        header: 'Status',
        accessorKey: 'status',
        cell: (props) => {
          const status = props.row.original.status;
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
              className="cursor-pointer p-2 hover:text-blue-500"
              onClick={() => navigate(`/estimations/edit/${props.row.original._id}`)}
            >
              <HiOutlinePencil />
            </span>
            <span
              className="cursor-pointer p-2 hover:text-green-500"
              onClick={() => navigate(`/app/estimation/${props.row.original._id}`)}
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
      data={estimations}
      loading={loading}
      pagingData={{ total, pageIndex, pageSize }}
      onPaginationChange={onPaginationChange}
      onSelectChange={onSelectChange}
    />
  );
};

export default EstimationTable;