import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  HiArrowLeft, 
  HiDocumentDownload, 
  HiPrinter, 
  HiTrash, 
  HiEye,
  HiDocumentText
} from 'react-icons/hi';
import Button from '@/components/ui/Button';
import Loading from '@/components/shared/Loading';
import useThemeClass from '@/utils/hooks/useThemeClass';
import { Notification, toast } from '@/components/ui';
import { fetchLPODetails, deleteLPO } from '../api/api';
import dayjs from 'dayjs';
import Badge from '@/components/ui/Badge';
// import { confirmDialog } from '@/components/ui/Dialog/Dialog';

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
  const { textTheme, bgTheme } = useThemeClass();
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [lpo, setLpo] = useState<ILPODetails | null>(null);
  const [error, setError] = useState<string | null>(null);

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
  }, [id]);

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleDelete = async () => {
    // confirmDialog({
    //   title: 'Confirm Deletion',
    //   content: 'Are you sure you want to delete this LPO? This action cannot be undone.',
    //   onConfirm: async () => {
    //     try {
    //       await deleteLPO(id!);
    //       toast.push(
    //         <Notification title="Success" type="success">
    //           LPO deleted successfully
    //         </Notification>
    //       );
    //       navigate('/app/procurement');
    //     } catch (err: any) {
    //       toast.push(
    //         <Notification title="Error" type="danger">
    //           {err.message || 'Failed to delete LPO'}
    //         </Notification>
    //       );
    //     }
    //   }
    // });
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
      <div className="p-4 text-center text-red-500">
        {error}
        <Button className="mt-4" onClick={fetchData}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <Loading loading={loading}>
      {lpo && (
        <div className="space-y-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-4">
              <Button
                shape="circle"
                variant="plain"
                icon={<HiArrowLeft />}
                onClick={handleGoBack}
              />
              <h3 className="text-xl font-bold">Purchase Order Details</h3>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="plain"
                color="red"
                icon={<HiTrash />}
                onClick={handleDelete}
              >
                Delete
              </Button>
              <Button
                variant="solid"
                icon={<HiPrinter />}
                onClick={() => window.print()}
              >
                Print
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              {/* LPO Header */}
              <div className="p-6 border rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className={`text-2xl font-bold ${textTheme}`}>
                      {lpo.lpoNumber}
                    </h2>
                    <p className="text-gray-500">
                      {dayjs(lpo.lpoDate).format('MMMM D, YYYY')}
                    </p>
                  </div>
                  <Badge className={`${bgTheme} text-white`}>
                    LPO
                  </Badge>
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold">Supplier</h4>
                    <p>{lpo.supplier}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold">Project ID</h4>
                    <p>{lpo.project}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold">Created By</h4>
                    <p>
                      {lpo.createdBy.firstName} {lpo.createdBy.lastName}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold">Created On</h4>
                    <p>{dayjs(lpo.createdAt).format('MMMM D, YYYY h:mm A')}</p>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="border rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
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
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200">
                      {lpo.items.map((item) => (
                        <tr key={item._id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {item.description}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {item.quantity}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {item.unitPrice.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {item.totalPrice.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <td
                          colSpan={3}
                          className="px-6 py-4 text-right font-semibold"
                        >
                          Total Amount:
                        </td>
                        <td className="px-6 py-4 font-bold">
                          {lpo.totalAmount.toLocaleString()}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>

            {/* Documents Section */}
            <div className="space-y-6">
              <div className="border rounded-lg p-6">
                <h4 className="font-semibold mb-4">Attached Documents</h4>
                {lpo.documents.length > 0 ? (
                  <div className="space-y-3">
                    {lpo.documents.map((doc) => (
                      <div
                        key={doc._id}
                        className="flex items-center justify-between p-3 border rounded hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <div className="flex items-center space-x-3">
                          <HiDocumentText className="text-xl" />
                          <span className="truncate max-w-xs">{doc.name.slice(0,4).toString()}</span>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            size="xs"
                            icon={<HiEye />}
                            onClick={() => window.open(doc.url, '_blank')}
                          />
                          <Button
                            size="xs"
                            icon={<HiDocumentDownload />}
                            onClick={() => handleDownloadDocument(doc.url, doc.name)}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No documents attached</p>
                )}
              </div>

              <div className="border rounded-lg p-6">
                <h4 className="font-semibold mb-4">Created By</h4>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p>
                      {lpo.createdBy.firstName} {lpo.createdBy.lastName}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p>{lpo.createdBy.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Created On</p>
                    <p>{dayjs(lpo.createdAt).format('MMMM D, YYYY h:mm A')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Loading>
  );
};

export default LPODetailView;