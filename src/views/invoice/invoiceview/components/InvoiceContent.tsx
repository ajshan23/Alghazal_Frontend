import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Button from '@/components/ui/Button';
import Loading from '@/components/shared/Loading';
import Logo from '@/components/template/Logo';
import { Notification, toast } from '@/components/ui';
import useThemeClass from '@/utils/hooks/useThemeClass';
import { useAppSelector } from '@/store';
import dayjs from 'dayjs';
import { fetchInvoiceData, downloadInvoicePdf } from '../../api/api';
import ContentTable from './ContentTable';
import GrnModal from './GrnModal';
                                    
type InvoiceData = {
    _id: string;
    invoiceNumber: string;
    date: string;
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
    const { projectId } = useParams();


    console.log(data);
    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            
            if (!projectId) {
                throw new Error('Project ID is required');
            }

            const response = await fetchInvoiceData(projectId);
            
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

    useEffect(() => {
        fetchData();
    }, [projectId]);

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
            link.setAttribute('download', `invoice_${data?.invoiceNumber || projectId}.pdf`);
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

    if (error) {
        return (
            <div className="p-4 text-center text-red-500">
                {error}
                <Button className="mt-4" onClick={fetchData}>
                    Retry
                </Button>
            </div>
        );
    }

    if (loading || !data) {
        return <Loading loading={true} />;
    }

    return (
        <div className="print:p-4">
            <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
                <div>
                    <Logo className="mb-3" mode={mode} />
                    <h2 className="text-2xl font-bold mb-4">TAX INVOICE</h2>
                </div>
                <div className="my-4">
                    <div className="mb-2">
                        <div className="flex justify-between">
                            <span>PO Box No: {data.vendor.poBox}</span>
                            <span>Date: {dayjs(data.date).format('DD/MM/YYYY')}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Dubai, UAE</span>
                            <span>INV #: {data.invoiceNumber}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Website: www.alghazalgroup.com</span>
                            <span>Order No: {data.orderNumber}</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="border-t border-b border-gray-200 dark:border-gray-600 py-4 my-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <h4 className="font-bold mb-2">Vendee</h4>
                        <p className="whitespace-pre-line">
                            {data.vendee.name}
                            <br />
                        
                            {data.vendee.address}
                            <br />
                            Phone: {data.vendee.phone}
                        </p>
                    </div>
                    <div>
                        <h4 className="font-bold mb-2">Vendor</h4>
                        <p className="whitespace-pre-line">
                            {data.vendor.name}
                            <br />
                            PB: {data.vendor.poBox} {data.vendor.address}
                            <br />
                            Phone: {data.vendor.phone}
                            <br />
                            TRN#: {data.vendor.trn}
                            <br />
                            GRN Number: {data.vendee.grnNumber}
                            <br />
                            LPO No.: {data.vendee.supplierNumber}
                            <br />
                            Service Period: {data.vendee.servicePeriod}
                        </p>
                    </div>
                </div>
            </div>
            
            {/* <div className="my-6">
                <h4 className="font-bold">Subject:</h4>
                <p>{data.subject}</p>
            </div> */}
            
            <div className="my-6">
                <ContentTable products={data.products} summary={data.summary} />
            </div>
            
            <div className="my-6">
                <h4 className="font-bold mb-2">Comments or special instructions</h4>
                <p>Payment: {data.paymentTerms}</p>
                <p>Amt in Words: {convertToWords(data.summary.totalReceivable)}</p>
            </div>
            
            <div className="mt-8">
                {/* <div className="flex justify-end">
                    <div className="text-center">
                        <p className="font-bold">Approved by:</p>
                        <p className="mt-8">Signature: ___________________</p>
                    </div>
                </div> */}
            </div>

            <div className="print:hidden mt-6 flex items-center justify-end gap-2">
                <Button 
                    variant="solid" 
                    onClick={openGrnModal}
                    className="mr-2"
                >
                    Add GRN number
                </Button>
                <Button 
                    variant="solid" 
                    loading={pdfLoading}
                    onClick={handleDownloadPdf}
                >
                    {pdfLoading ? 'Generating PDF...' : 'Download Invoice'}
                </Button>
            </div>
            <GrnModal
                isOpen={openModal}
                onClose={closeGrnModal}
                projectId={projectId}
                number={data.vendee.grnNumber}
                refetch={fetchData}
            />
        </div>
    );
};

export default InvoiceContent;