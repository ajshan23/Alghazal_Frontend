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
    adcb_card: {
        label: 'ADCB CARD',
        dotClass: 'bg-blue-500',
        textClass: 'text-blue-500',
    },
    adcb_bank: {
        label: 'ADCB BANK',
        dotClass: 'bg-blue-600',
        textClass: 'text-blue-600',
    },
    mashreq_bank: {
        label: 'MASHREQ BANK',
        dotClass: 'bg-orange-600',
        textClass: 'text-orange-600',
    },
    mashreq_card: {
        label: 'MASHREQ CARD',
        dotClass: 'bg-orange-500',
        textClass: 'text-orange-500',
    },
    adib: {
        label: 'ADIB',
        dotClass: 'bg-green-500',
        textClass: 'text-green-500',
    },
    owner_personal_pay: {
        label: 'OWNER PERSONAL PAY',
        dotClass: 'bg-teal-500',
        textClass: 'text-teal-500',
    },
    mr_syed_pay: {
        label: 'MR.SYED PAY',
        dotClass: 'bg-pink-500',
        textClass: 'text-pink-500',
    },
    other_pay: {
        label: 'OTHER PAY',
        dotClass: 'bg-yellow-600',
        textClass: 'text-yellow-600',
    },
    credit: {
        label: 'CREDIT',
        dotClass: 'bg-indigo-500',
        textClass: 'text-indigo-500',
    },
    cash: {
        label: 'CASH',
        dotClass: 'bg-purple-500',
        textClass: 'text-purple-500',
    },
    cheque: {
        label: 'CHEQUE',
        dotClass: 'bg-gray-600',
        textClass: 'text-gray-600',
    },
    wio_card: {
        label: 'WIO CARD',
        dotClass: 'bg-red-500',
        textClass: 'text-red-500',
    },
    wio_bank: {
        label: 'WIO BANK',
        dotClass: 'bg-red-600',
        textClass: 'text-red-600',
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
    
    // FIXED: Added month and year to filters state
    const [filters, setFilters] = useState({
        startDate: '',
        endDate: '',
        category: '',
        shop: '',
        vehicleNo: '',
        paymentMethod: '',
        month: new Date().getMonth() + 1, // Add month to filters
        year: new Date().getFullYear(),   // Add year to filters
    })
    
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)
    const [selectedBill, setSelectedBill] = useState<Bill | null>(null)
    const [isOpen, setIsOpen] = useState(false)

    const getBillTypeFromRoute = () => {
        if (pathname.includes('/fuel-bill-view')) return 'fuel'
        if (pathname.includes('/mess-bill-view')) return 'mess'
        if (pathname.includes('/vehicle-bill-view')) return 'vehicle'
        if (pathname.includes('/acc-bill-view')) return 'accommodation'
        if (pathname.includes('/commission-bill-view')) return 'commission'
        return 'general'
    }

    const billType = getBillTypeFromRoute()

    // FIXED: Updated handleApplyFilters to handle month/year properly
   const handleApplyFilters = (newFilters: any) => {
    console.log('New filters from drawer:', newFilters);
    
    // Start with current filters to preserve month/year
    const updatedFilters = { ...filters };
    
    // Update only the filters that were sent from the drawer
    if (newFilters.startDate !== undefined) {
        updatedFilters.startDate = newFilters.startDate;
    }
    if (newFilters.endDate !== undefined) {
        updatedFilters.endDate = newFilters.endDate;
    }
    if (newFilters.category !== undefined) {
        updatedFilters.category = newFilters.category;
    }
    if (newFilters.shop !== undefined) {
        updatedFilters.shop = newFilters.shop;
    }
    if (newFilters.vehicle !== undefined) {
        updatedFilters.vehicleNo = newFilters.vehicle; // Map vehicle to vehicleNo for state
    }
    if (newFilters.paymentMethod !== undefined) {
        updatedFilters.paymentMethod = newFilters.paymentMethod;
    }
    if (newFilters.employee !== undefined) {
        updatedFilters.employee = newFilters.employee;
    }

    // If date range is provided, clear month/year to avoid conflicts
    if (newFilters.startDate || newFilters.endDate) {
        updatedFilters.month = '';
        updatedFilters.year = '';
    }

    console.log('Updated filters state:', updatedFilters);
    
    setFilters(updatedFilters);
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to page 1
}


    // FIXED: Updated query function to use filters properly
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
            filters, // Use the complete filters object
            billType,
        ],
        queryFn: () =>
            getBills({
                page: pagination.page,
                limit: pagination.limit,
                billType: billType,
                search: searchTerm,
                // Only include month/year if no date range is provided
                month: filters.startDate || filters.endDate ? undefined : filters.month,
                year: filters.startDate || filters.endDate ? undefined : filters.year,
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
                    cell: (props) => {
                        const row = props.row.original;

                        // Check if there's a vehicles array and it has items
                        if (row.vehicles && Array.isArray(row.vehicles) && row.vehicles.length > 0) {
                            return (
                                <span>
                                    {row.vehicles
                                        .map((v) => v.vehicleNumber)
                                        .join(', ')}
                                </span>
                            );
                        }

                        // Check if there's a single vehicle object
                        if (row.vehicle && row.vehicle.vehicleNumber) {
                            return <span>{row.vehicle.vehicleNumber}</span>;
                        }

                        // No vehicle data found
                        return <span>N/A</span>;
                    },
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
                        <span>{props.row.original.purpose || 'N/A'}</span>
                    ),
                },
                {
                    header: 'Vehicle No',
                    accessorKey: 'vehicle',
                    cell: (props) => {
                        const row = props.row.original;

                        // Check if there's a vehicles array and it has items
                        if (row.vehicles && Array.isArray(row.vehicles) && row.vehicles.length > 0) {
                            return (
                                <span>
                                    {row.vehicles
                                        .map((v) => v.vehicleNumber)
                                        .join(', ')}
                                </span>
                            );
                        }

                        // Check if there's a single vehicle object
                        if (row.vehicle && row.vehicle.vehicleNumber) {
                            return <span>{row.vehicle.vehicleNumber}</span>;
                        }

                        // No vehicle data found
                        return <span>N/A</span>;
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

    // FIXED: Updated reset function
    const handleResetAll = () => {
        setFilters({
            startDate: '',
            endDate: '',
            category: '',
            shop: '',
            vehicleNo: '',
            paymentMethod: '',
            month: new Date().getMonth() + 1,
            year: new Date().getFullYear(),
        })
        setSearchTerm('')
        setPagination({ page: 1, limit: 10 })
        tableRef.current?.resetSorting?.()
    }

    // FIXED: Updated month/year change handlers
    const handleMonthChange = (selectedMonth: number) => {
        const selectedLabel = months.find((m) => m.value === selectedMonth)?.label || ''
        setFilters(prev => ({ ...prev, month: selectedMonth }))
        onDropdownSelect(selectedLabel)
        setPagination(prev => ({ ...prev, page: 1 }))
    }

    const handleYearChange = (selectedYear: number) => {
        setFilters(prev => ({ ...prev, year: selectedYear }))
        setPagination(prev => ({ ...prev, page: 1 }))
    }

    const handleExport = async () => {
        setIsExporting(true)
        try {
            const blob = await exportBillToExcel({
                page: pagination.page,
                limit: pagination.limit,
                search: searchTerm,
                billType,
                // Only include month/year if no date range is provided
                month: filters.startDate || filters.endDate ? undefined : filters.month,
                year: filters.startDate || filters.endDate ? undefined : filters.year,
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
            
            // Optional: Show success message
            console.log('Export completed successfully')
            
        } catch (error) {
            console.error('Error exporting bills:', error)
            // Show error message to user
            alert(`Export failed: ${error.message || 'Unknown error occurred'}`)
        } finally {
            setIsExporting(false)
        }
    }

    useEffect(() => {
        const selectedMonthName = months.find((m) => m.value === filters.month)?.label || ''
        onDropdownSelect(selectedMonthName)
    }, [filters.month, onDropdownSelect])

    if (error) {
        return <div>Error loading bills: {(error as Error).message}</div>
    }

    return (
        <>
            <div className="mb-4 flex flex-col md:flex-row gap-4 justify-between items-center">
                {billType !== 'commission' && (
                    <Input
                        placeholder="Search bills..."
                        onChange={handleSearchChange}
                        className="max-w-md w-full md:w-auto"
                    />
                )}
                <div className="flex gap-2 items-center">
                    <select
                        className="p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
                        value={filters.month}
                        onChange={(e) => handleMonthChange(Number(e.target.value))}
                    >
                        {months.map((m) => (
                            <option key={m.value} value={m.value}>
                                {m.label}
                            </option>
                        ))}
                    </select>
                    <select
                        className="p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
                        value={filters.year}
                        onChange={(e) => handleYearChange(Number(e.target.value))}
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
                        className={`p-2 ${isExporting
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
                currentFilters={filters}
            />
        </>
    )
}

export default BillTable