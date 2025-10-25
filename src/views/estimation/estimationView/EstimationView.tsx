import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import classNames from "classnames";
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer";
import Container from "@/components/shared/Container";
import Loading from "@/components/shared/Loading";
import DoubleSidedImage from "@/components/shared/DoubleSidedImage";
import Tag from "@/components/ui/Tag";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Avatar from "@/components/ui/Avatar";
import { 
  FaTools, 
  FaCalendarAlt, 
  FaUser, 
  FaFileAlt, 
  FaMoneyBillWave, 
  FaDownload, 
  FaTimes, 
  FaEdit,
  FaCheckCircle,
  FaClock,
  FaReceipt,
  FaUserTie,
  FaChartLine
} from "react-icons/fa";
import { 
  HiDocumentText,
  HiCalendar,
  HiUser,
  HiCurrencyDollar,
  HiCheckCircle,
  HiClock,
  HiDocumentReport,
  HiOfficeBuilding,
  HiClipboardList,
  HiSparkles,
  HiLocationMarker
} from "react-icons/hi";
import { MdOutlineDone } from "react-icons/md";
import { GrUserWorker } from "react-icons/gr";
import isEmpty from "lodash/isEmpty";
import dayjs from "dayjs";
import { fetchEstimation } from "../api/api"; // Import the service function
import { NumericFormat } from 'react-number-format';

interface Estimation {
  _id: string;
  clientName: string;
  clientAddress: string;
  workDescription: string;
  estimationNumber: string;
  materials: {
    _id: string;
    uom:string;
    subjectMaterial: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[];
  totalMaterials: number;
  labourCharges: {
    _id: string;
    designation: string;
    quantityDays: number;
    price: number;
    total: number;
  }[];
  totalLabour: number;
  termsAndConditions: {
    _id: string;
    miscellaneous: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[];
  totalMisc: number;
  estimatedAmount: number;
  quotationAmount: number;
  commissionAmount: number;
  profit: number;
  preparedByName: string;
  checkedByName: string;
  approvedByName: string;
  dateOfEstimation: string;
  workStartDate: string;
  workEndDate: string;
  validUntil: string;
  paymentDueBy: string;
  status: string;
}

// Register a custom font (optional)
Font.register({
  family: "Roboto",
  fonts: [
    {
      src: "https://fonts.gstatic.com/s/roboto/v27/KFOmCnqEu92Fr1Mu4mxP.ttf",
    },
    {
      src: "https://fonts.gstatic.com/s/roboto/v27/KFOlCnqEu92Fr1MmEU9fBBc9.ttf",
      fontWeight: "bold",
    },
  ],
});

// Define styles for the PDF
const styles = StyleSheet.create({
  page: {
    padding: 20,
    fontFamily: "Roboto",
    backgroundColor: "#ffffff",
  },
  header: {
    marginBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: "#0D47A1",
    borderBottomStyle: "solid",
    paddingBottom: 8,
    backgroundColor: "#F8F9FA",
    padding: 8,
    borderRadius: 3,
  },
  companyName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#800000",
    marginBottom: 3,
    textAlign: "center",
  },
  companyInfo: {
    fontSize: 7,
    color: "#666666",
    marginBottom: 3,
    textAlign: "center",
  },
  estimationTitle: {
    fontSize: 12,
    color: "#333333",
    marginBottom: 2,
    fontWeight: "bold",
  },
  estimationDate: {
    fontSize: 9,
    color: "#666666",
  },
  section: {
    marginBottom: 10,
    backgroundColor: "#FFFFFF",
    padding: 8,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderStyle: "solid",
  },
  sectionHeader: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#0D47A1",
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    borderBottomStyle: "solid",
    paddingBottom: 4,
  },
  row: {
    flexDirection: "row",
    marginBottom: 4,
    fontSize: 8,
    padding: 2,
    backgroundColor: "#F8F9FA",
    borderRadius: 2,
  },
  label: {
    width: "30%",
    color: "#666666",
    fontWeight: "bold",
  },
  value: {
    width: "70%",
    color: "#333333",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#0D47A1",
    color: "#FFFFFF",
    padding: 4,
    fontSize: 8,
    fontWeight: "bold",
  },
  tableRow: {
    flexDirection: "row",
    padding: 4,
    fontSize: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    borderBottomStyle: "solid",
  },
  tableCell: {
    flex: 1,
    padding: 2,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 4,
    fontSize: 9,
    fontWeight: "bold",
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
    borderTopStyle: "solid",
    marginTop: 4,
  },
  footer: {
    position: "absolute",
    bottom: 15,
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: 6,
    color: "#666666",
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
    borderTopStyle: "solid",
    paddingTop: 4,
  },
  statusBadge: {
    backgroundColor: "#E3F2FD",
    color: "#0D47A1",
    padding: 2,
    borderRadius: 2,
    fontSize: 8,
    marginLeft: 3,
    fontWeight: "bold",
  },
  twoColumnGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 5,
  },
  twoColumnItem: {
    width: "48%",
    marginBottom: 5,
  },
});

