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
    { label: 'Client Details', value: 0 },
    { label: 'Project Details', value: 1 },
    { label: 'Address Information', value: 2 },
    { label: 'Review', value: 3 }
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
    <Container className="h-full">
      <AdaptableCard className="h-full" bodyClass="h-full">
        <div className="grid lg:grid-cols-5 xl:grid-cols-3 2xl:grid-cols-5 gap-4 h-full">
          <div className="2xl:col-span-1 xl:col-span-1 lg:col-span-2">
            <FormStep
              currentStep={currentStep}
              steps={steps}
              onStepChange={setCurrentStep}
              completed={completedSteps}
            />
          </div>
          <div className="2xl:col-span-4 lg:col-span-3 xl:col-span-2">
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
      </AdaptableCard>
    </Container>
  );
};

export default ProjectForm;