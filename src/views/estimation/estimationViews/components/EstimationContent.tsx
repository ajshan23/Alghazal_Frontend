import { useEffect, useState } from 'react'
import Button from '@/components/ui/Button'
import Loading from '@/components/shared/Loading'
import Logo from '@/components/template/Logo'
import { useNavigate, useParams } from 'react-router-dom'
import isEmpty from 'lodash/isEmpty'
import { HiCalendar, HiPencil, HiDownload, HiDocumentReport, HiOfficeBuilding, HiClipboardList, HiCurrencyDollar, HiCheckCircle, HiTrendingUp, HiTrendingDown } from 'react-icons/hi'
import useThemeClass from '@/utils/hooks/useThemeClass'
import { useAppSelector } from '@/store'
import dayjs from 'dayjs'
import { downloadEstimationPdf, fetchEstimation } from '../../api/api'
import { APP_PREFIX_PATH } from '@/constants/route.constant'
import { Notification, toast, Badge, Card, Avatar } from '@/components/ui'
import { NumericFormat } from 'react-number-format'
import DirhamIcon from '@/assets/logo/Dirham-thumb.png'

type Estimation = {
    _id: string
    project: {
        _id: string
        projectName: string
        client: string
    }
    estimationNumber: string
    workStartDate: string
    workEndDate: string
    validUntil: string
    paymentDueBy: number
    materials: {
        description: string
        uom: string
        quantity: number
        unitPrice: number
        total: number
        _id: string
    }[]
    labour: {
        designation: string
        days: number
        price: number
        total: number
        _id: string
    }[]
    termsAndConditions: {
        description: string
        quantity: number
        unitPrice: number
        total: number
        _id: string
    }[]
    estimatedAmount: number
    quotationAmount: number
    commissionAmount: number
    preparedBy: {
        _id: string
        firstName: string
        lastName: string
    }
    client: {
        clientName: string
        clientAddress: string
        mobileNumber: string
        pincode: string
    }
    profit: number
    createdAt: string
    updatedAt: string
}

// Custom component to display currency with Dirham icon
const CurrencyDisplay = ({ value }: { value: number }) => (
    <span className="inline-flex items-center gap-1">
        <img src={DirhamIcon} alt="Dirham" className="w-3.5 h-3.5 inline-block" />
        <NumericFormat
            displayType="text"
            value={value}
            thousandSeparator={true}
            decimalScale={2}
            fixedDecimalScale
        />
    </span>
)

