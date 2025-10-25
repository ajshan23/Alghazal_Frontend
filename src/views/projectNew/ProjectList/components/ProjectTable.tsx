import { useState, useMemo, useRef } from 'react'
import Avatar from '@/components/ui/Avatar'
import Badge from '@/components/ui/Badge'
import DataTable from '@/components/shared/DataTable'
import { HiOutlineEye, HiOutlinePencil, HiOutlineSearch, HiOutlinePlus } from 'react-icons/hi'
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
import { Button } from '@/components/ui'

type Project = {
    _id: string
    projectName: string
    client: {
        clientName: string
    }
    status: string
    progress: string
    projectNumber?: string
    isActive?: boolean
    createdAt: string
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
        bgClass: 'bg-emerald-50 dark:bg-emerald-900/20',
        borderClass: 'border-emerald-200 dark:border-emerald-800'
    },
    inactive: {
        label: 'Inactive',
        dotClass: 'bg-gray-500',
        textClass: 'text-gray-500',
        bgClass: 'bg-gray-50 dark:bg-gray-900/20',
        borderClass: 'border-gray-200 dark:border-gray-800'
    },
    completed: {
        label: 'Completed',
        dotClass: 'bg-blue-500',
        textClass: 'text-blue-500',
        bgClass: 'bg-blue-50 dark:bg-blue-900/20',
        borderClass: 'border-blue-200 dark:border-blue-800'
    },
    draft: {
        label: 'Draft',
        dotClass: 'bg-amber-500',
        textClass: 'text-amber-500',
        bgClass: 'bg-amber-50 dark:bg-amber-900/20',
        borderClass: 'border-amber-200 dark:border-amber-800'
    },
    'in-progress': {
        label: 'In Progress',
        dotClass: 'bg-indigo-500',
        textClass: 'text-indigo-500',
        bgClass: 'bg-indigo-50 dark:bg-indigo-900/20',
        borderClass: 'border-indigo-200 dark:border-indigo-800'
    },
    pending: {
        label: 'Pending',
        dotClass: 'bg-orange-500',
        textClass: 'text-orange-500',
        bgClass: 'bg-orange-50 dark:bg-orange-900/20',
        borderClass: 'border-orange-200 dark:border-orange-800'
    }
}

const ActionColumn = ({ row }: { row: Project }) => {
    const navigate = useNavigate()

    const onEdit = () => {
        navigate(`/app/project-edit/${row._id}`)
    }
    const onView = () => {
        navigate(`/app/project-view/${row?._id}`)
    }

    return (
        <div className="flex justify-start gap-2">
            <Button
                size="sm"
                variant="plain"
                icon={<HiOutlineEye />}
                onClick={onView}
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                tooltip="View Project"
            />
            <Button
                size="sm"
                variant="plain"
                icon={<HiOutlinePencil />}
                onClick={onEdit}
                className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
                tooltip="Edit Project"
            />
        </div>
    )
}

const StatusBadge = ({ status }: { status: string }) => {
    const statusKey = status?.toLowerCase() as keyof typeof projectStatusColor
    const statusInfo = projectStatusColor[statusKey] || projectStatusColor.inactive

    return (
        <div className={`inline-flex items-center px-3 py-1 rounded-full ${statusInfo.bgClass} border ${statusInfo.borderClass}`}>
            <span className={`w-2 h-2 rounded-full ${statusInfo.dotClass} mr-2`}></span>
            <span className={`text-xs font-semibold ${statusInfo.textClass} capitalize`}>
                {statusInfo.label}
            </span>
        </div>
    )
}

const ProgressBar = ({ progress }: { progress: string }) => {
    const progressValue = parseInt(progress) || 0
    
    return (
        <div className="flex items-center gap-3">
            <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                <div 
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progressValue}%` }}
                />
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[40px]">
                {progressValue}%
            </span>
        </div>
    )
}

const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    })
}

const ProjectTable = () => {
    const tableRef = useRef<DataTableResetHandle>(null)
    const navigate = useNavigate()
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
            setPagination(prev => ({ ...prev, page: 1 }))
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
                cell: (props) => (
                    <div className="flex items-center">
                        <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg mr-3">
                            <FiUser className="text-white text-lg" />
                        </div>
                        <div>
                            <div className="font-semibold text-gray-800 dark:text-white">
                                {props.row.original?.projectName}
                            </div>
                            {props.row.original?.projectNumber && (
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                    #{props.row.original.projectNumber}
                                </div>
                            )}
                        </div>
                    </div>
                ),
            },
            {
                header: 'Client',
                accessorKey: 'clientName',
                cell: (props) => (
                    <span className="text-gray-700 dark:text-gray-300 font-medium">
                        {props.row.original?.client?.clientName}
                    </span>
                ),
            },
            {
                header: 'Progress',
                accessorKey: 'progress',
                cell: (props) => (
                    <ProgressBar progress={props.row.original?.progress} />
                ),
            },
            {
                header: 'Created Date',
                accessorKey: 'createdAt',
                cell: (props) => (
                    <div className="text-gray-600 dark:text-gray-400 font-medium">
                        {formatDate(props.row.original?.createdAt)}
                    </div>
                ),
            },
            // {
            //     header: 'Status',
            //     accessorKey: 'status',
            //     cell: (props) => (
            //         <StatusBadge status={props.row.original?.status} />
            //     ),
            // },
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
                    Error loading projects
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
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">Projects</h3>
                
                <div className="flex flex-col sm:flex-row gap-3">
                    <Input
                        placeholder="Search projects..."
                        onChange={handleSearchChange}
                        className="max-w-md"
                        prefix={<HiOutlineSearch className="text-lg text-gray-400" />}
                    />
                    
                    <Button
                        variant="solid"
                        icon={<HiOutlinePlus />}
                        className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
                        onClick={() => navigate('/app/project-new')}
                    >
                        New Project
                    </Button>
                </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
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
            </div>
            <UserDeleteConfirmation />
        </>
    )
}

export default ProjectTable