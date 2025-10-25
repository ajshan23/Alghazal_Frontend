import { useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import DataTable from '@/components/shared/DataTable';
import Badge from '@/components/ui/Badge';
import type { ColumnDef, DataTableResetHandle } from '@/components/shared/DataTable';
import { HiCheck, HiX, HiPencil } from 'react-icons/hi'; // Added HiPencil for Edit icon
import { BASE_URL } from '@/constants/app.constant';
import { useNavigate } from 'react-router-dom'; // Import useNavigate from React Router

interface Worker {
  _id: string;
  workerName: string;
  workerImage: string;
  phoneNumber: string;
  status: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

const statusColorMap: Record<string, { dotClass: string }> = {
  true: { dotClass: 'bg-emerald-500' }, // Active status
  false: { dotClass: 'bg-red-500' },   // Inactive status
};

const WorkersTable = ({
  searchTerm,
}: {
  searchTerm: string;
}) => {
  const tableRef = useRef<DataTableResetHandle>(null);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [pageIndex, setPageIndex] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [total, setTotal] = useState<number>(0);
  const navigate = useNavigate(); // Initialize useNavigate

  useEffect(() => {
    setPageIndex(1);
  }, [searchTerm]);

  useEffect(() => {
    const fetchWorkers = async () => {
      setLoading(true);
      try {
        const params: any = {
          page: pageIndex,
          limit: pageSize,
          searchTerm: searchTerm ? searchTerm : "",
        };

        const response = await axios.get(`${BASE_URL}/worker`, { params });
        setWorkers(response.data?.data?.workers);
        setTotal(response.data?.data?.totalPages);
      } catch (error) {
        console.error('Error fetching workers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkers();
  }, [pageIndex, pageSize, searchTerm]);

  const toggleWorkerStatus = async (workerId: string, currentStatus: boolean) => {
    try {
      const response = await axios.put(
        `${BASE_URL}/worker/change-status?id=${workerId}`
      );
      setWorkers((prevWorkers) =>
        prevWorkers.map((worker) =>
          worker._id === workerId
            ? { ...worker, status: !currentStatus }
            : worker
        )
      );
      console.log('Status updated successfully:', response.data);
    } catch (error) {
      console.error('Error toggling worker status:', error);
    }
  };

  const handleEditWorker = (workerId: string) => {
    navigate(`/app/worker/form/${workerId}`); // Navigate to the edit form route
  };

  const columns: ColumnDef<Worker>[] = useMemo(
    () => [
      {
        header: 'Image',
        accessorKey: 'workerImage',
        cell: (props) => (
          <img
            src={props.row.original.workerImage}
            alt={props.row.original.workerName}
            className="w-10 h-10 rounded-full"
          />
        ),
      },
      {
        header: 'Worker Name',
        accessorKey: 'workerName',
        cell: (props) => (
          <span className="capitalize">{props.row.original.workerName}</span>
        ),
      },
      {
        header: 'Phone',
        accessorKey: 'phoneNumber',
      },
      {
        header: 'Status',
        accessorKey: 'status',
        cell: (props) => {
          const status = props.row.original.status;
          const isActive = status;
          return (
            <div className="flex items-center gap-2">
              <Badge className={statusColorMap[String(isActive)]?.dotClass || 'bg-gray-500'} />
              <span className="capitalize font-semibold">
                {isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          );
        },
      },
      {
        header: 'Actions',
        id: 'actions',
        cell: (props) => {
          const isActive = props.row.original.status;
          return (
            <div className="flex justify-end gap-2"> {/* Added gap for spacing */}
              <button
                className={`flex items-center justify-center w-24 h-8 rounded-full transition-colors ${
                  isActive
                    ? 'bg-red-500 hover:bg-red-600'
                    : 'bg-emerald-500 hover:bg-emerald-600'
                }`}
                onClick={() => toggleWorkerStatus(props.row.original._id, isActive)}
              >
                <span className="flex items-center gap-1 text-white">
                  {isActive ? (
                    <>
                      <span>Deactivate</span>
                    </>
                  ) : (
                    <>
                      <span>Activate</span>
                    </>
                  )}
                </span>
              </button>
              {/* Edit Button */}
              <button
                className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-500 hover:bg-blue-600 transition-colors text-white"
                onClick={() => handleEditWorker(props.row.original._id)}
              >
                <HiPencil size={16} />
              </button>
            </div>
          );
        },
      },
    ],
    []
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
      data={workers}
      loading={loading}
      pagingData={{ total, pageIndex, pageSize }}
      onPaginationChange={onPaginationChange}
      onSelectChange={onSelectChange}
    />
  );
};

export default WorkersTable;