const EstimationContent = () => {
    const { textTheme } = useThemeClass()
    const { id } = useParams()
    const [loading, setLoading] = useState(true)
    const [data, setData] = useState<Estimation | null>(null)
    const mode = useAppSelector((state) => state.theme.mode)
    const [pdfLoading, setPdfLoading] = useState(false)
    const [error, setError] = useState('')
    const navigate = useNavigate()

    const handleEdit = () => {
        if (data) {
            navigate(`${APP_PREFIX_PATH}/estimation/edit/${data.project._id}/${id}`, { state: { estimationId: id } })
        }
    }

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (id) {
                    const response = await fetchEstimation(id)
                    setData(response.data)
                }
            } catch (error) {
                console.error('Error fetching estimation:', error)
                setError('Failed to load estimation data')
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [id])

    const formatDate = (dateString: string | undefined) => {
        return dateString ? dayjs(dateString).format('DD/MM/YYYY') : 'N/A'
    }

    // Calculate totals
    const totalMaterials = data?.materials.reduce((sum, item) => sum + item.total, 0) || 0
    const totalLabour = data?.labour.reduce((sum, item) => sum + item.total, 0) || 0
    const totalTerms = data?.termsAndConditions.reduce((sum, item) => sum + item.total, 0) || 0

    // Calculate profit/loss percentage
    const calculateProfitPercentage = () => {
        if (!data) return 0

        const estimatedAmount = data.estimatedAmount
        const quotationAmount = data.quotationAmount

        if (estimatedAmount === 0) return 0

        // Profit percentage = (Profit / Estimated Amount) * 100
        const percentage = (data.profit / quotationAmount) * 100
        return parseFloat(percentage.toFixed(2))
    }

    const profitPercentage = calculateProfitPercentage()
    const isProfit = data?.profit && data.profit > 0
    const isLoss = data?.profit && data.profit < 0
    const isBreakEven = data?.profit === 0

    const handleDownloadPdf = async () => {
        if (!data) return

        setPdfLoading(true)
        setError('')

        try {
            await downloadEstimationPdf(
                data._id,
                data.estimationNumber,
                data.project.projectName,
                data.client.clientAddress // or whatever field contains the location
            )
            toast.push(
                <Notification title="Success" type="success">
                    PDF downloaded successfully
                </Notification>
            )
        } catch (error) {
            setError('Failed to download PDF')
            toast.push(
                <Notification title="Error" type="danger">
                    {error.message || 'Failed to download PDF'}
                </Notification>
            )
        } finally {
            setPdfLoading(false)
        }
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-850 dark:to-gray-900">
                <div className="container mx-auto p-6">
                    <Card className="text-center p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">
                        <div className="text-red-500 mb-4">
                            <HiDocumentReport className="text-6xl mx-auto mb-4" />
                            <h3 className="text-xl font-bold mb-2">Error Loading Estimation</h3>
                            <p className="text-gray-600 dark:text-gray-400">{error}</p>
                        </div>
                        <Button
                            className="mt-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                            onClick={() => window.location.reload()}
                        >
                            Retry
                        </Button>
                    </Card>
                </div>
            </div>
        )
    }

    if (!data) {
        return <Loading loading={loading} />
    }

    const isValidUntil = dayjs().isBefore(dayjs(data.validUntil))

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-850 dark:to-gray-900">
            <Loading loading={loading}>
                <div className="container mx-auto p-6">
                    {/* Header Section */}
                    <div className="mb-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg">
                                <HiDocumentReport className="text-2xl text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Estimation Details</h1>
                                <p className="text-gray-500 dark:text-gray-400">View and manage estimation information</p>
                            </div>
                        </div>
                    </div>

                    {/* Main Content Grid */}
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8">
                        {/* Left Column - Client Info */}
                        <div className="xl:col-span-1">
                            <Card className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-750 p-6 border-b border-gray-200 dark:border-gray-700">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg">
                                            <HiOfficeBuilding className="text-2xl text-white" />
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-800 dark:text-white">Client Information</h3>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <div className="space-y-4">
                                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
                                            <div className="flex items-center gap-3">
                                                <div>
                                                    <p className="font-semibold text-gray-700 dark:text-gray-300">Client Name</p>
                                                    <p className="text-gray-600 dark:text-gray-400">{data.client.clientName}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
                                            <div className="flex items-center gap-3">
                                                <div>
                                                    <p className="font-semibold text-gray-700 dark:text-gray-300">Address</p>
                                                    <p className="text-gray-600 dark:text-gray-400">{data.client.clientAddress}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
                                            <div className="flex items-center gap-3">
                                                <div>
                                                    <p className="font-semibold text-gray-700 dark:text-gray-300">PIN Code</p>
                                                    <p className="text-gray-600 dark:text-gray-400">{data.client.pincode}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
                                            <div className="flex items-center gap-3">
                                                <div>
                                                    <p className="font-semibold text-gray-700 dark:text-gray-300">Phone</p>
                                                    <p className="text-gray-600 dark:text-gray-400">{data.client.mobileNumber}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </div>

                        {/* Right Column - Estimation Details */}
                        <div className="xl:col-span-2">
                            <Card className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                                <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-750 p-6 border-b border-gray-200 dark:border-gray-700">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg">
                                                <HiDocumentReport className="text-2xl text-white" />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                                                    Estimation #{data.estimationNumber}
                                                </h3>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">Estimation Details</p>
                                            </div>
                                        </div>
                                        <Badge
                                            content={isValidUntil ? 'Valid' : 'Expired'}
                                            className="px-3 py-1 text-xs font-bold"
                                            innerClass={`${isValidUntil ? 'bg-emerald-500' : 'bg-red-500'} text-white shadow-lg`}
                                        />
                                    </div>
                                </div>
                                <div className="p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Project Information */}
                                        <div className="space-y-4">
                                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 rounded-xl border border-green-200 dark:border-green-800">
                                                <div className="flex items-center gap-3">
                                                    <HiOfficeBuilding className="text-xl text-green-600 dark:text-green-400" />
                                                    <div>
                                                        <p className="font-semibold text-gray-700 dark:text-gray-300">Project</p>
                                                        <p className="text-gray-600 dark:text-gray-400">{data.project.projectName}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 rounded-xl border border-green-200 dark:border-green-800">
                                                <div className="flex items-center gap-3">
                                                    <HiCalendar className="text-xl text-green-600 dark:text-green-400" />
                                                    <div>
                                                        <p className="font-semibold text-gray-700 dark:text-gray-300">Estimation Date</p>
                                                        <p className="text-gray-600 dark:text-gray-400">
                                                            {formatDate(data.createdAt)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Date Information */}
                                        <div className="space-y-4">
                                            <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 p-4 rounded-xl border border-orange-200 dark:border-orange-800">
                                                <div className="flex items-center gap-3">
                                                    <HiCalendar className="text-xl text-orange-600 dark:text-orange-400" />
                                                    <div>
                                                        <p className="font-semibold text-gray-700 dark:text-gray-300">Work Start Date</p>
                                                        <p className="text-gray-600 dark:text-gray-400">
                                                            {formatDate(data.workStartDate)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 p-4 rounded-xl border border-orange-200 dark:border-orange-800">
                                                <div className="flex items-center gap-3">
                                                    <HiCalendar className="text-xl text-orange-600 dark:text-orange-400" />
                                                    <div>
                                                        <p className="font-semibold text-gray-700 dark:text-gray-300">Work End Date</p>
                                                        <p className="text-gray-600 dark:text-gray-400">
                                                            {formatDate(data.workEndDate)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Payment Due & Valid Until */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                                        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-4 rounded-xl border border-indigo-200 dark:border-indigo-800">
                                            <div className="flex items-center gap-3">
                                                <HiCalendar className="text-xl text-indigo-600 dark:text-indigo-400" />
                                                <div>
                                                    <p className="font-semibold text-gray-700 dark:text-gray-300">Valid Until</p>
                                                    <p className="text-gray-600 dark:text-gray-400">
                                                        {formatDate(data.validUntil)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-4 rounded-xl border border-indigo-200 dark:border-indigo-800">
                                            <div className="flex items-center gap-3">
                                                <HiCalendar className="text-xl text-indigo-600 dark:text-indigo-400" />
                                                <div>
                                                    <p className="font-semibold text-gray-700 dark:text-gray-300">Payment Due By</p>
                                                    <p className="text-gray-600 dark:text-gray-400">
                                                        {data.paymentDueBy} days
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </div>

                    {/* Materials Table */}
                    <div className="mb-8">
                        <Card className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                            <div className="bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-800 dark:to-gray-750 p-6 border-b border-gray-200 dark:border-gray-700">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-gradient-to-r from-gray-500 to-slate-600 rounded-lg">
                                        <HiClipboardList className="text-2xl text-white" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-800 dark:text-white">Materials</h3>
                                </div>
                            </div>
                            <div className="p-6">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-gray-50 dark:bg-gray-700">
                                            <th className="px-4 py-3 text-left">Description</th>
                                            <th className="px-4 py-3 text-left">UOM</th>
                                            <th className="px-4 py-3 text-right">Quantity</th>
                                            <th className="px-4 py-3 text-right">Unit Price</th>
                                            <th className="px-4 py-3 text-right">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.materials.map((item, index) => (
                                            <tr key={item._id} className={index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700'}>
                                                <td className="px-4 py-3">{item.description}</td>
                                                <td className="px-4 py-3">{item.uom}</td>
                                                <td className="px-4 py-3 text-right">{item.quantity}</td>
                                                <td className="px-4 py-3 text-right">
                                                    <CurrencyDisplay value={item.unitPrice} />
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <CurrencyDisplay value={item.total} />
                                                </td>
                                            </tr>
                                        ))}
                                        <tr className="font-semibold bg-gray-100 dark:bg-gray-600">
                                            <td colSpan={4} className="px-4 py-3 text-right">Total Materials</td>
                                            <td className="px-4 py-3 text-right">
                                                <CurrencyDisplay value={totalMaterials} />
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    </div>

                    {/* Labour Charges Table */}
                    <div className="mb-8">
                        <Card className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                            <div className="bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-800 dark:to-gray-750 p-6 border-b border-gray-200 dark:border-gray-700">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-gradient-to-r from-gray-500 to-slate-600 rounded-lg">
                                        <HiClipboardList className="text-2xl text-white" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-800 dark:text-white">Labour Charges</h3>
                                </div>
                            </div>
                            <div className="p-6">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-gray-50 dark:bg-gray-700">
                                            <th className="px-4 py-3 text-left">Designation</th>
                                            <th className="px-4 py-3 text-right">Days</th>
                                            <th className="px-4 py-3 text-right">Price</th>
                                            <th className="px-4 py-3 text-right">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.labour.map((item, index) => (
                                            <tr key={item._id} className={index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700'}>
                                                <td className="px-4 py-3">{item.designation}</td>
                                                <td className="px-4 py-3 text-right">{item.days}</td>
                                                <td className="px-4 py-3 text-right">
                                                    <CurrencyDisplay value={item.price} />
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <CurrencyDisplay value={item.total} />
                                                </td>
                                            </tr>
                                        ))}
                                        <tr className="font-semibold bg-gray-100 dark:bg-gray-600">
                                            <td colSpan={3} className="px-4 py-3 text-right">Total Labour</td>
                                            <td className="px-4 py-3 text-right">
                                                <CurrencyDisplay value={totalLabour} />
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    </div>

                    {/* Terms & Conditions (Miscellaneous) Table */}
                    <div className="mb-8">
                        <Card className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                            <div className="bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-800 dark:to-gray-750 p-6 border-b border-gray-200 dark:border-gray-700">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-gradient-to-r from-gray-500 to-slate-600 rounded-lg">
                                        <HiClipboardList className="text-2xl text-white" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-800 dark:text-white">Terms & Conditions (Miscellaneous)</h3>
                                </div>
                            </div>
                            <div className="p-6">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-gray-50 dark:bg-gray-700">
                                            <th className="px-4 py-3 text-left">Description</th>
                                            <th className="px-4 py-3 text-right">Qty</th>
                                            <th className="px-4 py-3 text-right">Unit Price</th>
                                            <th className="px-4 py-3 text-right">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.termsAndConditions.map((item, index) => (
                                            <tr key={item._id} className={index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700'}>
                                                <td className="px-4 py-3">{item.description}</td>
                                                <td className="px-4 py-3 text-right">{item.quantity}</td>
                                                <td className="px-4 py-3 text-right">
                                                    <CurrencyDisplay value={item.unitPrice} />
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <CurrencyDisplay value={item.total} />
                                                </td>
                                            </tr>
                                        ))}
                                        <tr className="font-semibold bg-gray-100 dark:bg-gray-600">
                                            <td colSpan={3} className="px-4 py-3 text-right">Total Miscellaneous</td>
                                            <td className="px-4 py-3 text-right">
                                                <CurrencyDisplay value={totalTerms} />
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    </div>

                    {/* Estimation Summary */}
                    <div className="mb-8">
                        <Card className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                            <div className="bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-800 dark:to-gray-750 p-6 border-b border-gray-200 dark:border-gray-700">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-gradient-to-r from-gray-500 to-slate-600 rounded-lg">
                                        <HiCurrencyDollar className="text-2xl text-white" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-800 dark:text-white">Estimation Summary</h3>
                                </div>
                            </div>
                            <div className="p-6">
                                <table className="w-full">
                                    <tbody>
                                        <tr className="bg-gray-50 dark:bg-gray-700">
                                            <td className="px-4 py-3 font-semibold">Estimated Amount</td>
                                            <td className="px-4 py-3 text-right">
                                                <CurrencyDisplay value={data.estimatedAmount} />
                                            </td>
                                        </tr>
                                        <tr className="bg-white dark:bg-gray-800">
                                            <td className="px-4 py-3 font-semibold">Quotation Amount</td>
                                            <td className="px-4 py-3 text-right">
                                                <CurrencyDisplay value={data.quotationAmount} />
                                            </td>
                                        </tr>
                                        <tr className="bg-gray-100 dark:bg-gray-600">
                                            <td className="px-4 py-3 font-semibold">Commission Amount</td>
                                            <td className="px-4 py-3 text-right">
                                                <CurrencyDisplay value={data.commissionAmount} />
                                            </td>
                                        </tr>
                                        <tr className="bg-gray-200 dark:bg-gray-500">
                                            <td className="px-4 py-3 font-semibold">Profit</td>
                                            <td className="px-4 py-3 text-right">
                                                <CurrencyDisplay value={data.profit} />
                                            </td>
                                        </tr>
                                        <tr className={`${isProfit ? 'bg-emerald-100 dark:bg-emerald-900/30' : isLoss ? 'bg-red-100 dark:bg-red-900/30' : 'bg-gray-300 dark:bg-gray-400'} font-bold`}>
                                            <td className="px-4 py-3 flex items-center gap-2">
                                                {isProfit && <HiTrendingUp className="text-emerald-600 dark:text-emerald-400" />}
                                                {isLoss && <HiTrendingDown className="text-red-600 dark:text-red-400" />}
                                                Profit/Loss Percentage
                                            </td>
                                            <td className={`px-4 py-3 text-right font-bold ${isProfit ? 'text-emerald-600 dark:text-emerald-400' : isLoss ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'}`}>
                                                {profitPercentage}%
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    </div>

                    {/* Footer Actions */}
                    <Card className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                        <div className="p-6">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-lg">
                                        <HiCalendar className="text-2xl text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Validity</p>
                                        <p className="font-semibold text-gray-700 dark:text-gray-300">
                                            Valid until {formatDate(data.validUntil)}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <Button
                                        variant="solid"
                                        loading={pdfLoading}
                                        onClick={handleDownloadPdf}
                                        icon={<HiDownload />}
                                        className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                                    >
                                        {pdfLoading ? 'Generating PDF...' : 'Download PDF'}
                                    </Button>
                                    <Button
                                        variant="solid"
                                        icon={<HiPencil />}
                                        onClick={handleEdit}
                                        className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                                    >
                                        Edit Estimation
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </Loading>
        </div>
    )
}

export default EstimationContent