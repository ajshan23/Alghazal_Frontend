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
      try {
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
      } catch (error) {
        console.error('Error loading profile data:', error);
      }
    };
    loadData();
  }, [id]);

  const formatDate = (dateString) => {
    if (!dateString) return 'Not available';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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

      // Title
      doc.setFontSize(20);
      doc.setFont(undefined, 'bold');
      doc.text(`Employee Profile: ${profile.firstName} ${profile.lastName}`, 14, 20);

      let yPosition = 30;

      // Basic Information
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.text("Basic Information", 14, yPosition);
      yPosition += 8;

      autoTable(doc, {
        startY: yPosition,
        head: [["Field", "Value"]],
        body: [
          ["Name", `${profile.firstName} ${profile.lastName}`],
          ["Role", profile.role],
          ["Status", profile.isActive ? "Active" : "Inactive"],
          ["Join Date", formatDate(profile.createdAt)],
        ],
        theme: 'grid',
        headStyles: { 
          fillColor: [66, 139, 202],
          textColor: [255, 255, 255],
          fontStyle: 'bold'
        },
        margin: { left: 14, right: 14 },
      });

      yPosition = doc.lastAutoTable.finalY + 15;

      // Contact Information
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.text("Contact Information", 14, yPosition);
      yPosition += 8;

      const phoneRows = profile.phoneNumbers.map((phone, index) => [
        `Phone ${index + 1}`,
        phone,
      ]);

      autoTable(doc, {
        startY: yPosition,
        head: [["Field", "Value"]],
        body: [
          ["Email", profile.email], 
          ...phoneRows, 
          ["Address", profile.address]
        ],
        theme: 'grid',
        headStyles: { 
          fillColor: [66, 139, 202],
          textColor: [255, 255, 255],
          fontStyle: 'bold'
        },
        margin: { left: 14, right: 14 },
        styles: {
          cellPadding: 4,
          fontSize: 10,
        },
        columnStyles: {
          0: { cellWidth: 40 },
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
          ["Salary", `AED ${profile.salary.toLocaleString("en-US")}`],
          ["Account Number", profile.accountNumber],
        ],
        theme: 'grid',
        headStyles: { 
          fillColor: [66, 139, 202],
          textColor: [255, 255, 255],
          fontStyle: 'bold'
        },
        margin: { left: 14, right: 14 },
      });

      yPosition = doc.lastAutoTable.finalY + 15;

      // Documents Information
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.text("Documents", 14, yPosition);
      yPosition += 8;

      autoTable(doc, {
        startY: yPosition,
        head: [["Document", "Number"]],
        body: [
          ["Emirates ID", profile.emiratesId],
          ["Passport", profile.passportNumber],
        ],
        theme: 'grid',
        headStyles: { 
          fillColor: [66, 139, 202],
          textColor: [255, 255, 255],
          fontStyle: 'bold'
        },
        margin: { left: 14, right: 14 },
      });

      // Save the PDF
      const fileName = `${profile.firstName}_${profile.lastName}_Profile.pdf`.replace(/\s+/g, '_');
      doc.save(fileName);

    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again or check the console for details.');
    }
  };

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
          </div>
          <button
            onClick={exportToPDF}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              backgroundColor: '#2563eb',
              color: 'white',
              borderRadius: '0.5rem',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            <HiDownload style={{ fontSize: '1.125rem' }} />
            <span>Export PDF</span>
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
                  width: '6rem',
                  height: '6rem',
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
                  />
                </div>
              ) : (
                <div style={{
                  width: '6rem',
                  height: '6rem',
                  borderRadius: '9999px',
                  backgroundColor: '#e5e7eb',
                  border: '4px solid white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                }}>
                  <HiUserCircle style={{ fontSize: '3rem', color: '#9ca3af' }} />
                </div>
              )}
              <span style={{
                position: 'absolute',
                bottom: '0.5rem',
                right: '0.5rem',
                width: '1rem',
                height: '1rem',
                borderRadius: '9999px',
                border: '2px solid white',
                backgroundColor: profile.isActive ? '#10b981' : '#ef4444'
              }}></span>
            </div>

            {/* Profile Info */}
            <div style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ marginBottom: '0.5rem' }}>
                <h2 style={{
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  color: '#1f2937'
                }}>
                  {profile.firstName} {profile.lastName}
                </h2>
                <p style={{ color: '#2563eb', fontSize: '1.125rem' }}>{profile.role}</p>
              </div>

              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                gap: '0.75rem'
              }}>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '9999px',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  backgroundColor: profile.isActive ? '#dcfce7' : '#fee2e2',
                  color: profile.isActive ? '#166534' : '#991b1b'
                }}>
                  {profile.isActive ? 'Active' : 'Inactive'}
                </div>

                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '9999px',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  backgroundColor: '#f3f4f6',
                  color: '#374151'
                }}>
                  <HiCalendar style={{ marginRight: '0.25rem' }} />
                  <span>Joined {formatDate(profile.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Sections */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
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
              paddingBottom: '0.5rem',
              borderBottom: '1px solid #e5e7eb'
            }}>
              Contact Information
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
              <div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  color: '#6b7280',
                  marginBottom: '0.25rem'
                }}>
                  <HiMail style={{ marginRight: '0.5rem', color: '#3b82f6', fontSize: '1.125rem' }} />
                  <span>Email</span>
                </div>
                <p style={{
                  color: '#1f2937',
                  fontWeight: '500',
                  paddingLeft: '1.75rem',
                  wordBreak: 'break-all'
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
                    marginBottom: '0.25rem'
                  }}>
                    <HiPhone style={{ marginRight: '0.5rem', color: '#3b82f6', fontSize: '1.125rem' }} />
                    <span>Phone {index > 0 ? index + 1 : ''}</span>
                  </div>
                  <p style={{
                    color: '#1f2937',
                    fontWeight: '500',
                    paddingLeft: '1.75rem'
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
                  marginBottom: '0.25rem'
                }}>
                  <HiLocationMarker style={{ marginRight: '0.5rem', color: '#3b82f6', fontSize: '1.125rem' }} />
                  <span>Address</span>
                </div>
                <p style={{
                  color: '#1f2937',
                  fontWeight: '500',
                  paddingLeft: '1.75rem',
                  whiteSpace: 'pre-line'
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
              paddingBottom: '0.5rem',
              borderBottom: '1px solid #e5e7eb'
            }}>
              Financial Information
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
              <div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  color: '#6b7280',
                  marginBottom: '0.25rem'
                }}>
                  <HiCash style={{ marginRight: '0.5rem', color: '#3b82f6', fontSize: '1.125rem' }} />
                  <span>Salary</span>
                </div>
                <p style={{
                  color: '#1f2937',
                  fontWeight: '500',
                  paddingLeft: '1.75rem'
                }}>
                  AED {profile.salary.toLocaleString('en-US')}
                </p>
              </div>

              <div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  color: '#6b7280',
                  marginBottom: '0.25rem'
                }}>
                  <HiCreditCard style={{ marginRight: '0.5rem', color: '#3b82f6', fontSize: '1.125rem' }} />
                  <span>Account Number</span>
                </div>
                <p style={{
                  color: '#1f2937',
                  fontWeight: '500',
                  paddingLeft: '1.75rem',
                  wordBreak: 'break-all'
                }}>
                  {profile.accountNumber}
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
              paddingBottom: '0.5rem',
              borderBottom: '1px solid #e5e7eb'
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
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                color: '#1f2937'
              }}>
                Emirates ID
              </h3>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <p style={{
                  fontSize: '0.875rem',
                  color: '#6b7280',
                  marginBottom: '0.5rem'
                }}>
                  ID Number
                </p>
                <div style={{
                  padding: '0.75rem',
                  backgroundColor: '#f9fafb',
                  borderRadius: '0.5rem',
                  border: '1px solid #e5e7eb',
                  wordBreak: 'break-word'
                }}>
                  <p style={{
                    fontWeight: '500',
                    color: '#1f2937'
                  }}>
                    {profile.emiratesId}
                  </p>
                </div>
              </div>
              
              <div style={{
                paddingTop: '1rem',
                borderTop: '1px solid #e5e7eb'
              }}>
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
                        padding: '0.75rem 1rem',
                        backgroundColor: '#2563eb',
                        color: 'white',
                        borderRadius: '0.5rem',
                        textDecoration: 'none',
                        fontSize: '0.875rem'
                      }}
                    >
                      <HiDocument style={{ fontSize: '1.25rem' }} />
                      <span>View Document</span>
                    </a>
                    <p style={{
                      fontSize: '0.75rem',
                      color: '#6b7280',
                      textAlign: 'center'
                    }}>
                      Click to view full document
                    </p>
                  </div>
                ) : (
                  <div style={{
                    textAlign: 'center',
                    padding: '1.5rem',
                    color: '#6b7280',
                    backgroundColor: '#f9fafb',
                    borderRadius: '0.5rem'
                  }}>
                    No document uploaded
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
              paddingBottom: '0.5rem',
              borderBottom: '1px solid #e5e7eb'
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
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                color: '#1f2937'
              }}>
                Passport
              </h3>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <p style={{
                  fontSize: '0.875rem',
                  color: '#6b7280',
                  marginBottom: '0.5rem'
                }}>
                  Passport Number
                </p>
                <div style={{
                  padding: '0.75rem',
                  backgroundColor: '#f9fafb',
                  borderRadius: '0.5rem',
                  border: '1px solid #e5e7eb',
                  wordBreak: 'break-word'
                }}>
                  <p style={{
                    fontWeight: '500',
                    color: '#1f2937'
                  }}>
                    {profile.passportNumber}
                  </p>
                </div>
              </div>
              
              <div style={{
                paddingTop: '1rem',
                borderTop: '1px solid #e5e7eb'
              }}>
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
                        padding: '0.75rem 1rem',
                        backgroundColor: '#16a34a',
                        color: 'white',
                        borderRadius: '0.5rem',
                        textDecoration: 'none',
                        fontSize: '0.875rem'
                      }}
                    >
                      <HiDocument style={{ fontSize: '1.25rem' }} />
                      <span>View Document</span>
                    </a>
                    <p style={{
                      fontSize: '0.75rem',
                      color: '#6b7280',
                      textAlign: 'center'
                    }}>
                      Click to view full document
                    </p>
                  </div>
                ) : (
                  <div style={{
                    textAlign: 'center',
                    padding: '1.5rem',
                    color: '#6b7280',
                    backgroundColor: '#f9fafb',
                    borderRadius: '0.5rem'
                  }}>
                    No document uploaded
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
              paddingBottom: '0.5rem',
              borderBottom: '1px solid #e5e7eb'
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
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                color: '#1f2937'
              }}>
                Signature
              </h3>
            </div>
            
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              padding: '1rem',
              backgroundColor: '#f9fafb',
              borderRadius: '0.5rem',
              border: '1px solid #e5e7eb',
              overflowX: 'auto'
            }}>
              {profile.signatureImage ? (
                <img 
                  src={profile.signatureImage} 
                  alt="Signature" 
                  style={{
                    maxHeight: '8rem',
                    objectFit: 'contain',
                    maxWidth: '100%'
                  }}
                />
              ) : (
                <div style={{
                  textAlign: 'center',
                  padding: '2rem',
                  color: '#6b7280'
                }}>
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