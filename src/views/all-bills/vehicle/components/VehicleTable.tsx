import { useState, useMemo, useRef } from 'react'
import Avatar from '@/components/ui/Avatar'
import DataTable from '@/components/shared/DataTable'
import { HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi'
import { FaCar } from 'react-icons/fa'
import useThemeClass from '@/utils/hooks/useThemeClass'
import { useNavigate } from 'react-router-dom'
import type {
    DataTableResetHandle,
    ColumnDef,
} from '@/components/shared/DataTable'
import { useQuery } from '@tanstack/react-query'
import debounce from 'lodash/debounce'
import Input from '@/components/ui/Input'
import { fetchVehicles } from '../api/api'
import Badge from '@/components/ui/Badge'
import VehicleDeleteConfirmation from './VehicleDeleteConfirmation'
import { Tag } from '@/components/ui'

type Vehicle = {
    _id: string
    vehicleNumber: string
    vehicleType: string
    make: string
    model: string
    year: number
    color: string
    registrationDate: string
    insuranceExpiry: string
    lastServiceDate?: string
    currentMileage: number
    status: 'active' | 'inactive' | 'maintenance'
    createdBy: string
    createdAt: string
    updatedAt: string
}

type Pagination = {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
}

type ActionColumnProps = {
    row: Vehicle
    onDeleteClick: (vehicle: Vehicle) => void
}

const ActionColumn = ({ row, onDeleteClick }: ActionColumnProps) => {
    const { textTheme } = useThemeClass()
    const navigate = useNavigate()

    return (
        <div className="flex text-lg">
            <span
                className={`cursor-pointer p-2 hover:${textTheme}`}
                onClick={() => navigate(`/app/new-vehicle/${row._id}`)}
            >
                <HiOutlinePencil />
            </span>
            <span
                className="cursor-pointer p-2 hover:text-red-500"
                onClick={() => onDeleteClick(row)}
            >
                <HiOutlineTrash />
            </span>
        </div>
    )
}

const VehicleColumn = ({ row }: { row: Vehicle }) => {
    return (
        <div className="flex items-center">
            <Avatar
                icon={<FaCar />}
                className="bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-100"
            />
            <div className="ml-2 rtl:mr-2">
                <span className="font-semibold">{row.vehicleNumber}</span>
                <div className="text-xs">
                    {row.make} {row.model} ({row.year})
                </div>
            </div>
        </div>
    )
}

const VehicleTable = () => {
    const tableRef = useRef<DataTableResetHandle>(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
    })
    const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)

    const {
        data: response,
        isLoading,
        error,
        refetch,
    } = useQuery({
        queryKey: ['vehicles', pagination.page, pagination.limit, searchTerm],
        queryFn: () =>
            fetchVehicles({
                page: pagination.page,
                limit: pagination.limit,
                search: searchTerm,
            }),
    })

    const vehicles = response?.data?.vehicles || []
    const paginationData = response?.data?.pagination || {
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
    }

    const debouncedSearch = useMemo(
        () =>
            debounce((value: string) => {
                setSearchTerm(value)
                setPagination((prev) => ({ ...prev, page: 1 }))
            }, 500),
        [],
    )

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        debouncedSearch(e.target.value)
    }

    const handleDeleteClick = (vehicle: Vehicle) => {
        setSelectedVehicle(vehicle)
        setIsDeleteOpen(true)
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
                return 'bg-emerald-500'
            case 'inactive':
                return 'bg-amber-500'
            case 'maintenance':
                return 'bg-red-500'
            default:
                return 'bg-gray-500'
        }
    }

    const columns: ColumnDef<Vehicle>[] = useMemo(
        () => [
            {
                header: 'Vehicle',
                accessorKey: 'vehicleNumber',
                cell: (props) => <VehicleColumn row={props.row.original} />,
            },
            {
                header: 'Type',
                accessorKey: 'vehicleType',
                cell: (props) => (
                    <span className="capitalize">{props.row.original.vehicleType}</span>
                ),
            },
            {
                header: 'Color',
                accessorKey: 'color',
                cell: (props) => (
                    <span className="capitalize">{props.row.original.color || 'N/A'}</span>
                ),
            },
            {
                header: 'Registration',
                accessorKey: 'registrationDate',
                cell: (props) => (
                    <span>
                        {new Date(props.row.original.registrationDate).toLocaleDateString()}
                    </span>
                ),
            },
            {
                header: 'Insurance Expiry',
                accessorKey: 'insuranceExpiry',
                cell: (props) => (
                    <span>
                        {new Date(props.row.original.insuranceExpiry).toLocaleDateString()}
                    </span>
                ),
            },
            {
                header: 'Last Service Date',
                accessorKey: 'lastServiceDate',
                cell: (props) => (
                    <span>
                        {new Date(props.row.original.lastServiceDate).toLocaleDateString()}
                    </span>
                ),
            },
            {
                header: 'Mileage',
                accessorKey: 'currentMileage',
                cell: (props) => (
                    <span>{props.row.original.currentMileage.toLocaleString()} km</span>
                ),
            },
            {
                header: 'Status',
                accessorKey: 'status',
                cell: (props) => (
                    <div className="mr-2 rtl:ml-2">
                        <Tag
                            className={`text-white border-1 ${getStatusColor(props.row.original.status)}`}
                        >
                            {props.row.original.status.toUpperCase()}
                        </Tag>
                    </div>
                ),
            },
            {
                header: 'Actions',
                id: 'action',
                cell: (props) => (
                    <ActionColumn
                        row={props.row.original}
                        onDeleteClick={handleDeleteClick}
                    />
                ),
                align: 'right',
            },
        ],
        [],
    )

    const onPaginationChange = (page: number) => {
        setPagination((prev) => ({ ...prev, page }))
    }

    const onSelectChange = (limit: number) => {
        setPagination((prev) => ({ page: 1, limit }))
    }

    if (error) {
        return <div>Error loading vehicles: {(error as Error).message}</div>
    }

    return (
        <>
            <div className="mb-4">
                <Input
                    placeholder="Search vehicles..."
                    onChange={handleSearchChange}
                    className="max-w-md"
                />
            </div>

            <DataTable
                ref={tableRef}
                columns={columns}
                data={vehicles}
                skeletonAvatarColumns={[0]}
                skeletonAvatarProps={{ className: 'rounded-md' }}
                loading={isLoading}
                pagingData={{
                    total: paginationData.total,
                    pageIndex: paginationData.page,
                    pageSize: paginationData.limit,
                }}
                onPaginationChange={onPaginationChange}
                onSelectChange={onSelectChange}
            />

            <VehicleDeleteConfirmation
                isOpen={isDeleteOpen}
                onClose={() => setIsDeleteOpen(false)}
                vehicle={selectedVehicle}
                refetch={refetch}
            />
        </>
    )
}

export default VehicleTable