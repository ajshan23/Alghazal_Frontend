import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchUserView } from '../../api/api';
import { 
  HiPhone, 
  HiMail, 
  HiLocationMarker,
  HiUserCircle,
  HiDocumentText,
  HiCreditCard,
  HiIdentification,
  HiCalendar,
  HiCash,
  HiDownload,
  HiDocument
} from 'react-icons/hi';
import { FaPassport, FaSignature } from 'react-icons/fa';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const StaffProfile = () => {
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumbers: [],
    role: '',
    profileImage: '',
    signatureImage: '',
    salary: 0,
    address: '',
    accountNumber: '',
    emiratesId: '',
    emiratesIdDocument: '',
    passportNumber: '',
    passportDocument: '',
    isActive: false,
    createdAt: ''
  });

  const { id } = useParams();

  useEffect(() => {
    const loadData = async () => {
      const response = await fetchUserView(id);
      setProfile({
        firstName: response?.data?.firstName || 'Not provided',
        lastName: response?.data?.lastName || '',
        email: response?.data?.email || 'Not provided',
        phoneNumbers: response?.data?.phoneNumbers || [],
        role: response?.data?.role || 'Not specified',
        profileImage: response?.data?.profileImage,
        signatureImage: response?.data?.signatureImage,
        salary: response?.data?.salary || 0,
        address: response?.data?.address || 'Not provided',
        accountNumber: response?.data?.accountNumber || 'Not provided',
        emiratesId: response?.data?.emiratesId || 'Not provided',
        emiratesIdDocument: response?.data?.emiratesIdDocument,
        passportNumber: response?.data?.passportNumber || 'Not provided',
        passportDocument: response?.data?.passportDocument,
        isActive: response?.data?.isActive || false,
        createdAt: response?.data?.createdAt || ''
      });
    };
    loadData();
  }, [id]);

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not available';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

