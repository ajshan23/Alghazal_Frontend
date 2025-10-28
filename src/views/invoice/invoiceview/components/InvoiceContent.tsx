import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Button from '@/components/ui/Button';
import Loading from '@/components/shared/Loading';
import Logo from '@/components/template/Logo';
import { Notification, toast, Badge, Card, Avatar, Dialog } from '@/components/ui';
import useThemeClass from '@/utils/hooks/useThemeClass';
import { useAppSelector } from '@/store';
import dayjs from 'dayjs';
import { fetchInvoiceData, downloadInvoicePdf, addGrnNumber, setWorkStartDate, setWorkEndDate, getWorkDuration } from '../../api/api';
import GrnModal from './GrnModal';
import WorkStartModal from './WorkStartModal';
import WorkEndModal from './WorkEndModal';
import {
    HiLocationMarker, 
    HiPencil, 
    HiPhone, 
    HiUser,
    HiDocumentText,
    HiCalendar,
    HiDownload,
    HiClock,
    HiDocumentReport,
    HiOfficeBuilding,
    HiClipboardList,
    HiCurrencyDollar,
    HiCheckCircle,
    HiTruck,
    HiReceiptRefund,
    HiCreditCard
} from 'react-icons/hi';
import { NumericFormat } from 'react-number-format';
import DirhamIcon from '@/assets/logo/Dirham-thumb.png';

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
);

// ContentTable component
const ContentTable = ({ 
    products, 
    summary 
}: { 
    products: Array<{
        sno: number;
        description: string;
        qty: number;
        unitPrice: number;
        total: number;
    }>;
    summary: {
        amount: number;
        vat: number;
        totalReceivable: number;
    };
}) => {
    return (
        <div className="overflow-x-auto">
            <table className="w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead>
                    <tr className="bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-800 dark:to-gray-750">
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider border-r border-gray-200 dark:border-gray-700 w-16">
                            S.No
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider border-r border-gray-200 dark:border-gray-700">
                            Description
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider border-r border-gray-200 dark:border-gray-700 w-20">
                            Qty
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider border-r border-gray-200 dark:border-gray-700 w-32">
                            <span className="inline-flex items-center gap-1 justify-end">
                                Unit Price <img src={DirhamIcon} alt="Dirham" className="w-3.5 h-3.5" />
                            </span>
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider w-32">
                            <span className="inline-flex items-center gap-1 justify-end">
                                Total <img src={DirhamIcon} alt="Dirham" className="w-3.5 h-3.5" />
                            </span>
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {products.map((product) => (
                        <tr key={product.sno} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                            <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 border-r border-gray-200 dark:border-gray-700">
                                {product.sno}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 border-r border-gray-200 dark:border-gray-700">
                                {product.description}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 border-r border-gray-200 dark:border-gray-700">
                                {product.qty}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 border-r border-gray-200 dark:border-gray-700 text-right">
                                <CurrencyDisplay value={product.unitPrice} />
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 text-right">
                                <CurrencyDisplay value={product.total} />
                            </td>
                        </tr>
                    ))}
                </tbody>
                <tfoot className="bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-800 dark:to-gray-750 border-t-2 border-gray-300 dark:border-gray-600">
                    <tr>
                        <td colSpan={3} className="px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300 text-right border-r border-gray-200 dark:border-gray-700">
                            Subtotal:
                        </td>
                        <td colSpan={2} className="px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300 text-right">
                            <CurrencyDisplay value={summary.amount} />
                        </td>
                    </tr>
                    <tr>
                        <td colSpan={3} className="px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300 text-right border-r border-gray-200 dark:border-gray-700">
                            VAT (5%):
                        </td>
                        <td colSpan={2} className="px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300 text-right">
                            <CurrencyDisplay value={summary.vat} />
                        </td>
                    </tr>
                    <tr className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                        <td colSpan={3} className="px-4 py-3 text-sm font-bold text-gray-800 dark:text-white text-right border-r border-gray-200 dark:border-gray-700">
                            Total Receivable:
                        </td>
                        <td colSpan={2} className="px-4 py-3 text-sm font-bold text-blue-600 dark:text-blue-400 text-right">
                            <CurrencyDisplay value={summary.totalReceivable} />
                        </td>
                    </tr>
                </tfoot>
            </table>
        </div>
    );
};
                                    
