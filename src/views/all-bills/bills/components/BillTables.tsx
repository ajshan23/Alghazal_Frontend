import { useState, useMemo, useRef, useEffect } from 'react'
import DataTable from '@/components/shared/DataTable'
import {
    HiOutlineDownload,
    HiOutlineEye,
    HiOutlinePencil,
    HiOutlineRefresh,
    HiOutlineTrash,
} from 'react-icons/hi'
import useThemeClass from '@/utils/hooks/useThemeClass'
import { useNavigate, useLocation } from 'react-router-dom'
import type {
    DataTableResetHandle,
    ColumnDef,
} from '@/components/shared/DataTable'
import { useQuery } from '@tanstack/react-query'
import debounce from 'lodash/debounce'
import Input from '@/components/ui/Input'
import Badge from '@/components/ui/Badge'
import { exportBillToExcel, getBills } from '../../api/api'
import moment from 'moment'
import BillDeleteConfirmation from './BillDeleteConfirmation'
import { FiFilter } from 'react-icons/fi'
import BillFilterDrawer from './BillFilterDrawer'
import dayjs from 'dayjs'
import { saveAs } from 'file-saver'

type Bill = {
    _id: string
    billType: 'general' | 'fuel' | 'mess' | 'vehicle' | 'accommodation'
    billDate: string
    paymentMethod: string
    amount: number
    kilometer?: number
    liter?: number
    category: {
        _id: string
        name: string
    }
    shop?: {
        _id: string
        shopName: string
        shopNo: string
    }
    vehicle?: {
        vehicleNumber: string
    }
    accommodation?: {
        location: string
    }
    invoiceNo?: string
    remarks: string
    attachments: string[]
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

const paymentMethodColor = {
    adcb: {
        label: 'ADCB',
        dotClass: 'bg-blue-500',
        textClass: 'text-blue-500',
    },
    adib: {
        label: 'ADIB',
        dotClass: 'bg-green-500',
        textClass: 'text-green-500',
    },
    cash: {
        label: 'Cash',
        dotClass: 'bg-purple-500',
        textClass: 'text-purple-500',
    },
    masherq_card: {
        label: 'MASHREQ CARD',
        dotClass: 'bg-orange-500',
        textClass: 'text-orange-500',
    },
}

type ActionColumnProps = {
    row: Bill
    onDeleteClick: (bill: Bill) => void
}

const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
]

const years = Array.from({ length: 10 }, (_, i) => ({
    value: dayjs().year() - 5 + i,
    label: (dayjs().year() - 5 + i).toString(),
}))

