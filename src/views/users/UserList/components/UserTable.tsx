import { useState, useMemo, useRef } from 'react'
import Avatar from '@/components/ui/Avatar'
import Badge from '@/components/ui/Badge'
import DataTable from '@/components/shared/DataTable'
import { HiOutlineEye, HiOutlinePencil, HiOutlineSearch, HiOutlinePlus } from 'react-icons/hi'
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
import { fetchUser } from '../../api/api'
import { Button } from '@/components/ui'

type User = {
    _id: string
    firstName: string
    lastName: string
    email: string
    phoneNumbers: string[]
    role: string
    isActive: boolean
    createdAt: string
    updatedAt: string
    createdBy: string
    __v: number
    profileImage?: string
    signatureImage?: string
}

type Pagination = {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
}

const userStatusColor = {
    true: {
        label: 'Active',
        dotClass: 'bg-emerald-500',
        textClass: 'text-emerald-500',
        bgClass: 'bg-emerald-50 dark:bg-emerald-900/20',
        borderClass: 'border-emerald-200 dark:border-emerald-800'
    },
    false: {
        label: 'Inactive',
        dotClass: 'bg-red-500',
        textClass: 'text-red-500',
        bgClass: 'bg-red-50 dark:bg-red-900/20',
        borderClass: 'border-red-200 dark:border-red-800'
    }
}

const roleColors = {
    admin: {
        bg: 'bg-purple-100 dark:bg-purple-900/30',
        text: 'text-purple-700 dark:text-purple-300',
        border: 'border-purple-200 dark:border-purple-800'
    },
    engineer: {
        bg: 'bg-blue-100 dark:bg-blue-900/30',
        text: 'text-blue-700 dark:text-blue-300',
        border: 'border-blue-200 dark:border-blue-800'
    },
    finance: {
        bg: 'bg-green-100 dark:bg-green-900/30',
        text: 'text-green-700 dark:text-green-300',
        border: 'border-green-200 dark:border-green-800'
    },
    super_admin: {
        bg: 'bg-indigo-100 dark:bg-indigo-900/30',
        text: 'text-indigo-700 dark:text-indigo-300',
        border: 'border-indigo-200 dark:border-indigo-800'
    }
}

const ActionColumn = ({ row }: { row: User }) => {
    const navigate = useNavigate()

    const onEdit = () => {
        navigate(`/app/user-form/${row._id}`)
    }

    const onView = () => {
        navigate(`/app/user-view/${row?._id}`)
    }

    return (
        <div className="flex justify-end gap-2">
            <Button
                size="sm"
                variant="plain"
                icon={<HiOutlineEye />}
                onClick={onView}
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                tooltip="View User"
            />
            <Button
                size="sm"
                variant="plain"
                icon={<HiOutlinePencil />}
                onClick={onEdit}
                className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
                tooltip="Edit User"
            />
        </div>
    )
}

const StatusBadge = ({ isActive }: { isActive: boolean }) => {
    const statusKey = isActive.toString() as keyof typeof userStatusColor
    const statusInfo = userStatusColor[statusKey] || userStatusColor.false

    return (
        <div className={`inline-flex items-center px-3 py-1 rounded-full ${statusInfo.bgClass} border ${statusInfo.borderClass}`}>
            <span className={`w-2 h-2 rounded-full ${statusInfo.dotClass} mr-2`}></span>
            <span className={`text-xs font-semibold ${statusInfo.textClass}`}>
                {statusInfo.label}
            </span>
        </div>
    )
}

const RoleBadge = ({ role }: { role: string }) => {
    const roleInfo = roleColors[role as keyof typeof roleColors] || {
        bg: 'bg-gray-100 dark:bg-gray-900/30',
        text: 'text-gray-700 dark:text-gray-300',
        border: 'border-gray-200 dark:border-gray-800'
    }

    return (
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${roleInfo.bg} ${roleInfo.text} border ${roleInfo.border} capitalize`}>
            {role.replace('_', ' ')}
        </span>
    )
}

const UserColumn = ({ row }: { row: User }) => {
    return (
        <div className="flex items-center">
            <Avatar 
                src={row.profileImage} 
                icon={<FiUser />} 
                alt={`${row.firstName} ${row.lastName}`}
                size={50}
                className="border-2 border-white shadow-lg"
                shape="circle"
            />
            <div className="ml-4">
                <div className="font-semibold text-gray-800 dark:text-white">
                    {row.firstName} {row.lastName}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {row.email}
                </div>
            </div>
        </div>
    )
}

const UserTable = () => {
    const tableRef = useRef<DataTableResetHandle>(null)
    const navigate = useNavigate()
    const [searchTerm, setSearchTerm] = useState('')
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
    })
    
    const { data: response, isLoading, error, refetch } = useQuery({
        queryKey: ['users', pagination.page, pagination.limit, searchTerm],
        queryFn: () => fetchUser({
            page: pagination.page,
            limit: pagination.limit,
            search: searchTerm
        }),
    })

    const users = response?.data?.users || []
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

    const columns: ColumnDef<User>[] = useMemo(
        () => [
            {
                header: 'User',
                accessorKey: 'name',
                cell: (props) => <UserColumn row={props.row.original} />,
            },
            {
                header: 'Phone',
                accessorKey: 'phoneNumbers',
                cell: (props) => (
                    <span className="text-gray-700 dark:text-gray-300 font-medium">
                        {props.row.original.phoneNumbers?.[0] || 'N/A'}
                    </span>
                ),
            },
            {
                header: 'Role',
                accessorKey: 'role',
                cell: (props) => (
                    <RoleBadge role={props.row.original.role} />
                ),
            },
            {
                header: 'Status',
                accessorKey: 'isActive',
                cell: (props) => (
                    <StatusBadge isActive={props.row.original.isActive} />
                ),
            },
            {
                header: 'Created',
                accessorKey: 'createdAt',
                cell: (props) => (
                    <span className="text-gray-600 dark:text-gray-400 text-sm">
                        {new Date(props.row.original.createdAt).toLocaleDateString()}
                    </span>
                ),
            },
            {
                header: 'Actions',
                id: 'action',
                cell: (props) => <ActionColumn row={props.row.original} />,
                enableSorting: false,
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
                    Error loading users
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
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">Staffs</h3>
                
                <div className="flex flex-col sm:flex-row gap-3">
                    <Input
                        placeholder="Search users..."
                        onChange={handleSearchChange}
                        className="max-w-md"
                        prefix={<HiOutlineSearch className="text-lg text-gray-400" />}
                    />
                    
                    <Button
                        variant="solid"
                        icon={<HiOutlinePlus />}
                        className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
                        onClick={() => navigate('/app/user-new')}
                    >
                        Add Staff
                    </Button>
                </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
                <DataTable
                    ref={tableRef}
                    columns={columns}
                    data={users}
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

export default UserTable