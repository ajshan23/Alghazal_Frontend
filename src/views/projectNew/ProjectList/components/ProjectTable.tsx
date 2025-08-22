import { useState, useMemo, useRef } from 'react'
import Avatar from '@/components/ui/Avatar'
import Badge from '@/components/ui/Badge'
import DataTable from '@/components/shared/DataTable'
import { HiOutlineEye, HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi'
import { FiUser } from 'react-icons/fi'
import useThemeClass from '@/utils/hooks/useThemeClass'
import UserDeleteConfirmation from './ProjectDeleteConfirmation'
import { useNavigate } from 'react-router-dom'
import type {
    DataTableResetHandle,
    OnSortParam,
    ColumnDef,
} from '@/components/shared/DataTable'
import { useQuery } from '@tanstack/react-query'
import debounce from 'lodash/debounce'
import Input from '@/components/ui/Input'
import { fetchProjectList } from '../../api/api'

type Project = {
    _id: string
    projectName: string
    client:{
        clientName: string
    }
    status: string
    progress: string
    isActive?: boolean // Make optional if it might not always be present
}

type Pagination = {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
}

const projectStatusColor = {
    active: {
        label: 'Active',
        dotClass: 'bg-emerald-500',
        textClass: 'text-emerald-500',
    },
    inactive: {
        label: 'Inactive',
        dotClass: 'bg-green-500',
        textClass: 'text-green-500',
    },
    completed: {
        label: 'Completed',
        dotClass: 'bg-blue-500',
        textClass: 'text-blue-500',
    },
    // Add other statuses as needed
}

const ActionColumn = ({ row }: { row: Project }) => {
    const { textTheme } = useThemeClass()
    const navigate = useNavigate()

    const onEdit = () => {
        navigate(`/app/project-edit/${row._id}`)
    }
    const onView = () => {
        navigate(`/app/project-view/${row?._id}`)
    }
    const onDelete = () => {
        // Handle delete directly here or use a context/state management
        console.log('Delete project:', row._id)
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

const ProjectTable = () => {
    const tableRef = useRef<DataTableResetHandle>(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
    })
    
    const { 
        data: response, 
        isLoading, 
        error, 
        refetch 
    } = useQuery({
        queryKey: ['projects', pagination.page, pagination.limit, searchTerm],
        queryFn: () => fetchProjectList({
            page: pagination.page,
            limit: pagination.limit,
            search: searchTerm
        }),
        keepPreviousData: true
    })

    const debouncedSearch = useMemo(
        () => debounce((value: string) => {
            setSearchTerm(value)
            setPagination(prev => ({ ...prev, page: 1 })) // Reset to first page on search
        }, 500),
        []
    )

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        debouncedSearch(e.target.value)
    }

    const columns: ColumnDef<Project>[] = useMemo(
        () => [
            {
                header: 'Project Name',
                accessorKey: 'projectName',
                cell: (props) => <span>{props.row.original?.projectName}</span>,
            },
            {
                header: 'Client Name',
                accessorKey: 'clientName',
                cell: (props) => <span>{props.row.original?.client.clientName}</span>,
            },
            {
                header: 'Progress',
                accessorKey: 'progress',
                cell: (props) => (
                    <span className="capitalize">{props.row.original?.progress}</span>
                ),
            },
                         {
                header: 'Project Number',
                accessorKey: 'progress',
                cell: (props) => (
                    <span className="capitalize">{props.row.original?.projectNumber}</span>
                ),
            },
            {
                header: 'Status',
                accessorKey: 'status',
                cell: (props) => {
                    const status = props.row.original.status?.toLowerCase() || 'inactive'
                    const statusInfo = projectStatusColor[status as keyof typeof projectStatusColor] || 
                                     projectStatusColor.inactive
                    return (
                        <div className="flex items-center gap-2">
                            <Badge className={statusInfo.dotClass} />
                            <span className={`capitalize font-semibold ${statusInfo.textClass}`}>
                                {props.row.original?.status
                                }
                            </span>
                        </div>
                    )
                },
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
        setPagination(prev => ({ page: 1, limit })) // Reset to first page when changing page size
    }

    if (error) {
        return <div>Error loading projects: {(error as Error).message}</div>
    }

    return (
        <>
            <div className="mb-4">
                <Input
                    placeholder="Search projects..."
                    onChange={handleSearchChange}
                    className="max-w-md"
                />
            </div>
            
            <DataTable
                ref={tableRef}
                columns={columns}
                data={response?.data?.projects || []}
                skeletonAvatarColumns={[0]}
                skeletonAvatarProps={{ className: 'rounded-md' }}
                loading={isLoading}
                pagingData={{
                    total: response?.data?.total || 0,
                    pageIndex: pagination.page,
                    pageSize: pagination.limit,
                }}
                onPaginationChange={onPaginationChange}
                onSelectChange={onSelectChange}
            />
            <UserDeleteConfirmation />
        </>
    )
}

export default ProjectTable