import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  HiArrowLeft, 
  HiDocumentDownload, 
  HiPrinter, 
  HiTrash, 
  HiEye,
  HiDocumentText,
  HiDocumentReport,
  HiOfficeBuilding,
  HiClipboardList,
  HiCurrencyDollar,
  HiUser,
  HiCalendar,
  HiPencil
} from 'react-icons/hi';
import Button from '@/components/ui/Button';
import Loading from '@/components/shared/Loading';
import useThemeClass from '@/utils/hooks/useThemeClass';
import { Notification, toast, Badge, Card, Avatar, Dialog } from '@/components/ui';
import { fetchLPODetails, deleteLPO, downloadLpoPdf } from '../api/api';
import dayjs from 'dayjs';
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

interface ILPOItem {
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  _id: string;
}

interface ILPODocument {
  url: string;
  key: string;
  name: string;
  mimetype: string;
  size: number;
  _id: string;
}

interface ICreatedBy {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
}

interface ILPODetails {
  _id: string;
  project: string;
  lpoNumber: string;
  lpoDate: string;
  supplier: string;
  items: ILPOItem[];
  documents: ILPODocument[];
  totalAmount: number;
  createdBy: ICreatedBy;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

const LPODetailView = () => {
  const { textTheme } = useThemeClass();
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [lpo, setLpo] = useState<ILPODetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [role,setRole]=useState(null)
  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetchLPODetails(id!);
      setLpo(response.data);
    } catch (err: any) {
      console.error('Error fetching LPO details:', err);
      setError(err.message || 'Failed to load LPO details');
      toast.push(
        <Notification title="Error" type="danger">
          {err.message || 'Failed to load LPO details'}
        </Notification>
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!id) {
      navigate('/app/procurement');
      return;
    }
    fetchData();
    const user=JSON.parse(localStorage.getItem("user"));
    setRole(user.role)

  }, [id]);

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await deleteLPO(id!);
      toast.push(
        <Notification title="Success" type="success">
          LPO deleted successfully
        </Notification>
      );
      navigate('/app/procurement');
    } catch (err: any) {
      toast.push(
        <Notification title="Error" type="danger">
          {err.message || 'Failed to delete LPO'}
        </Notification>
      );
    } finally {
      setDeleting(false);
      setDeleteModalOpen(false);
    }
  };

  const handleEdit = () => {
    navigate(`/app/lpo/edit/${lpo?._id}/${id}`);
  };

  const handleDownloadPdf = async () => {
    try {
      setDownloadingPdf(true);
      const fileName = `lpo-${lpo?.lpoNumber}.pdf`;
      await downloadLpoPdf(id!, fileName);
      toast.push(
        <Notification title="Success" type="success">
          LPO PDF downloaded successfully
        </Notification>
      );
    } catch (err: any) {
      toast.push(
        <Notification title="Error" type="danger">
          {err.message || 'Failed to download PDF'}
        </Notification>
      );
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handleDownloadDocument = (url: string, name: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-850 dark:to-gray-900">
        <div className="container mx-auto p-6">
          <Card className="text-center p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">
            <div className="text-red-500 mb-4">
              <HiDocumentReport className="text-6xl mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Error Loading LPO</h3>
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-850 dark:to-gray-900">
      {/* Delete Confirmation Modal */}
      <Dialog
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onRequestClose={() => setDeleteModalOpen(false)}
        width={400}
      >
        <div className="flex flex-col items-center pb-4 pt-6">
          <div className="p-2 bg-red-100 rounded-full mb-4">
            <HiTrash className="text-2xl text-red-600" />
          </div>
          <h5 className="mb-2 text-lg font-semibold text-gray-800 dark:text-gray-200">
            Confirm Deletion
          </h5>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
            Are you sure you want to delete this LPO? This action cannot be undone.
          </p>
          <div className="flex gap-2">
            <Button
              variant="plain"
              onClick={() => setDeleteModalOpen(false)}
              className="border border-gray-300 dark:border-gray-600"
            >
              Cancel
            </Button>
            <Button
              variant="solid"
              color="red"
              loading={deleting}
              onClick={handleDelete}
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </div>
      </Dialog>

      <Loading loading={loading}>
        {lpo && (
          <div className="container mx-auto p-6">
            {/* Header Section */}
            <div className="mb-8">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <Button
                    shape="circle"
                    variant="plain"
                    icon={<HiArrowLeft />}
                    onClick={handleGoBack}
                    className="bg-white dark:bg-gray-800 shadow-md rounded-xl p-3"
                  />
                  <div>
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Purchase Order Details</h1>
                    <p className="text-gray-500 dark:text-gray-400">View and manage LPO information</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                 {role!=="engineer" &&<Button
                    variant="solid"
                    onClick={handleEdit}
                    icon={<HiPencil />}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    Edit LPO
                  </Button>}
                  {/* <Button
                    variant="solid"
                    loading={downloadingPdf}
                    onClick={handleDownloadPdf}
                    icon={<HiDocumentDownload />}
                    className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    {downloadingPdf ? 'Generating PDF...' : 'Download PDF'}
                  </Button> */}
                  {/* <Button
                    variant="solid"
                    loading={deleting}
                    onClick={() => setDeleteModalOpen(true)}
                    icon={<HiTrash />}
                    className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    Delete LPO
                  </Button> */}
                </div>
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8">
              {/* Left Column - LPO Info */}
              <div className="xl:col-span-1">
                <Card className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-750 p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg">
                        <HiOfficeBuilding className="text-2xl text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-800 dark:text-white">LPO Information</h3>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
                        <div className="flex items-center gap-3">
                          <HiDocumentText className="text-xl text-blue-600 dark:text-blue-400" />
                          <div>
                            <p className="font-semibold text-gray-700 dark:text-gray-300">LPO Number</p>
                            <p className="text-gray-600 dark:text-gray-400">{lpo.lpoNumber}</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 rounded-xl border border-green-200 dark:border-green-800">
                        <div className="flex items-center gap-3">
                          <HiCalendar className="text-xl text-green-600 dark:text-green-400" />
                          <div>
                            <p className="font-semibold text-gray-700 dark:text-gray-300">LPO Date</p>
                            <p className="text-gray-600 dark:text-gray-400">
                              {dayjs(lpo.lpoDate).format('dddd, DD MMMM, YYYY')}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-4 rounded-xl border border-purple-200 dark:border-purple-800">
                        <div className="flex items-center gap-3">
                          <HiUser className="text-xl text-purple-600 dark:text-purple-400" />
                          <div>
                            <p className="font-semibold text-gray-700 dark:text-gray-300">Supplier</p>
                            <p className="text-gray-600 dark:text-gray-400">{lpo.supplier}</p>
                          </div>
                        </div>
                      </div>

                      {/* Total Amount Display */}
                      <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 p-4 rounded-xl border border-amber-200 dark:border-amber-800">
                        <div className="flex items-center gap-3">
                          <HiCurrencyDollar className="text-xl text-amber-600 dark:text-amber-400" />
                          <div>
                            <p className="font-semibold text-gray-700 dark:text-gray-300">Total Amount</p>
                            <p className="text-lg font-bold text-amber-600 dark:text-amber-400">
                              <CurrencyDisplay value={lpo.totalAmount} />
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Created By Section */}
                <Card className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden mt-8">
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-750 p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg">
                        <HiUser className="text-2xl text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-800 dark:text-white">Created By</h3>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <Avatar
                        size={50}
                        shape="circle"
                        className="border-2 border-white shadow-lg"
                      />
                      <div>
                        <p className="font-semibold text-gray-700 dark:text-gray-300">
                          {lpo.createdBy.firstName} {lpo.createdBy.lastName}
                        </p>
                        <p className="text-gray-600 dark:text-gray-400">{lpo.createdBy.email}</p>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-700 dark:to-gray-600 p-4 rounded-xl border border-gray-200 dark:border-gray-600">
                      <div className="flex items-center gap-3">
                        <HiCalendar className="text-xl text-gray-600 dark:text-gray-400" />
                        <div>
                          <p className="font-semibold text-gray-700 dark:text-gray-300">Created On</p>
                          <p className="text-gray-600 dark:text-gray-400">
                            {dayjs(lpo.createdAt).format('DD MMMM, YYYY h:mm A')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Right Column - Items & Documents */}
              <div className="xl:col-span-2">
                {/* Items Table */}
                <Card className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden mb-8">
                  <div className="bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-800 dark:to-gray-750 p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-r from-gray-500 to-slate-600 rounded-lg">
                        <HiClipboardList className="text-2xl text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-800 dark:text-white">Items</h3>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-gray-50 dark:bg-gray-700">
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Description
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Qty
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Unit Price
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Total
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                          {lpo.items.map((item, index) => (
                            <tr key={item._id} className={index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700'}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {item.description}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {item.quantity}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <CurrencyDisplay value={item.unitPrice} />
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <CurrencyDisplay value={item.totalPrice} />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="bg-gray-100 dark:bg-gray-600">
                          <tr>
                            <td colSpan={3} className="px-6 py-4 text-right font-semibold">
                              Total Amount:
                            </td>
                            <td className="px-6 py-4 font-bold">
                              <CurrencyDisplay value={lpo.totalAmount} />
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                </Card>

                {/* Documents Section */}
                <Card className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-gray-800 dark:to-gray-750 p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-r from-amber-500 to-orange-600 rounded-lg">
                        <HiDocumentText className="text-2xl text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-800 dark:text-white">Attached Documents</h3>
                    </div>
                  </div>
                  <div className="p-6">
                    {lpo.documents.length > 0 ? (
                      <div className="space-y-4">
                        {lpo.documents.map((doc) => (
                          <div
                            key={doc._id}
                            className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-700 dark:to-gray-600 rounded-xl border border-gray-200 dark:border-gray-600"
                          >
                            <div className="flex items-center space-x-4">
                              <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg">
                                <HiDocumentText className="text-xl text-white" />
                              </div>
                              <div>
                                <p className="font-semibold text-gray-700 dark:text-gray-300 truncate max-w-xs">
                                  {doc.name}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  {(doc.size / 1024).toFixed(2)} KB
                                </p>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                icon={<HiEye />}
                                onClick={() => window.open(doc.url, '_blank')}
                                className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white font-semibold px-3 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                              />
                              <Button
                                size="sm"
                                icon={<HiDocumentDownload />}
                                onClick={() => handleDownloadDocument(doc.url, doc.name)}
                                className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold px-3 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <HiDocumentText className="text-4xl text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500 dark:text-gray-400">No documents attached</p>
                      </div>
                    )}
                  </div>
                </Card>
              </div>
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
                      <p className="text-sm text-gray-500 dark:text-gray-400">Created</p>
                      <p className="font-semibold text-gray-700 dark:text-gray-300">
                        {dayjs(lpo.createdAt).format('DD MMMM, YYYY')}
                      </p>
                    </div>
                  </div>

                
                </div>
              </div>
            </Card>
          </div>
        )}
      </Loading>
    </div>
  );
};

export default LPODetailView;