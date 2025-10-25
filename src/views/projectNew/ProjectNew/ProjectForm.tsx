import { useEffect, useState } from 'react';
import Container from '@/components/shared/Container';
import AdaptableCard from '@/components/shared/AdaptableCard';
import { useNavigate, useParams } from 'react-router-dom';
import axios, { AxiosResponse } from 'axios';
import { FormStep } from './components/FormStep';
import { PersonalInformation } from './components/PersonalInformation';
import ProjectReview from './components/ProjectReview';
import ProjectInformation from './components/ProjectInformation';
import AddressInformation from './components/AddressInformation';
import { createProject, editProject, fetchProjectById } from '../api/api';
import { Notification, toast } from '@/components/ui';
import {
  HiOutlineDocumentText,
  HiOutlineUserAdd,
  HiOutlineLocationMarker,
  HiOutlineEye,
  HiOutlinePlus
} from 'react-icons/hi';

type ClientData = {
  _id: string;
  clientName: string;
  clientAddress: string;
  pincode: string;
  mobileNumber: string;
  telephoneNumber: string | null;
  trnNumber: string;
  locations: {
    name: string;
    buildings: {
      name: string;
      apartments: {
        number: string;
      }[];
    }[];
  }[];
};

type FormData = {
  clientName: string;
  projectName: string;
  projectDescription: string;
  attention: string;
  location: string;
  building: string;
  apartment: string;
  clientData: ClientData;
};

const ProjectForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    clientName: '',
    projectName: '',
    projectDescription: '',
    attention: '',
    location: '',
    building: '',
    apartment: '',
    clientData: {
      _id: '',
      clientName: '',
      clientAddress: '',
      pincode: '',
      mobileNumber: '',
      telephoneNumber: '',
      trnNumber: '',
      locations: []
    }
  });

  const steps = [
    { 
      label: 'Client Details', 
      value: 0,
      icon: <HiOutlineUserAdd className="text-xl" />,
      gradient: 'from-blue-400 via-blue-500 to-blue-600'
    },
    { 
      label: 'Project Details', 
      value: 1,
      icon: <HiOutlineDocumentText className="text-xl" />,
      gradient: 'from-purple-400 via-purple-500 to-purple-600'
    },
    { 
      label: 'Address Information', 
      value: 2,
      icon: <HiOutlineLocationMarker className="text-xl" />,
      gradient: 'from-green-400 via-green-500 to-green-600'
    },
    { 
      label: 'Review', 
      value: 3,
      icon: <HiOutlineEye className="text-xl" />,
      gradient: 'from-orange-400 via-orange-500 to-orange-600'
    }
  ];

  const handleNext = (
    data: Partial<FormData>,
    formName?: string,
    setSubmitting?: (isSubmitting: boolean) => void
  ) => {
    setFormData(prev => ({ ...prev, ...data }));
    
    if (currentStep < steps.length - 2) {
      setCurrentStep(currentStep + 1);
    } else if (currentStep === steps.length - 2) {
      setCurrentStep(currentStep + 1);
    }
    setCompletedSteps(prev => prev > (currentStep + 1) ? prev : currentStep + 1);
    
    setSubmitting?.(false);
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(0, prev - 1));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      const projectData = {
        client: formData.clientData._id,
        projectDescription: formData.projectDescription,
        projectName: formData.projectName,
        attention: formData.attention,
        location: formData.location,
        building: formData.building,
        apartmentNumber: formData.apartment
      };

      if (id) {
        const response: AxiosResponse = await editProject(id, projectData);
        if (response.status === 200) {
          toast.push(
            <Notification
              title={'Successfully Updated project'}
              type="success"
              duration={2500}
            >
              Project successfully Updated
            </Notification>,
            {
              placement: 'top-center',
            },
          );
          navigate('/app/project-list');
        }
      } else {
        const response: AxiosResponse = await createProject(projectData);
        if (response.status === 201) {
          toast.push(
            <Notification
              title={'Successfully created project'}
              type="success"
              duration={2500}
            >
              Project successfully created
            </Notification>,
            {
              placement: 'top-center',
            },
          );
          navigate('/app/project-list');
        }
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setError('Failed to create project. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchProject = async () => {
    const { data } = await fetchProjectById(id);
    setFormData({
      clientData: {
        _id: data?.client?._id,
        clientName: data?.client?.clientName,
        clientAddress: data?.client?.clientAddress,
        mobileNumber: data?.client?.mobileNumber,
        telephoneNumber: data?.client?.telephoneNumber,
        trnNumber: data?.client?.trnNumber,
        pincode: data?.client?.pincode,
        locations: data?.client?.locations || []
      },
      projectName: data?.projectName,
      projectDescription: data?.projectDescription,
      attention: data?.attention || '',
      location: data?.location || '',
      building: data?.building || '',
      apartment: data?.apartmentNumber || '',
      clientName: data?.client?.clientName
    });
    setCompletedSteps(3);
    setCurrentStep(3);
  };

  useEffect(() => {
    if (id) {
      fetchProject();
    }
  }, [id]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-850 dark:to-gray-900">
      <Container className="h-full">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg">
              <HiOutlinePlus className="text-2xl text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
                {id ? 'Edit Project' : 'Create New Project'}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {id ? 'Update project details' : 'Set up a new project with client information'}
              </p>
            </div>
          </div>
        </div>

        {/* Main Form Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-750 p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg">
                <HiOutlineDocumentText className="text-2xl text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">Project Setup</h2>
            </div>
          </div>

          <div className="p-8">
            <AdaptableCard bodyClass="h-full">
              <div className="flex flex-row md:flex-col w-full">
                {/* Enhanced Form Steps */}
                <div className="2xl:col-span-1 xl:col-span-1 lg:col-span-2">
                  <div className="bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-800 dark:via-gray-850 dark:to-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6">Form Progress</h3>
                    <FormStep
                      currentStep={currentStep}
                      steps={steps}
                      onStepChange={setCurrentStep}
                      completed={completedSteps}
                    />
                  </div>
                </div>

                {/* Form Content */}
                <div className="2xl:col-span-4 lg:col-span-3 xl:col-span-2">
                  <div className="bg-gradient-to-br from-white via-gray-50 to-white dark:from-gray-800 dark:via-gray-850 dark:to-gray-900 rounded-2xl p-8 border-2 border-gray-100 dark:border-gray-700 shadow-xl">
                    {/* Step Content Header */}
                    <div className="mb-8">
                      <div className="flex items-center gap-4 mb-4">
                        <div className={`p-3 rounded-xl bg-gradient-to-r ${steps[currentStep].gradient} text-white shadow-lg`}>
                          {steps[currentStep].icon}
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
                            {steps[currentStep].label}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Step {currentStep + 1} of {steps.length}
                          </p>
                        </div>
                      </div>
                      <div className={`w-full h-1 bg-gradient-to-r ${steps[currentStep].gradient} rounded-full`}></div>
                    </div>

                    {/* Error Display */}
                    {error && (
                      <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg dark:bg-red-900/30 dark:text-red-400 dark:border-red-800">
                        {error}
                      </div>
                    )}

                    {/* Form Steps */}
                    <div className="space-y-6">
                      {currentStep === 0 && (
                        <PersonalInformation
                          data={formData}
                          onNext={handleNext}
                        />
                      )}
                      {currentStep === 1 && (
                        <ProjectInformation
                          data={formData}
                          onNextChange={handleNext}
                          onBackChange={handleBack}
                        />
                      )}
                      {currentStep === 2 && (
                        <AddressInformation
                          data={formData}
                          onNextChange={(values, formName, setSubmitting) => {
                            setFormData(prev => ({ ...prev, ...values }));
                            setCurrentStep(3);
                            setSubmitting(false);
                          }}
                          onBackChange={handleBack}
                        />
                      )}
                      {currentStep === 3 && (
                        <ProjectReview
                          data={formData}
                          onBack={handleBack}
                          onSubmit={handleSubmit}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </AdaptableCard>
          </div>
        </div>

        {/* Loading Overlay */}
        {isSubmitting && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-2xl border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                <p className="text-lg font-semibold text-gray-800 dark:text-white">
                  {id ? 'Updating project...' : 'Creating project...'}
                </p>
              </div>
            </div>
          </div>
        )}
      </Container>
    </div>
  );
};

export default ProjectForm;