const exportToPDF = () => {
  const doc = new jsPDF();

  // Add profile image
  if (profile.profileImage) {
    const imgWidth = 30; // width of the image
    const imgHeight = 30; // height of the image
    const xPos = 160; // position from left
    const yPos = 10;  // position from top

    // Draw a circle and clip
    doc.circle(xPos + imgWidth / 2, yPos + imgHeight / 2, imgWidth / 2, 'S'); // optional border
    doc.addImage(profile.profileImage, 'JPEG', xPos, yPos, imgWidth, imgHeight);
  }

  // Add title
  doc.setFontSize(20);
  doc.text(`Employee Profile: ${profile.firstName} ${profile.lastName}`, 14, 20);

  // Add profile information
  doc.setFontSize(12);
  let yPosition = 40;

  // Basic Info
  doc.text('Basic Information', 14, yPosition);
  yPosition += 10;
  autoTable(doc, {
    startY: yPosition,
    head: [['Field', 'Value']],
    body: [
      ['Name', `${profile.firstName} ${profile.lastName}`],
      ['Role', profile.role],
      ['Status', profile.isActive ? 'Active' : 'Inactive'],
      ['Join Date', formatDate(profile.createdAt)],
    ],
  });
  yPosition = (doc as any).lastAutoTable.finalY + 15;

  // Contact Info
  doc.text('Contact Information', 14, yPosition);
  yPosition += 10;
  const phoneRows = profile.phoneNumbers.map((phone, index) => [
    `Phone ${index + 1}`,
    phone
  ]);
  autoTable(doc, {
    startY: yPosition,
    head: [['Field', 'Value']],
    body: [
      ['Email', profile.email],
      ...phoneRows,
      ['Address', profile.address],
    ],
  });
  yPosition = (doc as any).lastAutoTable.finalY + 15;

  // Financial Info
  doc.text('Financial Information', 14, yPosition);
  yPosition += 10;
  autoTable(doc, {
    startY: yPosition,
    head: [['Field', 'Value']],
    body: [
      ['Salary', `AED ${profile.salary.toLocaleString('en-US')}`],
      ['Account Number', profile.accountNumber],
    ],
  });
  yPosition = (doc as any).lastAutoTable.finalY + 15;

  // Documents Info
  doc.text('Documents', 14, yPosition);
  yPosition += 10;
  autoTable(doc, {
    startY: yPosition,
    head: [['Document', 'Number']],
    body: [
      ['Emirates ID', profile.emiratesId],
      ['Passport', profile.passportNumber],
    ],
  });

  doc.save(`${profile.firstName}_${profile.lastName}_Profile.pdf`);
};

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 transition-colors">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">
              Employee Profile
            </h1>
          </div>
          <button
            onClick={exportToPDF}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <HiDownload className="text-lg" />
            <span>Export PDF</span>
          </button>
        </div>

        {/* Profile Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6 transition-colors">
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Profile Image */}
            <div className="relative">
              {profile.profileImage ? (
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white dark:border-gray-800 shadow-lg overflow-hidden">
                  <img
                    src={profile.profileImage}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gray-200 dark:bg-gray-700 border-4 border-white dark:border-gray-800 flex items-center justify-center shadow-lg">
                  <HiUserCircle className="text-6xl md:text-8xl text-gray-400 dark:text-gray-500" />
                </div>
              )}
              <span className={`absolute bottom-2 right-2 md:bottom-3 md:right-3 w-4 h-4 md:w-5 md:h-5 rounded-full border-2 border-white dark:border-gray-800 ${
                profile.isActive ? 'bg-green-500' : 'bg-red-500'
              }`}></span>
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left">
              <div className="mb-2">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                  {profile.firstName} {profile.lastName}
                </h2>
                <p className="text-blue-600 dark:text-blue-400 text-lg">{profile.role}</p>
              </div>

              <div className="flex flex-wrap justify-center md:justify-start gap-3">
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  profile.isActive 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                }`}>
                  {profile.isActive ? 'Active' : 'Inactive'}
                </div>

                <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                  <HiCalendar className="mr-1" />
                  <span>Joined {formatDate(profile.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Sections */}
        <div className="space-y-6">
          {/* Contact Information */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-6 pb-2 border-b border-gray-200 dark:border-gray-700">
              Contact Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center text-gray-600 dark:text-gray-400 mb-1">
                  <HiMail className="mr-2 text-blue-500 text-lg" />
                  <span>Email</span>
                </div>
                <p className="text-gray-800 dark:text-gray-200 font-medium pl-7 break-all">
                  {profile.email}
                </p>
              </div>

              {profile.phoneNumbers?.map((phone, index) => (
                <div key={index}>
                  <div className="flex items-center text-gray-600 dark:text-gray-400 mb-1">
                    <HiPhone className="mr-2 text-blue-500 text-lg" />
                    <span>Phone {index > 0 ? index + 1 : ''}</span>
                  </div>
                  <p className="text-gray-800 dark:text-gray-200 font-medium pl-7">
                    {phone}
                  </p>
                </div>
              ))}

              <div className="md:col-span-2">
                <div className="flex items-center text-gray-600 dark:text-gray-400 mb-1">
                  <HiLocationMarker className="mr-2 text-blue-500 text-lg" />
                  <span>Address</span>
                </div>
                <p className="text-gray-800 dark:text-gray-200 font-medium pl-7 whitespace-pre-line">
                  {profile.address}
                </p>
              </div>
            </div>
          </div>

          {/* Financial Information */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-6 pb-2 border-b border-gray-200 dark:border-gray-700">
              Financial Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center text-gray-600 dark:text-gray-400 mb-1">
                  <HiCash className="mr-2 text-blue-500 text-lg" />
                  <span>Salary</span>
                </div>
                <p className="text-gray-800 dark:text-gray-200 font-medium pl-7">
                  AED {profile.salary.toLocaleString('en-US')}
                </p>
              </div>

              <div>
                <div className="flex items-center text-gray-600 dark:text-gray-400 mb-1">
                  <HiCreditCard className="mr-2 text-blue-500 text-lg" />
                  <span>Account Number</span>
                </div>
                <p className="text-gray-800 dark:text-gray-200 font-medium pl-7 break-all">
                  {profile.accountNumber}
                </p>
              </div>
            </div>
          </div>

          {/* Documents Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Emirates ID */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors">
              <div className="flex items-center mb-6 pb-2 border-b border-gray-200 dark:border-gray-700">
                <div className="p-3 mr-4 bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-200 rounded-lg">
                  <HiIdentification className="text-2xl" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Emirates ID</h3>
              </div>
              
              <div className="space-y-6">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">ID Number</p>
                  <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 break-words">
                    <p className="font-medium text-gray-800 dark:text-gray-200">
                      {profile.emiratesId}
                    </p>
                  </div>
                </div>
                
                <div className="pt-4 pr-20 border-t border-gray-200 dark:border-gray-700">
                  {profile.emiratesIdDocument ? (
                    <div className="space-y-3 px-10">
                      <a 
                        href={profile.emiratesIdDocument}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm sm:text-base"
                      >
                        <HiDocument className="text-xl" />
                        <span>View Document</span>
                      </a>
                      <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                        Click to view full document
                      </p>
                    </div>
                  ) : (
                    <div className="text-center py-6 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      No document uploaded
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Passport */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors">
              <div className="flex items-center mb-6 pb-2 border-b border-gray-200 dark:border-gray-700">
                <div className="p-3 mr-4 bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-200 rounded-lg">
                  <FaPassport className="text-2xl" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Passport</h3>
              </div>
              
              <div className="space-y-6">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Passport Number</p>
                  <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 break-words">
                    <p className="font-medium text-gray-800 dark:text-gray-200">
                      {profile.passportNumber}
                    </p>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  {profile.passportDocument ? (
                    <div className="space-y-3">
                      <a 
                        href={profile.passportDocument}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm sm:text-base"
                      >
                        <HiDocument className="text-xl" />
                        <span>View Document</span>
                      </a>
                      <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                        Click to view full document
                      </p>
                    </div>
                  ) : (
                    <div className="text-center py-6 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      No document uploaded
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Signature */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors">
            <div className="flex items-center mb-6 pb-2 border-b border-gray-200 dark:border-gray-700">
              <div className="p-3 mr-4 bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-200 rounded-lg">
                <FaSignature className="text-2xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Signature</h3>
            </div>
            
            <div className="flex justify-center p-4 sm:p-6 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 overflow-x-auto">
              {profile.signatureImage ? (
                <img 
                  src={profile.signatureImage} 
                  alt="Signature" 
                  className="max-h-32 object-contain dark:filter dark:invert"
                  style={{ maxWidth: '100%' }}
                />
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No signature uploaded
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffProfile;