import { useState, useMemo, useRef } from 'react'
import Avatar from '@/components/ui/Avatar'
import DataTable from '@/components/shared/DataTable'
import { HiOutlineEye, HiOutlinePencil, HiOutlineSearch, HiOutlineTrash } from 'react-icons/hi'
import { FiUser } from 'react-icons/fi'
import useThemeClass from '@/utils/hooks/useThemeClass'
import { useNavigate } from 'react-router-dom'
import type {
    DataTableResetHandle,
    ColumnDef,
} from '@/components/shared/DataTable'

import { useQuery } from '@tanstack/react-query'
import debounce from 'lodash/debounce'
import Input from '@/components/ui/Input'
import { fetchClient } from '../../api/api'
import { Button } from '@/components/ui'
import { HiOutlinePlus } from 'react-icons/hi'

type Client = {
    _id: string
    clientName: string
    clientAddress: string
    pincode: string
    mobileNumber: string
    telephoneNumber: string
    trnNumber: string
    createdBy: {
        _id: string
        email: string
        firstName: string
        lastName: string
    }
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

const ActionColumn = ({ row }: { row: Client }) => {
    const { textTheme } = useThemeClass()
    const navigate = useNavigate()

    const onEdit = () => {
        navigate(`/app/client-form/${row._id}`)
    }

    const onDelete = () => {
        console.log('Delete client:', row._id)
    }
    const onView = () => {
        navigate(`/app/client-view/${row?._id}`)
    }

    return (
        <div className="flex justify-start text-lg gap-1">
            {/* <Button
                size="sm"
                variant="plain"
                icon={<HiOutlineEye />}
                onClick={onView}
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
            /> */}
            <Button
                size="sm"
                variant="plain"
                icon={<HiOutlinePencil />}
                onClick={onEdit}
                className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
            />
        </div>
    )
}

const ClientColumn = ({ row }: { row: Client }) => {
    return (
        <div className="flex items-center">
            <Avatar 
                icon={<FiUser />} 
                className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white"
                size={40}
            />
            <span className="ml-3 rtl:mr-3 font-semibold text-gray-800 dark:text-gray-200">
                {row.clientName}
            </span>
        </div>
    )
}

const ClientTable = () => {
    const tableRef = useRef<DataTableResetHandle>(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
    })
    const navigate=useNavigate()
    
    const { data: response, isLoading, error } = useQuery({
        queryKey: ['clients', pagination.page, pagination.limit, searchTerm],
        queryFn: () => fetchClient({
            page: pagination.page,
            limit: pagination.limit,
            search: searchTerm
        }),
    })

    const clients = response?.data?.clients || []
    const paginationData = response?.data?.pagination || {
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false
    }

    const debouncedSearch = useMemo(
        () => debounce((value: string) => {
            setSearchTerm(value)
            setPagination(prev => ({ ...prev, page: 1 }))
        }, 500),
        []
    )

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        debouncedSearch(e.target.value)
    }

    const columns: ColumnDef<Client>[] = useMemo(
        () => [
            {
                header: 'Client Name',
                accessorKey: 'clientName',
                cell: (props) => <ClientColumn row={props.row.original} />,
            },
            {
                header: 'Address',
                accessorKey: 'clientAddress',
                cell: (props) => <span className="text-gray-700 dark:text-gray-300">{props.row.original.clientAddress}</span>,
            },
            {
                header: 'Mobile',
                accessorKey: 'mobileNumber',
                cell: (props) => <span className="text-gray-700 dark:text-gray-300">{props.row.original.mobileNumber}</span>,
            },
            {
                header: 'TRN',
                accessorKey: 'trnNumber',
                cell: (props) => <span className="text-gray-700 dark:text-gray-300">{props.row.original.trnNumber}</span>,
            },
            {
                header: 'Created At',
                accessorKey: 'createdAt',
                cell: (props) => (
                    <span className="text-gray-600 dark:text-gray-400">
                        {new Date(props.row.original.createdAt).toLocaleDateString()}
                    </span>
                ),
            },
            {
                header: 'Actions',
                id: 'action',
                cell: (props) => <ActionColumn row={props.row.original} />,
            },
        ],
        []
    )

    const onPaginationChange = (page: number) => {
        setPagination(prev => ({ ...prev, page }))
    }

    const onSelectChange = (limit: number) => {
        setPagination(prev => ({ page: 1, limit }))
    }

    if (error) {
        return (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
                <div className="text-red-600 dark:text-red-400 font-medium mb-2">
                    Error loading clients
                </div>
                <div className="text-sm text-red-500 dark:text-red-300">
                    {(error as Error).message}
                </div>
            </div>
        )
    }

    return (
        <>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">Clients</h3>
                
                <div className="flex flex-col sm:flex-row gap-3">
                    <Input
                        placeholder="Search clients..."
                        onChange={handleSearchChange}
                        className="max-w-md"
                        prefix={<HiOutlineSearch className="text-lg text-gray-400" />}
                    />
                    
                    <Button
                        variant="solid"
                        icon={<HiOutlinePlus />}
                        className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
                        onClick={() => navigate('/app/client-new')}
                    >
                        Add Client
                    </Button>
                </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
                <DataTable
                    ref={tableRef}
                    columns={columns}
                    data={clients}
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
        </>
    )
}

export default ClientTable