import { useState, useMemo, useRef } from 'react'
import Avatar from '@/components/ui/Avatar'
import DataTable from '@/components/shared/DataTable'
import { HiOutlineEye, HiOutlinePencil, HiOutlineTrash, HiOutlineSearch, HiOutlinePlus } from 'react-icons/hi'
import { FiPackage } from 'react-icons/fi'
import useThemeClass from '@/utils/hooks/useThemeClass'
import { useNavigate } from 'react-router-dom'
import type {
    DataTableResetHandle,
    ColumnDef,
} from '@/components/shared/DataTable'
import { useQuery } from '@tanstack/react-query'
import debounce from 'lodash/debounce'
import Input from '@/components/ui/Input'
import { fetchCategories } from '../api/api'
import CategoryDeleteConfirm from './CategoryDeleteConfirm'
import { Button } from '@/components/ui'

type Category = {
    _id: string
    name: string
    description: string
    createdAt: string
    updatedAt: string
    createdBy: string
    __v: number
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
    row: Category
    onDeleteClick: (category: Category) => void
}

const ActionColumn = ({ row, onDeleteClick }: ActionColumnProps) => {
    const navigate = useNavigate()

    return (
        <div className="flex justify-end gap-2">
            <Button
                size="sm"
                variant="plain"
                icon={<HiOutlinePencil />}
                onClick={() => navigate(`/app/new-cat/${row._id}`)}
                className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
                tooltip="Edit Category"
            />
            <Button
                size="sm"
                variant="plain"
                icon={<HiOutlineTrash />}
                onClick={() => onDeleteClick(row)}
                className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                tooltip="Delete Category"
            />
        </div>
    )
}

const CategoryColumn = ({ row }: { row: Category }) => {
    return (
        <div className="flex items-center">
            <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg mr-3">
                <FiPackage className="text-white text-lg" />
            </div>
            <div>
                <div className="font-semibold text-gray-800 dark:text-white">
                    {row.name}
                </div>
                {row.description && (
                    <div className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1 max-w-xs">
                        {row.description}
                    </div>
                )}
            </div>
        </div>
    )
}

const DescriptionColumn = ({ description }: { description: string }) => {
    return (
        <div className="max-w-xs">
            <span className="text-gray-700 dark:text-gray-300 line-clamp-2">
                {description || 'No description'}
            </span>
        </div>
    )
}

const DateColumn = ({ date }: { date: string }) => {
    return (
        <span className="text-gray-600 dark:text-gray-400 text-sm font-medium">
            {new Date(date).toLocaleDateString()}
        </span>
    )
}

const CategoryTable = () => {
    const tableRef = useRef<DataTableResetHandle>(null)
    const navigate = useNavigate()
    const [searchTerm, setSearchTerm] = useState('')
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
    })
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)

    const {
        data: response,
        isLoading,
        error,
        refetch,
    } = useQuery({
        queryKey: ['categories', pagination.page, pagination.limit, searchTerm],
        queryFn: () =>
            fetchCategories({
                page: pagination.page,
                limit: pagination.limit,
                search: searchTerm,
            }),
    })

    const categories = response?.data?.categories || []
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

    const handleDeleteClick = (category: Category) => {
        setSelectedCategory(category)
        setIsDeleteOpen(true)
    }

    const columns: ColumnDef<Category>[] = useMemo(
        () => [
            {
                header: 'Category',
                accessorKey: 'name',
                cell: (props) => <CategoryColumn row={props.row.original} />,
            },
            {
                header: 'Description',
                accessorKey: 'description',
                cell: (props) => (
                    <DescriptionColumn description={props.row.original.description} />
                ),
            },
            {
                header: 'Created Date',
                accessorKey: 'createdAt',
                cell: (props) => (
                    <DateColumn date={props.row.original.createdAt} />
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
                    Error loading categories
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
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">Categories</h3>
                
                <div className="flex flex-col sm:flex-row gap-3">
                    <Input
                        placeholder="Search categories..."
                        onChange={handleSearchChange}
                        className="max-w-md"
                        prefix={<HiOutlineSearch className="text-lg text-gray-400" />}
                    />
                    
                    <Button
                        variant="solid"
                        icon={<HiOutlinePlus />}
                        className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white"
                        onClick={() => navigate('/app/new-cat')}
                    >
                        Add Category
                    </Button>
                </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
                <DataTable
                    ref={tableRef}
                    columns={columns}
                    data={categories}
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
            
            <CategoryDeleteConfirm
                isOpen={isDeleteOpen}
                onClose={() => setIsDeleteOpen(false)}
                category={selectedCategory}
                refetch={refetch}
            />
        </>
    )
}

export default CategoryTable