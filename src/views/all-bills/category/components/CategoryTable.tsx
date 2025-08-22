import { useState, useMemo, useRef } from 'react'
import Avatar from '@/components/ui/Avatar'
import DataTable from '@/components/shared/DataTable'
import { HiOutlineEye, HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi'
import { FiPackage } from 'react-icons/fi'
import useThemeClass from '@/utils/hooks/useThemeClass'
import { useNavigate } from 'react-router-dom'
import type {
    DataTableResetHandle,
    OnSortParam,
    ColumnDef,
} from '@/components/shared/DataTable'
import { useQuery } from '@tanstack/react-query'
import debounce from 'lodash/debounce'
import Input from '@/components/ui/Input'
import { fetchCategories } from '../api/api'
import CategoryDeleteConfirm from './CategoryDeleteConfirm'

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
    const { textTheme } = useThemeClass()
    const navigate = useNavigate()

    return (
        <div className="flex  text-lg">
            <span
                className={`cursor-pointer p-2 hover:${textTheme}`}
                onClick={() => navigate(`/app/new-cat/${row._id}`)}
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

const CategoryColumn = ({ row }: { row: Category }) => {
    return (
        <div className="flex items-center">
            <Avatar
                icon={<FiPackage />}
                className="bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-100"
            />
            <span className="ml-2 rtl:mr-2 font-semibold">{row.name}</span>
        </div>
    )
}

const CategoryTable = () => {
    const tableRef = useRef<DataTableResetHandle>(null)
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
                header: 'Name',
                accessorKey: 'name',
                cell: (props) => <CategoryColumn row={props.row.original} />,
            },
            {
                header: 'Description',
                accessorKey: 'description',
                cell: (props) => (
                    <span className="truncate max-w-xs block">
                        {props.row.original.description || 'N/A'}
                    </span>
                ),
            },
            {
                header: 'Created At',
                accessorKey: 'createdAt',
                cell: (props) => (
                    <span>
                        {new Date(
                            props.row.original.createdAt,
                        ).toLocaleDateString()}
                    </span>
                ),
            },
            {
                header: 'Action',
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
        return <div>Error loading categories: {(error as Error).message}</div>
    }

    return (
        <>
            <div className="mb-4">
                <Input
                    placeholder="Search categories..."
                    onChange={handleSearchChange}
                    className="max-w-md"
                />
            </div>

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