// PDF Document Component
const EstimationPDF = ({ data }: { data: Estimation }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.companyName}>Alghazal Company</Text>
        <Text style={styles.companyInfo}>Address: [Your Company Address Here] | Phone: [Your Phone Number] | Email: [Your Email]</Text>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Text style={styles.estimationTitle}>Estimation #{data.estimationNumber}</Text>
          <Text style={styles.estimationDate}>{dayjs(data.dateOfEstimation).format("MMM DD, YYYY")}</Text>
        </View>
      </View>

      {/* Client Information */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Client Information</Text>
        <View style={styles.twoColumnGrid}>
          <View style={styles.twoColumnItem}>
            <View style={styles.row}>
              <Text style={styles.label}>Client Name:</Text>
              <Text style={styles.value}>{data.clientName}</Text>
            </View>
          </View>
          <View style={styles.twoColumnItem}>
            <View style={styles.row}>
              <Text style={styles.label}>Estimation Date:</Text>
              <Text style={styles.value}>{dayjs(data.dateOfEstimation).format("MMM DD, YYYY")}</Text>
            </View>
          </View>
          <View style={{ width: "100%" }}>
            <View style={styles.row}>
              <Text style={styles.label}>Work Description:</Text>
              <Text style={styles.value}>{data.workDescription}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Dates Information */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Project Dates</Text>
        <View style={styles.twoColumnGrid}>
          <View style={styles.twoColumnItem}>
            <View style={styles.row}>
              <Text style={styles.label}>Work Start Date:</Text>
              <Text style={styles.value}>{dayjs(data.workStartDate).format("MMM DD, YYYY")}</Text>
            </View>
          </View>
          <View style={styles.twoColumnItem}>
            <View style={styles.row}>
              <Text style={styles.label}>Work End Date:</Text>
              <Text style={styles.value}>{dayjs(data.workEndDate).format("MMM DD, YYYY")}</Text>
            </View>
          </View>
          <View style={styles.twoColumnItem}>
            <View style={styles.row}>
              <Text style={styles.label}>Valid Until:</Text>
              <Text style={styles.value}>{dayjs(data.validUntil).format("MMM DD, YYYY")}</Text>
            </View>
          </View>
          <View style={styles.twoColumnItem}>
            <View style={styles.row}>
              <Text style={styles.label}>Payment Due By:</Text>
              <Text style={styles.value}>{dayjs(data.paymentDueBy).format("MMM DD, YYYY")}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Materials */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Materials</Text>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableCell, { flex: 3 }]}>Material</Text>
          <Text style={styles.tableCell}>Qty</Text>
          <Text style={styles.tableCell}>Unit Price</Text>
          <Text style={styles.tableCell}>Total</Text>
        </View>
        {data?.materials.map((material, index) => (
          <View key={index} style={styles.tableRow}>
            <Text style={[styles.tableCell, { flex: 3 }]}>{material?.subjectMaterial}</Text>
            <Text style={styles.tableCell}>{material.quantity}</Text>
            <Text style={styles.tableCell}>{material.unitPrice.toFixed(2)}</Text>
            <Text style={styles.tableCell}>{material.total.toFixed(2)}</Text>
          </View>
        ))}
        <View style={styles.summaryRow}>
          <Text>Total Materials:</Text>
          <Text>{data?.totalMaterials.toFixed(2)}</Text>
        </View>
      </View>

      {/* Labour Charges */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Labour Charges</Text>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableCell, { flex: 3 }]}>Designation</Text>
          <Text style={styles.tableCell}>Days</Text>
          <Text style={styles.tableCell}>Rate</Text>
          <Text style={styles.tableCell}>Total</Text>
        </View>
        {data?.labourCharges.map((labour, index) => (
          <View key={index} style={styles.tableRow}>
            <Text style={[styles.tableCell, { flex: 3 }]}>{labour.designation}</Text>
            <Text style={styles.tableCell}>{labour.quantityDays}</Text>
            <Text style={styles.tableCell}>{labour.price.toFixed(2)}</Text>
            <Text style={styles.tableCell}>{labour.total.toFixed(2)}</Text>
          </View>
        ))}
        <View style={styles.summaryRow}>
          <Text>Total Labour:</Text>
          <Text>{data?.totalLabour.toFixed(2)}</Text>
        </View>
      </View>

      {/* Terms & Conditions */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Terms & Conditions</Text>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableCell, { flex: 3 }]}>Description</Text>
          <Text style={styles.tableCell}>Qty</Text>
          <Text style={styles.tableCell}>Unit Price</Text>
          <Text style={styles.tableCell}>Total</Text>
        </View>
        {data?.termsAndConditions.map((term, index) => (
          <View key={index} style={styles.tableRow}>
            <Text style={[styles.tableCell, { flex: 3 }]}>{term.miscellaneous}</Text>
            <Text style={styles.tableCell}>{term.quantity}</Text>
            <Text style={styles.tableCell}>{term.unitPrice.toFixed(2)}</Text>
            <Text style={styles.tableCell}>{term.total.toFixed(2)}</Text>
          </View>
        ))}
        <View style={styles.summaryRow}>
          <Text>Total Miscellaneous:</Text>
          <Text>{data.totalMisc.toFixed(2)}</Text>
        </View>
      </View>

      {/* Summary */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Summary</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Estimated Amount:</Text>
          <Text style={styles.value}>{data?.estimatedAmount.toFixed(2)}</Text>
        </View>
        {data?.quotationAmount && (
          <View style={styles.row}>
            <Text style={styles.label}>Quotation Amount:</Text>
            <Text style={styles.value}>{data?.quotationAmount.toFixed(2)}</Text>
          </View>
        )}
        {data?.commissionAmount && (
          <View style={styles.row}>
            <Text style={styles.label}>Commission Amount:</Text>
            <Text style={styles.value}>{data?.commissionAmount.toFixed(2)}</Text>
          </View>
        )}
        {data?.profit !== undefined && (
          <View style={styles.row}>
            <Text style={styles.label}>Profit:</Text>
            <Text style={styles.value}>{data?.profit.toFixed(2)}</Text>
          </View>
        )}
      </View>

      {/* Approvals */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Approvals</Text>
        <View style={styles.twoColumnGrid}>
          <View style={styles.twoColumnItem}>
            <View style={styles.row}>
              <Text style={styles.label}>Prepared By:</Text>
              <Text style={styles.value}>{data.preparedByName}</Text>
            </View>
          </View>
          <View style={styles.twoColumnItem}>
            <View style={styles.row}>
              <Text style={styles.label}>Checked By:</Text>
              <Text style={styles.value}>{data.checkedByName}</Text>
            </View>
          </View>
          <View style={styles.twoColumnItem}>
            <View style={styles.row}>
              <Text style={styles.label}>Approved By:</Text>
              <Text style={styles.value}>{data.approvedByName}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Footer */}
      <Text style={styles.footer}>
        Generated on {dayjs().format("MMM DD, YYYY HH:mm")} | Page 1
      </Text>
    </Page>
  </Document>
);