type InvoiceData = {
    _id: string;
    invoiceNumber: string;
    date: string;
    projectName: string;
    location: string;
    orderNumber: string;
    vendor: {
        name: string;
        poBox: string;
        address: string;
        phone: string;
        fax: string;
        trn: string;
    };
    vendee: {
        name: string;
        contactPerson: string;
        poBox: string;
        address: string;
        phone: string;
        fax: string;
        trn: string;
        grnNumber: string;
        supplierNumber: string;
        servicePeriod: string;
    };
    subject: string;
    paymentTerms: string;
    amountInWords: string;
    products: Array<{
        sno: number;
        description: string;
        qty: number;
        unitPrice: number;
        total: number;
    }>;
    summary: {
        amount: number;
        vat: number;
        totalReceivable: number;
    };
    preparedBy: {
        _id: string;
        firstName: string;
        lastName: string;
    };
};

const InvoiceContent = () => {
    const { textTheme } = useThemeClass();
    const mode = useAppSelector((state) => state.theme.mode);
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<InvoiceData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [pdfLoading, setPdfLoading] = useState(false);
    const [openModal, setOpenModal] = useState(false);
    const [workStartModalOpen, setWorkStartModalOpen] = useState(false);
    const [workEndModalOpen, setWorkEndModalOpen] = useState(false);
    const [workDuration, setWorkDuration] = useState<{
        workStartDate?: string;
        workEndDate?: string;
        durationInDays: number | null;
        isCompleted: boolean;
        isInProgress: boolean;
    } | null>(null);
    const { projectId } = useParams();

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            
            if (!projectId) {
                throw new Error('Project ID is required');
            }

            const response = await fetchInvoiceData(projectId);
            console.log('====================================');
            console.log(response);
            console.log('====================================');
            // Basic validation of required fields
            if (!response || 
                !response.invoiceNumber || 
                !response.vendor || 
                !response.vendee || 
                !Array.isArray(response.products)) {
                throw new Error('Invalid invoice data received from server');
            }

            setData(response);
        } catch (err) {
            console.error('Error fetching invoice data:', err);
            setError(err instanceof Error ? err.message : 'Failed to load invoice data');
        } finally {
            setLoading(false);
        }
    };

    const fetchWorkDuration = async () => {
        if (!projectId) return
        
        try {
            const response = await getWorkDuration(projectId);
            setWorkDuration(response.data);
        } catch (error) {
            console.error('Error fetching work duration:', error);
        }
    };

    useEffect(() => {
        fetchData();
    }, [projectId]);

    useEffect(() => {
        if (data) {
            fetchWorkDuration();
        }
    }, [data]);

    const handleDownloadPdf = async () => {
        if (!projectId) {
            toast.push(
                <Notification title="Error" type="danger">
                    Project ID is required
                </Notification>
            );
            return;
        }

        setPdfLoading(true);
        setError(null);
        
        try {
            const pdfBlob = await downloadInvoicePdf(projectId);
            
            const url = window.URL.createObjectURL(new Blob([pdfBlob]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${data.invoiceNumber} ${data.projectName} -${data.location}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
            window.URL.revokeObjectURL(url);

            toast.push(
                <Notification title="Success" type="success">
                    PDF downloaded successfully
                </Notification>
            );
        } catch (error) {
            console.error('PDF download error:', error);
            setError('Failed to download PDF');
            toast.push(
                <Notification title="Error" type="danger">
                    Failed to download PDF
                </Notification>
            );
        } finally {
            setPdfLoading(false);
        }
    };

    const openGrnModal = () => {
        setOpenModal(true);
    }
    
    const closeGrnModal = () => {
        setOpenModal(false);
    }

    const openWorkStartModal = () => {
        setWorkStartModalOpen(true);
    }

    const openWorkEndModal = () => {
        setWorkEndModalOpen(true);
    }

    const closeWorkStartModal = () => {
        setWorkStartModalOpen(false);
    }

    const closeWorkEndModal = () => {
        setWorkEndModalOpen(false);
    }

    const convertToWords = (num: number): string => {
        if (num === 0) return 'Zero AED only';
        
        const units = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
        const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
        const tens = ['', 'Ten', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
        const scales = ['', 'Thousand', 'Million', 'Billion', 'Trillion'];
      
        // Helper function to convert a chunk of 3 digits to words
        const convertChunk = (n: number): string => {
          if (n === 0) return '';
          let chunkWords = [];
          
          const hundred = Math.floor(n / 100);
          if (hundred > 0) {
            chunkWords.push(units[hundred] + ' Hundred');
          }
          
          const remainder = n % 100;
          if (remainder > 0) {
            if (remainder < 10) {
              chunkWords.push(units[remainder]);
            } else if (remainder < 20) {
              chunkWords.push(teens[remainder - 10]);
            } else {
              const ten = Math.floor(remainder / 10);
              const unit = remainder % 10;
              chunkWords.push(tens[ten]);
              if (unit > 0) {
                chunkWords.push(units[unit]);
              }
            }
          }
          
          return chunkWords.join(' ');
        };
      
        // Split number into chunks of 3 digits (from right to left)
        const numStr = Math.floor(num).toString();
        const chunks = [];
        for (let i = numStr.length; i > 0; i -= 3) {
          chunks.push(parseInt(numStr.substring(Math.max(0, i - 3), i), 10));
        }
      
        // Convert each chunk to words with appropriate scale
        let words = [];
        for (let i = 0; i < chunks.length; i++) {
          const chunkWords = convertChunk(chunks[i]);
          if (chunkWords) {
            words.unshift(chunkWords + (scales[i] ? ' ' + scales[i] : ''));
          }
        }
      
        // Handle decimal part (fils)
        const decimal = Math.round((num - Math.floor(num)) * 100);
        let decimalWords = '';
        if (decimal > 0) {
          decimalWords = ' and ' + convertChunk(decimal) + ' Fils';
        }
      
        // Combine everything
        const result = words.join(' ') + decimalWords + ' AED only';
        
        // Capitalize first letter and make the rest lowercase for consistent formatting
        return result.charAt(0).toUpperCase() + result.slice(1).toLowerCase();
    };

    // Check if both dates are provided to enable download button
    const isDownloadEnabled = workDuration?.workStartDate && workDuration?.workEndDate;

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-850 dark:to-gray-900">
                <div className="container mx-auto p-6">
                    <Card className="text-center p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">
                        <div className="text-red-500 mb-4">
                            <HiDocumentReport className="text-6xl mx-auto mb-4" />
                            <h3 className="text-xl font-bold mb-2">Error Loading Invoice</h3>
                            <p className="text-gray-600 dark:text-gray-400">{error}</p>
                        </div>
                        <Button 
                            className="mt-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700" 
                            onClick={fetchData}
                        >
                            Retry
                        </Button>
                    </Card>
                </div>
            </div>
        );
    }

    if (!data) {
        return <Loading loading={loading} />
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-850 dark:to-gray-900 print:bg-white">
            <Loading loading={loading}>
                <div className="container mx-auto p-6 print:p-0">
                    {/* Header Section */}
                    <div className="mb-8 print:mb-4">
                        <div className="flex items-center gap-3 mb-6 print:mb-4">
                            <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg print:bg-purple-500">
                                <HiReceiptRefund className="text-2xl text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-800 dark:text-white print:text-2xl">Invoice Details</h1>
                                <p className="text-gray-500 dark:text-gray-400 print:text-sm">View and manage invoice information</p>
                            </div>
                        </div>
                    </div>

                    {/* Main Content Grid */}
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8 print:grid-cols-3 print:gap-4 print:mb-4">
                        {/* Left Column - Company Info */}
                        <div className="xl:col-span-1">
                            <Card className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden print:rounded-none print:shadow-none print:border print:border-gray-300">
                                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-750 p-6 border-b border-gray-200 dark:border-gray-700 print:p-4 print:bg-blue-50">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg print:bg-blue-500">
                                            <HiOfficeBuilding className="text-2xl text-white" />
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-800 dark:text-white print:text-lg">Company Information</h3>
                                    </div>
                                </div>
                                <div className="p-6 print:p-4">
                                    <Logo className="mb-6 print:mb-4" mode={mode} />
                                    <div className="space-y-4 print:space-y-2">
                                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800 print:p-2 print:rounded-none print:border print:border-gray-300">
                                            <div className="flex items-center gap-3">
                                                <HiDocumentText className="text-xl text-blue-600 dark:text-blue-400" />
                                                <div>
                                                    <p className="font-semibold text-gray-700 dark:text-gray-300 print:text-sm">Invoice Number</p>
                                                    <p className="text-gray-600 dark:text-gray-400 print:text-sm">{data.invoiceNumber}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </div>

                        {/* Right Column - Invoice Details */}
                        <div className="xl:col-span-2">
                            <Card className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden print:rounded-none print:shadow-none print:border print:border-gray-300">
                                <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-750 p-6 border-b border-gray-200 dark:border-gray-700 print:p-4 print:bg-purple-50">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg print:bg-purple-500">
                                                <HiDocumentReport className="text-2xl text-white" />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-gray-800 dark:text-white print:text-lg">
                                                    Invoice {data.invoiceNumber}
                                                </h3>
                                                <p className="text-sm text-gray-500 dark:text-gray-400 print:text-xs">Invoice Details</p>
                                            </div>
                                        </div>
                                        <Badge 
                                            content="Active" 
                                            className="px-3 py-1 text-xs font-bold"
                                            innerClass="bg-emerald-500 text-white shadow-lg"
                                        />
                                    </div>
                                </div>
                                <div className="p-6 print:p-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:gap-4">
                                        {/* Date Information */}
                                        <div className="space-y-4 print:space-y-2">
                                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 rounded-xl border border-green-200 dark:border-green-800 print:p-2 print:rounded-none print:border print:border-gray-300">
                                                <div className="flex items-center gap-3">
                                                    <HiCalendar className="text-xl text-green-600 dark:text-green-400" />
                                                    <div>
                                                        <p className="font-semibold text-gray-700 dark:text-gray-300 print:text-sm">Date</p>
                                                        <p className="text-gray-600 dark:text-gray-400 print:text-sm">
                                                            {dayjs(data.date).format('dddd, DD MMMM, YYYY')}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 p-4 rounded-xl border border-orange-200 dark:border-orange-800 print:p-2 print:rounded-none print:border print:border-gray-300">
                                                <div className="flex items-center gap-3">
                                                    <HiTruck className="text-xl text-orange-600 dark:text-orange-400" />
                                                    <div>
                                                        <p className="font-semibold text-gray-700 dark:text-gray-300 print:text-sm">Order Number</p>
                                                        <p className="text-gray-600 dark:text-gray-400 print:text-sm">
                                                            {data.orderNumber}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Prepared By & Amount */}
                                        <div className="space-y-4 print:space-y-2">
                                            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-4 rounded-xl border border-indigo-200 dark:border-indigo-800 print:p-2 print:rounded-none print:border print:border-gray-300">
                                                <div className="flex items-center gap-3">
                                                    <Avatar
                                                        size={40}
                                                        shape="circle"
                                                        className="border-2 border-white shadow-lg print:border print:border-gray-300"
                                                    />
                                                    <div>
                                                        <p className="font-semibold text-gray-700 dark:text-gray-300 print:text-sm">Prepared By</p>
                                                        <p className="text-gray-600 dark:text-gray-400 print:text-sm">
                                                            {data.preparedBy.firstName} {data.preparedBy.lastName}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800 print:p-2 print:rounded-none print:border print:border-gray-300">
                                                <div className="flex items-center gap-3">
                                                    <HiCurrencyDollar className="text-xl text-blue-600 dark:text-blue-400" />
                                                    <div>
                                                        <p className="font-semibold text-gray-700 dark:text-gray-300 print:text-sm">Total Amount</p>
                                                        <p className="text-xl font-bold text-blue-600 dark:text-blue-400 print:text-lg">
                                                            <CurrencyDisplay value={data.summary.totalReceivable} />
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </div>

                    {/* Company Details Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8 print:grid-cols-2 print:gap-4 print:mb-4">
                        {/* Vendee Information */}
                        <Card className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden print:rounded-none print:shadow-none print:border print:border-gray-300">
                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-750 p-6 border-b border-gray-200 dark:border-gray-700 print:p-4 print:bg-green-50">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg print:bg-green-500">
                                        <HiUser className="text-2xl text-white" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-800 dark:text-white print:text-lg">Vendee Information</h3>
                                </div>
                            </div>
                            <div className="p-6 print:p-4">
                                <div className="space-y-3 print:space-y-2">
                                    <div>
                                        <p className="font-semibold text-gray-700 dark:text-gray-300 print:text-sm">Name</p>
                                        <p className="text-gray-600 dark:text-gray-400 print:text-sm">{data.vendee.name}</p>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-700 dark:text-gray-300 print:text-sm">Address</p>
                                        <p className="text-gray-600 dark:text-gray-400 print:text-sm">{data.vendee.address}</p>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-700 dark:text-gray-300 print:text-sm">PO Box</p>
                                        <p className="text-gray-600 dark:text-gray-400 print:text-sm">{data.vendee.poBox}</p>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-700 dark:text-gray-300 print:text-sm">Phone</p>
                                        <p className="text-gray-600 dark:text-gray-400 print:text-sm">{data.vendee.phone}</p>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-700 dark:text-gray-300 print:text-sm">TRN</p>
                                        <p className="text-gray-600 dark:text-gray-400 print:text-sm">{data.vendee.trn}</p>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Vendor Information */}
                        <Card className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden print:rounded-none print:shadow-none print:border print:border-gray-300">
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-750 p-6 border-b border-gray-200 dark:border-gray-700 print:p-4 print:bg-blue-50">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg print:bg-blue-500">
                                        <HiOfficeBuilding className="text-2xl text-white" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-800 dark:text-white print:text-lg">Vendor Information</h3>
                                </div>
                            </div>
                            <div className="p-6 print:p-4">
                                <div className="space-y-3 print:space-y-2">
                                    <div>
                                        <p className="font-semibold text-gray-700 dark:text-gray-300 print:text-sm">Name</p>
                                        <p className="text-gray-600 dark:text-gray-400 print:text-sm">{data.vendor.name}</p>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-700 dark:text-gray-300 print:text-sm">Address</p>
                                        <p className="text-gray-600 dark:text-gray-400 print:text-sm">{data.vendor.address}</p>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-700 dark:text-gray-300 print:text-sm">PO Box</p>
                                        <p className="text-gray-600 dark:text-gray-400 print:text-sm">{data.vendor.poBox}</p>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-700 dark:text-gray-300 print:text-sm">Phone</p>
                                        <p className="text-gray-600 dark:text-gray-400 print:text-sm">{data.vendor.phone}</p>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-700 dark:text-gray-300 print:text-sm">TRN</p>
                                        <p className="text-gray-600 dark:text-gray-400 print:text-sm">{data.vendor.trn}</p>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Content Table Section */}
                    <div className="mb-8 print:mb-4">
                        <Card className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden print:rounded-none print:shadow-none print:border print:border-gray-300">
                            <div className="bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-800 dark:to-gray-750 p-6 border-b border-gray-200 dark:border-gray-700 print:p-4 print:bg-gray-50">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-gradient-to-r from-gray-500 to-slate-600 rounded-lg print:bg-gray-500">
                                        <HiClipboardList className="text-2xl text-white" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-800 dark:text-white print:text-lg">Items & Pricing</h3>
                                </div>
                            </div>
                            <div className="p-6 print:p-4">
                                <ContentTable
                                    products={data.products}
                                    summary={data.summary}
                                />
                            </div>
                        </Card>
                    </div>

                    {/* Work Duration Information */}
                    <div className="grid grid-cols-1 gap-8 mb-8 print:mb-4">
                        <Card className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden print:rounded-none print:shadow-none print:border print:border-gray-300">
                            <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-750 p-6 border-b border-gray-200 dark:border-gray-700 print:p-4 print:bg-purple-50">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg print:bg-purple-500">
                                        <HiClock className="text-2xl text-white" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-800 dark:text-white print:text-lg">Work Duration</h3>
                                </div>
                            </div>
                            <div className="p-6 print:p-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:gap-4">
                                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800 print:p-2 print:rounded-none print:border print:border-gray-300">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                <HiCalendar className="text-xl text-blue-600 dark:text-blue-400" />
                                                <span className="font-semibold text-gray-700 dark:text-gray-300 print:text-sm">
                                                    Work Start Date
                                                </span>
                                            </div>
                                            <Button
                                                size="xs"
                                                variant="plain"
                                                onClick={openWorkStartModal}
                                                icon={<HiPencil className="text-sm" />}
                                                className="print:hidden"
                                            >
                                                Edit
                                            </Button>
                                        </div>
                                        <p className="text-gray-600 dark:text-gray-400 print:text-sm">
                                            {workDuration?.workStartDate 
                                                ? dayjs(workDuration.workStartDate).format('DD MMMM, YYYY')
                                                : 'Not set'
                                            }
                                        </p>
                                    </div>

                                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 rounded-xl border border-green-200 dark:border-green-800 print:p-2 print:rounded-none print:border print:border-gray-300">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                <HiCheckCircle className="text-xl text-green-600 dark:text-green-400" />
                                                <span className="font-semibold text-gray-700 dark:text-gray-300 print:text-sm">
                                                    Work End Date
                                                </span>
                                            </div>
                                            <Button
                                                size="xs"
                                                variant="plain"
                                                onClick={openWorkEndModal}
                                                icon={<HiPencil className="text-sm" />}
                                                className="print:hidden"
                                            >
                                                Edit
                                            </Button>
                                        </div>
                                        <p className="text-gray-600 dark:text-gray-400 print:text-sm">
                                            {workDuration?.workEndDate 
                                                ? dayjs(workDuration.workEndDate).format('DD MMMM, YYYY')
                                                : 'Not set'
                                            }
                                        </p>
                                    </div>
                                </div>

                                {workDuration?.durationInDays !== null && (
                                    <div className="mt-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 p-4 rounded-xl border border-amber-200 dark:border-amber-800 print:p-2 print:rounded-none print:border print:border-gray-300">
                                        <div className="flex items-center gap-2">
                                            <HiClock className="text-xl text-amber-600 dark:text-amber-400" />
                                            <span className="font-semibold text-gray-700 dark:text-gray-300 print:text-sm">
                                                Total Duration
                                            </span>
                                        </div>
                                        <p className="text-gray-600 dark:text-gray-400 print:text-sm">
                                            {workDuration?.durationInDays} days
                                            {/* {workDuration.isCompleted && ' (Completed)'}
                                            {workDuration.isInProgress && ' (In Progress)'} */}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </Card>
                    </div>

                    {/* Payment Information */}
                    <div className="grid grid-cols-1 gap-8 mb-8 print:mb-4">
                        <Card className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden print:rounded-none print:shadow-none print:border print:border-gray-300">
                            <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-gray-800 dark:to-gray-750 p-6 border-b border-gray-200 dark:border-gray-700 print:p-4 print:bg-amber-50">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-gradient-to-r from-amber-500 to-orange-600 rounded-lg print:bg-amber-500">
                                        <HiCreditCard className="text-2xl text-white" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-800 dark:text-white print:text-lg">Payment Information</h3>
                                </div>
                            </div>
                            <div className="p-6 print:p-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:gap-4">
                                    <div>
                                        <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2 print:text-sm">Payment Terms</h4>
                                        <p className="text-gray-600 dark:text-gray-400 print:text-sm">{data.paymentTerms}</p>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2 print:text-sm">Amount in Words</h4>
                                        <p className="text-gray-600 dark:text-gray-400 print:text-sm">{convertToWords(data.summary.totalReceivable)}</p>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Footer Actions */}
                    <Card className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden print:hidden">
                        <div className="p-6">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-lg">
                                        <HiCalendar className="text-2xl text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Invoice Date</p>
                                        <p className="font-semibold text-gray-700 dark:text-gray-300">
                                            {dayjs(data.date).format('DD MMMM, YYYY')}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex flex-col md:flex-row gap-3">
                                    <Button 
                                        variant="solid" 
                                        onClick={openGrnModal}
                                        icon={<HiDocumentText />}
                                        className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                                    >
                                        Add GRN Number
                                    </Button>
                                    <div className="flex flex-col items-center">
                                        <Button 
                                            variant="solid" 
                                            loading={pdfLoading}
                                            onClick={handleDownloadPdf}
                                            icon={<HiDownload />}
                                            disabled={!isDownloadEnabled}
                                            className={`bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 ${
                                                !isDownloadEnabled ? 'opacity-50 cursor-not-allowed' : ''
                                            }`}
                                        >
                                            {pdfLoading ? 'Generating PDF...' : 'Download Invoice'}
                                        </Button>
                                        {!isDownloadEnabled && (
                                            <div className="mt-2 text-sm text-red-500 text-center">
                                                Please set both work start and end dates to download the invoice
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </Loading>
            <GrnModal
                isOpen={openModal}
                onClose={closeGrnModal}
                projectId={projectId}
                number={data.vendee.grnNumber}
                refetch={fetchData}
            />
            <WorkStartModal
                isOpen={workStartModalOpen}
                onClose={closeWorkStartModal}
                projectId={projectId}
                startDate={workDuration?.workStartDate}
                refetch={fetchWorkDuration}
            />
            <WorkEndModal
                isOpen={workEndModalOpen}
                onClose={closeWorkEndModal}
                projectId={projectId}
                endDate={workDuration?.workEndDate}
                refetch={fetchWorkDuration}
            />
        </div>
    );
};

export default InvoiceContent;