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
import { FaTools, FaCalendarAlt, FaUser, FaCog, FaPhone, FaMapMarkerAlt, FaDownload, FaTimes } from "react-icons/fa";
import { MdOutlineDone } from "react-icons/md";
import { GrUserWorker } from "react-icons/gr";
import isEmpty from "lodash/isEmpty";
import dayjs from "dayjs";
import { BASE_URL } from "@/constants/app.constant";



interface Worker {
  _id: string;
  workerName: string;
  workerImage: string;
}

interface JobCard {
  _id: string;
  customerName: string;
  customerAddress: string;
  phoneNumber: string[];
  jobCardNumber: string;
  InDate: string;
  OutDate?: string;
  Make: string;
  HP: number;
  KVA: number | null;
  RPM: number | null;
  Type: string;
  Frame: string;
  SrNo: string;
  DealerName: string;
  DealerNumber: string;
  works: string;
  spares: string;
  industrialworks: string;
  attachments: string[];
  images: { _id: string; image: string; fileType: string }[];
  others: string;
  warranty: boolean;
  jobCardStatus: string;
  worker: Worker;
  invoiceNumber: string;
  invoiceDate: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
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
  jobCardTitle: {
    fontSize: 12,
    color: "#333333",
    marginBottom: 2,
    fontWeight: "bold",
  },
  jobCardDate: {
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
  workDetails: {
    marginTop: 5,
    fontSize: 9,
    color: "#333333",
    backgroundColor: "#F8F9FA",
    padding: 5,
    borderRadius: 2,
  },
  workDetailsLabel: {
    fontSize: 9,
    color: "#0D47A1",
    fontWeight: "bold",
    marginBottom: 3,
  },
  workDetailsValue: {
    fontSize: 9,
    color: "#333333",
    lineHeight: 1.3,
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
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 5,
    gap: 5,
  },
  gridItem: {
    width: "48%",
    marginBottom: 5,
    backgroundColor: "#F8F9FA",
    padding: 5,
    borderRadius: 2,
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
  equipmentGrid: {
    flexDirection: "row",
    flexWrap: "nowrap",
    marginTop: 4,
    gap: 4,
  },
  equipmentItem: {
    width: "23%",
    marginBottom: 4,
    backgroundColor: "#F8F9FA",
    padding: 6,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderStyle: "solid",
  },
  equipmentLabel: {
    fontSize: 7,
    color: "#666666",
    fontWeight: "bold",
    marginBottom: 2,
  },
  equipmentValue: {
    fontSize: 8,
    color: "#333333",
    marginBottom: 2,
  },
  equipmentDivider: {
    width: "100%",
    height: 1,
    backgroundColor: "#E0E0E0",
    marginVertical: 3,
  },
});

// PDF Document Component
const JobCardPDF = ({ data }: { data: JobCard }) => (
  <Document>
    <Page size={[595.28, 420.94]} style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.companyName}>Hi-Tech Engineering Company</Text>
        <Text style={styles.companyInfo}>H.O : #19/1557E-F, Kifwan Building, Kallai Road, Calicut - 673 002. Tl:0495 - 2301201, E-mail : hitechenggco@gmail.com</Text>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Text style={styles.jobCardTitle}>Job Card #{data.jobCardNumber}</Text>
          <Text style={styles.jobCardDate}>{dayjs(data.InDate).format("MMM DD, YYYY")}</Text>
        </View>
      </View>

