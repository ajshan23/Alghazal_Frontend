import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Notification, toast, Card, Badge, Avatar, Dialog } from '@/components/ui';
import {
  HiOutlineArrowLeft,
  HiOutlineTrash,
  HiOutlineDownload,
  HiOutlineDocumentDownload,
  HiCalendar,
  HiClock,
  HiUser,
  HiDocumentText,
  HiCurrencyDollar,
  HiOfficeBuilding,
  HiClipboardList,
  HiDocumentReport,
  HiOutlinePencil,
  HiExclamation
} from 'react-icons/hi';
import { fetchExpense, deleteExpense, downloadPdf } from '../api/api';
import Loading from '@/components/shared/Loading';
import useThemeClass from '@/utils/hooks/useThemeClass';
import dayjs from 'dayjs';
import { NumericFormat } from 'react-number-format';
import { DataTable,ColumnDef } from '@/components/shared';


interface MaterialInput {
  description: string;
  date?: Date | string;
  invoiceNo: string;
  amount: number;
  supplierName?: string;
  supplierMobile?: string;
  supplierEmail?: string;
  documentUrl?: string;
  documentKey?: string;
}

interface MiscellaneousInput {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  profileImage?: string;
}

interface Worker {
  user: User;
  daysPresent: number;
  dailySalary: number;
  totalSalary: number;
  _id: string;
}

interface Driver {
  user: User;
  daysPresent: number;
  dailySalary: number;
  totalSalary: number;
}

interface QuotationData {
  netAmount: number;
}

interface ExpenseDetails {
  _id: string;
  project: {
    _id: string;
    projectName: string;
    projectNumber: string;
  };
  materials: MaterialInput[];
  miscellaneous: MiscellaneousInput[];
  laborDetails: {
    workers: Worker[];
    driver: Driver | null;
    totalLaborCost: number;
  };
  totalMaterialCost: number;
  totalMiscellaneousCost: number;
  createdBy: User;
  createdAt: string;
  updatedAt: string;
  quotation: QuotationData | null;
  commissionAmount?: number;
}