const EstimationView = () => {
  const [data, setData] = useState<Estimation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    if (!id) {
      navigate("/estimations/list");
      return;
    }
    setLoading(true);
    try {
      // Use the service function instead of direct axios call
      const response = await fetchEstimation(id);
      if (response.data.success) {
        setData(response.data.data);
      } else {
        setError("Failed to fetch estimation data");
      }
    } catch (error) {
      console.error(error);
      setError("An error occurred while fetching data");
    } finally {
      setLoading(false);
    }
  };

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
    );
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'draft': return 'bg-yellow-500';
      case 'sent': return 'bg-blue-500';
      case 'approved': return 'bg-green-500';
      case 'rejected': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-850 dark:to-gray-900">
      <Loading loading={loading}>
        {!isEmpty(data) && (
          <div className="container mx-auto p-6">
            {/* Header Section */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg">
                  <HiDocumentText className="text-2xl text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Estimation Detail</h1>
                  <p className="text-gray-500 dark:text-gray-400">View and manage estimation information</p>
                </div>
              </div>
            </div>

            {/* Top Info Card */}
            <Card className="mb-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-750 p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl text-white shadow-lg">
                      <HiDocumentText className="text-3xl" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                        Estimation #{data?.estimationNumber || "N/A"}
                      </h2>
                      <div className="flex items-center gap-3 mt-2">
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <HiCalendar className="text-lg" />
                          <span>{dayjs(data?.dateOfEstimation).format("MMM DD, YYYY")}</span>
                        </div>
                        <Badge 
                          content={data?.status || 'Unknown'} 
                          className="px-3 py-1 text-xs font-bold"
                          innerClass={`${getStatusColor(data?.status)} text-white shadow-lg`}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      variant="solid"
                      icon={<FaEdit />}
                      onClick={() => navigate(`/estimation/edit/${id}/`)}
                      className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      Edit
                    </Button>
                    <PDFDownloadLink
                      document={<EstimationPDF data={data} />}
                      fileName={`Estimation-${data.estimationNumber}.pdf`}
                    >
                      {({ loading }) => (
                        <Button
                          variant="solid"
                          icon={<FaDownload />}
                          disabled={loading}
                          className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                        >
                          {loading ? "Generating PDF..." : "Download PDF"}
                        </Button>
                      )}
                    </PDFDownloadLink>
                  </div>
                </div>
              </div>
            </Card>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8">
              {/* Left Column - Client & Project Info */}
              <div className="xl:col-span-2 space-y-8">
                {/* Client Information */}
                <Card className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-750 p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg">
                        <HiUser className="text-2xl text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-800 dark:text-white">Client Information</h3>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
                        <div className="flex items-center gap-3">
                          <HiUser className="text-xl text-blue-600 dark:text-blue-400" />
                          <div>
                            <p className="font-semibold text-gray-700 dark:text-gray-300">Client Name</p>
                            <p className="text-gray-600 dark:text-gray-400">{data?.clientName || "N/A"}</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-4 rounded-xl border border-purple-200 dark:border-purple-800">
                        <div className="flex items-center gap-3">
                          <HiLocationMarker className="text-xl text-purple-600 dark:text-purple-400" />
                          <div>
                            <p className="font-semibold text-gray-700 dark:text-gray-300">Client Address</p>
                            <p className="text-gray-600 dark:text-gray-400">{data?.clientAddress || "N/A"}</p>
                          </div>
                        </div>
                      </div>

                      <div className="md:col-span-2 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 p-4 rounded-xl border border-orange-200 dark:border-orange-800">
                        <div className="flex items-start gap-3">
                          <HiDocumentText className="text-xl text-orange-600 dark:text-orange-400 mt-1" />
                          <div>
                            <p className="font-semibold text-gray-700 dark:text-gray-300">Work Description</p>
                            <p className="text-gray-600 dark:text-gray-400">{data?.workDescription || "N/A"}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Project Dates */}
                <Card className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-gray-800 dark:to-gray-750 p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-r from-amber-500 to-orange-600 rounded-lg">
                        <HiCalendar className="text-2xl text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-800 dark:text-white">Project Timeline</h3>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {[
                        { label: "Estimation Date", value: data?.dateOfEstimation, color: "blue" },
                        { label: "Work Start Date", value: data?.workStartDate, color: "green" },
                        { label: "Work End Date", value: data?.workEndDate, color: "red" },
                        { label: "Valid Until", value: data?.validUntil, color: "purple" },
                        { label: "Payment Due By", value: data?.paymentDueBy, color: "indigo" }
                      ].map((item, index) => (
                        <div key={index} className={`bg-gradient-to-r from-${item.color}-50 to-${item.color}-100 dark:from-${item.color}-900/20 dark:to-${item.color}-800/20 p-4 rounded-xl border border-${item.color}-200 dark:border-${item.color}-800`}>
                          <div className="flex items-center gap-3">
                            <HiClock className={`text-xl text-${item.color}-600 dark:text-${item.color}-400`} />
                            <div>
                              <p className="font-semibold text-gray-700 dark:text-gray-300 text-sm">{item.label}</p>
                              <p className="text-gray-600 dark:text-gray-400">
                                {dayjs(item.value).format("MMM DD, YYYY")}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              </div>

              {/* Right Column - Financial Summary */}
              <div className="space-y-8">
                <Card className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                  <div className="bg-gradient-to-r from-green-50 to-teal-50 dark:from-gray-800 dark:to-gray-750 p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-r from-green-500 to-teal-600 rounded-lg">
                        <HiCurrencyDollar className="text-2xl text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-800 dark:text-white">Financial Summary</h3>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-gray-700 dark:text-gray-300">Estimated Amount</span>
                          <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                            <NumericFormat
                              displayType="text"
                              value={data?.estimatedAmount}
                              prefix="$"
                              thousandSeparator={true}
                              decimalScale={2}
                            />
                          </span>
                        </div>
                      </div>

                      {data?.quotationAmount && (
                        <div className="bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 p-4 rounded-xl border border-purple-200 dark:border-purple-800">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-gray-700 dark:text-gray-300">Quotation Amount</span>
                            <span className="text-xl font-bold text-purple-600 dark:text-purple-400">
                              <NumericFormat
                                displayType="text"
                                value={data?.quotationAmount}
                                prefix="$"
                                thousandSeparator={true}
                                decimalScale={2}
                              />
                            </span>
                          </div>
                        </div>
                      )}

                      {data?.commissionAmount && (
                        <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 p-4 rounded-xl border border-orange-200 dark:border-orange-800">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-gray-700 dark:text-gray-300">Commission Amount</span>
                            <span className="text-xl font-bold text-orange-600 dark:text-orange-400">
                              <NumericFormat
                                displayType="text"
                                value={data?.commissionAmount}
                                prefix="$"
                                thousandSeparator={true}
                                decimalScale={2}
                              />
                            </span>
                          </div>
                        </div>
                      )}

                      {data?.profit !== undefined && (
                        <div className="bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-gray-700 dark:text-gray-300">Profit</span>
                            <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                              <NumericFormat
                                displayType="text"
                                value={data?.profit}
                                prefix="$"
                                thousandSeparator={true}
                                decimalScale={2}
                              />
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>

                {/* Approvals Section */}
                <Card className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-750 p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg">
                        <HiCheckCircle className="text-2xl text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-800 dark:text-white">Approvals</h3>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      {[
                        { label: "Prepared By", value: data?.preparedByName, icon: HiUser, color: "blue" },
                        { label: "Checked By", value: data?.checkedByName, icon: HiCheckCircle, color: "green" },
                        { label: "Approved By", value: data?.approvedByName, icon: HiSparkles, color: "purple" }
                      ].map((item, index) => (
                        <div key={index} className={`bg-gradient-to-r from-${item.color}-50 to-${item.color}-100 dark:from-${item.color}-900/20 dark:to-${item.color}-800/20 p-4 rounded-xl border border-${item.color}-200 dark:border-${item.color}-800`}>
                          <div className="flex items-center gap-3">
                            <item.icon className={`text-xl text-${item.color}-600 dark:text-${item.color}-400`} />
                            <div>
                              <p className="font-semibold text-gray-700 dark:text-gray-300">{item.label}</p>
                              <p className="text-gray-600 dark:text-gray-400">{item.value || "N/A"}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              </div>
            </div>

            {/* Data Tables Section */}
            <div className="space-y-8">
              {/* Materials Section */}
              <Card className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-750 p-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg">
                      <FaTools className="text-2xl text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white">Materials</h3>
                  </div>
                </div>
                <div className="p-6">
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600">
                          <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 dark:text-gray-300 rounded-l-lg">Material</th>
                          <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 dark:text-gray-300">UOM</th>
                          <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 dark:text-gray-300">Quantity</th>
                          <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 dark:text-gray-300">Unit Price</th>
                          <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 dark:text-gray-300 rounded-r-lg">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {data?.materials.map((material, index) => (
                          <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                            <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300 font-medium">
                              {material.subjectMaterial}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                              {material.uom}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                              {material.quantity}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                              <NumericFormat
                                displayType="text"
                                value={material.unitPrice}
                                prefix="$"
                                thousandSeparator={true}
                                decimalScale={2}
                              />
                            </td>
                            <td className="px-6 py-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                              <NumericFormat
                                displayType="text"
                                value={material.total}
                                prefix="$"
                                thousandSeparator={true}
                                decimalScale={2}
                              />
                            </td>
                          </tr>
                        ))}
                        <tr className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30">
                          <td colSpan={4} className="px-6 py-4 text-right text-sm font-bold text-gray-700 dark:text-gray-300">
                            Total Materials:
                          </td>
                          <td className="px-6 py-4 text-sm font-bold text-blue-600 dark:text-blue-400">
                            <NumericFormat
                              displayType="text"
                              value={data?.totalMaterials}
                              prefix="$"
                              thousandSeparator={true}
                              decimalScale={2}
                            />
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </Card>

              {/* Labour Charges Section */}
              <Card className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-750 p-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg">
                      <GrUserWorker className="text-2xl text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white">Labour Charges</h3>
                  </div>
                </div>
                <div className="p-6">
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600">
                          <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 dark:text-gray-300 rounded-l-lg">Designation</th>
                          <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 dark:text-gray-300">Days</th>
                          <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 dark:text-gray-300">Rate</th>
                          <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 dark:text-gray-300 rounded-r-lg">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {data?.labourCharges.map((labour, index) => (
                          <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                            <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300 font-medium">
                              {labour.designation}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                              {labour.quantityDays}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                              <NumericFormat
                                displayType="text"
                                value={labour.price}
                                prefix="$"
                                thousandSeparator={true}
                                decimalScale={2}
                              />
                            </td>
                            <td className="px-6 py-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                              <NumericFormat
                                displayType="text"
                                value={labour.total}
                                prefix="$"
                                thousandSeparator={true}
                                decimalScale={2}
                              />
                            </td>
                          </tr>
                        ))}
                        <tr className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30">
                          <td colSpan={3} className="px-6 py-4 text-right text-sm font-bold text-gray-700 dark:text-gray-300">
                            Total Labour:
                          </td>
                          <td className="px-6 py-4 text-sm font-bold text-green-600 dark:text-green-400">
                            <NumericFormat
                              displayType="text"
                              value={data?.totalLabour}
                              prefix="$"
                              thousandSeparator={true}
                              decimalScale={2}
                            />
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </Card>

              {/* Terms & Conditions Section */}
              <Card className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-750 p-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg">
                      <HiClipboardList className="text-2xl text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white">Terms & Conditions</h3>
                  </div>
                </div>
                <div className="p-6">
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600">
                          <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 dark:text-gray-300 rounded-l-lg">Description</th>
                          <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 dark:text-gray-300">Quantity</th>
                          <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 dark:text-gray-300">Unit Price</th>
                          <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 dark:text-gray-300 rounded-r-lg">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {data?.termsAndConditions.map((term, index) => (
                          <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                            <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300 font-medium">
                              {term.miscellaneous}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                              {term.quantity}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                              <NumericFormat
                                displayType="text"
                                value={term.unitPrice}
                                prefix="$"
                                thousandSeparator={true}
                                decimalScale={2}
                              />
                            </td>
                            <td className="px-6 py-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                              <NumericFormat
                                displayType="text"
                                value={term.total}
                                prefix="$"
                                thousandSeparator={true}
                                decimalScale={2}
                              />
                            </td>
                          </tr>
                        ))}
                        <tr className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30">
                          <td colSpan={3} className="px-6 py-4 text-right text-sm font-bold text-gray-700 dark:text-gray-300">
                            Total Miscellaneous:
                          </td>
                          <td className="px-6 py-4 text-sm font-bold text-purple-600 dark:text-purple-400">
                            <NumericFormat
                              displayType="text"
                              value={data?.totalMisc}
                              prefix="$"
                              thousandSeparator={true}
                              decimalScale={2}
                            />
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </Card>
            </div>

            {/* Back Button */}
            <div className="mt-8 flex justify-center">
              <Button
                variant="solid"
                onClick={() => navigate(-1)}
                className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
              >
                Back to Previous Page
              </Button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && isEmpty(data) && (
          <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-850 dark:to-gray-900">
            <div className="container mx-auto p-6">
              <Card className="text-center p-12 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">
                <DoubleSidedImage
                  src="/img/others/img-2.png"
                  darkModeSrc="/img/others/img-2-dark.png"
                  alt="No estimation found!"
                  className="w-48 h-48 mx-auto mb-6"
                />
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">
                  No Estimation Found
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  The estimation you're looking for doesn't exist or has been removed.
                </p>
                <Button
                  variant="solid"
                  onClick={() => navigate(-1)}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  Go Back
                </Button>
              </Card>
            </div>
          </div>
        )}
      </Loading>
    </div>
  )
};
export default EstimationView;