const BillTable = ({
    onDropdownSelect,
}: {
    onDropdownSelect: (value: string) => void
}) => {
    const location = useLocation()
    const pathname = location.pathname
    const [isExporting, setIsExporting] = useState(false)
    const tableRef = useRef<DataTableResetHandle>(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
    })
    const [filters, setFilters] = useState({
        startDate: '',
        endDate: '',
        category: '',
        shop: '',
        vehicleNo: '',
        paymentMethod: '',
    })
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)
    const [selectedBill, setSelectedBill] = useState<Bill | null>(null)
    const [isOpen, setIsOpen] = useState(false)
    const [month, setMonth] = useState(new Date().getMonth() + 1)
    const [year, setYear] = useState(new Date().getFullYear())

    const getBillTypeFromRoute = () => {
        if (pathname.includes('/fuel-bill-view')) return 'fuel'
        if (pathname.includes('/mess-bill-view')) return 'mess'
        if (pathname.includes('/vehicle-bill-view')) return 'vehicle'
        if (pathname.includes('/acc-bill-view')) return 'accommodation'
        if (pathname.includes('/commission-bill-view')) return 'commission'
        return 'general'
    }

    const billType = getBillTypeFromRoute()

    const handleApplyFilters = (data: typeof filters) => {
        setFilters(data)
    }

    const {
        data: response,
        isLoading,
        error,
        refetch,
    } = useQuery({
        queryKey: [
            'bills',
            pagination.page,
            pagination.limit,
            searchTerm,
            filters,
            billType,
            month,
            year,
        ],
        queryFn: () =>
            getBills({
                page: pagination.page,
                limit: pagination.limit,
                billType: billType,
                search: searchTerm,
                month,
                year,
                startDate: filters.startDate,
                endDate: filters.endDate,
                category: filters.category,
                shop: filters.shop,
                vehicle: filters.vehicleNo,
                paymentMethod: filters.paymentMethod,
            }),
    })

    const bills = response?.data?.bills || []
    const totalAmount = response?.data?.totalAmount || 0
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

    const ActionColumn = ({ row, onDeleteClick }: ActionColumnProps) => {
        const { textTheme } = useThemeClass()
        const navigate = useNavigate()

        const editPaths = {
            general: '/app/new-gen-bill',
            mess: '/app/new-mess-bill',
            fuel: '/app/new-fuel-bill',
            vehicle: '/app/new-vehicle-bill',
            accommodation: '/app/new-acc-bill',
            commission: '/app/new-commission-bill',
        }

        return (
            <div className="flex text-lg">
                <span
                    className={`cursor-pointer p-2 hover:${textTheme}`}
                    onClick={() =>
                        navigate(`/app/bill-attachments`, {
                            state: { data: row?.attachments },
                        })
                    }
                >
                    <HiOutlineEye />
                </span>
                <span
                    className={`cursor-pointer p-2 hover:${textTheme}`}
                    onClick={() =>
                        navigate(`${editPaths[billType]}/${row._id}`)
                    }
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

    const getColumns = (): ColumnDef<Bill>[] => {
        const commonColumns = [
            {
                header: 'S.NO',
                accessorKey: '_id',
                cell: (props) => <span>{props.row.index + 1}</span>,
            },
            {
                header: 'DATE',
                accessorKey: 'billDate',
                cell: (props) => (
                    <span>
                        {moment(props.row.original.billDate).format(
                            'DD MMM YYYY',
                        )}
                    </span>
                ),
            },
            {
                header: 'Payment Method',
                accessorKey: 'paymentMethod',
                cell: (props) => {
                    const method = props.row.original.paymentMethod
                    const payment = paymentMethodColor[
                        method as keyof typeof paymentMethodColor
                    ] || {
                        label: method,
                        dotClass: 'bg-gray-500',
                        textClass: 'text-gray-500',
                    }
                    return (
                        <div className="flex items-center gap-2">
                            <Badge className={payment.dotClass} />
                            <span
                                className={`capitalize font-semibold ${payment.textClass}`}
                            >
                                {payment.label}
                            </span>
                        </div>
                    )
                },
            },
            {
                header: 'Amount',
                accessorKey: 'amount',
                cell: (props) => (
                    <span> {props.row.original.amount.toFixed(2)}</span>
                ),
            },
            {
                header: 'Action',
                id: 'action',
                cell: (props) => (
                    <ActionColumn
                        row={props.row.original}
                        onDeleteClick={(bill) => {
                            setSelectedBill(bill)
                            setIsDeleteOpen(true)
                        }}
                    />
                ),
            },
        ]

        if (billType === 'mess') {
            return [
                commonColumns[0], // S.NO
                commonColumns[1], // DATE
                {
                    header: 'Shop Name',
                    accessorKey: 'shop',
                    cell: (props) => (
                        <span>
                            {props.row.original.shop?.shopName || 'N/A'}
                        </span>
                    ),
                },
                {
                    header: 'Shop Number',
                    accessorKey: 'shopNo',
                    cell: (props) => (
                        <span>{props.row.original.shop?.shopNo || 'N/A'}</span>
                    ),
                },
                {
                    header: 'Invoice No',
                    accessorKey: 'invoiceNo',
                    cell: (props) => (
                        <span>{props.row.original.invoiceNo || 'N/A'}</span>
                    ),
                },
                commonColumns[2], // Payment Method
                commonColumns[3], // Amount
                commonColumns[4], // Action
            ]
        }

        if (billType === 'general') {
            return [
                commonColumns[0], // S.NO
                commonColumns[1], // DATE
                {
                    header: 'Category',
                    accessorKey: 'category',
                    cell: (props) => (
                        <span>
                            {props.row.original.category?.name || 'N/A'}
                        </span>
                    ),
                },
                {
                    header: 'Shop Name',
                    accessorKey: 'shop',
                    cell: (props) => (
                        <span>
                            {props.row.original.shop?.shopName || 'N/A'}
                        </span>
                    ),
                },
                {
                    header: 'Shop Number',
                    accessorKey: 'shopNo',
                    cell: (props) => (
                        <span>{props.row.original.shop?.shopNo || 'N/A'}</span>
                    ),
                },
                {
                    header: 'Invoice No',
                    accessorKey: 'invoiceNo',
                    cell: (props) => (
                        <span>{props.row.original.invoiceNo || 'N/A'}</span>
                    ),
                },
                commonColumns[2], // Payment Method
                commonColumns[3], // Amount
                {
                    header: 'REMARK',
                    accessorKey: 'remarks',
                    cell: (props) => (
                        <span>{props.row.original.remarks || 'N/A'}</span>
                    ),
                },
                commonColumns[4], // Action
            ]
        }

        if (billType === 'fuel') {
            return [
                commonColumns[0], // S.NO
                commonColumns[1], // DATE
                {
                    header: 'Description',
                    accessorKey: 'remarks',
                    cell: (props) => (
                        <span>{props.row.original.remarks || 'N/A'}</span>
                    ),
                },
                {
                    header: 'Vehicle No',
                    accessorKey: 'vehicle',
                    cell: (props) => (
                        <span>
                            {props.row.original.vehicle?.vehicleNumber || 'N/A'}
                        </span>
                    ),
                },
                commonColumns[2], // Payment Method
                commonColumns[3], // Amount
                {
                    header: 'Kilometer',
                    accessorKey: 'kilometer',
                    cell: (props) => (
                        <span>
                            {props.row.original.kilometer?.toFixed(2) || 'N/A'}
                        </span>
                    ),
                },
                {
                    header: 'Liter',
                    accessorKey: 'liter',
                    cell: (props) => (
                        <span>
                            {props.row.original.liter?.toFixed(2) || 'N/A'}
                        </span>
                    ),
                },
                {
                    header: 'Remarks',
                    accessorKey: 'remarks',
                    cell: (props) => (
                        <span>{props.row.original.remarks || 'N/A'}</span>
                    ),
                },
                commonColumns[4], // Action
            ]
        }

        if (billType === 'vehicle') {
            return [
                commonColumns[0], // S.NO
                commonColumns[1], // DATE
                {
                    header: 'Purpose Of Use',
                    accessorKey: 'remarks',
                    cell: (props) => (
                        <span>{props.row.original.remarks || 'N/A'}</span>
                    ),
                },
                {
                    header: 'Vehicle No',
                    accessorKey: 'vehicle',
                    cell: (props) => {
                        const vehicle = props.row.original.vehicle
                        if (Array.isArray(vehicle)) {
                            return (
                                <span>
                                    {vehicle
                                        .map((v) => v.vehicleNumber)
                                        .join(', ') || 'N/A'}
                                </span>
                            )
                        } else if (vehicle) {
                            return <span>{vehicle.vehicleNumber || 'N/A'}</span>
                        }
                        return <span>N/A</span>
                    },
                },
                {
                    header: 'Invoice No',
                    accessorKey: 'invoiceNo',
                    cell: (props) => (
                        <span>{props.row.original.invoiceNo || 'N/A'}</span>
                    ),
                },
                commonColumns[2], // Payment Method
                commonColumns[3], // Amount
                {
                    header: 'Shop Name',
                    accessorKey: 'shop',
                    cell: (props) => (
                        <span>
                            {props.row.original.shop?.shopName || 'N/A'}
                        </span>
                    ),
                },
                {
                    header: 'Remarks',
                    accessorKey: 'remarks',
                    cell: (props) => (
                        <span>{props.row.original.remarks || 'N/A'}</span>
                    ),
                },
                commonColumns[4], // Action
            ]
        }

        if (billType === 'accommodation') {
            return [
                commonColumns[0], // S.NO
                commonColumns[1], // DATE
                {
                    header: 'Company Name',
                    accessorKey: 'shop',
                    cell: (props) => (
                        <span>
                            {props.row.original.shop?.shopName || 'N/A'}
                        </span>
                    ),
                },
                {
                    header: 'Room No',
                    accessorKey: 'accommodation',
                    cell: (props) => (
                        <span>{props.row.original?.roomNo || 'N/A'}</span>
                    ),
                },
                {
                    header: 'Invoice No',
                    accessorKey: 'invoiceNo',
                    cell: (props) => (
                        <span>{props.row.original.invoiceNo || 'N/A'}</span>
                    ),
                },
                {
                    header: 'Payment Mode',
                    accessorKey: 'paymentMethod',
                    cell: (props) => {
                        const method = props.row.original.paymentMethod
                        const payment = paymentMethodColor[
                            method as keyof typeof paymentMethodColor
                        ] || {
                            label: method,
                            dotClass: 'bg-gray-500',
                            textClass: 'text-gray-500',
                        }
                        return (
                            <span
                                className={`capitalize font-semibold ${payment.textClass}`}
                            >
                                {payment.label}
                            </span>
                        )
                    },
                },
                commonColumns[3], // Amount
                {
                    header: 'Note',
                    accessorKey: 'remarks',
                    cell: (props) => (
                        <span>{props.row.original.remarks || 'N/A'}</span>
                    ),
                },
                {
                    header: 'Remarks',
                    accessorKey: 'remarks',
                    cell: (props) => (
                        <span>{props.row.original.remarks || 'N/A'}</span>
                    ),
                },
                commonColumns[4], // Action
            ]
        }

        if (billType === 'commission') {
            return [
                commonColumns[0], // S.NO
                commonColumns[1], // DATE
                commonColumns[3], // Amount
                commonColumns[4], // Action
            ]
        }

        return commonColumns
    }

    const columns = useMemo(() => getColumns(), [billType])

    const onPaginationChange = (page: number) => {
        setPagination((prev) => ({ ...prev, page }))
    }

    const onSelectChange = (limit: number) => {
        setPagination((prev) => ({ page: 1, limit }))
    }

    const openDrawer = () => {
        setIsOpen(true)
    }

    const onDrawerClose = (e: MouseEvent) => {
        console.log('onDrawerClose', e)
        setIsOpen(false)
    }

    const handleResetAll = () => {
        setFilters({
            startDate: '',
            endDate: '',
            category: '',
            shop: '',
            vehicleNo: '',
            paymentMethod: '',
        })
        setSearchTerm('')
        setMonth(new Date().getMonth() + 1)
        setYear(new Date().getFullYear())
        setPagination({ page: 1, limit: 10 })
        tableRef.current?.resetSorting?.()
    }

    const handleExport = async () => {
        setIsExporting(true)
        try {
            const blob = await exportBillToExcel({
                page: pagination.page,
                limit: pagination.limit,
                search: searchTerm,
                billType,
                month,
                year,
                startDate: filters.startDate,
                endDate: filters.endDate,
                category: filters.category,
                shop: filters.shop,
                vehicle: filters.vehicleNo,
                paymentMethod: filters.paymentMethod,
            })

            // Generate filename with current date and bill type
            const filename = `bills_${billType}_${dayjs().format(
                'YYYY-MM-DD',
            )}.xlsx`

            // Use file-saver to download the file
            saveAs(blob, filename)
        } catch (error) {
            console.error('Error exporting bills:', error)
            // You might want to show a toast notification here
        } finally {
            setIsExporting(false)
        }
    }

    useEffect(() => {
        const selectedMonthName =
            months.find((m) => m.value === month)?.label || ''
        onDropdownSelect(selectedMonthName)
    }, [month, onDropdownSelect])

    if (error) {
        return <div>Error loading bills: {(error as Error).message}</div>
    }

    return (
        <>
            <div className="mb-4 flex flex-col md:flex-row gap-4 justify-between items-center">
                <Input
                    placeholder="Search bills..."
                    onChange={handleSearchChange}
                    className="max-w-md w-full md:w-auto"
                />
                <div className="flex gap-2 items-center">
                    <select
                        className="p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
                        value={month}
                        onChange={(e) => {
                            const selectedValue = Number(e.target.value)
                            const selectedLabel =
                                months.find((m) => m.value === selectedValue)
                                    ?.label || ''
                            setMonth(selectedValue)
                            onDropdownSelect(selectedLabel)
                        }}
                    >
                        {months.map((m) => (
                            <option key={m.value} value={m.value}>
                                {m.label}
                            </option>
                        ))}
                    </select>
                    <select
                        className="p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
                        value={year}
                        onChange={(e) => setYear(Number(e.target.value))}
                    >
                        {years.map((y) => (
                            <option key={y.value} value={y.value}>
                                {y.label}
                            </option>
                        ))}
                    </select>

                    <button
                        onClick={handleResetAll}
                        className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                        title="Reset filters"
                    >
                        <HiOutlineRefresh size={18} />
                    </button>
                    <button
                        onClick={handleExport}
                        disabled={isExporting}
                        className={`p-2 ${
                            isExporting
                                ? 'text-gray-400'
                                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                        title={isExporting ? 'Exporting...' : 'Export bills'}
                    >
                        <HiOutlineDownload size={18} />
                    </button>
                    <button
                        onClick={() => openDrawer()}
                        className="px-4 py-2 flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                        <FiFilter size={16} />
                        Filter
                    </button>
                </div>
            </div>

            <DataTable
                ref={tableRef}
                columns={columns}
                data={bills}
                totalAmount={totalAmount}
                loading={isLoading}
                pagingData={{
                    total: paginationData.total,
                    pageIndex: paginationData.page,
                    pageSize: paginationData.limit,
                }}
                onPaginationChange={onPaginationChange}
                onSelectChange={onSelectChange}
            />

            <BillDeleteConfirmation
                isOpen={isDeleteOpen}
                onClose={() => setIsDeleteOpen(false)}
                bill={selectedBill}
                refetch={refetch}
            />
            <BillFilterDrawer
                isOpen={isOpen}
                billType={billType}
                onClose={onDrawerClose}
                onRequestClose={onDrawerClose}
                onApplyFilters={handleApplyFilters}
            />
        </>
    )
}

export default BillTable