const ExpenseView = () => {
  const { expenseId } = useParams();
  const navigate = useNavigate();
  const [expense, setExpense] = useState<ExpenseDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const { textTheme } = useThemeClass();

  useEffect(() => {
    const loadExpense = async () => {
      try {
        setLoading(true);
        const response = await fetchExpense(expenseId!);
        setExpense(response.data);
      } catch (error) {
        toast.push(
          <Notification title="Error" type="danger">
            Failed to load expense details
          </Notification>
        );
        console.error("Error loading expense:", error);
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };

    loadExpense();
  }, [expenseId, navigate]);

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await deleteExpense(expenseId!);
      toast.push(
        <Notification title="Success" type="success">
          Expense deleted successfully
        </Notification>
      );
      navigate(`/projects/${expense?.project._id}/expenses`);
    } catch (error) {
      toast.push(
        <Notification title="Error" type="danger">
          Failed to delete expense
        </Notification>
      );
      console.error("Error deleting expense:", error);
    } finally {
      setDeleting(false);
      setDeleteModalOpen(false);
    }
  };

  const handleDownloadPdf = async () => {
    try {
      setDownloading(true);
      const fileName = `expense-${expense?.project.projectNumber}-${expenseId}.pdf`;
      await downloadPdf(expenseId!, fileName);
      toast.push(
        <Notification title="Success" type="success">
          PDF downloaded successfully
        </Notification>
      );
    } catch (error) {
      toast.push(
        <Notification title="Error" type="danger">
          Failed to download PDF
        </Notification>
      );
      console.error("Error downloading PDF:", error);
    } finally {
      setDownloading(false);
    }
  };

  const formatDate = (dateString: string | Date | undefined | null) => {
    if (!dateString) return 'N/A';
    return dayjs(dateString).format('dddd, DD MMMM, YYYY');
  };

  // Material columns for DataTable
  const materialColumns: ColumnDef<MaterialInput>[] = [
    {
      header: 'Description',
      accessorKey: 'description',
      cell: (props) => {
        const row = props.row.original;
        const materialData = row._doc || row;
        return <span>{materialData?.description || 'N/A'}</span>;
      },
    },
    {
      header: 'Date',
      accessorKey: 'date',
      cell: (props) => {
        const row = props.row.original;
        const materialData = row._doc || row;
        return <span>{formatDate(materialData?.date)}</span>;
      },
    },
    {
      header: 'Invoice No',
      accessorKey: 'invoiceNo',
      cell: (props) => {
        const row = props.row.original;
        const materialData = row._doc || row;
        return <span>{materialData?.invoiceNo || 'N/A'}</span>;
      },
    },
    {
      header: 'Amount (AED)',
      accessorKey: 'amount',
      cell: (props) => {
        const row = props.row.original;
        const materialData = row._doc || row;
        return <span>{materialData?.amount?.toFixed(2) || '0.00'}</span>;
      },
    },
    {
      header: 'Supplier',
      accessorKey: 'supplierName',
      cell: (props) => {
        const row = props.row.original;
        const materialData = row._doc || row;
        return <span>{materialData?.supplierName || 'N/A'}</span>;
      },
    },
    {
      header: 'Document',
      accessorKey: 'documentUrl',
      cell: (props) => {
        const row = props.row.original;
        const materialData = row._doc || row;
        return materialData?.documentUrl ? (
          <a
            href={materialData.documentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            <HiOutlineDocumentDownload className="mr-1" />
            View
          </a>
        ) : (
          <span className="text-gray-400 dark:text-gray-500">No document</span>
        );
      },
    },
  ];

  // Miscellaneous columns for DataTable
  const miscellaneousColumns: ColumnDef<MiscellaneousInput>[] = [
    {
      header: 'Description',
      accessorKey: 'description',
    },
    {
      header: 'Quantity',
      accessorKey: 'quantity',
    },
    {
      header: 'Unit Price',
      accessorKey: 'unitPrice',
      cell: (props) => <span>{props.getValue().toFixed(2)} AED</span>,
    },
    {
      header: 'Total',
      accessorKey: 'total',
      cell: (props) => <span>{props.getValue().toFixed(2)} AED</span>,
    },
  ];

  // Worker columns for DataTable
  const workerColumns: ColumnDef<Worker>[] = [
    {
      header: 'Name',
      accessorKey: 'user',
      cell: (props) => {
        const worker = props.row.original;
        return (
          <div className="flex items-center">
            {worker.user.profileImage && (
              <img
                className="h-10 w-10 rounded-full mr-3"
                src={worker.user.profileImage}
                alt={`${worker.user.firstName} ${worker.user.lastName}`}
              />
            )}
            <div>
              <p className="text-gray-900 dark:text-gray-100">
                {worker.user.firstName} {worker.user.lastName}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      header: 'Days',
      accessorKey: 'daysPresent',
    },
    {
      header: 'Daily Salary',
      accessorKey: 'dailySalary',
      cell: (props) => <span>{props.getValue().toFixed(2)} AED</span>,
    },
    {
      header: 'Total',
      accessorKey: 'totalSalary',
      cell: (props) => <span>{props.getValue().toFixed(2)} AED</span>,
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-850 dark:to-gray-900">
        <div className="container mx-auto p-6">
          <Loading loading={loading} />
        </div>
      </div>
    );
  }

  if (!expense) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-850 dark:to-gray-900">
        <div className="container mx-auto p-6">
          <Card className="text-center p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">
            <div className="text-red-500 mb-4">
              <HiDocumentReport className="text-6xl mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Expense Not Found</h3>
              <p className="text-gray-600 dark:text-gray-400">The requested expense could not be found.</p>
            </div>
            <Button
              className="mt-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
              onClick={() => navigate(-1)}
            >
              Go Back
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  // Calculate totals
  const totalMaterialCost = expense.totalMaterialCost || 0;
  const totalMiscellaneousCost = expense.totalMiscellaneousCost || 0;
  const totalLaborCost = expense.laborDetails?.totalLaborCost || 0;
  const totalExpense = totalMaterialCost + totalMiscellaneousCost + totalLaborCost;
  const quotationAmount = expense.quotation?.netAmount || 0;
  const commissionAmount = expense.commissionAmount || 0;
  const profit = quotationAmount - totalExpense - commissionAmount;
  const profitPercentage = quotationAmount ? (profit / quotationAmount) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-850 dark:to-gray-900">
      <Loading loading={loading}>
        <div className="container mx-auto p-6">
          {/* Delete Confirmation Modal */}
          <Dialog
            isOpen={deleteModalOpen}
            onClose={() => setDeleteModalOpen(false)}
            onRequestClose={() => setDeleteModalOpen(false)}
            width={400}
          >
            <div className="flex flex-col items-center pb-4 pt-6">
              <div className="p-2 bg-red-100 rounded-full mb-4">
                <HiExclamation className="text-2xl text-red-600" />
              </div>
              <h5 className="mb-2 text-lg font-semibold text-gray-800 dark:text-gray-200">
                Confirm Deletion
              </h5>
              <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
                Are you sure you want to delete this expense? This action cannot be undone.
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

          {/* Header Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <Button
                  variant="plain"
                  onClick={() => navigate(-1)}
                  icon={<HiOutlineArrowLeft />}
                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Back
                </Button>
                <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg">
                  <HiDocumentReport className="text-2xl text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Expense Details</h1>
                  <p className="text-gray-500 dark:text-gray-400">View and manage expense information</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                
                <Button
                  variant="solid"
                  onClick={() => navigate(`/app/expense/edit/${expenseId}/${expense.project._id}`)}
                  icon={<HiOutlinePencil />}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  Edit Expense
                </Button>
                <Button
                  variant="solid"
                  loading={downloading}
                  onClick={handleDownloadPdf}
                  icon={<HiOutlineDownload />}
                  className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  {downloading ? 'Generating PDF...' : 'Download PDF'}
                </Button>
                <Button
                  variant="solid"
                  loading={deleting}
                  onClick={() => setDeleteModalOpen(true)}
                  icon={<HiOutlineTrash />}
                  className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  Delete Expense
                </Button>
              </div>
            </div>
          </div>

          {/* Project Info */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8">
            {/* Left Column - Project Info */}
            <div className="xl:col-span-1">
              <Card className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-750 p-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg">
                      <HiOfficeBuilding className="text-2xl text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white">Project Information</h3>
                  </div>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center gap-3">
                        <HiDocumentText className="text-xl text-blue-600 dark:text-blue-400" />
                        <div>
                          <p className="font-semibold text-gray-700 dark:text-gray-300">Project Name</p>
                          <p className="text-gray-600 dark:text-gray-400">{expense.project.projectName}</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center gap-3">
                        <HiDocumentText className="text-xl text-blue-600 dark:text-blue-400" />
                        <div>
                          <p className="font-semibold text-gray-700 dark:text-gray-300">Project Number</p>
                          <p className="text-gray-600 dark:text-gray-400">{expense.project.projectNumber}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Right Column - Expense Details */}
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
                          Expense Details
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Created by {expense.createdBy.firstName} {expense.createdBy.lastName}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Date Information */}
                    <div className="space-y-4">
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 rounded-xl border border-green-200 dark:border-green-800">
                        <div className="flex items-center gap-3">
                          <HiCalendar className="text-xl text-green-600 dark:text-green-400" />
                          <div>
                            <p className="font-semibold text-gray-700 dark:text-gray-300">Created On</p>
                            <p className="text-gray-600 dark:text-gray-400">
                              {formatDate(expense.createdAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Updated At & Created By */}
                    <div className="space-y-4">
                      <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 p-4 rounded-xl border border-orange-200 dark:border-orange-800">
                        <div className="flex items-center gap-3">
                          <HiClock className="text-xl text-orange-600 dark:text-orange-400" />
                          <div>
                            <p className="font-semibold text-gray-700 dark:text-gray-300">Last Updated</p>
                            <p className="text-gray-600 dark:text-gray-400">
                              {formatDate(expense.updatedAt)}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-4 rounded-xl border border-indigo-200 dark:border-indigo-800">
                        <div className="flex items-center gap-3">
                          <Avatar
                            size={40}
                            shape="circle"
                            className="border-2 border-white shadow-lg"
                            src={expense.createdBy.profileImage}
                          />
                          <div>
                            <p className="font-semibold text-gray-700 dark:text-gray-300">Created By</p>
                            <p className="text-gray-600 dark:text-gray-400">
                              {expense.createdBy.firstName} {expense.createdBy.lastName}
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

          {/* Material Expenses */}
          <div className="mb-8">
            <Card className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-800 dark:to-gray-750 p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-gray-500 to-slate-600 rounded-lg">
                    <HiClipboardList className="text-2xl text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white">Material Expenses</h3>
                </div>
              </div>
              <div className="p-6">
                {expense.materials?.length > 0 ? (
                  <>
                    <DataTable
                      columns={materialColumns}
                      data={expense.materials}
                      loading={loading}
                      pagingData={{
                        total: expense.materials.length,
                        pageIndex: 1,
                        pageSize: expense.materials.length
                      }}
                    />
                    <div className="mt-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-900 dark:text-gray-100 font-semibold">Total Material Cost:</span>
                        <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
                          {totalMaterialCost.toFixed(2)} AED
                        </span>
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">No material expenses recorded</p>
                )}
              </div>
            </Card>
          </div>

          {/* Miscellaneous Expenses */}
          <div className="mb-8">
            <Card className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-800 dark:to-gray-750 p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-gray-500 to-slate-600 rounded-lg">
                    <HiClipboardList className="text-2xl text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white">Miscellaneous Expenses</h3>
                </div>
              </div>
              <div className="p-6">
                {expense.miscellaneous?.length > 0 ? (
                  <>
                    <DataTable
                      columns={miscellaneousColumns}
                      data={expense.miscellaneous}
                      loading={loading}
                      pagingData={{
                        total: expense.miscellaneous.length,
                        pageIndex: 1,
                        pageSize: expense.miscellaneous.length
                      }}
                    />
                    <div className="mt-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-900 dark:text-gray-100 font-semibold">Total Miscellaneous Cost:</span>
                        <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
                          {totalMiscellaneousCost.toFixed(2)} AED
                        </span>
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">No miscellaneous expenses recorded</p>
                )}
              </div>
            </Card>
          </div>

          {/* Labor Details */}
          <div className="mb-8">
            <Card className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-800 dark:to-gray-750 p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-gray-500 to-slate-600 rounded-lg">
                    <HiUser className="text-2xl text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white">Labor Details</h3>
                </div>
              </div>
              <div className="p-6">
                {/* Workers */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-3 text-gray-900 dark:text-gray-100">Workers</h3>
                  {expense.laborDetails.workers?.length > 0 ? (
                    <DataTable
                      columns={workerColumns}
                      data={expense.laborDetails.workers}
                      loading={loading}
                      pagingData={{
                        total: expense.laborDetails.workers.length,
                        pageIndex: 1,
                        pageSize: expense.laborDetails.workers.length
                      }}
                    />
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400">No workers assigned</p>
                  )}
                </div>

                {/* Driver */}
                <div>
                  <h3 className="text-lg font-medium mb-3 text-gray-900 dark:text-gray-100">Driver</h3>
                  {expense.laborDetails.driver ? (
                    <DataTable
                      columns={workerColumns}
                      data={[expense.laborDetails.driver]}
                      loading={loading}
                      pagingData={{
                        total: 1,
                        pageIndex: 1,
                        pageSize: 1
                      }}
                    />
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400">No driver assigned</p>
                  )}
                </div>

                {/* Labor Summary */}
                <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-900 dark:text-gray-100 font-semibold">Total Labor Cost:</span>
                    <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
                      {totalLaborCost.toFixed(2)} AED
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Financial Summary */}
          <div className="mb-8">
            <Card className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-800 dark:to-gray-750 p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-gray-500 to-slate-600 rounded-lg">
                    <HiCurrencyDollar className="text-2xl text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white">Financial Summary</h3>
                </div>
              </div>
              <div className="p-6">
                {/* Expense Breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
                    <p className="text-sm text-blue-600 dark:text-blue-400">Material Costs</p>
                    <p className="text-2xl font-bold text-blue-800 dark:text-blue-200">
                      {totalMaterialCost.toFixed(2)} AED
                    </p>
                  </div>
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-4 rounded-xl border border-purple-200 dark:border-purple-800">
                    <p className="text-sm text-purple-600 dark:text-purple-400">Miscellaneous Costs</p>
                    <p className="text-2xl font-bold text-purple-800 dark:text-purple-200">
                      {totalMiscellaneousCost.toFixed(2)} AED
                    </p>
                  </div>
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 rounded-xl border border-green-200 dark:border-green-800">
                    <p className="text-sm text-green-600 dark:text-green-400">Labor Costs</p>
                    <p className="text-2xl font-bold text-green-800 dark:text-green-200">
                      {totalLaborCost.toFixed(2)} AED
                    </p>
                  </div>
                </div>

                {/* Totals and Profit */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-4 rounded-xl border border-indigo-200 dark:border-indigo-800">
                    <p className="text-sm text-indigo-600 dark:text-indigo-400">Total Expenses</p>
                    <p className="text-2xl font-bold text-indigo-800 dark:text-indigo-200">
                      {totalExpense.toFixed(2)} AED
                    </p>
                  </div>
                  {expense.quotation && (
                    <div className="bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 p-4 rounded-xl border border-yellow-200 dark:border-yellow-800">
                      <p className="text-sm text-yellow-600 dark:text-yellow-400">Quotation Amount</p>
                      <p className="text-2xl font-bold text-yellow-800 dark:text-yellow-200">
                        {quotationAmount.toFixed(2)} AED
                      </p>
                    </div>
                  )}
                </div>

                {/* Commission and Profit */}
                {expense.quotation && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 p-4 rounded-xl border border-orange-200 dark:border-orange-800">
                      <p className="text-sm text-orange-600 dark:text-orange-400">Commission</p>
                      <p className="text-2xl font-bold text-orange-800 dark:text-orange-200">
                        {commissionAmount.toFixed(2)} AED
                      </p>
                    </div>
                    <div className={`p-4 rounded-xl border ${profit >= 0
                        ? 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800'
                        : 'bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border-red-200 dark:border-red-800'
                      }`}>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {profit >= 0 ? 'Net Profit' : 'Net Loss'} (After Commission)
                      </p>
                      <p className={`text-2xl font-bold ${profit >= 0
                          ? 'text-green-800 dark:text-green-200'
                          : 'text-red-800 dark:text-red-200'
                        }`}>
                        {Math.abs(profit).toFixed(2)} AED ({profitPercentage.toFixed(2)}%)
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </Loading>
    </div>
  );
};

export default ExpenseView;