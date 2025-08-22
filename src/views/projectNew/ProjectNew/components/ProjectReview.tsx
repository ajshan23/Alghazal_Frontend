import { Card } from '@/components/ui';
import Button from '@/components/ui/Button';

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
    apt => apt.number === data?.apartment
  );

  return (
    <div className="max-w-4xl mx-auto">
      <h3 className="mb-6 text-center">Project Review</h3>
      
      <Card className="mb-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h5 className="mb-4">Client Information</h5>
            <div className="space-y-4">
              <div>
                <p className="text-gray-500">Client Name</p>
                <p className="font-semibold">{data.clientName || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-gray-500">Client Address</p>
                <p className="font-semibold">{data.clientData.clientAddress || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-gray-500">Pincode</p>
                <p className="font-semibold">{data.clientData.pincode || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-gray-500">Mobile Number</p>
                <p className="font-semibold">{data.clientData.mobileNumber || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-gray-500">Telephone Number</p>
                <p className="font-semibold">{data.clientData.telephoneNumber || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-gray-500">Trn Number</p>
                <p className="font-semibold">{data.clientData.trnNumber || 'Not provided'}</p>
              </div>
            </div>
          </div>

          <div>
            <h5 className="mb-4">Project Information</h5>
            <div className="space-y-4">
              <div>
                <p className="text-gray-500">Project Name</p>
                <p className="font-semibold">{data.projectName || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-gray-500">Project Description</p>
                <p className="font-semibold">{data.projectDescription || 'Not provided'}</p>
              </div>
            </div>
          </div>

          <div>
            <h5 className="mb-4">Address Information</h5>
            <div className="space-y-4">
              <div>
                <p className="text-gray-500">Location</p>
                <p className="font-semibold">{data.location || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-gray-500">Building</p>
                <p className="font-semibold">{data.building || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-gray-500">Apartment</p>
                <p className="font-semibold">{data.apartment || 'Not provided'}</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="flex justify-end gap-2">
        <Button type="button" onClick={onBack}>
          Back
        </Button>
        <Button variant="solid" onClick={onSubmit}>
          Submit Project
        </Button>
      </div>
    </div>
  );
};

export default ProjectReview;