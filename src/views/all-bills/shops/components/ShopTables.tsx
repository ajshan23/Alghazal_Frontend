import { useState, useMemo, useRef } from 'react'
import DataTable from '@/components/shared/DataTable'
import { HiOutlineEye, HiOutlinePencil, HiOutlineTrash, HiOutlineSearch, HiOutlinePlus } from 'react-icons/hi'
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
import { Button } from '@/components/ui'
import { FiStopCircle } from 'react-icons/fi'

type Shop = {
    _id: string
    shopName: string
    shopNo: string
    address: string
    vat: string
    ownerName: string
    ownerEmail: string
    contact: string
    createdAt: string
}

type ActionColumnProps = {
    row: Shop
    onDeleteClick: (id: string) => void
}

const ActionColumn = ({ row, onDeleteClick }: ActionColumnProps) => {
    const navigate = useNavigate()

    return (
        <div className="flex justify-end gap-2">
            <Button
                size="sm"
                variant="plain"
                icon={<HiOutlineEye />}
                onClick={() => navigate(`/app/shop-details/${row._id}`)}
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                tooltip="View Shop"
            />
            <Button
                size="sm"
                variant="plain"
                icon={<HiOutlinePencil />}
                onClick={() => navigate(`/app/new-shop/${row._id}`)}
                className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
                tooltip="Edit Shop"
            />
            <Button
                size="sm"
                variant="plain"
                icon={<HiOutlineTrash />}
                onClick={() => onDeleteClick(row._id)}
                className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                tooltip="Delete Shop"
            />
        </div>
    )
}

const ShopColumn = ({ row }: { row: Shop }) => {
    return (
        <div className="flex items-center">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg mr-3">
                <FiStopCircle className="text-white text-lg" />
            </div>
            <div>
                <div className="font-semibold text-gray-800 dark:text-white">
                    {row.shopName}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                    #{row.shopNo}
                </div>
            </div>
        </div>
    )
}

const ContactInfo = ({ contact, email }: { contact: string; email: string }) => {
    return (
        <div className="space-y-1">
            <div className="text-gray-700 dark:text-gray-300 font-medium">
                {contact}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
                {email}
            </div>
        </div>
    )
}

const AddressColumn = ({ address }: { address: string }) => {
    return (
        <div className="max-w-[200px]">
            <span className="text-gray-700 dark:text-gray-300 line-clamp-2">
                {address}
            </span>
        </div>
    )
}

const VATBadge = ({ vat }: { vat: string }) => {
    return (
        <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs font-medium border border-blue-200 dark:border-blue-800">
            VAT: {vat}
        </span>
    )
}

const ShopTables = () => {
    const tableRef = useRef<DataTableResetHandle>(null)
    const navigate = useNavigate()
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

    const columns: ColumnDef<Shop>[] = useMemo(
        () => [
            {
                header: 'Shop',
                accessorKey: 'shopName',
                cell: (props) => <ShopColumn row={props.row.original} />,
            },
            {
                header: 'Address',
                accessorKey: 'address',
                cell: (props) => <AddressColumn address={props.row.original.address} />,
            },
            {
                header: 'VAT',
                accessorKey: 'vat',
                cell: (props) => <VATBadge vat={props.row.original.vat} />,
            },
            {
                header: 'Owner',
                accessorKey: 'ownerName',
                cell: (props) => (
                    <span className="font-medium text-gray-800 dark:text-white">
                        {props.row.original.ownerName}
                    </span>
                ),
            },
            {
                header: 'Contact Info',
                accessorKey: 'contact',
                cell: (props) => (
                    <ContactInfo 
                        contact={props.row.original.contact} 
                        email={props.row.original.ownerEmail} 
                    />
                ),
            },
            {
                header: 'Created',
                accessorKey: 'createdAt',
                cell: (props) => (
                    <span className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                        {moment(props.row.original.createdAt).format('DD MMM YY')}
                    </span>
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
                    Error loading shops
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
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">Shops</h3>
                
                <div className="flex flex-col sm:flex-row gap-3">
                    <Input
                        placeholder="Search shops..."
                        onChange={handleSearchChange}
                        className="max-w-md"
                        prefix={<HiOutlineSearch className="text-lg text-gray-400" />}
                    />
                    
                    <Button
                        variant="solid"
                        icon={<HiOutlinePlus />}
                        className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
                        onClick={() => navigate('/app/new-shop')}
                    >
                        Add Shop
                    </Button>
                </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
                <DataTable
                    ref={tableRef}
                    columns={columns}
                    data={shops}
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