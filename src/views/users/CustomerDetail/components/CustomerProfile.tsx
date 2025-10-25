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
  HiDocument,
  HiOfficeBuilding,
  HiUser
} from 'react-icons/hi';
import { FaPassport, FaSignature, FaIdCard } from 'react-icons/fa';
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
    iBANNumber: '',
    isActive: false,
    createdAt: '',
    createdBy: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { id } = useParams();

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetchUserView(id);
        console.log('API Response:', response); // Debug log
        
        if (response?.data) {
          setProfile({
            firstName: response.data.firstName || 'Not provided',
            lastName: response.data.lastName || '',
            email: response.data.email || 'Not provided',
            phoneNumbers: response.data.phoneNumbers || [],
            role: response.data.role || 'Not specified',
            profileImage: response.data.profileImage || '',
            signatureImage: response.data.signatureImage || '',
            salary: response.data.salary || 0,
            address: response.data.address || 'Not provided',
            accountNumber: response.data.accountNumber || 'Not provided',
            emiratesId: response.data.emiratesId || 'Not provided',
            emiratesIdDocument: response.data.emiratesIdDocument || '',
            passportNumber: response.data.passportNumber || 'Not provided',
            passportDocument: response.data.passportDocument || '',
            iBANNumber: response.data.iBANNumber || 'Not provided',
            isActive: response.data.isActive || false,
            createdAt: response.data.createdAt || '',
            createdBy: response.data.createdBy || ''
          });
        } else {
          throw new Error('No data received from API');
        }
      } catch (error) {
        console.error('Error loading profile data:', error);
        setError('Failed to load employee profile. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  const formatDate = (dateString) => {
    if (!dateString) return 'Not available';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getRoleDisplayName = (role) => {
    const roleMap = {
      'super_admin': 'Super Admin',
      'admin': 'Admin',
      'engineer': 'Engineer',
      'finance': 'Finance',
      'driver': 'Driver',
      'worker': 'Worker',
      'supervisor': 'Supervisor'
    };
    return roleMap[role] || role;
  };

const exportToPDF = async () => {
  try {
    const doc = new jsPDF();
    
    // Set document properties
    doc.setProperties({
      title: `${profile.firstName} ${profile.lastName} - Employee Profile`,
      subject: 'Employee Profile Export',
      author: 'Company HR System'
    });

    // Add company header
    doc.setFillColor(66, 139, 202);
    doc.rect(0, 0, 210, 25, 'F');
    
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('EMPLOYEE PROFILE', 105, 12, { align: 'center' });
    
    doc.setFontSize(8);
    doc.text('Confidential Document', 105, 18, { align: 'center' });

    let yPosition = 35;

    // Employee Name and Role - Left side
    doc.setFontSize(18);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text(`${profile.firstName} ${profile.lastName}`, 14, yPosition);
    
    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(getRoleDisplayName(profile.role), 14, yPosition + 6);

    // Status indicator
    // doc.setFillColor(profile.isActive ? [34, 197, 94] : [239, 68, 68]);
    // doc.circle(14, yPosition + 15, 3, 'F');
    // doc.setFontSize(9);
    // doc.setTextColor(100, 100, 100);
    // doc.text(profile.isActive ? 'Active Employee' : 'Inactive Employee', 20, yPosition + 18);

    // PROFILE IMAGE - Right side
    const imgX = 180;
    const imgY = yPosition - 5;
    const imgSize = 25;
    
    if (profile.profileImage) {
      try {
        // Add the actual profile image
        doc.addImage(
          profile.profileImage,
          'JPEG', // or 'PNG' depending on your image format
          imgX,
          imgY,
          imgSize,
          imgSize
        );
        
        // Add circular border around the image
        doc.setDrawColor(66, 139, 202);
        doc.setLineWidth(0.5);
        doc.circle(imgX + imgSize/2, imgY + imgSize/2, imgSize/2, 'D');
        
      } catch (imageError) {
        console.warn('Could not load profile image, using placeholder:', imageError);
        // Fallback to placeholder if image fails
        addImagePlaceholder(doc, imgX, imgY, imgSize, profile);
      }
    } else {
      // No profile image - show placeholder
      addImagePlaceholder(doc, imgX, imgY, imgSize, profile);
    }

    yPosition += 30;

    // Basic Information
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text("Basic Information", 14, yPosition);
    yPosition += 8;

    autoTable(doc, {
      startY: yPosition,
      head: [["Field", "Value"]],
      body: [
        ["Full Name", `${profile.firstName} ${profile.lastName}`],
        ["Role", getRoleDisplayName(profile.role)],
        ["Employee Status", profile.isActive ? "Active" : "Inactive"],
        ["Join Date", formatDate(profile.createdAt)],
        // ["Employee ID", id || 'N/A'],
      ],
      theme: 'grid',
      headStyles: { 
        fillColor: [66, 139, 202],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 10
      },
      bodyStyles: { fontSize: 9 },
      margin: { left: 14, right: 14 },
      styles: {
        cellPadding: 3,
        fontSize: 9,
      },
      columnStyles: {
        0: { cellWidth: 45, fontStyle: 'bold' },
        1: { cellWidth: 'auto' }
      }
    });

    yPosition = doc.lastAutoTable.finalY + 15;

    // Contact Information
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text("Contact Information", 14, yPosition);
    yPosition += 8;

    const phoneRows = profile.phoneNumbers && profile.phoneNumbers.length > 0 
      ? profile.phoneNumbers.map((phone, index) => [
          `Phone ${index + 1}`,
          phone,
        ])
      : [["Phone", "Not provided"]];

    autoTable(doc, {
      startY: yPosition,
      head: [["Field", "Value"]],
      body: [
        ["Email", profile.email || 'Not provided'], 
        ...phoneRows, 
        ["Address", profile.address || 'Not provided']
      ],
      theme: 'grid',
      headStyles: { 
        fillColor: [66, 139, 202],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 10
      },
      bodyStyles: { fontSize: 9 },
      margin: { left: 14, right: 14 },
      styles: {
        cellPadding: 3,
        fontSize: 9,
      },
      columnStyles: {
        0: { cellWidth: 45, fontStyle: 'bold' },
        1: { cellWidth: 'auto' }
      }
    });

    yPosition = doc.lastAutoTable.finalY + 15;

    // Financial Information
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text("Financial Information", 14, yPosition);
    yPosition += 8;

    autoTable(doc, {
      startY: yPosition,
      head: [["Field", "Value"]],
      body: [
        ["Daily Salary", formatCurrency(profile.salary || 0)],
        ["Account Number", profile.accountNumber || 'Not provided'],
        ["IBAN Number", profile.iBANNumber || 'Not provided'],
      ],
      theme: 'grid',
      headStyles: { 
        fillColor: [66, 139, 202],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 10
      },
      bodyStyles: { fontSize: 9 },
      margin: { left: 14, right: 14 },
      styles: {
        cellPadding: 3,
        fontSize: 9,
      },
      columnStyles: {
        0: { cellWidth: 45, fontStyle: 'bold' },
        1: { cellWidth: 'auto' }
      }
    });

    yPosition = doc.lastAutoTable.finalY + 15;

    // Documents Information
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text("Documents & Identification", 14, yPosition);
    yPosition += 8;

    autoTable(doc, {
      startY: yPosition,
      head: [["Document Type", "Number", "Status"]],
      body: [
        [
          "Emirates ID", 
          profile.emiratesId || 'Not provided', 
          profile.emiratesIdDocument ? "Attached" : "Not attached"
        ],
        [
          "Passport", 
          profile.passportNumber || 'Not provided', 
          profile.passportDocument ? "Attached" : "Not attached"
        ],
      ],
      theme: 'grid',
      headStyles: { 
        fillColor: [66, 139, 202],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 10
      },
      bodyStyles: { fontSize: 9 },
      margin: { left: 14, right: 14 },
      styles: {
        cellPadding: 3,
        fontSize: 9,
      },
      columnStyles: {
        0: { cellWidth: 45, fontStyle: 'bold' },
        1: { cellWidth: 'auto' },
        2: { cellWidth: 35 }
      }
    });

    // Add footer with generation date
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text(`Generated on ${new Date().toLocaleDateString()}`, 14, 290);
      doc.text(`Page ${i} of ${pageCount}`, 190, 290, { align: 'right' });
    }

    // Save the PDF
    const fileName = `${profile.firstName}_${profile.lastName}_Profile.pdf`.replace(/\s+/g, '_');
    doc.save(fileName);

  } catch (error) {
    console.error('Error generating PDF:', error);
    alert('Error generating PDF. Please try again.');
  }
};

// Helper function for image placeholder
const addImagePlaceholder = (doc, imgX, imgY, imgSize, profile) => {
  // Create circular placeholder
  doc.setFillColor(240, 240, 240);
  doc.circle(imgX + imgSize/2, imgY + imgSize/2, imgSize/2, 'F');
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.circle(imgX + imgSize/2, imgY + imgSize/2, imgSize/2, 'D');
  
  // Add initials
  const initials = `${profile.firstName?.charAt(0) || ''}${profile.lastName?.charAt(0) || ''}`.toUpperCase();
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.setFont(undefined, 'bold');
  doc.text(initials || 'U', imgX + imgSize/2, imgY + imgSize/2 + 3, { align: 'center' });
};

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#f9fafb',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          textAlign: 'center',
          padding: '2rem'
        }}>
          <div style={{
            fontSize: '1.125rem',
            color: '#6b7280',
            marginBottom: '1rem'
          }}>
            Loading employee profile...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#f9fafb',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          textAlign: 'center',
          padding: '2rem',
          backgroundColor: 'white',
          borderRadius: '0.75rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{
            fontSize: '1.125rem',
            color: '#ef4444',
            marginBottom: '1rem'
          }}>
            {error}
          </div>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#2563eb',
              color: 'white',
              borderRadius: '0.5rem',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f9fafb',
      padding: '1rem',
      color: '#1f2937'
    }}>
      {/* Main Container */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        
        {/* Header */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '1.5rem',
          gap: '1rem'
        }}>
          <div>
            <h1 style={{
              fontSize: '1.875rem',
              fontWeight: 'bold',
              color: '#1f2937'
            }}>
              Employee Profile
            </h1>
            <p style={{ color: '#6b7280' }}>
              Complete employee information and documents
            </p>
          </div>
          <button
            onClick={exportToPDF}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.5rem',
              backgroundColor: '#2563eb',
              color: 'white',
              borderRadius: '0.5rem',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '500',
              fontSize: '0.875rem'
            }}
          >
            <HiDownload style={{ fontSize: '1.125rem' }} />
            <span>Export to PDF</span>
          </button>
        </div>

        {/* Profile Section */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '0.75rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e5e7eb',
          padding: '1.5rem',
          marginBottom: '1.5rem'
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1.5rem'
          }}>
            {/* Profile Image */}
            <div style={{ position: 'relative' }}>
              {profile.profileImage ? (
                <div style={{
                  width: '8rem',
                  height: '8rem',
                  borderRadius: '9999px',
                  border: '4px solid white',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                  overflow: 'hidden'
                }}>
                  <img
                    src={profile.profileImage}
                    alt="Profile"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div style={{
                    width: '100%',
                    height: '100%',
                    backgroundColor: '#e5e7eb',
                    display: 'none',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <HiUserCircle style={{ fontSize: '4rem', color: '#9ca3af' }} />
                  </div>
                </div>
              ) : (
                <div style={{
                  width: '8rem',
                  height: '8rem',
                  borderRadius: '9999px',
                  backgroundColor: '#e5e7eb',
                  border: '4px solid white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                }}>
                  <HiUserCircle style={{ fontSize: '4rem', color: '#9ca3af' }} />
                </div>
              )}
              <span style={{
                position: 'absolute',
                bottom: '0.5rem',
                right: '0.5rem',
                width: '1.5rem',
                height: '1.5rem',
                borderRadius: '9999px',
                border: '2px solid white',
                backgroundColor: profile.isActive ? '#10b981' : '#ef4444'
              }}></span>
            </div>

            {/* Profile Info */}
            <div style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ marginBottom: '1rem' }}>
                <h2 style={{
                  fontSize: '1.875rem',
                  fontWeight: 'bold',
                  color: '#1f2937',
                  marginBottom: '0.5rem'
                }}>
                  {profile.firstName} {profile.lastName}
                </h2>
                <p style={{ 
                  color: '#2563eb', 
                  fontSize: '1.25rem',
                  fontWeight: '500',
                  marginBottom: '0.5rem'
                }}>
                  {getRoleDisplayName(profile.role)}
                </p>
                <p style={{ 
                  color: '#6b7280',
                  fontSize: '0.875rem'
                }}>
                  Employee ID: {id}
                </p>
              </div>

              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                gap: '0.75rem',
                marginBottom: '1rem'
              }}>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '0.5rem 1rem',
                  borderRadius: '9999px',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  backgroundColor: profile.isActive ? '#dcfce7' : '#fee2e2',
                  color: profile.isActive ? '#166534' : '#991b1b'
                }}>
                  {profile.isActive ? 'Active Employee' : 'Inactive Employee'}
                </div>

                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '0.5rem 1rem',
                  borderRadius: '9999px',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  backgroundColor: '#f3f4f6',
                  color: '#374151'
                }}>
                  <HiCalendar style={{ marginRight: '0.5rem' }} />
                  <span>Joined {formatDate(profile.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Sections */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '1.5rem'
        }}>
          
          {/* Contact Information */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '0.75rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #e5e7eb',
            padding: '1.5rem'
          }}>
            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              color: '#1f2937',
              marginBottom: '1.5rem',
              paddingBottom: '0.75rem',
              borderBottom: '2px solid #e5e7eb',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <HiUser style={{ color: '#2563eb' }} />
              Contact Information
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  color: '#6b7280',
                  marginBottom: '0.5rem',
                  fontSize: '0.875rem'
                }}>
                  <HiMail style={{ marginRight: '0.75rem', color: '#3b82f6', fontSize: '1.25rem' }} />
                  <span>Email Address</span>
                </div>
                <p style={{
                  color: '#1f2937',
                  fontWeight: '500',
                  paddingLeft: '2rem',
                  wordBreak: 'break-all',
                  fontSize: '1rem'
                }}>
                  {profile.email}
                </p>
              </div>

              {profile.phoneNumbers?.map((phone, index) => (
                <div key={index}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    color: '#6b7280',
                    marginBottom: '0.5rem',
                    fontSize: '0.875rem'
                  }}>
                    <HiPhone style={{ marginRight: '0.75rem', color: '#3b82f6', fontSize: '1.25rem' }} />
                    <span>Phone Number {profile.phoneNumbers.length > 1 ? `#${index + 1}` : ''}</span>
                  </div>
                  <p style={{
                    color: '#1f2937',
                    fontWeight: '500',
                    paddingLeft: '2rem',
                    fontSize: '1rem'
                  }}>
                    {phone}
                  </p>
                </div>
              ))}

              <div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  color: '#6b7280',
                  marginBottom: '0.5rem',
                  fontSize: '0.875rem'
                }}>
                  <HiLocationMarker style={{ marginRight: '0.75rem', color: '#3b82f6', fontSize: '1.25rem' }} />
                  <span>Address</span>
                </div>
                <p style={{
                  color: '#1f2937',
                  fontWeight: '500',
                  paddingLeft: '2rem',
                  whiteSpace: 'pre-line',
                  fontSize: '1rem'
                }}>
                  {profile.address}
                </p>
              </div>
            </div>
          </div>

          {/* Financial Information */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '0.75rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #e5e7eb',
            padding: '1.5rem'
          }}>
            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              color: '#1f2937',
              marginBottom: '1.5rem',
              paddingBottom: '0.75rem',
              borderBottom: '2px solid #e5e7eb',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <HiCash style={{ color: '#16a34a' }} />
              Financial Information
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  color: '#6b7280',
                  marginBottom: '0.5rem',
                  fontSize: '0.875rem'
                }}>
                  <HiCash style={{ marginRight: '0.75rem', color: '#16a34a', fontSize: '1.25rem' }} />
                  <span>Daily Salary</span>
                </div>
                <p style={{
                  color: '#1f2937',
                  fontWeight: '600',
                  paddingLeft: '2rem',
                  fontSize: '1.125rem'
                }}>
                  {formatCurrency(profile.salary)}
                </p>
              </div>

              <div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  color: '#6b7280',
                  marginBottom: '0.5rem',
                  fontSize: '0.875rem'
                }}>
                  <HiCreditCard style={{ marginRight: '0.75rem', color: '#16a34a', fontSize: '1.25rem' }} />
                  <span>Account Number</span>
                </div>
                <p style={{
                  color: '#1f2937',
                  fontWeight: '500',
                  paddingLeft: '2rem',
                  wordBreak: 'break-all',
                  fontSize: '1rem'
                }}>
                  {profile.accountNumber}
                </p>
              </div>

              <div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  color: '#6b7280',
                  marginBottom: '0.5rem',
                  fontSize: '0.875rem'
                }}>
                  <HiOfficeBuilding style={{ marginRight: '0.75rem', color: '#16a34a', fontSize: '1.25rem' }} />
                  <span>IBAN Number</span>
                </div>
                <p style={{
                  color: '#1f2937',
                  fontWeight: '500',
                  paddingLeft: '2rem',
                  wordBreak: 'break-all',
                  fontSize: '1rem'
                }}>
                  {profile.iBANNumber || 'Not provided'}
                </p>
              </div>
            </div>
          </div>

          {/* Emirates ID */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '0.75rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #e5e7eb',
            padding: '1.5rem'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '1.5rem',
              paddingBottom: '0.75rem',
              borderBottom: '2px solid #e5e7eb'
            }}>
              <div style={{
                padding: '0.75rem',
                marginRight: '1rem',
                backgroundColor: '#dbeafe',
                color: '#2563eb',
                borderRadius: '0.5rem'
              }}>
                <HiIdentification style={{ fontSize: '1.5rem' }} />
              </div>
              <div>
                <h3 style={{
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  color: '#1f2937',
                  marginBottom: '0.25rem'
                }}>
                  Emirates ID
                </h3>
                <p style={{
                  fontSize: '0.875rem',
                  color: '#6b7280'
                }}>
                  UAE Identification Document
                </p>
              </div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <p style={{
                  fontSize: '0.875rem',
                  color: '#6b7280',
                  marginBottom: '0.5rem',
                  fontWeight: '500'
                }}>
                  ID Number
                </p>
                <div style={{
                  padding: '1rem',
                  backgroundColor: '#f8fafc',
                  borderRadius: '0.5rem',
                  border: '1px solid #e2e8f0',
                  wordBreak: 'break-word'
                }}>
                  <p style={{
                    fontWeight: '600',
                    color: '#1e293b',
                    fontSize: '1.125rem',
                    textAlign: 'center'
                  }}>
                    {profile.emiratesId}
                  </p>
                </div>
              </div>
              
              <div style={{
                paddingTop: '1rem',
                borderTop: '1px solid #e5e7eb'
              }}>
                <p style={{
                  fontSize: '0.875rem',
                  color: '#6b7280',
                  marginBottom: '1rem',
                  fontWeight: '500'
                }}>
                  Document
                </p>
                {profile.emiratesIdDocument ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <a 
                      href={profile.emiratesIdDocument}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        width: '100%',
                        padding: '0.875rem 1rem',
                        backgroundColor: '#2563eb',
                        color: 'white',
                        borderRadius: '0.5rem',
                        textDecoration: 'none',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseOver={(e) => e.target.style.backgroundColor = '#1d4ed8'}
                      onMouseOut={(e) => e.target.style.backgroundColor = '#2563eb'}
                    >
                      <HiDocument style={{ fontSize: '1.25rem' }} />
                      <span>View Emirates ID Document</span>
                    </a>
                    <p style={{
                      fontSize: '0.75rem',
                      color: '#6b7280',
                      textAlign: 'center'
                    }}>
                      Click to view the full document in new tab
                    </p>
                  </div>
                ) : (
                  <div style={{
                    textAlign: 'center',
                    padding: '2rem',
                    color: '#6b7280',
                    backgroundColor: '#f8fafc',
                    borderRadius: '0.5rem',
                    border: '1px dashed #cbd5e1'
                  }}>
                    <HiDocumentText style={{ fontSize: '2rem', marginBottom: '0.5rem', opacity: 0.5 }} />
                    <p style={{ fontWeight: '500' }}>No document uploaded</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Passport */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '0.75rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #e5e7eb',
            padding: '1.5rem'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '1.5rem',
              paddingBottom: '0.75rem',
              borderBottom: '2px solid #e5e7eb'
            }}>
              <div style={{
                padding: '0.75rem',
                marginRight: '1rem',
                backgroundColor: '#dcfce7',
                color: '#16a34a',
                borderRadius: '0.5rem'
              }}>
                <FaPassport style={{ fontSize: '1.5rem' }} />
              </div>
              <div>
                <h3 style={{
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  color: '#1f2937',
                  marginBottom: '0.25rem'
                }}>
                  Passport
                </h3>
                <p style={{
                  fontSize: '0.875rem',
                  color: '#6b7280'
                }}>
                  International Travel Document
                </p>
              </div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <p style={{
                  fontSize: '0.875rem',
                  color: '#6b7280',
                  marginBottom: '0.5rem',
                  fontWeight: '500'
                }}>
                  Passport Number
                </p>
                <div style={{
                  padding: '1rem',
                  backgroundColor: '#f8fafc',
                  borderRadius: '0.5rem',
                  border: '1px solid #e2e8f0',
                  wordBreak: 'break-word'
                }}>
                  <p style={{
                    fontWeight: '600',
                    color: '#1e293b',
                    fontSize: '1.125rem',
                    textAlign: 'center'
                  }}>
                    {profile.passportNumber}
                  </p>
                </div>
              </div>
              
              <div style={{
                paddingTop: '1rem',
                borderTop: '1px solid #e5e7eb'
              }}>
                <p style={{
                  fontSize: '0.875rem',
                  color: '#6b7280',
                  marginBottom: '1rem',
                  fontWeight: '500'
                }}>
                  Document
                </p>
                {profile.passportDocument ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <a 
                      href={profile.passportDocument}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        width: '100%',
                        padding: '0.875rem 1rem',
                        backgroundColor: '#16a34a',
                        color: 'white',
                        borderRadius: '0.5rem',
                        textDecoration: 'none',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseOver={(e) => e.target.style.backgroundColor = '#15803d'}
                      onMouseOut={(e) => e.target.style.backgroundColor = '#16a34a'}
                    >
                      <HiDocument style={{ fontSize: '1.25rem' }} />
                      <span>View Passport Document</span>
                    </a>
                    <p style={{
                      fontSize: '0.75rem',
                      color: '#6b7280',
                      textAlign: 'center'
                    }}>
                      Click to view the full document in new tab
                    </p>
                  </div>
                ) : (
                  <div style={{
                    textAlign: 'center',
                    padding: '2rem',
                    color: '#6b7280',
                    backgroundColor: '#f8fafc',
                    borderRadius: '0.5rem',
                    border: '1px dashed #cbd5e1'
                  }}>
                    <FaPassport style={{ fontSize: '2rem', marginBottom: '0.5rem', opacity: 0.5 }} />
                    <p style={{ fontWeight: '500' }}>No document uploaded</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Signature */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '0.75rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #e5e7eb',
            padding: '1.5rem'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '1.5rem',
              paddingBottom: '0.75rem',
              borderBottom: '2px solid #e5e7eb'
            }}>
              <div style={{
                padding: '0.75rem',
                marginRight: '1rem',
                backgroundColor: '#f3e8ff',
                color: '#9333ea',
                borderRadius: '0.5rem'
              }}>
                <FaSignature style={{ fontSize: '1.5rem' }} />
              </div>
              <div>
                <h3 style={{
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  color: '#1f2937',
                  marginBottom: '0.25rem'
                }}>
                  Signature
                </h3>
                <p style={{
                  fontSize: '0.875rem',
                  color: '#6b7280'
                }}>
                  Employee's Official Signature
                </p>
              </div>
            </div>
            
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1rem'
            }}>
              <div style={{
                width: '100%',
                padding: '1.5rem',
                backgroundColor: '#f8fafc',
                borderRadius: '0.5rem',
                border: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '150px'
              }}>
                {profile.signatureImage ? (
                  <img 
                    src={profile.signatureImage} 
                    alt="Signature" 
                    style={{
                      maxHeight: '120px',
                      objectFit: 'contain',
                      maxWidth: '100%'
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'block';
                    }}
                  />
                ) : (
                  <div style={{
                    textAlign: 'center',
                    padding: '2rem',
                    color: '#6b7280'
                  }}>
                    <FaSignature style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }} />
                    <p style={{ fontWeight: '500' }}>No signature uploaded</p>
                  </div>
                )}
              </div>
              
              {profile.signatureImage && (
                <a 
                  href={profile.signatureImage}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    width: '100%',
                    padding: '0.75rem 1rem',
                    backgroundColor: '#9333ea',
                    color: 'white',
                    borderRadius: '0.5rem',
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#7e22ce'}
                  onMouseOut={(e) => e.target.style.backgroundColor = '#9333ea'}
                >
                  <HiDownload style={{ fontSize: '1.125rem' }} />
                  <span>Download Signature</span>
                </a>
              )}
            </div>
          </div>
        </div>

      
      </div>
    </div>
  );
};

export default StaffProfile;