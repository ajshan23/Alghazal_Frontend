import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import classNames from "classnames";
import Container from "@/components/shared/Container";
import Loading from "@/components/shared/Loading";
import DoubleSidedImage from "@/components/shared/DoubleSidedImage";
import Tag from "@/components/ui/Tag";
import Button from "@/components/ui/Button";
import { FaUser, FaCalendarAlt, FaPhone, FaMapMarkerAlt, FaTools, FaUserCircle } from "react-icons/fa";
import { MdOutlineDone } from "react-icons/md";
import isEmpty from "lodash/isEmpty";
import dayjs from "dayjs";
import { BASE_URL } from "@/constants/app.constant";


interface Worker {
  _id: string;
  workerName: string;
  workerImage: string;
}

interface OnSiteComplaint {
  _id: string;
  customerName: string;
  customerAddress: string;
  complaintNumber: string;
  phoneNumbers: string[];
  make: string;
  dealerName?: string;
  warrantyStatus: "Warranty" | "Non-Warranty";
  reportedComplaint: string;
  complaintStatus: "Pending" | "Closed" | "Sent to Workshop";
  paymentStatus: "Pending" | "Paid";
  createdAt: string;
  updatedAt: string;
  attendedPerson?: Worker; // Add attendedPerson field
}

const SingleOnSiteComplaintView = () => {
  const [data, setData] = useState<OnSiteComplaint | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    if (!id) {
      navigate("/admin/onsite-complaints");
      return;
    }
    setLoading(true);
    try {
      const response = await axios.get(`${BASE_URL}/onsite/${id}`);
      if (response.data.success) {
        setData(response.data.data);
      } else {
        setError("Failed to fetch complaint data");
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
                  <FaTools className="text-blue-600 dark:text-blue-400 text-3xl" />
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                      Complaint #{data?.complaintNumber || "N/A"}
                    </h2>
                    <div className="flex items-center gap-2 mt-1 text-gray-600 dark:text-gray-400">
                      <FaCalendarAlt />
                      <span>{dayjs(data?.createdAt).format("MMM DD, YYYY")}</span>
                      <Tag
                        className={classNames(
                          "rounded-full px-2 py-1 text-sm",
                          data?.complaintStatus === "Pending" &&
                            "bg-yellow-100 text-yellow-700 dark:bg-yellow-700 dark:text-yellow-100",
                          data?.complaintStatus === "Closed" &&
                            "bg-green-100 text-green-700 dark:bg-green-700 dark:text-green-100",
                          data?.complaintStatus === "Sent to Workshop" &&
                            "bg-blue-100 text-blue-700 dark:bg-blue-700 dark:text-blue-100",
                          (!data?.complaintStatus ||
                            !["Pending", "Closed", "Sent to Workshop"].includes(data.complaintStatus)) &&
                            "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-100"
                        )}
                      >
                        {data?.complaintStatus || "Unknown"}
                      </Tag>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="solid"
                    className="bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:hover:bg-blue-600 px-4 py-2 rounded-md"
                    onClick={() => navigate(`/app/onsite/form/${id}`)}
                  >
                    Edit
                  </Button>
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
                  <p>
                    <strong>Phone Numbers:</strong> {data?.phoneNumbers.join(", ") || "N/A"}
                  </p>
                </div>
              </section>

              {/* Complaint Details */}
              <section className="border-b border-gray-200 dark:border-gray-700 pb-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                  Complaint Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-700 dark:text-gray-300">
                  <p>
                    <strong>Make:</strong> {data?.make || "N/A"}
                  </p>
                  <p>
                    <strong>Dealer Name:</strong> {data?.dealerName || "N/A"}
                  </p>
                  <p>
                    <strong>Warranty Status:</strong>{" "}
                    <Tag
                      className={classNames(
                        "rounded-full px-2 py-1 text-sm",
                        data?.warrantyStatus === "Warranty"
                          ? "bg-green-100 text-green-700 dark:bg-green-700 dark:text-green-100"
                          : "bg-red-100 text-red-700 dark:bg-red-700 dark:text-red-100"
                      )}
                    >
                      {data?.warrantyStatus || "N/A"}
                    </Tag>
                  </p>
                  <p>
                    <strong>Payment Status:</strong>{" "}
                    <Tag
                      className={classNames(
                        "rounded-full px-2 py-1 text-sm",
                        data?.paymentStatus === "Pending"
                          ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-700 dark:text-yellow-100"
                          : "bg-green-100 text-green-700 dark:bg-green-700 dark:text-green-100"
                      )}
                    >
                      {data?.paymentStatus || "N/A"}
                    </Tag>
                  </p>
                </div>
              </section>

              {/* Worker Details */}
              {data?.attendedPerson && (
                <section className="border-b border-gray-200 dark:border-gray-700 pb-6">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                    Assigned Worker
                  </h3>
                  <div className="flex items-center gap-4">
                    <img
                      src={data.attendedPerson.workerImage}
                      alt={data.attendedPerson.workerName}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <p className="text-gray-700 dark:text-gray-300 font-semibold">
                        {data.attendedPerson.workerName}
                      </p>
                    </div>
                  </div>
                </section>
              )}

              {/* Reported Complaint */}
              <section className="border-b border-gray-200 dark:border-gray-700 pb-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                  Reported Complaint
                </h3>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                    {data?.reportedComplaint || "N/A"}
                  </p>
                </div>
              </section>

              {/* Dates */}
              <section>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                  Dates
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-700 dark:text-gray-300">
                  <p>
                    <strong>Created At:</strong> {dayjs(data?.createdAt).format("MMM DD, YYYY")}
                  </p>
                  <p>
                    <strong>Updated At:</strong> {dayjs(data?.updatedAt).format("MMM DD, YYYY")}
                  </p>
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
            alt="No complaint found!"
            className="w-48 h-48"
          />
          <h3 className="mt-8 text-xl font-semibold text-gray-800 dark:text-gray-200">
            No complaint found!
          </h3>
        </div>
      )}
    </Container>
  );
};

export default SingleOnSiteComplaintView;