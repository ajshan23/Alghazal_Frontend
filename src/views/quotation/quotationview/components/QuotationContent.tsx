import { useEffect, useState } from 'react';
import Button from '@/components/ui/Button';
import Loading from '@/components/shared/Loading';
import Logo from '@/components/template/Logo';
import {
    HiPencil,
    HiDocumentText,
    HiCalendar,
    HiDownload,
    HiClock,
    HiDocumentReport,
    HiOfficeBuilding,
    HiClipboardList,
    HiCurrencyDollar,
    HiCheckCircle,
    HiMail,
    HiPhotograph
} from 'react-icons/hi';
import useThemeClass from '@/utils/hooks/useThemeClass';
import { useAppSelector } from '@/store';
import dayjs from 'dayjs';
import { useNavigate, useParams } from 'react-router-dom';
import { 
    getQuotationByProject, 
    downloadQuotationPdf, 
    sendQuotationEmail,
    uploadQuotationImages,
    updateQuotationImage,
    replaceQuotationImage,
    type QuotationData,
    type QuotationImage
} from '../../api/api';
import { Notification, toast, Badge, Card, Avatar } from '@/components/ui';
import { NumericFormat } from 'react-number-format';
import ContentTable from './ContentTable';
import ImageUploadModal from './ImageUploadModal';
import ImageEditModal from './ImageEditModal';
import CcEmailModal from './CcEmailModal';
import { APP_PREFIX_PATH } from '@/constants/route.constant';