      {/* Customer Information */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Customer Information</Text>
        <View style={styles.twoColumnGrid}>
          <View style={styles.twoColumnItem}>
            <View style={styles.row}>
              <Text style={styles.label}>Name:</Text>
              <Text style={styles.value}>{data.customerName}</Text>
            </View>
          </View>
          <View style={styles.twoColumnItem}>
            <View style={styles.row}>
              <Text style={styles.label}>Phone:</Text>

              <Text style={styles.value}>{data.phoneNumber.join(", ")}</Text>
            </View>
          </View>
          <View style={{ width: "100%" }}>
            <View style={styles.row}>
              <Text style={styles.label}>Address:</Text>
              <Text style={styles.value}>{data.customerAddress}</Text>
            </View>
          </View>
          {data.OutDate && (
            <View style={styles.twoColumnItem}>
              <View style={styles.row}>
                <Text style={styles.label}>Out Date:</Text>
                <Text style={styles.value}>{dayjs(data.OutDate).format("MMM DD, YYYY")}</Text>
              </View>
            </View>
          )}
        </View>
      </View>

      {/* Equipment Specifications */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Equipment Specifications</Text>
        <View style={styles.equipmentGrid}>
          <View style={styles.equipmentItem}>
            <Text style={styles.equipmentLabel}>Make</Text>
            <Text style={styles.equipmentValue}>{data.Make || "N/A"}</Text>
          </View>
          <View style={styles.equipmentItem}>
            <Text style={styles.equipmentLabel}>HP</Text>
            <Text style={styles.equipmentValue}>{data.HP || "N/A"}</Text>
          </View>
          <View style={styles.equipmentItem}>
            <Text style={styles.equipmentLabel}>KVA</Text>
            <Text style={styles.equipmentValue}>{data.KVA || "N/A"}</Text>
          </View>
          <View style={styles.equipmentItem}>
            <Text style={styles.equipmentLabel}>RPM</Text>
            <Text style={styles.equipmentValue}>{data.RPM || "N/A"}</Text>
          </View>
          <View style={styles.equipmentItem}>
            <Text style={styles.equipmentLabel}>Type</Text>
            <Text style={styles.equipmentValue}>{data.Type || "N/A"}</Text>
          </View>
          <View style={styles.equipmentItem}>
            <Text style={styles.equipmentLabel}>Frame</Text>
            <Text style={styles.equipmentValue}>{data.Frame || "N/A"}</Text>
          </View>
          <View style={styles.equipmentItem}>
            <Text style={styles.equipmentLabel}>Serial Number</Text>
            <Text style={styles.equipmentValue}>{data.SrNo || "N/A"}</Text>
          </View>
        </View>
      </View>

      {/* Dealer Information - Only show if dealer data exists */}
      {(data.DealerName || data.DealerNumber) && (
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Dealer Information</Text>
          <View style={styles.twoColumnGrid}>
            {data.DealerName && (
              <View style={styles.twoColumnItem}>
                <View style={styles.row}>
                  <Text style={styles.label}>Dealer Name:</Text>
                  <Text style={styles.value}>{data.DealerName}</Text>
                </View>
              </View>
            )}
            {data.DealerNumber && (
              <View style={styles.twoColumnItem}>
                <View style={styles.row}>
                  <Text style={styles.label}>Dealer Number:</Text>
                  <Text style={styles.value}>{data.DealerNumber}</Text>
                </View>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Footer */}
      <Text style={styles.footer}>
        Generated on {dayjs().format("MMM DD, YYYY HH:mm")} | Page 1
      </Text>
    </Page>
  </Document>
);

const JobCardView = () => {
  const [data, setData] = useState<JobCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    if (!id) {
      navigate("/admin/jobcard");
      return;
    }
    setLoading(true);
    try {
      const response = await axios.get(`${BASE_URL}/jobcards/${id}`);
      if (response.data.success) {
        setData(response.data.data);
      } else {
        setError("Failed to fetch job card data");
      }
    } catch (error) {
      console.error(error);
      setError("An error occurred while fetching data");
    } finally {
      setLoading(false);
    }
  };

  // Function to handle file download
  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Download failed:', error);
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
          <>
            {/* Image Preview Modal */}
            {selectedImage && (
              <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                <div className="relative max-w-4xl w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl">
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Image Preview</h3>
                    <button
                      onClick={() => setSelectedImage(null)}
                      className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      <FaTimes className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="p-4">
                    <img
                      src={selectedImage}
                      alt="Preview"
                      className="max-h-[70vh] w-full object-contain"
                    />
                  </div>
                  <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                    <Button
                      variant="solid"
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                      onClick={() => handleDownload(selectedImage, `image-${Date.now()}.jpg`)}
                    >
                      <FaDownload className="" /> 
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
              {/* Header */}
              <div className="bg-gray-50 dark:bg-gray-700 p-6 border-b border-gray-200 dark:border-gray-600">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <FaTools className="text-blue-600 dark:text-blue-400 text-3xl" />
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                        Job Card #{data?.jobCardNumber || "N/A"}
                      </h2>
                      <div className="flex items-center gap-2 mt-1 text-gray-600 dark:text-gray-400">
                        <FaCalendarAlt />
                        <span>{dayjs(data?.InDate).format("MMM DD, YYYY")}</span>
                        <Tag
                          className={classNames(
                            "rounded-full px-2 py-1 text-sm",
                            data?.jobCardStatus === "Pending" &&
                              "bg-yellow-100 text-yellow-700 dark:bg-yellow-700 dark:text-yellow-100",
                            data?.jobCardStatus === "Completed" &&
                              "bg-green-100 text-green-700 dark:bg-green-700 dark:text-green-100",
                            data?.jobCardStatus === "Cancelled" &&
                              "bg-red-100 text-red-700 dark:bg-red-700 dark:text-red-100",
                            (!data?.jobCardStatus ||
                              !["Pending", "Completed", "Cancelled"].includes(data.jobCardStatus)) &&
                              "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-100"
                          )}
                        >
                          {data?.jobCardStatus || "Unknown"}
                        </Tag>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      variant="solid"
                      className="bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:hover:bg-blue-600 px-4 py-2 rounded-md"
                      onClick={() => navigate(`/app/jobcards/jobcard-edit/${id}`)}
                    >
                      Edit
                    </Button>
                    <PDFDownloadLink
                      document={<JobCardPDF data={data} />}
                      fileName={`JobCard-${data.jobCardNumber}.pdf`}
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
              <div id="jobcard-content" className="p-6 space-y-8">
                {/* Customer Details */}
                <section className="border-b border-gray-200 dark:border-gray-700 pb-6">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                    <FaUser className="text-blue-600 dark:text-blue-400" /> Customer Details
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-700 dark:text-gray-300">
                    <p>
                      <strong>Name:</strong> {data?.customerName || "N/A"}
                    </p>
                    <p>
                      <strong>Address:</strong> {data?.customerAddress || "N/A"}
                    </p>
                    <div className="flex flex-row ">
                      <strong>Phone Numbers:</strong>
                      <div className="mt-1 space-y-1">
                        {data?.phoneNumber?.map((phone, index) => (
                          <p key={index} className="pl-4">{phone}</p>
                        ))}
                      </div>
                    </div>
                    {data?.OutDate && (
                      <p>
                        <strong>Out Date:</strong> {dayjs(data.OutDate).format("MMM DD, YYYY")}
                      </p>
                    )}
                  </div>
                </section>

                {/* Specifications */}
                <section className="border-b border-gray-200 dark:border-gray-700 pb-6">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                    Specifications
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-gray-700 dark:text-gray-300">
                    <p>
                      <strong>Make:</strong> {data?.Make || "N/A"}
                    </p>
                    <p>
                      <strong>HP:</strong> {data?.HP || "N/A"}
                    </p>
                    <p>
                      <strong>KVA:</strong> {data?.KVA ?? "N/A"}
                    </p>
                    <p>
                      <strong>RPM:</strong> {data?.RPM ?? "N/A"}
                    </p>
                    <p>
                      <strong>Type:</strong> {data?.Type || "N/A"}
                    </p>
                    <p>
                      <strong>Frame:</strong> {data?.Frame || "N/A"}
                    </p>
                    <p>
                      <strong>Serial No:</strong> {data?.SrNo || "N/A"}
                    </p>
                  </div>
                </section>

                {/* Additional Fittings */}
                {data?.attachments && data.attachments.length > 0 && (
                  <section className="border-b border-gray-200 dark:border-gray-700 pb-6">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                      <FaTools className="text-blue-600 dark:text-blue-400" /> Additional Fittings
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {data.attachments.map((attachment, index) => (
                        <div 
                          key={index}
                          className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg border border-gray-200 dark:border-gray-600"
                        >
                          <span className="text-gray-700 dark:text-gray-300 capitalize">{attachment}</span>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Dealer & Work Details */}
                <section className="border-b border-gray-200 dark:border-gray-700 pb-6">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                    <FaCog className="text-blue-600 dark:text-blue-400" /> Dealer & Work Details
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-700 dark:text-gray-300">
                    <p>
                      <strong>Dealer Name:</strong> {data?.DealerName || "N/A"}
                    </p>
                    <p>
                      <strong>Dealer Number:</strong> {data?.DealerNumber || "N/A"}
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    {data?.works && (
                      <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow-sm">
                        <h5 className="text-sm font-semibold text-amber-600 dark:text-amber-400 mb-2">Works</h5>
                        <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{data.works}</p>
                      </div>
                    )}
                    {data?.spares && (
                      <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow-sm">
                        <h5 className="text-sm font-semibold text-amber-600 dark:text-amber-400 mb-2">Spares</h5>
                        <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{data.spares}</p>
                      </div>
                    )}
                    {data?.industrialworks && (
                      <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow-sm">
                        <h5 className="text-sm font-semibold text-amber-600 dark:text-amber-400 mb-2">Industrial Works</h5>
                        <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{data.industrialworks}</p>
                      </div>
                    )}
                    {data?.others && (
                      <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow-sm">
                        <h5 className="text-sm font-semibold text-amber-600 dark:text-amber-400 mb-2">Others</h5>
                        <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{data.others}</p>
                      </div>
                    )}
                  </div>
                </section>

                {/* Worker Details */}
                {data?.worker && (
                  <section className="border-b border-gray-200 dark:border-gray-700 pb-6">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                      <GrUserWorker className="text-blue-600 dark:text-blue-400" /> Worker Details
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-gray-700 dark:text-gray-300">
                      <p>
                        <strong>Worker Name:</strong> {data.worker.workerName || "N/A"}
                      </p>
                      <div className="flex items-center gap-2">
                        <strong>Worker Image:</strong>
                        <img
                          src={data.worker.workerImage}
                          alt="Worker"
                          className="w-10 h-10 rounded-full"
                        />
                      </div>
                    </div>
                  </section>
                )}

                {/* Invoice Details */}
                <section className="border-b border-gray-200 dark:border-gray-700 pb-6">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                    <MdOutlineDone className="text-blue-600 dark:text-blue-400" /> Invoice Details
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-gray-700 dark:text-gray-300">
                    <p>
                      <strong>Invoice Number:</strong> {data?.invoiceNumber || "N/A"}
                    </p>
                    <p>
                      <strong>Invoice Date:</strong> {data?.invoiceDate ? dayjs(data.invoiceDate).format("MMM DD, YYYY") : "N/A"}
                    </p>
                  </div>
                </section>

                {/* Images and PDFs */}
                {data?.images && data.images.length > 0 && (
                  <section className="border-b border-gray-200 dark:border-gray-700 pb-6">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                      Attachments
                    </h3>
                    <div className="flex flex-wrap gap-4">
                      {/* Images */}
                      {data.images
                        .filter(file => file.fileType === 'image')
                        .map((img, index) => (
                          <div 
                            key={img._id} 
                            className="relative group cursor-pointer"
                            onClick={() => setSelectedImage(img.image)}
                          >
                            <div className="block">
                              <img
                                src={img.image}
                                alt={`Attachment ${index + 1}`}
                                className="w-24 h-24 object-cover rounded-lg border border-gray-200 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
                              />
                              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity rounded-lg flex items-center justify-center">
                                <FaDownload className="text-white opacity-0 group-hover:opacity-100 transform scale-0 group-hover:scale-100 transition-all" />
                              </div>
                            </div>
                          </div>
                        ))}

                      {/* PDFs */}
                      {data.images
                        .filter(file => file.fileType === 'pdf')
                        .map((pdf, index) => (
                          <div 
                            key={pdf._id}
                            className="relative group cursor-pointer"
                            onClick={() => handleDownload(pdf.image, `document-${index + 1}.pdf`)}
                          >
                            <div className="block w-24 h-24 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 transition-colors p-3 flex flex-col items-center justify-center">
                              <div className="text-red-500 dark:text-red-400 text-2xl mb-1">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M8 16H16V18H8V16ZM8 12H16V14H8V12ZM14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2ZM18 20H6V4H13V9H18V20Z"/>
                                </svg>
                              </div>
                              <span className="text-xs text-gray-600 dark:text-gray-300 text-center truncate w-full">
                                PDF {index + 1}
                              </span>
                            </div>
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity rounded-lg flex items-center justify-center">
                              <FaDownload className="text-white opacity-0 group-hover:opacity-100 transform scale-0 group-hover:scale-100 transition-all" />
                            </div>
                          </div>
                        ))}
                    </div>
                  </section>
                )}

                {/* Status & Warranty */}
                <section>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                    Status & Warranty
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-700 dark:text-gray-300">
                    <p>
                      <strong>Warranty:</strong> {data?.warranty ? "Yes" : "No"}
                    </p>
                    <p>
                      <strong>Status:</strong> {data?.jobCardStatus || "N/A"}
                    </p>
                  </div>
                </section>
              </div>
            </div>
          </>
        )}
      </Loading>
      {!loading && isEmpty(data) && (
        <div className="h-full flex flex-col items-center justify-center">
          <DoubleSidedImage
            src="/img/others/img-2.png"
            darkModeSrc="/img/others/img-2-dark.png"
            alt="No job card found!"
            className="w-48 h-48"
          />
          <h3 className="mt-8 text-xl font-semibold text-gray-800 dark:text-gray-200">
            No job card found!
          </h3>
        </div>
      )}
    </Container>
  );
};

export default JobCardView;