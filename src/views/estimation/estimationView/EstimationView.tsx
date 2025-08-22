import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import classNames from "classnames";
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer";
import Container from "@/components/shared/Container";
import Loading from "@/components/shared/Loading";
import DoubleSidedImage from "@/components/shared/DoubleSidedImage";
import Tag from "@/components/ui/Tag";
import Button from "@/components/ui/Button";
import { FaTools, FaCalendarAlt, FaUser, FaFileAlt, FaMoneyBillWave, FaDownload, FaTimes, FaEdit } from "react-icons/fa";
import { MdOutlineDone } from "react-icons/md";
import { GrUserWorker } from "react-icons/gr";
import isEmpty from "lodash/isEmpty";
import dayjs from "dayjs";
import { BASE_URL } from "@/constants/app.constant";

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
      src: "https://fonts.gstatic.com/s/roboto/v27/KFOmCnqEu92Fr1Mu4mxP.ttf", // Roboto Regular
    },
    {
      src: "https://fonts.gstatic.com/s/roboto/v27/KFOlCnqEu92Fr1MmEU9fBBc9.ttf", // Roboto Bold
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
      const response = await axios.get(`${BASE_URL}/estimation/${id}`);
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
      <div className="h-full flex flex-col items-center justify-center">
        <DoubleSidedImage
          src="/img/others/img-2.png"
          darkModeSrc="/img/others/img-2-dark.png"
          alt="Error"
          className="w-48 h-48"
        />
        <h3 className="mt-8 text-xl font-semibold text-gray-800 dark:text-gray-200">{error}</h3>
      </div>
    );
  }

  return (
    <Container className="py-8">
      <Loading loading={loading}>
        {!isEmpty(data) && (
          <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            {/* Header */}
            <div className="bg-gray-50 dark:bg-gray-700 p-6 border-b border-gray-200 dark:border-gray-600">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <FaFileAlt className="text-blue-600 dark:text-blue-400 text-3xl" />
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                      Estimation #{data?.estimationNumber || "N/A"}
                    </h2>
                    <div className="flex items-center gap-2 mt-1 text-gray-600 dark:text-gray-400">
                      <FaCalendarAlt />
                      <span>{dayjs(data?.dateOfEstimation).format("MMM DD, YYYY")}</span>
                      <Tag
                        className={classNames(
                          "rounded-full px-2 py-1 text-sm",
                          data?.status === "Draft" &&
                            "bg-yellow-100 text-yellow-700 dark:bg-yellow-700 dark:text-yellow-100",
                          data?.status === "Sent" &&
                            "bg-blue-100 text-blue-700 dark:bg-blue-700 dark:text-blue-100",
                          data?.status === "Approved" &&
                            "bg-green-100 text-green-700 dark:bg-green-700 dark:text-green-100",
                          data?.status === "Rejected" &&
                            "bg-red-100 text-red-700 dark:bg-red-700 dark:text-red-100",
                          (!data?.status ||
                            !["Draft", "Sent", "Approved", "Rejected"].includes(data.status)) &&
                            "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-100"
                        )}
                      >
                        {data?.status || "Unknown"}
                      </Tag>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="solid"
                    className="bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:hover:bg-blue-600 px-4 py-2 rounded-md"
                    onClick={() => navigate(`/estimation/edit/${id}/`)}
                  >
                    <FaEdit className="" /> 
                  </Button>
                  <PDFDownloadLink
                    document={<EstimationPDF data={data} />}
                    fileName={`Estimation-${data.estimationNumber}.pdf`}
                  >
                    {({ loading }) => (
                      <Button
                        variant="solid"
                        className="bg-green-600 hover:bg-green-700 text-white dark:bg-green-500 dark:hover:bg-green-600 px-4 py-2 rounded-md flex items-center gap-2"
                        disabled={loading}
                      >
                        <FaDownload /> {loading ? "Generating PDF..." : "Download PDF"}
                      </Button>
                    )}
                  </PDFDownloadLink>
                  <Button
                    variant="default"
                    className="border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 px-4 py-2 rounded-md"
                    onClick={() => navigate(-1)}
                  >
                    Back
                  </Button>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="p-6 space-y-8">
              {/* Client Details */}
              <section className="border-b border-gray-200 dark:border-gray-700 pb-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                  <FaUser className="text-blue-600 dark:text-blue-400" /> Client Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-700 dark:text-gray-300">
                  <p>
                    <strong>Client Name:</strong> {data?.clientName || "N/A"}
                  </p>
                  <p>
                    <strong>Client Address:</strong> {data?.clientAddress || "N/A"}
                  </p>
                  <p>
                    <strong>Work Description:</strong> {data?.workDescription || "N/A"}
                  </p>
                </div>
              </section>

              {/* Project Dates */}
              <section className="border-b border-gray-200 dark:border-gray-700 pb-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                  Project Dates
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-gray-700 dark:text-gray-300">
                  <p>
                    <strong>Estimation Date:</strong> {dayjs(data?.dateOfEstimation).format("MMM DD, YYYY")}
                  </p>
                  <p>
                    <strong>Work Start Date:</strong> {dayjs(data?.workStartDate).format("MMM DD, YYYY")}
                  </p>
                  <p>
                    <strong>Work End Date:</strong> {dayjs(data?.workEndDate).format("MMM DD, YYYY")}
                  </p>
                  <p>
                    <strong>Valid Until:</strong> {dayjs(data?.validUntil).format("MMM DD, YYYY")}
                  </p>
                  <p>
                    <strong>Payment Due By:</strong> {dayjs(data?.paymentDueBy).format("MMM DD, YYYY")}
                  </p>
                </div>
              </section>

              {/* Materials Section */}
              <section className="border-b border-gray-200 dark:border-gray-700 pb-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                  <FaTools className="text-blue-600 dark:text-blue-400" /> Materials
                </h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Material
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Quantity
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Unit Price
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {data?.materials.map((material, index) => (
                        <tr key={index}>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                            {material.subjectMaterial}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                            {material.quantity}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                            {material.unitPrice.toFixed(2)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                            {material.total.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-gray-50 dark:bg-gray-700 font-semibold">
                        <td colSpan={3} className="px-4 py-3 text-right text-sm text-gray-700 dark:text-gray-300">
                          Total Materials:
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                          {data?.totalMaterials.toFixed(2)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Labour Charges Section */}
              <section className="border-b border-gray-200 dark:border-gray-700 pb-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                  <GrUserWorker className="text-blue-600 dark:text-blue-400" /> Labour Charges
                </h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Designation
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Days
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Rate
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {data?.labourCharges.map((labour, index) => (
                        <tr key={index}>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                            {labour.designation}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                            {labour.quantityDays}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                            {labour.price.toFixed(2)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                            {labour.total.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-gray-50 dark:bg-gray-700 font-semibold">
                        <td colSpan={3} className="px-4 py-3 text-right text-sm text-gray-700 dark:text-gray-300">
                          Total Labour:
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                          {data?.totalLabour.toFixed(2)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Terms & Conditions Section */}
              <section className="border-b border-gray-200 dark:border-gray-700 pb-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                  <FaFileAlt className="text-blue-600 dark:text-blue-400" /> Terms & Conditions
                </h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Description
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Quantity
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Unit Price
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {data?.termsAndConditions.map((term, index) => (
                        <tr key={index}>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                            {term.miscellaneous}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                            {term.quantity}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                            {term.unitPrice.toFixed(2)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                            {term.total.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-gray-50 dark:bg-gray-700 font-semibold">
                        <td colSpan={3} className="px-4 py-3 text-right text-sm text-gray-700 dark:text-gray-300">
                          Total Miscellaneous:
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                          {data?.totalMisc.toFixed(2)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Summary Section */}
              <section className="border-b border-gray-200 dark:border-gray-700 pb-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                  <FaMoneyBillWave className="text-blue-600 dark:text-blue-400" /> Financial Summary
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-gray-700 dark:text-gray-300">
                  <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow-sm">
                    <h5 className="text-sm font-semibold text-amber-600 dark:text-amber-400 mb-2">Estimated Amount</h5>
                    <p className="text-lg font-bold">{data?.estimatedAmount.toFixed(2)}</p>
                  </div>
                  {data?.quotationAmount && (
                    <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow-sm">
                      <h5 className="text-sm font-semibold text-amber-600 dark:text-amber-400 mb-2">Quotation Amount</h5>
                      <p className="text-lg font-bold">{data?.quotationAmount.toFixed(2)}</p>
                    </div>
                  )}
                  {data?.commissionAmount && (
                    <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow-sm">
                      <h5 className="text-sm font-semibold text-amber-600 dark:text-amber-400 mb-2">Commission Amount</h5>
                      <p className="text-lg font-bold">{data?.commissionAmount.toFixed(2)}</p>
                    </div>
                  )}
                  {data?.profit !== undefined && (
                    <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow-sm">
                      <h5 className="text-sm font-semibold text-amber-600 dark:text-amber-400 mb-2">Profit</h5>
                      <p className="text-lg font-bold">{data?.profit.toFixed(2)}</p>
                    </div>
                  )}
                </div>
              </section>

              {/* Approvals Section */}
              <section>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                  <MdOutlineDone className="text-blue-600 dark:text-blue-400" /> Approvals
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-gray-700 dark:text-gray-300">
                  <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow-sm">
                    <h5 className="text-sm font-semibold text-amber-600 dark:text-amber-400 mb-2">Prepared By</h5>
                    <p>{data?.preparedByName || "N/A"}</p>
                  </div>
                  <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow-sm">
                    <h5 className="text-sm font-semibold text-amber-600 dark:text-amber-400 mb-2">Checked By</h5>
                    <p>{data?.checkedByName || "N/A"}</p>
                  </div>
                  <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow-sm">
                    <h5 className="text-sm font-semibold text-amber-600 dark:text-amber-400 mb-2">Approved By</h5>
                    <p>{data?.approvedByName || "N/A"}</p>
                  </div>
                </div>
              </section>
            </div>
          </div>
        )}
      </Loading>
      {!loading && isEmpty(data) && (
        <div className="h-full flex flex-col items-center justify-center">
          <DoubleSidedImage
            src="/img/others/img-2.png"
            darkModeSrc="/img/others/img-2-dark.png"
            alt="No estimation found!"
            className="w-48 h-48"
          />
          <h3 className="mt-8 text-xl font-semibold text-gray-800 dark:text-gray-200">
            No estimation found!
          </h3>
        </div>
      )}
    </Container>
  );
};

export default EstimationView;