const QuotationContent = () => {
    const { textTheme } = useThemeClass();
    const { projectId } = useParams();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<QuotationData | null>(null);
    const [emailLoading, setEmailLoading] = useState(false);
    const mode = useAppSelector((state) => state.theme.mode);
    const [error, setError] = useState<string | null>(null);
    const [pdfLoading, setPdfLoading] = useState(false);
    const [uploadModalOpen, setUploadModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [ccModalOpen, setCcModalOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState<QuotationImage | null>(null);
    const navigate = useNavigate();
    const [role, setRole] = useState<string | null>(null);

    useEffect(() => {
        const fetchQuotationData = async () => {
            try {
                setLoading(true);
                if (!projectId) {
                    throw new Error('Project ID is missing');
                }

                const response = await getQuotationByProject(projectId);
                console.log("from res",response.data);
                
                setData(response.data);
            } catch (err) {
                console.error('Error fetching quotation:', err);
                setError('Failed to load quotation data');
            } finally {
                setLoading(false);
            }
        };

        fetchQuotationData();
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        setRole(user.role);
    }, [projectId]);

    const handleSendEmail = async (ccEmails: string[]) => {
        if (!data) return;
        
        setEmailLoading(true);
        setError('');
        
        try {
            await sendQuotationEmail(data._id, ccEmails);
            toast.push(
                <Notification title="Success" type="success">
                    Quotation email sent successfully 
                </Notification>
            );
            // Close the modal after successful send
            setCcModalOpen(false);
        } catch (error: any) {
            setError('Failed to send email');
            toast.push(
                <Notification title="Error" type="danger">
                    {error.response?.data?.message || error.message || 'Failed to send email'}
                </Notification>
            );
            // Keep modal open on error so user can retry
        } finally {
            setEmailLoading(false);
        }
    };

    const handleUploadImages = async (files: File[], titles: string[]) => {
        if (!data) return;
        
        try {
            setLoading(true);
            await uploadQuotationImages({
                quotationId: data._id,
                images: files,
                titles
            });

            const response = await getQuotationByProject(projectId!);
            setData(response.data);

            toast.push(
                <Notification title="Success" type="success">
                    Images uploaded successfully
                </Notification>
            );
        } catch (error: any) {
            console.error('Error uploading images:', error);
            toast.push(
                <Notification title="Error" type="danger">
                    {error.response?.data?.message || error.message || 'Failed to upload images'}
                </Notification>
            );
        } finally {
            setLoading(false);
        }
    };

    const handleEditImage = (image: QuotationImage) => {
        setSelectedImage(image);
        setEditModalOpen(true);
    };

    const handleUpdateImage = async (imageId: string, updateData: { title: string }) => {
        if (!data) return;
        
        try {
            setLoading(true);
            await updateQuotationImage(data._id, imageId, updateData);

            const response = await getQuotationByProject(projectId!);
            setData(response.data);

            toast.push(
                <Notification title="Success" type="success">
                    Image updated successfully
                </Notification>
            );
        } catch (error: any) {
            console.error('Error updating image:', error);
            toast.push(
                <Notification title="Error" type="danger">
                    {error.response?.data?.message || error.message || 'Failed to update image'}
                </Notification>
            );
        } finally {
            setLoading(false);
        }
    };

    const handleReplaceImage = async (imageId: string, file: File) => {
        if (!data) return;
        
        try {
            setLoading(true);
            await replaceQuotationImage(data._id, imageId, file);

            const response = await getQuotationByProject(projectId!);
            setData(response.data);

            toast.push(
                <Notification title="Success" type="success">
                    Image replaced successfully
                </Notification>
            );
        } catch (error: any) {
            console.error('Error replacing image:', error);
            toast.push(
                <Notification title="Error" type="danger">
                    {error.response?.data?.message || error.message || 'Failed to replace image'}
                </Notification>
            );
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadPdf = async () => {
        if (!data) return;

        setPdfLoading(true);
        setError('');

        try {
            await downloadQuotationPdf({
                id: data._id,
                quotationNumber: data.quotationNumber,
                projectName: data.project.projectName,
                location: data.project.location,
            });
            toast.push(
                <Notification title="Success" type="success">
                    PDF downloaded successfully
                </Notification>
            );
        } catch (error: any) {
            setError('Failed to download PDF');
            toast.push(
                <Notification title="Error" type="danger">
                    {error.message || 'Failed to download PDF'}
                </Notification>
            );
        } finally {
            setPdfLoading(false);
        }
    };

    const handleEdit = () => {
        if (!data || !projectId) return;
        
        navigate(`${APP_PREFIX_PATH}/quotation-edit/${projectId}/${data._id}`, {
            state: { estimationId: data.estimation }
        });
    };

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-850 dark:to-gray-900">
                <div className="container mx-auto p-6">
                    <Card className="text-center p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">
                        <div className="text-red-500 mb-4">
                            <HiDocumentReport className="text-6xl mx-auto mb-4" />
                            <h3 className="text-xl font-bold mb-2">Error Loading Quotation</h3>
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
        );
    }

    if (!data) {
        return <Loading loading={loading} />;
    }

    const isValidUntil = dayjs().isBefore(dayjs(data.validUntil));

    const products = data.items.map((item, index) => ({
        id: item._id || `item-${index}`,
        sno: index + 1,
        description: item.description,
        uom: item.uom,
        qty: item.quantity,
        unitPrice: item.unitPrice,
        total: item.totalPrice,
        details: {
            color: [],
            size: []
        }
    }));

    const paymentSummary = {
        subTotal: data.subtotal,
        vat: data.vatAmount,
        netAmount: data.netAmount
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-850 dark:to-gray-900">
            <Loading loading={loading}>
                <ImageUploadModal
                    isOpen={uploadModalOpen}
                    onClose={() => setUploadModalOpen(false)}
                    onUpload={handleUploadImages}
                    quotationId={data._id}
                />

                <ImageEditModal
                    isOpen={editModalOpen}
                    onClose={() => {
                        setEditModalOpen(false);
                        setSelectedImage(null);
                    }}
                    onUpdate={handleUpdateImage}
                    onReplace={handleReplaceImage}
                    image={selectedImage}
                />

                <CcEmailModal
                    isOpen={ccModalOpen}
                    onClose={() => setCcModalOpen(false)}
                    onSend={handleSendEmail}
                    loading={emailLoading}
                />

                <div className="container mx-auto p-6">
                    <div className="mb-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg">
                                <HiDocumentReport className="text-2xl text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Quotation Details</h1>
                                <p className="text-gray-500 dark:text-gray-400">View and manage quotation information</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8">
                        <div className="xl:col-span-1">
                            <Card className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-750 p-6 border-b border-gray-200 dark:border-gray-700">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg">
                                            <HiOfficeBuilding className="text-2xl text-white" />
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-800 dark:text-white">Company Information</h3>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <Logo className="mb-6" mode={mode} />
                                    <div className="space-y-4">
                                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
                                            <div className="flex items-center gap-3">
                                                <HiDocumentText className="text-xl text-blue-600 dark:text-blue-400" />
                                                <div>
                                                    <p className="font-semibold text-gray-700 dark:text-gray-300">Project</p>
                                                    <p className="text-gray-600 dark:text-gray-400">{data.project.projectName}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </div>

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
                                                    Quotation {data.quotationNumber}
                                                </h3>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">Quotation Details</p>
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
                                        <div className="space-y-4">
                                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 rounded-xl border border-green-200 dark:border-green-800">
                                                <div className="flex items-center gap-3">
                                                    <HiCalendar className="text-xl text-green-600 dark:text-green-400" />
                                                    <div>
                                                        <p className="font-semibold text-gray-700 dark:text-gray-300">Date</p>
                                                        <p className="text-gray-600 dark:text-gray-400">
                                                            {dayjs(data.date).format('dddd, DD MMMM, YYYY')}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 p-4 rounded-xl border border-orange-200 dark:border-orange-800">
                                                <div className="flex items-center gap-3">
                                                    <HiClock className="text-xl text-orange-600 dark:text-orange-400" />
                                                    <div>
                                                        <p className="font-semibold text-gray-700 dark:text-gray-300">Valid Until</p>
                                                        <p className="text-gray-600 dark:text-gray-400">
                                                            {dayjs(data.validUntil).format('dddd, DD MMMM, YYYY')}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-4 rounded-xl border border-indigo-200 dark:border-indigo-800">
                                                <div className="flex items-center gap-3">
                                                    <Avatar
                                                        size={40}
                                                        shape="circle"
                                                        className="border-2 border-white shadow-lg"
                                                    />
                                                    <div>
                                                        <p className="font-semibold text-gray-700 dark:text-gray-300">Prepared By</p>
                                                        <p className="text-gray-600 dark:text-gray-400">
                                                            {data.preparedBy.firstName} {data.preparedBy.lastName}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
                                                <div className="flex items-center gap-3">
                                                    <HiCurrencyDollar className="text-xl text-blue-600 dark:text-blue-400" />
                                                    <div>
                                                        <p className="font-semibold text-gray-700 dark:text-gray-300">Net Amount</p>
                                                        <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                                                            <NumericFormat
                                                                displayType="text"
                                                                value={data.netAmount}
                                                                prefix="AED "
                                                                thousandSeparator={true}
                                                                decimalScale={2}
                                                            />
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

                    {data.images && data.images.length > 0 && (
                        <Card className="mb-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-gray-800 dark:to-gray-750 p-6 border-b border-gray-200 dark:border-gray-700">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-lg">
                                            <HiPhotograph className="text-2xl text-white" />
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-800 dark:text-white">Quotation Images</h3>
                                    </div>
                                    <Button
                                        variant="solid"
                                        icon={<HiPhotograph />}
                                        onClick={() => setUploadModalOpen(true)}
                                        className="bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white font-semibold px-4 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                                    >
                                        Add Images
                                    </Button>
                                </div>
                            </div>
                            <div className="p-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {data.images.map((image, index) => (
                                        <div key={`image-${index}`} className="group bg-white dark:bg-gray-700 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-600 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                                            <div className="aspect-video overflow-hidden relative">
                                                <img
                                                    src={image.imageUrl}
                                                    alt={image.title}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                                />
                                                {role !== "engineer" && (
                                                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                        <Button
                                                            size="xs"
                                                            variant="solid"
                                                            icon={<HiPencil />}
                                                            onClick={() => handleEditImage(image)}
                                                            className="bg-blue-500 hover:bg-blue-600 text-white shadow-lg"
                                                        >
                                                            Edit
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="p-4">
                                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center">
                                                    {image.title}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </Card>
                    )}

                    <div className="mb-8">
                        <Card className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                            <div className="bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-800 dark:to-gray-750 p-6 border-b border-gray-200 dark:border-gray-700">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-gradient-to-r from-gray-500 to-slate-600 rounded-lg">
                                        <HiClipboardList className="text-2xl text-white" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-800 dark:text-white">Items & Pricing</h3>
                                </div>
                            </div>
                            <div className="p-6">
                                <ContentTable
                                    products={products}
                                    summary={paymentSummary}
                                    vatPercentage={data.vatPercentage}
                                />
                            </div>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                        {data.scopeOfWork && data.scopeOfWork.length > 0 && (
                            <Card className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                                <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-750 p-6 border-b border-gray-200 dark:border-gray-700">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg">
                                            <HiCheckCircle className="text-2xl text-white" />
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-800 dark:text-white">Scope of Work</h3>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <ul className="space-y-3">
                                        {data.scopeOfWork.map((item, index) => (
                                            <li key={`scope-${index}`} className="flex items-start gap-3">
                                                <div className="w-2 h-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full mt-2 flex-shrink-0" />
                                                <span className="text-gray-700 dark:text-gray-300">{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </Card>
                        )}

                        <Card className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                            <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-gray-800 dark:to-gray-750 p-6 border-b border-gray-200 dark:border-gray-700">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-gradient-to-r from-amber-500 to-orange-600 rounded-lg">
                                        <HiDocumentText className="text-2xl text-white" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-800 dark:text-white">Terms & Conditions</h3>
                                </div>
                            </div>
                            <div className="p-6">
                                <ol className="space-y-3">
                                    {data.termsAndConditions.map((term, index) => (
                                        <li key={`term-${index}`} className="flex items-start gap-3">
                                            <div className="flex items-center justify-center w-6 h-6 bg-gradient-to-r from-amber-500 to-orange-600 text-white text-xs font-bold rounded-full flex-shrink-0 mt-0.5">
                                                {index + 1}
                                            </div>
                                            <span className="text-gray-700 dark:text-gray-300">{term}</span>
                                        </li>
                                    ))}
                                </ol>
                            </div>
                        </Card>
                    </div>

                    {/* Validity Card */}
                    <Card className="mb-8 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-2xl shadow-xl border border-amber-200 dark:border-amber-800 overflow-hidden">
                        <div className="p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl shadow-lg">
                                        <HiClock className="text-2xl text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-1">Quotation Validity</h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            This quotation is {isValidUntil ? 'valid until' : 'expired since'} {dayjs(data.validUntil).format('DD MMMM, YYYY')}
                                        </p>
                                    </div>
                                </div>
                                <Badge
                                    content={isValidUntil ? 'Valid' : 'Expired'}
                                    className="px-4 py-2 text-sm font-bold"
                                    innerClass={`${isValidUntil ? 'bg-emerald-500' : 'bg-red-500'} text-white shadow-lg`}
                                />
                            </div>
                        </div>
                    </Card>

                    {/* Action Buttons Card */}
                    <Card className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                        <div className="p-8">
                            <div className="flex flex-col lg:flex-row justify-center items-center gap-4">
                                <div className="flex flex-wrap justify-center gap-3">
                                    <Button
                                        variant="solid"
                                        loading={pdfLoading}
                                        onClick={handleDownloadPdf}
                                        icon={<HiDownload />}
                                        className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 min-w-[160px]"
                                    >
                                        {pdfLoading ? 'Generating...' : 'Download PDF'}
                                    </Button>
                                    <Button
                                        variant="solid"
                                        onClick={() => setCcModalOpen(true)}
                                        icon={<HiMail />}
                                        className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 min-w-[160px]"
                                    >
                                        Send Email
                                    </Button>
                                    <Button
                                        variant="solid"
                                        icon={<HiPhotograph />}
                                        onClick={() => setUploadModalOpen(true)}
                                        className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 min-w-[160px]"
                                    >
                                        Add Images
                                    </Button>
                                    {role !== "engineer" && (
                                        <Button
                                            variant="solid"
                                            icon={<HiPencil />}
                                            onClick={handleEdit}
                                            className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 min-w-[160px]"
                                        >
                                            Edit Quotation
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </Loading>
        </div>
    );
};

export default QuotationContent;