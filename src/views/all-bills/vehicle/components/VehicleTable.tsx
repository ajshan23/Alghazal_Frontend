import { useState, useMemo, useRef } from 'react'
import Avatar from '@/components/ui/Avatar'
import DataTable from '@/components/shared/DataTable'
import { HiOutlinePencil, HiOutlineTrash, HiOutlineSearch, HiOutlinePlus } from 'react-icons/hi'
import { FaCar } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
import type {
    DataTableResetHandle,
    ColumnDef,
} from '@/components/shared/DataTable'
import { useQuery } from '@tanstack/react-query'
import debounce from 'lodash/debounce'
import Input from '@/components/ui/Input'
import { fetchVehicles } from '../api/api'
import VehicleDeleteConfirmation from './VehicleDeleteConfirmation'
import { Button } from '@/components/ui'
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
    const navigate = useNavigate()

    return (
        <div className="flex justify-end gap-2">
            <Button
                size="sm"
                variant="plain"
                icon={<HiOutlinePencil />}
                onClick={() => navigate(`/app/new-vehicle/${row._id}`)}
                className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
                tooltip="Edit Vehicle"
            />
            <Button
                size="sm"
                variant="plain"
                icon={<HiOutlineTrash />}
                onClick={() => onDeleteClick(row)}
                className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                tooltip="Delete Vehicle"
            />
        </div>
    )
}

const VehicleColumn = ({ row }: { row: Vehicle }) => {
    return (
        <div className="flex items-center">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg mr-3">
                <FaCar className="text-white text-lg" />
            </div>
            <div>
                <div className="font-semibold text-gray-800 dark:text-white">
                    {row.vehicleNumber}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                    {row.make} {row.model} ({row.year})
                </div>
            </div>
        </div>
    )
}

const StatusBadge = ({ status }: { status: string }) => {
    const statusConfig = {
        active: {
            bg: 'bg-emerald-100 dark:bg-emerald-900/30',
            text: 'text-emerald-700 dark:text-emerald-300',
            border: 'border-emerald-200 dark:border-emerald-800',
            label: 'Active'
        },
        inactive: {
            bg: 'bg-amber-100 dark:bg-amber-900/30',
            text: 'text-amber-700 dark:text-amber-300',
            border: 'border-amber-200 dark:border-amber-800',
            label: 'Inactive'
        },
        maintenance: {
            bg: 'bg-red-100 dark:bg-red-900/30',
            text: 'text-red-700 dark:text-red-300',
            border: 'border-red-200 dark:border-red-800',
            label: 'Maintenance'
        }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.inactive

    return (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text} border ${config.border} capitalize`}>
            {config.label}
        </span>
    )
}

const ColorBadge = ({ color }: { color: string }) => {
    if (!color) return <span className="text-gray-500 dark:text-gray-400">N/A</span>
    
    return (
        <div className="flex items-center gap-2">
            <div 
                className="w-4 h-4 rounded-full border border-gray-300 dark:border-gray-600"
                style={{ backgroundColor: color.toLowerCase() }}
            />
            <span className="capitalize text-gray-700 dark:text-gray-300">
                {color}
            </span>
        </div>
    )
}

const DateColumn = ({ date }: { date: string }) => {
    if (!date) return <span className="text-gray-500 dark:text-gray-400">N/A</span>
    
    return (
        <span className="text-gray-600 dark:text-gray-400 text-sm font-medium">
            {new Date(date).toLocaleDateString()}
        </span>
    )
}

const MileageColumn = ({ mileage }: { mileage: number }) => {
    return (
        <span className="text-gray-700 dark:text-gray-300 font-medium">
            {mileage.toLocaleString()} km
        </span>
    )
}

const VehicleTable = () => {
    const tableRef = useRef<DataTableResetHandle>(null)
    const navigate = useNavigate()
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
                    <span className="capitalize text-gray-700 dark:text-gray-300">
                        {props.row.original.vehicleType}
                    </span>
                ),
            },
            {
                header: 'Color',
                accessorKey: 'color',
                cell: (props) => (
                    <ColorBadge color={props.row.original.color} />
                ),
            },
            {
                header: 'Registration',
                accessorKey: 'registrationDate',
                cell: (props) => (
                    <DateColumn date={props.row.original.registrationDate} />
                ),
            },
            {
                header: 'Insurance Expiry',
                accessorKey: 'insuranceExpiry',
                cell: (props) => (
                    <DateColumn date={props.row.original.insuranceExpiry} />
                ),
            },
            {
                header: 'Last Service',
                accessorKey: 'lastServiceDate',
                cell: (props) => (
                    <DateColumn date={props.row.original.lastServiceDate} />
                ),
            },
            {
                header: 'Mileage',
                accessorKey: 'currentMileage',
                cell: (props) => (
                    <MileageColumn mileage={props.row.original.currentMileage} />
                ),
            },
            {
                header: 'Status',
                accessorKey: 'status',
                cell: (props) => (
                    <StatusBadge status={props.row.original.status} />
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
                enableSorting: false,
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
        return (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
                <div className="text-red-600 dark:text-red-400 font-medium mb-2">
                    Error loading vehicles
                </div>
                <div className="text-sm text-red-500 dark:text-red-300">
                    {(error as Error).message}
                </div>
                <Button
                    className="mt-4"
                    onClick={() => refetch()}
                    variant="solid"
                >
                    Try Again
                </Button>
            </div>
        )
    }

    return (
        <>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">Vehicles</h3>
                
                <div className="flex flex-col sm:flex-row gap-3">
                    <Input
                        placeholder="Search vehicles..."
                        onChange={handleSearchChange}
                        className="max-w-md"
                        prefix={<HiOutlineSearch className="text-lg text-gray-400" />}
                    />
                    
                    <Button
                        variant="solid"
                        icon={<HiOutlinePlus />}
                        className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
                        onClick={() => navigate('/app/new-vehicle')}
                    >
                        Add Vehicle
                    </Button>
                </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
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
            </div>

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