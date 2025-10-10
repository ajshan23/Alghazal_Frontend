import { Card } from '@/components/ui';
import Button from '@/components/ui/Button';
import { HiOutlineCheckCircle, HiOutlineUser, HiOutlineDocumentText, HiOutlineLocationMarker, HiOutlineExclamationCircle } from 'react-icons/hi';

type ClientData = {
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
  apartmentNumber: string;
  clientData: ClientData;
};

type ProjectReviewProps = {
  data: FormData;
  onBack: () => void;
  onSubmit: () => void;
};

const ProjectReview = ({ data, onBack, onSubmit }: ProjectReviewProps) => {
  // Find the selected location, building, and apartment by name/number
  const selectedLocation = data.clientData.locations.find(
    loc => loc.name === data.location
  );
  const selectedBuilding = selectedLocation?.buildings.find(
    bld => bld.name === data.building
  );
  const selectedApartment = selectedBuilding?.apartments.find(
    apt => apt.number === data?.apartmentNumber
  );

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="p-4 bg-gradient-to-r from-orange-500 to-amber-600 rounded-2xl shadow-lg">
            <HiOutlineCheckCircle className="text-3xl text-white" />
          </div>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Project Review
        </h3>
        <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
          Review all the information before submitting your project
        </p>
      </div>

      <div className="bg-gradient-to-br from-white via-orange-50 to-amber-50 dark:from-gray-800 dark:via-gray-850 dark:to-gray-900 rounded-2xl p-8 border border-orange-200 dark:border-gray-700 shadow-lg">
        {/* Client Information Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl">
              <HiOutlineUser className="text-2xl text-white" />
            </div>
            <h5 className="text-xl font-bold text-gray-900 dark:text-white">
              Client Information
            </h5>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Client Name</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{data.clientName || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Client Address</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{data.clientData.clientAddress || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Pincode</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{data.clientData.pincode || 'Not provided'}</p>
                </div>
              </div>
            </Card>

            <Card className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Mobile Number</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{data.clientData.mobileNumber || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Telephone Number</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{data.clientData.telephoneNumber || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">TRN Number</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{data.clientData.trnNumber || 'Not provided'}</p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Project Information Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl">
              <HiOutlineDocumentText className="text-2xl text-white" />
            </div>
            <h5 className="text-xl font-bold text-gray-900 dark:text-white">
              Project Information
            </h5>
          </div>

          <Card className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Project Name</p>
                <p className="font-semibold text-gray-900 dark:text-white">{data.projectName || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Project Description</p>
                <p className="font-semibold text-gray-900 dark:text-white">{data.projectDescription || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Attention</p>
                <p className="font-semibold text-gray-900 dark:text-white">{data.attention || 'Not provided'}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Address Information Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-r from-green-500 to-teal-600 rounded-xl">
              <HiOutlineLocationMarker className="text-2xl text-white" />
            </div>
            <h5 className="text-xl font-bold text-gray-900 dark:text-white">
              Address Information
            </h5>
          </div>

          <Card className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Location</p>
                <p className="font-semibold text-gray-900 dark:text-white">{data.location || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Building</p>
                <p className="font-semibold text-gray-900 dark:text-white">{data.building || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Apartment</p>
                <p className="font-semibold text-gray-900 dark:text-white">{data.apartmentNumber || 'Not provided'}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-xl p-4 border border-orange-200 dark:border-orange-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Form Completion
              </span>
              <span className="text-sm font-bold text-orange-600 dark:text-orange-400">
                100% Complete
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div className="bg-gradient-to-r from-orange-500 to-amber-600 h-2 rounded-full w-full transition-all duration-300"></div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between gap-4">
          <Button 
            type="button" 
            onClick={onBack}
            variant="plain"
            size="lg"
            className="px-6 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl font-semibold transition-all duration-200"
          >
            Back to Address
          </Button>
          <Button
            variant="solid"
            onClick={onSubmit}
            size="lg"
            className="px-8 py-3 bg-gradient-to-r from-orange-600 to-amber-700 hover:from-orange-700 hover:to-amber-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
          >
            Submit Project
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProjectReview;