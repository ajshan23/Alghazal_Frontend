import { useState, useMemo, useRef } from 'react'
import Avatar from '@/components/ui/Avatar'
import DataTable from '@/components/shared/DataTable'
import { HiOutlineEye, HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi'
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
        navigate(`/app/client-form/${row._id}`) // Updated route
    }

    const onDelete = () => {
        console.log('Delete client:', row._id)
    }
    const onView = () => {
        navigate(`/app/client-view/${row?._id}`)
    }

    return (
        <div className="flex justify-start text-lg">
                        <span
                            className={`cursor-pointer p-2 hover:${textTheme}`}
                            onClick={onView}
                        >
                            <HiOutlineEye />
                        </span>
            <span
                className={`cursor-pointer p-2 hover:${textTheme}`}
                onClick={onEdit}
            >
                <HiOutlinePencil />
            </span>
            {/* <span
                className="cursor-pointer p-2 hover:text-red-500"
                onClick={onDelete}
            >
                <HiOutlineTrash />
            </span> */}
        </div>
    )
}

const ClientColumn = ({ row }: { row: Client }) => {
    return (
        <div className="flex items-center">
            <Avatar icon={<FiUser />} />
            <span className="ml-2 rtl:mr-2 font-semibold">
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
                cell: (props) => <span>{props.row.original.clientAddress}</span>,
            },
            {
                header: 'Mobile',
                accessorKey: 'mobileNumber',
                cell: (props) => <span>{props.row.original.mobileNumber}</span>,
            },
            {
                header: 'TRN',
                accessorKey: 'trnNumber',
                cell: (props) => <span>{props.row.original.trnNumber}</span>,
            },
            {
                header: 'Created At',
                accessorKey: 'createdAt',
                cell: (props) => (
                    <span>{new Date(props.row.original.createdAt).toLocaleDateString()}</span>
                ),
            },
            {
                header: 'Action',
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
        return <div>Error loading clients: {(error as Error).message}</div>
    }

    return (
        <>
            <div className="mb-4">
                <Input
                    placeholder="Search clients..."
                    onChange={handleSearchChange}
                    className="max-w-md"
                />
            </div>
            
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
        </>
    )
}

export default ClientTable