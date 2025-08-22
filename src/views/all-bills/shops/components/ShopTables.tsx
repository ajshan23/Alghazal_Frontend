import { useState, useMemo, useRef } from 'react'
import DataTable from '@/components/shared/DataTable'
import { HiOutlineEye, HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi'
import useThemeClass from '@/utils/hooks/useThemeClass'
import { useNavigate } from 'react-router-dom'
import type {
    DataTableResetHandle,
    ColumnDef,
} from '@/components/shared/DataTable'
import { useQuery } from '@tanstack/react-query'
import debounce from 'lodash/debounce'
import Input from '@/components/ui/Input'
import { fetchShops } from '../api/api'
import moment from 'moment'
import ShopDeleteConfirmation from './ShopDeleteConfirmation'

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

type ActionColumnProps = {
    row: User
    onDeleteClick: (id: string) => void
}

const ActionColumn = ({ row, onDeleteClick }: ActionColumnProps) => {
    const { textTheme } = useThemeClass()
    const navigate = useNavigate()

    return (
        <div className="flex justify-end text-lg">
                  <span
                className={`cursor-pointer p-2 hover:${textTheme}`}
                onClick={() => navigate(`/app/shop-details/${row._id}`)}
            >
                <HiOutlineEye />
            </span>
            
            <span
                className={`cursor-pointer p-2 hover:${textTheme}`}
                onClick={() => navigate(`/app/new-shop/${row._id}`)}
            >
                <HiOutlinePencil />
            </span>
            <span
                className="cursor-pointer p-2 hover:text-red-500"
                onClick={() => onDeleteClick(row._id)}
            >
                <HiOutlineTrash />
            </span>
        </div>
    )
}

const ShopTables = () => {
    const tableRef = useRef<DataTableResetHandle>(null)
    const [search, setSearch] = useState('')
    const [pagination, setPagination] = useState({ page: 1, limit: 10 })

    const [isDeleteOpen, setIsDeleteOpen] = useState(false)
    const [selectedShopId, setSelectedShopId] = useState<string | null>(null)

    const {
        data: response,
        isLoading,
        error,
        refetch,
    } = useQuery({
        queryKey: ['shops', pagination.page, pagination.limit, search],
        queryFn: () =>
            fetchShops({
                page: pagination.page,
                limit: pagination.limit,
                search,
            }),
    })

    const shops = response?.data?.shops || []
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
                setSearch(value)
                setPagination((prev) => ({ ...prev, page: 1 }))
            }, 500),
        [],
    )

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        debouncedSearch(e.target.value)
    }

    const handleDeleteClick = (shopId: string) => {
        setSelectedShopId(shopId)
        setIsDeleteOpen(true)
    }

    const columns: ColumnDef<User>[] = useMemo(
        () => [
            {
                header: 'Name',
                accessorKey: 'shopName',
                cell: (props) => <span>{props.row.original.shopName}</span>,
            },
            {
                header: 'Number',
                accessorKey: 'shopNo',
                cell: (props) => <span>{props.row.original.shopNo}</span>,
            },
            {
                header: 'Address',
                accessorKey: 'address',
                cell: (props) => <span>{props.row.original.address}</span>,
            },
            {
                header: 'VAT',
                accessorKey: 'vat',
                cell: (props) => <span>{props.row.original.vat}</span>,
            },
            {
                header: 'Owner',
                accessorKey: 'ownerName',
                cell: (props) => <span>{props.row.original.ownerName}</span>,
            },
            {
                header: 'Email',
                accessorKey: 'ownerEmail',
                cell: (props) => <span>{props.row.original.ownerEmail}</span>,
            },
            {
                header: 'Contact',
                accessorKey: 'contact',
                cell: (props) => <span>{props.row.original.contact}</span>,
            },
            {
                header: 'Date',
                accessorKey: 'createdAt',
                cell: (props) => (
                    <span>
                        {moment(props.row.original.createdAt).format(
                            'DD MMM YY',
                        )}
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

    return (
        <>
            <div className="mb-4">
                <Input
                    placeholder="Search shops..."
                    onChange={handleSearchChange}
                    className="max-w-md"
                />
            </div>

            <DataTable
                ref={tableRef}
                columns={columns}
                data={shops}
                skeletonAvatarColumns={[0, 3, 4]}
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

            <ShopDeleteConfirmation
                isOpen={isDeleteOpen}
                onClose={() => setIsDeleteOpen(false)}
                shopId={selectedShopId}
                refetch={refetch}
            />
        </>
    )
}

export default ShopTables
